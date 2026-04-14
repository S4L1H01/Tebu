// [cite: 2026-04-14]
const DISCORD_CLIENT_ID = "1493662242862923806";
const discordSdk = new window.DiscordSDK.DiscordSDK(DISCORD_CLIENT_ID);

async function startDiscord() {
    try {
        await discordSdk.ready();
        await discordSdk.commands.authorize({
            client_id: DISCORD_CLIENT_ID,
            response_type: "code",
            scope: ["identify"],
            prompt: "none"
        });
        console.log("✅ Discord SDK Hazır");
    } catch (e) {
        console.log("ℹ️ Web Modunda Çalışıyor");
    }
}
startDiscord();

// Kelime Kütüphanesi Buraya Gelecek (loadWords fonksiyonun)
const WORD_LIBRARY = {};
// ... (Yüklediğin dosyadaki loadWords içeriğini buraya ekleyebilirsin)