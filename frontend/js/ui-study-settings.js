// ================================================
// ===== STUDY (Tab 3) =====
// ================================================
const studyStats = document.getElementById('studyStats');
const blockList = document.getElementById('blockList');

function renderStudy() {
  const entries = Object.entries(mockCollected);
  if (entries.length === 0) {
    studyStats.innerHTML = '';
    blockList.innerHTML = `<div class="empty-state"><div class="empty-state-emoji">🧊</div><div class="empty-state-text">还没有词块</div><div class="empty-state-sub">收录更多单词，系统会自动创建词块</div></div>`;
    return;
  }

  const blocks = {};
  entries.forEach(([word, info]) => {
    if (!blocks[info.blockNumber]) blocks[info.blockNumber] = [];
    blocks[info.blockNumber].push({ word, ...info });
  });

  const blockEntries = Object.entries(blocks).map(([num, words]) => ({
    blockNum: parseInt(num),
    words,
    totalHits: words.reduce((s, w) => s + w.hitCount, 0),
    wordCount: words.length,
  }));

  blockEntries.sort((a, b) => b.totalHits - a.totalHits);

  studyStats.innerHTML = `
    <div class="stat-card"><div class="stat-value">${blockEntries.length}</div><div class="stat-label">词块总数</div></div>
    <div class="stat-card"><div class="stat-value">${entries.length}</div><div class="stat-label">总词汇</div></div>
    <div class="stat-card"><div class="stat-value">0</div><div class="stat-label">今日复习</div></div>
  `;

  let html = '';
  blockEntries.forEach(block => {
    const progress = block.blockNum === 1 ? 60 : block.blockNum === 2 ? 30 : Math.round((block.totalHits / (block.wordCount * 5)) * 100);
    const clampedProgress = Math.min(95, Math.max(5, progress));
    html += `
      <div class="block-card">
        <div class="block-card-header">
          <div class="block-title">Block #${block.blockNum}</div>
          <div class="block-heat-badge">🔥 热度 ${block.totalHits}</div>
        </div>
        <div class="block-word-count">${block.wordCount} 个单词</div>
        <div class="progress-track"><div class="progress-fill" style="width:${clampedProgress}%"></div></div>
        <div class="block-btn-row">
          <button class="btn-block-browse" onclick="openBlockBrowse(${block.blockNum})">📚 浏览单词</button>
          <button class="btn-review" onclick="startReview(${block.blockNum})">▶ 开始复习</button>
        </div>
      </div>
    `;
  });
  blockList.innerHTML = html;
}

// ===== BLOCK BROWSE =====
function openBlockBrowse(blockNum) {
  document.getElementById('bbNavTitle').textContent = `Block #${blockNum}`;
  const words = Object.entries(mockCollected)
    .filter(([, info]) => info.blockNumber === blockNum)
    .map(([word, info]) => ({ word, ...info }));

  let html = '';
  words.forEach(w => {
    const dictData = mockDictionary[w.word];
    const phonetic = dictData ? dictData.phonetic : '';
    let defPreview = '';
    if (w.selectedDefinitions && w.selectedDefinitions.length > 0) {
      defPreview = w.selectedDefinitions.map(d => typeof d === 'object' ? d.def : d).join('；');
    }
    const noteBadge = w.customNote ? `<span class="wb-note-badge">📝 ${escHtml(w.customNote)}</span>` : '';
    html += `
      <div class="wb-word-card" onclick="openWordDetail('${escAttr(w.word)}')">
        <div class="wb-card-content">
          <div class="wb-card-top">
            <div class="wb-word-text">${escHtml(w.word)}</div>
            <span class="wb-phonetic">${escHtml(phonetic)}</span>
          </div>
          <div class="wb-def-preview">${escHtml(defPreview)}</div>
          <div class="wb-card-bottom">
            <span class="wb-hit-badge">🔥 ${w.hitCount}次</span>
            ${noteBadge}
          </div>
        </div>
        <div class="wb-arrow">›</div>
      </div>
    `;
  });
  if (words.length === 0) {
    html = `<div class="empty-state"><div class="empty-state-emoji">📦</div><div class="empty-state-text">这个词块还没有单词</div></div>`;
  }
  document.getElementById('bbWordList').innerHTML = html;
  document.getElementById('blockBrowsePage').classList.add('open');
}

function closeBlockBrowse() {
  document.getElementById('blockBrowsePage').classList.remove('open');
}

// ===== REVIEW MODE =====
function startReview(blockNum) {
  const words = Object.entries(mockCollected)
    .filter(([, info]) => info.blockNumber === blockNum)
    .map(([word, info]) => ({ word, ...info }));
  if (words.length === 0) return;

  reviewState = { blockNum, words, currentIndex: 0, revealed: false, knownCount: 0 };
  reviewOverlay.classList.add('open');
  renderReviewCard();
}

