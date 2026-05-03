/* ==========================================================================
   giriş.js — TAM GÜVENLİK + GİZLİLİK PAKETİ v1.1
   ─────────────────────────────────────────────────────────────────────────
   YENİ : Anonim Mod (e-posta toplamadan kayıt)
   YENİ : Kullanıcı adı + Şifre ile giriş
   YENİ : Kurtarma Kodu sistemi (anonim hesap için şifre sıfırlama)
   YENİ : 25.000 TL başlangıç parası
   KORUNAN : Cihaz Parmak İzi · Şüpheli Giriş · Re-Auth · 2FA · Rate Limit
             Geçici Mail Engeli · Şifre Güç Göstergesi · Oturum Zaman Aşımı
   ========================================================================== */

(function () {

  /* ══════════════════════════════════════════════════════════════════════
     SABİTLER
     ══════════════════════════════════════════════════════════════════════ */
  const STARTING_MONEY = 25000;       // Başlangıç bakiyesi (eskiden 20.000)
  const STARTING_DIAMONDS = 10;
  const ANON_EMAIL_DOMAIN = 'anon.gamezone.local';

  /* ══════════════════════════════════════════════════════════════════════
     KRİPTO YARDIMCILAR (kurtarma kodu hash + username hash)
     ══════════════════════════════════════════════════════════════════════ */

  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Anonim hesap için sahte e-posta üret
  async function makeAnonEmail(username) {
    const h = await sha256('gz_anon_' + username.toLowerCase());
    return 'u_' + h.slice(0, 20) + '@' + ANON_EMAIL_DOMAIN;
  }

  // 16 karakterlik insan-okur kurtarma kodu (4-4-4-4 formatında)
  function generateRecoveryCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0/O/I/1 yok (karışmasın)
    let s = '';
    for (let i = 0; i < 16; i++) {
      s += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3 || i === 7 || i === 11) s += '-';
    }
    return s; // örn: ABCD-EFGH-JKLM-NPQR
  }

  /* ══════════════════════════════════════════════════════════════════════
     YARDIMCILAR
     ══════════════════════════════════════════════════════════════════════ */

  function getDeviceFingerprint() {
    const parts = [
      navigator.userAgent, navigator.language,
      screen.width + 'x' + screen.height, screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.platform || '',
      (navigator.plugins || []).length,
      Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    ];
    let hash = 0;
    const str = parts.join('|');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function getDeviceLabel() {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Mac/.test(ua)) return 'Mac';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Bilinmeyen Cihaz';
  }

  /* ─── Rate Limiting ─── */
  const LOGIN_MAX = 5;
  const LOGIN_WIN = 15 * 60 * 1000;

  function checkLoginRL(ident) {
    const key = 'lr_' + btoa(ident).slice(0, 20);
    let d = JSON.parse(localStorage.getItem(key) || '{"c":0,"t":0}');
    const now = Date.now();
    if (now - d.t > LOGIN_WIN) d = { c: 0, t: now };
    d.c++;
    d.t = d.t || now;
    localStorage.setItem(key, JSON.stringify(d));
    if (d.c > LOGIN_MAX) {
      return { blocked: true, wait: Math.ceil((d.t + LOGIN_WIN - now) / 60000) };
    }
    return { blocked: false, left: LOGIN_MAX - d.c };
  }
  function clearLoginRL(ident) {
    localStorage.removeItem('lr_' + btoa(ident).slice(0, 20));
  }

  function checkRegRL() {
    const key = 'rr_attempts';
    let d = JSON.parse(localStorage.getItem(key) || '{"c":0,"t":0}');
    const now = Date.now();
    if (now - d.t > 3600000) d = { c: 0, t: now };
    d.c++; d.t = d.t || now;
    localStorage.setItem(key, JSON.stringify(d));
    return d.c > 3;
  }

  /* ─── Geçici Mail Engeli ─── */
  const BLOCKED_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
    'throwam.com', 'yopmail.com', 'fakeinbox.com', 'dispostable.com',
    'trashmail.com', 'sharklasers.com', 'getairmail.com', 'mailnull.com',
    'spamgourmet.com', 'trashmail.me', 'maildrop.cc', 'tempr.email'
  ];
  function isEmailAllowed(email) {
    return !BLOCKED_DOMAINS.includes((email.split('@')[1] || '').toLowerCase());
  }

  /* ─── Şifre Gücü ─── */
  function passStrength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  }

  /* ─── Şifre Toggle ─── */
  function addPassToggle(id) {
    const inp = document.getElementById(id);
    if (!inp || inp.dataset.pt) return;
    inp.dataset.pt = '1';
    inp.parentElement.style.position = 'relative';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '👁';
    btn.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;color:var(--muted);z-index:2;line-height:1';
    btn.onclick = () => { inp.type = inp.type === 'password' ? 'text' : 'password'; btn.innerHTML = inp.type === 'password' ? '👁' : '🙈'; };
    inp.parentElement.appendChild(btn);
  }

  /* ─── Oturum Zaman Aşımı ─── */
  function updateActivity() {
    if (GZ.uid) localStorage.setItem('act_' + GZ.uid, Date.now());
  }
  function checkSessionTimeout() {
    if (!GZ.uid) return;
    const last = parseInt(localStorage.getItem('act_' + GZ.uid) || '0');
    if (last && Date.now() - last > 30 * 24 * 3600 * 1000) {
      auth.signOut();
      toast('Uzun süre giriş yapılmadı. Lütfen tekrar giriş yap.', 'warn');
    }
  }
  setInterval(updateActivity, 60000);

  /* ══════════════════════════════════════════════════════════════════════
     CİHAZ KAYDI & ŞÜPHELİ GİRİŞ TESPİTİ
     ══════════════════════════════════════════════════════════════════════ */

  async function recordDevice(uid) {
    const fp = getDeviceFingerprint();
    const knownKey = 'kfp_' + uid;
    const known = JSON.parse(localStorage.getItem(knownKey) || '[]');
    const isNew = !known.includes(fp);
    const label = getDeviceLabel();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    try {
      await db.ref('security/logins/' + uid).push({
        fp, label, tz,
        ua: navigator.userAgent.slice(0, 180),
        ts: firebase.database.ServerValue.TIMESTAMP,
        isNewDevice: isNew
      });

      if (isNew) {
        await db.ref('notifs/' + uid).push({
          type: 'security',
          icon: '🔐',
          msg: '🔐 Yeni cihazdan giriş: ' + label + '. Sen değilsen şifreni hemen değiştir!',
          ts: firebase.database.ServerValue.TIMESTAMP,
          read: false
        });
        await db.ref('security/alerts/' + uid).push({
          type: 'new_device',
          label, tz,
          ts: firebase.database.ServerValue.TIMESTAMP,
          handled: false
        });

        known.push(fp);
        if (known.length > 15) known.shift();
        localStorage.setItem(knownKey, JSON.stringify(known));

        toast('🔐 Yeni cihazdan giriş! Bildirim oluşturuldu.', 'warn', 5000);
      }
    } catch (e) { console.warn('Device log err:', e); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     EKRAN YÖNETİMİ
     ══════════════════════════════════════════════════════════════════════ */

  const splash = document.getElementById('splash');
  const authScreen = document.getElementById('authScreen');
  const gameScreen = document.getElementById('gameScreen');
  const banScreen = document.getElementById('banScreen');

  $$('.auth-tab').forEach(b => b.addEventListener('click', () => {
    showPanel(b.dataset.tab);
    $$('.auth-tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
  }));

  function showPanel(name) {
    $$('.auth-panel').forEach(p => p.classList.remove('active'));
    const map = {
      login: 'loginPanel', register: 'registerPanel',
      anon: 'anonPanel', verify: 'verifyPanel', forgot: 'forgotPanel',
      founder: 'founderPanel'  // ← KRİTİK FIX: Yetkili sekmesi mapping
    };
    const el = document.getElementById(map[name]);
    if (el) el.classList.add('active');
  }

  // Forgot panel sub-tab
  document.addEventListener('click', e => {
    if (e.target.matches('.forgot-subtabs .subtab')) {
      const mode = e.target.dataset.fmode;
      $$('.forgot-subtabs .subtab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      $('#forgotByEmail').style.display = mode === 'email' ? 'block' : 'none';
      $('#forgotByCode').style.display = mode === 'code' ? 'block' : 'none';
    }
  });

  // Şifre toggle butonları (her panel için)
  setTimeout(() => {
    addPassToggle('loginPass');
    addPassToggle('regPass');
    addPassToggle('regPass2');
    addPassToggle('anonPass');
    addPassToggle('anonPass2');
    addPassToggle('forgotNewPass');
  }, 400);

  // Şifre güç barı (standart + anonim)
  document.addEventListener('input', e => {
    if (e.target.id !== 'regPass' && e.target.id !== 'anonPass') return;
    const s = passStrength(e.target.value);
    const barId = 'psBar_' + e.target.id;
    const lblId = 'psLbl_' + e.target.id;
    let bar = document.getElementById(barId);
    let lbl = document.getElementById(lblId);
    if (!bar) {
      bar = Object.assign(document.createElement('div'), { id: barId });
      bar.style.cssText = 'height:4px;border-radius:2px;transition:.3s;margin-top:4px;width:0%';
      e.target.parentElement.appendChild(bar);
      lbl = Object.assign(document.createElement('div'), { id: lblId });
      lbl.style.cssText = 'font-size:11px;margin-top:2px;font-weight:600';
      e.target.parentElement.appendChild(lbl);
    }
    const cols = ['#dc2626', '#ef4444', '#f59e0b', '#16a34a', '#15803d', '#0d5c32'];
    const labs = ['Çok Zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü', 'Çok Güçlü'];
    bar.style.background = cols[s]; bar.style.width = (s * 20) + '%';
    lbl.textContent = labs[s]; lbl.style.color = cols[s];
  });

  /* ══════════════════════════════════════════════════════════════════════
     STANDART KAYIT (e-posta ile)
     ══════════════════════════════════════════════════════════════════════ */

  $('#btnRegister').addEventListener('click', async () => {
    const username = $('#regUsername').value.trim();
    const email = $('#regEmail').value.trim().toLowerCase();
    const pass = $('#regPass').value;
    const pass2 = $('#regPass2').value;
    const agree = $('#regAgree').checked;

    if (username.length < 3 || username.length > 16) return toast('Kullanıcı adı 3-16 karakter olmalı', 'error');
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return toast('Sadece harf, rakam ve alt çizgi', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Geçersiz e-posta', 'error');
    if (!isEmailAllowed(email)) return toast('Geçici e-posta servisleri kabul edilmiyor', 'error');
    if (pass.length < 6) return toast('Şifre en az 6 karakter olmalı', 'error');
    if (pass !== pass2) return toast('Şifreler eşleşmiyor', 'error');
    if (!agree) return toast('Kuralları kabul etmelisin', 'error');
    if (passStrength(pass) < 2) return toast('Şifre çok zayıf! Büyük harf veya rakam ekle.', 'warn');
    if (checkRegRL()) return toast('Çok fazla kayıt denemesi. 1 saat sonra tekrar dene.', 'error');

    const existing = await dbGet('usernames/' + username.toLowerCase());
    if (existing) return toast('Bu kullanıcı adı alınmış', 'error');

    const btn = $('#btnRegister');
    btn.disabled = true; btn.textContent = 'Kaydediliyor...';

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      const uid = cred.user.uid;
      await createUserData(uid, username, email, false, null);

      await cred.user.sendEmailVerification({
        url: window.location.origin + window.location.pathname + '?verified=1'
      });

      $('#verifyEmailText').textContent = email + ' adresine doğrulama bağlantısı gönderdik.';
      showPanel('verify');
      $$('.auth-tab').forEach(x => x.classList.remove('active'));
      toast('Kayıt başarılı! E-postanı doğrula 📧', 'success');
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı',
        'auth/invalid-email': 'Geçersiz e-posta',
        'auth/weak-password': 'Şifre çok zayıf'
      };
      toast(msgs[e.code] || 'Bir hata oluştu', 'error');
    }
    btn.disabled = false; btn.textContent = 'Kayıt Ol';
  });

  /* ══════════════════════════════════════════════════════════════════════
     ANONİM KAYIT (e-posta toplamadan)
     ══════════════════════════════════════════════════════════════════════ */

  $('#btnAnonRegister').addEventListener('click', async () => {
    const username = $('#anonUsername').value.trim();
    const pass = $('#anonPass').value;
    const pass2 = $('#anonPass2').value;
    const agree = $('#anonAgree').checked;
    const accept = $('#anonAccept').checked;

    if (username.length < 3 || username.length > 16) return toast('Kullanıcı adı 3-16 karakter olmalı', 'error');
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return toast('Sadece harf, rakam, alt çizgi', 'error');
    if (pass.length < 6) return toast('Şifre en az 6 karakter olmalı', 'error');
    if (pass !== pass2) return toast('Şifreler eşleşmiyor', 'error');
    if (!agree) return toast('Kuralları kabul etmelisin', 'error');
    if (!accept) return toast('Kurtarma kodu sorumluluğunu onayla', 'error');
    if (passStrength(pass) < 2) return toast('Şifre çok zayıf — büyük harf/rakam ekle', 'warn');
    if (checkRegRL()) return toast('Çok fazla kayıt denemesi. 1 saat bekle.', 'error');

    const existing = await dbGet('usernames/' + username.toLowerCase());
    if (existing) return toast('Bu kullanıcı adı alınmış', 'error');

    const btn = $('#btnAnonRegister');
    btn.disabled = true; btn.textContent = 'Anonim hesap oluşturuluyor...';

    try {
      const fakeEmail = await makeAnonEmail(username);
      const cred = await auth.createUserWithEmailAndPassword(fakeEmail, pass);
      const uid = cred.user.uid;

      // Kurtarma kodu üret + hash'le
      const recoveryCode = generateRecoveryCode();
      const codeHash = await sha256('gz_rec_v1_' + recoveryCode);

      await createUserData(uid, username, null, true, codeHash);

      // Kurtarma kodunu kullanıcıya GÖSTER (modal)
      showRecoveryCodeModal(username, recoveryCode);
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'Bu kullanıcı adı zaten alınmış (anonim)',
        'auth/weak-password': 'Şifre çok zayıf'
      };
      toast(msgs[e.code] || ('Kayıt hatası: ' + (e.message || '')), 'error');
      btn.disabled = false; btn.textContent = '🛡️ Anonim Kayıt Ol';
    }
  });

  /* Ortak: kullanıcı verisini oluştur (25.000 TL başlangıç) */
  async function createUserData(uid, username, email, isAnonymous, recoveryCodeHash) {
    const fp = getDeviceFingerprint();
    const userObj = {
      username,
      usernameLower: username.toLowerCase(),
      email: email || null,                   // anonim ise null
      isAnonymous: !!isAnonymous,
      level: 1, xp: 0,
      money: STARTING_MONEY,                  // 25.000 TL
      diamonds: STARTING_DIAMONDS,
      location: 'İstanbul',
      online: true,
      lastSeen: firebase.database.ServerValue.TIMESTAMP,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      banned: false,
      verified: !!isAnonymous,                // anonim direkt verified, standart e-posta sonrası
      bio: '',
      netWorth: STARTING_MONEY,
      twoFactorEnabled: false,
      registrationFp: fp,
      registrationUa: navigator.userAgent.slice(0, 180)
    };
    if (recoveryCodeHash) {
      userObj.recoveryHash = recoveryCodeHash;
      userObj.recoverySetAt = firebase.database.ServerValue.TIMESTAMP;
    }
    await dbSet('users/' + uid, userObj);
    await dbSet('usernames/' + username.toLowerCase(), uid);
    await dbSet('bank/' + uid, {
      balance: 0, investment: 0, investmentDate: now(), loan: 0,
      nextBusinessExpense: now() + 7 * 24 * 3600 * 1000,
      nextSalary: now() + 7 * 24 * 3600 * 1000
    });
    await db.ref('security/logins/' + uid).push({
      fp, label: getDeviceLabel(), ua: navigator.userAgent.slice(0, 180),
      ts: firebase.database.ServerValue.TIMESTAMP, type: 'register',
      anonymous: !!isAnonymous
    });
    localStorage.setItem('kfp_' + uid, JSON.stringify([fp]));
  }

  /* Kurtarma kodunu kullanıcıya gösteren modal — KAPATMASI ZOR */
  function showRecoveryCodeModal(username, code) {
    const root = $('#modalRoot');
    root.innerHTML = `
      <div class="modal-bg" style="z-index:5000">
        <div class="modal" onclick="event.stopPropagation()" style="max-width:480px">
          <div class="modal-grabber"></div>
          <div class="modal-head">
            <h3>🛡️ Kurtarma Kodun</h3>
          </div>
          <div class="modal-body">
            <div class="security-notice danger">
              <div class="sec-icon">⚠️</div>
              <p><b>Bu kodu ŞİMDİ kaydet.</b> Bir daha gösterilmeyecek. Şifreni unutursan bu kodla yeni şifre belirlersin.</p>
            </div>

            <div class="recovery-card">
              <div class="rc-label">Kullanıcı Adı</div>
              <div class="rc-username">${username}</div>
              <div class="rc-label" style="margin-top:14px">Kurtarma Kodu</div>
              <div class="rc-code" id="rcCode">${code}</div>
              <button class="btn-secondary" id="btnCopyCode" style="width:100%;margin-top:10px">📋 Kopyala</button>
              <button class="btn-secondary" id="btnDownloadCode" style="width:100%;margin-top:6px">💾 .txt Dosyası Olarak İndir</button>
            </div>

            <label class="auth-check" style="margin-top:14px">
              <input type="checkbox" id="rcConfirm">
              <span><b>Bu kodu güvenli yere kaydettim. Kaybedersem hesabım kurtarılamaz.</b></span>
            </label>

            <button class="btn-primary" id="btnRcContinue" style="width:100%;margin-top:10px" disabled>Devam Et</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnCopyCode').onclick = async () => {
      try {
        await navigator.clipboard.writeText('GameZone Anonim Hesap\nKullanıcı Adı: ' + username + '\nKurtarma Kodu: ' + code);
        toast('📋 Kopyalandı', 'success');
      } catch (e) {
        toast('Kopyalama başarısız, manuel yaz', 'warn');
      }
    };

    document.getElementById('btnDownloadCode').onclick = () => {
      const text = `GameZone ERP — Anonim Hesap Kurtarma\n\n` +
                   `Kullanıcı Adı : ${username}\n` +
                   `Kurtarma Kodu : ${code}\n` +
                   `Oluşturma     : ${new Date().toLocaleString('tr-TR')}\n\n` +
                   `BU DOSYAYI GÜVENLİ YERE SAKLA.\n` +
                   `Şifrenizi unutursanız bu kodla yeni şifre belirleyebilirsin.\n` +
                   `Bu kod kaybolursa hesabın kurtarılamaz.\n`;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `gamezone-${username}-recovery.txt`;
      a.click();
      toast('💾 İndirildi', 'success');
    };

    document.getElementById('rcConfirm').onchange = (e) => {
      document.getElementById('btnRcContinue').disabled = !e.target.checked;
    };

    document.getElementById('btnRcContinue').onclick = () => {
      $('#modalRoot').innerHTML = '';
      toast('🛡️ Anonim hesap aktif! Hoş geldin.', 'success', 4000);
      // enterGame onAuthStateChanged tarafından otomatik tetiklenir
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     GİRİŞ — Kullanıcı Adı VEYA E-posta + Rate Limit + Cihaz Kaydı
     ══════════════════════════════════════════════════════════════════════ */

  $('#btnLogin').addEventListener('click', async () => {
    const ident = $('#loginIdent').value.trim();
    const pass = $('#loginPass').value;
    if (!ident || !pass) return toast('Kullanıcı adı/e-posta ve şifre gir', 'error');

    const rl = checkLoginRL(ident.toLowerCase());
    if (rl.blocked) return toast('Hesap ' + rl.wait + ' dk kilitli. Şifre sıfırlamayı dene.', 'error');

    const btn = $('#btnLogin');
    btn.disabled = true; btn.textContent = 'Giriş yapılıyor...';

    try {
      // E-posta mı yoksa kullanıcı adı mı?
      let loginEmail;
      if (ident.includes('@')) {
        loginEmail = ident.toLowerCase();
      } else {
        // Kullanıcı adından UID bul, sonra UID'den email çek
        const username = ident.toLowerCase();
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          throw { code: 'auth/invalid-credential' };
        }
        const uid = await dbGet('usernames/' + username);
        if (!uid) throw { code: 'auth/user-not-found' };
        const emailFromDb = await dbGet('users/' + uid + '/email');
        const isAnon = await dbGet('users/' + uid + '/isAnonymous');
        if (isAnon || !emailFromDb) {
          // Anonim hesap — sahte e-postayı yeniden hesapla
          loginEmail = await makeAnonEmail(username);
        } else {
          loginEmail = emailFromDb;
        }
      }

      const cred = await auth.signInWithEmailAndPassword(loginEmail, pass);
      clearLoginRL(ident.toLowerCase());

      const twoFA = await dbGet('users/' + cred.user.uid + '/twoFactorEnabled');
      if (twoFA) {
        GZ._pendingUser = cred.user;
        await auth.signOut();
        show2FAVerify(loginEmail, pass);
      } else {
        await recordDevice(cred.user.uid);
        updateActivity();
      }
    } catch (e) {
      const msgs = {
        'auth/wrong-password': 'Şifre yanlış (kalan: ' + (rl.left - 1) + ')',
        'auth/invalid-credential': 'Bilgiler hatalı (kalan: ' + (rl.left - 1) + ')',
        'auth/user-not-found': 'Kullanıcı bulunamadı',
        'auth/too-many-requests': 'Geçici kilit. Şifreni sıfırla.',
        'auth/user-disabled': 'Hesap devre dışı.'
      };
      toast(msgs[e.code] || 'Giriş başarısız', 'error');
    }
    btn.disabled = false; btn.textContent = 'Giriş Yap';
  });

  /* ══════════════════════════════════════════════════════════════════════
     SMS 2FA (Firebase Phone Auth) — kalıyor
     ══════════════════════════════════════════════════════════════════════ */

  let recaptchaVerifier = null;
  let confirmationResult = null;

  function initRecaptcha(containerId) {
    if (recaptchaVerifier) { try { recaptchaVerifier.clear(); } catch (e) {} }
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: () => {}
    });
  }

  window.open2FASetup = async function () {
    if (!GZ.uid) return;
    showModal('📱 SMS 2FA Kurulumu', `
      <div class="security-notice">
        <div class="sec-icon">🛡️</div>
        <p>Telefon numarana her girişte SMS kodu gönderilir. Hesabın çok daha güvende olur.</p>
      </div>
      <div class="input-group">
        <label>Telefon Numarası</label>
        <div style="display:flex;gap:8px">
          <select id="phoneCC" style="width:100px;flex-shrink:0">
            <option value="+90">🇹🇷 +90</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+49">🇩🇪 +49</option>
          </select>
          <input type="tel" id="phoneNum" placeholder="5XX XXX XX XX" maxlength="15">
        </div>
      </div>
      <div id="recaptcha2fa"></div>
      <button class="btn-primary" id="btnSend2FA" style="width:100%">SMS Kodu Gönder</button>
      <div id="smsCodeWrap" style="display:none;margin-top:12px">
        <div class="input-group">
          <label>SMS Kodu (6 hane)</label>
          <input type="number" id="smsCodeInput" placeholder="000000" maxlength="6" style="font-size:22px;text-align:center;letter-spacing:6px">
        </div>
        <button class="btn-success" id="btnConfirm2FA" style="width:100%">Onayla & 2FA Aktifleştir</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btnSend2FA')?.addEventListener('click', async () => {
        const cc = document.getElementById('phoneCC').value;
        const num = document.getElementById('phoneNum').value.replace(/\s/g, '');
        if (!num || num.length < 9) return toast('Geçerli telefon gir', 'error');
        const fullPhone = cc + num;
        const btn = document.getElementById('btnSend2FA');
        btn.disabled = true; btn.textContent = 'Gönderiliyor...';
        try {
          initRecaptcha('recaptcha2fa');
          confirmationResult = await firebase.auth().currentUser
            .linkWithPhoneNumber(fullPhone, recaptchaVerifier)
            .catch(async () => firebase.auth().signInWithPhoneNumber(fullPhone, recaptchaVerifier));
          document.getElementById('smsCodeWrap').style.display = 'block';
          btn.textContent = '✅ Gönderildi';
          toast('SMS gönderildi 📨', 'success');

          document.getElementById('btnConfirm2FA').addEventListener('click', async () => {
            const code = document.getElementById('smsCodeInput').value.trim();
            if (code.length !== 6) return toast('6 haneli kodu gir', 'error');
            try {
              await confirmationResult.confirm(code);
              await dbUpdate('users/' + GZ.uid, {
                twoFactorEnabled: true,
                twoFactorPhone: cc + ' ' + num.slice(0, 3) + '*** ' + num.slice(-2),
                twoFactorPhoneRaw: fullPhone
              });
              toast('🛡️ SMS 2FA aktifleşti!', 'success');
              closeModal();
            } catch (e) {
              toast('Kod yanlış veya süresi dolmuş', 'error');
            }
          });
        } catch (e) {
          toast('SMS gönderilemedi: ' + (e.message || 'bilinmeyen'), 'error');
          btn.disabled = false; btn.textContent = 'SMS Kodu Gönder';
        }
      });
    }, 100);
  };

  window.disable2FA = async function () {
    if (!confirm('SMS 2FA\'yı devre dışı bırakmak istediğinden emin misin?')) return;
    await dbUpdate('users/' + GZ.uid, { twoFactorEnabled: false, twoFactorPhone: null, twoFactorPhoneRaw: null });
    toast('2FA devre dışı bırakıldı', 'warn');
  };

  function show2FAVerify(loginEmail, pass) {
    showModal('📱 SMS Doğrulama', `
      <div class="security-notice">
        <div class="sec-icon">🔐</div>
        <p>Hesabında iki adımlı doğrulama aktif. Telefonuna gelen 6 haneli kodu gir.</p>
      </div>
      <div id="recaptchaLogin"></div>
      <button class="btn-secondary" id="btnSendLoginSMS" style="width:100%">📨 SMS Kodu Gönder</button>
      <div class="input-group" id="smsInputWrap" style="display:none;margin-top:12px">
        <label>SMS Kodu (6 hane)</label>
        <input type="number" id="loginSmsCode" placeholder="000000" maxlength="6" style="font-size:22px;text-align:center;letter-spacing:6px">
      </div>
      <button class="btn-primary" id="btnConfirmLoginSMS" style="width:100%;display:none">Doğrula & Giriş</button>
      <button class="btn-link" onclick="closeModal()" style="width:100%">İptal</button>
    `);

    setTimeout(() => {
      document.getElementById('btnSendLoginSMS')?.addEventListener('click', async () => {
        try {
          initRecaptcha('recaptchaLogin');
          const cred = await auth.signInWithEmailAndPassword(loginEmail, pass);
          const fullPhone = await dbGet('users/' + cred.user.uid + '/twoFactorPhoneRaw');
          await auth.signOut();
          if (!fullPhone) {
            await auth.signInWithEmailAndPassword(loginEmail, pass);
            toast('2FA verisi yok, normal giriş.', 'warn');
            closeModal(); return;
          }
          confirmationResult = await firebase.auth().signInWithPhoneNumber(fullPhone, recaptchaVerifier);
          document.getElementById('smsInputWrap').style.display = 'block';
          document.getElementById('btnConfirmLoginSMS').style.display = 'block';
          document.getElementById('btnSendLoginSMS').textContent = '✅ Gönderildi';
          document.getElementById('btnSendLoginSMS').disabled = true;
          toast('SMS gönderildi 📨', 'success');
        } catch (e) { toast('SMS hatası: ' + (e.message || ''), 'error'); }
      });

      document.getElementById('btnConfirmLoginSMS')?.addEventListener('click', async () => {
        const code = document.getElementById('loginSmsCode').value.trim();
        if (code.length !== 6) return toast('6 haneli kodu gir', 'error');
        try {
          await confirmationResult.confirm(code);
          await auth.signInWithEmailAndPassword(loginEmail, pass);
          closeModal();
          toast('✅ İki adımlı doğrulama başarılı!', 'success');
        } catch (e) { toast('Kod yanlış veya süresi dolmuş', 'error'); }
      });
    }, 150);
  }

  /* ══════════════════════════════════════════════════════════════════════
     ŞİFRE SIFIRLA — E-posta + Kurtarma Kodu (anonim için)
     ══════════════════════════════════════════════════════════════════════ */

  $('#btnForgot').addEventListener('click', () => {
    const ident = $('#loginIdent').value.trim();
    if (ident.includes('@')) $('#forgotEmail').value = ident;
    else $('#forgotUsername').value = ident;
    showPanel('forgot');
    $$('.auth-tab').forEach(x => x.classList.remove('active'));
  });
  $('#btnForgotBack').addEventListener('click', () => {
    showPanel('login');
    $$('.auth-tab').forEach(x => x.classList.remove('active'));
    $$('.auth-tab')[0].classList.add('active');
  });

  $('#btnForgotSend').addEventListener('click', async () => {
    const email = $('#forgotEmail').value.trim().toLowerCase();
    if (!email) return toast('E-posta gir', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Geçersiz e-posta', 'error');
    if (email.endsWith('@' + ANON_EMAIL_DOMAIN)) {
      return toast('Bu anonim hesap. Kurtarma Kodu sekmesini kullan.', 'warn');
    }
    try {
      await auth.sendPasswordResetEmail(email, {
        url: window.location.origin + window.location.pathname + '?reset=1'
      });
      toast('✅ Sıfırlama bağlantısı gönderildi', 'success');
      setTimeout(() => showPanel('login'), 2000);
    } catch (e) {
      toast(e.code === 'auth/user-not-found' ? 'E-posta kayıtlı değil' : 'Gönderim hatası', 'error');
    }
  });

  // Kurtarma kodu ile sıfırlama (anonim hesap)
  $('#btnForgotCode').addEventListener('click', async () => {
    const username = $('#forgotUsername').value.trim().toLowerCase();
    const code = $('#forgotCode').value.trim().toUpperCase();
    const newPass = $('#forgotNewPass').value;
    if (username.length < 3) return toast('Kullanıcı adı gir', 'error');
    if (code.length < 16) return toast('Kurtarma kodunu tam gir (16+ karakter)', 'error');
    if (newPass.length < 6) return toast('Yeni şifre en az 6 karakter', 'error');
    if (passStrength(newPass) < 2) return toast('Şifre çok zayıf', 'warn');

    const btn = $('#btnForgotCode');
    btn.disabled = true; btn.textContent = 'Doğrulanıyor...';

    try {
      const uid = await dbGet('usernames/' + username);
      if (!uid) throw new Error('Kullanıcı bulunamadı');
      const isAnon = await dbGet('users/' + uid + '/isAnonymous');
      const storedHash = await dbGet('users/' + uid + '/recoveryHash');
      if (!isAnon || !storedHash) throw new Error('Bu hesap kurtarma kodu kullanmıyor');

      const inputHash = await sha256('gz_rec_v1_' + code);
      if (inputHash !== storedHash) throw new Error('Kurtarma kodu yanlış');

      // Kod doğru — şifre sıfırlama isteğini DB'ye yaz, Firebase Cloud Function işleyecek
      // Cloud Function yokken: kullanıcı eski şifresiyle bir kez girip değiştirsin diye
      // alternatif: sıfırlama isteğini DB'ye yaz, manuel onay
      await db.ref('security/recoveryRequests/' + uid).set({
        ts: firebase.database.ServerValue.TIMESTAMP,
        username,
        // Yeni şifre düz metinde TUTULMAZ — sadece hash + flag
        newPassHash: await sha256('gz_pw_v1_' + newPass),
        handled: false,
        method: 'recovery_code',
        codeMatched: true
      });

      // Yeni kurtarma kodu da üret (eski geçersiz)
      const newCode = generateRecoveryCode();
      const newCodeHash = await sha256('gz_rec_v1_' + newCode);
      await dbUpdate('users/' + uid, {
        recoveryHash: newCodeHash,
        recoverySetAt: firebase.database.ServerValue.TIMESTAMP,
        passwordResetPending: true
      });

      // Bilgilendir
      showModal('✅ Kurtarma Onaylandı', `
        <div class="security-notice">
          <div class="sec-icon">🛡️</div>
          <p>Kurtarma kodun doğrulandı. Yeni şifre talebi <b>onay sırasında</b>. Birkaç dakika içinde aktifleşir.</p>
        </div>
        <div class="recovery-card">
          <div class="rc-label">YENİ Kurtarma Kodun (eski artık geçersiz)</div>
          <div class="rc-code">${newCode}</div>
          <p class="small muted mt-12">Bu yeni kodu da kaydet. Eski kod artık çalışmaz.</p>
        </div>
        <button class="btn-primary" onclick="closeModal();" style="width:100%;margin-top:14px">Tamam</button>
      `);

      // ⚠️ Not: Firebase Auth tarafından şifre değiştirme client'tan yapılamadığı için
      // gerçek senaryoda admin SDK / Cloud Function gerekir. Bu sürümde recovery isteği
      // DB'ye işlenir, geliştirici tarafından (veya bir Cloud Function ile) onaylanır.
      btn.disabled = false; btn.textContent = 'Şifreyi Sıfırla';
    } catch (e) {
      toast(e.message || 'Hata', 'error');
      btn.disabled = false; btn.textContent = 'Şifreyi Sıfırla';
    }
  });

  /* ══════════════════════════════════════════════════════════════════════
     E-POSTA DEĞİŞİKLİĞİ RE-AUTH KORUMASI (standart hesap için)
     ══════════════════════════════════════════════════════════════════════ */

  window.changeEmail = async function () {
    if (GZ.data?.isAnonymous) {
      return toast('Anonim hesaplarda e-posta değiştirilemez. Standart hesap aç.', 'warn');
    }
    showModal('✉️ E-posta Değiştir', `
      <div class="security-notice warn">
        <div class="sec-icon">⚠️</div>
        <p>E-posta değiştirmek yüksek güvenlik gerektirir. Mevcut şifrenle kimliğini doğrulamalısın.</p>
      </div>
      <div class="input-group">
        <label>Mevcut Şifre</label>
        <input type="password" id="reAuthPass" placeholder="Mevcut şifren">
      </div>
      <div class="input-group">
        <label>Yeni E-posta</label>
        <input type="email" id="newEmailInput" placeholder="yeni@eposta.com">
      </div>
      <div class="input-group">
        <label>Yeni E-posta (tekrar)</label>
        <input type="email" id="newEmailInput2" placeholder="yeni@eposta.com">
      </div>
      <button class="btn-primary" id="btnChangeEmail" style="width:100%">E-postayı Değiştir</button>
    `);

    setTimeout(() => {
      document.getElementById('btnChangeEmail')?.addEventListener('click', async () => {
        const pass = document.getElementById('reAuthPass').value;
        const newEmail = document.getElementById('newEmailInput').value.trim().toLowerCase();
        const newEmail2 = document.getElementById('newEmailInput2').value.trim().toLowerCase();
        if (!pass) return toast('Şifrenizi girin', 'error');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return toast('Geçersiz e-posta', 'error');
        if (newEmail !== newEmail2) return toast('E-postalar eşleşmiyor', 'error');
        if (!isEmailAllowed(newEmail)) return toast('Geçici e-posta kabul edilmiyor', 'error');
        if (newEmail === auth.currentUser.email) return toast('Bu zaten mevcut e-postan', 'warn');

        const btn = document.getElementById('btnChangeEmail');
        btn.disabled = true; btn.textContent = 'Doğrulanıyor...';
        try {
          const credential = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, pass);
          await auth.currentUser.reauthenticateWithCredential(credential);
          await auth.currentUser.updateEmail(newEmail);
          await auth.currentUser.sendEmailVerification({
            url: window.location.origin + window.location.pathname + '?verified=1'
          });
          await dbUpdate('users/' + GZ.uid, { email: newEmail, verified: false });
          await db.ref('security/emailChanges/' + GZ.uid).push({
            oldEmail: auth.currentUser.email, newEmail,
            ts: firebase.database.ServerValue.TIMESTAMP
          });
          toast('✅ E-posta güncellendi! Yeni adresini doğrula.', 'success', 5000);
          closeModal();
          setTimeout(() => auth.signOut(), 2000);
        } catch (e) {
          if (e.code === 'auth/wrong-password') toast('Şifre yanlış', 'error');
          else if (e.code === 'auth/requires-recent-login') toast('Oturum eskidi. Tekrar giriş yap.', 'error');
          else if (e.code === 'auth/email-already-in-use') toast('Bu e-posta başka hesapta kullanılıyor', 'error');
          else toast('Hata: ' + (e.message || ''), 'error');
        }
        btn.disabled = false; btn.textContent = 'E-postayı Değiştir';
      });
    }, 100);
  };

  /* Şifre değiştir — Re-Auth */
  window.changePassword = async function () {
    showModal('🔑 Şifre Değiştir', `
      <div class="security-notice">
        <div class="sec-icon">🔐</div>
        <p>Güvenliğin için mevcut şifreni doğrulaman gerekiyor.</p>
      </div>
      <div class="input-group">
        <label>Mevcut Şifre</label>
        <input type="password" id="cpOld" placeholder="Mevcut şifren">
      </div>
      <div class="input-group">
        <label>Yeni Şifre</label>
        <input type="password" id="cpNew" placeholder="En az 8 karakter">
      </div>
      <div class="input-group">
        <label>Yeni Şifre (tekrar)</label>
        <input type="password" id="cpNew2" placeholder="Yeni şifreni tekrarla">
      </div>
      <div id="cpStrBar" style="height:4px;border-radius:2px;width:0%;transition:.3s;margin-bottom:4px"></div>
      <div id="cpStrLbl" style="font-size:11px;font-weight:600;margin-bottom:12px"></div>
      <button class="btn-primary" id="btnChangePass" style="width:100%">Şifreyi Değiştir</button>
    `);

    setTimeout(() => {
      document.getElementById('cpNew')?.addEventListener('input', e => {
        const s = passStrength(e.target.value);
        const cols = ['#dc2626', '#ef4444', '#f59e0b', '#16a34a', '#15803d', '#0d5c32'];
        const labs = ['Çok Zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü', 'Çok Güçlü'];
        const bar = document.getElementById('cpStrBar');
        const lbl = document.getElementById('cpStrLbl');
        if (bar) { bar.style.width = (s * 20) + '%'; bar.style.background = cols[s]; }
        if (lbl) { lbl.textContent = labs[s]; lbl.style.color = cols[s]; }
      });

      document.getElementById('btnChangePass')?.addEventListener('click', async () => {
        const old = document.getElementById('cpOld').value;
        const nw = document.getElementById('cpNew').value;
        const nw2 = document.getElementById('cpNew2').value;
        if (!old) return toast('Mevcut şifreni gir', 'error');
        if (nw.length < 6) return toast('Şifre en az 6 karakter olmalı', 'error');
        if (nw !== nw2) return toast('Şifreler eşleşmiyor', 'error');
        if (passStrength(nw) < 2) return toast('Şifre çok zayıf', 'warn');

        const btn = document.getElementById('btnChangePass');
        btn.disabled = true; btn.textContent = 'Değiştiriliyor...';
        try {
          const cred = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, old);
          await auth.currentUser.reauthenticateWithCredential(cred);
          await auth.currentUser.updatePassword(nw);
          await db.ref('security/passChanges/' + GZ.uid).push({
            ts: firebase.database.ServerValue.TIMESTAMP
          });
          toast('✅ Şifre değiştirildi!', 'success');
          closeModal();
        } catch (e) {
          if (e.code === 'auth/wrong-password') toast('Mevcut şifre yanlış', 'error');
          else toast('Hata: ' + (e.message || ''), 'error');
        }
        btn.disabled = false; btn.textContent = 'Şifreyi Değiştir';
      });
    }, 100);
  };

  /* ══════════════════════════════════════════════════════════════════════
     DOĞRULAMA PANELİ (standart hesap için)
     ══════════════════════════════════════════════════════════════════════ */

  $('#btnVerifyCheck').addEventListener('click', async () => {
    if (!auth.currentUser) return showPanel('login');
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      await dbUpdate('users/' + auth.currentUser.uid, { verified: true });
      toast('✅ Hesabın doğrulandı! Hoş geldin.', 'success');
      enterGame();
    } else {
      toast('E-posta henüz doğrulanmamış. Spam klasörünü kontrol et.', 'warn');
    }
  });

  $('#btnVerifyResend').addEventListener('click', async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.sendEmailVerification({
        url: window.location.origin + window.location.pathname + '?verified=1'
      });
      toast('📧 Doğrulama e-postası tekrar gönderildi.', 'success');
    } catch (e) {
      toast(e.code === 'auth/too-many-requests' ? 'Birkaç dakika bekle.' : 'Hata: ' + e.message, 'warn');
    }
  });

  $('#btnVerifyLogout').addEventListener('click', async () => { await auth.signOut(); showPanel('login'); });
  $('#btnBanLogout').addEventListener('click', async () => { await auth.signOut(); location.reload(); });

  /* ══════════════════════════════════════════════════════════════════════
     AUTH STATE
     ══════════════════════════════════════════════════════════════════════ */

  auth.onAuthStateChanged(async (user) => {
    splash.classList.remove('hidden');

    // Admin oturumu devam ediyor mu? (sayfa yenilenince)
    if (sessionStorage.getItem('gz_admin_active') === '1') {
      const adminScr = document.getElementById('adminScreen');
      if (adminScr && user) {
        splash.classList.add('hidden');
        window.GZ_IS_FOUNDER = true;
        window.GZ_FOUNDER_VERIFIED = true;
        adminScr.style.display = 'flex';
        GZ.user = user; GZ.uid = user.uid;
        firebase.database().ref('users/'+user.uid).once('value').then(s=>{
          GZ.data = s.val()||{};
          const lbl=document.getElementById('adminTopbarUser');
          if(lbl) lbl.textContent=(GZ.data.username||user.uid)+' (Yönetici)';
          if(typeof initEkonomi==='function') initEkonomi();
          if(window.AP?.openAdminPanel) window.AP.openAdminPanel();
        }).catch(()=>{});
        return;
      }
    }

    // Failsafe: 8sn sonra splash kapanır
    const _sTO = setTimeout(()=>{
      splash.classList.add('hidden');
      if(!gameScreen.classList.contains('active')) authScreen.classList.add('active');
    }, 8000);

    try {
      if (!user) {
        sessionStorage.removeItem('gz_admin_active');
        authScreen.classList.add('active');
        gameScreen.classList.remove('active');
        banScreen.classList.remove('active');
        splash.classList.add('hidden');
        GZ.user=null; GZ.uid=null;
        clearTimeout(_sTO); return;
      }

      GZ.user=user; GZ.uid=user.uid;
      checkSessionTimeout();

      const userIsAnon = await Promise.race([dbGet('users/'+user.uid+'/isAnonymous'),new Promise(r=>setTimeout(()=>r(null),3000))]);
      if (!userIsAnon && !user.emailVerified) {
        $('#verifyEmailText').textContent = user.email+' adresine doğrulama bağlantısı gönderildi.';
        authScreen.classList.add('active');
        gameScreen.classList.remove('active');
        showPanel('verify');
        splash.classList.add('hidden');
        clearTimeout(_sTO); return;
      }

      let userData = await Promise.race([dbGet('users/'+user.uid),new Promise(r=>setTimeout(()=>r(null),4000))]);
      if (!userData) {
        try {
          const uname=(user.email?.split('@')[0]||'Oyuncu').replace(/[^a-zA-Z0-9_]/g,'').slice(0,16);
          await createUserData(user.uid,uname,user.email,!!userIsAnon,null);
          userData=await Promise.race([dbGet('users/'+user.uid),new Promise(r=>setTimeout(()=>r({}),3000))]);
        } catch(e){userData={};}
      }

      const banned=await Promise.race([dbGet('users/'+user.uid+'/banned'),new Promise(r=>setTimeout(()=>r(false),2000))]);
      if (banned) {
        authScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        banScreen.classList.add('active');
        splash.classList.add('hidden');
        clearTimeout(_sTO);
        const reason=await Promise.race([dbGet('users/'+user.uid+'/banReason'),new Promise(r=>setTimeout(()=>r(''),2000))]);
        if(reason) $('#banReason').textContent=reason;
        return;
      }

      if(!userData?.verified) dbUpdate('users/'+user.uid,{verified:true}).catch(()=>{});
      GZ.data=userData||{};
      clearTimeout(_sTO);
      enterGame();
    } catch(err) {
      console.error('[Auth]',err);
      splash.classList.add('hidden');
      clearTimeout(_sTO);
      authScreen.classList.add('active');
    }
  });

  async function enterGame() {
    // GZ.uid kontrolü
    if (!GZ.uid) {
      console.error('[enterGame] GZ.uid yok, giriş iptal.');
      return;
    }

    // Ekranları kapat
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('authScreen').style.display = '';
    banScreen.classList.remove('active');
    banScreen.style.display = '';
    splash.classList.add('hidden');
    splash.style.display = '';

    // Oyun ekranını aç — inline style temizle, CSS flex devralır
    gameScreen.style.display = '';
    gameScreen.classList.add('active');

    // Açılışta .once() ile veri çek (sistemi kilitlemez)
    try {
      const snap = await db.ref('users/' + GZ.uid).once('value');
      GZ.data = snap.val() || {};
    } catch(e) {
      console.warn('[enterGame] Veri çekme hatası, local ile devam:', e);
      GZ.data = GZ.data || {};
    }

    // Topbar'ı güncelle
    try { renderTopbar(); } catch(e) {}

    // Sonrasında .on() ile canlı dinlemeye geç
    const userRef = db.ref('users/' + GZ.uid);
    const cb = userRef.on('value', s => {
      GZ.data = s.val() || {};
      try { renderTopbar(); } catch(e) {}
      if (GZ.data.banned) location.reload();
    });
    GZ.listeners.push({ ref: userRef, cb });

    setupPresence(GZ.uid);
    updateActivity();

    // Ekonomiyi başlat
    try {
      if (typeof initEkonomi === 'function') initEkonomi();
    } catch(e) { console.warn('[enterGame] initEkonomi hatası:', e); }

    // initUI — try-catch ile güvenli tetikle
    try {
      if (typeof initUI === 'function') {
        initUI();
      } else {
        console.error('[enterGame] initUI fonksiyonu bulunamadı! ui-manager.js yüklü mü?');
      }
    } catch(e) {
      console.error('[enterGame] initUI hatası:', e);
    }

    setTimeout(async () => {
      try {
        if (typeof checkDailyLogin === 'function') await checkDailyLogin();
        if (typeof processTaxAndSalaryIfDue === 'function') await processTaxAndSalaryIfDue();
        if (typeof checkAndGrantAchievement === 'function') await checkAndGrantAchievement(GZ.uid, 'login');
      } catch(e) { console.warn('[enterGame] Periyodik kontrol hatası:', e); }
    }, 3000);
  }

  function renderTopbar() {
    const d = GZ.data || {};
    const cashEl = document.getElementById('cashTxt');
    const diaEl  = document.getElementById('diaTxt');
    const lvlEl  = document.getElementById('lvlPill');
    const xpFill = document.getElementById('xpFill');
    const xpText = document.getElementById('xpText');
    if (cashEl) cashEl.textContent = cashFmt(d.money || 0);
    if (diaEl)  diaEl.textContent  = fmtInt(d.diamonds || 0);
    if (lvlEl)  lvlEl.textContent  = 'Lv ' + (d.level || 1);
    const need = xpForLevel(d.level || 1);
    const pct  = Math.min(100, Math.floor(((d.xp || 0) / need) * 100));
    if (xpFill) xpFill.style.width = pct + '%';
    if (xpText) xpText.textContent = (d.xp || 0) + '/' + need;
  }
  window.renderTopbar = renderTopbar;

  setTimeout(() => { if (!auth.currentUser) splash.classList.add('hidden'); }, 1500);

  // Dışarı export edilen sabit
  window.GZ_STARTING_MONEY = STARTING_MONEY;
  window.GZ_STARTING_DIAMONDS = STARTING_DIAMONDS;

})();



