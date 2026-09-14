/* =========================================================
   MASTER SCRIPT.JS
   PART 1 / 3
   CORE + SUPABASE + LOGIN + SESSION + DASHBOARD
   مدرسہ شہناز اختر للبنات
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    "use strict";


    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://ggtnetudnjsmsmitvjmb.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";

    const STUDENTS_TABLE =
        "Students";

    const TEACHERS_TABLE =
        "Teachers";


    let supabaseClient = null;


    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

    } else {

        console.error(
            "Supabase load نہیں ہوا۔"
        );
    }


    /* =====================================================
       CURRENT PAGE
    ===================================================== */

    const currentPage =
        (
            window.location.pathname
                .split("/")
                .pop() ||
            "index.html"
        )
            .split("?")[0]
            .toLowerCase();


    /* =====================================================
       BASIC HELPERS
    ===================================================== */

    function safeString(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }

        return String(value).trim();
    }


    function getElement(id) {

        return document.getElementById(id);
    }


    function escapeHtml(value) {

        return safeString(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function onlyDigits(value) {

        return safeString(value)
            .replace(/\D/g, "");
    }


    function normalizePhone(value) {

        return onlyDigits(value)
            .slice(0, 11);
    }


    function canonicalCNIC(value) {

        return onlyDigits(value)
            .slice(0, 13);
    }


    function formatCNIC(value) {

        const digits =
            canonicalCNIC(value);


        if (digits.length !== 13) {

            return digits;
        }


        return (
            digits.slice(0, 5) +
            "-" +
            digits.slice(5, 12) +
            "-" +
            digits.slice(12)
        );
    }


    function isUrduName(value) {

        const text =
            safeString(value);


        if (!text) {
            return false;
        }


        return /^[\u0600-\u06FF\s]+$/u.test(text);
    }


    function getRecordValue(
        record,
        keys,
        fallback = ""
    ) {

        if (!record) {
            return fallback;
        }


        const keyList =
            Array.isArray(keys)
                ? keys
                : [keys];


        for (
            const key of keyList
        ) {

            const value =
                record[key];


            if (
                value !== null &&
                value !== undefined &&
                value !== ""
            ) {

                return value;
            }
        }


        return fallback;
    }


    function showMessage(
        element,
        message,
        type = "error"
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            safeString(message);


        element.style.display =
            message
                ? "block"
                : "none";


        element.style.color =
            type === "success"
                ? "#16a34a"
                : "#dc2626";
    }


    function clearMessage(element) {

        if (!element) {
            return;
        }


        element.textContent = "";

        element.style.display = "none";
    }


    function getRpcRecord(data) {

        if (!data) {
            return null;
        }


        if (
            Array.isArray(data)
        ) {

            return data.length
                ? data[0]
                : null;
        }


        if (
            typeof data === "object"
        ) {

            return data;
        }


        return null;
    }


    /* =====================================================
       SESSION
    ===================================================== */

    const SESSION_KEYS = {

        loggedIn:
            "loggedIn",

        role:
            "userRole",

        userId:
            "userId",

        username:
            "username",

        remember:
            "rememberLogin",

        lastActivity:
            "lastActivity"

    };


    function isAuthenticated() {

        return (
            localStorage.getItem(
                SESSION_KEYS.loggedIn
            ) === "true"
        );
    }


    function getCurrentRole() {

        return safeString(
            localStorage.getItem(
                SESSION_KEYS.role
            )
        ).toLowerCase();
    }


    function getUserRole() {

        return getCurrentRole();
    }


    function saveSession(
        role,
        userId,
        username,
        remember = false
    ) {

        localStorage.setItem(
            SESSION_KEYS.loggedIn,
            "true"
        );

        localStorage.setItem(
            SESSION_KEYS.role,
            safeString(role)
        );

        localStorage.setItem(
            SESSION_KEYS.userId,
            safeString(userId)
        );

        localStorage.setItem(
            SESSION_KEYS.username,
            safeString(username)
        );

        localStorage.setItem(
            SESSION_KEYS.remember,
            remember
                ? "true"
                : "false"
        );

        localStorage.setItem(
            SESSION_KEYS.lastActivity,
            String(Date.now())
        );
    }


    function clearSession() {

        Object.values(
            SESSION_KEYS
        ).forEach(
            function (key) {

                localStorage.removeItem(key);
                sessionStorage.removeItem(key);

            }
        );
    }


    function logout() {

        clearSession();

        window.location.href =
            "index.html";
    }


    /* =====================================================
       REQUESTED LOGIN ROLE
    ===================================================== */

    function getRequestedRole() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const role =
            safeString(
                params.get("role")
            ).toLowerCase();


        if (
            role === "admin" ||
            role === "teacher" ||
            role === "student"
        ) {

            return role;
        }


        return "";
    }


    /* =====================================================
       HOME PAGE
    ===================================================== */

    function initializeHomePage() {

        if (
            currentPage !== "index.html"
        ) {

            return;
        }


        const adminButton =
            getElement("adminLoginButton");

        const teacherButton =
            getElement("teacherLoginButton");

        const studentButton =
            getElement("studentLoginButton");


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
    }


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    function initializePasswordToggle() {

        const password =
            getElement("password");

        const toggle =
            getElement("togglePassword");


        if (
            !password ||
            !toggle
        ) {

            return;
        }


        toggle.addEventListener(
            "click",
            function () {

                const isHidden =
                    password.type === "password";


                password.type =
                    isHidden
                        ? "text"
                        : "password";


                toggle.textContent =
                    isHidden
                        ? "🙈"
                        : "👁️";


                toggle.setAttribute(
                    "aria-label",
                    isHidden
                        ? "پاس ورڈ چھپائیں"
                        : "پاس ورڈ دکھائیں"
                );
            }
        );
    }


    /* =====================================================
       ADMIN LOGIN
    ===================================================== */

    async function loginAdmin(
        username,
        password
    ) {

        if (!supabaseClient) {

            throw new Error(
                "Supabase سے رابطہ نہیں ہو سکا۔"
            );
        }


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "login_admin",
                {
                    p_username:
                        username,

                    p_password:
                        password
                }
            );


        if (error) {
            throw error;
        }


        const row =
            getRpcRecord(data);


        if (!row) {
            return null;
        }


        return {

            id:
                getRecordValue(
                    row,
                    [
                        "admin_id",
                        "id"
                    ],
                    ""
                ),

            username:
                getRecordValue(
                    row,
                    [
                        "admin_username",
                        "username"
                    ],
                    username
                ),

            status:
                getRecordValue(
                    row,
                    [
                        "auth_status",
                        "authorization_status",
                        "status"
                    ],
                    ""
                )

        };
    }


    /* =====================================================
       TEACHER LOGIN
    ===================================================== */

    async function loginTeacher(
        username,
        password
    ) {

        if (!supabaseClient) {

            throw new Error(
                "Supabase سے رابطہ نہیں ہو سکا۔"
            );
        }


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "login_teacher",
                {
                    p_username:
                        username,

                    p_password:
                        password
                }
            );


        if (error) {
            throw error;
        }


        const row =
            getRpcRecord(data);


        if (!row) {
            return null;
        }


        return {

            id:
                getRecordValue(
                    row,
                    [
                        "teacher_id",
                        "id"
                    ],
                    ""
                ),

            username:
                getRecordValue(
                    row,
                    [
                        "username",
                        "teacher_username"
                    ],
                    username
                ),

            status:
                getRecordValue(
                    row,
                    [
                        "authorization_status",
                        "auth_status",
                        "status"
                    ],
                    ""
                )

        };
    }


    /* =====================================================
       STUDENT LOGIN
    ===================================================== */

    async function loginStudent(
        username,
        password
    ) {

        if (!supabaseClient) {

            throw new Error(
                "Supabase سے رابطہ نہیں ہو سکا۔"
            );
        }


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "login_student",
                {
                    p_username:
                        username,

                    p_password:
                        password
                }
            );


        if (error) {
            throw error;
        }


        const row =
            getRpcRecord(data);


        if (!row) {
            return null;
        }


        return {

            id:
                getRecordValue(
                    row,
                    [
                        "student_id",
                        "id"
                    ],
                    ""
                ),

            username:
                getRecordValue(
                    row,
                    [
                        "username",
                        "student_username"
                    ],
                    username
                ),

            status:
                getRecordValue(
                    row,
                    [
                        "authorization_status",
                        "auth_status",
                        "status"
                    ],
                    ""
                )

        };
    }


    /* =====================================================
       LOGIN PAGE
    ===================================================== */

    function initializeLoginPage() {

        if (
            currentPage !== "login.html"
        ) {

            return;
        }


        const loginForm =
            getElement("loginForm");

        const usernameInput =
            getElement("username");

        const passwordInput =
            getElement("password");

        const rememberMe =
            getElement("rememberMe");

        const loginButton =
            getElement("loginButton");

        const backButton =
            getElement("backButton");

        const loginMessage =
            getElement("loginMessage");


        const requestedRole =
            getRequestedRole();


        if (!requestedRole) {

            window.location.href =
                "index.html";

            return;
        }


        initializePasswordToggle();


        if (backButton) {

            backButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "index.html";
                }
            );
        }


        async function performLogin() {

            clearMessage(
                loginMessage
            );


            const username =
                safeString(
                    usernameInput
                        ? usernameInput.value
                        : ""
                );


            const password =
                passwordInput
                    ? String(
                        passwordInput.value || ""
                    )
                    : "";


            const remember =
                Boolean(
                    rememberMe &&
                    rememberMe.checked
                );


            if (!username) {

                showMessage(
                    loginMessage,
                    "صارف نام درج کریں۔"
                );

                usernameInput?.focus();

                return;
            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "پاس ورڈ درج کریں۔"
                );

                passwordInput?.focus();

                return;
            }


            if (!supabaseClient) {

                showMessage(
                    loginMessage,
                    "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
                );

                return;
            }


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "⏳ لاگ اِن ہو رہا ہے...";
            }


            try {

                let user =
                    null;


                if (
                    requestedRole === "admin"
                ) {

                    user =
                        await loginAdmin(
                            username,
                            password
                        );

                } else if (
                    requestedRole === "teacher"
                ) {

                    user =
                        await loginTeacher(
                            username,
                            password
                        );

                } else if (
                    requestedRole === "student"
                ) {

                    user =
                        await loginStudent(
                            username,
                            password
                        );
                }


                if (!user) {

                    showMessage(
                        loginMessage,
                        "صارف نام یا پاس ورڈ غلط ہے۔"
                    );

                    return;
                }


                const status =
                    safeString(
                        user.status
                    ).toLowerCase();


                const approvedStatuses = [

                    "approved",
                    "active",
                    "فعال",
                    "منظور",
                    "منظور شدہ"

                ];


                if (
                    !approvedStatuses.includes(
                        status
                    )
                ) {

                    showMessage(
                        loginMessage,
                        "یہ اکاؤنٹ ابھی منظور نہیں ہوا۔"
                    );

                    return;
                }


                saveSession(
                    requestedRole,
                    user.id,
                    user.username || username,
                    remember
                );


                showMessage(
                    loginMessage,
                    "لاگ اِن کامیاب۔",
                    "success"
                );


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    loginMessage,
                    "لاگ اِن نہیں ہو سکا۔ دوبارہ کوشش کریں۔"
                );


            } finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "🔐 لاگ اِن";
                }
            }
        }


        if (loginButton) {

            loginButton.addEventListener(
                "click",
                performLogin
            );
        }


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    performLogin();
                }
            );
        }
    }


    /* =====================================================
       PAGE PROTECTION
    ===================================================== */

    function protectPage() {

        const protectedPages = [

            "dashboard.html",
            "students.html",
            "teachers.html"

        ];


        if (
            !protectedPages.includes(
                currentPage
            )
        ) {

            return true;
        }


        if (!isAuthenticated()) {

            window.location.href =
                "index.html";

            return false;
        }


        return true;
    }


    /* =====================================================
       ADMIN CHECK
    ===================================================== */

    function requireAdmin() {

        if (
            !isAuthenticated() ||
            getCurrentRole() !== "admin"
        ) {

            alert(
                "صرف ایڈمن کو اس کارروائی کی اجازت ہے۔"
            );

            return false;
        }


        return true;
    }


    /* =====================================================
       DASHBOARD COUNTS
    ===================================================== */

    async function getExactCount(
        tableName,
        filterColumn = null,
        filterValue = null
    ) {

        if (!supabaseClient) {
            return 0;
        }


        try {

            let query =
                supabaseClient
                    .from(tableName)
                    .select(
                        "id",
                        {
                            count:
                                "exact",

                            head:
                                true
                        }
                    );


            if (
                filterColumn &&
                filterValue !== null
            ) {

                query =
                    query.eq(
                        filterColumn,
                        filterValue
                    );
            }


            const {
                count,
                error
            } =
                await query;


            if (error) {
                throw error;
            }


            return Number(
                count || 0
            );


        } catch (error) {

            console.error(
                "Count error:",
                tableName,
                error
            );

            return 0;
        }
    }


    async function getClassCount() {

        if (!supabaseClient) {
            return 0;
        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(STUDENTS_TABLE)
                    .select("student_class");


            if (error) {
                throw error;
            }


            const classes =
                new Set();


            (
                Array.isArray(data)
                    ? data
                    : []
            ).forEach(
                function (row) {

                    const className =
                        safeString(
                            getRecordValue(
                                row,
                                [
                                    "student_class",
                                    "studentclass",
                                    "class_name",
                                    "className",
                                    "class"
                                ],
                                ""
                            )
                        );


                    if (className) {

                        classes.add(
                            className
                        );
                    }
                }
            );


            return classes.size;


        } catch (error) {

            console.error(
                "Class count error:",
                error
            );

            return 0;
        }
    }


    /* =====================================================
       DASHBOARD PAGE
    ===================================================== */

    async function initializeDashboardPage() {

        if (
            currentPage !== "dashboard.html"
        ) {

            return;
        }


        if (!protectPage()) {
            return;
        }


        const role =
            getCurrentRole();


        const username =
            safeString(
                localStorage.getItem(
                    SESSION_KEYS.username
                )
            );


        const welcomeMessage =
            getElement(
                "welcomeMessage"
            );


        if (welcomeMessage) {

            welcomeMessage.textContent =
                username
                    ? "خوش آمدید، " + username
                    : "خوش آمدید";
        }


        const studentTotal =
            getElement("studentTotal");

        const teacherTotal =
            getElement("teacherTotal");

        const hostelTotal =
            getElement("hostelTotal");

        const classTotal =
            getElement("classTotal");


        const results =
            await Promise.allSettled([

                getExactCount(
                    STUDENTS_TABLE
                ),

                getExactCount(
                    TEACHERS_TABLE
                ),

                getExactCount(
                    STUDENTS_TABLE,
                    "residence_type",
                    "ہاسٹل"
                ),

                getClassCount()

            ]);


        if (studentTotal) {

            studentTotal.textContent =
                results[0].status === "fulfilled"
                    ? String(results[0].value)
                    : "0";
        }


        if (teacherTotal) {

            teacherTotal.textContent =
                results[1].status === "fulfilled"
                    ? String(results[1].value)
                    : "0";
        }


        if (hostelTotal) {

            hostelTotal.textContent =
                results[2].status === "fulfilled"
                    ? String(results[2].value)
                    : "0";
        }


        if (classTotal) {

            classTotal.textContent =
                results[3].status === "fulfilled"
                    ? String(results[3].value)
                    : "0";
        }


        const menuRoutes = {

            studentsMenu:
                "students.html",

            teachersMenu:
                "teachers.html"

        };


        Object.entries(
            menuRoutes
        ).forEach(
            function (
                [id, page]
            ) {

                const button =
                    getElement(id);


                if (!button) {
                    return;
                }


                button.addEventListener(
                    "click",
                    function () {

                        if (
                            id === "teachersMenu" &&
                            role !== "admin"
                        ) {

                            alert(
                                "اساتذہ کا انتظام صرف ایڈمن کے لیے ہے۔"
                            );

                            return;
                        }


                        window.location.href =
                            page;
                    }
                );
            }
        );


        const futureMenus = [

            "attendanceMenu",
            "hostelMenu",
            "feesMenu",
            "reportsMenu"

        ];


        futureMenus.forEach(
            function (id) {

                const button =
                    getElement(id);


                if (!button) {
                    return;
                }


                button.addEventListener(
                    "click",
                    function () {

                        alert(
                            "یہ حصہ اگلے مرحلے میں شامل کیا جائے گا۔"
                        );
                    }
                );
            }
        );
    }


    /* =====================================================
       GLOBAL BACK BUTTON
    ===================================================== */

    function initializeBackButton() {

        const backButton =
            getElement(
                "backToDashboard"
            );


        if (!backButton) {
            return;
        }


        backButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";
            }
        );
    }


    /* =====================================================
       GLOBAL LOGOUT BUTTON
    ===================================================== */

    function initializeLogoutButton() {

        const logoutButton =
            getElement(
                "logoutButton"
            );


        if (!logoutButton) {
            return;
        }


        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    /* =====================================================
       INITIAL START
    ===================================================== */

    initializeHomePage();

    initializeLoginPage();

    initializeBackButton();

    initializeLogoutButton();

    await initializeDashboardPage();


    /* =====================================================
       PART 1 ENDS HERE

       DO NOT ADD });

       PASTE PART 2 DIRECTLY BELOW THIS LINE
    ===================================================== */

  /* =========================================================
   MASTER SCRIPT.JS
   PART 2 / 3
   COMPLETE STUDENT MODULE
========================================================= */


/* =====================================================
   STUDENT STATE
===================================================== */

let studentsCache = [];

let editingStudentId = null;

let isSavingStudent = false;

let isDeletingStudent = false;


/* =====================================================
   STUDENT ELEMENTS
===================================================== */

const studentFormContainer =
    getElement("studentFormContainer");

const studentForm =
    getElement("studentForm");

const studentFormTitle =
    getElement("formTitle");

const studentFormMessage =
    getElement("studentFormMessage");

const showStudentFormButton =
    getElement("showStudentForm");

const cancelStudentFormButton =
    getElement("cancelStudentForm");

const saveStudentButton =
    getElement("saveStudentButton");

const studentSearch =
    getElement("studentSearch");

const studentsList =
    getElement("studentsList");

const studentCount =
    getElement("studentCount");

const admissionType =
    getElement("admissionType");

const previousMadrassaGroup =
    getElement("previousMadrassaGroup");

const transferDateGroup =
    getElement("transferDateGroup");

const residenceType =
    getElement("residenceType");

const mahramSection =
    getElement("mahramSection");

const mahramList =
    getElement("mahramList");

const addMahramButton =
    getElement("addMahram");

const studentDetailsOverlay =
    getElement("studentDetailsOverlay");

const studentDetailsTitle =
    getElement("studentDetailsTitle");

const studentDetailsContent =
    getElement("studentDetailsContent");

const closeStudentDetailsButton =
    getElement("closeStudentDetails");


/* =====================================================
   STUDENT RECORD HELPERS
===================================================== */

function getStudentRecordValue(
    student,
    keys,
    fallback = ""
) {

    return getRecordValue(
        student,
        keys,
        fallback
    );
}


function getStudentName(student) {

    return getStudentRecordValue(
        student,
        [
            "name",
            "student_name",
            "studentName"
        ],
        ""
    );
}


function getStudentAdmissionNo(student) {

    return getStudentRecordValue(
        student,
        [
            "admission_no",
            "admissionNo"
        ],
        ""
    );
}


function getStudentAdmissionType(student) {

    return getStudentRecordValue(
        student,
        [
            "admission_type",
            "admissionType"
        ],
        ""
    );
}


function getStudentFatherName(student) {

    return getStudentRecordValue(
        student,
        [
            "father_name",
            "fatherName"
        ],
        ""
    );
}


function getStudentGuardianName(student) {

    return getStudentRecordValue(
        student,
        [
            "guardian_name",
            "guardianName"
        ],
        ""
    );
}


function getStudentCNIC(student) {

    return getStudentRecordValue(
        student,
        [
            "cnic",
            "studentCNIC"
        ],
        ""
    );
}


function getStudentPhone(student) {

    return getStudentRecordValue(
        student,
        [
            "phone",
            "studentPhone"
        ],
        ""
    );
}


function getStudentDOB(student) {

    return getStudentRecordValue(
        student,
        [
            "date_of_birth",
            "dateOfBirth"
        ],
        ""
    );
}


function getStudentClass(student) {

    return getStudentRecordValue(
        student,
        [
            "student_class",
            "studentclass",
            "class_name",
            "className",
            "class"
        ],
        ""
    );
}


function getStudentAdmissionDate(student) {

    return getStudentRecordValue(
        student,
        [
            "admission_date",
            "admissionDate"
        ],
        ""
    );
}


function getStudentAddress(student) {

    return getStudentRecordValue(
        student,
        [
            "address"
        ],
        ""
    );
}


function getStudentResidence(student) {

    return getStudentRecordValue(
        student,
        [
            "residence_type",
            "residenceType",
            "residence"
        ],
        ""
    );
}


function getStudentPreviousMadrassa(student) {

    return getStudentRecordValue(
        student,
        [
            "previous_madrassa",
            "previousMadrassa"
        ],
        ""
    );
}


function getStudentTransferDate(student) {

    return getStudentRecordValue(
        student,
        [
            "transfer_date",
            "transferDate"
        ],
        ""
    );
}


/* =====================================================
   STUDENT FORM VALUE
===================================================== */

function getStudentValue(id) {

    const field =
        getElement(id);


    if (!field) {
        return "";
    }


    return safeString(
        field.value
    );
}


/* =====================================================
   TRANSFER FIELDS
===================================================== */

function updateTransferFields() {

    if (!admissionType) {
        return;
    }


    const isTransfer =
        safeString(
            admissionType.value
        ) === "منتقلی";


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


    if (!isTransfer) {

        const previousMadrassa =
            getElement("previousMadrassa");

        const transferDate =
            getElement("transferDate");


        if (previousMadrassa) {

            previousMadrassa.value =
                "";
        }


        if (transferDate) {

            transferDate.value =
                "";
        }
    }
}


/* =====================================================
   MAHRAM RELATIONS
===================================================== */

const MAHRAM_RELATIONS = [

    "والد",
    "بھائی",
    "بیٹا",
    "دادا",
    "نانا",
    "چچا",
    "ماموں",
    "بھتیجا",
    "بھانجا",
    "شوہر",
    "سسر",
    "دیگر"

];


function normalizeMahramRelation(value) {

    const relation =
        safeString(value);


    const relationMap = {

        father:
            "والد",

        brother:
            "بھائی",

        son:
            "بیٹا",

        grandfather:
            "دادا",

        maternal_grandfather:
            "نانا",

        uncle:
            "چچا",

        maternal_uncle:
            "ماموں",

        nephew:
            "بھتیجا",

        husband:
            "شوہر",

        father_in_law:
            "سسر",

        other:
            "دیگر"

    };


    return (
        relationMap[
            relation.toLowerCase()
        ] ||
        relation
    );
}


/* =====================================================
   PARSE MAHRAMS
===================================================== */

function parseMahrams(value) {

    if (
        Array.isArray(value)
    ) {

        return value;
    }


    if (!value) {
        return [];
    }


    try {

        const parsed =
            JSON.parse(value);


        return Array.isArray(parsed)
            ? parsed
            : [];


    } catch (error) {

        console.error(
            "Mahram parse error:",
            error
        );

        return [];
    }
}


/* =====================================================
   CREATE MAHRAM ROW
===================================================== */

function createMahramRow(
    mahram = {}
) {

    if (!mahramList) {
        return;
    }


    const existingRows =
        mahramList.querySelectorAll(
            ".mahram-row"
        );


    if (
        existingRows.length >= 5
    ) {

        alert(
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return;
    }


    const row =
        document.createElement("div");


    row.className =
        "mahram-card mahram-row";


    const selectedRelation =
        normalizeMahramRelation(
            mahram.relation
        );


    const relationOptions =
        MAHRAM_RELATIONS
            .map(
                function (relation) {

                    const selected =
                        relation === selectedRelation
                            ? "selected"
                            : "";


                    return `
                        <option
                            value="${escapeHtml(relation)}"
                            ${selected}
                        >
                            ${escapeHtml(relation)}
                        </option>
                    `;
                }
            )
            .join("");


    row.innerHTML = `

        <div class="mahram-header">

            <strong>
                محرم
            </strong>

            <button
                type="button"
                class="remove-mahram"
            >
                🗑️ حذف کریں
            </button>

        </div>


        <div class="form-grid">

            <div class="form-group">

                <label>
                    محرم کا نام
                </label>

                <input
                    type="text"
                    class="mahram-name"
                    value="${escapeHtml(
                        mahram.name || ""
                    )}"
                    placeholder="محرم کا نام"
                >

            </div>


            <div class="form-group">

                <label>
                    رشتہ
                </label>

                <select
                    class="mahram-relation"
                >

                    <option value="">
                        رشتہ منتخب کریں
                    </option>

                    ${relationOptions}

                </select>

            </div>


            <div class="form-group">

                <label>
                    موبائل نمبر
                </label>

                <input
                    type="tel"
                    class="mahram-phone"
                    inputmode="numeric"
                    maxlength="11"
                    value="${escapeHtml(
                        normalizePhone(
                            mahram.phone
                        )
                    )}"
                    placeholder="03XXXXXXXXX"
                >

            </div>


            <div class="form-group">

                <label>
                    شناختی کارڈ نمبر
                </label>

                <input
                    type="text"
                    class="mahram-cnic"
                    inputmode="numeric"
                    maxlength="15"
                    value="${escapeHtml(
                        formatCNIC(
                            mahram.cnic
                        )
                    )}"
                    placeholder="00000-0000000-0"
                >

            </div>

        </div>
    `;


    mahramList.appendChild(row);


    const phoneInput =
        row.querySelector(
            ".mahram-phone"
        );

    const cnicInput =
        row.querySelector(
            ".mahram-cnic"
        );

    const removeButton =
        row.querySelector(
            ".remove-mahram"
        );


    if (phoneInput) {

        phoneInput.addEventListener(
            "input",
            function () {

                this.value =
                    normalizePhone(
                        this.value
                    );
            }
        );
    }


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


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                row.remove();
            }
        );
    }
}


