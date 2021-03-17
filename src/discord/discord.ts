import fs from "fs";
import Discord, { IntentsString } from "discord.js";
import config from "../constants/config.json";
import { CommandInterface } from "./utility/commandinterface";

// Discord Bots now need to list what information they need access to. 
const intents: Array<IntentsString> = ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"];

let commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));

class _DiscordBot {
    private bot: Discord.Client;
    private commands: Discord.Collection<string, CommandInterface>;

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
        this.bot.on("message", async message => this.HandleMessage(message));

        this.bot.login(config.TOKEN).then(() => {
            console.log("Bot has turned on")
        })
    }

    /** Command Parser */
    private async HandleMessage(message: Discord.Message) {
        if (!message.content.startsWith(config.PREFIX) || message.author.bot) return;

        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (command) {
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
}

export default new _DiscordBot();