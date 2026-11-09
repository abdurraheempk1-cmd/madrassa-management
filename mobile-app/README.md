# Madrassa Mobile App

Flutter Android application for:

**مدرسہ شہناز اختر للبنات**  
گاؤں ہل غورغشتوں، ضلع بونیر

## Current build

This first runnable mobile foundation includes:

- Urdu-first RTL interface
- Urdu / English / Arabic / Pashto language selection
- Existing Admin / Teacher / Student account login
- Existing Supabase backend
- Existing `login_session` and `app_session_validate` RPCs
- Role-based dashboards
- Encrypted local session-token storage
- 5-minute inactivity logout
- Server logout via `logout_session`
- GitHub Actions APK build

## Security

The app uses the project's Supabase publishable client key. No service-role key is stored in the app.

The custom session token returned by the backend is stored with `flutter_secure_storage`.

## APK

The GitHub Actions workflow at:

`.github/workflows/mobile-apk.yml`

generates the Android platform project in CI, builds a release APK, and uploads it as a workflow artifact.

This avoids mixing generated Flutter Android files with the existing website files.

## Next development stage

Connect each dashboard card to the existing secure RPCs for:

- students
- teachers
- approvals
- attendance
- marks
- homework
- announcements
- feedback
- hostel movement
- finance/payroll
- documents
- ID cards/QR
- promotions
- reports
- account management
