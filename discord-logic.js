// [cite: 2026-04-14]
const DISCORD_CLIENT_ID = "1493662242862923806";
const discordSdk = new window.DiscordSDK.DiscordSDK(DISCORD_CLIENT_ID);

async function startDiscord() {
    try {
        await discordSdk.ready();
        const { code } = await discordSdk.commands.authorize({
            client_id: DISCORD_CLIENT_ID,
            response_type: "code",
            scope: ["identify"],
            prompt: "none"
        });
        
        // Kullanıcı adını otomatik al ve inputa yaz
        const response = await fetch(`https://discord.com/api/v10/users/@me`, {
            headers: { Authorization: `Bearer ${code}` }
        });
        const user = await response.json();
        if (user.username) document.getElementById('login-name-input').value = user.username;
        
        NET.isDiscord = true;
    } catch (e) {
        console.log("Tarayıcı modunda çalışıyor...");
        NET.isDiscord = false;
    }
}
startDiscord();