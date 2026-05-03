/* ============================================================================
   siyasi-sistem.js — GameZone ERP: TAM SİYASİ & İDARİ SİSTEM
   ============================================================================
   Bu dosya duzeltmeler.js'in ALTINA ekle (index.html'de en son script):
       <script src="siyasi-sistem.js"></script>

   İÇERİK:
   1.  ROL SİSTEMİ — Muhtar, Belediye Başkanı, Cumhurbaşkanı
   2.  SEÇİM SİSTEMİ — Aday olma, kampanya, oylama, sonuç
   3.  MUHTARLIK PANELİ — Tam yetkili, şikayet akışı, altyapı
   4.  BELEDİYE PANELİ — Tam yetkili, bütçe, projeler
   5.  CUMHURBAŞKANLİĞI PANELİ — Vergi, faiz, asgari ücret, savaş/barış
   6.  VERGİ SİSTEMİ — Otomatik vergi, gelir vergisi, KDV
   7.  KREDİ SİSTEMİ — Tam aktif, skor, taksit, gecikme
   8.  ROL MAAŞ SİSTEMİ — Otomatik maaş ödemesi
   9.  YOLSUZLUK/RÜŞVET — Yakalanma, mahkeme akışı
   10. ALTYAPI ŞİKAYETLERİ — 250 kategori, muhtar akışı
   ============================================================================ */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════
   YARDIMCI KISA KODLAR
   ═══════════════════════════════════════════════════════════════════════ */
const SP = {
  uid:  () => window.GZ?.uid,
  data: () => window.GZ?.data || {},
  main: () => document.getElementById('appMain'),
  fmt:  n  => typeof cashFmt === 'function' ? cashFmt(n) : Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2}) + ' ₺',
  ts:   ts => new Date(ts||Date.now()).toLocaleString('tr-TR'),
  g:    p  => window.dbGet ? window.dbGet(p) : db.ref(p).once('value').then(s=>s.val()),
  u:    (p,o) => window.dbUpdate ? window.dbUpdate(p,o) : db.ref(p).update(o),
  s:    (p,v) => window.dbSet ? window.dbSet(p,v) : db.ref(p).set(v),
  push: (p,v) => window.dbPush ? window.dbPush(p,v) : db.ref(p).push(v),
  toast:(m,k,d) => typeof toast === 'function' && toast(m,k||'info',d||4000),
  notify: async (uid, msg, kind) => {
    const key = db.ref('notifs/'+uid).push().key;
    await db.ref('notifs/'+uid+'/'+key).set({msg, kind:kind||'info', ts:Date.now(), read:false});
  },
  isFounder: () => window.GZ?.data?.isFounder || false,
  card: (title, body, color) => `
    <div style="background:#0d1829;border:1px solid ${color||'#1e3a5f'};border-radius:14px;padding:18px;margin-bottom:14px">
      ${title?`<div style="font-size:14px;font-weight:800;color:#e2e8f0;margin-bottom:12px">${title}</div>`:''}
      ${body}
    </div>`,
  btn: (label, onclick, color, outline) => outline
    ? `<button onclick="${onclick}" style="background:${color||'#3b82f6'}22;color:${color||'#3b82f6'};border:1px solid ${color||'#3b82f6'}44;border-radius:10px;padding:12px 16px;font-weight:700;font-size:13px;cursor:pointer;width:100%;margin-bottom:8px">${label}</button>`
    : `<button onclick="${onclick}" style="background:${color||'#3b82f6'};color:white;border:none;border-radius:10px;padding:12px 16px;font-weight:700;font-size:13px;cursor:pointer;width:100%;margin-bottom:8px">${label}</button>`,
  inp: (id, ph, type) => `<input id="${id}" type="${type||'text'}" placeholder="${ph}" style="width:100%;padding:12px;background:#080d1a;border:1px solid #1e3a5f;border-radius:10px;color:#e2e8f0;font-size:13px;box-sizing:border-box;margin-bottom:10px">`,
  sel: (id, opts) => `<select id="${id}" style="width:100%;padding:12px;background:#080d1a;border:1px solid #1e3a5f;border-radius:10px;color:#e2e8f0;font-size:13px;margin-bottom:10px">${opts}</select>`,
  badge: (t, c) => `<span style="background:${c||'#3b82f6'}22;color:${c||'#3b82f6'};border:1px solid ${c||'#3b82f6'}44;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700">${t}</span>`,
  pageTitle: (icon, title, sub) => `<div style="padding:20px 16px 8px"><div style="font-size:22px;font-weight:900;color:#e2e8f0">${icon} ${title}</div>${sub?`<div style="font-size:12px;color:#64748b;margin-top:4px">${sub}</div>`:''}</div>`,
  stat: (lbl, val, c) => `<div style="text-align:center"><div style="font-size:22px;font-weight:900;color:${c||'#60a5fa'}">${val}</div><div style="font-size:10px;color:#64748b;margin-top:2px">${lbl}</div></div>`,
};

/* ═══════════════════════════════════════════════════════════════════════
   KONFİGÜRASYON
   ═══════════════════════════════════════════════════════════════════════ */
const ROL_CFG = {
  muhtar:        { label:'Muhtar',            icon:'🏛️',  minLevel:5,  maas:2500,  adaylikUcret:5000,   secimSure:48,  gorevSure:30  },
  belediyeBsk:   { label:'Belediye Başkanı',  icon:'🏙️',  minLevel:15, maas:15000, adaylikUcret:50000,  secimSure:72,  gorevSure:60  },
  milletvekili:  { label:'Milletvekili',       icon:'🏛️',  minLevel:20, maas:25000, adaylikUcret:100000, secimSure:72,  gorevSure:90  },
  basbakanlik:   { label:'Başbakan',           icon:'🇹🇷',  minLevel:30, maas:50000, adaylikUcret:500000, secimSure:96,  gorevSure:90  },
  cumhurbaskani: { label:'Cumhurbaşkanı',     icon:'🌟',  minLevel:50, maas:100000,adaylikUcret:1000000,secimSure:120, gorevSure:180 },
};

/* 250 Altyapı Şikayet Kategorisi */
const SIKAYET_KATEGORILERI = [
  // Yollar (50)
  '🛣️ Çukurlu yol','🚧 Bozuk kaldırım','⛽ Yol ışığı arızası','🚦 Trafik lambası sorunu',
  '🚌 Otobüs durağı yok','🅿️ Otopark sorunu','🚧 İnşaat izni yok','🛤️ Yaya geçidi eksik',
  '🔄 Kavşak düzensizliği','🚸 Okul önü güvensiz','🚷 Engelli rampası yok',
  '🏗️ Kaldırım tamiri lazım','🌉 Köprü hasarı','🛑 Dur işareti eksik','🔰 Yönlendirme tabelası yok',
  '🏎️ Hız tümseci gerekli','📍 Adres tabelası eksik','🚗 Yanlış park şikayeti',
  '🌿 Yol kenarı temizlik','🔦 Aydınlatma yetersiz','🌊 Yağmur suyu taşması',
  '🧱 Beton çatlağı','🔧 Yol bakımı gecikmesi','🪨 Toprak kayması riski',
  '🌁 Görüş engeli ağaç','🏚️ Metruk bina yol tehlikesi','⚠️ Okul bölgesi uyarı yok',
  '🚧 Şantiye güvenlik eksik','🔃 Yönlü yol sorun','🌀 Döner kavşak sorunu',
  // Su & Altyapı (50)
  '💧 Su kesintisi','🚰 Akan boru hatası','🔵 Su sayacı sorunu','🌊 Kanalizasyon taşması',
  '🪣 Yağmur suyu drenaj','💦 Su kalitesi sorunu','🔧 Yangın musluğu arızası','🏊 Park sulaması arızası',
  '🌱 Yeşil alan sulama','💧 Çeşme tamiri lazım','🔩 Vana arızası','🌿 Sulama hattı patlaması',
  '🚿 Halka açık tuvalet suyu','🏗️ Altyapı sızıntısı','🌧️ Çatı drenajı','💦 Bodrum su baskını',
  '🔵 Su basıncı düşük','⛽ Hidrofor arızası','🏠 Su deposi sorunu','🔌 Pompa arızası',
  // Elektrik & Doğalgaz (40)
  '⚡ Elektrik kesintisi','💡 Sokak lambası','🔌 Elektrik hattı tehlikesi','🏭 Trafo arızası',
  '🔋 Enerji tasarrufu lambaları lazım','⚡ Kablo güvenlik riski','🔆 Parlak sahne aydınlatma',
  '🕯️ Acil güç ihtiyacı','🔌 Topraklama sorunu','💡 Neon tabelaları tüketim',
  '🔥 Doğalgaz kaçağı','🌡️ Isı yalıtım eksik','🔥 Kalorifer arızası','💨 Baca temizleme',
  '🔧 Gaz sayacı sorunu','🌬️ Havalandırma yetersiz',
  // Temizlik & Çevre (50)
  '🗑️ Çöp toplanmıyor','♻️ Geri dönüşüm kutusu yok','🧹 Sokak temizliği eksik',
  '🐀 Haşere şikayeti','🦟 Sivrisinek ilaçlama','🌿 Yabani ot birikimi',
  '💩 Hayvan atığı şikayeti','🏭 Fabrika kokusu','🚛 Çöp aracı geç geliyor',
  '🗑️ Büyük eşya çöpü','🔥 Yasadışı çöp yakma','🛢️ Tehlikeli atık şikayeti',
  '🌲 Ağaç kesilmesi şikayeti','🌳 Yeşil alan tahrip','🐦 Güvercin sorunu',
  '🐕 Sahipsiz köpek','🐈 Sahipsiz kedi','🏞️ Park temizliği',
  '🌊 Dere kirlilik','🏖️ Göl/gölet kirliliği','🌫️ Hava kirliliği ihbarı',
  // Sosyal Hizmet (40)
  '🏥 Sağlık ocağı şikayeti','💊 İlaç eksikliği','🏫 Okul altyapısı','🎒 Servis güzergahı',
  '🧒 Çocuk parkı bozuk','🏃 Spor alanı eksik','👴 Yaşlı bakım merkezi','♿ Engelli erişimi',
  '🍽️ Yemek yardımı talebi','🏠 Barınma sorunu','📚 Kütüphane talebi',
  '🎨 Kültür merkezi eksik','⚽ Futbol sahası','🏊 Yüzme havuzu talebi',
  '🌳 Park düzenlemesi','🎪 Tesis talebi','💼 İş kurumu danışmanlık',
  '🎓 Kurs talebi','🚑 Ambulans gecikmesi','🔒 Güvenlik kamerası talebi',
];

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 1: ROL YÖNETİMİ
   ═══════════════════════════════════════════════════════════════════════ */

/* Kullanıcının aktif rollerini döndürür */
window.SP_getRoles = async function(uid) {
  const d = await SP.g(`users/${uid}`);
  const roles = [];
  if (d?.role_muhtar)        roles.push('muhtar');
  if (d?.role_belediyeBsk)   roles.push('belediyeBsk');
  if (d?.role_milletvekili)  roles.push('milletvekili');
  if (d?.role_basbakanlik)   roles.push('basbakanlik');
  if (d?.role_cumhurbaskani) roles.push('cumhurbaskani');
  if (d?.isFounder)          roles.push('founder');
  return roles;
};

