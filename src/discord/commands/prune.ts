import Discord from "discord.js";
import admincheck from "../utility/admincheck";
import { CommandInterface } from "../utility/commandinterface";

let command: CommandInterface = {
    name: "prune",
    description: "prunes messages",
    run: (message, args) => {
        if (!admincheck(message)) return;
        let int = parseInt(args[0])
        if (int != null) {
            let channel = message.channel as Discord.TextChannel;
            channel.bulkDelete(int, false);
        }
    }
}

export default command;