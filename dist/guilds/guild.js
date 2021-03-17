"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_1 = __importDefault(require("../discord/discord"));
const firebase_1 = __importDefault(require("../firebase/firebase"));
const serverinfo_1 = require("../http/serverinfo");
const node_cron_1 = __importDefault(require("node-cron"));
let checkCooldown = 10000;
class Guild {
    constructor(snowflake) {
        this.database = new firebase_1.default();
        this.snowflake = snowflake;
        this.places = new Map();
        this.GetGuildInfo().then(() => {
            this.CollectServers().then(() => {
                this.Start();
            });
        });
    }
    async GetGuildInfo() {
        this.info = await this.database.GetGuildInfo(this.snowflake);
        this.checkTime = this.info.checkTime;
    }
    async CollectServers() {
        let serverCollection = await this.database.GetServers(this.snowflake);
        for (let serverId of serverCollection.keys()) {
            let serverInfo = serverCollection.get(serverId);
            if (serverInfo) {
                this.AddServer(serverId, serverInfo);
            }
        }
    }
    async AddServer(serverId, serverInfo) {
        this.places.set(serverId, serverInfo);
    }
    async Start() {
        node_cron_1.default.schedule("*/10 * * * * ", () => {
            this.ClearActiveServers();
        });
        this.timeOut = setInterval(() => {
            this.CheckServers();
        }, this.checkTime * 1000);
    }
    async CheckServers() {
        if (this.places.size > 0) {
            this.places.forEach(async (placeInfo, placeId) => {
                let servers = await serverinfo_1.GetServers(placeId);
                let activeServers = await this.database.GetActiveServers(this.snowflake, placeId);
                for (let server of servers) {
                    if (activeServers.size > 5)
                        break;
                    let checkServersArray = activeServers.keys();
                    let found = false;
                    for (let checkedServer of checkServersArray) {
                        if (server.id === checkedServer) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        discord_1.default.PostNotification(this.snowflake, placeId, server, placeInfo);
                        this.database.AddActiveServer(this.snowflake, placeId, server.id);
                    }
                }
            });
        }
    }
    async ClearActiveServers() {
        this.places.forEach(async (placeInfo, placeId) => {
            let activeServers = await this.database.GetActiveServers(this.snowflake, placeId);
            let currentServers = await serverinfo_1.GetServers(placeId);
            for (let key of activeServers.keys()) {
                let found = currentServers.find(serverInfo => serverInfo.id == key);
                if (!found) {
                    this.database.RemoveActiveServer(this.snowflake, placeId, key);
                }
            }
        });
    }
    async Stop() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
    }
}
exports.default = Guild;
