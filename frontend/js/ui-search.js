// ===== ELEMENTS =====
const searchInput = document.getElementById('searchInput');
const resultsArea = document.getElementById('resultsArea');
const recentSection = document.getElementById('recentSection');
const homeModules = document.getElementById('homeModules');
const exploreSection = document.getElementById('exploreSection');
const tipsSection = document.getElementById('tipsSection');
const resultImageInput = document.getElementById('resultImageInput');
let resultImageData = null;
const sheetOverlay = document.getElementById('sheetOverlay');
const collectionSheet = document.getElementById('collectionSheet');
const sheetWord = document.getElementById('sheetWord');
const sheetNote = document.getElementById('sheetNote');
const sheetSelectedDefs = document.getElementById('sheetSelectedDefs');
const imageUpload = document.getElementById('imageUpload');
const imageFileInput = document.getElementById('imageFileInput');
const btnConfirm = document.getElementById('btnConfirm');
const toast = document.getElementById('toast');
const wordDetailPage = document.getElementById('wordDetailPage');
const langSheet = document.getElementById('langSheet');
const reviewOverlay = document.getElementById('reviewOverlay');

let activeSheet = null;

// ===== TAB SWITCHING =====
const pages = document.querySelectorAll('.page');
const tabs = document.querySelectorAll('.tab-item');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + target).classList.add('active');
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    if (target === 'search') renderHomepage();
    if (target === 'wordbook') renderWordbook();
    if (target === 'study') renderStudy();
    if (target === 'settings') renderSettings();
    window.scrollTo(0, 0);
  });
});

// ===== HOMEPAGE RENDER =====
function renderHomepage() {
  renderHomeModules();
  renderRecentWords();
  renderExploreWords();
  renderTips();
}

function renderExploreWords() {
  // 探索单词 — 暂时使用提示引导用户自行查词
  exploreSection.innerHTML = `
    <div class="explore-title">发现新单词</div>
    <div style="padding:8px 16px;color:#888;font-size:13px;">
      在搜索栏中输入任何英文单词，随时查词并收录到词块中。
    </div>
  `;
}

function renderTips() {
  const tips = [
    '在生活中遇到不认识的单词时，随手查词并收录，积少成多效果最好。',
    '每个词块装满后会自动创建新词块，定期复习热度最高的词块效率最高。',
    '给单词拍照记录使用场景，视觉记忆能帮助你更牢固地记住单词。',
    '勾选你需要的释义，不用把所有意思都背，聚焦最常用的含义。',
  ];
  const tipIdx = new Date().getDate() % tips.length;

  tipsSection.innerHTML = `
    <div class="tip-card">
      <div class="tip-header">💡 学习小贴士</div>
      <div class="tip-text">${tips[tipIdx]}</div>
    </div>
  `;
}

function renderHomeModules() {
  const totalCollected = Object.keys(collectedWords).length;
  const pendingReview = totalCollected;

  // Simple stats display
  homeModules.innerHTML = `
    <!-- Study Progress -->
    <div class="progress-stats-row">
      <div class="progress-stat">
        <div class="progress-stat-value">${totalCollected}</div>
        <div class="progress-stat-label">总收词</div>
      </div>
      <div class="progress-stat">
        <div class="progress-stat-value">${blocksCache.length}</div>
        <div class="progress-stat-label">词块</div>
      </div>
      <div class="progress-stat">
        <div class="progress-stat-value">${pendingReview}</div>
        <div class="progress-stat-label">待复习</div>
      </div>
    </div>

    <!-- Quick Review -->
    ${totalCollected > 0 ? `
    <button class="quick-review-btn" onclick="switchToStudy()">
      <div class="quick-review-icon">⚡</div>
      <div class="quick-review-text">
        <div class="quick-review-title">开始今日复习</div>
        <div class="quick-review-sub">共 ${totalCollected} 个词待复习</div>
      </div>
      <div class="quick-review-arrow">›</div>
    </button>
    ` : ''}
  `;
}

function switchToStudy() {
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('page-study').classList.add('active');
  tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  const studyTab = document.querySelector('[data-tab="study"]');
  if (studyTab) { studyTab.classList.add('active'); studyTab.setAttribute('aria-selected', 'true'); }
  renderStudy();
  window.scrollTo(0, 0);
}

