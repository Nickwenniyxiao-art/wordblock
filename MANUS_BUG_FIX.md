# WordBlock Bug 修复指令

## 概述
测试发现了以下问题需要修复：
1. **词列表 API 500 错误**（最紧急）
2. **词典查询需要中文释义**（集成 ECDICT 开源词典数据库）
3. **重复收录应该增加命中次数**（而非返回 409 错误）
4. **统计接口 total_reviews 字段逻辑错误**

不需要额外端口，所有操作在现有服务上进行。

---

## 修复1：词列表 API 500 错误

文件：`/var/www/wordblock-backend/app/routes/words.py`

**问题**：`list_words` 函数访问 `w.block` 但查询没有预加载 block 关系，在 async 模式下触发延迟加载报错。同时 `block_id: str | None` 语法可能在某些环境不兼容。

**修改第 111-145 行**，替换整个 `list_words` 函数为：

```python
@router.get("/list", response_model=list[CollectedWordResponse])
async def list_words(
    sort_by: str = Query("added_at", regex="^(added_at|word|hit_count)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    block_id: str = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户的收录单词列表"""
    query = (
        select(CollectedWord)
        .options(
            selectinload(CollectedWord.definitions),
            selectinload(CollectedWord.photos),
            selectinload(CollectedWord.block),
        )
        .where(CollectedWord.user_id == user.id)
    )

    if block_id:
        query = query.where(CollectedWord.block_id == block_id)

    sort_col = getattr(CollectedWord, sort_by)
    query = query.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    words = result.scalars().all()

    responses = []
    for w in words:
        r = CollectedWordResponse.model_validate(w)
        r.block_number = w.block.block_number if w.block else None
        responses.append(r)

    return responses
```

关键改动：
1. `block_id: str = Query(None)` 替代 `block_id: str | None = None`
2. 添加 `selectinload(CollectedWord.block)` 预加载 block 关系
3. 简化 block_number 赋值逻辑

**同时检查**：models.py 中 `CollectedWord` 是否有 `block` relationship。如果没有，需要在 CollectedWord 模型中添加：
```python
block = relationship("Block", back_populates="words", lazy="noload")
```

---

## 修复2：集成 ECDICT 英汉词典数据库

### 步骤 2a：下载 ECDICT 数据

```bash
cd /tmp
# 下载 ECDICT 的 CSV 数据（约 200MB 压缩）
wget https://github.com/skywind3000/ECDICT/releases/download/1.0.28/ecdict-sqlite-28.zip
unzip ecdict-sqlite-28.zip
# 解压后会有一个 stardict.db（SQLite 格式）
```

如果上面的 release 链接不可用，可以试：
```bash
# 备选方案：下载 CSV 版本
wget https://github.com/skywind3000/ECDICT/raw/master/ecdict.csv.gz
gunzip ecdict.csv.gz
```

### 步骤 2b：将 ECDICT 数据导入 PostgreSQL

```bash
# 连接 PostgreSQL
sudo -u postgres psql wordblock
```

在 psql 中执行：

```sql
-- 创建 ECDICT 词典表
CREATE TABLE IF NOT EXISTS ecdict (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    sw VARCHAR(255),
    phonetic VARCHAR(255),
    definition TEXT,
    translation TEXT,
    pos VARCHAR(64),
    collins INTEGER DEFAULT 0,
    oxford INTEGER DEFAULT 0,
    tag VARCHAR(128),
    bnc INTEGER DEFAULT 0,
    frq INTEGER DEFAULT 0,
    exchange TEXT,
    detail TEXT,
    audio TEXT
);

CREATE INDEX idx_ecdict_word ON ecdict(word);
CREATE INDEX idx_ecdict_sw ON ecdict(sw);
```

然后用 Python 脚本导入数据：

```bash
cd /var/www/wordblock-backend
source venv/bin/activate

python3 << 'PYEOF'
import sqlite3
import psycopg2

# 连接 ECDICT SQLite
ecdb = sqlite3.connect('/tmp/stardict.db')
ecdb.row_factory = sqlite3.Row
cursor = ecdb.cursor()

# 连接 PostgreSQL
pg = psycopg2.connect(host='localhost', dbname='wordblock', user='wordblock', password='wordblock123')
pgcur = pg.cursor()

# 只导入常用词（BNC 前 50000 或有中文翻译的词）
# 这样数据量可控，约 20-30 万条
cursor.execute("""
    SELECT word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange
    FROM stardict
    WHERE translation IS NOT NULL AND translation != ''
    AND (bnc > 0 OR frq > 0 OR tag IS NOT NULL AND tag != '')
    ORDER BY word
""")

batch = []
count = 0
for row in cursor:
    batch.append((
        row['word'], row['phonetic'], row['definition'],
        row['translation'], row['pos'], row['collins'] or 0,
        row['oxford'] or 0, row['tag'], row['bnc'] or 0, row['frq'] or 0,
        row['exchange']
    ))
    if len(batch) >= 5000:
        pgcur.executemany("""
            INSERT INTO ecdict (word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, batch)
        pg.commit()
        count += len(batch)
        print(f"Imported {count} words...")
        batch = []

if batch:
    pgcur.executemany("""
        INSERT INTO ecdict (word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, batch)
    pg.commit()
    count += len(batch)

print(f"Total imported: {count} words")
ecdb.close()
pg.close()
PYEOF
```

