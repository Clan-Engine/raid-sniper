import DiscordBot from "../discord/discord";
import RaidDatabase, { GuildInfo, ServerInfo } from "../firebase/firebase";
import { GetServers } from "../http/serverinfo";
import cron from "node-cron";

let checkCooldown = 10000

export default class Guild {
    public snowflake: string;
    private database = new RaidDatabase();
    private checkTime!: number
    private info!: GuildInfo
    private timeOut: NodeJS.Timeout | undefined
    private places: Map<string, ServerInfo>;

    constructor(snowflake: string) {
        this.snowflake = snowflake
        this.places = new Map<string, ServerInfo>();
        this.GetGuildInfo().then(() => {
            this.CollectServers().then(() => {
                this.Start();
            })
        });
    }

    private async GetGuildInfo() {
        this.info = await this.database.GetGuildInfo(this.snowflake) as GuildInfo;
        this.checkTime = this.info.checkTime;
    }

    public async CollectServers() {
        let serverCollection = await this.database.GetServers(this.snowflake);
        for (let serverId of serverCollection.keys()) {
            let serverInfo = serverCollection.get(serverId);
            if (serverInfo) {
                this.AddServer(serverId, serverInfo);
            }
        }
    }

    public async AddServer(serverId: string, serverInfo: ServerInfo) {
        this.places.set(serverId, serverInfo);
    }

    public async Start() {
        cron.schedule("*/10 * * * * ", () => {
            this.ClearActiveServers()
        });

        this.timeOut = setInterval(() => {
            this.CheckServers();
        }, this.checkTime * 1000);
    }

    private async CheckServers() {
        if (this.places.size > 0) {
            this.places.forEach(async (placeInfo, placeId) => {
                let servers = await GetServers(placeId);
                let activeServers = await this.database.GetActiveServers(this.snowflake, placeId);
    
                for (let server of servers) {
                    if (activeServers.size > 5) break;
                    let checkServersArray = activeServers.keys()
                    let found = false;
                    for (let checkedServer of checkServersArray) {
                        if (server.id === checkedServer) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        DiscordBot.PostNotification(this.snowflake, placeId, server, placeInfo);
                        this.database.AddActiveServer(this.snowflake, placeId, server.id);
                    }
                }
            })
        }
    }

    private async ClearActiveServers() {
        this.places.forEach(async (placeInfo, placeId) => {
            let activeServers = await this.database.GetActiveServers(this.snowflake, placeId);
            let currentServers = await GetServers(placeId);

            for (let key of activeServers.keys()) {
                let found = currentServers.find(serverInfo => serverInfo.id == key);
                if (!found) {
                    this.database.RemoveActiveServer(this.snowflake, placeId, key);
                }
            }
        })
    }

    public async Stop() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
    }
}