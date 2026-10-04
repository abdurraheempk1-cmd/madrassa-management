(function () {
"use strict";

const App = window.App;
if (!App || (App.currentFile || "").toLowerCase() !== "admin-hostel.html") return;

/*
  Movement workflow:
  1) Search/select STUDENT -> show all approved mahrams for that student.
  2) Search/select MAHRAM -> show all connected students, choose one or all.
  3) Departure is saved once per selected student using that student's
     own approved-mahram link.
*/
App.initHostelPage = async function () {
    const session = await App.requireRole("admin");
    if (!session) return;

    const studentSearch = App.el("hostelStudentSearch");
    const studentSelect = App.el("hostelStudentId");

    const globalMahramSearch = App.el("hostelMahramSearch");
    const globalMahramSelect = App.el("hostelGlobalMahramId");

    const connectedPanel = App.el("hostelConnectedStudentsPanel");
    const connectedList = App.el("hostelConnectedStudentsList");
    const selectAllConnected = App.el("hostelSelectAllConnected");
    const clearConnected = App.el("hostelClearConnected");
    const connectedCount = App.el("hostelConnectedSelectedCount");

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
    let mahramGroups = [];
    let currentMode = "";
    let selectedStudent = null;
    let selectedMahramGroup = null;
    let currentHistory = [];

    function message(text, kind) {
        if (!pageMessage) return;
        pageMessage.textContent = text || "";
        pageMessage.classList.remove("error","success");
        if (kind === "error" || kind === "success") pageMessage.classList.add(kind);
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
        if (!root || typeof root !== "object") return [];

        for (const key of ["mahrams","student_mahrams","approved_mahrams"]) {
            if (Object.prototype.hasOwnProperty.call(root,key)) {
                const list = asList(root[key]);
                if (list.length) return list;
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

        const phone = App.safe(
            item.phone ||
            item.mobile ||
            item.contact ||
            ""
        ).trim();

        const cnic = App.safe(
            item.cnic ||
            item.cnic_no ||
            item.identity_no ||
            ""
        ).trim();

        if (!id && !name && !phone && !cnic) return null;

        return {
            id,
            name: name || ("محرم " + (index + 1)),
            relation,
            phone,
            cnic
        };
    }

    function digits(value) {
        return App.normalizeDigits(App.safe(value)).replace(/\D/g,"");
    }

    function mahramKey(m) {
        const cnic = digits(m.cnic);
        if (cnic) return "cnic:" + cnic;

        const phone = digits(m.phone);
        const name = App.safe(m.name).trim().toLowerCase();

        if (phone) return "phone:" + phone + "|name:" + name;
        return "name:" + name;
    }

    function studentMahrams(student) {
        return findMahrams(student)
            .map(normalizeMahram)
            .filter(Boolean);
    }

    function buildMahramGroups() {
        const map = new Map();

        students.forEach(student => {
            studentMahrams(student).forEach((m,index) => {
                const key = mahramKey(m);

                if (!map.has(key)) {
                    map.set(key,{
                        key,
                        name:m.name,
                        cnic:m.cnic,
                        phone:m.phone,
                        relation:m.relation,
                        links:[]
                    });
                }

                map.get(key).links.push({
                    student,
                    mahram:m,
                    student_id:Number(student.id),
                    mahram_id:Number(m.id || 0),
                    link_index:index
                });
            });
        });

        mahramGroups = Array.from(map.values())
            .sort((a,b) => App.safe(a.name).localeCompare(App.safe(b.name),"ur"));
    }

    function studentLabel(student) {
        return [
            student.name || "—",
            student.admission_no || "",
            student.student_class || ""
        ].filter(Boolean).join(" — ");
    }

    function mahramLabel(group) {
        return [
            group.name || "—",
            group.cnic || "",
            group.phone || ""
        ].filter(Boolean).join(" — ");
    }

    function refreshStudentOptions() {
        if (!studentSelect) return;

        const q = App.safe(studentSearch?.value).trim().toLowerCase();

        const list = students.filter(student => {
            if (!q) return true;

            const haystack = [
                student.name,
                student.father_name,
                student.guardian_name,
                student.admission_no,
                student.phone,
                student.cnic,
                student.student_class
            ].map(v => App.safe(v).toLowerCase()).join(" ");

            return haystack.includes(q);
        });

        const previous = studentSelect.value;

        studentSelect.innerHTML =
            '<option value="">طالبہ منتخب کریں</option>' +
            list.map(student =>
                '<option value="' + Number(student.id) + '">' +
                    App.escape(studentLabel(student)) +
                '</option>'
            ).join("");

        if ([...studentSelect.options].some(o => o.value === previous)) {
            studentSelect.value = previous;
        }
    }

    function refreshMahramOptions() {
        if (!globalMahramSelect) return;

        const q = App.safe(globalMahramSearch?.value).trim().toLowerCase();
        const qDigits = digits(q);

        const list = mahramGroups.filter(group => {
            if (!q) return true;

            const text = [
                group.name,
                group.relation,
                group.cnic,
                group.phone
            ].map(v => App.safe(v).toLowerCase()).join(" ");

            if (text.includes(q)) return true;

            const numeric = digits(
                (group.cnic || "") + " " + (group.phone || "")
            );

            return qDigits && numeric.includes(qDigits);
        });

        const previous = globalMahramSelect.value;

        globalMahramSelect.innerHTML =
            '<option value="">محرم منتخب کریں</option>' +
            list.map(group =>
                '<option value="' + App.escape(group.key) + '">' +
                    App.escape(
                        mahramLabel(group) +
                        " — " +
                        group.links.length +
                        " طالبات"
                    ) +
                '</option>'
            ).join("");

        if ([...globalMahramSelect.options].some(o => o.value === previous)) {
            globalMahramSelect.value = previous;
        }
    }

    function resetConnectedStudents() {
        selectedMahramGroup = null;

        if (connectedPanel) connectedPanel.hidden = true;
        if (connectedList) connectedList.innerHTML = "";
        if (connectedCount) connectedCount.textContent = "0 منتخب";
    }

    function connectedCheckedLinks() {
        if (!connectedList || !selectedMahramGroup) return [];

        const ids = Array.from(
            connectedList.querySelectorAll(
                '[data-connected-student]:checked'
            )
        ).map(node => Number(node.value));

        return selectedMahramGroup.links.filter(
            link => ids.includes(Number(link.student_id))
        );
    }

    function updateConnectedCount() {
        const count = connectedCheckedLinks().length;
        if (connectedCount) connectedCount.textContent = count + " منتخب";
        if (exitSubmit && currentMode === "mahram") {
            exitSubmit.disabled = count === 0;
        }
    }

    function renderConnectedStudents(group) {
        selectedMahramGroup = group || null;

        if (!connectedPanel || !connectedList) return;

        if (!group || !group.links.length) {
            connectedPanel.hidden = true;
            connectedList.innerHTML = "";
            updateConnectedCount();
            return;
        }

        connectedPanel.hidden = false;

        connectedList.innerHTML = group.links.map(link => {
            const student = link.student;

            return '<label class="connected-student-row">' +
                '<input type="checkbox" data-connected-student value="' +
                    Number(student.id) +
                    '" checked>' +
                '<span>' +
                    '<strong>' + App.escape(student.name || "—") + '</strong>' +
                    '<small>' + App.escape(
                        [
                            student.admission_no || "",
                            student.student_class || "",
                            link.mahram.relation || ""
                        ].filter(Boolean).join(" — ")
                    ) + '</small>' +
                '</span>' +
            '</label>';
        }).join("");

        connectedList
            .querySelectorAll("[data-connected-student]")
            .forEach(node => {
                node.addEventListener("change",updateConnectedCount);
            });

        updateConnectedCount();
    }

    function setExitModeEnabled(enabled) {
        if (exitForm) {
            exitForm.classList.toggle(
                "hostel-actions-disabled",
                !enabled
            );
        }

        if (exitSubmit) {
            exitSubmit.disabled = !enabled;
        }
    }

    function setReturnEnabled(enabled) {
        if (returnForm) {
            returnForm.classList.toggle(
                "hostel-actions-disabled",
                !enabled
            );
        }

        if (returnSubmit) {
            returnSubmit.disabled = !enabled;
        }
    }

    function renderHistory(history, fallbackStudent) {
        currentHistory = Array.isArray(history) ? history : [];

        if (historyBody) {
            if (!currentHistory.length) {
                historyBody.innerHTML =
                    '<tr><td colspan="7" class="hostel-history-empty">' +
                    'کوئی آمد و رفت ریکارڈ موجود نہیں۔' +
                    '</td></tr>';
            } else {
                historyBody.innerHTML = currentHistory.map(item => {
                    const returned =
                        item.returned_at ||
                        item.return_at ||
                        item.returned_date ||
                        null;

                    const student =
                        students.find(
                            s => Number(s.id) === Number(item.student_id)
                        ) ||
                        fallbackStudent ||
                        null;

                    const studentName =
                        item.student_name ||
                        student?.name ||
                        "—";

                    return '<tr>' +
                        '<td>' + App.escape(studentName) + '</td>' +
                        '<td>' + App.escape(
                            App.dateTime(
                                item.exit_at ||
                                item.exited_at ||
                                item.created_at
                            )
                        ) + '</td>' +
                        '<td>' + App.escape(
                            item.mahram_name ||
                            item.exit_person_name ||
                            "—"
                        ) + '</td>' +
                        '<td>' + App.escape(item.destination || "—") + '</td>' +
                        '<td>' + App.escape(item.reason || "—") + '</td>' +
                        '<td>' + App.escape(
                            returned
                                ? App.dateTime(returned)
                                : "—"
                        ) + '</td>' +
                        '<td>' + App.escape(
                            App.statusUrdu(
                                item.status ||
                                (returned ? "returned" : "out")
                            )
                        ) + '</td>' +
                    '</tr>';
                }).join("");
            }
        }

        if (movementSelect) {
            const openRows = currentHistory.filter(item => {
                const returned =
                    item.returned_at ||
                    item.return_at ||
                    item.returned_date;

                const status =
                    App.safe(item.status)
                        .trim()
                        .toLowerCase();

                return (
                    !returned &&
                    !["returned","closed","واپس"].includes(status)
                );
            });

            movementSelect.innerHTML =
                '<option value="">واپسی کے لیے خروج ریکارڈ منتخب کریں</option>' +
                openRows.map(item => {
                    const id =
                        Number(
                            item.id ||
                            item.movement_id ||
                            0
                        );

                    const student =
                        students.find(
                            s => Number(s.id) === Number(item.student_id)
                        );

                    const label = [
                        student?.name || item.student_name || "",
                        App.dateTime(
                            item.exit_at ||
                            item.exited_at ||
                            item.created_at
                        ),
                        item.mahram_name ||
                        item.exit_person_name ||
                        ""
                    ].filter(Boolean).join(" — ");

                    return '<option value="' + id + '">' +
                        App.escape(label) +
                    '</option>';
                }).join("");

            movementSelect.disabled = openRows.length === 0;
            setReturnEnabled(openRows.length > 0);
        }
    }

    async function loadHistoriesForLinks(links) {
        if (!links.length) {
            renderHistory([]);
            return;
        }

        const settled =
            await Promise.allSettled(
                links.map(link =>
                    App.getStudentHostelHistory(
                        Number(link.student_id)
                    ).then(history =>
                        App.asArray(history).map(item => ({
                            ...item,
                            student_id:
                                item.student_id ||
                                link.student_id,

                            student_name:
                                item.student_name ||
                                link.student.name
                        }))
                    )
                )
            );

        const combined =
            settled
                .filter(result => result.status === "fulfilled")
                .flatMap(result => result.value)
                .sort((a,b) => {
                    const aTime =
                        new Date(
                            a.exit_at ||
                            a.exited_at ||
                            a.created_at ||
                            0
                        ).getTime();

                    const bTime =
                        new Date(
                            b.exit_at ||
                            b.exited_at ||
                            b.created_at ||
                            0
                        ).getTime();

                    return bTime - aTime;
                });

        renderHistory(combined);
    }

    async function chooseStudent() {
        const studentId = Number(studentSelect?.value || 0);

        if (!studentId) {
            selectedStudent = null;
            currentMode = "";
            resetConnectedStudents();
            setExitModeEnabled(false);
            setReturnEnabled(false);

            if (mahramSelect) {
                mahramSelect.innerHTML =
                    '<option value="">پہلے طالبہ منتخب کریں</option>';
                mahramSelect.disabled = true;
            }

            if (meta) meta.textContent = "";

            renderHistory([]);
            message("طالبہ یا محرم منتخب کریں.");
            return;
        }

        currentMode = "student";
        selectedMahramGroup = null;
        resetConnectedStudents();

        if (globalMahramSelect) globalMahramSelect.value = "";

        selectedStudent =
            students.find(
                student => Number(student.id) === studentId
            ) ||
            null;

        if (!selectedStudent) return;

        const mahrams = studentMahrams(selectedStudent);

        if (mahramSelect) {
            mahramSelect.innerHTML =
                '<option value="">منظور شدہ محرم منتخب کریں</option>' +
                mahrams.map((m,index) =>
                    '<option value="' + index + '">' +
                        App.escape(
                            [
                                m.name,
                                m.relation,
                                m.cnic,
                                m.phone
                            ].filter(Boolean).join(" — ")
                        ) +
                    '</option>'
                ).join("");

            mahramSelect.disabled = mahrams.length === 0;
        }

        setExitModeEnabled(mahrams.length > 0);

        if (exitSubmit) {
            exitSubmit.disabled = true;
        }

        if (meta) {
            meta.textContent =
                "طالبہ: " +
                (selectedStudent.name || "—") +
                " | جماعت: " +
                (selectedStudent.student_class || "—") +
                " | منظور شدہ محرم: " +
                mahrams.length;
        }

        message(
            mahrams.length
                ? "طالبہ منتخب ہوگئی۔ اب اس کے منظور شدہ محرم میں سے ایک منتخب کریں۔"
                : "اس طالبہ کا منظور شدہ محرم موجود نہیں۔",
            mahrams.length ? "success" : "error"
        );

        try {
            const history =
                await App.getStudentHostelHistory(studentId);

            renderHistory(
                App.asArray(history),
                selectedStudent
            );
        } catch (error) {
            console.error("Student movement history:",error);
            renderHistory([],selectedStudent);
        }
    }

    async function chooseMahram() {
        const key =
            App.safe(globalMahramSelect?.value)
                .trim();

        if (!key) {
            selectedMahramGroup = null;
            currentMode = "";
            resetConnectedStudents();
            setExitModeEnabled(false);

            if (mahramSelect) {
                mahramSelect.innerHTML =
                    '<option value="">پہلے طالبہ یا محرم منتخب کریں</option>';
                mahramSelect.disabled = true;
            }

            if (meta) meta.textContent = "";

            renderHistory([]);
            message("طالبہ یا محرم منتخب کریں۔");
            return;
        }

        currentMode = "mahram";
        selectedStudent = null;

        if (studentSelect) studentSelect.value = "";

        const group =
            mahramGroups.find(item => item.key === key) ||
            null;

        if (!group) return;

        selectedMahramGroup = group;

        renderConnectedStudents(group);

        if (mahramSelect) {
            mahramSelect.innerHTML =
                '<option value="global" selected>' +
                App.escape(mahramLabel(group)) +
                '</option>';

            mahramSelect.disabled = true;
        }

        if (meta) {
            meta.textContent =
                "محرم: " +
                (group.name || "—") +
                " | منسلک طالبات: " +
                group.links.length;
        }

        setExitModeEnabled(group.links.length > 0);
        updateConnectedCount();

        message(
            "محرم منتخب ہوگیا۔ ایک یا سب منسلک طالبات منتخب کرکے روانگی محفوظ کریں۔",
            "success"
        );

        await loadHistoriesForLinks(group.links);
    }

    function getStudentModeMahram() {
        if (
            currentMode !== "student" ||
            !selectedStudent
        ) {
            return null;
        }

        const index = Number(mahramSelect?.value);

        if (
            !Number.isInteger(index) ||
            index < 0
        ) {
            return null;
        }

        return studentMahrams(selectedStudent)[index] || null;
    }

    if (mahramSelect) {
        mahramSelect.addEventListener("change",function () {
            if (currentMode === "student") {
                if (exitSubmit) {
                    exitSubmit.disabled =
                        !getStudentModeMahram();
                }
            }
        });
    }

    if (selectAllConnected) {
        selectAllConnected.addEventListener("click",function () {
            connectedList
                ?.querySelectorAll("[data-connected-student]")
                .forEach(node => {
                    node.checked = true;
                });

            updateConnectedCount();
        });
    }

    if (clearConnected) {
        clearConnected.addEventListener("click",function () {
            connectedList
                ?.querySelectorAll("[data-connected-student]")
                .forEach(node => {
                    node.checked = false;
                });

            updateConnectedCount();
        });
    }

    try {
        students =
            App.asArray(
                await App.authedRpc(
                    "admin_get_students"
                )
            )
                .filter(
                    item => Number(item?.id) > 0
                )
                .sort(
                    (a,b) =>
                        App.safe(a.name)
                            .localeCompare(
                                App.safe(b.name),
                                "ur"
                            )
                );

        buildMahramGroups();

        refreshStudentOptions();
        refreshMahramOptions();

        if (!students.length) {
            message("کوئی طالبہ موجود نہیں۔","error");
        } else if (!mahramGroups.length) {
            message(
                "طالبات لوڈ ہوگئیں، لیکن کسی طالبہ کے ساتھ منظور شدہ محرم ریکارڈ موجود نہیں۔",
                "error"
            );
        } else {
            message("طالبہ یا محرم تلاش کرکے منتخب کریں۔");
        }

    } catch (error) {
        console.error("Movement page load:",error);
        message(
            error?.message ||
            "طالبات / محرم لوڈ نہیں ہو سکے۔",
            "error"
        );
        return;
    }

    if (studentSearch) {
        studentSearch.addEventListener(
            "input",
            refreshStudentOptions
        );
    }

    if (globalMahramSearch) {
        globalMahramSearch.addEventListener(
            "input",
            refreshMahramOptions
        );
    }

    if (studentSelect) {
        studentSelect.addEventListener(
            "change",
            chooseStudent
        );
    }

    if (globalMahramSelect) {
        globalMahramSelect.addEventListener(
            "change",
            chooseMahram
        );
    }

    if (exitForm) {
        exitForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                let links = [];

                if (
                    currentMode === "student" &&
                    selectedStudent
                ) {
                    const mahram =
                        getStudentModeMahram();

                    if (!mahram) {
                        message(
                            "منظور شدہ محرم منتخب کریں۔",
                            "error"
                        );
                        return;
                    }

                    links = [{
                        student:
                            selectedStudent,

                        student_id:
                            Number(
                                selectedStudent.id
                            ),

                        mahram,
                        mahram_id:
                            Number(
                                mahram.id ||
                                0
                            )
                    }];

                } else if (
                    currentMode === "mahram"
                ) {
                    links =
                        connectedCheckedLinks();

                    if (!links.length) {
                        message(
                            "کم از کم ایک طالبہ منتخب کریں۔",
                            "error"
                        );
                        return;
                    }

                } else {
                    message(
                        "پہلے طالبہ یا محرم منتخب کریں۔",
                        "error"
                    );
                    return;
                }

                const invalid =
                    links.find(
                        link =>
                            !Number(
                                link.mahram_id ||
                                link.mahram?.id ||
                                0
                            )
                    );

                if (invalid) {
                    message(
                        "منتخب محرم کا ریکارڈ ID موجود نہیں۔ طالبہ کے محرم ریکارڈ کو چیک کریں۔",
                        "error"
                    );
                    return;
                }

                if (exitSubmit) exitSubmit.disabled = true;

                const destination =
                    App.val("hostelDestination") ||
                    null;

                const reason =
                    App.val("hostelReason") ||
                    null;

                const notes =
                    App.val("hostelExitNotes") ||
                    null;

                const settled =
                    await Promise.allSettled(
                        links.map(link =>
                            App.authedRpc(
                                "admin_hostel_exit",
                                {
                                    p_student_id:
                                        Number(
                                            link.student_id
                                        ),

                                    p_mahram_id:
                                        Number(
                                            link.mahram_id ||
                                            link.mahram?.id
                                        ),

                                    p_destination:
                                        destination,

                                    p_reason:
                                        reason,

                                    p_notes:
                                        notes
                                }
                            )
                        )
                    );

                const ok =
                    settled.filter(
                        result =>
                            result.status ===
                            "fulfilled"
                    ).length;

                const failed =
                    settled.length -
                    ok;

                if (ok) {
                    [
                        "hostelDestination",
                        "hostelReason",
                        "hostelExitNotes"
                    ].forEach(id => {
                        const node = App.el(id);
                        if (node) node.value = "";
                    });
                }

                message(
                    "روانگی محفوظ: " +
                    ok +
                    " طالبات" +
                    (
                        failed
                            ? "، ناکام: " + failed
                            : ""
                    ),
                    failed ? "error" : "success"
                );

                if (
                    currentMode === "student"
                ) {
                    await chooseStudent();
                } else {
                    await loadHistoriesForLinks(
                        selectedMahramGroup?.links ||
                        []
                    );
                    updateConnectedCount();
                }
            }
        );
    }

    if (returnForm) {
        returnForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                const movementId =
                    Number(
                        movementSelect?.value ||
                        0
                    );

                if (!movementId) {
                    message(
                        "واپسی کے لیے خروج ریکارڈ منتخب کریں۔",
                        "error"
                    );
                    return;
                }

                const personName =
                    App.val(
                        "hostelReturnPersonName"
                    );

                if (!personName) {
                    message(
                        "ساتھ لانے والے شخص کا نام درج کریں۔",
                        "error"
                    );
                    return;
                }

                if (returnSubmit) {
                    returnSubmit.disabled = true;
                }

                try {
                    await App.authedRpc(
                        "admin_hostel_return",
                        {
                            p_movement_id:
                                movementId,

                            p_return_person_name:
                                personName,

                            p_return_person_relation:
                                App.val(
                                    "hostelReturnRelation"
                                ) ||
                                null,

                            p_return_person_cnic:
                                App.normalizeDigits(
                                    App.val(
                                        "hostelReturnCNIC"
                                    )
                                ) ||
                                null,

                            p_return_person_phone:
                                App.normalizePhone(
                                    App.val(
                                        "hostelReturnPhone"
                                    )
                                ) ||
                                null,

                            p_notes:
                                App.val(
                                    "hostelReturnNotes"
                                ) ||
                                null
                        }
                    );

                    [
                        "hostelReturnPersonName",
                        "hostelReturnRelation",
                        "hostelReturnCNIC",
                        "hostelReturnPhone",
                        "hostelReturnNotes"
                    ].forEach(id => {
                        const node = App.el(id);
                        if (node) node.value = "";
                    });

                    message(
                        "طالبہ کی واپسی محفوظ ہوگئی۔",
                        "success"
                    );

                    if (
                        currentMode === "student"
                    ) {
                        await chooseStudent();
                    } else if (
                        currentMode === "mahram" &&
                        selectedMahramGroup
                    ) {
                        await loadHistoriesForLinks(
                            selectedMahramGroup.links
                        );
                    }

                } catch (error) {
                    console.error(
                        "Hostel return:",
                        error
                    );

                    message(
                        error?.message ||
                        "واپسی محفوظ نہیں ہو سکی۔",
                        "error"
                    );
                }
            }
        );
    }

    setExitModeEnabled(false);
    setReturnEnabled(false);
};

})();