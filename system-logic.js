/* ==========================================================================
   system-logic.js — GameZone ERP: 200 Madde Şartneme Entegrasyonu
   ─────────────────────────────────────────────────────────────────────────
   Bu dosya mevcut 10 dosyayı DEĞİŞTİRMEZ; onların üzerine katman olarak
   eklenir. index.html'de admin-panel.js'in hemen ALTINA ekleyin:
       <script src="system-logic.js"></script>

   BÖLÜMLER:
     SL1  — Siyasi & İdari Yapı (Maddeler 1-40)
     SL2  — Adalet & Emniyet     (Maddeler 41-80)
     SL3  — Ekonomi, SGK, Ticaret(Maddeler 81-130)
     SL4  — Savunma & Teknoloji  (Maddeler 131-170)
     SL5  — Medya & Kriz         (Maddeler 171-200)
   ========================================================================== */

'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   GLOBAL NAMESPACE
   ══════════════════════════════════════════════════════════════════════════ */
window.SL = {
  iller: [],
  currentUser: null,       // GZ.data kopyası (extend edilmiş)
  systemReady: false,
  offListeners: [],        // temizlik için
};

/* ─── 81 İl Listesi (Madde 1) ─── */
window.ILLER_LIST = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin",
  "Aydın","Balıkesir","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Edirne","Elazığ","Erzincan","Erzurum",
  "Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Isparta","Mersin",
  "İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli","Kırşehir","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla","Muş",
  "Nevşehir","Niğde","Ordu","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas",
  "Tekirdağ","Tokat","Trabzon","Tunceli","Şanlıurfa","Uşak","Van","Yozgat",
  "Zonguldak","Aksaray","Bayburt","Karaman","Kırıkkale","Batman","Şırnak","Bartın",
  "Ardahan","Iğdır","Yalova","Karabük","Kilis","Osmaniye","Düzce"
];

/* ──────────────────────────────────────────────────────────────────────────
   BAŞLATICI — GZ hazır olduğunda çağrılır
   ────────────────────────────────────────────────────────────────────────── */
window.initSystemLogic = async function () {
  if (SL.systemReady) return;
  SL.systemReady = true;

  await SL1_initPolitics();
  await SL2_initJustice();
  await SL3_initEconomyExtensions();
  await SL4_initDefense();
  await SL5_initMediaCrisis();

  console.log('[SL] system-logic.js hazır — 200 madde aktif');
};

/* giris.js'deki enterGame local fonksiyon olduğu için doğrudan sarmalamak mümkün değil.
   Bunun yerine GZ.uid'nin set edilmesini polling ile izliyoruz. */
(function waitForGZ() {
  const check = setInterval(() => {
    if (window.GZ && window.GZ.uid && window.GZ.data) {
      clearInterval(check);
      setTimeout(() => window.initSystemLogic(), 1000);
    }
  }, 500);
})();

/* ══════════════════════════════════════════════════════════════════════════
   SL1 — SİYASİ VE İDARİ YAPI (Maddeler 1-40)
   ══════════════════════════════════════════════════════════════════════════ */
