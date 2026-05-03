/* ==========================================================================
   mini-oyunlar.js — 50 Mini Oyun + Bağımsız Seviye Sistemi
   ─────────────────────────────────────────────────────────────────────────
   ▸ Her oyunun KENDİ seviyesi (oynadıkça XP, seviye = ödül çarpanı bonusu)
   ▸ Ana oyun seviyesi unlock kapısı
   ▸ Günlük oyun limiti (sömürüye karşı)
   ▸ House edge ~3-5% (gerçekçi RTP)
   ▸ Beceri/zeka oyunları skor-bazlı kazanç
   ▸ Tüm para işlemleri transactional (spendCash/addCash)
   ▸ Tüm istatistikler Firebase'de (mini/{uid}/{gameId})
   ─────────────────────────────────────────────────────────────────────────
   KATEGORİLER: 🎲 KUMAR (25) · 🎯 BECERİ (15) · 🧠 ZEKA (10)
   ========================================================================== */

/* ╔════════════════════════════════ KAYIT ════════════════════════════════╗ */
window.GAMES = [
  // 🎲 KUMAR (25)
  { id:'yazi_tura',     name:'Yazı Tura',          emo:'🪙', cat:'kumar', minLv:1,  minBet:50,    maxBet:50000,  daily:200 },
  { id:'zar_tahmin',    name:'Zar Tahmin (1-6)',   emo:'🎲', cat:'kumar', minLv:1,  minBet:100,   maxBet:50000,  daily:200 },
  { id:'cift_tek',      name:'Çift / Tek',         emo:'⚀',  cat:'kumar', minLv:1,  minBet:50,    maxBet:80000,  daily:300 },
  { id:'yuksek_dusuk',  name:'Yüksek / Düşük',     emo:'🎴', cat:'kumar', minLv:1,  minBet:100,   maxBet:50000,  daily:200 },
  { id:'slot',          name:'Slot Makinesi',      emo:'🎰', cat:'kumar', minLv:2,  minBet:100,   maxBet:30000,  daily:300 },
  { id:'rulet',         name:'Rulet (Avrupa)',     emo:'🎡', cat:'kumar', minLv:3,  minBet:200,   maxBet:100000, daily:200 },
  { id:'crash',         name:'Crash',              emo:'🚀', cat:'kumar', minLv:3,  minBet:100,   maxBet:50000,  daily:200 },
  { id:'limbo',         name:'Limbo',              emo:'📊', cat:'kumar', minLv:3,  minBet:100,   maxBet:50000,  daily:300 },
  { id:'mines',         name:'Mayın Tarlası',      emo:'💣', cat:'kumar', minLv:4,  minBet:100,   maxBet:30000,  daily:150 },
  { id:'plinko',        name:'Plinko',             emo:'🟡', cat:'kumar', minLv:2,  minBet:50,    maxBet:20000,  daily:300 },
  { id:'kart_cek',      name:'Kart Çek',           emo:'🃏', cat:'kumar', minLv:2,  minBet:100,   maxBet:30000,  daily:200 },
  { id:'blackjack',     name:'Blackjack 21',       emo:'♠️', cat:'kumar', minLv:5,  minBet:200,   maxBet:50000,  daily:150 },
  { id:'hi_lo_chain',   name:'Hi-Lo Zinciri',      emo:'⛓️', cat:'kumar', minLv:5,  minBet:100,   maxBet:20000,  daily:100 },
  { id:'carki_felek',   name:'Çark-ı Felek',       emo:'🎡', cat:'kumar', minLv:2,  minBet:100,   maxBet:30000,  daily:200 },
  { id:'tombala',       name:'Tombala',            emo:'🎱', cat:'kumar', minLv:2,  minBet:100,   maxBet:20000,  daily:100 },
  { id:'keno',          name:'Keno (5/40)',        emo:'🔢', cat:'kumar', minLv:4,  minBet:100,   maxBet:30000,  daily:150 },
  { id:'dragon_tower',  name:'Ejder Kulesi',       emo:'🐉', cat:'kumar', minLv:6,  minBet:200,   maxBet:30000,  daily:100 },
  { id:'chicken_road',  name:'Tavuk Yolu',         emo:'🐔', cat:'kumar', minLv:3,  minBet:100,   maxBet:20000,  daily:150 },
  { id:'rulet_renk',    name:'Renk Ruleti',        emo:'🔴', cat:'kumar', minLv:1,  minBet:50,    maxBet:80000,  daily:300 },
  { id:'number_guess',  name:'Sayı Aralığı',       emo:'🎯', cat:'kumar', minLv:1,  minBet:100,   maxBet:30000,  daily:200 },
  { id:'roll_under',    name:'Düşük At',           emo:'🎲', cat:'kumar', minLv:2,  minBet:100,   maxBet:50000,  daily:300 },
  { id:'dice_battle',   name:'Zar Düellosu',       emo:'⚔️', cat:'kumar', minLv:3,  minBet:200,   maxBet:50000,  daily:150 },
  { id:'duel_card',     name:'Kart Düellosu',      emo:'🤺', cat:'kumar', minLv:2,  minBet:100,   maxBet:30000,  daily:200 },
  { id:'lottery',       name:'Piyango (6/49)',     emo:'🎟️', cat:'kumar', minLv:5,  minBet:50,    maxBet:5000,   daily:50  },
  { id:'lucky_seven',   name:'Şanslı 7 (2 zar)',   emo:'7️⃣', cat:'kumar', minLv:2,  minBet:100,   maxBet:30000,  daily:200 },

  // 🎯 BECERİ (15)
  { id:'reaksiyon',     name:'Reaksiyon Hızı',     emo:'⚡', cat:'beceri', minLv:1,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'tap_fast',      name:'Hızlı Tıkla (5sn)',  emo:'👆', cat:'beceri', minLv:1,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'aim_trainer',   name:'Nişan Eğitimi',      emo:'🎯', cat:'beceri', minLv:2,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'tic_tac_toe',   name:'XOX',                emo:'❌', cat:'beceri', minLv:1,  minBet:100, maxBet:10000, daily:100 },
  { id:'tas_kagit',     name:'Taş-Kağıt-Makas',    emo:'✂️', cat:'beceri', minLv:1,  minBet:100, maxBet:30000, daily:200 },
  { id:'snake_mini',    name:'Yılan',              emo:'🐍', cat:'beceri', minLv:2,  minBet:0, maxBet:0, daily:30,  skill:1 },
  { id:'bubble_pop',    name:'Balon Patlat',       emo:'🎈', cat:'beceri', minLv:1,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'whack_mole',    name:'Köstebek Vurma',     emo:'🔨', cat:'beceri', minLv:1,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'catch_drop',    name:'Düşeni Yakala',      emo:'🍎', cat:'beceri', minLv:2,  minBet:0, maxBet:0, daily:30,  skill:1 },
  { id:'dodge',         name:'Engelden Kaç',       emo:'🏃', cat:'beceri', minLv:3,  minBet:0, maxBet:0, daily:30,  skill:1 },
  { id:'flappy',        name:'Sek Sek',            emo:'🐦', cat:'beceri', minLv:3,  minBet:0, maxBet:0, daily:30,  skill:1 },
  { id:'type_speed',    name:'Hızlı Yazma',        emo:'⌨️', cat:'beceri', minLv:2,  minBet:0, maxBet:0, daily:30,  skill:1 },
  { id:'precision',     name:'Hassas Tıkla',       emo:'⊕',  cat:'beceri', minLv:2,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'color_match',   name:'Renk Eşleştir',      emo:'🌈', cat:'beceri', minLv:1,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'sequence_tap',  name:'Sıralı Tıkla',       emo:'1️⃣', cat:'beceri', minLv:2,  minBet:0, maxBet:0, daily:50,  skill:1 },

  // 🧠 ZEKA (10)
  { id:'memory_grid',   name:'Hafıza Eşleştir',    emo:'🧠', cat:'zeka', minLv:2,  minBet:0, maxBet:0, daily:30,  skill:1 },
  { id:'simon_says',    name:'Simon Diyor',        emo:'🎵', cat:'zeka', minLv:2,  minBet:0, maxBet:0, daily:30,  skill:1 },
  { id:'math_quick',    name:'Hızlı Matematik',    emo:'➕', cat:'zeka', minLv:1,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'order_numbers', name:'Sayı Sırala',        emo:'🔢', cat:'zeka', minLv:1,  minBet:0, maxBet:0, daily:50,  skill:1 },
  { id:'next_in_seq',   name:'Sıradaki Sayı',      emo:'🔄', cat:'zeka', minLv:3,  minBet:100, maxBet:10000, daily:50 },
  { id:'word_scramble', name:'Kelime Çöz',         emo:'🔤', cat:'zeka', minLv:2,  minBet:100, maxBet:10000, daily:50 },
  { id:'mini_sweeper',  name:'Mayın Temizle',      emo:'🚩', cat:'zeka', minLv:4,  minBet:100, maxBet:20000, daily:50 },
  { id:'puzzle_2048',   name:'2048',               emo:'🔲', cat:'zeka', minLv:3,  minBet:0, maxBet:0, daily:20,  skill:1 },
  { id:'hangman',       name:'Adam Asmaca',        emo:'📝', cat:'zeka', minLv:2,  minBet:100, maxBet:10000, daily:50 },
  { id:'sudoku_mini',   name:'Sudoku 4x4',         emo:'#️⃣', cat:'zeka', minLv:5,  minBet:200, maxBet:20000, daily:30 },
];
window.MINI_GAMES = window.GAMES;

(function () {
const GAMES = window.GAMES;

const CAT_INFO = {
  kumar:  { name:'Kumarhane', icon:'🎲', color:'#dc2626' },
  beceri: { name:'Beceri',    icon:'🎯', color:'#16a34a' },
  zeka:   { name:'Zeka',      icon:'🧠', color:'#7c3aed' },
};
window.MINI_CAT_INFO = CAT_INFO;

/* ╔════════════════════════════════ MOTOR ════════════════════════════════╗ */
const xpForGameLv = lv => Math.floor(50 * Math.pow(lv, 1.5));
const gameMult = lv => 1 + (lv - 1) * 0.01; // %1/seviye bonus

const todayKey = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
};

async function getGD(gid) {
  const d = await dbGet(`mini/${GZ.uid}/${gid}`);
  return d || { level:1, xp:0, totalPlays:0, totalWins:0, totalBet:0, totalWon:0, dailyKey:todayKey(), dailyPlays:0, bestScore:0 };
}

async function addGameXP(gid, amt) {
  const r = await db.ref(`mini/${GZ.uid}/${gid}`).transaction(d => {
    d = d || { level:1, xp:0 };
    d.xp = (d.xp||0) + amt;
    let lv = d.level||1, up = false;
    while (d.xp >= xpForGameLv(lv)) { d.xp -= xpForGameLv(lv); lv++; up = true; }
    d.level = lv;
    d._up = up;
    return d;
  });
  if (r.committed && r.snapshot.val()?._up) {
    const g = GAMES.find(x => x.id === gid);
    const lv = r.snapshot.val().level;
    toast(`🎉 ${g?.name} → Lv ${lv}`, 'success', 4000);
    if (lv % 5 === 0) { await addDiamonds(GZ.uid, 5); toast('+5 💎 (oyun seviyesi)', 'success'); }
    await db.ref(`mini/${GZ.uid}/${gid}/_up`).remove();
  }
}

async function checkLimit(gid) {
  const g = GAMES.find(x => x.id === gid);
  if (!g) return { ok:false, msg:'Oyun yok' };
  const d = await getGD(gid);
  const t = todayKey();
  if (d.dailyKey !== t) { await dbUpdate(`mini/${GZ.uid}/${gid}`, { dailyKey:t, dailyPlays:0 }); return { ok:true, remaining:g.daily }; }
  if ((d.dailyPlays||0) >= g.daily) return { ok:false, msg:`Günlük limit (${g.daily}) doldu. Yarın gel.` };
  return { ok:true, remaining: g.daily - (d.dailyPlays||0) };
}

async function canPlay(gid, bet) {
  const g = GAMES.find(x => x.id === gid);
  if (!g) return { ok:false, msg:'Oyun yok' };
  if ((GZ.data?.level||1) < g.minLv) return { ok:false, msg:`${g.minLv}. seviyede açılır` };
  if (g.minBet > 0) {
    if (!bet || bet < g.minBet) return { ok:false, msg:`Min bahis: ${cashFmt(g.minBet)}` };
    if (bet > g.maxBet) return { ok:false, msg:`Max bahis: ${cashFmt(g.maxBet)}` };
    if ((GZ.data?.money||0) < bet) return { ok:false, msg:'Yetersiz bakiye' };
  }
  const lim = await checkLimit(gid);
  if (!lim.ok) return lim;
  return { ok:true, remaining:lim.remaining };
}

async function takeBet(bet) {
  if (bet <= 0) return true;
  return await spendCash(GZ.uid, bet, 'mini-bet');
}

async function settle(gid, bet, won, payout, xp = 10) {
  if (payout > 0) {
    await addCash(GZ.uid, payout, 'mini-' + gid);
    if (window.SoundManager) SoundManager.play('cash');
    // Başarım: kripto değil normal oyun kazanımı toplam kontrolü
    if (typeof checkAndGrantAchievement === 'function'){
      const stats = await dbGet(`mini/${GZ.uid}/${gid}`) || {};
      if ((stats.totalWon||0) + payout >= 50000) await checkAndGrantAchievement(GZ.uid, 'crypto_win');
    }
  }
  await db.ref(`mini/${GZ.uid}/${gid}`).transaction(d => {
    d = d || { level:1, xp:0, totalPlays:0, totalWins:0, totalBet:0, totalWon:0, dailyKey:todayKey(), dailyPlays:0 };
    d.totalPlays = (d.totalPlays||0)+1;
    d.totalBet = (d.totalBet||0) + (bet||0);
    d.totalWon = (d.totalWon||0) + (payout||0);
    if (won) d.totalWins = (d.totalWins||0)+1;
    d.lastPlay = now();
    d.dailyKey = d.dailyKey || todayKey();
    d.dailyPlays = (d.dailyPlays||0)+1;
    return d;
  });
  await addGameXP(gid, xp);
  await addXP(GZ.uid, Math.max(1, Math.floor((bet||0)/200)+1));
  // Günlük görev: kripto oynadı
  if (bet >= 1000 && typeof updateDailyTask === 'function') await updateDailyTask('crypto_1', 1);
}

async function bonus(gid, base) {
  const d = await getGD(gid);
  return base * gameMult(d.level||1);
}

/* ─── Skor → ödül (beceri/zeka oyunları için, bahis yok)
 *   v2 GÜNCELLEME — Bug fix:
 *   • Çift settle koruması (kilit sistemi)
 *   • Skor üst tavanı (hile tespit)
 *   • Logaritmik kazanç eğrisi (otomatik tıklama farkedilir)
 *   • Günlük max kazanç limiti
 */
const _settleLocks = {};
async function settleSkill(gid, score, threshold, basePayout, opts = {}) {
  // ── Çift settle koruması ──
  const lockKey = gid + '_' + GZ.uid;
  if (_settleLocks[lockKey]) {
    console.warn('[Mini] Çift settle engellendi:', gid);
    return { won: false, payout: 0, error: 'duplicate' };
  }
  _settleLocks[lockKey] = true;
  setTimeout(() => { delete _settleLocks[lockKey]; }, 3000);

  // ── Skor üst tavan kontrolü (hile/bot tespit) ──
  const SCORE_HARD_CAP = opts.maxScore || threshold * 5;  // teorik max ~5x threshold
  if (score < 0) score = 0;
  if (score > SCORE_HARD_CAP) {
    console.warn(`[Mini] Anormal skor (${score} > ${SCORE_HARD_CAP}). Kırpıldı.`);
    score = SCORE_HARD_CAP;
  }

  // ── Tıklama tabanlı oyunlar için ek insan-üst-limit ──
  // (caller'dan opts.cps geçilirse - click per second), 15 üzerini bot say
  if (opts.cps && opts.cps > 15) {
    score = Math.min(score, threshold);  // bot tespit → sadece eşik kadar say
    console.warn(`[Mini] Yüksek CPS (${opts.cps}) - bot şüphesi, skor kırpıldı.`);
  }

  const won = score >= threshold;
  let payout = 0;

  if (won) {
    // Logaritmik eğri: 1.0 ratio'da 1x, 2.0'de 1.32x, 5.0'da 2.32x (çok daha sönük)
    const rawRatio = score / threshold;
    const ratio = Math.min(2.5, 1 + Math.log2(rawRatio));   // log2 eğrisi, üst tavan 2.5x
    const m = await bonus(gid, ratio * basePayout);
    payout = Math.floor(m);
  }

  // ── Günlük max kazanç güvenliği (oyun başına) ──
  const d = await getGD(gid);
  const todayWonKey = 'dailyWon_' + todayKey();
  const todayWon = d[todayWonKey] || 0;
  const DAILY_MAX_PER_GAME = (opts.dailyMaxWin || basePayout * 30);  // ~30 mükemmel oyun
  if (todayWon + payout > DAILY_MAX_PER_GAME) {
    payout = Math.max(0, DAILY_MAX_PER_GAME - todayWon);
    if (payout === 0) {
      toast(`⚠️ Bu oyundan günlük kazanç limiti doldu (₺${DAILY_MAX_PER_GAME.toLocaleString('tr-TR')})`, 'warn', 4000);
    }
  }

  const newBest = score > (d.bestScore || 0);
  await db.ref(`mini/${GZ.uid}/${gid}`).transaction(x => {
    x = x || { level:1, xp:0, totalPlays:0, totalWins:0, totalBet:0, totalWon:0, dailyKey:todayKey(), dailyPlays:0, bestScore:0 };
    if (score > (x.bestScore || 0)) x.bestScore = score;
    x.totalPlays = (x.totalPlays || 0) + 1;
    x.totalWon = (x.totalWon || 0) + payout;
    x[todayWonKey] = (x[todayWonKey] || 0) + payout;
    if (won) x.totalWins = (x.totalWins || 0) + 1;
    x.lastPlay = now();
    x.dailyKey = x.dailyKey || todayKey();
    x.dailyPlays = (x.dailyPlays || 0) + 1;
    return x;
  });
  if(payout>0){const np=Math.floor(payout*.97);await addCash(GZ.uid,np,'mini-skill-'+gid);if(typeof window.sendCommission==='function')window.sendCommission(payout,'dukkan',GZ.uid).catch(()=>{});}  
  if (newBest && score > 0) toast('🏆 Yeni rekor!', 'success');
  await addGameXP(gid, Math.min(50, Math.floor(score * 1.5)));
  await addXP(GZ.uid, Math.min(20, Math.floor(score / 2)));
  return { won, payout };
}

/* ╔══════════════════════ KART YARDIMCILAR ══════════════════════╗ */
const SUITS = ['♠','♥','♦','♣'], RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const drawCard = () => {
  const r = RANKS[Math.floor(Math.random()*RANKS.length)];
  const s = SUITS[Math.floor(Math.random()*SUITS.length)];
  const v = r==='A'?14: r==='K'?13: r==='Q'?12: r==='J'?11: parseInt(r);
  return { rank:r, suit:s, value:v, red: s==='♥'||s==='♦' };
};
const cardHtml = c => `<span class="mini-card ${c.red?'red':''}">${c.rank}<small>${c.suit}</small></span>`;
const bjVal = r => r==='A'?11 : (r==='K'||r==='Q'||r==='J')?10 : parseInt(r);

/* ╔═════════════════════ ANA OYUN LİSTESİ SAYFASI ═════════════════════╗ */
window.renderOyunlar = async function () {
  const main = $('#appMain');
  let html = `<div class="page-title">🎮 Mini Oyunlar <span class="badge-info">${GAMES.length} oyun</span></div>
    <div class="subtabs">
      <button class="subtab active" data-mfilter="all">Hepsi</button>
      <button class="subtab" data-mfilter="kumar">🎲 Kumar (25)</button>
      <button class="subtab" data-mfilter="beceri">🎯 Beceri (15)</button>
      <button class="subtab" data-mfilter="zeka">🧠 Zeka (10)</button>
    </div>
    <div id="miniGamesList"></div>`;
  main.innerHTML = html;
  document.querySelectorAll('[data-mfilter]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-mfilter]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      drawList(b.dataset.mfilter);
    });
  });
  drawList('all');
};

