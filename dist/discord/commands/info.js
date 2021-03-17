"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const flavor_1 = require("../../constants/flavor");
let command = {
    name: "info",
    description: "displays information about the purpose of the bot",
    run: (message, args) => {
        let infoEmbed = new discord_js_1.default.MessageEmbed();
        infoEmbed.setTitle("info");
        infoEmbed.setDescription("so you're looking to understand why you should use this bot?");
        infoEmbed.setFooter(flavor_1.FOOTER_TEXT, flavor_1.FOOTER_ICON);
        infoEmbed.addField("defense notifications!", "trying to know when people are raiding your base? don't have time to write a script to notify for you? using the raid sniper, you can know immediately when players are at your base!");
        infoEmbed.addField("snipe raids", "trying to be the first to defend a base? now you can snipe raids, by having your notifier go off before the bases!");
        infoEmbed.addField("know when people are at a game", "trying to grind a game when there are a lot of players there? set the snipe mode to \"total players\" and join when there are enough players for your liking!");
        infoEmbed.addField("additional info", "the bot will only notify for the first 5 servers. anymore and it'll ignore");
        message.reply(infoEmbed);
    }
};
exports.default = command;
