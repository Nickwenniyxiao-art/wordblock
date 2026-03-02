// ================================================
// ===== WORDBOOK (Tab 2) =====
// ================================================
const wbFilterInput = document.getElementById('wbFilterInput');
const wbWordList = document.getElementById('wbWordList');
const wbCountBadge = document.getElementById('wbCountBadge');

let wbSortMode = 'hitCount'; // 'hitCount' | 'addedAt' | 'alpha'
const sortLabels = { hitCount: '⇅ 查询次数', addedAt: '⇅ 收录时间', alpha: '⇅ 字母顺序' };

function cycleWbSort() {
  const modes = ['hitCount', 'addedAt', 'alpha'];
  const idx = modes.indexOf(wbSortMode);
  wbSortMode = modes[(idx + 1) % modes.length];
  document.getElementById('wbSortBtn').textContent = sortLabels[wbSortMode];
  renderWordbook();
}

wbFilterInput.addEventListener('input', renderWordbook);

function renderWordbook() {
  const filter = wbFilterInput.value.trim().toLowerCase();
  const entries = Object.entries(mockCollected);
  const filtered = filter ? entries.filter(([word]) => word.includes(filter)) : entries;

  wbCountBadge.textContent = `${entries.length} 个单词`;

  if (filtered.length === 0) {
    wbWordList.innerHTML = entries.length === 0
      ? `<div class="empty-state"><div class="empty-state-emoji">📝</div><div class="empty-state-text">还没有收录任何单词</div><div class="empty-state-sub">在查词页面搜索并收录你的第一个单词</div></div>`
      : `<div class="empty-state"><div class="empty-state-emoji">🔍</div><div class="empty-state-text">没有找到匹配的单词</div></div>`;
    return;
  }

  // Sort
  if (wbSortMode === 'hitCount') {
    filtered.sort((a, b) => b[1].hitCount - a[1].hitCount);
  } else if (wbSortMode === 'addedAt') {
    filtered.sort((a, b) => b[1].addedAt - a[1].addedAt);
  } else {
    filtered.sort((a, b) => a[0].localeCompare(b[0]));
  }

  let html = '';
  filtered.forEach(([word, info]) => {
    // Get phonetic and definition from dictionary
    const dictData = mockDictionary[word];
    const phonetic = dictData ? dictData.phonetic : '';
    // Build definition preview from selectedDefinitions or dictionary
    let defPreview = '';
    if (info.selectedDefinitions && info.selectedDefinitions.length > 0) {
      defPreview = info.selectedDefinitions.map(d => typeof d === 'object' ? d.def : d).join('；');
    } else if (dictData && dictData.meanings.length > 0) {
      defPreview = dictData.meanings[0].definitions[0].definition;
    }
    const noteBadge = info.customNote ? `<span class="wb-note-badge">📝 ${escHtml(info.customNote)}</span>` : '';

    html += `
      <div class="wb-word-card" onclick="openWordDetail('${escAttr(word)}')">
        <div class="wb-card-content">
          <div class="wb-card-top">
            <div class="wb-word-text">${escHtml(word)}</div>
            <span class="wb-phonetic">${escHtml(phonetic)}</span>
          </div>
          <div class="wb-def-preview">${escHtml(defPreview)}</div>
          <div class="wb-card-bottom">
            <span class="wb-block-badge">Block #${info.blockNumber}</span>
            <span class="wb-hit-badge">🔥 ${info.hitCount}次</span>
            ${noteBadge}
          </div>
        </div>
        <div class="wb-arrow">›</div>
      </div>
    `;
  });
  wbWordList.innerHTML = html;
}

// ===== Word Detail Page =====
let currentDetailWord = '';

