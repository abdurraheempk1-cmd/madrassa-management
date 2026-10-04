(function () {
"use strict";

const App = window.App;
if (!App || (App.currentFile || "").toLowerCase() !== "attendance.html") return;

App.initTeacherAttendance = async function () {
    const session = await App.requireRole("teacher");
    if (!session) return;

    App.attendanceTeacherId = session.teacher_id || App.getTeacherId();

    const selectionForm = App.el("attendanceSelectionForm");
    const dateInput = App.el("attendanceDate");
    const classSelect = App.el("attendanceClass");
    const periodSelect = App.el("attendancePeriod");
    const loadButton = App.el("loadAttendanceButton");

    const sessionSection = App.el("attendanceSessionSection");
    const quickSection = App.el("attendanceQuickActions");
    const studentsSection = App.el("attendanceStudentsSection");
    const studentList = App.el("attendanceStudentList");
    const saveButton = App.el("saveAttendanceButton");

    const historyForm = App.el("teacherAttendanceHistoryForm");
    const historyDate = App.el("attendanceHistoryDate");
    const historyClass = App.el("attendanceHistoryClass");
    const historyPeriod = App.el("attendanceHistoryPeriod");
    const historyBody = App.el("teacherAttendanceHistoryBody");
    const clearHistory = App.el("clearAttendanceHistory");

    const messageBox = App.el("attendanceMessage");

    if (dateInput && !dateInput.value) {
        dateInput.value = App.currentISODate();
    }

    function showMessage(text, type) {
        if (!messageBox) return;
        messageBox.textContent = text || "";
        messageBox.classList.remove("success","error","warning","info");
        if (["success","error","warning","info"].includes(type)) {
            messageBox.classList.add(type);
        }
        messageBox.hidden = !text;
    }

    function updateCurrentCounts() {
        const selects = Array.from(document.querySelectorAll("[data-attendance-status]"));
        let present = 0, absent = 0, leave = 0;

        selects.forEach(select => {
            if (select.value === "present") present += 1;
            if (select.value === "absent") absent += 1;
            if (select.value === "leave") leave += 1;
        });

        App.setText("currentPresentCount",present,"0");
        App.setText("currentAbsentCount",absent,"0");
        App.setText("currentLeaveCount",leave,"0");
    }

    function bindRenderedRows() {
        document.querySelectorAll("[data-attendance-status]").forEach(select => {
            select.addEventListener("change",updateCurrentCounts);
        });
        updateCurrentCounts();
    }

    async function loadStudents(event) {
        event?.preventDefault?.();

        const date = App.safe(dateInput?.value).trim();
        const className = App.safe(classSelect?.value).trim();
        const period = Number(periodSelect?.value || 0);

        if (!date || !className || !period) {
            showMessage("تاریخ، جماعت اور پیریڈ منتخب کریں۔","error");
            return;
        }

        if (loadButton) loadButton.disabled = true;
        showMessage("طالبات لوڈ ہو رہی ہیں...","info");

        try {
            const response = await App.authedRpc(
                "attendance_get_students",
                {p_class: className}
            );

            App.attendanceStudents = App.asArray(response);
            App.renderAttendanceStudents();

            App.setText("selectedAttendanceDate",App.date(date),date);
            App.setText("selectedAttendanceClass",className,className);
            App.setText("selectedAttendancePeriod",period,String(period));
            App.setText(
                "attendanceStudentCount",
                App.attendanceStudents.length + " طالبات",
                "0 طالبات"
            );

            if (sessionSection) sessionSection.hidden = false;
            if (quickSection) quickSection.hidden = false;
            if (studentsSection) studentsSection.hidden = false;

            bindRenderedRows();

            showMessage(
                App.attendanceStudents.length
                    ? "طالبات کامیابی سے لوڈ ہوگئیں۔"
                    : "اس جماعت میں کوئی طالبہ موجود نہیں۔",
                App.attendanceStudents.length ? "success" : "warning"
            );
        } catch (error) {
            console.error("Teacher attendance students:",error);
            if (studentList) {
                studentList.innerHTML = App.empty("طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔");
            }
            showMessage(error?.message || "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔","error");
        } finally {
            if (loadButton) loadButton.disabled = false;
        }
    }

    function markAll(status) {
        document.querySelectorAll("[data-attendance-status]").forEach(select => {
            select.value = status;
        });
        updateCurrentCounts();
    }

    App.el("markAllPresentButton")?.addEventListener("click",() => markAll("present"));
    App.el("markAllAbsentButton")?.addEventListener("click",() => markAll("absent"));
    App.el("markAllLeaveButton")?.addEventListener("click",() => markAll("leave"));

    if (selectionForm) {
        selectionForm.addEventListener("submit",loadStudents);
    } else if (loadButton) {
        loadButton.addEventListener("click",loadStudents);
    }

    function renderHistory(records) {
        records = Array.isArray(records) ? records : [];
        if (!historyBody) return;

        historyBody.innerHTML = records.length
            ? records.map(row =>
                "<tr>" +
                    "<td>" + App.escape(App.date(row.attendance_date)) + "</td>" +
                    "<td>" + App.escape(row.period_number || row.period || "—") + "</td>" +
                    "<td>" + App.escape(row.student_class || row.class_name || "—") + "</td>" +
                    "<td>" + App.escape(row.student_name || row.name || row.student_id || "—") + "</td>" +
                    "<td>" + App.escape(App.statusUrdu(row.status)) + "</td>" +
                    "<td>" + App.escape(row.note || row.notes || "—") + "</td>" +
                "</tr>"
            ).join("")
            : '<tr><td colspan="6" class="table-empty">کوئی حاضری ریکارڈ موجود نہیں۔</td></tr>';
    }

    async function loadHistory(event, quiet) {
        event?.preventDefault?.();

        const date = App.safe(historyDate?.value).trim();
        const className = App.safe(historyClass?.value).trim();
        const periodText = App.safe(historyPeriod?.value).trim();

        if (!quiet) showMessage("سابقہ حاضری لوڈ ہو رہی ہے...","info");

        try {
            let records = [];

            if (periodText) {
                records =
                    App.asArray(
                        await App.authedRpc(
                            "attendance_get_records",
                            {
                                p_date: date || null,
                                p_period: Number(periodText),
                                p_class: className || null,
                                p_teacher_id: App.attendanceTeacherId
                            }
                        )
                    );
            } else {
                /*
                   The backend attendance_get_records RPC does not reliably
                   treat NULL period as "all periods". Load periods 1..6
                   separately, then merge them on the page.
                */
                const settled =
                    await Promise.allSettled(
                        [1,2,3,4,5,6].map(
                            period =>
                                App.authedRpc(
                                    "attendance_get_records",
                                    {
                                        p_date: date || null,
                                        p_period: period,
                                        p_class: className || null,
                                        p_teacher_id: App.attendanceTeacherId
                                    }
                                )
                        )
                    );

                records =
                    settled
                        .filter(
                            result =>
                                result.status === "fulfilled"
                        )
                        .flatMap(
                            result =>
                                App.asArray(
                                    result.value
                                )
                        )
                        .sort(
                            (a,b) => {
                                const ad =
                                    App.safe(
                                        a.attendance_date
                                    );

                                const bd =
                                    App.safe(
                                        b.attendance_date
                                    );

                                if (ad !== bd) {
                                    return bd.localeCompare(ad);
                                }

                                return (
                                    Number(
                                        a.period_number ||
                                        a.period ||
                                        0
                                    ) -
                                    Number(
                                        b.period_number ||
                                        b.period ||
                                        0
                                    )
                                );
                            }
                        );
            }

            renderHistory(records);

            if (!quiet) {
                showMessage(
                    records.length
                        ? "سابقہ حاضری لوڈ ہوگئی۔"
                        : "کوئی سابقہ حاضری ریکارڈ نہیں ملا۔",
                    records.length ? "success" : "warning"
                );
            }
        } catch (error) {
            console.error("Teacher attendance history:",error);
            renderHistory([]);
            if (!quiet) {
                showMessage(error?.message || "سابقہ حاضری لوڈ نہیں ہو سکی۔","error");
            }
        }
    }

    if (historyForm) {
        historyForm.addEventListener("submit",loadHistory);
    }

    if (clearHistory) {
        clearHistory.addEventListener("click",function () {
            historyForm?.reset();
            if (historyBody) {
                historyBody.innerHTML =
                    '<tr><td colspan="6" class="table-empty">ریکارڈ تلاش کرنے کے لیے اوپر سے انتخاب کریں۔</td></tr>';
            }
            showMessage("","");
        });
    }

    if (saveButton) {
        saveButton.addEventListener("click",async function () {
            saveButton.disabled = true;
            try {
                await App.saveAttendance();
                await loadHistory(null,true);
            } finally {
                saveButton.disabled = false;
            }
        });
    }
};

})();