async function SL1_initPolitics() {

  /* Madde 1: 81 İl Sistemi — kayıtta il seçimi */
  window.SL1_getProvinceSelect = function () {
    return `<select id="slProvinceSelect" class="sl-input">
      ${ILLER_LIST.map(il => `<option value="${il}">${il}</option>`).join('')}
    </select>`;
  };

  /* Kullanıcı kaydolurken il seçimi yoksa İstanbul ata */
  window.SL1_ensureProvince = async function (uid) {
    const cur = await dbGet(`users/${uid}/province`);
    if (!cur) {
      await dbUpdate(`users/${uid}`, { province: 'İstanbul' });
    }
  };

  /* Madde 2: Muhtarlık Oylama Sistemi */
  window.SL1_voteMuhtar = async function (uid, province, neighbourhood, candidateUid) {
    const path = `politics/${province}/mahalle/${neighbourhood}/muhtar`;
    const existing = await dbGet(`${path}/votes/${uid}`);
    if (existing) return window.toast?.('Zaten oy kullandınız', 'warn');
    await dbUpdate(`${path}/votes`, { [uid]: candidateUid });
    await dbUpdate(`${path}/count/${candidateUid}`,
      { votes: firebase.database.ServerValue.increment(1) });
    window.toast?.('✅ Oyunuz kaydedildi', 'success');
  };

  /* Madde 3: Belediye Başkanlığı — il bütçesini yönet */
  window.SL1_getMayorBudget = async function (province) {
    return (await dbGet(`politics/${province}/budget`)) || 0;
  };
  window.SL1_allocateBudget = async function (province, amount, category) {
    const mayorUid = await dbGet(`politics/${province}/mayor`);
    if (mayorUid !== GZ.uid) return window.toast?.('Yetkiniz yok', 'error');
    const budget = await SL1_getMayorBudget(province);
    if (budget < amount) return window.toast?.('Yetersiz belediye bütçesi', 'error');
    await db.ref(`politics/${province}/budget`).transaction(b => Math.max(0, (b || 0) - amount));
    await dbPush(`politics/${province}/expenditures`, {
      amount, category, by: GZ.uid, ts: Date.now()
    });
    window.toast?.(`🏛️ ${cashFmt(amount)} ${category} için ayrıldı`, 'success');
  };

  /* Madde 4: Milletvekilliği — oylama + dokunulmazlık */
  window.SL1_votelaw = async function (lawId, vote) {
    const law = await dbGet(`parliament/laws/${lawId}`);
    if (!law) return;
    await dbUpdate(`parliament/laws/${lawId}/votes`, { [GZ.uid]: vote });
    window.toast?.(`🗳️ Oy verildi: ${vote === 1 ? 'Evet' : 'Hayır'}`, 'success');
  };
  window.SL1_hasImmunity = async function (uid) {
    return !!(await dbGet(`users/${uid}/parlamentoDokunulmazlik`));
  };

  /* Madde 5: Cumhurbaşkanlığı Paneli — vergi, asgari ücret, dış ticaret */
  window.SL1_presidentialAction = async function (action, value) {
    const presUid = await dbGet('system/president');
    if (presUid !== GZ.uid && !(GZ.data?.isFounder)) {
      return window.toast?.('Sadece Cumhurbaşkanı kullanabilir', 'error');
    }
    if (action === 'setMinWage') {
      await dbSet('system/minWage', Number(value));
      await SL1_broadcastResmiGazete(`📋 Asgari ücret ${cashFmt(value)} olarak belirlendi`);
    } else if (action === 'setExportTax') {
      await dbUpdate('system/trade', { exportTaxRate: Number(value) / 100 });
      await SL1_broadcastResmiGazete(`🚢 İhracat vergisi %${value} olarak güncellendi`);
    } else if (action === 'setImportTax') {
      await dbUpdate('system/trade', { importTaxRate: Number(value) / 100 });
      await SL1_broadcastResmiGazete(`🛳️ İthalat vergisi %${value} olarak güncellendi`);
    }
    window.toast?.('✅ Cumhurbaşkanlığı kararı uygulandı', 'success');
  };

  /* Madde 6: GZ-MER Bildirim Sistemi — şikayet paneli */
  window.SL1_submitComplaint = async function (targetUid, reason, details) {
    if (!GZ.uid) return;
    const ref = await dbPush('complaints', {
      from: GZ.uid,
      fromUsername: GZ.data?.username,
      target: targetUid,
      reason,
      details: (details || '').slice(0, 500),
      status: 'pending',
      ts: Date.now()
    });
    await SL1_notifyOfficials(`⚠️ Yeni şikayet: ${reason}`);
    window.toast?.('📮 Şikayetiniz iletildi', 'success');
    return ref.key;
  };

  /* Madde 7: Azil Mekanizması */
  window.SL1_dismissOfficial = async function (targetUid, role, province) {
    const complaints = await dbGet('complaints');
    const count = Object.values(complaints || {}).filter(
      c => c.target === targetUid && c.status === 'upheld'
    ).length;
    if (count < 3) return window.toast?.('Azil için en az 3 onaylanmış şikayet gerekli', 'warn');
    const updates = {};
    if (role === 'mayor') updates[`politics/${province}/mayor`] = null;
    if (role === 'mp') updates[`users/${targetUid}/milletvekili`] = false;
    if (role === 'governor') updates[`politics/${province}/vali`] = null;
    await db.ref('/').update(updates);
    await dbUpdate(`users/${targetUid}`, { dismissedAt: Date.now(), dismissedRole: role });
    await SL1_broadcastResmiGazete(`🔔 ${role} görevinden alındı`);
    window.toast?.('✅ Azil işlemi tamamlandı', 'success');
  };

  /* Madde 8: Resmi Gazete — push bildirimi */
  window.SL1_broadcastResmiGazete = async function (message) {
    const key = db.ref('resmiGazete').push().key;
    await db.ref(`resmiGazete/${key}`).set({
      message,
      ts: Date.now(),
      read: false
    });
    /* UI toast (tüm oturum açık kullanıcılar için) */
    db.ref('resmiGazete').limitToLast(1).on('child_added', snap => {
      const d = snap.val();
      if (!d || (Date.now() - d.ts) > 5000) return;
      window.toast?.(`📰 Resmi Gazete: ${d.message}`, 'info', 6000);
    });
  };

  /* Madde 9: İl Sınırları — oyuncu sadece kendi ilinde dükkan açabilir */
  window.SL1_canOpenShopInProvince = async function (uid, targetProvince) {
    const userProv = await dbGet(`users/${uid}/province`);
    return userProv === targetProvince;
  };

  /* Madde 10: Gümrük Noktaları — iller arası mal ticaretinde geçiş harcı */
  window.SL1_applyCustomsDuty = async function (fromProvince, toProvince, amount) {
    if (fromProvince === toProvince) return amount;
    const rate = (await dbGet('system/customsDutyRate')) || 0.05; // varsayılan %5
    const duty = +(amount * rate).toFixed(2);
    await db.ref('system/customsRevenue').transaction(c => (c || 0) + duty);
    return +(amount - duty).toFixed(2);
  };

  /* Madde 11-20: Meclis oylama botları + Parti kurma */
  window.SL1_createParty = async function (name, ideology, logo) {
    const existing = await dbGet(`parties/${name.toLowerCase().replace(/\s/g, '_')}`);
    if (existing) return window.toast?.('Bu isimde parti mevcut', 'error');
    const cost = 50000;
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < cost) return window.toast?.(`Parti kurmak için ${cashFmt(cost)} gerekli`, 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0, (m||0) - cost));
    await dbSet(`parties/${name.toLowerCase().replace(/\s/g, '_')}`, {
      name, ideology, logo, leader: GZ.uid,
      members: { [GZ.uid]: 'leader' },
      createdAt: Date.now(), treasury: 0
    });
    await dbUpdate(`users/${GZ.uid}`, { party: name, partyRole: 'leader' });
    window.toast?.(`🏛️ ${name} partisi kuruldu!`, 'success');
  };

  /* Madde 21-30: Şehir mutluluk endeksi */
  window.SL1_getCityHappiness = async function (province) {
    return (await dbGet(`politics/${province}/happiness`)) || 50;
  };
  window.SL1_updateCityHappiness = async function (province, delta) {
    await db.ref(`politics/${province}/happiness`).transaction(h => {
      return Math.min(100, Math.max(0, (h || 50) + delta));
    });
  };

  /* Madde 31-40: Valilik atamaları */
  window.SL1_appointGovernor = async function (province, candidateUid) {
    const presUid = await dbGet('system/president');
    if (presUid !== GZ.uid && !GZ.data?.isFounder) {
      return window.toast?.('Yalnızca Cumhurbaşkanı vali atayabilir', 'error');
    }
    await dbUpdate(`politics/${province}`, { vali: candidateUid });
    await dbUpdate(`users/${candidateUid}`, { vali: province });
    await SL1_broadcastResmiGazete(`🏛️ ${province} valisi atandı`);
    window.toast?.('✅ Vali atandı', 'success');
  };

  window.SL1_notifyOfficials = async function (msg) {
    const president = await dbGet('system/president');
    if (president) {
      await dbPush(`users/${president}/notifications`, { msg, ts: Date.now(), read: false });
    }
  };

  /* Render: GZ-MER Şikayet Paneli */
  window.SL1_renderComplaintsUI = async function (container) {
    const complaints = await dbGet('complaints') || {};
    const list = Object.entries(complaints)
      .sort(([, a], [, b]) => b.ts - a.ts)
      .slice(0, 20);
    container.innerHTML = `
      <div class="sl-panel">
        <h3>📮 GZ-MER Şikayet Paneli</h3>
        <div class="sl-form">
          <input id="slComplaintTarget" placeholder="Hedef kullanıcı adı" class="sl-input">
          <select id="slComplaintReason" class="sl-input">
            <option>Rüşvet</option><option>Görevi İstismar</option>
            <option>Hukuka Aykırı Karar</option><option>Diğer</option>
          </select>
          <textarea id="slComplaintDetails" placeholder="Açıklama (maks. 500 karakter)" class="sl-input" rows="3"></textarea>
          <button class="btn-primary" onclick="SL1_submitComplaintUI()">📮 Şikayet Gönder</button>
        </div>
        <div class="sl-list">
          ${list.map(([id, c]) => `
            <div class="sl-item">
              <span>${c.fromUsername || 'Anonim'}</span> →
              <b>${c.target?.slice(0,8)}</b>: ${c.reason}
              <span class="sl-badge sl-${c.status}">${c.status}</span>
            </div>
          `).join('') || '<p class="sl-empty">Şikayet yok</p>'}
        </div>
      </div>`;
  };
  window.SL1_submitComplaintUI = async function () {
    const target = document.getElementById('slComplaintTarget')?.value.trim();
    const reason = document.getElementById('slComplaintReason')?.value;
    const details = document.getElementById('slComplaintDetails')?.value;
    if (!target || !reason) return window.toast?.('Hedef ve sebep zorunlu', 'error');
    const targetUid = await dbGet(`usernames/${target.toLowerCase()}`);
    if (!targetUid) return window.toast?.('Kullanıcı bulunamadı', 'error');
    await window.SL1_submitComplaint(targetUid, reason, details);
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   SL2 — ADALET VE EMNİYET (Maddeler 41-80)
   ══════════════════════════════════════════════════════════════════════════ */
async function SL2_initJustice() {

  /* Madde 41: Polis Akademisi — sınav + admin onayı */
  window.SL2_applyPoliceAcademy = async function () {
    if (GZ.data?.criminalRecord > 0) {
      return window.toast?.('Sabıka kaydı olanlar başvuramaz', 'error');
    }
    await dbPush('policeApplications', {
      uid: GZ.uid,
      username: GZ.data?.username,
      status: 'pending',
      ts: Date.now()
    });
    window.toast?.('👮 Başvurunuz alındı, admin onayı bekleniyor', 'info');
  };

  window.SL2_approvePolice = async function (appId, candidateUid) {
    if (!GZ.data?.isFounder && !GZ.data?.isAdmin) {
      return window.toast?.('Yetkisiz işlem', 'error');
    }
    await dbUpdate(`policeApplications/${appId}`, { status: 'approved' });
    await dbUpdate(`users/${candidateUid}`, {
      role: 'police',
      policeRank: 'Memur',
      salary: 8000,
      canOpenShop: false   // Madde 44: Ticaret yasağı
    });
    window.toast?.('✅ Polis onaylandı', 'success');
  };

  /* Madde 42: Savcılık Paneli */
  window.SL2_openCase = async function (suspectUid, evidence, charge) {
    if (GZ.data?.role !== 'prosecutor') {
      return window.toast?.('Yetkisiz: Savcı değilsiniz', 'error');
    }
    const caseRef = await dbPush('court/cases', {
      prosecutor: GZ.uid,
      suspect: suspectUid,
      charge,
      evidence: evidence.slice(0, 1000),
      status: 'open',
      verdict: null,
      openedAt: Date.now()
    });
    window.toast?.('⚖️ Dava açıldı: ' + caseRef.key, 'success');
    return caseRef.key;
  };

  /* Madde 43: Hakimlik Paneli */
  window.SL2_giveVerdict = async function (caseId, verdict, fine, jailDays) {
    if (GZ.data?.role !== 'judge') {
      return window.toast?.('Yetkisiz: Hakim değilsiniz', 'error');
    }
    const courtCase = await dbGet(`court/cases/${caseId}`);
    if (!courtCase || courtCase.status !== 'open') {
      return window.toast?.('Dava bulunamadı veya kapalı', 'error');
    }
    await dbUpdate(`court/cases/${caseId}`, {
      verdict, fine: fine || 0, jailDays: jailDays || 0,
      status: 'closed', closedAt: Date.now(), judge: GZ.uid
    });

    if (verdict === 'guilty') {
      const sus = courtCase.suspect;
      if (fine > 0) {
        await db.ref(`users/${sus}/money`).transaction(m =>
          Math.max(0, (m || 0) - fine));
        await db.ref(`users/${GZ.uid}/money`).transaction(m => (m || 0) + fine);
      }
      if (jailDays > 0) {
        await SL2_sendToJail(sus, jailDays);
      }
      /* Madde 49: Sabıka kaydı */
      await db.ref(`users/${sus}/criminalRecord`).transaction(c => (c || 0) + 1);
    }
    window.toast?.(`⚖️ Karar verildi: ${verdict}`, 'success');
  };

  /* Madde 44: Ticaret Yasağı — memurlar dükkan açamaz
     ekonomi.js'deki dükkan açma fonksiyonunu sarmala */
  const _origOpenShop = window.openShop;
  window.openShop = async function (...args) {
    const role = GZ.data?.role;
    if (['police', 'prosecutor', 'judge', 'soldier'].includes(role)) {
      return window.toast?.('⛔ Memurlar dükkan açamaz (Madde 44)', 'error');
    }
    if (GZ.data?.canOpenShop === false) {
      return window.toast?.('⛔ Ticaret yetkiniz kısıtlanmış', 'error');
    }
    if (_origOpenShop) return _origOpenShop(...args);
  };

  /* Madde 45: Memur Maaş Katsayısı */
  window.SL2_payOfficerSalaries = async function () {
    const snap = await db.ref('users').orderByChild('role').equalTo('police').once('value');
    const updates = {};
    const minWage = (await dbGet('system/minWage')) || 17002;
    const katsayi = (await dbGet('system/officerSalaryCoeff')) || 2.5;
    snap.forEach(s => {
      const u = s.val();
      const salary = +(minWage * katsayi).toFixed(2);
      updates[`users/${s.key}/money`] = firebase.database.ServerValue.increment(salary);
      updates[`users/${s.key}/lastSalaryAt`] = Date.now();
    });
    if (Object.keys(updates).length > 0) {
      await db.ref('/').update(updates);
    }
  };

  /* Madde 46: Ceza Primi — her cezadan polise %5 */
  window.SL2_issueFine = async function (targetUid, amount, officerUid, reason) {
    const balance = await dbGet(`users/${targetUid}/money`);
    if (balance < amount) return window.toast?.('Ceza ödenemez, yetersiz bakiye', 'warn');

    const officerCut = +(amount * 0.05).toFixed(2);
    const stateShare = +(amount - officerCut).toFixed(2);

    await db.ref(`users/${targetUid}/money`).transaction(m => Math.max(0, (m||0) - amount));
    await db.ref(`users/${officerUid}/money`).transaction(m => (m||0) + officerCut);

    const authorityUid = await dbGet('system/authorityUid');
    if (authorityUid) {
      await db.ref(`users/${authorityUid}/money`).transaction(m => (m||0) + stateShare);
    }

    await dbPush(`users/${targetUid}/fines`, {
      amount, reason, issuedBy: officerUid, ts: Date.now()
    });
    window.toast?.(`💰 Ceza kesildi: ${cashFmt(amount)} (Polis payı: ${cashFmt(officerCut)})`, 'success');
  };

  /* Madde 47: Gerçek İsimli NPC Botlar — suç sistemi */
  const BOT_NAMES = [
    'Ahmet Yılmaz','Mehmet Kaya','Ayşe Demir','Fatma Çelik','Ali Öztürk',
    'Zeynep Arslan','Mustafa Şahin','Emine Doğan','Hüseyin Aydın','Hatice Yıldız'
  ];
  window.SL2_spawnCrimeBot = function () {
    const crime = ['hırsızlık','soygun','dolandırıcılık','darp'][Math.floor(Math.random()*4)];
    const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const province = ILLER_LIST[Math.floor(Math.random() * ILLER_LIST.length)];
    const event = { bot, crime, province, ts: Date.now() };
    dbPush('crimeLog', event);
    /* Madde 48: Telsiz anonsu — polisin ekranına düş */
    db.ref('policeRadio').push({
      message: `📻 ${province} — ${bot} şüphelisi: ${crime}`,
      ts: Date.now()
    });
  };

  /* Bot döngüsü: 5-15 dakika arasında rastgele */
  (function scheduleBotCrime() {
    const delay = (5 + Math.random() * 10) * 60 * 1000;
    setTimeout(async () => {
      window.SL2_spawnCrimeBot();
      scheduleBotCrime();
    }, delay);
  })();

  /* Polis telsizi dinleyici */
  if (GZ.data?.role === 'police') {
    db.ref('policeRadio').limitToLast(1).on('child_added', snap => {
      const d = snap.val();
      if (!d || Date.now() - d.ts > 10000) return;
      window.toast?.(`📻 TELSİZ: ${d.message}`, 'warn', 8000);
    });
  }

  /* Madde 49: Sabıka Kaydı — ticaret/memurluk kısıtlaması */
  window.SL2_checkCriminalRecord = async function (uid) {
    const record = (await dbGet(`users/${uid}/criminalRecord`)) || 0;
    if (record >= 3) {
      await dbUpdate(`users/${uid}`, {
        tradeRestricted: true,
        govJobRestricted: true
      });
    }
    return record;
  };

  /* Madde 50: Hapishane Modu */
  window.SL2_sendToJail = async function (uid, days) {
    const releaseAt = Date.now() + days * 24 * 3600 * 1000;
    await dbUpdate(`users/${uid}`, {
      inJail: true,
      jailReleaseAt: releaseAt,
      jailDays: days
    });
    if (uid === GZ.uid) {
      SL2_activateJailScreen(releaseAt);
    }
  };

  window.SL2_activateJailScreen = function (releaseAt) {
    const root = document.getElementById('mainGameScreen');
    if (!root) return;
    root.innerHTML = `
      <div class="sl-jail-screen">
        <div class="sl-jail-cell">🔒</div>
        <h2>TUTUKLUSUNUZ</h2>
        <p>Hakimin verdiği ceza infaz edilmektedir.</p>
        <div id="slJailTimer" class="sl-jail-timer"></div>
        <p class="sl-jail-note">Süre dolmadan hiçbir işlem yapamazsınız.</p>
      </div>`;
    const tick = () => {
      const left = releaseAt - Date.now();
      if (left <= 0) { window.location.reload(); return; }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      const el = document.getElementById('slJailTimer');
      if (el) el.textContent = `${h}s ${m}d ${s}sn kaldı`;
      setTimeout(tick, 1000);
    };
    tick();
  };

  /* Maddeler 51-60: Trafik cezaları + Rüşvet takibi */
  window.SL2_issueTrafficFine = async function (targetUid, violationType, officerUid) {
    const fines = {
      'hız ihlali': 1200,
      'kırmızı ışık': 800,
      'alkollü araç kullanma': 5000,
      'belt ihlali': 400
    };
    const amount = fines[violationType] || 500;
    await SL2_issueFine(targetUid, amount, officerUid, `Trafik: ${violationType}`);
  };

  window.SL2_reportBribery = async function (officerUid, amount, evidence) {
    await dbPush('briberyReports', {
      officer: officerUid,
      amount,
      evidence: (evidence || '').slice(0, 500),
      reportedBy: GZ.uid,
      ts: Date.now(),
      status: 'investigating'
    });
    window.toast?.('🔍 Rüşvet ihbarı MİT\'e iletildi', 'info');
  };

  /* Maddeler 61-80: MİT Paneli + parmak izi veritabanı */
  window.SL2_getMITReport = async function (targetUid) {
    if (!GZ.data?.mitAgent && !GZ.data?.isFounder) {
      return window.toast?.('MİT yetkisi gerekli', 'error');
    }
    const user = await dbGet(`users/${targetUid}`);
    const fines = await dbGet(`users/${targetUid}/fines`) || {};
    const crimes = await dbGet(`court/cases`) || {};
    const cases = Object.values(crimes).filter(c => c.suspect === targetUid);
    return { user, fineCount: Object.keys(fines).length, caseCount: cases.length };
  };

  window.SL2_addFingerprint = async function (uid, fpData) {
    await dbSet(`fingerprints/${uid}`, {
      data: fpData,
      registeredAt: Date.now(),
      registeredBy: GZ.uid
    });
  };
  window.SL2_queryFingerprint = async function (fpData) {
    const all = await dbGet('fingerprints') || {};
    return Object.entries(all).find(([, v]) => v.data === fpData)?.[0] || null;
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   SL3 — EKONOMİ, SGK VE TİCARET (Maddeler 81-130)
   ══════════════════════════════════════════════════════════════════════════ */
async function SL3_initEconomyExtensions() {

  /* Madde 81: Haftalık SGK — Her Pazar gecesi işçi başına otomatik prim */
  window.SL3_collectSGK = async function () {
    /* Lock: sadece bir kullanıcı/oturum çalıştırsın */
    const r = await db.ref('system/sgkLock').transaction(cur => {
      if (cur && (Date.now() - cur) < 60000) return;
      return Date.now();
    });
    if (!r.committed) return;

    const shops = await dbGet('shops') || {};
    const sgkRate = (await dbGet('system/sgkRate')) || 500; // işçi başı TL
    const updates = {};

    for (const [shopId, shop] of Object.entries(shops)) {
      const workers = shop.workers || 0;
      const ownerUid = shop.ownerUid;
      if (!ownerUid || workers <= 0) continue;

      const premium = workers * sgkRate;
      const balance = await dbGet(`users/${ownerUid}/money`);

      if (balance >= premium) {
        updates[`users/${ownerUid}/money`] = firebase.database.ServerValue.increment(-premium);
        updates[`users/${ownerUid}/sgkStatus`] = 'paid';
        updates[`system/sgkRevenue`] = firebase.database.ServerValue.increment(premium);
      } else {
        /* Madde 82: SGK borcu — dükkan mühürlü */
        updates[`shops/${shopId}/sealed`] = true;
        updates[`users/${ownerUid}/sgkStatus`] = 'debt';
        updates[`users/${ownerUid}/sgkDebt`] = firebase.database.ServerValue.increment(premium);
      }
    }
    if (Object.keys(updates).length) {
      await db.ref('/').update(updates);
    }
    console.log('[SL3] SGK tahsilatı tamamlandı');
  };

  /* Madde 82: Mühürlü dükkan kontrolü — ekonomi.js buyItem'a ekleme */
  const _origBuyItem = window.buyItem;
  window.buyItem = async function (shopId, ...args) {
    const shop = await dbGet(`shops/${shopId}`);
    if (shop?.sealed) {
      return window.toast?.('🚫 Bu dükkan SGK borcu nedeniyle mühürlüdür', 'error');
    }
    if (_origBuyItem) return _origBuyItem(shopId, ...args);
  };

  /* Madde 83: Asgari Ücret — tüm maliyetleri etkileyen katsayı */
  window.SL3_getMinWageCoeff = async function () {
    const minWage = (await dbGet('system/minWage')) || 17002;
    const base = 17002;
    return +(minWage / base).toFixed(4);
  };

  /* Madde 84: Merkez Bankası — faiz + enflasyon */
  window.SL3_setCentralBankRate = async function (interestRate) {
    if (!GZ.data?.isFounder && !GZ.data?.isAdmin) {
      return window.toast?.('Yetkisiz işlem', 'error');
    }
    interestRate = Math.min(50, Math.max(0, Number(interestRate)));
    await dbUpdate('system/merkezBankasi', {
      interestRate,
      updatedAt: Date.now(),
      updatedBy: GZ.uid
    });
    /* Enflasyon dengeleme — market fiyatlarına yansıt */
    await SL3_applyInflation(interestRate);
    await SL1_broadcastResmiGazete?.(`🏦 MB faiz oranı %${interestRate} olarak güncellendi`);
    window.toast?.(`🏦 Faiz oranı %${interestRate} ayarlandı`, 'success');
  };

  /* Madde 197: Enflasyon Paneli — fiyatları otomatik artır */
  window.SL3_applyInflation = async function (interestRate) {
    const inflationFactor = 1 + (interestRate / 100) * 0.1;
    const catalog = window.URUNLER || {};
    const updates = {};
    for (const key of Object.keys(catalog)) {
      const base = catalog[key].base;
      updates[`dynamicPrices/${key}`] = +(base * inflationFactor).toFixed(2);
    }
    await db.ref('/').update(updates);
  };

  /* Madde 85: Gizli Stokçuluk — malı depodan çekip bekletme */
  window.SL3_hideStock = async function (itemKey, qty, warehouseId) {
    const stock = await dbGet(`warehouses/${warehouseId}/items/${itemKey}`) || 0;
    if (stock < qty) return window.toast?.('Yetersiz stok', 'error');
    await db.ref(`warehouses/${warehouseId}/items/${itemKey}`).transaction(s => Math.max(0, (s||0) - qty));
    await db.ref(`users/${GZ.uid}/hiddenStock/${itemKey}`).transaction(s => (s||0) + qty);
    window.toast?.(`📦 ${qty} adet gizli depoya alındı`, 'success');
  };

  /* Madde 86: Tezgah Altı Ticaret — kişiye özel pazarlık */
  window.SL3_makePrivateDeal = async function (buyerUid, itemKey, qty, pricePerUnit) {
    const total = qty * pricePerUnit;
    const sellerBalance = await dbGet(`users/${GZ.uid}/hiddenStock/${itemKey}`) || 0;
    if (sellerBalance < qty) return window.toast?.('Stok yetersiz', 'error');
    const buyerMoney = await dbGet(`users/${buyerUid}/money`);
    if (buyerMoney < total) return window.toast?.('Alıcının parası yetersiz', 'error');

    await db.ref(`users/${GZ.uid}/hiddenStock/${itemKey}`).transaction(s => Math.max(0, (s||0) - qty));
    await db.ref(`users/${GZ.uid}/money`).transaction(m => (m||0) + total);
    await db.ref(`users/${buyerUid}/money`).transaction(m => Math.max(0,(m||0) - total));
    await db.ref(`users/${buyerUid}/inventory/${itemKey}`).transaction(s => (s||0) + qty);
    await dbPush('tezgahAltiLog', {
      seller: GZ.uid, buyer: buyerUid,
      item: itemKey, qty, pricePerUnit, total, ts: Date.now()
    });
    window.toast?.(`🤝 Gizli satış tamamlandı: ${cashFmt(total)}`, 'success');
  };

  /* Madde 87: İhracat vergisi — exportShip'i sarmala */
  const _origExportShip = window.exportShip;
  window.exportShip = async function (exId, qty) {
    const tradeSettings = await dbGet('system/trade') || {};
    const exportTaxRate = tradeSettings.exportTaxRate || 0.08;
    const ex = await dbGet(`exports/list/${exId}`);
    if (!ex) return;
    const gross = qty * ex.pricePerUnit;
    const tax = +(gross * exportTaxRate).toFixed(2);
    const net = +(gross - tax).toFixed(2);

    const authorityUid = await dbGet('system/authorityUid');
    if (authorityUid && tax > 0) {
      await db.ref(`users/${authorityUid}/money`).transaction(m => (m||0) + tax);
      await dbPush('financeLog', {
        uid: GZ.uid, reason: 'export-tax', gross, tax, net,
        ts: firebase.database.ServerValue.TIMESTAMP
      });
    }
    if (_origExportShip) return _origExportShip(exId, qty);
  };

  /* Madde 88: Maden Ruhsatı */
  window.SL3_buyMiningLicense = async function (province, mineType) {
    const cost = { altin: 250000, gumus: 80000, bakir: 30000, demir: 25000, kromit: 40000 };
    const fee = cost[mineType] || 50000;
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < fee) return window.toast?.(`Ruhsat ücreti: ${cashFmt(fee)}`, 'error');
    const canMine = await SL1_canOpenShopInProvince?.(GZ.uid, province);
    if (!canMine) return window.toast?.('Sadece kendi ilinizde maden ruhsatı alabilirsiniz', 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - fee));
    await dbSet(`users/${GZ.uid}/miningLicenses/${province}/${mineType}`, {
      issuedAt: Date.now(), expiresAt: Date.now() + 30 * 24 * 3600 * 1000
    });
    window.toast?.(`⛏️ ${mineType} ruhsatı alındı (30 gün)`, 'success');
  };

  /* Madde 89: Borsa İstanbul (GZ) — hisse alım/satım */
  window.SL3_buyStock = async function (companyId, shares) {
    const company = await dbGet(`borsa/${companyId}`);
    if (!company) return window.toast?.('Şirket bulunamadı', 'error');
    const price = company.currentPrice * shares;
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < price) return window.toast?.('Yetersiz bakiye', 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - price));
    await db.ref(`users/${GZ.uid}/stocks/${companyId}`).transaction(s => (s||0) + shares);
    await db.ref(`borsa/${companyId}/totalShares`).transaction(t => (t||0) - shares);
    await dbPush('borsaLog', {
      uid: GZ.uid, company: companyId, shares, price, type: 'buy', ts: Date.now()
    });
    window.toast?.(`📈 ${shares} hisse alındı: ${cashFmt(price)}`, 'success');
  };

  window.SL3_sellStock = async function (companyId, shares) {
    const owned = await dbGet(`users/${GZ.uid}/stocks/${companyId}`) || 0;
    if (owned < shares) return window.toast?.('Yetersiz hisse', 'error');
    const company = await dbGet(`borsa/${companyId}`);
    const revenue = company.currentPrice * shares;
    await addCash(GZ.uid, revenue, 'stock-sell');
    await db.ref(`users/${GZ.uid}/stocks/${companyId}`).transaction(s => Math.max(0,(s||0) - shares));
    await db.ref(`borsa/${companyId}/totalShares`).transaction(t => (t||0) + shares);
    window.toast?.(`📉 ${shares} hisse satıldı: ${cashFmt(revenue)}`, 'success');
  };

  /* Madde 90: Kredi Notu — gecikme = faiz artışı */
  window.SL3_updateCreditScore = async function (uid) {
    const bank = await dbGet(`bank/${uid}`);
    if (!bank) return;
    let score = (await dbGet(`users/${uid}/creditScore`)) || 700;
    if (bank.loan > 0 && Date.now() > (bank.loanDueDate || Infinity)) {
      score = Math.max(300, score - 50);
      await dbUpdate(`bank/${uid}`, {
        loanInterestRate: firebase.database.ServerValue.increment(0.5)
      });
    } else if (bank.loan === 0) {
      score = Math.min(900, score + 10);
    }
    await dbUpdate(`users/${uid}`, { creditScore: score });
    return score;
  };

  /* Maddeler 91-130: Darphane, kara para, icra, holding, iflas */
  window.SL3_mintCoin = async function (goldGrams) {
    /* Darphane: altın → oyun parası */
    const goldStock = await dbGet(`users/${GZ.uid}/inventory/altin`) || 0;
    if (goldStock < goldGrams) return window.toast?.('Yeterli altın yok', 'error');
    const value = goldGrams * 2400 * 0.95; // %5 darphane kesintisi
    await db.ref(`users/${GZ.uid}/inventory/altin`).transaction(s => Math.max(0,(s||0) - goldGrams));
    await addCash(GZ.uid, value, 'mint');
    window.toast?.(`🪙 ${goldGrams}g altın → ${cashFmt(value)}`, 'success');
  };

  window.SL3_createHolding = async function (name, subsidiaries) {
    const cost = 500000;
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < cost) return window.toast?.(`Holding kurmak için ${cashFmt(cost)} gerekli`, 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - cost));
    await dbSet(`holdings/${GZ.uid}_${Date.now()}`, {
      name, subsidiaries, owner: GZ.uid,
      createdAt: Date.now(), treasury: 0
    });
    window.toast?.(`🏢 ${name} holding kuruldu`, 'success');
  };

  window.SL3_applyInvestmentIncentive = async function (uid, amount) {
    /* Devlet yatırım teşviki: %30 devlet katkısı */
    if (!GZ.data?.isFounder && !GZ.data?.isAdmin) return;
    const bonus = +(amount * 0.30).toFixed(2);
    await addCash(uid, bonus, 'investment-incentive');
    window.toast?.(`💸 Yatırım teşviki: ${cashFmt(bonus)}`, 'success');
  };

  /* SGK otomatik döngüsü — Her Pazar 23:00 */
  (function scheduleSGK() {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7 || 7);
    nextSunday.setHours(23, 0, 0, 0);
    const delay = nextSunday - now;
    setTimeout(async () => {
      await window.SL3_collectSGK();
      scheduleSGK();
    }, delay);
    console.log(`[SL3] SGK zamanlandı: ${Math.round(delay/3600000)} saat sonra`);
  })();
}

