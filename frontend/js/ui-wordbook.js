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
  const entries = Object.entries(collectedWords);
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
    const phonetic = info.phonetic || '';
    // Build definition preview from selectedDefinitions
    let defPreview = '';
    if (info.selectedDefinitions && info.selectedDefinitions.length > 0) {
      defPreview = info.selectedDefinitions.map(d => typeof d === 'object' ? d.def : d).join('；');
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
            <span class="wb-block-badge">Block #${info.blockNumber || '?'}</span>
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
  const info = collectedWords[word];
  if (!info) return;
  currentDetailWord = word;

  const phonetic = info.phonetic || '';
  const audioUrl = info.audioUrl || '';

  // Selected definitions (with pos tags and add button)
  let selectedDefsHtml = '';
  if (info.selectedDefinitions && info.selectedDefinitions.length > 0) {
    selectedDefsHtml = info.selectedDefinitions.map(d => {
      if (typeof d === 'object') {
        const isCustom = d.isCustom === true;
        const chipClass = isCustom ? 'wd-selected-chip custom-def' : 'wd-selected-chip';
        const customIcon = isCustom ? '<span class="chip-custom-icon">✏️</span>' : '';
        const customTag = isCustom ? '<span class="chip-custom-tag">我的释义</span>' : '';
        return `<div class="${chipClass}">${customIcon}<span class="chip-pos">${escHtml(d.pos)}</span><span class="chip-def">${escHtml(d.def)}</span>${customTag}</div>`;
      }
      return `<div class="wd-selected-chip"><span class="chip-def">${escHtml(d)}</span></div>`;
    }).join('');
  }
  selectedDefsHtml += `<button class="wd-add-def-btn" onclick="openDefSheet('${escAttr(word)}')">+ 新增释义</button>`;

  // Note
  const noteHtml = info.customNote
    ? `<div class="wd-note-content">${escHtml(info.customNote)}</div>`
    : `<div class="wd-note-empty">点击下方"编辑笔记"添加你的学习笔记</div>`;

  // Photos gallery (from backend)
  const photos = info.photos || [];
  let photoHtml = '';
  if (photos.length > 0) {
    photoHtml = `<div class="wd-photo-gallery" id="photoGallery">`;
    photos.forEach((p, i) => {
      const url = typeof p === 'object' ? p.url : p;
      photoHtml += `<img class="wd-photo-thumb" src="${url}" alt="场景图片" onclick="openLightbox(${i})">`;
    });
    photoHtml += `<div class="wd-photo-add-card" onclick="document.getElementById('wdPhotoInput').click()"><span class="add-icon">+</span><span class="add-text">添加</span></div>`;
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
          <div class="wd-info-value">#${info.blockNumber || '?'}</div>
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
        <button class="wd-action-btn secondary" onclick="editWordNote('${escAttr(word)}')">\u270f\ufe0f 编辑笔记</button>
        <button class="wd-action-btn danger" onclick="removeWord('${escAttr(word)}')">\u79fb出词块</button>
      </div>
    </div>
  `;

  wordDetailPage.classList.add('open');
}

function closeWordDetail() {
  wordDetailPage.classList.remove('open');
}

async function editWordNote(word) {
  const info = collectedWords[word];
  if (!info) return;
  const newNote = prompt('编辑笔记：', info.customNote || '');
  if (newNote !== null) {
    try {
      await WordsAPI.update(info.id, { custom_note: newNote });
      info.customNote = newNote;
      openWordDetail(word); // refresh
      showToast('笔记已更新');
    } catch (e) {
      showToast('更新失败，请重试');
      console.error('Update note failed:', e);
    }
  }
}

async function removeWord(word) {
  if (confirm(`确定要将"${word}"从词块中移除吗？`)) {
    const info = collectedWords[word];
    if (!info) return;
    try {
      await WordsAPI.remove(info.id);
      delete collectedWords[word];
      closeWordDetail();
      renderWordbook();
      renderHomepage();
      renderStudy();
      refreshBlocks();
      showToast('已移除');
    } catch (e) {
      showToast('删除失败，请重试');
      console.error('Remove word failed:', e);
    }
  }
}

// Handle photo upload in detail page
document.getElementById('wdPhotoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file || !currentDetailWord) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const info = collectedWords[currentDetailWord];
    if (info) {
      if (!info.photos) info.photos = [];
      // For now, store locally (photo upload to backend can be done later)
      info.photos.push({ url: ev.target.result });
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
  const info = collectedWords[currentDetailWord];
  if (!info || !info.photos || !info.photos.length) return;
  lightboxPhotos = info.photos.map(p => typeof p === 'object' ? p.url : p);
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
let defSheetCustomDefs = [];

function openDefSheet(word) {
  defSheetWord = word;
  defSheetCustomDefs = [];
  const info = collectedWords[word];

  document.getElementById('dsTitle').textContent = `添加释义 — ${word}`;
  document.getElementById('dsPhonetic').textContent = info ? info.phonetic : '';

  // Build existing definitions list
  const existingDefs = (info && info.selectedDefinitions) ? info.selectedDefinitions : [];
  let listHtml = '';
  existingDefs.forEach(d => {
    listHtml += `<div class="def-sheet-item added">
      <div class="ds-check checked">✓</div>
      <span class="ds-pos grey">${escHtml(d.pos)}</span>
      <span class="ds-def grey">${escHtml(d.def)}</span>
      <span class="ds-status">已添加</span>
    </div>`;
  });

  if (!listHtml) {
    listHtml = '<div style="padding:12px 14px;color:#BBB;font-size:13px;">暂无已收录释义</div>';
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

async function addSheetCustomDef() {
  const pos = document.getElementById('dsCustomPos').value.trim() || 'n.';
  const def = document.getElementById('dsCustomDef').value.trim();
  if (!def) return;
  const info = collectedWords[defSheetWord];
  if (!info) return;

  try {
    // Call backend to add definition
    const result = await WordsAPI.addDefinition(info.id, {
      part_of_speech: posToFull[pos] || pos,
      definition: def,
      is_custom: true,
    });

    // Update local cache
    info.selectedDefinitions.push({
      id: result.id,
      pos: posToAbbr(result.part_of_speech),
      def: result.definition,
      example: '',
      isCustom: true,
      sortOrder: result.sort_order,
    });

    defSheetCustomDefs.push(info.selectedDefinitions[info.selectedDefinitions.length - 1]);
    renderSheetCustomDefs();
    document.getElementById('dsCustomDef').value = '';
    showToast('自定义释义已添加');
  } catch (e) {
    showToast('添加失败，请重试');
    console.error('Add definition failed:', e);
  }
}

function renderSheetCustomDefs() {
  let html = '';
  defSheetCustomDefs.forEach((d, i) => {
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

async function deleteCustomDef(index) {
  const d = defSheetCustomDefs[index];
  if (!d || !d.id) return;
  const info = collectedWords[defSheetWord];
  if (!info) return;

  try {
    await WordsAPI.deleteDefinition(info.id, d.id);
    // Remove from local cache
    const idx = info.selectedDefinitions.findIndex(sd => sd.id === d.id);
    if (idx > -1) info.selectedDefinitions.splice(idx, 1);
    defSheetCustomDefs.splice(index, 1);
    renderSheetCustomDefs();
    showToast('已删除');
  } catch (e) {
    showToast('删除失败');
    console.error('Delete definition failed:', e);
  }
}

function confirmDefSheet() {
  closeDefSheet();
  openWordDetail(defSheetWord); // refresh detail page
}
