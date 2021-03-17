import Firebase from "firebase";
import { stringify } from "node:querystring";
import { raidsniperConfig } from "./firebaseConfig";

let sniperApp = Firebase.initializeApp(raidsniperConfig);
let sniperDatabase = sniperApp.database()

/* 
    snowflake: {
        checkTime: 60s default, have a way to pay for upgrade
        lastCheck: utc seconds time
        servers: {
            id: {
                requiredNumber: number
                ping: bool
            }
        }
        activeServers: {
            id: {
                guids
            }
        }
    }
*/

export interface GuildInfo {
    checkTime: number,
    lastCheck: number,
    channel: string,
    servers: Array<ServerInfo>,
    activeServers: Array<Map<string, Array<string>>>
}

export interface ServerInfo {
    requiredNumber: number
    ping: boolean
}

export default class RaidDatabase {
    private database = sniperDatabase;

    public async CreateGuild(snowflake: string, channelId: string) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.set({
            checkTime: 60,
            channel: channelId,
            servers: {},
            activeServers: {}
        })
    }

    public async DeleteGuild(snowflake: string) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.remove();
    }

    public async SetChannel(snowflake: string, channelId: string) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.update({
            channel: channelId
        })
    }


    public async AddServer(snowflake: string, serverid: number, requiredPlayers: number, shouldPing?: boolean) {
        let guildServersRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await guildServersRef.update({
            requiredNumber: requiredPlayers,
            ping: shouldPing || false
        })
    }

    public async UpdatePing(snowflake: string, serverid: number, shouldPing: boolean) {
        let guildServersRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await guildServersRef.update({
            ping: shouldPing
        })
    }

    public async GetServers(snowflake: string): Promise<Map<string, ServerInfo>> {
        let guildRef = this.database.ref(`guilds/${snowflake}/servers`);
        let serversSnapshot = await guildRef.get();
        let serverCollection = new Map<string, ServerInfo>();
        
        // oh my god, a proper way to loop through data?
        serversSnapshot.forEach(serverSnapshot => {
            let serverId = serverSnapshot.key as string;
            let serverInfo = serverSnapshot.val() as ServerInfo;

            serverCollection.set(serverId, serverInfo);
        })

        return serverCollection;
    }

    public async GetServerInfo(snowflake: string, serverId: string): Promise<ServerInfo | null> {
        let serverCollection = await this.GetServers(snowflake);
        let serverInfo = serverCollection.get(serverId);
        if (serverInfo) {
            return serverInfo;
        } else {
            return null;
        }
    }

    public async AddActiveServer(snowflake: string, serverid: string, guid: string) {
        let activeServerRef = this.database.ref(`guilds/${snowflake}/activeServers/${serverid}`);
        await activeServerRef.update({
            [guid]: Date.now()
        })
    }

    public async RemoveActiveServer(snowflake: string, serverid: string, guid: string) {
        let activeServerRef = this.database.ref(`guilds/${snowflake}/activeServers/${serverid}/${guid}`);
        await activeServerRef.remove();
    }

    public async GetActiveServers(snowflake: string, serverid: string): Promise<Map<string, number>> {
        let activeServerRef = this.database.ref(`guilds/${snowflake}/activeServers/${serverid}`);
        let activeServerSnapshot = await activeServerRef.get();
        let activeServerGUIDs = new Map<string, number>();
        activeServerSnapshot.forEach(activeServer => {
            let guid = activeServer.key as string;
            let time = activeServer.val() as number;
            activeServerGUIDs.set(guid, time);
        })

        return activeServerGUIDs;
    }

    public async GetGuildInfo(snowflake: string): Promise<GuildInfo> {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        let guildSnapshot = await guildRef.get();
        let guildInfo = guildSnapshot.toJSON() as GuildInfo;

        return guildInfo;
    }

    public async RemoveServer(snowflake: string, serverid: number) {
        let serverRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await serverRef.remove()
    }
}