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
// Discord Bots now need to list what information they need access to. 
const intents = ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"];
let commandFiles = fs_1.default.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));
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
        this.bot.login(config_json_1.default.TOKEN).then(() => {
            this.UpdateStatus(0);
            console.log("Bot has turned on");
        });
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
        let sniperChannel = await guild.channels.create("raid-sniper-notifier");
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
            else {
                message.reply("Command does not exist");
            }
        }
        else {
            message.reply("Command not supplied");
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
