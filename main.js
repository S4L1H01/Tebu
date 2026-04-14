// [cite: 2026-04-14]
window.onload = async () => {
    // 1. Kelimeleri dosyasından oku (36k karakterlik dev kütüphane)
    await loadAndParseWords(); 
    
    // 2. Link kontrolü yap
    net.init();
    
    // 3. Giriş ve Lobi butonlarını bağla
    document.getElementById('btn-create').onclick = () => net.createRoom();
    
    // 4. Lider ve giriş mekaniğini kur
    engine.setupInput();
};