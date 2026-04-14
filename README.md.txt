# 🛑 TABU ULTRA - Kurulum Rehberi

## 1. Firebase Kurulumu (ÜCRETSİZ)

1. https://console.firebase.google.com adresine git
2. "Add project" → proje adı: `tabu-ultra`
3. Sol menü → **Realtime Database** → "Create database"
   - Location: `europe-west1` (Türkiye'ye yakın)
   - Start in **test mode** (şimdilik, sonra güvenlik kuralları ekle)
4. Sol menü → **Project Settings** → "Your apps" → Web app ekle
5. Verilen config'i kopyala, `config.js` dosyasındaki `FIREBASE_CONFIG` nesnesine yapıştır:

```js
const FIREBASE_CONFIG = {
    apiKey: "AIzaSy...",
    authDomain: "tabu-ultra.firebaseapp.com",
    databaseURL: "https://tabu-ultra-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tabu-ultra",
    storageBucket: "tabu-ultra.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};
```

## 2. Vercel Deploy

1. https://vercel.com → "New Project"
2. GitHub'a push yap veya dosyaları direkt sürükle
3. "Deploy" tıkla → URL alırsın: `tabu-ultra.vercel.app`

## 3. Discord Activity Kurulumu

1. https://discord.com/developers/applications → uygulamanı seç (ID: 1493662242862923806)
2. Sol menü → **Activities**
3. Root URL: `https://SENIN-VERCEL-URL.vercel.app`
4. URL Mapping ekle: `/` → `https://SENIN-VERCEL-URL.vercel.app`

## 4. Firebase Güvenlik Kuralları (deploy sonrası)

Realtime Database → Rules:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## Ekran Koordinatları (Bilgi Amaçlı)

### bg-login.png
- İsim input kutusu: top 62%, height 15%, left 13%, width 74%
- Oluştur butonu: top 86%, height 7%, left 26%, width 48%

### bg-lobby.png  
- Kırmızı header: top 24%, h 7%, left 7%, w 36%
- Mavi header: top 24%, h 7%, left 53%, w 40%
- Sol takım kutusu: top 32%, h 55%, left 4%, w 43%
- Sağ takım kutusu: top 32%, h 55%, left 53%, w 43%
- Tema oval: top 90%, h 8%, left 4%, w 20%
- BAŞLAT butonu: top 90%, h 8%, left 28%, w 44%
- Süre oval: top 90%, h 8%, left 76%, w 20%

### bg-narrator-a/b.png
- Ana kelime kutusu: top 22%, h 13%, left 9%, w 82%
- Yasaklı kelimeler (5 slot): top 44-90%, left 9%, w 82%

### bg-listener-a/b.png
- Tahmin alanı: top 64%, h 13%, left 13%, w 74%
- ONAY butonu: top 80%, h 8%, left 31%, w 38%