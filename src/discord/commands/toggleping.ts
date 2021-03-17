import RaidDatabase from "../../firebase/firebase";
import { PlaceExists } from "../../http/serverinfo";
import admincheck from "../utility/admincheck";
import { CommandInterface } from "../utility/commandinterface";

let database = new RaidDatabase();

let command: CommandInterface = {
    name: "toggleping",
    description: "toggles pinging for the specified serverid.\nformat: !toggleping [serverid]",
    run: async (message, args) => {
        if (!admincheck(message)) return;
        let serverId = parseInt(args[0]);

        let snowflake = message.guild?.id;
        if (snowflake == null) return;
        if (!await PlaceExists(serverId)) return message.reply("Place does not exist");

        let servers = await database.GetServers(snowflake);
        let serverInfo = servers.get(args[0]);
        if (serverInfo == null) return message.reply("This guild does not have that place added. Please register it with !addserver");
        
        message.channel.send(`set ${serverId} ping to ${!serverInfo.ping}`);
        await database.UpdatePing(snowflake, serverId, !serverInfo.ping);
    }
}

export default command;