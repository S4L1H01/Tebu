// [cite: 2026-04-14]
const engine = {
    currentCard: null,
    scoreA: 0,
    scoreB: 0,
    currentTurn: 'A', // Başlangıç takımı
    isLeader: false,

    // Sadece Dinleyici Lideri'nin klavyesi çalışır
    setupInput() {
        const input = document.getElementById('tahmin-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.isLeader) {
                this.checkGuess(input.value);
                input.value = '';
            }
        });
    },

    checkGuess(val) {
        if (!this.currentCard) return;
        
        // Küçük/Büyük harf ve boşluk duyarlılığını kaldır
        const guess = val.trim().toLowerCase();
        const correct = this.currentCard.word.toLowerCase();

        if (guess === correct) {
            this.handleCorrect();
        }
    },

    handleCorrect() {
        if (this.currentTurn === 'A') this.scoreA++;
        else this.scoreB++;
        
        this.playSfx('correct');
        this.nextCard();
        this.syncScores();
    },

    handleWrong() {
        // Tabu butonu sadece Anlatıcıda çalışır
        if (this.currentTurn === 'A') this.scoreA--;
        else this.scoreB--;
        
        this.playSfx('tabu');
        this.nextCard();
        this.syncScores();
    }
};