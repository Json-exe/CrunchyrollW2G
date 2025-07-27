using System.Collections.Concurrent;

namespace CrunchyrollWatch2Gether.Services;

internal class ConnectionService
{
    private readonly ConcurrentDictionary<string, int> _groupWatchers = new();

    public void RemoveWatcher(string groupId)
    {
        if (!_groupWatchers.TryGetValue(groupId, out var watchers)) return;
        if (watchers - 1 == 0)
        {
            _groupWatchers.Remove(groupId, out _);
        }
        else
        {
            _groupWatchers[groupId] = watchers - 1;
        }
    }

    public void AddWatcher(string groupId)
    {
        _groupWatchers.AddOrUpdate(groupId, 1, (_, value) => value + 1);
    }

    public int GetWatchers(string groupId)
    {
        return _groupWatchers.GetValueOrDefault(groupId, 0);
    }
}