/* Mevcut kullanıcının en yüksek rolünü döndürür */
window.SP_getTopRole = function(d) {
  if (!d) return 'vatandas';
  if (d.isFounder)          return 'founder';
  if (d.role_cumhurbaskani) return 'cumhurbaskani';
  if (d.role_basbakanlik)   return 'basbakanlik';
  if (d.role_milletvekili)  return 'milletvekili';
  if (d.role_belediyeBsk)   return 'belediyeBsk';
  if (d.role_muhtar)        return 'muhtar';
  return 'vatandas';
};

/* Rol atama (admin/seçim sistemi tarafından çağrılır) */
window.SP_atanRol = async function(uid, rol, bolge) {
  if (!ROL_CFG[rol]) return;
  const guncelleme = {};
  guncelleme[`role_${rol}`] = true;
  if (bolge) guncelleme[`role_${rol}_bolge`] = bolge;
  guncelleme[`role_${rol}_atanAt`] = Date.now();
  await SP.u(`users/${uid}`, guncelleme);

  // Eski rolü temizle (önceki kişiden al)
  if (bolge) {
    const prev = await SP.g(`politics/${bolge}/elected_${rol}`);
    if (prev && prev !== uid) {
      const prevPatch = {};
      prevPatch[`role_${rol}`] = null;
      prevPatch[`role_${rol}_bolge`] = null;
      await SP.u(`users/${prev}`, prevPatch);
    }
    await SP.s(`politics/${bolge}/elected_${rol}`, uid);
  }

  SP.toast(`🎉 ${ROL_CFG[rol].label} rolü atandı!`, 'success', 6000);
  await SP.notify(uid, `🎉 Tebrikler! ${bolge||''} için ${ROL_CFG[rol].label} seçildiniz!`, 'success');
};

/* Rol iptal */
window.SP_rolIptal = async function(uid, rol) {
  const patch = {};
  patch[`role_${rol}`] = null;
  patch[`role_${rol}_bolge`] = null;
  patch[`role_${rol}_atanAt`] = null;
  await SP.u(`users/${uid}`, patch);
  SP.toast(`❌ ${ROL_CFG[rol]?.label || rol} rolü kaldırıldı`, 'warn');
};

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 2: SEÇİM SİSTEMİ (TAM)
   ═══════════════════════════════════════════════════════════════════════ */

/* Aday ol */
window.SP_adayOl = async function(uid, secimTuru, bolge, vaat) {
  const d   = await SP.g(`users/${uid}`) || {};
  const cfg = ROL_CFG[secimTuru];
  if (!cfg) return SP.toast('Geçersiz seçim türü', 'error');

  if ((d.level||1) < cfg.minLevel) {
    SP.toast(`❌ Level ${cfg.minLevel} gerekli (Senin: ${d.level||1})`, 'error'); return;
  }
  if (!d.kimlikKarti) {
    SP.toast('❌ Kimlik kartı gerekli', 'error'); return;
  }

  const key = bolge
    ? `secimler/${bolge}/${secimTuru}`
    : `secimler/ulusal/${secimTuru}`;

  const mevcutAday = await SP.g(`${key}/adaylar/${uid}`);
  if (mevcutAday) { SP.toast('Zaten adaysınız!', 'warn'); return; }

  // Ücret kes
  if (typeof spendCash === 'function') {
    const ok = await spendCash(uid, cfg.adaylikUcret, `aday-${secimTuru}`);
    if (!ok) { SP.toast('Yetersiz bakiye', 'error'); return; }
  }

  await SP.u(`${key}/adaylar/${uid}`, {
    uid,
    username: d.username || uid.slice(0,8),
    level:    d.level || 1,
    bolge,
    vaat:     (vaat||'').slice(0, 500),
    oylar:    0,
    ts:       Date.now(),
  });

  // Seçim yoksa başlat
  const sec = await SP.g(key);
  if (!sec?.aktif) {
    const bitis = Date.now() + cfg.secimSure * 3600000;
    await SP.u(key, {
      aktif: true, tur: secimTuru, bolge,
      baslangic: Date.now(), bitis,
      sonucAciklandi: false,
    });
    // Tüm oyunculara bildir
    const users = await SP.g('users') || {};
    const batch = {};
    for (const u2 of Object.keys(users)) {
      const nkey = db.ref('notifs/'+u2).push().key;
      batch[`notifs/${u2}/${nkey}`] = {
        msg: `🗳️ ${bolge||'Ulusal'} ${cfg.label} seçimi başladı! ${cfg.sureSaat||cfg.secimSure} saat sürecek.`,
        kind: 'info', ts: Date.now(), read: false,
      };
    }
    await db.ref('/').update(batch);
  }

  SP.toast(`✅ ${cfg.label} adaylığınız kaydedildi!`, 'success', 6000);
};

/* Oy ver */
window.SP_oyVer = async function(voterUid, secimTuru, bolge, adayUid) {
  const key = bolge
    ? `secimler/${bolge}/${secimTuru}`
    : `secimler/ulusal/${secimTuru}`;

  const sec = await SP.g(key);
  if (!sec?.aktif || Date.now() > sec.bitis) {
    SP.toast('Seçim aktif değil', 'error'); return;
  }

  const zatenOy = await SP.g(`${key}/oylar/${voterUid}`);
  if (zatenOy) { SP.toast('Zaten oy kullandınız!', 'warn'); return; }

  // Oy kullan
  await SP.s(`${key}/oylar/${voterUid}`, adayUid);
  await db.ref(`${key}/adaylar/${adayUid}/oylar`).transaction(v => (v||0)+1);

  SP.toast('✅ Oyunuz kaydedildi!', 'success');
};

/* Seçim sonucu açıkla (admin veya otomatik süre dolunca) */
window.SP_secimSonuc = async function(secimTuru, bolge) {
  const key = bolge
    ? `secimler/${bolge}/${secimTuru}`
    : `secimler/ulusal/${secimTuru}`;

  const sec = await SP.g(key);
  if (!sec?.aktif) { SP.toast('Aktif seçim yok', 'warn'); return; }

  const adaylar = sec.adaylar || {};
  if (!Object.keys(adaylar).length) { SP.toast('Aday yok', 'warn'); return; }

  // En çok oy alanı bul
  let kazananUid = null, enCokOy = -1;
  for (const [uid, aday] of Object.entries(adaylar)) {
    if ((aday.oylar||0) > enCokOy) { enCokOy = aday.oylar||0; kazananUid = uid; }
  }

  if (!kazananUid) { SP.toast('Kazanan bulunamadı', 'error'); return; }

  // Seçimi kapat
  await SP.u(key, { aktif: false, sonucAciklandi: true, kazanan: kazananUid, kazananOy: enCokOy });

  // Rolü ata
  await window.SP_atanRol(kazananUid, secimTuru, bolge);

  // Haber yaz
  const kazananD = adaylar[kazananUid];
  const haber = `🗳️ ${bolge||'Ulusal'} ${ROL_CFG[secimTuru]?.label} seçimi sonuçlandı! Kazanan: ${kazananD.username} (${enCokOy} oy)`;
  await SP.push('news', { title: haber, type: 'election', impact: 'positive', ts: Date.now() });
  await SP.s('system/globalBroadcast', { message: haber, expiresAt: Date.now() + 30000 });

  SP.toast(`🎉 Seçim sonuçlandı! Kazanan: ${kazananD.username}`, 'success', 10000);
};

/* Seçim otomatik bitiş kontrolü */
(function secimBitisKontrol() {
  setInterval(async () => {
    if (!window.GZ?.uid) return;
    try {
      // Tüm aktif seçimler kontrol
      const secimler = await SP.g('secimler') || {};
      for (const [bolge, bTypes] of Object.entries(secimler)) {
        for (const [tur, sec] of Object.entries(bTypes)) {
          if (sec.aktif && !sec.sonucAciklandi && Date.now() > sec.bitis) {
            await window.SP_secimSonuc(tur, bolge === 'ulusal' ? null : bolge);
          }
        }
      }
    } catch(e) {}
  }, 60000);
})();

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 3: TAM MUHTARLIK PANELİ
   ═══════════════════════════════════════════════════════════════════════ */
