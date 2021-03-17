import Discord from "discord.js";
import { CommandInterface } from "../utility/commandinterface";

let command: CommandInterface = {
    name: "test",
    description: "this is a test command",
    run: (message: Discord.Message, args: string[]) => {
        message.channel.send("Test Worked!")
    }
}

export default command;