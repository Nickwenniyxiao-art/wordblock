// ===================================================================
// WordBlock — Data Layer (替代原 mock 数据)
// ===================================================================

// Parts of speech translation map — API returns English POS, UI may display English abbreviations
const posTranslation = {
  'noun': 'n.', 'verb': 'v.', 'adjective': 'adj.', 'adverb': 'adv.',
  'pronoun': 'pron.', 'preposition': 'prep.', 'conjunction': 'conj.',
  'interjection': 'interj.', 'article': 'art.', 'determiner': 'det.',
  'exclamation': 'interj.', 'abbreviation': 'abbr.'
};

// Reverse map: abbreviation → full English for sending to backend
const posToFull = {
  'n.': 'noun', 'v.': 'verb', 'adj.': 'adjective', 'adv.': 'adverb',
  'pron.': 'pronoun', 'prep.': 'preposition', 'conj.': 'conjunction',
  'interj.': 'interjection', 'art.': 'article', 'det.': 'determiner',
  'abbr.': 'abbreviation'
};

// Convert backend POS to display abbreviation
function posToAbbr(pos) {
  if (!pos) return '';
  const lower = pos.toLowerCase().trim();
  // Already an abbreviation?
  if (lower.endsWith('.')) return pos;
  return posTranslation[lower] || pos;
}

// ===== LIVE DATA STORES (populated from API) =====
// collected words: { [word]: { id, blockNumber, blockId, hitCount, customNote, addedAt, selectedDefinitions: [{id, pos, def, example, isCustom}], photos: [] } }
let collectedWords = {};

// blocks cache: [{ id, blockNumber, totalHitCount, wordCount, isFull }]
let blocksCache = [];

// user profile cache
let currentUser = null;

// current word being searched / operated on
let currentWord = '';
let currentAudioUrl = '';
let currentSelectedDefs = []; // tracks checked definition texts during search
let currentDictResult = null; // last dictionary lookup result

// ===== SETTINGS STATE (synced with backend) =====
let settingsState = {
  sourceLang: 'English',
  targetLang: '中文',
  blockSize: 30,
  dailyGoal: 20,
  reminderEnabled: false,
  reminderTime: '09:00',
  darkMode: false,
  fontSize: '标准',
  pronunciation: '美式',
};

const languageOptions = ['English', '中文', '日本語', '한국어', 'Español', 'Français', 'Deutsch'];

// ===== REVIEW STATE =====
let reviewState = {
  blockNum: null,
  blockId: null,
  sessionId: null,
  words: [],
  currentIndex: 0,
  revealed: false,
  knownCount: 0,
  startTime: null,
};

// ===== DATA LOADING =====
async function loadUserData() {
  try {
    // Load user profile
    currentUser = await AuthAPI.getMe();
    // Sync settings from backend
    settingsState.sourceLang = currentUser.source_lang || 'English';
    settingsState.targetLang = currentUser.target_lang || '中文';
    settingsState.blockSize = currentUser.block_size || 30;
    settingsState.dailyGoal = currentUser.daily_goal || 20;

    // Load collected words
    await refreshCollectedWords();

    // Load blocks
    await refreshBlocks();

    return true;
  } catch (e) {
    console.error('Failed to load user data:', e);
    return false;
  }
}

async function refreshCollectedWords() {
  try {
    const words = await WordsAPI.list('added_at', 'desc', 200, 0);
    collectedWords = {};
    words.forEach(w => {
      collectedWords[w.word] = {
        id: w.id,
        blockNumber: w.block_number,
        blockId: w.block_id,
        hitCount: w.hit_count,
        customNote: w.custom_note || '',
        addedAt: new Date(w.added_at).getTime(),
        selectedDefinitions: (w.definitions || []).map(d => ({
          id: d.id,
          pos: posToAbbr(d.part_of_speech),
          def: d.definition,
          example: d.example || '',
          isCustom: d.is_custom,
          sortOrder: d.sort_order,
        })),
        photos: (w.photos || []).map(p => ({ id: p.id, url: p.photo_url })),
        phonetic: w.phonetic || '',
        audioUrl: w.audio_url || '',
      };
    });
  } catch (e) {
    console.error('Failed to refresh collected words:', e);
  }
}

