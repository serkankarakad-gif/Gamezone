// ============================================================
// TÜRK İMPARATORLUĞU — security.js
// Hafif istemci koruması — asıl güvenlik Firebase Rules'da
// ============================================================
"use strict";

var SEC = (function () {

  var _actionLog = [];
  var _lastSave  = 0;

  // ——— Rate limit (spam önleme) ———
  function checkRateLimit() {
    var now = Date.now();
    _actionLog = _actionLog.filter(function(a) { return now - a < 60000; });
    if (_actionLog.length >= 150) {
      if (typeof UI !== "undefined") UI.toast("Çok hızlı işlem yapıyorsunuz.", "warning");
      return false;
    }
    _actionLog.push(now);
    return true;
  }

  // ——— Kayıt hız sınırı ———
  function canSave() {
    var now = Date.now();
    if (now - _lastSave < 4000) return false;
    _lastSave = now;
    return true;
  }

  // ——— Basit değer doğrulama (sadece uyarı, kick yok) ———
  function validateState(state) {
    if (!state || !state.wallet || !state.profile) return true;
    var tl = state.wallet.tl;
    if (!isFinite(tl) || tl > 1e13) {
      console.warn("[SEC] Anormal TL değeri:", tl);
      return false;
    }
    return true;
  }

  // ——— Hash yakalamak (gelecekte kullanmak için, şimdi pasif) ———
  function captureHash() { /* Firebase Rules'a güveniyoruz */ }

  // ——— Başlat ———
  function init() {
    // Sayfadan çıkarken kaydet
    window.addEventListener("beforeunload", function() {
      if (typeof GAME !== "undefined" && GAME.state) GAME.save();
    });
    console.log("[SEC] Güvenlik modülü başlatıldı.");
  }

  return {
    init:           init,
    captureHash:    captureHash,
    validateState:  validateState,
    checkRateLimit: checkRateLimit,
    canSave:        canSave
  };
})();
