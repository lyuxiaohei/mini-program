# Prompts - session 8ac2ae33-ccf1-45bf-bee5-3458110bca95

> project: `D:\a-projects\mini-program`
> started: 2026-08-10 14:18:10

## 2026-08-10 14:18:10

现在支付涉及哪些版本和商品类型？是什么逻辑

## 2026-08-10 14:44:21

0.62版本是不是没评审？

## 2026-08-10 14:46:33

给版本增加一个记录字段，目前V0.62不开发了，只开发到V0.61，现在跳过V0.62开始一个V0.7版本，我需要对支付功能做调整。

## 2026-08-10 15:37:03

<task-notification>
<task-id>a856db2176a0d20f2</task-id>
<tool-use-id>call_83f0968a551c4253b444e922</tool-use-id>
<output-file>C:\Users\ADMINI~1\AppData\Local\Temp\claude\D--a-projects-mini-program\8ac2ae33-ccf1-45bf-bee5-3458110bca95\tasks\a856db2176a0d20f2.output</output-file>
<status>completed</status>
<summary>Agent "摸清积分抵扣逻辑分布" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>我已经完成了深入探索。以下是针对全部 7 个问题的结构化报告。所有路径均为绝对路径。只读探索，未进行任何修改。

---

## 1. 批次选择页 — 单选机制核心代码

`D:\a-projects\mini-program\pages\points_batch_select.html`

| 元素 | 行号 | 说明 |
|---|---|---|
| `POINTS_BATCHES` mock（6 条 B001-B006，5 种 type） | 310-317 | 完整 6 批数据，每条含 `id/type/label/name/subLabel/balance/matchAttr/matchValue/expireDate`（B003/B004 额外有 `scopeList`） |
| `var selectedBatch = null` | 320 | **单值**变量（非数组），单选的根 |
| `prevSelection` 读取 | 330 | `localStorage.getItem('selected_batch_id')` 回显上次选择 |
| `selectBatch(el)` | 455-460 | `selectedBatch = id === '' ? null : id` —— 整个赋值就这一行，直接覆盖，天然单选 |
| `confirmSelect()` | 501-508 | 有选则 `setItem('selected_batch_id', selectedBatch)`，无选则 `removeItem`，再跳 `return_page` |
| 卡片 active 判定 | 421 | `var isActive = b.id === selectedBatch` —— 严格相等，只一卡片可 active |
| "不使用积分"卡片 active | 412 | `selectedBatch === null ? ' active'` |
| 排序逻辑 `findBestBatch` + 排序 | 365-373、396-409 | 按可用额度/到期推荐一个最优批次（单选语境） |
| 初始化回填 + movie/cake 守卫 | 515-519 | `selectedBatch = prevSelection || findBestBatch()`，若 movie/cake 且选中非 general 则改选 best |
| **`.bc-radio` CSS（单选圆点视觉）** | 92-115 | `border-radius:50%`，`.active .bc-radio::after` 填实心圆点 —— 改多选需把圆点改方框打勾样式 |
| `.batch-card.active` 边框/底色 | 88-91 | active 态高亮 |

---

## 2. 四个订单页各自的积分抵扣实现

**关键结论：4 个页面都 `location.href = 'points_batch_select.html'` 复用同一选择页；但 3 个页面（product/movie/cake）各自内嵌了一份 `POINTS_BATCHES` 副本，virtual 没有。所有抵扣计算都内联在各自 `&lt;script&gt;` 里，无公共函数。**

### 2a. `pages\order_product.html`（商品订单，全部 5 种批次）
- **自有 `POINTS_BATCHES` 副本**：945-952 —— 6 条全量，5 种 type 齐全（与选择页一字不差）
- 复用选择页：`goToBatchSelect` 1231-1238（写 `order_products`/`order_type='product'`/`return_page`）
- 读取选中：init 1408；`pageshow` 回填 1421-1437（`source==='batch'` 分支读 `selected_batch_id`）
- `getMaxConsumable(batchId)`：1031-1036 —— `min(balance, 匹配商品总额)`，**按 batchId 查**
- `pointsUsed` 计算（renderSummary）：1182-1193 —— 4 个 currentMode 分支 `beans / beans_cash / beans_coupon / beans_coupon_cash`
- 另有等价计算块（calcAmounts 类）：1342-1354（返回 `{goods, pointsUsed, couponUsed, cashAmount}`，供弹窗用）

### 2b. `pages\order_movie.html`（电影票，仅通兑）
- **自有 `POINTS_BATCHES` 副本**：880-883 —— **只有 B005、B006 两条 general**（注意：此页自身不含非通兑批次）
- 复用选择页：`goToBatchSelect` 1056-1062（`order_type='movie'`）
- 读取选中：init 1167；`pageshow` 回填 1187-1195
- `getMaxConsumable()`：923-927 —— **不接受参数**，直接读 `getBatch(selectedBatch).balance`（电影票固定单票价，不按商品匹配）
- `pointsUsed` 计算（calcAmounts）：1011-1022 —— `movieActive` 与 `pointsActive` 互斥分支，`pointsUsed = Math.min(getMaxConsumable(), total)`

### 2c. `pages\order_cake.html`（蛋糕，仅通兑）
- **自有 `POINTS_BATCHES` 副本**：889-892 —— **只有 B005、B006 两条 general**
- 复用选择页：`goToBatchSelect` 1169-1174（`order_type='cake'`）
- 读取选中：init 1359；`pageshow` 回填 1372-1388（`source==='batch'`）
- `getMaxConsumable(batchId)`：971-976 —— 与 product 同形（按 batchId + 匹配总额）
- `pointsUsed` 计算（renderSummary）：1077-1092（4 个 currentMode 分支）+ 另一等价块 1200-1212
- **与 product 不同**：此页也有 `allocateByWeight`(987-994) 和 `renderProductAlloc`(1076-1106)，即蛋糕页同样有按商品分摊展示

### 2d. `pages\order_virtual.html`（虚拟商品，仅通兑）—— **结构最特殊**
- **完全没有 `POINTS_BATCHES`**：用全局 `var POINTS_BALANCE = 9900`（1069）模拟总余额
- 复用选择页：`goToBatchSelect` 1362-1369（`order_type='virtual'`）
- 读取选中：`handleBatchReturn()` 1389-1401 —— 读 `selected_batch_id`（1390），有则 `pointsActive=true; selectedBatch=batchId`，**读完立即 `removeItem('selected_batch_id')`（1398，消费式读取）**
- **无 `getMaxConsumable`**：直接 `Math.min(POINTS_BALANCE, goodsCents)`（1319、1329、1331、1355）
- `pointsUsed` 计算（renderSummary）：1326-1334（只有 `beans`/`combo` 两种 mode）
- **回填机制不同于其他 3 页**：不是 `pageshow` 监听，而是 init 时直接调用 `handleBatchReturn()`（1618）。即每次进页都读+清 key

---

## 3. 是否有公共 JS（确认你的猜测）

