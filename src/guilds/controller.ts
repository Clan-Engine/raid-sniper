import Guild from "./guild";
import DiscordBot from "../discord/discord";

let guilds = new Map<string, Guild>();

export default class GuildController {
    public static async CollectGuilds() {
        let guilds = await DiscordBot.GetGuilds();
        if (guilds.length == 0) {
            setTimeout(() => this.CollectGuilds(), 5000);
            return;
        }
        for (let snowflake of guilds) {
            this.AddGuild(snowflake);
        }
    }

    public static async AddGuild(snowflake: string) {
        let guildToAdd = new Guild(snowflake);
        guilds.set(snowflake, guildToAdd);
    }

    public static async RemoveGuild(snowflake: string) {
        let guildToRemove = guilds.get(snowflake);
        if (guildToRemove) {
            guildToRemove.Stop();
            guilds.delete(snowflake);
        }
    }
}