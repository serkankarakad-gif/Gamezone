// ============================================================
// TÜRK İMPARATORLUĞU — piyasa.js
// Borsa, Kripto, Döviz, Emtia, Yatırım Fonları — Grafikler
// ============================================================
"use strict";

var PIYASA = (function() {

  // Anlık fiyatlar
  var _fiyatlar   = {};  // hisse
  var _kFiyatlar  = {};  // kripto
  var _dFiyatlar  = {};  // döviz
  var _eFiyatlar  = {};  // emtia
  var _gecmis     = {};  // grafik geçmişi (son 60 nokta)

  var RENK_PALET = ["#1565C0","#2E7D32","#C62828","#6A1B9A","#E65100","#00695C","#37474F","#F57F17","#880E4F","#4E342E"];

  // ══ BAŞLAT ══
  function init() {
    D.STOCKS.forEach(function(s) {
      _fiyatlar[s.sym]  = s.price;
      _gecmis[s.sym]    = _genGecmis(s.price, 60);
    });
    D.CRYPTOS.forEach(function(c) {
      _kFiyatlar[c.sym] = c.price;
      _gecmis["k_"+c.sym] = _genGecmis(c.price, 60);
    });
    D.FOREX.forEach(function(f) {
      _dFiyatlar[f.sym] = f.rate;
    });
    D.EMTIA.forEach(function(e) {
      _eFiyatlar[e.sym] = e.price;
    });
  }

  function _genGecmis(base, n) {
    var arr = [], val = base;
    for (var i = 0; i < n; i++) {
      val = val * (1 + (Math.random()-0.48)*0.008);
      arr.push(parseFloat(val.toFixed(val >= 1000 ? 0 : 2)));
    }
    return arr;
  }

  // ══ TİCK (Her 5 saniye) ══
  function tick() {
    D.STOCKS.forEach(function(s) {
      var r = (Math.random()-0.48) * s.vol * 0.4;
      _fiyatlar[s.sym] = Math.max(s.price*0.3, Math.min(s.price*3, _fiyatlar[s.sym]*(1+r)));
      _fiyatlar[s.sym] = parseFloat(_fiyatlar[s.sym].toFixed(2));
      _gecmis[s.sym].push(_fiyatlar[s.sym]);
      if (_gecmis[s.sym].length > 120) _gecmis[s.sym].shift();
    });
    D.CRYPTOS.forEach(function(c) {
      var r = (Math.random()-0.47) * c.vol * 0.5;
      _kFiyatlar[c.sym] = Math.max(c.price*0.1, Math.min(c.price*8, _kFiyatlar[c.sym]*(1+r)));
      _kFiyatlar[c.sym] = parseFloat(_kFiyatlar[c.sym].toFixed(c.price >= 1000 ? 0 : 2));
      _gecmis["k_"+c.sym].push(_kFiyatlar[c.sym]);
      if (_gecmis["k_"+c.sym].length > 120) _gecmis["k_"+c.sym].shift();
    });
    D.FOREX.forEach(function(f) {
      var r = (Math.random()-0.48) * f.vol * 0.3;
      _dFiyatlar[f.sym] = Math.max(f.rate*0.6, Math.min(f.rate*1.8, _dFiyatlar[f.sym]*(1+r)));
      _dFiyatlar[f.sym] = parseFloat(_dFiyatlar[f.sym].toFixed(4));
    });
    D.EMTIA.forEach(function(e) {
      var r = (Math.random()-0.48) * 0.008;
      _eFiyatlar[e.sym] = Math.max(e.price*0.5, Math.min(e.price*3, _eFiyatlar[e.sym]*(1+r)));
      _eFiyatlar[e.sym] = parseFloat(_eFiyatlar[e.sym].toFixed(2));
    });
  }

  function fiyat(sym)       { return _fiyatlar[sym]  || 0; }
  function kriptoFiyat(sym) { return _kFiyatlar[sym] || 0; }
  function dovizFiyat(sym)  { return _dFiyatlar[sym] || 0; }
  function emtiaFiyat(sym)  { return _eFiyatlar[sym] || 0; }

  function degisim(sym, tablo) {
    tablo = tablo || _fiyatlar;
    var base = (D.STOCKS.find(function(s){return s.sym===sym;})||D.CRYPTOS.find(function(c){return c.sym===sym;})||{}).price;
    if (!base) return 0;
    return ((tablo[sym] - base) / base * 100);
  }

  // ══ GRAFİK ÇİZ ══
  function cizGrafik(canvasId, sym, isKripto, color) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var key    = isKripto ? ("k_"+sym) : sym;
    var data   = _gecmis[key];
    if (!data || !data.length) return;
    var ctx    = canvas.getContext("2d");
    var W      = canvas.offsetWidth || 300;
    var H      = canvas.offsetHeight || 120;
    canvas.width  = W;
    canvas.height = H;

    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;
    var pad   = 10;

    ctx.clearRect(0, 0, W, H);

    // Gradient dolgu
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    var c = color || "#1565C0";
    grad.addColorStop(0, c + "33");
    grad.addColorStop(1, c + "00");

    ctx.beginPath();
    data.forEach(function(v, i) {
      var x = pad + (i / (data.length-1)) * (W - pad*2);
      var y = H - pad - ((v - min) / range) * (H - pad*2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    // Alan
    ctx.lineTo(pad + (W-pad*2), H);
    ctx.lineTo(pad, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Çizgi
    ctx.beginPath();
    data.forEach(function(v, i) {
      var x = pad + (i / (data.length-1)) * (W - pad*2);
      var y = H - pad - ((v - min) / range) * (H - pad*2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = c;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Son nokta
    var lastX = pad + (W - pad*2);
    var lastY = H - pad - ((data[data.length-1] - min) / range) * (H - pad*2);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI*2);
    ctx.fillStyle = c;
    ctx.fill();
  }

  // Mini sparkline (liste için)
  function cizSparkline(canvasId, sym, isKripto, color) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var key  = isKripto ? ("k_"+sym) : sym;
    var data = (_gecmis[key] || []).slice(-20);
    if (!data.length) return;
    var ctx  = canvas.getContext("2d");
    var W    = canvas.width  = canvas.offsetWidth || 70;
    var H    = canvas.height = canvas.offsetHeight || 30;
    var min  = Math.min.apply(null, data);
    var max  = Math.max.apply(null, data);
    var rng  = max - min || 1;
    var isUp = data[data.length-1] >= data[0];
    var c    = color || (isUp ? "#4CAF50" : "#EF5350");

    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    data.forEach(function(v, i) {
      var x = (i / (data.length-1)) * W;
      var y = H - ((v - min) / rng) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = c;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ══ BORSA SECTION ══
  function renderBorsa() {
    var s   = OYUN.s;
    var tab = _getCurrentTab("borsa-tab") || "liste";
    var html = '<div class="page-header"><h1>📈 Borsa (BİST)</h1></div>';
    html += '<div class="tabs-bar" id="borsa-tabs">';
    html += _tab("liste",    "Liste",     tab) + _tab("portfoy", "Portföyüm", tab) + _tab("favori",  "Favoriler", tab);
    html += '</div>';

    if (tab === "liste") html += _borsaListe();
    else if (tab === "portfoy") html += _borsaPortfoy();
    else html += _borsaFavori();

    _setSection(html);
    _bindTabs("borsa-tabs", "borsa-tab", renderBorsa);
    // Grafikleri çiz
    setTimeout(function() {
      D.STOCKS.forEach(function(s) {
        cizSparkline("spark-" + s.sym, s.sym, false, s.color);
      });
    }, 50);
  }

  function _borsaListe() {
    var s    = OYUN.s;
    var html = '';
    D.STOCKS.forEach(function(st) {
      var fiy  = _fiyatlar[st.sym];
      var chg  = degisim(st.sym);
      var isUp = chg >= 0;
      var pos  = s.borsa.portfoy[st.sym];
      html += '<div class="market-row" onclick="PIYASA.showHisseDetay(\'' + st.sym + '\')">';
      html += '<div class="market-icon" style="background:' + (st.color||"#1565C0") + '">' + (st.emoji||st.sym.charAt(0)) + '</div>';
      html += '<div class="market-info"><div class="market-name">' + st.name + '</div>';
      html += '<div class="market-code">' + st.sym + (pos ? ' • ' + pos.adet + ' adet' : '') + '</div></div>';
      html += '<canvas id="spark-' + st.sym + '" class="market-sparkline" width="70" height="30"></canvas>';
      html += '<div class="market-right"><div class="market-price">' + OYUN.fmtTam(fiy).replace("₺","") + ' ₺</div>';
      html += '<div class="market-change ' + (isUp?"text-green":"text-red") + '">' + (isUp?"▲":"▼") + Math.abs(chg).toFixed(2) + '%</div></div>';
      html += '</div>';
    });
    return '<div class="card" style="margin-top:.75rem"><div style="padding:.4rem 1rem .2rem;font-size:.72rem;color:var(--text2);font-weight:700;text-transform:uppercase">Tüm Hisseler (' + D.STOCKS.length + ')</div>' + html + '</div>';
  }

  function _borsaPortfoy() {
    var s   = OYUN.s;
    var pos = s.borsa.portfoy;
    var keys = Object.keys(pos).filter(function(k) { return pos[k].adet > 0; });
    if (!keys.length) return '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">Portföy boş</div><div class="empty-sub">Hisse satın alarak başlayın</div></div></div>';

    var toplamYatirim = 0, toplamDeger = 0;
    var html = '';
    keys.forEach(function(sym) {
      var p    = pos[sym];
      var fiy  = _fiyatlar[sym] || p.avgMaliyet;
      var deger = p.adet * fiy;
      var pnl   = deger - p.adet * p.avgMaliyet;
      var pct   = (pnl / (p.adet * p.avgMaliyet) * 100);
      toplamYatirim += p.adet * p.avgMaliyet;
      toplamDeger   += deger;

      var st = D.STOCKS.find(function(s){return s.sym===sym;});
      html += '<div class="list-row">';
      html += '<div class="list-row-icon" style="background:' + (st&&st.color||"#1565C0") + ';color:#fff;font-size:1rem;border-radius:50%">' + (st&&st.emoji||sym.charAt(0)) + '</div>';
      html += '<div class="list-row-content"><div class="list-row-title">' + sym + '</div><div class="list-row-sub">' + p.adet + ' adet • Ort: ' + OYUN.fmt(p.avgMaliyet) + '</div></div>';
      html += '<div class="list-row-right"><div class="list-row-value">' + OYUN.fmt(deger) + '</div>';
      html += '<div class="list-row-change ' + (pnl>=0?"text-green":"text-red") + '">' + (pnl>=0?"▲":"▼") + Math.abs(pct).toFixed(2) + '%</div></div>';
      html += '</div>';
    });

    var pnlTop = toplamDeger - toplamYatirim;
    return '<div class="stat-grid" style="padding:.75rem">' +
      '<div class="stat-item"><div class="stat-item-label">Toplam Değer</div><div class="stat-item-value">' + OYUN.fmt(toplamDeger) + '</div></div>' +
      '<div class="stat-item"><div class="stat-item-label">Kar / Zarar</div><div class="stat-item-value ' + (pnlTop>=0?"text-green":"text-red") + '">' + OYUN.fmt(pnlTop) + '</div></div>' +
      '</div><div class="card" style="margin:.5rem .75rem">' + html + '</div>';
  }

  function _borsaFavori() {
    var s    = OYUN.s;
    var favs = (s.borsa.favori || []);
    if (!favs.length) return '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">⭐</div><div class="empty-title">Favori yok</div><div class="empty-sub">Hisse detayından favoriye ekleyin</div></div></div>';
    var html = '';
    favs.forEach(function(sym) {
      var st  = D.STOCKS.find(function(s){return s.sym===sym;});
      var fiy = _fiyatlar[sym] || 0;
      var chg = degisim(sym);
      if (!st) return;
      html += '<div class="market-row" onclick="PIYASA.showHisseDetay(\'' + sym + '\')">';
      html += '<div class="market-icon" style="background:' + (st.color||"#1565C0") + '">' + st.emoji + '</div>';
      html += '<div class="market-info"><div class="market-name">' + st.name + '</div><div class="market-code">' + sym + '</div></div>';
      html += '<div class="market-right"><div class="market-price">' + OYUN.fmtTam(fiy).replace("₺","") + ' ₺</div>';
      html += '<div class="market-change ' + (chg>=0?"text-green":"text-red") + '">' + (chg>=0?"▲":"▼") + Math.abs(chg).toFixed(2) + '%</div></div>';
      html += '</div>';
    });
    return '<div class="card" style="margin:.75rem">' + html + '</div>';
  }

  // ══ HİSSE DETAY ══
  function showHisseDetay(sym) {
    var st  = D.STOCKS.find(function(s) { return s.sym === sym; });
    if (!st) return;
    var fiy = _fiyatlar[sym];
    var chg = degisim(sym);
    var isUp = chg >= 0;
    var pos  = (OYUN.s.borsa.portfoy || {})[sym];
    var isFav = (OYUN.s.borsa.favori || []).indexOf(sym) >= 0;

    var html = '<div style="padding:1rem">';
    html += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">';
    html += '<div style="width:48px;height:48px;border-radius:50%;background:' + (st.color||"#1565C0") + ';display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#fff">' + st.emoji + '</div>';
    html += '<div><div style="font-size:1rem;font-weight:700">' + st.name + '</div><div style="font-size:.8rem;color:var(--text2)">' + sym + '</div></div>';
    html += '<button onclick="PIYASA.toggleFav(\'' + sym + '\')" style="margin-left:auto;background:none;border:none;font-size:1.4rem;cursor:pointer">' + (isFav?"⭐":"☆") + '</button>';
    html += '</div>';

    html += '<div style="margin-bottom:.75rem"><div style="font-size:1.6rem;font-weight:800">' + OYUN.fmtTam(fiy) + '</div>';
    html += '<div style="' + (isUp?"color:var(--green-l)":"color:var(--red-l)") + ';font-size:.9rem;font-weight:600">' + (isUp?"▲":"▼") + Math.abs(chg).toFixed(2) + '%</div></div>';

    // Grafik filtre
    html += '<div class="chart-filters" id="hisse-chart-filters">';
    ["1S","4S","1G","7G","30G"].forEach(function(f, i) {
      html += '<button class="chart-filter-btn' + (i===0?" active":"") + '" onclick="PIYASA.filtreGrafik(\'' + sym + '\',this)">' + f + '</button>';
    });
    html += '</div>';
    html += '<div class="chart-container"><canvas id="hisse-chart" class="chart-canvas" height="160"></canvas></div>';

    // İstatistikler
    html += '<div class="stat-grid" style="padding:.75rem 0">';
    html += '<div class="stat-item"><div class="stat-item-label">Temettü Verimi</div><div class="stat-item-value">%' + (st.div*100).toFixed(1) + '</div></div>';
    html += '<div class="stat-item"><div class="stat-item-label">Volatilite</div><div class="stat-item-value">%' + (st.vol*100).toFixed(1) + '</div></div>';
    if (pos && pos.adet > 0) {
      var pnl = pos.adet * fiy - pos.adet * pos.avgMaliyet;
      html += '<div class="stat-item"><div class="stat-item-label">Portföy</div><div class="stat-item-value">' + pos.adet + ' adet</div></div>';
      html += '<div class="stat-item"><div class="stat-item-label">K/Z</div><div class="stat-item-value ' + (pnl>=0?"text-green":"text-red") + '">' + OYUN.fmt(pnl) + '</div></div>';
    }
    html += '</div>';

    // Al / Sat
    html += '<div class="form-row"><label class="form-label">Miktar (adet)</label><input type="number" id="hs-adet" class="inp" placeholder="1" min="1" value="1"></div>';
    html += '<div id="hs-ozet" style="background:var(--bg3);border-radius:var(--r-sm);padding:.75rem;margin-bottom:1rem;font-size:.83rem;color:var(--text2)">Toplam: -</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">';
    html += '<button class="btn btn-green btn-lg" onclick="PIYASA.hisseAl(\'' + sym + '\')">' + sym + ' AL</button>';
    html += '<button class="btn btn-red btn-lg" onclick="PIYASA.hisseSat(\'' + sym + '\')">' + sym + ' SAT</button>';
    html += '</div></div>';

    UI.showModal(st.name + " — " + sym, html);

    setTimeout(function() {
      cizGrafik("hisse-chart", sym, false, st.color);
      var adetEl = document.getElementById("hs-adet");
      var ozetEl = document.getElementById("hs-ozet");
      if (adetEl && ozetEl) {
        adetEl.oninput = function() {
          var a = parseInt(this.value) || 0;
          var toplam = a * fiy;
          var komisyon = toplam * 0.001;
          ozetEl.innerHTML = "Adet: " + a + " • Fiyat: " + OYUN.fmtTam(fiy) + " • Toplam: <b>" + OYUN.fmt(toplam) + "</b> + " + OYUN.fmt(komisyon) + " komisyon";
        };
      }
    }, 50);
  }

  function filtreGrafik(sym, btn) {
    document.querySelectorAll("#hisse-chart-filters .chart-filter-btn").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    var st = D.STOCKS.find(function(s) { return s.sym === sym; });
    cizGrafik("hisse-chart", sym, false, st && st.color);
  }

  function toggleFav(sym) {
    var s   = OYUN.s;
    s.borsa.favori = s.borsa.favori || [];
    var idx = s.borsa.favori.indexOf(sym);
    if (idx >= 0) {
      s.borsa.favori.splice(idx, 1);
      UI.toast(sym + " favorilerden çıkarıldı.", "info");
    } else {
      s.borsa.favori.push(sym);
      UI.toast(sym + " favorilere eklendi! ⭐", "success");
    }
    OYUN.kaydet();
    showHisseDetay(sym);
  }

  function hisseAl(sym) {
    var adet = parseInt(document.getElementById("hs-adet").value) || 0;
    if (adet < 1) return UI.toast("Geçerli adet girin.", "error");
    var fiy       = _fiyatlar[sym];
    var komisyon  = fiy * adet * 0.001;
    var toplam    = fiy * adet + komisyon;
    if (!OYUN.harca(toplam, sym + " alımı")) return;

    var s   = OYUN.s;
    if (!s.borsa.portfoy[sym]) s.borsa.portfoy[sym] = {adet:0, avgMaliyet:0, toplamYatirim:0};
    var pos = s.borsa.portfoy[sym];
    pos.toplamYatirim += fiy * adet;
    pos.adet          += adet;
    pos.avgMaliyet     = pos.toplamYatirim / pos.adet;

    OYUN.xpEkle(10);
    OYUN.kaydet();
    UI.toast(adet + " adet " + sym + " alındı @ " + OYUN.fmtTam(fiy), "success");
    DB.logFeed(OYUN.u.uid, s.profil.username, "satın aldı", adet + " " + sym, toplam);
    UI.closeModal();
  }

  function hisseSat(sym) {
    var adet = parseInt(document.getElementById("hs-adet").value) || 0;
    if (adet < 1) return UI.toast("Geçerli adet girin.", "error");
    var s   = OYUN.s;
    var pos = s.borsa.portfoy[sym];
    if (!pos || pos.adet < adet) return UI.toast("Yeterli hisse yok! Var: " + (pos?pos.adet:0), "error");

    var fiy       = _fiyatlar[sym];
    var komisyon  = fiy * adet * 0.001;
    var brut      = fiy * adet;
    var net       = brut - komisyon;
    var pnl       = (fiy - pos.avgMaliyet) * adet;

    pos.adet          -= adet;
    pos.toplamYatirim  = pos.avgMaliyet * pos.adet;

    OYUN.kazanDirekt(net, sym + " satışı");
    OYUN.xpEkle(8);
    OYUN.kaydet();

    var pnlStr = pnl >= 0 ? ("+" + OYUN.fmt(pnl) + " kâr") : (OYUN.fmt(pnl) + " zarar");
    UI.toast(adet + " adet " + sym + " satıldı. " + pnlStr, pnl>=0?"success":"warning");
    UI.closeModal();
  }

  // ══ KRİPTO SECTION ══
  function renderKripto() {
    var level = OYUN.s.profil.seviye;
    if (level < D.LOCKS.kripto) {
      return _setSection(_lockedHtml(D.LOCKS.kripto, "Kripto"));
    }
    var tab = _getCurrentTab("kripto-tab") || "liste";
    var html = '<div class="page-header"><h1>₿ Kripto Para</h1></div>';
    html += '<div class="tabs-bar" id="kripto-tabs">';
    html += _tab("liste","Liste",tab) + _tab("portfoy","Portföyüm",tab);
    html += '</div>';

    if (tab === "liste") {
      html += '<div style="padding:.75rem .75rem .25rem;font-size:.72rem;color:var(--text2);font-weight:700">AL-SAT &nbsp;|&nbsp; CÜZDAN &nbsp;|&nbsp; GEÇMİŞ</div>';
      html += '<div class="card" style="margin:.25rem .75rem">';
      D.CRYPTOS.forEach(function(c) {
        var fiy  = _kFiyatlar[c.sym];
        var chg  = ((fiy - c.price) / c.price * 100);
        var isUp = chg >= 0;
        var pos  = OYUN.s.kripto.portfoy[c.sym];
        html += '<div class="market-row" onclick="PIYASA.showKriptoDetay(\'' + c.sym + '\')">';
        html += '<div class="market-icon" style="background:' + c.color + '">' + c.emoji + '</div>';
        html += '<div class="market-info"><div class="market-name">' + c.name + '</div>';
        html += '<div class="market-code">' + c.sym + (pos && pos.adet>0 ? ' • ' + pos.adet.toFixed(4) : '') + '</div></div>';
        html += '<canvas id="spark-k-' + c.sym + '" class="market-sparkline" width="70" height="30"></canvas>';
        html += '<div class="market-right"><div class="market-price">' + _fmtCrypto(fiy) + '</div>';
        html += '<div class="market-change ' + (isUp?"text-green":"text-red") + '">' + (isUp?"▲":"▼") + Math.abs(chg).toFixed(2) + '%</div></div>';
        html += '</div>';
      });
      html += '</div>';
    } else {
      html += _kriptoPortfoy();
    }
    _setSection(html);
    _bindTabs("kripto-tabs","kripto-tab",renderKripto);
    setTimeout(function() {
      D.CRYPTOS.forEach(function(c) {
        cizSparkline("spark-k-" + c.sym, c.sym, true, c.color);
      });
    }, 50);
  }

  function _fmtCrypto(n) {
    if (n >= 1000000) return (n/1000000).toFixed(2) + " M₺";
    if (n >= 1000) return n.toLocaleString("tr-TR", {maximumFractionDigits:0}) + " ₺";
    return n.toFixed(4) + " ₺";
  }

  function _kriptoPortfoy() {
    var pos  = OYUN.s.kripto.portfoy;
    var keys = Object.keys(pos).filter(function(k) { return pos[k].adet > 0; });
    if (!keys.length) return '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">₿</div><div class="empty-title">Kripto portföy boş</div></div></div>';
    var html = '<div class="card" style="margin:.75rem">';
    keys.forEach(function(sym) {
      var p   = pos[sym];
      var fiy = _kFiyatlar[sym] || p.avgMaliyet;
      var deger = p.adet * fiy;
      var pnl   = deger - p.adet * p.avgMaliyet;
      var c     = D.CRYPTOS.find(function(x){return x.sym===sym;});
      html += '<div class="list-row">';
      html += '<div class="list-row-icon" style="background:' + (c&&c.color||"#F7931A") + ';color:#fff;border-radius:50%;font-size:1rem">' + (c&&c.emoji||sym.charAt(0)) + '</div>';
      html += '<div class="list-row-content"><div class="list-row-title">' + sym + '</div><div class="list-row-sub">' + p.adet.toFixed(6) + ' adet</div></div>';
      html += '<div class="list-row-right"><div class="list-row-value">' + OYUN.fmt(deger) + '</div>';
      html += '<div class="list-row-change ' + (pnl>=0?"text-green":"text-red") + '">' + OYUN.fmt(pnl) + '</div></div>';
      html += '</div>';
    });
    return html + '</div>';
  }

  function showKriptoDetay(sym) {
    var c   = D.CRYPTOS.find(function(x) { return x.sym === sym; });
    if (!c) return;
    var fiy = _kFiyatlar[sym];
    var chg = ((fiy - c.price) / c.price * 100);
    var pos = (OYUN.s.kripto.portfoy || {})[sym];

    var html = '<div style="padding:1rem">';
    html += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">';
    html += '<div style="width:48px;height:48px;border-radius:50%;background:' + c.color + ';display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#fff">' + c.emoji + '</div>';
    html += '<div><div style="font-size:1rem;font-weight:700">' + c.name + '</div><div style="font-size:.8rem;color:var(--text2)">' + sym + '</div></div></div>';

    html += '<div style="margin-bottom:.75rem"><div style="font-size:1.6rem;font-weight:800">' + _fmtCrypto(fiy) + '</div>';
    html += '<div style="' + (chg>=0?"color:var(--green-l)":"color:var(--red-l)") + ';font-size:.9rem;font-weight:600">' + (chg>=0?"▲":"▼") + Math.abs(chg).toFixed(2) + '%</div></div>';

    html += '<div class="chart-container" style="margin-bottom:.75rem"><canvas id="kripto-chart" class="chart-canvas" height="160"></canvas></div>';

    var piyasaDeger = fiy * 21000000;
    html += '<div class="stat-grid" style="padding:.75rem 0">';
    html += '<div class="stat-item"><div class="stat-item-label">Piyasa Değeri</div><div class="stat-item-value" style="font-size:.85rem">' + OYUN.fmt(piyasaDeger) + '</div></div>';
    if (pos && pos.adet > 0) {
      html += '<div class="stat-item"><div class="stat-item-label">Bakiyem</div><div class="stat-item-value">' + pos.adet.toFixed(4) + ' ' + sym + '</div></div>';
      html += '<div class="stat-item"><div class="stat-item-label">Değeri</div><div class="stat-item-value">' + OYUN.fmt(pos.adet*fiy) + '</div></div>';
    }
    html += '</div>';

    html += '<div class="form-row"><label class="form-label">Tutar (₺)</label>';
    html += '<input type="number" id="kr-tutar" class="inp" placeholder="1000" min="1"></div>';
    html += '<div id="kr-ozet" style="background:var(--bg3);border-radius:var(--r-sm);padding:.65rem;margin-bottom:1rem;font-size:.82rem;color:var(--text2)">Miktar: -</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">';
    html += '<button class="btn btn-green btn-lg" onclick="PIYASA.kriptoAl(\'' + sym + '\')">' + sym + ' AL</button>';
    html += '<button class="btn btn-red btn-lg" onclick="PIYASA.kriptoSat(\'' + sym + '\')">' + sym + ' SAT</button>';
    html += '</div></div>';

    UI.showModal(c.name + " — " + sym, html);
    setTimeout(function() {
      cizGrafik("kripto-chart", sym, true, c.color);
      var tutarEl = document.getElementById("kr-tutar");
      var ozetEl  = document.getElementById("kr-ozet");
      if (tutarEl && ozetEl) {
        tutarEl.oninput = function() {
          var t = parseFloat(this.value) || 0;
          var miktar = t / fiy;
          ozetEl.innerHTML = "Miktar: <b>" + miktar.toFixed(6) + " " + sym + "</b>";
        };
      }
    }, 50);
  }

  function kriptoAl(sym) {
    var tutar = parseFloat(document.getElementById("kr-tutar").value) || 0;
    if (tutar < 1) return UI.toast("Minimum 1 TL.", "error");
    var fiy   = _kFiyatlar[sym];
    var miktar = tutar / fiy;
    var komisyon = tutar * 0.002;
    if (!OYUN.harca(tutar + komisyon, sym + " alımı")) return;
    var s = OYUN.s;
    if (!s.kripto.portfoy[sym]) s.kripto.portfoy[sym] = {adet:0, avgMaliyet:0, toplamYatirim:0};
    var pos = s.kripto.portfoy[sym];
    pos.toplamYatirim += tutar;
    pos.adet          += miktar;
    pos.avgMaliyet     = pos.toplamYatirim / pos.adet;
    OYUN.xpEkle(15);
    OYUN.kaydet();
    UI.toast(miktar.toFixed(6) + " " + sym + " alındı!", "success");
    UI.closeModal();
  }

  function kriptoSat(sym) {
    var tutar = parseFloat(document.getElementById("kr-tutar").value) || 0;
    if (tutar < 1) return UI.toast("Minimum 1 TL.", "error");
    var s   = OYUN.s;
    var pos = s.kripto.portfoy[sym];
    var fiy = _kFiyatlar[sym];
    var miktar = tutar / fiy;
    if (!pos || pos.adet < miktar) return UI.toast("Yeterli " + sym + " yok!", "error");
    var komisyon = tutar * 0.002;
    var net      = tutar - komisyon;
    pos.adet          -= miktar;
    pos.toplamYatirim  = pos.avgMaliyet * pos.adet;
    OYUN.kazanDirekt(net, sym + " satışı");
    OYUN.xpEkle(12);
    OYUN.kaydet();
    UI.toast(miktar.toFixed(6) + " " + sym + " satıldı!", "success");
    UI.closeModal();
  }

  // ══ DÖVİZ SECTION ══
  function renderDoviz() {
    var level = OYUN.s.profil.seviye;
    if (level < D.LOCKS.doviz) return _setSection(_lockedHtml(D.LOCKS.doviz, "Döviz"));
    var html = '<div class="page-header"><h1>💱 Döviz & Emtia</h1></div>';
    html += '<div class="tabs-bar" id="doviz-tabs">';
    html += _tab("doviz","Döviz",_getCurrentTab("doviz-tab")||"doviz");
    html += _tab("emtia","Emtia",_getCurrentTab("doviz-tab")||"doviz");
    html += '</div>';

    var tab = _getCurrentTab("doviz-tab") || "doviz";
    if (tab === "doviz") {
      html += '<div class="card" style="margin:.75rem">';
      D.FOREX.forEach(function(f) {
        var fiy  = _dFiyatlar[f.sym];
        var chg  = ((fiy - f.rate) / f.rate * 100);
        var isUp = chg >= 0;
        var pos  = (OYUN.s.doviz.portfoy || {})[f.sym];
        html += '<div class="market-row" onclick="PIYASA.showDovizDetay(\'' + f.sym + '\')">';
        html += '<div class="list-row-icon" style="font-size:1.6rem;flex-shrink:0">' + f.flag + '</div>';
        html += '<div class="market-info"><div class="market-name">' + f.name + '</div>';
        html += '<div class="market-code">' + f.sym + (pos && pos.miktar>0 ? ' • ' + pos.miktar.toFixed(2) : '') + '</div></div>';
        html += '<div class="market-right"><div class="market-price">' + fiy.toFixed(4) + ' ₺</div>';
        html += '<div class="market-change ' + (isUp?"text-green":"text-red") + '">' + (isUp?"▲":"▼") + Math.abs(chg).toFixed(3) + '%</div></div>';
        html += '</div>';
      });
      html += '</div>';
    } else {
      html += '<div class="card" style="margin:.75rem">';
      D.EMTIA.forEach(function(e) {
        var fiy  = _eFiyatlar[e.sym];
        var chg  = ((fiy - e.price) / e.price * 100);
        var isUp = chg >= 0;
        html += '<div class="market-row" onclick="PIYASA.showEmtiaDetay(\'' + e.sym + '\')">';
        html += '<div class="market-icon" style="background:var(--bg3);font-size:1.4rem">' + e.emoji + '</div>';
        html += '<div class="market-info"><div class="market-name">' + e.name + '</div><div class="market-code">1 ' + e.unit + '</div></div>';
        html += '<div class="market-right"><div class="market-price">' + OYUN.fmt(fiy) + '</div>';
        html += '<div class="market-change ' + (isUp?"text-green":"text-red") + '">' + (isUp?"▲":"▼") + Math.abs(chg).toFixed(2) + '%</div></div>';
        html += '</div>';
      });
      html += '</div>';
    }
    _setSection(html);
    _bindTabs("doviz-tabs","doviz-tab",renderDoviz);
  }

  function showDovizDetay(sym) {
    var f   = D.FOREX.find(function(x) { return x.sym === sym; });
    if (!f) return;
    var fiy = _dFiyatlar[sym];
    var pos = (OYUN.s.doviz.portfoy || {})[sym];
    var html = '<div style="padding:1rem">';
    html += '<div style="font-size:1.6rem;font-weight:800">' + fiy.toFixed(4) + ' ₺</div>';
    html += '<div style="color:var(--text2);font-size:.85rem;margin-bottom:1rem">' + f.flag + ' ' + f.name + '</div>';
    if (pos && pos.miktar > 0) {
      html += '<div style="background:var(--bg3);border-radius:var(--r-sm);padding:.75rem;margin-bottom:.75rem;font-size:.83rem">Bakiyem: <b>' + pos.miktar.toFixed(4) + ' ' + sym + '</b> (' + OYUN.fmt(pos.miktar*fiy) + ')</div>';
    }
    html += '<div class="form-row"><label class="form-label">Tutar (₺)</label><input type="number" id="dv-tutar" class="inp" placeholder="1000"></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">';
    html += '<button class="btn btn-green" onclick="PIYASA.dovizAl(\'' + sym + '\')">' + sym + ' Al</button>';
    html += '<button class="btn btn-red" onclick="PIYASA.dovizSat(\'' + sym + '\')">' + sym + ' Sat</button>';
    html += '</div></div>';
    UI.showModal(f.name, html);
  }

  function dovizAl(sym) {
    var tutar = parseFloat(document.getElementById("dv-tutar").value)||0;
    if (tutar < 10) return UI.toast("Min 10 ₺.", "error");
    var f   = D.FOREX.find(function(x){return x.sym===sym;});
    var fiy = _dFiyatlar[sym];
    var spread = tutar * 0.005;
    if (!OYUN.harca(tutar + spread, sym + " alımı")) return;
    var s = OYUN.s;
    if (!s.doviz.portfoy[sym]) s.doviz.portfoy[sym] = {miktar:0, avgMaliyet:0};
    var pos = s.doviz.portfoy[sym];
    var miktar = tutar / fiy;
    pos.avgMaliyet = (pos.avgMaliyet * pos.miktar + fiy * miktar) / (pos.miktar + miktar);
    pos.miktar    += miktar;
    OYUN.xpEkle(8);
    OYUN.kaydet();
    UI.toast(miktar.toFixed(4) + " " + sym + " alındı @ " + fiy.toFixed(4) + " ₺", "success");
    UI.closeModal();
  }

  function dovizSat(sym) {
    var tutar = parseFloat(document.getElementById("dv-tutar").value)||0;
    if (tutar < 10) return UI.toast("Min 10 ₺.", "error");
    var s   = OYUN.s;
    var pos = s.doviz.portfoy[sym];
    var fiy = _dFiyatlar[sym];
    var miktar = tutar / fiy;
    if (!pos || pos.miktar < miktar) return UI.toast("Yeterli " + sym + " yok!", "error");
    var spread = tutar * 0.005;
    var net    = tutar - spread;
    pos.miktar -= miktar;
    OYUN.kazanDirekt(net, sym + " satışı");
    OYUN.xpEkle(6);
    OYUN.kaydet();
    UI.toast(miktar.toFixed(4) + " " + sym + " satıldı!", "success");
    UI.closeModal();
  }

  function showEmtiaDetay(sym) {
    var e   = D.EMTIA.find(function(x){return x.sym===sym;});
    if (!e) return;
    var fiy = _eFiyatlar[sym];
    var html = '<div style="padding:1rem">';
    html += '<div style="font-size:1.6rem;font-weight:800">' + OYUN.fmtTam(fiy) + ' / ' + e.unit + '</div>';
    html += '<div style="font-size:.85rem;color:var(--text2);margin-bottom:1rem">' + e.emoji + ' ' + e.name + '</div>';
    html += '<div class="form-row"><label class="form-label">Tutar (₺)</label><input type="number" id="em-tutar" class="inp" placeholder="5000"></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">';
    html += '<button class="btn btn-green" onclick="PIYASA.emtiaAl(\'' + sym + '\')">' + e.name + ' Al</button>';
    html += '<button class="btn btn-red" onclick="PIYASA.emtiaSat(\'' + sym + '\')">' + e.name + ' Sat</button>';
    html += '</div></div>';
    UI.showModal(e.name, html);
  }

  function emtiaAl(sym) {
    var tutar = parseFloat(document.getElementById("em-tutar").value)||0;
    if (tutar < 100) return UI.toast("Min 100 ₺.", "error");
    var e   = D.EMTIA.find(function(x){return x.sym===sym;});
    var fiy = _eFiyatlar[sym];
    if (!OYUN.harca(tutar, e.name + " alımı")) return;
    var s   = OYUN.s;
    var key = "emtia_" + sym;
    if (!s.doviz.portfoy[key]) s.doviz.portfoy[key] = {miktar:0, avgMaliyet:0};
    var pos    = s.doviz.portfoy[key];
    var miktar = tutar / fiy;
    pos.avgMaliyet = (pos.avgMaliyet * pos.miktar + fiy * miktar) / (pos.miktar + miktar);
    pos.miktar    += miktar;
    OYUN.xpEkle(10);
    OYUN.kaydet();
    UI.toast(miktar.toFixed(4) + " " + e.unit + " " + e.name + " alındı!", "success");
    UI.closeModal();
  }

  function emtiaSat(sym) {
    var tutar = parseFloat(document.getElementById("em-tutar").value)||0;
    if (tutar < 100) return UI.toast("Min 100 ₺.", "error");
    var e   = D.EMTIA.find(function(x){return x.sym===sym;});
    var fiy = _eFiyatlar[sym];
    var key = "emtia_" + sym;
    var pos = OYUN.s.doviz.portfoy[key];
    var miktar = tutar / fiy;
    if (!pos || pos.miktar < miktar) return UI.toast("Yeterli " + e.name + " yok!", "error");
    pos.miktar -= miktar;
    OYUN.kazanDirekt(tutar * 0.995, e.name + " satışı");
    OYUN.xpEkle(8);
    OYUN.kaydet();
    UI.toast(miktar.toFixed(4) + " " + e.unit + " " + e.name + " satıldı!", "success");
    UI.closeModal();
  }

  // ══ YATIRIM FONLARI ══
  function renderFonlar() {
    var level = OYUN.s.profil.seviye;
    if (level < D.LOCKS.fonlar) return _setSection(_lockedHtml(D.LOCKS.fonlar, "Yatırım Fonları"));
    var html = '<div class="page-header"><h1>📊 Yatırım Fonları</h1></div>';
    var pos  = OYUN.s.fonlar.portfoy || {};
    html += '<div class="card" style="margin:.75rem">';
    D.FUNDS.forEach(function(f) {
      var myPos = pos[f.id];
      html += '<div class="list-row" onclick="PIYASA.showFonDetay(\'' + f.id + '\')">';
      html += '<div class="list-row-icon" style="background:' + (f.risk==="Yüksek"||f.risk==="Çok Yüksek"?"rgba(198,40,40,.15)":f.risk==="Düşük"||f.risk==="Çok Düşük"?"rgba(46,125,50,.15)":"rgba(21,101,192,.15)") + '">';
      html += f.type === "Hisse" ? "📈" : f.type === "Tahvil" ? "📜" : f.type === "Emtia" ? "🪙" : f.type === "Likit" ? "💧" : "🔄";
      html += '</div>';
      html += '<div class="list-row-content"><div class="list-row-title">' + f.name + '</div>';
      html += '<div class="list-row-sub">' + f.type + ' • Risk: ' + f.risk + '</div></div>';
      html += '<div class="list-row-right"><div class="list-row-value text-green">%' + (f.yillikGetiri*100).toFixed(0) + '</div>';
      html += '<div class="list-row-change text-grey">Yıllık</div>';
      if (myPos) html += '<div style="font-size:.72rem;color:var(--blue);margin-top:.1rem">• ' + OYUN.fmt(myPos.deger) + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    _setSection(html);
  }

  function showFonDetay(fonId) {
    var f   = D.FUNDS.find(function(x){return x.id===fonId;});
    if (!f) return;
    var pos = (OYUN.s.fonlar.portfoy || {})[fonId];
    var riskRenk = {"Çok Düşük":"text-green","Düşük":"text-green","Orta":"text-gold","Yüksek":"text-red","Çok Yüksek":"text-red"};
    var html = '<div style="padding:1rem">';
    html += '<div style="font-size:1.05rem;font-weight:700;margin-bottom:.25rem">' + f.name + '</div>';
    html += '<div style="font-size:.83rem;color:var(--text2);margin-bottom:1rem">' + f.type + ' Fonu • Min: ' + OYUN.fmt(f.minGiris) + '</div>';
    html += '<div class="stat-grid" style="padding:.5rem 0 .75rem">';
    html += '<div class="stat-item"><div class="stat-item-label">Yıllık Getiri</div><div class="stat-item-value text-green">%' + (f.yillikGetiri*100).toFixed(0) + '</div></div>';
    html += '<div class="stat-item"><div class="stat-item-label">Risk</div><div class="stat-item-value ' + (riskRenk[f.risk]||"") + '">' + f.risk + '</div></div>';
    if (pos) {
      html += '<div class="stat-item"><div class="stat-item-label">Yatırımım</div><div class="stat-item-value">' + OYUN.fmt(pos.yatirim) + '</div></div>';
      html += '<div class="stat-item"><div class="stat-item-label">Güncel Değer</div><div class="stat-item-value text-green">' + OYUN.fmt(pos.deger) + '</div></div>';
    }
    html += '</div>';
    html += '<div class="form-row"><label class="form-label">Yatırım Tutarı (₺)</label><input type="number" id="fn-tutar" class="inp" placeholder="' + f.minGiris + '" min="' + f.minGiris + '"></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">';
    html += '<button class="btn btn-blue" onclick="PIYASA.fonYatir(\'' + fonId + '\')">Yatır</button>';
    if (pos) html += '<button class="btn btn-red" onclick="PIYASA.fonCek(\'' + fonId + '\')">Çek</button>';
    html += '</div></div>';
    UI.showModal(f.name, html);
  }

  function fonYatir(fonId) {
    var tutar = parseFloat(document.getElementById("fn-tutar").value)||0;
    var f     = D.FUNDS.find(function(x){return x.id===fonId;});
    if (tutar < f.minGiris) return UI.toast("Minimum " + OYUN.fmt(f.minGiris) + " yatırın.", "error");
    if (!OYUN.harca(tutar, f.name)) return;
    var s = OYUN.s;
    if (!s.fonlar.portfoy[fonId]) s.fonlar.portfoy[fonId] = {yatirim:0, deger:0, ts:Date.now()};
    var pos = s.fonlar.portfoy[fonId];
    pos.yatirim += tutar; pos.deger += tutar;
    OYUN.xpEkle(20);
    OYUN.kaydet();
    UI.toast(OYUN.fmt(tutar) + " → " + f.name, "success");
    UI.closeModal();
  }

  function fonCek(fonId) {
    var s   = OYUN.s;
    var pos = s.fonlar.portfoy[fonId];
    if (!pos || pos.deger <= 0) return UI.toast("Fonda para yok.", "error");
    var f      = D.FUNDS.find(function(x){return x.id===fonId;});
    var sure   = (Date.now() - (pos.ts || Date.now())) / (1000*3600*24*365);
    var getiri = pos.yatirim * f.yillikGetiri * sure;
    var net    = pos.deger + getiri;
    pos.yatirim = 0; pos.deger = 0;
    OYUN.kazanDirekt(net, f.name + " çekim");
    OYUN.xpEkle(15);
    OYUN.kaydet();
    UI.toast("Çekildi: " + OYUN.fmt(net) + " (Getiri: " + OYUN.fmt(getiri) + ")", "success");
    UI.closeModal();
  }

  // ══ YARDIMCILAR ══
  function _setSection(html) {
    var el = document.getElementById("main-content");
    if (el) el.innerHTML = html;
  }

  function _tab(id, label, active) {
    return '<button class="tab-btn' + (active===id?" active":"") + '" data-tab="' + id + '">' + label + '</button>';
  }

  function _getCurrentTab(key) {
    return window["_tab_" + key] || null;
  }

  function _bindTabs(containerId, key, renderFn) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll(".tab-btn").forEach(function(btn) {
      btn.onclick = function() {
        container.querySelectorAll(".tab-btn").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        window["_tab_" + key] = btn.dataset.tab;
        renderFn();
      };
    });
  }

  function _lockedHtml(level, name) {
    return '<div class="locked-screen"><div class="locked-icon">🔒</div><div class="locked-title">' + level + '. Seviyede Açılacak</div><div class="locked-sub">' + name + ' özelliğine erişmek için seviye ' + level + " olun.</div></div>";
  }

  init();

  return {
    tick:tick, fiyat:fiyat, kriptoFiyat:kriptoFiyat, dovizFiyat:dovizFiyat, emtiaFiyat:emtiaFiyat,
    renderBorsa:renderBorsa, renderKripto:renderKripto, renderDoviz:renderDoviz, renderFonlar:renderFonlar,
    showHisseDetay:showHisseDetay, filtreGrafik:filtreGrafik, toggleFav:toggleFav, hisseAl:hisseAl, hisseSat:hisseSat,
    showKriptoDetay:showKriptoDetay, kriptoAl:kriptoAl, kriptoSat:kriptoSat,
    showDovizDetay:showDovizDetay, dovizAl:dovizAl, dovizSat:dovizSat,
    showEmtiaDetay:showEmtiaDetay, emtiaAl:emtiaAl, emtiaSat:emtiaSat,
    showFonDetay:showFonDetay, fonYatir:fonYatir, fonCek:fonCek,
    cizGrafik:cizGrafik, cizSparkline:cizSparkline
  };
})();