// ===== RECENT WORDS =====
function renderRecentWords() {
  const entries = Object.entries(collectedWords);
  if (entries.length === 0) {
    recentSection.innerHTML = '';
    return;
  }

  entries.sort((a, b) => (b[1].addedAt || 0) - (a[1].addedAt || 0));
  const recent = entries.slice(0, 8);

  let chips = '';
  recent.forEach(([word, info]) => {
    chips += `<div class="recent-chip" onclick="quickSearch('${escAttr(word)}')">${escHtml(word)} <span class="chip-block">#${info.blockNumber || '?'}</span></div>`;
  });

  recentSection.innerHTML = `
    <div class="recent-title">最近收录</div>
    <div class="recent-list">${chips}</div>
  `;
}

function quickSearch(word) {
  searchInput.value = word;
  searchWord(word);
}

// Initial render — will be triggered by initApp()
// renderHomepage();

// ===== SEARCH =====
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const word = searchInput.value.trim().toLowerCase();
    if (word) searchWord(word);
  }
});

// Hide home modules and recent when searching
searchInput.addEventListener('input', () => {
  if (!searchInput.value.trim()) {
    renderHomepage();
    resultsArea.innerHTML = '';
    resultImageData = null;
  }
});

async function searchWord(word) {
  currentWord = word;
  currentSelectedDefs = [];
  currentDictResult = null;

  // Hide home modules while showing results
  homeModules.innerHTML = '';
  recentSection.innerHTML = '';
  exploreSection.innerHTML = '';
  tipsSection.innerHTML = '';
  resultImageData = null;
  showSkeleton();

  try {
    // Call backend dictionary lookup (also increments hit_count if collected)
    const data = await DictionaryAPI.lookup(word);
    currentDictResult = data;

    // If word is collected, update local cache hit count
    if (data.isCollected && collectedWords[word]) {
      collectedWords[word].hitCount = data.hitCount;
    }

    if (data.meanings && data.meanings.length > 0) {
      showResults(word, data);
    } else if (data.error) {
      showError();
    } else {
      showError();
    }
  } catch (e) {
    console.error('Search failed:', e);
    showError();
  }
}

function showSkeleton() {
  resultsArea.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-line w-40"></div>
      <div class="skeleton-line w-25"></div>
      <div style="height:8px"></div>
      <div class="skeleton-line w-15"></div>
      <div class="skeleton-line w-100"></div>
      <div class="skeleton-line w-90"></div>
      <div class="skeleton-line w-75"></div>
    </div>
  `;
}

function showResults(word, data) {
  const isCollected = data.isCollected || !!collectedWords[word];
  const collectedInfo = collectedWords[word];

  // Audio URL
  let audioUrl = data.audioUrl || '';
  currentAudioUrl = audioUrl;

  // Phonetic text
  let phoneticText = data.phonetic || '';

  // Build meanings with checkboxes
  let meaningsHtml = '';
  const meanings = data.meanings || [];
  meanings.forEach((meaning, mi) => {
    if (mi > 0) meaningsHtml += '<div class="meaning-divider"></div>';
    // Convert English POS to abbreviation for display
    let posLabel = posToAbbr(meaning.partOfSpeech);
    meaningsHtml += `<div class="meaning-group">`;
    meaningsHtml += `<div class="pos-badge">${escHtml(posLabel)}</div>`;

    const defs = (meaning.definitions || []).slice(0, 3);
    defs.forEach((def, di) => {
      const defKey = `${mi}-${di}`;
      meaningsHtml += `
        <div class="def-checkbox-item" id="defItem-${defKey}" onclick="toggleDefCheck('${escAttr(def.definition)}', '${defKey}')">
          <div class="custom-checkbox" id="defCb-${defKey}">
            <div class="custom-checkbox-check"></div>
          </div>
          <div class="def-content">
            <div class="definition-text">${escHtml(def.definition)}</div>
            ${def.example ? `<div class="example-text">"${escHtml(def.example)}"</div>` : ''}
          </div>
        </div>
      `;
    });
    meaningsHtml += `</div>`;
  });

  let collectedBadge = '';
  if (isCollected && collectedInfo) {
    collectedBadge = `<div class="collected-badge">❆ 已收录 · Block #${collectedInfo.blockNumber || '?'} · 已查${collectedInfo.hitCount}次</div>`;
  }

  let buttonHtml = isCollected
    ? `<button class="btn-collect btn-collected-state" disabled>已收录</button>`
    : `<button class="btn-collect" onclick="openSheet('${escAttr(word)}')">收录到词块</button>`;

  let audioBtn = audioUrl ? `<button class="btn-play" onclick="playAudio()">▶ 发音</button>` : '';

  const photoBtn = `<button class="btn-photo" onclick="triggerResultPhoto()">📷 拍照/图片</button>`;

  resultsArea.innerHTML = `
    <div class="result-card ${isCollected ? 'collected' : ''}" id="resultCard">
      <div class="word-header"><div class="word-text">${escHtml(word)}</div></div>
      <div class="phonetic-row">
        ${phoneticText ? `<span class="phonetic-text">${escHtml(phoneticText)}</span>` : ''}
        ${audioBtn}
        ${photoBtn}
      </div>
      <div class="result-image-area" id="resultImageArea" style="display:none"></div>
      ${collectedBadge}
      ${meaningsHtml}
      ${buttonHtml}
    </div>
  `;
}

