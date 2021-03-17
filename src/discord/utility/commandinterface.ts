import Discord from "discord.js";

export interface CommandInterface {
    name: string,
    description: string,
    run(message: Discord.Message, args: string[]): void
}