import fetch from "node-fetch";

interface ServerInfo {
    id: string,
    maxPlayers: number,
    playing: number,
    fps: number,
    ping: number,
    name?: string,
    vipServerId?: number,
    accessCode?: string,
    ownerUserId?: string
}

interface ErrorInfo {
    code: number,
    message: string,
    userFacingMessage: string
}

interface JsonResponseData {
    errors?: Array<ErrorInfo>
    previousPageCursor: string,
    nextPageCursor: string,
    data: Array<ServerInfo>
}

export async function GetServers(serverId: number): Promise<Array<ServerInfo>> {
    let response = await fetch(`https://games.roblox.com/v1/games/${serverId}/servers/Public?sortOrder=Asc&limit=10`);
    let jsonData = await response.json() as JsonResponseData;

    return jsonData.data;
}

export async function PlaceExists(serverId: number): Promise<boolean> {
    let response = await fetch(`https://games.roblox.com/v1/games/${serverId}/servers/Public?sortOrder=Asc&limit=10`);
    let jsonData = await response.json() as JsonResponseData;

    if (jsonData.errors) return false; else return true;
}