async function drawList(filter) {
  const list = document.getElementById('miniGamesList');
  if (!list) return;
  const lv = GZ.data?.level || 1;
  const allData = await dbGet(`mini/${GZ.uid}`) || {};
  const groups = filter === 'all' ? ['kumar','beceri','zeka'] : [filter];
  let html = '';
  for (const cat of groups) {
    const ci = CAT_INFO[cat];
    const items = GAMES.filter(g => g.cat === cat);
    html += `<div class="section-title" style="color:${ci.color}">${ci.icon} ${ci.name.toUpperCase()}</div>`;
    html += '<div class="mini-grid">';
    for (const g of items) {
      const pd = allData[g.id] || {};
      const locked = lv < g.minLv;
      const todayPlays = pd.dailyKey === todayKey() ? (pd.dailyPlays||0) : 0;
      const rem = g.daily - todayPlays;
      const wr = (pd.totalPlays||0) > 0 ? Math.round(((pd.totalWins||0)/pd.totalPlays)*100) : 0;
      html += `<div class="mini-card-tile ${locked?'locked':''}" ${locked?'':`onclick="openMiniGame('${g.id}')"`}>
        <div class="mc-emo">${g.emo}</div>
        <div class="mc-name">${g.name}</div>
        ${locked ? `<div class="mc-lock">🔒 Lv ${g.minLv}</div>` : `
          <div class="mc-meta"><span class="mc-lv">Lv ${pd.level||1}</span>${pd.totalPlays>0?`<span class="mc-rate">${wr}%</span>`:''}</div>
          <div class="mc-rem">${rem}/${g.daily}</div>`}
      </div>`;
    }
    html += '</div>';
  }
  list.innerHTML = html;
}

/* ╔═════════════════════ TEK OYUN AÇMA (DISPATCHER) ═════════════════════╗ */
window.openMiniGame = async function (gid) {
  const g = GAMES.find(x => x.id === gid);
  if (!g) return toast('Oyun yok', 'error');
  if ((GZ.data?.level||1) < g.minLv) return toast(`${g.minLv}. seviyede açılır`, 'warn');
  const pd = await getGD(gid);
  const lim = await checkLimit(gid);
  const xpNeed = xpForGameLv(pd.level||1);
  const xpPct = Math.min(100, Math.floor(((pd.xp||0)/xpNeed)*100));

  const head = `
    <div class="mg-header">
      <div class="mg-emo">${g.emo}</div>
      <div class="mg-info">
        <div class="mg-title">${g.name}</div>
        <div class="mg-cat">${CAT_INFO[g.cat].icon} ${CAT_INFO[g.cat].name}</div>
      </div>
      <div class="mg-lv-pill">Lv ${pd.level||1}</div>
    </div>
    <div class="mg-xp-bar"><div style="width:${xpPct}%"></div></div>
    <div class="mg-xp-txt">${pd.xp||0}/${xpNeed} XP · Çarpan +%${((gameMult(pd.level||1)-1)*100).toFixed(0)}</div>
    <div class="mg-stats">
      <div><span class="muted">Oynama</span><b>${pd.totalPlays||0}</b></div>
      <div><span class="muted">Kazanma</span><b>${pd.totalWins||0}</b></div>
      <div><span class="muted">Toplam K.</span><b class="green">${cashFmt(pd.totalWon||0)}</b></div>
      <div><span class="muted">Bugün</span><b>${lim.remaining||0}</b></div>
    </div>
    <div id="mgArea"></div>`;
  showModal(`${g.emo} ${g.name}`, head);
  if (!lim.ok) {
    document.getElementById('mgArea').innerHTML = `<div class="empty-state"><div class="emoji">⏰</div><h3>${lim.msg}</h3></div>`;
    return;
  }
  const h = HANDLERS[gid];
  if (h) h(g);
  else document.getElementById('mgArea').innerHTML = '<div class="empty-state"><h3>🚧 Yakında</h3></div>';
};

/* ─── Bahis çubuğu ─── */
function betBar(g, def) {
  if (g.minBet === 0) return '';
  return `<div class="mg-bet-bar">
    <label>Bahis (₺) — Min ${g.minBet} · Max ${g.maxBet}</label>
    <div class="mg-bet-row">
      <button class="btn-mini" onclick="mgBetAdj(-100)">-100</button>
      <input type="number" id="mgBet" value="${def||g.minBet}" min="${g.minBet}" max="${g.maxBet}" step="50">
      <button class="btn-mini" onclick="mgBetAdj(100)">+100</button>
    </div>
    <div class="mg-bet-quick">
      <button onclick="mgBetSet(${g.minBet})">Min</button>
      <button onclick="mgBetSet(500)">500</button>
      <button onclick="mgBetSet(1000)">1K</button>
      <button onclick="mgBetSet(5000)">5K</button>
      <button onclick="mgBetSet(${g.maxBet})">Max</button>
    </div>
  </div>`;
}
window.mgBetAdj = d => { const i = document.getElementById('mgBet'); if (i) i.value = Math.max(parseInt(i.min||0), parseInt(i.value||0) + d); };
window.mgBetSet = v => { const i = document.getElementById('mgBet'); if (i) i.value = Math.min(parseInt(i.max||9e9), Math.max(parseInt(i.min||0), v)); };
const getBet = () => parseInt(document.getElementById('mgBet')?.value || 0);

/* ╔══════════════════════ HANDLERS — 50 OYUN ══════════════════════╗ */
const HANDLERS = {};

