# Prompts - session 7ab7cbe9-14d5-4342-a47a-c52710bf0e9f

> project: `D:\a-projects\mini-program`
> started: 2026-08-10 18:30:01

## 2026-08-10 18:30:01

commit

## 2026-08-10 23:34:38

/goal
1.根据现有订单支付规则，检查原型页面有什么BUG？修复BUG或补充场景
2.根据V0.7的PRD，哪些原型页面需要调整迭代？补充场景
注意：不要影响历史版本的演示。

附：不要再拘泥于完全使用手机页面实现各种场景，可在html中增加一些手机页面之外的按钮，用于触发某些场景。

## 2026-08-10 23:42:39

<task-notification>
<task-id>a7331ac2100c31928</task-id>
<tool-use-id>call_5c4a377b894a4ea09021f035</tool-use-id>
<output-file>C:\Users\ADMINI~1\AppData\Local\Temp\claude\D--a-projects-mini-program\7ab7cbe9-14d5-4342-a47a-c52710bf0e9f\tasks\a7331ac2100c31928.output</output-file>
<status>completed</status>
<summary>Agent "对照支付规则查原型BUG与V0.7迭代点" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>我已经完成了详尽的只读调研。以下是综合报告。

---

# 调研报告：订单支付规则 BUG + V0.7 积分叠加迭代点

调研对象：`D:\a-projects\mini-program` 下 7 个原型页 + PRD 基准 `doc/V0.7/PRD-订单支付规则与积分叠加迭代-V0.7.md`。所有行号已逐一核对。

---

## 任务一　BUG 清单（按严重度排序）

### HIGH 严重度（计算/流程错误）

#### BUG-1　纯积分模式在"积分未全额覆盖"时仍跳过收银台，现金尾款未收取
- 位置：
  - `pages/order_product.html:1357-1358`（`handleSubmit`：`if (!usesCash(currentMode)) { location.href='pay_success.html'; return; }`），配合 `usesCash` 定义 `:1069`（`beans` 返回 false）
  - `pages/order_cake.html:1288-1289`（同结构）
  - `pages/order_virtual.html:1519` 起（`beans` 路径），`usesCash` `:1185-1187`
  - `pages/order_movie.html:1120-1121`（`points` 模式，`usesCash` `:941`）
- 问题：`usesCash('beans'/'points')` 均为 false → 跳收银台。但 `beans`/`points` 模式在「所选批次余额不足」或「批次只匹配部分商品」时 `pointsUsed &lt; goodsCents`，`cashAmount &gt; 0`。该现金尾款既不在 summary 显示现金行（条件 `cashAmount&gt;0 &amp;&amp; usesCash(mode)` 不满足），也不进收银台，直接跳 `pay_success` → **尾款从未被收取**。
- 违反规则：§9（纯积分跳过收银台仅指积分全额覆盖场景）、§2.3/§3.3/§5.3（现金补差必须收取）。
- 触发举例：
  - product：选 B001（指定商品积分，只匹配 ¥89 耳机，余额 5000），总额 ¥196.90 → beans 模式 `pointsUsed=5000`、`cashAmount=¥146.90` 未付直跳成功页
  - cake：选 B005（通兑 12000），蛋糕总额 ¥226.00 → `pointsUsed=12000`、`cashAmount=¥106.00` 未付
  - virtual：数量调到 2 件（¥198），`POINTS_BALANCE=9900` → `pointsUsed=9900`、`cashAmount=¥99.00` 未付
  - movie：选 B005（12000）买 10 张票（¥500）→ `pointsUsed=12000`、`cashAmount=¥380.00` 未付
- 修复建议：把"跳过收银台"的判断条件从「mode 是否用现金」改为「`cashAmount &lt;= 0`（积分全额覆盖）」：`if (info.cashAmount &lt;= 0) → pay_success; else → 收银台`。
- 是否影响历史演示：**否**。默认演示数据下默认批次均能覆盖（product 默认 best=B006 覆盖全单；movie 1 张 ¥50 覆盖；virtual ¥99 正好；cake/各页默认未选积分）。需手动选部分批次或调高数量触发 → **建议框外按钮触发**。

