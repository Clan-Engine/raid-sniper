import fs from "fs";
import Discord, { IntentsString } from "discord.js";
import config from "../constants/config.json";
import { CommandInterface } from "./utility/commandinterface";
import RaidDatabase from "../firebase/firebase";

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

    async Initialize() {
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
        this.database.CreateGuild(guild.id);
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
            } else {
                message.reply("Command does not exist");
            }
        } else {
            message.reply("Command not supplied");
        }
    }

    private async DisplayCommands(message: Discord.Message) {
        let CommandEmbed = new Discord.MessageEmbed();
        CommandEmbed.setTitle("Commands");
        this.commands.forEach(commandInterface => {
            CommandEmbed.addField(commandInterface.name, commandInterface.description);
        })
        CommandEmbed.addField("commands", "displays this message");

        message.channel.send(CommandEmbed);
    }
}

export default new _DiscordBot();