import {defineContentScript} from "wxt/sandbox";
import {ContentScriptContext} from "wxt/client";
import {delay} from "@/components/utilities";
import {useVideoSyncService, VideoSyncService} from "@/components/services/VideoSyncService";
import {ProxyService} from "@webext-core/proxy-service";
import {onMessage} from "@/components/MessagingTypes";

let videoElement: HTMLVideoElement | undefined;
let blockSignalRSending: boolean = false;
let videoSyncService: ProxyService<VideoSyncService> | undefined;
let firstLoad: boolean = false;

export default defineContentScript({
    matches: ['https://static.crunchyroll.com/vilos-v2/web/vilos/player.html*'],
    runAt: "document_start",
    allFrames: true,
    registration: "manifest",
    async main(ctx: ContentScriptContext) {
        console.log('Initializing Crunchyroll content script...');
        videoSyncService = useVideoSyncService();
        ctx.addEventListener(document, 'wxt:locationchange', async () => {
            console.log('Content script location changed. Invalidating...');
            ctx.notifyInvalidated();
        });
        ctx.addEventListener(document, 'beforeunload', () => {
            console.log('Content script beforeunload');
            ctx.notifyInvalidated();
        })
        ctx.onInvalidated(async () => {
            console.log('Content script invalidated');
        })

        if (!await searchForVideoElement()) {
            return;
        }

        console.log('Initialization complete!');
    },
});

async function searchForVideoElement() {
    let retryCount = 0;
    while (retryCount < 4) {
        videoElement = document.getElementsByTagName("video")[0] as HTMLVideoElement;
        if (!videoElement) {
            console.log('No video element found. Retrying... Attempt:', retryCount + 1);
        } else {
            break;
        }
        await delay(1500);
        retryCount++;
    }

    if (!videoElement) {
        console.error('No video element found after 3 retries');
        return false;
    }

    console.log('Video element found:', videoElement);
    firstLoad = true;
    registerVideoEvents();
    registerServiceEvents();
    return true;
}

function registerServiceEvents() {
    if (!videoElement || !videoSyncService) {
        return;
    }

    onMessage('videoPlay', async (message) => {
        console.log('Video play: ', message.data);
        if (videoElement) {
            blockSignalRSending = true;
            await videoElement.play();
        }
    })

    onMessage('videoPause', () => {
        console.log('Video pause');
        if (videoElement && !videoElement.paused) {
            blockSignalRSending = true;
            videoElement.pause();
        }
    })

    onMessage('videoSeek', (message) => {
        console.log('Video seek: ', message.data);
        if (videoElement) {
            blockSignalRSending = true;
            videoElement.currentTime = message.data;
        }
    })
}

function registerVideoEvents() {
    if (!videoElement) {
        return
    }

    videoElement.autoplay = false;

    videoElement.addEventListener('play', async () => {
        console.log(`Video playing. Block SignalR: ${blockSignalRSending}`);
        if (!blockSignalRSending && !firstLoad && videoElement) {
            console.log('Sending play event to SignalR hub');
            await videoSyncService?.sendPlayState(videoElement.currentTime);
        }
        blockSignalRSending = false;
    })

    videoElement.addEventListener('pause', async () => {
        console.log(`Video paused. Block SignalR: ${blockSignalRSending}`);
        if (!blockSignalRSending && !firstLoad) {
            console.log('Sending pause event to SignalR hub');
            await videoSyncService?.sendPausedState();
        }
        blockSignalRSending = false;
    })

    videoElement.addEventListener('canplaythrough', () => {
        console.log('Video can play through');
    })

    videoElement.addEventListener('canplay', async () => {
        console.log('Video canplay');
        if (firstLoad) {
            await onlyExecuteIfInLobby(() => {
                videoElement?.pause();
            })
            firstLoad = false;
            blockSignalRSending = false;
        }
    })

    videoElement.addEventListener('seeked', async () => {
        console.log(`Video seeked. Block SignalR: ${blockSignalRSending}`);
        if (!blockSignalRSending && !firstLoad && videoElement) {
            console.log('Sending seek event to SignalR hub');
            await videoSyncService?.sendSeekState(videoElement.currentTime);
        }
        await onlyExecuteIfInLobby(async () => {
            blockSignalRSending = true;
            videoElement?.pause();
            while (!videoElement?.paused) {
                await delay(10);
            }
        })

        blockSignalRSending = false;
    })
}

async function onlyExecuteIfInLobby(innerFunction: Function) {
    if (!videoSyncService) return;
    const lobbyData = await videoSyncService.getLobbyInfo();
    if (lobbyData.isConnected && lobbyData.lobbyId && lobbyData.lobbyId.length > 0) {
        innerFunction();
    }
}