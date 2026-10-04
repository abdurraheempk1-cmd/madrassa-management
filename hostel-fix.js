(function () {
"use strict";

const App = window.App;
if (!App || (App.currentFile || "").toLowerCase() !== "admin-hostel.html") return;

/* Replace the old incomplete movement-page initializer before App.start runs. */
App.initHostelPage = async function () {
    const session = await App.requireRole("admin");
    if (!session) return;

    const studentSelect = App.el("hostelStudentId");
    const studentSearch = App.el("hostelStudentSearch");
    const classFilter = App.el("hostelClassFilter");
    const mahramSelect = App.el("hostelMahramId");
    const movementSelect = App.el("hostelMovementId");
    const historyBody = App.el("hostelHistoryBody");
    const pageMessage = App.el("hostelPageMessage");
    const meta = App.el("hostelStudentMeta");
    const exitForm = App.el("hostelExitForm");
    const returnForm = App.el("hostelReturnForm");
    const exitSubmit = App.el("hostelExitSubmit");
    const returnSubmit = App.el("hostelReturnSubmit");

    let students = [];
    let filteredStudents = [];
    let currentHistory = [];

    function message(text, kind) {
        if (!pageMessage) return;
        pageMessage.textContent = text || "";
        pageMessage.classList.remove("error","success");
        if (kind === "error" || kind === "success") pageMessage.classList.add(kind);
    }

    function setFormsEnabled(enabled) {
        [exitForm, returnForm].forEach(form => {
            if (!form) return;
            form.classList.toggle("hostel-actions-disabled", !enabled);
        });
        if (exitSubmit) exitSubmit.disabled = !enabled;
        if (returnSubmit) returnSubmit.disabled = !enabled;
    }

    function asList(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch (_) {
                return [];
            }
        }
        if (typeof value === "object") {
            if (Array.isArray(value.data)) return value.data;
            if (Array.isArray(value.items)) return value.items;
        }
        return [];
    }

    function findMahrams(root) {
        const seen = new Set();
        const queue = [root];

        while (queue.length) {
            const value = queue.shift();
            if (!value || typeof value !== "object" || seen.has(value)) continue;
            seen.add(value);

            if (!Array.isArray(value)) {
                for (const key of ["mahrams","student_mahrams","approved_mahrams"]) {
                    if (Object.prototype.hasOwnProperty.call(value,key)) {
                        const list = asList(value[key]);
                        if (list.length) return list;
                    }
                }
                Object.values(value).forEach(v => {
                    if (v && typeof v === "object") queue.push(v);
                });
            }
        }

        return [];
    }

    function normalizeMahram(item, index) {
        if (!item || typeof item !== "object") return null;
        const id = Number(
            item.id ||
            item.mahram_id ||
            item.student_mahram_id ||
            item.value ||
            0
        );
        const name = App.safe(
            item.name ||
            item.mahram_name ||
            item.full_name ||
            item.person_name ||
            ""
        ).trim();
        const relation = App.safe(
            item.relation ||
            item.relationship ||
            item.mahram_relation ||
            ""
        ).trim();
        const phone = App.safe(item.phone || item.mobile || "").trim();
        const cnic = App.safe(item.cnic || item.cnic_no || item.identity_no || "").trim();

        if (!id && !name) return null;

        return {
            id,
            name: name || ("محرم " + (index + 1)),
            relation,
            phone,
            cnic
        };
    }

    function renderHistory(history, selectedStudent) {
        currentHistory = Array.isArray(history) ? history : [];

        if (!historyBody) return;

        if (!currentHistory.length) {
            historyBody.innerHTML =
                '<tr><td colspan="7" class="hostel-history-empty">کوئی آمد و رفت ریکارڈ موجود نہیں۔</td></tr>';
        } else {
            historyBody.innerHTML = currentHistory.map(item => {
                const returned =
                    item.returned_at ||
                    item.return_at ||
                    item.returned_date ||
                    null;

                const studentName =
                    item.student_name ||
                    selectedStudent?.name ||
                    students.find(s => Number(s.id) === Number(item.student_id))?.name ||
                    "—";

                return '<tr>' +
                    '<td>' + App.escape(studentName) + '</td>' +
                    '<td>' + App.escape(App.dateTime(item.exit_at || item.exited_at || item.created_at)) + '</td>' +
                    '<td>' + App.escape(item.mahram_name || item.exit_person_name || "—") + '</td>' +
                    '<td>' + App.escape(item.destination || "—") + '</td>' +
                    '<td>' + App.escape(item.reason || "—") + '</td>' +
                    '<td>' + App.escape(returned ? App.dateTime(returned) : "—") + '</td>' +
                    '<td>' + App.escape(App.statusUrdu(item.status || (returned ? "returned" : "out"))) + '</td>' +
                '</tr>';
            }).join("");
        }

        if (movementSelect) {
            const openRows = currentHistory.filter(item => {
                const returned =
                    item.returned_at ||
                    item.return_at ||
                    item.returned_date;
                const status = App.safe(item.status).toLowerCase();
                return !returned && !["returned","closed","واپس"].includes(status);
            });

            movementSelect.innerHTML =
                '<option value="">واپسی کے لیے خروج ریکارڈ منتخب کریں</option>' +
                openRows.map(item => {
                    const id = Number(item.id || item.movement_id || 0);
                    const when = App.dateTime(item.exit_at || item.exited_at || item.created_at);
                    const person = item.mahram_name || item.exit_person_name || "";
                    return '<option value="' + id + '">' +
                        App.escape(when + (person ? " — " + person : "")) +
                    '</option>';
                }).join("");

            movementSelect.disabled = openRows.length === 0;
            if (returnSubmit) returnSubmit.disabled = openRows.length === 0;
        }
    }

    function studentMatchesFilters(student) {
        const query = App.safe(studentSearch?.value).trim().toLowerCase();
        const klass = App.safe(classFilter?.value).trim();

        if (klass && App.safe(student.student_class).trim() !== klass) {
            return false;
        }

        if (!query) return true;

        const haystack = [
            student.name,
            student.father_name,
            student.guardian_name,
            student.admission_no,
            student.phone,
            student.cnic,
            student.student_class
        ].map(v => App.safe(v).toLowerCase()).join(" ");

        return haystack.includes(query);
    }

    function refreshStudentSelect() {
        if (!studentSelect) return;

        const previous = studentSelect.value;
        filteredStudents = students.filter(studentMatchesFilters);

        studentSelect.innerHTML =
            '<option value="">ایک طالبہ منتخب کریں</option>' +
            '<option value="all">تمام طالبات (' + filteredStudents.length + ')</option>' +
            filteredStudents.map(student => {
                const residence = App.safe(student.residence_type).trim();
                const label =
                    (student.admission_no || "—") +
                    " — " +
                    (student.name || "—") +
                    (student.student_class ? " — " + student.student_class : "") +
                    (residence ? " — " + residence : "");

                return '<option value="' + Number(student.id) + '">' +
                    App.escape(label) +
                '</option>';
            }).join("");

        if ([...studentSelect.options].some(o => o.value === previous)) {
            studentSelect.value = previous;
        } else {
            studentSelect.value = "";
        }

        studentSelect.disabled = filteredStudents.length === 0;

        if (!filteredStudents.length) {
            message("اس تلاش / جماعت میں کوئی طالبہ نہیں ملی۔", "error");
        } else {
            message("ایک طالبہ یا تمام طالبات منتخب کریں۔");
        }
    }

    async function loadAllFilteredStudents() {
        setFormsEnabled(false);

        if (mahramSelect) {
            mahramSelect.innerHTML = '<option value="">تمام طالبات میں روانگی درج نہیں کی جا سکتی</option>';
            mahramSelect.disabled = true;
        }

        if (movementSelect) {
            movementSelect.innerHTML = '<option value="">واپسی کے لیے ایک طالبہ منتخب کریں</option>';
            movementSelect.disabled = true;
        }

        if (meta) {
            meta.textContent =
                "کل طالبات: " + filteredStudents.length +
                (classFilter?.value ? " | جماعت: " + classFilter.value : " | تمام جماعتیں");
        }

        if (!filteredStudents.length) {
            renderHistory([]);
            message("کوئی طالبہ موجود نہیں۔", "error");
            return;
        }

        message("تمام منتخب طالبات کی آمد و رفت کی تاریخ لوڈ ہو رہی ہے...");

        const settled = await Promise.allSettled(
            filteredStudents.map(student =>
                App.getStudentHostelHistory(Number(student.id))
                    .then(history =>
                        App.asArray(history).map(item => ({
                            ...item,
                            student_id: item.student_id || student.id,
                            student_name: item.student_name || student.name
                        }))
                    )
            )
        );

        const combined = settled
            .filter(r => r.status === "fulfilled")
            .flatMap(r => r.value)
            .sort((a,b) => {
                const da = new Date(a.exit_at || a.exited_at || a.created_at || 0).getTime();
                const db = new Date(b.exit_at || b.exited_at || b.created_at || 0).getTime();
                return db - da;
            });

        renderHistory(combined);
        message(
            "تمام طالبات کی تاریخ دکھائی جا رہی ہے۔ روانگی یا واپسی درج کرنے کے لیے ایک طالبہ منتخب کریں۔",
            "success"
        );
    }

    async function loadSelectedStudent() {
        const selectedValue = App.safe(studentSelect?.value).trim();

        if (selectedValue === "all") {
            await loadAllFilteredStudents();
            return;
        }

        const studentId = Number(selectedValue || 0);

        if (!studentId) {
            setFormsEnabled(false);
            if (mahramSelect) {
                mahramSelect.innerHTML = '<option value="">پہلے طالبہ منتخب کریں</option>';
                mahramSelect.disabled = true;
            }
            if (movementSelect) {
                movementSelect.innerHTML = '<option value="">پہلے طالبہ منتخب کریں</option>';
                movementSelect.disabled = true;
            }
            if (historyBody) {
                historyBody.innerHTML =
                    '<tr><td colspan="7" class="hostel-history-empty">طالبہ منتخب کریں۔</td></tr>';
            }
            if (meta) meta.textContent = "";
            message("طالبہ منتخب کریں۔");
            return;
        }

        const student = students.find(x => Number(x.id) === studentId) || null;

        setFormsEnabled(false);
        message("طالبہ کا ریکارڈ لوڈ ہو رہا ہے...");

        if (meta && student) {
            meta.textContent =
                "جماعت: " + (student.student_class || "—") +
                " | رہائش: " + (student.residence_type || "—") +
                " | داخلہ نمبر: " + (student.admission_no || "—");
        }

        const results = await Promise.allSettled([
            App.getStudentHostelHistory(studentId),
            App.fetchCompleteProfile("student", studentId)
        ]);

        const history =
            results[0].status === "fulfilled"
                ? App.asArray(results[0].value)
                : [];

        renderHistory(history, student);

        let profile =
            results[1].status === "fulfilled"
                ? (results[1].value?.data || results[1].value || {})
                : {};

        let mahrams = findMahrams(profile);

        if (!mahrams.length && student) {
            mahrams = findMahrams(student);
        }

        const normalized =
            mahrams
                .map(normalizeMahram)
                .filter(Boolean);

        if (mahramSelect) {
            if (normalized.length) {
                mahramSelect.innerHTML =
                    '<option value="">منظور شدہ محرم منتخب کریں</option>' +
                    normalized.map(m => {
                        const detail = [
                            m.relation,
                            m.cnic,
                            m.phone
                        ].filter(Boolean).join(" — ");

                        return '<option value="' + Number(m.id) + '">' +
                            App.escape(m.name + (detail ? " — " + detail : "")) +
                        '</option>';
                    }).join("");

                mahramSelect.disabled = false;
            } else {
                mahramSelect.innerHTML =
                    '<option value="">اس طالبہ کا منظور شدہ محرم ریکارڈ نہیں ملا</option>';
                mahramSelect.disabled = true;
            }
        }

        if (exitSubmit) exitSubmit.disabled = normalized.length === 0;
        if (exitForm) exitForm.classList.toggle("hostel-actions-disabled", normalized.length === 0);

        if (movementSelect) {
            const hasOpen = !movementSelect.disabled && movementSelect.options.length > 1;
            if (returnForm) returnForm.classList.toggle("hostel-actions-disabled", !hasOpen);
            if (returnSubmit) returnSubmit.disabled = !hasOpen;
        }

        if (results[0].status === "rejected" && results[1].status === "rejected") {
            message("طالبہ کی آمد و رفت کی معلومات لوڈ نہیں ہو سکیں۔", "error");
        } else if (!normalized.length) {
            message("طالبہ منتخب ہوگئی، لیکن منظور شدہ محرم موجود نہیں۔ پہلے طالبہ کے ریکارڈ میں محرم شامل کریں۔", "error");
        } else {
            message("طالبہ اور منظور شدہ محرم کی معلومات تیار ہیں۔", "success");
        }
    }

    try {
        students = App.asArray(await App.authedRpc("admin_get_students"))
            .filter(item => Number(item?.id) > 0)
            .sort((a,b) => App.safe(a.name).localeCompare(App.safe(b.name),"ur"));

        if (classFilter) {
            classFilter.innerHTML =
                '<option value="">تمام جماعتیں</option>' +
                (Array.isArray(App.CLASSES) ? App.CLASSES : [])
                    .map(klass =>
                        '<option value="' + App.escape(klass) + '">' +
                            App.escape(klass) +
                        '</option>'
                    )
                    .join("");
        }

        filteredStudents = students.slice();
        refreshStudentSelect();

        if (!students.length) {
            message("کوئی طالبہ موجود نہیں۔", "error");
        }

    } catch (error) {
        console.error("Movement students:", error);
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">طالبات لوڈ نہیں ہو سکیں</option>';
            studentSelect.disabled = true;
        }
        message(error?.message || "طالبات لوڈ نہیں ہو سکیں۔", "error");
        return;
    }

    if (studentSelect) {
        studentSelect.addEventListener("change", loadSelectedStudent);
    }

    if (studentSearch) {
        studentSearch.addEventListener("input", function () {
            refreshStudentSelect();
            loadSelectedStudent();
        });
    }

    if (classFilter) {
        classFilter.addEventListener("change", function () {
            refreshStudentSelect();
            loadSelectedStudent();
        });
    }

    if (exitForm) {
        exitForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const studentId = Number(studentSelect?.value || 0);
            const mahramId = Number(mahramSelect?.value || 0);

            if (!studentId) {
                message("پہلے طالبہ منتخب کریں۔", "error");
                studentSelect?.focus();
                return;
            }

            if (!mahramId) {
                message("منظور شدہ محرم منتخب کریں۔", "error");
                mahramSelect?.focus();
                return;
            }

            if (exitSubmit) exitSubmit.disabled = true;

            try {
                await App.authedRpc("admin_hostel_exit", {
                    p_student_id: studentId,
                    p_mahram_id: mahramId,
                    p_destination: App.val("hostelDestination") || null,
                    p_reason: App.val("hostelReason") || null,
                    p_notes: App.val("hostelExitNotes") || null
                });

                message("طالبہ کی روانگی محفوظ ہوگئی۔", "success");

                App.el("hostelDestination").value = "";
                App.el("hostelReason").value = "";
                App.el("hostelExitNotes").value = "";
                mahramSelect.value = "";

                await loadSelectedStudent();

            } catch (error) {
                console.error("Hostel exit:", error);
                message(error?.message || "روانگی محفوظ نہیں ہو سکی۔", "error");
            } finally {
                if (exitSubmit && !mahramSelect?.disabled) exitSubmit.disabled = false;
            }
        });
    }

    if (returnForm) {
        returnForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const movementId = Number(movementSelect?.value || 0);

            if (!movementId) {
                message("واپسی کے لیے خروج ریکارڈ منتخب کریں۔", "error");
                movementSelect?.focus();
                return;
            }

            const personName = App.val("hostelReturnPersonName");
            if (!personName) {
                message("ساتھ لانے والے شخص کا نام درج کریں۔", "error");
                App.el("hostelReturnPersonName")?.focus();
                return;
            }

            if (returnSubmit) returnSubmit.disabled = true;

            try {
                await App.authedRpc("admin_hostel_return", {
                    p_movement_id: movementId,
                    p_return_person_name: personName,
                    p_return_person_relation: App.val("hostelReturnRelation") || null,
                    p_return_person_cnic: App.normalizeDigits(App.val("hostelReturnCNIC")) || null,
                    p_return_person_phone: App.normalizePhone(App.val("hostelReturnPhone")) || null,
                    p_notes: App.val("hostelReturnNotes") || null
                });

                message("طالبہ کی واپسی محفوظ ہوگئی۔", "success");

                ["hostelReturnPersonName","hostelReturnRelation","hostelReturnCNIC","hostelReturnPhone","hostelReturnNotes"]
                    .forEach(id => {
                        const node = App.el(id);
                        if (node) node.value = "";
                    });

                await loadSelectedStudent();

            } catch (error) {
                console.error("Hostel return:", error);
                message(error?.message || "واپسی محفوظ نہیں ہو سکی۔", "error");
            }
        });
    }

    setFormsEnabled(false);
};

})();