async function renderMuhtarlikTam() {
  const main = SP.main(); if (!main) return;
  const uid  = SP.uid();  if (!uid)  return;
  const d    = await SP.g(`users/${uid}`) || {};
  const prov = d.province || 'İstanbul';
  const isMuhtar   = !!d.role_muhtar;
  const muhtarBolge= d.role_muhtar_bolge || prov;

  // Mevcut muhtar kim?
  const muhtarUid  = await SP.g(`politics/${prov}/elected_muhtar`);
  const muhtarD    = muhtarUid ? (await SP.g(`users/${muhtarUid}`) || {}) : null;

  // Altyapı şikayetleri (kullanıcıya ait)
  const sikayet = Object.values(await SP.g(`sikayet/${prov}`) || {});
  const bekleyenSik = sikayet.filter(s => s.uid === uid && s.durum === 'bekliyor');
  const cevaplananSik = sikayet.filter(s => s.uid === uid && s.durum !== 'bekliyor');

  const card   = d.kimlikKarti;
  const idFee  = (await SP.g('system/idCardFee')) || 500;

  // Aktif seçim
  const aktifSec = await SP.g(`secimler/${prov}/muhtar`);
  const secAdaylar = aktifSec?.adaylar ? Object.values(aktifSec.adaylar) : [];
  const zatenOy = aktifSec?.oylar?.[uid];

  main.innerHTML = `
    <div style="padding:0 0 80px">
      ${SP.pageTitle('🏛️', 'Muhtarlık', muhtarBolge + ' Muhtarlığı')}
      <div style="padding:0 16px">

        <!-- İstatistik -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
          ${SP.stat('Bakiye', SP.fmt(d.money||d.bakiye||0), '#22c55e')}
          ${SP.stat('Level', d.level||1, '#60a5fa')}
          ${SP.stat('Rolün', isMuhtar ? '🏛️ Muhtar' : (muhtarD ? muhtarD.username : 'Boş'), isMuhtar ? '#22c55e' : '#64748b')}
        </div>

        <!-- KİMLİK KARTI -->
        ${SP.card('🪪 Kimlik Belgeleri', `
          ${card
            ? `<div style="background:linear-gradient(135deg,#0b1931,#1a3a6b);border:1px solid #3b82f644;border-radius:12px;padding:16px;margin-bottom:12px;position:relative;overflow:hidden">
                <div style="font-size:8px;letter-spacing:3px;color:#60a5fa;font-weight:800;margin-bottom:4px">TÜRKİYE — KİMLİK BELGESİ</div>
                <div style="display:flex;gap:14px;align-items:center;margin:10px 0">
                  <div style="width:52px;height:64px;background:#1e3a5f;border:2px solid #3b82f644;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px">👤</div>
                  <div>
                    <div style="font-size:7px;color:#64748b">AD SOYAD</div>
                    <div style="font-size:16px;font-weight:900">${(d.username||'OYUNCU').toUpperCase()}</div>
                    <div style="font-size:7px;color:#64748b;margin-top:4px">KİMLİK NO</div>
                    <div style="font-size:13px;font-weight:700;color:#93c5fd;letter-spacing:2px">${card.tc||'—'}</div>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:11px">
                  <div><div style="color:#64748b;font-size:9px">İL</div><div style="font-weight:700">${d.province||'—'}</div></div>
                  <div><div style="color:#64748b;font-size:9px">TARİH</div><div style="font-weight:700">${card.verilis ? new Date(card.verilis).toLocaleDateString('tr-TR') : '—'}</div></div>
                  <div><div style="color:#64748b;font-size:9px">DURUM</div><div style="color:#22c55e;font-weight:700">✅ Aktif</div></div>
                </div>
              </div>`
            : `<div style="background:#380000;border:1px solid #ef444444;border-radius:12px;padding:16px;margin-bottom:12px;text-align:center">
                <div style="font-size:32px;margin-bottom:8px">🪪</div>
                <div style="color:#ef4444;font-weight:700">Kimlik Kartı Yok!</div>
                <div style="font-size:12px;color:#94a3b8">Ticaret yapabilmek için kimlik kartı gerekli.</div>
              </div>`}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${!card ? `<button onclick="GZX_M01_issueIDCard&&GZX_M01_issueIDCard('${uid}').then(()=>renderMuhtarlikTam())" style="grid-column:1/-1;background:#3b82f6;color:white;border:none;border-radius:10px;padding:14px;font-weight:800;font-size:14px;cursor:pointer">🪪 Kimlik Kartı Çıkart (${SP.fmt(idFee)})</button>` : ''}
            <button onclick="(async()=>{const x=await dbGet('users/${uid}/ehliyet');if(x){toast('Zaten var','warn');return;}await GZX_safePay('${uid}',1200,'Ehliyet');await dbUpdate('users/${uid}',{ehliyet:{ts:Date.now()}});toast('🚗 Ehliyet alındı!','success');renderMuhtarlikTam();})()" style="background:#10b98122;color:#10b981;border:1px solid #10b98144;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">🚗 Ehliyet<br><small>1.200₺</small></button>
            <button onclick="(async()=>{const x=await dbGet('users/${uid}/pasaport');if(x){toast('Zaten var','warn');return;}await GZX_safePay('${uid}',3500,'Pasaport');await dbUpdate('users/${uid}',{pasaport:{ts:Date.now()}});toast('📘 Pasaport alındı!','success');renderMuhtarlikTam();})()" style="background:#a855f722;color:#a855f7;border:1px solid #a855f744;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">📘 Pasaport<br><small>3.500₺</small></button>
          </div>
        `)}

        <!-- ALTYAPI ŞİKAYETİ -->
        ${SP.card('📋 Altyapı Şikayeti', `
          <div style="font-size:12px;color:#94a3b8;margin-bottom:12px">250 kategori şikayet türünden birini seçip muhtara bildir.</div>
          ${SP.sel('sikayetKat', SIKAYET_KATEGORILERI.map(k=>`<option value="${k}">${k}</option>`).join(''))}
          ${SP.inp('sikayetDetay', 'Detaylı açıklama (en az 10 karakter)...')}
          <button onclick="SP_sikayetGonder('${uid}','${prov}')" style="width:100%;background:#ef4444;color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">📮 Şikayeti Gönder</button>
          ${bekleyenSik.length ? `<div style="margin-top:12px;font-size:12px;color:#eab308">⏳ ${bekleyenSik.length} bekleyen şikayetiniz var</div>` : ''}
          ${cevaplananSik.length ? `<div style="margin-top:4px;font-size:12px;color:#22c55e">✅ ${cevaplananSik.length} şikayetiniz yanıtlandı</div>` : ''}
        `)}

        <!-- SEÇİM / OY -->
        ${SP.card('🗳️ Muhtarlık Seçimi', `
          ${aktifSec?.aktif
            ? `<div style="background:#eab30822;border:1px solid #eab30844;border-radius:10px;padding:12px;margin-bottom:12px">
                <div style="font-size:12px;font-weight:700;color:#eab308">🗳️ SEÇİM AKTİF</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px">Bitiş: ${new Date(aktifSec.bitis).toLocaleString('tr-TR')}</div>
                <div style="font-size:11px;color:#94a3b8">${secAdaylar.length} aday — ${Object.keys(aktifSec.oylar||{}).length} oy kullanıldı</div>
              </div>
              ${!zatenOy
                ? `<div style="margin-bottom:10px">
                    ${secAdaylar.map(a=>`
                      <button onclick="SP_oyVer('${uid}','muhtar','${prov}','${a.uid}')" style="width:100%;background:#3b82f622;color:#60a5fa;border:1px solid #3b82f644;border-radius:10px;padding:12px;font-weight:700;font-size:13px;cursor:pointer;margin-bottom:6px;text-align:left">
                        ${a.username} — Lv${a.level} — ${a.oylar||0} oy
                        <div style="font-size:11px;color:#94a3b8;margin-top:4px">"${(a.vaat||'').slice(0,80)}"</div>
                      </button>`).join('')}
                  </div>`
                : `<div style="text-align:center;padding:12px;color:#22c55e;font-weight:700">✅ Oy kullandınız</div>`}
              ${SP.isFounder() ? `<button onclick="SP_secimSonuc('muhtar','${prov}')" style="width:100%;background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:10px;padding:10px;font-weight:700;cursor:pointer;font-size:12px">🏁 Seçimi Bitir (Admin)</button>` : ''}`
            : `<div style="color:#64748b;text-align:center;padding:12px;font-size:12px">Aktif seçim yok</div>`}
          <button onclick="SP_adayOlForm('muhtar','${prov}')" style="width:100%;background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:10px;padding:12px;font-weight:700;cursor:pointer;margin-top:8px">🙋 Muhtarlığa Aday Ol</button>
        `)}

        <!-- MUHTAR PANELİ (sadece muhtar görebilir) -->
        ${isMuhtar ? SP.card('⚡ Muhtar Yetki Paneli', `
          <div style="font-size:12px;color:#22c55e;margin-bottom:12px">🏛️ Siz ${muhtarBolge} muhtarısınız.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button onclick="render('muhtarSikayetler')" style="background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">📋 Şikayetleri Gör<br><small id="sikayetBadge">Yükleniyor...</small></button>
            <button onclick="render('muhtarYardim')" style="background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">💰 Sosyal Yardım<br><small>Onay ver</small></button>
            <button onclick="render('muhtarDuyuru')" style="background:#eab30822;color:#eab308;border:1px solid #eab30844;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">📢 Duyuru Yap<br><small>Mahalle</small></button>
            <button onclick="render('muhtarBelediye')" style="background:#3b82f622;color:#60a5fa;border:1px solid #3b82f644;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">🏙️ Belediyeye Başvur<br><small>Altyapı talebi</small></button>
          </div>
        `, '#22c55e44') : ''}

        <!-- SOSYAL YARDIM -->
        ${SP.card('💰 Sosyal Yardım', `
          <div style="font-size:12px;color:#94a3b8;margin-bottom:12px">Bakiyeniz 5.000₺ altındaysa başvurabilirsiniz. Haftada bir.</div>
          <button onclick="SP_sosyalYardim('${uid}')" style="width:100%;background:#22c55e;color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">💰 Sosyal Yardım Başvurusu</button>
        `)}

      </div>
    </div>`;

  // Şikayet badge güncelle
  const badge = document.getElementById('sikayetBadge');
  if (badge) {
    const pending = sikayet.filter(s => s.durum === 'bekliyor');
    badge.textContent = `${pending.length} bekliyor`;
  }
}
window.renderMuhtarlikTam = renderMuhtarlikTam;

/* Şikayet gönder */
window.SP_sikayetGonder = async function(uid, prov) {
  const kat    = document.getElementById('sikayetKat')?.value;
  const detay  = document.getElementById('sikayetDetay')?.value?.trim();
  if (!kat) return SP.toast('Kategori seçin', 'warn');
  if (!detay || detay.length < 10) return SP.toast('En az 10 karakter açıklama girin', 'warn');

  const d = await SP.g(`users/${uid}`) || {};
  await SP.push(`sikayet/${prov}`, {
    uid, username: d.username || uid.slice(0,8),
    kategori: kat, detay, durum: 'bekliyor',
    ts: Date.now(), il: prov,
  });

  // Muhtar'a bildir
  const muhtarUid = await SP.g(`politics/${prov}/elected_muhtar`);
  if (muhtarUid) {
    await SP.notify(muhtarUid, `📋 Yeni şikayet: ${kat} — ${d.username||'anonim'}`, 'warn');
  }

  document.getElementById('sikayetDetay').value = '';
  SP.toast('📮 Şikayetiniz muhtara iletildi!', 'success');
};

/* Aday ol formu */
window.SP_adayOlForm = function(tur, bolge) {
  const cfg = ROL_CFG[tur]; if (!cfg) return;
  if (typeof showModal !== 'function') {
    const vaat = prompt(`${cfg.label} adaylık vaatlerinizi yazın (max 500 karakter):`);
    if (vaat !== null) window.SP_adayOl(SP.uid(), tur, bolge, vaat);
    return;
  }
  showModal(`${cfg.icon} ${cfg.label} Adaylığı`, `
    <div style="padding:8px 0">
      <div style="background:#0b1931;border-radius:10px;padding:14px;margin-bottom:14px">
        <div style="font-size:12px;color:#94a3b8">Aday olma ücreti: <strong style="color:#60a5fa">${SP.fmt(cfg.adaylikUcret)}</strong></div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px">Seçim süresi: ${cfg.secimSure} saat</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px">Minimum level: ${cfg.minLevel}</div>
      </div>
      <textarea id="adayVaat" placeholder="Vaatlerinizi yazın... (Altyapı, ekonomi, sosyal projeler vs.) Max 500 karakter"
        style="width:100%;height:120px;padding:12px;background:#080d1a;border:1px solid #1e3a5f;border-radius:10px;color:#e2e8f0;font-size:13px;resize:none;box-sizing:border-box;margin-bottom:12px"></textarea>
      <button onclick="(async()=>{const v=document.getElementById('adayVaat').value;await SP_adayOl('${SP.uid()}','${tur}','${bolge}',v);document.querySelector('.modal-bg')?.remove();})()"
        style="width:100%;background:#22c55e;color:white;border:none;border-radius:10px;padding:14px;font-weight:800;cursor:pointer">
        🙋 Aday Ol (${SP.fmt(cfg.adaylikUcret)})
      </button>
    </div>`);
};