#### BUG-2　`points_batch_select.html` 对 virtual 订单未过滤批次，可选非通兑批次
- 位置：`pages/points_batch_select.html:368`、`:423`、`:435`、`:516`（四处条件均只判断 `orderType === 'movie' || orderType === 'cake'`）
- 问题：虚拟订单（`order_type='virtual'`，由 `order_virtual.html:1365` 写入）进入后，6 种批次（sku/special/brand/category/general×2）全部可选，违反"虚拟仅通兑"。
- 违反规则：§5.1（虚拟仅通兑）、§15（虚拟仅通兑可叠加）。
- 修复建议：四处条件改为 `(orderType==='movie'||orderType==='cake'||orderType==='virtual') &amp;&amp; b.type!=='general'`；`disabledLabel`（`:435`）补 virtual 文案。
- 是否影响历史演示：**否**（默认进入仍推荐通兑 best）。建议框外按钮触发 virtual+非通兑。

---

### MEDIUM 严重度（渲染规则偏差）

#### BUG-3　product/cake 在积分余额足够全额时仍显示"组合支付"选项
- 位置：`pages/order_product.html:1106-1110`、`pages/order_cake.html:1041-1046`（`pointsActive` 时无条件渲染 `beans` + `beans_cash` 两项）
- 问题：PRD §2.2/§3.2 规定「余额够付 → 仅积分支付」。当前无论余额是否覆盖全额，都同时渲染积分支付+组合支付。
- 违反规则：§2.2、§8（积分够付全额 → 积分支付，不显示现金渠道）。
- 注：`order_virtual.html:1290-1300` 始终双显是正确的，因为 §5.2 表格对 virtual 明确为"使用 → 积分支付/组合支付"（始终两者）。故 virtual 不算 bug。
- 修复建议：`if (maxCons &gt;= goodsCents) 仅渲染 beans; else 渲染 beans+beans_cash`。
- 是否影响历史演示：**部分**。若默认选中能覆盖的批次（如 B006），会多出本不该有的"组合支付"项；但默认未选积分时不受影响。建议框外按钮触发。

#### BUG-4　4 个订单页用内联收银弹窗，未跳 `order_pay.html`；`order_pay.html` 为静态写死且与流程脱节
- 位置：
  - 内联收银弹窗：`order_product.html:883-937`、`order_movie.html:816-871`、`order_cake.html:821-880`、`order_virtual.html`（pay-popup）
  - 静态脱节页：`pages/order_pay.html:522-628`（金额全部写死 ¥196.90/¥100/¥96.90，JS `:702-805` 无任何 localStorage 读取）
  - 全仓搜索 `order_pay.html`：仅 `order_list.html:1262`（"去支付"）引用，4 个下单确认页从不跳转
- 问题：PRD §9 明确"非纯积分支付走收银台 `order_pay.html`，两步：确认+密码"。实际 4 个订单页全部内联自实现两步弹窗，`handleSubmit` 只跳 `pay_success` 或开内联弹窗。`order_pay.html` 是静态孤儿页。
- 违反规则：§9（收银台页 `order_pay.html`）。
- 修复建议：二选一——(a) 统一改为跳 `order_pay.html` 并通过 localStorage 传金额明细；(b) 保持订单页内联弹窗为正式收银台，`order_pay.html` 仅作静态演示。建议选 (b)。
- 是否影响历史演示：`order_pay.html` 改为动态会破坏其静态演示价值。**建议保留 `order_pay.html` 静态，用框外按钮单独演示**。

---

### LOW 严重度（边界缺失 / 规则未实现 / 静态数据）

