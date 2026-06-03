# CONTEXT.md — fix-page-index 迭代 1

## 遗漏页面清单（16 个）— 基于 PRD 文档确认版本归属

### 有 PRD 明确覆盖的页面（5 个）

| 页面 | 标题 | PRD 来源 | 版本 | 层级 |
|------|------|----------|------|------|
| coupon.html | 卡券包 | PRD_13 卡券包 | V0.1 | 二级 |
| wallet.html | 我的钱包 | PRD_10 卡券兑换与钱包 | V0.1 | 二级 |
| coupon_select.html | 选择优惠券 | 订单支付规则 | V0.5 | 三级 |
| points_batch_select.html | 选择积分批次 | 订单支付规则 | V0.5 | 三级 |
| movie_card_select.html | 选择电影次卡 | 订单支付规则 | V0.5 | 三级 |

### 无 PRD 覆盖的页面（10 个）— 待确认是否列入

| 页面 | 标题 | 情况说明 |
|------|------|----------|
| activity_page.html | 活动专题 | 首页营销活动落地页，无独立 PRD |
| address_edit.html | 编辑地址 | PRD_06 定义地址编辑为 address.html 内弹窗，此为拆分出的独立页 |
| brand_list.html | 品牌专区 | 无 PRD 定义 |
| flash_sale.html | 限时秒杀 | PRD_02 定义秒杀为首页内嵌模块，非独立页 |
| movie_cinema.html | 电影/影院 | V0.5 概念上有影院选择流程，但无独立页面 PRD |
| movie_pass_detail.html | 电影票次卡详情 | 无 PRD 定义，属于卡券管理延伸 |
| movie_pass_info.html | 跳转中（H5中间页） | 技术跳转页，无 PRD 定义 |
| newuser_gift.html | 新人专享 | 无 PRD 定义 |
| product_detail_off.html | 商品详情（已下架） | V0.3 覆盖 product_detail 但未定义下架缺省页 |
| vip_center.html | 会员中心 | 无 PRD 定义 |

## 决策待确认

- D-01: 5 个有 PRD 的页面直接补入 index，版本标签确认
- D-02: 10 个无 PRD 页面如何处理：全部列入（标记为"原型扩展"）还是排除
- D-03: movie_pass_info.html 是技术跳转页，是否列入
- D-04: address_edit / flash_sale 与 PRD 设计不一致（PRD 定义为弹窗/内嵌），原型拆为独立页，如何标注
