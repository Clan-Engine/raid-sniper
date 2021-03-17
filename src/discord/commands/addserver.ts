import RaidDatabase from "../../firebase/firebase";
import { PlaceExists } from "../../http/serverinfo";
import admincheck from "../utility/admincheck";
import { CommandInterface } from "../utility/commandinterface";

let database = new RaidDatabase();

let command: CommandInterface = {
    name: "addserver",
    description: "adds a server to watch for player's joining.\nformat: !addserver [serverid] [requiredPlayers]",
    run: async (message, args) => {
        if (!admincheck(message)) return;
        let serverId = parseInt(args[0]);
        let requiredPlayers = parseInt(args[1]);

        let snowflake = message.guild?.id;
        if (snowflake == null) return;
        if (!await PlaceExists(serverId)) return message.reply("Place does not exist");
        if (!(requiredPlayers > 0)) return message.reply("Required players must be greater than 0");
        
        message.channel.send(`set ${serverId} to notify at ${requiredPlayers} or above`);
        database.AddServer(snowflake, serverId, requiredPlayers);
    }
}

export default command;