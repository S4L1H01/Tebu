// [cite: 2026-04-14]
const state = {
    role: null, // 'anlatici' | 'dinleyici'
    isLeader: false,
    team: null, // 'A' | 'B'
    roomCode: null
};

// Oylama/Lider Seçimi Mekaniği
function claimLeader(team) {
    // Burada "Takım Lideri Seçiliyor" mesajı çıkar
    state.isLeader = true;
    state.team = team;
    alert(team + " Takımı Lideri Oldun! Sadece senin yazdıkların puan kazandırır.");
    
    // UI Güncelle
    document.getElementById('leader-input-container').style.display = 'block';
}

// Kelime İşleme (Parser)
async function initGameData() {
    const res = await fetch('kelimeler.txt');
    const data = await res.text();
    // 36k karakterlik veriyi burada split edip state'e atıyoruz...
}

// Sıra Değişimi ve Görsel Geçiş
function switchTurn(toTeam) {
    const screens = ['screen-narrator-a', 'screen-narrator-b', 'screen-listener-a', 'screen-listener-b'];
    screens.forEach(s => document.getElementById(s).classList.remove('active'));
    
    // Anlatıcı mı Dinleyici mi kontrolü
    if(state.team === toTeam && state.role === 'anlatici') {
        document.getElementById(`screen-narrator-${toTeam.toLowerCase()}`).classList.add('active');
    } else {
        document.getElementById(`screen-listener-${toTeam.toLowerCase()}`).classList.add('active');
    }
}