"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = __importDefault(require("../../firebase/firebase"));
const serverinfo_1 = require("../../http/serverinfo");
const admincheck_1 = __importDefault(require("../utility/admincheck"));
let database = new firebase_1.default();
let command = {
    name: "toggleping",
    description: "toggles pinging for the specified serverid.\nformat: !toggleping [serverid]",
    run: async (message, args) => {
        if (!admincheck_1.default(message))
            return message.reply("you dont have admin");
        let serverId = parseInt(args[0]);
        let snowflake = message.guild?.id;
        if (snowflake == null)
            return;
        if (!await serverinfo_1.PlaceExists(serverId))
            return message.reply("Place does not exist");
        let servers = await database.GetServers(snowflake);
        let serverInfo = servers.get(args[0]);
        if (serverInfo == null)
            return message.reply("This guild does not have that place added. Please register it with !addserver");
        message.channel.send(`set ${serverId} ping to ${!serverInfo.ping}`);
        await database.UpdatePing(snowflake, serverId, !serverInfo.ping);
    }
};
exports.default = command;
