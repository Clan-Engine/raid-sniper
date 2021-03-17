import { CommandInterface } from "../utility/commandinterface";

let command: CommandInterface = {
    name: "support",
    description: "posts the support server invite link",
    run: (message, args) => {
        message.reply("http://discord.gg/WuxxQ2teCM");
    }
}

export default command;