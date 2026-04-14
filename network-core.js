// [cite: 2026-04-14]
const net = {
    roomCode: null,

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('room');
        
        if (code) {
            this.roomCode = code;
            ui.showScreen('screen-login'); // Linkle gelmişse direkt isim ekranı
            document.getElementById('join-panel').classList.remove('hidden');
            document.getElementById('join-code').value = code;
        }
    },

    createRoom() {
        const name = document.getElementById('username').value;
        if (!name) return alert("İsimsiz kahraman olmaz!");

        this.roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        const newUrl = window.location.origin + "?room=" + this.roomCode;
        
        window.history.pushState({}, '', newUrl); // URL'yi güncelle
        document.getElementById('share-link').value = newUrl;
        
        ui.showScreen('screen-lobby');
    }
};