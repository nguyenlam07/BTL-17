/* Thanh chuyển vai trò dùng chung cho cả 3 phân hệ OnboardAI. */
(function () {
  var script = document.currentScript;
  var base = script.src.replace(/shared\/role-switcher\.js.*$/, '');
  var roles = [
    { id: 'newhire', label: 'Nhân viên mới', icon: '♙', href: 'newhire/index.html' },
    { id: 'mentor', label: 'Mentor', icon: '☷', href: 'mentor/index.html' },
    { id: 'hr', label: 'HR / Admin', icon: '⚙', href: 'hr/index.html' }
  ];
  var current = script.dataset.role;
  var css = '.ob-switch{margin:0 0 18px;padding:10px;border-radius:14px;background:#f4f1ff;border:1px solid #e6defc;font-family:Inter,"Be Vietnam Pro",Arial,sans-serif}' +
    '.ob-switch p{margin:0 0 8px;padding:0 4px;font-size:10px;font-weight:800;letter-spacing:1px;color:#8a7fb5;text-transform:uppercase}' +
    '.ob-switch a{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:9px;font-size:12px;font-weight:600;color:#5f5a78;text-decoration:none}' +
    '.ob-switch a:hover{background:#fff;color:#6d4aff}' +
    '.ob-switch a.on{background:#6d4aff;color:#fff}.ob-switch a span{width:16px;text-align:center}' +
    '.ob-switch .ob-home{margin-top:4px;border-top:1px solid #e6defc;border-radius:0 0 9px 9px;font-weight:500;font-size:11px}';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  var box = document.createElement('div'); box.className = 'ob-switch'; box.setAttribute('role', 'navigation'); box.setAttribute('aria-label', 'Chuyển vai trò');
  box.innerHTML = '<p>Chuyển vai trò</p>' + roles.map(function (r) {
    return '<a href="' + base + r.href + '"' + (r.id === current ? ' class="on" aria-current="page"' : '') + '><span>' + r.icon + '</span>' + r.label + '</a>';
  }).join('') + '<a class="ob-home" href="' + base + 'index.html">← Trang chủ OnboardAI</a>';
  var sess = null;
  try { sess = JSON.parse(localStorage.getItem('onboardai_session') || sessionStorage.getItem('onboardai_session')); } catch (e) {}
  var accountHtml = sess
    ? '<p style="margin-top:8px">Tài khoản</p><a href="#" style="cursor:default;pointer-events:none"><span>●</span>' + String(sess.name).replace(/[&<>"]/g, '') + '</a><a href="#" class="ob-logout"><span>↩</span>Đăng xuất</a>'
    : '<a class="ob-home" href="' + base + 'auth/login.html"><span>→</span>Đăng nhập</a>';
  box.insertAdjacentHTML('beforeend', accountHtml);
  var lo = box.querySelector('.ob-logout');
  if (lo) lo.addEventListener('click', function (e) {
    e.preventDefault();
    try { localStorage.removeItem('onboardai_session'); sessionStorage.removeItem('onboardai_session'); } catch (err) {}
    location.href = base + 'auth/login.html';
  });
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  var anchor = sidebar.querySelector('.brand, .logo-brand');
  if (anchor) anchor.insertAdjacentElement('afterend', box); else sidebar.prepend(box);
})();