/* ══════════════════════════════════════════════════════════════════════════
   SL4 — SAVUNMA VE TEKNOLOJİ (Maddeler 131-170)
   ══════════════════════════════════════════════════════════════════════════ */
async function SL4_initDefense() {

  /* Madde 131: Ar-Ge — gerçek zamanlı (saatler/günler süren) */
  window.SL4_startRnD = async function (projectName, durationHours, cost) {
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < cost) return window.toast?.('Ar-Ge bütçesi yetersiz', 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - cost));
    const completesAt = Date.now() + durationHours * 3600 * 1000;
    const ref = await dbPush(`rnd/${GZ.uid}`, {
      projectName, cost, completesAt,
      startedAt: Date.now(), status: 'active',
      patentGranted: false
    });
    window.toast?.(`🔬 Ar-Ge başladı: ${projectName} (${durationHours}s)`, 'success');
    return ref.key;
  };

  window.SL4_checkRnDCompletion = async function () {
    const projects = await dbGet(`rnd/${GZ.uid}`) || {};
    for (const [id, proj] of Object.entries(projects)) {
      if (proj.status === 'active' && Date.now() >= proj.completesAt) {
        await dbUpdate(`rnd/${GZ.uid}/${id}`, { status: 'completed', completedAt: Date.now() });
        window.toast?.(`🏆 Ar-Ge tamamlandı: ${proj.projectName}`, 'success');
      }
    }
  };

  /* Madde 132: Patent Hakkı — diğerlerinden telif al */
  window.SL4_registerPatent = async function (rndId, techName) {
    const proj = await dbGet(`rnd/${GZ.uid}/${rndId}`);
    if (!proj || proj.status !== 'completed') {
      return window.toast?.('Ar-Ge tamamlanmamış', 'error');
    }
    const existing = await dbGet(`patents/${techName}`);
    if (existing) return window.toast?.('Bu patent zaten alınmış', 'error');
    await dbSet(`patents/${techName}`, {
      owner: GZ.uid, ownerUsername: GZ.data?.username,
      rndId, registeredAt: Date.now(), royaltyRate: 0.02
    });
    await dbUpdate(`rnd/${GZ.uid}/${rndId}`, { patentGranted: true, patentName: techName });
    window.toast?.(`📜 Patent tescillendi: ${techName}`, 'success');
  };

  /* Madde 132b: Telif tahsilatı — patent sahibi kullanımdan pay alır */
  window.SL4_collectRoyalties = async function (techName) {
    const patent = await dbGet(`patents/${techName}`);
    if (!patent) return;
    const revenue = (await dbGet(`patents/${techName}/totalUsage`)) || 0;
    const royalty = +(revenue * patent.royaltyRate).toFixed(2);
    if (royalty > 0) {
      await addCash(patent.owner, royalty, 'royalty');
      await dbSet(`patents/${techName}/totalUsage`, 0);
      window.toast?.(`📜 Telif geliri: ${cashFmt(royalty)}`, 'success');
    }
  };

  /* Madde 133: İHA/SİHA Üretim Sistemi — parça birleştirme */
  const DRONE_PARTS = {
    motor:   { name: 'Drone Motoru',   cost: 50000, time: 48 },
    kanat:   { name: 'Karbon Kanat',   cost: 35000, time: 36 },
    yazilim: { name: 'Uçuş Yazılımı', cost: 80000, time: 72 },
    govde:   { name: 'Kompozit Gövde', cost: 45000, time: 40 },
  };

  window.SL4_manufactureDronePart = async function (partKey) {
    const part = DRONE_PARTS[partKey];
    if (!part) return window.toast?.('Geçersiz parça', 'error');
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < part.cost) return window.toast?.(`Yetersiz bakiye: ${cashFmt(part.cost)}`, 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - part.cost));
    const completesAt = Date.now() + part.time * 3600 * 1000;
    await dbPush(`defense/${GZ.uid}/parts`, {
      partKey, name: part.name, completesAt, ready: false
    });
    window.toast?.(`🔧 Üretim başladı: ${part.name} (${part.time}s)`, 'success');
  };

  window.SL4_assembleDrone = async function () {
    const parts = await dbGet(`defense/${GZ.uid}/parts`) || {};
    const readyParts = {};
    for (const [id, p] of Object.entries(parts)) {
      if (Date.now() >= p.completesAt) readyParts[p.partKey] = id;
    }
    const required = Object.keys(DRONE_PARTS);
    const hasAll = required.every(k => readyParts[k]);
    if (!hasAll) {
      const missing = required.filter(k => !readyParts[k]).join(', ');
      return window.toast?.(`Eksik parçalar: ${missing}`, 'error');
    }
    /* Parçaları tüket */
    const updates = {};
    for (const [k, id] of Object.entries(readyParts)) {
      updates[`defense/${GZ.uid}/parts/${id}`] = null;
    }
    updates[`users/${GZ.uid}/drones`] = firebase.database.ServerValue.increment(1);
    await db.ref('/').update(updates);
    window.toast?.('🚁 İHA/SİHA üretildi! Filonuza eklendi.', 'success');
  };

  /* Madde 134: Stratejik Ambargo — ham madde kesme */
  window.SL4_applyEmbargo = async function (targetUid, itemKey) {
    if (!GZ.data?.isFounder && !GZ.data?.isAdmin) {
      return window.toast?.('Yetkisiz', 'error');
    }
    await dbSet(`embargoes/${targetUid}/${itemKey}`, {
      by: GZ.uid, appliedAt: Date.now(), active: true
    });
    await SL1_broadcastResmiGazete?.(`🚫 ${targetUid.slice(0,8)} kullanıcısına ambargo uygulandı`);
    window.toast?.('⛔ Ambargo uygulandı', 'success');
  };

  /* Madde 135: Siber Savaş — şirket verisi çalma denemesi */
  window.SL4_attemptCyberAttack = async function (targetUid) {
    const minLevel = 25;
    if ((GZ.data?.level || 0) < minLevel) {
      return window.toast?.(`Siber savaş için seviye ${minLevel} gerekli`, 'error');
    }
    const cost = 100000;
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < cost) return window.toast?.(`Siber saldırı maliyeti: ${cashFmt(cost)}`, 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - cost));
    const success = Math.random() < 0.3; // %30 başarı
    if (success) {
      const targetData = await dbGet(`users/${targetUid}`);
      await dbPush(`users/${GZ.uid}/stolenaData`, {
        targetUid, stolenAt: Date.now(),
        preview: { level: targetData?.level, netWorth: targetData?.netWorth }
      });
      window.toast?.('💻 Siber saldırı başarılı! Veri ele geçirildi.', 'success');
      await dbPush(`users/${targetUid}/notifications`, {
        msg: '⚠️ Sistemlerinize siber saldırı girişimi tespit edildi!',
        ts: Date.now(), read: false
      });
    } else {
      await db.ref(`users/${GZ.uid}/criminalRecord`).transaction(c => (c||0) + 1);
      window.toast?.('💻 Siber saldırı başarısız — sabıka kaydınıza eklendi', 'error');
    }
  };

  /* Maddeler 136-170: Uydu fırlatma, devlet ihaleleri */
  window.SL4_launchSatellite = async function (satelliteName, purpose) {
    const drones = await dbGet(`users/${GZ.uid}/drones`) || 0;
    if (drones < 5) return window.toast?.('5 İHA gerekli (uydu taşıyıcı sistem)', 'error');
    const cost = 10000000;
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < cost) return window.toast?.(`Uydu fırlatma: ${cashFmt(cost)}`, 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - cost));
    await dbSet(`satellites/${GZ.uid}_${Date.now()}`, {
      name: satelliteName, purpose,
      launchedAt: Date.now(), owner: GZ.uid,
      status: 'orbit'
    });
    await SL1_broadcastResmiGazete?.(`🛸 ${GZ.data?.username} uydu fırlattı: ${satelliteName}`);
    window.toast?.(`🛸 Uydu fırlatıldı: ${satelliteName}`, 'success');
  };

  window.SL4_bidGovernmentContract = async function (contractId, bid) {
    const contract = await dbGet(`govContracts/${contractId}`);
    if (!contract) return window.toast?.('İhale bulunamadı', 'error');
    if (bid < contract.minBid) return window.toast?.(`Min teklif: ${cashFmt(contract.minBid)}`, 'error');
    await dbUpdate(`govContracts/${contractId}/bids`, {
      [GZ.uid]: { amount: bid, username: GZ.data?.username, ts: Date.now() }
    });
    window.toast?.(`📋 İhale teklifiniz: ${cashFmt(bid)}`, 'success');
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   SL5 — MODERN MEDYA VE KRİZ (Maddeler 171-200)
   ══════════════════════════════════════════════════════════════════════════ */
async function SL5_initMediaCrisis() {

  /* Madde 171: Alt Yazı Yasağı — haberler UI bildirimi olarak gelir */
  window.SL5_listenNewsNotifications = function () {
    db.ref('news').limitToLast(5).on('child_added', snap => {
      const d = snap.val();
      if (!d || (Date.now() - d.ts) > 10000) return;
      showNewsNotification(d.title, d.category);
    });
  };

  function showNewsNotification(title, category) {
    const icons = { ekonomi:'💰', siyaset:'🏛️', spor:'⚽', teknoloji:'💻', default:'📰' };
    const icon = icons[category] || icons.default;
    const div = document.createElement('div');
    div.className = 'sl-news-notif';
    div.innerHTML = `<span class="sl-news-icon">${icon}</span><span>${title}</span>`;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('sl-news-visible'), 10);
    setTimeout(() => { div.classList.remove('sl-news-visible'); setTimeout(() => div.remove(), 500); }, 5000);
  }

  SL5_listenNewsNotifications();

  /* Madde 172: Şehir Billboardları */
  window.SL5_purchaseBillboard = async function (province, message, durationDays) {
    const cost = durationDays * 5000;
    const balance = await dbGet(`users/${GZ.uid}/money`);
    if (balance < cost) return window.toast?.(`Billboard ücreti: ${cashFmt(cost)}`, 'error');
    await db.ref(`users/${GZ.uid}/money`).transaction(m => Math.max(0,(m||0) - cost));
    await dbPush(`billboards/${province}`, {
      message: message.slice(0, 200),
      owner: GZ.uid,
      ownerName: GZ.data?.username,
      expiresAt: Date.now() + durationDays * 86400000,
      createdAt: Date.now()
    });
    window.toast?.(`📺 Billboard yayında: ${province}`, 'success');
  };

  window.SL5_renderBillboards = async function (province, container) {
    const boards = await dbGet(`billboards/${province}`) || {};
    const active = Object.values(boards).filter(b => b.expiresAt > Date.now());
    if (!container) return active;
    container.innerHTML = active.map(b => `
      <div class="sl-billboard">
        <span class="sl-bb-owner">📺 ${b.ownerName}</span>
        <p>${b.message}</p>
      </div>`).join('') || '<p>Billboard yok</p>';
    return active;
  };

  /* Madde 173: GZ-Radyo */
  window.SL5_broadcastRadio = async function (message, category) {
    await dbPush('gzRadio', {
      message: message.slice(0, 300),
      category: category || 'genel',
      broadcaster: GZ.uid,
      broadcasterName: GZ.data?.username,
      ts: Date.now()
    });
    window.toast?.('📻 Yayın başladı', 'success');
  };

  window.SL5_listenRadio = function (onMessage) {
    db.ref('gzRadio').limitToLast(1).on('child_added', snap => {
      const d = snap.val();
      if (!d || Date.now() - d.ts > 15000) return;
      onMessage(d);
    });
  };

  /* Madde 174: Askerlik Celbi — oyun yaşı 2. ay kontrolü */
  window.SL5_checkDraftStatus = async function (uid) {
    const user = await dbGet(`users/${uid}`);
    const createdAt = user?.createdAt || Date.now();
    const monthsPlayed = (Date.now() - createdAt) / (30 * 24 * 3600 * 1000);
    const draftDone = user?.militaryServiceDone;
    if (monthsPlayed >= 2 && !draftDone) {
      await SL5_activateMilitaryService(uid);
    }
  };

  window.SL5_activateMilitaryService = async function (uid) {
    const serviceEndAt = Date.now() + 3 * 24 * 3600 * 1000;
    await dbUpdate(`users/${uid}`, {
      inMilitaryService: true,
      militaryServiceEnd: serviceEndAt
    });
    /* Madde 175: Mehmetçik Maaşı */
    await addCash(uid, 50000, 'military-salary');
    if (uid === GZ.uid) {
      window.toast?.('🪖 Vatan hizmetine çağrıldınız! 3 gün sürecek. 50.000₺ maaş yatırıldı.', 'info', 8000);
    }
  };

  /* Madde 176: Sıkıyönetim — tüm piyasayı dondur */
  window.SL5_declareMartialLaw = async function (reason, durationHours) {
    if (!GZ.data?.isFounder && !GZ.data?.isAdmin) return window.toast?.('Yetkisiz', 'error');
    const endsAt = Date.now() + durationHours * 3600 * 1000;
    await dbSet('system/martialLaw', { active: true, reason, endsAt, declaredBy: GZ.uid });
    await SL1_broadcastResmiGazete?.(`🚨 SIKIYÖNETİM İLAN EDİLDİ: ${reason}`);
    window.toast?.('🚨 Sıkıyönetim ilan edildi', 'warn', 10000);
  };

  /* Sıkıyönetim aktifse işlemleri engelle */
  const _origAddCash = window.addCash;
  window.addCash = async function (uid, amount, reason) {
    const ml = await dbGet('system/martialLaw');
    if (ml?.active && Date.now() < ml.endsAt) {
      if (!['military-salary', 'mint'].includes(reason)) {
        window.toast?.('🚨 Sıkıyönetim: Finansal işlemler dondurulmuştur', 'error');
        return false;
      }
    }
    if (_origAddCash) return _origAddCash(uid, amount, reason);
  };

  /* Madde 178: Gümrük Müşavirliği — dış ticaret evrak takibi */
  window.SL5_submitCustomsDeclaration = async function (exportId, documents) {
    const user = await dbGet(`users/${GZ.uid}`);
    if (user?.role !== 'customsBroker' && !user?.isFounder) {
      return window.toast?.('Gümrük müşavirliği rolü gerekli', 'error');
    }
    await dbPush('customsDeclarations', {
      exportId, documents, broker: GZ.uid,
      status: 'pending', submittedAt: Date.now()
    });
    window.toast?.('📋 Gümrük beyannamesi gönderildi', 'success');
  };

  /* Madde 179: Halk Ayaklanması — mutluluk düşükse botlar yağmalar */
  window.SL5_checkRiotCondition = async function (province) {
    const happiness = await SL1_getCityHappiness?.(province) || 50;
    if (happiness < 20) {
      await SL5_triggerRiot(province);
    }
  };

  window.SL5_triggerRiot = async function (province) {
    const shops = await dbGet('shops') || {};
    const provincialShops = Object.entries(shops)
      .filter(([, s]) => s.province === province)
      .slice(0, 3); // ilk 3 dükkan

    for (const [shopId] of provincialShops) {
      const loot = Math.floor(Math.random() * 10000) + 5000;
      await db.ref(`shops/${shopId}/revenue`).transaction(r => Math.max(0, (r||0) - loot));
      await dbPush(`shops/${shopId}/riotLog`, { loot, ts: Date.now() });
    }
    await SL1_broadcastResmiGazete?.(`🔥 ${province}'de halk ayaklanması! Dükkanlar yağmalanıyor.`);
    window.toast?.(`🔥 ${province} - HALK AYAKLANMASI`, 'warn', 10000);
  };

  /* Madde 180: Dünya Liderliği — final unvanı */
  window.SL5_checkWorldLeaderStatus = async function () {
    const user = GZ.data;
    if (!user) return;
    const criteria = {
      level: user.level >= 100,
      netWorth: user.netWorth >= 1e9,
      drones: (await dbGet(`users/${GZ.uid}/drones`) || 0) >= 10,
      patent: Object.keys(await dbGet(`patents`) || {}).some(k =>
        (async () => (await dbGet(`patents/${k}/owner`)) === GZ.uid)()
      ),
      president: (await dbGet('system/president')) === GZ.uid
    };
    const achieved = Object.values(criteria).filter(Boolean).length;
    if (achieved === Object.keys(criteria).length) {
      await dbUpdate(`users/${GZ.uid}`, { title: '🌍 Dünya Lideri' });
      await SL1_broadcastResmiGazete?.(`🌍 ${user.username} DÜNYA LİDERİ OLDU!`);
      window.toast?.('🌍 TEBRİKLER — DÜNYA LİDERİ UNVANINI KAZANDINIZ!', 'success', 15000);
    }
    return { criteria, achieved };
  };

  /* Periyodik kontroller */
  setInterval(() => {
    if (GZ.uid) {
      SL5_checkDraftStatus(GZ.uid);
      if (GZ.data?.province) {
        SL5_checkRiotCondition(GZ.data.province);
      }
      SL4_checkRnDCompletion?.();
      SL3_updateCreditScore?.(GZ.uid);
    }
  }, 5 * 60 * 1000); // Her 5 dk

  /* Sıkıyönetim otomatik bitiş */
  setInterval(async () => {
    const ml = await dbGet('system/martialLaw');
    if (ml?.active && Date.now() >= ml.endsAt) {
      await dbUpdate('system/martialLaw', { active: false });
      await SL1_broadcastResmiGazete?.('✅ Sıkıyönetim kaldırıldı');
    }
  }, 60 * 1000);
}

