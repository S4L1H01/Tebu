// [cite: 2026-04-14]
const FIREBASE_CONFIG = {
    apiKey: "AIzaSy...", // Buraya kendi Firebase keyini koy
    databaseURL: "https://tabu-ultra-default-rtdb.firebaseio.com"
};

const NET = {
    isDiscord: false,
    db: null,
    roomRef: null,
    myId: null,

    async init() {
        // Firebase Başlat
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();

        // Cihaz bazlı benzersiz ID
        this.myId = localStorage.getItem('tabu_uid') || Math.random().toString(36).substring(2, 10);
        localStorage.setItem('tabu_uid', this.myId);

        // Discord Kontrolü
        this.isDiscord = window.location.href.includes("discord");
        
        const params = new URLSearchParams(window.location.search);
        const roomCode = params.get('room');

        if (roomCode) {
            this.joinRoom(roomCode);
        }
    },

    createRoom() {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        window.location.search = `?room=${code}`;
    },

    joinRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);
        this.roomRef.on('value', snap => {
            if (snap.exists()) ENGINE.updateUI(snap.val());
        });
        document.getElementById('screen-login').classList.remove('active');
        document.getElementById('screen-lobby').classList.add('active');
    }
};
NET.init();