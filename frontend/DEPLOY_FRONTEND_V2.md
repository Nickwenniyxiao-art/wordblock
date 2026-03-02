# WordBlock 前端联调版 — VPS 部署指令

## 背景
前端已完成前后端联调改造，所有 mock 数据替换为真实 API 调用。需要将新前端代码部署到 VPS。

## 服务器信息
- VPS IP: 66.94.127.117
- SSH: root / AAbbcc253131
- 前端路径: /var/www/wordblock/
- 前端端口: 8081 (Nginx)
- 后端 API: http://66.94.127.117:8082

## 部署步骤

### 1. 备份旧版前端
```bash
cp -r /var/www/wordblock/ /var/www/wordblock-backup-$(date +%Y%m%d)/
```

### 2. 上传新文件
需要上传以下文件到 `/var/www/wordblock/`:

```
index.html          (已更新 — 增加登录页 + 引入 api.js)
js/api.js           (新文件 — API 客户端模块)
js/data.js          (已更新 — 移除 mock 数据, 添加数据加载逻辑)
js/ui-search.js     (已更新 — 对接后端词典+收录 API)
js/ui-wordbook.js   (已更新 — 对接后端单词列表 API)
js/ui-study-settings.js (已更新 — 对接后端 Block+学习+设置 API)
```

以下文件无需修改，保持不变:
```
css/base.css
css/wordbook.css
css/study-settings.css
manifest.json
sw.js
icons/
```

### 3. 上传方法

方法 A — 用 scp 从 GitHub:
```bash
cd /var/www/wordblock/
# 如果已有 git repo
git pull origin main
```

方法 B — 直接创建文件:
由于文件较长，建议用 git pull 方式。确保 GitHub 仓库已更新。

### 4. 验证
1. 浏览器打开 http://66.94.127.117:8081
2. 应看到登录/注册页面
3. 注册一个新账号测试
4. 测试查词 → 收录 → 生词本 → 学习 → 设置

### 5. 需要注意的 CORS 配置
后端已配置 CORS 允许 `http://66.94.127.117:8081`。如果遇到 CORS 问题，检查后端 `main.py` 的 CORS 设置。

## 关键变更说明
- 新增 `js/api.js`: API 客户端，封装所有后端请求 + JWT Token 自动管理
- `js/data.js`: 删除了所有 mock 数据（mockDictionary, mockCollected），改为从后端 API 加载
- 登录页: 用户首次访问会看到登录/注册页面，支持邮筱密码登录
- Token 存储: 使用 localStorage 存储 JWT Token，支持自动刷新
- 所有增删改查操作都通过 API 完成，数据持久化在服务器数据库中
