import {defineContentScript, MatchPattern} from "wxt/sandbox";
import {sendMessage} from "@/components/MessagingTypes";
import {useVideoSyncService} from "@/components/services/VideoSyncService";
import {onMessage} from "@/components/MessagingTypes";

const seriesPattern = new MatchPattern("*://*.crunchyroll.com/*/series/*");
const watchPattern = new MatchPattern("*://*.crunchyroll.com/*/watch/*");
let signalREvent: boolean = false;

export default defineContentScript({
    matches: ["*://*.crunchyroll.com/*"],
    registration: "manifest",
    runAt: "document_start",
    async main(ctx) {
        console.log("Crunchyroll content script loaded");
        const videoSyncService = useVideoSyncService();

        async function locationChangedEventHandler(newUrl: URL) {
            console.log("Location changed to:", newUrl);
            if (!seriesPattern.includes(newUrl) && !watchPattern.includes(newUrl)) {
                console.log("Not a series or watch page, stopping SignalR hub");
                await videoSyncService.stopSignalRHub();
            } else {
                if (!await videoSyncService.connectToSignalRHub()) {
                    console.log("SignalRHub connection failed!");
                } else {
                    if (watchPattern.includes(newUrl)) {
                        if (!signalREvent) {
                            // await videoSyncService.sendVideoSwitch(newUrl.toString());
                        } else {
                            signalREvent = false;
                        }
                    }
                }
            }
        }
        
        ctx.addEventListener(window, "wxt:locationchange", async ({newUrl}) => {
            await locationChangedEventHandler(newUrl);
        });

        onMessage('switchVideo', (msg) => {
            signalREvent = true;
            const targetUrl = msg.data;
            if (watchPattern.includes(targetUrl)) {
                console.log("Navigating to watch page: ", targetUrl);
                const tempLink = document.createElement('a');
                tempLink.href = targetUrl;
                tempLink.style.display = 'none';
                document.body.appendChild(tempLink);
                tempLink.click();
                tempLink.remove();
            }
        })

        await locationChangedEventHandler(new URL(window.location.href));
    }
})

async function sendUpdateSignalRMessage(connect: boolean) {
    await sendMessage('updateSignalRState', connect);
}