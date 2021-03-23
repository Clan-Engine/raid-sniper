import RaidDatabase from "../../firebase/firebase";
import { PlaceExists } from "../../http/serverinfo";
import admincheck from "../utility/admincheck";
import { CommandInterface } from "../utility/commandinterface";

let database = new RaidDatabase();

let command: CommandInterface = {
    name: "removeserver",
    description: "removes a place from the database.\nformat: !removeserver [serverid]",
    run: async (message, args) => {
        if (!admincheck(message)) return;
        let serverId = parseInt(args[0]);
        
        let snowflake = message.guild?.id;
        if (snowflake == null) return;

        let placeCollection = await database.GetServers(snowflake);
        if (placeCollection.size >= 10) {
            return message.reply("At max servers (10), please remove one to add a new one.");
        }
        if (!await PlaceExists(serverId)) return message.reply("Place does not exist");
        
        message.channel.send(`removed ${serverId}`);
        database.RemoveServer(snowflake, serverId);
    }
}

export default command;