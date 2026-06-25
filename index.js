const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1519617285357305936";
const GUILD_ID = "1519001289080574093";

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    new SlashCommandBuilder()
        .setName("tag")
        .setDescription("Shows your rank tag")
].map(c => c.toJSON());

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

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    await registerCommands();
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "tag") {
        await interaction.reply("Your tag system works!");
    }
});

client.login(TOKEN);