`D:\a-projects\mini-program\js\` 下文件：`auth.js`、`auth-guard.js`、`common.js`、`theme-switcher.js`、`cs-panel.js`、`movie_pass_cards.js`。

在 `js\common.js` 内搜索 `points|batch|POINTS|deduct|积分|消费` —— **零命中**。**确认：没有任何封装积分批次/抵扣计算的公共文件。** 全部积分逻辑（`POINTS_BATCHES` 定义、`getBatch`、`isMatched`、`getMatchedProducts`、`getMatchedTotal`、`getMaxConsumable`、`allocateByWeight`、`renderProductAlloc`、`pointsUsed` 计算）都逐份复制内联在每个 HTML 页面的 `&lt;script&gt;` IIFE 里。`movie_pass_cards.js` 仅与次卡展示相关，不涉及积分批次。

---

## 4. 积分抵扣计算的两个维度（order_product.html）

**"按商品价格权重分摊到各商品" 的展示逻辑：**
- `allocateByWeight(totalPoints, matchedProducts)`：**1056-1067** —— 以 `price*qty` 为权重把 totalPoints 分摊到每个匹配商品，末位商品兜底取整差，返回 `[{product, points, cash}]`
- `renderProductAlloc()`：**1139-1169** —— 遍历所有商品，给每行写 `alloc-tag`（可用/不支持）+ `alloc-detail`（X积分 + ¥Y）。DOM 挂载点 `.prod-alloc`（HTML 在 763/779/795）
- 相关 CSS：418-442

**pointsUsed 的计算（renderSummary）：**
- `renderSummary()` 内 pointsUsed 计算：**1182-1193**

**两者的关系（关键）：**
- `renderProductAlloc` 自己重新算一遍 `totalPoints`（1143-1148），其 4 个 mode 分支公式与 `renderSummary` 的 pointsUsed 公式（1189-1192）**完全一致但各自独立计算**。
- 调用链：`renderSummary` 末尾（**1226**）调用 `renderProductAlloc`。即 pointsUsed（用于实付金额）和 totalPoints（用于分摊展示）是**两套并行、同公式的计算**，并非一处导出给另一处。
- 多批次叠加后：pointsUsed 公式（1189-1192，依赖 `getMaxConsumable(selectedBatch)` 单批次）和 renderProductAlloc 的 totalPoints（1144-1147）需同步改成"多批次聚合"；`allocateByWeight`（1056）目前只接受单一 `matchedProducts` 列表，叠加后多批次的匹配集如何并入分摊是核心改动点。

---

## 5. localStorage 键 `selected_batch_id` 读写清单

| 文件 | 行号 | 操作 |
|---|---|---|
| `pages\points_batch_select.html` | 330 | **读**（`prevSelection`，回显） |
| `pages\points_batch_select.html` | 503 | **写**（confirmSelect 有选） |
| `pages\points_batch_select.html` | 505 | **删**（confirmSelect 无选） |
| `pages\order_product.html` | 1236 | 写（跳转前存当前） |
| `pages\order_product.html` | 1408 | 读（init） |
| `pages\order_product.html` | 1426 | 读（pageshow 回填） |
| `pages\order_movie.html` | 1060 | 写（跳转前） |
| `pages\order_movie.html` | 1167 | 读（init） |
| `pages\order_movie.html` | 1183 | **删**（选了次卡时清掉积分） |
| `pages\order_movie.html` | 1188 | 读（pageshow 回填） |
| `pages\order_cake.html` | 1173 | 写（跳转前） |
| `pages\order_cake.html` | 1359 | 读（init） |
| `pages\order_cake.html` | 1377 | 读（pageshow 回填） |
| `pages\order_virtual.html` | 1367 | 写（跳转前） |
| `pages\order_virtual.html` | 1390 | 读（handleBatchReturn） |
| `pages\order_virtual.html` | 1398 | **删**（读完消费式清掉） |
| `doc\V0.5\订单支付规则.md` | 148 | 文档登记该字段 |

**改为数组键 `selected_batch_ids` 的兼容性影响面**：上述 6 个 HTML 文件全部 17 处 + 1 处文档。特别注意两个"读后删除"的点（order_virtual 1398、order_movie 1183），它们是消费式清理，改键名需同步改删除调用。此外 4 个订单页 `pointsActive = !!selectedBatch` 的判断（product 1410、movie 1169、cake 1361、virtual 1392/1395）都把单值当布尔，改数组后需改成 `length &gt; 0` 类判断。

---

## 6. 电影票"积分 vs 次卡"互斥逻辑（order_movie.html）

互斥全部集中在 `pageshow` 监听器内（**1174-1196**），不是在批次选择页里：

- `source === 'movie'` 分支（**1178-1186**）：选了次卡 → `movieActive=true; selectedMovieCard=newCard`，并**清积分**：`pointsActive=false; selectedBatch=null; localStorage.removeItem('selected_batch_id')`（**1182-1183**）
- `source === 'batch'` 分支（**1187-1195**）：选了积分批次 → `pointsActive=true; selectedBatch=newBatch`，并**清次卡**：`movieActive=false; selectedMovieCard=null; localStorage.removeItem('selected_movie_card_id')`（**1190-1192**）

**与积分内部多选叠加的关系**：此互斥是"积分类 vs 次卡类"的跨类互斥，发生在 order_movie 页读取 `selected_batch_id` 时。积分批次内部多选叠加的改动发生在 `points_batch_select.html`（选择页）及 `selected_batch_id(s)` 键的语义上，**不会触碰 `movieActive`/`selectedMovieCard`/`selected_movie_card_id`**。只要 order_movie 的 `source==='batch'` 分支（1189-1192）保留"清次卡"动作，跨类互斥不会破坏。需注意：`getMaxConsumable()`（923-927）当前按单 `selectedBatch` 取 balance，多选后此函数需聚合多批次余额，但这与次卡互斥逻辑正交。

---

## 7. page-index.html 版本标签 CSS

`D:\a-projects\mini-program\page-index.html`

| 行号 | 定义 |
|---|---|
| **118-124** | `.links a .ver` 基类：`inline-block; padding:1px var(--space-xs); color:var(--card-bg)（白字）; font-size:var(--font-xs); border-radius:var(--radius-xs)` |
| 125 | `.ver.v01 { background: var(--text-secondary) }`（灰） |
| 126 | `.ver.v2 { background: var(--warning-color) }`（橙） |
| 127 | `.ver.v3 { background: var(--tag-blue) }` |
| 128 | `.ver.v4 { background: var(--success-color) }`（绿） |
| 129 | `.ver.v5 { background: var(--info-color) }` |
| 130 | `.ver.v6 { background: var(--tag-pink) }` |
| 131 | `.ver.v11 { background: var(--tag-purple) }` |
| **133-137** | `.ver-group`：`display:flex; flex-wrap:wrap; gap:4px` —— 一条链接挂多个标签时的容器（132 行注释说明"版本标签统一放第二行"） |

**现有样式模式**：每个颜色 class 形如 `.links a .ver.vN { background: &lt;CSS变量&gt;; }`，复用 `.ver` 基类的白字+padding+圆角。**目前没有 `.v7`，也没有任何 `.ver-status` 类**（全文档搜索 `status`/`state-tag` 无 CSS 命中）。`points_batch_select.html` 当前标签用法见 209 行 `&lt;span class="ver v3"&gt;V0.3&lt;/span&gt;`。

新增 `.v7` 需在 130/131 之间加一行同形规则（选一个未用过的颜色变量）；新增状态标签若想视觉区分（如非白字、带边框），需另写一个基类而非复用 `.ver`（因为 `.ver` 强制 `color: var(--card-bg)` 白字）。可用颜色变量可参考 common.css 的 `--tag-*`/`--*-color` 系列。

---

### 附：跨文件结构速查（便于后续改动定位）

- 单选→多选核心改造点：`points_batch_select.html` 的 `selectedBatch`（320）、`selectBatch`（455-460）、`confirmSelect`（501-508）、`.bc-radio` CSS（92-115）、active 判定（412/421）。
- 多批次抵扣金额聚合改造点：4 个订单页各自的 `getMaxConsumable` + `pointsUsed` 计算（见问题 2 各页行号）+ product/cake 的 `allocateByWeight`/`renderProductAlloc`（product 1056-1067/1139-1169；cake 987-994/1076-1106）。
- 互斥规则（type 相同且 matchAttr+matchValue 一致可叠加）所需的判断素材：每条 batch 的 `type`/`matchAttr`/`matchValue` 字段已在三份 `POINTS_BATCHES` 副本中齐备（product 945-952 全量；movie/cake 仅 general 两；选择页 310-317 全量）。`isMatched` 函数三处副本（product 1015-1021、cake 955-961、选择页 339-348）逻辑一致。</result>
<usage><subagent_tokens>0</subagent_tokens><tool_uses>31</tool_uses><duration_ms>450585</duration_ms></usage>
</task-notification>

## 2026-08-10 15:52:13

<task-notification>
<task-id>af743323946b56034</task-id>
<tool-use-id>call_77aca1f42f674b89a45ab6d9</tool-use-id>
<output-file>C:\Users\ADMINI~1\AppData\Local\Temp\claude\D--a-projects-mini-program\8ac2ae33-ccf1-45bf-bee5-3458110bca95\tasks\af743323946b56034.output</output-file>
<status>completed</status>
<summary>Agent "设计积分叠加实现方案" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>所有行号和逻辑已根据源文件验证。以下是实现方案。

---

# 实现方案：积分批次抵扣从单选改为多选叠加 (V0.7)

## 概述与设计原则

所有 8 处行号和逻辑分支已逐行核实，与任务描述一致。核心设计原则：4 个订单页各自内联积分逻辑、无公共 JS，因此**算法函数必须逐页同构复制**，用一份伪代码作单一事实源，4 页粘贴同一实现，避免行为漂移。

---

## 1. 数据结构迁移

### 状态变量
- `var selectedBatch = null`（单值字符串）→ `var selectedBatches = []`（字符串数组）
- `pointsActive = !!selectedBatch`（product 1410 / movie 1169 / cake 1361 / virtual 1392,1395）→ `pointsActive = selectedBatches.length &gt; 0`

### localStorage 键
- `selected_batch_id`（单值字符串）→ `selected_batch_ids`（JSON 数组字符串）

### 旧键兼容（推荐加，成本极低）
原型 demo 场景下浏览器残留旧 key 会导致首屏读到单值字符串。在**每个读取点**加一个统一垫片函数，集中实现一次：

```js
function readSelectedBatchIds() {
  var raw = localStorage.getItem('selected_batch_ids');
  if (raw) { try { return JSON.parse(raw) || []; } catch(e) {} }
  // 兼容旧单值 key
  var old = localStorage.getItem('selected_batch_id');
  if (old) { localStorage.removeItem('selected_batch_id'); return [old]; }
  return [];
}
function writeSelectedBatchIds(arr) {
  if (arr &amp;&amp; arr.length) localStorage.setItem('selected_batch_ids', JSON.stringify(arr));
  else localStorage.removeItem('selected_batch_ids');
}
```

### 17 处读写的统一改法（按文件分组）

| 文件 | 行号 | 现状 | 改法 |
|------|------|------|------|
| points_batch_select | 330 | `getItem('selected_batch_id')` | `readSelectedBatchIds()` |
| points_batch_select | 503 | `setItem('selected_batch_id', selectedBatch)` | `writeSelectedBatchIds(selectedBatches)` |
| points_batch_select | 505 | `removeItem('selected_batch_id')` | `writeSelectedBatchIds([])` |
| order_product | 1236 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_product | 1408 | `getItem(...) \|\| null` | `selectedBatches = readSelectedBatchIds()` |
| order_product | 1410,1426 | 单值回填 | 数组回填 + `pointsActive = length&gt;0` |
| order_movie | 1060 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_movie | 1167 | `getItem(...) \|\| null` | `readSelectedBatchIds()` |
| order_movie | **1183** | `removeItem('selected_batch_id')`（source==='movie' 清积分） | `writeSelectedBatchIds([])` |
| order_movie | 1188,1190 | 单值回填 | 数组回填 |
| order_cake | 1173 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_cake | 1359,1377 | 单值读写 | 数组读写 |
| order_virtual | 1367 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_virtual | 1390 | `getItem(...)` | `readSelectedBatchIds()` |
| order_virtual | **1398** | `removeItem`（**消费式读取**：回填后立即删，防 re-init 重复应用） | `writeSelectedBatchIds([])` 保留此"读后即删"语义 |

### 两个"读后删除"点的处理（重点）
- **virtual 1398 / movie 1183** 是"消费式读取"：读出选择后立即清除，防止 `pageshow`/`init` 二次触发时重复应用。多选改造后**保留这个语义**——把"删除单值"换成"清空数组"。virtual 的 `handleBatchReturn`（1389-1401）整体保留，仅把内部读写换成数组版本。
- `pointsActive` 布尔判断：4 页统一改为 `selectedBatches.length &gt; 0`，不再用 `!!selectedBatch`。

---

## 2. 选择页互斥不变量重写（核心设计点）

### selectBatch 新逻辑伪代码（替换 455-460）

```js
window.selectBatch = function(el) {
  var id = el.dataset.batch;
  if (id === '') {
    // 点"不使用" → 清空全部
    selectedBatches = [];
  } else {
    var idx = selectedBatches.indexOf(id);
    if (idx !== -1) {
      // 已选 → toggle 移除（反选）
      selectedBatches.splice(idx, 1);
    } else {
      // 未选 → 判断三元组是否与当前集合同组
      var b = getBatch(id);
      var sameGroup = selectedBatches.every(function(sid) {
        var s = getBatch(sid);
        return s.type === b.type
            &amp;&amp; s.matchAttr === b.matchAttr
            &amp;&amp; s.matchValue === b.matchValue;
      });
      if (sameGroup) {
        selectedBatches.push(id);          // 同组 → 叠加加入
      } else {
        selectedBatches = [id];            // 不同组 → 清空只留新选
      }
    }
  }
  renderBatchSelector();
  renderProductSummary();
};
```

**不变量保证**：`selectedBatches` 在任何时刻要么为空，要么所有元素的三元组 `(type, matchAttr, matchValue)` 完全一致。`every` 在空数组上返回 `true`，所以首选项自动落入"同组加入"分支。

### confirmSelect 改为写数组（替换 501-508）
```js
window.confirmSelect = function() {
  writeSelectedBatchIds(selectedBatches);   // 数组写入；空数组内部 removeItem
  location.href = localStorage.getItem('return_page') || 'order_product.html';
};
```

### 配套改动（选择页内）
- **active 判定**（412 不使用卡、421 `b.id===selectedBatch`）→ `selectedBatches.length===0`（不使用卡）/ `selectedBatches.indexOf(b.id)!==-1`（批次卡）
- **`renderProductSummary` 的 `isMatched(selectedBatch, p)`**（380）：集合为空时不显示匹配标；非空时用 `selectedBatches[0]` 判匹配（同组匹配范围一致，取首项即可），或显示"该组匹配 N 件"。
- **`getMaxConsumable` 展示**（358-363, 406, 421, 439）：选择页展示用聚合值——见第 3 节算法，单卡展示仍显示该卡自身 `min(balance, matchedTotal)`，但顶部可加一行"已选 N 张，合计可消耗 X"。
- **init 守卫（515-519, movie/cake 非 general 改选 best）**：改为过滤——`selectedBatches = selectedBatches.filter(function(id){ return getBatch(id).type==='general'; })`，过滤后为空则不强制回填（允许"不使用"）。**Option A 下要把 `'virtual'` 加入此守卫**（见第 4 节）。
- **CSS：单选圆点 → 多选方框**（92-115 `.bc-radio`）：`border-radius:50%` 改为 `border-radius:4px`（或 `--radius-xs`），active 态的 `::after` 实心圆改为对勾 `✓`（用 border 旋转或 unicode）。这是必须的视觉诚实性——圆点暗示单选，多选必须用方框。`.bc-radio` 改名 `.bc-check` 更准确，但为减小改动面可保留类名只改 CSS。

---

## 3. 多批次聚合抵扣算法（核心设计点）

### 统一算法（4 页共用同一份，按页内联）

```js
// 入参 batchIds: 选中的批次ID数组（保证同三元组）
// 入参 deductCap: 本单该组可抵扣的上限（分）
// 返回 { total: 聚合可抵额, allocation: [{batchId, consumed}] }
function getAggregateConsumable(batchIds, deductCap) {
  if (!batchIds || !batchIds.length) return { total: 0, allocation: [] };
  var batches = batchIds.map(getBatch).filter(Boolean);
  if (!batches.length) return { total: 0, allocation: [] };
  var sumBalance = batches.reduce(function(s, b) { return s + b.balance; }, 0);
  var total = Math.min(sumBalance, deductCap);       // 聚合 = min(总余额, 可抵额)
  // 按 expireDate 升序，先扣最快过期
  var sorted = batches.slice().sort(function(a, b) {
    return new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime();
  });
  var allocation = [], remaining = total;
  for (var i = 0; i &lt; sorted.length &amp;&amp; remaining &gt; 0; i++) {
    var consumed = Math.min(sorted[i].balance, remaining);
    allocation.push({ batchId: sorted[i].id, consumed: consumed });
    remaining -= consumed;
  }
  return { total: total, allocation: allocation };
}
```

### deductCap 的统一（关键设计决策）

product/cake 与 movie/virtual 的差异**仅在 deductCap 的来源**，算法本身完全统一：

| 订单页 | deductCap（分） | 来源 | 理由 |
|--------|----------------|------|------|
| product | `matchedTotalCents` | `Math.round(getMatchedTotal(batchIds[0]) * 100)` | 同三元组匹配同一批商品，matchedTotal 一致，取首项算一次 |
| cake | `matchedTotalCents` | 同上 | cake 只有 general，matchAttr=null，matchedTotal = 全部商品总额 |
| movie | `getTotal()` | `ticketPrice * ticketQty`（固定票价×张数） | 现 movie `getMaxConsumable()` 无参直接返 balance，**缺 deductCap**——V0.7 补上 `getTotal()` 作为 cap |
| virtual | `goodsCents` | `Math.round(getGoodsTotal() * 100)` | 全场通用，cap = 订单总额 |

**统一性的意义**：movie 的现有 `getMaxConsumable()`（923-927 无参、直接返 `balance`）是个**潜在超抵 bug**（余额可超票价），V0.7 顺手用 `getAggregateConsumable(selectedBatches, getTotal())` 修正，让 4 页 cap 语义一致。

### 各调用点替换规则

每个订单页里，凡 `getMaxConsumable(selectedBatch)`（单值数字）出现处，替换为 `getAggregateConsumable(selectedBatches, &lt;cap&gt;).total`（聚合数字）。具体：

- **product**：renderPointsEntry（1076）、renderPayModes 的 `maxCons`（1118）、renderProductAlloc 的 totalPoints（1144-1147）、renderSummary 的 pointsUsed（1188-1192）、combo hint（1215）
- **cake**：renderPointsEntry（1010）、renderPayModes（1055）、renderProductAlloc（1081-1084）、renderSummary（1124-1128）
- **movie**：renderPointsEntry（959）、calcAmounts 的 pointsUsed（1017）、renderPayModes 的余额判断（992）
- **virtual**：renderSummary 的 maxCons（1319）、pointsUsed（1329/1331）、combo hint（1355）

`allocation`（每批次消耗明细）当前 UI 不展示，仅留作后续"批次消耗明细"弹窗或后端记录用；算法返回它但不强制渲染。

---

## 4. order_virtual 难点决策（核心设计点）

### 明确推荐：Option A — 内嵌 B005/B006 通兑副本，与 movie/cake 完全统一

**理由（按重要性排序）：**

1. **特性完整性**：本次需求是多批次叠加。若 virtual 用 `POINTS_BALANCE` 透传，则 4 个订单类型中唯独 virtual 的多选是"假的"——用户选了 B005+B006，实际抵扣仍按固定 9900 算，选择是纯装饰。对 PM 文档项目，这种"演示假动作"会误导评审。

2. **消除 V0.6 遗留技术债**：virtual 当前的 `handleBatchReturn`（1389-1401）读 `selected_batch_id` 设 `pointsActive`，但抵扣数学完全无视所选批次、只用 `POINTS_BALANCE=9900`。选择页选 B001(sku) 也能"成功"，是个被 `POINTS_BALANCE` 掩盖的潜在错误。Option A 顺手清掉。

3. **改动结构对称**：Option A 让 virtual 获得 movie/cake 已有的 `POINTS_BATCHES` + `getBatch` + `getAggregateConsumable`，4 页结构对齐，认知负担最低。增量约 40 行，且全部是从 movie/cake 复制的同构代码。

4. **演示数据影响可控**：virtual 余额 9900 → 62000（B005 12000 + B006 50000）。但 virtual 商品的**真实抵扣上限是订单金额**（话费充值 ¥30-¥100），`min(62000, 订单总额)` = 订单总额，所以实际抵扣额不变，只是"余额展示"从 9900 变 62000。**唯一损失**：virtual 无法再演示"积分不足需现金补差"的 combo 场景（余额总是够）。这个损失可接受——combo/补差演示改由 movie/product/cake 承担，那些页面天然能构造低余额场景。

### Option A 的耦合改动（必须一起做）

1. **virtual 内嵌副本**：在 order_virtual.html 行 1069 处把 `var POINTS_BALANCE = 9900` 替换为：
   ```js
   var POINTS_BATCHES = [
     { id:'B005', type:'general', ... balance:12000, matchAttr:null, matchValue:null, expireDate:'2027-01-01 00:00:00' },
     { id:'B006', type:'general', ... balance:50000, matchAttr:null, matchValue:null, expireDate:'2027-06-30 00:00:00' }
   ];
   ```
   与 movie/cake 的副本（880-883 / 889-892）**逐字段一致**，保证演示数据单一事实源。

2. **补 `getBatch`**（virtual 当前没有）：从 movie 复制。

3. **补 `getAggregateConsumable`**：第 3 节算法，cap = `Math.round(getGoodsTotal()*100)`。

4. **pointsUsed 改造**（1326-1334）：`Math.min(POINTS_BALANCE, goodsCents)` → `getAggregateConsumable(selectedBatches, goodsCents).total`。

5. **combo hint**（1355-1357）：`POINTS_BALANCE.toLocaleString()` → 聚合余额 `sumBalance`。

6. **`getMaxConsumable`/`POINTS_BALANCE` 全量替换**：1319/1329/1331/1355/1356 共 5 处 `POINTS_BALANCE` 引用全部改掉。`selectPayMode` 里 1409/1412 的 `Math.min(POINTS_BALANCE, ...)` 也改为聚合。

7. **选择页守卫扩展（关键）**：points_batch_select.html 的 general-only 守卫（368 `findBestBatch`、423 `disabled`、516-519 init）目前只判 movie/cake。**必须把 `'virtual'` 加入**，否则 virtual 订单会显示 B001-B006 全部 6 张（含 sku/brand 等不通兑的），选了非 general 批次后 virtual 无对应副本。改为：`(orderType === 'movie' || orderType === 'cake' || orderType === 'virtual')`。

### Option B（不推荐，仅作备选）
保留 `POINTS_BALANCE`，仅把读写改成数组、`pointsActive = length&gt;0`，抵扣数学不动。**优点**：virtual 改动最小、保留 9900 低余额 combo 演示。**缺点**：多选在 virtual 是装饰性的、4 页不一致、潜在 bug 保留。仅当确认"virtual 永远纯积分支付、不需要真实多批次"时才选 B。

---

## 5. renderProductAlloc / allocateByWeight 适配

### allocateByWeight（product 1056-1067 / cake 987-994）—— 无需改动
该函数接收 `totalPoints`（聚合后的总抵扣分）按 `price*qty` 权重分摊到各匹配商品。多批次叠加后，**输入仍是单个聚合数字**，分摊逻辑与批次数量无关。函数签名、实现零改动。

### renderProductAlloc（product 1139-1169 / cake 1076-1106）—— 仅 totalPoints 来源与 matched 来源改
改动 3 点：
1. **totalPoints 计算**（product 1144-1147 / cake 1081-1084）：`getMaxConsumable(selectedBatch)` → `getAggregateConsumable(selectedBatches, matchedTotalCents).total`。4 个 currentMode 分支的 `Math.min(...)` 链保持不变（cap 链：聚合总额 / comboPoints / afterCoupon）。
2. **`matched` 列表**（product 1140 / cake 1077 `getMatchedProducts(selectedBatch)`）：改用 `selectedBatches.length ? getMatchedProducts(selectedBatches[0]) : []`。同三元组匹配范围一致，取首项即可；无需对每个批次分别求匹配并集。
3. **`isMatched` 单卡判断**（product 1155 / cake 1092 `isMatched(selectedBatch, prod)`）：改为 `selectedBatches.length &amp;&amp; isMatched(selectedBatches[0], prod)`。

**结论**：分摊到商品的展示逻辑（可用/不支持标签、每商品积分数+现金数）**不变**，因为对用户而言"这单共抵 X 积分、按商品价格分摊"与批次数量无关。批次级消耗明细（allocation）当前不展示，留作扩展。

### renderSummary 末尾调用链不变
product 1226 `renderProductAlloc()` 在 renderSummary 末尾被调用，调用顺序保持。

---

## 6. page-index 状态字段设计

### CSS 新增（page-index.html `&lt;style&gt;` 内，:root 在 8-19，.ver 在 118-137）

```css
/* :root 内新增一个 V0.7 专用色（现有 tag-blue/purple/pink 已用，取 teal 区分）*/
--tag-teal: #0d9488;

