// ============================================================
// TÜRK İMPARATORLUĞU — firebase.js
// Firebase Realtime Database kullanılıyor (Firestore değil)
// ============================================================
"use strict";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyB5pl78DRao2SmUWsMYMSZ6YbfX4rtRNdc",
  authDomain:        "gamezone-e11b0.firebaseapp.com",
  databaseURL:       "https://gamezone-e11b0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "gamezone-e11b0",
  storageBucket:     "gamezone-e11b0.firebasestorage.app",
  messagingSenderId: "775694460272",
  appId:             "1:775694460272:web:7e5fd5691df9d8399d5bb5",
  measurementId:     "G-3M7FXX8XR4"
};

window.fbApp  = null;
window.fbAuth = null;
window.fbDB   = null; // Realtime Database

function initFirebase() {
  try {
    window.fbApp  = (firebase.apps && firebase.apps.length)
      ? firebase.apps[0]
      : firebase.initializeApp(FIREBASE_CONFIG);
    window.fbAuth = firebase.auth();
    window.fbDB   = firebase.database(); // ← Realtime Database
    console.log("✅ Firebase (Realtime DB) hazır.");
  } catch (err) {
    console.error("Firebase init hatası:", err);
    alert("Sunucu bağlantısı kurulamadı. Sayfayı yenileyin.");
  }
}

// ════════════════════════════════════════════════════════════
// REALTİME DATABASE KURALLARI
// Firebase Console → Realtime Database → Rules → yapıştır
// ════════════════════════════════════════════════════════════
/*
{
  "rules": {
    "users": {
      "$uid": {
        ".read":  "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "leaderboard": {
      ".read":  "auth != null",
      ".write": "auth != null"
    },
    "announcements": {
      ".read":  "auth != null",
      ".write": "auth.uid === 'IEqctPKFy6bL5u9ew6kIm8W6CsF2'"
    },
    "promo_codes": {
      ".read":  "auth != null",
      ".write": "auth.uid === 'IEqctPKFy6bL5u9ew6kIm8W6CsF2'"
    }
  }
}
*/

// ════════════════════════════════════════════════════════════
// DB Yardımcıları — Realtime Database
// ════════════════════════════════════════════════════════════
var DB = {

  // Kullanıcı verisini getir
  getUser: function(uid) {
    return window.fbDB.ref("users/" + uid).once("value")
      .then(function(snap) {
        return snap.exists() ? snap.val() : null;
      })
      .catch(function(e) {
        console.error("DB.getUser hatası:", e.code, e.message);
        return null;
      });
  },

  // Kullanıcı verisini kaydet
  saveUser: function(uid, data) {
    // Rate limit — çok sık kaydetme
    if (typeof SEC !== "undefined" && !SEC.canSave()) return Promise.resolve(true);

    // Firestore özel alanlarını temizle
    var clean = JSON.parse(JSON.stringify(data));
    clean._savedAt = Date.now();

    return window.fbDB.ref("users/" + uid).set(clean)
      .then(function() { return true; })
      .catch(function(e) {
        console.error("DB.saveUser hatası:", e.code, e.message);
        return false;
      });
  },

  // İşlem logu
  logTransaction: function(uid, tx) {
    tx._ts = Date.now();
    return window.fbDB.ref("users/" + uid + "/transactions").push(tx)
      .catch(function(e) { console.error("DB.logTransaction:", e.code); });
  },

  // Güvenlik log
  logSecurityEvent: function(uid, reason) {
    return window.fbDB.ref("security_log").push({
      uid: uid, reason: reason,
      ua: navigator.userAgent, ts: Date.now()
    }).catch(function() {});
  },

  // Liderlik tablosu için veri yaz
  updateLeaderboard: function(uid, name, tl, level) {
    return window.fbDB.ref("leaderboard/" + uid).set({
      name: name, tl: tl, level: level, ts: Date.now()
    }).catch(function() {});
  },

  // Liderlik tablosunu getir
  getLeaderboard: function() {
    return window.fbDB.ref("leaderboard").orderByChild("tl").limitToLast(50).once("value")
      .then(function(snap) {
        var list = [];
        snap.forEach(function(child) { list.unshift(Object.assign({ uid: child.key }, child.val())); });
        return list;
      })
      .catch(function() { return []; });
  },

  // Duyuru getir
  getAnnouncement: function() {
    return window.fbDB.ref("announcements/current").once("value")
      .then(function(snap) { return snap.val(); })
      .catch(function() { return null; });
  }
};