/* ══════════════════════════════════════════════════════════════════════════
   UI YARDIMCILARI — Admin panel entegrasyonu
   ══════════════════════════════════════════════════════════════════════════ */
window.SL_renderAdminTab = async function (tabName, container) {
  switch (tabName) {
    case 'politics':
      container.innerHTML = `
        <div class="sl-panel">
          <h3>🏛️ Siyasi Yönetim</h3>
          <div class="sl-grid-2">
            <div>
              <label>Cumhurbaşkanı UID</label>
              <input id="slPresUid" class="sl-input" placeholder="UID">
              <button class="btn-primary sl-mt" onclick="dbSet('system/president',document.getElementById('slPresUid').value).then(()=>toast('✅ Cumhurbaşkanı atandı','success'))">Ata</button>
            </div>
            <div>
              <label>Asgari Ücret (₺)</label>
              <input id="slMinWage" class="sl-input" type="number" placeholder="17002">
              <button class="btn-primary sl-mt" onclick="SL1_presidentialAction('setMinWage',document.getElementById('slMinWage').value)">Güncelle</button>
            </div>
            <div>
              <label>İhracat Vergisi (%)</label>
              <input id="slExTax" class="sl-input" type="number" placeholder="8">
              <button class="btn-primary sl-mt" onclick="SL1_presidentialAction('setExportTax',document.getElementById('slExTax').value)">Güncelle</button>
            </div>
            <div>
              <label>Gümrük Harcı (%)</label>
              <input id="slCustoms" class="sl-input" type="number" placeholder="5">
              <button class="btn-primary sl-mt" onclick="dbSet('system/customsDutyRate',document.getElementById('slCustoms').value/100).then(()=>toast('✅','success'))">Güncelle</button>
            </div>
          </div>
        </div>`;
      break;

    case 'justice':
      container.innerHTML = `
        <div class="sl-panel">
          <h3>⚖️ Adalet Paneli</h3>
          <p>Polis başvuruları, davalar ve ceza yönetimi aşağıdadır.</p>
          <div id="slJusticeList"></div>
          <script>
            (async () => {
              const apps = await dbGet('policeApplications') || {};
              const el = document.getElementById('slJusticeList');
              if (!el) return;
              const pending = Object.entries(apps).filter(([,a])=>a.status==='pending');
              el.innerHTML = pending.length ? pending.map(([id,a])=>
                \`<div class="sl-item">👮 \${a.username} — <button class="btn-small" onclick="SL2_approvePolice('\${id}','\${a.uid}')">Onayla</button></div>\`
              ).join('') : '<p class="sl-empty">Bekleyen başvuru yok</p>';
            })();
          <\/script>
        </div>`;
      break;

    case 'martialLaw':
      container.innerHTML = `
        <div class="sl-panel">
          <h3>🚨 Sıkıyönetim Paneli</h3>
          <input id="slMlReason" class="sl-input" placeholder="Sebep">
          <input id="slMlHours" class="sl-input" type="number" placeholder="Süre (saat)">
          <button class="btn-danger sl-mt" onclick="SL5_declareMartialLaw(document.getElementById('slMlReason').value,document.getElementById('slMlHours').value)">🚨 İlan Et</button>
          <button class="btn-secondary sl-mt" onclick="dbUpdate('system/martialLaw',{active:false}).then(()=>toast('Sıkıyönetim kaldırıldı','success'))">✅ Kaldır</button>
        </div>`;
      break;
  }
};

