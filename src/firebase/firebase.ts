import { Collection } from "discord.js";
import Firebase from "firebase";
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
        checkedServers: {
            id: {
                guids
            }
        }
    }
*/

interface ServerInfo {
    requiredNumber: number
    ping: boolean
}

export default class RaidDatabase {
    private database = sniperDatabase;

    public async CreateGuild(snowflake: string) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.set({
            checkTime: 60,
            lastCheck: 0,
            servers: {},
            checkedServers: {}
        })
    }

    public async DeleteGuild(snowflake: string) {
        let guildRef = this.database.ref(`guilds/${snowflake}`);
        await guildRef.remove();
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

    public async GetServers(snowflake: string): Promise<Collection<string, ServerInfo>> {
        let guildRef = this.database.ref(`guilds/${snowflake}/servers`);
        let serversSnapshot = await guildRef.get();
        let serverCollection = new Collection<string, ServerInfo>();
        
        // oh my god, a proper way to loop through data?
        serversSnapshot.forEach(serverSnapshot => {
            let serverId = serverSnapshot.key as string;
            let serverInfo = serverSnapshot.val() as ServerInfo;

            serverCollection.set(serverId, serverInfo);
        })

        return serverCollection;
    }

    public async RemoveServer(snowflake: string, serverid: number) {
        let serverRef = this.database.ref(`guilds/${snowflake}/servers/${serverid}`);
        await serverRef.remove()
    }
}