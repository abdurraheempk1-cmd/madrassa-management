import 'package:flutter/material.dart';
import '../core/app_config.dart';
import '../core/app_language.dart';
import '../core/app_theme.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({
    super.key,
    required this.initialLanguage,
    required this.onContinue,
  });

  final AppLanguage initialLanguage;
  final Future<void> Function(AppLanguage language) onContinue;

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  late AppLanguage _selected;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _selected = widget.initialLanguage;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: ListView(
              padding: const EdgeInsets.all(24),
              shrinkWrap: true,
              children: [
                const Icon(
                  Icons.language_rounded,
                  color: AppTheme.primary,
                  size: 64,
                ),
                const SizedBox(height: 16),
                const Text(
                  AppConfig.appName,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 23,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _selected.text('selectLanguage'),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 24),
                ...AppLanguage.values.map(
                  (language) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Card(
                      clipBehavior: Clip.antiAlias,
                      child: ListTile(
                        onTap: () {
                          setState(() => _selected = language);
                        },
                        leading: Icon(
                          _selected == language
                              ? Icons.check_circle_rounded
                              : Icons.circle_outlined,
                          color: _selected == language
                              ? AppTheme.primary
                              : Colors.grey,
                        ),
                        title: Text(
                          language.nativeName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        trailing: _selected == language
                            ? const Icon(
                                Icons.done_rounded,
                                color: AppTheme.primary,
                              )
                            : null,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: _saving
                      ? null
                      : () async {
                          setState(() => _saving = true);
                          await widget.onContinue(_selected);
                          if (mounted) setState(() => _saving = false);
                        },
                  icon: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.arrow_forward_rounded),
                  label: Text(_selected.text('continue')),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
