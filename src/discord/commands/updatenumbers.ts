import RaidDatabase from "../../firebase/firebase";
import GuildController from "../../guilds/controller";
import { PlaceExists } from "../../http/serverinfo";
import admincheck from "../utility/admincheck";
import { CommandInterface } from "../utility/commandinterface";

let database = new RaidDatabase();

let command: CommandInterface = {
    name: "updatenumbers",
    description: "update required numbers for notification.\nformat: !updatenumbers [serverid] [numbers]",
    run: async (message, args) => {
        if (!admincheck(message)) return message.reply("you dont have admin");
        let serverId = parseInt(args[0]);
        let requiredPlayers = parseInt(args[1]);

        let snowflake = message.guild?.id as string;
        if (snowflake == null) return;
        if (!await PlaceExists(serverId)) return message.reply("Place does not exist");
        if (!(requiredPlayers > 0)) return message.reply("Required players must be greater than 0");

        let servers = await database.GetServers(snowflake);
        let serverInfo = servers.get(args[0]);
        if (serverInfo == null) return message.reply("This guild does not have that place added. Please register it with !addserver");
        
        message.channel.send(`updated ${serverId} required player's to notify to ${requiredPlayers}`);
        await database.AddServer(snowflake, serverId, requiredPlayers, serverInfo.ping);
        setTimeout(() => GuildController.UpdateGuild(snowflake), 5000);
    }
}

export default command;