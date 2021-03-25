"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = __importDefault(require("firebase"));
const firebaseConfig_1 = require("./firebaseConfig");
let sniperApp = firebase_1.default.initializeApp(firebaseConfig_1.raidsniperConfig);
let sniperDatabase = sniperApp.database();
class RaidDatabase {
    constructor() {
        this.database = sniperDatabase;
    }
    async CreateGuild(snowflake, channelId) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.set({
            checkTime: 60,
            channel: channelId,
            servers: {},
            activeServers: {}
        });
    }
    async DeleteGuild(snowflake) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.remove();
    }
    async SetChannel(snowflake, channelId) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.update({
            channel: channelId
        });
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
    async GetGuilds() {
        let guildsRef = this.database.ref(`guilds`);
        let guildsSnapshot = await guildsRef.get();
        let snowflakeArray = [];
        guildsSnapshot.forEach(snap => {
            let key = snap.key;
            snowflakeArray.push(key);
        });
        return snowflakeArray;
    }
    async GetServers(snowflake) {
        let guildRef = this.database.ref(`guilds/${snowflake}/servers`);
        let serversSnapshot = await guildRef.get();
        let serverCollection = new Map();
        // oh my god, a proper way to loop through data?
        serversSnapshot.forEach(serverSnapshot => {
            let serverId = serverSnapshot.key;
            let serverInfo = serverSnapshot.val();
            serverCollection.set(serverId, serverInfo);
        });
        return serverCollection;
    }
    async GetServerInfo(snowflake, serverId) {
        let serverCollection = await this.GetServers(snowflake);
        let serverInfo = serverCollection.get(serverId);
        if (serverInfo) {
            return serverInfo;
        }
        else {
            return null;
        }
    }
    async AddActiveServer(snowflake, serverid, guid) {
        let activeServerRef = this.database.ref(`guilds/${snowflake}/activeServers/${serverid}`);
        await activeServerRef.update({
            [guid]: Date.now()
        });
    }
    async RemoveActiveServer(snowflake, serverid, guid) {
        let activeServerRef = this.database.ref(`guilds/${snowflake}/activeServers/${serverid}/${guid}`);
        await activeServerRef.remove();
    }
    async GetActiveServers(snowflake, serverid) {
        let activeServerRef = this.database.ref(`guilds/${snowflake}/activeServers/${serverid}`);
        let activeServerSnapshot = await activeServerRef.get();
        let activeServerGUIDs = new Map();
        activeServerSnapshot.forEach(activeServer => {
            let guid = activeServer.key;
            let time = activeServer.val();
            activeServerGUIDs.set(guid, time);
        });
        return activeServerGUIDs;
    }
    async GetGuildInfo(snowflake) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        let guildSnapshot = await guildRef.get();
        let guildInfo = guildSnapshot.toJSON();
        return guildInfo;
    }
    async RemoveServer(snowflake, serverid) {
        let serverRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await serverRef.remove();
    }
}
exports.default = RaidDatabase;