function renderReviewCard() {
  const { words, currentIndex, revealed } = reviewState;

  if (currentIndex >= words.length) {
    document.getElementById('reviewProgressText').textContent = `${words.length}/${words.length}`;
    document.getElementById('reviewProgressFill').style.width = '100%';
    document.getElementById('reviewActions').style.display = 'none';
    document.getElementById('reviewBody').innerHTML = `
      <div class="review-complete">
        <div class="review-complete-emoji">🎉</div>
        <div class="review-complete-title">复习完成</div>
        <div class="review-complete-sub">认识了 ${reviewState.knownCount}/${words.length} 个单词</div>
        <button class="btn-review-done" onclick="closeReview()">完成</button>
      </div>
    `;
    return;
  }

  const w = words[currentIndex];
  document.getElementById('reviewProgressText').textContent = `${currentIndex + 1}/${words.length}`;
  document.getElementById('reviewProgressFill').style.width = `${((currentIndex + 1) / words.length) * 100}%`;
  document.getElementById('reviewActions').style.display = 'flex';

  // Use selectedDefinitions or customNote as the definition text
  let defText = '';
  if (w.selectedDefinitions && w.selectedDefinitions.length > 0) {
    defText = w.selectedDefinitions.map(d => typeof d === 'object' ? d.def : d).join('；');
  } else if (w.customNote) {
    defText = w.customNote;
  } else {
    defText = '暂无释义';
  }

  document.getElementById('reviewBody').innerHTML = `
    <div class="review-word-text">${escHtml(w.word)}</div>
    <div class="review-definition ${revealed ? 'visible' : 'hidden'}" id="reviewDef">${escHtml(defText)}</div>
    <div class="review-tap-hint" id="reviewHint">${revealed ? '' : '点击显示释义'}</div>
  `;

  document.getElementById('reviewBody').onclick = () => {
    if (!reviewState.revealed) {
      reviewState.revealed = true;
      const defEl = document.getElementById('reviewDef');
      const hintEl = document.getElementById('reviewHint');
      if (defEl) { defEl.classList.remove('hidden'); defEl.classList.add('visible'); }
      if (hintEl) hintEl.textContent = '';
    }
  };
}

document.getElementById('btnKnow').addEventListener('click', () => {
  reviewState.knownCount++;
  reviewState.currentIndex++;
  reviewState.revealed = false;
  renderReviewCard();
});

document.getElementById('btnDontKnow').addEventListener('click', () => {
  reviewState.currentIndex++;
  reviewState.revealed = false;
  renderReviewCard();
});

document.getElementById('btnReviewClose').addEventListener('click', closeReview);

function closeReview() {
  reviewOverlay.classList.remove('open');
  document.getElementById('reviewActions').style.display = 'flex';
}


