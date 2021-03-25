import RaidDatabase from "../../firebase/firebase";
import GuildController from "../../guilds/controller";
import { PlaceExists } from "../../http/serverinfo";
import admincheck from "../utility/admincheck";
import { CommandInterface } from "../utility/commandinterface";

let database = new RaidDatabase();

let command: CommandInterface = {
    name: "addserver",
    description: "adds a server to watch for player's joining.\nformat: !addserver [serverid] [requiredPlayers]",
    run: async (message, args) => {
        if (!admincheck(message)) return message.reply("you dont have admin");
        let serverId = parseInt(args[0]);
        let requiredPlayers = parseInt(args[1]);
        
        let snowflake = message.guild?.id as string;
        if (snowflake == null) return;

        let placeCollection = await database.GetServers(snowflake);
        if (placeCollection.size >= 10) {
            return message.reply("At max servers (10), please remove one to add a new one.");
        }
        if (!await PlaceExists(serverId)) return message.reply("Place does not exist");
        if (!(requiredPlayers > 0)) return message.reply("Required players must be greater than 0");
        
        message.channel.send(`set ${serverId} to notify at ${requiredPlayers} or above`);
        await database.AddServer(snowflake, serverId, requiredPlayers);
        setTimeout(() => GuildController.UpdateGuild(snowflake), 5000);
    }
}

export default command;