/* =====================================================
   GET MAHRAMS
===================================================== */

function getMahramsFromForm() {

    if (!mahramList) {
        return [];
    }


    const mahrams = [];


    mahramList
        .querySelectorAll(
            ".mahram-row"
        )
        .forEach(
            function (row) {

                const name =
                    safeString(
                        row.querySelector(
                            ".mahram-name"
                        )?.value
                    );


                const relation =
                    safeString(
                        row.querySelector(
                            ".mahram-relation"
                        )?.value
                    );


                const phone =
                    normalizePhone(
                        row.querySelector(
                            ".mahram-phone"
                        )?.value
                    );


                const cnic =
                    canonicalCNIC(
                        row.querySelector(
                            ".mahram-cnic"
                        )?.value
                    );


                if (
                    name ||
                    relation ||
                    phone ||
                    cnic
                ) {

                    mahrams.push({

                        name:
                            name,

                        relation:
                            relation,

                        phone:
                            phone,

                        cnic:
                            cnic

                    });
                }
            }
        );


    return mahrams;
}


/* =====================================================
   LOAD MAHRAMS
===================================================== */

function loadMahramsIntoForm(value) {

    if (!mahramList) {
        return;
    }


    mahramList.innerHTML =
        "";


    parseMahrams(value)
        .slice(0, 5)
        .forEach(
            function (mahram) {

                createMahramRow(
                    mahram
                );
            }
        );
}


