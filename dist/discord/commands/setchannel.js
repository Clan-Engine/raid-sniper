"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = __importDefault(require("../../firebase/firebase"));
const admincheck_1 = __importDefault(require("../utility/admincheck"));
let database = new firebase_1.default();
let command = {
    name: "setchannel",
    description: "sets the channel the bot notifies in.\nformat: !setchannel channelname",
    run: async (message, args) => {
        if (!admincheck_1.default(message))
            return message.reply("you dont have admin");
        let channelName = args[0];
        let snowflake = message.guild?.id;
        if (snowflake == null)
            return;
        let channel = message.guild?.channels.cache.find(channel => channel.name === channelName);
        if (channel) {
            database.SetChannel(snowflake, channel.id);
            message.channel.send(`set ${channel.name} to post notifications`);
        }
        else {
            message.reply("Channel does not exist");
        }
    }
};
exports.default = command;
