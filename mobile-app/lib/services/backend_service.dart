import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/app_session.dart';

class BackendService {
  BackendService(this._client);

  final SupabaseClient _client;

  Future<AppSession> login({
    required String role,
    required String username,
    required String password,
  }) async {
    final loginRaw = await _client.rpc(
      'login_session',
      params: {
        'p_role': role,
        'p_username': username.trim(),
        'p_password': password,
      },
    );

    final loginMap = _asMap(loginRaw);
    final token = _string(loginMap['token']);

    if (token.isEmpty) {
      throw const FormatException('Session token missing');
    }

    final validated = await validateSession(
      token,
      username: username.trim(),
    );

    if (validated.role != role.toLowerCase()) {
      throw const FormatException('Role mismatch');
    }

    return validated;
  }

  Future<AppSession> validateSession(
    String token, {
    String username = '',
  }) async {
    final raw = await _client.rpc(
      'app_session_validate',
      params: {'p_token': token},
    );

    final map = _asMap(raw);

    if (map['valid'] == false ||
        _string(map['role']).isEmpty ||
        _string(map['account_id']).isEmpty) {
      throw const FormatException('Invalid or expired session');
    }

    return AppSession.fromMap({
      ...map,
      'token': token,
      'username': username,
    });
  }

  Future<List<Map<String, dynamic>>> getAdminStudents(String token) async {
    final raw = await _client.rpc(
      'admin_get_students',
      params: {'p_token': token},
    );

    return _asList(raw)
      ..sort(
        (a, b) => _number(b['id']).compareTo(_number(a['id'])),
      );
  }

  Future<void> logout(String token) async {
    try {
      await _client.rpc(
        'logout_session',
        params: {'p_token': token},
      );
    } catch (_) {
      // Local logout must still complete if network/server logout fails.
    }
  }

  static Map<String, dynamic> _asMap(dynamic value) {
    if (value is Map) {
      return Map<String, dynamic>.from(value);
    }

    if (value is List && value.isNotEmpty && value.first is Map) {
      return Map<String, dynamic>.from(value.first as Map);
    }

    if (value is String && value.trim().isNotEmpty) {
      final decoded = jsonDecode(value);
      if (decoded is Map) {
        return Map<String, dynamic>.from(decoded);
      }
    }

    return <String, dynamic>{};
  }

  static List<Map<String, dynamic>> _asList(dynamic value) {
    dynamic decoded = value;

    if (value is String && value.trim().isNotEmpty) {
      decoded = jsonDecode(value);
    }

    if (decoded is List) {
      return decoded
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
    }

    if (decoded is Map) {
      final map = Map<String, dynamic>.from(decoded);
      final data = map['data'];
      if (data is List) {
        return data
            .whereType<Map>()
            .map((item) => Map<String, dynamic>.from(item))
            .toList();
      }
    }

    return <Map<String, dynamic>>[];
  }

  static int _number(dynamic value) {
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  static String _string(dynamic value) => value?.toString().trim() ?? '';
}