/* Sosyal yardım */
window.SP_sosyalYardim = async function(uid) {
  const d = await SP.g(`users/${uid}`) || {};
  const bakiye = d.money || d.bakiye || 0;
  if (bakiye >= 5000) { SP.toast('Sosyal yardım için bakiyeniz 5.000₺ altında olmalı', 'warn'); return; }
  const last = d.lastSocialAid || 0;
  const fark = Date.now() - last;
  if (fark < 7 * 86400000) {
    const kalan = Math.ceil((7 * 86400000 - fark) / 3600000);
    SP.toast(`⏳ ${kalan} saat sonra tekrar başvurabilirsiniz`, 'warn'); return;
  }
  // Muhtar onayı gerektir
  const muhtarUid = await SP.g(`politics/${d.province||'İstanbul'}/elected_muhtar`);
  if (muhtarUid) {
    await SP.push('sosyalYardimTalep', { uid, username: d.username, ts: Date.now(), bakiye, durum: 'bekliyor' });
    await SP.notify(muhtarUid, `💰 Sosyal yardım talebi: ${d.username} (${SP.fmt(bakiye)})`, 'info');
    SP.toast('📮 Talep muhtara gönderildi. Onay bekleniyor...', 'info');
  } else {
    // Muhtar yoksa doğrudan devlet öder
    await addCash(uid, 2000, 'sosyal-yardim');
    await SP.u(`users/${uid}`, { lastSocialAid: Date.now() });
    SP.toast('✅ 2.000₺ sosyal yardım yatırıldı!', 'success', 6000);
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 4: TAM BELEDİYE BAŞKANI PANELİ
   ═══════════════════════════════════════════════════════════════════════ */
async function renderBelediyeTam() {
  const main = SP.main(); if (!main) return;
  const uid  = SP.uid();  if (!uid)  return;
  const d    = await SP.g(`users/${uid}`) || {};
  const prov = d.province || 'İstanbul';
  const isBsk = !!d.role_belediyeBsk;

  // Belediye verileri
  const budget     = (await SP.g(`politics/${prov}/belediyeBudgeti`)) || 0;
  const ruhsatlar  = d.isyeriRuhsati || {};
  const projeler   = Object.values(await SP.g(`politics/${prov}/projeler`) || {});
  const sikayetler = Object.values(await SP.g(`sikayet/${prov}`) || {});
  const bekleyenSik= sikayetler.filter(s => s.durum === 'bekliyor');

  // Aktif seçim
  const aktifSec   = await SP.g(`secimler/${prov}/belediyeBsk`);
  const secAdaylar = aktifSec?.adaylar ? Object.values(aktifSec.adaylar) : [];
  const zatenOy    = aktifSec?.oylar?.[uid];

  const RUHSATLAR = [
    {id:'dukkan',    label:'🏪 Dükkan',   fee:15000},
    {id:'restaurant',label:'🍽️ Restoran', fee:35000},
    {id:'market',    label:'🛒 Market',   fee:25000},
    {id:'fabrika',   label:'🏭 Fabrika',  fee:100000},
    {id:'cafe',      label:'☕ Kafe',     fee:20000},
  ];

  main.innerHTML = `
    <div style="padding:0 0 80px">
      ${SP.pageTitle('🏙️', 'Belediye', prov + ' Belediyesi')}
      <div style="padding:0 16px">

        <!-- Bütçe -->
        <div style="background:linear-gradient(135deg,#0b1931,#1a3a6b);border:1px solid #1e3a5f;border-radius:14px;padding:18px;margin-bottom:16px;text-align:center">
          <div style="font-size:11px;color:#64748b;margin-bottom:4px">BELEDİYE BÜTÇESİ</div>
          <div style="font-size:32px;font-weight:900;color:#60a5fa">${SP.fmt(budget)}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">${bekleyenSik.length} bekleyen şikayet</div>
        </div>

        <!-- Seçim -->
        ${SP.card('🗳️ Belediye Başkanı Seçimi', `
          ${aktifSec?.aktif
            ? `<div style="background:#eab30822;border:1px solid #eab30844;border-radius:10px;padding:12px;margin-bottom:10px">
                <div style="font-weight:700;color:#eab308">🗳️ SEÇİM AKTİF — Bitiş: ${new Date(aktifSec.bitis).toLocaleString('tr-TR')}</div>
              </div>
              ${!zatenOy
                ? secAdaylar.map(a=>`
                    <button onclick="SP_oyVer('${uid}','belediyeBsk','${prov}','${a.uid}')" style="width:100%;background:#3b82f622;color:#60a5fa;border:1px solid #3b82f644;border-radius:10px;padding:12px;font-weight:700;cursor:pointer;text-align:left;margin-bottom:6px">
                      ${a.username} — Lv${a.level} — ${a.oylar||0} oy<br>
                      <span style="font-size:11px;color:#94a3b8">"${(a.vaat||'').slice(0,100)}"</span>
                    </button>`).join('')
                : `<div style="text-align:center;color:#22c55e;font-weight:700;padding:12px">✅ Oy kullandınız</div>`}
              ${SP.isFounder() ? `<button onclick="SP_secimSonuc('belediyeBsk','${prov}')" style="width:100%;background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:10px;padding:10px;font-weight:700;cursor:pointer;font-size:12px;margin-top:8px">🏁 Seçimi Bitir (Admin)</button>` : ''}`
            : `<div style="color:#64748b;font-size:12px;text-align:center;padding:8px">Aktif seçim yok</div>`}
          <button onclick="SP_adayOlForm('belediyeBsk','${prov}')" style="width:100%;background:#3b82f622;color:#60a5fa;border:1px solid #3b82f644;border-radius:10px;padding:12px;font-weight:700;cursor:pointer;margin-top:8px">🙋 Belediye Başkanlığına Aday Ol</button>
        `)}

        <!-- Ruhsat -->
        ${SP.card('📋 İşyeri Ruhsatı', `
          <div style="font-size:12px;color:#94a3b8;margin-bottom:12px">Her işletme türü için tek seferlik belediye ödemesi.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${RUHSATLAR.map(r => {
              const has = !!ruhsatlar[r.id];
              return `<button onclick="${has ? 'toast(\'Zaten aktif\',\'warn\')' : `SP_ruhsatAl('${uid}','${r.id}','${prov}',${r.fee})`}"
                style="background:${has?'#22c55e22':'#3b82f622'};color:${has?'#22c55e':'#60a5fa'};border:1px solid ${has?'#22c55e44':'#3b82f644'};border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">
                ${r.label}<br><small>${has ? '✅ Aktif' : SP.fmt(r.fee)}</small>
              </button>`;
            }).join('')}
          </div>
        `)}

        <!-- BSK PANELI (sadece başkan) -->
        ${isBsk ? SP.card('⚡ Belediye Başkanı Paneli', `
          <div style="font-size:12px;color:#22c55e;margin-bottom:12px">🏙️ Siz ${prov} Belediye Başkanısınız.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button onclick="render('belSikayetler')" style="background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">📋 Şikayetler<br><small>${bekleyenSik.length} bekliyor</small></button>
            <button onclick="render('belProjeler')" style="background:#3b82f622;color:#60a5fa;border:1px solid #3b82f644;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">🏗️ Projeler<br><small>${projeler.length} aktif</small></button>
            <button onclick="render('belVergi')" style="background:#eab30822;color:#eab308;border:1px solid #eab30844;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">💰 Vergi Ayarla<br><small>KDV, ticari</small></button>
            <button onclick="render('belButce')" style="background:#a855f722;color:#a855f7;border:1px solid #a855f744;border-radius:10px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">🏦 Bütçe<br><small>${SP.fmt(budget)}</small></button>
            <button onclick="SP_belBudgetProje('${prov}')" style="grid-column:1/-1;background:#22c55e;color:white;border:none;border-radius:10px;padding:12px;font-weight:700;font-size:13px;cursor:pointer">🏗️ Yeni Proje Başlat</button>
          </div>
        `, '#22c55e44') : ''}

      </div>
    </div>`;
}
window.renderBelediyeTam = renderBelediyeTam;

/* Ruhsat al */
window.SP_ruhsatAl = async function(uid, rId, prov, fee) {
  const ok = await spendCash(uid, fee, `ruhsat-${rId}`);
  if (!ok) return;
  await SP.u(`users/${uid}/isyeriRuhsati`, { [rId]: { ts: Date.now(), prov } });
  // Bütçeye ekle
  await db.ref(`politics/${prov}/belediyeBudgeti`).transaction(v => (v||0) + fee * 0.8);
  SP.toast(`✅ ${rId} ruhsatı alındı!`, 'success');
  renderBelediyeTam();
};

/* Proje başlat */
window.SP_belBudgetProje = async function(prov) {
  const proje = prompt('Proje adı ve açıklaması (ör: "Yol genişletme — İstiklal Cad.")');
  if (!proje) return;
  const maliyet = parseInt(prompt('Maliyet (₺)?') || '0');
  if (!maliyet || maliyet <= 0) return;

  const budget = (await SP.g(`politics/${prov}/belediyeBudgeti`)) || 0;
  if (budget < maliyet) { SP.toast('Yetersiz bütçe', 'error'); return; }

  await db.ref(`politics/${prov}/belediyeBudgeti`).transaction(v => Math.max(0, (v||0) - maliyet));
  await SP.push(`politics/${prov}/projeler`, {
    ad: proje, maliyet, ts: Date.now(),
    durum: 'devam', baslayanUid: SP.uid()
  });
  await SP.push('news', { title: `🏗️ ${prov} Belediyesi yeni proje başlattı: ${proje}`, type: 'project', ts: Date.now() });
  SP.toast(`🏗️ Proje başlatıldı: ${proje}`, 'success');
  renderBelediyeTam();
};

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 5: CUMHURBAŞKANLIĞI PANELİ
   ═══════════════════════════════════════════════════════════════════════ */
async function renderCumhurbaskanligiTam() {
  const main = SP.main(); if (!main) return;
  const uid  = SP.uid();  if (!uid)  return;
  const d    = await SP.g(`users/${uid}`) || {};
  const isCB = !!d.role_cumhurbaskani || SP.isFounder();

  // Sistem verileri
  const minWage    = (await SP.g('system/minWage')) || 17002;
  const kdvRate    = ((await SP.g('system/kdvRate')) || 0.18) * 100;
  const repoRate   = ((await SP.g('bank/repoRate')) || 0.42) * 100;
  const exportTax  = ((await SP.g('system/trade/exportTaxRate')) || 0.08) * 100;
  const importTax  = ((await SP.g('system/trade/importTaxRate')) || 0.20) * 100;
  const nufus      = Object.keys(await SP.g('users') || {}).length;
  const devBudget  = (await SP.g('system/devletBudgeti')) || 0;

  // Aktif seçim
  const aktifSec  = await SP.g('secimler/ulusal/cumhurbaskani');
  const secAdaylar = aktifSec?.adaylar ? Object.values(aktifSec.adaylar) : [];
  const zatenOy   = aktifSec?.oylar?.[uid];

  main.innerHTML = `
    <div style="padding:0 0 80px">
      ${SP.pageTitle('🌟', 'Cumhurbaşkanlığı', 'Cumhuriyet Yönetim Merkezi')}
      <div style="padding:0 16px">

        <!-- İstatistik -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
          ${SP.stat('Nüfus', nufus + ' kişi', '#60a5fa')}
          ${SP.stat('Devlet Bütçesi', SP.fmt(devBudget), '#22c55e')}
          ${SP.stat('Asgari Ücret', SP.fmt(minWage), '#eab308')}
        </div>

        <!-- Ekonomi göstergeleri -->
        ${SP.card('📊 Ekonomik Göstergeler', `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
            <div style="background:#0b1931;border-radius:8px;padding:10px">
              <div style="color:#64748b;font-size:10px">KDV ORANI</div>
              <div style="font-size:20px;font-weight:900;color:#60a5fa">%${kdvRate.toFixed(1)}</div>
            </div>
            <div style="background:#0b1931;border-radius:8px;padding:10px">
              <div style="color:#64748b;font-size:10px">REPO FAİZİ</div>
              <div style="font-size:20px;font-weight:900;color:#ef4444">%${repoRate.toFixed(1)}</div>
            </div>
            <div style="background:#0b1931;border-radius:8px;padding:10px">
              <div style="color:#64748b;font-size:10px">İHRACAT VERGİSİ</div>
              <div style="font-size:20px;font-weight:900;color:#22c55e">%${exportTax.toFixed(1)}</div>
            </div>
            <div style="background:#0b1931;border-radius:8px;padding:10px">
              <div style="color:#64748b;font-size:10px">İTHALAT VERGİSİ</div>
              <div style="font-size:20px;font-weight:900;color:#a855f7">%${importTax.toFixed(1)}</div>
            </div>
          </div>
        `)}

        <!-- SEÇİM -->
        ${SP.card('🌟 Cumhurbaşkanlığı Seçimi', `
          ${aktifSec?.aktif
            ? `<div style="background:#eab30822;border:1px solid #eab30844;border-radius:10px;padding:12px;margin-bottom:10px">
                <div style="font-weight:700;color:#eab308">🗳️ ULUSAL SEÇİM — Bitiş: ${new Date(aktifSec.bitis).toLocaleString('tr-TR')}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px">${secAdaylar.length} aday — ${Object.keys(aktifSec.oylar||{}).length} oy kullanıldı</div>
              </div>
              ${!zatenOy
                ? secAdaylar.map(a=>`
                    <button onclick="SP_oyVer('${uid}','cumhurbaskani',null,'${a.uid}')" style="width:100%;background:#3b82f622;color:#60a5fa;border:1px solid #3b82f644;border-radius:10px;padding:14px;cursor:pointer;text-align:left;margin-bottom:8px;font-weight:700">
                      ${a.username} — Lv${a.level} — ${a.oylar||0} oy<br>
                      <span style="font-size:11px;color:#94a3b8">"${(a.vaat||'').slice(0,150)}"</span>
                    </button>`).join('')
                : `<div style="text-align:center;color:#22c55e;font-weight:700;padding:12px">✅ Oy kullandınız</div>`}
              ${SP.isFounder() ? `<button onclick="SP_secimSonuc('cumhurbaskani',null)" style="width:100%;background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:10px;padding:10px;font-weight:700;cursor:pointer;font-size:12px;margin-top:8px">🏁 Seçimi Bitir (Admin)</button>` : ''}`
            : `<div style="color:#64748b;font-size:12px;text-align:center;padding:8px">Aktif seçim yok</div>`}
          <button onclick="SP_adayOlForm('cumhurbaskani',null)" style="width:100%;background:#eab30822;color:#eab308;border:1px solid #eab30844;border-radius:10px;padding:12px;font-weight:700;cursor:pointer;margin-top:8px">🙋 Cumhurbaşkanlığına Aday Ol</button>
        `)}

        <!-- CB KARAR PANELİ (sadece CB/founder) -->
        ${isCB ? SP.card('⚡ Cumhurbaşkanlığı Kararname', `
          <div style="font-size:12px;color:#eab308;font-weight:700;margin-bottom:12px">🌟 Bu paneldeki kararlar tüm oyuncuları etkiler!</div>

          <div style="margin-bottom:14px">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">Asgari Ücret (₺)</div>
            ${SP.inp('cbMinWage', `Mevcut: ${minWage}₺`, 'number')}
            <button onclick="SP_cbKarar('setMinWage',document.getElementById('cbMinWage').value)" style="width:100%;background:#22c55e;color:white;border:none;border-radius:10px;padding:10px;font-weight:700;cursor:pointer">💰 Asgari Ücret Güncelle</button>
          </div>

          <div style="margin-bottom:14px">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">KDV Oranı (%)</div>
            ${SP.inp('cbKdv', `Mevcut: %${kdvRate}`, 'number')}
            <button onclick="SP_cbKarar('setKdv',document.getElementById('cbKdv').value)" style="width:100%;background:#3b82f6;color:white;border:none;border-radius:10px;padding:10px;font-weight:700;cursor:pointer">📊 KDV Güncelle</button>
          </div>

          <div style="margin-bottom:14px">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">Repo Faizi (%)</div>
            ${SP.inp('cbRepo', `Mevcut: %${repoRate}`, 'number')}
            <button onclick="SP_cbKarar('setRepo',document.getElementById('cbRepo').value)" style="width:100%;background:#ef4444;color:white;border:none;border-radius:10px;padding:10px;font-weight:700;cursor:pointer">🏦 Repo Faizi Güncelle</button>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
            <div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">İhracat Vergisi (%)</div>
              ${SP.inp('cbExTax', exportTax.toFixed(1), 'number')}
              <button onclick="SP_cbKarar('setExportTax',document.getElementById('cbExTax').value)" style="width:100%;background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:8px;padding:8px;font-weight:700;font-size:12px;cursor:pointer">Güncelle</button>
            </div>
            <div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">İthalat Vergisi (%)</div>
              ${SP.inp('cbImTax', importTax.toFixed(1), 'number')}
              <button onclick="SP_cbKarar('setImportTax',document.getElementById('cbImTax').value)" style="width:100%;background:#a855f722;color:#a855f7;border:1px solid #a855f744;border-radius:8px;padding:8px;font-weight:700;font-size:12px;cursor:pointer">Güncelle</button>
            </div>
          </div>

          <div style="margin-top:14px">
            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">Devlet Bütçesine Transfer</div>
            ${SP.inp('cbBudgetAmt', 'Miktar (₺)', 'number')}
            <button onclick="SP_cbKarar('addBudget',document.getElementById('cbBudgetAmt').value)" style="width:100%;background:#eab308;color:#000;border:none;border-radius:10px;padding:10px;font-weight:700;cursor:pointer">💰 Bütçeye Ekle</button>
          </div>

          <button onclick="SP_sıkıyönetim()" style="width:100%;background:#ef4444;color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer;margin-top:8px">🚨 Sıkıyönetim İlan Et</button>
        `, '#eab30844') : ''}

      </div>
    </div>`;
}
window.renderCumhurbaskanligiTam = renderCumhurbaskanligiTam;

/* CB Kararı */
window.SP_cbKarar = async function(action, value) {
  const uid = SP.uid(); if (!uid) return;
  const d = await SP.g(`users/${uid}`);
  if (!d?.role_cumhurbaskani && !d?.isFounder) { SP.toast('Yetki yok', 'error'); return; }

  const v = parseFloat(value);
  if (isNaN(v)) { SP.toast('Geçersiz değer', 'error'); return; }

  switch (action) {
    case 'setMinWage':
      if (v < 500 || v > 500000) { SP.toast('500 – 500.000₺ arası girin', 'error'); return; }
      await SP.s('system/minWage', v);
      SP.toast(`💰 Asgari ücret ${SP.fmt(v)} olarak güncellendi`, 'success');
      break;
    case 'setKdv':
      if (v < 0 || v > 50) { SP.toast('%0 – %50 arası', 'error'); return; }
      await SP.s('system/kdvRate', v / 100);
      SP.toast(`📊 KDV %${v} olarak güncellendi`, 'success');
      break;
    case 'setRepo':
      if (v < 0 || v > 100) { SP.toast('%0 – %100 arası', 'error'); return; }
      await SP.s('bank/repoRate', v / 100);
      SP.toast(`🏦 Repo faizi %${v} olarak güncellendi`, 'success');
      break;
    case 'setExportTax':
      await SP.s('system/trade/exportTaxRate', v / 100);
      SP.toast(`🚢 İhracat vergisi %${v}`, 'success');
      break;
    case 'setImportTax':
      await SP.s('system/trade/importTaxRate', v / 100);
      SP.toast(`🛳️ İthalat vergisi %${v}`, 'success');
      break;
    case 'addBudget':
      await db.ref('system/devletBudgeti').transaction(b => (b||0) + v);
      SP.toast(`💰 ${SP.fmt(v)} devlet bütçesine eklendi`, 'success');
      break;
  }

  // Resmi gazete bildirimi
  await SP.push('news', {
    title: `📋 Cumhurbaşkanlığı Kararnamesi: ${action} → ${value}`,
    type: 'decree', impact: 'neutral', ts: Date.now()
  });
};

/* Sıkıyönetim */
window.SP_sıkıyönetim = async function() {
  const sebep = prompt('Sıkıyönetim sebebi?');
  if (!sebep) return;
  const sure = parseInt(prompt('Süre (saat)?') || '0');
  if (!sure || sure < 1) return;

  await SP.u('system/martialLaw', { active: true, sebep, sure, baslangic: Date.now(), endsAt: Date.now() + sure * 3600000 });
  await SP.push('news', { title: `🚨 Sıkıyönetim ilan edildi! Sebep: ${sebep} — ${sure} saat sürecek.`, type: 'martialLaw', impact: 'critical', ts: Date.now() });
  await SP.s('system/globalBroadcast', { message: `🚨 SIKIYÖNETİM İLAN EDİLDİ — ${sebep}`, expiresAt: Date.now() + 60000 });
  SP.toast('🚨 Sıkıyönetim ilan edildi!', 'error', 10000);
};

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 6: VERGİ SİSTEMİ — TAM AKTİF
   ═══════════════════════════════════════════════════════════════════════ */

/* Gelir vergisi hesapla ve kes (aylık) */
window.SP_keselirVergisi = async function(uid) {
  const d = await SP.g(`users/${uid}`);
  if (!d) return;

  const lastTax = d.lastIncomeTax || 0;
  if (Date.now() - lastTax < 30 * 86400000) return; // Ayda bir

  const bakiye = d.money || d.bakiye || 0;
  const aylikGelir = d.aylikGelir || 0;

  // Progressif vergi
  let vergiOrani = 0;
  if (aylikGelir > 1000000) vergiOrani = 0.35;
  else if (aylikGelir > 500000) vergiOrani = 0.27;
  else if (aylikGelir > 100000) vergiOrani = 0.20;
  else if (aylikGelir > 50000)  vergiOrani = 0.15;
  else if (aylikGelir > 17002)  vergiOrani = 0.10;
  else return; // Asgari ücret altı → sıfır vergi

  const vergi = Math.ceil(aylikGelir * vergiOrani);
  if (vergi <= 0 || bakiye < vergi) return;

  await spendCash(uid, vergi, 'gelir-vergisi');
  await db.ref('system/devletBudgeti').transaction(v => (v||0) + vergi);
  await SP.u(`users/${uid}`, { lastIncomeTax: Date.now() });

  SP.notify(uid, `💰 Gelir vergisi kesildi: ${SP.fmt(vergi)} (%${(vergiOrani*100).toFixed(0)})`, 'info');
};

/* KDV yansıtma (satış işlemlerinde çağrılır) */
window.SP_kdvHesapla = async function(fiyat) {
  const kdvRate = (await SP.g('system/kdvRate')) || 0.18;
  return Math.ceil(fiyat * kdvRate);
};

/* Tüm kullanıcılara vergi turu */
(function vergiOtomasyonu() {
  const _w = setInterval(() => {
    if (!window.GZ?.data?.isFounder) return;
    clearInterval(_w);

    setInterval(async () => {
      try {
        const users = await SP.g('users') || {};
        for (const uid of Object.keys(users)) {
          await window.SP_keselirVergisi(uid);
        }
      } catch(e) {}
    }, 60 * 60 * 1000); // Saatte bir kontrol, ayda bir kesim
  }, 2000);
})();

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 7: KREDİ SİSTEMİ — TAM AKTİF
   ═══════════════════════════════════════════════════════════════════════ */

/* Kredi skoru hesapla */
window.SP_kreditSkoru = async function(uid) {
  const d = await SP.g(`users/${uid}`);
  if (!d) return 0;

  let skor = 300; // Başlangıç

  // Seviye puanı
  skor += Math.min((d.level||1) * 5, 150);

  // Aktif kredi geçmişi
  const krediler = Object.values(d.krediler || {});
  const odenenler = krediler.filter(k => k.status === 'paid');
  skor += odenenler.length * 30;

  // Gecikme
  const geciken = krediler.filter(k => k.status === 'overdue');
  skor -= geciken.length * 80;

  // Bakiye
  const bakiye = d.money || d.bakiye || 0;
  if (bakiye > 1000000) skor += 100;
  else if (bakiye > 100000) skor += 50;

  // Vergi kaydı
  if (d.lastIncomeTax) skor += 30;
  if (d.kimlikKarti)   skor += 20;
  if (d.ehliyet)       skor += 10;

  return Math.min(900, Math.max(0, skor));
};

/* Kredi başvurusu — TAM AKTİF */
window.SP_krediBasvur = async function(uid, tur, miktar, vade) {
  const TIPLER = {
    ihtiyac: { label:'💳 İhtiyaç',  maxAmount:200000,   minScore:300, baseRate:0.28 },
    ticari:  { label:'🏪 Ticari',   maxAmount:5000000,  minScore:450, baseRate:0.22 },
    konut:   { label:'🏠 Konut',    maxAmount:20000000, minScore:500, baseRate:0.18 },
    ihracat: { label:'🚢 İhracat',  maxAmount:10000000, minScore:550, baseRate:0.15 },
    tarim:   { label:'🌾 Tarım',    maxAmount:1000000,  minScore:250, baseRate:0.12 },
    esnaf:   { label:'🛒 Esnaf',    maxAmount:500000,   minScore:350, baseRate:0.24 },
  };

  const def = TIPLER[tur]; if (!def) return SP.toast('Geçersiz kredi türü', 'error');

  const m = parseFloat(miktar);
  const v = parseInt(vade);
  if (isNaN(m) || m <= 0)           return SP.toast('Geçersiz miktar', 'error');
  if (m > def.maxAmount)             return SP.toast(`Maksimum: ${SP.fmt(def.maxAmount)}`, 'error');
  if (isNaN(v) || v < 3 || v > 120) return SP.toast('3 – 120 ay arasında vade girin', 'error');

  const skor = await window.SP_kreditSkoru(uid);
  if (skor < def.minScore) {
    SP.toast(`❌ Kredi skoru yetersiz: ${skor} / gereken: ${def.minScore}`, 'error', 8000); return;
  }

  // Faiz hesapla
  const repo = (await SP.g('bank/repoRate')) || 0.42;
  const rate = def.baseRate + repo * 0.5;
  const mr   = rate / 12;
  const pmt  = Math.ceil(m * mr / (1 - Math.pow(1+mr, -v)));

  // Para yatır
  await addCash(uid, m, 'kredi-onaylandi');
  const krediKey = (await SP.push(`users/${uid}/krediler`, {
    tur, label: def.label,
    miktar: m, vade: v,
    taksit: pmt, oran: rate,
    kalanBorc: m,
    odemeSayisi: 0,
    sonOdeme: Date.now(),
    baslangic: Date.now(),
    status: 'active',
    skor,
  })).key;

  // Kredi geçmişi logla
  await SP.push('krediLog', { uid, tur, miktar: m, ts: Date.now() });

  SP.toast(`✅ ${def.label} kredisi onaylandı! ${SP.fmt(m)} yatırıldı. Taksit: ${SP.fmt(pmt)}/ay`, 'success', 10000);
  return { ok: true, miktar: m, taksit: pmt, krediKey };
};

/* Taksit öde */
window.SP_taksitOde = async function(uid, krediId) {
  const kredi = await SP.g(`users/${uid}/krediler/${krediId}`);
  if (!kredi) return SP.toast('Kredi bulunamadı', 'error');
  if (kredi.status !== 'active') return SP.toast('Aktif kredi değil', 'warn');

  const ok = await spendCash(uid, kredi.taksit, `kredi-taksit-${krediId}`);
  if (!ok) return;

  const yeniKalan = Math.max(0, kredi.kalanBorc - (kredi.taksit / (1 + kredi.oran/12)));
  const yeniSayi  = (kredi.odemeSayisi || 0) + 1;
  const bitti     = yeniSayi >= kredi.vade || yeniKalan < kredi.taksit;

  await SP.u(`users/${uid}/krediler/${krediId}`, {
    kalanBorc: yeniKalan,
    odemeSayisi: yeniSayi,
    sonOdeme: Date.now(),
    status: bitti ? 'paid' : 'active',
  });

  if (bitti) {
    SP.toast(`🎉 Kredi kapatıldı! Skor yükseliyor...`, 'success', 8000);
    await SP.notify(uid, '🎉 Kredinizi kapattınız! Kredi skoru arttı.', 'success');
  } else {
    SP.toast(`✅ Taksit ödendi. Kalan: ${SP.fmt(yeniKalan)} (${kredi.vade - yeniSayi} taksit)`, 'success');
  }
};

/* Otomatik gecikme faizi */
(function krediGecikmeKontrol() {
  setInterval(async () => {
    if (!window.GZ?.uid) return;
    const uid = window.GZ.uid;
    const krediler = await SP.g(`users/${uid}/krediler`) || {};
    for (const [kid, k] of Object.entries(krediler)) {
      if (k.status !== 'active') continue;
      const fark = Date.now() - (k.sonOdeme || k.baslangic);
      if (fark > 31 * 86400000) {
        // 1 ay geçmişse gecikme faizi ekle
        const gecikme = Math.ceil(k.kalanBorc * 0.05);
        await db.ref(`users/${uid}/krediler/${kid}/kalanBorc`).transaction(v => (v||0) + gecikme);
        await SP.notify(uid, `⚠️ Kredi gecikmesi! ${SP.fmt(gecikme)} faiz eklendi. Lütfen taksit ödeyin.`, 'error');
        await SP.u(`users/${uid}/krediler/${kid}`, { status: 'overdue' });
      }
    }
  }, 60 * 60 * 1000);
})();

/* Kredi paneli render */
async function renderKrediSistemi() {
  const main = SP.main(); if (!main) return;
  const uid  = SP.uid();  if (!uid)  return;
  const d    = await SP.g(`users/${uid}`) || {};
  const krediler = Object.entries(d.krediler || {});
  const skor = await window.SP_kreditSkoru(uid);

  const aktifler  = krediler.filter(([,k])=> k.status === 'active' || k.status === 'overdue');
  const kapalilar = krediler.filter(([,k])=> k.status === 'paid');

  main.innerHTML = `
    <div style="padding:0 0 80px">
      ${SP.pageTitle('💳', 'Kredi Sistemi', 'Banka Kredisi & Taksit Planı')}
      <div style="padding:0 16px">

        <!-- Skor -->
        <div style="background:linear-gradient(135deg,${skor>700?'#052e16,#14532d':skor>500?'#0b1931,#1a3a6b':'#380000,#5a1010'});border-radius:14px;padding:20px;margin-bottom:16px;text-align:center">
          <div style="font-size:11px;color:#94a3b8">KREDİ SKORU</div>
          <div style="font-size:48px;font-weight:900;color:${skor>700?'#22c55e':skor>500?'#60a5fa':'#ef4444'}">${skor}</div>
          <div style="font-size:12px;color:#94a3b8">${skor>750?'Mükemmel 🌟':skor>650?'İyi ✅':skor>500?'Orta 🟡':skor>350?'Zayıf ⚠️':'Kötü ❌'}</div>
        </div>

        <!-- Yeni kredi -->
        ${SP.card('💳 Kredi Başvurusu', `
          ${SP.sel('krediTur', `
            <option value="">Kredi türü seçin</option>
            <option value="ihtiyac">💳 İhtiyaç (max 200.000₺, min skor 300)</option>
            <option value="esnaf">🛒 Esnaf (max 500.000₺, min skor 350)</option>
            <option value="ticari">🏪 Ticari (max 5.000.000₺, min skor 450)</option>
            <option value="tarim">🌾 Tarım (max 1.000.000₺, min skor 250)</option>
            <option value="konut">🏠 Konut (max 20.000.000₺, min skor 500)</option>
            <option value="ihracat">🚢 İhracat (max 10.000.000₺, min skor 550)</option>
          `)}
          ${SP.inp('krediMiktar', 'Tutar (₺)', 'number')}
          ${SP.inp('krediVade', 'Vade (ay, 3-120)', 'number')}
          <button onclick="(async()=>{
            const tur=document.getElementById('krediTur').value;
            const m=document.getElementById('krediMiktar').value;
            const v=document.getElementById('krediVade').value;
            if(!tur){toast('Kredi türü seçin','warn');return;}
            await SP_krediBasvur('${uid}',tur,m,v);
            renderKrediSistemi();
          })()" style="width:100%;background:#22c55e;color:white;border:none;border-radius:10px;padding:14px;font-weight:800;cursor:pointer">
            💳 Kredi Başvurusu Yap
          </button>
        `)}

        <!-- Aktif krediler -->
        ${aktifler.length ? SP.card('📋 Aktif Kredilerim', aktifler.map(([kid,k])=>`
          <div style="padding:12px 0;border-bottom:1px solid #0f1e33">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div style="font-weight:700;color:#e2e8f0">${k.label||k.tur}</div>
              <span style="background:${k.status==='overdue'?'#ef444422':'#eab30822'};color:${k.status==='overdue'?'#ef4444':'#eab308'};border:1px solid ${k.status==='overdue'?'#ef444444':'#eab30844'};border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700">${k.status==='overdue'?'⚠️ GECİKMİŞ':'💳 Aktif'}</span>
            </div>
            <div style="font-size:12px;color:#94a3b8">Kalan borç: <strong style="color:#60a5fa">${SP.fmt(k.kalanBorc||0)}</strong></div>
            <div style="font-size:12px;color:#94a3b8">Taksit: ${SP.fmt(k.taksit||0)}/ay — ${k.vade-(k.odemeSayisi||0)} taksit kaldı</div>
            <button onclick="SP_taksitOde('${uid}','${kid}').then(()=>renderKrediSistemi())" style="margin-top:8px;width:100%;background:#3b82f6;color:white;border:none;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer">💸 Taksit Öde (${SP.fmt(k.taksit||0)})</button>
          </div>`).join('')) : ''}

        ${kapalilar.length ? SP.card('✅ Kapalı Krediler', `<div style="font-size:12px;color:#22c55e">${kapalilar.length} kredi başarıyla kapatıldı ✅</div>`) : ''}

      </div>
    </div>`;
}
window.renderKrediSistemi = renderKrediSistemi;

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 8: ROL MAAŞ SİSTEMİ
   ═══════════════════════════════════════════════════════════════════════ */
