# PLAN.md — ui-color-variables

## 概览
- **目标**: 全量颜色变量化，66 个文件中所有硬编码颜色值替换为 var() 引用
- **策略**: D-04 基于现有变量扩展，补充缺失的颜色令牌，再逐批替换
- **总文件**: 66 个（css/common.css + 64 pages/*.html + page-index.html）
- **色值规模**: 142 个独立 hex 色值，~3000+ 处引用

## 颜色令牌体系设计

### 现有变量（保留不变）
```css
--primary-start: #ff6034;
--primary-end: #ee0a24;
--price-color: #ee0a24;
--success-color: #52c41a;
--warning-color: #ff9800;
--error-color: #ee0a24;
--text-color: #333;
--text-secondary: #666;
--text-tertiary: #999;
--text-muted: #bbb;
--bg-color: #f5f5f5;
--card-bg: #fff;
--hover-bg: #fafafa;
--selected-bg: #fff5f0;
--border-color: #eee;
```

### 新增变量

#### 文字色扩展
```css
--text-dark: #222;        /* 深黑文字 (18 uses) */
--text-light: #ccc;       /* 浅灰文字 (60 uses) */
--text-placeholder: #bbb; /* = --text-muted, 统一 */
--text-disabled: #ddd;    /* 禁用态 (105 uses, 同时用作边框) */
```

#### 边框色扩展
```css
--border-light: #f5f5f5;  /* 轻边框/分割线 */
--border-divider: #f0f0f0;/* 列表分割线 */
```

#### 背景色扩展
```css
--bg-dark: #ededed;       /* 深灰背景（body 外框） */
--bg-input: #f8f8f8;      /* 输入框/图片占位背景 */
--bg-light: #f9f9f9;      /* 极浅灰背景 */
```

#### 功能色扩展
```css
--success-dark: #2e7d32;  /* 深绿（成功态深色） */
--success-light: #07c160; /* 微信绿 */
--success-bg: #e8f5e9;    /* 成功背景 */
--warning-light: #ffa726; /* 浅橙（警告态） */
--warning-dark: #f57c00;  /* 深橙（警告态深色） */
--warning-bg: #fff3e0;    /* 警告背景 */
--error-light: #f44336;   /* 红色变体 */
--info-color: #2196f3;    /* 信息蓝 */
--info-light: #1677ff;    /* 信息蓝变体 */
--info-bg: #e3f2fd;       /* 信息背景 */
```

#### 品牌特殊色
```css
--wechat-green: #07c160;  /* 微信绿 */
--vip-gold: #d4af37;      /* VIP 金色 */
--vip-gold-light: #ffd56a;/* VIP 浅金 */
--orange-gradient-start: #ffa726; /* 渐变起始橙 */
--orange-gradient-end: #ff9800;   /* 渐变终止橙 */
```

### 替换映射规则

#### 高频色值（>100 次，直接映射）
| hex 值 | 次数 | → 变量 | 说明 |
|--------|------|--------|------|
| #fff | 526 | var(--card-bg) | 白色/卡片背景 |
| #ff6034 | 386 | var(--primary-start) | 主色 |
| #333 | 324 | var(--text-color) | 正文文字 |
| #999 | 256 | var(--text-tertiary) | 辅助文字 |
| #ee0a24 | 205 | var(--primary-end) / var(--error-color) | 主色深/错误色 |
| #f5f5f5 | 153 | var(--bg-color) / var(--border-light) | 页面背景/轻边框 |
| #666 | 150 | var(--text-secondary) | 次要文字 |
| #ddd | 105 | var(--text-disabled) | 禁用文字/边框 |
| #bbb | 70 | var(--text-muted) | 弱化文字 |
| #eee | 69 | var(--border-color) | 边框 |

#### 中频色值（10~100 次，按上下文映射）
| hex 值 | 次数 | → 变量 | 说明 |
|--------|------|--------|------|
| #ccc | 60 | var(--text-light) | 浅灰文字/禁用态 |
| #f8f8f8 | 57 | var(--bg-input) | 输入框/占位背景 |
| #fafafa | 53 | var(--hover-bg) | 悬停背景 |
| #fff5f0 | 41 | var(--selected-bg) | 选中背景 |
| #f0f0f0 | 41 | var(--border-divider) | 分割线 |
| #ff9800 | 40 | var(--warning-color) | 警告色 |
| #4caf50 | 36 | var(--success-color) | 成功色变体 → 统一为 --success-color |
| #07c160 | 25 | var(--wechat-green) | 微信绿 |
| #222 | 18 | var(--text-dark) | 深黑文字 |
| #2196f3 | 13 | var(--info-color) | 信息蓝 |
| #2e7d32 | 11 | var(--success-dark) | 深绿 |

#### 低频色值（<10 次）
低频色值按色系归入已有变量或新增少量语义变量。出现 1~2 次的极低频色值（如 #fffbe6 提示背景）新增语义变量。

### 上下文敏感替换

部分颜色需根据上下文决定映射：
- `#ee0a24` 在价格/错误中 → `var(--error-color)` / `var(--price-color)`
- `#ee0a24` 在主色/渐变中 → `var(--primary-end)`
- `#f5f5f5` 在 background 中 → `var(--bg-color)`
- `#f5f5f5` 在 border 中 → `var(--border-light)`
- `#fff` 在 background 中 → `var(--card-bg)`
- `#fff` 在 color 中（白色文字） → `var(--card-bg)` 或保持 `#fff`