async function refreshBlocks() {
  try {
    blocksCache = await BlocksAPI.list('block_number');
  } catch (e) {
    console.error('Failed to refresh blocks:', e);
  }
}

// ===== AUTH PAGE =====
function showAuthPage() {
  document.getElementById('authPage').classList.add('open');
  document.getElementById('appMain').style.display = 'none';
  document.querySelector('.tab-bar').style.display = 'none';
}

function hideAuthPage() {
  document.getElementById('authPage').classList.remove('open');
  document.getElementById('appMain').style.display = '';
  document.querySelector('.tab-bar').style.display = '';
}

let authMode = 'login'; // 'login' | 'register'

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  renderAuthPage();
}

function renderAuthPage() {
  const page = document.getElementById('authContent');
  const isLogin = authMode === 'login';

  page.innerHTML = `
    <div class="auth-logo">📚</div>
    <div class="auth-app-name">WordBlock</div>
    <div class="auth-subtitle">${isLogin ? '登录你的账号' : '创建新账号'}</div>

    ${!isLogin ? `
    <div class="auth-field">
      <label class="auth-label">昵称 (可选)</label>
      <input class="auth-input" id="authNickname" type="text" placeholder="你的昵称" autocomplete="off">
    </div>
    ` : ''}

    <div class="auth-field">
      <label class="auth-label">邮箱</label>
      <input class="auth-input" id="authEmail" type="email" placeholder="your@email.com" autocomplete="email">
    </div>

    <div class="auth-field">
      <label class="auth-label">密码</label>
      <input class="auth-input" id="authPassword" type="password" placeholder="${isLogin ? '输入密码' : '至少6位密码'}" autocomplete="${isLogin ? 'current-password' : 'new-password'}">
    </div>

    <div class="auth-error" id="authError"></div>

    <button class="auth-btn" id="authSubmitBtn" onclick="handleAuth()">
      ${isLogin ? '登 录' : '注 册'}
    </button>

    <div class="auth-switch">
      ${isLogin ? '还没有账号？' : '已有账号？'}
      <a href="javascript:void(0)" onclick="toggleAuthMode()">
        ${isLogin ? '立即注册' : '去登录'}
      </a>
    </div>
  `;
}

async function handleAuth() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const errorEl = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmitBtn');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = '请填写邮箱和密码';
    return;
  }

  if (authMode === 'register' && password.length < 6) {
    errorEl.textContent = '密码至少需要6位';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = authMode === 'login' ? '登录中...' : '注册中...';

  try {
    if (authMode === 'login') {
      await AuthAPI.login(email, password);
    } else {
      const nickname = document.getElementById('authNickname')?.value.trim() || '';
      await AuthAPI.register(email, password, nickname);
    }

    // 登录/注册成功 → 加载用户数据
    const loaded = await loadUserData();
    if (loaded) {
      hideAuthPage();
      renderHomepage();
    }
  } catch (e) {
    let msg = '操作失败，请重试';
    if (e.status === 409) msg = '该邮箱已注册，请直接登录';
    else if (e.status === 401) msg = '邮箱或密码错误';
    else if (e.message) msg = e.message;
    errorEl.textContent = msg;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = authMode === 'login' ? '登 录' : '注 册';
  }
}

// ===== APP INIT =====
async function initApp() {
  if (TokenManager.isLoggedIn()) {
    // 有 Token → 尝试加载用户数据
    try {
      const loaded = await loadUserData();
      if (loaded) {
        hideAuthPage();
        renderHomepage();
        return;
      }
    } catch (e) {
      // Token 无效
      TokenManager.clear();
    }
  }
  // 未登录 → 显示登录页
  showAuthPage();
  renderAuthPage();
}
