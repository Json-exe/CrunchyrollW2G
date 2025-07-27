using CrunchyrollWatch2Gether.Services;
using Microsoft.AspNetCore.SignalR;

namespace CrunchyrollWatch2Gether.Hubs;

internal class WatchTogetherHub : Hub
{
    private readonly ILogger<WatchTogetherHub> _logger;
    private readonly ConnectionService _connectionService;

    public WatchTogetherHub(ILogger<WatchTogetherHub> logger, ConnectionService connectionService)
    {
        _logger = logger;
        _connectionService = connectionService;
    }

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        if (GetGroupId(out var groupId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            _connectionService.RemoveWatcher(groupId);
            await Clients.OthersInGroup(groupId).SendAsync("LobbyChanged");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task<string> CreateLobby()
    {
        if (GetGroupId(out var groupId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            _connectionService.RemoveWatcher(groupId);
        }

        groupId = Guid.NewGuid().ToString();
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        Context.Items.TryAdd("GroupId", groupId);
        _connectionService.AddWatcher(groupId);
        _logger.LogInformation("Client {ConnectionId} created group {GroupName}", Context.ConnectionId, groupId);
        return groupId;
    }

    public async Task SwitchVideo(string url)
    {
        if (!GetGroupId(out var groupId))
        {
            return;
        }

        Context.Items["VideoUrl"] = url;
        await Clients.OthersInGroup(groupId).SendAsync("SwitchVideo", url);
        _logger.LogInformation("Client {ConnectionId} switched video to {Url} in group {GroupName}",
            Context.ConnectionId,
            url, groupId);
    }

    public async Task JoinLobby(string groupId)
    {
        if (GetGroupId(out var existingGroupId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, existingGroupId);
            _connectionService.RemoveWatcher(existingGroupId);
            await Clients.OthersInGroup(existingGroupId).SendAsync("LobbyChanged");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        Context.Items.TryAdd("GroupId", groupId);
        _connectionService.AddWatcher(groupId);
        await Clients.OthersInGroup(groupId).SendAsync("LobbyChanged");
        _logger.LogInformation("Client {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupId);
    }

    public async Task PlayVideo(float timeStamp = 0)
    {
        if (!GetGroupId(out var groupId))
        {
            return;
        }

        await Clients.OthersInGroup(groupId).SendAsync("PlayVideo", timeStamp);
        _logger.LogInformation("Client {ConnectionId} played video in group {GroupName}", Context.ConnectionId,
            groupId);
    }

    public async Task PauseVideo()
    {
        if (!GetGroupId(out var groupId))
        {
            return;
        }

        await Clients.OthersInGroup(groupId).SendAsync("PauseVideo");
        _logger.LogInformation("Client {ConnectionId} stopped video in group {GroupName}", Context.ConnectionId,
            groupId);
    }

    public async Task SeekVideo(float timeStamp)
    {
        if (!GetGroupId(out var groupId))
        {
            return;
        }

        await Clients.OthersInGroup(groupId).SendAsync("SeekVideo", timeStamp);
        _logger.LogInformation("Client {ConnectionId} seeked video with timestamp {TimeStamp} in group {GroupName}",
            Context.ConnectionId, timeStamp, groupId);
    }

    public async Task LeaveLobby()
    {
        if (GetGroupId(out var groupId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            Context.Items.Remove("GroupId");
            _connectionService.RemoveWatcher(groupId);
            await Clients.OthersInGroup(groupId).SendAsync("LobbyChanged");
            _logger.LogInformation("Client {ConnectionId} left group {GroupName}", Context.ConnectionId, groupId);
        }
    }

    private bool GetGroupId(out string groupId)
    {
        if (Context.Items.TryGetValue("GroupId", out var value) && value is string id)
        {
            groupId = id;
            return true;
        }

        _logger.LogDebug("Client {ConnectionId} is not in a group", Context.ConnectionId);
        groupId = string.Empty;
        return false;
    }

    public int GetWatchers(string groupId)
    {
        _logger.LogDebug("Retrieving watcher count for lobby: {LobbyId}", groupId);
        return _connectionService.GetWatchers(groupId);
    }
}