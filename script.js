document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://ggtnetudnjsmsmitvjmb.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";

    let supabaseClient = null;

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

    } else {

        console.error(
            "Supabase library is not loaded."
        );

    }


    /* =====================================================
       GLOBAL VARIABLES
    ===================================================== */

    const INACTIVITY_LIMIT =
        5 * 60 * 1000;

    let inactivityTimer = null;

    let studentsCache = [];

    let teachersCache = [];


    /* =====================================================
       LOGIN / SESSION
    ===================================================== */

    function isLoggedIn() {

        return (
            localStorage.getItem("loggedIn") === "true"
        );

    }


    function getUserRole() {

        return (
            localStorage.getItem("userRole") || ""
        );

    }


    /* =====================================================
       SUPABASE CHECK
    ===================================================== */

    function checkSupabase() {

        if (!supabaseClient) {

            alert(
                "Supabase سے رابطہ قائم نہیں ہو سکا۔\n\n" +
                "براہِ کرم صفحہ دوبارہ کھولیں۔"
            );

            return false;

        }

        return true;

    }


    /* =====================================================
       AUTO SAVE
    ===================================================== */

    function autoSaveCurrentWork() {

        const studentForm =
            document.getElementById(
                "studentForm"
            );

        if (!studentForm) {
            return;
        }


        try {

            const formData = {};


            studentForm
                .querySelectorAll(
                    "input, select, textarea"
                )
                .forEach(
                    function (input) {

                        if (!input.id) {
                            return;
                        }


                        if (
                            input.type ===
                            "checkbox"
                        ) {

                            formData[input.id] =
                                input.checked;

                        } else {

                            formData[input.id] =
                                input.value;

                        }

                    }
                );


            const mahramList =
                document.getElementById(
                    "mahramList"
                );


            if (mahramList) {

                formData.mahrams = [];


                mahramList
                    .querySelectorAll(
                        ".mahram-card"
                    )
                    .forEach(
                        function (card) {

                            const name =
                                card.querySelector(
                                    ".mahram-name"
                                );

                            const relation =
                                card.querySelector(
                                    ".mahram-relation"
                                );

                            const cnic =
                                card.querySelector(
                                    ".mahram-cnic"
                                );

                            const phone =
                                card.querySelector(
                                    ".mahram-phone"
                                );

                            const approved =
                                card.querySelector(
                                    ".mahram-approved"
                                );


                            formData.mahrams.push({

                                name:
                                    name
                                        ? name.value
                                        : "",

                                relation:
                                    relation
                                        ? relation.value
                                        : "",

                                cnic:
                                    cnic
                                        ? cnic.value
                                        : "",

                                phone:
                                    phone
                                        ? phone.value
                                        : "",

                                approved:
                                    approved
                                        ? approved.checked
                                        : false

                            });

                        }
                    );

            }


            localStorage.setItem(
                "studentDraft",
                JSON.stringify(formData)
            );


        } catch (error) {

            console.error(
                "Auto save error:",
                error
            );

        }

    }


    function restoreStudentDraft() {

        const studentForm =
            document.getElementById(
                "studentForm"
            );

        if (!studentForm) {
            return;
        }


        const saved =
            localStorage.getItem(
                "studentDraft"
            );


        if (!saved) {
            return;
        }


        try {

            const formData =
                JSON.parse(saved);


            Object.keys(formData).forEach(
                function (key) {

                    if (key === "mahrams") {
                        return;
                    }


                    const field =
                        document.getElementById(
                            key
                        );


                    if (!field) {
                        return;
                    }


                    if (
                        field.type ===
                        "checkbox"
                    ) {

                        field.checked =
                            formData[key] === true;

                    } else {

                        field.value =
                            formData[key];

                    }

                }
            );


            updateTransferFields();

            updateResidence();


            if (
                Array.isArray(
                    formData.mahrams
                )
            ) {

                const mahramList =
                    document.getElementById(
                        "mahramList"
                    );


                if (mahramList) {

                    mahramList.innerHTML = "";


                    formData.mahrams.forEach(
                        function (data) {

                            createMahram(
                                data
                            );

                        }
                    );

                }

            }


        } catch (error) {

            console.error(
                "Restore draft error:",
                error
            );

        }

    }


    function clearStudentDraft() {

        localStorage.removeItem(
            "studentDraft"
        );

    }


    /* =====================================================
       AUTO LOGOUT
    ===================================================== */

    function resetInactivityTimer() {

        if (inactivityTimer) {

            clearTimeout(
                inactivityTimer
            );

        }


        if (!isLoggedIn()) {
            return;
        }


        inactivityTimer =
            setTimeout(
                function () {

                    autoSaveCurrentWork();


                    localStorage.removeItem(
                        "loggedIn"
                    );

                    localStorage.removeItem(
                        "userRole"
                    );


                    alert(
                        "آپ کی سرگرمی 5 منٹ سے نہیں ہوئی۔\n\n" +
                        "حفاظتی وجہ سے آپ کو لاگ آؤٹ کر دیا گیا ہے۔"
                    );


                    window.location.href =
                        "index.html";

                },
                INACTIVITY_LIMIT
            );

    }


    [
        "click",
        "mousemove",
        "mousedown",
        "keydown",
        "touchstart",
        "scroll"
    ].forEach(
        function (eventName) {

            document.addEventListener(
                eventName,
                resetInactivityTimer,
                true
            );

        }
    );


    window.addEventListener(
        "beforeunload",
        function () {

            autoSaveCurrentWork();

        }
    );


    /* =====================================================
       HOME PAGE BUTTONS
    ===================================================== */

    const adminButton =
        document.getElementById(
            "adminButton"
        );

    const teacherButton =
        document.getElementById(
            "teacherButton"
        );

    const studentButton =
        document.getElementById(
            "studentButton"
        );


    if (adminButton) {

        adminButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "login.html?role=admin";

            }
        );

    }


    if (teacherButton) {

        teacherButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "login.html?role=teacher";

            }
        );

    }


    if (studentButton) {

        studentButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "login.html?role=student";

            }
        );

    }


    /* =====================================================
       LOGIN PAGE
    ===================================================== */

    const loginButton =
        document.getElementById(
            "loginButton"
        );


    if (loginButton) {

        const usernameInput =
            document.getElementById(
                "username"
            );

        const passwordInput =
            document.getElementById(
                "password"
            );

        const message =
            document.getElementById(
                "loginMessage"
            ) ||
            document.getElementById(
                "message"
            );

        const rememberInput =
            document.getElementById(
                "rememberMe"
            ) ||
            document.getElementById(
                "remember"
            );

        const togglePassword =
            document.getElementById(
                "togglePassword"
            );

        const backButton =
            document.getElementById(
                "backButton"
            );


        const params =
            new URLSearchParams(
                window.location.search
            );


        const role =
            params.get("role") ||
            "admin";


        const loginTitle =
            document.getElementById(
                "loginTitle"
            );


        if (loginTitle) {

            if (role === "admin") {

                loginTitle.textContent =
                    "ایڈمن لاگ اِن";

            } else if (
                role === "teacher"
            ) {

                loginTitle.textContent =
                    "استادہ لاگ اِن";

            } else {

                loginTitle.textContent =
                    "طالبہ لاگ اِن";

            }

        }


        if (
            usernameInput &&
            passwordInput &&
            rememberInput
        ) {

            const savedUsername =
                localStorage.getItem(
                    "savedUsername"
                );

            const savedPassword =
                localStorage.getItem(
                    "savedPassword"
                );


            if (
                savedUsername &&
                savedPassword
            ) {

                usernameInput.value =
                    savedUsername;

                passwordInput.value =
                    savedPassword;

                rememberInput.checked =
                    true;

            }

        }


        if (togglePassword) {

            togglePassword.addEventListener(
                "click",
                function () {

                    if (
                        passwordInput &&
                        passwordInput.type ===
                        "password"
                    ) {

                        passwordInput.type =
                            "text";

                        togglePassword.textContent =
                            "🙈";

                    } else if (
                        passwordInput
                    ) {

                        passwordInput.type =
                            "password";

                        togglePassword.textContent =
                            "👁️";

                    }

                }
            );

        }


        loginButton.addEventListener(
            "click",
            function () {

                const username =
                    usernameInput
                        ? usernameInput.value.trim()
                        : "";

                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                if (
                    username === "" ||
                    password === ""
                ) {

                    if (message) {

                        message.textContent =
                            "براہِ کرم صارف نام اور پاس ورڈ درج کریں۔";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                let validLogin = false;


                if (
                    role === "admin" &&
                    username === "admin" &&
                    password === "admin123"
                ) {

                    validLogin = true;

                }


                if (
                    role === "teacher" &&
                    username === "teacher" &&
                    password === "teacher123"
                ) {

                    validLogin = true;

                }


                if (
                    role === "student" &&
                    username === "student" &&
                    password === "student123"
                ) {

                    validLogin = true;

                }


                if (!validLogin) {

                    if (message) {

                        message.textContent =
                            "صارف نام یا پاس ورڈ غلط ہے۔";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                localStorage.setItem(
                    "loggedIn",
                    "true"
                );

                localStorage.setItem(
                    "userRole",
                    role
                );


                if (
                    rememberInput &&
                    rememberInput.checked
                ) {

                    localStorage.setItem(
                        "savedUsername",
                        username
                    );

                    localStorage.setItem(
                        "savedPassword",
                        password
                    );

                } else {

                    localStorage.removeItem(
                        "savedUsername"
                    );

                    localStorage.removeItem(
                        "savedPassword"
                    );

                }


                resetInactivityTimer();


                window.location.href =
                    "dashboard.html";

            }
        );


        if (backButton) {

            backButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "index.html";

                }
            );

        }

    }


    /* =====================================================
       PAGE PROTECTION
    ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        currentPage === "dashboard.html" ||
        currentPage === "students.html" ||
        currentPage === "teachers.html"
    ) {

        if (!isLoggedIn()) {

            window.location.href =
                "index.html";

            return;

        }

        resetInactivityTimer();

    }


    /* =====================================================
       TEACHER PAGE ADMIN PROTECTION
    ===================================================== */

    if (
        currentPage === "teachers.html"
    ) {

        if (
            getUserRole() !== "admin"
        ) {

            alert(
                "اساتذہ کے انتظام کے لیے صرف ایڈمن کو اجازت ہے۔"
            );

            window.location.href =
                "dashboard.html";

            return;

        }

    }


    /* =====================================================
       SUPABASE ROW → JAVASCRIPT STUDENT
    ===================================================== */

    function dbRowToStudent(row) {

        return {

            id:
                row.id,

            admissionType:
                row.admission_type || "",

            admissionNo:
                row.admission_no || "",

            previousMadrassa:
                row.previous_madrassa || "",

            transferDate:
                row.transfer_date || "",

            name:
                row.name || "",

            fatherName:
                row.father_name || "",

            guardianName:
                row.guardian_name || "",

            studentCNIC:
                row.cnic || "",

            dateOfBirth:
                row.date_of_birth || "",

            studentClass:
                row.student_class || "",

            phone:
                row.phone || "",

            admissionDate:
                row.admission_date || "",

            address:
                row.address || "",

            residenceType:
                row.residence_type || "",

            mahrams:
                Array.isArray(row.mahrams)
                    ? row.mahrams
                    : []

        };

    }


    /* =====================================================
       LOAD STUDENTS FROM SUPABASE
       TABLE = Students
    ===================================================== */

    async function loadStudentsFromSupabase() {

        if (!checkSupabase()) {
            return [];
        }


        const {
            data,
            error
        } = await supabaseClient
            .from("Students")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Students load error:",
                error
            );


            alert(
                "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔\n\n" +
                "اصل وجہ:\n" +
                error.message +
                (
                    error.code
                        ? "\n\nError Code: " +
                          error.code
                        : ""
                )
            );


            return [];

        }


        studentsCache =
            data || [];


        console.log(
            "Students loaded from Supabase:",
            studentsCache
        );


        return studentsCache;

    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function getDigits(value) {

        return String(
            value || ""
        ).replace(
            /\D/g,
            ""
        );

    }


    function isValidPhone(phone) {

        return (
            getDigits(phone).length === 11
        );

    }


    function isValidCNIC(cnic) {

        return (
            getDigits(cnic).length === 13
        );

    }


    function isValidUrduName(name) {

        const value =
            String(
                name || ""
            ).trim();


        if (value === "") {
            return false;
        }


        return /^[\u0600-\u06FF\s\u200C\u200D]+$/
            .test(value);

    }


    function formatCNIC(value) {

        const digits =
            getDigits(value)
                .slice(0, 13);


        if (
            digits.length <= 5
        ) {

            return digits;

        }


        if (
            digits.length <= 12
        ) {

            return (
                digits.slice(0, 5) +
                "-" +
                digits.slice(5)
            );

        }


        return (
            digits.slice(0, 5) +
            "-" +
            digits.slice(5, 12) +
            "-" +
            digits.slice(12)
        );

    }


    /* =====================================================
       CNIC FORMATTING
    ===================================================== */

    const studentCNIC =
        document.getElementById(
            "studentCNIC"
        );


    if (studentCNIC) {

        studentCNIC.addEventListener(
            "input",
            function () {

                this.value =
                    formatCNIC(
                        this.value
                    );

            }
        );

    }


    /* =====================================================
       MAHRAM
    ===================================================== */

    const addMahram =
        document.getElementById(
            "addMahram"
        );

    const mahramList =
        document.getElementById(
            "mahramList"
        );


    const MAHRAM_RELATIONS = [

        "والد",
        "دادا",
        "نانا",
        "سگا بھائی",
        "باپ شریک بھائی",
        "ماں شریک بھائی",
        "بیٹا",
        "پوتا",
        "نواسہ",
        "چچا",
        "تایا",
        "ماموں",
        "بھتیجا",
        "بھانجا"

    ];


    function createMahram(data) {

        if (!mahramList) {
            return;
        }


        const currentCount =
            mahramList.querySelectorAll(
                ".mahram-card"
            ).length;


        if (currentCount >= 5) {

            alert(
                "زیادہ سے زیادہ 5 محرم شامل کیے جا سکتے ہیں۔"
            );

            return;

        }


        data =
            data || {};


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "mahram-card";


        let relationOptions =
            '<option value="">رشتہ منتخب کریں</option>';


        MAHRAM_RELATIONS.forEach(
            function (relation) {

                const selected =
                    data.relation === relation
                        ? " selected"
                        : "";


                relationOptions +=
                    '<option value="' +
                    escapeHTML(relation) +
                    '"' +
                    selected +
                    ">" +
                    escapeHTML(relation) +
                    "</option>";

            }
        );


        card.innerHTML =

            '<div class="form-grid">' +

            '<div class="form-group">' +

            '<label>محرم کا نام</label>' +

            '<input type="text" ' +
            'class="mahram-name" ' +
            'value="' +
            escapeHTML(
                data.name || ""
            ) +
            '" ' +
            'placeholder="محرم کا نام">' +

            "</div>" +


            '<div class="form-group">' +

            '<label>رشتہ</label>' +

            '<select class="mahram-relation">' +

            relationOptions +

            "</select>" +

            "</div>" +


            '<div class="form-group">' +

            '<label>شناختی کارڈ نمبر</label>' +

            '<input type="text" ' +
            'class="mahram-cnic" ' +
            'inputmode="numeric" ' +
            'maxlength="15" ' +
            'value="' +
            escapeHTML(
                data.cnic || ""
            ) +
            '" ' +
            'placeholder="XXXXX-XXXXXXX-X">' +

            "</div>" +


            '<div class="form-group">' +

            '<label>موبائل نمبر</label>' +

            '<input type="tel" ' +
            'class="mahram-phone" ' +
            'inputmode="numeric" ' +
            'maxlength="11" ' +
            'value="' +
            escapeHTML(
                data.phone || ""
            ) +
            '" ' +
            'placeholder="03XXXXXXXXX">' +

            "</div>" +

            "</div>" +


            '<div class="form-group">' +

            '<label class="mahram-confirm">' +

            '<input type="checkbox" ' +
            'class="mahram-approved" ' +
            (
                data.approved
                    ? "checked"
                    : ""
            ) +
            ">" +

            "<span> محرم کی منظوری ہے</span>" +

            "</label>" +

            "</div>" +


            '<button type="button" ' +
            'class="remove-mahram">' +
            "محرم حذف کریں" +
            "</button>";


        mahramList.appendChild(
            card
        );


        const cnicInput =
            card.querySelector(
                ".mahram-cnic"
            );


        if (cnicInput) {

            cnicInput.addEventListener(
                "input",
                function () {

                    this.value =
                        formatCNIC(
                            this.value
                        );

                }
            );

        }


        const removeButton =
            card.querySelector(
                ".remove-mahram"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                function () {

                    card.remove();

                    autoSaveCurrentWork();

                }
            );

        }


        card.querySelectorAll(
            "input, select"
        ).forEach(
            function (input) {

                input.addEventListener(
                    "input",
                    autoSaveCurrentWork
                );

                input.addEventListener(
                    "change",
                    autoSaveCurrentWork
                );

            }
        );

    }


    if (addMahram) {

        addMahram.addEventListener(
            "click",
            function () {

                createMahram();

            }
        );

    }


    /* =====================================================
       TRANSFER ADMISSION
    ===================================================== */

    function updateTransferFields() {

        const admissionType =
            document.getElementById(
                "admissionType"
            );

        const previousMadrassaGroup =
            document.getElementById(
                "previousMadrassaGroup"
            );

        const transferDateGroup =
            document.getElementById(
                "transferDateGroup"
            );


        if (!admissionType) {
            return;
        }


        const value =
            String(
                admissionType.value || ""
            )
                .trim()
                .toLowerCase();


        const isTransfer =
            value === "transfer" ||
            value === "منتقلی" ||
            value === "منتقل شدہ";


        if (previousMadrassaGroup) {

            previousMadrassaGroup.classList.toggle(
                "hidden",
                !isTransfer
            );

        }


        if (transferDateGroup) {

            transferDateGroup.classList.toggle(
                "hidden",
                !isTransfer
            );

        }

    }


    const admissionType =
        document.getElementById(
            "admissionType"
        );


    if (admissionType) {

        admissionType.addEventListener(
            "change",
            function () {

                updateTransferFields();

                autoSaveCurrentWork();

            }
        );

    }


    /* =====================================================
       RESIDENCE / HOSTEL
    ===================================================== */

    function updateResidence() {

        const residenceType =
            document.getElementById(
                "residenceType"
            );

        const mahramSection =
            document.getElementById(
                "mahramSection"
            );


        if (!residenceType) {
            return;
        }


        const value =
            String(
                residenceType.value || ""
            )
                .trim()
                .toLowerCase();


        const isHostel =
            value === "hostel" ||
            value === "ہاسٹل" ||
            value === "ہاسٹل رہائش";


        if (mahramSection) {

            mahramSection.classList.toggle(
                "hidden",
                !isHostel
            );

        }

    }


    const residenceType =
        document.getElementById(
            "residenceType"
        );


    if (residenceType) {

        residenceType.addEventListener(
            "change",
            function () {

                updateResidence();

                autoSaveCurrentWork();

            }
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       STUDENT FORM ELEMENTS
    ===================================================== */

    const studentForm =
        document.getElementById(
            "studentForm"
        );

    const studentFormContainer =
        document.getElementById(
            "studentFormContainer"
        );

    const showStudentForm =
        document.getElementById(
            "showStudentForm"
        );

    const cancelStudentForm =
        document.getElementById(
            "cancelStudentForm"
        );

    const studentsList =
        document.getElementById(
            "studentsList"
        );

    const studentSearch =
        document.getElementById(
            "studentSearch"
        );

    const studentCount =
        document.getElementById(
            "studentCount"
        );

    const editStudentId =
        document.getElementById(
            "editStudentId"
        );


    /* =====================================================
       SHOW NEW STUDENT FORM
    ===================================================== */

    function showFormForNewStudent() {

        if (!studentForm) {
            return;
        }


        studentForm.reset();


        if (editStudentId) {

            editStudentId.value = "";

        }


        const formTitle =
            document.getElementById(
                "formTitle"
            );


        if (formTitle) {

            formTitle.textContent =
                "نئی طالبہ کا داخلہ";

        }


        if (mahramList) {

            mahramList.innerHTML = "";

        }


        clearStudentDraft();


        updateTransferFields();

        updateResidence();


        if (studentFormContainer) {

            studentFormContainer.classList.remove(
                "hidden"
            );

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function hideStudentForm() {

        if (studentFormContainer) {

            studentFormContainer.classList.add(
                "hidden"
            );

        }

    }


    if (showStudentForm) {

        showStudentForm.addEventListener(
            "click",
            function () {

                showFormForNewStudent();

            }
        );

    }


    if (cancelStudentForm) {

        cancelStudentForm.addEventListener(
            "click",
            function () {

                hideStudentForm();

            }
        );

    }


    /* =====================================================
       FORM AUTO SAVE EVENTS
    ===================================================== */

    if (studentForm) {

        studentForm
            .querySelectorAll(
                "input, select, textarea"
            )
            .forEach(
                function (input) {

                    input.addEventListener(
                        "input",
                        autoSaveCurrentWork
                    );

                    input.addEventListener(
                        "change",
                        autoSaveCurrentWork
                    );

                }
            );

    }


    /* =====================================================
       COLLECT MAHRAMS
    ===================================================== */

    function collectMahrams() {

        const result = [];


        if (!mahramList) {
            return result;
        }


        mahramList
            .querySelectorAll(
                ".mahram-card"
            )
            .forEach(
                function (card) {

                    const name =
                        card.querySelector(
                            ".mahram-name"
                        );

                    const relation =
                        card.querySelector(
                            ".mahram-relation"
                        );

                    const cnic =
                        card.querySelector(
                            ".mahram-cnic"
                        );

                    const phone =
                        card.querySelector(
                            ".mahram-phone"
                        );

                    const approved =
                        card.querySelector(
                            ".mahram-approved"
                        );


                    result.push({

                        name:
                            name
                                ? name.value.trim()
                                : "",

                        relation:
                            relation
                                ? relation.value
                                : "",

                        cnic:
                            cnic
                                ? cnic.value.trim()
                                : "",

                        phone:
                            phone
                                ? phone.value.trim()
                                : "",

                        approved:
                            approved
                                ? approved.checked
                                : false

                    });

                }
            );


        return result;

    }


    /* =====================================================
       GET FORM DATA
    ===================================================== */

    function getStudentFormData() {

        function getValue(id) {

            const field =
                document.getElementById(id);

            return field
                ? field.value.trim()
                : "";

        }


        return {

            admissionType:
                getValue(
                    "admissionType"
                ),

            admissionNo:
                getValue(
                    "admissionNo"
                ),

            previousMadrassa:
                getValue(
                    "previousMadrassa"
                ),

            transferDate:
                (
                    document.getElementById(
                        "transferDate"
                    ) || {}
                ).value || "",

            name:
                getValue(
                    "studentName"
                ),

            fatherName:
                getValue(
                    "fatherName"
                ),

            guardianName:
                getValue(
                    "guardianName"
                ),

            studentCNIC:
                getValue(
                    "studentCNIC"
                ),

            dateOfBirth:
                (
                    document.getElementById(
                        "dateOfBirth"
                    ) || {}
                ).value || "",

            studentClass:
                getValue(
                    "studentClass"
                ),

            phone:
                getValue(
                    "phone"
                ),

            admissionDate:
                (
                    document.getElementById(
                        "admissionDate"
                    ) || {}
                ).value || "",

            address:
                getValue(
                    "address"
                ),

            residenceType:
                getValue(
                    "residenceType"
                ),

            mahrams:
                collectMahrams()

        };

    }


    /* =====================================================
       VALIDATE STUDENT
    ===================================================== */

    function validateStudent(student) {

        if (!student.admissionType) {

            alert(
                "براہِ کرم داخلہ کی قسم منتخب کریں۔"
            );

            return false;

        }


        if (!student.admissionNo) {

            alert(
                "براہِ کرم داخلہ نمبر درج کریں۔"
            );

            return false;

        }


        if (
            !isValidUrduName(
                student.name
            )
        ) {

            alert(
                "طالبہ کا نام صرف اردو حروف میں درج کریں۔"
            );

            return false;

        }


        if (
            !isValidUrduName(
                student.fatherName
            )
        ) {

            alert(
                "والد کا نام صرف اردو حروف میں درج کریں۔"
            );

            return false;

        }


        if (
            !isValidUrduName(
                student.guardianName
            )
        ) {

            alert(
                "سرپرست کا نام صرف اردو حروف میں درج کریں۔"
            );

            return false;

        }


        if (
            !isValidCNIC(
                student.studentCNIC
            )
        ) {

            alert(
                "شناختی کارڈ نمبر 13 ہندسوں پر مشتمل ہونا چاہیے۔"
            );

            return false;

        }


        if (
            !isValidPhone(
                student.phone
            )
        ) {

            alert(
                "موبائل نمبر 11 ہندسوں پر مشتمل ہونا چاہیے۔"
            );

            return false;

        }


        if (!student.dateOfBirth) {

            alert(
                "براہِ کرم تاریخ پیدائش درج کریں۔"
            );

            return false;

        }


        if (!student.studentClass) {

            alert(
                "براہِ کرم جماعت منتخب کریں۔"
            );

            return false;

        }


        if (!student.admissionDate) {

            alert(
                "براہِ کرم داخلہ کی تاریخ درج کریں۔"
            );

            return false;

        }


        if (!student.address) {

            alert(
                "براہِ کرم پتہ درج کریں۔"
            );

            return false;

        }


        if (!student.residenceType) {

            alert(
                "براہِ کرم رہائش کی قسم منتخب کریں۔"
            );

            return false;

        }


        const residenceValue =
            String(
                student.residenceType
            )
                .trim()
                .toLowerCase();


        const isHostel =
            residenceValue === "hostel" ||
            residenceValue === "ہاسٹل" ||
            residenceValue === "ہاسٹل رہائش";


        if (isHostel) {

            if (
                student.mahrams.length < 1
            ) {

                alert(
                    "ہاسٹل طالبہ کے لیے کم از کم ایک محرم کی معلومات ضروری ہیں۔"
                );

                return false;

            }


            if (
                student.mahrams.length > 5
            ) {

                alert(
                    "زیادہ سے زیادہ 5 محرم شامل کیے جا سکتے ہیں۔"
                );

                return false;

            }


            for (
                let i = 0;
                i < student.mahrams.length;
                i++
            ) {

                const mahram =
                    student.mahrams[i];


                if (
                    !isValidUrduName(
                        mahram.name
                    )
                ) {

                    alert(
                        "محرم نمبر " +
                        (i + 1) +
                        " کا نام درست اردو میں درج کریں۔"
                    );

                    return false;

                }


                if (!mahram.relation) {

                    alert(
                        "محرم نمبر " +
                        (i + 1) +
                        " کا رشتہ منتخب کریں۔"
                    );

                    return false;

                }


                if (
                    !isValidCNIC(
                        mahram.cnic
                    )
                ) {

                    alert(
                        "محرم نمبر " +
                        (i + 1) +
                        " کا شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔"
                    );

                    return false;

                }


                if (
                    !isValidPhone(
                        mahram.phone
                    )
                ) {

                    alert(
                        "محرم نمبر " +
                        (i + 1) +
                        " کا موبائل نمبر 11 ہندسوں کا ہونا چاہیے۔"
                    );

                    return false;

                }


                if (!mahram.approved) {

                    alert(
                        "محرم نمبر " +
                        (i + 1) +
                        " کی منظوری ضروری ہے۔"
                    );

                    return false;

                }

            }

        }


        return true;

    }


    /* =====================================================
       DATABASE DATA
    ===================================================== */

    function createDatabaseStudentData(student) {

        return {

            admission_no:
                student.admissionNo || null,

            admission_type:
                student.admissionType || null,

            name:
                student.name || null,

            father_name:
                student.fatherName || null,

            guardian_name:
                student.guardianName || null,

            cnic:
                student.studentCNIC || null,

            phone:
                student.phone || null,

            date_of_birth:
                student.dateOfBirth || null,

            student_class:
                student.studentClass || null,

            admission_date:
                student.admissionDate || null,

            address:
                student.address || null,

            residence_type:
                student.residenceType || null,

            previous_madrassa:
                student.previousMadrassa || null,

            transfer_date:
                student.transferDate || null,

            mahrams:
                Array.isArray(
                    student.mahrams
                )
                    ? student.mahrams
                    : []

        };

    }


    /* =====================================================
       STUDENT FORM SUBMIT
    ===================================================== */

    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const submitButton =
                    studentForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                }


                try {

                    if (!checkSupabase()) {
                        return;
                    }


                    const student =
                        getStudentFormData();


                    if (
                        !validateStudent(
                            student
                        )
                    ) {

                        return;

                    }


                    const rawStudents =
                        await loadStudentsFromSupabase();


                    const students =
                        rawStudents.map(
                            dbRowToStudent
                        );


                    const currentId =
                        editStudentId
                            ? editStudentId.value
                            : "";


                    const duplicateAdmission =
                        students.find(
                            function (item) {

                                const sameAdmission =
                                    String(
                                        item.admissionNo ||
                                        ""
                                    )
                                        .trim()
                                        .toLowerCase() ===
                                    String(
                                        student.admissionNo ||
                                        ""
                                    )
                                        .trim()
                                        .toLowerCase();


                                const sameRecord =
                                    currentId !== "" &&
                                    String(item.id) ===
                                    String(currentId);


                                return (
                                    sameAdmission &&
                                    !sameRecord
                                );

                            }
                        );


                    if (duplicateAdmission) {

                        alert(
                            "یہ داخلہ نمبر پہلے سے موجود ہے۔ براہِ کرم دوسرا داخلہ نمبر استعمال کریں۔"
                        );

                        return;

                    }


                    const newCNIC =
                        getDigits(
                            student.studentCNIC
                        );


                    const duplicateCNIC =
                        students.find(
                            function (item) {

                                const oldCNIC =
                                    getDigits(
                                        item.studentCNIC
                                    );


                                const sameRecord =
                                    currentId !== "" &&
                                    String(item.id) ===
                                    String(currentId);


                                return (
                                    oldCNIC !== "" &&
                                    oldCNIC === newCNIC &&
                                    !sameRecord
                                );

                            }
                        );


                    if (duplicateCNIC) {

                        alert(
                            "یہ شناختی کارڈ نمبر پہلے سے موجود ہے۔"
                        );

                        return;

                    }


                    const dbData =
                        createDatabaseStudentData(
                            student
                        );


                    if (currentId !== "") {

                        const {
                            error
                        } = await supabaseClient
                            .from("Students")
                            .update(dbData)
                            .eq(
                                "id",
                                currentId
                            );


                        if (error) {

                            console.error(
                                "Student update error:",
                                error
                            );


                            alert(
                                "طالبہ کی معلومات اپ ڈیٹ نہیں ہو سکیں۔\n\n" +
                                "اصل وجہ:\n" +
                                (
                                    error.message ||
                                    "نامعلوم database error"
                                ) +
                                (
                                    error.code
                                        ? "\n\nError Code: " +
                                          error.code
                                        : ""
                                ) +
                                (
                                    error.details
                                        ? "\n\nتفصیل:\n" +
                                          error.details
                                        : ""
                                ) +
                                (
                                    error.hint
                                        ? "\n\nمشورہ:\n" +
                                          error.hint
                                        : ""
                                )
                            );

                            return;

                        }


                        alert(
                            "طالبہ کی معلومات کامیابی سے اپ ڈیٹ ہو گئی ہیں۔"
                        );

                    }


                    else {

                        const {
                            error
                        } = await supabaseClient
                            .from("Students")
                            .insert([
                                dbData
                            ]);


                        if (error) {

                            console.error(
                                "Student save error:",
                                error
                            );


                            alert(
                                "نئی طالبہ محفوظ نہیں ہو سکی۔\n\n" +
                                "اصل وجہ:\n" +
                                (
                                    error.message ||
                                    "نامعلوم database error"
                                ) +
                                (
                                    error.code
                                        ? "\n\nError Code: " +
                                          error.code
                                        : ""
                                ) +
                                (
                                    error.details
                                        ? "\n\nتفصیل:\n" +
                                          error.details
                                        : ""
                                ) +
                                (
                                    error.hint
                                        ? "\n\nمشورہ:\n" +
                                          error.hint
                                        : ""
                                )
                            );


                            return;

                        }


                        alert(
                            "نئی طالبہ کامیابی سے محفوظ ہو گئی ہے۔"
                        );

                    }


                    clearStudentDraft();

                    studentForm.reset();


                    if (editStudentId) {

                        editStudentId.value = "";

                    }


                    if (mahramList) {

                        mahramList.innerHTML = "";

                    }


                    const formTitle =
                        document.getElementById(
                            "formTitle"
                        );


                    if (formTitle) {

                        formTitle.textContent =
                            "نئی طالبہ کا داخلہ";

                    }


                    updateTransferFields();

                    updateResidence();

                    hideStudentForm();


                    await displayStudents();

                    await updateDashboardStudentCount();


                } catch (error) {

                    console.error(
                        "Student submit error:",
                        error
                    );


                    alert(
                        "طالبہ محفوظ نہیں ہو سکی۔\n\n" +
                        "اصل وجہ:\n" +
                        (
                            error.message ||
                            "سسٹم میں نامعلوم مسئلہ پیش آیا ہے۔"
                        )
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                    }

                }

            }
        );

    }


    /* =====================================================
       DISPLAY STUDENTS
    ===================================================== */

    async function displayStudents(
        searchTerm = ""
    ) {

        if (!studentsList) {
            return;
        }


        const rawStudents =
            await loadStudentsFromSupabase();


        const students =
            rawStudents.map(
                dbRowToStudent
            );


        if (studentCount) {

            studentCount.textContent =
                students.length;

        }


        const search =
            String(
                searchTerm || ""
            )
                .trim()
                .toLowerCase();


        let filteredStudents =
            students;


        if (search !== "") {

            filteredStudents =
                students.filter(
                    function (student) {

                        return (

                            String(
                                student.name || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                student.admissionNo || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                student.phone || ""
                            )
                                .includes(search)

                        );

                    }
                );

        }


        studentsList.innerHTML = "";


        if (
            filteredStudents.length === 0
        ) {

            studentsList.innerHTML =

                '<div class="empty-students">' +

                '<div class="empty-icon">👧</div>' +

                "<h3>" +

                (
                    search
                        ? "تلاش کے مطابق کوئی طالبہ نہیں ملی۔"
                        : "ابھی کوئی طالبہ محفوظ نہیں ہے۔"
                ) +

                "</h3>" +

                "</div>";


            return;

        }


        filteredStudents.forEach(
            function (student) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "student-card";


                const residence =
                    student.residenceType ||
                    "درج نہیں";


                card.innerHTML =

                    '<div class="student-card-header">' +

                    '<div class="student-avatar">👧</div>' +

                    '<div>' +

                    "<h3>" +

                    escapeHTML(
                        student.name ||
                        "نام درج نہیں"
                    ) +

                    "</h3>" +

                    "<span>" +

                    "داخلہ نمبر: " +

                    escapeHTML(
                        student.admissionNo ||
                        "درج نہیں"
                    ) +

                    "</span>" +

                    "</div>" +

                    "</div>" +


                    '<div class="student-badges">' +

                    "<span>" +

                    escapeHTML(
                        student.studentClass ||
                        "کلاس درج نہیں"
                    ) +

                    "</span>" +

                    "<span>" +

                    escapeHTML(
                        residence
                    ) +

                    "</span>" +

                    "</div>" +


                    '<div class="student-info">' +

                    "<p>" +

                    "<strong>والد کا نام:</strong> " +

                    escapeHTML(
                        student.fatherName ||
                        "درج نہیں"
                    ) +

                    "</p>" +


                    "<p>" +

                    "<strong>موبائل:</strong> " +

                    escapeHTML(
                        student.phone ||
                        "درج نہیں"
                    ) +

                    "</p>" +

                    "</div>" +


                    '<div class="student-card-buttons">' +

                    '<button type="button" ' +
                    'class="view-student" ' +
                    'data-id="' +
                    escapeHTML(
                        String(student.id)
                    ) +
                    '">' +

                    "دیکھیں" +

                    "</button>" +


                    '<button type="button" ' +
                    'class="edit-student" ' +
                    'data-id="' +
                    escapeHTML(
                        String(student.id)
                    ) +
                    '">' +

                    "ترمیم" +

                    "</button>" +


                    '<button type="button" ' +
                    'class="delete-student" ' +
                    'data-id="' +
                    escapeHTML(
                        String(student.id)
                    ) +
                    '">' +

                    "حذف کریں" +

                    "</button>" +

                    "</div>";


                studentsList.appendChild(
                    card
                );

            }
        );


        studentsList
            .querySelectorAll(
                ".view-student"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            viewStudent(
                                this.dataset.id
                            );

                        }
                    );

                }
            );


        studentsList
            .querySelectorAll(
                ".edit-student"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            editStudent(
                                this.dataset.id
                            );

                        }
                    );

                }
            );


        studentsList
            .querySelectorAll(
                ".delete-student"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            deleteStudent(
                                this.dataset.id
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       VIEW STUDENT
    ===================================================== */

    async function viewStudent(id) {

        const rawStudents =
            await loadStudentsFromSupabase();


        const student =
            rawStudents
                .map(
                    dbRowToStudent
                )
                .find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(id)
                        );

                    }
                );


        if (!student) {

            alert(
                "طالبہ کی معلومات نہیں مل سکیں۔"
            );

            return;

        }


        let text =

            "👧 طالبہ کی مکمل معلومات\n\n" +

            "داخلہ نمبر: " +
            (
                student.admissionNo ||
                "درج نہیں"
            ) +

            "\n\n" +

            "داخلہ کی قسم: " +
            (
                student.admissionType ||
                "درج نہیں"
            ) +

            "\n\n" +

            "نام: " +
            (
                student.name ||
                "درج نہیں"
            ) +

            "\n\n" +

            "والد کا نام: " +
            (
                student.fatherName ||
                "درج نہیں"
            ) +

            "\n\n" +

            "سرپرست کا نام: " +
            (
                student.guardianName ||
                "درج نہیں"
            ) +

            "\n\n" +

            "شناختی کارڈ نمبر: " +
            (
                student.studentCNIC ||
                "درج نہیں"
            ) +

            "\n\n" +

            "تاریخ پیدائش: " +
            (
                student.dateOfBirth ||
                "درج نہیں"
            ) +

            "\n\n" +

            "جماعت: " +
            (
                student.studentClass ||
                "درج نہیں"
            ) +

            "\n\n" +

            "موبائل نمبر: " +
            (
                student.phone ||
                "درج نہیں"
            ) +

            "\n\n" +

            "داخلہ کی تاریخ: " +
            (
                student.admissionDate ||
                "درج نہیں"
            ) +

            "\n\n" +

            "پتہ: " +
            (
                student.address ||
                "درج نہیں"
            ) +

            "\n\n" +

            "رہائش: " +
            (
                student.residenceType ||
                "درج نہیں"
            );


        if (student.previousMadrassa) {

            text +=
                "\n\nپچھلا مدرسہ: " +
                student.previousMadrassa;

        }


        if (student.transferDate) {

            text +=
                "\n\nمنتقلی کی تاریخ: " +
                student.transferDate;

        }


        if (
            Array.isArray(
                student.mahrams
            ) &&
            student.mahrams.length > 0
        ) {

            text +=
                "\n\nمحرم کی معلومات:\n";


            student.mahrams.forEach(
                function (
                    mahram,
                    index
                ) {

                    text +=

                        "\n" +
                        (index + 1) +
                        ". نام: " +
                        (
                            mahram.name ||
                            "درج نہیں"
                        ) +

                        "\nرشتہ: " +
                        (
                            mahram.relation ||
                            "درج نہیں"
                        ) +

                        "\nشناختی کارڈ: " +
                        (
                            mahram.cnic ||
                            "درج نہیں"
                        ) +

                        "\nموبائل: " +
                        (
                            mahram.phone ||
                            "درج نہیں"
                        ) +

                        "\nمنظوری: " +
                        (
                            mahram.approved
                                ? "ہاں"
                                : "نہیں"
                        ) +

                        "\n";

                }
            );

        }


        alert(text);

    }


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    async function editStudent(id) {

        const rawStudents =
            await loadStudentsFromSupabase();


        const student =
            rawStudents
                .map(
                    dbRowToStudent
                )
                .find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(id)
                        );

                    }
                );


        if (!student) {

            alert(
                "طالبہ کی معلومات نہیں مل سکیں۔"
            );

            return;

        }


        if (studentFormContainer) {

            studentFormContainer.classList.remove(
                "hidden"
            );

        }


        if (editStudentId) {

            editStudentId.value =
                String(student.id);

        }


        const formTitle =
            document.getElementById(
                "formTitle"
            );


        if (formTitle) {

            formTitle.textContent =
                "طالبہ کی معلومات میں ترمیم";

        }


        const fieldMap = {

            admissionType:
                student.admissionType,

            admissionNo:
                student.admissionNo,

            previousMadrassa:
                student.previousMadrassa,

            transferDate:
                student.transferDate,

            studentName:
                student.name,

            fatherName:
                student.fatherName,

            guardianName:
                student.guardianName,

            studentCNIC:
                student.studentCNIC,

            dateOfBirth:
                student.dateOfBirth,

            studentClass:
                student.studentClass,

            phone:
                student.phone,

            admissionDate:
                student.admissionDate,

            address:
                student.address,

            residenceType:
                student.residenceType

        };


        Object.keys(fieldMap).forEach(
            function (key) {

                const field =
                    document.getElementById(
                        key
                    );


                if (field) {

                    field.value =
                        fieldMap[key] || "";

                }

            }
        );


        updateTransferFields();

        updateResidence();


        if (mahramList) {

            mahramList.innerHTML = "";


            if (
                Array.isArray(
                    student.mahrams
                )
            ) {

                student.mahrams.forEach(
                    function (mahram) {

                        createMahram(
                            mahram
                        );

                    }
                );

            }

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    async function deleteStudent(id) {

        const rawStudents =
            await loadStudentsFromSupabase();


        const student =
            rawStudents.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(id)
                    );

                }
            );


        if (!student) {

            alert(
                "طالبہ کی معلومات نہیں مل سکیں۔"
            );

            return;

        }


        const studentName =
            student.name ||
            "یہ طالبہ";


        const confirmed =
            confirm(
                "کیا آپ واقعی \"" +
                studentName +
                "\" کو حذف کرنا چاہتے ہیں؟\n\n" +
                "یہ عمل واپس نہیں کیا جا سکتا۔"
            );


        if (!confirmed) {
            return;
        }


        if (!checkSupabase()) {
            return;
        }


        const {
            error
        } = await supabaseClient
            .from("Students")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Student delete error:",
                error
            );


            alert(
                "طالبہ حذف نہیں ہو سکی۔\n\n" +
                "اصل وجہ:\n" +
                (
                    error.message ||
                    "نامعلوم database error"
                ) +
                (
                    error.code
                        ? "\n\nError Code: " +
                          error.code
                        : ""
                )
            );

            return;

        }


        alert(
            "طالبہ کامیابی سے حذف کر دی گئی ہے۔"
        );


        await displayStudents();

        await updateDashboardStudentCount();

    }


    /* =====================================================
       STUDENT SEARCH
    ===================================================== */

    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            function () {

                displayStudents(
                    this.value
                );

            }
        );

    }


    /* =====================================================
       DASHBOARD STUDENT COUNT
    ===================================================== */

    async function updateDashboardStudentCount() {

        const studentTotal =
            document.getElementById(
                "studentTotal"
            );


        if (!studentTotal) {
            return;
        }


        const rawStudents =
            await loadStudentsFromSupabase();


        studentTotal.textContent =
            rawStudents.length;

    }


    /* =====================================================
       TEACHER MANAGEMENT
       TABLE = Teachers
    ===================================================== */

    function dbRowToTeacher(row) {

        return {

            id:
                row.id,

            teacherCode:
                row.teacher_code || "",

            name:
                row.name || "",

            fatherName:
                row.father_name || "",

            phone:
                row.phone || "",

            cnic:
                row.cnic || "",

            address:
                row.address || "",

            qualification:
                row.qualification || "",

            joiningDate:
                row.joining_date || "",

            status:
                row.status || "pending",

            createdAt:
                row.created_at || "",

            updatedAt:
                row.updated_at || ""

        };

    }


    async function loadTeachersFromSupabase() {

        if (!checkSupabase()) {
            return [];
        }


        const {
            data,
            error
        } = await supabaseClient
            .from("Teachers")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Teachers load error:",
                error
            );


            alert(
                "اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔\n\n" +
                "اصل وجہ:\n" +
                (
                    error.message ||
                    "نامعلوم database error"
                ) +
                (
                    error.code
                        ? "\n\nError Code: " +
                          error.code
                        : ""
                )
            );


            return [];

        }


        teachersCache =
            data || [];


        return teachersCache;

    }


    function normalizeTeacherStatus(status) {

        const value =
            String(
                status || ""
            )
                .trim()
                .toLowerCase();


        if (
            value === "active" ||
            value === "فعال"
        ) {

            return "active";

        }


        if (
            value === "disabled" ||
            value === "غیر فعال"
        ) {

            return "disabled";

        }


        return "pending";

    }


    function teacherStatusText(status) {

        const normalized =
            normalizeTeacherStatus(
                status
            );


        if (
            normalized === "active"
        ) {

            return "فعال";

        }


        if (
            normalized === "disabled"
        ) {

            return "غیر فعال";

        }


        return "زیرِ منظوری";

    }


    function isValidTeacherCode(code) {

        return (
            String(
                code || ""
            ).trim().length > 0
        );

    }


    function getTeacherFormData() {

        function getValue(id) {

            const field =
                document.getElementById(
                    id
                );

            return field
                ? field.value.trim()
                : "";

        }


        return {

            teacherCode:
                getValue(
                    "teacherCode"
                ),

            name:
                getValue(
                    "teacherName"
                ),

            fatherName:
                getValue(
                    "teacherFatherName"
                ),

            phone:
                getValue(
                    "teacherPhone"
                ),

            cnic:
                getValue(
                    "teacherCNIC"
                ),

            qualification:
                getValue(
                    "teacherQualification"
                ),

            joiningDate:
                (
                    document.getElementById(
                        "teacherJoiningDate"
                    ) || {}
                ).value || "",

            address:
                getValue(
                    "teacherAddress"
                )

        };

    }


    function validateTeacher(teacher) {

        if (
            !isValidTeacherCode(
                teacher.teacherCode
            )
        ) {

            alert(
                "براہِ کرم Teacher Code درج کریں۔"
            );

            return false;

        }


        if (
            !isValidUrduName(
                teacher.name
            )
        ) {

            alert(
                "Teacher کا نام صرف اردو حروف میں درج کریں۔"
            );

            return false;

        }


        if (
            teacher.fatherName &&
            !isValidUrduName(
                teacher.fatherName
            )
        ) {

            alert(
                "والد کا نام صرف اردو حروف میں درج کریں۔"
            );

            return false;

        }


        if (
            teacher.phone &&
            !isValidPhone(
                teacher.phone
            )
        ) {

            alert(
                "Teacher کا موبائل نمبر 11 ہندسوں کا ہونا چاہیے۔"
            );

            return false;

        }


        if (
            teacher.cnic &&
            !isValidCNIC(
                teacher.cnic
            )
        ) {

            alert(
                "Teacher کا CNIC 13 ہندسوں کا ہونا چاہیے۔"
            );

            return false;

        }


        return true;

    }


    function createDatabaseTeacherData(teacher) {

        return {

            teacher_code:
                teacher.teacherCode || null,

            name:
                teacher.name || null,

            father_name:
                teacher.fatherName || null,

            phone:
                teacher.phone || null,

            cnic:
                teacher.cnic || null,

            address:
                teacher.address || null,

            qualification:
                teacher.qualification || null,

            joining_date:
                teacher.joiningDate || null,

            status:
                "pending"

        };

    }


    const teacherForm =
        document.getElementById(
            "teacherForm"
        );

    const teacherFormContainer =
        document.getElementById(
            "teacherFormContainer"
        );

    const showTeacherForm =
        document.getElementById(
            "showTeacherForm"
        );

    const cancelTeacherButton =
        document.getElementById(
            "cancelTeacherButton"
        );

    const teacherSearch =
        document.getElementById(
            "teacherSearch"
        );

    const teacherList =
        document.getElementById(
            "teacherList"
        );

    const teacherTotal =
        document.getElementById(
            "teacherTotal"
        );

    const activeTeacherTotal =
        document.getElementById(
            "activeTeacherTotal"
        );

    const pendingTeacherTotal =
        document.getElementById(
            "pendingTeacherTotal"
        );

    const teacherListCount =
        document.getElementById(
            "teacherListCount"
        );


    function showTeacherFormPanel() {

        if (
            getUserRole() !== "admin"
        ) {

            alert(
                "صرف ایڈمن Teacher شامل کر سکتا ہے۔"
            );

            return;

        }


        if (teacherForm) {

            teacherForm.reset();

        }


        if (teacherFormContainer) {

            teacherFormContainer.classList.remove(
                "hidden"
            );

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function hideTeacherFormPanel() {

        if (teacherFormContainer) {

            teacherFormContainer.classList.add(
                "hidden"
            );

        }

    }


    if (showTeacherForm) {

        showTeacherForm.addEventListener(
            "click",
            function () {

                showTeacherFormPanel();

            }
        );

    }


    if (cancelTeacherButton) {

        cancelTeacherButton.addEventListener(
            "click",
            function () {

                hideTeacherFormPanel();

            }
        );

    }


    if (teacherForm) {

        teacherForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (
                    getUserRole() !== "admin"
                ) {

                    alert(
                        "صرف ایڈمن Teacher شامل کر سکتا ہے۔"
                    );

                    return;

                }


                const saveButton =
                    document.getElementById(
                        "saveTeacherButton"
                    );


                if (saveButton) {

                    saveButton.disabled =
                        true;

                }


                try {

                    if (!checkSupabase()) {
                        return;
                    }


                    const teacher =
                        getTeacherFormData();


                    if (
                        !validateTeacher(
                            teacher
                        )
                    ) {

                        return;

                    }


                    const rawTeachers =
                        await loadTeachersFromSupabase();


                    const teachers =
                        rawTeachers.map(
                            dbRowToTeacher
                        );


                    const duplicateCode =
                        teachers.find(
                            function (item) {

                                return (
                                    String(
                                        item.teacherCode ||
                                        ""
                                    )
                                        .trim()
                                        .toLowerCase() ===
                                    String(
                                        teacher.teacherCode ||
                                        ""
                                    )
                                        .trim()
                                        .toLowerCase()
                                );

                            }
                        );


                    if (duplicateCode) {

                        alert(
                            "یہ Teacher Code پہلے سے موجود ہے۔ براہِ کرم دوسرا Code استعمال کریں۔"
                        );

                        return;

                    }


                    if (teacher.cnic) {

                        const newCNIC =
                            getDigits(
                                teacher.cnic
                            );


                        const duplicateCNIC =
                            teachers.find(
                                function (item) {

                                    return (
                                        item.cnic &&
                                        getDigits(
                                            item.cnic
                                        ) ===
                                        newCNIC
                                    );

                                }
                            );


                        if (duplicateCNIC) {

                            alert(
                                "یہ Teacher CNIC پہلے سے موجود ہے۔"
                            );

                            return;

                        }

                    }


                    const dbData =
                        createDatabaseTeacherData(
                            teacher
                        );


                    const {
                        data,
                        error
                    } = await supabaseClient
                        .from("Teachers")
                        .insert([
                            dbData
                        ])
                        .select()
                        .single();


                    if (error) {

                        console.error(
                            "Teacher save error:",
                            error
                        );


                        alert(
                            "Teacher محفوظ نہیں ہو سکا۔\n\n" +
                            "اصل وجہ:\n" +
                            (
                                error.message ||
                                "نامعلوم database error"
                            ) +
                            (
                                error.code
                                    ? "\n\nError Code: " +
                                      error.code
                                    : ""
                            ) +
                            (
                                error.details
                                    ? "\n\nتفصیل:\n" +
                                      error.details
                                    : ""
                            ) +
                            (
                                error.hint
                                    ? "\n\nمشورہ:\n" +
                                      error.hint
                                    : ""
                            )
                        );

                        return;

                    }


                    console.log(
                        "Teacher saved:",
                        data
                    );


                    alert(
                        "Teacher کامیابی سے محفوظ ہو گیا ہے۔\n\n" +
                        "Status: زیرِ منظوری"
                    );


                    teacherForm.reset();

                    hideTeacherFormPanel();

                    await displayTeachers();


                } catch (error) {

                    console.error(
                        "Teacher submit error:",
                        error
                    );


                    alert(
                        "Teacher محفوظ نہیں ہو سکا۔\n\n" +
                        "اصل وجہ:\n" +
                        (
                            error.message ||
                            "سسٹم میں نامعلوم مسئلہ پیش آیا ہے۔"
                        )
                    );


                } finally {

                    if (saveButton) {

                        saveButton.disabled =
                            false;

                    }

                }

            }
        );

    }


    async function viewTeacher(id) {

        const rawTeachers =
            await loadTeachersFromSupabase();


        const teacher =
            rawTeachers
                .map(
                    dbRowToTeacher
                )
                .find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(id)
                        );

                    }
                );


        if (!teacher) {

            alert(
                "Teacher کی معلومات نہیں مل سکیں۔"
            );

            return;

        }


        const text =

            "👩‍🏫 Teacher کی مکمل معلومات\n\n" +

            "Teacher Code: " +
            (
                teacher.teacherCode ||
                "درج نہیں"
            ) +

            "\n\n" +

            "نام: " +
            (
                teacher.name ||
                "درج نہیں"
            ) +

            "\n\n" +

            "والد کا نام: " +
            (
                teacher.fatherName ||
                "درج نہیں"
            ) +

            "\n\n" +

            "موبائل: " +
            (
                teacher.phone ||
                "درج نہیں"
            ) +

            "\n\n" +

            "CNIC: " +
            (
                teacher.cnic ||
                "درج نہیں"
            ) +

            "\n\n" +

            "تعلیمی قابلیت: " +
            (
                teacher.qualification ||
                "درج نہیں"
            ) +

            "\n\n" +

            "Joining Date: " +
            (
                teacher.joiningDate ||
                "درج نہیں"
            ) +

            "\n\n" +

            "Status: " +
            teacherStatusText(
                teacher.status
            ) +

            "\n\n" +

            "پتہ: " +
            (
                teacher.address ||
                "درج نہیں"
            );


        alert(text);

    }


    async function deleteTeacher(id) {

        if (
            getUserRole() !== "admin"
        ) {

            alert(
                "صرف ایڈمن Teacher حذف کر سکتا ہے۔"
            );

            return;

        }


        const rawTeachers =
            await loadTeachersFromSupabase();


        const teacher =
            rawTeachers.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(id)
                    );

                }
            );


        if (!teacher) {

            alert(
                "Teacher کی معلومات نہیں مل سکیں۔"
            );

            return;

        }


        const confirmed =
            confirm(
                "کیا آپ واقعی \"" +
                (
                    teacher.name ||
                    "اس Teacher"
                ) +
                "\" کو حذف کرنا چاہتے ہیں؟\n\n" +
                "یہ عمل واپس نہیں کیا جا سکتا۔"
            );


        if (!confirmed) {
            return;
        }


        if (!checkSupabase()) {
            return;
        }


        const {
            error
        } = await supabaseClient
            .from("Teachers")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Teacher delete error:",
                error
            );


            alert(
                "Teacher حذف نہیں ہو سکا۔\n\n" +
                "اصل وجہ:\n" +
                (
                    error.message ||
                    "نامعلوم database error"
                ) +
                (
                    error.code
                        ? "\n\nError Code: " +
                          error.code
                        : ""
                )
            );

            return;

        }


        alert(
            "Teacher کامیابی سے حذف کر دیا گیا ہے۔"
        );


        await displayTeachers();

    }


    async function displayTeachers(
        searchTerm = ""
    ) {

        if (!teacherList) {
            return;
        }


        const rawTeachers =
            await loadTeachersFromSupabase();


        const teachers =
            rawTeachers.map(
                dbRowToTeacher
            );


        const total =
            teachers.length;


        const active =
            teachers.filter(
                function (teacher) {

                    return (
                        normalizeTeacherStatus(
                            teacher.status
                        ) === "active"
                    );

                }
            ).length;


        const pending =
            teachers.filter(
                function (teacher) {

                    return (
                        normalizeTeacherStatus(
                            teacher.status
                        ) === "pending"
                    );

                }
            ).length;


        if (teacherTotal) {

            teacherTotal.textContent =
                total;

        }


        if (activeTeacherTotal) {

            activeTeacherTotal.textContent =
                active;

        }


        if (pendingTeacherTotal) {

            pendingTeacherTotal.textContent =
                pending;

        }


        const search =
            String(
                searchTerm || ""
            )
                .trim()
                .toLowerCase();


        let filteredTeachers =
            teachers;


        if (search !== "") {

            filteredTeachers =
                teachers.filter(
                    function (teacher) {

                        return (

                            String(
                                teacher.name || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                teacher.teacherCode || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                teacher.phone || ""
                            )
                                .includes(search)

                            ||

                            String(
                                teacher.cnic || ""
                            )
                                .includes(search)

                        );

                    }
                );

        }


        if (teacherListCount) {

            teacherListCount.textContent =
                filteredTeachers.length;

        }


        teacherList.innerHTML = "";


        if (
            filteredTeachers.length === 0
        ) {

            teacherList.innerHTML =

                '<div class="empty-state">' +

                (
                    search
                        ? "تلاش کے مطابق کوئی Teacher نہیں ملا۔"
                        : "ابھی کوئی Teacher موجود نہیں۔"
                ) +

                "</div>";

            return;

        }


        filteredTeachers.forEach(
            function (teacher) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "student-card";


                const status =
                    normalizeTeacherStatus(
                        teacher.status
                    );


                let statusClass =
                    "pending";


                if (
                    status === "active"
                ) {

                    statusClass =
                        "active";

                }


                if (
                    status === "disabled"
                ) {

                    statusClass =
                        "disabled";

                }


                card.innerHTML =

                    '<div class="student-card-header">' +

                    '<div class="student-avatar">👩‍🏫</div>' +

                    '<div>' +

                    "<h3>" +

                    escapeHTML(
                        teacher.name ||
                        "نام درج نہیں"
                    ) +

                    "</h3>" +

                    "<span>" +

                    "Teacher Code: " +

                    escapeHTML(
                        teacher.teacherCode ||
                        "درج نہیں"
                    ) +

                    "</span>" +

                    "</div>" +

                    "</div>" +


                    '<div class="student-badges">' +

                    "<span>" +

                    escapeHTML(
                        teacher.qualification ||
                        "قابلیت درج نہیں"
                    ) +

                    "</span>" +

                    "<span>" +

                    escapeHTML(
                        teacherStatusText(
                            teacher.status
                        )
                    ) +

                    "</span>" +

                    "</div>" +


                    '<div class="student-info">' +

                    "<p>" +

                    "<strong>موبائل:</strong> " +

                    escapeHTML(
                        teacher.phone ||
                        "درج نہیں"
                    ) +

                    "</p>" +


                    "<p>" +

                    "<strong>Joining Date:</strong> " +

                    escapeHTML(
                        teacher.joiningDate ||
                        "درج نہیں"
                    ) +

                    "</p>" +

                    "</div>" +


                    '<div class="student-card-buttons">' +

                    '<button type="button" ' +
                    'class="view-teacher" ' +
                    'data-id="' +
                    escapeHTML(
                        String(teacher.id)
                    ) +
                    '">' +

                    "دیکھیں" +

                    "</button>" +


                    '<button type="button" ' +
                    'class="delete-teacher" ' +
                    'data-id="' +
                    escapeHTML(
                        String(teacher.id)
                    ) +
                    '">' +

                    "حذف کریں" +

                    "</button>" +

                    "</div>";


                teacherList.appendChild(
                    card
                );

            }
        );


        teacherList
            .querySelectorAll(
                ".view-teacher"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            viewTeacher(
                                this.dataset.id
                            );

                        }
                    );

                }
            );


        teacherList
            .querySelectorAll(
                ".delete-teacher"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            deleteTeacher(
                                this.dataset.id
                            );

                        }
                    );

                }
            );

    }


    if (teacherSearch) {

        teacherSearch.addEventListener(
            "input",
            function () {

                displayTeachers(
                    this.value
                );

            }
        );

    }


    /* =====================================================
       DASHBOARD WELCOME
    ===================================================== */

    const dashboardTitle =
        document.getElementById(
            "dashboardTitle"
        ) ||
        document.getElementById(
            "dashboardWelcome"
        ) ||
        document.querySelector(
            ".dashboard-header h1"
        );


    if (dashboardTitle) {

        const role =
            getUserRole();


        if (role === "admin") {

            dashboardTitle.textContent =
                "خوش آمدید، ایڈمن";

        } else if (
            role === "teacher"
        ) {

            dashboardTitle.textContent =
                "خوش آمدید، استادہ";

        } else if (
            role === "student"
        ) {

            dashboardTitle.textContent =
                "خوش آمدید، طالبہ";

        }

    }


    /* =====================================================
       DASHBOARD MENU
    ===================================================== */

    document.querySelectorAll(
        ".menu-card"
    ).forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const page =
                        this.dataset.page;


                    if (
                        page === "students"
                    ) {

                        window.location.href =
                            "students.html";

                    }


                    if (
                        page === "teachers"
                    ) {

                        window.location.href =
                            "teachers.html";

                    }

                }
            );

        }
    );


    /* =====================================================
       DIRECT STUDENTS BUTTON FALLBACK
    ===================================================== */

    const studentsMenu =
        document.getElementById(
            "studentsMenu"
        );


    if (studentsMenu) {

        studentsMenu.addEventListener(
            "click",
            function () {

                window.location.href =
                    "students.html";

            }
        );

    }


    /* =====================================================
       DIRECT TEACHERS BUTTON FALLBACK
    ===================================================== */

    const teachersMenu =
        document.getElementById(
            "teachersMenu"
        );


    if (teachersMenu) {

        teachersMenu.addEventListener(
            "click",
            function () {

                if (
                    getUserRole() !== "admin"
                ) {

                    alert(
                        "اساتذہ کے انتظام کے لیے صرف ایڈمن کو اجازت ہے۔"
                    );

                    return;

                }


                window.location.href =
                    "teachers.html";

            }
        );

    }


    /* =====================================================
       BACK TO DASHBOARD
    ===================================================== */

    const backToDashboard =
        document.getElementById(
            "backToDashboard"
        );


    if (backToDashboard) {

        backToDashboard.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    document
        .querySelectorAll(
            "#logoutButton, .logout-button, [data-action='logout']"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        autoSaveCurrentWork();


                        localStorage.removeItem(
                            "loggedIn"
                        );

                        localStorage.removeItem(
                            "userRole"
                        );


                        window.location.href =
                            "index.html";

                    }
                );

            }
        );


    /* =====================================================
       INITIALIZE STUDENT PAGE
    ===================================================== */

    if (
        currentPage === "students.html"
    ) {

        updateTransferFields();

        updateResidence();

        restoreStudentDraft();

        displayStudents();

    }


    /* =====================================================
       INITIALIZE TEACHER PAGE
    ===================================================== */

    if (
        currentPage === "teachers.html"
    ) {

        displayTeachers();

    }


    /* =====================================================
       INITIALIZE DASHBOARD
    ===================================================== */

    if (
        currentPage === "dashboard.html"
    ) {

        updateDashboardStudentCount();

    }


    /* =====================================================
       GLOBAL INITIALIZATION
    ===================================================== */

    if (isLoggedIn()) {

        resetInactivityTimer();

    }

});
