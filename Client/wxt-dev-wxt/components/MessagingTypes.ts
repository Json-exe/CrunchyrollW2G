import {defineExtensionMessaging} from "@webext-core/messaging";

interface ProtocolMap {
    updateSignalRState(data: boolean): void;
    videoPlay(data: number): void;
    videoPause(): void;
    videoSeek(data: number): void;
    switchVideo(data: string): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();