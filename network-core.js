// [cite: 2026-04-14]
const FIREBASE_CONFIG = {
    apiKey: "BURAYA_KENDI_KEYINI_YAPISTIR", 
    databaseURL: "https://tabu-ultra-default-rtdb.firebaseio.com"
};

const NET = {
    isDiscord: false, db: null, roomRef: null, myId: null,
    async init() {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();
        this.myId = localStorage.getItem('tabu_uid') || Math.random().toString(36).substring(2, 10);
        localStorage.setItem('tabu_uid', this.myId);
        
        this.isDiscord = window.location.href.includes("discord");
        const params = new URLSearchParams(window.location.search);
        if (params.get('room')) this.joinRoom(params.get('room'));
    },
    createRoom() {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        window.location.search = `?room=${code}`;
    },
    joinRoom(code) {
        this.roomRef = this.db.ref('rooms/' + code);
        this.roomRef.on('value', snap => { if(snap.exists()) ENGINE.update(snap.val()); });
        document.getElementById('screen-login').classList.remove('active');
        document.getElementById('screen-lobby').classList.add('active');
    }
};
NET.init();