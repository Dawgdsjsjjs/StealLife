const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "YOUR_BOT_CLIENT_ID"; // put bot ID here

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


// -------------------- TAG SYSTEM --------------------
function getTag(member) {
    if (!member) return "PLAYER";

    if (member.roles.cache.some(r => r.name === "OWNER")) return "OWNER";
    if (member.roles.cache.some(r => r.name === "ADMIN")) return "ADMIN";
    if (member.roles.cache.some(r => r.name === "MOD")) return "MOD";

    return "PLAYER";
}


// -------------------- SLASH COMMANDS --------------------
const commands = [
    new SlashCommandBuilder()
        .setName("tag")
        .setDescription("Shows your rank tag"),

    new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Shows your rank info")
].map(cmd => cmd.toJSON());


// Register slash commands
const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log("Slash commands registered!");
    } catch (err) {
        console.error(err);
    }
}


// -------------------- BOT READY --------------------
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});


// -------------------- SLASH COMMAND HANDLER --------------------
client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const member = interaction.member;
    const tag = getTag(member);

    if (interaction.commandName === "tag") {

        await interaction.reply({
            content: `Your tag is: [${tag}]`,
            ephemeral: true
        });
    }

    if (interaction.commandName === "rank") {

        await interaction.reply({
            content: `Rank Info: [${tag}] ${interaction.user.username}`,
            ephemeral: true
        });
    }
});


// -------------------- START BOT --------------------
client.login(TOKEN);
registerCommands();
