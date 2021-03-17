"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let command = {
    name: "test",
    description: "this is a test command",
    run: (message, args) => {
        message.channel.send("Test Worked!");
    }
};
exports.default = command;
