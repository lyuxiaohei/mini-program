# 苏银豆商城原型 — UI 设计系统文档

## 1. 架构概览

```
mini-program/
├── css/
│   └── common.css          ← 全局设计系统（变量 + 组件类 + 主题）
├── js/
│   ├── auth.js             ← Mock 账号认证系统
│   ├── auth-guard.js       ← 登录守卫（未登录跳转 login.html）
│   ├── common.js           ← 导航/返回按钮逻辑
│   ├── theme-switcher.js   ← 主题切换（红橙/绿色）
│   └── movie_pass_cards.js ← 电影次卡 Mock 数据
├── pages/
│   └── *.html              ← 65 个原型页面
└── page-index.html         ← 导航首页（独立样式，不引用 common.css）
```

所有页面基于 `file://` 协议运行，纯静态 HTML/CSS/JS，无构建工具。

---

## 2. 页面骨架结构

每个页面遵循统一的 HTML 结构：

```html
<body>
  <div class="phone-frame">                <!-- 375px 模拟器画框 -->

    <!-- 顶部区域（sticky） -->
    <div class="sub-nav">                   <!-- 或 .header-area / .search-header -->
      <div class="status-bar">              <!-- 状态栏：时间 + 图标 -->
        <span class="time">09:41</span>
        <div class="icons">...</div>
      </div>
      <div class="nav-bar">                 <!-- 导航栏：返回键 + 标题 + 胶囊按钮 -->
        <div class="back-btn">...</div>
        <span class="nav-title">页面标题</span>
        <div class="capsule-btn">...</div>
      </div>
    </div>

    <!-- 可滚动内容区 -->
    <div class="page-scroll">
      <!-- 页面具体内容 -->
    </div>

    <!-- 底部 Tab 栏（仅一级页面） -->
    <div class="tab-bar">
      <a class="tab-item">首页</a>
      <a class="tab-item">分类</a>
      <a class="tab-item">购物车</a>
      <a class="tab-item">我的</a>
    </div>

  </div>
  <script src="../js/common.js"></script>
  <script src="../js/theme-switcher.js"></script>
</body>
```

**布局层级**：`body > .phone-frame > (顶部sticky) + (.page-scroll) + (.tab-bar absolute)`

---

## 3. CSS 变量体系（设计令牌）

全部定义在 `css/common.css` 的 `:root` 中，共 7 组 55+ 个变量：

### 3.1 主色与功能色

| 变量 | 默认值（红橙） | 用途 |
|------|---------------|------|
| `--primary-start` | `#ff6034` | 渐变起始色、链接色、选中态 |
| `--primary-end` | `#ee0a24` | 渐变终止色、主色深 |
| `--price-color` | `#ee0a24` | 价格文字 |
| `--error-color` | `#ee0a24` | 错误态 |
| `--success-color` | `#52c41a` | 成功态 |
| `--warning-color` | `#ff9800` | 警告态 |
| `--info-color` | `#2196f3` | 信息态 |

扩展色：`--success-dark` / `--success-light` / `--success-bg`、`--warning-light` / `--warning-dark` / `--warning-bg`、`--error-light`、`--info-light` / `--info-bg`

品牌色：`--wechat-green: #07c160`、`--vip-gold: #d4af37`、`--vip-gold-light: #ffd56a`

### 3.2 文字色（7 级灰度）

| 变量 | 值 | 语义 |
|------|----|------|
| `--text-dark` | `#222` | 深黑标题 |
| `--text-color` | `#333` | 正文主色 |
| `--text-secondary` | `#666` | 次要信息 |
| `--text-tertiary` | `#999` | 辅助文字 |
| `--text-muted` | `#bbb` | 弱化/占位 |
| `--text-light` | `#ccc` | 极浅灰 |
| `--text-disabled` | `#ddd` | 禁用态 |

### 3.3 背景色（7 级）

| 变量 | 值 | 用途 |
|------|----|------|
| `--card-bg` | `#fff` | 卡片/白色背景 |
| `--bg-light` | `#f9f9f9` | 极浅灰背景 |
| `--hover-bg` | `#fafafa` | 悬停态背景 |
| `--bg-input` | `#f8f8f8` | 输入框/图片占位 |
| `--bg-color` | `#f5f5f5` | 页面主背景 |
| `--bg-dark` | `#ededed` | 外框深灰 |
| `--selected-bg` | `#fff5f0` | 选中/高亮背景 |

### 3.4 边框色

`--border-color: #eee` / `--border-light: #f5f5f5` / `--border-divider: #f0f0f0`

### 3.5 圆角（5 级，4px 递增）

`--radius-xs: 4px`（标签）→ `--radius-sm: 8px`（按钮）→ `--radius-md: 12px`（卡片）→ `--radius-lg: 16px`（弹窗）→ `--radius-xl: 24px`（头像/大按钮）

### 3.6 间距（6 级，4px 递增）

`--space-xs: 4px` → `--space-sm: 8px` → `--space-md: 12px` → `--space-lg: 16px` → `--space-xl: 24px` → `--space-2xl: 32px`

### 3.7 字号（7 级）

`--font-xs: 10px`（辅助）→ `--font-sm: 12px`（次要）→ `--font-base: 14px`（正文）→ `--font-md: 16px`（小标题）→ `--font-lg: 18px`（标题）→ `--font-xl: 20px`（大标题）→ `--font-2xl: 24px`（页面标题）

### 3.8 阴影（3 级）

`--shadow-sm` / `--shadow-md` / `--shadow-lg`

---

## 4. 主题系统

### 4.1 切换机制

