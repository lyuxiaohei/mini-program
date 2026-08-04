# Prompts - session 6ccb31f4-629d-4a18-8308-d6337de2a0ef

> project: `D:\a-projects\mini-program`
> started: 2026-07-31 17:14:53

## 2026-07-31 17:14:53

## Task

Implement V0.62: Add QQ number support to the direct-recharge (直充) flow of virtual goods ordering. The current V0.61 system only supports phone numbers as the recharge account for direct-recharge products. V0.62 must allow users to choose between "手机号" and "QQ号" account types when entering recharge credentials.

This is an **implementation** task — edit files, make it work.

## Context

This is a pure HTML/CSS/JS mini-program prototype project (no framework, no build tooling, must work with `file://` protocol). It's a points-based e-commerce platform for a WeChat mini-program. The virtual goods system supports two sub-types: 卡密 (card/secret code) and 直充 (direct recharge). V0.6 built the card flow; V0.61 added the direct-recharge flow but only for phone numbers. V0.62 extends direct-recharge to also support QQ numbers.

**Key architecture**: The order confirmation page (`order_virtual.html`) uses a `TYPE_COPY` object to drive 6 pieces of text based on `currentProductType` ('direct' or 'card'). The type is determined by URL parameter `?type=direct|card` with localStorage fallback for round-trips (e.g., after going to points batch selection and back).

## Relevant files

- `pages/order_virtual.html` (1496 lines) — **PRIMARY**. Virtual product order confirmation page. Contains:
  - `TYPE_COPY` object (lines ~1063-1080) with `direct` and `card` keys, each with `label`, `desc`, `spec`, `tip2`, `placeholder`, `accountTip`
  - `applyProductType()` function (line ~1082) that applies TYPE_COPY to DOM
  - Account input drawer (lines ~870-886) with saved accounts, input field, and confirm button
  - `handleSubmit()` (line ~1404) with phone validation `/^1\d{10}$/`
  - `confirmAccount()` (line ~1144) that saves and displays the account value
  - `selectAccount()` (line ~1139) that selects from saved accounts
  - Warm tip popup (lines ~1018-1030) with type-specific message `warmTipItem2`
- `pages/order_detail_virtual_direct.html` (304 lines) — Direct-recharge order detail page. Shows recharge info with account type and status. Currently hardcodes account display without type label.
- `pages/pay_success.html` (216 lines) — Payment success page. Routes "查看订单" to the correct detail page based on `?type=` parameter.
- `pages/cart.html` (764 lines) — Shopping cart. Contains virtual product data (id=7 "100元话费充值" with `type: 'direct'`). **No changes needed** — product-level `type` field is already sufficient.
- `doc/V0.61/PRD-虚拟商品直充流程-V0.61.md` — V0.61 PRD for reference on current behavior.

## Decisions (confirmed with user)

