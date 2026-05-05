// ============================================================
// TÜRK İMPARATORLUĞU — game.js
// Oyun motoru — Realtime Database versiyonu
// ============================================================
"use strict";

var GAME = (function () {

  var _state   = null;
  var _user    = null;
  var _prices  = {};
  var _cprices = {};
  var _news    = [];
  var _timers  = [];
  var _dirty   = false;

  // ——— YENİ OYUNCU STATE ———
  function _defaultState(uid, name, email) {
    var now = new Date().toISOString();
    return {
      profile: {
        uid: uid, name: name, email: email,
        level: 1, xp: 0, elmas: D.CONFIG.INITIAL_ELMAS,
        avatar: "👤", badge: "Çırak 📜",
        creditScore: D.CONFIG.CREDIT_SCORE_INIT,
        party: null, sgkStatus: null, createdAt: now
      },
      wallet: {
        tl: D.CONFIG.INITIAL_TL,
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

  // ——— BAŞLAT ———
  function init() {
    SEC.init();
    initFirebase();

    D.STOCKS.forEach(function(s)  { _prices[s.sym]  = s.price; });
    D.CRYPTOS.forEach(function(c) { _cprices[c.sym] = c.price; });

    window.fbAuth.onAuthStateChanged(function(user) {
      if (user) {
        _user = user;
        _loadGame(user);
      } else {
        _user  = null;
        _state = null;
        UI.showAuth();
      }
    });

    _startMarket();
    _startNews();
  }

  // ——— OYUN YÜKLE ———
  function _loadGame(user) {
    UI.showLoader("Oyun yükleniyor...");

    DB.getUser(user.uid).then(function(data) {
      if (data) {
        // Mevcut oyuncu
        _state = data;
        _migrate();
        _calcOffline();
        _state.stats.loginCount = (_state.stats.loginCount || 0) + 1;
        _state.stats.lastLogin  = new Date().toISOString();
      } else {
        // İlk giriş veya kayıt sırasında yazılamadı — yeni oluştur
        var name  = user.displayName
                 || (user.email ? user.email.split("@")[0] : "Oyuncu");
        var email = user.email || "";
        _state = _defaultState(user.uid, name, email);
        console.log("Yeni oyuncu profili oluşturuldu:", name);
      }

      _dirty = true;
      _startAutoSave();

      // Kaydet — hata olsa bile oyunu göster
      return DB.saveUser(user.uid, _state).catch(function(e) {
        console.warn("İlk kayıt başarısız:", e);
        return false;
      });

    }).then(function() {
      if (!_state) return;
      UI.hideLoader();
      UI.showApp();
      UI.updateHUD();
      UI.toast("Hoş geldiniz, " + _state.profile.name + "! 👋", "success");

      // Liderlik tablosunu güncelle
      DB.updateLeaderboard(
        _user.uid,
        _state.profile.name,
        _state.wallet.tl,
        _state.profile.level
      );

    }).catch(function(err) {
      console.error("_loadGame hatası:", err);
      UI.hideLoader();
      // Hata olsa bile state varsa göster
      if (_state) {
        UI.showApp();
        UI.toast("Bağlantı sorunu, çevrimdışı moddasınız.", "warning");
      } else {
        UI.toast("Yükleme başarısız. Sayfayı yenileyin.", "error");
      }
    });
  }

  // ——— MİGRASYON (eski verilerle uyum) ———
  function _migrate() {
    if (!_state) return;
    var s = _state;
    if (!s.wallet)                       s.wallet = { tl: 0, digitalWallet: { provider:null, balance:0 } };
    if (!s.wallet.digitalWallet)         s.wallet.digitalWallet = { provider:null, balance:0 };
    if (!s.bank)                         s.bank = { accounts:[], loans:[], deposits:[], checks:[] };
    if (!s.bank.checks)                  s.bank.checks = [];
    if (!s.government)                   s.government = { permits:[], notaryDocs:[], criminalRecord:[], courtCases:[] };
    if (!s.government.permits)           s.government.permits = [];
    if (!s.government.notaryDocs)        s.government.notaryDocs = [];
    if (!s.government.criminalRecord)    s.government.criminalRecord = [];
    if (!s.government.courtCases)        s.government.courtCases = [];
    if (!s.production)                   s.production = { gardens:[], farms:[], factories:[], mines:[], energy:[] };
    if (!s.production.energy)            s.production.energy = [];
    if (!s.profile.creditScore)          s.profile.creditScore = D.CONFIG.CREDIT_SCORE_INIT;
    if (!s.stats)                        s.stats = { totalEarned:0, totalSpent:0, tradeCount:0, loginCount:0, lastLogin:new Date().toISOString() };
    if (!s.stocks)                       s.stocks = { portfolio:{}, watchlist:[] };
    if (!s.crypto)                       s.crypto = { portfolio:{} };
    if (!s.properties)                   s.properties = { realEstate:[], insurance:[], mortgages:[] };
    if (!s.commerce)                     s.commerce = { shops:[] };
  }

  // ——— OFFLİNE KAZANÇ ———
  function _calcOffline() {
    if (!_state || !_state.stats || !_state.stats.lastLogin) return;
    var last    = new Date(_state.stats.lastLogin).getTime();
    if (isNaN(last)) return;
    var elapsed = Math.min(Date.now() - last, D.CONFIG.OFFLINE_MAX_MS);
    if (elapsed < 60000) return;

    var total = 0;
    ["gardens","farms","factories","mines","energy"].forEach(function(key) {
      (_state.production[key] || []).forEach(function(item) {
        if (item.timeSec) {
          var ticks = Math.floor(elapsed / (item.timeSec * 1000));
          if (ticks > 0) total += ticks * (item.income || 0);
        }
      });
    });
    (_state.commerce.shops || []).forEach(function(sh) {
      if (sh.timeSec) {
        var ticks = Math.floor(elapsed / (sh.timeSec * 1000));
        if (ticks > 0) total += ticks * (sh.income || 0);
      }
    });
    (_state.bank.deposits || []).filter(function(d) { return d.active; }).forEach(function(dep) {
      var days = elapsed / (86400 * 1000);
      dep.accumulated = (dep.accumulated || 0) + (dep.amount || 0) * (dep.rate || 0) * days;
    });

    if (total > 0) {
      var net = Math.round(total * (1 - D.CONFIG.TAX_RATE));
      if (net > 5e9) net = 5e9;
      _state.wallet.tl        += net;
      _state.stats.totalEarned = (_state.stats.totalEarned || 0) + net;
      _dirty = true;
      setTimeout(function() {
        UI.toast("Yokluğunuzda " + fmt(net) + " TL kazandınız!", "info");
      }, 2500);
    }
  }

  // ——— OTO KAYIT ———
  function _startAutoSave() {
    var t = setInterval(function() {
      if (_dirty && _user && _state) {
        DB.saveUser(_user.uid, _state);
        _dirty = false;
        // Liderliği güncelle
        DB.updateLeaderboard(_user.uid, _state.profile.name, _state.wallet.tl, _state.profile.level);
      }
    }, D.CONFIG.AUTO_SAVE_MS);
    _timers.push(t);
  }

  // ——— PİYASA SİMÜLASYONU ———
  function _startMarket() {
    var t = setInterval(function() {
      D.STOCKS.forEach(function(s) {
        var r = (Math.random() - 0.48) * s.vol * 2;
        _prices[s.sym] = Math.max(s.price * 0.3, Math.min(s.price * 3, _prices[s.sym] * (1 + r)));
        _prices[s.sym] = parseFloat(_prices[s.sym].toFixed(2));
      });
      D.CRYPTOS.forEach(function(c) {
        var r = (Math.random() - 0.47) * c.vol * 2;
        _cprices[c.sym] = Math.max(c.price * 0.1, Math.min(c.price * 10, _cprices[c.sym] * (1 + r)));
        _cprices[c.sym] = parseFloat(_cprices[c.sym].toFixed(c.price >= 1000 ? 0 : 4));
      });
      UI.refreshTicker();
      _checkDividends();
    }, D.CONFIG.MARKET_TICK_MS);
    _timers.push(t);
  }

  function _checkDividends() {
    if (!_state) return;
    var d   = new Date();
    if (d.getDate() !== 15) return;
    var key = d.getFullYear() + "-" + (d.getMonth() + 1);
    if (_state._lastDivKey === key) return;
    _state._lastDivKey = key;
    var total = 0;
    Object.keys(_state.stocks.portfolio).forEach(function(sym) {
      var stock = D.STOCKS.find(function(s) { return s.sym === sym; });
      if (!stock || !stock.div) return;
      total += (_state.stocks.portfolio[sym].qty || 0) * (_prices[sym] || stock.price) * stock.div / 12;
    });
    if (total > 0) {
      var net = Math.round(total);
      _state.wallet.tl        += net;
      _state.stats.totalEarned = (_state.stats.totalEarned || 0) + net;
      _dirty = true;
      UI.toast("💰 Temettü: " + fmt(net) + " yatırıldı!", "success");
      UI.updateHUD();
    }
  }

  // ——— HABERLER ———
  function _startNews() {
    function gen() {
      var tmpl = D.NEWS_TEMPLATES[Math.floor(Math.random() * D.NEWS_TEMPLATES.length)];
      var s    = D.STOCKS[Math.floor(Math.random() * D.STOCKS.length)];
      var txt  = tmpl
        .replace("{v}",     (Math.random() * 5 + 0.5).toFixed(1))
        .replace("{rate}",  (Math.random() * 2 + 32).toFixed(2))
        .replace("{sym}",   s.sym)
        .replace("{name}",  s.name)
        .replace("{amount}",String(Math.floor(Math.random() * 50 + 10)))
        .replace("{baz}",   String(Math.floor(Math.random() * 4 + 1) * 25));
      _news.unshift({ text: txt, time: new Date() });
      if (_news.length > 30) _news.pop();
      UI.updateNewsTicker();
    }
    gen();
    _timers.push(setInterval(gen, 45000));
  }

  // ——— FORMAT ———
  function fmt(n) {
    if (n == null || !isFinite(n)) return "₺0";
    var abs = Math.abs(n), pre = n < 0 ? "-" : "";
    if (abs >= 1e9) return pre + "₺" + (abs / 1e9).toFixed(2) + " Mr";
    if (abs >= 1e6) return pre + "₺" + (abs / 1e6).toFixed(2) + " M";
    if (abs >= 1e3) return pre + "₺" + (abs / 1e3).toFixed(1) + " B";
    return pre + "₺" + parseFloat(abs.toFixed(2)).toLocaleString("tr-TR");
  }
  function fmtFull(n) {
    return parseFloat((n || 0).toFixed(2)).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtTime(sec) {
    if (sec < 3600)  return Math.floor(sec / 60) + " dakika";
    if (sec < 86400) return (sec / 3600).toFixed(1) + " saat";
    return (sec / 86400).toFixed(1) + " gün";
  }

  // ——— PARA ———
  function canAfford(amount) {
    return _state && isFinite(amount) && amount > 0 && _state.wallet.tl >= amount;
  }
  function spend(amount, desc) {
    amount = parseFloat(amount);
    if (!isFinite(amount) || amount <= 0) { UI.toast("Geçersiz miktar.", "error"); return false; }
    if (typeof SEC !== "undefined" && !SEC.checkRateLimit()) return false;
    if (!canAfford(amount)) { UI.toast("Yetersiz bakiye!", "error"); return false; }
    _state.wallet.tl        -= amount;
    _state.stats.totalSpent  = (_state.stats.totalSpent || 0) + amount;
    _dirty = true;
    return true;
  }
  function earnNet(gross) {
    gross = parseFloat(gross);
    if (!isFinite(gross) || gross < 0) return 0;
    var net = Math.round(gross * (1 - D.CONFIG.TAX_RATE));
    _state.wallet.tl        += net;
    _state.stats.totalEarned = (_state.stats.totalEarned || 0) + net;
    _dirty = true;
    return net;
  }
  function earnRaw(amount) {
    amount = parseFloat(amount);
    if (!isFinite(amount) || amount < 0) return;
    _state.wallet.tl        += amount;
    _state.stats.totalEarned = (_state.stats.totalEarned || 0) + amount;
    _dirty = true;
  }

  // ——— LEVEL ———
  function xpForLevel(lvl) {
    return Math.floor(D.CONFIG.LEVEL_XP_BASE * Math.pow(D.CONFIG.LEVEL_XP_MULT, lvl - 1));
  }
  function addXP(amount) {
    if (!_state) return;
    _state.profile.xp = (_state.profile.xp || 0) + amount;
    var needed = xpForLevel(_state.profile.level + 1);
    if (_state.profile.xp >= needed) {
      _state.profile.level++;
      _state.profile.xp    -= needed;
      _state.profile.badge  = _badge(_state.profile.level);
      _state.profile.elmas  = (_state.profile.elmas || 0) + 5;
      _dirty = true;
      UI.toast("🎉 Seviye " + _state.profile.level + " — " + _state.profile.badge, "success");
    }
    _dirty = true;
    UI.updateHUD();
  }
  function _badge(lvl) {
    if (lvl >= 50) return "İmparator 👑";
    if (lvl >= 40) return "Paşa 🦅";
    if (lvl >= 30) return "Vezir 🏛️";
    if (lvl >= 20) return "Bey 💎";
    if (lvl >= 15) return "Ağa 🌟";
    if (lvl >= 10) return "Tüccar 🏪";
    if (lvl >= 5)  return "Esnaf 🛒";
    return "Çırak 📜";
  }

  // ——— HESAPLAMALAR ———
  function portfolioValue() {
    if (!_state) return 0;
    var v = 0;
    Object.keys(_state.stocks.portfolio).forEach(function(sym) {
      v += (_state.stocks.portfolio[sym].qty || 0) * (_prices[sym] || 0);
    });
    return v;
  }
  function cryptoValue() {
    if (!_state) return 0;
    var v = 0;
    Object.keys(_state.crypto.portfolio).forEach(function(sym) {
      v += (_state.crypto.portfolio[sym].qty || 0) * (_cprices[sym] || 0);
    });
    return v;
  }
  function netWorth() {
    if (!_state) return 0;
    var nw = _state.wallet.tl;
    nw += portfolioValue();
    nw += cryptoValue();
    (_state.bank.accounts || []).forEach(function(a) { nw += (a.balance || 0); });
    (_state.bank.deposits || []).filter(function(d) { return d.active; }).forEach(function(d) { nw += (d.amount || 0); });
    return nw;
  }
  function updateCreditScore(delta) {
    if (!_state) return;
    _state.profile.creditScore = Math.min(900, Math.max(300, (_state.profile.creditScore || 650) + delta));
    _dirty = true;
  }

  // ——— KAYDET ———
  function save() {
    if (!_user || !_state) return Promise.resolve(false);
    return DB.saveUser(_user.uid, _state);
  }

  // ——— TEMİZLE ———
  function destroy() {
    _timers.forEach(function(t) { clearInterval(t); });
    _timers = []; _state = null; _user = null; _dirty = false;
  }

  // ——— IBAN ÜRET ———
  function genIBAN() {
    var d = "";
    for (var i = 0; i < 22; i++) d += Math.floor(Math.random() * 10);
    return "TR" + d.slice(0,2) + " " + d.slice(2,6) + " " + d.slice(6,10) + " " +
           d.slice(10,14) + " " + d.slice(14,18) + " " + d.slice(18,22);
  }

  return {
    init: init, destroy: destroy, save: save,
    get state()  { return _state;   },
    get user()   { return _user;    },
    get prices() { return _prices;  },
    get cprices(){ return _cprices; },
    get news()   { return _news;    },
    set dirty(v) { _dirty = v;      },
    fmt: fmt, fmtFull: fmtFull, fmtTime: fmtTime,
    canAfford: canAfford, spend: spend, earnNet: earnNet, earnRaw: earnRaw,
    addXP: addXP, xpForLevel: xpForLevel,
    portfolioValue: portfolioValue, cryptoValue: cryptoValue,
    netWorth: netWorth, updateCreditScore: updateCreditScore,
    genIBAN: genIBAN
  };
})();

window.addEventListener("load", function() { GAME.init(); });
