import Discord from "discord.js";
import { FOOTER_ICON, FOOTER_TEXT } from "../../constants/flavor";
import { CommandInterface } from "../utility/commandinterface";

let command: CommandInterface = {
    name: "info",
    description: "displays information about the purpose of the bot",
    run: (message, args) => {
        let infoEmbed = new Discord.MessageEmbed();
        infoEmbed.setTitle("info");
        infoEmbed.setDescription("so you're looking to understand why you should use this bot?");
        infoEmbed.setFooter(FOOTER_TEXT, FOOTER_ICON);
        infoEmbed.addField("defense notifications!", "trying to know when people are raiding your base? don't have time to write a script to notify for you? using the raid sniper, you can know immediately when players are at your base!");
        infoEmbed.addField("snipe raids", "trying to be the first to defend a base? now you can snipe raids, by having your notifier go off before the bases!");
        infoEmbed.addField("know when people are at a game", "trying to grind a game when there are a lot of players there? set the snipe mode to \"total players\" and join when there are enough players for your liking!");
        infoEmbed.addField("additional info", "the bot will only notify for the first 5 servers. anymore and it'll ignore");

        message.reply(infoEmbed);
    }
}

export default command;