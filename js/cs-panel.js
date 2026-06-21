/* ===== 在线客服 - 咨询方式选择面板 ===== */
(function () {
  // OCS 客服项目相对路径（同级目录结构：mini-program / 在线客服1/OCS）
  var OCS_BASE = '../在线客服1/OCS/prototype-cs/user/user-chat-basic.html';
  var CS_PHONE = '400-888-8888';

  // 当前页面已初始化标记
  if (window._csPanelInit) return;
  window._csPanelInit = true;

  // ---- 注入 HTML ----
  var html = [
    '<div class="cs-sheet-mask" id="csSheetMask">',
    '  <div class="cs-sheet" id="csSheet">',
    '    <div class="cs-sheet-head">',
    '      <div class="cs-sheet-title">请选择咨询方式</div>',
    '      <button class="cs-sheet-close" id="csSheetClose" title="关闭">',
    '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    '      </button>',
    '    </div>',
    '    <div class="cs-sheet-options">',
    '      <button class="cs-sheet-opt" id="csSheetOnline">',
    '        <span class="opt-icon online">',
    '          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    '        </span>',
    '        <span class="opt-name">在线咨询</span>',
    '        <span class="opt-desc">文字对话<br>平均响应 &lt; 30 秒</span>',
    '      </button>',
    '      <button class="cs-sheet-opt" id="csSheetPhone">',
    '        <span class="opt-icon phone">',
    '          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    '        </span>',
    '        <span class="opt-name">电话客服</span>',
    '        <span class="opt-desc">' + CS_PHONE + '<br>9:00-22:00</span>',
    '      </button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');

  var wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper.firstElementChild);

  // ---- 事件绑定 ----
  var mask = document.getElementById('csSheetMask');
  var sheet = document.getElementById('csSheet');
  var onlineBtn = document.getElementById('csSheetOnline');
  var phoneBtn = document.getElementById('csSheetPhone');
  var closeBtn = document.getElementById('csSheetClose');
  var pendingTag = null;
  var pendingParams = {};

  function openSheet(tag, params) {
    pendingTag = tag || 'home';
    pendingParams = params || {};
    mask.classList.add('show');
    sheet.classList.add('show');
  }
  function closeSheet() {
    mask.classList.remove('show');
    sheet.classList.remove('show');
    pendingTag = null;
    pendingParams = {};
  }

  // 暴露给页面调用
  window.csPanel = { open: openSheet, close: closeSheet };

  mask.addEventListener('click', closeSheet);
  sheet.addEventListener('click', function (e) { e.stopPropagation(); });
  closeBtn.addEventListener('click', closeSheet);

  // 在线咨询 → 跳转 OCS 客服页
  onlineBtn.addEventListener('click', function () {
    var tag = pendingTag;
    var params = pendingParams;
    closeSheet();
    var qs = ['entry_tag=' + encodeURIComponent(tag)];
    for (var k in params) {
      if (params.hasOwnProperty(k)) qs.push(k + '=' + encodeURIComponent(params[k]));
    }
    location.href = OCS_BASE + '?' + qs.join('&');
  });

  // 电话客服 → 确认拨打
  phoneBtn.addEventListener('click', function () {
    closeSheet();
    if (window.confirm('是否拨打客服热线 ' + CS_PHONE + '？')) {
      alert('正在拨打 ' + CS_PHONE + '…');
    }
  });

  // ---- 悬浮客服按钮自动绑定 ----
  document.querySelectorAll('.cs-fab-entry').forEach(function (fab) {
    var tag = fab.getAttribute('data-cs-tag') || 'home';
    fab.addEventListener('click', function () { openSheet(tag); });
  });

  // ---- 页面内联客服按钮自动绑定 ----
  document.querySelectorAll('.cs-inline-btn').forEach(function (btn) {
    var tag = btn.getAttribute('data-cs-tag') || 'home';
    btn.addEventListener('click', function () { openSheet(tag); });
  });
})();
