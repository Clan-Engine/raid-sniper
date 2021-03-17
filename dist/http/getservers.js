"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetServers = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
async function GetServers(serverId) {
    let response = await node_fetch_1.default(`https://games.roblox.com/v1/games/${serverId}/servers/Public?sortOrder=Asc&limit=10`);
    let jsonData = await response.json();
    return jsonData.data;
}
exports.GetServers = GetServers;
