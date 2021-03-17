"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let command = {
    name: "support",
    description: "posts the support server invite link",
    run: (message, args) => {
        message.reply("http://discord.gg/WuxxQ2teCM");
    }
};
exports.default = command;