function toggleDefCheck(defText, key) {
  const item = document.getElementById('defItem-' + key);
  if (!item) return;
  const isChecked = item.classList.contains('checked');
  if (isChecked) {
    item.classList.remove('checked');
    currentSelectedDefs = currentSelectedDefs.filter(d => d !== defText);
  } else {
    item.classList.add('checked');
    if (!currentSelectedDefs.includes(defText)) currentSelectedDefs.push(defText);
  }
}

function showError() {
  resultsArea.innerHTML = `
    <div class="error-card">
      <div class="error-emoji">🔎</div>
      <div class="error-text">未找到该单词，请检查拼写</div>
    </div>
  `;
}

function playAudio() {
  if (currentAudioUrl) {
    new Audio(currentAudioUrl).play().catch(() => {});
  }
}

// ===== RESULT CARD PHOTO =====
function triggerResultPhoto() {
  resultImageInput.value = '';
  resultImageInput.click();
}

resultImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    resultImageData = ev.target.result;
    const area = document.getElementById('resultImageArea');
    if (area) {
      area.style.display = 'block';
      area.innerHTML = `
        <img src="${ev.target.result}" class="result-image-preview" alt="单词图片">
        <button class="result-image-remove" onclick="removeResultImage()">\u2715</button>
      `;
    }
  };
  reader.readAsDataURL(file);
});

function removeResultImage() {
  resultImageData = null;
  const area = document.getElementById('resultImageArea');
  if (area) { area.style.display = 'none'; area.innerHTML = ''; }
}

// ===== COLLECTION SHEET =====
let sheetImageData = null;

function openSheet(word) {
  currentWord = word;
  sheetWord.textContent = word;
  sheetNote.value = '';
  // Carry over result card image to sheet
  sheetImageData = resultImageData || null;
  if (sheetImageData) {
    imageUpload.innerHTML = `<img src="${sheetImageData}" alt="上传的图片">`;
  } else {
    resetImageUpload();
  }

  // Show selected definitions in sheet
  if (currentSelectedDefs.length > 0) {
    sheetSelectedDefs.textContent = '已选释义：' + currentSelectedDefs.join('；');
  } else {
    sheetSelectedDefs.textContent = '（未选择释义，将收录全部）';
  }

  openSheetEl(collectionSheet);
}

function openSheetEl(sheetEl) {
  activeSheet = sheetEl;
  sheetOverlay.classList.add('open');
  sheetEl.classList.add('open');
}

function closeAllSheets() {
  sheetOverlay.classList.remove('open');
  collectionSheet.classList.remove('open');
  wordDetailPage.classList.remove('open');
  langSheet.classList.remove('open');
  activeSheet = null;
}

sheetOverlay.addEventListener('click', closeAllSheets);

imageUpload.addEventListener('click', () => imageFileInput.click());
imageFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      sheetImageData = ev.target.result;
      imageUpload.innerHTML = `<img src="${ev.target.result}" alt="上传的图片">`;
    };
    reader.readAsDataURL(file);
  }
});

function resetImageUpload() {
  imageUpload.innerHTML = `<span class="upload-icon">📷</span><span>点击上传图片</span>`;
  imageFileInput.value = '';
}

