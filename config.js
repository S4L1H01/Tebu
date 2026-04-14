// [cite: 2026-04-12]
const TABU_KUTUPHANESI = {
    // Karta çevrilmiş kelimeler buraya yüklenecek
    // Format: { 'GENEL': [{ word: '...', forbidden: [...] }], 'SPOR': [...] }
};

// parser.js (Bu kısmı daha sonra detaylandıracağız, kelimeler.txt'yi nesneye çevirecek)
async function loadAndParseWords() {
    try {
        const response = await fetch('kelimeler.txt'); // Vercel'deki dosya yolu
        const text = await response.text();
        const lines = text.split('\n');
        
        let currentTheme = 'GENEL';
        TABU_KUTUPHANESI[currentTheme] = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if(!line) continue;

            // Tema Kontrolü (Sende "GENEL:", "SPOR:" gibi)
            if (line.includes(':')) {
                currentTheme = line.replace(':', '').trim();
                TABU_KUTUPHANESI[currentTheme] = [];
                continue;
            }

            // CAPS LOCK Kontrolü (Hayal gücümü kullandım)
            // Eğer satır tamamen büyük harfse ve tema adı değilse, bu ANA KELİME'dir.
            if (line === line.toUpperCase() && !TABU_KUTUPHANESI[line]) {
                const card = {
                    word: line,
                    forbidden: []
                };
                // Sonraki 5 satırı yasaklı kelime olarak al
                for (let j = 1; j <= 5; j++) {
                    if (lines[i + j]) card.forbidden.push(lines[i + j].trim());
                }
                TABU_KUTUPHANESI[currentTheme].push(card);
                i += 5; // 5 satır atla
            }
        }
        console.log("Kelimeler yüklendi:", TABU_KUTUPHANESI);
        // UI'daki tema seçim kutusunu doldur
        ui.populateThemes();
    } catch (e) {
        console.error("Kelime dosyası yüklenemedi:", e);
    }
}