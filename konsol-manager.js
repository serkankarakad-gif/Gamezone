/* ==========================================================================
   konsol-manager.js — GameZone ERP v3.0 — TAM MENÜ SİSTEMİ
   ─────────────────────────────────────────────────────────────────────────
   Tüm sekmeler kategorilere ayrılmış: Devlet, Kamu, Polis, Finans, vb.
   ========================================================================== */

(function () {

  /* ─── Sabit alt 5 sekme ─── */
  const PRIMARY_TABS = [
    { id: 'dukkan',    icon: '🏪', label: 'Dükkan'   },
    { id: 'muhtarlik', icon: '🏛️', label: 'Devlet'   },
    { id: '__menu__',  icon: '◉',  label: 'Menü', isFab: true },
    { id: 'borsa',     icon: '📊', label: 'Borsa'    },
    { id: 'cuzdan',    icon: '💰', label: 'Cüzdan'   },
  ];

  /* ─── TÜM KATEGORİLER — MENÜ FAB'da açılır ─── */
  const CATEGORIES = [

    /* ════════════ DEVLET & KAMU ════════════ */
    {
      id: 'devlet', name: 'DEVLET & KAMU', icon: '🏛️', color: '#1d4ed8',
      items: [
        { id: 'muhtarlik',    icon: '🏛️', label: 'Muhtarlık',       desc: 'Kimlik kartı, sosyal yardım, duyurular',      highlight: true },
        { id: 'belediye',     icon: '🏙️', label: 'Belediye',        desc: 'Ruhsat, imar, toplu taşıma, tabela vergisi'               },
        { id: 'sgk',          icon: '🏥', label: 'SGK',              desc: 'İşsizlik, emeklilik, sağlık sigortası',       highlight: true },
        { id: 'vergi',        icon: '🧾', label: 'Vergi Dairesi',    desc: 'KDV, gelir vergisi, beyan'                                },
        { id: 'kredi',        icon: '💳', label: 'Kredi Ofisi',      desc: 'Kredi başvurusu, taksit planı'                            },
        { id: 'secim',        icon: '🗳️', label: 'Seçim & Parti',   desc: 'Parti kur, oy kullan, sandık sonuçları',      highlight: true },
        { id: 'basbakanlik',  icon: '🇹🇷', label: 'Yönetim Merkezi', desc: 'Cumhurbaşkanlığı & başbakanlık paneli'                    },
      ]
    },

    /* ════════════ ASAYİŞ & GÜVENLİK ════════════ */
    {
      id: 'asayis', name: 'ASAYİŞ & GÜVENLİK', icon: '👮', color: '#1e40af',
      items: [
        { id: 'polis',      icon: '👮', label: 'Emniyet',         desc: 'GBT sorgulama, ceza, sabıka kaydı',  highlight: true },
        { id: 'askeriye',   icon: '🎖️', label: 'Askeriye',        desc: 'Askeri görevler, savunma bütçesi'                   },
        { id: 'itfaiye',    icon: '🚒', label: 'İtfaiye',         desc: 'Yangın sigortası, acil müdahale'                    },
        { id: 'sahilguz',   icon: '⚓', label: 'Sahil Güvenlik',  desc: 'İhracat denetimi, kaçakçılık önleme'                },
        { id: 'jandarma',   icon: '🔫', label: 'Jandarma',        desc: 'Kırsal bölge güvenliği'                             },
      ]
    },

    /* ════════════ MAHKEME & HUKUK ════════════ */
    {
      id: 'hukuk', name: 'MAHKEME & HUKUK', icon: '⚖️', color: '#7c3aed',
      items: [
        { id: 'mahkeme',    icon: '⚖️', label: 'Mahkeme',        desc: 'Dava aç, itiraz et, avukat tut'   },
        { id: 'noter',      icon: '📜', label: 'Noterlik',        desc: 'Sözleşme onaylat, imza'            },
        { id: 'sozlesme',   icon: '📝', label: 'Sözleşmeler',     desc: 'Aktif sözleşmeler ve anlaşmalar'  },
        { id: 'konkurato',  icon: '🚫', label: 'Konkordato',      desc: 'Borç yapılandırma başvurusu'       },
      ]
    },

    /* ════════════ ÜRETİM ════════════ */
    {
      id: 'uretim', name: 'ÜRETİM', icon: '🏭', color: '#16a34a',
      items: [
        { id: 'bahce',    icon: '🌱', label: 'Bahçeler',    desc: 'Meyve & sebze yetiştir'                    },
        { id: 'ciftlik',  icon: '🐄', label: 'Çiftlikler',  desc: 'Hayvancılık & et/süt'                      },
        { id: 'fabrika',  icon: '🏭', label: 'Fabrikalar',  desc: 'İşlenmiş ürün üretimi'                     },
        { id: 'maden',    icon: '⛏️', label: 'Madenler',    desc: 'Altın, gümüş, demir... (Lv 30+)'           },
        { id: 'enerji',   icon: '⚡', label: 'Enerji San.', desc: 'Güneş, rüzgar, termik enerji üretimi'      },
      ]
    },

    /* ════════════ TİCARET ════════════ */
    {
      id: 'ticaret', name: 'TİCARET', icon: '💼', color: '#1e5cb8',
      items: [
        { id: 'dukkan',     icon: '🏪', label: 'Dükkanlar',     desc: 'Reyon kur, ürün sat'                              },
        { id: 'pazar',      icon: '🛒', label: 'Pazar',          desc: 'Pazar kademeleri & satış'                         },
        { id: 'oyunpazari', icon: '🏬', label: 'Oyuncu Pazarı', desc: 'Diğer oyunculardan al-sat', highlight: true        },
        { id: 'lojistik',   icon: '🚚', label: 'Lojistik',       desc: '81 ilde depo ağı'                                 },
        { id: 'ihracat',    icon: '🚢', label: 'İhracat',        desc: 'Yabancı şirketlere sat'                           },
        { id: 'ihale',      icon: '📋', label: 'İhaleler',       desc: 'Devlet ihaleleri, teklif ver', highlight: true     },
        { id: 'karaborsa',  icon: '🕶️', label: 'Kara Borsa',    desc: 'Yüksek risk/ödül (Lv 15+)'                        },
      ]
    },

    /* ════════════ FİNANS & BANKACILIK ════════════ */
    {
      id: 'finans', name: 'FİNANS & BANKACILIK', icon: '🏦', color: '#0891b2',
      items: [
        { id: 'banka',    icon: '🏦', label: 'Banka',          desc: 'Kredi çek, mevduat aç, havale', highlight: true  },
        { id: 'borsa',    icon: '📊', label: 'Borsa',           desc: 'Hisse al-sat, IPO, temettü',    highlight: true  },
        { id: 'kripto',   icon: '₿',  label: 'Kripto Borsa',   desc: 'BTC, ETH, GZCoin al-sat'                         },
        { id: 'tahvil',   icon: '📜', label: 'Tahvil & Bono',  desc: 'Sabit getirili yatırım'                           },
        { id: 'futures',  icon: '📉', label: 'Vadeli İşlem',   desc: 'Kaldıraçlı pozisyon (riskli)'                     },
        { id: 'hedgefon', icon: '💹', label: 'Hedge Fon',      desc: 'Profesyonel fon yönetimi (Lv 35+)'                },
        { id: 'altin',    icon: '🥇', label: 'Altın Hesabı',   desc: 'Gram altın al/sat'                                },
      ]
    },

    /* ════════════ VARLIK & EMLAK ════════════ */
    {
      id: 'varlik', name: 'VARLIK & EMLAK', icon: '🏘️', color: '#0d9488',
      items: [
        { id: 'emlak',     icon: '🏘️', label: 'Gayrimenkul',  desc: 'Arsa/bina al, kira topla', highlight: true  },
        { id: 'sigorta',   icon: '🛡️', label: 'Sigorta',      desc: 'DASK, kasko, sağlık'                         },
        { id: 'franchise', icon: '🪧', label: 'Franchise',     desc: 'Franchise ver/al'                            },
        { id: 'cuzdan',    icon: '💰', label: 'Dijital Cüzdan',desc: 'Tüm varlıklar, kimlik, kartlar'               },
      ]
    },

    /* ════════════ SOSYAL ════════════ */
    {
      id: 'sosyal', name: 'SOSYAL', icon: '👥', color: '#7c3aed',
      items: [
        { id: 'marka',     icon: '🏢', label: 'Markalar',    desc: 'Klan kur veya katıl (Lv 10+)'   },
        { id: 'liderlik',  icon: '🏆', label: 'Liderlik',    desc: 'En zenginler tablosu'             },
        { id: 'sehirler',  icon: '🏙️', label: 'Şehirler',    desc: '81 il, taşın'                    },
        { id: 'haberler',  icon: '📰', label: 'Haberler',    desc: 'Güncel piyasa & ihaleler'         },
        { id: 'secim',     icon: '🗳️', label: 'Seçim Sonuçları', desc: 'Güncel sandık bilgileri'     },
      ]
    },

    /* ════════════ EĞLENCE ════════════ */
    {
      id: 'eglence', name: 'EĞLENCE', icon: '🎮', color: '#f59e0b',
      items: [
        { id: 'oyunlar',    icon: '🎮', label: 'Mini Oyunlar',    desc: '50 oyun, seviye sistemli', highlight: true },
        { id: 'gorevler',   icon: '📋', label: 'Günlük Görevler', desc: 'Her gün yeni görev, ödül kazan'            },
        { id: 'basarimlar', icon: '🏅', label: 'Başarımlar',      desc: '15 başarım, XP ödüllü'                     },
        { id: 'magaza',     icon: '💎', label: 'Elmas Mağaza',    desc: 'Elmas paketleri & robot'                   },
      ]
    },

    /* ════════════ KİŞİSEL ════════════ */
    {
      id: 'kisisel', name: 'KİŞİSEL', icon: '🎭', color: '#be185d',
      items: [
        { id: 'cuzdan',     icon: '💰', label: 'Dijital Cüzdan', desc: 'Bakiye, kimlik, banka kartı, kripto', highlight: true },
        { id: 'calisan',    icon: '👷', label: 'Çalışanlarım',   desc: 'Personel tut, maaş öde'                              },
        { id: 'avatar',     icon: '🎭', label: 'Avatar',          desc: 'Karakter görseli'                                    },
        { id: 'unvan',      icon: '🎖️', label: 'Unvanlar',        desc: 'Kazanılan unvanlar'                                  },
        { id: 'dekorasyon', icon: '🎨', label: 'Dekorasyon',      desc: 'Dükkan görünümü'                                     },
      ]
    },

    /* ════════════ YÖNETİM ════════════ */
    {
      id: 'yonetim', name: 'YÖNETİM', icon: '👔', color: '#475569',
      items: [
        { id: 'arge',       icon: '🔬', label: 'Ar-Ge',         desc: 'Teknoloji ağacı'               },
        { id: 'egitim',     icon: '🎓', label: 'Eğitim',        desc: 'Beceri kursları'               },
        { id: 'calisan',    icon: '👷', label: 'Çalışanlar',    desc: 'Personel tut, maaş öde'        },
        { id: 'noter',      icon: '📜', label: 'Noterlik',      desc: 'Sözleşme onaylatma'            },
      ]
    },

    /* ════════════ REKABET ════════════ */
    {
      id: 'rekabet', name: 'REKABET', icon: '⚔️', color: '#991b1b',
      items: [
        { id: 'ticsavas', icon: '⚔️', label: 'Tic. Savaşı',   desc: 'Rakip oyuncuya ekonomik saldır'  },
        { id: 'duello',   icon: '🤜', label: 'Düello',         desc: '1v1 ticaret arena'                },
        { id: 'harita',   icon: '🗺️', label: 'TR Harita',      desc: 'Bölge sahipliği'                  },
      ]
    },

    /* ════════════ GLOBAL ════════════ */
    {
      id: 'global', name: 'GLOBAL', icon: '🌍', color: '#7c2d12',
      items: [
        { id: 'uluslararasi', icon: '🌍', label: 'Uluslararası', desc: '10 ülkeye ihracat'                },
        { id: 'ihracat',      icon: '🚢', label: 'İhracat Mer.', desc: 'İhracat belgeleri ve teşvikler'  },
      ]
    },

    /* ════════════ MACERA ════════════ */
    {
      id: 'macera', name: 'MACERA', icon: '🗺️', color: '#a16207',
      items: [
        { id: 'sefer',      icon: '🗺️', label: 'Seferler',    desc: '30-60 günlük büyük görevler', highlight: true },
        { id: 'prestij',    icon: '⭐', label: 'Prestij',      desc: 'Lv 100\'da yeniden başla, kalıcı bonus'       },
        { id: 'koleksiyon', icon: '🃏', label: 'Koleksiyon',  desc: 'Nadir kart topla'                              },
      ]
    },

    /* ════════════ BİLGİ ════════════ */
    {
      id: 'bilgi', name: 'BİLGİ', icon: '📚', color: '#6b7280',
      items: [
        { id: 'hikaye', icon: '📖', label: 'Hikaye', desc: 'Oyun hakkında'             },
        { id: 'sss',    icon: '❓', label: 'SSS',    desc: 'Sıkça sorulan sorular'     },
      ]
    },

  ];

  let konsol   = null;
  let menuSheet = null;

  /* ══════════════════════ ALT KONSOL ══════════════════════ */
  function buildKonsol() {
    const old = document.getElementById('mainKonsol');
    if (old) old.remove();
    const oldSheet = document.getElementById('konsolFabBackdrop');
    if (oldSheet) oldSheet.remove();

    const nav = document.createElement('nav');
    nav.id = 'mainKonsol';
    nav.className = 'main-konsol';
    nav.setAttribute('role', 'navigation');
    nav.style.zIndex = '500';

    nav.innerHTML = PRIMARY_TABS.map(t => {
      if (t.isFab) return `
        <button class="mk-fab" id="mkFab" title="Tüm Menü">
          <div class="mk-fab-inner"><span class="mk-fab-icon">${t.icon}</span></div>
          <span class="mk-fab-label">${t.label}</span>
        </button>`;
      return `
        <button class="mk-tab" data-tab="${t.id}" title="${t.label}">
          <span class="mk-icon">${t.icon}</span>
          <span class="mk-label">${t.label}</span>
        </button>`;
    }).join('');

    document.body.appendChild(nav);
    konsol = nav;

    nav.querySelectorAll('.mk-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.tab;
        if (typeof window.switchTab === 'function') window.switchTab(id);
        setActive(id);
        addToRecents(id);
      });
    });

    document.getElementById('mkFab').addEventListener('click', openMenuSheet);
  }

  /* ══════════════════════ AKTİF SEKME ══════════════════════ */
  function setActive(id) {
    if (!konsol) return;
    konsol.querySelectorAll('.mk-tab').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === id));
    const inPrimary = PRIMARY_TABS.some(t => t.id === id);
    document.getElementById('mkFab')?.classList.toggle('has-active', !inPrimary);
  }
  window.renderKonsolActive = setActive;

  /* ══════════════════════ MENÜ SHEET ══════════════════════ */
  function openMenuSheet() {
    closeMenuSheet();
    const recents = loadRecents();

    const sheet = document.createElement('div');
    sheet.id    = 'konsolFabBackdrop';
    sheet.className = 'mk-sheet-bg';

    /* Kullanıcının rolüne göre kategori filtrele */
    const userRole    = window.GZ?.data?.role    || 'vatandas';
    const isFounder   = window.GZ?.data?.isFounder || false;
    const isMayor     = !!(window.GZ?.data?.mayorOf);
    const isPresident = window.GZ?.data?.isPresident || false;
    const isPolis     = userRole === 'police';
    const isAsker     = userRole === 'soldier';

    const recentItems = recents.length ? `
      <div class="mk-cat" style="background:linear-gradient(135deg,#fef3c722,#fde68a22);border-color:#f59e0b44">
        <div class="mk-cat-head" style="color:#f59e0b">
          <span class="mk-cat-icon">⭐</span>
          <span class="mk-cat-name">SON KULLANILAN</span>
        </div>
        <div class="mk-cat-grid">
          ${recents.map(id => { const f = findItem(id); return f ? renderMenuItem(f) : ''; }).join('')}
        </div>
      </div>` : '';

    const catsHtml = CATEGORIES.map(cat => `
      <div class="mk-cat" data-cat="${cat.id}">
        <div class="mk-cat-head">
          <span class="mk-cat-icon" style="color:${cat.color}">${cat.icon}</span>
          <span class="mk-cat-name">${cat.name}</span>
          <span class="mk-cat-count">${cat.items.length}</span>
        </div>
        <div class="mk-cat-grid">
          ${cat.items.map(it => renderMenuItem(it, cat.color)).join('')}
        </div>
      </div>`).join('');

    sheet.innerHTML = `
      <div class="mk-sheet" onclick="event.stopPropagation()">
        <div class="mk-sheet-grabber"></div>
        <div class="mk-sheet-head">
          <div style="display:flex;flex-direction:column">
            <h3 style="margin:0;font-size:16px;font-weight:800">📋 Tüm Bölümler</h3>
            <div style="font-size:11px;color:#64748b;margin-top:2px">
              ${isFounder ? '⚡ Kurucu' : isPresident ? '🇹🇷 Cumhurbaşkanı' : isMayor ? '🏙️ Belediye Başkanı' : isPolis ? '👮 Polis' : isAsker ? '🎖️ Asker' : '👤 Vatandaş'}
              — ${window.GZ?.data?.username || ''}
            </div>
          </div>
          <button class="mk-sheet-close" id="mkSheetClose">✕</button>
        </div>
        <div class="mk-sheet-body">
          ${recentItems}
          ${catsHtml}
        </div>
      </div>`;

    document.body.appendChild(sheet);
    menuSheet = sheet;
    requestAnimationFrame(() => sheet.classList.add('open'));

    sheet.addEventListener('click', closeMenuSheet);
    document.getElementById('mkSheetClose').addEventListener('click', closeMenuSheet);

    sheet.querySelectorAll('[data-tab]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const id = el.dataset.tab;
        if (typeof window.switchTab === 'function') window.switchTab(id);
        setActive(id);
        addToRecents(id);
        closeMenuSheet();
      });
    });

    /* Swipe to close */
    let startY = null;
    const sheetEl = sheet.querySelector('.mk-sheet');
    const grabber = sheetEl.querySelector('.mk-sheet-grabber');
    grabber.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    grabber.addEventListener('touchmove', e => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) sheetEl.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    grabber.addEventListener('touchend', e => {
      if (startY === null) return;
      sheetEl.style.transform = '';
      const dy = e.changedTouches[0].clientY - startY;
      startY = null;
      if (dy > 100) closeMenuSheet();
    });
  }

  function closeMenuSheet() {
    if (!menuSheet) return;
    menuSheet.classList.remove('open');
    setTimeout(() => { menuSheet?.remove(); menuSheet = null; }, 250);
  }

  function renderMenuItem(item, catColor) {
    const hl   = item.highlight ? ' mk-item-highlight' : '';
    const desc = item.desc ? `<div class="mk-item-desc">${item.desc}</div>` : '';
    const color = catColor || '#3b82f6';
    return `
      <button class="mk-item${hl}" data-tab="${item.id}"
        style="${item.highlight ? `border-color:${color}44;` : ''}">
        <span class="mk-item-icon" style="background:${color}18;color:${color}">${item.icon}</span>
        <div class="mk-item-text">
          <div class="mk-item-label">${item.label}</div>
          ${desc}
        </div>
        <span class="mk-item-arrow" style="color:${color}88">›</span>
      </button>`;
  }

  function findItem(id) {
    for (const cat of CATEGORIES)
      for (const it of cat.items)
        if (it.id === id) return it;
    return null;
  }

  function loadRecents() {
    try {
      const arr = JSON.parse(localStorage.getItem('mk_recents') || '[]');
      return Array.isArray(arr) ? arr.filter(id => findItem(id)).slice(0, 4) : [];
    } catch { return []; }
  }
  function addToRecents(id) {
    if (!findItem(id)) return;
    let r = loadRecents().filter(x => x !== id);
    r.unshift(id); r = r.slice(0, 4);
    localStorage.setItem('mk_recents', JSON.stringify(r));
  }

  /* ══════════════════════ INIT ══════════════════════ */
  window.initKonsol = function () {
    const oldNav = document.getElementById('bottomNav');
    if (oldNav) oldNav.style.display = 'none';
    const oldDk  = document.getElementById('dynamicKonsol');
    if (oldDk)  oldDk.remove();
    const oldShow = document.getElementById('dkShowBtn');
    if (oldShow) oldShow.remove();

    buildKonsol();

    const orig = window.switchTab;
    window.switchTab = function (tab) {
      if (typeof orig === 'function') orig(tab);
      setActive(tab);
    };

    setActive(window.GZ?.currentTab || 'dukkan');
  };

})();
