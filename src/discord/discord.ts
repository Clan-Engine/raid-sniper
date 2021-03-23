import fs from "fs";
import Discord, { IntentsString } from "discord.js";
import config from "../constants/config.json";
import { CommandInterface } from "./utility/commandinterface";
import RaidDatabase, { ServerInfo } from "../firebase/firebase";
import { GetPlaceInfo, PlaceServerInfo } from "../http/serverinfo";
import { FOOTER_ICON, FOOTER_TEXT } from "../constants/flavor";

// Discord Bots now need to list what information they need access to. 
const intents: Array<IntentsString> = ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"];

let commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));

class _DiscordBot {
    private bot: Discord.Client;
    private commands: Discord.Collection<string, CommandInterface>;
    private database = new RaidDatabase();

    constructor() {
        this.bot = new Discord.Client({ ws: { intents: intents } });
        this.commands = new Discord.Collection();
        for (let file of commandFiles) {
            let command = require(`./commands/${file}`).default;
            this.commands.set(command.name, command);
        }
    }

    public Initialize() {
        this.bot.on("warn", console.log);
        this.bot.on("error", console.log);
        // this.bot.on("debug", console.log);
        this.bot.on("guildCreate", async guild => this.HandleGuildCreate(guild));
        this.bot.on("guildDelete", async guild => this.HandleGuildDelete(guild));
        this.bot.on("message", async message => this.HandleMessage(message));

        this.bot.login(config.TOKEN).then(() => {
            this.UpdateStatus(0)
            console.log("Bot has turned on")
        });
    }

    public async GetGuilds(): Promise<Array<string>> {
        if (this.bot.user) {
            let guildCache = this.bot.guilds.cache.array();
            let snowflakeArray: string[] = [];
    
            for (let guild of guildCache) {
                snowflakeArray.push(guild.id);
            }
    
            return snowflakeArray;
        } else {
            return [];
        }
    }

    public async PostNotification(guildSnowflake: string, placeId: string, placeServerInfo: PlaceServerInfo, serverInfo: ServerInfo) {
        let placeInfo = await GetPlaceInfo(parseInt(placeId)) 
        
        let guild = this.bot.guilds.cache.find(guild => guild.id === guildSnowflake);

        if (guild) {
            let sniperChannelId = (await this.database.GetGuildInfo(guildSnowflake)).channel;
            let sniperChannel = guild.channels.cache.find(channel => channel.id === sniperChannelId) as Discord.TextChannel | undefined;

            if (!sniperChannel) {
                let channels = guild.channels.cache;
                for (let channel of channels.values()) {
                    if (channel.type == "text") {
                        sniperChannel = channel as Discord.TextChannel;
                        sniperChannel.send("Missing Sniper Channel! Did you delete it? Set it with !setchannel");
                        break;
                    }
                }   
            }
            let notifyEmbed = new Discord.MessageEmbed();
            notifyEmbed.setTitle("place notification!")
            notifyEmbed.setDescription(`[link!](${placeInfo.Url})`);
            notifyEmbed.setImage(`https://www.roblox.com/asset-thumbnail/image?assetId=${placeId}&width=768&height=432&format=png`)
            notifyEmbed.setFooter(FOOTER_TEXT, FOOTER_ICON);
            notifyEmbed.addField(`${placeInfo.Name}`, `there are ${placeServerInfo.playing || 1} out of ${placeServerInfo.maxPlayers} players at ${placeInfo.Name}`);

            if (sniperChannel) {
                if (serverInfo.ping) sniperChannel.send("@here");
                sniperChannel.send(notifyEmbed);
            }
        }
    }

    private async UpdateStatus(variation: number) {
        if (variation == 0) {
            this.bot.user?.setActivity(`${this.bot.guilds.cache.size} Discord Servers`, { type: "WATCHING" })
            setTimeout(() => {
                this.UpdateStatus(1);
            }, 60 * 1000)
        } else if (variation == 1) {
            this.bot.user?.setActivity(`!help`, { type: "LISTENING" });
            setTimeout(() => {
                this.UpdateStatus(0);
            }, 60 * 1000)
        }
    }

    private async HandleGuildCreate(guild: Discord.Guild) {
        let sniperChannel = await guild.channels.create("raid-sniper-notifier");
        this.database.CreateGuild(guild.id, sniperChannel.id);
    }

    private async HandleGuildDelete(guild: Discord.Guild) {
        this.database.DeleteGuild(guild.id);
    }

    /** Command Parser */
    private async HandleMessage(message: Discord.Message) {
        if (!message.content.startsWith(config.PREFIX) || message.author.bot) return;

        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
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

    private async DisplayCommands(message: Discord.Message) {
        let CommandEmbed = new Discord.MessageEmbed();
        CommandEmbed.setTitle("Commands");
        CommandEmbed.setFooter(FOOTER_TEXT, FOOTER_ICON);
        this.commands.forEach(commandInterface => {
            CommandEmbed.addField(commandInterface.name, commandInterface.description);
        })
        CommandEmbed.addField("commands", "displays this message");

        message.channel.send(CommandEmbed);
    }
}

export default new _DiscordBot();