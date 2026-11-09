import 'dart:convert';

class AppSession {
  const AppSession({
    required this.token,
    required this.role,
    required this.accountId,
    required this.username,
    this.studentId,
    this.teacherId,
  });

  final String token;
  final String role;
  final String accountId;
  final String username;
  final String? studentId;
  final String? teacherId;

  factory AppSession.fromMap(Map<String, dynamic> map) {
    return AppSession(
      token: _value(map['token']),
      role: _value(map['role']).toLowerCase(),
      accountId: _value(map['account_id']),
      username: _value(map['username']),
      studentId: _nullable(map['student_id']),
      teacherId: _nullable(map['teacher_id']),
    );
  }

  Map<String, dynamic> toMap() => {
        'token': token,
        'role': role,
        'account_id': accountId,
        'username': username,
        'student_id': studentId,
        'teacher_id': teacherId,
      };

  String toJson() => jsonEncode(toMap());

  static AppSession fromJson(String value) {
    return AppSession.fromMap(
      Map<String, dynamic>.from(jsonDecode(value) as Map),
    );
  }

  AppSession copyWith({
    String? token,
    String? role,
    String? accountId,
    String? username,
    String? studentId,
    String? teacherId,
  }) {
    return AppSession(
      token: token ?? this.token,
      role: role ?? this.role,
      accountId: accountId ?? this.accountId,
      username: username ?? this.username,
      studentId: studentId ?? this.studentId,
      teacherId: teacherId ?? this.teacherId,
    );
  }

  static String _value(dynamic value) => value?.toString().trim() ?? '';

  static String? _nullable(dynamic value) {
    final text = _value(value);
    return text.isEmpty ? null : text;
  }
}
