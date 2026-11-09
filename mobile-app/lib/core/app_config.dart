class AppConfig {
  AppConfig._();

  static const String appName = 'مدرسہ شہناز اختر للبنات';
  static const String address = 'گاؤں ہل غورغشتوں، ضلع بونیر';

  static const String supabaseUrl =
      'https://ggtnetudnjsmsmitvjmb.supabase.co';

  // Publishable client key. Never place a service-role key in the mobile app.
  static const String supabasePublishableKey =
      'sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s';

  static const Duration inactivityTimeout = Duration(minutes: 5);
}
