// ============================================================
// engine.js - Tabu Ultra Oyun Motoru
// Tüm oyun mantığı, UI güncellemeleri ve state yönetimi
// ============================================================

// ─────────────────────────────────────────────────────────────
// UI YARDIMCI FONKSİYONLARI
// ─────────────────────────────────────────────────────────────
const UI = {
    currentScreen: 'login',

    showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById('screen-' + name);
        if (target) {
            target.classList.add('active');
            this.currentScreen = name;
        }
    },

    updateRoomLink(code) {
        const el = document.getElementById('room-link-display');
        if (!el) return;
        if (NET.isDiscord) {
            el.textContent = '🎮 Discord Etkinliği • Oda: ' + code;
        } else {
            const url = window.location.origin + window.location.pathname + '?room=' + code;
            el.textContent = '🔗 ' + url;
            el.title = 'Kopyala: ' + url;
            el.onclick = () => { navigator.clipboard?.writeText(url); el.textContent = '✅ Kopyalandı!'; setTimeout(() => el.textContent = '🔗 ' + url, 2000); };
        }
    },

    showFlash(type) {
        const el = document.getElementById('flash-overlay');
        el.className = 'flash-overlay flash-' + type;
        const texts = { correct: '✓ DOĞRU!', tabu: '🚫 TABU!', pass: '→ PAS' };
        el.textContent = texts[type] || '';
        setTimeout(() => el.className = 'flash-overlay hidden', 700);
    },

    updateScores(scores) {
        const text = `MAVİ: ${scores.blue} | KIRMIZI: ${scores.red}`;
        ['score-display-a','score-display-b','score-display-la','score-display-lb'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
        document.getElementById('blue-team-score').textContent = `MAVİ: ${scores.blue}`;
        document.getElementById('red-team-score').textContent = `KIRMIZI: ${scores.red}`;
    },

    updateLobby(roomData, myId) {
        const players = roomData.players || {};
        
        // Anlatıcı alanlarını temizle
        const redNarrator = document.getElementById('red-narrator-area');
        const blueNarrator = document.getElementById('blue-narrator-area');
        const redListeners = document.getElementById('red-listeners-area');
        const blueListeners = document.getElementById('blue-listeners-area');

        redNarrator.innerHTML = '<span class="slot-hint">Tıkla → Anlatıcı Ol</span>';
        blueNarrator.innerHTML = '<span class="slot-hint">Tıkla → Anlatıcı Ol</span>';
        redListeners.innerHTML = '<span class="slot-hint">Tıkla → Dinleyici Ol</span>';
        blueListeners.innerHTML = '<span class="slot-hint">Tıkla → Dinleyici Ol</span>';

        Object.entries(players).forEach(([pid, p]) => {
            if (!p || !p.team) return;
            const isMe = pid === myId;
            const tag = document.createElement('div');
            tag.className = 'player-tag' + (isMe ? ' is-me' : '') + (p.isLeader ? ' is-leader' : '');
            tag.textContent = p.name + (p.isLeader ? ' 👑' : '');

            if (p.team === 'red') {
                if (p.role === 'narrator') redNarrator.appendChild(tag);
                else redListeners.appendChild(tag);
            } else {
                if (p.role === 'narrator') blueNarrator.appendChild(tag);
                else blueListeners.appendChild(tag);
            }
        });

        // Tema ve süre etiketlerini güncelle
        document.getElementById('theme-label').textContent = roomData.theme || 'GENEL';
        document.getElementById('time-label').textContent = (roomData.turnTime || 60) + 's';
    },

    showCard(team, card) {
        const prefix = team === 'blue' ? 'a' : 'b';
        const wordEl = document.getElementById(`narrator-${prefix}-word`);
        const forbBox = document.getElementById(`narrator-${prefix}-forbidden`);
        
        if (wordEl) wordEl.textContent = card.word;
        if (forbBox) {
            const slots = forbBox.querySelectorAll('.forb-slot');
            card.forbidden.forEach((f, i) => {
                if (slots[i]) slots[i].textContent = f;
            });
        }
    },

    setTimer(seconds, team) {
        const timerIds = team === 'blue' 
            ? ['timer-a', 'listener-timer-a'] 
            : ['timer-b', 'listener-timer-b'];
        
        timerIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = seconds;
            el.classList.toggle('urgent', seconds <= 10);
        });
    },

    showTurnEnd(scores, nextTeam) {
        const overlay = document.getElementById('turn-end-overlay');
        overlay.classList.remove('hidden');
        document.getElementById('turn-end-title').textContent = 'TUR BİTTİ!';
        document.getElementById('turn-end-scores').innerHTML = 
            `🔵 MAVİ: ${scores.blue} puan<br>🔴 KIRMIZI: ${scores.red} puan<br><br>Sıra: ${nextTeam === 'blue' ? '🔵 MAVİ' : '🔴 KIRMIZI'} Takımında`;
    },

    hideTurnEnd() {
        document.getElementById('turn-end-overlay').classList.add('hidden');
    },

    showGameEnd(winner, scores) {
        document.getElementById('game-end-overlay').classList.remove('hidden');
        const titles = { blue: '🔵 MAVİ TAKIM', red: '🔴 KIRMIZI TAKIM', tie: '🤝 BERABERE' };
        document.getElementById('game-end-winner').textContent = (titles[winner] || winner) + ' KAZANDI!';
        document.getElementById('game-end-scores').innerHTML = 
            `🔵 MAVİ: ${scores.blue} puan<br>🔴 KIRMIZI: ${scores.red} puan`;
    },

    updateGuessDisplay(team, text) {
        const suffix = team === 'blue' ? 'a' : 'b';
        const display = document.getElementById(`listener-${suffix}-guess-display`);
        if (display) display.textContent = text || 'Dinle ve sesli tahmin et...';
    }
};

