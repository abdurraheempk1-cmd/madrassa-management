import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/app_config.dart';
import 'core/app_language.dart';
import 'core/app_theme.dart';
import 'models/app_session.dart';
import 'screens/dashboard_screen.dart';
import 'screens/language_screen.dart';
import 'screens/login_screen.dart';
import 'screens/splash_screen.dart';
import 'services/backend_service.dart';
import 'services/session_store.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabasePublishableKey,
  );

  runApp(
    MadrassaApp(
      backend: BackendService(Supabase.instance.client),
      store: SessionStore(),
    ),
  );
}

class MadrassaApp extends StatefulWidget {
  const MadrassaApp({
    super.key,
    required this.backend,
    required this.store,
  });

  final BackendService backend;
  final SessionStore store;

  @override
  State<MadrassaApp> createState() => _MadrassaAppState();
}

class _MadrassaAppState extends State<MadrassaApp>
    with WidgetsBindingObserver {
  AppSession? _session;
  AppLanguage _language = AppLanguage.ur;
  bool _loading = true;
  bool _languageConfirmed = false;
  Timer? _inactivityTimer;
  DateTime _lastActivity = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_bootstrap());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _inactivityTimer?.cancel();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    final storedLanguage = await widget.store.readLanguage();
    _languageConfirmed =
        storedLanguage != null && storedLanguage.trim().isNotEmpty;
    _language = AppLanguage.fromCode(storedLanguage);

    final storedSession = await widget.store.readSession();

    if (storedSession != null) {
      try {
        _session = await widget.backend.validateSession(
          storedSession.token,
          username: storedSession.username,
        );
        await widget.store.saveSession(_session!);
        _touch();
      } catch (_) {
        await widget.store.clearSession();
        _session = null;
      }
    }

    if (mounted) {
      setState(() => _loading = false);
    }
  }

  Future<void> _chooseLanguage(AppLanguage language) async {
    await widget.store.saveLanguage(language.code);
    if (!mounted) return;

    setState(() {
      _language = language;
      _languageConfirmed = true;
    });
  }

  Future<void> _login(AppSession session) async {
    await widget.store.saveSession(session);
    if (!mounted) return;

    setState(() => _session = session);
    _touch();
  }

  Future<void> _logout() async {
    final session = _session;
    _inactivityTimer?.cancel();

    if (session != null) {
      await widget.backend.logout(session.token);
    }

    await widget.store.clearSession();

    if (!mounted) return;
    setState(() => _session = null);
  }

  void _touch() {
    if (_session == null) return;

    _lastActivity = DateTime.now();
    _inactivityTimer?.cancel();
    _inactivityTimer = Timer(
      AppConfig.inactivityTimeout,
      () => unawaited(_logout()),
    );
  }

  Future<void> _validateAfterResume() async {
    final session = _session;
    if (session == null) return;

    final inactiveFor = DateTime.now().difference(_lastActivity);
    if (inactiveFor >= AppConfig.inactivityTimeout) {
      await _logout();
      return;
    }

    try {
      final validated = await widget.backend.validateSession(
        session.token,
        username: session.username,
      );
      await widget.store.saveSession(validated);
      if (mounted) {
        setState(() => _session = validated);
      }
      _touch();
    } catch (_) {
      await _logout();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      unawaited(_validateAfterResume());
    }
  }

  @override
  Widget build(BuildContext context) {
    final content = _loading
        ? const SplashScreen()
        : !_languageConfirmed
            ? LanguageScreen(
                initialLanguage: _language,
                onContinue: _chooseLanguage,
              )
            : _session == null
                ? LoginScreen(
                    language: _language,
                    backend: widget.backend,
                    onLogin: _login,
                    onChangeLanguage: () {
                      setState(() => _languageConfirmed = false);
                    },
                  )
                : DashboardScreen(
                    session: _session!,
                    language: _language,
                    onLogout: _logout,
                  );

    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      builder: (context, child) {
        return Listener(
          behavior: HitTestBehavior.translucent,
          onPointerDown: (_) => _touch(),
          child: Directionality(
            textDirection:
                _language.isRtl ? TextDirection.rtl : TextDirection.ltr,
            child: child ?? const SizedBox.shrink(),
          ),
        );
      },
      home: content,
    );
  }
}
