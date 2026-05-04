/* ==========================================================================
   render-fix.js — GameZone ERP — MASTER RENDER FIX
   Tüm window.render override'larını tek dosyada toplar.
   index.html'de EN SONA ekle (tüm diğer scriptlerden sonra).
   ========================================================================== */

(function installMasterRender() {
  'use strict';

  /* ── Tab → Fonksiyon eşlemesi (tüm dosyalardan toplanan) ── */
  const TAB_MAP = {
    /* ui-manager.js — core */
    dukkan:         () => typeof renderDukkan        === 'function' && renderDukkan(),
    bahce:          () => typeof window._renderBahceDetayli === 'function'
                            ? window._renderBahceDetayli()
                            : (typeof renderProduction === 'function' && renderProduction('gardens','Bahçeler','🌱',['domates','patates','sogan','elma','uzum','kiraz','kayisi','findik','zeytin'])),
    ciftlik:        () => typeof renderProduction    === 'function' && renderProduction('farms','Çiftlikler','🐄',['inek_sutu','keci_sutu','tavuk_yumurtasi','hindi_yumurtasi','kaz_yumurtasi','tavuk_eti','dana_eti','kuzu_eti','yun']),
    fabrika:        () => typeof renderProduction    === 'function' && renderProduction('factories','Fabrikalar','🏭',['ekmek','pasta','dondurma','beyaz_peynir','kasar_peyniri','suzme_bal','petek_bal','polen','kimyasal_cozucu','cimento','keten_kumas','eldiven','siyah_cay','yesil_cay','bugday_unu','misir_unu','seker','ayicicek_yagi','zeytinyagi','findik_yagi']),
    maden:          () => typeof renderProduction    === 'function' && renderProduction('mines','Madenler','⛏️',['altin','gumus','bakir','demir','kromit'], 30),
    lojistik:       () => typeof renderLojistik      === 'function' && renderLojistik(),
    ihracat:        () => typeof renderIhracat       === 'function' && renderIhracat(),
    ihale:          () => typeof renderIhale         === 'function' && renderIhale(),
    kripto:         () => typeof renderKripto        === 'function' && renderKripto(),
    banka:          () => typeof renderBankaSekme    === 'function' && renderBankaSekme(),
    marka:          () => typeof renderMarka         === 'function' && renderMarka(),
    pazar:          () => typeof renderPazar         === 'function' && renderPazar(),
    liderlik:       () => typeof renderLiderlik      === 'function' && renderLiderlik(),
    haberler:       () => typeof renderHaberler      === 'function' && renderHaberler(),
    sehirler:       () => typeof renderSehirler      === 'function' && renderSehirler(),
    magaza:         () => typeof renderMagaza        === 'function' && renderMagaza(),
    oyunlar:        () => typeof renderOyunlar       === 'function' && renderOyunlar(),
    hikaye:         () => typeof renderHikaye        === 'function' && renderHikaye(),
    sss:            () => typeof renderSSS           === 'function' && renderSSS(),
    oyunpazari:     () => typeof renderOyunPazari    === 'function' && renderOyunPazari(),
    gorevler:       () => typeof renderGorevler      === 'function' && renderGorevler(),
    basarimlar:     () => typeof renderBasarimlar    === 'function' && renderBasarimlar(),

    /* Finans */
    borsa:          () => typeof renderBorsa         === 'function' && renderBorsa(),
    cuzdan:         () => typeof renderCuzdan        === 'function' && renderCuzdan(),
    tahvil:         () => typeof renderTahvil        === 'function' && renderTahvil(),
    futures:        () => typeof renderFutures       === 'function' && renderFutures(),
    hedgefon:       () => typeof renderHedgeFon      === 'function' && renderHedgeFon(),
    altin:          () => typeof renderAltin         === 'function' && renderAltin(),
    kredi:          () => {
      if (typeof renderKrediSistemi === 'function') return renderKrediSistemi();
      if (typeof renderKredi        === 'function') return renderKredi();
    },
    vergi:          () => typeof renderVergiOyuncu   === 'function' && renderVergiOyuncu(),

    /* Devlet & Kamu */
    muhtarlik:      () => {
      const role = window.GZ?.data?.role;
      if (role === 'muhtar' && typeof window.RS_renderMuhtarPanel === 'function') return window.RS_renderMuhtarPanel();
      if (typeof renderMuhtarlikTam === 'function') return renderMuhtarlikTam();
      if (typeof renderMuhtarlik    === 'function') return renderMuhtarlik();
    },
    belediye:       () => {
      const role = window.GZ?.data?.role;
      if (role === 'mayor' && typeof window.RS_renderBelediyeBaskanPanel === 'function') return window.RS_renderBelediyeBaskanPanel();
      if (typeof renderBelediyeTam  === 'function') return renderBelediyeTam();
      if (typeof renderBelediye     === 'function') return renderBelediye();
    },
    sgk:            () => typeof renderSGK           === 'function' && renderSGK(),
    secim:          () => {
      if (typeof window.RS_renderSecimler === 'function') return window.RS_renderSecimler();
      if (typeof renderSecim              === 'function') return renderSecim();
    },
    basbakanlik:    () => {
      const role = window.GZ?.data?.role;
      const isYetkili = role === 'pm' || role === 'president' || window.GZ?.data?.isFounder;
      if (isYetkili && typeof window.RS_renderBBPanel === 'function') return window.RS_renderBBPanel();
      if (typeof renderBasbakanlik === 'function') return renderBasbakanlik();
    },
    cumhurbaskani:  () => {
      if (typeof renderCumhurbaskanligiTam === 'function') return renderCumhurbaskanligiTam();
      if (typeof renderCumhurbaskani       === 'function') return renderCumhurbaskani();
    },
    cumhurbaskanligi: () => {
      if (typeof renderCumhurbaskanligiTam === 'function') return renderCumhurbaskanligiTam();
    },

    /* Asayiş */
    polis:          () => typeof renderPolis         === 'function' && renderPolis(),
    askeriye:       () => typeof renderAskeriye      === 'function' ? renderAskeriye() : _emptyState('🎖️','Askeriye','Yakında...'),
    itfaiye:        () => typeof renderItfaiye       === 'function' ? renderItfaiye()  : _emptyState('🚒','İtfaiye','Yakında...'),
    sahilguz:       () => typeof renderSahilguz      === 'function' ? renderSahilguz() : _emptyState('⚓','Sahil Güvenlik','Yakında...'),
    jandarma:       () => typeof renderJandarma      === 'function' ? renderJandarma() : _emptyState('🔫','Jandarma','Yakında...'),

    /* Hukuk */
    mahkeme:        () => {
      if (typeof renderMahkemeTam === 'function') return renderMahkemeTam();
      if (typeof renderMahkeme    === 'function') return renderMahkeme();
    },
    noter:          () => typeof renderNoter         === 'function' && renderNoter(),
    sozlesme:       () => typeof renderSozlesme      === 'function' && renderSozlesme(),
    konkurato:      () => typeof renderKonkurato     === 'function' && renderKonkurato(),

    /* Varlik & Emlak */
    emlak:          () => typeof renderEmlak         === 'function' && renderEmlak(),
    sigorta:        () => typeof renderSigorta       === 'function' && renderSigorta(),
    franchise:      () => typeof renderFranchise     === 'function' && renderFranchise(),
    karaborsa:      () => typeof renderKaraborsa     === 'function' && renderKaraborsa(),

    /* Yönetim */
    arge:           () => typeof renderArge          === 'function' && renderArge(),
    egitim:         () => typeof renderEgitim        === 'function' && renderEgitim(),
    calisan:        () => typeof renderCalisan       === 'function' && renderCalisan(),
    uluslararasi:   () => typeof renderUluslararasi  === 'function' && renderUluslararasi(),

    /* Rekabet */
    ticsavas:       () => {
      if (typeof renderTicsavas  === 'function') return renderTicsavas();
      if (typeof renderTicSavas  === 'function') return renderTicSavas();
    },
    duello:         () => typeof renderDuello        === 'function' && renderDuello(),

    /* Kişisel */
    avatar:         () => typeof renderAvatar        === 'function' && renderAvatar(),
    unvan:          () => typeof renderUnvan         === 'function' && renderUnvan(),
    dekorasyon:     () => typeof renderDekorasyon    === 'function' && renderDekorasyon(),

    /* Macera */
    sefer:          () => typeof renderSefer         === 'function' && renderSefer(),
    prestij:        () => typeof renderPrestij       === 'function' && renderPrestij(),
    koleksiyon:     () => typeof renderKoleksiyon    === 'function' && renderKoleksiyon(),

    /* Harita */
    harita:         () => typeof renderHarita        === 'function' && renderHarita(),

    /* Ekstra */
    profil:         () => typeof renderProfil        === 'function' && renderProfil(),
    muhtarSikayetler: () => typeof renderMuhtarSikayetler === 'function' && renderMuhtarSikayetler(),
    krediSistemi:   () => typeof renderKrediSistemi  === 'function' && renderKrediSistemi(),
    yatirim:        () => typeof renderYatirim       === 'function' && renderYatirim(),
    enerji:         () => typeof renderEnerji        === 'function' ? renderEnerji() : _emptyState('⚡','Enerji','Yakında...'),
    polis_panel:    () => typeof renderPolis         === 'function' && renderPolis(),
  };

  function _emptyState(emoji, title, sub) {
    const main = document.getElementById('appMain');
    if (main) main.innerHTML = `<div class="empty-state"><div style="font-size:48px">${emoji}</div><h3>${title}</h3><p>${sub || ''}</p></div>`;
  }

  /* ── Master render — spinner + dispatch ── */
  window.render = function masterRender(tab) {
    if (!tab) return;

    // Admin ekranı açıksa render yapma
    const adminScr = document.getElementById('adminScreen');
    if (adminScr && adminScr.style.display === 'flex') return;

    // Spinner göster
    const main = document.getElementById('appMain');
    if (main) main.innerHTML = `<div style="padding:60px;text-align:center"><div class="spinner" style="margin:0 auto;width:36px;height:36px;border:3px solid #1e3a5f;border-top-color:#3b82f6;border-radius:50%;animation:spin .7s linear infinite"></div><p style="color:#64748b;margin-top:12px;font-size:13px">Yükleniyor...</p></div>`;

    const fn = TAB_MAP[tab];
    if (fn) {
      try { fn(); } catch(e) { console.error('[render-fix] Hata — sekme:', tab, e); _emptyState('⚠️', 'Yükleme Hatası', e.message); }
    } else {
      console.warn('[render-fix] Bilinmeyen sekme:', tab);
      _emptyState('🔧', 'Yakında', `"${tab}" modülü henüz hazır değil.`);
    }
  };

  /* ── switchTab — render + aktif buton ── */
  window.switchTab = function masterSwitch(tab) {
    if (!tab) return;
    if (window.GZ) window.GZ.currentTab = tab;

    // bottomNav aktif
    document.querySelectorAll('#bottomNav .navbtn').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === tab));

    // mainKonsol aktif
    if (typeof window.renderKonsolActive === 'function') window.renderKonsolActive(tab);

    window.render(tab);
  };

  /* ── initKonsol'u tetikle (zaten hazırsa hemen, değilse bekle) ── */
  function tryInitKonsol() {
    if (typeof window.initKonsol === 'function') {
      window.initKonsol();
    } else {
      setTimeout(tryInitKonsol, 200);
    }
  }

  /* ── DOMContentLoaded veya hemen ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInitKonsol);
  } else {
    setTimeout(tryInitKonsol, 0);
  }

  console.log('[render-fix.js] ✅ Master render yüklendi — ' + Object.keys(TAB_MAP).length + ' sekme aktif');
})();