// ─────────────────────────────────────────────────────────────
// ANA OYUN MOTORU
// ─────────────────────────────────────────────────────────────
const ENGINE = {
    roomData: null,
    timerInterval: null,
    localMode: false,

    // ─────────────────────────────────────────
    // BAŞLATMA
    // ─────────────────────────────────────────
    async start() {
        await loadWords();
        await NET.init();

        // Discord + pending room var mı?
        if (NET._pendingRoom) {
            if (!sessionStorage.getItem('tabu_name')) {
                UI.showScreen('login');
            } else {
                NET.joinRoom(NET._pendingRoom);
            }
        }
    },

    // ─────────────────────────────────────────
    // ROOM UPDATE (Firebase'den gelen her değişiklik)
    // ─────────────────────────────────────────
    onRoomUpdate(data) {
        if (!data) return;
        this.roomData = data;
        const myId = NET.getMyId();
        const me = data.players?.[myId];
        const scores = data.scores || { blue: 0, red: 0 };

        UI.updateScores(scores);

        // State'e göre ekranı belirle
        switch (data.state) {
            case 'lobby':
                UI.updateLobby(data, myId);
                if (UI.currentScreen !== 'lobby') UI.showScreen('lobby');
                this._stopTimer();
                break;

            case 'playing':
                this._handlePlayingState(data, me, myId);
                break;

            case 'turn-end':
                this._stopTimer();
                const nextTeam = data.currentTeam === 'blue' ? 'red' : 'blue';
                UI.showTurnEnd(scores, nextTeam);
                break;

            case 'game-end':
                this._stopTimer();
                const winner = scores.blue > scores.red ? 'blue' 
                             : scores.red > scores.blue ? 'red' : 'tie';
                UI.showGameEnd(winner, scores);
                break;
        }
    },

    _handlePlayingState(data, me, myId) {
        UI.hideTurnEnd();
        const currentCard = data.currentCard;
        
        if (currentCard) {
            UI.showCard(data.currentTeam, currentCard);
        }

        // Tahmin göstergesini güncelle
        if (data.lastGuess) {
            UI.updateGuessDisplay(data.currentTeam, data.lastGuess);
        }

        // Hangi ekranı göstereceğimizi belirle
        if (!me || !me.team) return;

        const isMyTeamTurn = me.team === data.currentTeam;
        const isNarrator = me.role === 'narrator';

        if (isMyTeamTurn && isNarrator) {
            UI.showScreen('narrator-' + (data.currentTeam === 'blue' ? 'a' : 'b'));
        } else if (isMyTeamTurn && !isNarrator) {
            // Dinleyici ekranı
            const suffix = data.currentTeam === 'blue' ? 'a' : 'b';
            UI.showScreen('listener-' + suffix);
            
            // Lider kontrolü
            const isLeader = me.isLeader;
            const inputEl = document.getElementById(`listener-${suffix}-guess-input`);
            const displayEl = document.getElementById(`listener-${suffix}-guess-display`);
            const onayBtn = document.getElementById(`listener-${suffix}-onay-btn`);
            const leaderBtn = document.getElementById(`listener-${suffix}-leader-btn`);

            if (inputEl) inputEl.style.display = isLeader ? 'block' : 'none';
            if (displayEl) displayEl.style.display = isLeader ? 'none' : 'flex';
            if (onayBtn) onayBtn.style.display = isLeader ? 'flex' : 'none';
            if (leaderBtn) leaderBtn.style.display = isLeader ? 'none' : 'flex';
        } else {
            // Rakip takımın turu - izleme ekranı (listener kendi takımı bg ile)
            const myTeamSuffix = me.team === 'blue' ? 'a' : 'b';
            UI.showScreen('listener-' + myTeamSuffix);
            
            // Rakip takım turundayken input'ları gizle
            const suffix = me.team === 'blue' ? 'a' : 'b';
            const inputEl = document.getElementById(`listener-${suffix}-guess-input`);
            const displayEl = document.getElementById(`listener-${suffix}-guess-display`);
            const onayBtn = document.getElementById(`listener-${suffix}-onay-btn`);
            const leaderBtn = document.getElementById(`listener-${suffix}-leader-btn`);
            
            if (inputEl) inputEl.style.display = 'none';
            if (displayEl) {
                displayEl.style.display = 'flex';
                displayEl.textContent = '⏳ Rakip takım anlatıyor...';
            }
            if (onayBtn) onayBtn.style.display = 'none';
            if (leaderBtn) leaderBtn.style.display = 'none';
        }

        // Timer başlat
        if (data.timerStart && !this.timerInterval) {
            this._startTimer(data.timerStart, data.turnTime || 60, data.currentTeam);
        }
    },

    // ─────────────────────────────────────────
    // TIMER
    // ─────────────────────────────────────────
    _startTimer(startTimestamp, duration, team) {
        this._stopTimer();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
            const remaining = Math.max(0, duration - elapsed);
            UI.setTimer(remaining, team);
            if (remaining <= 0) {
                this._stopTimer();
                // Sadece oda sahibi tur bitişini tetikler
                if (this._isRoomCreator()) {
                    NET.updateRoom({ state: 'turn-end' });
                }
            }
        }, 250);
    },

    _stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    _isRoomCreator() {
        const myId = NET.getMyId();
        const players = this.roomData?.players || {};
        return players[myId]?.isCreator === true;
    },

    // ─────────────────────────────────────────
    // OYUN BAŞLATMA
    // ─────────────────────────────────────────
    startGame() {
        const data = this.roomData;
        if (!data) return;

        const players = data.players || {};
        const theme = data.theme || 'GENEL';
        
        // Validasyon
        const redNarrator = Object.values(players).find(p => p.team === 'red' && p.role === 'narrator');
        const blueNarrator = Object.values(players).find(p => p.team === 'blue' && p.role === 'narrator');
        
        if (!redNarrator || !blueNarrator) {
            alert('Her takımda en az 1 anlatıcı olmalı!');
            return;
        }

        const card = getRandomCard(theme, 'blue');
        resetUsedCards();

        NET.updateRoom({
            state: 'playing',
            currentTeam: 'blue',
            currentCard: card,
            round: 1,
            scores: { blue: 0, red: 0 },
            timerStart: Date.now(),
            lastGuess: '',
            lastGuessResult: null
        });
    },

    // ─────────────────────────────────────────
    // KART İŞLEMLERİ
    // ─────────────────────────────────────────
    reportTabu(team) {
        const data = this.roomData;
        if (!data) return;
        
        UI.showFlash('tabu');
        const scores = { ...data.scores };
        scores[team] = Math.max(0, (scores[team] || 0) - 1);
        
        const card = getRandomCard(data.theme || 'GENEL', team);
        NET.updateRoom({
            scores,
            currentCard: card,
            lastGuess: '',
            timerStart: data.timerStart // Timer sıfırlanmaz, devam eder
        });
    },

    passCard(team) {
        const data = this.roomData;
        if (!data) return;
        
        UI.showFlash('pass');
        const card = getRandomCard(data.theme || 'GENEL', team);
        NET.updateRoom({
            currentCard: card,
            lastGuess: ''
        });
    },

    submitGuess(team) {
        const suffix = team === 'blue' ? 'a' : 'b';
        const input = document.getElementById(`listener-${suffix}-guess-input`);
        if (!input) return;
        
        const guess = input.value.trim().toUpperCase();
        if (!guess) return;
        
        const data = this.roomData;
        const correctWord = data?.currentCard?.word?.toUpperCase();

        // Tahminı herkese göster
        NET.updateRoom({ lastGuess: guess });

        // Doğru mu?
        if (correctWord && (guess === correctWord || 
            guess.includes(correctWord) || correctWord.includes(guess))) {
            UI.showFlash('correct');
            const scores = { ...data.scores };
            scores[team] = (scores[team] || 0) + 1;
            const nextCard = getRandomCard(data.theme || 'GENEL', team);
            NET.updateRoom({
                scores,
                currentCard: nextCard,
                lastGuess: '✓ ' + guess,
                timerStart: data.timerStart
            });
        }
        
        input.value = '';
    },

    // ─────────────────────────────────────────
    // SIRA/TUR YÖNETİMİ
    // ─────────────────────────────────────────
    nextTurn() {
        const data = this.roomData;
        if (!data) return;

        UI.hideTurnEnd();
        
        const nextTeam = data.currentTeam === 'blue' ? 'red' : 'blue';
        const currentRound = data.round || 1;
        const maxRounds = data.maxRounds || GAME_CONFIG.maxRoundsPerTeam;

        // Tur sayısını güncelle (her iki takım oynadıktan sonra round artar)
        const newRound = nextTeam === 'blue' ? currentRound + 1 : currentRound;

        if (newRound > maxRounds && nextTeam === 'blue') {
            // Oyun bitti
            NET.updateRoom({ state: 'game-end' });
            return;
        }

        const card = getRandomCard(data.theme || 'GENEL', nextTeam);
        NET.updateRoom({
            state: 'playing',
            currentTeam: nextTeam,
            currentCard: card,
            round: newRound,
            timerStart: Date.now(),
            lastGuess: ''
        });
    },

    resetToLobby() {
        document.getElementById('game-end-overlay').classList.add('hidden');
        resetUsedCards();
        NET.updateRoom({
            state: 'lobby',
            scores: { blue: 0, red: 0 },
            round: 1,
            currentCard: null,
            lastGuess: ''
        });
    }
};