通过 CSS class 切换，定义在 `css/common.css` 底部：

```css
/* 默认主题（红橙）无 class，直接使用 :root 变量 */

.phone-frame.theme-green,
.theme-green {
  --primary-start: #07c160;
  --primary-end: #059c4e;
  --price-color: #059c4e;
  --selected-bg: #e8f5e9;
  /* ...覆盖 15 个变量 */
}
```

### 4.2 主题切换器（`js/theme-switcher.js`）

- 页面右上角显示两个圆形色块按钮（红/绿）
- 点击切换 `.phone-frame` 上的 CSS class
- 选择保存到 `localStorage('mall-theme')`，跨页面持久化
- 兼容 `page-index.html`（无 `.phone-frame` 时回退到 `<html>` 元素）

### 4.3 色板对照

| 变量 | 红橙（默认） | 绿色 |
|------|-------------|------|
| `--primary-start` | `#ff6034` | `#07c160` |
| `--primary-end` | `#ee0a24` | `#059c4e` |
| `--price-color` | `#ee0a24` | `#059c4e` |
| `--selected-bg` | `#fff5f0` | `#e8f5e9` |
| `--success-color` | `#52c41a` | `#07c160` |
| `--orange-gradient-start` | `#ffa726` | `#34b870` |
| 警告/错误色 | 保持不变 | 保持不变 |

### 4.4 新增主题步骤

1. 在 `css/common.css` 添加 `.theme-xxx` class 覆盖变量
2. 在 `.theme-switcher .theme-btn[data-theme="xxx"]` 添加按钮渐变样式
3. 在 `js/theme-switcher.js` 的 `THEMES` 数组追加 `'xxx'`
4. 在 `page-index.html` 的 `<style>` 中同步添加 `.theme-xxx`

---

## 5. 公共组件类

| 类名 | 用途 | 关键样式 |
|------|------|---------|
| `.phone-frame` | 375px 模拟器 | `width: 375px; position: relative; background: var(--bg-color)` |
| `.page-scroll` | 可滚动内容 | `overflow-y: auto; padding-bottom: var(--content-padding-bottom)` |
| `.status-bar` | 状态栏 | `position: absolute; height: 44px; color: var(--card-bg)` |
| `.status-bar.dark` | 深色状态栏 | `color: var(--text-color)` |
| `.sub-nav` / `.header-area` / `.search-header` | 顶部容器 | `position: sticky; top: 0; z-index: 100; padding-top: 44px` |
| `.nav-bar` | 导航栏 | `height: 44px; display: flex; align-items: center` |
| `.nav-title` | 页面标题 | `font-size: var(--font-lg); font-weight: 600` |
| `.back-btn` | 返回按钮 | `position: absolute; left: var(--space-md)` |
| `.capsule-btn` | 微信胶囊按钮 | `position: absolute; right: var(--space-sm)` |
| `.tab-bar` | 底部导航 | `position: absolute; bottom: 0; height: 56px` |
| `.tab-item` | 导航项 | `flex-direction: column; font-size: var(--font-xs)` |
| `.section-header` | 区块标题 | `display: flex; justify-content: space-between` |
| `.product-grid` | 商品网格 | `grid-template-columns: 1fr 1fr; gap: var(--space-sm)` |
| `.product-card` | 商品卡片 | `border-radius: var(--radius-sm); overflow: hidden` |
| `.card` | 通用卡片 | `border-radius: var(--radius-md); margin: var(--space-md)` |
| `.btn-primary` | 主按钮 | `background: linear-gradient(...); border-radius: var(--radius-xl)` |

---

## 6. Mock 认证系统

### 6.1 测试账号

| 手机号 | 姓名 | 微信绑定 |
|--------|------|---------|
| 13800001111 | 张三 | 已绑定 |
| 13800002222 | 李四 | 未绑定 |
| 13800003333 | （自动注册） | — |

### 6.2 核心 API（`window.Auth`）

| 方法 | 说明 |
|------|------|
| `loginWithPhone(phone)` | 手机号登录（未注册自动注册） |
| `loginWithWeChat()` | 微信登录（创建临时会话） |
| `bindPhoneToWeChat(phone)` | 微信绑定手机号 |
| `getCurrentUser()` | 获取当前用户 |
| `isLoggedIn()` | 是否已登录 |
| `logout()` | 退出登录 |
| `resetAccounts()` | 重置所有数据（测试用） |

### 6.3 登录守卫（`js/auth-guard.js`）

页面引入后，未登录自动跳转 `login.html`。需要登录的页面在 `<script>` 中引入此文件。

---

## 7. 页面分级

| 级别 | 入口 | 页面数 |
|------|------|--------|
| 一级 | 底部 Tab 栏常驻 | 4（首页/分类/购物车/我的） |
| 二级 | 从一级页面进入 | 20（搜索/商品/订单/积分/卡券等） |
| 三级 | 从二级页面进入 | 37（登录/地址/支付/售后/评价等） |
| 辅助 | 独立入口 | 4（客服/帮助/反馈/关于） |

---

## 8. 设计约束

- **兼容 `file://` 协议**：无 ES modules、无构建步骤
- **375px 画框**：模拟微信小程序 viewport
- **所有页面引用 `common.css`**（除 `page-index.html` 有独立样式）
- **所有颜色值已 var() 化**：零硬编码 hex 色值
- **所有间距/圆角/字号/阴影已 var() 化**：零硬编码 px 值
- **SVG 图标**：内联 SVG，`fill`/`stroke` 使用 `currentColor` 或硬编码值（不属于设计令牌）
