import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/app_session.dart';

class SessionStore {
  SessionStore();

  static const _sessionKey = 'madrassa_session_v1';
  static const _languageKey = 'madrassa_language_v1';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveSession(AppSession session) {
    return _storage.write(
      key: _sessionKey,
      value: session.toJson(),
    );
  }

  Future<AppSession?> readSession() async {
    final raw = await _storage.read(key: _sessionKey);
    if (raw == null || raw.trim().isEmpty) return null;

    try {
      return AppSession.fromJson(raw);
    } catch (_) {
      await clearSession();
      return null;
    }
  }

  Future<void> clearSession() {
    return _storage.delete(key: _sessionKey);
  }

  Future<void> saveLanguage(String code) {
    return _storage.write(key: _languageKey, value: code);
  }

  Future<String?> readLanguage() {
    return _storage.read(key: _languageKey);
  }
}
