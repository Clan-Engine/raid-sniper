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
    name: "updatenumbers",
    description: "update required numbers for notification.\nformat: !updatenumbers [serverid] [numbers]",
    run: async (message, args) => {
        if (!admincheck_1.default(message))
            return message.reply("you dont have admin");
        let serverId = parseInt(args[0]);
        let requiredPlayers = parseInt(args[1]);
        let snowflake = message.guild?.id;
        if (snowflake == null)
            return;
        if (!await serverinfo_1.PlaceExists(serverId))
            return message.reply("Place does not exist");
        if (!(requiredPlayers > 0))
            return message.reply("Required players must be greater than 0");
        let servers = await database.GetServers(snowflake);
        let serverInfo = servers.get(args[0]);
        if (serverInfo == null)
            return message.reply("This guild does not have that place added. Please register it with !addserver");
        message.channel.send(`updated ${serverId} required player's to notify to ${requiredPlayers}`);
        database.AddServer(snowflake, serverId, requiredPlayers, serverInfo.ping);
    }
};
exports.default = command;