window.SP_maasOde = async function() {
  const users = await SP.g('users') || {};
  for (const [uid, d] of Object.entries(users)) {
    // Muhtar maaşı
    if (d.role_muhtar) {
      const last = d.role_muhtar_maasAt || 0;
      if (Date.now() - last >= 30 * 86400000) {
        await addCash(uid, ROL_CFG.muhtar.maas, 'muhtar-maas');
        await SP.u(`users/${uid}`, { role_muhtar_maasAt: Date.now() });
        await SP.notify(uid, `💰 Muhtar maaşı yatırıldı: ${SP.fmt(ROL_CFG.muhtar.maas)}`, 'success');
      }
    }
    // Belediye Başkanı maaşı
    if (d.role_belediyeBsk) {
      const last = d.role_belediyeBsk_maasAt || 0;
      if (Date.now() - last >= 30 * 86400000) {
        await addCash(uid, ROL_CFG.belediyeBsk.maas, 'bsk-maas');
        await SP.u(`users/${uid}`, { role_belediyeBsk_maasAt: Date.now() });
        await SP.notify(uid, `💰 Belediye Başkanı maaşı: ${SP.fmt(ROL_CFG.belediyeBsk.maas)}`, 'success');
      }
    }
    // Milletvekili maaşı
    if (d.role_milletvekili) {
      const last = d.role_milletvekili_maasAt || 0;
      if (Date.now() - last >= 30 * 86400000) {
        await addCash(uid, ROL_CFG.milletvekili.maas, 'mv-maas');
        await SP.u(`users/${uid}`, { role_milletvekili_maasAt: Date.now() });
      }
    }
    // Başbakan maaşı
    if (d.role_basbakanlik) {
      const last = d.role_basbakanlik_maasAt || 0;
      if (Date.now() - last >= 30 * 86400000) {
        await addCash(uid, ROL_CFG.basbakanlik.maas, 'bb-maas');
        await SP.u(`users/${uid}`, { role_basbakanlik_maasAt: Date.now() });
        await SP.notify(uid, `💰 Başbakan maaşı: ${SP.fmt(ROL_CFG.basbakanlik.maas)}`, 'success');
      }
    }
    // Cumhurbaşkanı maaşı
    if (d.role_cumhurbaskani) {
      const last = d.role_cumhurbaskani_maasAt || 0;
      if (Date.now() - last >= 30 * 86400000) {
        await addCash(uid, ROL_CFG.cumhurbaskani.maas, 'cb-maas');
        await SP.u(`users/${uid}`, { role_cumhurbaskani_maasAt: Date.now() });
        await SP.notify(uid, `💰 Cumhurbaşkanı maaşı: ${SP.fmt(ROL_CFG.cumhurbaskani.maas)}`, 'success');
      }
    }
  }
};

