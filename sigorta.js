// ============================================================
// TÜRK İMPARATORLUĞU — sigorta.js
// Araç, konut, sağlık, hayat, işyeri sigortası
// ============================================================
"use strict";

var SIGORTA = (function() {

  function render() {
    var lev = OYUN.s.profil.seviye;
    if (lev < D.LOCKS.sigorta) {
      document.getElementById("main-content").innerHTML = '<div class="locked-screen"><div class="locked-icon">🛡️</div><div style="font-size:3rem">🔒</div><div class="locked-title">Seviye ' + D.LOCKS.sigorta + '\'de Açılacak</div></div>';
      return;
    }

    var s   = OYUN.s;
    var tab = window._tab_sig || "sigortalar";
    var html = '<div class="page-header"><h1>🛡️ Sigorta</h1></div>';
    html += '<div class="tabs-bar" id="sig-tabs">';
    html += _tb("sigortalar","Sigortalar",tab) + _tb("aktif","Aktif Poliçeler",tab) + _tb("hasar","Hasar Bildir",tab);
    html += '</div>';

    if      (tab === "sigortalar") html += _renderSigortalar(s);
    else if (tab === "aktif")      html += _renderAktif(s);
    else                           html += _renderHasar(s);

    document.getElementById("main-content").innerHTML = html;
    _bindTabs();
  }

  function _renderSigortalar(s) {
    var aktifler = (s.sigortalar.aktif || []).map(function(a) { return a.sigortaId; });
    var html = '<div style="padding:.75rem">';

    // Kategori başlıkları
    var kategoriler = {arac:"🚗 Araç Sigortaları", konut:"🏠 Konut Sigortaları", saglik:"💊 Sağlık Sigortası", hayat:"❤️ Hayat Sigortası", isyeri:"🏢 İşyeri Sigortası", seyahat:"✈️ Seyahat Sigortası"};
    var gruplar = {};
    D.SIGORTALAR.forEach(function(sig) {
      if (!gruplar[sig.tip]) gruplar[sig.tip] = [];
      gruplar[sig.tip].push(sig);
    });

    Object.keys(kategoriler).forEach(function(tip) {
      if (!gruplar[tip]) return;
      html += '<div style="font-size:.72rem;font-weight:700;color:var(--text2);text-transform:uppercase;margin:.6rem 0 .3rem;letter-spacing:.05em">' + kategoriler[tip] + '</div>';
      gruplar[tip].forEach(function(sig) {
        var aktif = aktifler.indexOf(sig.id) >= 0;
        var locked = OYUN.s.profil.seviye < (sig.minLevel || 1);
        html += '<div style="background:var(--bg2);border-radius:var(--r-sm);margin-bottom:.45rem;display:flex;align-items:center;gap:.75rem;padding:.8rem 1rem;opacity:' + (locked?".5":"1") + '">';
        html += '<div style="font-size:1.8rem;flex-shrink:0">' + sig.emoji + '</div>';
        html += '<div style="flex:1"><div style="font-weight:700;font-size:.88rem">' + sig.name + '</div>';
        html += '<div style="font-size:.74rem;color:var(--text2)">₺' + sig.aylikPrim.toLocaleString("tr-TR") + '/ay • ' + sig.desc + '</div></div>';
        if (locked) {
          html += '<div style="font-size:.72rem;color:var(--text3)">Sv.' + sig.minLevel + '</div>';
        } else if (aktif) {
          html += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:.3rem">';
          html += '<span class="badge badge-green">✓ Aktif</span>';
          html += '<button class="btn btn-sm" style="color:var(--red-l);font-size:.7rem" onclick="SIGORTA.iptal(\'' + sig.id + '\')">İptal</button>';
          html += '</div>';
        } else {
          html += '<button class="btn btn-blue btn-sm" onclick="SIGORTA.satinAl(\'' + sig.id + '\')" style="flex-shrink:0">Satın Al</button>';
        }
        html += '</div>';
      });
    });
    html += '</div>';
    return html;
  }

  function _renderAktif(s) {
    var aktifler = s.sigortalar.aktif || [];
    if (!aktifler.length) {
      return '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">🛡️</div><div class="empty-title">Aktif poliçe yok</div><div class="empty-sub">Sigortalar sekmesinden poliçe satın alın</div></div></div>';
    }
    var html = '<div style="padding:.75rem">';
    var toplamPrim = 0;
    aktifler.forEach(function(a) {
      var sig = D.SIGORTALAR.find(function(x){return x.id===a.sigortaId;});
      if (!sig) return;
      toplamPrim += sig.aylikPrim;
      var basTarih = new Date(a.ts).toLocaleDateString("tr-TR");
      var bitis    = new Date(a.ts + 365*86400000).toLocaleDateString("tr-TR");
      html += '<div style="background:var(--bg2);border-radius:var(--r);margin-bottom:.6rem;padding:.85rem 1rem">';
      html += '<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem">';
      html += '<div style="font-size:1.8rem">' + sig.emoji + '</div>';
      html += '<div style="flex:1"><div style="font-weight:700;font-size:.9rem">' + sig.name + '</div>';
      html += '<div style="font-size:.74rem;color:var(--text2)">' + basTarih + ' – ' + bitis + '</div></div>';
      html += '<div style="text-align:right"><div style="font-size:.82rem;font-weight:700;color:var(--blue)">₺' + sig.aylikPrim.toLocaleString("tr-TR") + '/ay</div><span class="badge badge-green" style="font-size:.65rem">Aktif</span></div>';
      html += '</div>';
      html += '<div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--text2)">';
      html += '<span>Toplam ödenen: <b>' + OYUN.fmt(a.toplamOdeme || sig.aylikPrim) + '</b></span>';
      html += '<button class="btn btn-sm" style="color:var(--red-l)" onclick="SIGORTA.iptal(\'' + sig.id + '\')">İptal Et</button>';
      html += '</div></div>';
    });
    html += '<div style="background:var(--bg2);border-radius:var(--r);padding:.75rem 1rem;text-align:center"><div style="font-size:.75rem;color:var(--text2)">Aylık Toplam Prim</div><div style="font-size:1.1rem;font-weight:800;color:var(--blue)">₺' + toplamPrim.toLocaleString("tr-TR") + '</div></div>';
    html += '</div>';
    return html;
  }

  function _renderHasar(s) {
    var aktifler = s.sigortalar.aktif || [];
    if (!aktifler.length) {
      return '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Aktif poliçe yok</div><div class="empty-sub">Hasar bildirimde bulunmak için önce sigorta yaptırın</div></div></div>';
    }
    var html = '<div style="padding:.75rem">';
    html += '<div style="background:rgba(255,179,0,.1);border-radius:var(--r-sm);padding:.85rem 1rem;margin-bottom:.75rem;font-size:.83rem">';
    html += '⚠️ Hasar bildirimi oyun simülasyonu amaçlıdır. Gerçek sigorta başvurusu için yetkili sigorta şirketleriyle iletişime geçin.';
    html += '</div>';
    html += '<div class="form-row"><label class="form-label">Poliçe Seç</label><select id="hasar-pol" class="inp">';
    aktifler.forEach(function(a) {
      var sig = D.SIGORTALAR.find(function(x){return x.id===a.sigortaId;});
      if (sig) html += '<option value="' + sig.id + '">' + sig.emoji + ' ' + sig.name + '</option>';
    });
    html += '</select></div>';
    html += '<div class="form-row"><label class="form-label">Hasar Tutarı (₺)</label><input type="number" id="hasar-tutar" class="inp" placeholder="5000" min="100"></div>';
    html += '<div class="form-row"><label class="form-label">Hasar Açıklaması</label><textarea id="hasar-acik" class="inp" placeholder="Hasar detaylarını yazın..." rows="3"></textarea></div>';
    html += '<button class="btn btn-blue btn-fw" onclick="SIGORTA.hasarBildir()">Hasar Bildir</button>';
    html += '</div>';
    return html;
  }

  function satinAl(sigortaId) {
    var sig = D.SIGORTALAR.find(function(x){return x.id===sigortaId;});
    if (!sig) return;

    var s   = OYUN.s;
    var aktifler = s.sigortalar.aktif || [];
    if (aktifler.find(function(a){return a.sigortaId===sigortaId;})) {
      return UI.toast("Bu sigorta zaten aktif!", "warning");
    }

    // İlk ay primi
    if (!OYUN.harca(sig.aylikPrim, sig.name + " ilk prim")) return;

    s.sigortalar.aktif = aktifler;
    s.sigortalar.aktif.push({
      sigortaId: sigortaId, ts: Date.now(),
      sonOdemeTarihi: Date.now() + 30*86400000,
      toplamOdeme: sig.aylikPrim
    });

    OYUN.xpEkle(25);
    OYUN.kaydet();
    UI.toast("✅ " + sig.emoji + " " + sig.name + " aktif edildi! İlk prim: " + OYUN.fmt(sig.aylikPrim), "success");
    render();
  }

  function iptal(sigortaId) {
    var s   = OYUN.s;
    var idx = (s.sigortalar.aktif || []).findIndex(function(a){return a.sigortaId===sigortaId;});
    if (idx < 0) return;
    var sig = D.SIGORTALAR.find(function(x){return x.id===sigortaId;});
    if (!confirm((sig?sig.name:"Sigorta") + " iptal edilsin mi?")) return;
    s.sigortalar.aktif.splice(idx, 1);
    OYUN.kaydet();
    UI.toast("Sigorta iptal edildi.", "info");
    render();
  }

  function hasarBildir() {
    var polId  = document.getElementById("hasar-pol").value;
    var tutar  = parseFloat(document.getElementById("hasar-tutar").value)||0;
    var acik   = (document.getElementById("hasar-acik").value||"").trim();
    var sig    = D.SIGORTALAR.find(function(x){return x.id===polId;});
    if (!sig || tutar < 100) return UI.toast("Geçerli bilgi girin.", "error");

    // Sigorta şirketi %40-70 ödüyor (simülasyon)
    var oranlar = {"zorunlu_trafik":0.5,"kasko":0.7,"konut":0.6,"dask":0.65,"saglik":0.75,"isyeri":0.6,"hayat":0.5,"seyahat":0.55};
    var oran = oranlar[polId] || 0.5;
    var tazminat = Math.round(tutar * oran);

    OYUN.kazanDirekt(tazminat, sig.name + " tazminat");
    OYUN.kaydet();
    UI.toast("✅ Hasar bildirimi onaylandı. Tazminat: " + OYUN.fmt(tazminat) + " (%" + Math.round(oran*100) + " karşılama)", "success");
    window._tab_sig = "aktif";
    render();
  }

  function _tb(id, label, active) {
    return '<button class="tab-btn' + (active===id?" active":"") + '" data-tab="' + id + '">' + label + '</button>';
  }

  function _bindTabs() {
    var cont = document.getElementById("sig-tabs");
    if (!cont) return;
    cont.querySelectorAll(".tab-btn").forEach(function(btn) {
      btn.onclick = function() {
        cont.querySelectorAll(".tab-btn").forEach(function(b){b.classList.remove("active");});
        btn.classList.add("active");
        window._tab_sig = btn.dataset.tab;
        render();
      };
    });
  }

  return { render:render, satinAl:satinAl, iptal:iptal, hasarBildir:hasarBildir };
})();
