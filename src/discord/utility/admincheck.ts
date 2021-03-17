import Discord from "discord.js";

export default function admincheck(message: Discord.Message): boolean {
    if (message.member?.hasPermission("ADMINISTRATOR")) return true; else return false;
}