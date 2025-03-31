import {defineContentScript, MatchPattern} from "wxt/sandbox";
import {sendMessage} from "@/components/MessagingTypes";
import {useVideoSyncService} from "@/components/services/VideoSyncService";

const seriesPattern = new MatchPattern("*://*.crunchyroll.com/*/series/*");
const watchPattern = new MatchPattern("*://*.crunchyroll.com/*/watch/*");

export default defineContentScript({
    matches: ["*://*.crunchyroll.com/*"],
    registration: "manifest",
    runAt: "document_start",
    main(ctx) {
        console.log("Crunchyroll content script loaded");
        const videoSyncService = useVideoSyncService();

        ctx.addEventListener(window, "wxt:locationchange", async ({newUrl}) => {
            console.log("Location changed to:", newUrl);
            if (!seriesPattern.includes(newUrl) && !watchPattern.includes(newUrl)) {
                console.log("Not a series or watch page, stopping SignalR hub");
                await videoSyncService.stopSignalRHub();
            } else {
                if (!await videoSyncService.connectToSignalRHub()) {
                    console.log("SignalRHub connection failed!");
                }
            }
        });
    }
})

async function sendUpdateSignalRMessage(connect: boolean) {
    await sendMessage('updateSignalRState', connect);
}