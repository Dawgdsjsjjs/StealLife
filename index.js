const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1519617285357305936";
const GUILD_ID = "1519001289080574093";

const TAG_FILE = "./tags.json";

// ---------------- CLIENT ----------------
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// ---------------- LOAD / SAVE TAGS ----------------
function loadTags() {
    if (!fs.existsSync(TAG_FILE)) return {};
    return JSON.parse(fs.readFileSync(TAG_FILE, "utf8"));
}

function saveTags(data) {
    fs.writeFileSync(TAG_FILE, JSON.stringify(data, null, 2));
}

// ---------------- GET TAG ----------------
function getTag(member) {
    const tags = loadTags();

    if (!member) return "PLAYER";

    if (tags.users?.[member.id]) return tags.users[member.id];

    if (member.roles.cache.some(r => r.name === "OWNER")) return "OWNER";
    if (member.roles.cache.some(r => r.name === "ADMIN")) return "ADMIN";
    if (member.roles.cache.some(r => r.name === "MOD")) return "MOD";

    return "PLAYER";
}

// ---------------- COMMANDS ----------------
const commands = [
    new SlashCommandBuilder()
        .setName("tag")
        .setDescription("Shows your rank tag"),

    new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Shows your rank info"),

    new SlashCommandBuilder()
        .setName("settag")
        .setDescription("Set a custom tag for a user (Tagger only)")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("User to set tag for")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("tag")
                .setDescription("Custom tag text")
                .setRequired(true)
        )
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

// ---------------- READY ----------------
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// ---------------- COMMAND HANDLER ----------------
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const tags = loadTags();

    // /tag
    if (interaction.commandName === "tag") {
        const tag = getTag(interaction.member);
        return interaction.reply(`Your tag is: [${tag}]`);
    }

    // /rank
    if (interaction.commandName === "rank") {
        const tag = getTag(interaction.member);
        return interaction.reply(`[${tag}] ${interaction.user.username}`);
    }

    // /settag
    if (interaction.commandName === "settag") {

        const hasTaggerRole = interaction.member.roles.cache.some(
            r => r.name === "Tagger"
        );

        if (!hasTaggerRole) {
            return interaction.reply({
                content: "❌ You need the **Tagger** role to use this command.",
                ephemeral: true
            });
        }

        const user = interaction.options.getUser("user");
        const tag = interaction.options.getString("tag");

        if (!tags.users) tags.users = {};
        tags.users[user.id] = tag;

        saveTags(tags);

        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.setNickname(`[${tag}] ${member.user.username}`);
        } catch (err) {
            console.log("Nickname update failed:", err.message);
        }

        return interaction.reply(`✅ Set tag of ${user.username} to [${tag}] and updated nickname.`);
    }
});

// ---------------- START BOT ----------------
async function start() {
    await registerCommands();
    await client.login(TOKEN);
}

start();