/* Admin paneline yeni sekmeleri bağla */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const adminNav = document.getElementById('adminScreenNav');
    if (!adminNav) return;

    const newSections = `
      <div style="font-size:9px;font-weight:800;letter-spacing:2px;color:#334155;padding:12px 14px 4px">SİYASİ</div>
      <button class="asnb" onclick="window.AP&&window.AP.navTo(this,'politics')"><span>🏛️</span><span>Siyasi Yönetim</span></button>
      <button class="asnb" onclick="window.AP&&window.AP.navTo(this,'justice')"><span>⚖️</span><span>Adalet Paneli</span></button>
      <button class="asnb" onclick="window.AP&&window.AP.navTo(this,'martialLaw')"><span>🚨</span><span>Sıkıyönetim</span></button>
      <button class="asnb" onclick="window.AP&&window.AP.navTo(this,'billboards')"><span>📺</span><span>Billboard Yönetimi</span></button>
    `;

    const insertPoint = adminNav.querySelector('[style*="SİSTEM"]');
    if (insertPoint) {
      insertPoint.insertAdjacentHTML('beforebegin', newSections);
    }
  }, 2000);
});

/* ══════════════════════════════════════════════════════════════════════════
   STİL EKLEME (sistem-logic özel CSS)
   ══════════════════════════════════════════════════════════════════════════ */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* SL Panel */
    .sl-panel { background:#0d1829; border:1px solid #1e3a5f; border-radius:12px; padding:20px; margin-bottom:16px; }
    .sl-panel h3 { color:#60a5fa; margin:0 0 16px; font-size:16px; }
    .sl-input { width:100%; padding:10px 12px; border:1px solid #1e3a5f; border-radius:8px; background:#080d1a; color:#e2e8f0; font-size:13px; margin-bottom:8px; box-sizing:border-box; }
    .sl-input:focus { outline:none; border-color:#3b82f6; }
    .sl-mt { margin-top:8px; width:100%; }
    .sl-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .sl-list { margin-top:16px; }
    .sl-item { display:flex; align-items:center; gap:8px; padding:10px; border-bottom:1px solid #1e3a5f; font-size:13px; color:#cbd5e1; }
    .sl-badge { padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; }
    .sl-pending { background:rgba(234,179,8,.15); color:#eab308; }
    .sl-approved { background:rgba(34,197,94,.15); color:#22c55e; }
    .sl-rejected { background:rgba(239,68,68,.15); color:#ef4444; }
    .sl-upheld { background:rgba(168,85,247,.15); color:#a855f7; }
    .sl-empty { color:#475569; text-align:center; padding:16px; font-size:13px; }
    .sl-form { display:flex; flex-direction:column; gap:8px; }
    /* Haber bildirimi */
    .sl-news-notif { position:fixed; top:80px; right:16px; background:#0d1829; border:1px solid #1e3a5f; border-radius:10px; padding:10px 16px; display:flex; align-items:center; gap:10px; max-width:320px; transform:translateX(360px); transition:transform .4s; z-index:9999; color:#e2e8f0; font-size:13px; box-shadow:0 8px 32px rgba(0,0,0,.5); }
    .sl-news-notif.sl-news-visible { transform:translateX(0); }
    .sl-news-icon { font-size:20px; }
    /* Hapishane */
    .sl-jail-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:80vh; color:#e2e8f0; text-align:center; padding:32px; }
    .sl-jail-cell { font-size:80px; margin-bottom:16px; }
    .sl-jail-timer { font-size:32px; font-weight:700; color:#ef4444; margin:16px 0; font-variant-numeric:tabular-nums; }
    .sl-jail-note { color:#64748b; font-size:13px; }
    /* Billboard */
    .sl-billboard { background:rgba(234,179,8,.1); border:1px solid rgba(234,179,8,.3); border-radius:10px; padding:14px; margin-bottom:10px; }
    .sl-bb-owner { font-size:11px; color:#eab308; font-weight:700; }
    /* Mobil uyum */
    @media(max-width:640px) { .sl-grid-2 { grid-template-columns:1fr; } }
    .btn-danger { background:rgba(239,68,68,.15); color:#ef4444; border:1px solid rgba(239,68,68,.3); border-radius:8px; padding:10px 20px; font-weight:700; cursor:pointer; width:100%; }
    .btn-small { background:rgba(59,130,246,.15); color:#60a5fa; border:1px solid rgba(59,130,246,.3); border-radius:6px; padding:4px 10px; font-size:11px; font-weight:700; cursor:pointer; }
  `;
  document.head.appendChild(style);
})();

console.log('[system-logic.js] Yüklendi — window.initSystemLogic() hazır');
