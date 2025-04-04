import {HttpTransportType, HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {LobbyService} from "@/components/Interfaces";
import {defineProxyService} from "@webext-core/proxy-service";
import {sendMessage} from "@/components/MessagingTypes";

export class VideoSyncService {
    private connection: HubConnection | undefined;
    private lobbyInfo: LobbyService = new LobbyService();

    public getLobbyInfo() {
        return this.lobbyInfo;
    }

    public async sendPlayState(timeStamp: number) {
        if (this.connection) {
            await this.connection.invoke("PlayVideo", timeStamp);
        }
    }

    public async sendPausedState() {
        if (this.connection) {
            await this.connection.invoke("PauseVideo");
        }
    }
    
    public async sendSeekState(timeStamp: number) {
        if (this.connection) {
            await this.connection.invoke("SeekVideo", timeStamp);
        }
    }
    
    public async sendVideoSwitch(url: string) {
        if (this.connection) {
            console.log('sending video switch...');
            await this.connection.invoke("SwitchVideo", url);
        }
    }

    public async stopSignalRHub() {
        if (this.connection) {
            console.log('Stopping SignalR hub connection');
            await this.connection.stop();
            this.lobbyInfo.isConnected = false;
            this.lobbyInfo.lobbyId = undefined;
        }
    }

    public async connectToSignalRHub() {
        if (this.connection?.state === 'Connected') {
            return true;
        }

        this.connection = new HubConnectionBuilder()
            .withUrl(import.meta.env.WXT_SIGNALR_URL, {
                withCredentials: false,
                transport: HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();
        try {
            await this.connection.start();
            this.registerSignalREvents(this.connection);
        } catch (e) {
            console.error('Error connecting to SignalR hub:', e);
            return false;
        }

        console.log('Connected to SignalR hub');
        this.lobbyInfo.isConnected = true;
        return true;
    }

    private registerSignalREvents(connection: HubConnection) {
        connection.onclose(async () => {
            console.log('SignalR hub connection closed');
            this.lobbyInfo.isConnected = false;
            this.lobbyInfo.lobbyId = undefined;
        })
        connection.onreconnecting(() => {
            console.log('SignalR hub connection lost, reconnecting...');
            this.lobbyInfo.isConnected = false;
        })
        connection.onreconnected(() => {
            console.log('SignalR hub reconnected');
            this.lobbyInfo.isConnected = true;
        })
        connection.on('PlayVideo', async (timeStamp: number) => {
            console.log('Received play event from SignalR hub');
            chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
                for (const tab of tabs) {
                    await sendMessage('videoPlay', timeStamp, tab.id)
                }
            })
        });
        connection.on('SeekVideo', async (timeStamp: number) => {
            console.log('Received seek event from SignalR hub');
            chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
                for (const tab of tabs) {
                    await sendMessage('videoSeek', timeStamp, tab.id)
                }
            })
        })
        connection.on('PauseVideo', async () => {
            console.log('Received pause event from SignalR hub');
            chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
                for (const tab of tabs) {
                    await sendMessage('videoPause', undefined, tab.id)
                }
            })
        });
        connection.on('SwitchVideo', async (url: string) => {
            console.log('Received switch event from SignalR hub');
            chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
                for (const tab of tabs) {
                    await sendMessage('switchVideo', url, tab.id)
                }
            })
        })
    }

    public async joinLobby(lobbyId: string) {
        if (!this.connection) {
            console.error('Connection not initialized');
            return false;
        }

        try {
            await this.connection.invoke('JoinLobby', lobbyId);
            this.lobbyInfo.lobbyId = lobbyId;
            console.log('Joined lobby:', lobbyId);
            return true;
        } catch (e) {
            console.error('Error joining lobby:', e);
        }

        return false;
    }
    
    public async leaveLobby() {
        if (!this.connection) {
            console.error('Connection not initialized');
            return false;
        }
        
        try {
            await this.connection.invoke('LeaveLobby');
            this.lobbyInfo.lobbyId = undefined;
            console.log("Left lobby successfully!")
            return true;
        } catch (error) {
            console.error('Error leaveing lobby:', error);
        }
        
        return false;
    }

    public async createLobby() {
        if (!this.connection) {
            console.error('Connection not initialized');
            return false;
        }

        try {
            console.log("Creating lobby...");
            const lobbyId = await this.connection.invoke<string>('CreateLobby');
            console.log("Lobby created with ID:", lobbyId);
            this.lobbyInfo.lobbyId = lobbyId;
            return true;
        } catch (e) {
            console.error('Error creating lobby:', e);
        }

        return false;
    }
}

export const [registerVideoSyncService, useVideoSyncService] = defineProxyService('VideoSyncService',
    () => new VideoSyncService());