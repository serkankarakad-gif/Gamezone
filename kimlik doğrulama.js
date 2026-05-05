// ============================================================
// TÜRK İMPARATORLUĞU — auth.js  (DÜZELTİLMİŞ)
// Kayıt, Giriş, Şifre Sıfırlama
// ============================================================
"use strict";

var AUTH = (function () {

  var _attempts = {};
  var MAX_TRIES = 5;
  var LOCK_MS   = 15 * 60 * 1000;
  var _screen   = "login";

  // ——— XSS koruması ———
  function sanitize(str) {
    if (typeof str !== "string") return "";
    return str.trim().replace(/[<>"'`]/g, "").substring(0, 500);
  }

  // ——— E-posta kontrolü ———
  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
  }

  // ——— Şifre gücü ———
  function validPass(p) {
    if (!p || p.length < 8)  return "Şifre en az 8 karakter olmalı.";
    if (!/[A-Z]/.test(p))    return "En az 1 büyük harf gerekli. (A-Z)";
    if (!/[a-z]/.test(p))    return "En az 1 küçük harf gerekli. (a-z)";
    if (!/[0-9]/.test(p))    return "En az 1 rakam gerekli. (0-9)";
    return null;
  }

  // ——— Brute-force ———
  function _isLocked(email) {
    var k = email.toLowerCase();
    if (!_attempts[k]) return false;
    if (Date.now() < _attempts[k].until) {
      var rem = Math.ceil((_attempts[k].until - Date.now()) / 60000);
      _toast("Çok fazla deneme. " + rem + " dakika bekleyin.", "error");
      return true;
    }
    delete _attempts[k];
    return false;
  }

  function _recordFail(email) {
    var k = email.toLowerCase();
    if (!_attempts[k]) _attempts[k] = { count: 0, until: 0 };
    _attempts[k].count++;
    if (_attempts[k].count >= MAX_TRIES) {
      _attempts[k].until = Date.now() + LOCK_MS;
      _attempts[k].count = 0;
      _toast("5 başarısız deneme — 15 dakika kilitlendi.", "error");
    }
  }

  // ——— Güvenli toast (UI henüz yüklenmemiş olabilir) ———
  function _toast(msg, type) {
    if (typeof UI !== "undefined" && UI.toast) {
      UI.toast(msg, type);
    } else {
      alert(msg);
    }
  }

  // ——— Firebase Auth hazır mı? ———
  function _authReady() {
    if (!window.fbAuth) {
      _toast("Sunucu bağlantısı henüz hazır değil. 2 saniye bekleyip tekrar deneyin.", "error");
      return false;
    }
    return true;
  }

  // ——— Firebase hata mesajları ———
  function _errMsg(code) {
    var msgs = {
      "auth/user-not-found":         "Bu e-posta ile kayıtlı kullanıcı bulunamadı.",
      "auth/wrong-password":         "E-posta veya şifre hatalı.",
      "auth/invalid-credential":     "E-posta veya şifre hatalı.",
      "auth/email-already-in-use":   "Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.",
      "auth/weak-password":          "Şifre çok zayıf. En az 8 karakter, büyük/küçük harf ve rakam kullanın.",
      "auth/invalid-email":          "Geçersiz e-posta adresi formatı.",
      "auth/too-many-requests":      "Çok fazla başarısız deneme. Bir süre bekleyin.",
      "auth/network-request-failed": "İnternet bağlantısı yok veya zayıf.",
      "auth/user-disabled":          "Bu hesap devre dışı bırakılmış.",
      "auth/operation-not-allowed":  "E-posta/şifre girişi aktif değil. Firebase Console'dan aktif edin.",
      "auth/popup-closed-by-user":   "İşlem iptal edildi.",
      "auth/requires-recent-login":  "Güvenlik için tekrar giriş yapmanız gerekiyor."
    };
    return msgs[code] || "Hata: " + (code || "Bilinmeyen") + " — Tekrar deneyin.";
  }

  // ——— Yeni oyuncu başlangıç verisi ———
  function _buildState(name, email, uid) {
    var now = new Date().toISOString();
    return {
      profile: {
        uid:         uid,
        name:        name,
        email:       email,
        level:       1,
        xp:          0,
        elmas:       D.CONFIG.INITIAL_ELMAS,
        avatar:      "👤",
        badge:       "Çırak 📜",
        creditScore: D.CONFIG.CREDIT_SCORE_INIT,
        party:       null,
        sgkStatus:   null,
        createdAt:   now
      },
      wallet: {
        tl:            D.CONFIG.INITIAL_TL,
        digitalWallet: { provider: null, balance: 0 }
      },
      bank:       { accounts: [], loans: [], deposits: [], checks: [] },
      stocks:     { portfolio: {}, watchlist: [] },
      crypto:     { portfolio: {} },
      production: { gardens: [], farms: [], factories: [], mines: [], energy: [] },
      commerce:   { shops: [] },
      properties: { realEstate: [], insurance: [], mortgages: [] },
      government: {
        residence: null, municipality: null,
        permits: [], taxFiled: false,
        criminalRecord: [], courtCases: [], notaryDocs: []
      },
      stats: {
        totalEarned: 0, totalSpent: 0, tradeCount: 0,
        loginCount: 1, lastLogin: now
      }
    };
  }

  // ——— Ekranı göster ———
  function show(screen) {
    ["login-screen", "reg-screen", "forgot-screen"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
    var target = document.getElementById(screen + "-screen");
    if (target) target.classList.remove("hidden");

    // Tab buton aktifliği
    var tabs = document.querySelectorAll(".auth-tabs button");
    tabs.forEach(function (btn) { btn.classList.remove("active"); });
    if (screen === "login")  tabs[0] && tabs[0].classList.add("active");
    if (screen === "reg")    tabs[1] && tabs[1].classList.add("active");

    _screen = screen;
  }

  // ——— GİRİŞ ———
  function login() {
    if (!_authReady()) return;

    var emailEl = document.getElementById("login-email");
    var passEl  = document.getElementById("login-pass");
    if (!emailEl || !passEl) return _toast("Sayfa yüklenemedi, yenileyin.", "error");

    var email = sanitize(emailEl.value).toLowerCase();
    var pass  = passEl.value;

    if (!validEmail(email)) return _toast("Geçerli bir e-posta girin. Örnek: ali@gmail.com", "error");
    if (!pass)              return _toast("Şifrenizi girin.", "error");
    if (_isLocked(email))   return;

    _setBtn("login-btn", true, "Giriş yapılıyor...");

    window.fbAuth.signInWithEmailAndPassword(email, pass)
      .then(function () {
        delete _attempts[email];
        // onAuthStateChanged game.js'de handle ediyor
      })
      .catch(function (err) {
        _recordFail(email);
        _toast(_errMsg(err.code), "error");
      })
      .finally(function () {
        _setBtn("login-btn", false, "Giriş Yap");
      });
  }

  // ——— KAYIT ———
  function register() {
    if (!_authReady()) return;

    var nameEl  = document.getElementById("reg-name");
    var emailEl = document.getElementById("reg-email");
    var passEl  = document.getElementById("reg-pass");
    var pass2El = document.getElementById("reg-pass2");
    var termsEl = document.getElementById("reg-terms");

    if (!nameEl || !emailEl || !passEl || !pass2El || !termsEl)
      return _toast("Form yüklenemedi. Sayfayı yenileyin.", "error");

    var name  = sanitize(nameEl.value);
    var email = sanitize(emailEl.value).toLowerCase();
    var pass  = passEl.value;
    var pass2 = pass2El.value;
    var terms = termsEl.checked;

    if (!name || name.length < 2)   return _toast("Ad Soyad en az 2 karakter olmalı.", "error");
    if (!validEmail(email))          return _toast("Geçerli bir e-posta girin. Örnek: ali@gmail.com", "error");
    var passErr = validPass(pass);
    if (passErr)                     return _toast(passErr, "error");
    if (pass !== pass2)              return _toast("Şifreler eşleşmiyor.", "error");
    if (!terms)                      return _toast("Kullanım koşullarını kabul etmelisiniz.", "error");

    _setBtn("reg-btn", true, "Kayıt olunuyor...");

    window.fbAuth.createUserWithEmailAndPassword(email, pass)
      .then(function (cred) {
        var uid   = cred.user.uid;
        var state = _buildState(name, email, uid);
        return cred.user.updateProfile({ displayName: name })
          .then(function () { return DB.saveUser(uid, state); })
          .then(function () {
            // E-posta doğrulama — hata verirse oyunu engelleme
            cred.user.sendEmailVerification().catch(function () {});
            _toast("🎉 Hoş geldiniz, " + name + "! 50.000 TL ile başlıyorsunuz!", "success");
          });
      })
      .catch(function (err) {
        _toast(_errMsg(err.code), "error");
      })
      .finally(function () {
        _setBtn("reg-btn", false, "Kayıt Ol — 50.000 TL başla!");
      });
  }

  // ——— ŞİFRE SIFIRLA ———
  function forgotPassword() {
    if (!_authReady()) return;

    var emailEl = document.getElementById("forgot-email");
    if (!emailEl) return _toast("Form yüklenemedi.", "error");

    var email = sanitize(emailEl.value).toLowerCase();
    if (!validEmail(email)) return _toast("Geçerli bir e-posta girin.", "error");

    _setBtn("forgot-btn", true, "Gönderiliyor...");

    window.fbAuth.sendPasswordResetEmail(email, { url: window.location.href })
      .then(function () {
        _toast("✅ Sıfırlama linki gönderildi! Spam klasörünü de kontrol edin.", "success");
        setTimeout(function () { show("login"); }, 3000);
      })
      .catch(function (err) {
        // Güvenlik: kullanıcı var mı yok mu belli etme
        _toast("Eğer bu e-posta kayıtlıysa sıfırlama linki gönderildi.", "success");
        setTimeout(function () { show("login"); }, 3000);
      })
      .finally(function () {
        _setBtn("forgot-btn", false, "Sıfırlama Linki Gönder");
      });
  }

  // ——— ÇIKIŞ ———
  function logout() {
    if (!window.fbAuth) { location.reload(); return; }
    window.fbAuth.signOut()
      .then(function () {
        if (typeof GAME !== "undefined" && GAME.destroy) GAME.destroy();
        var app  = document.getElementById("app");
        var auth = document.getElementById("auth-screen");
        if (app)  app.classList.add("hidden");
        if (auth) auth.classList.remove("hidden");
        show("login");
        _toast("Başarıyla çıkış yapıldı.", "info");
      })
      .catch(function () { location.reload(); });
  }

  // ——— ŞİFRE DEĞİŞTİR ———
  function changePassword() {
    var oldEl  = document.getElementById("cp-old");
    var newEl  = document.getElementById("cp-new");
    var new2El = document.getElementById("cp-new2");
    if (!oldEl || !newEl || !new2El) return;

    var oldPass = oldEl.value;
    var newPass = newEl.value;
    var newPass2 = new2El.value;

    var pe = validPass(newPass);
    if (pe)                 return _toast(pe, "error");
    if (newPass !== newPass2) return _toast("Yeni şifreler eşleşmiyor.", "error");

    var user = window.fbAuth && window.fbAuth.currentUser;
    if (!user) return _toast("Giriş yapmalısınız.", "error");

    var cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
    user.reauthenticateWithCredential(cred)
      .then(function () { return user.updatePassword(newPass); })
      .then(function () {
        _toast("✅ Şifre başarıyla değiştirildi.", "success");
        if (typeof UI !== "undefined") UI.closeModal();
      })
      .catch(function (err) {
        if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
          _toast("Mevcut şifreniz yanlış.", "error");
        else
          _toast(_errMsg(err.code), "error");
      });
  }

  // ——— Buton loading state ———
  function _setBtn(id, loading, text) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? "⏳ " + text : text;
  }

  return {
    show:           show,
    login:          login,
    register:       register,
    forgotPassword: forgotPassword,
    logout:         logout,
    changePassword: changePassword,
    sanitize:       sanitize,
    currentScreen:  function () { return _screen; }
  };
})();
