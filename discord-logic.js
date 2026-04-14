// [cite: 2026-04-12]
// Bu kısım Client ID gerektirir, lobiye isim girmeyi stabil yapar.
const discordSdk = new window.DiscordSDK.DiscordSDK("SENIN_CLIENT_ID");

async function setupDiscord() {
    try {
        await discordSdk.ready();
        const { code } = await discordSdk.commands.authorize({
            client_id: "SENIN_CLIENT_ID",
            response_type: "code", scope: ["identify", "rpc.activities.write"],
            prompt: "none",
        });
        
        // Discord ismini alıp giriş kutusuna yaz (hayal gücü)
        const user = await fetch(`https://discord.com/api/v10/users/@me`, {
            headers: { Authorization: `Bearer ${code}` }
        }).then(r => r.json());
        
        if(user && user.username) {
            document.getElementById('username').value = user.username;
            app.isDiscordActive = true;
        }
    } catch (e) {
        console.log("Tarayıcı modunda çalışılıyor.");
    }
}

// setupDiscord(); // Daha sonra aktif edilecek