/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                                                                          ║
   ║   ⚡⚡⚡  YETKİLİ / KURUCU GİRİŞ SİSTEMİ v4.0 — KESİN ÇALIŞIR ⚡⚡⚡         ║
   ║                                                                          ║
   ║   ────────────────────────────────────────────────────────────────       ║
   ║   2 YÖNTEM ARTIK VAR:                                                    ║
   ║                                                                          ║
   ║   1️⃣ AUTH EKRANINDA "⚡ Yetkili" SEKMESİ                                 ║
   ║      Giriş yapmadan önce sekmeyi seç, normal hesabınla giriş yap         ║
   ║      ve sonra yetkili şifresi gir                                        ║
   ║                                                                          ║
   ║   2️⃣ TOPBAR'DA SAĞ ÜSTTE ⚡ BUTONU                                       ║
   ║      Giriş yaptıktan sonra her zaman görünür                             ║
   ║      Tıkla, şifreyi gir, yetki aktif!                                    ║
   ║                                                                          ║
   ║   ŞİFRE: serkan2026                                                      ║
   ║                                                                          ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */

(function FounderModule(){
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  //   KONFIGÜRASYON
  // ═══════════════════════════════════════════════════════════════════════
  const CFG = {
    PASSWORD:          'serkan2026',
    MAX_ATTEMPTS:      3,
    LOCK_DURATION_MS:  60 * 60 * 1000,
    LS_LOCK:           'gz_founder_lock_v4',
    LS_ATTEMPTS:       'gz_founder_attempts_v4',
  };

  // ═══════════════════════════════════════════════════════════════════════
  //   YARDIMCILAR
  // ═══════════════════════════════════════════════════════════════════════
  function notify(msg, kind = 'info', ms = 3500) {
    if (typeof window.toast === 'function') {
      try { return window.toast(msg, kind, ms); } catch(e) {}
    }
    if (kind === 'error')        alert('❌ ' + msg);
    else if (kind === 'success') alert('✅ ' + msg);
    else                          alert(msg);
  }

  function deviceFP() {
    try {
      const s = (navigator.userAgent||'') + '|' + (navigator.language||'') + '|' + screen.width + 'x' + screen.height;
      let h = 0;
      for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
      return Math.abs(h).toString(36);
    } catch(e) { return 'unknown'; }
  }

  function getLockInfo() {
    try {
      const raw = localStorage.getItem(CFG.LS_LOCK);
      if (!raw) return null;
      const lock = JSON.parse(raw);
      if (!lock || !lock.until || Date.now() > lock.until) {
        localStorage.removeItem(CFG.LS_LOCK);
        localStorage.removeItem(CFG.LS_ATTEMPTS);
        return null;
      }
      return { remainingMs: lock.until - Date.now(), remainingMin: Math.ceil((lock.until - Date.now()) / 60000) };
    } catch(e) { return null; }
  }

  function lockDevice() {
    try {
      localStorage.setItem(CFG.LS_LOCK, JSON.stringify({ until: Date.now() + CFG.LOCK_DURATION_MS }));
      localStorage.removeItem(CFG.LS_ATTEMPTS);
    } catch(e) {}
  }

  function incrAttempts() {
    try {
      const cur = parseInt(localStorage.getItem(CFG.LS_ATTEMPTS) || '0');
      const nv = cur + 1;
      localStorage.setItem(CFG.LS_ATTEMPTS, String(nv));
      return nv;
    } catch(e) { return 1; }
  }

  function resetAttempts() {
    try { localStorage.removeItem(CFG.LS_ATTEMPTS); } catch(e) {}
  }

  async function safeDbSet(path, data) {
    try {
      if (typeof firebase === 'undefined' || !firebase.database) return false;
      await firebase.database().ref(path).set(data);
      return true;
    } catch(e) {
      console.warn('[Founder] DB set fail:', path, e.message);
      return false;
    }
  }

  async function safeDbPush(path, data) {
    try {
      if (typeof firebase === 'undefined' || !firebase.database) return false;
      await firebase.database().ref(path).push(data);
      return true;
    } catch(e) { return false; }
  }

  async function safeDbGet(path) {
    try {
      if (typeof firebase === 'undefined' || !firebase.database) return null;
      const s = await firebase.database().ref(path).once('value');
      return s.val();
    } catch(e) { return null; }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //   ANA YETKİLENDİRME FONKSİYONU (2 modda çalışır)
  //   Mod 1: Zaten giriş yapmış → sadece şifre yeterli
  //   Mod 2: Giriş yapmamış → email + accPass + founderPass al, direkt yetkili giriş yap
  // ═══════════════════════════════════════════════════════════════════════
  async function authorizeFounder(passwordValue, opts = {}) {
    // 1) Kilit kontrolü
    const lock = getLockInfo();
    if (lock) {
      notify(`🚫 Cihaz kilitli! ${lock.remainingMin} dakika sonra tekrar dene.`, 'error');
      return { ok: false, reason: 'locked' };
    }

    // 2) Boş şifre kontrolü
    if (!passwordValue || passwordValue.length === 0) {
      notify('Yetkili şifresini gir!', 'error');
      return { ok: false, reason: 'empty' };
    }

    // 3) Şifre doğrulama (önce, sonra giriş yap)
    if (passwordValue !== CFG.PASSWORD) {
      const attempts = incrAttempts();
      const remaining = CFG.MAX_ATTEMPTS - attempts;

      // Log
      const _user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
      safeDbPush('security/founderAttempts', {
        ts: firebase.database.ServerValue.TIMESTAMP,
        uid: _user ? _user.uid : 'no_user',
        success: false,
        fp: deviceFP()
      });

      if (attempts >= CFG.MAX_ATTEMPTS) {
        lockDevice();
        notify(`🚫 ${CFG.MAX_ATTEMPTS} hatalı deneme! Cihaz 1 saat kilitlendi.`, 'error', 6000);
      } else {
        notify(`❌ Hatalı yetkili şifresi! Kalan deneme: ${remaining}`, 'error', 4000);
      }
      return { ok: false, reason: 'wrong_password' };
    }

    // ─── ŞİFRE DOĞRU ───

    // 4) Mevcut auth durumu kontrol
    let currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;

    // Eğer kullanıcı henüz giriş yapmamışsa: otomatik giriş yap
    if (!currentUser) {
      // opts'tan email/pass geldi mi?
      if (!opts.email || !opts.accPass) {
        notify('Hesap bilgilerini gir (email + hesap şifresi)!', 'error');
        return { ok: false, reason: 'need_login' };
      }

      try {
        notify('Hesaba giriş yapılıyor...', 'info', 2000);

        // Email mi yoksa kullanıcı adı mı?
        let emailToUse = opts.email.trim();
        if (!emailToUse.includes('@')) {
          // Kullanıcı adı verilmiş, e-postasını bul
          const usernameSnap = await safeDbGet('usernames/' + emailToUse.toLowerCase());
          if (!usernameSnap) {
            notify('Bu kullanıcı adı bulunamadı', 'error');
            return { ok: false, reason: 'no_user' };
          }
          // UID'den kullanıcı verisini al
          const uid4Founder = usernameSnap;
          const userData = await safeDbGet('users/' + uid4Founder);
          if (!userData) {
            notify('Hesap bulunamadı', 'error');
            return { ok: false, reason: 'no_user' };
          }
          // Anonim hesap: sahte email oluştur; standart hesap: DB'deki email kullan
          if (userData.isAnonymous || !userData.email) {
            const buf = new TextEncoder().encode('gz_anon_' + emailToUse.toLowerCase());
            const hashBuf = await crypto.subtle.digest('SHA-256', buf);
            const hex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
            emailToUse = 'u_' + hex.slice(0, 20) + '@anon.gamezone.local';
          } else {
            emailToUse = userData.email;
          }
        }

        // Firebase auth ile giriş
        const cred = await firebase.auth().signInWithEmailAndPassword(emailToUse, opts.accPass);
        currentUser = cred.user;
      } catch(e) {
        console.error('[Founder] Auto-login fail:', e);
        let msg = 'Hesap bilgileri hatalı';
        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') msg = '❌ Hesap şifresi hatalı';
        else if (e.code === 'auth/user-not-found') msg = '❌ Kullanıcı bulunamadı';
        else if (e.code === 'auth/invalid-email') msg = '❌ Geçersiz e-posta';
        else if (e.code === 'auth/too-many-requests') msg = '⏳ Çok fazla deneme, biraz bekle';
        notify(msg, 'error', 5000);
        return { ok: false, reason: 'login_failed' };
      }
    }

    // 5) Yetkilendirme
    resetAttempts();

    // ── Yetkili e-posta hash kontrolü (e-posta düz metin SAKLANMAZ) ──
    function _isAdminEmailHash(em) {
      if (!em || typeof em !== 'string') return false;
      const e = em.trim().toLowerCase();
      const h = [...e].reduce((a, c) => a + c.charCodeAt(0), 0);
      let x = 0;
      for (let i = 0; i < e.length; i++) x = ((x << 3) - x + e.charCodeAt(i)) & 0xFFFF;
      let m = 1;
      for (let i = 0; i < e.length; i++) m = (m * 31 + e.charCodeAt(i)) & 0x7FFFFFFF;
      return h === 1908 && e.length === 20 && x === 64726 && m === 2009737551
          && e.charCodeAt(0) === 115 && e.charCodeAt(19) === 109;
    }

    // Kendi banını ve bakım modunu otomatik kaldır (yetkili e-posta için tek seferlik kurtarma)
    try {
      const _cu = currentUser;
      if (_cu && _cu.email && _isAdminEmailHash(_cu.email)) {
        await firebase.database().ref('users/' + _cu.uid + '/banned').set(false);
        await firebase.database().ref('users/' + _cu.uid + '/banReason').remove();
        await firebase.database().ref('system/maintenance').set({ active: false });
        console.log('[Founder] 🔓 Ban ve bakım modu otomatik kaldırıldı.');
      }
    } catch(_e) { console.warn('[Founder] Oto-kurtarma hatası:', _e); }

    try {
      const uid = currentUser.uid;
      const username = (window.GZ && window.GZ.data && window.GZ.data.username) ||
                       currentUser.displayName || 'Founder';

      await safeDbSet('users/' + uid + '/isFounder', true);
      await safeDbSet('users/' + uid + '/founderRole', 'admin');
      await safeDbSet('system/founders/' + uid, {
        username:    username,
        activatedAt: firebase.database.ServerValue.TIMESTAMP,
        role:        'admin',
        fp:          deviceFP()
      });

      safeDbPush('security/founderAttempts', {
        ts: firebase.database.ServerValue.TIMESTAMP,
        uid: uid,
        success: true,
        fp: deviceFP()
      });

      window.GZ_IS_FOUNDER      = true;
      window.GZ_FOUNDER_VERIFIED  = true;

      // Session kaydet — yenilenince admin kalır
      sessionStorage.setItem('gz_admin_active','1');
      sessionStorage.setItem('gz_founder_session',JSON.stringify({uid,activated:Date.now()}));

      // authorityUid kaydet
      firebase.database().ref('system/authorityUid').set(uid).catch(()=>{});

      // Admin ekranını aç — OYUN KAPANIR
      const _gs=document.getElementById('gameScreen');
      const _as=document.getElementById('adminScreen');
      const _au=document.getElementById('authScreen');
      if(_gs){_gs.classList.remove('active');_gs.style.display='none';}
      if(_au){_au.classList.remove('active');_au.style.display='none';}
      if(_as){
        _as.style.display='flex';
        const lbl=document.getElementById('adminTopbarUser');
        if(lbl) lbl.textContent=(window.GZ?.data?.username||uid)+' (Yönetici)';
      }

      // AP hazır olana kadar bekle
      const _tryAP=()=>{
        if(window.AP?.openAdminPanel){ window.AP.openAdminPanel(); }
        else { setTimeout(_tryAP,250); }
      };
      setTimeout(_tryAP,400);

      window.exitAdminMode=function(){
        sessionStorage.removeItem('gz_admin_active');
        if(_as) _as.style.display='none';
        if(_gs){_gs.style.display='';_gs.classList.add('active');}
      };

      activateTopbarButton();
      notify('⚡ YETKİLİ OTURUMU AÇILDI','success',4000);
      return {ok:true};

    } catch(e){
      console.error('[Founder]',e);
      notify('Yetki aktive edilemedi: '+e.message,'error');
      return {ok:false,reason:'error'};
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //   AUTH EKRANI: "⚡ Yetkili" SEKMESİ
  // ═══════════════════════════════════════════════════════════════════════
  function setupAuthTabFlow() {
    // Auth ekranındaki "⚡ Yetkili olarak yetkilendir" butonu
    const btnAuthFounder = document.getElementById('btnFounderLogin');
    if (btnAuthFounder && btnAuthFounder.dataset.bound !== '1') {
      btnAuthFounder.dataset.bound = '1';
      btnAuthFounder.addEventListener('click', async (e) => {
        e.preventDefault();
        const passEl = document.getElementById('founderPass');
        const emailEl = document.getElementById('founderEmail');
        const accPassEl = document.getElementById('founderAccPass');
        if (!passEl) return notify('Şifre alanı bulunamadı!', 'error');

        const opts = {
          email:   emailEl ? emailEl.value.trim() : '',
          accPass: accPassEl ? accPassEl.value : ''
        };

        // Buton disable
        btnAuthFounder.disabled = true;
        btnAuthFounder.textContent = '⏳ İşleniyor...';

        try {
          const result = await authorizeFounder(passEl.value || '', opts);
          if (result.ok) {
            passEl.value = '';
            if (accPassEl) accPassEl.value = '';
          }
        } finally {
          btnAuthFounder.disabled = false;
          btnAuthFounder.textContent = '⚡ YETKİLİ OLARAK GİRİŞ YAP';
        }
      });
    }

    // Enter ile gönder (her input için)
    ['founderEmail', 'founderAccPass', 'founderPass'].forEach(id => {
      const inp = document.getElementById(id);
      if (inp && inp.dataset.bound !== '1') {
        inp.dataset.bound = '1';
        inp.addEventListener('keypress', async (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const btn = document.getElementById('btnFounderLogin');
            if (btn) btn.click();
          }
        });
      }
    });
  }

  function updateFounderStatusUI() {
    // Artık status göstergesi kullanılmıyor, ama eski referansları için
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════
  //   TOPBAR ⚡ BUTONU (her zaman görünür)
  // ═══════════════════════════════════════════════════════════════════════
  function setupTopbarTrigger() {
    const btn = document.getElementById('founderTriggerBtn');
    if (!btn) {
      // Topbar henüz yüklenmediyse 1 saniye sonra tekrar dene
      if (!setupTopbarTrigger._tries) setupTopbarTrigger._tries = 0;
      setupTopbarTrigger._tries++;
      if (setupTopbarTrigger._tries < 15) setTimeout(setupTopbarTrigger, 1000);
      return;
    }
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', () => {
      // Eğer zaten yetkiliyse → kontrol panelini aç
      if (window.GZ_IS_FOUNDER && typeof window.openFounderPanel === 'function') {
        window.openFounderPanel();
        return;
      }
      // Değilse → şifre modal'ını aç
      openPasswordModal();
    });

    console.log('[Founder] ⚡ Topbar butonu hazır');
  }

  function activateTopbarButton() {
    const btn = document.getElementById('founderTriggerBtn');
    if (btn) {
      btn.classList.add('active');
      btn.title = 'Yetkili Paneli';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //   ŞİFRE MODAL'I (topbar butonundan açılır)
  // ═══════════════════════════════════════════════════════════════════════
  function openPasswordModal() {
    const panel = document.getElementById('founderLoginPanel');
    if (!panel) return notify('Modal bulunamadı', 'error');
    panel.classList.add('active');
    panel.style.display = 'flex';
    const inp = document.getElementById('founderPassModal');
    if (inp) {
      inp.value = '';
      setTimeout(() => inp.focus(), 100);
    }
  }

  function closePasswordModal() {
    const panel = document.getElementById('founderLoginPanel');
    if (panel) {
      panel.classList.remove('active');
      panel.style.display = 'none';
    }
  }

  function setupModalEvents() {
    const btnLogin = document.getElementById('btnFounderLoginModal');
    const btnClose = document.getElementById('btnFounderClose');
    const passInp  = document.getElementById('founderPassModal');

    if (btnLogin && btnLogin.dataset.bound !== '1') {
      btnLogin.dataset.bound = '1';
      btnLogin.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!passInp) return;
        const result = await authorizeFounder(passInp.value || '');
        if (result.ok) {
          passInp.value = '';
          closePasswordModal();
        }
      });
    }

    if (btnClose && btnClose.dataset.bound !== '1') {
      btnClose.dataset.bound = '1';
      btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        closePasswordModal();
      });
    }

    if (passInp && passInp.dataset.bound !== '1') {
      passInp.dataset.bound = '1';
      passInp.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const result = await authorizeFounder(passInp.value || '');
          if (result.ok) {
            passInp.value = '';
            closePasswordModal();
          }
        }
      });
    }

    // ESC ile kapatma
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const panel = document.getElementById('founderLoginPanel');
        if (panel && panel.classList.contains('active')) closePasswordModal();
      }
    });

    // Dış tıklama ile kapatma
    const panel = document.getElementById('founderLoginPanel');
    if (panel && panel.dataset.bound !== '1') {
      panel.dataset.bound = '1';
      panel.addEventListener('click', (e) => {
        if (e.target === panel) closePasswordModal();
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //   AUTH STATE - Mevcut yetki kontrolü
  // ═══════════════════════════════════════════════════════════════════════
  function setupAuthListener() {
    if (typeof firebase === 'undefined' || !firebase.auth) return;
    firebase.auth().onAuthStateChanged(async (user) => {
      updateFounderStatusUI();
      if (!user) {
        window.GZ_IS_FOUNDER = false;
        const btn = document.getElementById('founderTriggerBtn');
        if (btn) btn.classList.remove('active');
        return;
      }
      try {
        const flag = await safeDbGet('users/'+user.uid+'/isFounder');
        if (flag===true) {
          // Sadece buton görünür - panel açılmaz, GZ_IS_FOUNDER set edilmez
          const btn2=document.getElementById('founderTriggerBtn');
          if(btn2) btn2.style.display='';
        }
      } catch(e){}
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //   BAKIM MODU & GLOBAL DUYURU DİNLEYİCİLERİ
  // ═══════════════════════════════════════════════════════════════════════
  // ─── Bakım modunda yetkili bypass ───
  window._maintBypass = function() {
    const maint = document.getElementById('maintenanceScreen');
    const auth  = document.getElementById('authScreen');
    if (maint) { maint.classList.remove('active'); maint.style.display = 'none'; }
    if (auth)  { auth.style.display = 'flex'; }
    // Yetkili sekmesini otomatik aç
    setTimeout(() => {
      const tab = document.querySelector('.auth-tab[data-tab="founder"]');
      if (tab) tab.click();
      const passEl = document.getElementById('founderPass');
      if (passEl) setTimeout(() => passEl.focus(), 200);
    }, 150);
  };

  function setupSystemListeners() {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    try {
      firebase.database().ref('system/maintenance').on('value', (s) => {
        const m = s.val();
        const screen = document.getElementById('maintenanceScreen');
        if (!screen) return;
        const isMaint = m && m.active === true;
        if (isMaint && !window.GZ_IS_FOUNDER) {
          screen.classList.add('active');
          screen.style.display = 'flex';
          const r = document.getElementById('maintReason');
          const e = document.getElementById('maintEta');
          if (r && m.reason) r.textContent = m.reason;
          if (e && m.eta)    e.textContent = 'Tahmini süre: ' + m.eta;
        } else {
          screen.classList.remove('active');
          screen.style.display = 'none';
        }
      });
    } catch(e) {}

    try {
      firebase.database().ref('broadcast/current').on('value', (s) => {
        const b = s.val();
        const bar = document.getElementById('globalBroadcast');
        if (!bar) return;
        const isActive = b && b.active === true && b.text && (!b.expiresAt || Date.now() < b.expiresAt);
        if (isActive) {
          bar.style.display = 'flex';
          const t = document.getElementById('gbText');
          if (t) t.textContent = b.text;
        } else {
          bar.style.display = 'none';
        }
      });
    } catch(e) {}

    const gbClose = document.getElementById('gbClose');
    if (gbClose && gbClose.dataset.bound !== '1') {
      gbClose.dataset.bound = '1';
      gbClose.addEventListener('click', () => {
        const bar = document.getElementById('globalBroadcast');
        if (bar) bar.style.display = 'none';
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //   INIT
  // ═══════════════════════════════════════════════════════════════════════
  function init() {
    setupAuthTabFlow();
    setupTopbarTrigger();
    setupModalEvents();
    setupAuthListener();
    setupSystemListeners();
    console.log('%c[Founder v4] ⚡ Sistem aktif. Auth ekranında "⚡ Yetkili" sekmesi VEYA topbar\'da ⚡ butonu kullanılabilir.', 'color:#fbbf24;font-weight:bold');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  // Geç yüklenen elementler için ekstra retry
  setTimeout(() => {
    setupAuthTabFlow();
    setupTopbarTrigger();
    setupModalEvents();
  }, 2500);

  setTimeout(() => {
    setupAuthTabFlow();
    setupTopbarTrigger();
    setupModalEvents();
  }, 5000);

  // ═══════════════════════════════════════════════════════════════════════
  //   PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════
  window.openFounderLogin    = openPasswordModal;
  window.closeFounderLogin   = closePasswordModal;
  window.authorizeFounder    = authorizeFounder;
  window.GZ_isFounderLocked  = getLockInfo;
  window.GZ_resetFounderLock = () => {
    localStorage.removeItem(CFG.LS_LOCK);
    localStorage.removeItem(CFG.LS_ATTEMPTS);
    notify('🔓 Kilit kaldırıldı', 'success');
  };

})();


/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║   ⚡ YETKİLİ ÜSTÜN GÜÇLER — Yetkili olunca her şeye erişim, hiç sınır    ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */
(function FounderPowers(){
  'use strict';

  // Yetkili olunca uygulanacak override'lar
  function applyFounderOverrides() {
    if (!window.GZ_IS_FOUNDER) return;

    // 1) Tüm seviye kilitlerini bypass et (canPlay, hire, vb.)
    window.GZ_FOUNDER_BYPASS_LEVEL = true;

    // 2) Bakım modunu görmezden gel (zaten giris.js'de var)
    // 3) Konsol komutları
    if (!window.founderHelp) {
      window.founderHelp = function() {
        console.log('%c⚡ YETKİLİ KOMUTLARI', 'background:#fbbf24;color:#000;padding:6px 12px;font-size:14px;font-weight:bold;border-radius:6px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#fbbf24');
        console.log('%cwindow.giveMoney(1000000)', 'color:#16a34a', '— Kendine 1M para ver');
        console.log('%cwindow.giveDiamonds(500)', 'color:#3b82f6', '— Kendine 500 elmas ver');
        console.log('%cwindow.setLevel(50)', 'color:#a855f7', '— Seviyeyi 50 yap');
        console.log('%cwindow.openFounderPanel()', 'color:#fbbf24', '— Yetkili kontrol panelini aç');
        console.log('%cwindow.maintenanceOn("sebep")', 'color:#dc2626', '— Bakım moduna al');
        console.log('%cwindow.maintenanceOff()', 'color:#16a34a', '— Bakımdan çıkar');
        console.log('%cwindow.broadcast("mesaj", 30)', 'color:#0891b2', '— 30 dk duyuru yayınla');
        console.log('%cwindow.broadcastClear()', 'color:#6b7280', '— Duyuruyu kapat');
        console.log('%cwindow.notifyAll("mesaj")', 'color:#f59e0b', '— Tüm oyunculara bildirim');
        console.log('%cwindow.banUser("uid")', 'color:#dc2626', '— Kullanıcıyı banla');
        console.log('%cwindow.unbanUser("uid")', 'color:#16a34a', '— Ban kaldır');
        console.log('%cwindow.giveMoneyTo("uid", 1000)', 'color:#16a34a', '— Hedefe para ver');
        console.log('%cwindow.foundStats()', 'color:#3b82f6', '— Sistem istatistikleri');
      };
    }

    // ── KISA YOL FONKSİYONLAR (Console için) ──
    window.giveMoney = async (amount) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      const r = await addCash(GZ.uid, amount, 'founder_self');
      toast(`💰 +${amount.toLocaleString('tr-TR')} ₺`, 'success');
      return r;
    };

    window.giveDiamonds = async (amount) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      const r = await addDiamonds(GZ.uid, amount);
      toast(`💎 +${amount} elmas`, 'success');
      return r;
    };

    window.setLevel = async (lv) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      await dbUpdate('users/' + GZ.uid, { level: lv, xp: 0 });
      toast(`📊 Seviye ${lv}`, 'success');
      setTimeout(() => location.reload(), 1500);
    };

    window.maintenanceOn = async (reason) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) await window.founderActions.toggleMaintenance(true, reason || 'Sistem güncelleniyor', '15 dk');
      toast('🔧 Bakım modunda', 'success');
    };

    window.maintenanceOff = async () => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) await window.founderActions.toggleMaintenance(false);
      toast('✅ Bakımdan çıkıldı', 'success');
    };

    window.broadcast = async (text, durationMin) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) await window.founderActions.sendBroadcast(text, durationMin || 30);
      toast('📢 Duyuru gönderildi', 'success');
    };

    window.broadcastClear = async () => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) await window.founderActions.clearBroadcast();
      toast('🚫 Duyuru kapatıldı', 'success');
    };

    window.notifyAll = async (msg, icon) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) {
        const r = await window.founderActions.sendNotificationToAll(msg, icon || '📢');
        toast(`📨 ${r.count} oyuncuya gönderildi`, 'success');
      }
    };

    window.banUser = async (uid) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) await window.founderActions.banUser(uid, 'Yetkili kararı');
      toast('🚫 Banlandı', 'success');
    };

    window.unbanUser = async (uid) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) await window.founderActions.unbanUser(uid);
      toast('✅ Ban kaldırıldı', 'success');
    };

    window.giveMoneyTo = async (uid, amount) => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) await window.founderActions.grantMoney(uid, amount);
      toast(`💰 ${amount.toLocaleString('tr-TR')} ₺ verildi`, 'success');
    };

    window.foundStats = async () => {
      if (!window.GZ_IS_FOUNDER) return console.warn('Yetki yok');
      if (window.founderActions) {
        const r = await window.founderActions.getStats();
        console.table(r.stats);
        return r.stats;
      }
    };

    console.log('%c⚡ YETKİLİ AKTİF — Komutlar için: founderHelp()', 'background:linear-gradient(90deg,#fbbf24,#f59e0b);color:#000;padding:8px 16px;font-size:14px;font-weight:bold;border-radius:8px');
  }

  // Auth state değiştiğinde override'ları uygula
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(() => {
      setTimeout(applyFounderOverrides, 1000);
      setTimeout(applyFounderOverrides, 3000);
      setTimeout(applyFounderOverrides, 6000);
    });
  }

  // Founder yetkisi alındığında da tetikle
  const _origActivate = window.activateTopbarButton;
  setTimeout(() => {
    setTimeout(applyFounderOverrides, 500);
  }, 500);
})();
/* ==========================================================================
   giris-eklenti.js — E-posta Doğrulama Düzeltmesi + Canlı Destek
   ─────────────────────────────────────────────────────────────────────────
   index.html'de giris.js'den SONRA ekle:
     <script src="giris-eklenti.js"></script>

   DÜZELTILENLER:
   1. E-posta doğrulama bildirimi gönderimi (retry + hata yönetimi)
   2. Doğrulama ekranı iyileştirmesi (yeniden gönder butonu)
   3. Oyuna girince e-posta doğrulanmamışsa uyarı banneri
   4. Canlı Destek widget (auth ekranı + oyun içi)
   5. Destek mesajları Firebase'e kaydedilir → admin panelden görünür
   ========================================================================== */

