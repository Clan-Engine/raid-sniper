"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let command = {
    name: "invite",
    description: "posts the bot invite link",
    run: (message, args) => {
        message.reply("https://discord.com/api/oauth2/authorize?client_id=711826975395676180&permissions=0&scope=bot");
    }
};
exports.default = command;