#### BUG-5　`order_virtual` 数量无上限（PRD 1–99 件）
- 位置：`pages/order_virtual.html:1465`（`if (this.dataset.action === 'plus') qty++;` 无 99 上限）
- 违反：§1（虚拟 1–99 件）。对照 `order_movie.html:1084` 有 `ticketQty &lt; 10` 上限，virtual 缺失。
- 修复：`if (action==='plus' &amp;&amp; qty &lt; 99) qty++`。
- 影响历史演示：否（默认 qty=1）。

#### BUG-6　电影票缺锁座时效 / 二次校验 / 倒计时
- 位置：`pages/order_movie.html`（全文无 countdown、无锁座校验；`handleSubmit:1120` 直接进收银台）
- 违反：§4.5（锁座 ≤15 分钟、支付前二次校验锁座、超时阻断释放锁座）。对照 `order_pay.html:716-752` 有 15min+3min 缓冲倒计时实现可参考。
- 修复：增加倒计时与支付前锁座失效阻断。
- 影响历史演示：否。建议框外按钮演示"锁座超时"场景。

#### BUG-7　虚拟"卡密"类型账号校验强制手机号格式
- 位置：`pages/order_virtual.html:1526`（`checkType = (currentProductType==='direct') ? currentAccountType : 'phone'`），校验 `/^1\d{10}$/` `:1533`
- 问题：卡密类型按手机号格式校验。PRD §5.4 规定"卡密=通用账号，最长 20 字符"（无格式要求）。`maxlength=20` 已具备（`:912`），但格式校验过严。注意卡密文案"短信发送到手机号"暗示需手机号，与 PRD 存在轻度矛盾。
- 违反：§5.4。
- 影响：否。（注：用户已明确 QQ 充值 Tab 为 V0.62 残留不处理，本条仅指卡密通用账号格式。）

#### BUG-8　`pay_success.html` 金额写死且违反换算
- 位置：`pages/pay_success.html:159-169`（"172积分 (¥171.90)"、现金 ¥0.00、实付 ¥171.90）
- 问题：按 §7，172 积分 = ¥1.72，非 ¥171.90；且 0 现金 + 172 积分 ≠ 实付 171.90，三行互不自洽。
- 违反：§7（1 积分=¥0.01）。
- 修复：改为"17190 积分 (¥171.90)"或修正实付为 ¥1.72。
- 影响：静态演示页，改文案不破坏演示逻辑。

#### BUG-9　订单页静态初始值与实际总额不符（JS 覆盖前）
- 位置：`order_product.html:877`（`bottomTotal` 静态 ¥191.90，实际商品总额 196.90）、`:895` popupAmount 残留 ¥96.90；`order_movie.html:811/829` 等同类残留
- 问题：静态 HTML 写死的初始金额与商品总额不一致；JS `renderSummary` 会覆盖。JS 未执行时显示错误。
- 影响：否（JS 正常即覆盖）。仅静态可读性。

---

### 矛盾点（按要求列出，用户指示保留作历史演示）

#### 矛盾-1　product/cake 存在优惠券入口与计算，但 PRD 全局声明"优惠券未实现不考虑"
- 位置：`order_product.html:954-958`（COUPONS 数组）、`:1082-1089`（优惠券入口行）、coupon+points 组合模式 `beans_coupon`/`beans_coupon_cash`（`:1115-1124`、`:1188-1193`）；`order_cake.html:894-898`、`:1016-1023`、`:1052-1061`、`:1123-1128`
- PRD 依据：§1/§11.3"优惠券功能未实现，不考虑——组合支付统一积分→现金"。
- 自洽性结论：coupon+points 组合计算**内部自洽**（`getCouponDiscount` → `afterCoupon` → `pointsUsed` 链路正确，`beans_coupon_cash` 用 `Math.min(comboPoints, maxCons, afterCoupon)` 三元 min 正确）。虚拟页正确地没有优惠券（`order_virtual.html` 无 COUPONS/couponActive）。
- 处理：按用户指示保留 UI 作历史演示，**不计为 BUG**。建议框外按钮触发优惠券演示路径，正式流程默认隐藏。

---

## 任务二　V0.7 积分叠加迭代点（§11–§16）

