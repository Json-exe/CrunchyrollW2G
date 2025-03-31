using Microsoft.AspNetCore.SignalR;

namespace CrunchyrollWatch2Gether.Hubs;

internal class WatchTogetherHub : Hub
{
    private readonly ILogger<WatchTogetherHub> _logger;

    public WatchTogetherHub(ILogger<WatchTogetherHub> logger)
    {
        _logger = logger;
    }

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task<string> CreateLobby()
    {
        if (GetGroupId(out var groupId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        }

        groupId = Guid.NewGuid().ToString();
        Context.Items.TryAdd("GroupId", groupId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        _logger.LogInformation("Client {ConnectionId} created group {GroupName}", Context.ConnectionId, groupId);
        return groupId;
    }

    public async Task JoinLobby(string groupId)
    {
        if (GetGroupId(out var existingGroupId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, existingGroupId);
        }
        
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        Context.Items.TryAdd("GroupId", groupId);
        _logger.LogInformation("Client {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupId);
    }

    public async Task PlayVideo()
    {
        if (!GetGroupId(out var groupId))
        {
            return;
        }

        await Clients.Group(groupId).SendAsync("PlayVideo");
        // await Clients.OthersInGroup(groupId).SendAsync("PlayVideo");
        _logger.LogInformation("Client {ConnectionId} played video in group {GroupName}", Context.ConnectionId,
            groupId);
    }

    public async Task PauseVideo()
    {
        if (!GetGroupId(out var groupId))
        {
            return;
        }

        await Clients.Group(groupId).SendAsync("PauseVideo");
        // await Clients.OthersInGroup(groupId).SendAsync("PauseVideo");
        _logger.LogInformation("Client {ConnectionId} stopped video in group {GroupName}", Context.ConnectionId,
            groupId);
    }
    
    public async Task LeaveLobby()
    {
        if (GetGroupId(out var groupId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
            Context.Items.Remove("GroupId");
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
}