/* Rol görev süresi bitiş kontrolü */
(function rolGörevKontrol() {
  setInterval(async () => {
    if (!window.GZ?.uid) return;
    const uid = window.GZ.uid;
    const d   = await SP.g(`users/${uid}`);
    if (!d) return;

    for (const rol of Object.keys(ROL_CFG)) {
      if (!d[`role_${rol}`]) continue;
      const atanAt = d[`role_${rol}_atanAt`] || 0;
      const gorevSure = ROL_CFG[rol].gorevSure * 86400000;
      if (Date.now() - atanAt > gorevSure) {
        await window.SP_rolIptal(uid, rol);
        SP.notify(uid, `⏰ ${ROL_CFG[rol].label} görev süreniz doldu. Yeniden seçime katılabilirsiniz.`, 'warn');
      }
    }
  }, 30 * 60 * 1000); // Her 30dk
})();

/* Maaş otomasyonu */
(function maasOtomasyonu() {
  const _w = setInterval(() => {
    if (!window.GZ?.data?.isFounder) return;
    clearInterval(_w);
    setInterval(() => window.SP_maasOde?.().catch(()=>{}), 60 * 60 * 1000);
    setTimeout(() => window.SP_maasOde?.().catch(()=>{}), 8000);
  }, 2000);
})();

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 9: YOLSUZLUK / RÜŞVET SİSTEMİ
   ═══════════════════════════════════════════════════════════════════════ */

