import 'package:flutter/material.dart';
import '../core/app_config.dart';
import '../core/app_language.dart';
import '../core/app_theme.dart';
import '../models/app_session.dart';
import '../services/backend_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    required this.language,
    required this.backend,
    required this.onLogin,
    required this.onChangeLanguage,
  });

  final AppLanguage language;
  final BackendService backend;
  final Future<void> Function(AppSession session) onLogin;
  final VoidCallback onChangeLanguage;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _username = TextEditingController();
  final _password = TextEditingController();

  String _role = 'admin';
  bool _busy = false;
  bool _obscure = true;
  String? _error;

  AppLanguage get language => widget.language;

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final username = _username.text.trim();
    final password = _password.text;

    if (username.isEmpty || password.isEmpty) {
      setState(() => _error = language.text('invalidCredentials'));
      return;
    }

    setState(() {
      _busy = true;
      _error = null;
    });

    try {
      final session = await widget.backend.login(
        role: _role,
        username: username,
        password: password,
      );
      await widget.onLogin(session);
    } catch (_) {
      if (mounted) {
        setState(() => _error = language.text('invalidCredentials'));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final roles = <String, IconData>{
      'admin': Icons.admin_panel_settings_rounded,
      'teacher': Icons.co_present_rounded,
      'student': Icons.school_rounded,
    };

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: ListView(
              padding: const EdgeInsets.all(24),
              shrinkWrap: true,
              children: [
                Row(
                  children: [
                    IconButton(
                      onPressed: widget.onChangeLanguage,
                      icon: const Icon(Icons.language_rounded),
                      tooltip: language.text('selectLanguage'),
                    ),
                    const Spacer(),
                  ],
                ),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 24),
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(26),
                  ),
                  child: const Column(
                    children: [
                      Icon(
                        Icons.school_rounded,
                        color: Colors.white,
                        size: 52,
                      ),
                      SizedBox(height: 12),
                      Text(
                        AppConfig.appName,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                Text(
                  language.text('loginAs'),
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 10),
                SegmentedButton<String>(
                  segments: roles.entries
                      .map(
                        (entry) => ButtonSegment<String>(
                          value: entry.key,
                          icon: Icon(entry.value),
                          label: Text(language.text(entry.key)),
                        ),
                      )
                      .toList(),
                  selected: {_role},
                  onSelectionChanged: _busy
                      ? null
                      : (selection) {
                          setState(() => _role = selection.first);
                        },
                ),
                const SizedBox(height: 22),
                TextField(
                  controller: _username,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: language.text('username'),
                    prefixIcon: const Icon(Icons.person_outline_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _password,
                  obscureText: _obscure,
                  onSubmitted: (_) {
                    if (!_busy) _submit();
                  },
                  decoration: InputDecoration(
                    labelText: language.text('password'),
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obscure = !_obscure),
                      icon: Icon(
                        _obscure
                            ? Icons.visibility_rounded
                            : Icons.visibility_off_rounded,
                      ),
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _error!,
                      style: TextStyle(color: Colors.red.shade800),
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                FilledButton.icon(
                  onPressed: _busy ? null : _submit,
                  icon: _busy
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.login_rounded),
                  label: Text(
                    _busy
                        ? language.text('loggingIn')
                        : language.text('login'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
