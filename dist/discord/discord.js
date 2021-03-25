"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const discord_js_1 = __importDefault(require("discord.js"));
const config_json_1 = __importDefault(require("../constants/config.json"));
const firebase_1 = __importDefault(require("../firebase/firebase"));
const serverinfo_1 = require("../http/serverinfo");
const flavor_1 = require("../constants/flavor");
const controller_1 = __importDefault(require("../guilds/controller"));
// Discord Bots now need to list what information they need access to. 
const intents = ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"];
let commandFiles = fs_1.default.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));
let reset = false;
class _DiscordBot {
    constructor() {
        this.database = new firebase_1.default();
        this.bot = new discord_js_1.default.Client({ ws: { intents: intents } });
        this.commands = new discord_js_1.default.Collection();
        for (let file of commandFiles) {
            let command = require(`./commands/${file}`).default;
            this.commands.set(command.name, command);
        }
    }
    Initialize() {
        this.bot.on("warn", console.log);
        this.bot.on("error", console.log);
        // this.bot.on("debug", console.log);
        this.bot.on("guildCreate", async (guild) => this.HandleGuildCreate(guild));
        this.bot.on("guildDelete", async (guild) => this.HandleGuildDelete(guild));
        this.bot.on("message", async (message) => this.HandleMessage(message));
        this.bot.login(config_json_1.default.TOKEN).then(async () => {
            if (reset) {
                await this.Reset();
                return;
            }
            this.CheckGuildsVsStored();
            this.UpdateStatus(0);
            console.log("Bot has turned on");
        });
    }
    async Reset() {
        let guilds = this.bot.guilds.cache;
        for (let guild of guilds.values()) {
            guild.leave();
        }
        console.log("Servers Reset!");
    }
    async CheckGuildsVsStored() {
        let guildSnowflakes = await this.GetGuilds();
        let guildsInDatabase = await this.database.GetGuilds();
        console.log(guildSnowflakes, guildsInDatabase);
        for (let snowflake of guildSnowflakes) {
            let found = guildsInDatabase.find(flake => flake == snowflake);
            console.log(found, snowflake);
            if (!found) {
                let guild = this.bot.guilds.cache.get(snowflake);
                if (guild) {
                    await this.HandleGuildCreate(guild);
                }
            }
        }
        for (let snowflake of guildsInDatabase) {
            let found = guildSnowflakes.find(flake => flake == snowflake);
            if (!found) {
                let guild = this.bot.guilds.cache.get(snowflake);
                if (guild) {
                    this.HandleGuildDelete(guild);
                }
            }
        }
        controller_1.default.CollectGuilds();
    }
    async GetGuilds() {
        if (this.bot.user) {
            let guildCache = this.bot.guilds.cache.array();
            let snowflakeArray = [];
            for (let guild of guildCache) {
                snowflakeArray.push(guild.id);
            }
            return snowflakeArray;
        }
        else {
            return [];
        }
    }
    async PostNotification(guildSnowflake, placeId, placeServerInfo, serverInfo) {
        let placeInfo = await serverinfo_1.GetPlaceInfo(parseInt(placeId));
        let guild = this.bot.guilds.cache.find(guild => guild.id === guildSnowflake);
        if (guild) {
            let sniperChannelId = (await this.database.GetGuildInfo(guildSnowflake)).channel;
            let sniperChannel = guild.channels.cache.find(channel => channel.id === sniperChannelId);
            if (!sniperChannel) {
                let channels = guild.channels.cache;
                for (let channel of channels.values()) {
                    if (channel.type == "text") {
                        sniperChannel = channel;
                        sniperChannel.send("Missing Sniper Channel! Did you delete it? Set it with !setchannel");
                        break;
                    }
                }
            }
            let notifyEmbed = new discord_js_1.default.MessageEmbed();
            notifyEmbed.setTitle("place notification!");
            notifyEmbed.setDescription(`[link!](${placeInfo.Url})`);
            notifyEmbed.setImage(`https://www.roblox.com/asset-thumbnail/image?assetId=${placeId}&width=768&height=432&format=png`);
            notifyEmbed.setFooter(flavor_1.FOOTER_TEXT, flavor_1.FOOTER_ICON);
            notifyEmbed.addField(`${placeInfo.Name}`, `there are ${placeServerInfo.playing || 1} out of ${placeServerInfo.maxPlayers} players at ${placeInfo.Name}`);
            if (sniperChannel) {
                if (serverInfo.ping)
                    sniperChannel.send("@here");
                sniperChannel.send(notifyEmbed);
            }
        }
    }
    async UpdateStatus(variation) {
        if (variation == 0) {
            this.bot.user?.setActivity(`${this.bot.guilds.cache.size} Discord Servers`, { type: "WATCHING" });
            setTimeout(() => {
                this.UpdateStatus(1);
            }, 60 * 1000);
        }
        else if (variation == 1) {
            this.bot.user?.setActivity(`!help`, { type: "LISTENING" });
            setTimeout(() => {
                this.UpdateStatus(0);
            }, 60 * 1000);
        }
    }
    async HandleGuildCreate(guild) {
        let channelName = "raid-sniper-notifier";
        let sniperChannel = guild.channels.cache.find(channel => channel.name === channelName);
        if (sniperChannel == null) {
            sniperChannel = await guild.channels.create(channelName);
        }
        this.database.CreateGuild(guild.id, sniperChannel.id);
    }
    async HandleGuildDelete(guild) {
        this.database.DeleteGuild(guild.id);
    }
    /** Command Parser */
    async HandleMessage(message) {
        if (!message.content.startsWith(config_json_1.default.PREFIX) || message.author.bot)
            return;
        const args = message.content.slice(config_json_1.default.PREFIX.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        if (command) {
            if (command === "commands" || command === "help") {
                this.DisplayCommands(message);
                return;
            }
            let commandFunction = this.commands.get(command);
            if (commandFunction) {
                commandFunction.run(message, args);
            }
        }
    }
    async DisplayCommands(message) {
        let CommandEmbed = new discord_js_1.default.MessageEmbed();
        CommandEmbed.setTitle("Commands");
        CommandEmbed.setFooter(flavor_1.FOOTER_TEXT, flavor_1.FOOTER_ICON);
        this.commands.forEach(commandInterface => {
            CommandEmbed.addField(commandInterface.name, commandInterface.description);
        });
        CommandEmbed.addField("commands", "displays this message");
        message.channel.send(CommandEmbed);
    }
}
exports.default = new _DiscordBot();