// ================================================
// ===== SETTINGS (Tab 4) =====
// ================================================
function renderSettings() {
  const s = settingsState;

  document.getElementById('settingsSections').innerHTML = `
    <!-- 账号与安全 -->
    <div>
      <div class="settings-section-title">账号与安全</div>
      <div class="settings-card">
        <div class="settings-row" onclick="showToast('功能开发中')" style="cursor:pointer">
          <div class="settings-avatar">用</div>
          <div class="settings-row-left" style="margin-left:12px;">
            <div class="settings-row-label">头像和昵称</div>
            <div class="settings-row-sublabel">点击修改个人信息</div>
          </div>
          <span class="settings-row-arrow">›</span>
        </div>
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">登录状态</div>
            <div class="settings-row-sublabel">未登录</div>
          </div>
          <button class="settings-login-btn" onclick="showToast('功能开发中')">去登录</button>
        </div>
      </div>
    </div>

    <!-- 学习设置 -->
    <div>
      <div class="settings-section-title">学习设置</div>
      <div class="settings-card">
        <!-- Language pair -->
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">语言对设置</div>
          </div>
          <div class="lang-selector" style="padding:0">
            <div class="lang-pill" onclick="openLangSelector('source')">${escHtml(s.sourceLang)}</div>
            <div class="lang-arrow">→</div>
            <div class="lang-pill" onclick="openLangSelector('target')">${escHtml(s.targetLang)}</div>
          </div>
        </div>
        <!-- Daily goal -->
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">每日学习目标</div>
            <div class="settings-row-sublabel">每天计划学习的单词数</div>
          </div>
          <div class="stepper">
            <button class="stepper-btn" onclick="adjustDailyGoal(-10)">−</button>
            <div class="stepper-value" id="dailyGoalValue">${s.dailyGoal}</div>
            <button class="stepper-btn" onclick="adjustDailyGoal(10)">+</button>
          </div>
        </div>
        <!-- Block size -->
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">每个词块大小</div>
            <div class="settings-row-sublabel">每个词块包含的单词数量</div>
          </div>
          <div class="stepper">
            <button class="stepper-btn" onclick="adjustBlockSize(-5)">−</button>
            <div class="stepper-value" id="blockSizeValue">${s.blockSize}</div>
            <button class="stepper-btn" onclick="adjustBlockSize(5)">+</button>
          </div>
        </div>
        <!-- Reminder -->
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">学习提醒</div>
            <div class="settings-row-sublabel">每日定时提醒复习</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${s.reminderEnabled ? `<span class="time-display">${s.reminderTime}</span>` : ''}
            <div class="toggle-track ${s.reminderEnabled ? 'on' : ''}" onclick="toggleReminder()"><div class="toggle-thumb"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通用设置 -->
    <div>
      <div class="settings-section-title">通用设置</div>
      <div class="settings-card">
        <div class="settings-row" onclick="showToast('功能开发中')" style="cursor:pointer">
          <div class="settings-row-left">
            <div class="settings-row-label">深色模式</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="settings-row-value">浅色</span>
            <div class="toggle-track" onclick="event.stopPropagation();showToast('功能开发中')"><div class="toggle-thumb"></div></div>
          </div>
        </div>
        <div class="settings-row" onclick="showToast('功能开发中')" style="cursor:pointer">
          <div class="settings-row-left">
            <div class="settings-row-label">字体大小</div>
          </div>
          <div style="display:flex;align-items:center;gap:4px">
            <span class="settings-row-value">${escHtml(s.fontSize)}</span>
            <span class="settings-row-arrow">›</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-left">
            <div class="settings-row-label">发音偏好</div>
          </div>
          <div class="pron-toggle" onclick="togglePronunciation()">
            <div class="pron-pill ${s.pronunciation === '美式' ? 'active' : ''}">美式</div>
            <div class="pron-pill ${s.pronunciation === '英式' ? 'active' : ''}">英式</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据与隐私 -->
    <div>
      <div class="settings-section-title">数据与隐私</div>
      <div class="settings-card">
        <div class="settings-row" onclick="showToast('功能开发中')" style="cursor:pointer">
          <div class="settings-row-left"><div class="settings-row-label">数据备份</div></div>
          <span class="settings-row-arrow">›</span>
        </div>
        <div class="settings-row settings-row-red" onclick="showToast('功能开发中')" style="cursor:pointer">
          <div class="settings-row-left"><div class="settings-row-label">清除学习记录</div></div>
          <span class="settings-row-arrow">›</span>
        </div>
        <div class="settings-row" onclick="showToast('功能开发中')" style="cursor:pointer">
          <div class="settings-row-left"><div class="settings-row-label">隐私政策</div></div>
          <span class="settings-row-arrow">›</span>
        </div>
        <div class="settings-row" onclick="showToast('功能开发中')" style="cursor:pointer">
          <div class="settings-row-left"><div class="settings-row-label">用户协议</div></div>
          <span class="settings-row-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- 关于 WordBlock -->
    <div>
      <div class="settings-section-title">关于 WordBlock</div>
      <div class="settings-card">
        <div class="about-section">
          <div class="about-app-name">WordBlock</div>
          <div class="about-version">MVP 0.1.0</div>
          <div class="about-tagline">你的个人词汇宇宙</div>
        </div>
      </div>
    </div>
  `;
}

function adjustBlockSize(delta) {
  settingsState.blockSize = Math.min(50, Math.max(10, settingsState.blockSize + delta));
  const el = document.getElementById('blockSizeValue');
  if (el) el.textContent = settingsState.blockSize;
}

function adjustDailyGoal(delta) {
  settingsState.dailyGoal = Math.min(100, Math.max(10, settingsState.dailyGoal + delta));
  const el = document.getElementById('dailyGoalValue');
  if (el) el.textContent = settingsState.dailyGoal;
}

function toggleReminder() {
  settingsState.reminderEnabled = !settingsState.reminderEnabled;
  renderSettings();
}

function togglePronunciation() {
  settingsState.pronunciation = settingsState.pronunciation === '美式' ? '英式' : '美式';
  renderSettings();
  showToast(`已切换为${settingsState.pronunciation}发音`);
}

let langSelectorMode = 'source';

function openLangSelector(mode) {
  langSelectorMode = mode;
  document.getElementById('langSheetTitle').textContent = mode === 'source' ? '选择源语言' : '选择目标语言';
  const current = mode === 'source' ? settingsState.sourceLang : settingsState.targetLang;

  let html = '';
  languageOptions.forEach(lang => {
    const sel = lang === current;
    html += `<div class="lang-option ${sel ? 'selected' : ''}" onclick="selectLang('${escAttr(lang)}')"><span>${escHtml(lang)}</span>${sel ? '<span class="lang-option-check">✓</span>' : ''}</div>`;
  });
  document.getElementById('langOptionsList').innerHTML = html;
  openSheetEl(langSheet);
}

function selectLang(lang) {
  if (langSelectorMode === 'source') settingsState.sourceLang = lang;
  else settingsState.targetLang = lang;
  closeAllSheets();
  renderSettings();
  showToast(`已切换为 ${lang}`);
}
