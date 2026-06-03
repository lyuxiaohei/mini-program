# PLAN.md — ui-style-refresh

## 概览
- **目标**: 统一全部 65 个文件的间距、圆角、字号、阴影，以 common.css 设计系统变量为核心驱动
- **策略**: D-04 — 先重构 common.css 变量体系 + 组件类规范化，再逐批替换页面硬编码值
- **总文件**: 66 个（css/common.css + 64 pages/*.html + page-index.html）
- **硬编码规模**: ~1021 处 font-size、~510 处 border-radius、~47 处内联 border-radius

---

## 任务 1: common.css 设计系统重构

### 编号
T-01

### 描述
重构 `css/common.css`，建立完整的 CSS 变量体系并将现有组件类中所有硬编码值替换为 var() 引用。

### 文件
- `css/common.css`（唯一修改文件）

### 具体操作

#### A. 扩展 :root 变量定义

在现有变量之后新增 4 组设计令牌变量（保留现有颜色/布局变量不动）:

**Spacing — 新增 6 个变量:**
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
```

**Border Radius — 替换现有 4 个 + 新增 1 个:**
```css
/* 删除旧变量: --border-radius, --border-radius-sm, --border-radius-lg, --btn-radius */
/* 替换为: */
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
```
注意: 旧变量 `--border-radius`(12px)→`--radius-md`，`--border-radius-sm`(10px)→`--radius-sm`(8px，需调整)，`--border-radius-lg`(16px)→`--radius-lg`，`--btn-radius`(22px)→`--radius-xl`(24px，需调整)

**Font Size — 新增 7 个变量:**
```css
--font-xs: 10px;
--font-sm: 12px;
--font-base: 14px;
--font-md: 16px;
--font-lg: 18px;
--font-xl: 20px;
--font-2xl: 24px;
```

**Box Shadow — 新增 3 个变量:**
```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 2px 8px rgba(0,0,0,0.08);
--shadow-lg: 0 4px 12px rgba(0,0,0,0.12);
```

#### B. 组件类硬编码值 → var() 替换映射

以下是 common.css 内各组件类需替换的清单:

| 组件/选择器 | 属性 | 旧值 | 新值 |
|---|---|---|---|
| `body` | font-size: 16px | → 删除(由 --font-md 驱动 html) |
| `html` | font-size: 16px | → 16px 保留(rem 基准，不改) |
| `.status-bar` | height: 44px | → var(--status-bar-height) |
| `.status-bar` | padding: 14px 20px 0 | → 14px var(--space-xl) 0 |
| `.status-bar` | font-size: 12px | → var(--font-sm) |
| `.status-bar .time` | font-size: 15px | → var(--font-md) (15→16，收敛) |
| `.status-bar .icons` | gap: 4px | → var(--space-xs) |
| `.page-scroll` | padding-bottom: 60px | → var(--content-padding-bottom) |
| `.sub-nav/.header-area/.search-header` | padding-top: 44px | → var(--status-bar-height) |
| `.nav-bar` | height: 44px | → var(--nav-bar-height) |
| `.nav-title` | font-size: 17px | → var(--font-lg) (17→18，收敛) |
| `.back-btn` | left: 12px | → var(--space-md) |
| `.back-btn` | width/height: 32px | → 保留(布局尺寸，非设计令牌) |
| `.capsule-btn` | right: 8px | → var(--space-sm) |
| `.tab-bar` | height: 56px | → var(--tab-bar-height) |
| `.tab-bar` | padding-bottom: 8px | → var(--space-sm) |
| `.tab-item` | gap: 2px | → 2px 保留(太小，不在令牌体系) |
| `.tab-item` | padding: 4px 10px | → var(--space-xs) var(--space-sm) (10→8，收敛) |
| `.tab-item` | font-size: 10px | → var(--font-xs) |
| `.tab-item.active` | font-weight: 600 | → 保留 |
| `.tab-item .badge` | font-size: 9px | → var(--font-xs) (9→10，收敛) |
| `.tab-item .badge` | border-radius: 7px | → var(--radius-sm) (7→8，收敛) |
| `.section-header` | padding: 12px 12px 8px | → var(--space-md) var(--space-md) var(--space-sm) |
| `.section-header .left` | gap: 6px | → var(--space-xs) (6→4，收敛) |
| `.section-header .title` | font-size: 15px | → var(--font-md) (15→16，收敛) |
| `.section-header .more` | font-size: 11px | → var(--font-sm) (11→12，收敛) |
| `.section-header .more` | gap: 2px | → 2px 保留 |
| `.product-grid` | gap: 8px | → var(--space-sm) |
| `.product-card` | border-radius: 10px | → var(--radius-sm) (10→8，收敛) |
| `.product-card .product-info` | padding: 8px | → var(--space-sm) |
| `.product-card .product-name` | font-size: 12px | → var(--font-sm) |
| `.product-card .product-name` | margin-bottom: 4px | → var(--space-xs) |
| `.product-card .product-name` | min-height: 34px | → 保留(由行高和行数决定) |
| `.product-card .product-tags` | gap: 4px | → var(--space-xs) |
| `.product-card .product-tags` | margin-bottom: 4px | → var(--space-xs) |
| `.product-card .tag` | font-size: 9px | → var(--font-xs) (9→10，收敛) |
| `.product-card .tag` | padding: 1px 4px | → 1px var(--space-xs) |
| `.product-card .tag` | border-radius: 3px | → var(--radius-xs) (3→4，收敛) |
| `.product-card .product-bottom` | padding: 0 8px 8px | → 0 var(--space-sm) var(--space-sm) |
| `.product-card .price-now` | font-size: 15px | → var(--font-md) (15→16，收敛) |
| `.product-card .price-now .symbol` | font-size: 10px | → var(--font-xs) |
| `.product-card .price-old` | font-size: 10px | → var(--font-xs) |
| `.product-card .sold` | font-size: 9px | → var(--font-xs) (9→10，收敛) |
| `.card` | border-radius: 12px | → var(--radius-md) |
| `.card` | margin: 12px | → var(--space-md) |
| `.btn-primary` | border-radius: 22px | → var(--radius-xl) (22→24，收敛) |
| `.btn-primary` | padding: 10px 24px | → var(--space-sm) var(--space-xl) (10→8，收敛) |
| `.btn-primary` | font-size: 14px | → var(--font-base) |

#### C. 数值收敛调整清单

以下值在替换为 var() 引用时会发生实际视觉变化（收敛到最近令牌档位）:

| 维度 | 旧值 | 收敛到 | 视觉影响 |
|------|------|--------|----------|
| radius | 3px → 4px | --radius-xs | 微增，不明显 |
| radius | 7px → 8px | --radius-sm | 微增 |
| radius | 10px → 8px | --radius-sm | 微减，卡片角稍锐 |
| radius | 22px → 24px | --radius-xl | 微增，按钮更圆 |
| font | 9px → 10px | --font-xs | 微增 |
| font | 11px → 12px | --font-sm | 微增 |
| font | 15px → 16px | --font-md | 增加 1px |
| font | 17px → 18px | --font-lg | 增加 1px |
| spacing | 6px → 4px | --space-xs | 减小 2px |
| spacing | 10px → 8px | --space-sm | 减小 2px |

### 验证
- 在浏览器中打开任意页面，确认:
  1. 页面布局未崩溃（phone-frame、nav-bar、tab-bar 位置正确）
  2. 所有 CSS 变量在 DevTools 中可解析（无未定义变量警告）
  3. 产品卡片、按钮、section-header 的间距/圆角/字号与预期一致
- 命令检查:
  - common.css 中所有旧变量名(--border-radius, --border-radius-sm, --border-radius-lg, --btn-radius)已删除
  - 所有组件类中的硬编码 px 值已替换为 var() 引用

### 完成标准
- common.css 的 :root 包含完整的 4 组设计令牌（space 6 个、radius 5 个、font 7 个、shadow 3 个）
- common.css 内部组件类零硬编码间距/圆角/字号值
- 任意页面引用 common.css 后视觉无回归

### 依赖
无（首个任务）

---

## 任务 2: 一级页面样式规范化

### 编号
T-02

### 描述
将首页、分类、购物车、我的 4 个一级页面的页内 `<style>` 块和内联 `style=` 中的硬编码间距、圆角、字号、阴影值替换为 common.css 变量引用。

### 文件
- `pages/home_page.html`
- `pages/category.html`
- `pages/cart.html`
- `pages/profile.html`

### 替换规则（适用于任务 2-5 的通用模式）

#### font-size 替换映射
| 硬编码值 | → 变量 | 说明 |
|----------|--------|------|
| 9px, 10px | var(--font-xs) | 辅助文字 |
| 11px, 12px, 13px | var(--font-sm) | 次要文字 |
| 14px | var(--font-base) | 正文 |
| 15px, 16px | var(--font-md) | 小标题 |
| 17px, 18px | var(--font-lg) | 卡片标题 |
| 19px, 20px | var(--font-xl) | 区块标题 |
| 21px, 22px, 24px | var(--font-2xl) | 页面标题 |

#### border-radius 替换映射
| 硬编码值 | → 变量 | 说明 |
|----------|--------|------|
| 2px, 3px, 4px | var(--radius-xs) | 标签、徽章 |
| 5px, 6px, 7px, 8px | var(--radius-sm) | 按钮、输入框 |
| 9px, 10px, 12px | var(--radius-md) | 卡片、列表项 |
| 14px, 15px, 16px | var(--radius-lg) | 大卡片、弹窗 |
| 18px, 20px, 22px, 24px, 50% | var(--radius-xl) / 50% | 头像、浮动按钮 |

#### spacing 替换映射（margin/padding/gap）
| 硬编码值 | → 变量 | 说明 |
|----------|--------|------|
| 3px, 4px | var(--space-xs) | 紧凑间距 |
| 6px, 8px | var(--space-sm) | 小间距 |
| 10px, 12px | var(--space-md) | 标准间距 |
| 14px, 16px | var(--space-lg) | 大间距 |
| 20px, 24px | var(--space-xl) | 区块间距 |
| 28px, 32px | var(--space-2xl) | 大区块间距 |

#### box-shadow 替换映射
| 模式 | → 变量 |
|------|--------|
| 0 1px 2px ..., 0 1px 3px ..., 0 1px 4px ... | var(--shadow-sm) |
| 0 2px 6px ..., 0 2px 8px ..., 0 2px 10px ..., 0 3px 6px ... | var(--shadow-md) |
| 0 4px 12px ..., 0 4px 16px ..., 0 8px 24px ..., 0 6px 16px ... | var(--shadow-lg) |

#### 不替换的内联 style 值
- `display: none/block/flex`（动态显隐）
- `width`/`height` 的固定像素值（布局尺寸）
- `background`/`background-color`（颜色已在设计令牌之外）
- `transform`、`transition`、`animation`（动画属性）
- `position`、`top`/`left`/`right`/`bottom`（定位）
- `z-index`
- `overflow`
- `opacity`
- `gradient` 相关（如 `linear-gradient(...)`）
- `color:` 值（颜色不在此轮优化范围）
- `border:` 的颜色/样式部分（只替换 border-radius）
- `box-shadow` 中的颜色参数（如 `rgba(238, 10, 36, 0.3)` 彩色阴影不替换）
- `margin-top: 60px`、`padding-top: 60px` 等大尺寸布局值（非设计令牌范围）

### 页面级范围估算

| 页面 | font-size 数 | border-radius 数 | 内联 style border-radius | 预估修改处 |
|------|-------------|-----------------|--------------------------|-----------|
| home_page | ~18 | ~14 | ~2 | ~30 |
| category | ~3 | ~1 | 0 | ~4 |
| cart | ~32 | ~14 | 0 | ~40 |
| profile | ~11 | ~7 | 0 | ~15 |
| **合计** | **~64** | **~36** | **~2** | **~89** |

### 验证
- 逐页在浏览器中打开，与修改前截图对比，确认无布局错乱
- DevTools 检查所有 var() 引用正确解析
- 首页轮播图、商品网格、购物车列表、个人中心布局完整

### 完成标准
- 4 个页面中所有 font-size/border-radius/spacing/shadow 硬编码值已替换为 var() 引用
- 页面视觉与修改前基本一致（允许收敛调整带来的微小变化）
- 无 var() 引用失败（未定义变量）

### 依赖
T-01（common.css 变量体系必须先就绪）

---

## 任务 3: 二级页面样式规范化

### 编号
T-03

### 描述
将 20 个二级页面的硬编码间距、圆角、字号、阴影替换为变量引用。使用与 T-02 相同的替换规则。

### 文件
- `pages/search.html`
- `pages/search_filter.html`
- `pages/product_detail.html`
- `pages/product_list.html`
- `pages/product_detail_off.html`
- `pages/browse_history.html`
- `pages/order_list.html`
- `pages/favorites.html`
- `pages/coupon_center.html`
- `pages/coupon.html`
- `pages/points_center.html`
- `pages/wallet.html`
- `pages/message.html`
- `pages/settings.html`
- `pages/activity_page.html`
- `pages/flash_sale.html`
- `pages/vip_center.html`
- `pages/brand_list.html`
- `pages/newuser_gift.html`
- `pages/movie_cinema.html`

### 页面级范围估算

| 页面 | font-size | border-radius | 内联 br | 预估修改 |
|------|-----------|---------------|---------|---------|
| product_detail | ~44 | ~14 | ~1 | ~55 |
| product_detail_off | ~45 | ~14 | ~1 | ~55 |
| order_cake | ~46 | ~18 | 0 | ~60 |
| order_movie | ~50 | ~19 | 0 | ~65 |
| order_product | ~47 | ~18 | 0 | ~60 |
| order_pay | ~34 | ~10 | 0 | ~40 |
| 其余 14 页 | ~180 | ~60 | ~15 | ~240 |
| **合计** | **~446** | **~93** | **~17** | **~520** |

### 验证
- 重点页面逐页验证: product_detail, order_list, coupon_center
- 其余页面抽样验证（每 5 页抽 1 页）
- 检查产品详情页的图片、价格、按钮无异常
- 检查订单列表、积分中心的卡片布局

### 完成标准
- 20 个页面硬编码值替换完成
- 重点页面（product_detail, order_list, coupon_center, points_center）无视觉回归
- 内联 style 中的动态属性未被误改

### 依赖
T-01

---

## 任务 4: 三级页面样式规范化

### 编号
T-04

### 描述
将 37 个三级页面（表单、流程、售后等）的硬编码值替换为变量引用。使用相同替换规则。

### 文件
- `pages/login.html`
- `pages/register.html`
- `pages/profile_edit.html`
- `pages/change_phone.html`
- `pages/address.html`
- `pages/address_edit.html`
- `pages/points_detail.html`
- `pages/points_types.html`
- `pages/points_expire.html`
- `pages/points_consume.html`
- `pages/points_rules.html`
- `pages/points_exchange.html`
- `pages/points_movie.html`
- `pages/coupon_bind.html`
- `pages/coupon_select.html`
- `pages/points_batch_select.html`
- `pages/order_product.html` (如在 T-03 已处理则跳过)
- `pages/order_cake.html` (如在 T-03 已处理则跳过)
- `pages/order_movie.html` (如在 T-03 已处理则跳过)
- `pages/movie_card_select.html`
- `pages/movie_pass_detail.html`
- `pages/movie_pass_info.html`
- `pages/order_pay.html` (如在 T-03 已处理则跳过)
- `pages/pay_success.html`
- `pages/order_detail.html`
- `pages/order_cancel.html`
- `pages/order_complaint.html`
- `pages/logistics.html`
- `pages/refund.html`
- `pages/apply_refund.html`
- `pages/refund_detail.html`
- `pages/apply_exchange.html`
- `pages/review.html`
- `pages/write_review.html`
- `pages/product_reviews.html`
- `pages/my_reviews.html`
- `pages/account_cancel.html`

**注意**: order_product、order_cake、order_movie、order_pay 按任务队列定义归入三级页面。实际执行时从 T-03 文件列表中移除这 4 个文件，确保不重复。

### 页面级范围估算

| 页面 | font-size | border-radius | 内联 br | 预估修改 |
|------|-----------|---------------|---------|---------|
| login | ~27 | ~13 | ~1 | ~35 |
| apply_refund | ~35 | ~12 | ~1 | ~45 |
| refund_detail | ~27 | ~16 | ~3 | ~40 |
| newuser_gift | ~23 | ~16 | ~2 | ~35 |
| feedback | ~12 | ~14 | 0 | ~25 |
| 其余 32 页 | ~350 | ~100 | ~20 | ~450 |
| **合计** | **~474** | **~171** | **~27** | **~630** |

### 验证
- 重点验证: login, address_edit, order_detail, apply_refund
- 表单类页面检查 input/label 间距、按钮圆角
- 流程类页面检查步骤条、状态展示
- 其余抽样验证

### 完成标准
- 37 个页面硬编码值替换完成
- 表单输入、按钮、卡片视觉一致
- 登录页、支付流程、售后流程无功能/视觉回归

### 依赖
T-01

---

## 任务 5: 辅助页面 + page-index 样式规范化

### 编号
T-05

### 描述
将 4 个辅助页面和 page-index.html（不引用 common.css，需独立处理）的硬编码值替换。

### 文件
- `pages/customer_service.html`
- `pages/help.html`
- `pages/feedback.html`
- `pages/about.html`
- `page-index.html`（根目录，不引用 common.css）

### page-index.html 特殊处理

page-index.html 不引用 common.css，全部样式写在页内 `<style>` 块。有两种处理方式:

**方案 A（推荐）**: 在 page-index.html 的 `<style>` 块顶部添加 `:root` 变量定义（复制 common.css 的设计令牌），然后替换硬编码值。优点是保持设计令牌一致性，缺点是变量重复定义。

**方案 B**: 保持硬编码值，仅按收敛规范手动统一数值（不加变量）。优点是简单，缺点是未来需再次手动同步。

选择方案 A，在 page-index.html 的 style 块中添加完整的设计令牌变量定义。

### 页面级范围估算

| 页面 | font-size | border-radius | 内联 br | 预估修改 |
|------|-----------|---------------|---------|---------|
| customer_service | ~5 | ~5 | 0 | ~8 |
| help | ~10 | ~8 | 0 | ~15 |
| feedback | ~12 | ~14 | 0 | ~25 |
| about | ~13 | ~9 | 0 | ~20 |
| page-index | ~N/A | ~N/A | 0 | ~15 |
| **合计** | **~40** | **~36** | **0** | **~83** |

### 验证
- 5 个页面逐页验证（文件数量少，全部检查）
- page-index.html 确认导航链接网格布局无异常
- 辅助页面确认文字可读性、按钮可点击

### 完成标准
- 5 个文件硬编码值替换完成
- page-index.html 包含独立的 `:root` 设计令牌变量定义
- 全部 65 个页面 + common.css 完成 UI 风格统一

### 依赖
T-01

---

## 执行波次与关键路径

```
Wave 1:  T-01 (common.css 重构)          ← 关键路径起点
          |