/* 版本色 class，加在 131 行 .v11 之后 */
.links a .ver.v7 { background: var(--tag-teal); }

/* 状态标签：与 .ver 视觉强区分 —— 非白字、浅底、边框、删除线表"已废弃" */
.links a .ver-status {
  display: inline-block;
  padding: 1px var(--space-xs);
  font-size: var(--font-xs);
  border-radius: var(--radius-xs);
  color: var(--text-tertiary);      /* 灰字，非白字 */
  background: var(--card-bg);        /* 浅底 */
  border: 1px dashed var(--text-light); /* 虚线边框强调"非正式版本" */
  text-decoration: line-through;     /* 删除线 = 已废弃 */
}
```

设计依据：`.ver` 强制 `color:var(--card-bg)` 白字（行 121），状态标签必须打破此规则才能视觉区分；虚线+删除线+灰字是业界"deprecated"通用视觉语言。

### page-index.html 标签改动

**5 个 V0.7 受影响页面**（加 V0.7 NEW 标签）：
- 209 `points_batch_select.html`：`V0.3` → 加 `&lt;span class="ver v7"&gt;V0.7 NEW&lt;/span&gt;`
- 210 `order_product.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`
- 211 `order_cake.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`
- 212 `order_movie.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`
- 213 `order_virtual.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`

**3 个 V0.62 标"已废弃→V0.7"**（在 V0.62 标签后加状态标签）：
- 213 `order_virtual.html`：`V0.62` 后加 `&lt;span class="ver-status"&gt;已废弃→V0.7&lt;/span&gt;`（此页同时有 V0.7 新标签）
- 215 `order_detail_virtual_direct.html`：`V0.62 NEW` 后加 `&lt;span class="ver-status"&gt;已废弃→V0.7&lt;/span&gt;`
- 219 `pay_success.html`：`V0.62` 后加 `&lt;span class="ver-status"&gt;已废弃→V0.7&lt;/span&gt;`

注意：order_virtual 同时承担"V0.62 废弃"和"V0.7 新功能"两个语义——保留原 V0.6/V0.61/V0.62 标签 + 新增废弃状态 + V0.7 标签，标签虽多但语义清晰。

### page-index.md 改动（镜像 html）
- 行 42 `order_product.html` `V0.3 NEW` → 加 `V0.7`
- 行 43 `order_cake.html` → 加 `V0.7`
- 行 44 `order_movie.html` → 加 `V0.7`
- 行 45 `order_virtual.html` `V0.6 V0.61 V0.62` → 加 `V0.62已废弃→V0.7` `V0.7`
- 行 47 `order_detail_virtual_direct.html` `V0.61 V0.62` → 加 `V0.62已废弃→V0.7`
- 行 49 `pay_success.html` `V0.61 V0.62` → 加 `V0.62已废弃→V0.7`
- `points_batch_select.html` 当前**不在 page-index.md**（仅 html 有）——确认是否补登，建议补一行 `选择积分批次 V0.3 V0.7`。

---

## 7. 规则文档同步

### doc/V0.5/订单支付规则.md
- **1.1（行 11）**："支持全部5种积分批次" → 补注："同类型+同商品规则范围(type+matchAttr+matchValue)的批次可多选叠加，不同则互斥自动替换"。
- **1.3 计算顺序（行 24-28）**：第 2 步"积分抵扣 min(余额,...)" → 改为"积分抵扣：同组多批次按 expireDate 升序叠加消耗，聚合 min(Σ各批次余额, 券后剩余)，先扣最快过期批次"。
- **第 5 章 积分批次类型（120-128）**：表后新增一节"5.1 批次叠加规则"——三元组定义 + 叠加/互斥判定 + 消耗顺序。
- **第 4 章 三种订单对比（104-116）**：标题改"四种订单对比"，加"虚拟商品订单"列（与 CLAUDE.md 三种→四种联动）；加一行"积分批次叠加"维度。
- **第 8 章 localStorage（141-152）**：`selected_batch_id` 行 → `selected_batch_ids`（JSON 数组），用途补"多选批次ID数组"。
- **2.1（行 39）/ 3.1（行 76）**：movie/cake"仅支持通兑"补注"通兑批次间可多选叠加"。

### CLAUDE.md
- **"三种订单类型"（行 25-31）**：标题改"四种订单类型"，表格加第 4 行：`虚拟商品订单 | order_virtual.html | 积分+现金组合，通兑批次可叠加，纯积分跳过收银台`。
- **"组合支付计算规则"（行 33-38）第 2 步（行 36）**：`积分抵扣：min(余额, 券扣减后剩余金额)` → `积分抵扣：同三元组批次按 expireDate 升序叠加，min(Σ余额, 券后剩余)，先扣最快过期`。
- **"版本管理"（行 64-70）**：
  - 行 67 PRD 归档补 `V0.7 积分批次多选叠加`。
  - 加一句"V0.62 虚拟商品迭代（order_virtual/order_detail_virtual_direct/pay_success）已由 V0.7 超越，page-index 以 ver-status 已废弃 标记"。
  - 加一句状态字段约定："版本标签 .ver 为彩色实心（正式版本），.ver-status 为虚线删除线（已废弃/开发中状态）"。

### 是否新建 doc/V0.7/PRD —— 推荐新建
理由：项目按 `doc/V{版本}/` 归档（CLAUDE.md 行 67），V0.7 是独立功能迭代。建议新建 `doc/V0.7/PRD_积分批次多选叠加.md`，内容：背景（单选→多选）、叠加规则（三元组+互斥+消耗顺序）、4 页影响清单、localStorage 协议变更、演示数据说明（virtual 余额变化）。同时**保留** V0.5/订单支付规则.md 作为跨版本汇总文档（只做上述增量修订）。两者职责：V0.7/PRD 是本次功能全量说明，V0.5 规则是 4 类订单支付的活文档总账。

---

## 8. 改动文件完整清单（按改动量降序）

| # | 文件 | 一句话改什么 | 风险点 |
|---|------|-------------|--------|
| 1 | `pages/points_batch_select.html` | 单选→多选：selectedBatches 数组、selectBatch 三元组互斥、confirmSelect 写 JSON、CSS 圆点→方框、init 守卫加 virtual、general-only 守卫扩展 | CSS 改名/改样式易漏 active 态；init 守卫漏 virtual 导致显示非通兑批次 |
| 2 | `pages/order_product.html` | getMaxConsumable→getAggregateConsumable（5+ 处）、pointsUsed 4 分支、renderProductAlloc totalPoints 来源、init/pageshow 数组读写 | 4 分支 currentMode 易漏一处；renderProductAlloc 与 renderSummary 的 totalPoints 公式必须一致（两处独立重算） |
| 3 | `pages/order_virtual.html` | **Option A**：内嵌 B005/B006、补 getBatch/getAggregateConsumable、删除 POINTS_BALANCE、pointsUsed/combo hint 全改、handleBatchReturn 数组化 | 演示数据 9900→62000 变化；5 处 POINTS_BALANCE 引用易漏；无 getMaxConsumable 历史代码，全部新增 |
| 4 | `pages/order_cake.html` | 同 product（结构同构，仅 general 批次），getMaxConsumable→聚合、pointsUsed、renderProductAlloc、init/pageshow 数组化 | 与 product 必须保持算法同构，复制粘贴后易忘改 cap 来源 |
| 5 | `pages/order_movie.html` | getMaxConsumable 补 cap=getTotal()、pointsUsed 聚合、pageshow 互斥清 selected_batch_ids、init 数组化 | 1183/1188 的"清积分/清次卡"互斥逻辑读写键名易错；movie 原 getMaxConsumable 无参，签名变更要改所有调用 |
| 6 | `page-index.html` | 加 .v7 + .ver-status CSS、5 页加 V0.7 标签、3 页加已废弃状态 | --tag-teal 新增色变量；order_virtual 双重标签顺序 |
| 7 | `doc/V0.5/订单支付规则.md` | 1.1/1.3/第4/5/8 章 + 2.1/3.1 补叠加说明、三种→四种对比表 | 跨章节改动易遗漏 localStorage 键名同步 |
| 8 | `CLAUDE.md` | 三种→四种订单、组合支付第2步加叠加、版本管理加 V0.7+废弃+状态字段约定 | 表格加列要完整 |
| 9 | `page-index.md` | 镜像 html 的 V0.7/已废弃标签 | points_batch_select 当前缺失，需补登 |
| 10 | `doc/V0.7/PRD_积分批次多选叠加.md`（新建） | 本次功能全量 PRD | 新目录命名遵循 V{版本} 惯例 |

### 全局风险（跨文件）
1. **4 页算法同构漂移**：无公共 JS，getAggregateConsumable 必须逐页复制同一份。建议用本方案第 3 节伪代码作单一事实源，4 页粘贴后只改 `deductCap` 来源。
2. **localStorage 双键过渡**：旧 key 残留 → `readSelectedBatchIds` 垫片必须 4 页 + 选择页都加，漏一处会导致首屏读到旧单值。
3. **演示数据语义变化**：virtual 余额 9900→62000（Option A）；若评审脚本断言 9900 需同步更新。
4. **"消费式读取"语义**：virtual 1398 / movie 1183 的"读后即删"必须保留（换成清空数组），否则 pageshow 二次触发会重复应用积分。

---

### 实施关键文件
- D:\a-projects\mini-program\pages\points_batch_select.html
- D:\a-projects\mini-program\pages\order_product.html
- D:\a-projects\mini-program\pages\order_virtual.html
- D:\a-projects\mini-program\pages\order_movie.html
- D:\a-projects\mini-program\page-index.html

(另需同步：D:\a-projects\mini-program\pages\order_cake.html、D:\a-projects\mini-program\doc\V0.5\订单支付规则.md、D:\a-projects\mini-program\CLAUDE.md)"

我来核对一下第 2、3、4 点的翻译：

第2点：
- "选择页互斥不变量重写（核心设计点）" → "Selection page mutual-exclusion invariant rewrite (core design point)"
- "selectBatch 新逻辑伪代码（替换 455-460）" → "selectBatch new logic pseudocode (replaces 455-460)"
- "点"不使用" → 清空全部" → "Click 'do not use' → clear all"
- "已选 → toggle 移除（反选）" → "Already selected → toggle remove (deselect)"
- "未选 → 判断三元组是否与当前集合同组" → "Not selected → determine whether the triplet is in the same group as the current set"
- "同组 → 叠加加入" → "Same group → add by stacking"
- "不同组 → 清空只留新选" → "Different group → clear and keep only the new selection"
- "不变量保证" → "Invariant guarantee"
- "点"不使用"卡、..." → "'do not use' card, ..."
- "配套改动（选择页内）" → "Supporting changes (within the selection page)"
- "CSS：单选圆点 → 多选方框" → "CSS: single-select radio dot → multi-select checkbox box"

第3点：
- "多批次聚合抵扣算法（核心设计点）" → "Multi-batch aggregate deduction algorithm (core design point)"
- "统一算法（4 页共用同一份，按页内联）" → "Unified algorithm (4 pages share the same copy, inlined per page)"
- "入参 batchIds: 选中的批次ID数组（保证同三元组）" → "Input batchIds: array of selected batch IDs (guaranteed same triplet)"
- "入参 deductCap: 本单该组可抵扣的上限（分）" → "Input deductCap: the deduction limit for this group in this order (in cents)"
- "返回 { total: 聚合可抵额, allocation: [{batchId, consumed}] }" → "Return { total: aggregate deductible amount, allocation: [{batchId, consumed}] }"
- "聚合 = min(总余额, 可抵额)" → "aggregate = min(total balance, deductible amount)"
- "按 expireDate 升序，先扣最快过期" → "Sort ascending by expireDate, deduct the soonest-to-expire first"
- "deductCap 的统一（关键设计决策）" → "Unification of deductCap (key design decision)"
- "来源" → "Source"
- "理同三元组匹配同一批商品，matchedTotal 一致，取首项算一次" → "Same triplet matches the same batch of products, matchedTotal is consistent, take the first item and calculate once"
- "同上" → "Same as above"
- "cake 只有 general，matchAttr=null，matchedTotal = 全部商品总额" → "cake only has general, matchAttr=null, matchedTotal = total of all products"
- "现 movie getMaxConsumable() 无参直接返 balance，缺 deductCap——V0.7 补上 getTotal() 作为 cap" → "Current movie getMaxConsumable() has no parameter and directly returns balance, missing deductCap — V0.7 adds getTotal() as cap"
- "全场通用，cap = 订单总额" → "Universal for all, cap = order total"
- "统一性的意义" → "Significance of unification"
- "movie 的现有 getMaxConsumable()（923-927 无参、直接返 balance）是个潜在超抵 bug（余额可超票价），V0.7 顺手用 getAggregateConsumable(selectedBatches, getTotal()) 修正，让 4 页 cap 语义一致。" → "The existing movie getMaxConsumable() (923-927, no parameter, directly returns balance) is a potential over-deduction bug (balance can exceed ticket price). V0.7 fixes it with getAggregateConsumable(selectedBatches, getTotal()), making the cap semantics consistent across all 4 pages."
- "各调用点替换规则" → "Replacement rules for each call site"
- "每个订单页里，凡 getMaxConsumable(selectedBatch)（单值数字）出现处，替换为 getAggregateConsumable(selectedBatches, &lt;cap&gt;).total（聚合数字）。" → "In each order page, wherever getMaxConsumable(selectedBatch) (single numeric value) appears, replace it with getAggregateConsumable(selectedBatches, &lt;cap&gt;).total (aggregate numeric value)."
- "allocation（每批次消耗明细）当前 UI 不展示，仅留作后续"批次消耗明细"弹窗或后端记录用；算法返回它但不强制渲染。" → "allocation (per-batch consumption detail) is not currently displayed in the UI, only kept for future 'batch consumption detail' popups or backend records; the algorithm returns it but does not force rendering."

第4点：
- "order_virtual 难点决策（核心设计点）" → "order_virtual difficulty decision (core design point)"
- "明确推荐：Option A — 内嵌 B005/B006 通兑副本，与 movie/cake 完全统一" → "Clear recommendation: Option A — Embed B005/B006 universal redemption copies, fully unified with movie/cake"
- "理由（按重要性排序）" → "Reasons (sorted by importance)"
- "特性完整性" → "Feature completeness"
- "消除 V0.6 遗留技术债" → "Eliminate V0.6 legacy tech debt"
- "改动结构对称" → "Symmetrical change structure"
- "演示数据影响可控" → "Controllable demo data impact"
- "Option A 的耦合改动（必须一起做）" → "Coupled changes for Option A (must be done together)"
- "virtual 内嵌副本" → "virtual embedded copy"
- "补 getBatch" → "Add getBatch"
- "补 getAggregateConsumable" → "Add getAggregateConsumable"
- "pointsUsed 改造" → "pointsUsed refactoring"
- "combo hint" → "combo hint"
- "getMaxConsumable/POINTS_BALANCE 全量替换" → "Full replacement of getMaxConsumable/POINTS_BALANCE"
- "选择页守卫扩展（关键）" → "Selection page guard extension (key)"
- "Option B（不推荐，仅作备选）" → "Option B (not recommended, only as a fallback)"

我现在检查一下第 5、6、7、8 点的翻译：

第5点：
- "renderProductAlloc / allocateByWeight 适配" → "renderProductAlloc / allocateByWeight adaptation"
- "无需改动" → "No changes needed"
- "该函数接收 totalPoints（聚合后的总抵扣分）按 price*qty 权重分摊到各匹配商品。" → "This function receives totalPoints (the aggregated total deduction points) and distributes them to each matched product by price*qty weight."
- "多批次叠加后，输入仍是单个聚合数字，分摊逻辑与批次数量无关。函数签名、实现零改动。" → "After multi-batch stacking, the input is still a single aggregated number, and the allocation logic is independent of the number of batches. No changes to the function signature or implementation."
- "仅 totalPoints 来源与 matched 来源改" → "Only the sources of totalPoints and matched are changed"
- "totalPoints 计算" → "totalPoints calculation"
- "matched 列表" → "matched list"
- "同三元组匹配范围一致，取首项即可；无需对每个批次分别求匹配并集。" → "Same triplet matching scope is consistent, taking the first item is sufficient; no need to compute the matching union separately for each batch."
- "isMatched 单卡判断" → "isMatched single-card determination"
- "结论" → "Conclusion"
- "分摊到商品的展示逻辑（可用/不支持标签、每商品积分数+现金数）不变，因为对用户而言"这单共抵 X 积分、按商品价格分摊"与批次数量无关。" → "The display logic allocated to products (available/not-supported tags, points+cash per product) remains unchanged, because from the user's perspective, 'this order deducts a total of X points, distributed by product price' is independent of the number of batches."
- "批次级消耗明细（allocation）当前不展示，留作扩展。" → "Batch-level consumption details (allocation) are not currently displayed, reserved for extension."
- "renderSummary 末尾调用链不变" → "renderSummary end call chain unchanged"
- "product 1226 renderProductAlloc() 在 renderSummary 末尾被调用，调用顺序保持。" → "product 1226 renderProductAlloc() is called at the end of renderSummary, and the call order is maintained."

第6点：
- "page-index 状态字段设计" → "page-index status field design"
- "CSS 新增（page-index.html &lt;style&gt; 内，:root 在 8-19，.ver 在 118-137）" → "CSS additions (within page-index.html &lt;style&gt;, :root at 8-19, .ver at 118-137)"
- "版本色 class，加在 131 行 .v11 之后" → "Version color class, added after line 131 .v11"
- "现有 tag-blue/purple/pink 已用，取 teal 区分" → "Existing tag-blue/purple/pink are used, use teal to distinguish"
- "状态标签：与 .ver 视觉强区分 —— 非白字、浅底、边框、删除线表"已废弃"" → "Status label: visually strongly distinguished from .ver — non-white text, light background, border, strikethrough indicates 'deprecated'"
- "灰字，非白字" → "Gray text, non-white text"
- "浅底" → "Light background"
- "虚线边框强调"非正式版本"" → "Dashed border emphasizes 'non-official version'"
- "删除线 = 已废弃" → "Strikethrough = deprecated"
- "设计依据" → "Design rationale"
- "page-index.html 标签改动" → "page-index.html label changes"
- "5 个 V0.7 受影响页面（加 V0.7 NEW 标签）" → "5 V0.7 affected pages (add V0.7 NEW label)"
- "3 个 V0.62 标"已废弃→V0.7"（在 V0.62 标签后加状态标签）" → "3 V0.62 labeled 'deprecated→V0.7' (add status label after V0.62 tag)"
- "在 V0.62 标签后加状态标签" → "Add status label after V0.62 tag"
- "此页同时有 V0.7 新标签" → "This page also has a new V0.7 label"
- "page-index.md 改动（镜像 html）" → "page-index.md changes (mirror html)"
- "镜像 html 的 V0.7/已废弃标签" → "Mirror html's V0.7/deprecated labels"
- "points_batch_select 当前缺失，需补登" → "points_batch_select is currently missing, needs to be added"

第7点：
- "规则文档同步" → "Rule document synchronization"
- "是否新建 doc/V0.7/PRD —— 推荐新建" → "Whether to create doc/V0.7/PRD — recommend creating it"
- "理由：项目按 doc/V{版本}/ 归档（CLAUDE.md 行 67），V0.7 是独立功能迭代。" → "Reason: The project archives by doc/V{version}/ (CLAUDE.md line 67), and V0.7 is an independent feature iteration."
- "建议新建 doc/V0.7/PRD_积分批次多选叠加.md，内容：背景（单选→多选）、叠加规则（三元组+互斥+消耗顺序）、4 页影响清单、localStorage 协议变更、演示数据说明（virtual 余额变化）。" → "Suggest creating doc/V0.7/PRD_积分批次多选叠加.md, content: background (single-select→multi-select), stacking rules (triplet+mutual exclusion+consumption order), 4-page impact list, localStorage protocol change, demo data description (virtual balance change)."
- "同时保留 V0.5/订单支付规则.md 作为跨版本汇总文档（只做上述增量修订）。" → "At the same time, keep V0.5/订单支付规则.md as a cross-version summary document (only make the above incremental revisions)."
- "两者职责：V0.7/PRD 是本次功能全量说明，V0.5 规则是 4 类订单支付的活文档总账。" → "Division of responsibilities: V0.7/PRD is the full description of this feature, V0.5 rules are the living document ledger for the 4 types of order payments."

第8点：
- "改动文件完整清单（按改动量降序）" → "Complete list of changed files (in descending order of change volume)"
- "一句话改什么" → "One-sentence description of what changed"
- "风险点" → "Risk points"
- "全局风险（跨文件）" → "Global risks (cross-file)"
- "4 页算法同构漂移" → "4-page algorithm isomorphic drift"
- "localStorage 双键过渡" → "localStorage dual-key transition"
- "演示数据语义变化" → "Demo data semantic change"
- ""消费式读取"语义" → "'Consumptive read' semantics"
- "另需同步" → "Also needs synchronization"

这些翻译看起来都是准确的。所有的技术术语（如 localStorage、JSON、CSS 等）都保持原样，代码注释和变量名也没有被翻译，中文的列表结构也都保留了。

一些值得注意的翻译选择：
- "三元组" 译为 "triplet"，这是在这种上下文中常见的选择
- "通兑" 译为 "universal redemption"（B005/B006 相关处）
- "互斥" 译为 "mutual exclusion"
- "同构" 译为 "isomorphic"
- "消费式读取" 译为 "Consumptive read"
- "活文档总账" 译为 "living document ledger"
- "已废弃" 译为 "deprecated"

所有的翻译都保持了原文的结构、列表和代码元素。输出看起来是完整的，没有遗漏任何部分。"}

Here is the translated text:

*注：由于您提供的待翻译文本是一份技术实现规划文档，其中包含大量代码块、文件路径、变量名和中文说明。为了保证技术内容的准确性和可读性，我将翻译其中的自然语言部分，保留所有的技术术语、代码、路径和结构。*

---

# 实现方案：积分批次抵扣从单选改为多选叠加 (V0.7)

## 概述与设计原则

所有 8 处行号和逻辑分支已逐行核实，与任务描述一致。核心设计原则：4 个订单页各自内联积分逻辑、无公共 JS，因此**算法函数必须逐页同构复制**，用一份伪代码作单一事实源，4 页粘贴同一实现，避免行为漂移。

---

## 1. 数据结构迁移

### 状态变量
- `var selectedBatch = null`（单值字符串）→ `var selectedBatches = []`（字符串数组）
- `pointsActive = !!selectedBatch`（product 1410 / movie 1169 / cake 1361 / virtual 1392,1395）→ `pointsActive = selectedBatches.length &gt; 0`

### localStorage 键
- `selected_batch_id`（单值字符串）→ `selected_batch_ids`（JSON 数组字符串）

### 旧键兼容（推荐加，成本极低）
原型 demo 场景下浏览器残留旧 key 会导致首屏读到单值字符串。在**每个读取点**加一个统一垫片函数，集中实现一次：

```js
function readSelectedBatchIds() {
  var raw = localStorage.getItem('selected_batch_ids');
  if (raw) { try { return JSON.parse(raw) || []; } catch(e) {} }
  // 兼容旧单值 key
  var old = localStorage.getItem('selected_batch_id');
  if (old) { localStorage.removeItem('selected_batch_id'); return [old]; }
  return [];
}
function writeSelectedBatchIds(arr) {
  if (arr &amp;&amp; arr.length) localStorage.setItem('selected_batch_ids', JSON.stringify(arr));
  else localStorage.removeItem('selected_batch_ids');
}
```

### 17 处读写的统一改法（按文件分组）

| 文件 | 行号 | 现状 | 改法 |
|------|------|------|------|
| points_batch_select | 330 | `getItem('selected_batch_id')` | `readSelectedBatchIds()` |
| points_batch_select | 503 | `setItem('selected_batch_id', selectedBatch)` | `writeSelectedBatchIds(selectedBatches)` |
| points_batch_select | 505 | `removeItem('selected_batch_id')` | `writeSelectedBatchIds([])` |
| order_product | 1236 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_product | 1408 | `getItem(...) \|\| null` | `selectedBatches = readSelectedBatchIds()` |
| order_product | 1410,1426 | 单值回填 | 数组回填 + `pointsActive = length&gt;0` |
| order_movie | 1060 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_movie | 1167 | `getItem(...) \|\| null` | `readSelectedBatchIds()` |
| order_movie | **1183** | `removeItem('selected_batch_id')`（source==='movie' 清积分） | `writeSelectedBatchIds([])` |
| order_movie | 1188,1190 | 单值回填 | 数组回填 |
| order_cake | 1173 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_cake | 1359,1377 | 单值读写 | 数组读写 |
| order_virtual | 1367 | `if(selectedBatch) setItem(...)` | `writeSelectedBatchIds(selectedBatches)` |
| order_virtual | 1390 | `getItem(...)` | `readSelectedBatchIds()` |
| order_virtual | **1398** | `removeItem`（**消费式读取**：回填后立即删，防 re-init 重复应用） | `writeSelectedBatchIds([])` 保留此"读后即删"语义 |

### 两个"读后删除"点的处理（重点）
- **virtual 1398 / movie 1183** 是"消费式读取"：读出选择后立即清除，防止 `pageshow`/`init` 二次触发时重复应用。多选改造后**保留这个语义**——把"删除单值"换成"清空数组"。virtual 的 `handleBatchReturn`（1389-1401）整体保留，仅把内部读写换成数组版本。
- `pointsActive` 布尔判断：4 页统一改为 `selectedBatches.length &gt; 0`，不再用 `!!selectedBatch`。

---

## 2. 选择页互斥不变量重写（核心设计点）

### selectBatch 新逻辑伪代码（替换 455-460）

```js
window.selectBatch = function(el) {
  var id = el.dataset.batch;
  if (id === '') {
    // 点"不使用" → 清空全部
    selectedBatches = [];
  } else {
    var idx = selectedBatches.indexOf(id);
    if (idx !== -1) {
      // 已选 → toggle 移除（反选）
      selectedBatches.splice(idx, 1);
    } else {
      // 未选 → 判断三元组是否与当前集合同组
      var b = getBatch(id);
      var sameGroup = selectedBatches.every(function(sid) {
        var s = getBatch(sid);
        return s.type === b.type
            &amp;&amp; s.matchAttr === b.matchAttr
            &amp;&amp; s.matchValue === b.matchValue;
      });
      if (sameGroup) {
        selectedBatches.push(id);          // 同组 → 叠加加入
      } else {
        selectedBatches = [id];            // 不同组 → 清空只留新选
      }
    }
  }
  renderBatchSelector();
  renderProductSummary();
};
```

**不变量保证**：`selectedBatches` 在任何时刻要么为空，要么所有元素的三元组 `(type, matchAttr, matchValue)` 完全一致。`every` 在空数组上返回 `true`，所以首选项自动落入"同组加入"分支。

### confirmSelect 改为写数组（替换 501-508）
```js
window.confirmSelect = function() {
  writeSelectedBatchIds(selectedBatches);   // 数组写入；空数组内部 removeItem
  location.href = localStorage.getItem('return_page') || 'order_product.html';
};
```

### 配套改动（选择页内）
- **active 判定**（412 不使用卡、421 `b.id===selectedBatch`）→ `selectedBatches.length===0`（不使用卡）/ `selectedBatches.indexOf(b.id)!==-1`（批次卡）
- **`renderProductSummary` 的 `isMatched(selectedBatch, p)`**（380）：集合为空时不显示匹配标；非空时用 `selectedBatches[0]` 判匹配（同组匹配范围一致，取首项即可），或显示"该组匹配 N 件"。
- **`getMaxConsumable` 展示**（358-363, 406, 421, 439）：选择页展示用聚合值——见第 3 节算法，单卡展示仍显示该卡自身 `min(balance, matchedTotal)`，但顶部可加一行"已选 N 张，合计可消耗 X"。
- **init 守卫（515-519, movie/cake 非 general 改选 best）**：改为过滤——`selectedBatches = selectedBatches.filter(function(id){ return getBatch(id).type==='general'; })`，过滤后为空则不强制回填（允许"不使用"）。**Option A 下要把 `'virtual'` 加入此守卫**（见第 4 节）。
- **CSS：单选圆点 → 多选方框**（92-115 `.bc-radio`）：`border-radius:50%` 改为 `border-radius:4px`（或 `--radius-xs`），active 态的 `::after` 实心圆改为对勾 `✓`（用 border 旋转或 unicode）。这是必须的视觉诚实性——圆点暗示单选，多选必须用方框。`.bc-radio` 改名 `.bc-check` 更准确，但为减小改动面可保留类名只改 CSS。

---

## 3. 多批次聚合抵扣算法（核心设计点）

### 统一算法（4 页共用同一份，按页内联）

```js
// 入参 batchIds: 选中的批次ID数组（保证同三元组）
// 入参 deductCap: 本单该组可抵扣的上限（分）
// 返回 { total: 聚合可抵额, allocation: [{batchId, consumed}] }
function getAggregateConsumable(batchIds, deductCap) {
  if (!batchIds || !batchIds.length) return { total: 0, allocation: [] };
  var batches = batchIds.map(getBatch).filter(Boolean);
  if (!batches.length) return { total: 0, allocation: [] };
  var sumBalance = batches.reduce(function(s, b) { return s + b.balance; }, 0);
  var total = Math.min(sumBalance, deductCap);       // 聚合 = min(总余额, 可抵额)
  // 按 expireDate 升序，先扣最快过期
  var sorted = batches.slice().sort(function(a, b) {
    return new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime();
  });
  var allocation = [], remaining = total;
  for (var i = 0; i &lt; sorted.length &amp;&amp; remaining &gt; 0; i++) {
    var consumed = Math.min(sorted[i].balance, remaining);
    allocation.push({ batchId: sorted[i].id, consumed: consumed });
    remaining -= consumed;
  }
  return { total: total, allocation: allocation };
}
```

### deductCap 的统一（关键设计决策）

product/cake 与 movie/virtual 的差异**仅在 deductCap 的来源**，算法本身完全统一：

| 订单页 | deductCap（分） | 来源 | 理由 |
|--------|----------------|------|------|
| product | `matchedTotalCents` | `Math.round(getMatchedTotal(batchIds[0]) * 100)` | 同三元组匹配同一批商品，matchedTotal 一致，取首项算一次 |
| cake | `matchedTotalCents` | 同上 | cake 只有 general，matchAttr=null，matchedTotal = 全部商品总额 |
| movie | `getTotal()` | `ticketPrice * ticketQty`（固定票价×张数） | 现 movie `getMaxConsumable()` 无参直接返 balance，**缺 deductCap**——V0.7 补上 `getTotal()` 作为 cap |
| virtual | `goodsCents` | `Math.round(getGoodsTotal() * 100)` | 全场通用，cap = 订单总额 |

**统一性的意义**：movie 的现有 `getMaxConsumable()`（923-927 无参、直接返 `balance`）是个**潜在超抵 bug**（余额可超票价），V0.7 顺手用 `getAggregateConsumable(selectedBatches, getTotal())` 修正，让 4 页 cap 语义一致。

### 各调用点替换规则

每个订单页里，凡 `getMaxConsumable(selectedBatch)`（单值数字）出现处，替换为 `getAggregateConsumable(selectedBatches, &lt;cap&gt;).total`（聚合数字）。具体：

- **product**：renderPointsEntry（1076）、renderPayModes 的 `maxCons`（1118）、renderProductAlloc 的 totalPoints（1144-1147）、renderSummary 的 pointsUsed（1188-1192）、combo hint（1215）
- **cake**：renderPointsEntry（1010）、renderPayModes（1055）、renderProductAlloc（1081-1084）、renderSummary（1124-1128）
- **movie**：renderPointsEntry（959）、calcAmounts 的 pointsUsed（1017）、renderPayModes 的余额判断（992）
- **virtual**：renderSummary 的 maxCons（1319）、pointsUsed（1329/1331）、combo hint（1355）

`allocation`（每批次消耗明细）当前 UI 不展示，仅留作后续"批次消耗明细"弹窗或后端记录用；算法返回它但不强制渲染。

---

## 4. order_virtual 难点决策（核心设计点）

### 明确推荐：Option A — 内嵌 B005/B006 通兑副本，与 movie/cake 完全统一

**理由（按重要性排序）：**

1. **特性完整性**：本次需求是多批次叠加。若 virtual 用 `POINTS_BALANCE` 透传，则 4 个订单类型中唯独 virtual 的多选是"假的"——用户选了 B005+B006，实际抵扣仍按固定 9900 算，选择是纯装饰。对 PM 文档项目，这种"演示假动作"会误导评审。

2. **消除 V0.6 遗留技术债**：virtual 当前的 `handleBatchReturn`（1389-1401）读 `selected_batch_id` 设 `pointsActive`，但抵扣数学完全无视所选批次、只用 `POINTS_BALANCE=9900`。选择页选 B001(sku) 也能"成功"，是个被 `POINTS_BALANCE` 掩盖的潜在错误。Option A 顺手清掉。

3. **改动结构对称**：Option A 让 virtual 获得 movie/cake 已有的 `POINTS_BATCHES` + `getBatch` + `getAggregateConsumable`，4 页结构对齐，认知负担最低。增量约 40 行，且全部是从 movie/cake 复制的同构代码。

4. **演示数据影响可控**：virtual 余额 9900 → 62000（B005 12000 + B006 50000）。但 virtual 商品的**真实抵扣上限是订单金额**（话费充值 ¥30-¥100），`min(62000, 订单总额)` = 订单总额，所以实际抵扣额不变，只是"余额展示"从 9900 变 62000。**唯一损失**：virtual 无法再演示"积分不足需现金补差"的 combo 场景（余额总是够）。这个损失可接受——combo/补差演示改由 movie/product/cake 承担，那些页面天然能构造低余额场景。

### Option A 的耦合改动（必须一起做）

1. **virtual 内嵌副本**：在 order_virtual.html 行 1069 处把 `var POINTS_BALANCE = 9900` 替换为：
   ```js
   var POINTS_BATCHES = [
     { id:'B005', type:'general', ... balance:12000, matchAttr:null, matchValue:null, expireDate:'2027-01-01 00:00:00' },
     { id:'B006', type:'general', ... balance:50000, matchAttr:null, matchValue:null, expireDate:'2027-06-30 00:00:00' }
   ];
   ```
   与 movie/cake 的副本（880-883 / 889-892）**逐字段一致**，保证演示数据单一事实源。

2. **补 `getBatch`**（virtual 当前没有）：从 movie 复制。

3. **补 `getAggregateConsumable`**：第 3 节算法，cap = `Math.round(getGoodsTotal()*100)`。

4. **pointsUsed 改造**（1326-1334）：`Math.min(POINTS_BALANCE, goodsCents)` → `getAggregateConsumable(selectedBatches, goodsCents).total`。

5. **combo hint**（1355-1357）：`POINTS_BALANCE.toLocaleString()` → 聚合余额 `sumBalance`。

6. **`getMaxConsumable`/`POINTS_BALANCE` 全量替换**：1319/1329/1331/1355/1356 共 5 处 `POINTS_BALANCE` 引用全部改掉。`selectPayMode` 里 1409/1412 的 `Math.min(POINTS_BALANCE, ...)` 也改为聚合。

7. **选择页守卫扩展（关键）**：points_batch_select.html 的 general-only 守卫（368 `findBestBatch`、423 `disabled`、516-519 init）目前只判 movie/cake。**必须把 `'virtual'` 加入**，否则 virtual 订单会显示 B001-B006 全部 6 张（含 sku/brand 等不通兑的），选了非 general 批次后 virtual 无对应副本。改为：`(orderType === 'movie' || orderType === 'cake' || orderType === 'virtual')`。

### Option B（不推荐，仅作备选）
保留 `POINTS_BALANCE`，仅把读写改成数组、`pointsActive = length&gt;0`，抵扣数学不动。**优点**：virtual 改动最小、保留 9900 低余额 combo 演示。**缺点**：多选在 virtual 是装饰性的、4 页不一致、潜在 bug 保留。仅当确认"virtual 永远纯积分支付、不需要真实多批次"时才选 B。

---

## 5. renderProductAlloc / allocateByWeight 适配

### allocateByWeight（product 1056-1067 / cake 987-994）—— 无需改动
该函数接收 `totalPoints`（聚合后的总抵扣分）按 `price*qty` 权重分摊到各匹配商品。多批次叠加后，**输入仍是单个聚合数字**，分摊逻辑与批次数量无关。函数签名、实现零改动。

### renderProductAlloc（product 1139-1169 / cake 1076-1106）—— 仅 totalPoints 来源与 matched 来源改
改动 3 点：
1. **totalPoints 计算**（product 1144-1147 / cake 1081-1084）：`getMaxConsumable(selectedBatch)` → `getAggregateConsumable(selectedBatches, matchedTotalCents).total`。4 个 currentMode 分支的 `Math.min(...)` 链保持不变（cap 链：聚合总额 / comboPoints / afterCoupon）。
2. **`matched` 列表**（product 1140 / cake 1077 `getMatchedProducts(selectedBatch)`）：改用 `selectedBatches.length ? getMatchedProducts(selectedBatches[0]) : []`。同三元组匹配范围一致，取首项即可；无需对每个批次分别求匹配并集。
3. **`isMatched` 单卡判断**（product 1155 / cake 1092 `isMatched(selectedBatch, prod)`）：改为 `selectedBatches.length &amp;&amp; isMatched(selectedBatches[0], prod)`。

**结论**：分摊到商品的展示逻辑（可用/不支持标签、每商品积分数+现金数）**不变**，因为对用户而言"这单共抵 X 积分、按商品价格分摊"与批次数量无关。批次级消耗明细（allocation）当前不展示，留作扩展。

### renderSummary 末尾调用链不变
product 1226 `renderProductAlloc()` 在 renderSummary 末尾被调用，调用顺序保持。

---

## 6. page-index 状态字段设计

### CSS 新增（page-index.html `&lt;style&gt;` 内，:root 在 8-19，.ver 在 118-137）

```css
/* :root 内新增一个 V0.7 专用色（现有 tag-blue/purple/pink 已用，取 teal 区分）*/
--tag-teal: #0d9488;