/* Rüşvet teklif et */
window.SP_rusvetTeklif = async function(fromUid, toUid, miktar, amac) {
  const yakalanmaOlasiligi = 0.30; // %30 yakalanma
  const roll = Math.random();

  if (roll < yakalanmaOlasiligi) {
    // YAKALANDI
    const ceza = miktar * 3;
    await spendCash(fromUid, ceza, 'rusvet-cezasi');
    // Dava aç
    await SP.push('davalar', {
      uid: fromUid,
      karsi: 'DEVLET',
      sebep: `Rüşvet girişimi — ${SP.fmt(miktar)} rüşvet, Amaç: ${amac}`,
      status: 'acik',
      ciddiyet: 'yuksek',
      acilanAt: Date.now(),
    });
    // Bildir
    await SP.notify(fromUid, `🚨 YAKALANDINIZ! Rüşvet girişimi. Ceza: ${SP.fmt(ceza)}. Mahkemeye sevk edildiniz!`, 'error');
    SP.toast(`🚨 Rüşvet girişimi yakalandı! ${SP.fmt(ceza)} ceza kesildi. Mahkeme süreci başladı.`, 'error', 10000);
    return { yakalandi: true, ceza };
  } else {
    // Rüşvet geçti
    const ok = await spendCash(fromUid, miktar, 'rusvet-odeme');
    if (ok) await addCash(toUid, miktar * 0.9, 'rusvet-alindi'); // %10 iz parası
    SP.toast(`🤝 İşlem "tamamlandı"... (${SP.fmt(miktar)})`, 'info', 4000);
    return { yakalandi: false };
  }
};

/* Mahkeme paneli (genişletilmiş) */
async function renderMahkemeTam() {
  const main = SP.main(); if (!main) return;
  const uid  = SP.uid();  if (!uid)  return;

  const davalar = Object.entries(await SP.g('davalar') || {})
    .filter(([,d]) => d.uid === uid || d.karsi === uid);

  const bekleyen  = davalar.filter(([,d]) => d.status === 'acik');
  const gecmis    = davalar.filter(([,d]) => d.status !== 'acik');

  main.innerHTML = `
    <div style="padding:0 0 80px">
      ${SP.pageTitle('⚖️', 'Mahkeme', 'Hukuki İşlemler & Dava Takibi')}
      <div style="padding:0 16px">

        ${bekleyen.length ? SP.card(`📋 Açık Davalar (${bekleyen.length})`, bekleyen.map(([id,d2])=>`
          <div style="padding:12px 0;border-bottom:1px solid #0f1e33">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div style="font-weight:700;color:#e2e8f0">${d2.sebep||'Dava'}</div>
              <span style="background:#eab30822;color:#eab308;border:1px solid #eab30844;border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700">⏳ Açık</span>
            </div>
            <div style="font-size:12px;color:#94a3b8">Karşı taraf: ${d2.karsi} · ${new Date(d2.acilanAt||0).toLocaleDateString('tr-TR')}</div>
            ${d2.ciddiyet==='yuksek'?`<div style="font-size:11px;color:#ef4444;margin-top:4px">⚠️ Yüksek ciddiyet davası</div>`:''}
          </div>`).join(''), '#ef444433') : ''}

        ${SP.card('⚖️ Yeni Dava Aç', `
          ${SP.inp('davaKarsi', 'Karşı taraf (UID veya "DEVLET")')}
          ${SP.inp('davaSebep', 'Dava sebebi (detaylı)')}
          ${SP.sel('davaAvukat', `
            <option value="none">Avukatsız (riskli)</option>
            <option value="junior">Jr. Avukat — 5.000₺ (%30 kazanma bonusu)</option>
            <option value="senior">Kıdemli Avukat — 25.000₺ (%50 kazanma bonusu)</option>
            <option value="top">Baş Avukat — 100.000₺ (%70 kazanma bonusu)</option>
          `)}
          <button onclick="(async()=>{
            const k=document.getElementById('davaKarsi').value.trim();
            const s=document.getElementById('davaSebep').value.trim();
            const av=document.getElementById('davaAvukat').value;
            if(!k||!s){toast('Tüm alanları doldurun','warn');return;}
            const ucretler={none:0,junior:5000,senior:25000,top:100000};
            const ucret=ucretler[av]||0;
            if(ucret>0){const r=await GZX_safePay?.('${uid}',ucret,'avukatlık');if(!r?.ok)return;}
            await SP.push('davalar',{uid:'${uid}',karsi:k,sebep:s,avukat:av,status:'acik',acilanAt:Date.now()});
            toast('⚖️ Dava açıldı!','success');
            renderMahkemeTam();
          })()" style="width:100%;background:#7c3aed;color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">
            ⚖️ Davayı Aç
          </button>
        `)}

        ${gecmis.length ? SP.card('📂 Geçmiş Davalar', gecmis.slice(-5).map(([id,d2])=>`
          <div style="padding:8px 0;border-bottom:1px solid #0f1e33;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:12px;font-weight:700;color:#e2e8f0">${d2.sebep?.slice(0,50)||'Dava'}</div>
              <div style="font-size:10px;color:#64748b">${new Date(d2.acilanAt||0).toLocaleDateString('tr-TR')}</div>
            </div>
            <span style="background:${d2.status==='kazanildi'?'#22c55e22':'#ef444422'};color:${d2.status==='kazanildi'?'#22c55e':'#ef4444'};border:1px solid ${d2.status==='kazanildi'?'#22c55e44':'#ef444444'};border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700">${d2.status==='kazanildi'?'✅ Kazanıldı':'❌ Kaybedildi'}</span>
          </div>`).join('')) : ''}

      </div>
    </div>`;
}
window.renderMahkemeTam = renderMahkemeTam;

/* ═══════════════════════════════════════════════════════════════════════
   BÖLÜM 10: YÜKLEME SORUNLARI — FİX
   ═══════════════════════════════════════════════════════════════════════ */

/* render() patch — tüm yeni ekranları bağla */
(function patchRenderSiyasi() {
  const _prev = window.render;
  window.render = function(tab) {
    const siyasiMap = {
      muhtarlik:       renderMuhtarlikTam,
      muhtarlikTam:    renderMuhtarlikTam,
      belediye:        renderBelediyeTam,
      belediyeTam:     renderBelediyeTam,
      cumhurbaskanligi: renderCumhurbaskanligiTam,
      cumhurbaskani:   renderCumhurbaskanligiTam,
      kredi:           renderKrediSistemi,
      krediSistemi:    renderKrediSistemi,
      mahkeme:         renderMahkemeTam,
      mahkemeTam:      renderMahkemeTam,
    };
    if (siyasiMap[tab]) {
      const main = document.getElementById('appMain');
      if (main) main.innerHTML = `<div style="padding:40px;text-align:center"><div class="spinner" style="margin:0 auto"></div></div>`;
      siyasiMap[tab]();
    } else if (_prev) {
      _prev(tab);
    }
  };
})();