// ─────────────────────────────────────────────────────────────
// GLOBAL FONKSİYONLAR (HTML onclick="..." için)
// ─────────────────────────────────────────────────────────────

// Login ekranı
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-create-room');
    if (btn) {
        btn.addEventListener('click', () => {
            const input = document.getElementById('login-name-input');
            const name = input?.value?.trim();
            if (!name) { input?.classList.add('shake'); setTimeout(() => input?.classList.remove('shake'), 300); return; }
            
            if (NET._pendingRoom) {
                NET.joinRoom(NET._pendingRoom, name);
            } else {
                NET.createRoom(name);
            }
        });
    }

    // Enter tuşu
    const nameInput = document.getElementById('login-name-input');
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('btn-create-room')?.click();
        });
    }

    // Oyunu başlat
    ENGINE.start();
});

// Lobi: takıma katıl
function joinRole(team, role) {
    const myId = NET.getMyId();
    const data = ENGINE.roomData;
    if (!data) return;
    
    const players = data.players || {};
    
    // Narrator için tek kişi kontrolü
    if (role === 'narrator') {
        const existingNarrator = Object.entries(players)
            .find(([pid, p]) => p.team === team && p.role === 'narrator' && pid !== myId);
        if (existingNarrator) {
            alert(`${team === 'blue' ? 'Mavi' : 'Kırmızı'} takımın anlatıcısı zaten var!`);
            return;
        }
    }
    
    NET.updatePlayer({ team, role, isLeader: false });
}