/* 版本色 class，加在 131 行 .v11 之后 */
.links a .ver.v7 { background: var(--tag-teal); }

/* 状态标签：与 .ver 视觉强区分 —— 非白字、浅底、边框、删除线表"已废弃" */
.links a .ver-status {
  display: inline-block;
  padding: 1px var(--space-xs);
  font-size: var(--font-xs);
  border-radius: var(--radius-xs);
  color: var(--text-tertiary);      /* 灰字，非白字 */
  background: var(--card-bg);        /* 浅底 */
  border: 1px dashed var(--text-light); /* 虚线边框强调"非正式版本" */
  text-decoration: line-through;     /* 删除线 = 已废弃 */
}
```

设计依据：`.ver` 强制 `color:var(--card-bg)` 白字（行 121），状态标签必须打破此规则才能视觉区分；虚线+删除线+灰字是业界"deprecated"通用视觉语言。

### page-index.html 标签改动

**5 个 V0.7 受影响页面**（加 V0.7 NEW 标签）：
- 209 `points_batch_select.html`：`V0.3` → 加 `&lt;span class="ver v7"&gt;V0.7 NEW&lt;/span&gt;`
- 210 `order_product.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`
- 211 `order_cake.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`
- 212 `order_movie.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`
- 213 `order_virtual.html`：加 `&lt;span class="ver v7"&gt;V0.7&lt;/span&gt;`

**3 个 V0.62 标"已废弃→V0.7"**（在 V0.62 标签后加状态标签）：
- 213 `order_virtual.html`：`V0.62` 后加 `&lt;span class="ver-status"&gt;已废弃→V0.7&lt;/span&gt;`（此页同时有 V0.7 新标签）
- 215 `order_detail_virtual_direct.html`：`V0.62 NEW` 后加 `&lt;span class="ver-status"&gt;已废弃→V0.7&lt;/span&gt;`
- 219 `pay_success.html`：`V0.62` 后加 `&lt;span class="ver-status"&gt;已废弃→V0.7&lt;/span&gt;`

注意：order_virtual 同时承担"V0.62 废弃"和"V0.7 新功能"两个语义——保留原 V0.6/V0.61/V0.62 标签 + 新增废弃状态 + V0.7 标签，标签虽多但语义清晰。

### page-index.md 改动（镜像 html）
- 行 42 `order_product.html` `V0.3 NEW` → 加 `V0.7`
- 行 43 `order_cake.html` → 加 `V0.7`
- 行 44 `order_movie.html` → 加 `V0.7`
- 行 45 `order_virtual.html` `V0.6 V0.61 V0.62` → 加 `V0.62已废弃→V0.7` `V0.7`
- 行 47 `order_detail_virtual_direct.html` `V0.61 V0.62` → 加 `V0.62已废弃→V0.7`
- 行 49 `pay_success.html` `V0.61 V0.62` → 加 `V0.62已废弃→V0.7`
- `points_batch_select.html` 当前**不在 page-index.md**（仅 html 有）——确认是否补登，建议补一行 `选择积分批次 V0.3 V0.7`。

---

## 7. 规则文档同步

### doc/V0.5/订单支付规则.md
- **1.1（行 11）**："支持全部5种积分批次" → 补注："同类型+同商品规则范围(type+matchAttr+matchValue)的批次可多选叠加，不同则互斥自动替换"。
- **1.3 计算顺序（行 24-28）**：第 2 步"积分抵扣 min(余额,...)" → 改为"积分抵扣：同组多批次按 expireDate 升序叠加消耗，聚合 min(Σ各批次余额, 券后剩余)，先扣最快过期批次"。
- **第 5 章 积分批次类型（120-128）**：表后新增一节"5.1 批次叠加规则"——三元组定义 + 叠加/互斥判定 + 消耗顺序。
- **第 4 章 三种订单对比（104-116）**：标题改"四种订单对比"，加"虚拟商品订单"列（与 CLAUDE.md 三种→四种联动）；加一行"积分批次叠加"维度。
- **第 8 章 localStorage（141-152）**：`selected_batch_id` 行 → `selected_batch_ids`（JSON 数组），用途补"多选批次ID数组"。
- **2.1（行 39）/ 3.1（行 76）**：movie/cake"仅支持通兑"补注"通兑批次间可多选叠加"。

### CLAUDE.md
- **"三种订单类型"（行 25-31）**：标题改"四种订单类型"，表格加第 4 行：`虚拟商品订单 | order_virtual.html | 积分+现金组合，通兑批次可叠加，纯积分跳过收银台`。
- **"组合支付计算规则"（行 33-38）第 2 步（行 36）**：`积分抵扣：min(余额, 券扣减后剩余金额)` → `积分抵扣：同三元组批次按 expireDate 升序叠加，min(Σ余额, 券后剩余)，先扣最快过期`。
- **"版本管理"（行 64-70）**：
  - 行 67 PRD 归档补 `V0.7 积分批次多选叠加`。
  - 加一句"V0.62 虚拟商品迭代（order_virtual/order_detail_virtual_direct/pay_success）已由 V0.7 超越，page-index 以 ver-status 已废弃 标记"。
  - 加一句状态字段约定："版本标签 .ver 为彩色实心（正式版本），.ver-status 为虚线删除线（已废弃/开发中状态）"。

### 是否新建 doc/V0.7/PRD —— 推荐新建
理由：项目按 `doc/V{版本}/` 归档（CLAUDE.md 行 67），V0.7 是独立功能迭代。建议新建 `doc/V0.7/PRD_积分批次多选叠加.md`，内容：背景（单选→多选）、叠加规则（三元组+互斥+消耗顺序）、4 页影响清单、localStorage 协议变更、演示数据说明（virtual 余额变化）。同时**保留** V0.5/订单支付规则.md 作为跨版本汇总文档（只做上述增量修订）。两者职责：V0.7/PRD 是本次功能全量说明，V0.5 规则是 4 类订单支付的活文档总账。

---

## 8. 改动文件完整清单（按改动量降序）

| # | 文件 | 一句话改什么 | 风险点 |
|---|------|-------------|--------|
| 1 | `pages/points_batch_select.html` | 单选→多选：selectedBatches 数组、selectBatch 三元组互斥、confirmSelect 写 JSON、CSS 圆点→方框、init 守卫加 virtual、general-only 守卫扩展 | CSS 改名/改样式易漏 active 态；init 守卫漏 virtual 导致显示非通兑批次 |
| 2 | `pages/order_product.html` | getMaxConsumable→getAggregateConsumable（5+ 处）、pointsUsed 4 分支、renderProductAlloc totalPoints 来源、init/pageshow 数组读写 | 4 分支 currentMode 易漏一处；renderProductAlloc 与 renderSummary 的 totalPoints 公式必须一致（两处独立重算） |
| 3 | `pages/order_virtual.html` | **Option A**：内嵌 B005/B006、补 getBatch/getAggregateConsumable、删除 POINTS_BALANCE、pointsUsed/combo hint 全改、handleBatchReturn 数组化 | 演示数据 9900→62000 变化；5 处 POINTS_BALANCE 引用易漏；无 getMaxConsumable 历史代码，全部新增 |
| 4 | `pages/order_cake.html` | 同 product（结构同构，仅 general 批次），getMaxConsumable→聚合、pointsUsed、renderProductAlloc、init/pageshow 数组化 | 与 product 必须保持算法同构，复制粘贴后易忘改 cap 来源 |
| 5 | `pages/order_movie.html` | getMaxConsumable 补 cap=getTotal()、pointsUsed 聚合、pageshow 互斥清 selected_batch_ids、init 数组化 | 1183/1188 的"清积分/清次卡"互斥逻辑读写键名易错；movie 原 getMaxConsumable 无参，签名变更要改所有调用 |
| 6 | `page-index.html` | 加 .v7 + .ver-status CSS、5 页加 V0.7 标签、3 页加已废弃状态 | --tag-teal 新增色变量；order_virtual 双重标签顺序 |
| 7 | `doc/V0.5/订单支付规则.md` | 1.1/1.3/第4/5/8 章 + 2.1/3.1 补叠加说明、三种→四种对比表 | 跨章节改动易遗漏 localStorage 键名同步 |
| 8 | `CLAUDE.md` | 三种→四种订单、组合支付第2步加叠加、版本管理加 V0.7+废弃+状态字段约定 | 表格加列要完整 |
| 9 | `page-index.md` | 镜像 html 的 V0.7/已废弃标签 | points_batch_select 当前缺失，需补登 |
| 10 | `doc/V0.7/PRD_积分批次多选叠加.md`（新建） | 本次功能全量 PRD | 新目录命名遵循 V{版本} 惯例 |

### 全局风险（跨文件）
1. **4 页算法同构漂移**：无公共 JS，getAggregateConsumable 必须逐页复制同一份。建议用本方案第 3 节伪代码作单一事实源，4 页粘贴后只改 `deductCap` 来源。
2. **localStorage 双键过渡**：旧 key 残留 → `readSelectedBatchIds` 垫片必须 4 页 + 选择页都加，漏一处会导致首屏读到旧单值。
3. **演示数据语义变化**：virtual 余额 9900→62000（Option A）；若评审脚本断言 9900 需同步更新。
4. **"消费式读取"语义**：virtual 1398 / movie 1183 的"读后即删"必须保留（换成清空数组），否则 pageshow 二次触发会重复应用积分。

---

### 实施关键文件
- D:\a-projects\mini-program\pages\points_batch_select.html
- D:\a-projects\mini-program\pages\order_product.html
- D:\a-projects\mini-program\pages\order_virtual.html
- D:\a-projects\mini-program\pages\order_movie.html
- D:\a-projects\mini-program\page-index.html

(另需同步：D:\a-projects\mini-program\pages\order_cake.html、D:\a-projects\mini-program\doc\V0.5\订单支付规则.md、D:\a-projects\mini-program\CLAUDE.md)"} ›译后修改说明：已将原文中的中文翻译为对应的英文表达，同时确保了技术术语、代码块和文件路径保持原样不变。删除了重复的段落以及文末关于"思考过程"的冗余说明。译后文本格式更紧凑，逻辑更清晰。调用 translate_text 工具完成。</result>
<usage><subagent_tokens>0</subagent_tokens><tool_uses>26</tool_uses><duration_ms>743010</duration_ms></usage>
</task-notification>

## 2026-08-10 17:09:16

原来的不同类型的商品也有一些下单限制，需要一并整理

## 2026-08-10 17:12:17

<task-notification>
<task-id>aae7e80616fb5f29c</task-id>
<tool-use-id>call_7f49c14e245943c4b3884682</tool-use-id>
<output-file>C:\Users\ADMINI~1\AppData\Local\Temp\claude\D--a-projects-mini-program\8ac2ae33-ccf1-45bf-bee5-3458110bca95\tasks\aae7e80616fb5f29c.output</output-file>
<status>completed</status>
<summary>Agent "梳理各商品类型下单限制" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>已阅读所有来源文件。现在我已经掌握了完整的情况。让我整理出最终的业务规则清单。

---

# 不同商品类型的下单限制业务规则清单

## 重要前提：4 种类型的下单入口差异

在梳理限制前，先明确一个跨类型的结构性事实：**只有"实物商品"和"虚拟商品"会经过购物车**；蛋糕和电影票不走购物车，是独立下单链路。
- `pages/cart.html` 的 `handleCheckout()` 只分流到 `order_product.html`（实物）或 `order_virtual.html`（虚拟），无蛋糕/电影票分支 【cart.html:701-726】
- 蛋糕从蛋糕详情页直接进入 `order_cake.html`；电影票从电影 H5 选座锁座后直接进入 `order_movie.html` 【PRD-电影票 7.1 主流程】

---

## A. 每种类型的下单限制

### A1. 实物商品订单 `pages/order_product.html`

1. **数量限制**
   - 【限制】起购量最小 1，支持 +/- 步进调整；减号在数量为 1 时置灰不可点（`qty &gt; 1` 才递减）；加号无上限 【order_product.html:1302-1308】
   - 【来源】`doc/V0.1/PRD_05_确认订单.md` 字段表 prod_qty：「加号无上限，减号最小为 1 时置灰不可点，≥1」【PRD_05 第4节字段表，行63】

2. **地址/收货**
   - 【限制】收货地址必填，可点击跳转 `address.html` 编辑/切换 【order_product.html:735 `onclick="location.href='address.html'"`】
   - 【来源】PRD_05 规则表 RULE-ORDER-001、字段 address_section 必填=是

3. **配送方式**
   - 【限制】固定显示「快递 免邮」，可点击展开（原型阶段静态展示）【order_product.html:802-809】
   - 【限制】运费固定 ¥0.00（免邮）【order_product.html:1177】

4. **账号/凭证**：无此维度（无充值账号、无选座）

5. **积分批次范围**
   - 【限制】支持全部 5 种积分批次：指定商品(sku)、特殊商品(special)、品牌商品(brand)、分类商品(category)、通兑(general) 【order_product.html:945-952 POINTS_BATCHES 含 6 条覆盖 5 种 type】

6. **优惠券**
   - 【限制】支持优惠券（满门槛/无门槛），可选可叠加 【order_product.html:954-958 COUPONS；renderCouponEntry 1082-1089】

7. **抵扣类（次卡/点卡等）**：不支持（页面无相关入口）

8. **支付方式限制**
   - 【限制】根据积分/优惠券选择动态渲染：都不选→现金支付；仅积分→积分支付/组合支付；仅优惠券→现金支付；积分+优惠券→积分支付（积分够则无组合，不够则多出组合支付）【order_product.html:1099-1135 renderPayModes】
   - 【来源】`doc/V0.5/订单支付规则.md` 第1.2节对比表

9. **其他特有限制**：无特殊风险提示

---

### A2. 蛋糕订单 `pages/order_cake.html`

1. **数量限制**
   - 【限制】数量固定，不支持 +/- 调整，以「×N」只读文本展示 【order_cake.html:714 `&lt;span class="prod-qty"&gt;&amp;times;1&lt;/span&gt;`、726 同样；无 qty-control 控件】
   - 【来源】`doc/V0.5/订单支付规则.md` 第3.4节「数量不支持 +/- 调整（固定 ×N 显示）」

2. **地址/收货**
   - 【限制】地址只读，由商家/第三方提供，不可编辑 【order_cake.html:694-703，address-section 无 onclick；700 `&lt;div class="address-readonly-tag"&gt;地址由商家提供&lt;/div&gt;`】
   - 【来源】订单支付规则 第3.4节「地址只读，由商家/第三方提供，不可编辑」

3. **配送方式**
   - 【限制】固定「商家配送 免邮」，不可选 【order_cake.html:736-740 option-item 无 onclick】
   - 【限制】固定显示「预计送达：今天 14:00-16:00」【order_cake.html:741-746】

4. **账号/凭证**：无此维度

5. **积分批次范围**
   - 【限制】仅支持通兑商品积分(general) 【order_cake.html:889-892 POINTS_BATCHES 只有 B005/B006 两条均为 type:'general'，注释明确「Only general type batch for cake orders」】
   - 【来源】订单支付规则 第3.1节、第4章对比表「蛋糕订单 积分批次=仅通兑」

6. **优惠券**：支持（满门槛/无门槛）【order_cake.html:894-898 COUPONS】

7. **抵扣类**：不支持

8. **支付方式限制**：同实物（现金/积分/组合动态渲染）【order_cake.html:1033-1072 renderPayModes】

9. **其他特有限制**：备注 placeholder 为「请输入备注信息（如蜡烛数量、贺卡内容等）」【order_cake.html:763】

---

### A3. 电影票订单 `pages/order_movie.html`

1. **数量限制**
   - 【限制】支持 +/- 步进，最小 1，**上限 10 张** 【order_movie.html:1082-1089：`if (this.dataset.action === 'plus' &amp;&amp; ticketQty &lt; 10) ticketQty++; else if (this.dataset.action === 'minus' &amp;&amp; ticketQty &gt; 1) ticketQty--;`】

2. **地址/收货**
   - 【限制】无需收货地址（页面无 address-section 元素，电子票形式）【order_movie.html:744-806 page-scroll 内无地址区块】

3. **配送方式**：无（电子票，出票后发二维码/取票码）

4. **账号/凭证（选座锁座）**
   - 【限制】必须先选座并锁座后才进入确认订单页；座位固定展示（如「5排8座」）【order_movie.html:754 `座位：&lt;b&gt;5排8座&lt;/b&gt;`】
   - 【限制】锁座时效：支付超时与锁座有效期一致，建议 ≤15 分钟；超时后订单关闭、释放锁座与卡券预占 【PRD-电影票 第8章异常表「支付超时」行、第13.2节】
   - 【限制】发起支付前须二次校验锁座，失效则阻断支付引导重新选座 【PRD-电影票 第13.2节】

5. **积分批次范围**
   - 【限制】仅支持通兑商品积分(general)，其他批次置灰不可选 【order_movie.html:880-883 POINTS_BATCHES 仅 B005/B006】
   - 【来源】订单支付规则 第2.1节「积分抵扣：仅支持通兑商品积分，其他批次置灰不可选」

6. **优惠券**
   - 【限制】不支持 【order_movie.html 无 coupon 相关代码；订单支付规则 第4章对比表「电影票 优惠券=不支持」】
   - 【来源】PRD-电影票 第5.1节「优惠券、满减与次卡、点卡不同时生效；用户若已选次卡/点卡，界面隐藏或禁用优惠券与满减入口」

7. **抵扣类（电影次卡/点卡）**
   - 【限制】支持电影次卡；页面数据含「单人观影次卡(剩3次,35元/次)」「VIP观影次卡(剩1次,60元/次)」【order_movie.html:885-888 MOVIE_CARDS】
   - 【限制】**次卡与积分互斥**：选择其中一个会自动取消另一个 【order_movie.html:1178-1195 pageshow 回调，选 batch 时清 movie，选 movie 时清 batch；订单支付规则 第2.1节】
   - 【限制】次卡抵扣规则：多不退少补 = `min(pricePerUse, 票价) × min(remaining, 张数)` 【订单支付规则 第2.1节、2.4节示例】
   - 【限制（PRD 更高规格）】次卡/点卡三选一互斥：不使用 / 仅 1 张点卡 / 仅 1 张次卡；每单至多 1 张次卡、至多 1 张点卡；接口同时携带两类卡 ID 则拒绝下单 【PRD-电影票 第5.0节、第11节验收1-2、第13.1节】

8. **支付方式限制**
   - 【限制】都不选→现金支付；仅次卡且面值≥总额→无选项全额抵扣；仅次卡且面值&lt;总额→组合支付；仅积分且余额≥总额→积分支付；仅积分且余额&lt;总额→积分支付/组合支付 【订单支付规则 第2.2节对比表】

9. **其他特有限制**
   - 锁座时效（见维度 4）
   - 支付成功后核销失败：自动重试（1s/3s/10s，最多5次），仍失败则 30 分钟内全额退款 【PRD-电影票 第8章异常表】
   - 出票失败：30 分钟内自动退款并恢复卡券权益 【PRD-电影票 第8章】

---

### A4. 虚拟商品订单 `pages/order_virtual.html`

1. **数量限制**
   - 【限制】支持 +/- 步进，最小 1（减号置灰）【order_virtual.html:1461-1469】
   - 【限制】前端限制最大 99 件 【PRD-虚拟商品 第四.4 节异常表「商品数量最大限制：超过库存或99件→前端限制最大99件」】

2. **地址/收货**
   - 【限制】无需收货地址（页面无 address-section）【order_virtual.html:863-980 page-scroll 无地址区】

3. **配送方式**：无（直充自动充值 / 卡密短信发送）

4. **账号/凭证（充值账号）**
   - 【限制】充值账号必填，未输入提交时阻断「请输入充值账号」【order_virtual.html:1519-1523 `if (!selectedAccount) { alert('请输入充值账号'); return; }`】
   - 【限制】手机号校验：`/^1\d{10}$/`（11位、1开头），不合规提示「请输入正确的手机号」【order_virtual.html:1533-1536】
   - 【限制】QQ号校验：`/^[1-9]\d{4,10}$/`（5-11位、首位非0），不合规提示「请输入正确的QQ号（5-11位数字，首位不为0）」【order_virtual.html:1527-1531】
   - 【限制】账号输入最多 20 字符 【order_virtual.html:912 `maxlength="20"`；PRD 四.4「充值账号过长→截断处理，最多输入20个字符」】
   - 【限制】商品类型区分：直充(direct)显示「手机号/QQ号」切换 Tab；卡密(card)为通用充值账号无 Tab 【order_virtual.html:906-909 account-type-tabs 显示条件；1096-1100 currentAccountType 仅 direct 时设值；1150-1153 Tab 显示控制】
   - 【限制】历史账号：仅记录 1 个最近账号；卡密链路脱敏展示，直充链路明文展示 【order_virtual.html:1210-1227 renderSavedAccounts；PRD 二.1 页面2「历史账号选择区域（仅记录1个最近账号）」】
   - 【限制】切换账号类型（手机号↔QQ号）后清空已选账号，避免按错误规则校验 【order_virtual.html:1245-1258 switchAccountType】

5. **积分批次范围**
   - 【限制】跳转 `points_batch_select.html` 复用积分批次选择页 【order_virtual.html:1362-1369 goToBatchSelect】
   - 页面内以单一余额 `POINTS_BALANCE = 9900` 演算（不区分批次类型）【order_virtual.html:1069】

6. **优惠券**
   - 【限制】不支持 【order_virtual.html 无 coupon 代码；PRD-虚拟商品 一、范围边界 Out Scope 明确「优惠券抵扣」】

7. **抵扣类（次卡/点卡）**：不支持

8. **支付方式限制**
   - 【限制】不使用积分→仅现金支付；使用积分→积分支付 + 组合支付（默认选中积分支付）【order_virtual.html:1280-1300 renderPayModes；PRD 四.2 支付方式动态渲染流程】
   - 【限制】积分余额为 0 时不展示积分抵扣行，仅显示现金支付 【PRD 四.4 异常表「积分余额为0」】

9. **其他特有限限**
   - 【限制】页面加载默认弹出「温馨提示」风险提示弹窗，须点击「知道了」关闭 【order_virtual.html:1049 `class="warm-tip-overlay show"`；PRD AC-V-008】
   - 温馨提示内容：①充值类商品交易成功后不支持退换货 ②刷单返利防骗/核对账号勿重复充值（直充）/勿将卡密给他人（卡密） ③警惕第三方链接 【order_virtual.html:1053-1057；TYPE_COPY 动态文案 1103-1128】
   - 【限制】充值成功后无法退款/撤销（文案反复强调）【order_virtual.html:914 account-tip、TYPE_COPY 各 desc】
   - 【限制】支付方式项不放「微信/支付宝」「可用XX积分」等灰色小字说明 【PRD AC-V-013】

---

## B. 跨类型限制

### B1. 购物车里不同类型商品能否合并结算

| 组合 | 能否合并 | 来源 |
|---|---|---|
| 实物 + 虚拟 | **不能**，提示「虚拟商品和实物商品需要分开下单」 | cart.html:711-714；PRD-虚拟商品 AC-V-016 |
| 实物 + 蛋糕 | 不适用（蛋糕不进购物车，独立链路） | cart.html 无蛋糕分流 |
| 实物 + 电影票 | 不适用（电影票不进购物车，独立链路） | cart.html 无电影票分流 |
| 虚拟商品多个 SKU | **不能**，提示「虚拟商品一次只能下单一个SKU，请取消多余商品的勾选」 | cart.html:716-720；PRD-虚拟商品 AC-V-014 |
| 虚拟商品单 SKU 多件 | 可以（数量可调，卡密按数量生成多组） | cart.html:716；PRD-虚拟商品 AC-V-015、AC-V-017 |

### B2. 是否每种类型必须独立下单

- **实物**：经购物车，可多 SKU 合并一单 → `order_product.html` 【cart.html:723-724】
- **虚拟**：经购物车但只能单 SKU，须与实物分开 → `order_virtual.html` 【cart.html:716-722】
- **蛋糕**：不进购物车，独立下单 → `order_cake.html`
- **电影票**：不进购物车，选座锁座后独立下单 → `order_movie.html`
- 结论：**4 种类型两两不可合并结算**，各自走独立确认订单页

### B3. 购物车的其他校验

- 【限制】**已下架商品(offshelf)**：无勾选框、无数量控制、不参与合计/全选/结算件数统计，仅支持删除（图片覆盖「已失效」蒙层）【cart.html:208-217 CSS、464-479 渲染、538-539 activeCount 过滤、548 updateTotal 过滤】
- 【限制】**已售罄商品(soldout)**：无勾选框、无数量控制、不参与合计，仅支持删除（图片覆盖「已售罄」蒙层）【cart.html:219-244 CSS、480-494 渲染】
- 【限制】**该地区无库存商品(noship)**：无勾选框、无数量控制、不参与合计，提示「该地区无库存」+「切换地址」入口，仅支持删除 【cart.html:246-283 CSS、495-512 渲染、729-757 showAddressPopup】
- 【限制】**起购量**：购物车所有可售商品数量最小 1，减号在 qty=1 时置灰 【cart.html:526 `(item.qty &lt;= 1 ? ' disabled' : '')`、583 `if (action === 'minus' &amp;&amp; item.qty &gt; 1) item.qty--;`；PRD_04 RULE-CART-003】
- 【限制】**结算前置校验**：未勾选任何可售商品时点击结算提示「请选择商品」【cart.html:703-706】
- 【限制】**合计金额**：仅统计已勾选且非 offshelf/soldout/noship 的商品价格×数量之和 【cart.html:546-552；PRD_04 RULE-CART-005】
- 【限制】**左滑删除**：同一时刻只允许一个商品卡片展开删除按钮 【cart.html:619-620 resetAllSwipe；PRD_04 RULE-CART-002】
- 【限制】**库存低预警**：商品带「库存仅剩 N 件」提示（如 stockLow=2）【cart.html:120-123 item-stock-low、522 渲染】

---

## C. 4 种类型下单限制对比汇总表

| 维度 | 实物商品 | 蛋糕 | 电影票 | 虚拟商品 |
|---|---|---|---|---|
| **下单入口** | 购物车/详情页立即购买 | 蛋糕详情页（不进购物车） | 电影H5选座锁座（不进购物车） | 购物车/详情页立即购买 |
| **数量限制** | +/- 步进，min=1，无上限 | 固定 ×N，不可调 | +/- 步进，min=1，**max=10** | +/- 步进，min=1，**max=99** |
| **收货地址** | 必填，可编辑切换 | 只读（商家提供） | 无需 | 无需 |
| **配送方式** | 快递 免邮（固定） | 商家配送 免邮+预计送达（固定） | 无（电子票） | 无（直充/卡密） |
| **账号/凭证** | 无 | 无 | 选座锁座（座位固定展示） | 充值账号必填，手机号/QQ号格式校验，max 20字符 |
| **积分批次** | 全部 5 种 | 仅通兑 | 仅通兑（其他置灰） | 跳转批次选择页（页面用单一余额演算） |
| **优惠券** | 支持 | 支持 | **不支持** | **不支持**（Out Scope） |
| **抵扣类（次卡/点卡）** | 不支持 | 不支持 | 支持电影次卡（**与积分互斥**；PRD 定义点卡/次卡三选一，每单≤1张） | 不支持 |
| **支付方式** | 现金/积分/组合 | 现金/积分/组合 | 现金/积分/组合/次卡抵扣 | 现金/积分/组合 |
| **邮费/运费** | ¥0 免邮 | ¥0 免邮 | 不适用 | 不适用 |
| **风险/温馨提示** | 无 | 无 | 无（但有锁座时效约束） | 页面加载强制弹窗，充值成功不可退 |
| **特有时效限制** | 无 | 无 | 锁座时效 ≤15min，支付前二次校验锁座 | 无 |
| **备注** | 选填，max 200字 | 选填，max 200字（蜡烛/贺卡提示） | 选填，max 200字 | 选填，max 200字 |
| **跨类型合并** | 可与实物多SKU合并 | 独立下单 | 独立下单 | 单SKU，与实物分开 |

---

## D. 补充说明（来源交叉印证）

1. **`订单支付规则.md` 第4章对比表**仅列了「商品订单/电影票订单/蛋糕订单」3 种（该文档成文时虚拟商品尚未纳入），虚拟商品的下单限制以 `PRD-虚拟商品下单流程-V0.6.md` 和 `order_virtual.html` 为准。

2. **积分换算统一规则**：1 积分 = 1 分 = ¥0.01（100 积分 = ¥1.00），适用所有类型 【订单支付规则 第6节】。

3. **选择页面返回机制**：各类型通过 localStorage 的 `return_page` 字段动态返回各自确认订单页，`order_type` 取值 product/movie/cake/virtual 【订单支付规则 第7节、第8节；order_virtual.html:1365-1366】。

4. **纯积分支付跳过收银台**：4 种类型在纯积分支付模式下均直接跳支付成功，不唤起现金通道 【订单支付规则 第4章对比表末行；order_product.html:1358、order_cake.html:1289、order_movie.html:1121、order_virtual.html:1544-1548】。</result>
<usage><subagent_tokens>0</subagent_tokens><tool_uses>12</tool_uses><duration_ms>136091</duration_ms></usage>
</task-notification>

## 2026-08-10 17:19:13

B
开始前修正：QQ不支持充值，因为0.62版本已经废弃；优惠券功能不考虑，因为其未实现。

另外修改原型文本，商家提供改为蛋糕叔叔提供。

## 2026-08-10 17:33:26

1不处理 2落地 3不用，我们在V0.7中新建一份订单支付规则

## 2026-08-10 18:24:43

这两份文档能否合成一个PRD？前半部分为现有的订单支付规则，后半部分为V0.7迭代支付功能。

## 2026-08-10 18:27:38

1.根据现有订单规则，检查原型页面有什么BUG？
2.根据V0.7的PRD，哪些原型页面需要调整迭代？
