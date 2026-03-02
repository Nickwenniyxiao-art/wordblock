# WordBlock · 背单词App

> 基于 Block 机制的英语词汇学习应用

---

## 项目简介

WordBlock 是一款专为中文用户设计的英语词汇学习应用。通过独特的 **Block 分组机制**，将收录的单词自动分组管理，配合查词、生词本、复习三大核心功能，让背单词变得高效而有趣。

---

## 功能特性

### 🔍 查词（Search）
- 输入英文单词即可快速查词
- 支持本地词典（内置常用词汇）+ 在线词典 API 双重查词
- 勾选你需要的释义，不必记住所有含义
- 支持拍照 / 上传图片，绑定单词使用场景
- 每日一词推荐，扩大词汇量
- 最近收录单词快速回顾

### 📒 生词本（Word Book）
- 查看所有已收录单词
- 支持按查询次数、收录时间、字母顺序排序
- 关键词搜索筛选
- 点击单词进入详情页，查看完整释义、自定义笔记、场景图片
- 支持新增词典释义或自定义释义
- 图片场景库（灯箱查看）

### 📖 学习（Study with Block System）
- 单词自动按 Block 分组（默认每组 30 个词）
- 以词块为单位进行闪卡复习
- 标记"认识 / 不认识"，系统记录复习热度
- 浏览词块内所有单词
- 学习统计：总词块数、总词汇量

### ⚙️ 设置（Settings）
- 语言对设置（源语言 → 目标语言）
- 每日学习目标调整
- 词块大小自定义
- 学习提醒（定时通知）
- 发音偏好切换（美式 / 英式）
- 深色模式（开发中）
- 数据备份与隐私管理

---

## 技术栈

### 当前阶段：MVP 前端原型
| 技术 | 说明 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 样式与动画（响应式，移动优先） |
| Vanilla JavaScript | 交互逻辑，无框架依赖 |
| Google Fonts | Inter + Noto Sans SC 字体 |
| Free Dictionary API | 在线查词回退方案 |

### 后续技术规划
| 层级 | 技术选型 |
|------|---------|
| 移动端 | React Native 或 Flutter |
| 后端 | Node.js（Express / Fastify） |
| 数据库 | PostgreSQL |
| 云同步 | 跨设备数据实时同步 |

---

## 项目结构

```
wordblock/
├── frontend/
│   └── index.html      # MVP 前端单页应用（全部逻辑含于此文件）
├── README.md           # 项目说明文档
└── .gitignore          # Git 忽略配置
```

---

## 快速开始

该项目为纯静态前端原型，无需任何构建工具：

1. 克隆仓库
```bash
git clone https://github.com/Nickwenniyxiao-art/wordblock.git
cd wordblock
```

2. 直接用浏览器打开 `frontend/index.html`，或使用本地服务器：
```bash
# 使用 Python 启动本地服务器
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080/frontend/
```

---

## 开发路线图

- [x] MVP 前端交互原型（查词 / 生词本 / Block 复习 / 设置）
- [x] 本地模拟词典 + 在线 API 查词
- [x] Block 分组机制与闪卡复习模式
- [x] 自定义释义与场景图片
- [ ] 后端 API 开发（Node.js + PostgreSQL）
- [ ] 用户账号系统
- [ ] 云端数据同步
- [ ] React Native / Flutter 移动端
- [ ] 智能记忆算法（间隔重复）
- [ ] 词汇统计与学习报告

---

## 项目状态

**当前阶段：MVP 前端原型**

本仓库包含 WordBlock 的前端交互原型，所有功能均在单个 HTML 文件中实现，使用 Mock 数据模拟后端行为。适合产品验证和用户体验测试。

---

## License

MIT