### 不替换的颜色
- `gradient` 中的中间色值（如 `linear-gradient(135deg, var(--primary-start), var(--primary-end))` 已变量化）
- SVG `fill`/`stroke` 内的颜色（SVG 是图标，不属于设计令牌）
- 内联 JS 中极低频的动态颜色

---

## 任务 1: common.css 颜色令牌扩展

### 编号
T-01

### 描述
在 common.css `:root` 中新增颜色令牌变量，并将组件类中所有硬编码颜色值替换为 var() 引用。

### 文件
- `css/common.css`

### 具体操作

1. 在 `:root` 中新增上述「新增变量」列表中的所有变量
2. 将组件类中硬编码颜色替换为 var() 引用

### 完成标准
- common.css `:root` 包含完整的颜色令牌体系
- 组件类零硬编码颜色值

### 依赖
无（首个任务）

---

## 任务 2: 一级页面颜色变量化

### 编号
T-02

### 描述
将首页、分类、购物车、我的 4 个一级页面的硬编码颜色替换为 var() 引用。

### 文件
- `pages/home_page.html`
- `pages/category.html`
- `pages/cart.html`
- `pages/profile.html`

### 替换规则
按上述映射表替换，注意上下文敏感色值。

### 完成标准
- 4 个页面中无硬编码颜色值（除 SVG 图标内色值）

### 依赖
T-01

---

## 任务 3: 二级页面颜色变量化（20 页）

### 编号
T-03

### 文件
同 ui-style-refresh T-03 的 20 个二级页面

### 依赖
T-01

---

## 任务 4: 三级页面颜色变量化（37 页）

### 编号
T-04

### 文件
同 ui-style-refresh T-04 的 37 个三级页面

### 依赖
T-01

---

## 任务 5: 辅助页面 + page-index 颜色变量化

### 编号
T-05

### 文件
同 ui-style-refresh T-05

### 依赖
T-01

---

## 执行策略

与 ui-style-refresh 相同：
- **Wave 1**: T-01（common.css 颜色令牌扩展）
- **Wave 2**: T-02~T-05（可并行）

### 替换方法
使用 sed 批量替换为主，Edit 精确替换为辅：
1. 先按固定映射表做 sed 全量替换（覆盖 ~85% 的色值）
2. 再逐文件检查上下文敏感色值，手动修正
3. 最后验证无遗漏

### 风险点
- `#fff` 用量最大（526 次），需区分 background 和 color 上下文
- `#f5f5f5` 同时用于 background 和 border，需分上下文替换
- `#ee0a24` 同时是主色和错误色，需语义区分
- 低频色值（142 个中约 80 个只出现 1~3 次），需逐一确认映射