### A. `points_batch_select.html` 单选 → 多选（核心改动）
| 行号 | 现状 | V0.7 改法 | 规则 |
|---|---|---|---|
| `:92-115` | `.bc-radio` 圆点（`border-radius:50%`，`::after` 圆点） | 改方形勾选框（`border-radius:4px`，`::after` 对勾） | §14 多选勾选语义 |
| `:320` | `selectedBatch` 单值 | `selectedBatches` 数组 | §11.2 |
| `:455-460` `selectBatch` | 单选赋值 | `toggleBatch`：同组（同 type+matchAttr+matchValue）追加；跨组清空旧组只留新点（切组）；再点取消 | §14.1/§14.2/§14.3、§13.1 |
| `:392-453` `renderBatchSelector` 排序 | 按 best/30 天临期/可消耗 | 改按 `expireDate` 升序整体排序（先扣最快过期） | §13.2、§14.5 |
| `:412-416` "不使用积分"卡片 | 单选 null | 清空全部已选 | §14.4 |
| `:438-439` 可消耗文案 | 单张"可消耗 N 积分" | 已选组叠加"合计可消耗 N 积分" | §14.6 回填 |
| `:501-508` `confirmSelect` | `setItem('selected_batch_id', single)` | `setItem('selected_batch_ids', JSON 数组)`；并写回每张预计消耗（按 expireDate 升序分配） | §13.2/§13.3、§10 |
| `:330` `prevSelection` | 读单值 | 兼容旧 `selected_batch_id` 单值 + 新 `selected_batch_ids` 数组 | §10 迁移 |
| `:368/423/516` | 仅过滤 movie/cake | 增加 virtual 过滤（修 BUG-2） | §5.1、§15 |
| 新增 | — | 底部"已选 X 张，合计 Y 积分，抵 ¥Z"汇总条 | §14.6 |

### B. 4 个订单页积分抵扣：单批次 → 多批次聚合
所有页需新增两个公共函数（当前每页内联、无公共 JS——`js/` 目录确认无 points 模块）：
- `getSelectedBatches()`：读 `selected_batch_ids`
- `aggregatePoints()`：`min(Σ选中批次余额, 本单可抵金额)`，按 `expireDate` 升序逐张扣减填满

各页改动点：
| 页面 | 计算点（单→聚合） |
|---|---|
| `order_product.html` | `:945-1036`（POINTS_BATCHES/getMaxConsumable/findBestBatch）、`:1073-1080` renderPointsEntry、`:1182-1193` pointsUsed、`:1340-1355` getCashInfo；`allocateByWeight:1056` 按权重分配逻辑不变，仅 totalPoints 来源改聚合 |
| `order_cake.html` | `:889-976`、`:1007-1011`、`:1118-1128`、`:1271-1282`（仅通兑组） |
| `order_movie.html` | `:880-927`（`getMaxConsumable:923` 现返回单 `b.balance`）、`:955-960`、`:1011-1017`；互斥逻辑 `:1174-1196` **保持不变** |
| `order_virtual.html` | **最大改造**：`:1069` `POINTS_BALANCE=9900` 单值 → 改为 `POINTS_BATCHES`（仅通兑）+ 聚合；`:1317-1334` renderSummary、`:1505-1517` getCashInfo 用聚合替换 POINTS_BALANCE |

### C. localStorage 迁移（§10）
- `selected_batch_id`（单值）→ `selected_batch_ids`（数组）
- 影响读取点（全部改读数组，并兼容旧单值包成单元素数组）：
  - `order_product.html:1408/1426`、`order_cake.html:1359/1377`、`order_movie.html:1167/1188`、`order_virtual.html:1390/1398`
  - `points_batch_select.html:330/503/505`
- `selected_movie_card_id`（`:1052` 等）**不变**——次卡仍单选，§13.4 跨类互斥保持。