function openWordDetail(word) {
  const info = mockCollected[word];
  if (!info) return;
  currentDetailWord = word;

  const dictData = mockDictionary[word];
  const phonetic = dictData ? dictData.phonetic : '';
  const audioUrl = dictData ? dictData.audioUrl : '';

  // Selected definitions (with pos tags and add button)
  let selectedDefsHtml = '';
  if (info.selectedDefinitions && info.selectedDefinitions.length > 0) {
    selectedDefsHtml = info.selectedDefinitions.map(d => {
      if (typeof d === 'object') {
        const isCustom = d.custom === true;
        const chipClass = isCustom ? 'wd-selected-chip custom-def' : 'wd-selected-chip';
        const customIcon = isCustom ? '<span class="chip-custom-icon">✏️</span>' : '';
        const customTag = isCustom ? '<span class="chip-custom-tag">我的释义</span>' : '';
        return `<div class="${chipClass}">${customIcon}<span class="chip-pos">${escHtml(d.pos)}</span><span class="chip-def">${escHtml(d.def)}</span>${customTag}</div>`;
      }
      return `<div class="wd-selected-chip"><span class="chip-def">${escHtml(d)}</span></div>`;
    }).join('');
  }
  selectedDefsHtml += `<button class="wd-add-def-btn" onclick="openDefSheet('${escAttr(word)}')">+ 新增释义</button>`;

  // Full definitions from dictionary
  let allDefsHtml = '';
  if (dictData) {
    dictData.meanings.forEach(m => {
      allDefsHtml += `<div class="wd-def-group"><div class="wd-pos-tag">${escHtml(m.partOfSpeech)}</div>`;
      m.definitions.forEach(d => {
        allDefsHtml += `<div class="wd-def-item"><div class="wd-def-text">${escHtml(d.definition)}</div>`;
        if (d.example) allDefsHtml += `<div class="wd-def-example">"${escHtml(d.example)}"</div>`;
        allDefsHtml += `</div>`;
      });
      allDefsHtml += `</div>`;
    });
  }

  // Note
  const noteHtml = info.customNote
    ? `<div class="wd-note-content">${escHtml(info.customNote)}</div>`
    : `<div class="wd-note-empty">点击下方“编辑笔记”添加你的学习笔记</div>`;

  // Photos gallery (multiple) with lightbox + add card
  const photos = info.photos || [];
  let photoHtml = '';
  if (photos.length > 0) {
    photoHtml = `<div class="wd-photo-gallery" id="photoGallery">`;
    photos.forEach((url, i) => {
      photoHtml += `<img class="wd-photo-thumb" src="${url}" alt="场景图片" onclick="openLightbox(${i})">`;
    });
    photoHtml += `<div class="wd-photo-add-card" onclick="document.getElementById('wdPhotoInput').click()"><span class="add-icon">+</span><span class="add-text">添加</span></div>`;
    if (photos.length > 3) {
      photoHtml += `<div class="wd-photo-scroll-hint" onclick="document.getElementById('photoGallery').scrollBy({left:160,behavior:'smooth'})">›</div>`;
    }
    photoHtml += `</div>`;
  } else {
    photoHtml = `<div class="wd-photo-placeholder"><div class="wd-photo-add-card" onclick="document.getElementById('wdPhotoInput').click()"><span class="add-icon">+</span><span class="add-text">添加场景图片</span></div></div>`;
  }

  // Added date
  const addedDate = new Date(info.addedAt);
  const dateStr = `${addedDate.getMonth()+1}月${addedDate.getDate()}日`;

  document.getElementById('wordDetailBody').innerHTML = `
    <div class="wd-word">${escHtml(word)}</div>
    <div class="wd-phonetic-row">
      <span class="wd-phonetic">${escHtml(phonetic)}</span>
      ${audioUrl ? `<button class="wd-play-btn" onclick="new Audio('${audioUrl}').play()">▶ 发音</button>` : ''}
    </div>

    ${selectedDefsHtml ? `
    <div class="wd-section">
      <div class="wd-section-title">收录的释义</div>
      <div>${selectedDefsHtml}</div>
    </div>` : `
    <div class="wd-section">
      <div class="wd-section-title">收录的释义</div>
      <div><button class="wd-add-def-btn" onclick="openDefSheet('${escAttr(word)}')">+ 新增释义</button></div>
    </div>`}

    ${allDefsHtml ? `
    <div class="wd-section">
      <div class="wd-section-title">完整释义</div>
      ${allDefsHtml}
    </div>` : ''}

    <div class="wd-section">
      <div class="wd-section-title">笔记</div>
      ${noteHtml}
    </div>

    <div class="wd-section">
      <div class="wd-section-title">场景图片</div>
      <div class="wd-photo-area">${photoHtml}</div>
    </div>

    <div class="wd-section">
      <div class="wd-section-title">学习信息</div>
      <div class="wd-info-grid">
        <div class="wd-info-card">
          <div class="wd-info-value">#${info.blockNumber}</div>
          <div class="wd-info-label">词块</div>
        </div>
        <div class="wd-info-card">
          <div class="wd-info-value">${info.hitCount}</div>
          <div class="wd-info-label">查询次数</div>
        </div>
        <div class="wd-info-card">
          <div class="wd-info-value">${dateStr}</div>
          <div class="wd-info-label">收录日期</div>
        </div>
      </div>
    </div>

    <div class="wd-section">
      <div class="wd-actions">
        <button class="wd-action-btn secondary" onclick="editWordNote('${escAttr(word)}')">✏️ 编辑笔记</button>
        <button class="wd-action-btn danger" onclick="removeWord('${escAttr(word)}')">移出词块</button>
      </div>
    </div>
  `;

  wordDetailPage.classList.add('open');
}