// Lobi: tema döngüsü
function cycleTheme() {
    if (!ENGINE._isRoomCreator()) { alert('Sadece oda kurucusu tema seçebilir!'); return; }
    const themes = Object.keys(WORD_LIBRARY);
    if (!themes.length) return;
    const current = ENGINE.roomData?.theme || 'GENEL';
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];
    NET.updateRoom({ theme: next });
}

// Lobi: süre döngüsü
function cycleTime() {
    if (!ENGINE._isRoomCreator()) { alert('Sadece oda kurucusu süre seçebilir!'); return; }
    const times = GAME_CONFIG.timeOptions;
    const current = ENGINE.roomData?.turnTime || 60;
    const idx = times.indexOf(current);
    const next = times[(idx + 1) % times.length];
    NET.updateRoom({ turnTime: next });
}

// Lobi: oyunu başlat
function startGame() {
    if (!ENGINE._isRoomCreator()) { alert('Sadece oda kurucusu oyunu başlatabilir!'); return; }
    ENGINE.startGame();
}

// Anlatıcı: tabu bildir
function reportTabu(team) { ENGINE.reportTabu(team); }

// Anlatıcı: pas geç
function passCard(team) { ENGINE.passCard(team); }

// Dinleyici: lider ol
function claimLeader(team) {
    const myId = NET.getMyId();
    const data = ENGINE.roomData;
    const players = data?.players || {};
    
    // Zaten başka lider var mı?
    const existingLeader = Object.entries(players)
        .find(([pid, p]) => p.team === team && p.isLeader && pid !== myId);
    
    if (existingLeader) {
        alert(`${team === 'blue' ? 'Mavi' : 'Kırmızı'} takımın zaten bir lideri var: ${existingLeader[1].name}`);
        return;
    }
    
    NET.updatePlayer({ isLeader: true });
    
    const suffix = team === 'blue' ? 'a' : 'b';
    document.getElementById(`listener-${suffix}-leader-btn`).style.display = 'none';
    document.getElementById(`listener-${suffix}-guess-input`).style.display = 'block';
    document.getElementById(`listener-${suffix}-guess-display`).style.display = 'none';
    document.getElementById(`listener-${suffix}-onay-btn`).style.display = 'flex';
}

// Dinleyici: tahmin gönder
function submitGuess(team) { ENGINE.submitGuess(team); }

// Tur bitişi: sırayı devret
function nextTurn() {
    if (!ENGINE._isRoomCreator()) { alert('Sadece oda kurucusu sırayı devredebilir!'); return; }
    ENGINE.nextTurn();
}

// Oyun bitişi: lobiye dön
function resetToLobby() { ENGINE.resetToLobby(); }