如果下载的是 CSV 格式而非 SQLite，用这个替代脚本：

```bash
python3 << 'PYEOF'
import csv
import psycopg2

pg = psycopg2.connect(host='localhost', dbname='wordblock', user='wordblock', password='wordblock123')
pgcur = pg.cursor()

with open('/tmp/ecdict.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    batch = []
    count = 0
    for row in reader:
        translation = row.get('translation', '')
        if not translation:
            continue
        batch.append((
            row.get('word',''), row.get('phonetic',''), row.get('definition',''),
            translation, row.get('pos',''), int(row.get('collins',0) or 0),
            int(row.get('oxford',0) or 0), row.get('tag',''),
            int(row.get('bnc',0) or 0), int(row.get('frq',0) or 0),
            row.get('exchange','')
        ))
        if len(batch) >= 5000:
            pgcur.executemany("""
                INSERT INTO ecdict (word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, batch)
            pg.commit()
            count += len(batch)
            print(f"Imported {count} words...")
            batch = []
    if batch:
        pgcur.executemany("""
            INSERT INTO ecdict (word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, batch)
        pg.commit()
        count += len(batch)
    print(f"Total imported: {count} words")
pg.close()
PYEOF
```

### 步骤 2c：修改词典查询 API

文件：`/var/www/wordblock-backend/app/routes/dictionary.py`

**完全替换**整个文件内容为：

```python
"""WordBlock Backend — Dictionary API Routes (ECDICT + Free Dictionary fallback)"""
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, CollectedWord
from app.auth import get_current_user

router = APIRouter(prefix="/dictionary", tags=["词典"])


@router.get("/lookup/{word}")
async def lookup_word(
    word: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """查词 — 优先从 ECDICT 获取中文释义，回退到 Free Dictionary API"""
    word_lower = word.lower().strip()

    # 1. 检查是否已收录
    collected_result = await db.execute(
        select(CollectedWord).where(
            CollectedWord.user_id == user.id,
            CollectedWord.word == word_lower,
        )
    )
    cw = collected_result.scalar_one_or_none()
    is_collected = cw is not None
    collected_word_id = str(cw.id) if cw else None
    hit_count = cw.hit_count if cw else 0

    # 如果已收录，增加命中次数
    if cw:
        cw.hit_count += 1
        hit_count = cw.hit_count

    # 2. 查询 ECDICT 本地词典（中文释义）
    ecdict_result = await db.execute(
        text("SELECT word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange FROM ecdict WHERE LOWER(word) = :word LIMIT 1"),
        {"word": word_lower}
    )
    ecdict_row = ecdict_result.mappings().first()

    # 3. 同时查询 Free Dictionary API（获取英文释义和发音）
    free_dict_data = None
    audio_url = None
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word_lower}")
            if resp.status_code == 200:
                entries = resp.json()
                if entries and len(entries) > 0:
                    free_dict_data = entries[0]
                    # 提取发音 URL
                    for p in free_dict_data.get("phonetics", []):
                        if p.get("audio"):
                            audio_url = p["audio"]
                            break
    except Exception:
        pass

    # 4. 组装结果
    if ecdict_row:
        # 有 ECDICT 数据 — 构建中文释义
        phonetic_str = ecdict_row["phonetic"] or ""
        translation = ecdict_row["translation"] or ""
        definition = ecdict_row["definition"] or ""
        pos_str = ecdict_row["pos"] or ""
        
        # 解析中文释义为 meanings 格式
        meanings = []
        # translation 格式通常是 "n. 苹果\nv. 某某" 或 "n. 释义1, 释义2"
        for line in translation.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            # 尝试提取词性前缀
            pos = ""
            defn = line
            for prefix in ["n.", "v.", "adj.", "adv.", "prep.", "conj.", "pron.", "interj.", "art.", "det.", "abbr.", "vt.", "vi.", "num.", "aux."]:
                if line.lower().startswith(prefix):
                    pos = prefix
                    defn = line[len(prefix):].strip()
                    break
            
            definitions_list = []
            # 按逗号或分号分割多个释义
            for d in defn.replace("；", ";").split(";"):
                d = d.strip()
                if d:
                    definitions_list.append({"definition": d, "example": ""})
            
            if definitions_list:
                meanings.append({
                    "partOfSpeech": pos if pos else "n.",
                    "definitions": definitions_list,
                })

        # 如果 ECDICT 没音标但 Free Dictionary 有
        if not phonetic_str and free_dict_data:
            phonetic_str = free_dict_data.get("phonetic", "")

        # 也提供英文释义（用户切换到英→英时用）
        english_meanings = []
        if free_dict_data:
            for m in free_dict_data.get("meanings", []):
                english_meanings.append({
                    "partOfSpeech": m.get("partOfSpeech", ""),
                    "definitions": [
                        {"definition": d.get("definition", ""), "example": d.get("example", "")}
                        for d in m.get("definitions", [])[:5]
                    ]
                })

        # 词汇额外信息
        extra = {}
        if ecdict_row["collins"]:
            extra["collins"] = ecdict_row["collins"]
        if ecdict_row["oxford"]:
            extra["oxford"] = bool(ecdict_row["oxford"])
        if ecdict_row["tag"]:
            extra["tag"] = ecdict_row["tag"]
        if ecdict_row["bnc"]:
            extra["bnc"] = ecdict_row["bnc"]
        if ecdict_row["frq"]:
            extra["frq"] = ecdict_row["frq"]
        if ecdict_row["exchange"]:
            extra["exchange"] = ecdict_row["exchange"]

        return {
            "word": word_lower,
            "phonetic": phonetic_str if phonetic_str else None,
            "audioUrl": audio_url,
            "meanings": meanings,
            "englishMeanings": english_meanings,
            "isCollected": is_collected,
            "collectedWordId": collected_word_id,
            "hitCount": hit_count,
            "source": "ecdict",
            "extra": extra if extra else None,
        }

    elif free_dict_data:
        # ECDICT 没有，用 Free Dictionary 英文释义
        meanings = []
        for m in free_dict_data.get("meanings", []):
            meanings.append({
                "partOfSpeech": m.get("partOfSpeech", ""),
                "definitions": [
                    {"definition": d.get("definition", ""), "example": d.get("example", "")}
                    for d in m.get("definitions", [])[:5]
                ]
            })

        return {
            "word": word_lower,
            "phonetic": free_dict_data.get("phonetic"),
            "audioUrl": audio_url,
            "meanings": meanings,
            "englishMeanings": meanings,
            "isCollected": is_collected,
            "collectedWordId": collected_word_id,
            "hitCount": hit_count,
            "source": "free_dictionary",
            "extra": None,
        }

    else:
        # 两个词典都没找到
        return {
            "word": word_lower,
            "phonetic": None,
            "audioUrl": None,
            "meanings": [],
            "englishMeanings": [],
            "isCollected": is_collected,
            "collectedWordId": collected_word_id,
            "hitCount": hit_count,
            "source": None,
            "extra": None,
            "error": "Word not found in dictionary",
        }
```