### D. 各订单类型叠加表现差异（§15）
- 实物：5 种批次，同 type+范围可叠加、跨组互斥——演示最丰富（两张通兑叠加；通兑 vs 指定商品切组）。
- 蛋糕/电影/虚拟：仅通兑，多张通兑叠加；电影保持与次卡跨类互斥（§13.4）。
- virtual 当前无批次模型，叠加前必须**先建通兑批次数据**（B 节最大改造）。

### E. 版本状态字段（§12/§16.5）
- `page-index.html:227/233`：V0.62 已用 `.ver-status` 标"已废弃→V0.7"（**已做**，`:140-141` CSS 也在）。
- **缺**：V0.7 项应再标 `.ver-status`"开发中"——当前 V0.7 仅彩色块 `.ver v7`，无"开发中"状态字（§16.5）。`page-index.md` 同步补 V0.7→开发中。
- 影响：否（仅导航页标记）。

---

## 建议用「框外按钮」触发的场景清单

`.phone-frame` 在 `css/common.css:109` 定义，body 内可在手机框外加快捷按钮触发以下场景，**不破坏历史演示默认态**：

**BUG 场景**
1. 【BUG-1】product 选 B001（部分匹配批次）+ 积分支付 → 演示"现金尾款未收取"问题
2. 【BUG-1】cake 选 B005 + 积分支付 → 演示 ¥106 尾款跳过收银台
3. 【BUG-1】virtual 数量=2 + 积分支付 → 演示 ¥99 尾款跳过收银台
4. 【BUG-2】virtual 进入批次选择页 → 演示非通兑批次可选
5. 【BUG-3】product/cake 选 B006（余额覆盖）→ 演示多出的"组合支付"选项
6. 【BUG-4】独立打开 `order_pay.html` → 演示静态收银台两步流程
7. 【BUG-6】movie 模拟锁座超时 → 演示支付阻断

**V0.7 叠加场景**
8. product 选两张通兑（B005+B006）叠加 → 演示同组叠加、按 expireDate 升序先扣 B005
9. product 选通兑后切到指定商品积分（B001）→ 演示跨组互斥自动替换（§14.2）
10. cake/virtual 多张通兑叠加 → 演示仅通兑订单的叠加（§15）
11. movie 两张通兑叠加 + 选次卡 → 演示积分清空、次卡生效（跨类互斥 §13.4）
12. 边界：不使用积分 / 单批次（与旧版等价）/ 纯积分跳过收银台（§16.4）

---

## 汇总结论

- **必须修的真正 BUG**：BUG-1（HIGH，跨 4 页的收银台跳过逻辑）和 BUG-2（HIGH，virtual 批次过滤遗漏）。这两条默认演示不触发，可用框外按钮暴露。
- **规则偏差**：BUG-3/BUG-4 为渲染/架构偏差，与 PRD 字面不符但功能等价，修不修取决于是否严格对齐 §2.2/§9。
- **V0.7 最大改造点**：`order_virtual.html` 从单值 `POINTS_BALANCE` 迁移到批次模型；`points_batch_select.html` 单选→多选 + 跨组互斥 + expireDate 升序消耗；`selected_batch_id` → `selected_batch_ids` 全链路迁移（4 订单页 + 选择页）。
- **历史演示安全**：所有 BUG 默认演示数据下不可见；V0.7 改动若用框外按钮触发新场景、保留默认单批次行为，可做到"不影响历史版本演示"。</result>
<usage><subagent_tokens>0</subagent_tokens><tool_uses>27</tool_uses><duration_ms>398900</duration_ms></usage>
</task-notification>

## 2026-08-11 08:55:04

版本标签样式不统一，新加的样式不对
Workspace file: page-index.html

## 2026-08-11 09:00:50

标错了，0.62是废弃，不是0.7

## 2026-08-11 09:36:03

直接在0.62标签中标记已废弃，不要分开了

## 2026-08-11 09:43:44

V0.7版本刚刚改了什么内容？

## 2026-08-11 09:48:04

我对V0.7版本的UI样式不满意，将这个原型项目交接给Kimicode K3优化样式，使其不要脱离原有的风格。