function closeWordDetail() {
  wordDetailPage.classList.remove('open');
}

function editWordNote(word) {
  const info = mockCollected[word];
  if (!info) return;
  const newNote = prompt('编辑笔记：', info.customNote || '');
  if (newNote !== null) {
    info.customNote = newNote;
    openWordDetail(word); // refresh
    showToast('笔记已更新');
  }
}

function removeWord(word) {
  if (confirm(`确定要将“${word}”从词块中移除吗？`)) {
    delete mockCollected[word];
    closeWordDetail();
    renderWordbook();
    renderHomepage();
    renderStudy();
    showToast('已移除');
  }
}

// Handle photo upload in detail page (append to photos array)
document.getElementById('wdPhotoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file || !currentDetailWord) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const info = mockCollected[currentDetailWord];
    if (info) {
      if (!info.photos) info.photos = [];
      info.photos.push(ev.target.result);
      openWordDetail(currentDetailWord); // refresh
      showToast(`图片已添加（共 ${info.photos.length} 张）`);
    }
  };
  reader.readAsDataURL(file);
  e.target.value = ''; // reset
});

// ===== LIGHTBOX =====
let lightboxPhotos = [];
let lightboxIndex = 0;

function openLightbox(index) {
  const info = mockCollected[currentDetailWord];
  if (!info || !info.photos || !info.photos.length) return;
  lightboxPhotos = info.photos;
  lightboxIndex = index;
  renderLightbox();
  document.getElementById('wdLightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('wdLightbox').classList.remove('open');
}
function lightboxNav(dir) {
  lightboxIndex = Math.max(0, Math.min(lightboxPhotos.length - 1, lightboxIndex + dir));
  renderLightbox();
}
function renderLightbox() {
  document.getElementById('lbImg').src = lightboxPhotos[lightboxIndex];
  document.getElementById('lbCounter').textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
  document.getElementById('lbPrev').disabled = lightboxIndex === 0;
  document.getElementById('lbNext').disabled = lightboxIndex === lightboxPhotos.length - 1;
}

// ===== DEFINITION SHEET =====
let defSheetWord = '';
let defSheetCustomDefs = []; // temp custom defs added in sheet

function openDefSheet(word) {
  defSheetWord = word;
  defSheetCustomDefs = [];
  const info = mockCollected[word];
  const dictData = mockDictionary[word];
  const phonetic = dictData ? dictData.phonetic : '';

  document.getElementById('dsTitle').textContent = `添加释义 — ${word}`;
  document.getElementById('dsPhonetic').textContent = phonetic;

  // Build dictionary definitions list
  const existingDefs = (info && info.selectedDefinitions) ? info.selectedDefinitions : [];
  let listHtml = '';
  if (dictData) {
    dictData.meanings.forEach(m => {
      m.definitions.forEach(d => {
        const isAdded = existingDefs.some(ed => {
          if (typeof ed === 'object') return ed.def === d.definition;
          return ed === d.definition;
        });
        if (isAdded) {
          listHtml += `<div class="def-sheet-item added">
            <div class="ds-check checked">✓</div>
            <span class="ds-pos grey">${escHtml(m.partOfSpeech)}</span>
            <span class="ds-def grey">${escHtml(d.definition)}</span>
            <span class="ds-status">已添加</span>
          </div>`;
        } else {
          listHtml += `<div class="def-sheet-item" onclick="addDictDef(this, '${escAttr(m.partOfSpeech)}', '${escAttr(d.definition)}')">
            <div class="ds-check selectable"></div>
            <span class="ds-pos blue">${escHtml(m.partOfSpeech)}</span>
            <span class="ds-def">${escHtml(d.definition)}</span>
          </div>`;
        }
      });
    });
  }
  if (!listHtml) {
    listHtml = '<div style="padding:12px 14px;color:#BBB;font-size:13px;">无词典释义可选</div>';
  }
  document.getElementById('dsDictList').innerHTML = listHtml;
  document.getElementById('dsMyCustomList').innerHTML = '';
  document.getElementById('dsCustomPos').value = 'n.';
  document.getElementById('dsCustomDef').value = '';

  document.getElementById('defSheetOverlay').classList.add('open');
  document.getElementById('defSheet').classList.add('open');
}

function closeDefSheet() {
  document.getElementById('defSheetOverlay').classList.remove('open');
  document.getElementById('defSheet').classList.remove('open');
}

function addDictDef(el, pos, def) {
  const info = mockCollected[defSheetWord];
  if (!info) return;
  if (!info.selectedDefinitions) info.selectedDefinitions = [];
  // Check not already added
  if (info.selectedDefinitions.some(d => typeof d === 'object' && d.def === def)) return;
  info.selectedDefinitions.push({ pos, def });
  // Update the item visually
  el.classList.add('added');
  el.style.pointerEvents = 'none';
  el.querySelector('.ds-check').classList.remove('selectable');
  el.querySelector('.ds-check').classList.add('checked');
  el.querySelector('.ds-check').textContent = '✓';
  el.querySelector('.ds-pos').classList.remove('blue');
  el.querySelector('.ds-pos').classList.add('grey');
  el.querySelector('.ds-def').classList.add('grey');
  const statusEl = document.createElement('span');
  statusEl.className = 'ds-status';
  statusEl.textContent = '已添加';
  el.appendChild(statusEl);
  showToast('释义已添加');
}

function addSheetCustomDef() {
  const pos = document.getElementById('dsCustomPos').value.trim() || 'n.';
  const def = document.getElementById('dsCustomDef').value.trim();
  if (!def) return;
  const info = mockCollected[defSheetWord];
  if (!info) return;
  if (!info.selectedDefinitions) info.selectedDefinitions = [];
  const customDef = { pos, def, custom: true };
  info.selectedDefinitions.push(customDef);
  defSheetCustomDefs.push(customDef);
  // Render in sheet
  renderSheetCustomDefs();
  document.getElementById('dsCustomDef').value = '';
  showToast('自定义释义已添加');
}

function renderSheetCustomDefs() {
  const info = mockCollected[defSheetWord];
  const customDefs = info.selectedDefinitions.filter(d => d.custom === true);
  let html = '';
  customDefs.forEach((d, i) => {
    html += `<div class="def-sheet-my-custom">
      <span class="mc-icon">✏️</span>
      <span class="mc-pos">${escHtml(d.pos)}</span>
      <span class="mc-def">${escHtml(d.def)}</span>
      <span class="mc-tag">自定义</span>
      <button class="mc-del" onclick="deleteCustomDef(${i})">✕</button>
    </div>`;
  });
  document.getElementById('dsMyCustomList').innerHTML = html;
}

function deleteCustomDef(index) {
  const info = mockCollected[defSheetWord];
  const customDefs = info.selectedDefinitions.filter(d => d.custom === true);
  const target = customDefs[index];
  if (target) {
    const idx = info.selectedDefinitions.indexOf(target);
    if (idx > -1) info.selectedDefinitions.splice(idx, 1);
  }
  renderSheetCustomDefs();
  showToast('已删除');
}

function confirmDefSheet() {
  closeDefSheet();
  openWordDetail(defSheetWord); // refresh detail page
}