---

## 修复3：重复收录改为增加命中次数

文件：`/var/www/wordblock-backend/app/routes/words.py`

**修改 `collect_word` 函数**（第 47-108 行），将重复收录的 409 错误改为增加命中次数并返回已有数据：

找到这段代码（约第 54-62 行）：
```python
    # Check if already collected
    existing = await db.execute(
        select(CollectedWord).where(
            CollectedWord.user_id == user.id,
            CollectedWord.word == req.word.lower().strip(),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Word already collected")
```

替换为：
```python
    # Check if already collected
    existing = await db.execute(
        select(CollectedWord)
        .options(selectinload(CollectedWord.definitions), selectinload(CollectedWord.photos), selectinload(CollectedWord.block))
        .where(
            CollectedWord.user_id == user.id,
            CollectedWord.word == req.word.lower().strip(),
        )
    )
    existing_word = existing.scalar_one_or_none()
    if existing_word:
        # 已收录 → 增加命中次数并返回
        existing_word.hit_count += 1
        if existing_word.block_id:
            block_result = await db.execute(select(Block).where(Block.id == existing_word.block_id))
            block = block_result.scalar_one_or_none()
            if block:
                block.total_hit_count += 1
        r = CollectedWordResponse.model_validate(existing_word)
        r.block_number = existing_word.block.block_number if existing_word.block else None
        return r
```

同时在文件顶部确认 Block 已经 import。

---

## 修复4：统计接口 total_reviews 字段

文件：`/var/www/wordblock-backend/app/routes/words.py`

找到 `get_stats` 函数中的 `total_reviews` 查询（约第 318-323 行）：
```python
    total_reviews = await db.execute(
        select(func.count()).select_from(
            select(CollectedWord).where(CollectedWord.user_id == user.id)
            .subquery()
        )
    )
```

替换为（需要先 import StudySession）：
```python
    from app.models import StudySession
    total_reviews = await db.execute(
        select(func.count()).where(StudySession.user_id == user.id)
    )
```

---

## 重启后端服务

所有修改完成后：

```bash
cd /var/www/wordblock-backend
source venv/bin/activate

# 确保 psycopg2 已安装（ECDICT 导入脚本需要）
pip install psycopg2-binary

# 重启后端服务
sudo systemctl restart wordblock-api

# 验证服务正常
sleep 3
curl -s http://localhost:8082/api/v1/dictionary/lookup/apple | python3 -m json.tool | head -30
```

## 验证清单

修复完成后请逐一验证：

1. `curl http://localhost:8082/api/v1/words/list -H "Authorization: Bearer TOKEN"` → 应返回单词数组，不是 500
2. 查词 apple：`curl http://localhost:8082/api/v1/dictionary/lookup/apple -H "Authorization: Bearer TOKEN"` → 应包含中文释义（"苹果"）
3. 重复收录同一单词 → 应返回 200（非 409），hit_count 增加
4. 统计接口 `/words/stats` → total_reviews 应该是学习会话数量