1. **Account type selection UI**: Add a Tab/radio switch inside the existing account input drawer (弹窗内选择), toggling between "手机号" and "QQ号". The user selects the type first, then inputs the account.
2. **QQ number validation**: `/^\d{5,11}$/` — 5 to 11 digits. (QQ numbers are 5-11 digit pure numbers per Tencent's rules.)
3. **History account storage**: Phone and QQ saved accounts are stored separately in localStorage — `virtual_account_phone` and `virtual_account_qq`. Switching account type in the drawer swaps which saved account is shown.
4. **Account type label**: `accountType` = 'phone' | 'qq' must be passed through the flow (to pay_success and eventually to order_detail_virtual_direct).

## Current state

V0.61 works correctly:
- `order_virtual.html` correctly reads `?type=direct|card` from URL and localStorage
- `TYPE_COPY.direct` drives all phone-number-specific text
- `handleSubmit()` validates with `/^1\d{10}$/` (phone only)
- `confirmAccount()` saves the account and displays it masked
- `order_detail_virtual_direct.html` shows recharge records with account info
- `pay_success.html` routes to detail pages based on `?type=`

## What to implement

### 1. `order_virtual.html` — Account type switch in the drawer

**1.1 Add account type Tab UI** inside the `#accountInputDrawer` (around line ~874):

Add a two-tab switcher above the saved accounts area:
```html
<div class="account-type-tabs">
  <div class="account-type-tab active" data-type="phone" onclick="switchAccountType('phone')">手机号</div>
  <div class="account-type-tab" data-type="qq" onclick="switchAccountType('qq')">QQ号</div>
</div>
```

CSS for the tabs (add to `<style>` section):
- Horizontal layout, two equal-width tabs
- Active tab: primary color (orange) border-bottom
- Inactive tab: gray text

**1.2 Split `TYPE_COPY.direct` into two sub-types**:

Replace the single `direct` key with `direct_phone` and `direct_qq`:
```javascript
var TYPE_COPY = {
  direct_phone: {
    label: '直充',
    desc: '购买后将自动充值到填写的手机号，充值成功后无法撤销',
    spec: '直充，全国通用',
    tip2: '2、请仔细核对充值手机号，充值成功后无法撤销，请勿重复充值。',
    placeholder: '请输入手机号',
    accountTip: '请仔细核对充值手机号，充值成功后无法退款'
  },
  direct_qq: {
    label: '直充',
    desc: '购买后将自动充值到填写的QQ号，充值成功后无法撤销',
    spec: '直充，全国通用',
    tip2: '2、请仔细核对充值QQ号，充值成功后无法撤销，请勿重复充值。',
    placeholder: '请输入QQ号',
    accountTip: '请仔细核对充值QQ号，充值成功后无法退款'
  },
  card: {
    // ... unchanged from V0.61
  }
};
```

**1.3 Add `accountType` state variable** (default: `'phone'` for direct, `null` for card):

```javascript
var currentAccountType = (currentProductType === 'direct') ? 'phone' : null;
```

**1.4 Update `applyProductType()`** to use `currentAccountType` when product type is `direct`:

```javascript
function applyProductType() {
  var copyKey = currentProductType;
  if (currentProductType === 'direct' && currentAccountType) {
    copyKey = 'direct_' + currentAccountType;
  }
  var copy = TYPE_COPY[copyKey] || TYPE_COPY.card;
  // ... same DOM updates as before
}
```

**1.5 Implement `switchAccountType(type)`**:

```javascript
window.switchAccountType = function(type) {
  currentAccountType = type;
  // Update tab active states
  // Update placeholder, accountTip, warmTipItem2
  applyProductType();
  // Swap saved accounts display
  renderSavedAccounts();
  // Clear input
  document.getElementById('accountInput').value = '';
};
```

**1.6 Update `renderSavedAccounts()`** (or make it a new function):

Read from `localStorage['virtual_account_phone']` or `localStorage['virtual_account_qq']` based on `currentAccountType`. Show the matching saved account.

**1.7 Update `confirmAccount()`** to save with type:

```javascript
window.confirmAccount = function() {
  var input = document.getElementById('accountInput');
  var val = input.value.trim();
  if (val) {
    selectedAccount = val;
    // Save to type-specific localStorage
    try { localStorage.setItem('virtual_account_' + currentAccountType, val); } catch(e) {}
    // Display with type label
    document.getElementById('accountValue').textContent = 
      (currentAccountType === 'phone' ? '手机号：' : 'QQ号：') + val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  } else {
    document.getElementById('accountValue').textContent = '请输入充值账号';
  }
  document.getElementById('accountInputDrawer').classList.remove('show');
};
```

**1.8 Update `handleSubmit()` validation**:

```javascript
if (currentAccountType === 'phone') {
  if (!/^1\d{10}$/.test(selectedAccount)) {
    alert('请输入正确的手机号');
    return;
  }
} else if (currentAccountType === 'qq') {
  if (!/^\d{5,11}$/.test(selectedAccount)) {
    alert('请输入正确的QQ号（5-11位数字）');
    return;
  }
}
```

**1.9 Update payment success redirect** to include `accountType`:

```javascript
location.href = 'pay_success.html?from=virtual&type=' + currentProductType + '&accountType=' + currentAccountType;
```

### 2. `order_detail_virtual_direct.html` — Show account type

In the recharge info section (around line ~266), update the account display row to show the type label. Read `accountType` from URL parameter:

```javascript
var accountType = new URLSearchParams(location.search).get('accountType') || 'phone';
var accountTypeLabel = accountType === 'qq' ? 'QQ号' : '手机号';
// Display: "手机号：13800001111" or "QQ号：123456789"
```

### 3. `pay_success.html` — Pass accountType to detail page

Find the "查看订单" button/link and append `&accountType=` to the URL. Read it from the current page's URL params and forward it.

### 4. `doc/V0.62/` — Create PRD

Create `doc/V0.62/PRD-虚拟商品QQ号充值-V0.62.md` following the format of the V0.61 PRD. Document the scope, changes, acceptance criteria, and impact on existing flows.

## Acceptance criteria

- [ ] When direct-recharge order confirmation opens, account drawer shows "手机号" tab active by default
- [ ] Tapping "QQ号" tab switches placeholder, tips, and validation to QQ number rules
- [ ] Switching tabs swaps the saved account history (phone saved account vs QQ saved account)
- [ ] Entering an invalid QQ number (non-digit, <5 digits, >11 digits) and submitting shows error
- [ ] Entering a valid QQ number and submitting proceeds to payment
- [ ] After payment success, "查看订单" goes to direct order detail page with accountType parameter
- [ ] Direct order detail page shows "QQ号：123456789" or "手机号：13800001111" with type label
- [ ] Card (卡密) flow is completely unaffected — zero regression
- [ ] Phone-only direct-recharge flow still works as before
- [ ] V0.62 PRD document created

## Constraints

- Pure HTML/CSS/JS, no frameworks, no build tools
- Must work with `file://` protocol
- Use CSS variables defined in `css/common.css` for styling
- Follow existing code patterns in the file (no new coding style)
- Card (卡密) flow must have zero regression
- Phone-only direct flow must still work
- Account type switch must only appear for direct-recharge products (not card products)
- Keep the drawer UI clean and mobile-friendly (375px viewport)
