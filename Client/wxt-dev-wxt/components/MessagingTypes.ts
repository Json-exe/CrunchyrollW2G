import {defineExtensionMessaging} from "@webext-core/messaging";

interface ProtocolMap {
    updateSignalRState(data: boolean): void;
    videoPlay(): void;
    videoPause(): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();