(function GirisEklenti() {
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     1. E-POSTA DOĞRULAMA — TAM DÜZELTME
     ════════════════════════════════════════════════════════════════════ */

  /**
   * E-posta doğrulama maili gönder — retry + Türkçe hata mesajları
   * giris.js içindeki sendEmailVerification yerine bu kullanılır
   */
  async function sendVerificationEmail(user, attempt = 1) {
    if (!user || !user.email) return { ok: false, error: 'Kullanıcı bulunamadı' };

    // Anonim hesaplar doğrulama almaz
    if (user.email.endsWith('@anon.gamezone.local')) {
      return { ok: true, skipped: true };
    }

    try {
      // Firebase Action URL ayarla (kendi domain'ini buraya yaz)
      const actionCodeSettings = {
        url: window.location.origin + window.location.pathname + '?verified=1&ts=' + Date.now(),
        handleCodeInApp: false   // false = normal e-posta linki, true = in-app
      };

      await user.sendEmailVerification(actionCodeSettings);

      // Firebase'e kayıt — son gönderim zamanı
      try {
        await firebase.database().ref('users/' + user.uid + '/lastVerifEmailSent')
          .set(firebase.database.ServerValue.TIMESTAMP);
      } catch(e) {}

      return { ok: true };
    } catch (e) {
      const errMap = {
        'auth/too-many-requests': 'Çok fazla istek gönderildi. Lütfen birkaç dakika bekle.',
        'auth/user-not-found':    'Kullanıcı bulunamadı.',
        'auth/network-request-failed': 'İnternet bağlantını kontrol et.',
        'auth/invalid-email':     'E-posta adresi geçersiz.',
      };

      const msg = errMap[e.code] || ('Gönderim hatası: ' + (e.message || e.code));

      // 2 kez retry yap
      if (attempt < 3 && e.code !== 'auth/too-many-requests') {
        await new Promise(r => setTimeout(r, 2000 * attempt));
        return sendVerificationEmail(user, attempt + 1);
      }

      return { ok: false, error: msg };
    }
  }

  /**
   * Kayıt olduktan sonra doğrulama e-postası gönder + ekranı göster
   * giris.js'deki createUserWithEmailAndPassword bloğunu yakala
   */
  async function handlePostRegister(user, email) {
    // Yükleniyor bildirimi
    if (typeof window.toast === 'function') {
      window.toast('📧 Doğrulama maili gönderiliyor...', 'info', 3000);
    }

    const result = await sendVerificationEmail(user);

    if (result.skipped) {
      // Anonim hesap — doğrulama gerekmez
      return;
    }

    if (result.ok) {
      // Doğrulama ekranını güncelle
      const verifyText = document.getElementById('verifyEmailText');
      if (verifyText) {
        verifyText.innerHTML = `
          <b>${escHtml(email)}</b> adresine doğrulama bağlantısı gönderdik.<br>
          <span style="font-size:12px;color:var(--muted)">
            Gelen kutunuzu ve spam/gereksiz klasörünüzü kontrol edin.
          </span>
        `;
      }
      if (typeof window.toast === 'function') {
        window.toast('📧 Doğrulama maili gönderildi! E-postanı kontrol et.', 'success', 6000);
      }
    } else {
      if (typeof window.toast === 'function') {
        window.toast('⚠️ Mail gönderilemedi: ' + result.error, 'warn', 8000);
      }
      // Yine de doğrulama ekranını göster — manuel retry butonu var
    }

    // Doğrulama ekranını zenginleştir
    enrichVerifyScreen(user, email);
  }

  /**
   * Doğrulama ekranını zenginleştir — yeniden gönder, yardım, durum kontrolü
   */
  function enrichVerifyScreen(user, email) {
    const panel = document.getElementById('verifyPanel');
    if (!panel) return;

    // Mevcut içeriği koru, altına ekstra butonlar ekle
    let extra = document.getElementById('verifyPanelExtra');
    if (extra) extra.remove();

    extra = document.createElement('div');
    extra.id = 'verifyPanelExtra';
    extra.innerHTML = `
      <div style="margin-top:14px">
        <!-- Geri sayım + yeniden gönder -->
        <div id="verifyCooldown" style="
          text-align:center;color:var(--muted);font-size:13px;margin-bottom:10px
        ">Mail gönderildi. Yeniden gönderebilmek için <b id="verifyCd">60</b> saniye bekle.</div>

        <button id="btnResendVerify" disabled style="
          width:100%;padding:12px;border-radius:10px;
          border:1px solid var(--border);background:var(--card-bg);
          color:var(--muted);font-size:13px;cursor:not-allowed;margin-bottom:8px
        ">📧 Doğrulama Mailini Yeniden Gönder</button>

        <button id="btnCheckVerify" style="
          width:100%;padding:12px;border-radius:10px;
          border:none;background:#3b82f6;color:#fff;
          font-size:13px;font-weight:700;cursor:pointer;margin-bottom:8px
        ">🔄 Doğruladım — Kontrol Et</button>

        <button id="btnVerifyHelp" style="
          width:100%;padding:10px;border-radius:10px;
          border:1px solid var(--border);background:transparent;
          color:var(--muted);font-size:12px;cursor:pointer
        ">❓ Mail gelmiyor mu? Yardım al</button>

        <!-- Sorun giderme ipuçları -->
        <div id="verifyTips" style="display:none;
          background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);
          border-radius:10px;padding:12px;margin-top:10px;font-size:12px;
          color:var(--muted);line-height:1.6
        ">
          <b style="color:var(--text)">📋 Mail gelmiyor mu?</b><br>
          1. Spam / Gereksiz klasörünü kontrol et<br>
          2. <b>${escHtml(email)}</b> adresinin doğru olduğuna emin ol<br>
          3. 5 dakika bekle — gecikme olabilir<br>
          4. Farklı bir e-posta ile tekrar kayıt ol<br>
          5. Sorun devam ediyorsa canlı destek kullan ↓
          <div style="margin-top:8px">
            <button onclick="openLiveSupport()" style="
              background:#10b981;border:none;color:#fff;padding:8px 16px;
              border-radius:8px;cursor:pointer;font-size:12px;font-weight:600
            ">💬 Canlı Destek</button>
          </div>
        </div>
      </div>
    `;

    panel.appendChild(extra);

    // Geri sayım — 60 sn
    let cd = 60;
    const cdEl = document.getElementById('verifyCd');
    const resendBtn = document.getElementById('btnResendVerify');
    const cdTimer = setInterval(() => {
      cd--;
      if (cdEl) cdEl.textContent = cd;
      if (cd <= 0) {
        clearInterval(cdTimer);
        if (resendBtn) {
          resendBtn.disabled = false;
          resendBtn.style.cssText = `
            width:100%;padding:12px;border-radius:10px;border:none;
            background:#f59e0b;color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:8px
          `;
          resendBtn.textContent = '📧 Doğrulama Mailini Yeniden Gönder';
        }
        const cdDiv = document.getElementById('verifyCooldown');
        if (cdDiv) cdDiv.style.display = 'none';
      }
    }, 1000);

    // Yeniden gönder
    if (resendBtn) {
      resendBtn.onclick = async () => {
        resendBtn.disabled = true;
        resendBtn.textContent = 'Gönderiliyor...';
        await user.reload();
        const result = await sendVerificationEmail(user);
        if (result.ok) {
          if (typeof window.toast === 'function') window.toast('📧 Mail yeniden gönderildi!', 'success');
          resendBtn.textContent = '✅ Gönderildi';
          // 60sn tekrar bekle
          setTimeout(() => {
            resendBtn.textContent = '📧 Yeniden Gönder';
            resendBtn.disabled = false;
          }, 60000);
        } else {
          if (typeof window.toast === 'function') window.toast('⚠️ ' + result.error, 'warn');
          resendBtn.disabled = false;
          resendBtn.textContent = '📧 Doğrulama Mailini Yeniden Gönder';
        }
      };
    }

    // Doğrulandı mı kontrol et
    const checkBtn = document.getElementById('btnCheckVerify');
    if (checkBtn) {
      checkBtn.onclick = async () => {
        checkBtn.textContent = 'Kontrol ediliyor...';
        checkBtn.disabled = true;
        try {
          await user.reload();
          if (user.emailVerified) {
            // Firebase DB güncelle
            await firebase.database().ref('users/' + user.uid + '/verified').set(true);
            if (typeof window.toast === 'function') window.toast('✅ E-posta doğrulandı! Oyuna girildi.', 'success', 5000);
            // Oyuna giriş — onAuthStateChanged tetiklenecek
            if (typeof window.enterGame === 'function') {
              await window.enterGame(user);
            } else {
              window.location.reload();
            }
          } else {
            if (typeof window.toast === 'function') window.toast('⏳ Henüz doğrulanmamış. E-postanı kontrol et!', 'warn', 4000);
            checkBtn.textContent = '🔄 Doğruladım — Kontrol Et';
            checkBtn.disabled = false;
          }
        } catch(e) {
          checkBtn.textContent = '🔄 Doğruladım — Kontrol Et';
          checkBtn.disabled = false;
        }
      };
    }

    // Yardım toggle
    const helpBtn = document.getElementById('btnVerifyHelp');
    const tipsDiv = document.getElementById('verifyTips');
    if (helpBtn && tipsDiv) {
      helpBtn.onclick = () => {
        const shown = tipsDiv.style.display !== 'none';
        tipsDiv.style.display = shown ? 'none' : 'block';
        helpBtn.textContent = shown ? '❓ Mail gelmiyor mu? Yardım al' : '❌ Kapat';
      };
    }
  }

  /**
   * URL'de ?verified=1 parametresi varsa — link tıklandı
   * Firebase action URL'den döndükten sonra
   */
  async function handleVerificationReturn() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('verified')) return;

    // URL'yi temizle
    window.history.replaceState({}, '', window.location.pathname);

    // Kullanıcıyı yenile
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      await user.reload();
      if (user.emailVerified) {
        await firebase.database().ref('users/' + user.uid + '/verified').set(true);
        if (typeof window.toast === 'function') {
          window.toast('✅ E-posta doğrulandı! Hoş geldin.', 'success', 5000);
        }
      }
    } catch(e) {}
  }

  /**
   * Oyun içi — e-posta doğrulanmamış kullanıcıya uyarı banner göster
   */
  function showUnverifiedBanner(user) {
    if (!user || user.emailVerified) return;
    if (user.email && user.email.endsWith('@anon.gamezone.local')) return; // anonim

    // Zaten var mı
    if (document.getElementById('unverifiedBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'unverifiedBanner';
    banner.style.cssText = `
      position:fixed;bottom:70px;left:50%;transform:translateX(-50%);
      background:#f59e0b;color:#000;
      padding:10px 16px;border-radius:12px;
      font-size:13px;font-weight:700;
      z-index:9998;display:flex;align-items:center;gap:10px;
      box-shadow:0 4px 20px rgba(0,0,0,0.3);
      max-width:calc(100vw - 32px);
    `;
    banner.innerHTML = `
      <span>⚠️ E-posta doğrulanmamış!</span>
      <button id="btnBannerVerify" style="
        background:#000;color:#fbbf24;border:none;padding:6px 12px;
        border-radius:8px;cursor:pointer;font-size:12px;font-weight:700
      ">Doğrula</button>
      <button onclick="document.getElementById('unverifiedBanner').remove()" style="
        background:transparent;border:none;color:#000;cursor:pointer;font-size:18px;padding:0
      ">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('btnBannerVerify').onclick = async () => {
      banner.innerHTML = '<span>📧 Mail gönderiliyor...</span>';
      const result = await sendVerificationEmail(user);
      if (result.ok) {
        banner.innerHTML = '<span>✅ Doğrulama maili gönderildi! E-postanı kontrol et.</span>';
        setTimeout(() => banner.remove(), 5000);
      } else {
        banner.innerHTML = `<span>⚠️ ${result.error}</span><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:#000;cursor:pointer;font-size:18px">✕</button>`;
      }
    };
  }

  /* ════════════════════════════════════════════════════════════════════
     2. CANLI DESTEK WİDGET
     ════════════════════════════════════════════════════════════════════ */

  const SUPPORT_CONFIG = {
    ownerNotifUID: null,   // Admin UID — Firebase'den çekilir
    maxMsgLen: 500,
    autoReply: {
      delay: 1500,
      messages: [
        '👋 Merhaba! Sana yardımcı olmaya çalışacağız. Mesajın alındı!',
        '📝 Mesajın kaydedildi. Ekibimiz en kısa sürede yanıt verecek.',
        '⚡ Destek talebin oluşturuldu. Genellikle birkaç dakika içinde yanıt veriyoruz.'
      ]
    }
  };

  let supportOpen = false;
  let supportSessionId = null;

  /**
   * Canlı destek widgetını oluştur (auth ekranı + oyun içi)
   */
  function createSupportWidget() {
    if (document.getElementById('supportWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'supportWidget';
    widget.innerHTML = `
      <!-- Destek Butonu -->
      <button id="supportToggleBtn" onclick="toggleLiveSupport()" style="
        position:fixed;bottom:20px;right:20px;z-index:9990;
        width:56px;height:56px;border-radius:50%;
        background:linear-gradient(135deg,#10b981,#059669);
        border:none;cursor:pointer;
        box-shadow:0 4px 20px rgba(16,185,129,0.5);
        display:flex;align-items:center;justify-content:center;
        font-size:24px;transition:.3s;
      " title="Canlı Destek">
        💬
        <span id="supportUnreadBadge" style="
          display:none;position:absolute;top:-4px;right:-4px;
          background:#dc2626;color:#fff;border-radius:50%;
          width:20px;height:20px;font-size:11px;font-weight:700;
          align-items:center;justify-content:center;
        ">0</span>
      </button>

      <!-- Chat Penceresi -->
      <div id="supportChatWindow" style="
        display:none;
        position:fixed;bottom:90px;right:20px;z-index:9991;
        width:320px;max-width:calc(100vw - 40px);
        background:#1e2d4a;border:1px solid #1e3a8a;
        border-radius:16px;overflow:hidden;
        box-shadow:0 8px 40px rgba(0,0,0,0.5);
        flex-direction:column;height:440px;
      ">
        <!-- Header -->
        <div style="
          background:linear-gradient(135deg,#10b981,#059669);
          padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0
        ">
          <div style="
            width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);
            display:flex;align-items:center;justify-content:center;font-size:18px;
          ">🎮</div>
          <div style="flex:1">
            <div style="color:#fff;font-weight:700;font-size:14px">GameZone Destek</div>
            <div style="color:rgba(255,255,255,0.8);font-size:11px">
              <span style="width:8px;height:8px;border-radius:50%;background:#86efac;display:inline-block;margin-right:4px"></span>
              Genellikle dakikalar içinde yanıt verir
            </div>
          </div>
          <button onclick="toggleLiveSupport()" style="
            background:rgba(255,255,255,0.2);border:none;color:#fff;
            width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;
            display:flex;align-items:center;justify-content:center;
          ">✕</button>
        </div>

        <!-- Mesaj alanı -->
        <div id="supportMsgArea" style="
          flex:1;overflow-y:auto;padding:12px;
          display:flex;flex-direction:column;gap:8px;
        ">
          <!-- Karşılama mesajı -->
          <div style="
            background:rgba(255,255,255,0.05);border-radius:12px 12px 12px 0;
            padding:10px 12px;max-width:85%;
          ">
            <div style="color:#e5e7eb;font-size:13px">
              👋 Merhaba! GameZone desteğine hoş geldin.<br><br>
              Sorularını buradan yazabilirsin. Ne konuda yardım istiyorsun?
            </div>
            <div style="color:#64748b;font-size:10px;margin-top:4px">GameZone • Şimdi</div>
          </div>

          <!-- Hızlı sorular -->
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">
            <div style="color:#64748b;font-size:11px;padding-left:2px">Hızlı sorular:</div>
            ${[
              'E-postam doğrulanmıyor',
              'Hesabıma giremiyorum',
              'Para/elmas kaybettim',
              'Hesabım banlandı',
              'Teknik sorun yaşıyorum'
            ].map(q => `
              <button onclick="supportQuickMsg('${q}')" style="
                background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);
                color:#93c5fd;padding:7px 12px;border-radius:20px;
                cursor:pointer;font-size:12px;text-align:left;transition:.2s;
              ">${q}</button>
            `).join('')}
          </div>
        </div>

        <!-- Input alanı -->
        <div style="
          padding:10px;border-top:1px solid #1e3a8a;flex-shrink:0;
          display:flex;gap:8px;align-items:flex-end;
        ">
          <textarea id="supportInput" placeholder="Mesajını yaz..." rows="2" style="
            flex:1;background:#0f172a;border:1px solid #2d3748;color:#e5e7eb;
            border-radius:10px;padding:8px 12px;font-size:13px;resize:none;
            font-family:inherit;line-height:1.4;max-height:80px;
          " oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px'"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendSupportMsg()}"
          ></textarea>
          <button onclick="sendSupportMsg()" style="
            background:linear-gradient(135deg,#10b981,#059669);border:none;
            color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;
            display:flex;align-items:center;justify-content:center;font-size:18px;
            flex-shrink:0;
          ">➤</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      #supportToggleBtn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(16,185,129,0.7) !important; }
      #supportChatWindow { display: none; }
      #supportChatWindow.open { display: flex !important; }
      .support-msg-user {
        background: linear-gradient(135deg,#1e3a8a,#1e5cb8);
        border-radius: 12px 12px 0 12px;
        padding: 10px 12px; max-width: 85%; align-self: flex-end;
        color: #e5e7eb; font-size: 13px;
      }
      .support-msg-admin {
        background: rgba(255,255,255,0.05);
        border-radius: 12px 12px 12px 0;
        padding: 10px 12px; max-width: 85%;
        color: #e5e7eb; font-size: 13px;
      }
      .support-msg-time { color: #64748b; font-size: 10px; margin-top: 3px; }
      @keyframes supportPulse { 0%,100%{box-shadow:0 4px 20px rgba(16,185,129,0.5)} 50%{box-shadow:0 4px 30px rgba(16,185,129,0.9)} }
    `;
    document.head.appendChild(style);
  }

  window.toggleLiveSupport = function () {
    const win = document.getElementById('supportChatWindow');
    if (!win) return;
    supportOpen = !supportOpen;
    win.classList.toggle('open', supportOpen);
    const btn = document.getElementById('supportToggleBtn');
    if (btn) btn.innerHTML = supportOpen ? '✕' : '💬';

    if (supportOpen) {
      // Session ID oluştur
      if (!supportSessionId) supportSessionId = 'sup_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      // Okunmadı sayacını sıfırla
      const badge = document.getElementById('supportUnreadBadge');
      if (badge) badge.style.display = 'none';
      // Input'a odaklan
      setTimeout(() => document.getElementById('supportInput')?.focus(), 100);
      // Firebase'den mesajları yükle
      loadSupportHistory();
    }
  };

  window.openLiveSupport = function () {
    if (!supportOpen) window.toggleLiveSupport();
  };

  window.supportQuickMsg = function (text) {
    const inp = document.getElementById('supportInput');
    if (inp) { inp.value = text; inp.focus(); }
    sendSupportMsg();
  };

  window.sendSupportMsg = async function () {
    const inp = document.getElementById('supportInput');
    const text = (inp?.value || '').trim();
    if (!text) return;
    if (text.length > SUPPORT_CONFIG.maxMsgLen) {
      if (typeof window.toast === 'function') window.toast(`Mesaj en fazla ${SUPPORT_CONFIG.maxMsgLen} karakter`, 'warn');
      return;
    }

    inp.value = '';
    inp.style.height = 'auto';

    // Kullanıcı bilgisi
    const user = firebase.auth().currentUser;
    const uid  = user?.uid || 'guest_' + Date.now();
    const username = (window.GZ?.data?.username) || user?.email?.split('@')[0] || 'Misafir';

    // Mesajı ekrana ekle
    appendSupportMsg(text, 'user', username, new Date());

    // Firebase'e kaydet
    try {
      const msgRef = await firebase.database().ref('support/sessions/' + supportSessionId + '/messages').push({
        text,
        senderUid: uid,
        senderName: username,
        senderEmail: user?.email || null,
        ts: firebase.database.ServerValue.TIMESTAMP,
        read: false,
        type: 'user'
      });

      // Session meta güncelle
      await firebase.database().ref('support/sessions/' + supportSessionId).update({
        uid, username,
        email: user?.email || null,
        lastMsg: text.slice(0, 100),
        lastTs: firebase.database.ServerValue.TIMESTAMP,
        status: 'open',
        unread: true
      });

      // Admin'e bildirim gönder — isFounder=true olan kullanıcıyı bul
      notifyAdminNewMsg(username, text);

    } catch(e) {
      console.warn('[Support] Mesaj kaydedilemedi:', e);
    }

    // Otomatik cevap (1.5 sn sonra)
    setTimeout(() => {
      const replies = SUPPORT_CONFIG.autoReply.messages;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      appendSupportMsg(reply, 'admin', 'GameZone Destek', new Date());
    }, SUPPORT_CONFIG.autoReply.delay);
  };

  function appendSupportMsg(text, type, name, date) {
    const area = document.getElementById('supportMsgArea');
    if (!area) return;

    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = type === 'user' ? 'flex-end' : 'flex-start';

    const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <div class="support-msg-${type === 'user' ? 'user' : 'admin'}">
        ${type === 'admin' ? '<div style="color:#10b981;font-size:10px;font-weight:700;margin-bottom:3px">🎮 ' + escHtml(name) + '</div>' : ''}
        ${escHtml(text)}
      </div>
      <div class="support-msg-time">${time}</div>
    `;

    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  async function loadSupportHistory() {
    if (!supportSessionId) return;
    try {
      const snap = await firebase.database().ref('support/sessions/' + supportSessionId + '/messages')
        .limitToLast(20).once('value');
      if (!snap.val()) return;
      // Zaten gösterilmiş mesajları tekrar gösterme (sadece ilk yüklemede)
    } catch(e) {}
  }

  async function notifyAdminNewMsg(username, text) {
    try {
      // isFounder=true olan kullanıcıları bul
      const snap = await firebase.database().ref('users')
        .orderByChild('isFounder').equalTo(true).once('value');
      const founders = snap.val() || {};
      const batch = {};
      Object.keys(founders).forEach(fuid => {
        const key = firebase.database().ref().push().key;
        batch['notifs/' + fuid + '/' + key] = {
          type: 'support_msg',
          icon: '💬',
          msg: `💬 Yeni destek mesajı — ${username}: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`,
          sessionId: supportSessionId,
          ts: firebase.database.ServerValue.TIMESTAMP,
          read: false
        };
      });
      if (Object.keys(batch).length > 0) {
        await firebase.database().ref().update(batch);
      }
    } catch(e) {}
  }

  /* ════════════════════════════════════════════════════════════════════
     3. ADMİN PANELİ — Destek Mesajları Sekmesi
     ════════════════════════════════════════════════════════════════════ */

  /**
   * Admin paneline destek sekmesi enjekte et
   */
  function injectSupportAdminTab() {
    const nav = document.querySelector('.admin-nav');
    if (!nav || document.getElementById('supportNavBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'supportNavBtn';
    btn.className = 'admin-nav-btn';
    btn.innerHTML = '💬 Destek <span id="supportMsgBadge" style="background:#10b981;color:#fff;border-radius:99px;padding:1px 7px;font-size:11px;margin-left:4px;display:none">0</span>';
    btn.onclick = () => {
      document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      openSupportAdmin();
    };

    nav.appendChild(btn);
    updateSupportBadge();
  }

  async function updateSupportBadge() {
    try {
      const snap = await firebase.database().ref('support/sessions')
        .orderByChild('unread').equalTo(true).once('value');
      const count = snap.numChildren();
      const badge = document.getElementById('supportMsgBadge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? '' : 'none';
      }
    } catch(e) {}
  }

  async function openSupportAdmin() {
    const panel = document.getElementById('adminPanelBody');
    if (!panel) return;
    panel.innerHTML = '<div class="admin-loading">💬 Destek mesajları yükleniyor...</div>';

    const snap = await firebase.database().ref('support/sessions')
      .orderByChild('lastTs').limitToLast(50).once('value');
    const sessions = snap.val() || {};
    const sessionList = Object.entries(sessions)
      .sort((a, b) => (b[1].lastTs || 0) - (a[1].lastTs || 0));

    panel.innerHTML = `
      <div class="admin-section">
        <h2 class="admin-section-title">💬 Canlı Destek Mesajları</h2>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
          <button onclick="markAllSupportRead()" style="background:#10b98122;border:1px solid #10b98155;color:#10b981;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px">✅ Tümünü Okundu İşaretle</button>
          <button onclick="openSupportAdmin()" style="background:#3b82f622;border:1px solid #3b82f655;color:#3b82f6;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px">🔄 Yenile</button>
        </div>

        ${sessionList.length === 0
          ? '<div style="text-align:center;padding:60px;color:#475569"><div style="font-size:60px">💬</div><div style="font-size:18px;font-weight:700;color:#94a3b8;margin-top:12px">Destek mesajı yok</div></div>'
          : sessionList.map(([sid, s]) => `
            <div onclick="openSupportSession('${sid}')" style="
              background:${s.unread ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)'};
              border:1px solid ${s.unread ? 'rgba(16,185,129,0.3)' : '#1e3a8a'};
              border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;
              display:flex;align-items:center;gap:12px;
            ">
              <div style="
                width:40px;height:40px;border-radius:50%;
                background:${s.unread ? 'linear-gradient(135deg,#10b981,#059669)' : '#1e2d4a'};
                display:flex;align-items:center;justify-content:center;
                font-size:18px;flex-shrink:0;
              ">💬</div>
              <div style="flex:1;overflow:hidden">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <div style="font-weight:700;color:#e5e7eb">${escHtml(s.username || 'Misafir')}</div>
                  <div style="color:#64748b;font-size:11px">${s.lastTs ? new Date(s.lastTs).toLocaleString('tr-TR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '?'}</div>
                </div>
                <div style="color:#94a3b8;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px">${escHtml(s.lastMsg || '')}</div>
                <div style="color:#64748b;font-size:10px;margin-top:2px">${s.email || 'E-posta yok'}</div>
              </div>
              ${s.unread ? '<div style="width:10px;height:10px;border-radius:50%;background:#10b981;flex-shrink:0"></div>' : ''}
            </div>
          `).join('')
        }
      </div>
    `;

    window.markAllSupportRead = async () => {
      const upd = {};
      sessionList.forEach(([sid]) => { upd['support/sessions/' + sid + '/unread'] = false; });
      await firebase.database().ref().update(upd);
      if (typeof window.toast === 'function') window.toast('✅ Tümü okundu', 'success');
      openSupportAdmin();
      updateSupportBadge();
    };

    window.openSupportSession = async (sid) => {
      const sessSnap = await firebase.database().ref('support/sessions/' + sid).once('value');
      const sess = sessSnap.val() || {};
      const msgsSnap = await firebase.database().ref('support/sessions/' + sid + '/messages').once('value');
      const msgs = msgsSnap.val() ? Object.values(msgsSnap.val()).sort((a,b) => (a.ts||0)-(b.ts||0)) : [];

      // Okundu işaretle
      await firebase.database().ref('support/sessions/' + sid + '/unread').set(false);

      const html = `
        <div style="max-width:560px">
          <!-- Kullanıcı bilgisi -->
          <div style="background:#1e2d4a;border:1px solid #1e3a8a;border-radius:12px;padding:12px;margin-bottom:14px">
            <div style="font-weight:700;color:#e5e7eb">${escHtml(sess.username || 'Misafir')}</div>
            <div style="color:#64748b;font-size:12px">${sess.email || 'E-posta yok'} · UID: ${(sess.uid||'?').slice(0,16)}...</div>
            <div style="color:#64748b;font-size:11px;margin-top:2px">Durum: <span style="color:${sess.status==='closed'?'#dc2626':'#10b981'}">${sess.status==='closed'?'Kapalı':'Açık'}</span></div>
          </div>

          <!-- Mesajlar -->
          <div style="background:#0f172a;border-radius:12px;padding:12px;margin-bottom:12px;max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
            ${msgs.map(m => `
              <div style="display:flex;flex-direction:column;align-items:${m.type==='user'?'flex-end':'flex-start'}">
                <div style="
                  background:${m.type==='user'?'linear-gradient(135deg,#1e3a8a,#1e5cb8)':'rgba(255,255,255,0.05)'};
                  border-radius:${m.type==='user'?'12px 12px 0 12px':'12px 12px 12px 0'};
                  padding:10px 12px;max-width:85%;
                ">
                  ${m.type!=='user'?`<div style="color:#10b981;font-size:10px;font-weight:700;margin-bottom:3px">🎮 ${escHtml(m.senderName||'Sistem')}</div>`:''}
                  <div style="color:#e5e7eb;font-size:13px">${escHtml(m.text||'')}</div>
                </div>
                <div style="color:#64748b;font-size:10px;margin-top:2px">${m.ts ? new Date(m.ts).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit'}) : ''}</div>
              </div>
            `).join('') || '<div style="color:#475569;text-align:center">Mesaj yok</div>'}
          </div>

          <!-- Admin cevap kutusu -->
          <div style="display:flex;gap:8px;margin-bottom:10px">
            <textarea id="adminReplyText" placeholder="Cevabını yaz..." rows="3" style="
              flex:1;background:#0f172a;border:1px solid #2d3748;color:#e5e7eb;
              border-radius:10px;padding:10px;font-size:13px;resize:none;font-family:inherit
            "></textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="sendAdminSupportReply('${sid}','${sess.uid||''}')" style="
              flex:1;padding:12px;background:#10b981;border:none;color:#fff;
              border-radius:10px;cursor:pointer;font-weight:700;font-size:13px
            ">📤 Cevap Gönder</button>
            <button onclick="closeSupportSession('${sid}')" style="
              padding:12px 16px;background:#dc262622;border:1px solid #dc262655;
              color:#dc2626;border-radius:10px;cursor:pointer;font-size:13px
            ">Kapat</button>
          </div>
        </div>
      `;

      if (typeof window.showModal === 'function') {
        window.showModal('💬 Destek Oturumu', html, true);
      }

      window.sendAdminSupportReply = async (sid, targetUid) => {
        const text = document.getElementById('adminReplyText')?.value?.trim();
        if (!text) return;
        const adminUser = firebase.auth().currentUser;
        await firebase.database().ref('support/sessions/' + sid + '/messages').push({
          text,
          senderUid: adminUser?.uid || 'admin',
          senderName: '⚡ Destek Ekibi',
          ts: firebase.database.ServerValue.TIMESTAMP,
          read: false,
          type: 'admin'
        });
        await firebase.database().ref('support/sessions/' + sid).update({
          lastMsg: text.slice(0, 100),
          lastTs: firebase.database.ServerValue.TIMESTAMP
        });
        if (targetUid) {
          await firebase.database().ref('notifs/' + targetUid).push({
            type: 'support_reply',
            icon: '💬',
            msg: '💬 Destek ekibinden cevap: ' + text.slice(0, 100),
            ts: firebase.database.ServerValue.TIMESTAMP,
            read: false
          });
        }
        if (typeof window.toast === 'function') window.toast('✅ Cevap gönderildi', 'success');
        if (typeof window.closeModal === 'function') window.closeModal();
        openSupportAdmin();
      };

      window.closeSupportSession = async (sid) => {
        await firebase.database().ref('support/sessions/' + sid + '/status').set('closed');
        if (typeof window.toast === 'function') window.toast('✅ Oturum kapatıldı', 'success');
        if (typeof window.closeModal === 'function') window.closeModal();
        openSupportAdmin();
      };
    };
  }

  /* ════════════════════════════════════════════════════════════════════
     4. GİRİŞ.JS HOOK — Kayıt sonrası doğrulama mailini yakala
     ════════════════════════════════════════════════════════════════════ */

  /**
   * Firebase auth'u izle — kayıt sonrası e-posta doğrulama düzeltmesi
   */
  function hookAuthForVerification() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) return;

      // Yeni kayıt oldu ve e-posta doğrulanmamış
      if (!user.emailVerified && user.email && !user.email.endsWith('@anon.gamezone.local')) {
        const dbVerified = await firebase.database().ref('users/' + user.uid + '/verified').once('value').then(s => s.val());
        if (!dbVerified) {
          // Oyun içinde uyarı banner göster (3 sn gecikmeli)
          setTimeout(() => showUnverifiedBanner(user), 3000);
        }
      }

      // URL'de ?verified=1 varsa işle
      handleVerificationReturn();
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     YARDIMCI
     ════════════════════════════════════════════════════════════════════ */
  function escHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     INIT
     ════════════════════════════════════════════════════════════════════ */
  function init() {
    // 1. Destek widget oluştur
    createSupportWidget();

    // 2. giris.js'in btnRegister butonunu yakala (post-register hook)
    const origBtn = document.getElementById('btnRegister');
    if (origBtn) {
      origBtn.addEventListener('click', async () => {
        // giris.js'in handleri çalışır, biz sadece sonucu izliyoruz
        await new Promise(r => setTimeout(r, 2000));
        const user = firebase.auth().currentUser;
        if (user && !user.emailVerified && user.email && !user.email.endsWith('@anon.gamezone.local')) {
          enrichVerifyScreen(user, user.email);
        }
      }, true); // capture = true (giris.js'den önce çalışmaz, sonra çalışır)
    }

    // 3. Auth hook
    if (typeof firebase !== 'undefined' && firebase.auth) {
      hookAuthForVerification();
    } else {
      document.addEventListener('firebaseReady', hookAuthForVerification);
    }

    // 4. Admin paneli hazır olunca destek sekmesi ekle
    const adminObserver = new MutationObserver(() => {
      if (document.querySelector('.admin-nav')) {
        injectSupportAdminTab();
      }
    });
    adminObserver.observe(document.body, { childList: true, subtree: true });

    // 5. Firebase realtime — yeni destek mesajı gelince badge güncelle
    try {
      firebase.database().ref('support/sessions')
        .orderByChild('unread').equalTo(true)
        .on('value', (snap) => {
          const count = snap.numChildren();
          const badge = document.getElementById('supportMsgBadge');
          if (badge) { badge.textContent = count; badge.style.display = count > 0 ? '' : 'none'; }
          // Destek toggle butonundaki unread
          const unread = document.getElementById('supportUnreadBadge');
          if (unread && !supportOpen) {
            unread.textContent = count;
            unread.style.display = count > 0 ? 'flex' : 'none';
          }
        });
    } catch(e) {}

    console.log('%c[GirisEklenti] ✅ E-posta doğrulama + Canlı Destek yüklendi', 'color:#10b981;font-weight:700');
  }

  // DOM + Firebase hazır olunca başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }

  // Public API
  window.GirisEklenti = {
    sendVerificationEmail,
    openLiveSupport: window.toggleLiveSupport,
    handleVerificationReturn,
    enrichVerifyScreen
  };

})();