Wave 2:  T-02 (一级页面) ──┐
         T-03 (二级页面) ──┤── 可并行
         T-04 (三级页面) ──┤
         T-05 (辅助页面) ──┘
```

- **Wave 1**: T-01（必须先完成，所有后续任务依赖变量体系）
- **Wave 2**: T-02 ~ T-05（无相互依赖，可并行执行）
- **关键路径**: T-01 → T-03（最大工作量的任务链）

## 决策覆盖检查

| 决策编号 | 内容 | 对应任务 | 状态 |
|----------|------|----------|------|
| D-01 | 保持红色主题，不改配色 | 全部（仅替换间距/圆角/字号/阴影） | 已覆盖 |
| D-02 | 统一间距、圆角、字号、阴影 4 维度 | T-01 定义变量，T-02~05 逐页替换 | 已覆盖 |
| D-03 | 全部 65 个页面调整 | T-02(4页) + T-03(20页) + T-04(37页) + T-05(5文件) = 66 文件 | 已覆盖 |
| D-04 | 先重构 common.css 再逐页替换 | T-01 先行，T-02~05 依赖 T-01 | 已覆盖 |

## 上下文预算估算

| 任务 | 文件数 | 预估修改处 | 上下文消耗 |
|------|--------|-----------|-----------|
| T-01 | 1 | ~45 处 | ~15% |
| T-02 | 4 | ~89 处 | ~30% |
| T-03 | 20 | ~520 处 | 需拆分为 4-5 次执行 |
| T-04 | 37 | ~630 处 | 需拆分为 6-8 次执行 |
| T-05 | 5 | ~83 处 | ~25% |

**注意**: T-03 和 T-04 涉及大量文件，单次执行上下文可能不足。建议按页面子集分批执行（每批 4-5 个页面），每次执行消耗 ~30-40% 上下文。T-02 和 T-05 可以合并为一次执行。
