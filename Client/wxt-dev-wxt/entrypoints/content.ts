import {defineContentScript} from "wxt/sandbox";
import {ContentScriptContext} from "wxt/client";
import {delay} from "@/components/utilities";
import {useVideoSyncService, VideoSyncService} from "@/components/services/VideoSyncService";
import {ProxyService} from "@webext-core/proxy-service";
import {onMessage} from "@/components/MessagingTypes";

let videoElement: HTMLVideoElement | undefined;
let signalREvent: boolean = false;
let videoSyncService: ProxyService<VideoSyncService> | undefined;

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
            await chrome.runtime.sendMessage({type: 'contentScriptInvalidated'});
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
    registerVideoEvents();
    registerServiceEvents();
    return true;
}

function registerServiceEvents() {
    if (!videoElement || !videoSyncService) {
        return;
    }

    onMessage('videoPlay', (message) => {
        console.log('Video play: ', message.data);
        signalREvent = true;
        videoElement?.play();
    })

    onMessage('videoPause', () => {
        console.log('Video pause');
        signalREvent = true;
        videoElement?.pause();
    })

    onMessage('videoSeek', (message) => {
        console.log('Video seek: ', message.data);
        signalREvent = true;
        if (videoElement) {
            videoElement.currentTime = message.data;
        }
    })
}

function registerVideoEvents() {
    if (!videoElement) {
        return
    }

    videoElement.autoplay = false;
    videoElement.pause();

    videoElement.addEventListener('play', async () => {
        console.log('Video playing');
        if (!signalREvent && videoElement) {
            console.log('Sending play event to SignalR hub');
            await videoSyncService?.sendPlayState(videoElement.currentTime);
        }
        signalREvent = false;
    })

    videoElement.addEventListener('pause', async () => {
        console.log('Video paused');
        if (!signalREvent) {
            console.log('Sending pause event to SignalR hub');
            await videoSyncService?.sendPausedState();
        }
        signalREvent = false;
    })

    videoElement.addEventListener('canplaythrough', () => {
        console.log('Video can play through');
    })

    videoElement.addEventListener('canplay', () => {
        console.log('Video canplay');
        signalREvent = true;
        videoElement?.pause();
    })

    videoElement.addEventListener('seeked', async () => {
        console.log('Video seeking');
        if (!signalREvent && videoElement) {
            console.log('Sending seek event to SignalR hub');
            await videoSyncService?.sendSeekState(videoElement.currentTime)
        }
        signalREvent = false;
    })
}