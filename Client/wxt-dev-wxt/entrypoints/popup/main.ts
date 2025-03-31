import './style.css';
import {delay} from "@/components/utilities";
import {useVideoSyncService} from "@/components/services/VideoSyncService";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style="display: flex; flex-direction: column; gap: 8px; min-width: 300px;">
    <h2 id="current-lobby-info">No Lobby</h2>
    <button id="reload-lobby-info">Reload</button>
    <div class="card" style="display: flex; gap: 3px; justify-content: center; align-items: center;">
        <input id="lobby-id-input" type="text" placeholder="Enter lobby ID" />
        <button id="join-lobby-btn">Join Lobby!</button>
    </div>
    <div class="card" style="display: flex; justify-content: center; align-items: center;">
        <button id="create-lobby-btn">Create new Lobby!</button>
        <button id="leave-lobby-btn" style="display: none;">Leave Lobby!</button>
     </div>
  </div>
`;

document.getElementById('reload-lobby-info')?.addEventListener('click', reloadLobbyInfo);
document.getElementById('join-lobby-btn')?.addEventListener('click', joinLobbyClick);
const createBtn = document.getElementById('create-lobby-btn')!;
createBtn.addEventListener('click', createNewLobby);
const leaveBtn = document.getElementById('leave-lobby-btn')!;
const lobbyInfo = document.getElementById('current-lobby-info') as HTMLHeadingElement;
// leaveBtn.addEventListener('click', leaveLobby);

const videoSyncService = useVideoSyncService();

async function joinLobbyClick() {
    const lobbyId = (document.getElementById('lobby-id-input') as HTMLInputElement).value;
    if (!lobbyId || lobbyId.length <= 8) {
        alert('Please enter a lobby ID');
        return;
    }

    lobbyInfo.innerText = `Joining new lobby...`;
    await videoSyncService.joinLobby(lobbyId);
    await reloadLobbyInfo();
}

async function createNewLobby() {
    let lobby = await videoSyncService.getLobbyInfo();
    if (!lobby.isConnected) {
        alert('Please connect to the server first by navigating to a series/video page');
        return;
    }

    lobbyInfo.innerText = `Creating new lobby...`;
    await videoSyncService.createLobby();
    await reloadLobbyInfo();
}

// function leaveLobby() {
//     if (!videoSyncService.lobby.isConnected) {
//         alert('Please connect to the server first by navigating to a series/video page');
//         return;
//     }
//
//     // TODO: Implement leave lobby functionality
//
//     return;
//     lobbyInfo.innerText = `Leaving lobby...`;
//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//         tabs.forEach(tab => {
//             if (!tab.id) {
//                 return;
//             }
//             chrome.tabs.sendMessage(tab.id, {type: 'leaveLobby'}).then(async () => {
//                 await delay(250);
//                 await reloadLobbyInfo()
//             });
//         });
//     })
// }

async function reloadLobbyInfo() {
    let lobby = await videoSyncService.getLobbyInfo();
    console.log('Lobby data:', lobby);
    if (lobby.isConnected &&
        lobby.lobbyId) {
        lobbyInfo.innerText = `Lobby: ${lobby.lobbyId}`;
        createBtn.style.display = 'none';
        leaveBtn.style.display = 'block';
    } else if (lobby.isConnected) {
        lobbyInfo.innerText = `No Lobby`;
        createBtn.style.display = 'block';
        leaveBtn.style.display = 'none';
    } else if (!lobby.isConnected) {
        lobbyInfo.innerText = `Not connected`;
        createBtn.style.display = 'none';
        leaveBtn.style.display = 'none';
    }
}

reloadLobbyInfo().then();