import 'package:flutter/material.dart';

import '../core/app_config.dart';
import '../core/app_theme.dart';
import '../models/app_session.dart';
import '../services/backend_service.dart';

class AdminStudentsScreen extends StatefulWidget {
  const AdminStudentsScreen({
    super.key,
    required this.backend,
    required this.session,
  });

  final BackendService backend;
  final AppSession session;

  @override
  State<AdminStudentsScreen> createState() => _AdminStudentsScreenState();
}

class _AdminStudentsScreenState extends State<AdminStudentsScreen> {
  final TextEditingController _search = TextEditingController();
  late Future<List<Map<String, dynamic>>> _students;
  String _selectedClass = '';

  @override
  void initState() {
    super.initState();
    _students = _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<List<Map<String, dynamic>>> _load() {
    return widget.backend.getAdminStudents(widget.session.token);
  }

  Future<void> _refresh() async {
    setState(() {
      _students = _load();
    });
    await _students;
  }

  String _text(Map<String, dynamic> row, String key) {
    return row[key]?.toString().trim() ?? '';
  }

  List<Map<String, dynamic>> _filter(
    List<Map<String, dynamic>> source,
  ) {
    final query = _search.text.trim().toLowerCase();

    return source.where((student) {
      if (_selectedClass.isNotEmpty &&
          _text(student, 'student_class') != _selectedClass) {
        return false;
      }

      if (query.isEmpty) return true;

      final haystack = <String>[
        _text(student, 'name'),
        _text(student, 'father_name'),
        _text(student, 'guardian_name'),
        _text(student, 'admission_no'),
        _text(student, 'cnic'),
        _text(student, 'phone'),
        _text(student, 'student_class'),
        _text(student, 'address'),
      ].join(' ').toLowerCase();

      return haystack.contains(query);
    }).toList();
  }

  void _openStudent(Map<String, dynamic> student) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      showDragHandle: true,
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.72,
          minChildSize: 0.45,
          maxChildSize: 0.94,
          builder: (context, controller) {
            return ListView(
              controller: controller,
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 28),
              children: [
                const Icon(
                  Icons.school_rounded,
                  size: 46,
                  color: AppTheme.primary,
                ),
                const SizedBox(height: 8),
                Text(
                  _text(student, 'name').isEmpty
                      ? 'طالبہ'
                      : _text(student, 'name'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 18),
                _detail('داخلہ / وفاق نمبر', _text(student, 'admission_no')),
                _detail('والد کا نام', _text(student, 'father_name')),
                _detail('سرپرست', _text(student, 'guardian_name')),
                _detail('جماعت', _text(student, 'student_class')),
                _detail('فون', _text(student, 'phone')),
                _detail('CNIC / B-Form', _text(student, 'cnic')),
                _detail('تاریخ پیدائش', _text(student, 'date_of_birth')),
                _detail('رہائش', _text(student, 'residence_type')),
                _detail('پتہ', _text(student, 'address')),
              ],
            );
          },
        );
      },
    );
  }

  Widget _detail(String label, String value) {
    final shown = value.isEmpty ? '—' : value;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F9F8),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5EAE7)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.black54,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              shown,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('طالبات'),
        actions: [
          IconButton(
            onPressed: _refresh,
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'دوبارہ لوڈ کریں',
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _students,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      size: 50,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 14),
                    FilledButton.icon(
                      onPressed: _refresh,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('دوبارہ کوشش کریں'),
                    ),
                  ],
                ),
              ),
            );
          }

          final all = snapshot.data ?? <Map<String, dynamic>>[];
          final filtered = _filter(all);

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.all(14),
              children: [
                TextField(
                  controller: _search,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    labelText: 'طالبہ تلاش کریں',
                    hintText: 'نام، والد، داخلہ نمبر، فون یا CNIC',
                    prefixIcon: Icon(Icons.search_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  key: ValueKey(_selectedClass),
                  initialValue: _selectedClass,
                  decoration: const InputDecoration(
                    labelText: 'جماعت',
                    prefixIcon: Icon(Icons.class_rounded),
                  ),
                  items: <DropdownMenuItem<String>>[
                    const DropdownMenuItem(
                      value: '',
                      child: Text('تمام جماعتیں'),
                    ),
                    ...AppConfig.classes.map(
                      (name) => DropdownMenuItem(
                        value: name,
                        child: Text(name),
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedClass = value ?? '';
                    });
                  },
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    const Icon(
                      Icons.groups_rounded,
                      color: AppTheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'کل ریکارڈ: ' + filtered.length.toString(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (filtered.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 36),
                    child: Center(
                      child: Text('کوئی مماثل طالبہ نہیں ملی۔'),
                    ),
                  )
                else
                  ...filtered.map(
                    (student) => Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      clipBehavior: Clip.antiAlias,
                      child: InkWell(
                        onTap: () => _openStudent(student),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              const CircleAvatar(
                                backgroundColor: AppTheme.softGreen,
                                child: Icon(
                                  Icons.school_rounded,
                                  color: AppTheme.primary,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _text(student, 'name').isEmpty
                                          ? '—'
                                          : _text(student, 'name'),
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(height: 5),
                                    Text(
                                      'داخلہ نمبر: ' +
                                          (_text(student, 'admission_no')
                                                  .isEmpty
                                              ? '—'
                                              : _text(
                                                  student,
                                                  'admission_no',
                                                )),
                                    ),
                                    Text(
                                      'والد: ' +
                                          (_text(student, 'father_name')
                                                  .isEmpty
                                              ? '—'
                                              : _text(
                                                  student,
                                                  'father_name',
                                                )),
                                    ),
                                    Text(
                                      'جماعت: ' +
                                          (_text(student, 'student_class')
                                                  .isEmpty
                                              ? '—'
                                              : _text(
                                                  student,
                                                  'student_class',
                                                )),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_left_rounded),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
