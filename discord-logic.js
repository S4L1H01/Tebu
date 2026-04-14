// [cite: 2026-04-14]
const discordSdk = new window.DiscordSDK.DiscordSDK("1493662242862923806");

async function setupDiscord() {
    try {
        await discordSdk.ready();
        
        // Discord üzerinden yetkilendirme başlatılıyor
        const { code } = await discordSdk.commands.authorize({
            client_id: "1493662242862923806",
            response_type: "code",
            scope: ["identify", "rpc.activities.write"],
            prompt: "none",
        });

        // Kullanıcı bilgilerini Discord'dan çekip giriş kutusuna otomatik yazalım
        const response = await fetch(`https://discord.com/api/v10/users/@me`, {
            headers: {
                Authorization: `Bearer ${code}`,
            },
        });
        const userData = await response.json();
        
        if (userData.username) {
            const nameInput = document.getElementById('login-name-input');
            if(nameInput) nameInput.value = userData.username;
            console.log("Discord kullanıcısı bağlandı:", userData.username);
        }

    } catch (error) {
        console.warn("Discord SDK yüklenemedi, tarayıcı modunda devam ediliyor.");
    }
}

// Uygulama başladığında Discord'u hazırla
setupDiscord();