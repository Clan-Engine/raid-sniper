import fetch from "node-fetch";

export interface PlaceServerInfo {
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
    data: Array<PlaceServerInfo>
}

interface PlaceInfo {
    AssetId: number,
    Name: string,
    Description: string,
    Builder: string,
    BuilderAbsoluteUrl: string
    Url: string
}

export async function GetServers(placeId: string): Promise<Array<PlaceServerInfo>> {
    let response = await fetch(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=10`);
    let jsonData = await response.json() as JsonResponseData;

    return jsonData.data;
}

export async function PlaceExists(placeId: number): Promise<boolean> {
    let response = await fetch(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=10`);
    let jsonData = await response.json() as JsonResponseData;

    if (jsonData.errors) return false; else return true;
}

export async function GetPlaceInfo(placeId: number): Promise<PlaceInfo> {
    let response = await fetch(`https://www.roblox.com/places/api-get-details?assetId=${placeId}`);
    let jsonData = await response.json() as PlaceInfo;
    return jsonData;
}