"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_1 = __importDefault(require("./discord/discord"));
const controller_1 = __importDefault(require("./guilds/controller"));
discord_1.default.Initialize();
controller_1.default.CollectGuilds();