/* ────── 1. YAZI TURA ────── */
HANDLERS['yazi_tura'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Doğru tahmin: 1.94x</p>
    <div class="mg-coin" id="mgCoin">🪙</div>
    <div class="flex gap-8">
      <button class="btn-primary" style="flex:1" onclick="playCoin('yazi')">YAZI 👑</button>
      <button class="btn-secondary" style="flex:1;background:var(--accent);color:#000" onclick="playCoin('tura')">TURA 🪙</button>
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playCoin = async pick => {
  const bet = getBet();
  const c = await canPlay('yazi_tura', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const coin = document.getElementById('mgCoin');
  coin.classList.add('flip');
  await new Promise(r => setTimeout(r, 700));
  const res = Math.random() < 0.5 ? 'yazi' : 'tura';
  coin.classList.remove('flip');
  coin.textContent = res === 'yazi' ? '👑' : '🪙';
  const won = pick === res;
  const m = await bonus('yazi_tura', 1.94);
  const p = won ? Math.floor(bet * m) : 0;
  await settle('yazi_tura', bet, won, p, won?12:5);
  document.getElementById('mgResult').innerHTML = won
    ? `<div class="mg-win">🎉 ${res.toUpperCase()} → +${cashFmt(p)}</div>`
    : `<div class="mg-loss">${res.toUpperCase()}. Kaybettin.</div>`;
};

/* ────── 2. ZAR TAHMİN ────── */
HANDLERS['zar_tahmin'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">1-6 tahmin et — doğru: 5x</p>
    <div class="dice-row">
      ${[1,2,3,4,5,6].map(n => `<button class="dice-btn" onclick="playZar(${n})">${'⚀⚁⚂⚃⚄⚅'[n-1]}<br><small>${n}</small></button>`).join('')}
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playZar = async pick => {
  const bet = getBet();
  const c = await canPlay('zar_tahmin', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r = Math.floor(Math.random()*6)+1;
  const won = r === pick;
  const m = await bonus('zar_tahmin', 5);
  const p = won ? Math.floor(bet*m) : 0;
  await settle('zar_tahmin', bet, won, p, won?20:5);
  document.getElementById('mgResult').innerHTML = won
    ? `<div class="mg-win">🎲 ${'⚀⚁⚂⚃⚄⚅'[r-1]} ${r} → +${cashFmt(p)}</div>`
    : `<div class="mg-loss">🎲 ${'⚀⚁⚂⚃⚄⚅'[r-1]} ${r}. Sen: ${pick}.</div>`;
};

/* ────── 3. ÇİFT/TEK ────── */
HANDLERS['cift_tek'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Zar çift mi tek mi? 1.94x</p>
    <div class="flex gap-8">
      <button class="btn-primary" style="flex:1" onclick="playCT('cift')">ÇİFT</button>
      <button class="btn-secondary" style="flex:1" onclick="playCT('tek')">TEK</button>
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playCT = async pick => {
  const bet = getBet();
  const c = await canPlay('cift_tek', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r = Math.floor(Math.random()*6)+1;
  const res = r%2===0 ? 'cift' : 'tek';
  const won = pick === res;
  const m = await bonus('cift_tek', 1.94);
  const p = won ? Math.floor(bet*m) : 0;
  await settle('cift_tek', bet, won, p, won?10:5);
  document.getElementById('mgResult').innerHTML = won
    ? `<div class="mg-win">🎲 ${'⚀⚁⚂⚃⚄⚅'[r-1]} ${r} ${res.toUpperCase()} → +${cashFmt(p)}</div>`
    : `<div class="mg-loss">🎲 ${'⚀⚁⚂⚃⚄⚅'[r-1]} ${r} ${res.toUpperCase()}.</div>`;
};

/* ────── 4. YÜKSEK / DÜŞÜK ────── */
let hl = { c:null };
HANDLERS['yuksek_dusuk'] = g => {
  hl.c = drawCard();
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Sıradaki kart yüksek mi düşük mü? (A=14)</p>
    <div class="card-show">${cardHtml(hl.c)}</div>
    <div class="flex gap-8 mt-12">
      <button class="btn-primary" style="flex:1" onclick="playHL('h')">▲ YÜKSEK</button>
      <button class="btn-secondary" style="flex:1" onclick="playHL('l')">▼ DÜŞÜK</button>
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playHL = async pick => {
  const bet = getBet();
  const c = await canPlay('yuksek_dusuk', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const next = drawCard();
  let won = false;
  if (next.value !== hl.c.value) won = (pick==='h' && next.value > hl.c.value) || (pick==='l' && next.value < hl.c.value);
  const m = await bonus('yuksek_dusuk', 1.9);
  const p = won ? Math.floor(bet*m) : 0;
  await settle('yuksek_dusuk', bet, won, p, won?12:5);
  document.getElementById('mgResult').innerHTML = `<div class="card-show">${cardHtml(hl.c)} → ${cardHtml(next)}</div>
    <div class="${won?'mg-win':'mg-loss'}">${won?'🎉 +'+cashFmt(p):'💀 Kaybettin'}</div>`;
  hl.c = next;
};

/* ────── 5. SLOT ────── */
const SLOT = ['🍒','🍋','🍊','🍇','🔔','💎','7️⃣'];
const SLOT_PAY = { '🍒':3,'🍋':4,'🍊':5,'🍇':8,'🔔':12,'💎':25,'7️⃣':50 };
HANDLERS['slot'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">3'lü eşleşme: 7=50x, 💎=25x, 🔔=12x. İkili ufak ödül.</p>
    <div class="slot-machine">
      <div class="slot-reel" id="reel0">🎰</div>
      <div class="slot-reel" id="reel1">🎰</div>
      <div class="slot-reel" id="reel2">🎰</div>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:14px;font-size:18px" onclick="playSlot()">▶ ÇEK</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playSlot = async () => {
  const bet = getBet();
  const c = await canPlay('slot', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r = [0,1,2].map(()=>SLOT[Math.floor(Math.random()*SLOT.length)]);
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById('reel'+i);
    let n = 8 + i*4;
    const iv = setInterval(() => {
      el.textContent = SLOT[Math.floor(Math.random()*SLOT.length)];
      if (--n <= 0) { el.textContent = r[i]; clearInterval(iv); }
    }, 60);
  }
  await new Promise(x => setTimeout(x, 1300));
  let m = 0;
  if (r[0]===r[1] && r[1]===r[2]) m = SLOT_PAY[r[0]] || 5;
  else if (r[0]===r[1] || r[1]===r[2]) m = 1.5;
  const fm = await bonus('slot', m);
  const won = m > 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('slot', bet, won, p, won?Math.min(40,10+m):3);
  document.getElementById('mgResult').innerHTML = won
    ? `<div class="mg-win">${r.join(' ')} · ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`
    : `<div class="mg-loss">${r.join(' ')} · kayıp</div>`;
};

/* ────── 6. RULET ────── */
const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
HANDLERS['rulet'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Renk/Çift-Tek/Düzine: 1.94x · Yeşil(0): 35x · Tek sayı: 35x</p>
    <div class="roulette-bets">
      <button class="rb red" onclick="playRulet('red')">🔴 KIRMIZI</button>
      <button class="rb black" onclick="playRulet('black')">⚫ SİYAH</button>
      <button class="rb green" onclick="playRulet('green')">🟢 0</button>
      <button class="rb" onclick="playRulet('even')">ÇİFT</button>
      <button class="rb" onclick="playRulet('odd')">TEK</button>
      <button class="rb" onclick="playRulet('low')">1-18</button>
      <button class="rb" onclick="playRulet('high')">19-36</button>
      <button class="rb" onclick="playRulet('d1')">1-12</button>
      <button class="rb" onclick="playRulet('d2')">13-24</button>
      <button class="rb" onclick="playRulet('d3')">25-36</button>
    </div>
    <div class="input-group" style="margin-top:10px">
      <label>Tek Sayı (0-36) — 35x</label>
      <div class="flex gap-8">
        <input type="number" id="ruletNum" min="0" max="36" placeholder="0-36">
        <button class="btn-primary" onclick="playRulet('num')">Bas</button>
      </div>
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playRulet = async type => {
  const bet = getBet();
  const c = await canPlay('rulet', bet); if (!c.ok) return toast(c.msg,'warn');
  let pick = -1;
  if (type === 'num') {
    pick = parseInt(document.getElementById('ruletNum').value);
    if (isNaN(pick) || pick < 0 || pick > 36) return toast('0-36 arası gir','error');
  }
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r = Math.floor(Math.random()*37);
  const col = r === 0 ? 'green' : RED.includes(r) ? 'red' : 'black';
  let m = 0;
  if (type==='red'&&col==='red') m = 1.94;
  else if (type==='black'&&col==='black') m = 1.94;
  else if (type==='green'&&col==='green') m = 35;
  else if (type==='even'&&r>0&&r%2===0) m = 1.94;
  else if (type==='odd'&&r%2===1) m = 1.94;
  else if (type==='low'&&r>=1&&r<=18) m = 1.94;
  else if (type==='high'&&r>=19&&r<=36) m = 1.94;
  else if (type==='d1'&&r>=1&&r<=12) m = 2.85;
  else if (type==='d2'&&r>=13&&r<=24) m = 2.85;
  else if (type==='d3'&&r>=25&&r<=36) m = 2.85;
  else if (type==='num'&&r===pick) m = 35;
  const fm = m > 0 ? await bonus('rulet', m) : 0;
  const won = m > 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('rulet', bet, won, p, won?15:5);
  document.getElementById('mgResult').innerHTML = `<div class="rulet-result ${col}">
    <div class="rr-num">${r}</div><div class="rr-color">${col==='red'?'KIRMIZI':col==='black'?'SİYAH':'YEŞİL'}</div></div>
    <div class="${won?'mg-win':'mg-loss'}">${won?'🎉 +'+cashFmt(p)+' ('+fm.toFixed(2)+'x)':'💀 Kaybettin'}</div>`;
};

/* ────── 7. CRASH ────── */
let cs = { run:false, m:1, t:0, iv:null, bet:0 };
HANDLERS['crash'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Çarpan yükseliyor — patlamadan ÇIK!</p>
    <div class="crash-display" id="crashMult">1.00x</div>
    <div class="crash-status" id="crashStatus">Hazır</div>
    <button class="btn-success" id="crashBtn" style="width:100%;margin-top:14px" onclick="crashAct()">▶ BAŞLAT</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.crashAct = async () => {
  const btn = document.getElementById('crashBtn');
  if (!cs.run) {
    const bet = getBet();
    const c = await canPlay('crash', bet); if (!c.ok) return toast(c.msg,'warn');
    if (!await takeBet(bet)) return toast('Bahis hatası','error');
    cs.bet = bet; cs.m = 1.0;
    const U = Math.random();
    cs.t = Math.min(100, Math.max(1.0, 0.97 / Math.max(0.0001, 1-U)));
    cs.run = true;
    document.getElementById('crashStatus').textContent = 'UÇUYOR...';
    btn.textContent = '⛔ ÇIK!'; btn.classList.replace('btn-success','btn-danger');
    cs.iv = setInterval(() => {
      cs.m += 0.01 + cs.m*0.005;
      document.getElementById('crashMult').textContent = cs.m.toFixed(2)+'x';
      if (cs.m >= cs.t) {
        clearInterval(cs.iv); cs.run = false;
        document.getElementById('crashMult').textContent = '💥 '+cs.t.toFixed(2)+'x';
        document.getElementById('crashStatus').textContent = 'PATLAMA!';
        btn.textContent = '▶ TEKRAR'; btn.classList.replace('btn-danger','btn-success');
        settle('crash', cs.bet, false, 0, 4);
        document.getElementById('mgResult').innerHTML = `<div class="mg-loss">💥 Patladı. Kaybettin.</div>`;
      }
    }, 80);
  } else {
    clearInterval(cs.iv); cs.run = false;
    const fm = await bonus('crash', cs.m);
    const p = Math.floor(cs.bet * fm);
    await settle('crash', cs.bet, true, p, Math.min(30, Math.floor(cs.m*5)));
    document.getElementById('crashStatus').textContent = 'BAŞARILI';
    btn.textContent = '▶ TEKRAR'; btn.classList.replace('btn-danger','btn-success');
    document.getElementById('mgResult').innerHTML = `<div class="mg-win">🚀 ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`;
  }
};

/* ────── 8. LİMBO ────── */
HANDLERS['limbo'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Hedef çarpanı seç. Sonuç ≥ hedefse kazanırsın.</p>
    <div class="input-group">
      <label>Hedef Çarpan (1.10 - 100)</label>
      <input type="number" id="limboT" value="2.00" step="0.01" min="1.10" max="100">
    </div>
    <p class="small muted" id="limboInfo">Şans: %48.50</p>
    <button class="btn-primary" style="width:100%" onclick="playLimbo()">🎯 Çevir</button>
    <div id="mgResult" class="mg-result"></div>`;
  document.getElementById('limboT').addEventListener('input', e => {
    const t = parseFloat(e.target.value);
    document.getElementById('limboInfo').textContent = `Şans: %${((0.97/Math.max(t,1.01))*100).toFixed(2)}`;
  });
};
window.playLimbo = async () => {
  const bet = getBet();
  const t = parseFloat(document.getElementById('limboT').value);
  if (isNaN(t) || t < 1.10 || t > 100) return toast('1.10-100 arası','error');
  const c = await canPlay('limbo', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const U = Math.random();
  const r = Math.max(1.0, 0.97 / Math.max(0.0001, 1-U));
  const won = r >= t;
  const p = won ? Math.floor(bet*t) : 0;
  await settle('limbo', bet, won, p, won?12:4);
  document.getElementById('mgResult').innerHTML = `<div class="limbo-result">${r.toFixed(2)}x</div>
    <div class="${won?'mg-win':'mg-loss'}">Hedef: ${t.toFixed(2)}x · ${won?'🎉 +'+cashFmt(p):'💀 Yetmedi'}</div>`;
};

/* ────── 9. MAYIN TARLASI ────── */
let ms = { active:false, bet:0, mines:[], opened:0, mc:5 };
HANDLERS['mines'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">25 hücre. Aç → çarpan büyür. Mayına basarsan kaybedersin.</p>
    <div class="input-group"><label>Mayın Sayısı (1-15)</label>
      <input type="number" id="mineCount" value="5" min="1" max="15"></div>
    <button class="btn-primary" style="width:100%;margin-bottom:8px" id="msStart" onclick="msStart()">▶ Başlat</button>
    <div class="mines-grid" id="msGrid"></div>
    <button class="btn-success" id="msCash" style="width:100%;margin-top:10px;display:none" onclick="msCash()">💰 Çıkış</button>
    <div id="mgResult" class="mg-result"></div>`;
  msDraw(false);
};
function msDraw(active) {
  const grid = document.getElementById('msGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const c = document.createElement('button');
    c.className = 'mine-cell'; c.dataset.idx = i; c.textContent = '?';
    if (active) c.onclick = () => msOpen(i); else c.disabled = true;
    grid.appendChild(c);
  }
}
function msMult(o, mc) { let m = 0.97; for (let i = 0; i < o; i++) m *= (25-i)/(25-mc-i); return m; }
window.msStart = async () => {
  const bet = getBet();
  const mc = parseInt(document.getElementById('mineCount').value);
  if (isNaN(mc) || mc < 1 || mc > 15) return toast('1-15','error');
  const c = await canPlay('mines', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  ms = { active:true, bet, mines:[], opened:0, mc };
  const all = Array.from({length:25}, (_,i)=>i);
  for (let i = 0; i < mc; i++) { const idx = Math.floor(Math.random()*all.length); ms.mines.push(all[idx]); all.splice(idx,1); }
  msDraw(true);
  document.getElementById('msStart').disabled = true;
  document.getElementById('msCash').style.display = 'block';
  document.getElementById('mgResult').innerHTML = '';
  msUpd();
};
function msUpd() {
  const m = msMult(ms.opened, ms.mc);
  const btn = document.getElementById('msCash');
  btn.textContent = `💰 Çıkış (${m.toFixed(2)}x → ${cashFmt(Math.floor(ms.bet*m))})`;
  btn.disabled = ms.opened === 0;
}
window.msOpen = async i => {
  if (!ms.active) return;
  const c = document.querySelector(`.mine-cell[data-idx="${i}"]`);
  if (c.disabled) return;
  c.disabled = true;
  if (ms.mines.includes(i)) {
    c.textContent = '💣'; c.classList.add('boom');
    ms.mines.forEach(m => { const x = document.querySelector(`.mine-cell[data-idx="${m}"]`); if (x) x.textContent = '💣'; });
    ms.active = false;
    document.getElementById('msStart').disabled = false;
    document.getElementById('msCash').style.display = 'none';
    await settle('mines', ms.bet, false, 0, 5);
    document.getElementById('mgResult').innerHTML = `<div class="mg-loss">💥 Mayın!</div>`;
  } else {
    c.textContent = '💎'; c.classList.add('safe'); ms.opened++; msUpd();
    if (ms.opened >= 25 - ms.mc) await msCash();
  }
};
window.msCash = async () => {
  if (!ms.active || ms.opened === 0) return;
  const m = msMult(ms.opened, ms.mc);
  const fm = await bonus('mines', m);
  const p = Math.floor(ms.bet * fm);
  ms.active = false;
  document.getElementById('msStart').disabled = false;
  document.getElementById('msCash').style.display = 'none';
  await settle('mines', ms.bet, true, p, Math.min(40, ms.opened*3));
  document.getElementById('mgResult').innerHTML = `<div class="mg-win">💎 ${ms.opened} açıldı · ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`;
};

/* ────── 10. PLINKO ────── */
const PLINKO_PAY = [10, 5, 2, 1.2, 0.5, 0.5, 1.2, 2, 5, 10];
HANDLERS['plinko'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Top düşer — kenarda büyük, ortada küçük çarpan.</p>
    <div class="plinko-board"><div class="plinko-slots">${PLINKO_PAY.map((m,i) => 
      `<div class="plinko-slot" id="ps${i}" style="background:${m>=5?'#dc2626':m>=2?'#f59e0b':'#16a34a'}">${m}x</div>`
    ).join('')}</div></div>
    <button class="btn-primary" style="width:100%;margin-top:10px" onclick="playPlinko()">🎲 Top At</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playPlinko = async () => {
  const bet = getBet();
  const c = await canPlay('plinko', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  let pos = 0;
  for (let i = 0; i < 9; i++) pos += Math.random() < 0.5 ? 0 : 1;
  const fp = Math.min(9, Math.max(0, pos));
  const m = PLINKO_PAY[fp];
  const fm = await bonus('plinko', m);
  const won = m >= 1;
  const p = Math.floor(bet * fm);
  await settle('plinko', bet, won, p, won?10:4);
  const slot = document.getElementById('ps'+fp);
  if (slot) { slot.classList.add('hit'); setTimeout(()=>slot.classList.remove('hit'), 1500); }
  document.getElementById('mgResult').innerHTML = m >= 1
    ? `<div class="mg-win">🟡 ${fp+1}. slot · ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`
    : `<div class="mg-loss">🟡 ${fp+1}. slot · ${fm.toFixed(2)}x · az</div>`;
};

/* ────── 11. KART ÇEK ────── */
HANDLERS['kart_cek'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Kart için tahmin et.</p>
    <div class="grid-2">
      <button class="btn-primary" style="background:#dc2626" onclick="playKC('red')">🔴 Kırmızı (1.94x)</button>
      <button class="btn-primary" style="background:#000" onclick="playKC('black')">⚫ Siyah (1.94x)</button>
      <button class="btn-secondary" onclick="playKC('h')">♥️ Kupa (3.85x)</button>
      <button class="btn-secondary" onclick="playKC('d')">♦️ Karo (3.85x)</button>
      <button class="btn-secondary" onclick="playKC('s')">♠️ Maça (3.85x)</button>
      <button class="btn-secondary" onclick="playKC('c')">♣️ Sinek (3.85x)</button>
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playKC = async pick => {
  const bet = getBet();
  const c = await canPlay('kart_cek', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const card = drawCard();
  const sm = { '♥':'h','♦':'d','♠':'s','♣':'c' };
  let won = false, m = 0;
  if (pick === 'red' || pick === 'black') { won = (pick === 'red') === card.red; m = 1.94; }
  else { won = sm[card.suit] === pick; m = 3.85; }
  const fm = won ? await bonus('kart_cek', m) : 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('kart_cek', bet, won, p, won?12:5);
  document.getElementById('mgResult').innerHTML = `<div class="card-show">${cardHtml(card)}</div>
    <div class="${won?'mg-win':'mg-loss'}">${won?'🎉 +'+cashFmt(p):'💀 Kaybettin'}</div>`;
};

/* ────── 12. BLACKJACK ────── */
let bj = null;
HANDLERS['blackjack'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">21'e en yakın. Geçersen yanarsın. As=1 veya 11.</p>
    <button class="btn-primary" style="width:100%" onclick="bjStart()">🎴 Dağıt</button>
    <div id="bjBoard" class="bj-board"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
function bjVal2(h) {
  let t = 0, a = 0;
  h.forEach(c => { if (c.rank==='A') { a++; t += 11; } else t += bjVal(c.rank); });
  while (t > 21 && a > 0) { t -= 10; a--; }
  return t;
}
function bjRender() {
  document.getElementById('bjBoard').innerHTML = `
    <div class="bj-side"><div class="bj-lbl">Krupiye (${bj.show?bjVal2(bj.d):'?'})</div>
      <div class="bj-cards">${bj.d.map((c,i)=>i===1&&!bj.show?`<span class="mini-card hidden">🂠</span>`:cardHtml(c)).join('')}</div></div>
    <div class="bj-side"><div class="bj-lbl">Sen (${bjVal2(bj.p)})</div>
      <div class="bj-cards">${bj.p.map(cardHtml).join('')}</div></div>
    ${bj.active?`<div class="flex gap-8 mt-12">
      <button class="btn-primary" style="flex:1" onclick="bjHit()">+ Kart</button>
      <button class="btn-secondary" style="flex:1" onclick="bjStand()">Dur</button></div>`:''}`;
}
window.bjStart = async () => {
  const bet = getBet();
  const c = await canPlay('blackjack', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  bj = { bet, active:true, show:false, p:[drawCard(),drawCard()], d:[drawCard(),drawCard()] };
  document.getElementById('mgResult').innerHTML = '';
  bjRender();
  if (bjVal2(bj.p) === 21) bjStand();
};
window.bjHit = () => {
  if (!bj.active) return;
  bj.p.push(drawCard());
  if (bjVal2(bj.p) > 21) { bj.active = false; bj.show = true; bjEnd('bust'); }
  else bjRender();
};
window.bjStand = async () => {
  bj.active = false; bj.show = true;
  while (bjVal2(bj.d) < 17) bj.d.push(drawCard());
  bjRender();
  const pv = bjVal2(bj.p), dv = bjVal2(bj.d);
  let res;
  if (pv > 21) res = 'bust'; else if (dv > 21) res = 'dbust';
  else if (pv > dv) res = 'win'; else if (pv < dv) res = 'lose'; else res = 'push';
  bjEnd(res);
};
async function bjEnd(res) {
  bjRender();
  let m = 0, msg = '';
  if (res === 'win' || res === 'dbust') {
    const isBJ = bj.p.length === 2 && bjVal2(bj.p) === 21;
    m = isBJ ? 2.5 : 2.0;
    msg = isBJ ? `🃏 BLACKJACK! ${m}x` : `🎉 Kazandın ${m}x`;
  } else if (res === 'push') { m = 1.0; msg = '🤝 Beraberlik (iade)'; }
  else if (res === 'bust') msg = '💥 Yandın';
  else msg = '😞 Kaybettin';
  const fm = m > 0 ? await bonus('blackjack', m) : 0;
  const p = Math.floor(bj.bet * fm);
  const won = m >= 2;
  await settle('blackjack', bj.bet, won, p, won?18:(m===1?8:4));
  document.getElementById('mgResult').innerHTML = `<div class="${won?'mg-win':(m===1?'mg-warn':'mg-loss')}">${msg}${p>0?' → '+cashFmt(p):''}</div>`;
}

/* ────── 13. HI-LO ZİNCİRİ ────── */
let ch = null;
HANDLERS['hi_lo_chain'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Doğru tahminler çarpanı büyütür. İstediğinde çık.</p>
    <button class="btn-primary" style="width:100%" onclick="chStart()">▶ Başlat</button>
    <div id="chArea"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
function chRender() {
  document.getElementById('chArea').innerHTML = `
    <div class="card-show">${cardHtml(ch.c)}</div>
    <p class="tac">Çarpan: <b>${ch.m.toFixed(2)}x</b> · Olası kazanç: <b>${cashFmt(Math.floor(ch.bet*ch.m))}</b></p>
    <div class="flex gap-8 mt-12">
      <button class="btn-primary" style="flex:1" onclick="chPick('h')">▲ Yüksek</button>
      <button class="btn-secondary" style="flex:1" onclick="chPick('l')">▼ Düşük</button>
    </div>
    ${ch.streak > 0 ? `<button class="btn-success" style="width:100%;margin-top:8px" onclick="chCash()">💰 Çıkış (+${cashFmt(Math.floor(ch.bet*ch.m))})</button>` : ''}`;
}
window.chStart = async () => {
  const bet = getBet();
  const c = await canPlay('hi_lo_chain', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  ch = { bet, c:drawCard(), m:1.0, streak:0, active:true };
  document.getElementById('mgResult').innerHTML = '';
  chRender();
};
window.chPick = async pick => {
  if (!ch.active) return;
  const next = drawCard();
  let won = false;
  if (next.value !== ch.c.value) won = (pick === 'h' && next.value > ch.c.value) || (pick === 'l' && next.value < ch.c.value);
  if (won) {
    ch.m *= 1.5; ch.streak++; ch.c = next;
    chRender();
    if (ch.streak >= 8) chCash();
  } else {
    ch.active = false;
    await settle('hi_lo_chain', ch.bet, false, 0, 6);
    document.getElementById('chArea').innerHTML = `<div class="card-show">${cardHtml(ch.c)} → ${cardHtml(next)}</div>`;
    document.getElementById('mgResult').innerHTML = `<div class="mg-loss">💀 Zincir koptu (${ch.streak} doğru)</div>`;
  }
};
window.chCash = async () => {
  if (!ch.active || ch.streak === 0) return;
  const fm = await bonus('hi_lo_chain', ch.m);
  const p = Math.floor(ch.bet * fm);
  ch.active = false;
  await settle('hi_lo_chain', ch.bet, true, p, ch.streak * 5);
  document.getElementById('mgResult').innerHTML = `<div class="mg-win">⛓️ ${ch.streak} doğru · ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`;
};

/* ────── 14. ÇARK-I FELEK ────── */
const WHEEL = [
  { l:'2x', m:2,   c:'#16a34a' }, { l:'0',  m:0,   c:'#6b7280' },
  { l:'5x', m:5,   c:'#1e5cb8' }, { l:'1.5x', m:1.5, c:'#16a34a' },
  { l:'0',  m:0,   c:'#6b7280' }, { l:'10x',m:10,  c:'#dc2626' },
  { l:'0',  m:0,   c:'#6b7280' }, { l:'3x', m:3,   c:'#1e5cb8' },
];
HANDLERS['carki_felek'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">8 dilimli çark — 0 olursa kayıp, diğer dilim çarpanı.</p>
    <div class="wheel-spinner" id="wheelDisp">${WHEEL.map(w => `<div class="ws-seg" style="background:${w.c}">${w.l}</div>`).join('')}</div>
    <button class="btn-primary" style="width:100%;margin-top:14px" onclick="playWheel()">🎡 Çevir</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playWheel = async () => {
  const bet = getBet();
  const c = await canPlay('carki_felek', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  // Ağırlıklı rastgele: 0'lar daha sık, yüksek çarpanlar nadir
  const weights = [3, 5, 1, 4, 5, 1, 5, 2]; // toplam 26
  const total = weights.reduce((a,b)=>a+b);
  let r = Math.random() * total, idx = 0;
  for (let i = 0; i < weights.length; i++) { if (r < weights[i]) { idx = i; break; } r -= weights[i]; }
  const seg = WHEEL[idx];
  const fm = seg.m > 0 ? await bonus('carki_felek', seg.m) : 0;
  const won = seg.m > 0;
  const p = won ? Math.floor(bet * fm) : 0;
  await settle('carki_felek', bet, won, p, won?12:4);
  document.getElementById('mgResult').innerHTML = `<div class="wheel-result" style="background:${seg.c}">${seg.l}</div>
    <div class="${won?'mg-win':'mg-loss'}">${won?'🎉 '+fm.toFixed(2)+'x → +'+cashFmt(p):'💀 0 — Kaybettin'}</div>`;
};

/* ────── 15. TOMBALA ────── */
HANDLERS['tombala'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">1-90 arası 3 sayı seç. Çekilen 6 sayıdan kaçı tutarsa: 1=2x, 2=10x, 3=50x</p>
    <div class="input-group">
      <label>3 Sayı (1-90, virgül ile)</label>
      <input type="text" id="tombaPick" placeholder="örn: 7, 23, 88">
    </div>
    <button class="btn-primary" style="width:100%" onclick="playTomba()">🎱 Çek</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playTomba = async () => {
  const bet = getBet();
  const txt = document.getElementById('tombaPick').value;
  const picks = txt.split(',').map(x => parseInt(x.trim())).filter(x => x >= 1 && x <= 90);
  if (picks.length !== 3) return toast('1-90 arası tam 3 sayı gir','error');
  if (new Set(picks).size !== 3) return toast('Sayılar farklı olmalı','error');
  const c = await canPlay('tombala', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const drawn = []; const pool = Array.from({length:90},(_,i)=>i+1);
  for (let i = 0; i < 6; i++) { const idx = Math.floor(Math.random()*pool.length); drawn.push(pool[idx]); pool.splice(idx,1); }
  const matches = picks.filter(p => drawn.includes(p)).length;
  const mults = [0, 2, 10, 50];
  const m = mults[matches];
  const fm = m > 0 ? await bonus('tombala', m) : 0;
  const won = m > 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('tombala', bet, won, p, matches*8);
  document.getElementById('mgResult').innerHTML = `<div class="tac"><div class="small muted">Çekildi:</div>
    <div class="tomba-numbers">${drawn.map(n => `<span class="${picks.includes(n)?'match':''}">${n}</span>`).join('')}</div>
    <div class="${won?'mg-win':'mg-loss'}" style="margin-top:10px">${matches}/3 tuttu · ${won?fm.toFixed(2)+'x → +'+cashFmt(p):'kayıp'}</div></div>`;
};

/* ────── 16. KENO (5/40) ────── */
HANDLERS['keno'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">1-40 arası 5 sayı seç. 10 sayı çekilir. Tutturana göre: 0=0, 1=0.5x, 2=1.5x, 3=4x, 4=15x, 5=80x</p>
    <div class="keno-grid" id="kenoGrid"></div>
    <p class="tac small mt-12" id="kenoSel">Seçilen: 0/5</p>
    <button class="btn-primary" style="width:100%" onclick="playKeno()">🔢 Çek</button>
    <div id="mgResult" class="mg-result"></div>`;
  const grid = document.getElementById('kenoGrid');
  for (let i = 1; i <= 40; i++) {
    const b = document.createElement('button');
    b.className = 'keno-cell'; b.textContent = i; b.dataset.n = i;
    b.onclick = () => kenoToggle(i);
    grid.appendChild(b);
  }
};
let kenoPicks = new Set();
window.kenoToggle = n => {
  if (kenoPicks.has(n)) { kenoPicks.delete(n); }
  else if (kenoPicks.size < 5) kenoPicks.add(n);
  document.querySelectorAll('.keno-cell').forEach(c => c.classList.toggle('picked', kenoPicks.has(parseInt(c.dataset.n))));
  document.getElementById('kenoSel').textContent = `Seçilen: ${kenoPicks.size}/5`;
};
window.playKeno = async () => {
  const bet = getBet();
  if (kenoPicks.size !== 5) return toast('5 sayı seç','warn');
  const c = await canPlay('keno', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const drawn = []; const pool = Array.from({length:40},(_,i)=>i+1);
  for (let i = 0; i < 10; i++) { const idx = Math.floor(Math.random()*pool.length); drawn.push(pool[idx]); pool.splice(idx,1); }
  const picks = [...kenoPicks];
  const matches = picks.filter(p => drawn.includes(p)).length;
  const mults = [0, 0, 0.5, 1.5, 4, 15, 80];
  const m = mults[matches];
  const fm = m > 0 ? await bonus('keno', m) : 0;
  const won = m >= 1;
  const p = m > 0 ? Math.floor(bet*fm) : 0;
  await settle('keno', bet, won, p, matches*10);
  document.querySelectorAll('.keno-cell').forEach(c => {
    const n = parseInt(c.dataset.n);
    if (drawn.includes(n)) c.classList.add(picks.includes(n) ? 'hit' : 'drawn');
  });
  document.getElementById('mgResult').innerHTML = `<div class="${won?'mg-win':'mg-loss'}">${matches}/5 tuttu · ${m>0?fm.toFixed(2)+'x → +'+cashFmt(p):'kayıp'}</div>`;
};

/* ────── 17. EJDER KULESİ ────── */
let dt = null;
HANDLERS['dragon_tower'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">9 kat. Her katta 4 hücre, 1 tanesi ejder. Her doğru +1.5x. Çık veya devam et.</p>
    <button class="btn-primary" style="width:100%" onclick="dtStart()">🐉 Başlat</button>
    <div id="dtBoard" class="dt-board"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.dtStart = async () => {
  const bet = getBet();
  const c = await canPlay('dragon_tower', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  dt = { bet, active:true, level:0, m:1.0, dragons:[] };
  for (let i = 0; i < 9; i++) dt.dragons.push(Math.floor(Math.random()*4));
  document.getElementById('mgResult').innerHTML = '';
  dtRender();
};
function dtRender() {
  const board = document.getElementById('dtBoard');
  let html = '';
  for (let i = 8; i >= 0; i--) {
    html += `<div class="dt-row ${i===dt.level?'active':i<dt.level?'done':''}">`;
    for (let j = 0; j < 4; j++) {
      const open = i < dt.level && dt.dragons[i] === j;
      const safe = i < dt.level && dt.dragons[i] !== j;
      html += `<button class="dt-cell ${safe?'safe':open?'dragon':''}" ${i===dt.level?`onclick="dtPick(${j})"`:''} ${i!==dt.level?'disabled':''}>${safe?'💎':open?'🐉':'?'}</button>`;
    }
    html += `<span class="dt-mult">${(Math.pow(1.5,9-i)).toFixed(2)}x</span></div>`;
  }
  board.innerHTML = html;
  if (dt.level > 0 && dt.active) {
    board.innerHTML += `<button class="btn-success" style="width:100%;margin-top:10px" onclick="dtCash()">💰 Çıkış (${dt.m.toFixed(2)}x → ${cashFmt(Math.floor(dt.bet*dt.m))})</button>`;
  }
}
window.dtPick = async j => {
  if (!dt.active) return;
  if (dt.dragons[dt.level] === j) {
    dt.active = false;
    dtRender();
    await settle('dragon_tower', dt.bet, false, 0, 6);
    document.getElementById('mgResult').innerHTML = `<div class="mg-loss">🐉 ${dt.level+1}. katta ejder!</div>`;
  } else {
    dt.level++; dt.m *= 1.5;
    if (dt.level >= 9) {
      const fm = await bonus('dragon_tower', dt.m);
      const p = Math.floor(dt.bet*fm);
      dt.active = false;
      dtRender();
      await settle('dragon_tower', dt.bet, true, p, 50);
      document.getElementById('mgResult').innerHTML = `<div class="mg-win">🏆 KULE FETHEDİLDİ! ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`;
    } else dtRender();
  }
};
window.dtCash = async () => {
  if (!dt.active || dt.level === 0) return;
  const fm = await bonus('dragon_tower', dt.m);
  const p = Math.floor(dt.bet*fm);
  dt.active = false;
  dtRender();
  await settle('dragon_tower', dt.bet, true, p, dt.level*5);
  document.getElementById('mgResult').innerHTML = `<div class="mg-win">🐉 ${dt.level} kat · ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`;
};

/* ────── 18. TAVUK YOLU ────── */
let cr = null;
HANDLERS['chicken_road'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">10 şerit. Her geçişte +1.3x. Araba çarparsa kaybedersin (her şeritte %15 araba).</p>
    <button class="btn-primary" style="width:100%" onclick="crStart()">🐔 Başlat</button>
    <div id="crBoard"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.crStart = async () => {
  const bet = getBet();
  const c = await canPlay('chicken_road', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  cr = { bet, active:true, lane:0, m:1.0 };
  document.getElementById('mgResult').innerHTML = '';
  crRender();
};
function crRender() {
  const lanes = [];
  for (let i = 0; i < 10; i++) {
    lanes.push(`<div class="cr-lane ${i<cr.lane?'passed':i===cr.lane?'current':''}">${i<cr.lane?'✅':i===cr.lane?'🐔':'🛣️'}</div>`);
  }
  document.getElementById('crBoard').innerHTML = `
    <div class="cr-road">${lanes.join('')}</div>
    <p class="tac">Şerit: ${cr.lane}/10 · Çarpan: ${cr.m.toFixed(2)}x</p>
    ${cr.active?`<div class="flex gap-8 mt-12">
      <button class="btn-primary" style="flex:1" onclick="crStep()">➡️ Geç</button>
      ${cr.lane > 0 ? `<button class="btn-success" style="flex:1" onclick="crCash()">💰 Çıkış</button>` : ''}</div>`:''}`;
}
window.crStep = async () => {
  if (!cr.active) return;
  if (Math.random() < 0.15) {
    cr.active = false;
    crRender();
    await settle('chicken_road', cr.bet, false, 0, 5);
    document.getElementById('mgResult').innerHTML = `<div class="mg-loss">🚗💥 Araba çarptı! ${cr.lane}. şeritte</div>`;
  } else {
    cr.lane++; cr.m *= 1.3;
    if (cr.lane >= 10) crCash();
    else crRender();
  }
};
window.crCash = async () => {
  if (!cr.active || cr.lane === 0) return;
  const fm = await bonus('chicken_road', cr.m);
  const p = Math.floor(cr.bet*fm);
  cr.active = false;
  crRender();
  await settle('chicken_road', cr.bet, true, p, cr.lane*4);
  document.getElementById('mgResult').innerHTML = `<div class="mg-win">🐔 ${cr.lane} şerit · ${fm.toFixed(2)}x → +${cashFmt(p)}</div>`;
};

/* ────── 19. RENK RULETİ (basit) ────── */
HANDLERS['rulet_renk'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Sadece renk seç: 1.94x</p>
    <div class="flex gap-8">
      <button class="btn-primary" style="flex:1;background:#dc2626" onclick="playRR('red')">🔴 KIRMIZI</button>
      <button class="btn-primary" style="flex:1;background:#000" onclick="playRR('black')">⚫ SİYAH</button>
    </div>
    <button class="btn-secondary" style="width:100%;margin-top:8px;background:#16a34a;color:#fff" onclick="playRR('green')">🟢 YEŞİL (35x, riskli)</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playRR = async pick => {
  const bet = getBet();
  const c = await canPlay('rulet_renk', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r = Math.floor(Math.random()*37);
  const col = r === 0 ? 'green' : RED.includes(r) ? 'red' : 'black';
  const won = pick === col;
  const m = pick === 'green' ? 35 : 1.94;
  const fm = won ? await bonus('rulet_renk', m) : 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('rulet_renk', bet, won, p, won?10:4);
  document.getElementById('mgResult').innerHTML = `<div class="rulet-result ${col}"><div class="rr-num">${r}</div><div class="rr-color">${col.toUpperCase()}</div></div>
    <div class="${won?'mg-win':'mg-loss'}">${won?'🎉 +'+cashFmt(p):'💀 Kayıp'}</div>`;
};

/* ────── 20. SAYI ARALIĞI ────── */
HANDLERS['number_guess'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">1-100 arası bir aralık seç. Sayı aralığa düşerse kazanç (aralık ne kadar dar = çarpan o kadar büyük)</p>
    <div class="input-group"><label>Min</label><input type="number" id="ngMin" min="1" max="100" value="40"></div>
    <div class="input-group"><label>Max</label><input type="number" id="ngMax" min="1" max="100" value="60"></div>
    <p class="small muted" id="ngInfo">Aralık: 21 sayı · Çarpan: 4.62x</p>
    <button class="btn-primary" style="width:100%" onclick="playNG()">🎯 At</button>
    <div id="mgResult" class="mg-result"></div>`;
  const upd = () => {
    const a = Math.min(parseInt(document.getElementById('ngMin').value)||0, parseInt(document.getElementById('ngMax').value)||0);
    const b = Math.max(parseInt(document.getElementById('ngMin').value)||0, parseInt(document.getElementById('ngMax').value)||0);
    const span = b - a + 1;
    if (span < 1 || span > 100) return;
    const m = (97 / span);
    document.getElementById('ngInfo').textContent = `Aralık: ${span} sayı · Çarpan: ${m.toFixed(2)}x`;
  };
  document.getElementById('ngMin').addEventListener('input', upd);
  document.getElementById('ngMax').addEventListener('input', upd);
};
window.playNG = async () => {
  const bet = getBet();
  let mn = parseInt(document.getElementById('ngMin').value), mx = parseInt(document.getElementById('ngMax').value);
  if (mn > mx) [mn, mx] = [mx, mn];
  if (mn < 1 || mx > 100 || (mx - mn + 1) < 1) return toast('1-100 arası geçerli aralık','error');
  const c = await canPlay('number_guess', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r = Math.floor(Math.random()*100)+1;
  const won = r >= mn && r <= mx;
  const span = mx - mn + 1;
  const m = 97 / span;
  const fm = won ? await bonus('number_guess', m) : 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('number_guess', bet, won, p, won?12:4);
  document.getElementById('mgResult').innerHTML = `<div class="ng-result ${won?'win':'lose'}">${r}</div>
    <div class="${won?'mg-win':'mg-loss'}">Aralık ${mn}-${mx} · ${won?fm.toFixed(2)+'x → +'+cashFmt(p):'kayıp'}</div>`;
};

/* ────── 21. DÜŞÜK AT (roll under) ────── */
HANDLERS['roll_under'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">0-100 arası rastgele sayı çıkar. Hedef altındaysa kazanır. Hedef düşük = yüksek çarpan.</p>
    <div class="input-group"><label>Hedef Altı (5-95)</label>
      <input type="number" id="ruTarget" value="50" min="5" max="95"></div>
    <p class="small muted" id="ruInfo">Şans: %50 · Çarpan: 1.94x</p>
    <button class="btn-primary" style="width:100%" onclick="playRU()">🎲 At</button>
    <div id="mgResult" class="mg-result"></div>`;
  document.getElementById('ruTarget').addEventListener('input', e => {
    const t = parseInt(e.target.value);
    if (t < 5 || t > 95) return;
    document.getElementById('ruInfo').textContent = `Şans: %${t} · Çarpan: ${(97/t).toFixed(2)}x`;
  });
};
window.playRU = async () => {
  const bet = getBet();
  const t = parseInt(document.getElementById('ruTarget').value);
  if (t < 5 || t > 95) return toast('5-95 arası','error');
  const c = await canPlay('roll_under', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r = Math.floor(Math.random()*100);
  const won = r < t;
  const m = 97/t;
  const fm = won ? await bonus('roll_under', m) : 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('roll_under', bet, won, p, won?10:4);
  document.getElementById('mgResult').innerHTML = `<div class="ng-result ${won?'win':'lose'}">${r}</div>
    <div class="${won?'mg-win':'mg-loss'}">${r} < ${t}? · ${won?fm.toFixed(2)+'x → +'+cashFmt(p):'kayıp'}</div>`;
};

/* ────── 22. ZAR DÜELLOSU ────── */
HANDLERS['dice_battle'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">2 zar at, toplam yüksek olan kazanır. Beraberlik = iade.</p>
    <button class="btn-primary" style="width:100%" onclick="playDB()">⚔️ Düello</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playDB = async () => {
  const bet = getBet();
  const c = await canPlay('dice_battle', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r1 = Math.floor(Math.random()*6)+1, r2 = Math.floor(Math.random()*6)+1;
  const e1 = Math.floor(Math.random()*6)+1, e2 = Math.floor(Math.random()*6)+1;
  const sum = r1 + r2, esum = e1 + e2;
  let m = 0, msg = '';
  if (sum > esum) { m = 1.94; msg = '🎉 Kazandın!'; }
  else if (sum === esum) { m = 1.0; msg = '🤝 Beraberlik (iade)'; }
  else msg = '😞 Kaybettin';
  const fm = m > 0 ? await bonus('dice_battle', m) : 0;
  const p = Math.floor(bet*fm);
  const won = m >= 2;
  await settle('dice_battle', bet, won, p, won?12:(m===1?6:4));
  document.getElementById('mgResult').innerHTML = `<div class="dice-row" style="margin:14px 0">
    <div class="tac"><b>SEN</b><br>${'⚀⚁⚂⚃⚄⚅'[r1-1]}${'⚀⚁⚂⚃⚄⚅'[r2-1]}<br>${sum}</div>
    <div class="tac"><b>RAKİP</b><br>${'⚀⚁⚂⚃⚄⚅'[e1-1]}${'⚀⚁⚂⚃⚄⚅'[e2-1]}<br>${esum}</div></div>
    <div class="${won?'mg-win':(m===1?'mg-warn':'mg-loss')}">${msg}${p>0?' → '+cashFmt(p):''}</div>`;
};

/* ────── 23. KART DÜELLOSU ────── */
HANDLERS['duel_card'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Tek kart, yüksek olan kazanır. Beraberlik = iade.</p>
    <button class="btn-primary" style="width:100%" onclick="playDuelC()">🤺 Çek</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playDuelC = async () => {
  const bet = getBet();
  const c = await canPlay('duel_card', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const a = drawCard(), b = drawCard();
  let m = 0, msg = '';
  if (a.value > b.value) { m = 1.94; msg = '🎉 Kazandın'; }
  else if (a.value === b.value) { m = 1.0; msg = '🤝 Beraberlik'; }
  else msg = '😞 Kaybettin';
  const fm = m > 0 ? await bonus('duel_card', m) : 0;
  const p = Math.floor(bet*fm);
  const won = m >= 2;
  await settle('duel_card', bet, won, p, won?10:(m===1?5:4));
  document.getElementById('mgResult').innerHTML = `<div class="duel-row">
    <div class="tac"><b>SEN</b><br>${cardHtml(a)}</div>
    <div class="tac"><b>RAKİP</b><br>${cardHtml(b)}</div></div>
    <div class="${won?'mg-win':(m===1?'mg-warn':'mg-loss')}">${msg}${p>0?' → '+cashFmt(p):''}</div>`;
};

/* ────── 24. PİYANGO (6/49) ────── */
HANDLERS['lottery'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g, 50)}
    <p class="small muted mb-8">1-49 arası 6 sayı seç. Tutturana göre: 3=10x, 4=100x, 5=5000x, 6=500000x</p>
    <div class="input-group"><label>6 Sayı (virgül ile)</label>
      <input type="text" id="lotPick" placeholder="örn: 7,12,23,33,42,49"></div>
    <button class="btn-primary" style="width:100%" onclick="playLot()">🎟️ Çek</button>
    <button class="btn-secondary" style="width:100%;margin-top:6px" onclick="lotRandom()">🎲 Rastgele Doldur</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.lotRandom = () => {
  const arr = []; const pool = Array.from({length:49}, (_,i) => i+1);
  for (let i = 0; i < 6; i++) { const idx = Math.floor(Math.random()*pool.length); arr.push(pool[idx]); pool.splice(idx,1); }
  document.getElementById('lotPick').value = arr.sort((a,b)=>a-b).join(', ');
};
window.playLot = async () => {
  const bet = getBet();
  const txt = document.getElementById('lotPick').value;
  const picks = txt.split(',').map(x => parseInt(x.trim())).filter(x => x >= 1 && x <= 49);
  if (picks.length !== 6 || new Set(picks).size !== 6) return toast('1-49 arası farklı 6 sayı','error');
  const c = await canPlay('lottery', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const drawn = []; const pool = Array.from({length:49}, (_,i) => i+1);
  for (let i = 0; i < 6; i++) { const idx = Math.floor(Math.random()*pool.length); drawn.push(pool[idx]); pool.splice(idx,1); }
  const matches = picks.filter(p => drawn.includes(p)).length;
  const mults = [0, 0, 0, 10, 100, 5000, 500000];
  const m = mults[matches];
  const fm = m > 0 ? await bonus('lottery', m) : 0;
  const won = m > 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('lottery', bet, won, p, matches*15);
  document.getElementById('mgResult').innerHTML = `<div class="tac"><div class="small muted">Çekildi:</div>
    <div class="tomba-numbers">${drawn.sort((a,b)=>a-b).map(n => `<span class="${picks.includes(n)?'match':''}">${n}</span>`).join('')}</div>
    <div class="${won?'mg-win':'mg-loss'}" style="margin-top:10px">${matches}/6 tuttu · ${won?fm.toFixed(2)+'x → +'+cashFmt(p):'kayıp'}</div></div>`;
};

/* ────── 25. ŞANSLI 7 (2 zar toplamı over/under 7) ────── */
HANDLERS['lucky_seven'] = g => {
  document.getElementById('mgArea').innerHTML = `${betBar(g)}
    <p class="small muted mb-8">2 zar atılır. Toplam: 7'nin altı/üstü 1.95x · Tam 7: 4.5x</p>
    <div class="grid-3" style="grid-template-columns:repeat(3,1fr)">
      <button class="btn-secondary" onclick="play7('under')">▼ 7'nin altı</button>
      <button class="btn-primary" style="background:#f59e0b;color:#000" onclick="play7('seven')">7️⃣ Tam 7</button>
      <button class="btn-secondary" onclick="play7('over')">▲ 7'nin üstü</button>
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.play7 = async pick => {
  const bet = getBet();
  const c = await canPlay('lucky_seven', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const r1 = Math.floor(Math.random()*6)+1, r2 = Math.floor(Math.random()*6)+1;
  const sum = r1 + r2;
  let won = false, m = 0;
  if (pick === 'under' && sum < 7) { won = true; m = 1.95; }
  else if (pick === 'over' && sum > 7) { won = true; m = 1.95; }
  else if (pick === 'seven' && sum === 7) { won = true; m = 4.5; }
  const fm = won ? await bonus('lucky_seven', m) : 0;
  const p = won ? Math.floor(bet*fm) : 0;
  await settle('lucky_seven', bet, won, p, won?(pick==='seven'?20:10):4);
  document.getElementById('mgResult').innerHTML = `<div class="tac" style="font-size:32px;margin:14px 0">
    ${'⚀⚁⚂⚃⚄⚅'[r1-1]} ${'⚀⚁⚂⚃⚄⚅'[r2-1]} = <b>${sum}</b></div>
    <div class="${won?'mg-win':'mg-loss'}">${won?'🎉 '+fm.toFixed(2)+'x → +'+cashFmt(p):'💀 Kayıp'}</div>`;
};

/* ============================================================
   Skill ve zeka oyunları için handlers — ayrı dosyada/parçada
   ============================================================ */
window._GAME_HANDLERS = HANDLERS;
window._GAMES = GAMES;
window._gameMult = gameMult;
window._bonus = bonus;
window._canPlay = canPlay;
window._takeBet = takeBet;
window._settle = settle;
window._settleSkill = settleSkill;
window._getBet = getBet;
window._betBar = betBar;
window._getGD = getGD;
window._drawCard = drawCard;
window._cardHtml = cardHtml;

})();

/* ============================================================
   YENİ OYUNLAR — PvP + Ek Kumar
   ============================================================ */

/* PvP MEYDAN OKUMA — İki oyuncu zar atar, yüksek kazanır */
window.GAMES.push({ id:'pvp_zar', name:'PvP Zar Düellosu', emo:'⚔️', cat:'pvp', minLv:5, minBet:500, maxBet:100000, daily:20 });

window._PVP_CHALLENGES = window._PVP_CHALLENGES || {};

window.createPvpChallenge = async function(bet){
  const ok = await spendCash(GZ.uid, bet, 'pvp-escrow');
  if (!ok) return toast('Yetersiz bakiye','error');
  const id = 'pvp_' + Date.now().toString(36);
  await dbSet(`pvp/${id}`, {
    id, creator: GZ.uid, creatorName: GZ.data.username,
    bet, status:'waiting', createdAt: now()
  });
  toast(`⚔️ Meydan okuma oluşturuldu! ID: ${id}`, 'success');
  await pushNotif(GZ.uid, `⚔️ PvP meydan okuman hazır, rakip bekleniyor`);
  return id;
};
window.joinPvpChallenge = async function(pvpId){
  const ch = await dbGet(`pvp/${pvpId}`);
  if (!ch || ch.status !== 'waiting') return toast('Meydan okuma bulunamadı','error');
  if (ch.creator === GZ.uid) return toast('Kendi meydan okumanına katılamazsın','error');
  const ok = await spendCash(GZ.uid, ch.bet, 'pvp-escrow');
  if (!ok) return toast('Yetersiz bakiye','error');
  // Her iki oyuncu zar atar
  const myRoll    = Math.floor(Math.random()*6)+1;
  const theirRoll = Math.floor(Math.random()*6)+1;
  let winnerId, winnerName, loserId;
  if (myRoll > theirRoll){
    winnerId = GZ.uid; winnerName = GZ.data.username; loserId = ch.creator;
  } else if (theirRoll > myRoll){
    winnerId = ch.creator; winnerName = ch.creatorName; loserId = GZ.uid;
  } else {
    // Beraberlik — para iade
    await addCash(GZ.uid, ch.bet, 'pvp-draw');
    await addCash(ch.creator, ch.bet, 'pvp-draw');
    await db.ref(`pvp/${pvpId}`).remove();
    toast(`🤝 Beraberlik! ${myRoll} vs ${theirRoll} — para iade edildi`,'warn');
    return;
  }
  const prize = ch.bet * 2 * 0.95; // %5 komisyon
  await addCash(winnerId, prize, 'pvp-win');
  await db.ref(`pvp/${pvpId}`).remove();
  await pushNotif(ch.creator, `⚔️ PvP Sonuç: ${myRoll} vs ${theirRoll} — ${winnerName} kazandı!`);
  toast(`⚔️ ${myRoll} vs ${theirRoll} — ${winnerId === GZ.uid ? '🏆 KAZANDIN' : '😞 Kaybettin'} (${prize > 0 && winnerId===GZ.uid ? '+' + cashFmt(prize) : ''})`, winnerId===GZ.uid?'success':'error');
};

/* ============================================================
   mini-oyunlar-2.js devamı
   ============================================================ */
/* ==========================================================================
   mini-oyunlar-2.js — Beceri (15) + Zeka (10) Oyunları
   ─────────────────────────────────────────────────────────────────────────
   Bu dosya mini-oyunlar.js'in HANDLERS objesine 25 oyun ekler.
   Beceri/zeka oyunları skor-bazlı (bahis yok), settleSkill ile ödüllenir.
   ========================================================================== */

(function () {
  if (!window._GAME_HANDLERS) { console.warn('mini-oyunlar.js önce yüklenmeli'); return; }

  const H = window._GAME_HANDLERS;
  const settle = window._settle;
  const settleSkill = window._settleSkill;
  const canPlay = window._canPlay;
  const takeBet = window._takeBet;
  const bonus = window._bonus;
  const getBet = window._getBet;
  const betBar = window._betBar;

  const $r = () => document.getElementById('mgArea');

/* ══════════════════ 26. REAKSİYON HIZI ══════════════════ */
H['reaksiyon'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Yeşil olunca tıkla. <250ms = mükemmel · 250-400ms = iyi · 400ms+ = yavaş</p>
    <div id="rxBox" class="rx-box red" onclick="rxClick()">Bekle...</div>
    <p class="tac small muted" id="rxInfo">5 tur · ortalama hesaplanır</p>
    <div id="mgResult" class="mg-result"></div>`;
  rxStart();
};
let rxState = null;
function rxStart() {
  rxState = { round: 0, times: [], waiting: false, startTs: 0 };
  rxNext();
}
function rxNext() {
  if (rxState.round >= 5) return rxFinish();
  const box = document.getElementById('rxBox');
  if (!box) return;
  box.className = 'rx-box red';
  box.textContent = `Tur ${rxState.round+1}/5 · Bekle...`;
  rxState.waiting = false;
  const wait = 800 + Math.random() * 2500;
  rxState.timer = setTimeout(() => {
    if (!box) return;
    box.className = 'rx-box green';
    box.textContent = 'TIKLA!';
    rxState.startTs = Date.now();
    rxState.waiting = true;
  }, wait);
}
window.rxClick = () => {
  if (!rxState) return;
  if (!rxState.waiting) {
    clearTimeout(rxState.timer);
    toast('Erken tıkladın! Tur baştan.', 'warn');
    rxNext();
    return;
  }
  const dt = Date.now() - rxState.startTs;
  rxState.times.push(dt);
  rxState.round++;
  document.getElementById('rxBox').textContent = dt + ' ms';
  setTimeout(rxNext, 600);
};
async function rxFinish() {
  const avg = Math.round(rxState.times.reduce((a,b)=>a+b,0) / 5);
  // Skor: 1000 - avg (düşük = iyi)
  const score = Math.max(0, Math.round((1000 - avg) / 10)); // 0-100
  const r = await settleSkill('reaksiyon', score, 50, 200);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    Ortalama: <b>${avg}ms</b> · Skor: ${score}<br>${r.payout > 0 ? '+'+cashFmt(r.payout) : 'kazanç yok'}</div>`;
}

/* ══════════════════ 27. HIZLI TIKLA (5sn) — v2 BUG FIX ══════════════════
   ┌─────────────────────────────────────────────────────────────────────┐
   │  DÜZELTİLEN BUG'LAR:                                                 │
   │  1. Süre bittikten sonra tıklamanın hâlâ sayılması → STATE.done      │
   │     kontrolü hem başlangıçta hem her tıklamada                       │
   │  2. Çift settleSkill çağrılma riski → settled flag                    │
   │  3. Bot/auto-clicker tespiti → CPS hesaplaması, 15+ ise kırpılır    │
   │  4. Mobile çift sayma (mousedown + touchstart) → tek event türü      │
   │  5. Süre bittikten sonra butonu disable et                           │
   │  6. Buton tekrar tıklanırsa eski state'i temizle                    │
   └─────────────────────────────────────────────────────────────────────┘ */
H['tap_fast'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">5 saniyede ne kadar çok tıklayabilirsin? <b>30+ tıklama = ödül</b><br>
    <small style="color:#dc2626">⚠️ Otomatik tıklama (15 tps üstü) tespit edilirse kazanç iptal olur</small></p>
    <div class="tap-display" id="tapDisp">
      <div class="tap-counter" id="tapCount">0</div>
      <div class="tap-time" id="tapTime">5.0s</div>
    </div>
    <button class="btn-primary tap-btn" style="width:100%;font-size:18px" id="tapBtn">▶ BAŞLAT</button>
    <div id="mgResult" class="mg-result"></div>`;

  // İlk yüklemede event listener'ı bağla
  setTimeout(() => {
    const btn = document.getElementById('tapBtn');
    if (btn) {
      btn.onclick = null;
      btn.removeEventListener('click', tapClick);
      btn.addEventListener('click', tapClick);
    }
  }, 100);
};

let tapState = null;

window.tapClick = async function(ev) {
  if (ev) ev.preventDefault();
  const btn = document.getElementById('tapBtn');
  if (!btn) return;

  // ── Durum 1: Henüz başlamadı veya tamamlandı → YENİ TUR BAŞLAT ──
  if (!tapState || tapState.done || tapState.settled) {
    // Eski interval'ı temizle (varsa)
    if (tapState && tapState.iv) { clearInterval(tapState.iv); tapState.iv = null; }

    tapState = {
      count: 0,
      start: Date.now(),
      end: Date.now() + 5000,
      done: false,
      settled: false,
      iv: null,
      tapTimes: []   // CPS hesaplaması için
    };

    btn.textContent = '👆 TIKLA TIKLA TIKLA';
    document.getElementById('tapCount').textContent = '0';
    document.getElementById('tapTime').textContent = '5.0s';
    document.getElementById('mgResult').innerHTML = '';

    // Süre dolma kontrolü için interval (50ms - smooth)
    tapState.iv = setInterval(async () => {
      if (!tapState || tapState.done) {
        if (tapState && tapState.iv) clearInterval(tapState.iv);
        return;
      }

      const left = (tapState.end - Date.now()) / 1000;

      if (left <= 0) {
        // SÜRE BİTTİ
        tapState.done = true;
        clearInterval(tapState.iv);
        tapState.iv = null;

        const finalCount = tapState.count;
        document.getElementById('tapTime').textContent = '0.0s';
        btn.textContent = '⏳ Hesaplanıyor...';
        btn.disabled = true;

        // CPS hesapla (bot tespiti)
        const elapsed = (Date.now() - tapState.start) / 1000;
        const cps = elapsed > 0 ? finalCount / elapsed : 0;

        // Çift settle koruması
        if (tapState.settled) return;
        tapState.settled = true;

        try {
          const r = await settleSkill('tap_fast', finalCount, 30, 150, {
            cps: cps,
            maxScore: 90,         // 5sn × 18cps insan üst limiti
            dailyMaxWin: 5000     // günlük max bu oyundan
          });

          let msg = '';
          if (cps > 15) {
            msg = `<div class="mg-loss">🤖 Bot tespit edildi! (${cps.toFixed(1)} TPS)<br>Kazanç iptal.</div>`;
          } else if (r.payout > 0) {
            msg = `<div class="mg-win">${finalCount} tıklama · ${cps.toFixed(1)} TPS<br>+${cashFmt(r.payout)}</div>`;
          } else {
            msg = `<div class="mg-loss">${finalCount} tıklama · ${cps.toFixed(1)} TPS<br>En az 30 lazım</div>`;
          }
          document.getElementById('mgResult').innerHTML = msg;

        } catch(e) {
          console.error('[tap_fast] settle error:', e);
        } finally {
          btn.disabled = false;
          btn.textContent = '🔄 TEKRAR OYNA';
        }
        return;
      }

      document.getElementById('tapTime').textContent = left.toFixed(1) + 's';
    }, 50);

    return; // YENİ TUR BAŞLATTI, BU TIKLAMA SAYILMAZ
  }

  // ── Durum 2: Tur aktif → tıklamayı say ──
  // KORUMA: Süre kesin bitmiş mi tekrar kontrol et (race condition)
  if (Date.now() >= tapState.end) {
    return; // süre bittiyse kesinlikle sayma
  }

  if (tapState.done || tapState.settled) {
    return; // settle sürecinde / bitti
  }

  tapState.count++;
  tapState.tapTimes.push(Date.now());

  const counter = document.getElementById('tapCount');
  if (counter) counter.textContent = tapState.count;
};

/* ══════════════════ 28. NİŞAN EĞİTİMİ ══════════════════ */
H['aim_trainer'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">10 hedefi vur, hızını ölç</p>
    <div class="aim-board" id="aimBoard"></div>
    <p class="tac" id="aimInfo">Hedef: 0/10 · Süre: 0s</p>
    <button class="btn-primary" style="width:100%" onclick="aimStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let aimState = null;
window.aimStart = () => {
  aimState = { hits: 0, start: Date.now() };
  aimSpawn();
};
function aimSpawn() {
  const board = document.getElementById('aimBoard');
  if (!board || aimState.hits >= 10) { aimFinish(); return; }
  board.innerHTML = '';
  const t = document.createElement('button');
  t.className = 'aim-target';
  t.textContent = '🎯';
  const x = 5 + Math.random() * 80;
  const y = 5 + Math.random() * 70;
  t.style.left = x + '%';
  t.style.top = y + '%';
  t.onclick = () => {
    aimState.hits++;
    document.getElementById('aimInfo').textContent = `Hedef: ${aimState.hits}/10 · Süre: ${((Date.now()-aimState.start)/1000).toFixed(1)}s`;
    aimSpawn();
  };
  board.appendChild(t);
}
async function aimFinish() {
  const total = (Date.now() - aimState.start) / 1000;
  const score = Math.max(0, Math.round((30 - total) * 5));
  const r = await settleSkill('aim_trainer', score, 50, 200);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    10 hedef · ${total.toFixed(1)}s · skor ${score}<br>${r.payout > 0 ? '+'+cashFmt(r.payout) : 'çok yavaş'}</div>`;
}

/* ══════════════════ 29. TIC-TAC-TOE (XOX) ══════════════════ */
H['tic_tac_toe'] = g => {
  $r().innerHTML = `${betBar(g)}
    <p class="small muted mb-8">3x3 tahta. Sen X, AI O. Kazanırsan 1.94x</p>
    <button class="btn-primary" style="width:100%" onclick="tttStart()">▶ Başlat</button>
    <div id="tttBoard" class="ttt-board"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
let tttState = null;
window.tttStart = async () => {
  const bet = getBet();
  const c = await canPlay('tic_tac_toe', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  tttState = { bet, board: Array(9).fill(null), turn: 'X', active: true };
  document.getElementById('mgResult').innerHTML = '';
  tttRender();
};
function tttRender() {
  document.getElementById('tttBoard').innerHTML = tttState.board.map((c, i) =>
    `<button class="ttt-cell" onclick="tttPlay(${i})" ${c ? 'disabled' : ''}>${c || ''}</button>`
  ).join('');
}
function tttCheck(b) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,bb,c] of lines) if (b[a] && b[a]===b[bb] && b[bb]===b[c]) return b[a];
  if (b.every(x => x)) return 'draw';
  return null;
}
window.tttPlay = i => {
  if (!tttState.active || tttState.board[i]) return;
  tttState.board[i] = 'X';
  tttRender();
  const w1 = tttCheck(tttState.board);
  if (w1) return tttEnd(w1);
  // AI: önce kazanç hamlesi, sonra blok, sonra rastgele
  const empty = tttState.board.map((c,i) => c?null:i).filter(x => x !== null);
  let move = null;
  // Kazanmaya çalış
  for (const e of empty) { const t = [...tttState.board]; t[e] = 'O'; if (tttCheck(t) === 'O') { move = e; break; } }
  // Blokla
  if (move === null) for (const e of empty) { const t = [...tttState.board]; t[e] = 'X'; if (tttCheck(t) === 'X') { move = e; break; } }
  // Merkez
  if (move === null && empty.includes(4)) move = 4;
  // Rastgele
  if (move === null) move = empty[Math.floor(Math.random()*empty.length)];
  tttState.board[move] = 'O';
  tttRender();
  const w2 = tttCheck(tttState.board);
  if (w2) return tttEnd(w2);
};
async function tttEnd(w) {
  tttState.active = false;
  let m = 0, msg = '';
  if (w === 'X') { m = 1.94; msg = '🎉 Kazandın!'; }
  else if (w === 'draw') { m = 1.0; msg = '🤝 Beraberlik (iade)'; }
  else { msg = '😞 AI kazandı'; }
  const fm = m > 0 ? await bonus('tic_tac_toe', m) : 0;
  const p = Math.floor(tttState.bet * fm);
  const won = m >= 2;
  await settle('tic_tac_toe', tttState.bet, won, p, won?15:5);
  document.getElementById('mgResult').innerHTML = `<div class="${won?'mg-win':(m===1?'mg-warn':'mg-loss')}">${msg}${p>0?' → +'+cashFmt(p):''}</div>`;
}

/* ══════════════════ 30. TAŞ-KAĞIT-MAKAS ══════════════════ */
H['tas_kagit'] = g => {
  $r().innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Kazan: 1.95x · Beraberlik: iade</p>
    <div class="rps-row">
      <button class="rps-btn" onclick="playRPS('rock')">🪨<br>Taş</button>
      <button class="rps-btn" onclick="playRPS('paper')">📄<br>Kağıt</button>
      <button class="rps-btn" onclick="playRPS('scissors')">✂️<br>Makas</button>
    </div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.playRPS = async pick => {
  const bet = getBet();
  const c = await canPlay('tas_kagit', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const opts = ['rock','paper','scissors'];
  const ai = opts[Math.floor(Math.random()*3)];
  const wins = { rock:'scissors', paper:'rock', scissors:'paper' };
  let m = 0, msg = '';
  if (pick === ai) { m = 1.0; msg = '🤝 Beraberlik'; }
  else if (wins[pick] === ai) { m = 1.95; msg = '🎉 Kazandın!'; }
  else msg = '😞 Kaybettin';
  const fm = m > 0 ? await bonus('tas_kagit', m) : 0;
  const p = Math.floor(bet * fm);
  const won = m >= 2;
  await settle('tas_kagit', bet, won, p, won?12:(m===1?6:4));
  const emo = { rock:'🪨', paper:'📄', scissors:'✂️' };
  document.getElementById('mgResult').innerHTML = `<div class="rps-result">
    Sen: ${emo[pick]} · AI: ${emo[ai]}</div>
    <div class="${won?'mg-win':(m===1?'mg-warn':'mg-loss')}">${msg}${p>0?' → '+cashFmt(p):''}</div>`;
};

/* ══════════════════ 31. YILAN ══════════════════ */
H['snake_mini'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Yön tuşları (oklar veya WASD) ile yeşil yemi ye. Skor 30+ ödül.</p>
    <canvas id="snakeCanvas" width="280" height="280" style="border:2px solid #1f2937;border-radius:8px;background:#111827;display:block;margin:0 auto"></canvas>
    <div class="dir-pad">
      <button onclick="snakeDir(0,-1)">▲</button>
      <div><button onclick="snakeDir(-1,0)">◀</button><button onclick="snakeDir(1,0)">▶</button></div>
      <button onclick="snakeDir(0,1)">▼</button>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:8px" onclick="snakeStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let snk = null;
window.snakeStart = () => {
  if (snk?.iv) clearInterval(snk.iv);
  snk = { snake: [{x:7,y:7}], dir:{x:1,y:0}, food:{x:10,y:7}, score:0, dead:false };
  snk.iv = setInterval(snakeStep, 150);
};
window.snakeDir = (x, y) => {
  if (!snk || snk.dead) return;
  if (snk.dir.x === -x && snk.dir.y === -y) return; // ters dönme yok
  snk.dir = { x, y };
};
function snakeStep() {
  if (!snk || snk.dead) return;
  const head = { x: snk.snake[0].x + snk.dir.x, y: snk.snake[0].y + snk.dir.y };
  if (head.x < 0 || head.x >= 14 || head.y < 0 || head.y >= 14 || snk.snake.some(s => s.x === head.x && s.y === head.y)) {
    snk.dead = true;
    clearInterval(snk.iv);
    snakeFinish();
    return;
  }
  snk.snake.unshift(head);
  if (head.x === snk.food.x && head.y === snk.food.y) {
    snk.score++;
    do {
      snk.food = { x: Math.floor(Math.random()*14), y: Math.floor(Math.random()*14) };
    } while (snk.snake.some(s => s.x === snk.food.x && s.y === snk.food.y));
  } else snk.snake.pop();
  snakeDraw();
}
function snakeDraw() {
  const c = document.getElementById('snakeCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 280, 280);
  ctx.fillStyle = '#22c55e';
  snk.snake.forEach((s, i) => { ctx.fillRect(s.x*20+1, s.y*20+1, 18, 18); });
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(snk.food.x*20+2, snk.food.y*20+2, 16, 16);
  ctx.fillStyle = '#fff';
  ctx.font = '12px sans-serif';
  ctx.fillText('Skor: ' + snk.score, 8, 14);
}
async function snakeFinish() {
  const r = await settleSkill('snake_mini', snk.score, 30, 250);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    Skor: ${snk.score} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : '30 lazım'}</div>`;
}
// Klavye desteği
document.addEventListener('keydown', e => {
  if (!snk || snk.dead) return;
  const m = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
              w:[0,-1], s:[0,1], a:[-1,0], d:[1,0], W:[0,-1], S:[0,1], A:[-1,0], D:[1,0] };
  if (m[e.key]) { snakeDir(...m[e.key]); e.preventDefault(); }
});

/* ══════════════════ 32. BALON PATLAT ══════════════════ */
H['bubble_pop'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">10 saniyede çıkan balonları patlat. 20+ patlama ödül.</p>
    <div class="bubble-arena" id="bubbleArena"></div>
    <p class="tac" id="bubInfo">Patlatılan: 0 · Süre: 10.0s</p>
    <button class="btn-primary" style="width:100%" onclick="bubStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let bub = null;
window.bubStart = () => {
  bub = { count: 0, end: Date.now() + 10000, done: false };
  bubSpawn();
  const iv = setInterval(() => {
    const left = (bub.end - Date.now()) / 1000;
    if (left <= 0) { clearInterval(iv); bubFinish(); }
    else document.getElementById('bubInfo').textContent = `Patlatılan: ${bub.count} · Süre: ${left.toFixed(1)}s`;
  }, 50);
};
function bubSpawn() {
  if (!bub || bub.done) return;
  const arena = document.getElementById('bubbleArena');
  if (!arena) return;
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = '🎈';
  b.style.left = (5 + Math.random()*80) + '%';
  b.style.top = (5 + Math.random()*70) + '%';
  b.onclick = () => {
    // BUG FIX: süre bittiyse veya tur bittiyse sayma
    if (!bub || bub.done || Date.now() >= bub.end) { b.remove(); return; }
    bub.count++; b.remove();
  };
  arena.appendChild(b);
  setTimeout(() => b.remove(), 1500);
  if (Date.now() < bub.end) setTimeout(bubSpawn, 200 + Math.random()*200);
}
async function bubFinish() {
  bub.done = true;
  const arena = document.getElementById('bubbleArena');
  if (arena) arena.innerHTML = '';
  const r = await settleSkill('bubble_pop', bub.count, 20, 150);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    ${bub.count} patlatıldı · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 20 lazım'}</div>`;
}

/* ══════════════════ 33. KÖSTEBEK VURMA ══════════════════ */
H['whack_mole'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">15 saniye boyunca çıkan köstebekleri vur. 20+ ödül.</p>
    <div class="mole-grid" id="moleGrid">
      ${Array.from({length:9}, (_,i) => `<div class="mole-hole" id="mh${i}"></div>`).join('')}
    </div>
    <p class="tac" id="moleInfo">Vurulan: 0 · Süre: 15.0s</p>
    <button class="btn-primary" style="width:100%" onclick="moleStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let mole = null;
window.moleStart = () => {
  mole = { count: 0, end: Date.now() + 15000, done: false };
  moleSpawn();
  const iv = setInterval(() => {
    const left = (mole.end - Date.now()) / 1000;
    if (left <= 0) { clearInterval(iv); moleFinish(); }
    else document.getElementById('moleInfo').textContent = `Vurulan: ${mole.count} · Süre: ${left.toFixed(1)}s`;
  }, 50);
};
function moleSpawn() {
  if (!mole || mole.done) return;
  const idx = Math.floor(Math.random()*9);
  const hole = document.getElementById('mh'+idx);
  if (!hole || hole.classList.contains('active')) { setTimeout(moleSpawn, 200); return; }
  hole.classList.add('active');
  hole.textContent = '🐀';
  const onClick = () => {
    // BUG FIX: süre bittiyse veya tur bittiyse sayma
    if (!mole || mole.done || Date.now() >= mole.end) return;
    if (hole.classList.contains('active')) {
      mole.count++; hole.classList.remove('active'); hole.textContent='';
    }
  };
  hole.onclick = onClick;
  setTimeout(() => { hole.classList.remove('active'); hole.textContent=''; hole.onclick = null; }, 800);
  if (Date.now() < mole.end) setTimeout(moleSpawn, 400 + Math.random()*400);
}
async function moleFinish() {
  mole.done = true;
  const r = await settleSkill('whack_mole', mole.count, 20, 150);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    ${mole.count} vurdun · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 20'}</div>`;
}

/* ══════════════════ 34. DÜŞENİ YAKALA ══════════════════ */
H['catch_drop'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Sol/Sağ ile sepeti hareket ettir, düşen meyveleri yakala. 15+ ödül.</p>
    <canvas id="catchCanvas" width="280" height="320" style="border:2px solid #1f2937;border-radius:8px;background:#0c4a6e;display:block;margin:0 auto"></canvas>
    <div class="dir-pad" style="grid-template-columns:1fr 1fr"><button onclick="catchMove(-1)">◀</button><button onclick="catchMove(1)">▶</button></div>
    <button class="btn-primary" style="width:100%;margin-top:6px" onclick="catchStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let ctch = null;
window.catchStart = () => {
  if (ctch?.iv) clearInterval(ctch.iv);
  ctch = { px: 130, items: [], score: 0, miss: 0, end: Date.now() + 30000, done: false };
  ctch.iv = setInterval(catchStep, 50);
};
window.catchMove = d => { if (ctch && !ctch.done) ctch.px = Math.max(0, Math.min(240, ctch.px + d * 25)); };
function catchStep() {
  if (!ctch || ctch.done) return;
  if (Date.now() > ctch.end || ctch.miss >= 5) { ctch.done = true; clearInterval(ctch.iv); catchFinish(); return; }
  // Spawn
  if (Math.random() < 0.05) ctch.items.push({ x: 20 + Math.random()*240, y: 0, emo: ['🍎','🍌','🍓','🍊'][Math.floor(Math.random()*4)] });
  // Move
  ctch.items.forEach(it => it.y += 4);
  // Catch
  ctch.items = ctch.items.filter(it => {
    if (it.y >= 280 && it.y <= 310 && it.x >= ctch.px && it.x <= ctch.px+40) { ctch.score++; return false; }
    if (it.y > 320) { ctch.miss++; return false; }
    return true;
  });
  // Draw
  const c = document.getElementById('catchCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0c4a6e'; ctx.fillRect(0,0,280,320);
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctch.items.forEach(it => ctx.fillText(it.emo, it.x, it.y));
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(ctch.px, 295, 40, 18);
  ctx.fillStyle = '#fff';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Skor: ${ctch.score} · Kaçırma: ${ctch.miss}/5`, 8, 16);
}
async function catchFinish() {
  const r = await settleSkill('catch_drop', ctch.score, 15, 250);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    Yakalanan: ${ctch.score} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 15'}</div>`;
}

/* ══════════════════ 35. ENGELDEN KAÇ ══════════════════ */
H['dodge'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Aşağıdan gelen engellerden kaç. 30 saniye dayan, ödül kap.</p>
    <canvas id="dodgeCanvas" width="280" height="320" style="border:2px solid #1f2937;border-radius:8px;background:#1f2937;display:block;margin:0 auto"></canvas>
    <div class="dir-pad" style="grid-template-columns:1fr 1fr"><button onclick="dodgeMove(-1)">◀</button><button onclick="dodgeMove(1)">▶</button></div>
    <button class="btn-primary" style="width:100%;margin-top:6px" onclick="dodgeStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let dgs = null;
window.dodgeStart = () => {
  if (dgs?.iv) clearInterval(dgs.iv);
  dgs = { px: 130, obs: [], dead: false, start: Date.now(), score: 0 };
  dgs.iv = setInterval(dodgeStep, 40);
};
window.dodgeMove = d => { if (dgs && !dgs.dead) dgs.px = Math.max(0, Math.min(248, dgs.px + d * 22)); };
function dodgeStep() {
  if (!dgs || dgs.dead) return;
  dgs.score = Math.floor((Date.now() - dgs.start) / 100);
  if (Math.random() < 0.06) dgs.obs.push({ x: Math.random()*250, y: 0, w: 30 + Math.random()*40 });
  dgs.obs.forEach(o => o.y += 5);
  dgs.obs = dgs.obs.filter(o => o.y < 320);
  // Çarpışma
  for (const o of dgs.obs) {
    if (o.y > 280 && o.y < 320 && o.x < dgs.px+32 && o.x+o.w > dgs.px) {
      dgs.dead = true; clearInterval(dgs.iv); dodgeFinish(); return;
    }
  }
  if (Date.now() - dgs.start > 30000) { dgs.dead = true; clearInterval(dgs.iv); dodgeFinish(); return; }
  const c = document.getElementById('dodgeCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1f2937'; ctx.fillRect(0,0,280,320);
  ctx.fillStyle = '#dc2626';
  dgs.obs.forEach(o => ctx.fillRect(o.x, o.y, o.w, 16));
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(dgs.px, 290, 32, 24);
  ctx.fillStyle = '#fff';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Skor: ${dgs.score}`, 8, 16);
}
async function dodgeFinish() {
  const r = await settleSkill('dodge', dgs.score, 100, 350);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    Skor: ${dgs.score} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 100'}</div>`;
}

/* ══════════════════ 36. SEK SEK (Flappy benzeri) ══════════════════ */
H['flappy'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Tıklayarak kuşu uçur, borulardan geç. 5+ ödül.</p>
    <canvas id="flapCanvas" width="280" height="380" style="border:2px solid #1f2937;border-radius:8px;background:#0ea5e9;display:block;margin:0 auto" onclick="flapJump()"></canvas>
    <button class="btn-primary" style="width:100%;margin-top:6px" onclick="flapStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let flap = null;
window.flapStart = () => {
  if (flap?.iv) clearInterval(flap.iv);
  flap = { y: 190, vy: 0, pipes: [], score: 0, dead: false };
  flap.iv = setInterval(flapStep, 40);
};
window.flapJump = () => { if (flap && !flap.dead) flap.vy = -7; };
function flapStep() {
  if (!flap || flap.dead) return;
  flap.vy += 0.5;
  flap.y += flap.vy;
  if (flap.y < 0 || flap.y > 360) { flap.dead = true; clearInterval(flap.iv); flapFinish(); return; }
  if (flap.pipes.length === 0 || flap.pipes[flap.pipes.length-1].x < 180) {
    flap.pipes.push({ x: 280, gap: 80 + Math.random()*200, scored: false });
  }
  flap.pipes.forEach(p => p.x -= 3);
  flap.pipes = flap.pipes.filter(p => p.x > -50);
  for (const p of flap.pipes) {
    if (p.x < 60 && p.x > 20 && (flap.y < p.gap || flap.y > p.gap + 100)) {
      flap.dead = true; clearInterval(flap.iv); flapFinish(); return;
    }
    if (!p.scored && p.x < 30) { p.scored = true; flap.score++; }
  }
  const c = document.getElementById('flapCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0ea5e9'; ctx.fillRect(0,0,280,380);
  ctx.fillStyle = '#16a34a';
  flap.pipes.forEach(p => { ctx.fillRect(p.x, 0, 40, p.gap); ctx.fillRect(p.x, p.gap+100, 40, 380); });
  ctx.font = '24px sans-serif'; ctx.fillText('🐦', 30, flap.y);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif';
  ctx.fillText(flap.score, 130, 30);
}
async function flapFinish() {
  const r = await settleSkill('flappy', flap.score, 5, 250);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    Skor: ${flap.score} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 5'}</div>`;
}

/* ══════════════════ 37. HIZLI YAZMA ══════════════════ */
const TYPE_WORDS = ['merhaba','dünya','oyun','kazanç','seviye','başarı','bilgisayar','kahraman','ekonomi','market','dükkan','ürün','satış','liderlik','elmas','para','yatırım','ihracat','ihale','kripto','marka','şehir','reyon','stok','fiyat','kalite','güven','başlangıç','rekabet','strateji'];
H['type_speed'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">15 saniyede mümkün olduğunca çok kelime yaz. 8+ kelime ödül.</p>
    <div class="type-target" id="typeTarget">tıkla başla</div>
    <input type="text" id="typeInput" placeholder="kelimeyi yaz" autocomplete="off" autocapitalize="off" disabled>
    <p class="tac" id="typeInfo">Yazılan: 0 · Süre: 15.0s</p>
    <button class="btn-primary" style="width:100%" onclick="typeStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let typ = null;
window.typeStart = () => {
  typ = { count: 0, end: Date.now() + 15000, current: '', done: false };
  typeNext();
  const inp = document.getElementById('typeInput');
  inp.disabled = false; inp.value = ''; inp.focus();
  inp.oninput = e => {
    if (typ.done) return;
    if (e.target.value.toLowerCase().trim() === typ.current) {
      typ.count++; e.target.value = ''; typeNext();
    }
  };
  const iv = setInterval(() => {
    const left = (typ.end - Date.now()) / 1000;
    if (left <= 0) { clearInterval(iv); typeFinish(); }
    else document.getElementById('typeInfo').textContent = `Yazılan: ${typ.count} · Süre: ${left.toFixed(1)}s`;
  }, 50);
};
function typeNext() {
  typ.current = TYPE_WORDS[Math.floor(Math.random()*TYPE_WORDS.length)];
  document.getElementById('typeTarget').textContent = typ.current;
}
async function typeFinish() {
  typ.done = true;
  document.getElementById('typeInput').disabled = true;
  const r = await settleSkill('type_speed', typ.count, 8, 200);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    ${typ.count} kelime · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 8'}</div>`;
}

/* ══════════════════ 38. HASSAS TIKLA ══════════════════ */
H['precision'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">5 hedef, küçükten küçüğe. Kaç tanesini vurabilirsin?</p>
    <div class="aim-board" id="precBoard"></div>
    <p class="tac" id="precInfo">Hedef: 0/5</p>
    <button class="btn-primary" style="width:100%" onclick="precStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let prec = null;
window.precStart = () => {
  prec = { hits: 0, round: 0 };
  precSpawn();
};
function precSpawn() {
  if (prec.round >= 5) { precFinish(); return; }
  const board = document.getElementById('precBoard');
  if (!board) return;
  board.innerHTML = '';
  const t = document.createElement('button');
  t.className = 'aim-target';
  t.textContent = '⊕';
  const sz = 40 - prec.round * 6; // 40, 34, 28, 22, 16
  t.style.width = sz + 'px';
  t.style.height = sz + 'px';
  t.style.fontSize = (sz - 8) + 'px';
  t.style.left = (5 + Math.random()*80) + '%';
  t.style.top = (5 + Math.random()*70) + '%';
  let timer = setTimeout(() => { prec.round++; precSpawn(); }, 2000);
  t.onclick = () => { clearTimeout(timer); prec.hits++; prec.round++; document.getElementById('precInfo').textContent = `Hedef: ${prec.hits}/${prec.round}`; precSpawn(); };
  board.appendChild(t);
}
async function precFinish() {
  const r = await settleSkill('precision', prec.hits, 3, 200);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    ${prec.hits}/5 vurdun · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 3'}</div>`;
}

/* ══════════════════ 39. RENK EŞLEŞTİR ══════════════════ */
const COLOR_NAMES = { '#dc2626':'KIRMIZI', '#16a34a':'YEŞİL', '#1e5cb8':'MAVİ', '#f59e0b':'SARI', '#7c3aed':'MOR' };
H['color_match'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Yazıyı OKU değil, RENGİNE göre tıkla. Stroop testi! 8/10 ödül.</p>
    <div id="colorWord" class="color-word">Hazır?</div>
    <div class="color-options" id="colorOpts"></div>
    <p class="tac" id="colorInfo">Tur: 0/10 · Doğru: 0</p>
    <button class="btn-primary" style="width:100%" onclick="colorStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let col = null;
window.colorStart = () => {
  col = { round: 0, correct: 0 };
  colorNext();
};
function colorNext() {
  if (col.round >= 10) { colorFinish(); return; }
  const colors = Object.keys(COLOR_NAMES);
  const wordCol = colors[Math.floor(Math.random()*colors.length)];
  const wordTxt = COLOR_NAMES[colors[Math.floor(Math.random()*colors.length)]];
  col.target = wordCol;
  const word = document.getElementById('colorWord');
  word.textContent = wordTxt;
  word.style.color = wordCol;
  // Seçenekler
  const opts = document.getElementById('colorOpts');
  opts.innerHTML = colors.map(c => `<button class="color-opt" style="background:${c}" onclick="colorPick('${c}')">${COLOR_NAMES[c]}</button>`).join('');
}
window.colorPick = c => {
  if (c === col.target) col.correct++;
  col.round++;
  document.getElementById('colorInfo').textContent = `Tur: ${col.round}/10 · Doğru: ${col.correct}`;
  colorNext();
};
async function colorFinish() {
  const r = await settleSkill('color_match', col.correct, 8, 200);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    Doğru: ${col.correct}/10 · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 8'}</div>`;
}

/* ══════════════════ 40. SIRALI TIKLA ══════════════════ */
H['sequence_tap'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">1'den 16'ya kadar sıralı tıkla. Hızını ölçeriz.</p>
    <div class="seq-grid" id="seqGrid"></div>
    <p class="tac" id="seqInfo">Sırada: 1 · Süre: 0s</p>
    <button class="btn-primary" style="width:100%" onclick="seqStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let seq = null;
window.seqStart = () => {
  seq = { current: 1, start: Date.now() };
  const arr = Array.from({length:16}, (_,i)=>i+1);
  for (let i = arr.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]] = [arr[j],arr[i]]; }
  document.getElementById('seqGrid').innerHTML = arr.map(n => `<button class="seq-cell" data-n="${n}" onclick="seqTap(${n})">${n}</button>`).join('');
};
window.seqTap = n => {
  if (!seq) return;
  if (n === seq.current) {
    document.querySelector(`.seq-cell[data-n="${n}"]`).classList.add('done');
    seq.current++;
    if (seq.current > 16) { seqFinish(); return; }
    document.getElementById('seqInfo').textContent = `Sırada: ${seq.current} · Süre: ${((Date.now()-seq.start)/1000).toFixed(1)}s`;
  } else {
    toast('Yanlış sıra!', 'warn');
  }
};
async function seqFinish() {
  const total = (Date.now() - seq.start) / 1000;
  const score = Math.max(0, Math.round((30 - total) * 4));
  const r = await settleSkill('sequence_tap', score, 50, 200);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    ${total.toFixed(1)}s · skor ${score} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'çok yavaş'}</div>`;
}

/* ╔══════════════════════════════════════════════════════════════════╗
   ║                            🧠 ZEKA (10)                          ║
   ╚══════════════════════════════════════════════════════════════════╝ */

/* ══════════════════ 41. HAFIZA EŞLEŞTİR ══════════════════ */
H['memory_grid'] = g => {
  const emos = ['🍎','🍌','🍇','🍒','🥝','🍑','🥭','🍓'];
  const cards = [...emos, ...emos];
  for (let i = cards.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [cards[i],cards[j]] = [cards[j],cards[i]]; }
  $r().innerHTML = `<p class="small muted mb-8">8 çift kart, eşleştir. Az sürede tamamla, ödül kap.</p>
    <div class="memo-grid" id="memoGrid">${cards.map((c,i)=>`<button class="memo-card" data-i="${i}" data-e="${c}" onclick="memoFlip(${i})"><span>${c}</span></button>`).join('')}</div>
    <p class="tac" id="memoInfo">Eşleşen: 0/8 · Hamle: 0</p>
    <div id="mgResult" class="mg-result"></div>`;
  window.memoState = { flipped:[], matched:0, moves:0, start:Date.now() };
};
window.memoFlip = i => {
  const m = window.memoState;
  if (m.flipped.length >= 2) return;
  const card = document.querySelector(`.memo-card[data-i="${i}"]`);
  if (!card || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  m.flipped.push(i);
  if (m.flipped.length === 2) {
    m.moves++;
    const [a,b] = m.flipped;
    const ea = document.querySelector(`.memo-card[data-i="${a}"]`).dataset.e;
    const eb = document.querySelector(`.memo-card[data-i="${b}"]`).dataset.e;
    setTimeout(async () => {
      if (ea === eb) {
        document.querySelector(`.memo-card[data-i="${a}"]`).classList.add('matched');
        document.querySelector(`.memo-card[data-i="${b}"]`).classList.add('matched');
        m.matched++;
      } else {
        document.querySelector(`.memo-card[data-i="${a}"]`).classList.remove('flipped');
        document.querySelector(`.memo-card[data-i="${b}"]`).classList.remove('flipped');
      }
      m.flipped = [];
      document.getElementById('memoInfo').textContent = `Eşleşen: ${m.matched}/8 · Hamle: ${m.moves}`;
      if (m.matched >= 8) {
        const t = (Date.now()-m.start)/1000;
        const score = Math.max(0, Math.round(100 - m.moves*3 - t/2));
        const r = await settleSkill('memory_grid', score, 50, 250);
        document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
          ${m.moves} hamle, ${t.toFixed(1)}s · skor ${score} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : ''}</div>`;
      }
    }, 700);
  }
};

/* ══════════════════ 42. SIMON DİYOR ══════════════════ */
H['simon_says'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Yanan sıraya göre tıkla. Her doğru tur seviye atlar. 5+ ödül.</p>
    <div class="simon-grid">
      <button class="simon-btn red" data-c="0" onclick="simonPress(0)"></button>
      <button class="simon-btn green" data-c="1" onclick="simonPress(1)"></button>
      <button class="simon-btn blue" data-c="2" onclick="simonPress(2)"></button>
      <button class="simon-btn yellow" data-c="3" onclick="simonPress(3)"></button>
    </div>
    <p class="tac" id="simonInfo">Seviye: 0</p>
    <button class="btn-primary" style="width:100%" onclick="simonStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let sim = null;
window.simonStart = () => {
  sim = { seq: [], userIdx: 0, level: 0, locked: true };
  simonNext();
};
function simonNext() {
  sim.seq.push(Math.floor(Math.random()*4));
  sim.level++;
  sim.userIdx = 0;
  document.getElementById('simonInfo').textContent = `Seviye: ${sim.level}`;
  simonPlay(0);
}
function simonPlay(i) {
  if (i >= sim.seq.length) { sim.locked = false; return; }
  sim.locked = true;
  const btn = document.querySelector(`.simon-btn[data-c="${sim.seq[i]}"]`);
  btn.classList.add('lit');
  setTimeout(() => { btn.classList.remove('lit'); setTimeout(()=>simonPlay(i+1), 200); }, 500);
}
window.simonPress = async c => {
  if (!sim || sim.locked) return;
  const btn = document.querySelector(`.simon-btn[data-c="${c}"]`);
  btn.classList.add('lit'); setTimeout(()=>btn.classList.remove('lit'), 250);
  if (sim.seq[sim.userIdx] !== c) {
    // Yanlış
    sim.locked = true;
    const r = await settleSkill('simon_says', sim.level - 1, 5, 250);
    document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
      Seviye ${sim.level-1} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 5'}</div>`;
    return;
  }
  sim.userIdx++;
  if (sim.userIdx >= sim.seq.length) setTimeout(simonNext, 600);
};

/* ══════════════════ 43. HIZLI MATEMATİK ══════════════════ */
H['math_quick'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">30 saniyede mümkün olduğunca çok soru çöz. 10+ ödül.</p>
    <div class="math-q" id="mathQ">tıkla başla</div>
    <input type="number" id="mathA" placeholder="cevap" autocomplete="off" disabled>
    <p class="tac" id="mathInfo">Doğru: 0 · Süre: 30.0s</p>
    <button class="btn-primary" style="width:100%" onclick="mathStart()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let mth = null;
window.mathStart = () => {
  mth = { count: 0, end: Date.now() + 30000, ans: 0, done: false };
  mathNext();
  const inp = document.getElementById('mathA');
  inp.disabled = false; inp.value = ''; inp.focus();
  inp.oninput = e => {
    if (mth.done) return;
    if (parseInt(e.target.value) === mth.ans) { mth.count++; e.target.value = ''; mathNext(); }
  };
  const iv = setInterval(() => {
    const left = (mth.end - Date.now()) / 1000;
    if (left <= 0) { clearInterval(iv); mathFinish(); }
    else document.getElementById('mathInfo').textContent = `Doğru: ${mth.count} · Süre: ${left.toFixed(1)}s`;
  }, 50);
};
function mathNext() {
  const ops = ['+','-','×'];
  const op = ops[Math.floor(Math.random()*3)];
  let a = Math.floor(Math.random()*20)+1, b = Math.floor(Math.random()*20)+1;
  if (op === '×') { a = Math.floor(Math.random()*10)+1; b = Math.floor(Math.random()*10)+1; }
  mth.ans = op === '+' ? a+b : op === '-' ? a-b : a*b;
  document.getElementById('mathQ').textContent = `${a} ${op} ${b} = ?`;
}
async function mathFinish() {
  mth.done = true;
  document.getElementById('mathA').disabled = true;
  const r = await settleSkill('math_quick', mth.count, 10, 200);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    ${mth.count} doğru · ${r.payout > 0 ? '+'+cashFmt(r.payout) : 'en az 10'}</div>`;
}

/* ══════════════════ 44. SAYI SIRALA ══════════════════ */
H['order_numbers'] = g => {
  const arr = [];
  while (arr.length < 9) { const n = Math.floor(Math.random()*100); if (!arr.includes(n)) arr.push(n); }
  window.ordState = { arr: [...arr], sorted: [], target: [...arr].sort((a,b)=>a-b), start: Date.now() };
  $r().innerHTML = `<p class="small muted mb-8">9 sayıyı küçükten büyüğe sırala. Hızlı ol!</p>
    <div class="ord-row"><b>Hedef:</b> küçükten büyüğe</div>
    <div class="ord-grid" id="ordGrid">${arr.map((n,i)=>`<button class="ord-btn" data-i="${i}" data-n="${n}" onclick="ordPick(${i},${n})">${n}</button>`).join('')}</div>
    <div class="ord-row"><b>Sıralananlar:</b> <span id="ordPicked">—</span></div>
    <button class="btn-secondary" style="width:100%;margin-top:6px" onclick="ordReset()">↺ Sıfırla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.ordPick = (i, n) => {
  const o = window.ordState;
  o.sorted.push(n);
  document.querySelector(`.ord-btn[data-i="${i}"]`).disabled = true;
  document.querySelector(`.ord-btn[data-i="${i}"]`).classList.add('done');
  document.getElementById('ordPicked').textContent = o.sorted.join(' → ');
  if (o.sorted.length === 9) ordFinish();
};
window.ordReset = () => {
  const o = window.ordState;
  o.sorted = [];
  document.querySelectorAll('.ord-btn').forEach(b => { b.disabled = false; b.classList.remove('done'); });
  document.getElementById('ordPicked').textContent = '—';
};
async function ordFinish() {
  const o = window.ordState;
  const correct = JSON.stringify(o.sorted) === JSON.stringify(o.target);
  const t = (Date.now() - o.start) / 1000;
  const score = correct ? Math.max(0, Math.round(50 - t)) : 0;
  const r = await settleSkill('order_numbers', score, 20, 150);
  document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
    ${correct ? '✅ Doğru' : '❌ Yanlış sıra'} · ${t.toFixed(1)}s · ${r.payout > 0 ? '+'+cashFmt(r.payout) : ''}</div>`;
}

/* ══════════════════ 45. SIRADAKİ SAYI ══════════════════ */
H['next_in_seq'] = g => {
  // Aritmetik veya geometrik dizi
  const isGeo = Math.random() < 0.4;
  let nums = [];
  let answer = 0;
  if (isGeo) {
    const a = Math.floor(Math.random()*5)+2, r = Math.floor(Math.random()*3)+2;
    for (let i = 0; i < 4; i++) nums.push(a * Math.pow(r, i));
    answer = a * Math.pow(r, 4);
  } else {
    const a = Math.floor(Math.random()*20)+1, d = Math.floor(Math.random()*10)+1;
    for (let i = 0; i < 4; i++) nums.push(a + i*d);
    answer = a + 4*d;
  }
  window.nseqState = { ans: answer };
  $r().innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Sıradaki sayıyı tahmin et. Doğru cevap: 1.95x</p>
    <div class="nseq-display">${nums.join(' , ')} , <b>?</b></div>
    <input type="number" id="nseqA" placeholder="cevap" autocomplete="off">
    <button class="btn-primary" style="width:100%;margin-top:8px" onclick="nseqSubmit()">Cevapla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.nseqSubmit = async () => {
  const bet = getBet();
  const c = await canPlay('next_in_seq', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const a = parseInt(document.getElementById('nseqA').value);
  const won = a === window.nseqState.ans;
  const m = won ? await bonus('next_in_seq', 1.95) : 0;
  const p = won ? Math.floor(bet*m) : 0;
  await settle('next_in_seq', bet, won, p, won?15:5);
  document.getElementById('mgResult').innerHTML = `<div class="${won?'mg-win':'mg-loss'}">
    Doğru: ${window.nseqState.ans} · ${won ? '+'+cashFmt(p) : '😞'}</div>`;
};

/* ══════════════════ 46. KELİME ÇÖZ ══════════════════ */
const SCRAMBLE_WORDS = ['merhaba','dünya','oyun','kazanç','elmas','market','bilgisayar','şehir','başarı','strateji','rekabet','geliştirici','telefon','ekonomi'];
H['word_scramble'] = g => {
  const w = SCRAMBLE_WORDS[Math.floor(Math.random()*SCRAMBLE_WORDS.length)];
  const sc = w.split('').sort(()=>Math.random()-0.5).join('');
  window.wsState = { word: w };
  $r().innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Karışık harfleri düzgün kelime yap. Doğru: 1.95x</p>
    <div class="ws-display">${sc}</div>
    <input type="text" id="wsA" placeholder="cevap" autocomplete="off" autocapitalize="off">
    <button class="btn-primary" style="width:100%;margin-top:8px" onclick="wsSubmit()">Cevapla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
window.wsSubmit = async () => {
  const bet = getBet();
  const c = await canPlay('word_scramble', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  const a = document.getElementById('wsA').value.toLowerCase().trim();
  const won = a === window.wsState.word.toLowerCase();
  const m = won ? await bonus('word_scramble', 1.95) : 0;
  const p = won ? Math.floor(bet*m) : 0;
  await settle('word_scramble', bet, won, p, won?15:5);
  document.getElementById('mgResult').innerHTML = `<div class="${won?'mg-win':'mg-loss'}">
    Doğru: ${window.wsState.word} · ${won ? '+'+cashFmt(p) : '😞'}</div>`;
};

/* ══════════════════ 47. MİNİ MAYIN TEMİZLE ══════════════════ */
H['mini_sweeper'] = g => {
  // 5x5, 5 mayın
  const N = 5, M = 5;
  const cells = Array.from({length:N*N}, (_,i)=>({i, mine:false, open:false, val:0}));
  const minePool = [...Array(N*N).keys()];
  for (let i = 0; i < M; i++) { const idx = Math.floor(Math.random()*minePool.length); cells[minePool[idx]].mine = true; minePool.splice(idx,1); }
  for (let i = 0; i < N*N; i++) {
    if (cells[i].mine) continue;
    const x = i%N, y = Math.floor(i/N);
    let cnt = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (dx===0 && dy===0) continue;
      const nx = x+dx, ny = y+dy;
      if (nx<0||nx>=N||ny<0||ny>=N) continue;
      if (cells[ny*N+nx].mine) cnt++;
    }
    cells[i].val = cnt;
  }
  window.swpState = { cells, opened: 0, dead: false, won: false, N };
  $r().innerHTML = `${betBar(g)}
    <p class="small muted mb-8">5x5, 5 mayın. Mayına basmadan tüm güvenli hücreleri aç. Başarı: 3.5x</p>
    <button class="btn-primary" style="width:100%;margin-bottom:8px" onclick="swpStart()">▶ Başlat</button>
    <div class="swp-grid" id="swpGrid"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.swpStart = async () => {
  const bet = getBet();
  const c = await canPlay('mini_sweeper', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  window.swpState.bet = bet;
  swpRender();
};
function swpRender() {
  const s = window.swpState;
  document.getElementById('swpGrid').innerHTML = s.cells.map(c => {
    if (c.open) return `<div class="swp-cell open ${c.mine?'mine':''}">${c.mine?'💣':(c.val||'')}</div>`;
    return `<button class="swp-cell" onclick="swpOpen(${c.i})"></button>`;
  }).join('');
}
window.swpOpen = async i => {
  const s = window.swpState;
  if (s.dead || s.won || !s.bet) return;
  const c = s.cells[i];
  if (c.open) return;
  c.open = true;
  if (c.mine) {
    s.dead = true;
    s.cells.forEach(x => { if (x.mine) x.open = true; });
    swpRender();
    await settle('mini_sweeper', s.bet, false, 0, 5);
    document.getElementById('mgResult').innerHTML = `<div class="mg-loss">💥 Mayın!</div>`;
    return;
  }
  s.opened++;
  // Boşsa komşuları aç (basit flood fill)
  if (c.val === 0) {
    const x = i%s.N, y = Math.floor(i/s.N);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x+dx, ny = y+dy;
      if (nx<0||nx>=s.N||ny<0||ny>=s.N) continue;
      const nc = s.cells[ny*s.N+nx];
      if (!nc.open && !nc.mine) { swpOpen(ny*s.N+nx); }
    }
  }
  swpRender();
  if (s.opened >= s.N*s.N - 5) {
    s.won = true;
    const m = await bonus('mini_sweeper', 3.5);
    const p = Math.floor(s.bet * m);
    await settle('mini_sweeper', s.bet, true, p, 30);
    document.getElementById('mgResult').innerHTML = `<div class="mg-win">🎉 Temiz! +${cashFmt(p)}</div>`;
  }
};

/* ══════════════════ 48. 2048 ══════════════════ */
H['puzzle_2048'] = g => {
  $r().innerHTML = `<p class="small muted mb-8">Aynı sayıları birleştir, 2048'e ulaş. 256+ ödül.</p>
    <div class="g2-board" id="g2Board"></div>
    <div class="dir-pad">
      <button onclick="g2Move('up')">▲</button>
      <div><button onclick="g2Move('left')">◀</button><button onclick="g2Move('right')">▶</button></div>
      <button onclick="g2Move('down')">▼</button>
    </div>
    <p class="tac" id="g2Info">Skor: 0 · En yüksek: 0</p>
    <button class="btn-primary" style="width:100%" onclick="g2Start()">▶ Başla</button>
    <div id="mgResult" class="mg-result"></div>`;
};
let g2 = null;
window.g2Start = () => {
  g2 = { board: Array(16).fill(0), score: 0, max: 0, dead: false };
  g2Add(); g2Add(); g2Render();
};
function g2Add() {
  const empty = g2.board.map((v,i) => v===0?i:null).filter(x => x !== null);
  if (!empty.length) return;
  g2.board[empty[Math.floor(Math.random()*empty.length)]] = Math.random() < 0.9 ? 2 : 4;
}
function g2Render() {
  const b = document.getElementById('g2Board');
  if (!b) return;
  b.innerHTML = g2.board.map(v => {
    if (v === 0) return '<div class="g2-cell empty"></div>';
    g2.max = Math.max(g2.max, v);
    return `<div class="g2-cell" data-v="${v}">${v}</div>`;
  }).join('');
  document.getElementById('g2Info').textContent = `Skor: ${g2.score} · En yüksek: ${g2.max}`;
}
window.g2Move = async dir => {
  if (!g2 || g2.dead) return;
  const N = 4;
  const old = JSON.stringify(g2.board);
  const moveLine = (line) => {
    const filtered = line.filter(v => v !== 0);
    for (let i = 0; i < filtered.length-1; i++) {
      if (filtered[i] === filtered[i+1]) {
        filtered[i] *= 2;
        g2.score += filtered[i];
        filtered.splice(i+1, 1);
      }
    }
    while (filtered.length < N) filtered.push(0);
    return filtered;
  };
  const get = (x,y) => g2.board[y*N+x];
  const set = (x,y,v) => g2.board[y*N+x] = v;
  if (dir === 'left') for (let y = 0; y < N; y++) { const l = moveLine([get(0,y),get(1,y),get(2,y),get(3,y)]); l.forEach((v,x)=>set(x,y,v)); }
  if (dir === 'right') for (let y = 0; y < N; y++) { const l = moveLine([get(3,y),get(2,y),get(1,y),get(0,y)]); l.forEach((v,x)=>set(3-x,y,v)); }
  if (dir === 'up') for (let x = 0; x < N; x++) { const l = moveLine([get(x,0),get(x,1),get(x,2),get(x,3)]); l.forEach((v,y)=>set(x,y,v)); }
  if (dir === 'down') for (let x = 0; x < N; x++) { const l = moveLine([get(x,3),get(x,2),get(x,1),get(x,0)]); l.forEach((v,y)=>set(x,3-y,v)); }
  if (JSON.stringify(g2.board) !== old) g2Add();
  g2Render();
  // Game over kontrolü
  if (g2.board.every(v => v !== 0)) {
    let canMove = false;
    for (let i = 0; i < 16 && !canMove; i++) {
      const x = i%N, y = Math.floor(i/N);
      if (x < N-1 && g2.board[i] === g2.board[i+1]) canMove = true;
      if (y < N-1 && g2.board[i] === g2.board[i+N]) canMove = true;
    }
    if (!canMove) {
      g2.dead = true;
      const r = await settleSkill('puzzle_2048', g2.max, 256, 350);
      document.getElementById('mgResult').innerHTML = `<div class="${r.won?'mg-win':'mg-loss'}">
        En yüksek: ${g2.max} · ${r.payout > 0 ? '+'+cashFmt(r.payout) : '256 lazım'}</div>`;
    }
  }
};

/* ══════════════════ 49. ADAM ASMACA ══════════════════ */
H['hangman'] = g => {
  const w = SCRAMBLE_WORDS[Math.floor(Math.random()*SCRAMBLE_WORDS.length)].toLowerCase();
  window.hmState = { word: w, guessed: new Set(), wrong: 0, max: 6, won: false };
  $r().innerHTML = `${betBar(g)}
    <p class="small muted mb-8">Harfleri tahmin et, kelimeyi bul. 6 yanlış hak. Doğru: 1.97x</p>
    <button class="btn-primary" style="width:100%;margin-bottom:8px" onclick="hmStart()">▶ Başlat</button>
    <div id="hmArea"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.hmStart = async () => {
  const bet = getBet();
  const c = await canPlay('hangman', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  window.hmState.bet = bet;
  hmRender();
};
function hmRender() {
  const h = window.hmState;
  const display = h.word.split('').map(c => h.guessed.has(c) ? c : '_').join(' ');
  const letters = 'abcçdefgğhıijklmnoöprsştuüvyz'.split('');
  document.getElementById('hmArea').innerHTML = `
    <div class="hm-display">${display}</div>
    <div class="hm-stat">Yanlış: ${h.wrong}/${h.max}</div>
    <div class="hm-letters">${letters.map(l => `<button class="hm-letter ${h.guessed.has(l)?'used':''}" ${h.guessed.has(l)?'disabled':''} onclick="hmGuess('${l}')">${l}</button>`).join('')}</div>`;
}
window.hmGuess = async l => {
  const h = window.hmState;
  if (h.guessed.has(l) || h.won || h.wrong >= h.max) return;
  h.guessed.add(l);
  if (!h.word.includes(l)) h.wrong++;
  // Kelime tamam mı?
  const all = h.word.split('').every(c => h.guessed.has(c));
  if (all) {
    h.won = true;
    const m = await bonus('hangman', 1.97);
    const p = Math.floor(h.bet * m);
    await settle('hangman', h.bet, true, p, 25);
    hmRender();
    document.getElementById('mgResult').innerHTML = `<div class="mg-win">🎉 ${h.word} · +${cashFmt(p)}</div>`;
    return;
  }
  if (h.wrong >= h.max) {
    await settle('hangman', h.bet, false, 0, 6);
    hmRender();
    document.getElementById('mgResult').innerHTML = `<div class="mg-loss">💀 Asıldı! Kelime: ${h.word}</div>`;
    return;
  }
  hmRender();
};

/* ══════════════════ 50. SUDOKU 4x4 ══════════════════ */
H['sudoku_mini'] = g => {
  // 4x4 puzzle: 1-4, her satır/sütun/2x2 bölge tekil
  const solutions = [
    [1,2,3,4, 3,4,1,2, 2,1,4,3, 4,3,2,1],
    [1,3,2,4, 2,4,1,3, 3,1,4,2, 4,2,3,1],
    [2,1,4,3, 3,4,1,2, 1,3,2,4, 4,2,3,1],
    [4,3,1,2, 1,2,4,3, 3,4,2,1, 2,1,3,4],
  ];
  const sol = solutions[Math.floor(Math.random()*solutions.length)];
  const puzzle = [...sol];
  // 8 hücre boşalt
  const idxs = Array.from({length:16}, (_,i)=>i);
  for (let i = 0; i < 8; i++) { const j = Math.floor(Math.random()*idxs.length); puzzle[idxs[j]] = 0; idxs.splice(j,1); }
  window.sdkState = { puzzle: [...puzzle], sol, given: puzzle.map(v => v !== 0) };
  $r().innerHTML = `${betBar(g)}
    <p class="small muted mb-8">4x4 sudoku. 1-4 her satır/sütun/2x2'de bir kez. Doğru: 1.97x</p>
    <button class="btn-primary" style="width:100%;margin-bottom:8px" onclick="sdkStart()">▶ Başlat</button>
    <div id="sdkArea"></div>
    <div id="mgResult" class="mg-result"></div>`;
};
window.sdkStart = async () => {
  const bet = getBet();
  const c = await canPlay('sudoku_mini', bet); if (!c.ok) return toast(c.msg,'warn');
  if (!await takeBet(bet)) return toast('Bahis hatası','error');
  window.sdkState.bet = bet;
  sdkRender();
};
function sdkRender() {
  const s = window.sdkState;
  document.getElementById('sdkArea').innerHTML = `
    <div class="sdk-grid">${s.puzzle.map((v,i) =>
      s.given[i]
        ? `<div class="sdk-cell given">${v}</div>`
        : `<input class="sdk-cell" type="number" min="1" max="4" data-i="${i}" value="${v||''}" oninput="sdkInput(${i}, this.value)">`
    ).join('')}</div>
    <button class="btn-success" style="width:100%;margin-top:8px" onclick="sdkCheck()">✓ Kontrol Et</button>`;
}
window.sdkInput = (i, v) => {
  const n = parseInt(v);
  window.sdkState.puzzle[i] = (n >= 1 && n <= 4) ? n : 0;
};
window.sdkCheck = async () => {
  const s = window.sdkState;
  const correct = JSON.stringify(s.puzzle) === JSON.stringify(s.sol);
  if (correct) {
    const m = await bonus('sudoku_mini', 1.97);
    const p = Math.floor(s.bet * m);
    await settle('sudoku_mini', s.bet, true, p, 35);
    document.getElementById('mgResult').innerHTML = `<div class="mg-win">🎉 Mükemmel! +${cashFmt(p)}</div>`;
  } else {
    await settle('sudoku_mini', s.bet, false, 0, 8);
    document.getElementById('mgResult').innerHTML = `<div class="mg-loss">❌ Yanlış. Doğru çözüm:<br><code>${s.sol.join(',')}</code></div>`;
  }
};

console.log('[mini-oyunlar-2] 25 beceri/zeka oyunu yüklendi');
})();

/* ============================================================
   PvP UI — Render (mini-oyunlar sekmesinde gösterilir)
   ============================================================ */
if (typeof window.renderPvpSection === 'undefined'){
  window.renderPvpSection = async function(){
    const challenges = await dbGet('pvp') || {};
    const open = Object.values(challenges).filter(c=>c.status==='waiting' && c.creator !== GZ.uid);
    let html = `<div class="section-title">⚔️ PvP Meydan Okumalar</div>`;
    html += `<button class="btn-primary mb-12" style="width:100%" onclick="askCreatePvp()">+ Meydan Oku</button>`;
    if (open.length === 0){
      html += `<p class="small muted tac">Şu an açık meydan okuma yok</p>`;
    } else {
      for (const ch of open){
        html += `<div class="card">
          <div class="card-row">
            <div class="card-thumb">⚔️</div>
            <div class="card-body">
              <div class="card-title">${escapeHtml(ch.creatorName)}'nin Meydan Okuması</div>
              <div class="card-sub">Bahis: <b class="green">${cashFmt(ch.bet)}</b> × 2 = ${cashFmt(ch.bet*2*0.95)} (kazanç)</div>
            </div>
          </div>
          <button class="btn-primary mt-12" style="width:100%" onclick="joinPvpChallenge('${ch.id}').then(()=>render('oyunlar'))">Kabul Et</button>
        </div>`;
      }
    }
    return html;
  };
  window.askCreatePvp = function(){
    showModal('⚔️ Meydan Oku', `
      <p class="small muted mb-8">Bahis koy, rakip kabul etsin — zar atan kazanır. Kazanç %5 komisyon düşülür.</p>
      <div class="input-group">
        <label>Bahis Miktarı (₺)</label>
        <input type="number" id="pvpBet" value="1000" min="500" step="100">
      </div>
      <button class="btn-primary" onclick="createPvpChallenge(parseInt($('#pvpBet').value)).then(()=>{closeModal();render('oyunlar')})">Meydan Oku</button>
    `);
  };
}
