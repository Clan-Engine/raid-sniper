"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const guild_1 = __importDefault(require("./guild"));
const discord_1 = __importDefault(require("../discord/discord"));
let guilds = new Map();
class GuildController {
    static async CollectGuilds() {
        let guilds = await discord_1.default.GetGuilds();
        if (guilds.length == 0) {
            setTimeout(() => this.CollectGuilds(), 5000);
            return;
        }
        for (let snowflake of guilds) {
            this.AddGuild(snowflake);
        }
    }
    static async UpdateGuild(snowflake) {
        let guild = guilds.get(snowflake);
        if (guild) {
            guild.CollectServers();
        }
    }
    static async AddGuild(snowflake) {
        let guildToAdd = new guild_1.default(snowflake);
        guilds.set(snowflake, guildToAdd);
    }
    static async RemoveGuild(snowflake) {
        let guildToRemove = guilds.get(snowflake);
        if (guildToRemove) {
            guildToRemove.Stop();
            guilds.delete(snowflake);
        }
    }
}
exports.default = GuildController;
