import RaidDatabase from "../../firebase/firebase";
import admincheck from "../utility/admincheck";
import { CommandInterface } from "../utility/commandinterface";

let database = new RaidDatabase();

let command: CommandInterface = {
    name: "setchannel",
    description: "sets the channel the bot notifies in.\nformat: !setchannel channelname",
    run: async (message, args) => {
        if (!admincheck(message)) return;
        let channelName = args[0];

        let snowflake = message.guild?.id;
        if (snowflake == null) return;

        let channel = message.guild?.channels.cache.find(channel => channel.name === channelName);
        if (channel) {
            database.SetChannel(snowflake, channel.id);
            message.channel.send(`set ${channel.name} to post notifications`);
        } else {
            message.reply("Channel does not exist");
        }
        
    }
}

export default command;