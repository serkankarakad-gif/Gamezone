// ============================================================
// TÜRK İMPARATORLUĞU — security.js  (DÜZELTİLMİŞ)
// Anti-cheat | State bütünlüğü | Rate limit
// NOT: debugger ve console mute kaldırıldı — auth'u bozuyordu
// ============================================================
"use strict";

var SEC = (function () {

  var CFG = {
    MAX_TL:              1e13,
    MAX_ELMAS:           100000,
    MAX_LEVEL:           100,
    MAX_ACTIONS_PER_MIN: 120,
    SAVE_RATE_LIMIT_MS:  5000,
    HASH_CHECK_MS:       20000
  };

  var _violations  = 0;
  var _actionLog   = [];
  var _stateHash   = null;
  var _kicked      = false;
  var _timers      = [];
  var _lastSave    = 0;

  // ══ 1. STATE HASH (FNV-1a) ══
  function _hashState(state) {
    if (!state) return "0";
    try {
      var raw = [
        Math.round(state.wallet.tl),
        state.profile.level,
        state.profile.elmas,
        Math.round(state.stats.totalEarned),
        Math.round(state.stats.totalSpent)
      ].join("|");
      var h = 0x811c9dc5;
      for (var i = 0; i < raw.length; i++) {
        h ^= raw.charCodeAt(i);
        h  = (h * 0x01000193) >>> 0;
      }
      return h.toString(16);
    } catch (e) { return "err"; }
  }

  function captureHash() {
    if (typeof GAME === "undefined" || !GAME.state) return;
    _stateHash = _hashState(GAME.state);
  }

  function _startHashWatch() {
    var t = setInterval(function () {
      if (_kicked || !GAME || !GAME.state) return;
      var cur = _hashState(GAME.state);
      if (_stateHash && _stateHash !== "0" && cur !== _stateHash) {
        _violation("State hash uyuşmazlığı — dışarıdan değiştirilmiş olabilir", false);
      }
    }, CFG.HASH_CHECK_MS);
    _timers.push(t);
  }

  // ══ 2. DEĞER SINIR KONTROLLARI ══
  function validateState(state) {
    if (!state) return true;
    var w = state.wallet;
    var p = state.profile;
    if (!isFinite(w.tl))           return false;
    if (w.tl > CFG.MAX_TL)         return false;
    if (w.tl < -1e9)               return false;
    if (!isFinite(p.elmas))        return false;
    if (p.elmas > CFG.MAX_ELMAS)   return false;
    if (p.level > CFG.MAX_LEVEL)   return false;
    return true;
  }

  // ══ 3. RATE LIMIT ══
  function checkRateLimit() {
    var now = Date.now();
    _actionLog = _actionLog.filter(function (a) { return now - a < 60000; });
    if (_actionLog.length >= CFG.MAX_ACTIONS_PER_MIN) {
      if (typeof UI !== "undefined") UI.toast("Çok hızlı işlem yapıyorsunuz, biraz bekleyin.", "warning");
      return false;
    }
    _actionLog.push(now);
    return true;
  }

  // ══ 4. KAYIT RATE LIMIT ══
  function canSave() {
    var now = Date.now();
    if (now - _lastSave < CFG.SAVE_RATE_LIMIT_MS) return false;
    _lastSave = now;
    return true;
  }

  // ══ 5. D.CONFIG DONDUR ══
  function _freezeData() {
    try {
      if (typeof D !== "undefined") {
        Object.freeze(D.CONFIG);
      }
    } catch (e) { /* ignore */ }
  }

  // ══ 6. İHLAL / KICK ══
  function _violation(reason, warn) {
    _violations++;
    if (typeof console !== "undefined" && console.error) {
      console.error("[SEC] İhlal #" + _violations + ": " + reason);
    }
    if (warn && _violations < 3) {
      if (typeof UI !== "undefined") {
        UI.toast("⚠️ Şüpheli aktivite (" + _violations + "/3)", "warning");
      }
      return;
    }
    _kick(reason);
  }

  function _kick(reason) {
    if (_kicked) return;
    _kicked = true;
    _timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    if (typeof GAME !== "undefined" && GAME.destroy) GAME.destroy();
    if (window.fbAuth) window.fbAuth.signOut().catch(function () {});

    // Kick overlay
    var ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;background:#000;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;font-family:sans-serif";
    ov.innerHTML =
      '<div style="font-size:3rem">🚫</div>' +
      '<div style="color:#ef4444;font-size:1.4rem;font-weight:700">GÜVENLİK İHLALİ</div>' +
      '<div style="color:#888;font-size:.9rem;text-align:center;max-width:320px">Hesabınızda şüpheli aktivite tespit edildi. Oturumunuz sonlandırıldı.</div>' +
      '<button onclick="location.reload()" style="padding:.7rem 2rem;background:#c8102e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1rem">Yeniden Giriş Yap</button>';
    document.body.appendChild(ov);

    // Firebase log
    if (window.fbDB && window.fbAuth && window.fbAuth.currentUser) {
      window.fbDB.collection("security_log").add({
        uid: window.fbAuth.currentUser.uid,
        reason: reason,
        ua: navigator.userAgent,
        ts: new Date().toISOString()
      }).catch(function () {});
    }
  }

  // ══ BAŞLAT ══
  function init() {
    _freezeData();
    _startHashWatch();
    window.addEventListener("beforeunload", function () {
      if (typeof GAME !== "undefined" && GAME.state) GAME.save();
    });
  }

  return {
    init:           init,
    captureHash:    captureHash,
    validateState:  validateState,
    checkRateLimit: checkRateLimit,
    canSave:        canSave,
    violation:      _violation
  };
})();
