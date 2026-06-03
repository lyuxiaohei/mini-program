# PLAN — fix-page-index

```yaml
plan: 01
depends_on: []
files_modified:
  - page-index.html
wave: 1
```

## 决策覆盖

| 决策 | 覆盖任务 |
|------|----------|
| D-01 | T-01 (全部 15 个页面补入) |
| D-02 | T-01 (有 PRD 标版本标签，无 PRD 标 "扩展") |

## T-01: 补入 15 个遗漏页面到 page-index.html ✅

**描述**: 在 `page-index.html` 中新增 `.ver.vext` 样式类，并将 15 个遗漏页面按层级插入到对应板块的合理位置。

**文件**: `page-index.html`

**具体操作**:

1. **新增 CSS 类** — 在 `<style>` 块中已有 `.ver.v5` 规则之后，添加:
   ```css
   .links a .ver.vext { background: #722ed1; }
   ```

2. **二级页面板块插入** — 在 `<h2>二级页面</h2>` 下的 `.links` 容器中，按功能分组插入以下 7 个条目:
   - 有 PRD（插在现有条目旁的逻辑位置）:
     - `coupon.html` — "卡券包" + `<span class="ver v01">V0.1</span>` (插在 coupon_center 附近)
     - `wallet.html` — "我的钱包" + `<span class="ver v01">V0.1</span>` (插在 points_center 附近)
   - 无 PRD（插在板块末尾）:
     - `activity_page.html` — "活动专题" + `<span class="ver vext">扩展</span>`
     - `flash_sale.html` — "限时秒杀" + `<span class="ver vext">扩展</span>`
     - `vip_center.html` — "会员中心" + `<span class="ver vext">扩展</span>`
     - `brand_list.html` — "品牌专区" + `<span class="ver vext">扩展</span>`
     - `newuser_gift.html` — "新人专享" + `<span class="ver vext">扩展</span>`
     - `movie_cinema.html` — "电影/影院" + `<span class="ver vext">扩展</span>`

3. **三级页面板块插入** — 在 `<h2>三级页面</h2>` 下的 `.links` 容器中插入以下 8 个条目:
   - 有 PRD:
     - `coupon_select.html` — "选择优惠券" + `<span class="ver v5">V0.5</span>` (插在 order 相关页之前)
     - `points_batch_select.html` — "选择积分批次" + `<span class="ver v5">V0.5</span>` (插在 coupon_select 旁边)
     - `movie_card_select.html` — "选择电影次卡" + `<span class="ver v5">V0.5</span>` (插在 order_movie 附近)
   - 无 PRD:
     - `address_edit.html` — "编辑地址" + `<span class="ver vext">扩展</span>` (插在 address 旁边)
     - `product_detail_off.html` — "商品详情（已下架）" + `<span class="ver vext">扩展</span>` (插在 product_detail 附近)
     - `movie_pass_detail.html` — "电影票次卡详情" + `<span class="ver vext">扩展</span>` (插在电影相关页附近)
     - `movie_pass_info.html` — "跳转中" + `<span class="ver vext">扩展</span>` (插在 movie_pass_detail 附近)

**插入位置逻辑**:
- 有 PRD 页面按功能就近插入（如 coupon 靠近 coupon_center，wallet 靠近 points_center）
- 无 PRD 页面插入各自板块末尾，保持可辨识的分组
- address_edit 紧跟 address，product_detail_off 紧跟 product_detail — 这些虽然无独立 PRD 但功能关联明确

**验证**:
- 打开 `page-index.html`（file:// 协议），确认所有新增链接可点击跳转
- 检查 `.ver.vext` 标签显示为紫色背景白色文字
- 检查 `.ver.v01` / `.ver.v5` 版本标签显示正确颜色
- 数量：二级页面原有 11 + 新增 8 = 19 个条目，三级页面原有 30 + 新增 7 = 37 个条目

**完成标准**:
- page-index.html 包含全部 15 个新增页面条目
- 现有条目完全不变
- CSS 类 `.ver.vext` 存在且颜色为 `#722ed1`
- 有 PRD 页面带正确版本标签，无 PRD 页面带 "扩展" 标签

**依赖**: 无