/* =====================================================
   RESIDENCE / HOSTEL
===================================================== */

function updateMahramSection() {

    if (!residenceType) {
        return;
    }


    const isHostel =
        safeString(
            residenceType.value
        ) === "ہاسٹل";


    if (mahramSection) {

        mahramSection.classList.toggle(
            "hidden",
            !isHostel
        );
    }


    if (
        isHostel &&
        mahramList &&
        mahramList.querySelectorAll(
            ".mahram-row"
        ).length === 0
    ) {

        createMahramRow();
    }


    if (
        !isHostel &&
        mahramList
    ) {

        mahramList.innerHTML =
            "";
    }
}


/* =====================================================
   STUDENT INPUT FORMATTING
===================================================== */

function initializeStudentFormatting() {

    const phone =
        getElement("phone");

    const cnic =
        getElement("studentCNIC");


    if (phone) {

        phone.addEventListener(
            "input",
            function () {

                this.value =
                    normalizePhone(
                        this.value
                    );
            }
        );
    }


    if (cnic) {

        cnic.addEventListener(
            "input",
            function () {

                this.value =
                    formatCNIC(
                        this.value
                    );
            }
        );
    }
}


/* =====================================================
   STUDENT FORM DATA
===================================================== */

function getStudentFormData() {

    return {

        admission_no:
            getStudentValue(
                "admissionNo"
            ) || null,

        admission_type:
            getStudentValue(
                "admissionType"
            ) || null,

        name:
            getStudentValue(
                "studentName"
            ) || null,

        father_name:
            getStudentValue(
                "fatherName"
            ) || null,

        guardian_name:
            getStudentValue(
                "guardianName"
            ) || null,

        cnic:
            canonicalCNIC(
                getStudentValue(
                    "studentCNIC"
                )
            ) || null,

        phone:
            normalizePhone(
                getStudentValue(
                    "phone"
                )
            ) || null,

        date_of_birth:
            getStudentValue(
                "dateOfBirth"
            ) || null,

        student_class:
            getStudentValue(
                "studentClass"
            ) || null,

        admission_date:
            getStudentValue(
                "admissionDate"
            ) || null,

        address:
            getStudentValue(
                "address"
            ) || null,

        residence_type:
            getStudentValue(
                "residenceType"
            ) || null,

        previous_madrassa:
            getStudentValue(
                "previousMadrassa"
            ) || null,

        transfer_date:
            getStudentValue(
                "transferDate"
            ) || null,

        mahrams:
            getMahramsFromForm()

    };
}


/* =====================================================
   STUDENT VALIDATION
===================================================== */

