const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1519617285357305936";
const GUILD_ID = "1519001289080574093";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// ---------------- TAG SYSTEM ----------------
function getTag(member) {
    if (!member) return "PLAYER";

    if (member.roles.cache.some(r => r.name === "OWNER")) return "OWNER";
    if (member.roles.cache.some(r => r.name === "ADMIN")) return "ADMIN";
    if (member.roles.cache.some(r => r.name === "MOD")) return "MOD";

    return "PLAYER";
}

// ---------------- SLASH COMMANDS ----------------
const commands = [
    new SlashCommandBuilder()
        .setName("tag")
        .setDescription("Shows your rank tag"),

    new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Shows your rank info")
].map(c => c.toJSON());

// ---------------- REGISTER COMMANDS ----------------
const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log("Slash commands registered!");
    } catch (err) {
        console.error(err);
    }
}

// ---------------- BOT READY ----------------
client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// ---------------- SLASH HANDLER ----------------
client.on("interactionCreate", async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const tag = getTag(interaction.member);

    if (interaction.commandName === "tag") {
        await interaction.reply(`Your tag is: [${tag}]`);
    }

    if (interaction.commandName === "rank") {
        await interaction.reply(`[${tag}] ${interaction.user.username}`);
    }
});

// ---------------- START BOT ----------------
async function start() {
    await registerCommands();
    await client.login(TOKEN);
}

start();
