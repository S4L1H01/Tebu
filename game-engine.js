// [cite: 2026-04-14]
const game = {
    words: {},
    currentTheme: 'GENEL',
    currentCard: null,
    score: { A: 0, B: 0 },
    timer: 60,
    interval: null,

    async loadWords() {
        const res = await fetch('kelimeler.txt');
        const text = await res.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");
        
        let theme = "GENEL";
        lines.forEach((line, i) => {
            if (line.endsWith(':')) {
                theme = line.replace(':', '');
                this.words[theme] = [];
            } else if (line === line.toUpperCase()) {
                let card = { word: line, forbidden: [] };
                for(let j=1; j<=5; j++) if(lines[i+j]) card.forbidden.push(lines[i+j]);
                this.words[theme].push(card);
            }
        });
    },

    startTurn(team, role) {
        // Ekran değiştirme mantığı
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screenId = role === 'anlatici' ? `screen-narrator-${team.toLowerCase()}` : `screen-listener-${team.toLowerCase()}`;
        document.getElementById(screenId).classList.add('active');
        
        if (role === 'anlatici') this.nextCard();
    },

    nextCard() {
        const pool = this.words[this.currentTheme];
        this.currentCard = pool[Math.floor(Math.random() * pool.length)];
        
        document.getElementById('word-main').innerText = this.currentCard.word;
        const forbiddenDiv = document.getElementById('word-forbidden');
        forbiddenDiv.innerHTML = this.currentCard.forbidden.map(w => `<div>${w}</div>`).join('');
    }
};