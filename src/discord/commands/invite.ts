import { CommandInterface } from "../utility/commandinterface";

let command: CommandInterface = {
    name: "invite",
    description: "posts the bot invite link",
    run: (message, args) => {
        message.reply("https://discord.com/api/oauth2/authorize?client_id=711826975395676180&permissions=8&scope=bot");
    }
}

export default command;