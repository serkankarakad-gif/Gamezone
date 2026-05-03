/* ============================================================================
   admin-yonetim.js — GameZone ERP: Genişletilmiş Admin Paneli + Vatandaş Hizmet Menüleri
   ============================================================================
   1) Admin paneline yeni nav butonları + sayfaları (Muhtarlık, Belediye, Polis, vb.)
   2) Vatandaşın gördüğü hizmet menüsü (sadece bilgi gösterir, yetki sahibi yönetir)
   3) Ekranlar role göre değişir
   ============================================================================ */
'use strict';

(function() {
  const _wait = setInterval(function() {
    if (!window.AP || !document.querySelector('.admin-nav') || !window.GZ?.data?.isFounder) return;
    clearInterval(_wait);
    setTimeout(injectAdminNav, 1500);
  }, 600);

  function _ts(t) { return new Date(t).toLocaleString('tr-TR'); }
  function _f(n)  { return typeof cashFmt === 'function' ? cashFmt(n) : (Number(n)||0).toLocaleString('tr-TR') + ' ₺'; }
  function _body(html) {
    const el = document.getElementById(window._adminTarget || 'adminPanelBody');
    if (el) el.innerHTML = html;
  }
  function _section(title, content) {
    return `<div style="padding:24px;max-width:1200px">
      <h2 style="color:#e2e8f0;margin:0 0 20px;font-size:20px;font-weight:800;padding-bottom:12px;border-bottom:1px solid #1a2f4a">${title}</h2>
      ${content}
    </div>`;
  }
  function _stat(label, value, color, sub) {
    return `<div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:16px;text-align:center">
      <div style="color:#475569;font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:4px">${label}</div>
      <div style="font-size:24px;font-weight:900;color:${color||'#e2e8f0'}">${value}</div>
      ${sub ? `<div style="color:#334155;font-size:10px;margin-top:2px">${sub}</div>` : ''}
    </div>`;
  }
  function _input(id, ph, type, val) {
    return `<input id="${id}" type="${type||'text'}" placeholder="${ph}" value="${val||''}"
      style="width:100%;padding:10px 12px;background:#080d1a;border:1px solid #1a2f4a;
      border-radius:8px;color:#e2e8f0;font-size:13px;box-sizing:border-box;margin-bottom:8px">`;
  }
  function _btn(label, onclick, color) {
    return `<button onclick="${onclick}" style="background:${color||'#3b82f6'};color:white;border:none;
      border-radius:8px;padding:11px 16px;font-weight:700;font-size:13px;cursor:pointer">${label}</button>`;
  }

  /* ═══════════════════════════════════════════════════════════════
     1. ADMIN NAV BUTONLARI EKLE
     ═══════════════════════════════════════════════════════════════ */
  function injectAdminNav() {
    const nav = document.querySelector('.admin-nav');
    if (!nav) return;
    if (document.getElementById('adm_nav_yonetim')) return;

    // Ayrım çizgisi + başlık
    const sep = document.createElement('div');
    sep.id = 'adm_nav_yonetim';
    sep.innerHTML = `
      <div style="margin:14px 8px 6px;padding-top:10px;border-top:1px solid #1a2f4a;
        font-size:9px;letter-spacing:2px;color:#475569;font-weight:800">DEVLET YÖNETİMİ</div>`;
    nav.appendChild(sep);

    const yeniler = [
      { id:'muhtarlik_adm',   icon:'🏛️', label:'Muhtarlık',     fn:openMuhtarlikAdmin    },
      { id:'belediye_adm',    icon:'🏙️', label:'Belediyeler',   fn:openBelediyeAdmin     },
      { id:'polis_adm',       icon:'👮', label:'Polis',          fn:openPolisAdmin         },
      { id:'asayis_adm',      icon:'⚖️', label:'Mahkeme',        fn:openMahkemeAdmin       },
      { id:'sgk_adm',         icon:'🏥', label:'SGK',             fn:openSGKAdmin            },
      { id:'secim_adm',       icon:'🗳️', label:'Seçim Yönetimi', fn:openSecimAdmin          },
      { id:'ihale_adm',       icon:'📋', label:'İhaleler',        fn:openIhaleAdmin          },
      { id:'olay_adm',        icon:'⚡', label:'Ekonomi Olayları',fn:openOlayAdmin          },
      { id:'duyuru_adm',      icon:'📢', label:'Duyuru/Flash',   fn:openDuyuruAdmin        },
      { id:'versiyon_adm',    icon:'🚀', label:'Versiyon Yayını', fn:openVersiyonAdmin      },
    ];

    yeniler.forEach(it => {
      const btn = document.createElement('button');
      btn.id = `adm_${it.id}`;
      btn.className = 'admin-nav-btn';
      btn.innerHTML = `${it.icon} ${it.label}`;
      btn.onclick = () => {
        document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        it.fn();
      };
      nav.appendChild(btn);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     2. MUHTARLIK YÖNETİMİ
     ═══════════════════════════════════════════════════════════════ */
  async function openMuhtarlikAdmin() {
    const idFee     = (await dbGet('system/idCardFee'))    || 500;
    const ehlFee    = (await dbGet('system/driverLicenseFee')) || 1200;
    const passFee   = (await dbGet('system/passportFee')) || 3500;
    const sosBudget = (await dbGet('system/sosyalYardimBudget')) || 1500;
    const muhtarlar = await dbGet('system/muhtarlar') || {};

    const html = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        ${_stat('AKTİF MUHTAR', Object.keys(muhtarlar).length, '#3b82f6')}
        ${_stat('KART ÜCRETİ', _f(idFee), '#22c55e')}
        ${_stat('SOSYAL YARDIM', _f(sosBudget), '#a855f7')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📋 Belge Ücretleri</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Kimlik Kartı (₺)</label>
            ${_input('adm_idFee', '500', 'number', idFee)}
          </div>
          <div>
            <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Ehliyet (₺)</label>
            ${_input('adm_ehlFee', '1200', 'number', ehlFee)}
          </div>
          <div>
            <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Pasaport (₺)</label>
            ${_input('adm_passFee', '3500', 'number', passFee)}
          </div>
        </div>
        <button onclick="(async()=>{
          const a=parseInt(document.getElementById('adm_idFee').value)||500;
          const b=parseInt(document.getElementById('adm_ehlFee').value)||1200;
          const c=parseInt(document.getElementById('adm_passFee').value)||3500;
          await dbSet('system/idCardFee',a);
          await dbSet('system/driverLicenseFee',b);
          await dbSet('system/passportFee',c);
          toast('✅ Belge ücretleri güncellendi','success');
        })()" style="background:#22c55e;color:white;border:none;border-radius:8px;padding:11px 18px;font-weight:700;cursor:pointer">
          💾 Belge Ücretlerini Kaydet
        </button>
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">🤝 Sosyal Yardım Ayarları</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Yardım Tutarı (₺)</label>
            ${_input('adm_sosBudget', '1500', 'number', sosBudget)}
          </div>
          <div>
            <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Yoksulluk Sınırı (₺)</label>
            ${_input('adm_sosLimit', '5000', 'number', (await dbGet('system/sosyalYardimLimit'))||5000)}
          </div>
        </div>
        ${_btn('💾 Yardım Ayarlarını Kaydet', `(async()=>{
          await dbSet('system/sosyalYardimBudget',parseInt(document.getElementById('adm_sosBudget').value)||1500);
          await dbSet('system/sosyalYardimLimit',parseInt(document.getElementById('adm_sosLimit').value)||5000);
          toast('✅ Yardım ayarları güncellendi','success');
        })()`, '#22c55e')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">👥 Aktif Muhtarlar</h3>
        ${Object.keys(muhtarlar).length ? Object.entries(muhtarlar).map(([il,uid]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a2f4a">
            <span style="font-size:13px;color:#e2e8f0"><b>${il}</b> — ${uid.slice(0,12)}</span>
            <button onclick="if(confirm('Görevden al?')){SL_gorevdenAl('${uid}','Admin kararı').then(()=>openMuhtarlikAdmin())}"
              style="background:#ef4444;color:white;border:none;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer">Görevden Al</button>
          </div>
        `).join('') : '<p style="color:#475569;font-size:12px;text-align:center;padding:12px">Aktif muhtar yok. Seçim başlat!</p>'}
      </div>
    `;
    _body(_section('🏛️ Muhtarlık Yönetimi', html));
  }
  window.openMuhtarlikAdmin = openMuhtarlikAdmin;

  /* ═══════════════════════════════════════════════════════════════
     3. BELEDİYE YÖNETİMİ
     ═══════════════════════════════════════════════════════════════ */
  async function openBelediyeAdmin() {
    const ruhsatFee  = (await dbGet('system/dukkanRuhsatFee')) || 15000;
    const restFee    = (await dbGet('system/restoranRuhsatFee')) || 35000;
    const fabFee     = (await dbGet('system/fabrikaRuhsatFee')) || 100000;
    const ctv        = (await dbGet('system/ctvRate')) || 0.02;
    const transitFee = (await dbGet('system/transitFare')) || 15;
    const mayors     = await dbGet('system/mayors') || {};

    const html = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        ${_stat('BELEDİYE BAŞKANI', Object.keys(mayors).length, '#06b6d4')}
        ${_stat('TOPLU TAŞIMA', transitFee + '₺', '#3b82f6')}
        ${_stat('ÇTV ORANI', '%' + (ctv*100).toFixed(1), '#a855f7')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📜 İşyeri Ruhsatları</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:11px;color:#94a3b8">Dükkan (₺)</label>
            ${_input('adm_dukkanRuhsat', '15000', 'number', ruhsatFee)}
          </div>
          <div>
            <label style="font-size:11px;color:#94a3b8">Restoran (₺)</label>
            ${_input('adm_restRuhsat', '35000', 'number', restFee)}
          </div>
          <div>
            <label style="font-size:11px;color:#94a3b8">Fabrika (₺)</label>
            ${_input('adm_fabRuhsat', '100000', 'number', fabFee)}
          </div>
        </div>
        ${_btn('💾 Ruhsat Ücretlerini Kaydet', `(async()=>{
          await dbSet('system/dukkanRuhsatFee',parseInt(document.getElementById('adm_dukkanRuhsat').value)||15000);
          await dbSet('system/restoranRuhsatFee',parseInt(document.getElementById('adm_restRuhsat').value)||35000);
          await dbSet('system/fabrikaRuhsatFee',parseInt(document.getElementById('adm_fabRuhsat').value)||100000);
          toast('✅ Ruhsat ücretleri güncellendi','success');
        })()`, '#22c55e')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">🏙️ Belediye Vergileri & Hizmetler</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:11px;color:#94a3b8">Çöp & Tabela Vergisi (%)</label>
            ${_input('adm_ctv', '2', 'number', (ctv*100).toFixed(1))}
          </div>
          <div>
            <label style="font-size:11px;color:#94a3b8">Toplu Taşıma Bilet (₺)</label>
            ${_input('adm_transit', '15', 'number', transitFee)}
          </div>
        </div>
        ${_btn('💾 Belediye Hizmetlerini Kaydet', `(async()=>{
          await dbSet('system/ctvRate',parseFloat(document.getElementById('adm_ctv').value)/100);
          await dbSet('system/transitFare',parseInt(document.getElementById('adm_transit').value)||15);
          toast('✅ Belediye hizmetleri güncellendi','success');
        })()`, '#22c55e')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">👔 Aktif Belediye Başkanları</h3>
        ${Object.keys(mayors).length ? Object.entries(mayors).map(([il,uid]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a2f4a">
            <span style="font-size:13px;color:#e2e8f0"><b>${il.replace(/_/g,' ')}</b> — ${uid.slice(0,12)}</span>
            <button onclick="if(confirm('Görevden al?')){SL_gorevdenAl('${uid}','Admin kararı').then(()=>openBelediyeAdmin())}"
              style="background:#ef4444;color:white;border:none;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer">Görevden Al</button>
          </div>
        `).join('') : '<p style="color:#475569;font-size:12px;text-align:center;padding:12px">Belediye başkanı yok. Seçim başlat!</p>'}
      </div>
    `;
    _body(_section('🏙️ Belediye Yönetimi', html));
  }
  window.openBelediyeAdmin = openBelediyeAdmin;

  /* ═══════════════════════════════════════════════════════════════
     4. POLİS YÖNETİMİ
     ═══════════════════════════════════════════════════════════════ */
  async function openPolisAdmin() {
    const cezalar = await dbGet('cezalar') || {};
    const cezaList = Object.entries(cezalar).sort(([,a],[,b]) => (b.ts||0)-(a.ts||0)).slice(0,20);
    const tutuklular = [];
    const users = await dbGet('users') || {};
    Object.entries(users).forEach(([uid,u]) => {
      if (u.inJail && Date.now() < (u.jailUntil||0)) tutuklular.push({uid, ...u});
    });

    const html = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        ${_stat('TUTUKLU', tutuklular.length, '#ef4444')}
        ${_stat('SON 24 SAAT CEZA', cezaList.filter(([,c]) => Date.now()-c.ts < 86400000).length, '#f97316')}
        ${_stat('TOPLAM KESİLEN', _f(cezaList.reduce((s,[,c])=>s+(c.amount||0),0)), '#22c55e')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">🚔 Hızlı Ceza Kes</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          ${_input('adm_cezaUid', 'Hedef UID veya kullanıcı adı')}
          ${_input('adm_cezaAmt', 'Tutar (₺)', 'number')}
        </div>
        ${_input('adm_cezaSebep', 'Sebep (örn: Trafik cezası, vergi kaçakçılığı)')}
        ${_btn('🚔 Para Cezası Kes', `(async()=>{
          let uid=document.getElementById('adm_cezaUid').value.trim();
          if(!uid.includes('-')&&uid.length<10){
            const found=await dbGet('usernames/'+uid.toLowerCase());
            if(found)uid=found;
          }
          const amt=parseInt(document.getElementById('adm_cezaAmt').value)||0;
          const sebep=document.getElementById('adm_cezaSebep').value||'Genel ceza';
          if(!uid||amt<=0){toast('Geçersiz bilgi','error');return;}
          await GZX_P02_issueFine(uid,amt,sebep,window.GZ.uid);
          openPolisAdmin();
        })()`, '#ef4444')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">🔒 Hapse At</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          ${_input('adm_hapsUid', 'Hedef UID')}
          ${_input('adm_hapsSaat', 'Süre (saat)', 'number')}
        </div>
        ${_input('adm_hapsSebep', 'Sebep')}
        ${_btn('⛓️ Hapse Gönder', `(async()=>{
          const uid=document.getElementById('adm_hapsUid').value.trim();
          const saat=parseInt(document.getElementById('adm_hapsSaat').value)||1;
          const sebep=document.getElementById('adm_hapsSebep').value||'Mahkeme kararı';
          if(!uid){toast('UID girin','error');return;}
          await GZX_P03_sendToJail(uid,saat,sebep);
          openPolisAdmin();
        })()`, '#7c3aed')}
      </div>

      ${tutuklular.length ? `
        <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
          <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">⛓️ Tutuklular</h3>
          ${tutuklular.map(t => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a2f4a">
              <div>
                <div style="font-size:13px;font-weight:700;color:#e2e8f0">${t.username||t.uid.slice(0,12)}</div>
                <div style="font-size:11px;color:#94a3b8">${t.jailReason||'—'} · Çıkış: ${_ts(t.jailUntil)}</div>
              </div>
              <button onclick="(async()=>{await dbUpdate('users/${t.uid}',{inJail:false,jailUntil:null,canTrade:true});toast('🔓 Tahliye edildi','success');openPolisAdmin();})()"
                style="background:#22c55e;color:white;border:none;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer">🔓 Tahliye Et</button>
            </div>
          `).join('')}
        </div>` : ''}

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📋 Son Cezalar (20)</h3>
        ${cezaList.length ? cezaList.map(([id,c]) => `
          <div style="padding:8px 0;border-bottom:1px solid #1a2f4a">
            <div style="display:flex;justify-content:space-between">
              <div>
                <div style="font-size:13px;font-weight:600;color:#e2e8f0">${c.reason||'Ceza'}</div>
                <div style="font-size:11px;color:#94a3b8">${(c.uid||'').slice(0,12)} · ${_ts(c.ts)}</div>
              </div>
              <span style="color:#ef4444;font-weight:700">${_f(c.amount||0)}</span>
            </div>
          </div>
        `).join('') : '<p style="color:#475569;text-align:center;padding:12px">Ceza yok</p>'}
      </div>
    `;
    _body(_section('👮 Polis & Asayiş Yönetimi', html));
  }
  window.openPolisAdmin = openPolisAdmin;

  /* ═══════════════════════════════════════════════════════════════
     5. MAHKEME YÖNETİMİ
     ═══════════════════════════════════════════════════════════════ */
  async function openMahkemeAdmin() {
    const davalar = await dbGet('davalar') || {};
    const acikDavalar = Object.entries(davalar).filter(([,d]) => d.status === 'acik');

    const html = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        ${_stat('AÇIK DAVA', acikDavalar.length, '#a855f7')}
        ${_stat('TOPLAM DAVA', Object.keys(davalar).length, '#3b82f6')}
        ${_stat('SONUÇLANAN', Object.values(davalar).filter(d=>d.status!=='acik').length, '#22c55e')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">⚖️ Açık Davalar — Karar Ver</h3>
        ${acikDavalar.length ? acikDavalar.slice(0,15).map(([id,d]) => `
          <div style="background:#080d1a;border-radius:8px;padding:14px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <div>
                <div style="font-size:13px;font-weight:700;color:#e2e8f0">${d.sebep||'Dava'}</div>
                <div style="font-size:11px;color:#94a3b8">Davacı: ${(d.uid||'').slice(0,12)} · Davalı: ${d.karsi||'?'}</div>
                <div style="font-size:11px;color:#64748b">Avukat: ${d.avukat||'Yok'} · ${_ts(d.acilanAt||0)}</div>
              </div>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <button onclick="(async()=>{await dbUpdate('davalar/${id}',{status:'kazanildi',sonucAt:Date.now()});if('${d.uid}')GZX_notify('${d.uid}','✅ Davanız kazanıldı: ${d.sebep||\"Dava\"}','success');toast('✅ Lehe karar verildi','success');openMahkemeAdmin();})()"
                style="flex:1;background:#22c55e;color:white;border:none;border-radius:6px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">✅ Lehe</button>
              <button onclick="(async()=>{await dbUpdate('davalar/${id}',{status:'kaybedildi',sonucAt:Date.now()});if('${d.uid}')GZX_notify('${d.uid}','❌ Davanız reddedildi: ${d.sebep||\"Dava\"}','error');toast('❌ Aleyhe karar verildi','success');openMahkemeAdmin();})()"
                style="flex:1;background:#ef4444;color:white;border:none;border-radius:6px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">❌ Aleyhe</button>
            </div>
          </div>
        `).join('') : '<p style="color:#475569;text-align:center;padding:16px">Açık dava yok</p>'}
      </div>
    `;
    _body(_section('⚖️ Mahkeme Yönetimi', html));
  }
  window.openMahkemeAdmin = openMahkemeAdmin;

  /* ═══════════════════════════════════════════════════════════════
     6. SGK YÖNETİMİ
     ═══════════════════════════════════════════════════════════════ */
  async function openSGKAdmin() {
    const minWage = (await dbGet('system/minWage')) || 17002;
    const sgkRate = (await dbGet('system/sgkRate')) || 0.145;
    const issizMaas = Math.floor(minWage * 0.40);
    const emekliMaas = Math.floor(minWage * 0.60);
    const users = await dbGet('users') || {};
    const emekliler = Object.values(users).filter(u => u.retired);
    const sigortalilar = Object.values(users).filter(u => u.hasSaglikSig);

    const html = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
        ${_stat('EMEKLİ', emekliler.length, '#a855f7')}
        ${_stat('SİGORTALI', sigortalilar.length, '#22c55e')}
        ${_stat('İŞSİZLİK MAAŞI', _f(issizMaas), '#3b82f6')}
        ${_stat('EMEKLİ MAAŞI', _f(emekliMaas), '#f59e0b')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">💼 SGK Parametreleri</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:11px;color:#94a3b8">Asgari Ücret (₺)</label>
            ${_input('adm_minWage', '17002', 'number', minWage)}
          </div>
          <div>
            <label style="font-size:11px;color:#94a3b8">SGK Prim Oranı (%)</label>
            ${_input('adm_sgkRate', '14.5', 'number', (sgkRate*100).toFixed(1))}
          </div>
        </div>
        ${_btn('💾 SGK Ayarlarını Kaydet', `(async()=>{
          const w=parseInt(document.getElementById('adm_minWage').value)||17002;
          const r=parseFloat(document.getElementById('adm_sgkRate').value)/100;
          await GZX_E02_setMinWage(w);
          await dbSet('system/sgkRate',r);
          toast('✅ SGK ayarları güncellendi','success');
          openSGKAdmin();
        })()`, '#22c55e')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">💰 Toplu Maaş Ödemesi</h3>
        <p style="font-size:12px;color:#94a3b8;margin-bottom:12px">Tüm emekli ve memurlara hazineden maaş öde</p>
        ${_btn('💵 Tüm Maaşları Öde', `(async()=>{
          const r=await SL_maasOde();
          toast('✅ '+r.gorevli+' kişiye toplam '+(typeof cashFmt==='function'?cashFmt(r.toplamOdenen):r.toplamOdenen+'₺')+' ödendi','success',6000);
        })()`, '#22c55e')}
        ${_btn('🎊 Bayram İkramiyesi (5K)', 'GZX_E09_holidayBonus(5000)', '#f59e0b')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">👴 Emekli Listesi</h3>
        ${emekliler.length ? emekliler.slice(0,15).map(e => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a2f4a">
            <span style="font-size:12px;color:#e2e8f0">${e.username||'?'}</span>
            <span style="font-size:12px;color:#22c55e;font-weight:700">${_f(e.pension||0)}/ay</span>
          </div>
        `).join('') : '<p style="color:#475569;text-align:center;padding:12px;font-size:12px">Emekli yok</p>'}
      </div>
    `;
    _body(_section('🏥 SGK Yönetimi', html));
  }
  window.openSGKAdmin = openSGKAdmin;

  /* ═══════════════════════════════════════════════════════════════
     7. SEÇİM YÖNETİMİ (delegasyon)
     ═══════════════════════════════════════════════════════════════ */
  async function openSecimAdmin() {
    if (typeof window.renderAdminSecimPanel === 'function') {
      const target = document.getElementById(window._adminTarget||'adminPanelBody');
      if (target) {
        target.innerHTML = '';
        target.id = target.id;
        const tempDiv = document.createElement('div');
        tempDiv.id = 'adminScreenBody';
        target.appendChild(tempDiv);
        await window.renderAdminSecimPanel(tempDiv);
      }
    } else {
      _body('<div style="padding:40px;text-align:center;color:#64748b">Seçim sistemi yükleniyor...</div>');
    }
  }
  window.openSecimAdmin = openSecimAdmin;

  /* ═══════════════════════════════════════════════════════════════
     8. İHALE YÖNETİMİ
     ═══════════════════════════════════════════════════════════════ */
  async function openIhaleAdmin() {
    const tenders = await dbGet('tenders') || {};
    const tList = Object.entries(tenders).sort(([,a],[,b]) => (b.openedAt||0)-(a.openedAt||0));

    const html = `
      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📋 Yeni İhale Aç</h3>
        ${_input('adm_ihaleTitle', 'İhale başlığı (örn: Yol Yapımı 2026)')}
        ${_input('adm_ihaleBudget', 'Bütçe (₺)', 'number')}
        ${_input('adm_ihaleDesc', 'Açıklama')}
        ${_input('adm_ihaleHours', 'Süre (saat)', 'number', 72)}
        ${_btn('📋 İhaleyi Aç', `(async()=>{
          const t=document.getElementById('adm_ihaleTitle').value;
          const b=parseInt(document.getElementById('adm_ihaleBudget').value)||0;
          const d=document.getElementById('adm_ihaleDesc').value;
          const h=parseInt(document.getElementById('adm_ihaleHours').value)||72;
          if(!t||!b){toast('Başlık ve bütçe zorunlu','error');return;}
          await GZX_I01_openTender(t,b,d,h);
          openIhaleAdmin();
        })()`, '#3b82f6')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📜 Tüm İhaleler</h3>
        ${tList.length ? tList.slice(0,15).map(([id,t]) => `
          <div style="background:#080d1a;border-radius:8px;padding:12px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div>
                <div style="font-size:13px;font-weight:700;color:#e2e8f0">${t.title}</div>
                <div style="font-size:11px;color:#94a3b8">Bütçe: ${_f(t.budget)} · ${Object.keys(t.bids||{}).length} teklif</div>
                <div style="font-size:10px;color:#64748b">${_ts(t.openedAt||0)} → ${_ts(t.endsAt||0)}</div>
              </div>
              <span style="background:${t.status==='open'?'#22c55e22':t.status==='awarded'?'#3b82f622':'#ef444422'};
                color:${t.status==='open'?'#22c55e':t.status==='awarded'?'#3b82f6':'#ef4444'};
                padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700">${t.status}</span>
            </div>
            ${t.status==='open' ? `
              <button onclick="GZX_I03_awardTender('${id}').then(()=>openIhaleAdmin())"
                style="background:#22c55e;color:white;border:none;border-radius:6px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer">🏆 Sonuçlandır</button>
            ` : ''}
          </div>
        `).join('') : '<p style="color:#475569;text-align:center;padding:16px">İhale yok</p>'}
      </div>
    `;
    _body(_section('📋 İhale Yönetimi', html));
  }
  window.openIhaleAdmin = openIhaleAdmin;

  /* ═══════════════════════════════════════════════════════════════
     9. EKONOMİK OLAYLAR (Kriz/Teşvik tetikle)
     ═══════════════════════════════════════════════════════════════ */
  async function openOlayAdmin() {
    const html = `
      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📊 Ekonomi Parametreleri</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <button onclick="(async()=>{const r=parseFloat(prompt('Yeni enflasyon oranı (örn: 0.45 = %45)'));if(!isNaN(r))await GZX_E01_updateInflation(r);})()"
            style="background:#f9731622;color:#f97316;border:1px solid #f9731644;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">
            📊 Enflasyon Güncelle
          </button>
          <button onclick="(async()=>{const r=parseFloat(prompt('Yeni repo faizi (örn: 0.42 = %42)'));if(!isNaN(r))await GZX_B12_setRepoRate(r);})()"
            style="background:#3b82f622;color:#3b82f6;border:1px solid #3b82f644;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">
            🏦 Repo Faizi Değiştir
          </button>
          <button onclick="(async()=>{const r=parseFloat(prompt('KDV oranı (örn: 0.20 = %20)'));if(!isNaN(r))await GZX_E22_taxLawChange(r);})()"
            style="background:#a855f722;color:#a855f7;border:1px solid #a855f744;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">
            💸 KDV Oranı Değiştir
          </button>
          <button onclick="(async()=>{const f=parseFloat(prompt('Yakıt fiyatı (₺/litre, örn: 28.50)'));if(!isNaN(f))await dbSet('system/fuelPrice',f);toast('⛽ Yakıt fiyatı güncellendi','success');})()"
            style="background:#06b6d422;color:#06b6d4;border:1px solid #06b6d444;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">
            ⛽ Yakıt Fiyatı
          </button>
        </div>
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">⚡ Kriz & Olay Tetikle</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${_btn('💸 Döviz Krizi', 'if(confirm(\\'Döviz krizi tetiklensin?\\'))GZX_E15_currencyCrisis()', '#ef4444')}
          ${_btn('⛽ Enerji Krizi', 'if(confirm(\\'Enerji krizi tetiklensin?\\'))GZX_E16_energyCrisis()', '#f97316')}
          ${_btn('📉 Küresel Çöküş', 'if(confirm(\\'TÜM borsalar %35 düşecek!\\'))GZX_E20_globalCrash()', '#dc2626')}
          ${_btn('🚀 Teknoloji Devrimi', `GZX_E07_techRevolution(prompt('Sektör (teknoloji/yazilim/uretim)?')||'teknoloji')`, '#22c55e')}
          ${_btn('🎁 Vergi Affı', 'GZX_E06_taxAmnesty(parseInt(prompt(\\'İndirim %?\\'))||30,parseInt(prompt(\\'Süre (gün)?\\'))||7)', '#a855f7')}
          ${_btn('⚠️ Grev Başlat', `GZX_E04_triggerStrike(prompt('Sektör?')||'genel',parseInt(prompt('Gün?'))||3)`, '#f59e0b')}
          ${_btn('🌋 Doğal Afet', `GZX_E10_naturalDisaster(prompt('İl?'),prompt('Tür (deprem/sel/yangın)?'))`, '#7c2d12')}
          ${_btn('🐋 Balina Bot', 'GZX_C05_runWhaleBots()', '#06b6d4')}
        </div>
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">🌤️ Hava Durumu</h3>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
          ${['güneşli','bulutlu','yağmurlu','karlı','fırtınalı'].map(w => `
            <button onclick="GZX_R04_updateWeather('${w}');toast('☁️ Hava durumu: ${w}','success')"
              style="background:#3b82f622;color:#3b82f6;border:1px solid #3b82f644;border-radius:8px;padding:10px;font-size:11px;font-weight:700;cursor:pointer">
              ${w}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    _body(_section('⚡ Ekonomik Olaylar & Krizler', html));
  }
  window.openOlayAdmin = openOlayAdmin;

  /* ═══════════════════════════════════════════════════════════════
     10. DUYURU / FLASH HABER
     ═══════════════════════════════════════════════════════════════ */
  async function openDuyuruAdmin() {
    const html = `
      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📡 Global Flash Haber</h3>
        <p style="font-size:12px;color:#94a3b8;margin-bottom:12px">Tüm oyuncuların ekranına 30 saniye boyunca kayan yazı geçer.</p>
        ${_input('adm_flashMsg', 'Flash haber metni')}
        ${_btn('📡 TÜM EKRANLARA YAYINLA', `GZX_R03_globalBroadcast(document.getElementById('adm_flashMsg').value,30000)`, '#ef4444')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📰 Resmi Haber Yayınla</h3>
        ${_input('adm_haberTitle', 'Haber başlığı')}
        <select id="adm_haberImpact" style="width:100%;padding:10px;background:#080d1a;border:1px solid #1a2f4a;border-radius:8px;color:#e2e8f0;margin-bottom:8px;font-size:13px">
          <option value="positive">🟢 Pozitif</option>
          <option value="neutral">⚪ Tarafsız</option>
          <option value="negative">🟡 Negatif</option>
          <option value="critical">🔴 Kritik</option>
        </select>
        ${_btn('📰 Haberi Yayınla', `(async()=>{
          const t=document.getElementById('adm_haberTitle').value;
          const i=document.getElementById('adm_haberImpact').value;
          if(!t){toast('Başlık girin','error');return;}
          await dbPush('news',{title:t,type:'admin',impact:i,ts:Date.now()});
          toast('📰 Haber yayınlandı','success');
        })()`, '#3b82f6')}
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">📨 Hedefli Bildirim</h3>
        ${_input('adm_bildUid', 'Hedef UID')}
        ${_input('adm_bildMsg', 'Bildirim mesajı')}
        ${_btn('📨 Bildirim Gönder', `(async()=>{
          const u=document.getElementById('adm_bildUid').value;
          const m=document.getElementById('adm_bildMsg').value;
          if(!u||!m){toast('Tüm alanları doldurun','error');return;}
          await GZX_notify(u,m,'info');
          toast('✅ Bildirim gönderildi','success');
        })()`, '#a855f7')}
      </div>
    `;
    _body(_section('📢 Duyuru & Haber Yönetimi', html));
  }
  window.openDuyuruAdmin = openDuyuruAdmin;

  /* ═══════════════════════════════════════════════════════════════
     11. VERSİYON YAYINI
     ═══════════════════════════════════════════════════════════════ */
  async function openVersiyonAdmin() {
    const onlineUsers = (await dbGet('users')) || {};
    const aktif = Object.values(onlineUsers).filter(u => u.lastSeen && Date.now()-u.lastSeen < 5*60000).length;

    const html = `
      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px;margin-bottom:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          ${_stat('AKTİF OYUNCU', aktif, '#22c55e', 'Son 5 dk')}
          ${_stat('TOPLAM OYUNCU', Object.keys(onlineUsers).length, '#3b82f6')}
        </div>

        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">🚀 Yeni Versiyon Yayınla</h3>
        <p style="font-size:12px;color:#94a3b8;margin-bottom:12px;line-height:1.6">
          Bu butona basınca tüm bağlı oyuncuların sayfası 3 saniye içinde otomatik yenilenecek.
          Cache temizlenir, en güncel JS dosyaları yüklenir.
        </p>

        <button onclick="if(confirm('Tüm '+${aktif}+' aktif oyuncunun sayfası yenilenecek. Devam?'))GZV_yeniVersiyon()"
          style="width:100%;background:linear-gradient(135deg,#22c55e,#10b981);color:white;border:none;
          border-radius:10px;padding:16px;font-weight:800;font-size:15px;cursor:pointer;
          box-shadow:0 4px 14px rgba(34,197,94,.4)">
          🚀 YENİ VERSİYON YAYINLA — ${aktif} OYUNCUYA
        </button>
      </div>

      <div style="background:#0d1a2e;border:1px solid #1a2f4a;border-radius:12px;padding:18px">
        <h3 style="color:#e2e8f0;font-size:14px;margin:0 0 14px">⚠️ Acil Bakım Modu</h3>
        ${_btn('🔧 Bakım Modunu Aç', `(async()=>{
          if(!confirm('Tüm oyunculara bakım uyarısı gösterilecek'))return;
          await dbSet('system/maintenance',{active:true,since:Date.now(),msg:'Bakım nedeniyle 5dk içinde sunucu yenilenecek'});
          await GZX_R03_globalBroadcast('🔧 Bakım! 5dk içinde server yeniden başlayacak',300000);
          toast('Bakım modu aktif','success');
        })()`, '#f97316')}
        ${_btn('✅ Bakım Modunu Kapat', `dbSet('system/maintenance',null).then(()=>toast('Bakım modu kapandı','success'))`, '#22c55e')}
      </div>
    `;
    _body(_section('🚀 Versiyon Yayını & Bakım', html));
  }
  window.openVersiyonAdmin = openVersiyonAdmin;

})();

/* ════════════════════════════════════════════════════════════════════════════
   VATANDAŞ HİZMET MENÜLERİ — Belediye, Muhtarlık, SGK, Polis ekranları
   Bunlar her oyuncunun gördüğü "self-service" sayfalar.
   Yetkili oradaysa yönetir, vatandaş hizmet alır.
   ════════════════════════════════════════════════════════════════════════════ */

(function ServiceMenus() {
  'use strict';

  const _M = {
    fmt: n => typeof cashFmt === 'function' ? cashFmt(n) : (Number(n)||0).toLocaleString('tr-TR') + ' ₺',
    main: () => document.getElementById('appMain'),
    uid:  () => window.GZ?.uid,
    data: () => window.GZ?.data || {},
    role: () => window.GZ?.data?.role || 'vatandas',
    isFounder: () => window.GZ?.data?.isFounder || false,
  };

  /* ─────────── MUHTARLIK (Vatandaş Hizmet Sayfası) ─────────── */
  window.renderMuhtarlik = async function() {
    const main = _M.main(); if (!main) return;
    const uid  = _M.uid();  if (!uid) return;
    const d    = await dbGet(`users/${uid}`) || {};
    const rolu = _M.role();
    const isMuhtar = rolu === 'muhtar' || _M.isFounder();
    const idFee = (await dbGet('system/idCardFee')) || 500;
    const ehlFee = (await dbGet('system/driverLicenseFee')) || 1200;
    const passFee = (await dbGet('system/passportFee')) || 3500;
    const sosTutar = (await dbGet('system/sosyalYardimBudget')) || 1500;
    const muhtarUid = (await dbGet('system/muhtarlar/' + (d.province||'İstanbul').replace(/\s/g,'_')));
    const muhtarUser = muhtarUid ? await dbGet(`users/${muhtarUid}`) : null;

    main.innerHTML = `
      <div style="padding:16px 16px 100px">
        <div style="text-align:center;padding:8px 0 16px">
          <div style="font-size:42px;margin-bottom:8px">🏛️</div>
          <div style="font-size:20px;font-weight:800;color:var(--text)">${d.province||'İstanbul'} Muhtarlığı</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">
            ${muhtarUser ? `Muhtar: <b style="color:var(--primary)">${muhtarUser.username}</b>` : '<span style="color:var(--accent)">Muhtar yok — Seçim bekleniyor</span>'}
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px">
          <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1.5px;margin-bottom:12px">📋 SUNULAN HİZMETLER</div>

          <!-- Kimlik Kartı -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg);border-radius:10px;margin-bottom:8px">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:var(--text)">🪪 Kimlik Kartı</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">
                ${d.kimlikKarti ? `<span style="color:var(--green)">✅ TC: ${d.kimlikKarti.tc}</span>` : `Çıkartma ücreti: ${_M.fmt(idFee)}`}
              </div>
            </div>
            ${!d.kimlikKarti ? `
              <button onclick="GZX_M01_issueIDCard('${uid}').then(()=>renderMuhtarlik())"
                style="background:var(--primary);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">
                🪪 Çıkart
              </button>` : '<span style="color:var(--green);font-size:12px;font-weight:700">✅</span>'}
          </div>

          <!-- Ehliyet -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg);border-radius:10px;margin-bottom:8px">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:var(--text)">🚗 Ehliyet</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">
                ${d.ehliyet ? `<span style="color:var(--green)">✅ Sahip</span>` : `Ücret: ${_M.fmt(ehlFee)}`}
              </div>
            </div>
            ${!d.ehliyet ? `
              <button onclick="(async()=>{await GZX_safePay('${uid}',${ehlFee},'Ehliyet');await dbUpdate('users/${uid}',{ehliyet:{issuedAt:Date.now()}});toast('🚗 Ehliyet alındı','success');renderMuhtarlik();})()"
                style="background:var(--primary);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">
                🚗 Al
              </button>` : '<span style="color:var(--green);font-size:12px;font-weight:700">✅</span>'}
          </div>

          <!-- Pasaport -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg);border-radius:10px;margin-bottom:8px">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:var(--text)">📘 Pasaport</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">
                ${d.pasaport ? `<span style="color:var(--green)">✅ Sahip</span>` : `Ücret: ${_M.fmt(passFee)}`}
              </div>
            </div>
            ${!d.pasaport ? `
              <button onclick="(async()=>{await GZX_safePay('${uid}',${passFee},'Pasaport');await dbUpdate('users/${uid}',{pasaport:{issuedAt:Date.now()}});toast('📘 Pasaport alındı','success');renderMuhtarlik();})()"
                style="background:var(--primary);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">
                📘 Al
              </button>` : '<span style="color:var(--green);font-size:12px;font-weight:700">✅</span>'}
          </div>

          <!-- Sosyal Yardım -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg);border-radius:10px">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:var(--text)">🤝 Sosyal Yardım</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">Yardım: ${_M.fmt(sosTutar)} (haftada bir)</div>
            </div>
            <button onclick="GZX_M03_checkPovertyBenefit('${uid}').then(()=>renderMuhtarlik())"
              style="background:var(--green);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">
              🤝 Başvur
            </button>
          </div>
        </div>

        ${isMuhtar ? `
          <div style="background:linear-gradient(135deg,#7c3aed22,#a855f722);border:2px solid var(--primary);border-radius:14px;padding:16px;margin-bottom:12px">
            <div style="font-size:11px;color:var(--primary);font-weight:800;letter-spacing:1.5px;margin-bottom:12px">🏛️ MUHTAR YETKİLERİNİZ</div>
            <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Bu mahallenin muhtarısınız. Aşağıdan yönetebilirsiniz:</p>
            <button onclick="if(window.AP)AP.openAdminPanel();setTimeout(()=>openMuhtarlikAdmin(),500)"
              style="width:100%;background:var(--primary);color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">
              🏛️ Muhtar Paneli Aç
            </button>
          </div>` : ''}

        <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px">
          <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1.5px;margin-bottom:10px">📢 MAHALLE DUYURULARI</div>
          <div id="muhtarDuyurulari" style="font-size:12px;color:var(--muted)">Yükleniyor...</div>
        </div>
      </div>`;

    // Duyuruları yükle
    const dEl = document.getElementById('muhtarDuyurulari');
    const announcements = await dbGet(`politics/${(d.province||'İstanbul').replace(/\s/g,'_')}/announcements`) || {};
    const list = Object.values(announcements).sort((a,b) => b.ts-a.ts).slice(0,5);
    if (dEl) {
      dEl.innerHTML = list.length
        ? list.map(a => `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><div style="font-size:10px;color:var(--muted)">${new Date(a.ts).toLocaleString('tr-TR')}</div><div style="font-size:13px;color:var(--text);margin-top:2px">${a.message||''}</div></div>`).join('')
        : '<div style="text-align:center;padding:16px;color:var(--muted)">Duyuru yok</div>';
    }
  };

  /* ─────────── BELEDİYE (Vatandaş Hizmet) ─────────── */
  window.renderBelediye = async function() {
    const main = _M.main(); if (!main) return;
    const uid  = _M.uid();  if (!uid) return;
    const d    = await dbGet(`users/${uid}`) || {};
    const rolu = _M.role();
    const isMayor = rolu === 'mayor' || _M.isFounder();
    const dukkanFee  = (await dbGet('system/dukkanRuhsatFee')) || 15000;
    const restFee    = (await dbGet('system/restoranRuhsatFee')) || 35000;
    const fabFee     = (await dbGet('system/fabrikaRuhsatFee')) || 100000;
    const transitFee = (await dbGet('system/transitFare')) || 15;
    const ruhsatlar  = d.isyeriRuhsati || {};
    const provKey    = (d.province||'İstanbul').replace(/\s/g,'_');
    const mayorUid   = await dbGet(`system/mayors/${provKey}`);
    const mayorUser  = mayorUid ? await dbGet(`users/${mayorUid}`) : null;

    main.innerHTML = `
      <div style="padding:16px 16px 100px">
        <div style="text-align:center;padding:8px 0 16px">
          <div style="font-size:42px;margin-bottom:8px">🏙️</div>
          <div style="font-size:20px;font-weight:800;color:var(--text)">${d.province||'İstanbul'} Belediyesi</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">
            ${mayorUser ? `Belediye Başkanı: <b style="color:var(--primary)">${mayorUser.username}</b>` : '<span style="color:var(--accent)">Başkan yok — Seçim bekleniyor</span>'}
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px">
          <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1.5px;margin-bottom:12px">📜 İŞYERİ AÇMA RUHSATLARI</div>

          ${[
            {k:'dukkan',  i:'🏪', n:'Dükkan',   f:dukkanFee},
            {k:'restaurant',i:'🍽️',n:'Restoran', f:restFee},
            {k:'fabrika', i:'🏭', n:'Fabrika',  f:fabFee},
          ].map(r => {
            const has = !!ruhsatlar[r.k];
            return `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg);border-radius:10px;margin-bottom:8px">
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--text)">${r.i} ${r.n} Ruhsatı</div>
                  <div style="font-size:11px;color:var(--muted);margin-top:2px">${has?'<span style="color:var(--green)">✅ Aktif</span>':_M.fmt(r.f)}</div>
                </div>
                ${!has ? `
                  <button onclick="GZX_MUN01_getBusinessLicense('${uid}','${r.k}','${d.province||'İstanbul'}').then(()=>renderBelediye())"
                    style="background:var(--primary);color:white;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">
                    📋 Al
                  </button>` : '<span style="color:var(--green);font-size:14px;font-weight:700">✅</span>'}
              </div>`;
          }).join('')}
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px">
          <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1.5px;margin-bottom:12px">🚌 BELEDİYE HİZMETLERİ</div>
          <div style="padding:12px;background:var(--bg);border-radius:10px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:13px;color:var(--text);font-weight:700">🚌 Toplu Taşıma Bilet</div>
              <div style="font-size:16px;color:var(--primary);font-weight:900">${transitFee}₺</div>
            </div>
          </div>
          <div style="padding:12px;background:var(--bg);border-radius:10px">
            <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px">🏗️ İmar İşlemleri</div>
            <div style="display:flex;gap:6px">
              <button onclick="GZX_D08_applyZoning('${uid}','genel','yeni_kat').then(()=>renderBelediye())"
                style="flex:1;background:var(--blue-l);color:var(--primary);border:1px solid var(--primary)44;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">
                🏗️ İmar İzni (15K)
              </button>
              <button onclick="(async()=>{const f=50000;await GZX_safePay('${uid}',f,'İmar Affı');toast('📋 İmar affı başvurusu yapıldı','success');})()"
                style="flex:1;background:var(--accent)22;color:var(--accent);border:1px solid var(--accent)44;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">
                🏠 İmar Affı (50K)
              </button>
            </div>
          </div>
        </div>

        ${isMayor ? `
          <div style="background:linear-gradient(135deg,#06b6d422,#3b82f622);border:2px solid var(--primary);border-radius:14px;padding:16px;margin-bottom:12px">
            <div style="font-size:11px;color:var(--primary);font-weight:800;letter-spacing:1.5px;margin-bottom:12px">🏙️ BELEDİYE BAŞKANI YETKİLERİNİZ</div>
            <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Bu ilin belediye başkanısınız. Yönetim panelinden tüm ücretleri ayarlayabilirsiniz:</p>
            <button onclick="if(window.AP)AP.openAdminPanel();setTimeout(()=>openBelediyeAdmin(),500)"
              style="width:100%;background:var(--primary);color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">
              🏙️ Belediye Yönetim Paneli
            </button>
          </div>` : ''}
      </div>`;
  };

  /* ─────────── POLİS (Vatandaş Hizmet) ─────────── */
  window.renderPolis = async function() {
    const main = _M.main(); if (!main) return;
    const uid  = _M.uid();  if (!uid) return;
    const d    = await dbGet(`users/${uid}`) || {};
    const isPolis = d.role === 'police' || _M.isFounder();

    // Hapisteyse
    if (d.inJail && Date.now() < (d.jailUntil||0)) {
      const remaining = Math.ceil((d.jailUntil-Date.now())/3600000);
      main.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:32px;text-align:center">
          <div style="font-size:80px;margin-bottom:16px">⛓️</div>
          <div style="font-size:24px;font-weight:900;color:var(--red);margin-bottom:8px">HAPİSHANEDESİNİZ</div>
          <div style="font-size:14px;color:var(--muted);margin-bottom:20px">${d.jailReason||'Mahkeme kararı'}</div>
          <div style="font-size:42px;font-weight:900;color:var(--red)">${remaining} SAAT</div>
          <button onclick="GZX_P03_checkJailRelease('${uid}').then(()=>renderPolis())"
            style="margin-top:20px;background:var(--primary);color:white;border:none;border-radius:10px;padding:14px 30px;font-weight:700;cursor:pointer">
            🔄 Durum Kontrol
          </button>
        </div>`;
      return;
    }

    const cezalar = Object.values(await dbGet(`users/${uid}/cezalar`) || {});

    main.innerHTML = `
      <div style="padding:16px 16px 100px">
        <div style="text-align:center;padding:8px 0 16px">
          <div style="font-size:42px;margin-bottom:8px">👮</div>
          <div style="font-size:20px;font-weight:800;color:var(--text)">Emniyet Müdürlüğü</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">
            ${isPolis ? '🔵 Polis yetkisi aktif' : 'Vatandaş hizmetleri'}
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px">
          <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1.5px;margin-bottom:12px">📋 KİŞİSEL DURUMUNUZ</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center">
              <div style="font-size:10px;color:var(--muted)">Sabıka</div>
              <div style="font-size:16px;font-weight:800;color:${(d.criminalRecord||0)>0?'var(--red)':'var(--green)'}">${d.criminalRecord||0}</div>
            </div>
            <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center">
              <div style="font-size:10px;color:var(--muted)">Kara Liste</div>
              <div style="font-size:16px;font-weight:800;color:${d.karaListede?'var(--red)':'var(--green)'}">${d.karaListede?'❌':'✅'}</div>
            </div>
            <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center">
              <div style="font-size:10px;color:var(--muted)">Borç</div>
              <div style="font-size:13px;font-weight:800;color:${(d.borglar||0)>0?'var(--red)':'var(--green)'}">${_M.fmt(d.borglar||0)}</div>
            </div>
            <div style="background:var(--bg);border-radius:8px;padding:10px;text-align:center">
              <div style="font-size:10px;color:var(--muted)">Kredi Skoru</div>
              <div style="font-size:16px;font-weight:800;color:${(d.krediSkoru||50)>=60?'var(--green)':'var(--red)'}">${d.krediSkoru||50}</div>
            </div>
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px">
          <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1.5px;margin-bottom:12px">⚖️ CEZA GEÇMİŞİM</div>
          ${cezalar.length ? cezalar.slice(-5).reverse().map(c => `
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
              <div>
                <div style="font-size:12px;font-weight:600;color:var(--text)">${c.reason||'Ceza'}</div>
                <div style="font-size:10px;color:var(--muted)">${new Date(c.ts||0).toLocaleDateString('tr-TR')}</div>
              </div>
              <span style="color:var(--red);font-weight:700">${_M.fmt(c.amount||0)}</span>
            </div>
          `).join('') : '<div style="text-align:center;padding:16px;color:var(--green);font-size:13px;font-weight:700">✅ Ceza kaydı yok</div>'}
        </div>

        ${isPolis ? `
          <div style="background:linear-gradient(135deg,#1d4ed822,#3b82f622);border:2px solid var(--primary);border-radius:14px;padding:16px">
            <div style="font-size:11px;color:var(--primary);font-weight:800;letter-spacing:1.5px;margin-bottom:12px">👮 POLİS YETKİLERİNİZ</div>
            <p style="font-size:12px;color:var(--muted);margin-bottom:12px">GBT sorgulama, ceza kesme, hapse atma yetkilerine erişim:</p>
            <button onclick="if(window.AP)AP.openAdminPanel();setTimeout(()=>openPolisAdmin(),500)"
              style="width:100%;background:var(--primary);color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">
              👮 Polis Paneli Aç
            </button>
          </div>` : ''}
      </div>`;
  };

  console.log('[admin-yonetim.js] ✅ Admin yönetim + vatandaş hizmet menüleri aktif');
})();