function validateStudentForm() {

    const data =
        getStudentFormData();


    if (!data.admission_no) {

        return "داخلہ نمبر درج کریں۔";
    }


    if (!data.admission_type) {

        return "داخلہ کی قسم منتخب کریں۔";
    }


    if (!data.name) {

        return "طالبہ کا نام درج کریں۔";
    }


    if (
        !isUrduName(
            data.name
        )
    ) {

        return "طالبہ کا نام صرف اردو میں درج کریں۔";
    }


    if (!data.father_name) {

        return "والد کا نام درج کریں۔";
    }


    if (
        !isUrduName(
            data.father_name
        )
    ) {

        return "والد کا نام صرف اردو میں درج کریں۔";
    }


    if (
        data.guardian_name &&
        !isUrduName(
            data.guardian_name
        )
    ) {

        return "سرپرست کا نام صرف اردو میں درج کریں۔";
    }


    if (
        !data.cnic ||
        data.cnic.length !== 13
    ) {

        return "شناختی کارڈ نمبر 13 ہندسوں پر مشتمل ہونا چاہیے۔";
    }


    if (
        !data.phone ||
        data.phone.length !== 11 ||
        !data.phone.startsWith("03")
    ) {

        return "درست 11 ہندسوں کا موبائل نمبر درج کریں جو 03 سے شروع ہو۔";
    }


    if (!data.student_class) {

        return "جماعت منتخب کریں۔";
    }


    if (!data.admission_date) {

        return "تاریخ داخلہ درج کریں۔";
    }


    if (!data.residence_type) {

        return "رہائش کی قسم منتخب کریں۔";
    }


    if (
        data.admission_type === "منتقلی"
    ) {

        if (!data.previous_madrassa) {

            return "سابقہ مدرسہ درج کریں۔";
        }


        if (!data.transfer_date) {

            return "منتقلی کی تاریخ درج کریں۔";
        }
    }


    if (
        data.residence_type === "ہاسٹل"
    ) {

        if (
            data.mahrams.length === 0
        ) {

            return "ہاسٹل کی طالبہ کے لیے کم از کم ایک محرم ضروری ہے۔";
        }


        if (
            data.mahrams.length > 5
        ) {

            return "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔";
        }


        for (
            let index = 0;
            index < data.mahrams.length;
            index++
        ) {

            const mahram =
                data.mahrams[index];


            if (!mahram.name) {

                return (
                    "محرم " +
                    (index + 1) +
                    " کا نام درج کریں۔"
                );
            }


            if (
                !isUrduName(
                    mahram.name
                )
            ) {

                return (
                    "محرم " +
                    (index + 1) +
                    " کا نام صرف اردو میں درج کریں۔"
                );
            }


            if (!mahram.relation) {

                return (
                    "محرم " +
                    (index + 1) +
                    " کا رشتہ منتخب کریں۔"
                );
            }


            if (
                mahram.phone &&
                (
                    mahram.phone.length !== 11 ||
                    !mahram.phone.startsWith("03")
                )
            ) {

                return (
                    "محرم " +
                    (index + 1) +
                    " کا موبائل نمبر درست درج کریں۔"
                );
            }


            if (
                mahram.cnic &&
                mahram.cnic.length !== 13
            ) {

                return (
                    "محرم " +
                    (index + 1) +
                    " کا شناختی کارڈ نمبر 13 ہندسوں پر مشتمل ہونا چاہیے۔"
                );
            }
        }
    }


    return "";
}


/* =====================================================
   STUDENT DUPLICATE CHECK
===================================================== */

async function checkStudentDuplicates(
    data,
    currentId = null
) {

    if (!supabaseClient) {

        throw new Error(
            "Supabase دستیاب نہیں ہے۔"
        );
    }


    const {
        data: rows,
        error
    } =
        await supabaseClient
            .from(STUDENTS_TABLE)
            .select(
                "id, admission_no, cnic, phone"
            );


    if (error) {
        throw error;
    }


    for (
        const row of rows || []
    ) {

        if (
            currentId !== null &&
            String(row.id) ===
            String(currentId)
        ) {

            continue;
        }


        if (
            safeString(
                row.admission_no
            ) ===
            safeString(
                data.admission_no
            )
        ) {

            return "یہ داخلہ نمبر پہلے سے موجود ہے۔";
        }


        if (
            data.cnic &&
            canonicalCNIC(
                row.cnic
            ) === data.cnic
        ) {

            return "یہ شناختی کارڈ نمبر پہلے سے موجود ہے۔";
        }


        if (
            data.phone &&
            normalizePhone(
                row.phone
            ) === data.phone
        ) {

            return "یہ موبائل نمبر پہلے سے موجود ہے۔";
        }
    }


    return "";
}


/* =====================================================
   RESET STUDENT FORM
===================================================== */

function resetStudentForm() {

    if (studentForm) {

        studentForm.reset();
    }


    editingStudentId =
        null;


    const editStudentId =
        getElement(
            "editStudentId"
        );


    if (editStudentId) {

        editStudentId.value =
            "";
    }


    if (mahramList) {

        mahramList.innerHTML =
            "";
    }


    clearMessage(
        studentFormMessage
    );


    if (studentFormTitle) {

        studentFormTitle.textContent =
            "نئی طالبہ کا داخلہ";
    }


    if (saveStudentButton) {

        saveStudentButton.textContent =
            "💾 طالبہ محفوظ کریں";
    }


    updateTransferFields();

    updateMahramSection();
}


/* =====================================================
   OPEN / CLOSE STUDENT FORM
===================================================== */

function openStudentForm() {

    if (!requireAdmin()) {
        return;
    }


    if (!studentFormContainer) {
        return;
    }


    studentFormContainer.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top:
            studentFormContainer.offsetTop,

        behavior:
            "smooth"

    });
}


function closeStudentForm() {

    if (studentFormContainer) {

        studentFormContainer.classList.add(
            "hidden"
        );
    }


    clearMessage(
        studentFormMessage
    );
}


/* =====================================================
   LOAD STUDENTS
===================================================== */

