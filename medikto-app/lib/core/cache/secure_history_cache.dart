import 'dart:collection';

class _CacheEntry {
  final dynamic data;
  final DateTime expiry;

  _CacheEntry(this.data, this.expiry);

  bool get isExpired => DateTime.now().isAfter(expiry);
}

/// Secure client-side cache for medication history, records, and adherence data.
/// Scoped in memory with automatic expiration to prevent stale UI state or PHI disk leaks.
class SecureHistoryCache {
  SecureHistoryCache._();
  static final SecureHistoryCache instance = SecureHistoryCache._();

  final Map<String, _CacheEntry> _cache = HashMap<String, _CacheEntry>();

  dynamic get(String key) {
    final entry = _cache[key];
    if (entry == null) return null;
    if (entry.isExpired) {
      _cache.remove(key);
      return null;
    }
    return entry.data;
  }

  void set(String key, dynamic data, {Duration ttl = const Duration(minutes: 5)}) {
    _cache[key] = _CacheEntry(data, DateTime.now().add(ttl));
  }

  void invalidate(String key) {
    _cache.remove(key);
  }

  void invalidateMatching(bool Function(String key) predicate) {
    _cache.removeWhere((key, _) => predicate(key));
  }

  void clearAll() {
    _cache.clear();
  }
}
