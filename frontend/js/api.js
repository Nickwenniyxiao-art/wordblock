// ===================================================================
// WordBlock API Client — 封装所有后端请求 + Token 自动管理
// ===================================================================

const API_BASE = 'http://66.94.127.117:8082/api/v1';

// ===== TOKEN 管理 =====
const TokenManager = {
  getAccess()  { return localStorage.getItem('wb_access_token'); },
  getRefresh() { return localStorage.getItem('wb_refresh_token'); },
  save(access, refresh) {
    localStorage.setItem('wb_access_token', access);
    localStorage.setItem('wb_refresh_token', refresh);
  },
  clear() {
    localStorage.removeItem('wb_access_token');
    localStorage.removeItem('wb_refresh_token');
  },
  isLoggedIn() {
    return !!this.getAccess();
  }
};

// ===== 通用请求方法 =====
async function apiRequest(path, options = {}) {
  const url = API_BASE + path;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  // 自动附加 Token
  const token = TokenManager.getAccess();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const config = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  let resp = await fetch(url, config);

  // Token 过期 → 尝试刷新
  if (resp.status === 401 && TokenManager.getRefresh()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = 'Bearer ' + TokenManager.getAccess();
      resp = await fetch(url, { ...config, headers });
    } else {
      // 刷新失败 → 清除登录态，跳到登录页
      TokenManager.clear();
      showAuthPage();
      throw new Error('SESSION_EXPIRED');
    }
  }

  if (!resp.ok) {
    const errBody = await resp.json().catch(_e => ({}));
    const err = new Error(errBody.detail || `API Error ${resp.status}`);
    err.status = resp.status;
    err.body = errBody;
    throw err;
  }

  return resp.json();
}

async function refreshAccessToken() {
  try {
    const resp = await fetch(API_BASE + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: TokenManager.getRefresh() }),
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    TokenManager.save(data.access_token, data.refresh_token);
    return true;
  } catch (_e) {
    return false;
  }
}

// ===== AUTH API =====
const AuthAPI = {
  async register(email, password, nickname) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { email, password, nickname: nickname || undefined },
    });
    TokenManager.save(data.access_token, data.refresh_token);
    return data;
  },

  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    TokenManager.save(data.access_token, data.refresh_token);
    return data;
  },

  async getMe() {
    return apiRequest('/auth/me');
  },

  async logout() {
    const refresh = TokenManager.getRefresh();
    if (refresh) {
      try {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refresh_token: refresh },
        });
      } catch (_e) { /* ignore */ }
    }
    TokenManager.clear();
  }
};

// ===== DICTIONARY API =====
const DictionaryAPI = {
  async lookup(word) {
    return apiRequest('/dictionary/lookup/' + encodeURIComponent(word));
  }
};

// ===== WORDS API =====
const WordsAPI = {
  async collect(wordData) {
    // wordData: { word, phonetic, audio_url, custom_note, definitions: [{part_of_speech, definition, example, is_custom}] }
    return apiRequest('/words/collect', {
      method: 'POST',
      body: wordData,
    });
  },

  async list(sortBy = 'added_at', sortOrder = 'desc', limit = 200, offset = 0) {
    return apiRequest(`/words/list?sort_by=${sortBy}&sort_order=${sortOrder}&limit=${limit}&offset=${offset}`);
  },

  async search(word) {
    return apiRequest('/words/search/' + encodeURIComponent(word));
  },

  async update(wordId, data) {
    // data: { custom_note }
    return apiRequest('/words/' + wordId, {
      method: 'PATCH',
      body: data,
    });
  },

  async remove(wordId) {
    return apiRequest('/words/' + wordId, { method: 'DELETE' });
  },

  async addDefinition(wordId, def) {
    // def: { part_of_speech, definition, example, is_custom }
    return apiRequest(`/words/${wordId}/definitions`, {
      method: 'POST',
      body: def,
    });
  },

  async deleteDefinition(wordId, defId) {
    return apiRequest(`/words/${wordId}/definitions/${defId}`, { method: 'DELETE' });
  },

  async getStats() {
    return apiRequest('/words/stats');
  }
};

// ===== BLOCKS API =====
const BlocksAPI = {
  async list(sortBy = 'block_number') {
    return apiRequest('/blocks/list?sort_by=' + sortBy);
  },

  async getDetail(blockId) {
    return apiRequest('/blocks/' + blockId);
  }
};

// ===== STUDY API =====
const StudyAPI = {
  async start(blockId, studyType = 'review') {
    return apiRequest('/study/start', {
      method: 'POST',
      body: { block_id: blockId, study_type: studyType },
    });
  },

  async complete(sessionId, wordsStudied, correctCount, durationSeconds) {
    return apiRequest(`/study/${sessionId}/complete`, {
      method: 'PATCH',
      body: { words_studied: wordsStudied, correct_count: correctCount, duration_seconds: durationSeconds },
    });
  },

  async history(limit = 20) {
    return apiRequest('/study/history?limit=' + limit);
  }
};

// ===== USER SETTINGS API =====
const UserAPI = {
  async updateSettings(data) {
    // data: { nickname, source_lang, target_lang, block_size, daily_goal }
    return apiRequest('/user/settings', {
      method: 'PATCH',
      body: data,
    });
  }
};