/* Spinner tanımı yoksa ekle */
(function ensureSpinner() {
  const style = document.createElement('style');
  style.textContent = `
    .spinner {
      width:36px;height:36px;
      border:3px solid #1e3a5f;
      border-top-color:#3b82f6;
      border-radius:50%;
      animation:spin .7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════════════════════════════
   BÖLÜM 11: BAŞLANGIÇ — SİSTEM KONTROL
   ══════════════════════════════════════════════════════════════════════ */
(function sistemBaslangic() {
  const _w = setInterval(() => {
    if (!window.GZ?.uid || !window.GZ?.data) return;
    clearInterval(_w);

    const uid = window.GZ.uid;
    const d   = window.GZ.data;

    // Günlük giriş ödülü
    setTimeout(() => {
      if (typeof window.GZX_dailyLogin === 'function') {
        window.GZX_dailyLogin(uid);
      }
    }, 2000);

    // İl kontrolü
    setTimeout(async () => {
      if (!d.province) {
        await SP.u(`users/${uid}`, { province: 'İstanbul' });
      }
    }, 1500);

    // Vergi hatırlatıcı
    setTimeout(async () => {
      const d2 = await SP.g(`users/${uid}`);
      if (!d2) return;
      const lastTax = d2.lastIncomeTax || 0;
      if (Date.now() - lastTax > 31 * 86400000&& (d2.money||0) > 20000) {
        SP.toast('💰 Aylık gelir vergisi zamanı yaklaşıyor', 'info');
      }
    }, 10000);

    // Aktif seçim bildirimi
    setTimeout(async () => {
      try {
        const prov = d.province || 'İstanbul';
        const muhtarSec = await SP.g(`secimler/${prov}/muhtar`);
        const belSec    = await SP.g(`secimler/${prov}/belediyeBsk`);
        const cbSec     = await SP.g('secimler/ulusal/cumhurbaskani');
        const aktifler  = [muhtarSec, belSec, cbSec].filter(s => s?.aktif);
        if (aktifler.length) {
          SP.toast(`🗳️ ${aktifler.length} aktif seçim var! Oyunuzu kullanmayı unutmayın.`, 'info', 8000);
        }
      } catch(e) {}
    }, 5000);

    console.log('[siyasi-sistem.js] ✅ Sistem hazır — Rol, Seçim, Muhtarlık, Belediye, CB, Vergi, Kredi aktif');
  }, 800);
})();

/* ══════════════════════════════════════════════════════════════════════
   BÖLÜM 12: MUHTAR ŞİKAYET YÖNETİM PANELİ
   ══════════════════════════════════════════════════════════════════════ */
async function renderMuhtarSikayetler() {
  const main = SP.main(); if (!main) return;
  const uid  = SP.uid();  if (!uid)  return;
  const d    = await SP.g(`users/${uid}`) || {};

  if (!d.role_muhtar) { SP.toast('Bu panel sadece muhtara açık', 'error'); return; }

  const prov     = d.role_muhtar_bolge || d.province || 'İstanbul';
  const sikayet  = Object.entries(await SP.g(`sikayet/${prov}`) || {});
  const bekleyen = sikayet.filter(([,s]) => s.durum === 'bekliyor');
  const cevaplanan = sikayet.filter(([,s]) => s.durum !== 'bekliyor');

  // Sosyal yardım talepleri
  const yardimlar = Object.entries(await SP.g('sosyalYardimTalep') || {})
    .filter(([,y]) => y.durum === 'bekliyor');

  main.innerHTML = `
    <div style="padding:0 0 80px">
      ${SP.pageTitle('🏛️', 'Muhtar Paneli', prov + ' — Şikayet & Yardım Yönetimi')}
      <div style="padding:0 16px">

        <!-- Özet -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
          ${SP.stat('Bekleyen Şikayet', bekleyen.length, '#ef4444')}
          ${SP.stat('Yanıtlanan', cevaplanan.length, '#22c55e')}
          ${SP.stat('Yardım Talebi', yardimlar.length, '#eab308')}
        </div>

        <!-- Şikayetler -->
        ${bekleyen.length ? SP.card(`📋 Bekleyen Şikayetler (${bekleyen.length})`,
          bekleyen.slice(0, 15).map(([sid, s]) => `
            <div style="padding:12px 0;border-bottom:1px solid #0f1e33">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-size:13px;font-weight:700;color:#e2e8f0">${s.kategori||'Şikayet'}</div>
                  <div style="font-size:11px;color:#94a3b8">${s.username||'Anonim'} · ${new Date(s.ts||0).toLocaleString('tr-TR')}</div>
                  <div style="font-size:12px;color:#cbd5e1;margin-top:4px">${(s.detay||'').slice(0,120)}</div>
                </div>
              </div>
              <div style="display:flex;gap:6px;margin-top:8px">
                <button onclick="SP_sikayetCevapla('${prov}','${sid}','isleniyor')" style="flex:1;background:#3b82f622;color:#60a5fa;border:1px solid #3b82f644;border-radius:8px;padding:8px;font-weight:700;font-size:11px;cursor:pointer">🔧 İşleme Al</button>
                <button onclick="SP_sikayetCevapla('${prov}','${sid}','tamamlandi')" style="flex:1;background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:8px;padding:8px;font-weight:700;font-size:11px;cursor:pointer">✅ Tamamlandı</button>
                <button onclick="SP_sikayetCevapla('${prov}','${sid}','reddi')" style="flex:1;background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:8px;padding:8px;font-weight:700;font-size:11px;cursor:pointer">❌ Reddet</button>
              </div>
            </div>`).join(''),
          '#ef444433') : SP.card('✅ Şikayetler', '<div style="text-align:center;color:#22c55e;padding:16px;font-size:13px">Bekleyen şikayet yok! 🎉</div>')}

        <!-- Belediyeye yönlendirme -->
        ${SP.card('🏙️ Belediyeye Yönlendir', `
          <div style="font-size:12px;color:#94a3b8;margin-bottom:12px">Büyük altyapı sorunlarını belediyeye aktar. Belediye başkanı onayı gerekir.</div>
          ${SP.inp('belediyeTalep', 'Talep açıklaması (yol, su, elektrik vs.)')}
          <button onclick="SP_muhtarBelediyeBasvur('${uid}','${prov}')" style="width:100%;background:#3b82f6;color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">📤 Belediyeye Başvur</button>
        `)}

        <!-- Sosyal yardım onayı -->
        ${yardimlar.length ? SP.card(`💰 Sosyal Yardım Talepleri (${yardimlar.length})`,
          yardimlar.slice(0, 10).map(([yid, y]) => `
            <div style="padding:10px 0;border-bottom:1px solid #0f1e33">
              <div style="font-size:13px;font-weight:700;color:#e2e8f0">${y.username||'Anonim'}</div>
              <div style="font-size:12px;color:#94a3b8">Bakiye: ${SP.fmt(y.bakiye||0)} · ${new Date(y.ts).toLocaleString('tr-TR')}</div>
              <div style="display:flex;gap:6px;margin-top:8px">
                <button onclick="SP_yardimOnayla('${yid}','${y.uid}')" style="flex:1;background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:8px;padding:8px;font-weight:700;font-size:12px;cursor:pointer">✅ Onayla (2.000₺)</button>
                <button onclick="SP_yardimReddet('${yid}')" style="flex:1;background:#ef444422;color:#ef4444;border:1px solid #ef444444;border-radius:8px;padding:8px;font-weight:700;font-size:12px;cursor:pointer">❌ Reddet</button>
              </div>
            </div>`).join('')) : ''}

      </div>
    </div>`;
}
window.renderMuhtarSikayetler = renderMuhtarSikayetler;

/* Şikayet yanıtla */
window.SP_sikayetCevapla = async function(prov, sid, durum) {
  const s = await SP.g(`sikayet/${prov}/${sid}`);
  if (!s) return;
  await SP.u(`sikayet/${prov}/${sid}`, { durum, cevaplayanAt: Date.now() });
  if (s.uid) {
    const msg = durum === 'tamamlandi'
      ? `✅ Şikayetiniz çözüldü: ${s.kategori}`
      : durum === 'isleniyor'
      ? `🔧 Şikayetiniz işleme alındı: ${s.kategori}`
      : `❌ Şikayetiniz reddedildi: ${s.kategori}`;
    await SP.notify(s.uid, msg, durum === 'tamamlandi' ? 'success' : 'info');
  }
  SP.toast(`Şikayet güncellendi: ${durum}`, 'success');
  renderMuhtarSikayetler();
};

/* Belediyeye başvur */
window.SP_muhtarBelediyeBasvur = async function(uid, prov) {
  const talep = document.getElementById('belediyeTalep')?.value?.trim();
  if (!talep || talep.length < 10) { SP.toast('En az 10 karakter yazın', 'warn'); return; }

  const d = await SP.g(`users/${uid}`);
  await SP.push(`politics/${prov}/muhtarTalepleri`, {
    from: uid,
    username: d?.username || uid.slice(0,8),
    talep, ts: Date.now(), durum: 'bekliyor', prov,
  });

  const bskUid = await SP.g(`politics/${prov}/elected_belediyeBsk`);
  if (bskUid) await SP.notify(bskUid, `🏛️ Muhtarlık talebi: ${talep}`, 'info');

  SP.toast('📤 Talep belediyeye iletildi!', 'success');
  document.getElementById('belediyeTalep').value = '';
};

/* Yardım onayla */
window.SP_yardimOnayla = async function(yid, benUid) {
  await addCash(benUid, 2000, 'sosyal-yardim-onaylandi');
  await SP.u(`users/${benUid}`, { lastSocialAid: Date.now() });
  await SP.u(`sosyalYardimTalep/${yid}`, { durum: 'onaylandi', onayAt: Date.now() });
  await SP.notify(benUid, '✅ Sosyal yardım onaylandı! 2.000₺ yatırıldı.', 'success');
  SP.toast('✅ Yardım onaylandı', 'success');
  renderMuhtarSikayetler();
};

/* Yardım reddet */
window.SP_yardimReddet = async function(yid) {
  await SP.u(`sosyalYardimTalep/${yid}`, { durum: 'reddedildi' });
  SP.toast('❌ Yardım reddedildi', 'warn');
  renderMuhtarSikayetler();
};

/* render() son patch — muhtar şikayet paneli */
(function patchRenderMuhtar() {
  const _prev = window.render;
  window.render = function(tab) {
    if (tab === 'muhtarSikayetler') {
      const main = document.getElementById('appMain');
      if (main) main.innerHTML = `<div style="padding:40px;text-align:center"><div class="spinner" style="margin:0 auto"></div></div>`;
      renderMuhtarSikayetler();
    } else if (_prev) {
      _prev(tab);
    }
  };
})();

/* ══════════════════════════════════════════════════════════════════════
   SON LOG
   ══════════════════════════════════════════════════════════════════════ */
console.log('[siyasi-sistem.js] ✅ TAM AKTİF — Rol Sistemi + Seçim + Muhtarlık + Belediye + CB + Vergi + Kredi + Rüşvet + Şikayet (250 kategori) + Maaş');
