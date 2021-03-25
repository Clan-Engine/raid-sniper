"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = __importDefault(require("../../firebase/firebase"));
const controller_1 = __importDefault(require("../../guilds/controller"));
const serverinfo_1 = require("../../http/serverinfo");
const admincheck_1 = __importDefault(require("../utility/admincheck"));
let database = new firebase_1.default();
let command = {
    name: "addserver",
    description: "adds a server to watch for player's joining.\nformat: !addserver [serverid] [requiredPlayers]",
    run: async (message, args) => {
        if (!admincheck_1.default(message))
            return message.reply("you dont have admin");
        let serverId = parseInt(args[0]);
        let requiredPlayers = parseInt(args[1]);
        let snowflake = message.guild?.id;
        if (snowflake == null)
            return;
        let placeCollection = await database.GetServers(snowflake);
        if (placeCollection.size >= 10) {
            return message.reply("At max servers (10), please remove one to add a new one.");
        }
        if (!await serverinfo_1.PlaceExists(serverId))
            return message.reply("Place does not exist");
        if (!(requiredPlayers > 0))
            return message.reply("Required players must be greater than 0");
        message.channel.send(`set ${serverId} to notify at ${requiredPlayers} or above`);
        await database.AddServer(snowflake, serverId, requiredPlayers);
        setTimeout(() => controller_1.default.UpdateGuild(snowflake), 5000);
    }
};
exports.default = command;
