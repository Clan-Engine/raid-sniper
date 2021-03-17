import { CommandInterface } from "../utility/commandinterface";

let command: CommandInterface = {
    name: "invite",
    description: "posts the support server invite link",
    run: (message, args) => {
        message.reply("http://discord.gg/WuxxQ2teCM");
    }
}

export default command;