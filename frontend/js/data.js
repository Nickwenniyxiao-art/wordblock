// ===== MOCK DICTIONARY =====
const mockDictionary = {
  'hello': {
    word: 'hello',
    phonetic: '/həˈloʊ/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-us.mp3',
    meanings: [
      {
        partOfSpeech: 'interj.',
        definitions: [
          { definition: '用于问候或打招呼', example: 'Hello! How are you?' },
          { definition: '用于引起注意或表示惊讶', example: 'Hello? Is anyone there?' }
        ]
      },
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '一声问候', example: 'She gave a warm hello to everyone.' }
        ]
      }
    ]
  },
  'world': {
    word: 'world',
    phonetic: '/wɜːrld/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/world-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '世界，地球', example: 'She traveled around the world.' },
          { definition: '世间所有人类；人类社会', example: 'The whole world watched the game.' },
          { definition: '某一领域或范围', example: 'The world of science is constantly evolving.' }
        ]
      }
    ]
  },
  'apple': {
    word: 'apple',
    phonetic: '/ˈæpəl/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/apple-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '苹果（一种水果）', example: 'She ate an apple for breakfast.' },
          { definition: '苹果树', example: 'The apple tree blooms in spring.' }
        ]
      }
    ]
  },
  'beautiful': {
    word: 'beautiful',
    phonetic: '/ˈbjuːtɪfəl/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/beautiful-us.mp3',
    meanings: [
      {
        partOfSpeech: 'adj.',
        definitions: [
          { definition: '美丽的，漂亮的', example: 'She wore a beautiful dress.' },
          { definition: '令人愉悦的；极好的', example: 'What a beautiful day it is!' }
        ]
      }
    ]
  },
  'language': {
    word: 'language',
    phonetic: '/ˈlæŋɡwɪdʒ/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/language-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '语言（人类交流的系统）', example: 'She speaks three languages fluently.' },
          { definition: '语言风格；措辞', example: 'The report uses formal language.' },
          { definition: '编程语言', example: 'Python is a popular programming language.' }
        ]
      }
    ]
  },
  'book': {
    word: 'book',
    phonetic: '/bʊk/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/book-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '书，书籍', example: 'I read a great book last week.' },
          { definition: '账本；账册', example: 'She kept the company books.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '预订，预约', example: 'I booked a table at the restaurant.' }
        ]
      }
    ]
  },
  'computer': {
    word: 'computer',
    phonetic: '/kəmˈpjuːtər/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/computer-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '电脑，计算机', example: 'She works on her computer all day.' },
          { definition: '电子计算设备', example: 'The computer processes data quickly.' }
        ]
      }
    ]
  },
  'love': {
    word: 'love',
    phonetic: '/lʌv/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/love-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '爱，爱情，爱意', example: 'Their love for each other grew stronger.' },
          { definition: '喜爱，热爱', example: 'Her love of music began in childhood.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '爱，热爱', example: 'I love spending time with my family.' },
          { definition: '非常喜欢', example: 'She loves chocolate ice cream.' }
        ]
      }
    ]
  },
  'happy': {
    word: 'happy',
    phonetic: '/ˈhæpi/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/happy-us.mp3',
    meanings: [
      {
        partOfSpeech: 'adj.',
        definitions: [
          { definition: '快乐的，幸福的，高兴的', example: 'She was happy to see her old friends.' },
          { definition: '乐意的，愿意的', example: 'I\'m happy to help you.' }
        ]
      }
    ]
  },
  'sad': {
    word: 'sad',
    phonetic: '/sæd/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/sad-us.mp3',
    meanings: [
      {
        partOfSpeech: 'adj.',
        definitions: [
          { definition: '悲伤的，难过的', example: 'He felt sad after hearing the news.' },
          { definition: '令人遗憾的；可悲的', example: 'It\'s a sad situation.' }
        ]
      }
    ]
  },
  'time': {
    word: 'time',
    phonetic: '/taɪm/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/time-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '时间', example: 'Time passes quickly when you\'re busy.' },
          { definition: '时刻，时候', example: 'What time is it?' },
          { definition: '次数，回', example: 'I\'ve been there three times.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '为…计时；安排时间', example: 'She timed the race carefully.' }
        ]
      }
    ]
  },
  'water': {
    word: 'water',
    phonetic: '/ˈwɔːtər/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/water-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '水', example: 'Please drink more water every day.' },
          { definition: '水域，水体', example: 'The waters of the Pacific Ocean.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '给…浇水，灌溉', example: 'Don\'t forget to water the plants.' }
        ]
      }
    ]
  },
  'food': {
    word: 'food',
    phonetic: '/fuːd/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/food-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '食物，食品', example: 'Italian food is my favorite.' },
          { definition: '养料；精神食粮', example: 'Books are food for the mind.' }
        ]
      }
    ]
  },
  'music': {
    word: 'music',
    phonetic: '/ˈmjuːzɪk/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/music-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '音乐', example: 'She listens to music every morning.' },
          { definition: '乐谱，乐曲', example: 'Can you read music?' }
        ]
      }
    ]
  },
  'friend': {
    word: 'friend',
    phonetic: '/frɛnd/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/friend-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '朋友，好友', example: 'He\'s been my best friend since childhood.' },
          { definition: '盟友；支持者', example: 'She\'s a friend of the arts.' }
        ]
      }
    ]
  },
  'family': {
    word: 'family',
    phonetic: '/ˈfæməli/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/family-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '家庭，家人', example: 'My family means everything to me.' },
          { definition: '家族；血缘', example: 'The family has lived here for generations.' }
        ]
      },
      {
        partOfSpeech: 'adj.',
        definitions: [
          { definition: '适合家庭的；家庭的', example: 'This is a great family restaurant.' }
        ]
      }
    ]
  },
  'school': {
    word: 'school',
    phonetic: '/skuːl/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/school-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '学校', example: 'The children walk to school together.' },
          { definition: '上课时间，学习阶段', example: 'School starts at 8 AM.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '教导，训练', example: 'She was schooled in classical music.' }
        ]
      }
    ]
  },
  'work': {
    word: 'work',
    phonetic: '/wɜːrk/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/work-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '工作，劳动', example: 'She has a lot of work to do today.' },
          { definition: '作品，著作', example: 'This painting is his greatest work.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '工作，劳动', example: 'He works at a tech company.' },
          { definition: '运转，起作用', example: 'Does this machine work properly?' }
        ]
      }
    ]
  },
  'travel': {
    word: 'travel',
    phonetic: '/ˈtrævəl/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/travel-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '旅行，旅游', example: 'She loves to travel to new places.' },
          { definition: '传播；传送', example: 'News travels fast.' }
        ]
      },
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '旅行，游历', example: 'Travel broadens the mind.' }
        ]
      }
    ]
  },
  'dream': {
    word: 'dream',
    phonetic: '/driːm/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/dream-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '梦，梦境', example: 'I had a strange dream last night.' },
          { definition: '梦想，理想', example: 'Her dream is to become a doctor.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '做梦', example: 'I dreamed about flying through the sky.' },
          { definition: '梦想，幻想', example: 'He dreams of starting his own business.' }
        ]
      }
    ]
  },
  'hope': {
    word: 'hope',
    phonetic: '/hoʊp/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/hope-us.mp3',
    meanings: [
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '希望，期望', example: 'There is still hope for a peaceful solution.' },
          { definition: '有希望的人/事物', example: 'She is the hope of the team.' }
        ]
      },
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '希望，期待', example: 'I hope to see you soon.' }
        ]
      }
    ]
  },
  'think': {
    word: 'think',
    phonetic: '/θɪŋk/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/think-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '思考，想', example: 'Think before you speak.' },
          { definition: '认为，以为', example: 'I think it\'s a great idea.' },
          { definition: '考虑，打算', example: 'Are you thinking of moving abroad?' }
        ]
      }
    ]
  },
  'learn': {
    word: 'learn',
    phonetic: '/lɜːrn/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/learn-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '学习，学会', example: 'She is learning to play the guitar.' },
          { definition: '了解到，得知', example: 'I learned about the accident from the news.' }
        ]
      }
    ]
  },
  'teach': {
    word: 'teach',
    phonetic: '/tiːtʃ/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/teach-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '教，教授', example: 'She teaches English at a high school.' },
          { definition: '使懂得；教训', example: 'Experience teaches us many lessons.' }
        ]
      }
    ]
  },
  'read': {
    word: 'read',
    phonetic: '/riːd/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/read-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '读，阅读', example: 'She reads a book every week.' },
          { definition: '理解，解读', example: 'How do you read this situation?' }
        ]
      }
    ]
  },
  'write': {
    word: 'write',
    phonetic: '/raɪt/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/write-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '写，书写', example: 'Please write your name at the top.' },
          { definition: '写作，创作', example: 'She writes novels in her spare time.' }
        ]
      }
    ]
  },
  'run': {
    word: 'run',
    phonetic: '/rʌn/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/run-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '跑，奔跑', example: 'He runs five kilometers every morning.' },
          { definition: '经营，管理', example: 'She runs her own bakery.' },
          { definition: '运行，运转', example: 'The program runs smoothly.' }
        ]
      },
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '跑，奔跑；短途行程', example: 'Let\'s go for a run in the park.' }
        ]
      }
    ]
  },
  'eat': {
    word: 'eat',
    phonetic: '/iːt/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/eat-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '吃，进食', example: 'We eat dinner together as a family.' },
          { definition: '侵蚀，消耗', example: 'Acid eats away at the metal.' }
        ]
      }
    ]
  },
  'sleep': {
    word: 'sleep',
    phonetic: '/sliːp/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/sleep-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '睡觉，睡眠', example: 'She sleeps eight hours every night.' }
        ]
      },
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '睡眠，睡觉', example: 'He needs more sleep to recover.' }
        ]
      }
    ]
  },
  'play': {
    word: 'play',
    phonetic: '/pleɪ/',
    audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/play-us.mp3',
    meanings: [
      {
        partOfSpeech: 'v.',
        definitions: [
          { definition: '玩耍，游戏', example: 'The children play in the park.' },
          { definition: '演奏（乐器）', example: 'She plays the violin beautifully.' },
          { definition: '参加（体育运动）；比赛', example: 'Do you play basketball?' }
        ]
      },
      {
        partOfSpeech: 'n.',
        definitions: [
          { definition: '游戏，玩耍', example: 'Learning through play is very effective.' },
          { definition: '戏剧，话剧', example: 'We watched a play at the theater.' }
        ]
      }
    ]
  }
};

