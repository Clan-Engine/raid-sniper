"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const firebase_1 = __importDefault(require("firebase"));
const firebaseConfig_1 = require("./firebaseConfig");
let sniperApp = firebase_1.default.initializeApp(firebaseConfig_1.raidsniperConfig);
let sniperDatabase = sniperApp.database();
class RaidDatabase {
    constructor() {
        this.database = sniperDatabase;
    }
    async CreateGuild(snowflake) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.set({
            checkTime: 60,
            lastCheck: 0,
            servers: {},
            checkedServers: {}
        });
    }
    async DeleteGuild(snowflake) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.remove();
    }
    async AddServer(snowflake, serverid, requiredPlayers, shouldPing) {
        let guildServersRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await guildServersRef.update({
            requiredNumber: requiredPlayers,
            ping: shouldPing || false
        });
    }
    async UpdatePing(snowflake, serverid, shouldPing) {
        let guildServersRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await guildServersRef.update({
            ping: shouldPing
        });
    }
    async GetServers(snowflake) {
        let guildRef = this.database.ref(`guilds/${snowflake}/servers`);
        let serversSnapshot = await guildRef.get();
        let serverCollection = new discord_js_1.Collection();
        // oh my god, a proper way to loop through data?
        serversSnapshot.forEach(serverSnapshot => {
            let serverId = serverSnapshot.key;
            let serverInfo = serverSnapshot.val();
            serverCollection.set(serverId, serverInfo);
        });
        return serverCollection;
    }
    async RemoveServer(snowflake, serverid) {
        let serverRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await serverRef.remove();
    }
}
exports.default = RaidDatabase;
