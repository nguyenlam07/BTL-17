/* Đăng nhập / Đăng ký OnboardAI – GIẢ LẬP phía trình duyệt (localStorage).
   Không có backend: không dùng cho dữ liệu thật. */
(function () {
  var USERS_KEY = 'onboardai_users', SESSION_KEY = 'onboardai_session';
  var ROLES = {
    newhire: { label: 'Nhân viên mới', href: '../newhire/index.html' },
    mentor: { label: 'Mentor', href: '../mentor/index.html' },
    hr: { label: 'HR / Admin', href: '../hr/index.html' }
  };
  var DEMO = [
    { name: 'Nguyễn Minh Anh', email: 'newhire@onboardai.vn', role: 'newhire' },
    { name: 'Trần Quốc Bảo', email: 'mentor@onboardai.vn', role: 'mentor' },
    { name: 'Lê Thu Hà', email: 'hr@onboardai.vn', role: 'hr' }
  ];
  var DEMO_PASSWORD = '123456';

  function read(store, key) { try { return JSON.parse(store.getItem(key)); } catch (e) { return null; } }
  function write(store, key, val) { try { store.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } }
  function users() { return read(localStorage, USERS_KEY) || []; }
  function getSession() { return read(localStorage, SESSION_KEY) || read(sessionStorage, SESSION_KEY); }
  function logout() { try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch (e) {} }

  function hash(email, pw) {
    var text = 'onboardai:' + email + ':' + pw;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
    }
    var h = 5381; for (var i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return Promise.resolve('x' + (h >>> 0).toString(16));
  }

  function seedDemo() {
    if (users().length) return Promise.resolve();
    return Promise.all(DEMO.map(function (d) {
      return hash(d.email, DEMO_PASSWORD).then(function (h) { return { name: d.name, email: d.email, role: d.role, hash: h, demo: true }; });
    })).then(function (list) { write(localStorage, USERS_KEY, list); });
  }

  function $(id) { return document.getElementById(id); }
  function setErr(field, msg) {
    var box = $(field + '-field'), out = $(field + '-err');
    if (!box) return;
    box.classList.toggle('bad', !!msg);
    out.textContent = msg || '';
    var input = box.querySelector('input'); if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function banner(type, html) { var b = $('banner'); b.className = 'alert ' + type; b.innerHTML = html; b.hidden = false; }
  function clearBanner() { var b = $('banner'); if (b) b.hidden = true; }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function bindToggles() {
    Array.prototype.forEach.call(document.querySelectorAll('.pw button'), function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentNode.querySelector('input'), show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Ẩn' : 'Hiện';
        btn.setAttribute('aria-pressed', show);
      });
    });
  }

  function startSession(user, remember) {
    var s = { name: user.name, email: user.email, role: user.role, at: Date.now() };
    logout();
    write(remember ? localStorage : sessionStorage, SESSION_KEY, s);
    return ROLES[user.role] ? ROLES[user.role].href : '../index.html';
  }

  function existingSessionNotice() {
    var s = getSession(); if (!s) return;
    banner('info', 'Bạn đang đăng nhập với <b>' + esc(s.name) + '</b> (' + (ROLES[s.role] || {}).label + '). ' +
      '<a href="' + (ROLES[s.role] || { href: '../index.html' }).href + '">Vào không gian</a><button type="button" id="notice-logout">Đăng xuất</button>');
    $('notice-logout').addEventListener('click', function () { logout(); clearBanner(); });
  }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- Đăng nhập ---------- */
  function initLogin() {
    var form = $('login-form');
    existingSessionNotice();
    Array.prototype.forEach.call(document.querySelectorAll('[data-demo]'), function (b) {
      b.addEventListener('click', function () { $('email').value = b.getAttribute('data-demo'); $('password').value = DEMO_PASSWORD; setErr('email'); setErr('password'); $('password').focus(); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearBanner();
      var email = $('email').value.trim().toLowerCase(), pw = $('password').value, ok = true;
      setErr('email', !email ? 'Vui lòng nhập email.' : !EMAIL_RE.test(email) ? 'Email chưa đúng định dạng.' : '');
      setErr('password', !pw ? 'Vui lòng nhập mật khẩu.' : '');
      if (!email || !EMAIL_RE.test(email) || !pw) return;
      var btn = $('submit'); btn.disabled = true;
      seedDemo().then(function () { return hash(email, pw); }).then(function (h) {
        var u = users().filter(function (x) { return x.email === email; })[0];
        if (!u || u.hash !== h) { banner('error', 'Email hoặc mật khẩu không đúng.'); btn.disabled = false; return; }
        var dest = startSession(u, $('remember').checked);
        banner('ok', 'Đăng nhập thành công, đang chuyển hướng…');
        setTimeout(function () { location.href = dest; }, 600);
      });
    });
  }

  /* ---------- Đăng ký ---------- */
  function strength(pw) {
    var s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
    return pw ? Math.max(1, s) : 0;
  }
  function initRegister() {
    var form = $('register-form');
    $('password').addEventListener('input', function () {
      var s = strength(this.value);
      $('meter').setAttribute('data-s', s);
      $('meter-text').textContent = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][s];
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearBanner();
      var name = $('name').value.trim(), email = $('email').value.trim().toLowerCase(),
        pw = $('password').value, pw2 = $('confirm').value,
        roleEl = form.querySelector('input[name=role]:checked'), agree = $('agree').checked;
      var eName = name.length < 2 ? 'Vui lòng nhập họ và tên.' : '';
      var eEmail = !email ? 'Vui lòng nhập email.' : !EMAIL_RE.test(email) ? 'Email chưa đúng định dạng.' : '';
      var ePw = pw.length < 8 ? 'Mật khẩu cần tối thiểu 8 ký tự.' : !/\d/.test(pw) || !/[A-Za-z]/.test(pw) ? 'Mật khẩu cần có cả chữ và số.' : '';
      var eConfirm = pw2 !== pw ? 'Mật khẩu nhập lại không khớp.' : '';
      var eRole = roleEl ? '' : 'Vui lòng chọn vai trò.';
      var eAgree = agree ? '' : 'Bạn cần đồng ý với điều khoản để tiếp tục.';
      setErr('name', eName); setErr('email', eEmail); setErr('password', ePw);
      setErr('confirm', eConfirm); setErr('role', eRole); setErr('agree', eAgree);
      if (eName || eEmail || ePw || eConfirm || eRole || eAgree) return;
      var btn = $('submit'); btn.disabled = true;
      seedDemo().then(function () {
        if (users().some(function (x) { return x.email === email; })) {
          setErr('email', 'Email này đã được đăng ký.');
          banner('error', 'Email đã tồn tại. <a href="login.html">Đăng nhập</a> hoặc dùng email khác.');
          btn.disabled = false; return;
        }
        return hash(email, pw).then(function (h) {
          var list = users(), user = { name: name, email: email, role: roleEl.value, hash: h };
          list.push(user);
          if (!write(localStorage, USERS_KEY, list)) { banner('error', 'Không lưu được dữ liệu (trình duyệt chặn localStorage).'); btn.disabled = false; return; }
          var dest = startSession(user, true);
          banner('ok', 'Tạo tài khoản thành công! Đang chuyển hướng…');
          setTimeout(function () { location.href = dest; }, 800);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindToggles();
    if ($('login-form')) initLogin();
    if ($('register-form')) initRegister();
  });
})();
