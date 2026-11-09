import 'package:flutter/material.dart';
import '../core/app_config.dart';
import '../core/app_language.dart';
import '../core/app_theme.dart';
import '../models/app_session.dart';
import '../services/backend_service.dart';
import 'admin_students_screen.dart';
import '../widgets/module_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({
    super.key,
    required this.session,
    required this.language,
    required this.backend,
    required this.onLogout,
  });

  final AppSession session;
  final AppLanguage language;
  final BackendService backend;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    final modules = _modulesForRole(session.role);

    return Scaffold(
      appBar: AppBar(
        title: Text(language.text('dashboard')),
        actions: [
          IconButton(
            onPressed: onLogout,
            icon: const Icon(Icons.logout_rounded),
            tooltip: language.text('logout'),
          ),
        ],
      ),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final columns = constraints.maxWidth >= 900
                ? 4
                : constraints.maxWidth >= 600
                    ? 3
                    : 2;

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.primary, AppTheme.darkGreen],
                    ),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 28,
                        backgroundColor: Colors.white,
                        child: Icon(
                          Icons.person_rounded,
                          color: AppTheme.primary,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              language.text('welcome'),
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              session.username.isEmpty
                                  ? language.text(session.role)
                                  : session.username,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 20,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              language.text(session.role) +
                                  ' • ' +
                                  AppConfig.appName,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: modules.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: columns,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.15,
                  ),
                  itemBuilder: (context, index) {
                    final item = modules[index];
                    return ModuleCard(
                      title: item.title,
                      icon: item.icon,
                      onTap: () {
                        if (session.role == 'admin' &&
                            item.title == 'طالبات') {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => AdminStudentsScreen(
                                backend: backend,
                                session: session,
                              ),
                            ),
                          );
                          return;
                        }

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(language.text('moduleSoon')),
                          ),
                        );
                      },
                    );
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  List<_Module> _modulesForRole(String role) {
    switch (role) {
      case 'teacher':
        return const [
          _Module('پروفائل', Icons.badge_rounded),
          _Module('میری جماعتیں', Icons.class_rounded),
          _Module('میری طالبات', Icons.groups_rounded),
          _Module('روزانہ حاضری', Icons.fact_check_rounded),
          _Module('سابقہ حاضری', Icons.history_rounded),
          _Module('نمبرات', Icons.stars_rounded),
          _Module('ہوم ورک', Icons.assignment_rounded),
          _Module('اعلانات', Icons.campaign_rounded),
          _Module('Feedback', Icons.forum_rounded),
          _Module('Documents', Icons.folder_rounded),
          _Module('Notifications', Icons.notifications_rounded),
          _Module('Settings', Icons.settings_rounded),
        ];
      case 'student':
        return const [
          _Module('پروفائل', Icons.badge_rounded),
          _Module('میری حاضری', Icons.fact_check_rounded),
          _Module('میرے نمبرات', Icons.stars_rounded),
          _Module('ہوم ورک', Icons.assignment_rounded),
          _Module('اعلانات', Icons.campaign_rounded),
          _Module('Feedback', Icons.forum_rounded),
          _Module('فیس', Icons.receipt_long_rounded),
          _Module('Documents', Icons.folder_rounded),
          _Module('طالبہ کارڈ / QR', Icons.qr_code_rounded),
          _Module('Hostel History', Icons.home_rounded),
          _Module('Promotion History', Icons.trending_up_rounded),
          _Module('Notifications', Icons.notifications_rounded),
          _Module('Settings', Icons.settings_rounded),
        ];
      default:
        return const [
          _Module('طالبات', Icons.school_rounded),
          _Module('اساتذہ', Icons.co_present_rounded),
          _Module('Student Applications', Icons.person_add_alt_1_rounded),
          _Module('Teacher Applications', Icons.how_to_reg_rounded),
          _Module('حاضری', Icons.fact_check_rounded),
          _Module('نمبرات', Icons.stars_rounded),
          _Module('ہوم ورک', Icons.assignment_rounded),
          _Module('اعلانات', Icons.campaign_rounded),
          _Module('Feedback', Icons.forum_rounded),
          _Module('Hostel / Movement', Icons.home_work_rounded),
          _Module('Fees / Finance', Icons.account_balance_wallet_rounded),
          _Module('Salary / Payroll', Icons.payments_rounded),
          _Module('Documents', Icons.folder_rounded),
          _Module('ID Cards / QR', Icons.qr_code_rounded),
          _Module('Annual Promotion', Icons.trending_up_rounded),
          _Module('Accounts', Icons.manage_accounts_rounded),
          _Module('Reports', Icons.analytics_rounded),
          _Module('Settings', Icons.settings_rounded),
          _Module('Audit Log', Icons.security_rounded),
        ];
    }
  }
}

class _Module {
  const _Module(this.title, this.icon);

  final String title;
  final IconData icon;
}
