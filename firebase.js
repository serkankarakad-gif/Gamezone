// ============================================================
// TÜRK İMPARATORLUĞU — firebase.js
// Firebase başlatma + Güvenli DB yardımcıları
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
window.fbDB   = null;

function initFirebase() {
  try {
    window.fbApp  = (firebase.apps && firebase.apps.length)
      ? firebase.apps[0]
      : firebase.initializeApp(FIREBASE_CONFIG);
    window.fbAuth = firebase.auth();
    window.fbDB   = firebase.firestore();

    // Offline önbellek (opsiyonel, hata verirse devam et)
    window.fbDB.enablePersistence({ synchronizeTabs: false }).catch(function() {});

    console.log("✅ Firebase hazır.");
  } catch (err) {
    console.error("Firebase init hatası:", err);
    alert("Sunucu bağlantısı kurulamadı. Sayfayı yenileyin.");
  }
}

// ════════════════════════════════════════════════════════════
// FİRESTORE GÜVENLİK KURALLARI
// Firebase Console → Firestore → Rules → yapıştır → Publish
// ════════════════════════════════════════════════════════════
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /security_log/{doc} {
      allow read:  if false;
      allow write: if request.auth != null;
    }

    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;

      match /transactions/{txId} {
        allow read:   if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update, delete: if false;
      }
    }

    match /marketplace/{id} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.sellerId == request.auth.uid;
      allow update, delete: if request.auth != null
                    && resource.data.sellerId == request.auth.uid;
    }
  }
}
*/

// ════════════════════════════════════════════════════════════
// DB Yardımcıları
// ════════════════════════════════════════════════════════════
var DB = {

  // Kullanıcı verisini getir
  async getUser(uid) {
    try {
      var snap = await window.fbDB.collection("users").doc(uid).get();
      return snap.exists ? snap.data() : null;
    } catch (e) {
      console.error("DB.getUser hatası:", e.code, e.message);
      return null;
    }
  },

  // Kullanıcı verisini kaydet — ASLA kullanıcıyı atmaz
  async saveUser(uid, data) {
    // Rate limit — 4 saniyede bir max 1 kayıt
    if (typeof SEC !== "undefined" && !SEC.canSave()) return true;

    try {
      await window.fbDB.collection("users").doc(uid).set(
        Object.assign({}, data, {
          _updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }),
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error("DB.saveUser hatası:", e.code, e.message);
      // Hata olursa sadece logla, kullanıcıya dokunma
      return false;
    }
  },

  // İşlem geçmişi ekle
  async logTransaction(uid, tx) {
    try {
      await window.fbDB.collection("users").doc(uid)
        .collection("transactions").add(
          Object.assign({}, tx, {
            _ts: firebase.firestore.FieldValue.serverTimestamp()
          })
        );
    } catch (e) {
      console.error("DB.logTransaction:", e.code);
    }
  },

  // İşlem geçmişini getir
  async getTransactions(uid, lim) {
    try {
      var snap = await window.fbDB.collection("users").doc(uid)
        .collection("transactions")
        .orderBy("_ts", "desc")
        .limit(lim || 30)
        .get();
      return snap.docs.map(function(d) {
        return Object.assign({ id: d.id }, d.data());
      });
    } catch (e) {
      console.error("DB.getTransactions:", e.code);
      return [];
    }
  },

  // Güvenlik olayı logla
  async logSecurityEvent(uid, reason) {
    try {
      await window.fbDB.collection("security_log").add({
        uid:    uid,
        reason: reason,
        ua:     navigator.userAgent,
        ts:     firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) { /* sessiz */ }
  },

  // Oyuncu pazarına ilan ekle
  async addListing(data) {
    try {
      var ref = await window.fbDB.collection("marketplace").add(
        Object.assign({}, data, {
          _createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          active: true
        })
      );
      return ref.id;
    } catch (e) {
      console.error("DB.addListing:", e.message);
      return null;
    }
  },

  // Aktif ilanları getir
  async getListings(lim) {
    try {
      var snap = await window.fbDB.collection("marketplace")
        .where("active", "==", true)
        .orderBy("_createdAt", "desc")
        .limit(lim || 50)
        .get();
      return snap.docs.map(function(d) {
        return Object.assign({ id: d.id }, d.data());
      });
    } catch (e) {
      console.error("DB.getListings:", e.code);
      return [];
    }
  }
};
