import {defineBackground} from "wxt/sandbox";
import {registerVideoSyncService} from "@/components/services/VideoSyncService";

registerVideoSyncService()

export default defineBackground(() => {
    chrome.runtime.onInstalled.addListener(() => {
        console.log(`Crunchyroll W2G Extension has been installed with version: ${chrome.runtime.getManifest().version}`);
        chrome.tabs.query({url: ["*://www.crunchyroll.com/*", "*://crunchyroll.com/*"]}, async (tabs) => {
            if (tabs) {
                console.log(`Reloading ${tabs.length} crunchyroll tabs to allow content script to run properly.`)
                for (const tab of tabs) {
                    if (tab.id) {
                        await chrome.tabs.reload(tab.id)
                    }
                }
            }
        })
    })
    console.log("Background service loaded successfully!");
});

