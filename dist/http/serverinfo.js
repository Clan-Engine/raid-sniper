"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPlaceInfo = exports.PlaceExists = exports.GetServers = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
async function GetServers(placeId) {
    let response = await node_fetch_1.default(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=10`);
    let jsonData = await response.json();
    return jsonData.data;
}
exports.GetServers = GetServers;
async function PlaceExists(placeId) {
    let response = await node_fetch_1.default(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=10`);
    let jsonData = await response.json();
    if (jsonData.errors)
        return false;
    else
        return true;
}
exports.PlaceExists = PlaceExists;
async function GetPlaceInfo(placeId) {
    let response = await node_fetch_1.default(`https://www.roblox.com/places/api-get-details?assetId=${placeId}`);
    let jsonData = await response.json();
    return jsonData;
}
exports.GetPlaceInfo = GetPlaceInfo;