// Parts of speech translation map for API fallback
const posTranslation = {
  'noun': '名词', 'verb': '动词', 'adjective': '形容词', 'adverb': '副词',
  'pronoun': '代词', 'preposition': '介词', 'conjunction': '连词',
  'interjection': '感叹词', 'article': '冠词', 'determiner': '限定词',
  'exclamation': '感叹词', 'abbreviation': '缩略词'
};

// ===== MOCK DATA =====
const mockCollected = {
  'hello': { blockNumber: 1, hitCount: 5, customNote: '打招呼最常用的词', addedAt: Date.now() - 86400000*4, selectedDefinitions: [{pos: 'interj.', def: '用于问候或打招呼'}], photos: [] },
  'world': { blockNumber: 1, hitCount: 3, customNote: '', addedAt: Date.now() - 86400000*3, selectedDefinitions: [{pos: 'n.', def: '世界，地球'}], photos: [] },
  'apple': { blockNumber: 1, hitCount: 2, customNote: '不只是水果，还是那个公司', addedAt: Date.now() - 86400000*2, selectedDefinitions: [{pos: 'n.', def: '苹果（一种水果）'}], photos: [] },
  'beautiful': { blockNumber: 2, hitCount: 1, customNote: '', addedAt: Date.now() - 86400000, selectedDefinitions: [{pos: 'adj.', def: '美丽的，漂亮的'}], photos: [] },
  'language': { blockNumber: 2, hitCount: 4, customNote: '语言，我正在学的东西', addedAt: Date.now() - 3600000, selectedDefinitions: [{pos: 'n.', def: '语言（人类交流的系统）'}], photos: [] },
};

let currentWord = '';
let currentAudioUrl = '';
let currentSelectedDefs = []; // tracks checked definition texts

// ===== SETTINGS STATE =====
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
  words: [],
  currentIndex: 0,
  revealed: false,
  knownCount: 0,
};

