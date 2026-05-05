// ============================================================
// TÜRK İMPARATORLUĞU — gayrimenkul.js
// Saatte bir yenilenen ilanlar, çift alım engeli, kira sistemi
// ============================================================
"use strict";

var GAYRIMENKUL = (function() {

  var _ilanlar   = [];
  var _sonYenile = 0;
  var _kiraTimer = null;

  // ══ İLAN OLUŞTUR ══
  function _ilanOlustur() {
    var iller = D.ILLER;
    var tipler = D.ESTATE_TYPES;
    _ilanlar = [];

    for (var i = 0; i < 15; i++) {
      var tip  = tipler[Math.floor(Math.random() * tipler.length)];
      var il   = iller[Math.floor(Math.random() * iller.length)];
      var carpan = 0.8 + il.z * 0.1 + Math.random() * 0.3;
      var fiyat  = Math.round(tip.basePrice * carpan / 1000) * 1000;
      var kira   = tip.gunlukKira > 0 ? Math.round(tip.gunlukKira * carpan) : 0;

      _ilanlar.push({
        id:     "ilan_" + i + "_" + Date.now(),
        tipId:  tip.id,
        tipAdi: tip.name,
        emoji:  tip.emoji,
        il:     il.ad,
        plaka:  il.p,
        fiyat:  fiyat,
        gunlukKira: kira,
        deger:  fiyat,
        alinmisMi: false
      });
    }
    _sonYenile = Date.now();
  }

  function _kontrolYenile() {
    var dakika = (Date.now() - _sonYenile) / 60000;
    if (dakika >= 30 || !_ilanlar.length) {
      _ilanOlustur();
    }
  }

  // ══ RENDER ══
  function render() {
    var lev = OYUN.s.profil.seviye;
    if (lev < D.LOCKS.gayrimenkul) {
      document.getElementById("main-content").innerHTML = '<div class="locked-screen"><div class="locked-icon">🏠</div><div style="font-size:3rem">🔒</div><div class="locked-title">Seviye ' + D.LOCKS.gayrimenkul + '\'de Açılacak</div><div class="locked-sub">Gayrimenkul özelliğini kullanmak için seviye ' + D.LOCKS.gayrimenkul + ' olun.</div></div>';
      return;
    }
    _kontrolYenile();

    var tab = window._tab_gm || "ilanlar";
    var html = '<div class="page-header"><h1>🏠 Gayrimenkul</h1><div class="page-header-actions"><button class="ph-icon-btn" onclick="GAYRIMENKUL.yenile()" title="Yenile">🔄</button></div></div>';
    html += '<div class="tabs-bar" id="gm-tabs">';
    html += _tb("ilanlar","İlanlar",tab) + _tb("mulkler","Mülklerim",tab) + _tb("kira","Kira Gelirim",tab);
    html += '</div>';

    if (tab === "ilanlar") html += _renderIlanlar();
    else if (tab === "mulkler") html += _renderMulkler();
    else html += _renderKira();

    var kalanDak = Math.max(0, 30 - Math.round((Date.now() - _sonYenile)/60000));
    html += '<div style="text-align:center;padding:.5rem;font-size:.72rem;color:var(--text3)">İlanlar ' + kalanDak + ' dakika içinde yenilenir</div>';

    document.getElementById("main-content").innerHTML = html;
    _bindTabs();
  }

  function _renderIlanlar() {
    var s    = OYUN.s;
    var html = '<div style="padding:.75rem">';
    _ilanlar.forEach(function(ilan) {
      if (ilan.alinmisMi) return;
      var kiraBilgi = ilan.gunlukKira > 0 ? (' • <span style="color:var(--green-l)">Günlük kira: ' + OYUN.fmt(ilan.gunlukKira) + '</span>') : ' • Arsa';
      html += '<div style="background:var(--bg2);border-radius:var(--r);margin-bottom:.6rem;overflow:hidden">';
      html += '<div style="background:linear-gradient(135deg,rgba(21,101,192,.1),rgba(21,101,192,.05));height:80px;display:flex;align-items:center;justify-content:center;font-size:3rem">' + ilan.emoji + '</div>';
      html += '<div style="padding:.75rem 1rem">';
      html += '<div style="font-weight:700;font-size:.92rem">' + ilan.tipAdi + '</div>';
      html += '<div style="font-size:.78rem;color:var(--text2);margin:.2rem 0">📍 ' + ilan.il + kiraBilgi + '</div>';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:.6rem">';
      html += '<div style="font-size:1.05rem;font-weight:800;color:var(--blue)">' + OYUN.fmt(ilan.fiyat) + '</div>';
      html += '<button class="btn btn-blue" onclick="GAYRIMENKUL.mulkAl(\'' + ilan.id + '\')">Satın Al</button>';
      html += '</div></div></div>';
    });
    html += '</div>';
    return html;
  }

  function _renderMulkler() {
    var s    = OYUN.s;
    var mulkler = s.gayrimenkul.mulkler || [];
    if (!mulkler.length) {
      return '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">🏠</div><div class="empty-title">Mülkünüz yok</div><div class="empty-sub">İlanlar sekmesinden mülk satın alın</div></div></div>';
    }
    var html = '<div style="padding:.75rem">';
    var toplamDeger = 0;
    mulkler.forEach(function(m, idx) {
      toplamDeger += m.deger;
      html += '<div style="background:var(--bg2);border-radius:var(--r);margin-bottom:.6rem;padding:.85rem 1rem">';
      html += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem">';
      html += '<div style="font-size:2rem">' + m.emoji + '</div>';
      html += '<div style="flex:1"><div style="font-weight:700;font-size:.9rem">' + m.tipAdi + '</div>';
      html += '<div style="font-size:.75rem;color:var(--text2)">📍 ' + m.il + ' • Alış: ' + OYUN.fmt(m.alisiFiyat) + '</div></div>';
      html += '</div>';
      var artis = ((m.deger - m.alisiFiyat) / m.alisiFiyat * 100);
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.78rem;margin-bottom:.6rem">';
      html += '<div style="background:var(--bg3);border-radius:6px;padding:.4rem .6rem"><div style="color:var(--text2)">Güncel Değer</div><div style="font-weight:700">' + OYUN.fmt(m.deger) + '</div></div>';
      html += '<div style="background:var(--bg3);border-radius:6px;padding:.4rem .6rem"><div style="color:var(--text2)">Değer Artışı</div><div style="font-weight:700;color:' + (artis>=0?"var(--green-l)":"var(--red-l)") + '">' + (artis>=0?"+":"") + artis.toFixed(1) + '%</div></div>';
      if (m.gunlukKira > 0) {
        html += '<div style="background:var(--bg3);border-radius:6px;padding:.4rem .6rem"><div style="color:var(--text2)">Günlük Kira</div><div style="font-weight:700;color:var(--green-l)">' + OYUN.fmt(m.gunlukKira) + '</div></div>';
        html += '<div style="background:var(--bg3);border-radius:6px;padding:.4rem .6rem"><div style="color:var(--text2)">Toplam Kira</div><div style="font-weight:700">' + OYUN.fmt(m.toplamKira || 0) + '</div></div>';
      }
      html += '</div>';
      html += '<div style="display:flex;gap:.4rem">';
      if (m.gunlukKira > 0) html += '<button class="btn btn-green btn-sm" onclick="GAYRIMENKUL.kiraTopla(' + idx + ')">💰 Kira Topla</button>';
      html += '<button class="btn btn-sm btn-outline" onclick="GAYRIMENKUL.mulkSat(' + idx + ')">🏷️ Sat</button>';
      html += '</div></div>';
    });
    html += '<div style="background:var(--bg2);border-radius:var(--r);padding:.75rem 1rem;text-align:center">';
    html += '<div style="font-size:.75rem;color:var(--text2)">Toplam Portföy Değeri</div>';
    html += '<div style="font-size:1.2rem;font-weight:800;color:var(--blue)">' + OYUN.fmt(toplamDeger) + '</div></div>';
    html += '</div>';
    return html;
  }

  function _renderKira() {
    var s   = OYUN.s;
    var mulkler = (s.gayrimenkul.mulkler || []).filter(function(m) { return m.gunlukKira > 0; });
    var toplamKira = mulkler.reduce(function(t, m) { return t + (m.gunlukKira || 0); }, 0);
    var html = '<div class="stat-grid" style="padding:.75rem">';
    html += '<div class="stat-item"><div class="stat-item-label">Kira Veren Mülk</div><div class="stat-item-value">' + mulkler.length + '</div></div>';
    html += '<div class="stat-item"><div class="stat-item-label">Günlük Gelir</div><div class="stat-item-value text-green">' + OYUN.fmt(toplamKira) + '</div></div>';
    html += '</div>';
    if (!mulkler.length) {
      return html + '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">💰</div><div class="empty-title">Kira Geliri Yok</div><div class="empty-sub">Konut veya işyeri alarak kira geliri elde edin</div></div></div>';
    }
    html += '<div style="padding:0 .75rem">';
    mulkler.forEach(function(m, idx) {
      var gecenSaat = (Date.now() - (m.sonKiraTs || Date.now())) / 3600000;
      var bekleyen  = Math.round(m.gunlukKira * gecenSaat);
      html += '<div style="background:var(--bg2);border-radius:var(--r);margin-bottom:.6rem;padding:.85rem 1rem">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">';
      html += '<div style="display:flex;align-items:center;gap:.6rem"><span style="font-size:1.6rem">' + m.emoji + '</span><div><div style="font-weight:700;font-size:.88rem">' + m.tipAdi + '</div><div style="font-size:.75rem;color:var(--text2)">' + m.il + '</div></div></div>';
      html += '<div style="text-align:right"><div style="font-size:.8rem;font-weight:700;color:var(--green-l)">' + OYUN.fmt(m.gunlukKira) + '/gün</div></div>';
      html += '</div>';
      if (bekleyen > 0) {
        html += '<div style="display:flex;align-items:center;justify-content:space-between">';
        html += '<div style="font-size:.78rem;color:var(--gold)">⏳ Bekleyen: ' + OYUN.fmt(bekleyen) + '</div>';
        html += '<button class="btn btn-green btn-sm" onclick="GAYRIMENKUL.kiraTopla(' + idx + ')">Topla</button>';
        html += '</div>';
      } else {
        html += '<div style="font-size:.75rem;color:var(--text3)">Henüz kira birikmedi</div>';
      }
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  // ══ İŞLEMLER ══
  function mulkAl(ilanId) {
    var ilan = _ilanlar.find(function(i) { return i.id === ilanId; });
    if (!ilan || ilan.alinmisMi) return UI.toast("Bu ilan artık mevcut değil!", "error");

    // Çift alım engeli
    ilan.alinmisMi = true;

    if (!OYUN.harca(ilan.fiyat, ilan.tipAdi + " alımı")) {
      ilan.alinmisMi = false; return;
    }

    var s = OYUN.s;
    s.gayrimenkul.mulkler = s.gayrimenkul.mulkler || [];
    s.gayrimenkul.mulkler.push({
      ilanId:     ilanId,
      tipId:      ilan.tipId,
      tipAdi:     ilan.tipAdi,
      emoji:      ilan.emoji,
      il:         ilan.il,
      alisiFiyat: ilan.fiyat,
      deger:      ilan.fiyat,
      gunlukKira: ilan.gunlukKira,
      sonKiraTs:  Date.now(),
      toplamKira: 0,
      ts:         Date.now()
    });

    OYUN.xpEkle(50);
    OYUN.kaydet();
    DB.logFeed(OYUN.u.uid, s.profil.username, "satın aldı", ilan.tipAdi, ilan.fiyat, null, ilan.il);
    UI.toast("🏠 " + ilan.tipAdi + " (" + ilan.il + ") satın alındı!", "success");

    // Değer artışı simülasyonu
    setTimeout(function() {
      var mulkler = s.gayrimenkul.mulkler;
      mulkler.forEach(function(m) {
        var artis = 1 + (Math.random() - 0.45) * 0.02;
        m.deger = Math.round(m.deger * artis);
      });
      OYUN.kaydet();
    }, 3600000);

    render();
  }

  function mulkSat(idx) {
    var s   = OYUN.s;
    var m   = (s.gayrimenkul.mulkler || [])[idx];
    if (!m) return;

    // Satış fiyatı: güncel değer
    var satisFiyat = m.deger;
    var pnl        = satisFiyat - m.alisiFiyat;
    var pnlStr     = pnl >= 0 ? "+" + OYUN.fmt(pnl) + " kâr" : OYUN.fmt(pnl) + " zarar";

    if (!confirm(m.tipAdi + " (" + m.il + ") → " + OYUN.fmt(satisFiyat) + " (" + pnlStr + ")\nSatmak istediğinize emin misiniz?")) return;

    s.gayrimenkul.mulkler.splice(idx, 1);
    OYUN.kazanDirekt(satisFiyat, m.tipAdi + " satışı");
    OYUN.xpEkle(30);
    OYUN.kaydet();
    UI.toast(m.tipAdi + " satıldı: " + OYUN.fmt(satisFiyat) + " (" + pnlStr + ")", "success");
    render();
  }

  function kiraTopla(idx) {
    var s  = OYUN.s;
    var m  = (s.gayrimenkul.mulkler || [])[idx];
    if (!m || !m.gunlukKira) return;

    var gecenSaat = (Date.now() - (m.sonKiraTs || Date.now())) / 3600000;
    if (gecenSaat < 0.016) return UI.toast("Çok erken! Biraz bekleyin.", "warning");

    var kira = Math.round(m.gunlukKira * gecenSaat);
    if (kira < 1) return UI.toast("Henüz yeterli kira birikmedi.", "info");

    m.sonKiraTs = Date.now();
    m.toplamKira = (m.toplamKira || 0) + kira;
    OYUN.kazanDirekt(kira, m.tipAdi + " kira geliri");
    OYUN.xpEkle(15);
    OYUN.kaydet();
    UI.toast("💰 Kira geliri: " + OYUN.fmt(kira) + " (" + m.tipAdi + ", " + m.il + ")", "success");
    render();
  }

  function yenile() {
    _ilanOlustur();
    UI.toast("İlanlar yenilendi!", "info");
    render();
  }

  function _tb(id, label, active) {
    return '<button class="tab-btn' + (active===id?" active":"") + '" data-tab="' + id + '">' + label + '</button>';
  }

  function _bindTabs() {
    var cont = document.getElementById("gm-tabs");
    if (!cont) return;
    cont.querySelectorAll(".tab-btn").forEach(function(btn) {
      btn.onclick = function() {
        cont.querySelectorAll(".tab-btn").forEach(function(b){b.classList.remove("active");});
        btn.classList.add("active");
        window._tab_gm = btn.dataset.tab;
        render();
      };
    });
  }

  // İlk yüklemede ilan oluştur
  _ilanOlustur();

  return { render:render, mulkAl:mulkAl, mulkSat:mulkSat, kiraTopla:kiraTopla, yenile:yenile };
})();
