// ============================================================
// TÜRK İMPARATORLUĞU — uretim.js
// Bahçeler, Çiftlikler, Fabrikalar, Madenler
// ============================================================
"use strict";

var URETIM = (function() {

  var BAHCE_URUNLER = [
    {id:"domates",   name:"Domates",      emoji:"🍅", sure:30,  gelir:45,   maliyet:8  },
    {id:"biber",     name:"Biber",         emoji:"🫑", sure:35,  gelir:55,   maliyet:10 },
    {id:"salatalik", name:"Salatalık",     emoji:"🥒", sure:30,  gelir:40,   maliyet:8  },
    {id:"patlican",  name:"Patlıcan",      emoji:"🍆", sure:40,  gelir:60,   maliyet:12 },
    {id:"kavun",     name:"Kavun",         emoji:"🍈", sure:60,  gelir:120,  maliyet:20 },
    {id:"karpuz",    name:"Karpuz",        emoji:"🍉", sure:75,  gelir:150,  maliyet:25 },
    {id:"cilek",     name:"Çilek",         emoji:"🍓", sure:45,  gelir:180,  maliyet:30 },
    {id:"elma",      name:"Elma",          emoji:"🍎", sure:90,  gelir:200,  maliyet:35 },
    {id:"armut",     name:"Armut",         emoji:"🍐", sure:90,  gelir:190,  maliyet:33 },
    {id:"uzum",      name:"Üzüm",          emoji:"🍇", sure:120, gelir:280,  maliyet:45 },
    {id:"zeytin",    name:"Zeytin",        emoji:"🫒", sure:180, gelir:500,  maliyet:80 },
    {id:"findik",    name:"Fındık",        emoji:"🪵", sure:240, gelir:800,  maliyet:120},
    {id:"nane",      name:"Nane",          emoji:"🌿", sure:20,  gelir:35,   maliyet:6  },
    {id:"maydanoz",  name:"Maydanoz",      emoji:"🌿", sure:20,  gelir:30,   maliyet:5  },
    {id:"reyhan",    name:"Reyhan",        emoji:"🌿", sure:25,  gelir:40,   maliyet:7  },
    {id:"lavanta",   name:"Lavanta",       emoji:"💜", sure:60,  gelir:160,  maliyet:28 }
  ];

  var CIFTLIK_URUNLER = [
    {id:"inek_sutu",   name:"İnek Sütü",      emoji:"🥛", sure:45,  gelir:80,   maliyet:15 },
    {id:"keci_sutu",   name:"Keçi Sütü",      emoji:"🥛", sure:50,  gelir:100,  maliyet:18 },
    {id:"tavuk_yum",   name:"Tavuk Yumurtası", emoji:"🥚", sure:30,  gelir:50,   maliyet:10 },
    {id:"hindi_yum",   name:"Hindi Yumurtası", emoji:"🥚", sure:40,  gelir:75,   maliyet:14 },
    {id:"bal",         name:"Bal",             emoji:"🍯", sure:180, gelir:600,  maliyet:100},
    {id:"yun",         name:"Yün",             emoji:"🧶", sure:120, gelir:350,  maliyet:60 },
    {id:"deri",        name:"Deri",            emoji:"🟤", sure:240, gelir:800,  maliyet:140},
    {id:"et_dana",     name:"Dana Eti",        emoji:"🥩", sure:360, gelir:1800, maliyet:300},
    {id:"et_kuzu",     name:"Kuzu Eti",        emoji:"🍖", sure:300, gelir:1500, maliyet:250},
    {id:"tavuk_eti",   name:"Tavuk Eti",       emoji:"🍗", sure:90,  gelir:280,  maliyet:50 },
    {id:"balik",       name:"Balık",           emoji:"🐟", sure:60,  gelir:180,  maliyet:30 },
    {id:"kefir",       name:"Kefir",           emoji:"🥛", sure:60,  gelir:120,  maliyet:22 }
  ];

  var FABRIKA_URUNLER = [
    {id:"un",          name:"Un",              emoji:"🌾", sure:60,  gelir:120,  maliyet:25 },
    {id:"makarna",     name:"Makarna",         emoji:"🍝", sure:90,  gelir:200,  maliyet:40 },
    {id:"ekmek_fab",   name:"Ekmek",           emoji:"🍞", sure:45,  gelir:80,   maliyet:15 },
    {id:"peksimed",    name:"Peksimet",        emoji:"🥨", sure:60,  gelir:100,  maliyet:20 },
    {id:"konserve",    name:"Konserve",        emoji:"🥫", sure:120, gelir:300,  maliyet:55 },
    {id:"deterjan",    name:"Deterjan",        emoji:"🧴", sure:90,  gelir:250,  maliyet:45 },
    {id:"plastik",     name:"Plastik Boru",    emoji:"🟡", sure:120, gelir:400,  maliyet:75 },
    {id:"cam",         name:"Cam Ürün",        emoji:"🪟", sure:180, gelir:600,  maliyet:110},
    {id:"tekstil",     name:"Tekstil Kumaşı",  emoji:"🧵", sure:150, gelir:500,  maliyet:90 },
    {id:"seramik",     name:"Seramik Fayans",  emoji:"🟦", sure:240, gelir:900,  maliyet:160},
    {id:"kimyasal",    name:"Kimyasal Çözücü", emoji:"🧪", sure:120, gelir:450,  maliyet:80 },
    {id:"elektronik",  name:"Elektronik Kart", emoji:"💡", sure:180, gelir:800,  maliyet:150},
    {id:"demir_boru",  name:"Demir Boru",      emoji:"⚙️", sure:200, gelir:700,  maliyet:130},
    {id:"oto_parca",   name:"Otomobil Parçası",emoji:"🔧", sure:300, gelir:1500, maliyet:280}
  ];

  var MADEN_URUNLER = [
    {id:"komur",       name:"Kömür",           emoji:"⬛", sure:60,  gelir:200,  maliyet:35 },
    {id:"demir_cevher",name:"Demir Cevheri",   emoji:"🔴", sure:90,  gelir:350,  maliyet:60 },
    {id:"bakir",       name:"Bakır",           emoji:"🟤", sure:120, gelir:600,  maliyet:100},
    {id:"aliminyum",   name:"Alüminyum",       emoji:"⬜", sure:150, gelir:800,  maliyet:140},
    {id:"kurşun",      name:"Kurşun",          emoji:"🔘", sure:120, gelir:500,  maliyet:90 },
    {id:"cinko",       name:"Çinko",           emoji:"🩶", sure:120, gelir:550,  maliyet:95 },
    {id:"bor",         name:"Bor Minerali",    emoji:"🟩", sure:180, gelir:1200, maliyet:200},
    {id:"mermer",      name:"Mermer",          emoji:"🤍", sure:200, gelir:1500, maliyet:250},
    {id:"tuz",         name:"Kaya Tuzu",       emoji:"🧂", sure:45,  gelir:100,  maliyet:18 },
    {id:"gumUS_cevher",name:"Gümüş Cevheri",  emoji:"🥈", sure:240, gelir:3000, maliyet:500},
    {id:"altin_cevher",name:"Altın Cevheri",   emoji:"🥇", sure:480, gelir:8000, maliyet:1400}
  ];

  // ══ RENDER FONKSİYONLARI ══
  function renderBahceler() {
    var lev = OYUN.s.profil.seviye;
    if (lev < D.LOCKS.bahceler) return _setSection(_kilit(D.LOCKS.bahceler, "Bahçeler", "🌿"));
    _renderKategori("bahceler", "🌿 Bahçeler", BAHCE_URUNLER, "bahce");
  }

  function renderCiftlikler() {
    var lev = OYUN.s.profil.seviye;
    if (lev < D.LOCKS.ciftlikler) return _setSection(_kilit(D.LOCKS.ciftlikler, "Çiftlikler", "🐄"));
    _renderKategori("ciftlikler", "🐄 Çiftlikler", CIFTLIK_URUNLER, "ciftlik");
  }

  function renderFabrikalar() {
    var lev = OYUN.s.profil.seviye;
    if (lev < D.LOCKS.fabrikalar) return _setSection(_kilit(D.LOCKS.fabrikalar, "Fabrikalar", "🏭"));
    _renderKategori("fabrikalar", "🏭 Fabrikalar", FABRIKA_URUNLER, "fabrika");
  }

  function renderMadenler() {
    var lev = OYUN.s.profil.seviye;
    if (lev < D.LOCKS.madenler) return _setSection(_kilit(D.LOCKS.madenler, "Madenler", "⛏️"));
    _renderKategori("madenler", "⛏️ Madenler", MADEN_URUNLER, "maden");
  }

  function _renderKategori(kategoriKey, baslik, urunler, tip) {
    var s     = OYUN.s;
    var items = s.uretim[kategoriKey] || [];
    var html  = '<div class="page-header"><h1>' + baslik + '</h1><div class="page-header-actions"><button class="ph-icon-btn" onclick="URETIM.showYeniSaha(\'' + kategoriKey + '\',\'' + tip + '\')">+</button></div></div>';

    if (!items.length) {
      html += '<div class="card" style="margin:.75rem"><div class="empty-state"><div class="empty-icon">' + urunler[0].emoji + '</div><div class="empty-title">Henüz saha yok</div><div class="empty-sub">Yeni saha ekleyerek başlayın</div><button class="btn btn-blue" style="margin-top:.75rem" onclick="URETIM.showYeniSaha(\'' + kategoriKey + '\',\'' + tip + '\')">Yeni Saha Ekle</button></div></div>';
    } else {
      html += '<div style="padding:.75rem">';
      items.forEach(function(item, idx) {
        var urun = urunler.find(function(u){return u.id===item.urunId;});
        if (!urun) return;
        var gecen = (Date.now() - (item.basTs || 0)) / 60000;
        var pct   = Math.min(100, Math.round((gecen / urun.sure) * 100));
        var hazir = pct >= 100;

        html += '<div class="card" style="margin:0 0 .6rem">';
        html += '<div style="display:flex;align-items:center;gap:.75rem;padding:.85rem 1rem .5rem">';
        html += '<div style="font-size:2rem">' + urun.emoji + '</div>';
        html += '<div style="flex:1"><div style="font-weight:700;font-size:.92rem">' + urun.name + '</div>';
        html += '<div style="font-size:.75rem;color:var(--text2)">Saha #' + (idx+1) + ' • ' + item.miktar + ' birim</div></div>';
        html += '<div>';
        if (hazir) {
          html += '<button class="btn btn-green btn-sm" onclick="URETIM.hasat(\'' + kategoriKey + '\',' + idx + ')">Hasat! 🌾</button>';
        } else {
          html += '<span style="font-size:.8rem;color:var(--text2)">' + Math.ceil((urun.sure - gecen)) + ' dk</span>';
        }
        html += '</div></div>';

        html += '<div style="padding:0 1rem .85rem">';
        html += '<div class="progress"><div class="progress-fill ' + (hazir?"green":"") + '" style="width:' + pct + '%"></div></div>';
        html += '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--text2);margin-top:.3rem">';
        html += '<span>' + (hazir ? '✅ Hazır!' : Math.round(pct) + '% tamamlandı') + '</span>';
        html += '<span>Gelir: ' + OYUN.fmt(urun.gelir * item.miktar) + '</span>';
        html += '</div>';
        html += '<div style="display:flex;gap:.4rem;margin-top:.5rem">';
        html += '<button class="btn btn-outline btn-sm" onclick="URETIM.showYeniSaha(\'' + kategoriKey + '\',\'' + tip + '\')">+ Yeni</button>';
        html += '<button class="btn btn-sm" style="color:var(--red-l)" onclick="URETIM.sahaSil(\'' + kategoriKey + '\',' + idx + ')">Kaldır</button>';
        html += '</div></div></div>';
      });
      html += '</div>';
      html += '<div style="margin:.25rem .75rem .75rem"><button class="btn btn-blue btn-fw" onclick="URETIM.showYeniSaha(\'' + kategoriKey + '\',\'' + tip + '\')">+ Yeni Saha Ekle</button></div>';
    }
    _setSection(html);
  }

  function showYeniSaha(kategoriKey, tip) {
    var listMap = {bahceler:BAHCE_URUNLER, ciftlikler:CIFTLIK_URUNLER, fabrikalar:FABRIKA_URUNLER, madenler:MADEN_URUNLER};
    var urunler = listMap[kategoriKey] || BAHCE_URUNLER;

    var html = '<div class="form-row"><label class="form-label">Ürün Seç</label><select id="saha-urun" class="inp" onchange="URETIM.sahaOnizle()">';
    urunler.forEach(function(u) {
      html += '<option value="' + u.id + '">' + u.emoji + ' ' + u.name + ' (' + u.sure + ' dk → ' + OYUN.fmt(u.gelir) + ')</option>';
    });
    html += '</select></div>';
    html += '<div class="form-row"><label class="form-label">Miktar (birim)</label><input type="number" id="saha-mik" class="inp" value="10" min="1" max="1000" onchange="URETIM.sahaOnizle()"></div>';
    html += '<div id="saha-ozet" style="background:var(--bg3);border-radius:var(--r-sm);padding:.75rem;margin-bottom:.75rem;font-size:.83rem;color:var(--text2)">Seçim yapın...</div>';
    html += '<button class="btn btn-blue btn-fw btn-lg" onclick="URETIM.sahaKur(\'' + kategoriKey + '\')">Sahayı Kur</button>';
    UI.showModal("Yeni Saha", html);
    setTimeout(function() { sahaOnizle(); }, 50);
  }

  function sahaOnizle() {
    var urunEl = document.getElementById("saha-urun");
    var mikEl  = document.getElementById("saha-mik");
    var ozEl   = document.getElementById("saha-ozet");
    if (!urunEl || !mikEl || !ozEl) return;

    var urunId  = urunEl.value;
    var miktar  = parseInt(mikEl.value) || 1;
    var listMap = {BAHCE_URUNLER:BAHCE_URUNLER, CIFTLIK_URUNLER:CIFTLIK_URUNLER, FABRIKA_URUNLER:FABRIKA_URUNLER, MADEN_URUNLER:MADEN_URUNLER};
    var tumler  = [].concat(BAHCE_URUNLER, CIFTLIK_URUNLER, FABRIKA_URUNLER, MADEN_URUNLER);
    var urun    = tumler.find(function(u){return u.id===urunId;});
    if (!urun)  return;
    var maliyet = urun.maliyet * miktar;
    var gelir   = urun.gelir * miktar;
    var kar     = gelir - maliyet;
    ozEl.innerHTML = urun.emoji + ' ' + urun.name + '<br>Maliyet: <b>' + OYUN.fmt(maliyet) + '</b> • Gelir: <b>' + OYUN.fmt(gelir) + '</b> • Kâr: <b style="color:var(--green-l)">' + OYUN.fmt(kar) + '</b><br>Süre: <b>' + urun.sure + ' dakika</b>';
  }

  function sahaKur(kategoriKey) {
    var urunEl = document.getElementById("saha-urun");
    var mikEl  = document.getElementById("saha-mik");
    if (!urunEl || !mikEl) return;

    var urunId = urunEl.value;
    var miktar = parseInt(mikEl.value) || 1;
    var tumler = [].concat(BAHCE_URUNLER, CIFTLIK_URUNLER, FABRIKA_URUNLER, MADEN_URUNLER);
    var urun   = tumler.find(function(u){return u.id===urunId;});
    if (!urun) return;

    var maliyet = urun.maliyet * miktar;
    if (!OYUN.harca(maliyet, urun.name + " üretim başlangıcı")) return;

    var s = OYUN.s;
    s.uretim[kategoriKey] = s.uretim[kategoriKey] || [];
    s.uretim[kategoriKey].push({
      urunId: urunId, miktar: miktar,
      basTs: Date.now(),
      tamamlanmaTs: Date.now() + urun.sure * 60000
    });

    OYUN.xpEkle(10);
    OYUN.kaydet();
    UI.toast(urun.emoji + " " + urun.name + " üretimi başladı! " + urun.sure + " dk içinde hazır.", "success");
    UI.closeModal();

    // Sayfayı yenile
    var renderMap = {bahceler:"renderBahceler", ciftlikler:"renderCiftlikler", fabrikalar:"renderFabrikalar", madenler:"renderMadenler"};
    if (URETIM[renderMap[kategoriKey]]) URETIM[renderMap[kategoriKey]]();
  }

  function hasat(kategoriKey, idx) {
    var s    = OYUN.s;
    var item = (s.uretim[kategoriKey] || [])[idx];
    if (!item) return;

    var tumler = [].concat(BAHCE_URUNLER, CIFTLIK_URUNLER, FABRIKA_URUNLER, MADEN_URUNLER);
    var urun   = tumler.find(function(u){return u.id===item.urunId;});
    if (!urun) return;

    var gecen = (Date.now() - item.basTs) / 60000;
    if (gecen < urun.sure) return UI.toast("Henüz hazır değil! " + Math.ceil(urun.sure - gecen) + " dakika kaldı.", "warning");

    var gelir = urun.gelir * item.miktar;
    OYUN.kazan(gelir, urun.name + " hasatı");
    OYUN.xpEkle(20);

    // Sıfırla (yeniden başlat)
    item.basTs = Date.now();
    item.tamamlanmaTs = Date.now() + urun.sure * 60000;
    OYUN.kaydet();

    UI.toast("🌾 Hasat tamamlandı! " + OYUN.fmt(gelir) + " kazanıldı.", "success");
    DB.logFeed(OYUN.u.uid, s.profil.username, "hasat etti", item.miktar + " " + urun.name, gelir);

    var renderMap = {bahceler:"renderBahceler", ciftlikler:"renderCiftlikler", fabrikalar:"renderFabrikalar", madenler:"renderMadenler"};
    if (URETIM[renderMap[kategoriKey]]) URETIM[renderMap[kategoriKey]]();
  }

  function sahaSil(kategoriKey, idx) {
    if (!confirm("Bu sahayı kaldırmak istediğinize emin misiniz?")) return;
    var s = OYUN.s;
    (s.uretim[kategoriKey] || []).splice(idx, 1);
    OYUN.kaydet();
    UI.toast("Saha kaldırıldı.", "info");
    var renderMap = {bahceler:"renderBahceler", ciftlikler:"renderCiftlikler", fabrikalar:"renderFabrikalar", madenler:"renderMadenler"};
    if (URETIM[renderMap[kategoriKey]]) URETIM[renderMap[kategoriKey]]();
  }

  function _setSection(html) {
    var el = document.getElementById("main-content");
    if (el) el.innerHTML = html;
  }

  function _kilit(level, name, emoji) {
    return '<div class="locked-screen"><div class="locked-icon">' + emoji + '</div><div style="font-size:3rem;margin:.5rem 0">🔒</div><div class="locked-title">' + level + '. Seviyede Açılacak</div><div class="locked-sub">' + name + ' özelliğini kullanmak için seviye ' + level + " olun.</div></div>";
  }

  return {
    renderBahceler:renderBahceler, renderCiftlikler:renderCiftlikler,
    renderFabrikalar:renderFabrikalar, renderMadenler:renderMadenler,
    showYeniSaha:showYeniSaha, sahaOnizle:sahaOnizle, sahaKur:sahaKur,
    hasat:hasat, sahaSil:sahaSil
  };
})();