async function loadStudents() {

    if (!supabaseClient) {
        return;
    }


    if (studentsList) {

        studentsList.innerHTML = `

            <div class="empty-students">

                <div class="empty-icon">
                    ⏳
                </div>

                <p>
                    ریکارڈ لوڈ ہو رہا ہے...
                </p>

            </div>
        `;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(STUDENTS_TABLE)
                .select("*")
                .order(
                    "id",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {
            throw error;
        }


        studentsCache =
            Array.isArray(data)
                ? data
                : [];


        if (studentCount) {

            studentCount.textContent =
                String(
                    studentsCache.length
                );
        }


        displayStudents(
            studentsCache
        );


    } catch (error) {

        console.error(
            "Students load error:",
            error
        );


        if (studentsList) {

            studentsList.innerHTML = `

                <div class="empty-students">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <p>
                        طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔
                    </p>

                </div>
            `;
        }
    }
}


/* =====================================================
   DISPLAY STUDENTS
===================================================== */

function displayStudents(
    students = studentsCache
) {

    if (!studentsList) {
        return;
    }


    if (
        !Array.isArray(students) ||
        students.length === 0
    ) {

        studentsList.innerHTML = `

            <div class="empty-students">

                <div class="empty-icon">
                    👧
                </div>

                <h3>
                    کوئی طالبہ موجود نہیں
                </h3>

                <p>
                    ابھی کوئی ریکارڈ موجود نہیں۔
                </p>

            </div>
        `;

        return;
    }


    const role =
        getCurrentRole();


    studentsList.innerHTML =
        students
            .map(
                function (student) {

                    const id =
                        student.id;


                    const name =
                        getStudentName(
                            student
                        ) || "-";


                    const admissionNo =
                        getStudentAdmissionNo(
                            student
                        ) || "-";


                    const studentClass =
                        getStudentClass(
                            student
                        ) || "-";


                    const residence =
                        getStudentResidence(
                            student
                        ) || "-";


                    const phone =
                        getStudentPhone(
                            student
                        ) || "-";


                    const adminButtons =
                        role === "admin"
                            ? `

                                <button
                                    type="button"
                                    class="edit-student"
                                    data-id="${escapeHtml(id)}"
                                >
                                    ✏️ تبدیل کریں
                                </button>

                                <button
                                    type="button"
                                    class="delete-student"
                                    data-id="${escapeHtml(id)}"
                                >
                                    🗑️ حذف کریں
                                </button>
                            `
                            : "";


                    return `

                        <div
                            class="student-card"
                            data-id="${escapeHtml(id)}"
                        >

                            <div class="student-card-header">

                                <div class="student-avatar">
                                    👧
                                </div>

                                <div>

                                    <h3>
                                        ${escapeHtml(name)}
                                    </h3>

                                    <span>
                                        داخلہ نمبر:
                                        ${escapeHtml(admissionNo)}
                                    </span>

                                </div>

                            </div>


                            <div class="student-badges">

                                <span>
                                    📚 ${escapeHtml(studentClass)}
                                </span>

                                <span>
                                    🏠 ${escapeHtml(residence)}
                                </span>

                            </div>


                            <div class="student-info">

                                <p>
                                    موبائل:
                                    ${escapeHtml(phone)}
                                </p>

                            </div>


                            <div class="student-card-buttons">

                                <button
                                    type="button"
                                    class="view-student"
                                    data-id="${escapeHtml(id)}"
                                >
                                    👁️ تفصیلات
                                </button>

                                ${adminButtons}

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =====================================================
   SEARCH STUDENTS
===================================================== */

function searchStudents() {

    if (!studentSearch) {
        return;
    }


    const search =
        safeString(
            studentSearch.value
        ).toLowerCase();


    if (!search) {

        displayStudents(
            studentsCache
        );

        return;
    }


    const filtered =
        studentsCache.filter(
            function (student) {

                const searchable =
                    [

                        getStudentAdmissionNo(
                            student
                        ),

                        getStudentName(
                            student
                        ),

                        getStudentFatherName(
                            student
                        ),

                        getStudentGuardianName(
                            student
                        ),

                        getStudentCNIC(
                            student
                        ),

                        getStudentPhone(
                            student
                        ),

                        getStudentClass(
                            student
                        ),

                        getStudentAddress(
                            student
                        ),

                        getStudentResidence(
                            student
                        )

                    ]
                        .map(
                            function (value) {

                                return safeString(
                                    value
                                ).toLowerCase();
                            }
                        )
                        .join(" ");


                return searchable.includes(
                    search
                );
            }
        );


    displayStudents(
        filtered
    );
}


/* =====================================================
   EDIT STUDENT
===================================================== */

function editStudent(id) {

    if (!requireAdmin()) {
        return;
    }


    const student =
        studentsCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!student) {

        alert(
            "طالبہ کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    editingStudentId =
        student.id;


    const editStudentId =
        getElement(
            "editStudentId"
        );


    if (editStudentId) {

        editStudentId.value =
            String(student.id);
    }


    const fields = {

        admissionNo:
            getStudentAdmissionNo(
                student
            ),

        admissionType:
            getStudentAdmissionType(
                student
            ),

        studentName:
            getStudentName(
                student
            ),

        fatherName:
            getStudentFatherName(
                student
            ),

        guardianName:
            getStudentGuardianName(
                student
            ),

        studentCNIC:
            formatCNIC(
                getStudentCNIC(
                    student
                )
            ),

        phone:
            normalizePhone(
                getStudentPhone(
                    student
                )
            ),

        dateOfBirth:
            getStudentDOB(
                student
            ),

        studentClass:
            getStudentClass(
                student
            ),

        admissionDate:
            getStudentAdmissionDate(
                student
            ),

        address:
            getStudentAddress(
                student
            ),

        residenceType:
            getStudentResidence(
                student
            ),

        previousMadrassa:
            getStudentPreviousMadrassa(
                student
            ),

        transferDate:
            getStudentTransferDate(
                student
            )

    };


    Object.entries(fields)
        .forEach(
            function (
                [idName, value]
            ) {

                const field =
                    getElement(idName);


                if (field) {

                    field.value =
                        value === null ||
                        value === undefined
                            ? ""
                            : String(value);
                }
            }
        );


    updateTransferFields();


    loadMahramsIntoForm(
        getStudentRecordValue(
            student,
            [
                "mahrams"
            ],
            []
        )
    );


    if (mahramSection) {

        mahramSection.classList.toggle(
            "hidden",
            getStudentResidence(
                student
            ) !== "ہاسٹل"
        );
    }


    if (
        getStudentResidence(
            student
        ) === "ہاسٹل" &&
        mahramList &&
        mahramList.querySelectorAll(
            ".mahram-row"
        ).length === 0
    ) {

        createMahramRow();
    }


    if (studentFormTitle) {

        studentFormTitle.textContent =
            "طالبہ کا ریکارڈ تبدیل کریں";
    }


    if (saveStudentButton) {

        saveStudentButton.textContent =
            "💾 تبدیلی محفوظ کریں";
    }


    openStudentForm();
}


/* =====================================================
   STUDENT DETAILS
===================================================== */

function showStudentDetails(id) {

    const student =
        studentsCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!student) {

        alert(
            "طالبہ کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    if (
        !studentDetailsOverlay ||
        !studentDetailsContent
    ) {

        console.error(
            "Student details modal نہیں ملا۔"
        );

        return;
    }


    const mahrams =
        parseMahrams(
            getStudentRecordValue(
                student,
                "mahrams",
                []
            )
        );


    const mahramHtml =
        mahrams.length
            ? mahrams
                .map(
                    function (
                        mahram,
                        index
                    ) {

                        return `

                            <div class="mahram-card">

                                <h3>
                                    محرم ${index + 1}
                                </h3>

                                <p>
                                    <strong>
                                        نام:
                                    </strong>

                                    ${escapeHtml(
                                        mahram.name || "-"
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        رشتہ:
                                    </strong>

                                    ${escapeHtml(
                                        normalizeMahramRelation(
                                            mahram.relation
                                        ) || "-"
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        موبائل:
                                    </strong>

                                    ${escapeHtml(
                                        mahram.phone || "-"
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        شناختی کارڈ:
                                    </strong>

                                    ${escapeHtml(
                                        formatCNIC(
                                            mahram.cnic
                                        ) || "-"
                                    )}
                                </p>

                            </div>
                        `;
                    }
                )
                .join("")
            : `
                <p>
                    کوئی محرم درج نہیں۔
                </p>
            `;


    if (studentDetailsTitle) {

        studentDetailsTitle.textContent =
            getStudentName(
                student
            ) ||
            "طالبہ کی تفصیلات";
    }


    studentDetailsContent.innerHTML = `

        <h3>
            بنیادی معلومات
        </h3>

        <p>
            <strong>داخلہ نمبر:</strong>
            ${escapeHtml(
                getStudentAdmissionNo(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>داخلہ کی قسم:</strong>
            ${escapeHtml(
                getStudentAdmissionType(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>نام:</strong>
            ${escapeHtml(
                getStudentName(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>والد کا نام:</strong>
            ${escapeHtml(
                getStudentFatherName(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>سرپرست:</strong>
            ${escapeHtml(
                getStudentGuardianName(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>شناختی کارڈ:</strong>
            ${escapeHtml(
                formatCNIC(
                    getStudentCNIC(
                        student
                    )
                ) || "-"
            )}
        </p>

        <p>
            <strong>موبائل:</strong>
            ${escapeHtml(
                getStudentPhone(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>تاریخ پیدائش:</strong>
            ${escapeHtml(
                getStudentDOB(
                    student
                ) || "-"
            )}
        </p>


        <h3>
            تعلیمی معلومات
        </h3>

        <p>
            <strong>جماعت:</strong>
            ${escapeHtml(
                getStudentClass(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>تاریخ داخلہ:</strong>
            ${escapeHtml(
                getStudentAdmissionDate(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>سابقہ مدرسہ:</strong>
            ${escapeHtml(
                getStudentPreviousMadrassa(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>منتقلی کی تاریخ:</strong>
            ${escapeHtml(
                getStudentTransferDate(
                    student
                ) || "-"
            )}
        </p>


        <h3>
            رہائش
        </h3>

        <p>
            <strong>رہائش کی قسم:</strong>
            ${escapeHtml(
                getStudentResidence(
                    student
                ) || "-"
            )}
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHtml(
                getStudentAddress(
                    student
                ) || "-"
            )}
        </p>


        <h3>
            محرم کی معلومات
        </h3>

        ${mahramHtml}
    `;


    studentDetailsOverlay.classList.remove(
        "hidden"
    );


    studentDetailsOverlay.style.display =
        "flex";


    document.body.classList.add(
        "modal-open"
    );
}


/* =====================================================
   CLOSE STUDENT DETAILS
===================================================== */

function closeStudentDetails() {

    if (!studentDetailsOverlay) {
        return;
    }


    studentDetailsOverlay.style.display =
        "none";


    studentDetailsOverlay.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );
}


/* =====================================================
   DELETE STUDENT
===================================================== */

async function deleteStudent(id) {

    if (!requireAdmin()) {
        return;
    }


    if (isDeletingStudent) {
        return;
    }


    const student =
        studentsCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!student) {

        alert(
            "طالبہ کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `"${safeString(
                getStudentName(
                    student
                )
            )}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
        );


    if (!confirmed) {
        return;
    }


    isDeletingStudent =
        true;


    try {

        const {
            error
        } =
            await supabaseClient
                .from(STUDENTS_TABLE)
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        await loadStudents();


    } catch (error) {

        console.error(
            "Student delete error:",
            error
        );


        alert(
            "طالبہ کا ریکارڈ حذف نہیں ہو سکا۔"
        );


    } finally {

        isDeletingStudent =
            false;
    }
}


/* =====================================================
   SAVE STUDENT
===================================================== */

async function saveStudent(event) {

    if (event) {

        event.preventDefault();
    }


    if (!requireAdmin()) {
        return;
    }


    if (isSavingStudent) {
        return;
    }


    clearMessage(
        studentFormMessage
    );


    const validationError =
        validateStudentForm();


    if (validationError) {

        showMessage(
            studentFormMessage,
            validationError
        );

        return;
    }


    const data =
        getStudentFormData();


    const wasEditing =
        Boolean(
            editingStudentId
        );


    isSavingStudent =
        true;


    if (saveStudentButton) {

        saveStudentButton.disabled =
            true;

        saveStudentButton.textContent =
            "⏳ محفوظ ہو رہا ہے...";
    }


    try {

        const duplicateMessage =
            await checkStudentDuplicates(
                data,
                editingStudentId
            );


        if (duplicateMessage) {

            showMessage(
                studentFormMessage,
                duplicateMessage
            );

            return;
        }


        let result;


        if (editingStudentId) {

            result =
                await supabaseClient
                    .from(STUDENTS_TABLE)
                    .update(data)
                    .eq(
                        "id",
                        editingStudentId
                    )
                    .select();

        } else {

            result =
                await supabaseClient
                    .from(STUDENTS_TABLE)
                    .insert([
                        data
                    ])
                    .select();
        }


        if (result.error) {

            throw result.error;
        }


        resetStudentForm();

        closeStudentForm();

        await loadStudents();


        alert(
            wasEditing
                ? "طالبہ کا ریکارڈ کامیابی سے تبدیل ہو گیا۔"
                : "نئی طالبہ کا اندراج کامیاب ہو گیا۔"
        );


    } catch (error) {

        console.error(
            "Student save error:",
            error
        );


        let message =
            "طالبہ کا ریکارڈ محفوظ نہیں ہو سکا۔";


        const errorText =
            safeString(
                error?.message
            ).toLowerCase();


        if (
            error?.code === "23505" ||
            errorText.includes(
                "duplicate"
            ) ||
            errorText.includes(
                "unique"
            )
        ) {

            message =
                "یہ ریکارڈ پہلے سے موجود ہے۔";
        }


        showMessage(
            studentFormMessage,
            message
        );


    } finally {

        isSavingStudent =
            false;


        if (saveStudentButton) {

            saveStudentButton.disabled =
                false;

            saveStudentButton.textContent =
                editingStudentId
                    ? "💾 تبدیلی محفوظ کریں"
                    : "💾 طالبہ محفوظ کریں";
        }
    }
}


/* =====================================================
   STUDENT LIST EVENT DELEGATION
===================================================== */

function initializeStudentListEvents() {

    if (!studentsList) {
        return;
    }


    studentsList.addEventListener(
        "click",
        function (event) {

            const viewButton =
                event.target.closest(
                    ".view-student"
                );


            if (viewButton) {

                showStudentDetails(
                    viewButton.dataset.id
                );

                return;
            }


            const editButton =
                event.target.closest(
                    ".edit-student"
                );


            if (editButton) {

                editStudent(
                    editButton.dataset.id
                );

                return;
            }


            const deleteButton =
                event.target.closest(
                    ".delete-student"
                );


            if (deleteButton) {

                deleteStudent(
                    deleteButton.dataset.id
                );
            }
        }
    );
}


/* =====================================================
   STUDENT PAGE INITIALIZATION
===================================================== */

async function initializeStudentsPage() {

    if (
        currentPage !== "students.html"
    ) {

        return;
    }


    if (!protectPage()) {
        return;
    }


    initializeStudentFormatting();

    initializeStudentListEvents();


    if (admissionType) {

        admissionType.addEventListener(
            "change",
            updateTransferFields
        );
    }


    if (residenceType) {

        residenceType.addEventListener(
            "change",
            updateMahramSection
        );
    }


    if (addMahramButton) {

        addMahramButton.addEventListener(
            "click",
            function () {

                if (!requireAdmin()) {
                    return;
                }


                createMahramRow();
            }
        );
    }


    if (showStudentFormButton) {

        showStudentFormButton.addEventListener(
            "click",
            function () {

                resetStudentForm();

                openStudentForm();
            }
        );
    }


    if (cancelStudentFormButton) {

        cancelStudentFormButton.addEventListener(
            "click",
            function () {

                resetStudentForm();

                closeStudentForm();
            }
        );
    }


    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            saveStudent
        );
    }


    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            searchStudents
        );
    }


    if (closeStudentDetailsButton) {

        closeStudentDetailsButton.addEventListener(
            "click",
            closeStudentDetails
        );
    }


    if (studentDetailsOverlay) {

        studentDetailsOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    studentDetailsOverlay
                ) {

                    closeStudentDetails();
                }
            }
        );
    }


    if (
        getCurrentRole() !== "admin"
    ) {

        if (showStudentFormButton) {

            showStudentFormButton.style.display =
                "none";
        }


        if (studentFormContainer) {

            studentFormContainer.classList.add(
                "hidden"
            );
        }
    }


    updateTransferFields();

    updateMahramSection();


    await loadStudents();
}


/* =====================================================
   START STUDENT MODULE
===================================================== */

await initializeStudentsPage();


/* =====================================================
   PART 2 ENDS HERE

   DO NOT ADD });

   PASTE PART 3 DIRECTLY BELOW THIS LINE
===================================================== */  

/* =========================================================
   MASTER SCRIPT.JS
   PART 3 / 3
   TEACHER MODULE + SESSION TIMEOUT + FINAL STARTUP
========================================================= */


/* =====================================================
   TEACHER STATE
===================================================== */

let teachersCache = [];

let editingTeacherId = null;

let isSavingTeacher = false;

let isDeletingTeacher = false;


/* =====================================================
   TEACHER ELEMENTS
===================================================== */

const teacherFormContainer =
    getElement("teacherFormContainer");

const teacherForm =
    getElement("teacherForm");

const teacherFormTitle =
    getElement("teacherFormTitle");

const teacherFormMessage =
    getElement("teacherFormMessage");

const showTeacherFormButton =
    getElement("showTeacherForm");

const cancelTeacherButton =
    getElement("cancelTeacherButton");

const saveTeacherButton =
    getElement("saveTeacherButton");

const teacherSearch =
    getElement("teacherSearch");

const teacherList =
    getElement("teacherList");

const teacherListCount =
    getElement("teacherListCount");

const teacherTotalPage =
    currentPage === "teachers.html"
        ? getElement("teacherTotal")
        : null;

const activeTeacherTotal =
    getElement("activeTeacherTotal");

const pendingTeacherTotal =
    getElement("pendingTeacherTotal");

const teacherDetailsOverlay =
    getElement("teacherDetailsOverlay");

const teacherDetailsTitle =
    getElement("teacherDetailsTitle");

const teacherDetailsContent =
    getElement("teacherDetailsContent");

const closeTeacherDetailsButton =
    getElement("closeTeacherDetails");


/* =====================================================
   TEACHER HELPERS
===================================================== */

function getTeacherValue(id) {

    const field =
        getElement(id);


    if (!field) {
        return "";
    }


    return safeString(
        field.value
    );
}


function getTeacherCode(teacher) {

    const code =
        getRecordValue(
            teacher,
            [
                "teacher_code",
                "teacherCode",
                "code"
            ],
            ""
        );


    if (code) {
        return code;
    }


    if (
        teacher &&
        teacher.id !== null &&
        teacher.id !== undefined
    ) {

        return (
            "T-" +
            String(
                teacher.id
            ).padStart(
                3,
                "0"
            )
        );
    }


    return "-";
}


/* =====================================================
   TEACHER INPUT FORMATTING
===================================================== */

function initializeTeacherFormatting() {

    const phone =
        getElement("teacherPhone");

    const cnic =
        getElement("teacherCNIC");


    if (phone) {

        phone.addEventListener(
            "input",
            function () {

                this.value =
                    normalizePhone(
                        this.value
                    );
            }
        );
    }


    if (cnic) {

        cnic.addEventListener(
            "input",
            function () {

                this.value =
                    formatCNIC(
                        this.value
                    );
            }
        );
    }
}


/* =====================================================
   TEACHER FORM DATA
===================================================== */

function getTeacherFormData() {

    return {

        teacher_code:
            getTeacherValue(
                "teacherCode"
            ) || null,

        name:
            getTeacherValue(
                "teacherName"
            ) || null,

        father_name:
            getTeacherValue(
                "teacherFatherName"
            ) || null,

        phone:
            normalizePhone(
                getTeacherValue(
                    "teacherPhone"
                )
            ) || null,

        cnic:
            canonicalCNIC(
                getTeacherValue(
                    "teacherCNIC"
                )
            ) || null,

        qualification:
            getTeacherValue(
                "teacherQualification"
            ) || null,

        joining_date:
            getTeacherValue(
                "teacherJoiningDate"
            ) || null,

        address:
            getTeacherValue(
                "teacherAddress"
            ) || null

    };
}


/* =====================================================
   TEACHER VALIDATION
===================================================== */

function validateTeacherForm() {

    const data =
        getTeacherFormData();


    if (!data.teacher_code) {

        return "استاد کا کوڈ درج کریں۔";
    }


    if (!data.name) {

        return "استاد کا نام درج کریں۔";
    }


    if (
        !isUrduName(
            data.name
        )
    ) {

        return "استاد کا نام صرف اردو میں درج کریں۔";
    }


    if (
        data.father_name &&
        !isUrduName(
            data.father_name
        )
    ) {

        return "والد کا نام صرف اردو میں درج کریں۔";
    }


    if (
        data.phone &&
        (
            data.phone.length !== 11 ||
            !data.phone.startsWith("03")
        )
    ) {

        return "درست 11 ہندسوں کا موبائل نمبر درج کریں جو 03 سے شروع ہو۔";
    }


    if (
        data.cnic &&
        data.cnic.length !== 13
    ) {

        return "شناختی کارڈ نمبر 13 ہندسوں پر مشتمل ہونا چاہیے۔";
    }


    return "";
}


/* =====================================================
   TEACHER DUPLICATE CHECK
===================================================== */

async function checkTeacherDuplicates(
    data,
    currentId = null
) {

    if (!supabaseClient) {

        throw new Error(
            "Supabase دستیاب نہیں ہے۔"
        );
    }


    const {
        data: rows,
        error
    } =
        await supabaseClient
            .from(TEACHERS_TABLE)
            .select("*");


    if (error) {
        throw error;
    }


    for (
        const row of rows || []
    ) {

        if (
            currentId !== null &&
            String(row.id) ===
            String(currentId)
        ) {

            continue;
        }


        const existingCode =
            safeString(
                getTeacherCode(row)
            ).toLowerCase();


        const newCode =
            safeString(
                data.teacher_code
            ).toLowerCase();


        if (
            existingCode &&
            newCode &&
            existingCode === newCode
        ) {

            return "یہ استاد کوڈ پہلے سے موجود ہے۔";
        }


        const existingPhone =
            normalizePhone(
                row.phone
            );


        if (
            existingPhone &&
            data.phone &&
            existingPhone === data.phone
        ) {

            return "یہ موبائل نمبر پہلے سے موجود ہے۔";
        }


        const existingCNIC =
            canonicalCNIC(
                row.cnic
            );


        if (
            existingCNIC &&
            data.cnic &&
            existingCNIC === data.cnic
        ) {

            return "یہ شناختی کارڈ نمبر پہلے سے موجود ہے۔";
        }
    }


    return "";
}


/* =====================================================
   TEACHER CODE FALLBACK
===================================================== */

function isMissingTeacherCodeError(error) {

    const text =
        safeString(
            error?.message
        ).toLowerCase();


    return (
        text.includes("teacher_code") &&
        (
            text.includes("column") ||
            text.includes("schema cache") ||
            text.includes("could not find")
        )
    );
}


function withoutTeacherCode(data) {

    const copy = {
        ...data
    };


    delete copy.teacher_code;


    return copy;
}


/* =====================================================
   SAVE TEACHER RECORD
===================================================== */

async function saveTeacherRecord(data) {

    let result;


    if (editingTeacherId) {

        result =
            await supabaseClient
                .from(TEACHERS_TABLE)
                .update(data)
                .eq(
                    "id",
                    editingTeacherId
                )
                .select();

    } else {

        result =
            await supabaseClient
                .from(TEACHERS_TABLE)
                .insert([
                    data
                ])
                .select();
    }


    if (
        result.error &&
        isMissingTeacherCodeError(
            result.error
        )
    ) {

        const fallbackData =
            withoutTeacherCode(
                data
            );


        if (editingTeacherId) {

            result =
                await supabaseClient
                    .from(TEACHERS_TABLE)
                    .update(
                        fallbackData
                    )
                    .eq(
                        "id",
                        editingTeacherId
                    )
                    .select();

        } else {

            result =
                await supabaseClient
                    .from(TEACHERS_TABLE)
                    .insert([
                        fallbackData
                    ])
                    .select();
        }
    }


    if (result.error) {
        throw result.error;
    }


    return result.data;
}


/* =====================================================
   TEACHER STATISTICS
===================================================== */

function updateTeacherStatistics() {

    const total =
        teachersCache.length;


    let active = 0;

    let pending = 0;


    teachersCache.forEach(
        function (teacher) {

            const status =
                safeString(
                    getRecordValue(
                        teacher,
                        [
                            "status",
                            "authorization_status",
                            "auth_status"
                        ],
                        ""
                    )
                ).toLowerCase();


            if (
                !status ||
                status === "approved" ||
                status === "active" ||
                status === "فعال" ||
                status === "منظور" ||
                status === "منظور شدہ"
            ) {

                active++;

            } else if (
                status === "pending" ||
                status === "زیر منظوری"
            ) {

                pending++;
            }
        }
    );


    if (teacherTotalPage) {

        teacherTotalPage.textContent =
            String(total);
    }


    if (teacherListCount) {

        teacherListCount.textContent =
            String(total);
    }


    if (activeTeacherTotal) {

        activeTeacherTotal.textContent =
            String(active);
    }


    if (pendingTeacherTotal) {

        pendingTeacherTotal.textContent =
            String(pending);
    }
}


/* =====================================================
   RESET TEACHER FORM
===================================================== */

function resetTeacherForm() {

    if (teacherForm) {

        teacherForm.reset();
    }


    editingTeacherId =
        null;


    const editTeacherId =
        getElement(
            "editTeacherId"
        );


    if (editTeacherId) {

        editTeacherId.value =
            "";
    }


    clearMessage(
        teacherFormMessage
    );


    if (teacherFormTitle) {

        teacherFormTitle.textContent =
            "👩‍🏫 نئے استاد کی معلومات";
    }


    if (saveTeacherButton) {

        saveTeacherButton.textContent =
            "💾 محفوظ کریں";
    }
}


/* =====================================================
   OPEN / CLOSE TEACHER FORM
===================================================== */

function openTeacherForm() {

    if (!requireAdmin()) {
        return;
    }


    if (!teacherFormContainer) {
        return;
    }


    teacherFormContainer.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top:
            teacherFormContainer.offsetTop,

        behavior:
            "smooth"

    });
}


function closeTeacherForm() {

    if (teacherFormContainer) {

        teacherFormContainer.classList.add(
            "hidden"
        );
    }


    clearMessage(
        teacherFormMessage
    );
}


/* =====================================================
   LOAD TEACHERS
===================================================== */

async function loadTeachers() {

    if (!supabaseClient) {
        return;
    }


    if (teacherList) {

        teacherList.innerHTML = `

            <div class="teacher-empty">
                ⏳ ریکارڈ لوڈ ہو رہا ہے...
            </div>
        `;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(TEACHERS_TABLE)
                .select("*")
                .order(
                    "id",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {
            throw error;
        }


        teachersCache =
            Array.isArray(data)
                ? data
                : [];


        updateTeacherStatistics();

        displayTeachers(
            teachersCache
        );


    } catch (error) {

        console.error(
            "Teacher load error:",
            error
        );


        if (teacherList) {

            teacherList.innerHTML = `

                <div class="teacher-empty">
                    اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔
                </div>
            `;
        }
    }
}

   /* =====================================================
   TEACHER DETAILS
===================================================== */

function showTeacherDetails(id) {

    const teacher =
        teachersCache.find(
            function (item) {
                return String(item.id) === String(id);
            }
        );


    if (!teacher) {

        alert("استاد کا ریکارڈ نہیں ملا۔");

        return;
    }


    if (
        !teacherDetailsOverlay ||
        !teacherDetailsContent
    ) {

        console.error(
            "Teacher details modal نہیں ملا۔"
        );

        return;
    }


    const name =
        getRecordValue(
            teacher,
            [
                "name",
                "teacher_name",
                "teacherName"
            ],
            "-"
        );


    const fatherName =
        getRecordValue(
            teacher,
            [
                "father_name",
                "fatherName"
            ],
            "-"
        );


    const phone =
        getRecordValue(
            teacher,
            [
                "phone",
                "teacherPhone"
            ],
            "-"
        );


    const cnic =
        formatCNIC(
            getRecordValue(
                teacher,
                [
                    "cnic",
                    "teacherCNIC"
                ],
                ""
            )
        ) || "-";


    const qualification =
        getRecordValue(
            teacher,
            [
                "qualification"
            ],
            "-"
        );


    const joiningDate =
        getRecordValue(
            teacher,
            [
                "joining_date",
                "joiningDate"
            ],
            "-"
        );


    const address =
        getRecordValue(
            teacher,
            [
                "address"
            ],
            "-"
        );


    const teacherCode =
        getTeacherCode(teacher) || "-";


    if (teacherDetailsTitle) {

        teacherDetailsTitle.textContent =
            name;
    }


    teacherDetailsContent.innerHTML = `

        <div class="student-detail-section">

            <h3>
                بنیادی معلومات
            </h3>

            <p>
                <strong>استاد کوڈ:</strong>
                ${escapeHtml(teacherCode)}
            </p>

            <p>
                <strong>نام:</strong>
                ${escapeHtml(name)}
            </p>

            <p>
                <strong>والد کا نام:</strong>
                ${escapeHtml(fatherName)}
            </p>

            <p>
                <strong>موبائل نمبر:</strong>
                ${escapeHtml(phone)}
            </p>

            <p>
                <strong>شناختی کارڈ:</strong>
                ${escapeHtml(cnic)}
            </p>

        </div>


        <div class="student-detail-section">

            <h3>
                تعلیمی معلومات
            </h3>

            <p>
                <strong>تعلیمی قابلیت:</strong>
                ${escapeHtml(qualification)}
            </p>

            <p>
                <strong>تقرری کی تاریخ:</strong>
                ${escapeHtml(joiningDate)}
            </p>

        </div>


        <div class="student-detail-section">

            <h3>
                رابطہ
            </h3>

            <p>
                <strong>پتہ:</strong>
                ${escapeHtml(address)}
            </p>

        </div>
    `;


    teacherDetailsOverlay.classList.remove(
        "hidden"
    );


    teacherDetailsOverlay.style.display =
        "flex";


    document.body.classList.add(
        "modal-open"
    );
}

/* =====================================================
   SEARCH TEACHERS
===================================================== */

function searchTeachers() {

    if (!teacherSearch) {
        return;
    }


    const search =
        safeString(
            teacherSearch.value
        ).toLowerCase();


    if (!search) {

        displayTeachers(
            teachersCache
        );

        return;
    }


    const filtered =
        teachersCache.filter(
            function (teacher) {

                const searchable =
                    [

                        getTeacherCode(
                            teacher
                        ),

                        teacher.name,

                        teacher.teacher_name,

                        teacher.father_name,

                        teacher.phone,

                        teacher.cnic,

                        teacher.qualification,

                        teacher.address

                    ]
                        .map(
                            function (value) {

                                return safeString(
                                    value
                                ).toLowerCase();
                            }
                        )
                        .join(" ");


                return searchable.includes(
                    search
                );
            }
        );


    displayTeachers(
        filtered
    );
}


/* =====================================================
   EDIT TEACHER
===================================================== */

function editTeacher(id) {

    if (!requireAdmin()) {
        return;
    }


    const teacher =
        teachersCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!teacher) {

        alert(
            "استاد کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    editingTeacherId =
        teacher.id;


    const editTeacherId =
        getElement(
            "editTeacherId"
        );


    if (editTeacherId) {

        editTeacherId.value =
            String(
                teacher.id
            );
    }


    const fields = {

        teacherCode:
            getTeacherCode(
                teacher
            ),

        teacherName:
            getRecordValue(
                teacher,
                [
                    "name",
                    "teacher_name",
                    "teacherName"
                ],
                ""
            ),

        teacherFatherName:
            getRecordValue(
                teacher,
                [
                    "father_name",
                    "fatherName"
                ],
                ""
            ),

        teacherPhone:
            normalizePhone(
                getRecordValue(
                    teacher,
                    [
                        "phone",
                        "teacherPhone"
                    ],
                    ""
                )
            ),

        teacherCNIC:
            formatCNIC(
                getRecordValue(
                    teacher,
                    [
                        "cnic",
                        "teacherCNIC"
                    ],
                    ""
                )
            ),

        teacherQualification:
            getRecordValue(
                teacher,
                [
                    "qualification"
                ],
                ""
            ),

        teacherJoiningDate:
            getRecordValue(
                teacher,
                [
                    "joining_date",
                    "joiningDate"
                ],
                ""
            ),

        teacherAddress:
            getRecordValue(
                teacher,
                [
                    "address"
                ],
                ""
            )

    };


    Object.entries(fields)
        .forEach(
            function (
                [idName, value]
            ) {

                const field =
                    getElement(idName);


                if (field) {

                    field.value =
                        value === null ||
                        value === undefined
                            ? ""
                            : String(value);
                }
            }
        );


    if (teacherFormTitle) {

        teacherFormTitle.textContent =
            "👩‍🏫 استاد کا ریکارڈ تبدیل کریں";
    }


    if (saveTeacherButton) {

        saveTeacherButton.textContent =
            "💾 تبدیلی محفوظ کریں";
    }


    openTeacherForm();
}


/* =====================================================
   TEACHER DETAILS
===================================================== */

function showTeacherDetails(id) {

    const teacher =
        teachersCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!teacher) {

        alert(
            "استاد کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    if (
        !teacherDetailsOverlay ||
        !teacherDetailsContent
    ) {

        console.error(
            "Teacher details modal نہیں ملا۔"
        );

        return;
    }


    const name =
        getRecordValue(
            teacher,
            [
                "name",
                "teacher_name",
                "teacherName"
            ],
            ""
        );


    if (teacherDetailsTitle) {

        teacherDetailsTitle.textContent =
            name ||
            "استاد کی تفصیلات";
    }


    teacherDetailsContent.innerHTML = `

        <h3>
            بنیادی معلومات
        </h3>

        <p>
            <strong>استاد کوڈ:</strong>
            ${escapeHtml(
                getTeacherCode(
                    teacher
                )
            )}
        </p>

        <p>
            <strong>نام:</strong>
            ${escapeHtml(
                name || "-"
            )}
        </p>

        <p>
            <strong>والد کا نام:</strong>
            ${escapeHtml(
                getRecordValue(
                    teacher,
                    [
                        "father_name",
                        "fatherName"
                    ],
                    "-"
                )
            )}
        </p>

        <p>
            <strong>موبائل نمبر:</strong>
            ${escapeHtml(
                getRecordValue(
                    teacher,
                    [
                        "phone",
                        "teacherPhone"
                    ],
                    "-"
                )
            )}
        </p>

        <p>
            <strong>شناختی کارڈ:</strong>
            ${escapeHtml(
                formatCNIC(
                    getRecordValue(
                        teacher,
                        [
                            "cnic",
                            "teacherCNIC"
                        ],
                        ""
                    )
                ) || "-"
            )}
        </p>


        <h3>
            تعلیمی و ملازمت کی معلومات
        </h3>

        <p>
            <strong>تعلیمی قابلیت:</strong>
            ${escapeHtml(
                getRecordValue(
                    teacher,
                    [
                        "qualification"
                    ],
                    "-"
                )
            )}
        </p>

        <p>
            <strong>تقرری کی تاریخ:</strong>
            ${escapeHtml(
                getRecordValue(
                    teacher,
                    [
                        "joining_date",
                        "joiningDate"
                    ],
                    "-"
                )
            )}
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHtml(
                getRecordValue(
                    teacher,
                    [
                        "address"
                    ],
                    "-"
                )
            )}
        </p>
    `;


    teacherDetailsOverlay.classList.remove(
        "hidden"
    );


    teacherDetailsOverlay.style.display =
        "flex";


    document.body.classList.add(
        "modal-open"
    );
}


/* =====================================================
   CLOSE TEACHER DETAILS
===================================================== */

function closeTeacherDetails() {

    if (!teacherDetailsOverlay) {
        return;
    }


    teacherDetailsOverlay.style.display =
        "none";


    teacherDetailsOverlay.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );
}


/* =====================================================
   DELETE TEACHER
===================================================== */

async function deleteTeacher(id) {

    if (!requireAdmin()) {
        return;
    }


    if (isDeletingTeacher) {
        return;
    }


    const teacher =
        teachersCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!teacher) {

        alert(
            "استاد کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    const name =
        getRecordValue(
            teacher,
            [
                "name",
                "teacher_name"
            ],
            "استاد"
        );


    const confirmed =
        window.confirm(
            `"${safeString(
                name
            )}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
        );


    if (!confirmed) {
        return;
    }


    isDeletingTeacher =
        true;


    try {

        const {
            error
        } =
            await supabaseClient
                .from(TEACHERS_TABLE)
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        await loadTeachers();


    } catch (error) {

        console.error(
            "Teacher delete error:",
            error
        );


        alert(
            "استاد کا ریکارڈ حذف نہیں ہو سکا۔"
        );


    } finally {

        isDeletingTeacher =
            false;
    }
}


/* =====================================================
   SAVE TEACHER
===================================================== */

async function saveTeacher(event) {

    if (event) {

        event.preventDefault();
    }


    if (!requireAdmin()) {
        return;
    }


    if (isSavingTeacher) {
        return;
    }


    clearMessage(
        teacherFormMessage
    );


    const validationError =
        validateTeacherForm();


    if (validationError) {

        showMessage(
            teacherFormMessage,
            validationError
        );

        return;
    }


    const data =
        getTeacherFormData();


    const wasEditing =
        Boolean(
            editingTeacherId
        );


    isSavingTeacher =
        true;


    if (saveTeacherButton) {

        saveTeacherButton.disabled =
            true;

        saveTeacherButton.textContent =
            "⏳ محفوظ ہو رہا ہے...";
    }


    try {

        const duplicateMessage =
            await checkTeacherDuplicates(
                data,
                editingTeacherId
            );


        if (duplicateMessage) {

            showMessage(
                teacherFormMessage,
                duplicateMessage
            );

            return;
        }


        await saveTeacherRecord(
            data
        );


        resetTeacherForm();

        closeTeacherForm();

        await loadTeachers();


        alert(
            wasEditing
                ? "استاد کا ریکارڈ کامیابی سے تبدیل ہو گیا۔"
                : "نیا استاد کامیابی سے شامل ہو گیا۔"
        );


    } catch (error) {

        console.error(
            "Teacher save error:",
            error
        );


        let message =
            "استاد کا ریکارڈ محفوظ نہیں ہو سکا۔";


        const errorText =
            safeString(
                error?.message
            ).toLowerCase();


        if (
            error?.code === "23505" ||
            errorText.includes(
                "duplicate"
            ) ||
            errorText.includes(
                "unique"
            )
        ) {

            message =
                "یہ استاد کا ریکارڈ پہلے سے موجود ہے۔";
        }


        showMessage(
            teacherFormMessage,
            message
        );


    } finally {

        isSavingTeacher =
            false;


        if (saveTeacherButton) {

            saveTeacherButton.disabled =
                false;

            saveTeacherButton.textContent =
                editingTeacherId
                    ? "💾 تبدیلی محفوظ کریں"
                    : "💾 محفوظ کریں";
        }
    }
}


/* =====================================================
   TEACHER LIST EVENT DELEGATION
===================================================== */

function initializeTeacherListEvents() {

    if (!teacherList) {
        return;
    }


    teacherList.addEventListener(
        "click",
        function (event) {

            const viewButton =
                event.target.closest(
                    ".view-teacher"
                );


            if (viewButton) {

                showTeacherDetails(
                    viewButton.dataset.id
                );

                return;
            }


            const editButton =
                event.target.closest(
                    ".edit-teacher"
                );


            if (editButton) {

                editTeacher(
                    editButton.dataset.id
                );

                return;
            }


            const deleteButton =
                event.target.closest(
                    ".delete-teacher"
                );


            if (deleteButton) {

                deleteTeacher(
                    deleteButton.dataset.id
                );
            }
        }
    );
}


/* =====================================================
   TEACHER PAGE INITIALIZATION
===================================================== */

async function initializeTeachersPage() {

    if (
        currentPage !== "teachers.html"
    ) {

        return;
    }


    if (!protectPage()) {
        return;
    }


    if (
        getCurrentRole() !== "admin"
    ) {

        alert(
            "اساتذہ کا انتظام صرف ایڈمن کے لیے ہے۔"
        );


        window.location.href =
            "dashboard.html";

        return;
    }


    initializeTeacherFormatting();

    initializeTeacherListEvents();


    if (showTeacherFormButton) {

        showTeacherFormButton.addEventListener(
            "click",
            function () {

                resetTeacherForm();

                openTeacherForm();
            }
        );
    }


    if (cancelTeacherButton) {

        cancelTeacherButton.addEventListener(
            "click",
            function () {

                resetTeacherForm();

                closeTeacherForm();
            }
        );
    }


    if (teacherForm) {

        teacherForm.addEventListener(
            "submit",
            saveTeacher
        );
    }


    if (teacherSearch) {

        teacherSearch.addEventListener(
            "input",
            searchTeachers
        );
    }


    if (closeTeacherDetailsButton) {

        closeTeacherDetailsButton.addEventListener(
            "click",
            closeTeacherDetails
        );
    }


    if (teacherDetailsOverlay) {

        teacherDetailsOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    teacherDetailsOverlay
                ) {

                    closeTeacherDetails();
                }
            }
        );
    }


    await loadTeachers();
}


/* =====================================================
   START TEACHER MODULE
===================================================== */

await initializeTeachersPage();


/* =====================================================
   5 MINUTE INACTIVITY LOGOUT
===================================================== */

const INACTIVITY_LIMIT =
    5 * 60 * 1000;

let inactivityTimer =
    null;


function updateLastActivity() {

    if (!isAuthenticated()) {
        return;
    }


    localStorage.setItem(
        SESSION_KEYS.lastActivity,
        String(
            Date.now()
        )
    );
}


function checkSessionTimeout() {

    if (!isAuthenticated()) {
        return;
    }


    const lastActivity =
        Number(
            localStorage.getItem(
                SESSION_KEYS.lastActivity
            )
        );


    if (!lastActivity) {

        updateLastActivity();

        return;
    }


    const inactiveFor =
        Date.now() -
        lastActivity;


    if (
        inactiveFor >=
        INACTIVITY_LIMIT
    ) {

        clearSession();


        alert(
            "پانچ منٹ تک کوئی سرگرمی نہ ہونے کی وجہ سے آپ کو لاگ آؤٹ کر دیا گیا ہے۔"
        );


        window.location.href =
            "index.html";
    }
}


function resetInactivityTimer() {

    if (!isAuthenticated()) {
        return;
    }


    updateLastActivity();


    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );
    }


    inactivityTimer =
        setTimeout(
            checkSessionTimeout,
            INACTIVITY_LIMIT
        );
}


function initializeInactivitySystem() {

    if (!isAuthenticated()) {
        return;
    }


    checkSessionTimeout();


    const events = [

        "click",
        "keydown",
        "touchstart",
        "scroll"

    ];


    events.forEach(
        function (eventName) {

            document.addEventListener(
                eventName,
                resetInactivityTimer,
                {
                    passive:
                        true
                }
            );
        }
    );


    resetInactivityTimer();
}


/* =====================================================
   ESCAPE KEY
===================================================== */

function initializeKeyboardControls() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Escape"
            ) {

                return;
            }


            if (
                studentDetailsOverlay &&
                !studentDetailsOverlay.classList.contains(
                    "hidden"
                )
            ) {

                closeStudentDetails();

                return;
            }


            if (
                teacherDetailsOverlay &&
                !teacherDetailsOverlay.classList.contains(
                    "hidden"
                )
            ) {

                closeTeacherDetails();

                return;
            }


            if (
                currentPage === "students.html" &&
                studentFormContainer &&
                !studentFormContainer.classList.contains(
                    "hidden"
                )
            ) {

                closeStudentForm();

                return;
            }


            if (
                currentPage === "teachers.html" &&
                teacherFormContainer &&
                !teacherFormContainer.classList.contains(
                    "hidden"
                )
            ) {

                closeTeacherForm();
            }
        }
    );
}


/* =====================================================
   GLOBAL ERROR LOGGING
===================================================== */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Global JavaScript error:",
            event.error ||
            event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "Unhandled promise error:",
            event.reason
        );
    }
);


/* =====================================================
   FINAL STARTUP
===================================================== */

initializeKeyboardControls();

initializeInactivitySystem();


/* =====================================================
   FINAL CLOSE
   THIS CLOSES THE SINGLE DOMContentLoaded WRAPPER
===================================================== */

});                          