// ===== COLLECT WORD (calls backend) =====
btnConfirm.addEventListener('click', async () => {
  if (!currentWord) return;

  btnConfirm.disabled = true;
  btnConfirm.textContent = '收录中...';

  try {
    // Build definitions to send to backend
    let defsToSend = [];
    const dictResult = currentDictResult;

    if (currentSelectedDefs.length > 0) {
      // Map each selected definition text to backend format
      currentSelectedDefs.forEach(defText => {
        let pos = '';
        let example = '';
        if (dictResult && dictResult.meanings) {
          for (const m of dictResult.meanings) {
            const found = m.definitions.find(d => d.definition === defText);
            if (found) {
              pos = m.partOfSpeech || '';
              example = found.example || '';
              break;
            }
          }
        }
        defsToSend.push({
          part_of_speech: pos,
          definition: defText,
          example: example,
          is_custom: false,
        });
      });
    } else if (dictResult && dictResult.meanings && dictResult.meanings[0]) {
      // Auto-collect first definition
      const m = dictResult.meanings[0];
      const d = m.definitions[0];
      if (d) {
        defsToSend.push({
          part_of_speech: m.partOfSpeech || '',
          definition: d.definition,
          example: d.example || '',
          is_custom: false,
        });
      }
    }

    const result = await WordsAPI.collect({
      word: currentWord,
      phonetic: dictResult?.phonetic || '',
      audio_url: dictResult?.audioUrl || '',
      custom_note: sheetNote.value.trim() || null,
      definitions: defsToSend,
    });

    // Update local cache
    collectedWords[currentWord] = {
      id: result.id,
      blockNumber: result.block_number,
      blockId: result.block_id,
      hitCount: result.hit_count,
      customNote: result.custom_note || '',
      addedAt: new Date(result.added_at).getTime(),
      selectedDefinitions: (result.definitions || []).map(d => ({
        id: d.id,
        pos: posToAbbr(d.part_of_speech),
        def: d.definition,
        example: d.example || '',
        isCustom: d.is_custom,
        sortOrder: d.sort_order,
      })),
      photos: [],
      phonetic: result.phonetic || '',
      audioUrl: result.audio_url || '',
    };

    closeAllSheets();
    showToast(`已收录到 Block #${result.block_number}`);

    // Refresh blocks cache
    refreshBlocks();

    // Update result card to show collected state
    setTimeout(() => {
      const resultCard = document.getElementById('resultCard');
      if (resultCard) {
        resultCard.classList.add('collected');
        const phoneticRow = resultCard.querySelector('.phonetic-row');
        if (phoneticRow && !resultCard.querySelector('.collected-badge')) {
          const badge = document.createElement('div');
          badge.className = 'collected-badge';
          badge.innerHTML = `❆ 已收录 · Block #${result.block_number} · 已查1次`;
          phoneticRow.after(badge);
        }
        const btn = resultCard.querySelector('.btn-collect');
        if (btn) {
          btn.className = 'btn-collect btn-collected-state';
          btn.disabled = true;
          btn.textContent = '已收录';
          btn.onclick = null;
        }
      }
    }, 300);

  } catch (e) {
    let msg = '收录失败，请重试';
    if (e.status === 409) msg = '该单词已收录';
    showToast(msg);
    console.error('Collect failed:', e);
  } finally {
    btnConfirm.disabled = false;
    btnConfirm.textContent = '确认收录';
  }
});

// ===== TOAST =====
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ===== HELPERS =====
function escHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}
function escAttr(str) {
  if (str == null) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Prevent sheets from closing when clicking inside them
[collectionSheet, langSheet].forEach(s => {
  s.addEventListener('click', (e) => e.stopPropagation());
});

// Sheet drag-to-close
[collectionSheet, langSheet].forEach(sheetEl => {
  const handle = sheetEl.querySelector('.sheet-handle');
  if (!handle) return;
  let dragStartY = null;
  handle.addEventListener('touchstart', (e) => { dragStartY = e.touches[0].clientY; }, { passive: true });
  handle.addEventListener('touchmove', (e) => {
    if (dragStartY !== null && e.touches[0].clientY - dragStartY > 60) { closeAllSheets(); dragStartY = null; }
  }, { passive: true });
  handle.addEventListener('touchend', () => { dragStartY = null; }, { passive: true });
});
