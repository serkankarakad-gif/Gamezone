// ============================================================
// TÜRK İMPARATORLUĞU — ui.js
// Tüm UI yönetimi, section router, profil, chat, bildirimler
// ============================================================
"use strict";

var UI = (function() {

  var _currentSection = "anasayfa";
  var _toastQ = [];

  // ══ TEMEL ══
  function showLoader(msg) {
    var l = document.getElementById("loader");
    var m = document.getElementById("loader-msg");
    if (l) l.classList.remove("hidden");
    if (m) m.textContent = msg || "Yükleniyor...";
  }

  function hideLoader() {
    var l = document.getElementById("loader");
    if (l) l.classList.add("hidden");
  }

  function showAuth() {
    document.getElementById("auth-screen").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
  }

  function showApp() {
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  }

  function toast(msg, type) {
    type = type || "info";
    var c = document.getElementById("toast-container");
    if (!c) return;
    var el = document.createElement("div");
    el.className = "toast toast-" + type;
    var icons = {success:"✅", error:"❌", warning:"⚠️", info:"ℹ️"};
    el.innerHTML = '<span>' + (icons[type]||"ℹ️") + '</span><span>' + msg + '</span>';
    c.appendChild(el);
    setTimeout(function() { el.style.opacity="0"; el.style.transform="translateY(-10px)"; }, 3000);
    setTimeout(function() { el.remove(); }, 3400);
  }

  function showModal(title, body) {
    var overlay = document.getElementById("modal-overlay");
    var titleEl = document.getElementById("modal-title");
    var bodyEl  = document.getElementById("modal-body");
    if (!overlay || !titleEl || !bodyEl) return;
    titleEl.textContent = title;
    bodyEl.innerHTML    = body;
    overlay.classList.remove("hidden");
  }

  function closeModal() {
    var overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.add("hidden");
  }

  function showAnnouncement(ann) {
    if (!ann) return;
    showModal("📢 " + (ann.baslik || "Duyuru"), '<div style="padding:.5rem 0;font-size:.9rem;line-height:1.7">' + (ann.icerik || "") + '</div>');
  }

  // ══ HUD ══
  function refreshHUD() {
    var s = OYUN.s;
    if (!s) return;
    var p   = s.profil;
    var xpG = OYUN.xpIcin(p.seviye + 1);
    var pct = Math.min(100, Math.round((p.xp / xpG) * 100));

    var lvl  = document.getElementById("hud-level");
    var xpB  = document.getElementById("hud-xp-bar");
    var xpT  = document.getElementById("hud-xp-text");
    var elm  = document.getElementById("hud-elmas");
    var cash = document.getElementById("hud-cash");

    if (lvl)  lvl.textContent  = p.seviye;
    if (xpB)  xpB.style.width  = pct + "%";
    if (xpT)  xpT.textContent  = p.xp + " / " + xpG + " XP";
    if (elm)  elm.textContent  = p.elmas;
    if (cash) cash.textContent = _fmtShort(s.cuzdan.nakit);
  }

  function refreshNotifBadge() {
    var s = OYUN.s;
    var b = document.getElementById("notif-badge");
    if (!b || !s) return;
    var unread = (s.bildirimler || []).filter(function(n) { return !n.okundu; }).length;
    b.textContent = unread;
    b.classList.toggle("hidden", unread === 0);
  }

  function _fmtShort(n) {
    if (!n) return "₺0";
    if (Math.abs(n) >= 1e9)  return "₺" + (n/1e9).toFixed(1) + "M";
    if (Math.abs(n) >= 1e6)  return "₺" + (n/1e6).toFixed(1) + "B";
    if (Math.abs(n) >= 1e3)  return "₺" + (n/1e3).toFixed(0) + "K";
    return "₺" + Math.round(n).toLocaleString("tr-TR");
  }

  // ══ NAVİGASYON ══
  function navTo(section, btn) {
    document.querySelectorAll(".nav-tab").forEach(function(t) { t.classList.remove("active"); });
    if (btn) btn.classList.add("active");
    showSection(section);
  }

  function showSection(section) {
    _currentSection = section;
    var el = document.getElementById("main-content");
    if (!el) return;
    el.scrollTop = 0;

    // Alt nav aktifleştir
    document.querySelectorAll(".nav-tab").forEach(function(t) {
      t.classList.toggle("active", t.dataset.section === section);
    });

    switch (section) {
      case "anasayfa":   _renderAnasayfa(); break;
      case "uretim":     _renderUretim();   break;
      case "piyasalar":  _renderPiyasalar(); break;
      case "isletme":    _renderIsletme();  break;
      case "profil":     _renderProfil();   break;
      case "banka":      BANKA.render();    break;
      case "dukkanlar":  typeof DUKKAN !== "undefined" ? DUKKAN.renderDukkanlar() : _renderBos("Dükkanlar"); break;
      case "uretim_bahce": typeof URETIM !== "undefined" ? URETIM.renderBahceler() : _renderBos("Bahçeler"); break;
      case "uretim_ciftlik": typeof URETIM !== "undefined" ? URETIM.renderCiftlikler() : _renderBos("Çiftlikler"); break;
      case "uretim_fabrika": typeof URETIM !== "undefined" ? URETIM.renderFabrikalar() : _renderBos("Fabrikalar"); break;
      case "uretim_maden": typeof URETIM !== "undefined" ? URETIM.renderMadenler() : _renderBos("Madenler"); break;
      case "borsa":      PIYASA.renderBorsa();  break;
      case "kripto":     PIYASA.renderKripto(); break;
      case "doviz":      PIYASA.renderDoviz();  break;
      case "fonlar":     PIYASA.renderFonlar(); break;
      case "gayrimenkul": typeof GAYRIMENKUL !== "undefined" ? GAYRIMENKUL.render() : _renderBos("Gayrimenkul"); break;
      case "sigorta":    typeof SIGORTA !== "undefined" ? SIGORTA.render() : _renderBos("Sigorta"); break;
      case "gorevler":   typeof GOREV !== "undefined" ? GOREV.render() : _renderBos("Görevler"); break;
      case "chat":       _renderChat();     break;
      case "bildirimler":_renderBildirimler(); break;
      case "siralama":   _renderSiralama(); break;
      case "haberler":   _renderHaberler(); break;
      case "sss":        _renderSSS();      break;
      case "ayarlar":    _renderAyarlar();  break;
      default:           el.innerHTML = '<div class="empty-state" style="padding:2rem"><div class="empty-icon">🚧</div><div class="empty-title">Yapım aşamasında</div></div>';
    }
  }

  function showMoreMenu() {
    var items = [
      {icon:"🏆", label:"Sıralama",       sec:"siralama"   },
      {icon:"📰", label:"Haberler",        sec:"haberler"   },
      {icon:"🏠", label:"Gayrimenkul",     sec:"gayrimenkul"},
      {icon:"🛡️", label:"Sigorta",         sec:"sigorta"    },
      {icon:"🎯", label:"Görevler",        sec:"gorevler"   },
      {icon:"⚙️", label:"Ayarlar",         sec:"ayarlar"    },
      {icon:"🚪", label:"Çıkış Yap",       sec:"logout"     }
    ];
    var html = items.map(function(i) {
      if (i.sec === "logout") return '<div class="list-row" onclick="AUTH.logout();UI.closeModal()" style="color:var(--red-l)"><div class="list-row-icon">' + i.icon + '</div><div class="list-row-content"><div class="list-row-title" style="color:var(--red-l)">' + i.label + '</div></div></div>';
      return '<div class="list-row" onclick="UI.showSection(\'' + i.sec + '\');UI.closeModal()"><div class="list-row-icon">' + i.icon + '</div><div class="list-row-content"><div class="list-row-title">' + i.label + '</div></div></div>';
    }).join("");
    showModal("Menü", '<div>' + html + '</div>');
  }

  // ══ ANA SAYFA ══
  function _renderAnasayfa() {
    var el = document.getElementById("main-content");
    var s  = OYUN.s;

    // Piyasa durumu
    var piyasaDurum = _piyasaDurumu();
    var html = '';
    html += '<div style="background:var(--bg2);border-bottom:1px solid var(--border);padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between">';
    html += '<div><div style="font-size:.9rem;font-weight:700">Piyasaların Durumu: <span style="color:' + piyasaDurum.renk + '">' + piyasaDurum.durum + '</span></div>';
    html += '<div style="font-size:.78rem;color:var(--text2);margin-top:.1rem">' + piyasaDurum.aciklama + '</div></div>';
    html += '<div style="font-size:2rem">' + piyasaDurum.emoji + '</div></div>';

    // Haber kartı
    var haber = _rastgeleHaber();
    html += '<div style="background:var(--bg2);border-bottom:1px solid var(--border)">';
    html += '<div style="background:linear-gradient(135deg,#1565C0,#0D47A1);height:140px;display:flex;align-items:center;justify-content:center;font-size:4rem">' + haber.emoji + '</div>';
    html += '<div style="padding:.75rem 1rem">';
    html += '<div style="font-size:.9rem;font-weight:700;margin-bottom:.35rem">' + haber.baslik + '</div>';
    html += '<div style="font-size:.8rem;color:var(--text2);line-height:1.6">' + haber.ozet + '</div>';
    html += '<div style="font-size:.72rem;color:var(--text3);margin-top:.35rem">' + _suankiTarih() + '</div>';
    html += '</div></div>';

    // Hızlı erişim butonları
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;padding:.75rem">';
    var hizliMenuler = [
      {emoji:"🏪", label:"Dükkanlar",  sec:"dukkanlar" },
      {emoji:"📈", label:"Borsa",       sec:"borsa"     },
      {emoji:"₿",  label:"Kripto",      sec:"kripto"    },
      {emoji:"🏠", label:"Emlak",       sec:"gayrimenkul"},
      {emoji:"💱", label:"Döviz",       sec:"doviz"     },
      {emoji:"🏦", label:"Banka",       sec:"banka"     },
      {emoji:"🛡️", label:"Sigorta",     sec:"sigorta"   },
      {emoji:"🎯", label:"Görevler",    sec:"gorevler"  }
    ];
    hizliMenuler.forEach(function(m) {
      html += '<div style="background:var(--bg2);border-radius:var(--r-sm);padding:.65rem .3rem;text-align:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.06)" onclick="UI.showSection(\'' + m.sec + '\')">';
      html += '<div style="font-size:1.5rem;margin-bottom:.2rem">' + m.emoji + '</div>';
      html += '<div style="font-size:.68rem;font-weight:600;color:var(--text2)">' + m.label + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Net değer özeti
    var nw = OYUN.netDeger();
    html += '<div class="stat-grid" style="padding:.75rem">';
    html += '<div class="stat-item"><div class="stat-item-label">Nakit</div><div class="stat-item-value">' + OYUN.fmt(s.cuzdan.nakit) + '</div></div>';
    html += '<div class="stat-item"><div class="stat-item-label">Net Değer</div><div class="stat-item-value text-blue">' + OYUN.fmt(nw) + '</div></div>';
    html += '<div class="stat-item"><div class="stat-item-label">Toplam Kazanç</div><div class="stat-item-value text-green">' + OYUN.fmt(s.istatistik.toplamKazanc) + '</div></div>';
    html += '<div class="stat-item"><div class="stat-item-label">Aktif Dükkan</div><div class="stat-item-value">' + Object.keys(s.dukkanlar||{}).length + '</div></div>';
    html += '</div>';

    // Canlı feed
    html += '<div style="background:var(--bg2);border-radius:var(--r);margin:.25rem .75rem .75rem">';
    html += '<div style="padding:.65rem 1rem;font-size:.8rem;font-weight:700;color:var(--text2);text-transform:uppercase;border-bottom:1px solid var(--border)">🔴 Canlı İşlemler</div>';
    html += '<div id="feed-container">' + _feedYukle() + '</div>';
    html += '</div>';

    el.innerHTML = html;

    // Feed'i Firebase'den yükle
    DB.getFeed(15).then(function(items) {
      var fc = document.getElementById("feed-container");
      if (!fc || !items.length) return;
      var fhtml = "";
      items.forEach(function(item) {
        var ago = _zamanOnce(item.ts);
        var color = _randomColor(item.user || "A");
        fhtml += '<div class="feed-row">';
        fhtml += '<div class="feed-avatar" style="background:' + color + '">' + (item.user||"?").charAt(0).toUpperCase() + '</div>';
        fhtml += '<div class="feed-text"><b>' + (item.user||"Oyuncu") + '</b> ' + (item.action||"işlem yaptı") + ' <span class="feed-product">' + (item.product||"") + '</span>';
        if (item.amount) fhtml += ' (' + OYUN.fmt(item.amount) + ')';
        if (item.from && item.to) fhtml += '<br><span style="font-size:.7rem;color:var(--text3)">📍 ' + item.from + ' → ' + item.to + '</span>';
        fhtml += '</div>';
        fhtml += '<div class="feed-time">' + ago + '</div>';
        fhtml += '</div>';
      });
      fc.innerHTML = fhtml;
    });
  }

  function _feedYukle() {
    return '<div style="text-align:center;padding:1rem;font-size:.8rem;color:var(--text2)">⏳ Yükleniyor...</div>';
  }

  function _piyasaDurumu() {
    var rand = Math.random();
    if (rand > 0.7) return {durum:"Mükemmel", renk:"#2E7D32", emoji:"📈", aciklama:"Piyasalar yükselişte, alım fırsatları var!"};
    if (rand > 0.4) return {durum:"İyi",      renk:"#1565C0", emoji:"😊", aciklama:"Piyasalar dengeli seyrediyor."};
    if (rand > 0.2) return {durum:"Orta",     renk:"#E65100", emoji:"😐", aciklama:"Piyasalarda temkinli hareketler."};
    return             {durum:"Zor",      renk:"#C62828", emoji:"📉", aciklama:"Piyasalarda düşüş baskısı var."};
  }

  function _rastgeleHaber() {
    var haberler = [
      {emoji:"🏭", baslik:"Üretim Sektöründe Rekor Büyüme", ozet:"Türkiye'nin üretim endeksi bu çeyrekte beklentilerin üzerinde büyüme kaydetti. İhracat rakamları da tarihi zirvelere ulaştı."},
      {emoji:"📈", baslik:"Borsa Yeni Zirvesine Koşuyor", ozet:"BIST 100 endeksi bugün tarihi rekorunu kırdı. Yabancı yatırımcıların ilgisi devam ediyor."},
      {emoji:"🏠", baslik:"Konut Fiyatları Yükselmeye Devam Ediyor", ozet:"Büyükşehirlerde konut fiyatlarındaki artış sürerken, kiralık konut talebi de rekor seviyelere ulaştı."},
      {emoji:"💰", baslik:"Merkez Bankası Faiz Kararını Açıkladı", ozet:"Para Politikası Kurulu faiz oranlarını değiştirmeme kararı aldı. Piyasalar bu karar sonrası olumlu tepki verdi."},
      {emoji:"🚗", baslik:"Otomotiv İhracatında Büyük Başarı", ozet:"Türk otomobil üreticileri bu yıl ihracat rekoru kırdı. Avrupa pazarındaki pazar payı artmaya devam ediyor."},
      {emoji:"☕", baslik:"Gıda Fiyatlarında Mevsimsel Hareketler", ozet:"Tarım ürünlerinde mevsimsel fiyat dalgalanmaları yaşanıyor. Uzmanlar önümüzdeki aylarda dengelenme bekliyor."}
    ];
    return haberler[Math.floor(Math.random() * haberler.length)];
  }

  function _zamanOnce(ts) {
    var sn = Math.floor((Date.now() - ts) / 1000);
    if (sn < 60)  return sn + " sn";
    if (sn < 3600) return Math.floor(sn/60) + " dk";
    if (sn < 86400) return Math.floor(sn/3600) + " sa";
    return Math.floor(sn/86400) + " gün";
  }

  function _suankiTarih() {
    return new Date().toLocaleDateString("tr-TR", {day:"numeric", month:"long", year:"numeric", weekday:"long"});
  }

  function _randomColor(seed) {
    var colors = ["#1565C0","#2E7D32","#C62828","#6A1B9A","#E65100","#00695C","#37474F","#880E4F","#4E342E","#1A237E"];
    var idx = 0;
    for (var i = 0; i < seed.length; i++) idx += seed.charCodeAt(i);
    return colors[idx % colors.length];
  }

  // ══ ÜRETİM ANA ══
  function _renderUretim() {
    var s    = OYUN.s;
    var lev  = s.profil.seviye;

    var html = '<div class="page-header"><h1>🏭 Üretim</h1></div>';

    var kategoriler = [
      {sec:"dukkanlar",       emoji:"🏪", name:"Dükkanlar",   kilit:1,                     aciklama:"81 ilde dükkan aç, reyon yönet"},
      {sec:"uretim_bahce",    emoji:"🌿", name:"Bahçeler",    kilit:D.LOCKS.bahceler,      aciklama:"Sebze, meyve, bitki yetiştir"},
      {sec:"uretim_ciftlik",  emoji:"🐄", name:"Çiftlikler",  kilit:D.LOCKS.ciftlikler,    aciklama:"Hayvan çiftliği kur, ürün üret"},
      {sec:"uretim_fabrika",  emoji:"🏭", name:"Fabrikalar",  kilit:D.LOCKS.fabrikalar,    aciklama:"Fabrika kur, toplu üretim yap"},
      {sec:"uretim_maden",    emoji:"⛏️", name:"Madenler",    kilit:D.LOCKS.madenler,      aciklama:"Maden işlet, kıymetli mineral çıkar"},
      {sec:"gayrimenkul",     emoji:"🏠", name:"Gayrimenkul", kilit:D.LOCKS.gayrimenkul,   aciklama:"Konut ve işyeri al-sat-kirala"},
      {sec:"sigorta",         emoji:"🛡️", name:"Sigorta",     kilit:D.LOCKS.sigorta,       aciklama:"Araç, konut ve hayat sigortası"}
    ];

    html += '<div style="padding:.75rem">';
    kategoriler.forEach(function(k) {
      var locked = lev < k.kilit;
      html += '<div style="background:var(--bg2);border-radius:var(--r);margin-bottom:.6rem;display:flex;align-items:center;gap:.75rem;padding:.9rem 1rem;cursor:pointer;opacity:' + (locked?".5":"1") + '" onclick="' + (locked?"UI.toast('Seviye " + k.kilit + " gerekli!','warning')":"UI.showSection('"+k.sec+"')") + '">';
      html += '<div style="font-size:2rem;width:48px;text-align:center">' + k.emoji + '</div>';
      html += '<div style="flex:1"><div style="font-weight:700;font-size:.95rem">' + k.name + '</div>';
      html += '<div style="font-size:.78rem;color:var(--text2);margin-top:.1rem">' + (locked ? '🔒 Seviye ' + k.kilit + ' gerekli' : k.aciklama) + '</div></div>';
      html += '<div style="font-size:.9rem;color:var(--text3)">›</div>';
      html += '</div>';
    });
    html += '</div>';

    document.getElementById("main-content").innerHTML = html;
  }

  // ══ PİYASALAR ANA ══
  function _renderPiyasalar() {
    var s   = OYUN.s;
    var lev = s.profil.seviye;
    var html = '<div class="page-header"><h1>📊 Piyasalar</h1></div>';

    var menuler = [
      {sec:"borsa",  emoji:"📈", name:"Borsa (BİST)", kilit:D.LOCKS.borsaDetay, aciklama:"24 hisse senedi"},
      {sec:"kripto", emoji:"₿",  name:"Kripto Para",  kilit:D.LOCKS.kripto,     aciklama:"10 kripto para birimi"},
      {sec:"doviz",  emoji:"💱", name:"Döviz & Emtia",kilit:D.LOCKS.doviz,      aciklama:"10 döviz, 5 emtia"},
      {sec:"fonlar", emoji:"📊", name:"Yatırım Fonları",kilit:D.LOCKS.fonlar,  aciklama:"8 farklı yatırım fonu"}
    ];

    html += '<div style="padding:.75rem">';
    menuler.forEach(function(m) {
      var locked = lev < m.kilit;
      html += '<div style="background:var(--bg2);border-radius:var(--r);margin-bottom:.6rem;display:flex;align-items:center;gap:.75rem;padding:.9rem 1rem;cursor:pointer;opacity:' + (locked?".5":"1") + '" onclick="' + (locked?"UI.toast('Seviye " + m.kilit + " gerekli!','warning')":"UI.showSection('"+m.sec+"')") + '">';
      html += '<div style="font-size:2rem;width:48px;text-align:center">' + m.emoji + '</div>';
      html += '<div style="flex:1"><div style="font-weight:700;font-size:.95rem">' + m.name + '</div>';
      html += '<div style="font-size:.78rem;color:var(--text2);margin-top:.1rem">' + (locked?'🔒 Seviye ' + m.kilit + ' gerekli':m.aciklama) + '</div></div>';
      html += '<div style="font-size:.9rem;color:var(--text3)">›</div>';
      html += '</div>';
    });
    html += '</div>';

    // Anlık özet
    html += '<div style="padding:0 .75rem .75rem">';
    html += '<div style="font-size:.72rem;font-weight:700;color:var(--text2);text-transform:uppercase;margin-bottom:.5rem">Anlık Fiyatlar</div>';
    html += '<div style="background:var(--bg2);border-radius:var(--r);overflow:hidden">';
    D.STOCKS.slice(0,5).forEach(function(st) {
      var fiy = PIYASA.fiyat(st.sym);
      var chg = ((fiy - st.price) / st.price * 100);
      var up  = chg >= 0;
      html += '<div style="display:flex;align-items:center;padding:.55rem 1rem;border-bottom:1px solid var(--border)">';
      html += '<div style="font-size:.85rem;font-weight:700;flex:1">' + st.sym + '</div>';
      html += '<div style="font-size:.82rem;font-weight:700">' + OYUN.fmtTam(fiy).replace("₺","") + ' ₺</div>';
      html += '<div style="font-size:.75rem;margin-left:.5rem;color:' + (up?"var(--green-l)":"var(--red-l)") + ';width:50px;text-align:right">' + (up?"▲":"▼") + Math.abs(chg).toFixed(2) + '%</div>';
      html += '</div>';
    });
    html += '</div></div>';

    document.getElementById("main-content").innerHTML = html;
  }

  // ══ İŞLETME ANA ══
  function _renderIsletme() {
    var s   = OYUN.s;
    var lev = s.profil.seviye;
    var html = '<div class="page-header"><h1>💼 İşletme</h1></div>';
    var menuler = [
      {sec:"banka",       emoji:"🏦", name:"Banka",           kilit:1, aciklama:"Hesap, kredi, mevduat"},
      {sec:"dukkanlar",   emoji:"🏪", name:"Dükkanlarım",     kilit:1, aciklama:"Dükkan yönet, gelir topla"},
      {sec:"sigorta",     emoji:"🛡️", name:"Sigorta",         kilit:2, aciklama:"Araç, konut, hayat sigortası"},
      {sec:"gayrimenkul", emoji:"🏠", name:"Gayrimenkul",     kilit:2, aciklama:"Mülk al-sat-kirala"},
      {sec:"gorevler",    emoji:"🎯", name:"Görevler",        kilit:1, aciklama:"Günlük/haftalık görevler"},
      {sec:"siralama",    emoji:"🏆", name:"Sıralama",        kilit:1, aciklama:"En zengin oyuncular"}
    ];
    html += '<div style="padding:.75rem">';
    menuler.forEach(function(m) {
      var locked = lev < m.kilit;
      html += '<div style="background:var(--bg2);border-radius:var(--r);margin-bottom:.6rem;display:flex;align-items:center;gap:.75rem;padding:.9rem 1rem;cursor:pointer" onclick="UI.showSection(\'' + m.sec + '\')">';
      html += '<div style="font-size:2rem;width:48px;text-align:center">' + m.emoji + '</div>';
      html += '<div style="flex:1"><div style="font-weight:700;font-size:.95rem">' + m.name + '</div>';
      html += '<div style="font-size:.78rem;color:var(--text2);margin-top:.1rem">' + m.aciklama + '</div></div>';
      html += '<div style="font-size:.9rem;color:var(--text3)">›</div>';
      html += '</div>';
    });
    html += '</div>';
    document.getElementById("main-content").innerHTML = html;
  }

  // ══ PROFİL ══
  function _renderProfil() {
    var s  = OYUN.s;
    var p  = s.profil;
    var xpG = OYUN.xpIcin(p.seviye + 1);
    var pct = Math.min(100, Math.round((p.xp / xpG) * 100));
    var nw  = OYUN.netDeger();

    var html = '';
    // Profil üst bölgesi (mavi)
    html += '<div class="profile-hero">';
    html += '<div class="profile-avatar">' + (p.avatar || "👤") + '</div>';
    html += '<div class="profile-name">' + p.username + '</div>';
    html += '<div class="profile-badge">' + p.unvan + '</div>';
    html += '<div style="margin-top:.75rem;display:flex;align-items:center;gap:.5rem;justify-content:center">';
    html += '<div style="background:rgba(255,255,255,.15);border-radius:20px;padding:.3rem .75rem;font-size:.8rem">Sv.' + p.seviye + '</div>';
    html += '<div style="flex:1;max-width:120px"><div style="height:5px;background:rgba(255,255,255,.25);border-radius:3px;overflow:hidden"><div style="height:100%;background:var(--gold);border-radius:3px;width:' + pct + '%"></div></div><div style="font-size:.65rem;opacity:.7;margin-top:.2rem;text-align:center">' + p.xp + '/' + xpG + ' XP</div></div>';
    html += '</div></div>';

    // İstatistik satırı
    html += '<div style="background:var(--bg2);display:flex;justify-content:center;gap:0;border-bottom:1px solid var(--border)">';
    [{v:Object.keys(s.dukkanlar||{}).length,l:"Dükkan"},{v:p.elmas,l:"Elmas"},{v:p.kupon||0,l:"Kupon"}].forEach(function(x) {
      html += '<div style="flex:1;text-align:center;padding:.75rem;border-right:1px solid var(--border)"><div style="font-size:1.1rem;font-weight:800;color:var(--blue)">' + x.v + '</div><div style="font-size:.7rem;color:var(--text2)">' + x.l + '</div></div>';
    });
    html += '</div>';

    // Finansal özet
    html += '<div class="card" style="margin:.75rem">';
    html += '<div class="bank-section-title">FİNANSAL ÖZET</div>';
    [
      {icon:"💵", label:"Nakit",           val:OYUN.fmtTam(s.cuzdan.nakit)},
      {icon:"🏦", label:"Banka Bakiyesi",  val:OYUN.fmtTam(s.cuzdan.banka)},
      {icon:"💎", label:"Elmas",           val:p.elmas + " 💎"},
      {icon:"🎫", label:"Kupon",           val:(p.kupon||0) + " kupon"},
      {icon:"📊", label:"Net Değer",       val:OYUN.fmt(nw)},
      {icon:"📈", label:"Toplam Kazanç",   val:OYUN.fmt(s.istatistik.toplamKazanc)},
    ].forEach(function(r) {
      html += '<div class="bank-row"><div class="bank-row-label">' + r.icon + ' ' + r.label + '</div><div class="bank-row-value">' + r.val + '</div></div>';
    });
    html += '</div>';

    // İşletme özeti
    html += '<div class="card" style="margin:.75rem">';
    html += '<div class="bank-section-title">İŞLETME</div>';
    [
      {icon:"💸", label:"Haftalık İşletme Giderleri", val:"₺0"},
      {icon:"👥", label:"Toplam Çalışan",             val:"0"},
      {icon:"😊", label:"Çalışan Morali",             val:"%"+p.calisanMorali}
    ].forEach(function(r) {
      html += '<div class="bank-row"><div class="bank-row-label">' + r.icon + ' ' + r.label + '</div><div class="bank-row-value">' + r.val + '</div></div>';
    });
    html += '</div>';

    // Sıralamadaki yeri
    html += '<div class="card" style="margin:.75rem">';
    html += '<div class="bank-section-title">SIRALAMADAKİ YERİNİZ</div>';
    html += '<div style="text-align:center;padding:1rem;font-size:.85rem;color:var(--text2)">Sıralama yükleniyor...</div>';
    html += '<button class="btn btn-outline btn-fw" onclick="UI.showSection(\'siralama\')" style="margin:0 1rem 1rem">📊 Sıralamayı Gör</button>';
    html += '</div>';

    // Ayarlar
    html += '<div class="card" style="margin:.75rem">';
    html += '<div class="bank-section-title">HESAP</div>';
    html += '<div class="list-row" onclick="UI.showSection(\'ayarlar\')"><div class="list-row-icon">⚙️</div><div class="list-row-content"><div class="list-row-title">Ayarlar</div></div><div>›</div></div>';
    html += '<div class="list-row" onclick="AUTH.logout()"><div class="list-row-icon" style="color:var(--red-l)">🚪</div><div class="list-row-content"><div class="list-row-title" style="color:var(--red-l)">Çıkış Yap</div></div></div>';
    html += '</div>';

    html += '<div style="height:1rem"></div>';
    document.getElementById("main-content").innerHTML = html;
  }

  // ══ CHAT ══
  function _renderChat() {
    var html = '<div class="page-header"><h1>💬 Sohbet</h1></div>';
    html += '<div id="chat-msgs" style="min-height:200px;background:var(--bg2);margin:.75rem;border-radius:var(--r);overflow:hidden">';
    html += '<div style="text-align:center;padding:1.5rem;font-size:.85rem;color:var(--text2)">⏳ Yükleniyor...</div>';
    html += '</div>';
    html += '<div style="position:sticky;bottom:calc(var(--nav-h) + .5rem);background:var(--bg);padding:.5rem .75rem;display:flex;gap:.5rem">';
    html += '<input type="text" id="chat-inp" class="inp" placeholder="Bir şeyler yaz..." onkeydown="if(event.key===\'Enter\')UI.sendChat()" style="flex:1">';
    html += '<button class="btn btn-blue" onclick="UI.sendChat()">Gönder</button>';
    html += '</div>';
    document.getElementById("main-content").innerHTML = html;

    DB.listenChat(function(msgs) {
      var el = document.getElementById("chat-msgs");
      if (!el) return;
      if (!msgs.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-title">Henüz mesaj yok</div><div class="empty-sub">İlk mesajı siz gönderin!</div></div>';
        return;
      }
      var html = '';
      msgs.forEach(function(m) {
        var ago = _zamanOnce(m.ts);
        var color = _randomColor(m.name || "A");
        html += '<div style="display:flex;align-items:flex-start;gap:.6rem;padding:.65rem 1rem;border-bottom:1px solid var(--border)">';
        html += '<div style="width:32px;height:32px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:#fff;flex-shrink:0">' + (m.name||"?").charAt(0).toUpperCase() + '</div>';
        html += '<div style="flex:1"><div style="font-size:.82rem;font-weight:700">' + (m.name||"Oyuncu") + ' <span style="font-weight:400;color:var(--text3);font-size:.72rem">• ' + ago + '</span></div>';
        html += '<div style="font-size:.85rem;margin-top:.15rem;word-break:break-word">' + _escHtml(m.msg) + '</div></div>';
        html += '</div>';
      });
      el.innerHTML = html;
      el.scrollTop = el.scrollHeight;
    });
  }

  function sendChat() {
    var inp = document.getElementById("chat-inp");
    if (!inp) return;
    var msg = inp.value.trim();
    if (!msg || msg.length > 200) return;
    if (!OYUN.u || !OYUN.s) return;
    DB.sendChatMsg(OYUN.u.uid, OYUN.s.profil.username, msg);
    inp.value = "";
  }

  function _escHtml(s) {
    return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  // ══ BİLDİRİMLER ══
  function _renderBildirimler() {
    var s = OYUN.s;
    var bildirimler = s.bildirimler || [];
    // Tümünü okundu işaretle
    bildirimler.forEach(function(b) { b.okundu = true; });
    OYUN.kaydet();
    refreshNotifBadge();

    var html = '<div class="page-header"><h1>🔔 Bildirimler</h1>';
    html += '<div class="page-header-actions"><button class="ph-icon-btn" onclick="UI._bildirimHepsiniSil()">🗑️</button></div></div>';

    if (!bildirimler.length) {
      html += '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">🔕</div><div class="empty-title">Bildirim yok</div><div class="empty-sub">Yeni bildirimler burada görünür</div></div></div>';
    } else {
      html += '<div class="card" style="margin:.75rem">';
      bildirimler.slice(0, 50).forEach(function(b) {
        var tarih = new Date(b.ts).toLocaleString("tr-TR", {day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
        html += '<div style="padding:.75rem 1rem;border-bottom:1px solid var(--border)">';
        html += '<div style="font-size:.88rem;font-weight:700">' + b.baslik + '</div>';
        html += '<div style="font-size:.8rem;color:var(--text2);margin-top:.2rem">' + b.mesaj + '</div>';
        html += '<div style="font-size:.72rem;color:var(--text3);margin-top:.2rem">' + tarih + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    document.getElementById("main-content").innerHTML = html;
  }

  function _bildirimHepsiniSil() {
    OYUN.s.bildirimler = [];
    OYUN.kaydet();
    _renderBildirimler();
  }

  // ══ SIRALAMA ══
  function _renderSiralama() {
    var html = '<div class="page-header"><h1>🏆 Sıralama</h1></div>';
    html += '<div style="background:var(--bg2);padding:.5rem .75rem;display:flex;gap:.5rem">';
    html += '<button class="tab-btn active" id="sir-toplam" onclick="UI._siralamaTab(this,\'toplam\')">Toplam Varlık</button>';
    html += '<button class="tab-btn" id="sir-gunluk" onclick="UI._siralamaTab(this,\'gunluk\')">Bugün Kazananlar</button>';
    html += '</div>';
    html += '<div id="siralama-list"><div style="text-align:center;padding:2rem;color:var(--text2)">⏳ Yükleniyor...</div></div>';
    document.getElementById("main-content").innerHTML = html;
    _loadSiralama();
  }

  function _siralamaTab(btn, tip) {
    document.querySelectorAll("#sir-toplam, #sir-gunluk").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    _loadSiralama();
  }

  function _loadSiralama() {
    DB.getLeaderboard().then(function(list) {
      var el = document.getElementById("siralama-list");
      if (!el) return;
      if (!list.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">🏆</div><div class="empty-title">Henüz sıralama yok</div></div>';
        return;
      }

      // Podium (ilk 3)
      var colors = ["#9E9E9E","#F9A825","#8D6E63"];
      var html = '<div style="background:var(--bg2);padding:.75rem">';

      // En iyi 3
      var top3 = list.slice(0, 3);
      if (top3.length >= 2) {
        html += '<div style="display:flex;align-items:flex-end;justify-content:center;gap:.5rem;padding:.75rem 0">';
        // 2. yer
        if (top3[1]) {
          var color = _randomColor(top3[1].name || "A");
          html += '<div style="flex:1;text-align:center">';
          html += '<div style="font-size:1.2rem">🥈</div>';
          html += '<div style="width:54px;height:54px;border-radius:50%;background:' + color + ';color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:.3rem auto;border:2px solid #9E9E9E">' + (top3[1].name||"?").charAt(0).toUpperCase() + '</div>';
          html += '<div style="font-size:.75rem;font-weight:700">' + (top3[1].name||"?") + '</div>';
          html += '<div style="font-size:.7rem;color:var(--blue)">Sv.' + (top3[1].level||1) + '</div>';
          html += '<div style="font-size:.7rem;color:var(--blue);font-weight:700">' + OYUN.fmt(top3[1].varlik) + '</div>';
          html += '</div>';
        }
        // 1. yer
        if (top3[0]) {
          var color0 = _randomColor(top3[0].name || "A");
          html += '<div style="flex:1;text-align:center">';
          html += '<div style="font-size:1.5rem">👑</div>';
          html += '<div style="width:68px;height:68px;border-radius:50%;background:' + color0 + ';color:#fff;font-weight:800;font-size:1.6rem;display:flex;align-items:center;justify-content:center;margin:.3rem auto;border:3px solid var(--gold)">' + (top3[0].name||"?").charAt(0).toUpperCase() + '</div>';
          html += '<div style="font-size:.8rem;font-weight:700">' + (top3[0].name||"?") + '</div>';
          html += '<div style="font-size:.72rem;color:var(--blue)">Sv.' + (top3[0].level||1) + '</div>';
          html += '<div style="font-size:.75rem;color:var(--blue);font-weight:800">' + OYUN.fmt(top3[0].varlik) + '</div>';
          html += '</div>';
        }
        // 3. yer
        if (top3[2]) {
          var color2 = _randomColor(top3[2].name || "A");
          html += '<div style="flex:1;text-align:center">';
          html += '<div style="font-size:1.2rem">🥉</div>';
          html += '<div style="width:54px;height:54px;border-radius:50%;background:' + color2 + ';color:#fff;font-weight:800;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:.3rem auto;border:2px solid #8D6E63">' + (top3[2].name||"?").charAt(0).toUpperCase() + '</div>';
          html += '<div style="font-size:.75rem;font-weight:700">' + (top3[2].name||"?") + '</div>';
          html += '<div style="font-size:.7rem;color:var(--blue)">Sv.' + (top3[2].level||1) + '</div>';
          html += '<div style="font-size:.7rem;color:var(--blue);font-weight:700">' + OYUN.fmt(top3[2].varlik) + '</div>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';

      // Liste (4+)
      html += '<div style="background:var(--bg2);margin:.25rem .75rem;border-radius:var(--r)">';
      var myUid = OYUN.u ? OYUN.u.uid : null;
      list.forEach(function(item, idx) {
        var isMe = item.uid === myUid;
        var c    = _randomColor(item.name || "A");
        html += '<div style="display:flex;align-items:center;gap:.75rem;padding:.7rem 1rem;border-bottom:1px solid var(--border);background:' + (isMe?"rgba(21,101,192,.06)":"transparent") + '">';
        html += '<div style="width:24px;text-align:center;font-size:.85rem;font-weight:700;color:var(--text2)">' + (idx+1) + '.</div>';
        html += '<div style="width:40px;height:40px;border-radius:50%;background:' + c + ';color:#fff;font-weight:700;font-size:1.1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + (item.name||"?").charAt(0).toUpperCase() + '</div>';
        html += '<div style="flex:1"><div style="font-size:.88rem;font-weight:600">' + (item.name||"Oyuncu") + (isMe?" (Ben)":"") + '</div><div style="font-size:.73rem;color:var(--text2)">Seviye ' + (item.level||1) + '</div></div>';
        html += '<div style="font-size:.88rem;font-weight:700;color:var(--blue)">' + OYUN.fmt(item.varlik) + '</div>';
        html += '</div>';
      });
      html += '</div>';
      el.innerHTML = html;
    });
  }

  // ══ HABERLER ══
  function _renderHaberler() {
    var haberler = [
      {emoji:"📈", baslik:"Borsa Zirve Kırdı", ozet:"BİST 100 endeksi tarihi rekorunu yenileyerek yatırımcıları sevindirdi. Analistler yükselişin devam edeceğini öngörüyor.", tarih:"Bugün"},
      {emoji:"🏭", baslik:"Üretimde Rekor Büyüme", ozet:"Sanayi üretimi bu çeyrekte beklentilerin üzerinde artış kaydetti. İhracat rakamları da tarihi zirvelere ulaştı.", tarih:"Dün"},
      {emoji:"🏠", baslik:"Konut Piyasasında Yoğunluk", ozet:"Büyükşehirlerde konut talebinin artmasıyla birlikte fiyatlar yükselmeye devam ediyor. Uzmanlar piyasayı yakından takip ediyor.", tarih:"2 gün önce"},
      {emoji:"💰", baslik:"Faiz Kararı Açıklandı", ozet:"Merkez Bankası Para Politikası Kurulu faizi sabit tuttu. Piyasalar bu habere olumlu tepki verdi.", tarih:"3 gün önce"},
      {emoji:"🛢️", baslik:"Petrol Fiyatlarında Hareket", ozet:"Ham petrol fiyatları küresel talep artışı ve jeopolitik gelişmelerin etkisiyle dalgalı seyrini sürdürdü.", tarih:"4 gün önce"},
      {emoji:"🌾", baslik:"Tahıl İhracatı Artıyor", ozet:"Türkiye'nin tahıl ve tarım ürünleri ihracatı bu yıl rekor seviyeye ulaştı. Orta Doğu ve Afrika pazarları öne çıktı.", tarih:"5 gün önce"}
    ];
    var html = '<div class="page-header"><h1>📰 Haberler</h1></div>';
    haberler.forEach(function(h) {
      html += '<div style="background:var(--bg2);margin:.5rem .75rem 0;border-radius:var(--r);overflow:hidden">';
      html += '<div style="background:linear-gradient(135deg,#1565C0,#0D47A1);height:120px;display:flex;align-items:center;justify-content:center;font-size:3.5rem">' + h.emoji + '</div>';
      html += '<div style="padding:.75rem 1rem .9rem">';
      html += '<div style="font-size:.9rem;font-weight:700;margin-bottom:.35rem">' + h.baslik + '</div>';
      html += '<div style="font-size:.8rem;color:var(--text2);line-height:1.6">' + h.ozet + '</div>';
      html += '<div style="font-size:.72rem;color:var(--text3);margin-top:.35rem">' + h.tarih + '</div>';
      html += '</div></div>';
    });
    html += '<div style="height:1rem"></div>';
    document.getElementById("main-content").innerHTML = html;
  }

  // ══ SSS ══
  function _renderSSS() {
    var sorular = [
      {s:"Oyuna nasıl başlarım?", c:"20.000 TL ile başlayabilirsin. Önce bir dükkan aç, ürün ekle ve gelir topla. Seviye atladıkça yeni özellikler açılır."},
      {s:"Kredi nasıl alırım?", c:"Banka bölümüne git, Kredi sekmesinde başvuruda bulun. Bot 5-15 dakika içinde otomatik onaylar."},
      {s:"Borsa nasıl çalışır?", c:"Hisse fiyatları gerçek zamanlı değişir. Al-sat yaparak kâr edebilirsin. Seviye 3'te borsa açılır."},
      {s:"Seviye nasıl atlarım?", c:"İşlem yaparak, dükkan açarak, kredi ödeyerek XP kazanırsın. XP dolduğunda seviye atlarsın."},
      {s:"Elmas ne işe yarar?", c:"Elmas ile özel özellikler açabilir, hız artırabilirsin. Seviye atladıkça ücretsiz elmas kazanırsın."},
      {s:"Gayrimenkul ne zaman açılır?", c:"Seviye 2'de gayrimenkul özelliği açılır. Konut al, kiraya ver, değer kazanınca sat."}
    ];
    var html = '<div class="page-header"><h1>❓ Sıkça Sorulan Sorular</h1></div>';
    html += '<div style="padding:.75rem">';
    sorular.forEach(function(s, i) {
      html += '<div style="background:var(--bg2);border-radius:var(--r-sm);margin-bottom:.5rem;cursor:pointer" onclick="UI._sssToggle(' + i + ')">';
      html += '<div style="padding:.85rem 1rem;display:flex;justify-content:space-between;align-items:center"><div style="font-size:.88rem;font-weight:600">' + s.s + '</div><div id="sss-arr-' + i + '">▼</div></div>';
      html += '<div id="sss-ans-' + i + '" style="display:none;padding:.25rem 1rem .85rem;font-size:.83rem;color:var(--text2);line-height:1.6">' + s.c + '</div>';
      html += '</div>';
    });
    html += '</div>';
    document.getElementById("main-content").innerHTML = html;
  }

  function _sssToggle(i) {
    var el  = document.getElementById("sss-ans-" + i);
    var arr = document.getElementById("sss-arr-" + i);
    if (!el) return;
    var open = el.style.display !== "none";
    el.style.display  = open ? "none" : "block";
    if (arr) arr.textContent = open ? "▼" : "▲";
  }

  // ══ AYARLAR ══
  function _renderAyarlar() {
    var s = OYUN.s;
    var p = s.profil;
    var html = '<div class="page-header"><h1>⚙️ Ayarlar</h1></div>';
    html += '<div class="card" style="margin:.75rem">';
    html += '<div class="bank-section-title">HESAP</div>';
    html += '<div class="bank-row"><div class="bank-row-label">Kullanıcı Adı</div><div class="bank-row-value">' + p.username + '</div></div>';
    html += '<div class="bank-row"><div class="bank-row-label">E-posta</div><div class="bank-row-value" style="font-size:.8rem">' + (p.email||"-") + '</div></div>';
    html += '<div class="bank-row"><div class="bank-row-label">Hesap Yaşı</div><div class="bank-row-value">' + (p.olusturulma ? _zamanOnce(new Date(p.olusturulma).getTime()) : "-") + '</div></div>';
    html += '</div>';
    html += '<div class="card" style="margin:.75rem">';
    html += '<div class="bank-section-title">OYUNCİ İSTATİSTİKLERİ</div>';
    [
      ["Toplam Giriş",   s.istatistik.loginSayisi || 1],
      ["Toplam İşlem",   s.istatistik.islemSayisi || 0],
      ["Toplam Kazanç",  OYUN.fmt(s.istatistik.toplamKazanc)],
      ["Toplam Harcama", OYUN.fmt(s.istatistik.toplamHarcama)]
    ].forEach(function(r) {
      html += '<div class="bank-row"><div class="bank-row-label">' + r[0] + '</div><div class="bank-row-value">' + r[1] + '</div></div>';
    });
    html += '</div>';
    html += '<div style="margin:.75rem"><button class="btn btn-red btn-fw" onclick="AUTH.logout()">🚪 Çıkış Yap</button></div>';
    html += '<div style="height:1rem"></div>';
    document.getElementById("main-content").innerHTML = html;
  }

  // ══ YARDIMCI ══
  function _renderBos(isim) {
    document.getElementById("main-content").innerHTML = '<div class="empty-state" style="padding:3rem"><div class="empty-icon">🚧</div><div class="empty-title">' + isim + '</div><div class="empty-sub">Yükleniyor...</div></div>';
  }

  return {
    showLoader:showLoader, hideLoader:hideLoader,
    showAuth:showAuth, showApp:showApp,
    toast:toast, showModal:showModal, closeModal:closeModal,
    showAnnouncement:showAnnouncement,
    refreshHUD:refreshHUD, refreshNotifBadge:refreshNotifBadge,
    navTo:navTo, showSection:showSection, showMoreMenu:showMoreMenu,
    sendChat:sendChat,
    _bildirimHepsiniSil:_bildirimHepsiniSil,
    _siralamaTab:_siralamaTab,
    _sssToggle:_sssToggle
  };
})();
