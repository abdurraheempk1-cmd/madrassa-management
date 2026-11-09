enum AppLanguage {
  ur,
  en,
  ar,
  ps;

  String get code => name;

  bool get isRtl => this != AppLanguage.en;

  String get nativeName {
    switch (this) {
      case AppLanguage.ur:
        return 'اردو';
      case AppLanguage.en:
        return 'English';
      case AppLanguage.ar:
        return 'العربية';
      case AppLanguage.ps:
        return 'پښتو';
    }
  }

  static AppLanguage fromCode(String? code) {
    return AppLanguage.values.firstWhere(
      (item) => item.code == code,
      orElse: () => AppLanguage.ur,
    );
  }

  String text(String key) {
    final values = _strings[key];
    if (values == null) return key;
    return values[code] ?? values['ur'] ?? key;
  }
}

const Map<String, Map<String, String>> _strings = {
  'selectLanguage': {
    'ur': 'زبان منتخب کریں',
    'en': 'Select language',
    'ar': 'اختر اللغة',
    'ps': 'ژبه وټاکئ',
  },
  'continue': {
    'ur': 'جاری رکھیں',
    'en': 'Continue',
    'ar': 'متابعة',
    'ps': 'دوام ورکړئ',
  },
  'username': {
    'ur': 'صارف نام',
    'en': 'Username',
    'ar': 'اسم المستخدم',
    'ps': 'کارن نوم',
  },
  'password': {
    'ur': 'پاس ورڈ',
    'en': 'Password',
    'ar': 'كلمة المرور',
    'ps': 'پټنوم',
  },
  'login': {
    'ur': 'لاگ اِن',
    'en': 'Login',
    'ar': 'تسجيل الدخول',
    'ps': 'ننوتل',
  },
  'loginAs': {
    'ur': 'اکاؤنٹ کی قسم',
    'en': 'Account type',
    'ar': 'نوع الحساب',
    'ps': 'د اکاونټ ډول',
  },
  'admin': {
    'ur': 'ایڈمن',
    'en': 'Admin',
    'ar': 'الإدارة',
    'ps': 'اډمین',
  },
  'teacher': {
    'ur': 'استاد',
    'en': 'Teacher',
    'ar': 'المعلم',
    'ps': 'استاد',
  },
  'student': {
    'ur': 'طالبہ',
    'en': 'Student',
    'ar': 'الطالبة',
    'ps': 'زده کوونکې',
  },
  'loggingIn': {
    'ur': 'لاگ اِن کیا جا رہا ہے...',
    'en': 'Signing in...',
    'ar': 'جارٍ تسجيل الدخول...',
    'ps': 'ننوتل روان دي...',
  },
  'invalidCredentials': {
    'ur': 'صارف نام، پاس ورڈ یا اکاؤنٹ کی حالت درست نہیں ہے۔',
    'en': 'Username, password, or account status is not valid.',
    'ar': 'اسم المستخدم أو كلمة المرور أو حالة الحساب غير صحيحة.',
    'ps': 'کارن نوم، پټنوم یا د اکاونټ حالت سم نه دی.',
  },
  'dashboard': {
    'ur': 'ڈیش بورڈ',
    'en': 'Dashboard',
    'ar': 'لوحة التحكم',
    'ps': 'ډشبورډ',
  },
  'welcome': {
    'ur': 'خوش آمدید',
    'en': 'Welcome',
    'ar': 'مرحباً',
    'ps': 'ښه راغلاست',
  },
  'logout': {
    'ur': 'لاگ آؤٹ',
    'en': 'Logout',
    'ar': 'تسجيل الخروج',
    'ps': 'وتل',
  },
  'moduleSoon': {
    'ur': 'یہ حصہ اگلے مرحلے میں فعال ہوگا۔',
    'en': 'This module will be connected in the next stage.',
    'ar': 'سيتم تفعيل هذا القسم في المرحلة التالية.',
    'ps': 'دا برخه به په بل پړاو کې فعاله شي.',
  },
};
