import {defineBackground} from "wxt/sandbox";
import {registerVideoSyncService} from "@/components/services/VideoSyncService";

registerVideoSyncService()

export default defineBackground(() => {
    console.log("Background service loaded!");
    // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //     if (message.type === 'contentScriptInitialized') {
    //         lobbyServiceInstance.isConnected = true;
    //     } else if (message.type === 'contentScriptInvalidated') {
    //         lobbyServiceInstance.isConnected = false;
    //         lobbyServiceInstance.lobbyId = undefined;
    //     } else if (message.type === 'getLobbyInfo') {
    //         sendResponse({data: lobbyServiceInstance});
    //         return true;
    //     } else if (message.type === 'setLobbyId') {
    //         lobbyServiceInstance.lobbyId = message.lobbyId;
    //     }
    // });
});

