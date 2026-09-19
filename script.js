/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   مدرسہ شہناز اختر للبنات

   SCRIPT.JS
   PART 1 / 3

   SUPABASE + HELPERS + SECURITY + LOGIN + DASHBOARD
===================================================== */

"use strict";


/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://ggtnetudnjsmsmitvjmb.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";


let supabaseClient = null;


try {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

    } else {

        console.error(
            "Supabase library not loaded."
        );
    }

} catch (error) {

    console.error(
        "Supabase initialization error:",
        error
    );
}


/* =====================================================
   DATABASE TABLES
===================================================== */

const STUDENTS_TABLE =
    "students";

const TEACHERS_TABLE =
    "teachers";

const STUDENT_APPLICATIONS_TABLE =
    "student_applications";

const TEACHER_APPLICATIONS_TABLE =
    "teacher_applications";

const ATTENDANCE_TABLE =
    "attendance";

const PROFILES_TABLE =
    "profiles";


/* =====================================================
   SETTINGS
===================================================== */

const SESSION_TIMEOUT =
    5 * 60 * 1000;

const MAX_MAHRAMS =
    5;

let inactivityTimer = null;


/* =====================================================
   CURRENT PAGE
===================================================== */

function getCurrentPageName() {

    const path =
        window.location.pathname || "";

    const file =
        path
            .split("/")
            .pop()
            .trim()
            .toLowerCase();

    return file || "index.html";
}


const currentFile =
    getCurrentPageName();


/* =====================================================
   GENERAL HELPERS
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


function escapeHTML(value) {

    return safeString(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getElement(id) {

    return document.getElementById(id);
}


function getValue(id) {

    const element =
        getElement(id);

    if (!element) {

        return "";
    }

    return safeString(
        element.value
    );
}


function setValue(
    id,
    value
) {

    const element =
        getElement(id);

    if (!element) {

        return;
    }

    element.value =
        value ?? "";
}


function setText(
    id,
    value
) {

    const element =
        getElement(id);

    if (!element) {

        return;
    }

    element.textContent =
        value ?? "";
}


function showElement(element) {

    if (!element) {

        return;
    }

    element.classList.remove(
        "hidden"
    );

    element.style.display = "";
}


function hideElement(element) {

    if (!element) {

        return;
    }

    element.classList.add(
        "hidden"
    );

    element.style.display =
        "none";
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

    if (type === "success") {

        element.style.color =
            "#16a34a";

    } else if (
        type === "warning"
    ) {

        element.style.color =
            "#d97706";

    } else {

        element.style.color =
            "#dc2626";
    }
}


function clearMessage(element) {

    if (!element) {

        return;
    }

    element.textContent = "";
}


function checkSupabase() {

    if (!supabaseClient) {

        console.error(
            "Supabase client unavailable."
        );

        return false;
    }

    return true;
}


/* =====================================================
   DATE HELPERS
===================================================== */

function todayDate() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}


function formatDate(value) {

    if (!value) {

        return "—";
    }

    try {

        const date =
            new Date(
                `${value}T00:00:00`
            );

        return date.toLocaleDateString(
            "ur-PK"
        );

    } catch (error) {

        return safeString(value);
    }
}


/* =====================================================
   VALIDATION
===================================================== */

function cleanDigits(value) {

    return safeString(value)
        .replace(/\D/g, "");
}


function formatCNIC(value) {

    const digits =
        cleanDigits(value)
            .slice(
                0,
                13
            );


    if (
        digits.length <= 5
    ) {

        return digits;
    }


    if (
        digits.length <= 12
    ) {

        return (
            digits.slice(
                0,
                5
            ) +
            "-" +
            digits.slice(
                5
            )
        );
    }


    return (
        digits.slice(
            0,
            5
        ) +
        "-" +
        digits.slice(
            5,
            12
        ) +
        "-" +
        digits.slice(
            12,
            13
        )
    );
}


function validCNIC(value) {

    return (
        cleanDigits(value).length ===
        13
    );
}


function validPhone(value) {

    const digits =
        cleanDigits(value);

    return (
        digits.length === 11 &&
        digits.startsWith("03")
    );
}


/* =====================================================
   SESSION HELPERS
===================================================== */

function getStoredValue(key) {

    const sessionValue =
        sessionStorage.getItem(
            key
        );

    if (
        sessionValue !== null
    ) {

        return sessionValue;
    }

    return localStorage.getItem(
        key
    );
}


function setSessionValue(
    key,
    value,
    remember = false
) {

    sessionStorage.removeItem(
        key
    );

    localStorage.removeItem(
        key
    );


    const storage =
        remember
            ? localStorage
            : sessionStorage;


    storage.setItem(
        key,
        String(value)
    );
}


function isAuthenticated() {

    return (
        getStoredValue(
            "loggedIn"
        ) === "true"
    );
}


function getCurrentRole() {

    return safeString(
        getStoredValue(
            "userRole"
        )
    ).toLowerCase();
}


function getCurrentUsername() {

    return safeString(
        getStoredValue(
            "username"
        )
    );
}


function isAdmin() {

    return (
        getCurrentRole() ===
        "admin"
    );
}


/* =====================================================
   LOGIN SECURITY
===================================================== */

function requireLogin() {

    if (
        !isAuthenticated()
    ) {

        redirectToLogin();

        return false;
    }

    return true;
}


function requireAdmin() {

    if (
        !requireLogin()
    ) {

        return false;
    }


    if (
        !isAdmin()
    ) {

        alert(
            "یہ کام صرف ایڈمن کر سکتا ہے۔"
        );

        return false;
    }

    return true;
}


/* =====================================================
   CLEAR SESSION
===================================================== */

function clearSession() {

    const keys = [

        "loggedIn",
        "userRole",
        "username",
        "profileId",
        "lastActivity"

    ];


    keys.forEach(
        key => {

            localStorage.removeItem(
                key
            );

            sessionStorage.removeItem(
                key
            );
        }
    );


    localStorage.removeItem(
        "rememberMe"
    );
}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser(
    message = ""
) {

    clearSession();


    if (message) {

        sessionStorage.setItem(
            "logoutMessage",
            message
        );
    }


    window.location.href =
        "login.html?logout=true";
}


function redirectToLogin() {

    window.location.href =
        "login.html";
}


/* =====================================================
   INACTIVITY SECURITY
===================================================== */

function updateLastActivity() {

    if (
        !isAuthenticated()
    ) {

        return;
    }


    const remember =
        localStorage.getItem(
            "rememberMe"
        ) === "true";


    setSessionValue(
        "lastActivity",
        Date.now(),
        remember
    );
}


function checkSessionTimeout() {

    if (
        !isAuthenticated()
    ) {

        return true;
    }


    const lastActivity =
        Number(
            getStoredValue(
                "lastActivity"
            )
        );


    if (
        lastActivity &&
        Date.now() -
            lastActivity >
            SESSION_TIMEOUT
    ) {

        logoutUser(
            "پانچ منٹ غیر فعالیت کی وجہ سے آپ کو لاگ آؤٹ کر دیا گیا ہے۔"
        );

        return false;
    }


    return true;
}


function resetInactivityTimer() {

    if (
        !isAuthenticated()
    ) {

        return;
    }


    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );
    }


    updateLastActivity();


    inactivityTimer =
        setTimeout(
            () => {

                logoutUser(
                    "پانچ منٹ غیر فعالیت کی وجہ سے آپ کو لاگ آؤٹ کر دیا گیا ہے۔"
                );

            },
            SESSION_TIMEOUT
        );
}


function initializeInactivityProtection() {

    if (
        !isAuthenticated()
    ) {

        return;
    }


    if (
        !checkSessionTimeout()
    ) {

        return;
    }


    const events = [

        "click",
        "touchstart",
        "keydown",
        "scroll"

    ];


    events.forEach(
        eventName => {

            document.addEventListener(
                eventName,
                resetInactivityTimer,
                {
                    passive: true
                }
            );
        }
    );


    resetInactivityTimer();
}


/* =====================================================
   PAGE SECURITY
===================================================== */

function protectCurrentPage() {

    const publicPages = [

        "index.html",
        "login.html",
        "student-apply.html",
        "teacher-apply.html"

    ];


    if (
        publicPages.includes(
            currentFile
        )
    ) {

        return true;
    }


    if (
        !isAuthenticated()
    ) {

        redirectToLogin();

        return false;
    }


    const adminOnlyPages = [

        "students.html",
        "teachers.html",
        "approvals.html"

    ];


    if (
        adminOnlyPages.includes(
            currentFile
        ) &&
        !isAdmin()
    ) {

        alert(
            "اس صفحے تک رسائی صرف ایڈمن کو حاصل ہے۔"
        );

        window.location.href =
            "dashboard.html";

        return false;
    }


    return true;
}


/* =====================================================
   HOME PAGE
===================================================== */

function initializeHomePage() {

    const buttons = {

        adminLoginButton:
            "admin",

        teacherLoginButton:
            "teacher",

        studentLoginButton:
            "student"

    };


    Object.entries(
        buttons
    ).forEach(
        ([id, role]) => {

            const button =
                getElement(id);


            if (!button) {

                return;
            }


            button.addEventListener(
                "click",
                () => {

                    sessionStorage.setItem(
                        "selectedRole",
                        role
                    );

                    window.location.href =
                        "login.html";
                }
            );
        }
    );


    getElement(
        "studentApplyButton"
    )?.addEventListener(
        "click",
        () => {

            window.location.href =
                "student-apply.html";
        }
    );


    getElement(
        "teacherApplyButton"
    )?.addEventListener(
        "click",
        () => {

            window.location.href =
                "teacher-apply.html";
        }
    );
}


/* =====================================================
   PASSWORD VISIBILITY
===================================================== */

function initializePasswordToggle() {

    const password =
        getElement(
            "password"
        );

    const button =
        getElement(
            "togglePassword"
        );


    if (
        !password ||
        !button
    ) {

        return;
    }


    button.addEventListener(
        "click",
        () => {

            const hidden =
                password.type ===
                "password";


            password.type =
                hidden
                    ? "text"
                    : "password";


            button.textContent =
                hidden
                    ? "🙈"
                    : "👁️";
        }
    );
}


/* =====================================================
   LOGIN
===================================================== */

async function performLogin() {

    const username =
        getValue(
            "username"
        );

    const password =
        getValue(
            "password"
        );

    const remember =
        Boolean(
            getElement(
                "rememberMe"
            )?.checked
        );

    const message =
        getElement(
            "loginMessage"
        );

    const button =
        getElement(
            "loginButton"
        );


    clearMessage(
        message
    );


    if (
        !username ||
        !password
    ) {

        showMessage(
            message,
            "صارف نام اور پاس ورڈ درج کریں۔"
        );

        return;
    }


    if (
        !checkSupabase()
    ) {

        showMessage(
            message,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

        return;
    }


    const selectedRole =
        safeString(
            sessionStorage.getItem(
                "selectedRole"
            )
        ).toLowerCase();


    try {

        if (button) {

            button.disabled =
                true;
        }


        let query =
            supabaseClient
                .from(
                    PROFILES_TABLE
                )
                .select(
                    "id, username, password_hash, role, status"
                )
                .eq(
                    "username",
                    username
                );


        if (selectedRole) {

            query =
                query.eq(
                    "role",
                    selectedRole
                );
        }


        const {
            data,
            error
        } =
            await query
                .limit(1)
                .maybeSingle();


        if (error) {

            throw error;
        }


        if (!data) {

            showMessage(
                message,
                "صارف نام یا پاس ورڈ درست نہیں ہے۔"
            );

            return;
        }


        if (
            safeString(
                data.password_hash
            ) !== password
        ) {

            showMessage(
                message,
                "صارف نام یا پاس ورڈ درست نہیں ہے۔"
            );

            return;
        }


        if (
            safeString(
                data.status
            ).toLowerCase() !==
            "active"
        ) {

            showMessage(
                message,
                "یہ اکاؤنٹ ابھی ایڈمن سے منظور نہیں ہوا۔"
            );

            return;
        }


        const role =
            safeString(
                data.role
            ).toLowerCase();


        setSessionValue(
            "loggedIn",
            "true",
            remember
        );


        setSessionValue(
            "userRole",
            role,
            remember
        );


        setSessionValue(
            "username",
            username,
            remember
        );


        setSessionValue(
            "profileId",
            data.id,
            remember
        );


        setSessionValue(
            "lastActivity",
            Date.now(),
            remember
        );


        if (remember) {

            localStorage.setItem(
                "rememberMe",
                "true"
            );

        } else {

            localStorage.removeItem(
                "rememberMe"
            );
        }


        sessionStorage.removeItem(
            "selectedRole"
        );


        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            message,
            "لاگ اِن کے دوران خرابی پیش آئی۔"
        );


    } finally {

        if (button) {

            button.disabled =
                false;
        }
    }
}


/* =====================================================
   LOGIN PAGE
===================================================== */

function initializeLoginPage() {

    initializePasswordToggle();


    const form =
        getElement(
            "loginForm"
        );

    const button =
        getElement(
            "loginButton"
        );

    const backButton =
        getElement(
            "backButton"
        );

    const message =
        getElement(
            "loginMessage"
        );


    const logoutMessage =
        sessionStorage.getItem(
            "logoutMessage"
        );


    if (logoutMessage) {

        showMessage(
            message,
            logoutMessage,
            "warning"
        );

        sessionStorage.removeItem(
            "logoutMessage"
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                performLogin();
            }
        );

    } else if (button) {

        button.addEventListener(
            "click",
            performLogin
        );
    }


    backButton?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";
        }
    );
}


/* =====================================================
   DASHBOARD COUNTS
===================================================== */

async function updateDashboardCounts() {

    if (
        !checkSupabase()
    ) {

        return;
    }


    try {

        const [
            studentsResult,
            teachersResult
        ] =
            await Promise.all([

                supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .select(
                        "id,residence_type,student_class"
                    ),

                supabaseClient
                    .from(
                        TEACHERS_TABLE
                    )
                    .select(
                        "id"
                    )

            ]);


        if (
            studentsResult.error
        ) {

            throw studentsResult.error;
        }


        if (
            teachersResult.error
        ) {

            throw teachersResult.error;
        }


        const students =
            studentsResult.data || [];

        const teachers =
            teachersResult.data || [];


        setText(
            "studentTotal",
            students.length
        );


        setText(
            "teacherTotal",
            teachers.length
        );


        setText(
            "hostelTotal",
            students.filter(
                student =>
                    student.residence_type ===
                    "ہاسٹل"
            ).length
        );


        const classes =
            new Set(
                students
                    .map(
                        student =>
                            safeString(
                                student.student_class
                            )
                    )
                    .filter(Boolean)
            );


        setText(
            "classTotal",
            classes.size
        );


    } catch (error) {

        console.error(
            "Dashboard count error:",
            error
        );
    }
}


/* =====================================================
   DASHBOARD WELCOME
===================================================== */

function updateWelcomeMessage() {

    const element =
        getElement(
            "welcomeMessage"
        );


    if (!element) {

        return;
    }


    const username =
        getCurrentUsername();

    const role =
        getCurrentRole();


    let roleName =
        "صارف";


    if (
        role === "admin"
    ) {

        roleName =
            "ایڈمن";

    } else if (
        role === "teacher"
    ) {

        roleName =
            "استاد";

    } else if (
        role === "student"
    ) {

        roleName =
            "طالبہ";
    }


    element.textContent =
        username
            ? `خوش آمدید، ${username}`
            : `خوش آمدید، ${roleName}`;
}


/* =====================================================
   DASHBOARD PERMISSIONS
===================================================== */

function applyDashboardPermissions() {

    if (
        isAdmin()
    ) {

        return;
    }


    const teachersMenu =
        getElement(
            "teachersMenu"
        );

    const approvalsMenu =
        getElement(
            "approvalsMenu"
        );


    if (teachersMenu) {

        teachersMenu.style.display =
            "none";
    }


    if (approvalsMenu) {

        approvalsMenu.style.display =
            "none";
    }
}


/* =====================================================
   DASHBOARD NAVIGATION
===================================================== */

function initializeDashboardNavigation() {

    const routes = {

        studentsMenu:
            "students.html",

        teachersMenu:
            "teachers.html",

        attendanceMenu:
            "attendance.html",

        hostelMenu:
            "hostel.html",

        feesMenu:
            "fees.html",

        reportsMenu:
            "reports.html",

        approvalsMenu:
            "approvals.html"

    };


    Object.entries(
        routes
    ).forEach(
        ([id, page]) => {

            const button =
                getElement(id);


            if (!button) {

                return;
            }


            button.addEventListener(
                "click",
                () => {

                    if (
                        (
                            id ===
                            "teachersMenu" ||
                            id ===
                            "approvalsMenu"
                        ) &&
                        !isAdmin()
                    ) {

                        alert(
                            "یہ حصہ صرف ایڈمن کے لیے ہے۔"
                        );

                        return;
                    }


                    window.location.href =
                        page;
                }
            );
        }
    );


    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const page =
                            safeString(
                                button.dataset.page
                            );


                        const pages = {

                            students:
                                "students.html",

                            teachers:
                                "teachers.html",

                            attendance:
                                "attendance.html",

                            hostel:
                                "hostel.html",

                            fees:
                                "fees.html",

                            reports:
                                "reports.html",

                            approvals:
                                "approvals.html"

                        };


                        const destination =
                            pages[page];


                        if (!destination) {

                            return;
                        }


                        if (
                            (
                                page ===
                                "teachers" ||
                                page ===
                                "approvals"
                            ) &&
                            !isAdmin()
                        ) {

                            alert(
                                "یہ حصہ صرف ایڈمن کے لیے ہے۔"
                            );

                            return;
                        }


                        window.location.href =
                            destination;
                    }
                );
            }
        );
}


/* =====================================================
   DASHBOARD INITIALIZATION
===================================================== */

async function initializeDashboardPage() {

    if (
        !requireLogin()
    ) {

        return;
    }


    updateWelcomeMessage();

    applyDashboardPermissions();

    initializeDashboardNavigation();


    await updateDashboardCounts();
}


/* =====================================================
   BACK BUTTONS
===================================================== */

function initializeBackButtons() {

    getElement(
        "backToDashboard"
    )?.addEventListener(
        "click",
        () => {

            window.location.href =
                "dashboard.html";
        }
    );


    getElement(
        "backButton"
    )?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";
        }
    );


    getElement(
        "backToHome"
    )?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";
        }
    );


    document
        .querySelectorAll(
            "[data-back='home']"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            "index.html";
                    }
                );
            }
        );
}


/* =====================================================
   LOGOUT BUTTON
===================================================== */

function initializeLogoutButtons() {

    document
        .querySelectorAll(
            "#logoutButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        logoutUser();
                    }
                );
            }
        );
}


/* =====================================================
   INPUT FORMATTERS
===================================================== */

function initializeInputFormatters() {

    const cnicIds = [

        "studentCNIC",
        "teacherCNIC",
        "applyStudentCNIC",
        "applyTeacherCNIC"

    ];


    cnicIds.forEach(
        id => {

            const input =
                getElement(id);


            input?.addEventListener(
                "input",
                () => {

                    input.value =
                        formatCNIC(
                            input.value
                        );
                }
            );
        }
    );


    const phoneIds = [

        "phone",
        "studentPhone",
        "teacherPhone",
        "applyStudentPhone",
        "applyTeacherPhone"

    ];


    phoneIds.forEach(
        id => {

            const input =
                getElement(id);


            input?.addEventListener(
                "input",
                () => {

                    input.value =
                        cleanDigits(
                            input.value
                        ).slice(
                            0,
                            11
                        );
                }
            );
        }
    );
}


/* =====================================================
   END PART 1 / 3
   PART 2 MUST BE PASTED DIRECTLY BELOW THIS
===================================================== */

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   مدرسہ شہناز اختر للبنات

   SCRIPT.JS
   PART 2 / 3

   STUDENTS + TEACHERS
   APPLICATIONS + ADMIN APPROVALS
===================================================== */


/* =====================================================
   STUDENT STATE / ELEMENTS
===================================================== */

let studentsCache = [];
let editingStudentId = null;

const studentForm =
    getElement("studentForm");

const studentFormContainer =
    getElement("studentFormContainer");

const studentFormMessage =
    getElement("studentFormMessage");

const studentsList =
    getElement("studentsList");

const studentSearch =
    getElement("studentSearch");

const studentCount =
    getElement("studentCount");

const studentDetailsOverlay =
    getElement("studentDetailsOverlay");

const studentDetailsContent =
    getElement("studentDetailsContent");

const mahramList =
    getElement("mahramList");

const mahramSection =
    getElement("mahramSection");


/* =====================================================
   OPEN STUDENT FORM
===================================================== */

function openStudentForm() {

    if (!requireAdmin()) {

        return;
    }


    editingStudentId = null;


    if (studentForm) {

        studentForm.reset();
    }


    setValue(
        "editStudentId",
        ""
    );


    setText(
        "formTitle",
        "نئی طالبہ کا اندراج"
    );


    if (mahramList) {

        mahramList.innerHTML = "";
    }


    hideElement(
        mahramSection
    );


    hideElement(
        getElement(
            "previousMadrassaGroup"
        )
    );


    hideElement(
        getElement(
            "transferDateGroup"
        )
    );


    clearMessage(
        studentFormMessage
    );


    showElement(
        studentFormContainer
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   CLOSE STUDENT FORM
===================================================== */

function closeStudentForm() {

    editingStudentId = null;


    if (studentForm) {

        studentForm.reset();
    }


    if (mahramList) {

        mahramList.innerHTML = "";
    }


    hideElement(
        studentFormContainer
    );


    clearMessage(
        studentFormMessage
    );
}


/* =====================================================
   ADMISSION TYPE
===================================================== */

function updateTransferFields() {

    const type =
        getValue(
            "admissionType"
        );


    const previous =
        getElement(
            "previousMadrassaGroup"
        );


    const transfer =
        getElement(
            "transferDateGroup"
        );


    if (
        type === "منتقلی"
    ) {

        showElement(
            previous
        );

        showElement(
            transfer
        );

    } else {

        hideElement(
            previous
        );

        hideElement(
            transfer
        );


        setValue(
            "previousMadrassa",
            ""
        );


        setValue(
            "transferDate",
            ""
        );
    }
}


/* =====================================================
   RESIDENCE / MAHRAM
===================================================== */

function updateResidenceFields() {

    const residence =
        getValue(
            "residenceType"
        );


    if (
        residence === "ہاسٹل"
    ) {

        showElement(
            mahramSection
        );


        if (
            mahramList &&
            mahramList.children.length === 0
        ) {

            addMahramField();
        }

    } else {

        hideElement(
            mahramSection
        );


        if (mahramList) {

            mahramList.innerHTML = "";
        }
    }
}


/* =====================================================
   ADD MAHRAM
===================================================== */

function addMahramField(
    data = {}
) {

    if (!mahramList) {

        return;
    }


    if (
        mahramList.children.length >=
        MAX_MAHRAMS
    ) {

        alert(
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return;
    }


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "mahram-card";


    card.innerHTML = `

        <div class="mahram-header">

            <strong>
                محرم کی معلومات
            </strong>

            <button
                type="button"
                class="remove-mahram"
            >
                حذف کریں
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
                    value="${escapeHTML(data.name || "")}"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    رشتہ
                </label>

                <input
                    type="text"
                    class="mahram-relation"
                    value="${escapeHTML(data.relation || "")}"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    موبائل نمبر
                </label>

                <input
                    type="tel"
                    inputmode="numeric"
                    maxlength="11"
                    class="mahram-phone"
                    value="${escapeHTML(data.phone || "")}"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    شناختی کارڈ نمبر
                </label>

                <input
                    type="text"
                    inputmode="numeric"
                    maxlength="15"
                    class="mahram-cnic"
                    value="${escapeHTML(data.cnic || "")}"
                    required
                >

            </div>

        </div>


        <label class="mahram-confirm">

            <input
                type="checkbox"
                class="mahram-approved"
                ${data.approved ? "checked" : ""}
            >

            تصدیق ہے کہ یہ شرعی محرم ہے۔

        </label>
    `;


    mahramList.appendChild(
        card
    );


    const removeButton =
        card.querySelector(
            ".remove-mahram"
        );


    removeButton?.addEventListener(
        "click",
        () => {

            card.remove();
        }
    );


    const phone =
        card.querySelector(
            ".mahram-phone"
        );


    phone?.addEventListener(
        "input",
        () => {

            phone.value =
                cleanDigits(
                    phone.value
                ).slice(
                    0,
                    11
                );
        }
    );


    const cnic =
        card.querySelector(
            ".mahram-cnic"
        );


    cnic?.addEventListener(
        "input",
        () => {

            cnic.value =
                formatCNIC(
                    cnic.value
                );
        }
    );
}


/* =====================================================
   COLLECT MAHRAMS
===================================================== */

function collectMahrams() {

    if (!mahramList) {

        return [];
    }


    return Array.from(
        mahramList.querySelectorAll(
            ".mahram-card"
        )
    ).map(
        card => ({

            name:
                safeString(
                    card.querySelector(
                        ".mahram-name"
                    )?.value
                ),

            relation:
                safeString(
                    card.querySelector(
                        ".mahram-relation"
                    )?.value
                ),

            phone:
                cleanDigits(
                    card.querySelector(
                        ".mahram-phone"
                    )?.value
                ),

            cnic:
                formatCNIC(
                    card.querySelector(
                        ".mahram-cnic"
                    )?.value
                ),

            approved:
                Boolean(
                    card.querySelector(
                        ".mahram-approved"
                    )?.checked
                )

        })
    );
}


/* =====================================================
   VALIDATE MAHRAMS
===================================================== */

function validateMahrams(
    mahrams
) {

    if (!mahrams.length) {

        return {
            valid: false,
            message:
                "ہاسٹل طالبہ کے لیے کم از کم ایک محرم ضروری ہے۔"
        };
    }


    if (
        mahrams.length >
        MAX_MAHRAMS
    ) {

        return {
            valid: false,
            message:
                "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        };
    }


    for (
        const mahram of mahrams
    ) {

        if (
            !mahram.name ||
            !mahram.relation ||
            !mahram.phone ||
            !mahram.cnic
        ) {

            return {
                valid: false,
                message:
                    "تمام محرم معلومات مکمل کریں۔"
            };
        }


        if (
            !validPhone(
                mahram.phone
            )
        ) {

            return {
                valid: false,
                message:
                    "محرم کا موبائل نمبر درست درج کریں۔"
            };
        }


        if (
            !validCNIC(
                mahram.cnic
            )
        ) {

            return {
                valid: false,
                message:
                    "محرم کا شناختی کارڈ نمبر درست درج کریں۔"
            };
        }


        if (
            !mahram.approved
        ) {

            return {
                valid: false,
                message:
                    "ہر محرم کی شرعی محرم ہونے کی تصدیق ضروری ہے۔"
            };
        }
    }


    return {
        valid: true,
        message: ""
    };
}


/* =====================================================
   STUDENT FORM DATA
===================================================== */

function getStudentFormData() {

    const residenceType =
        getValue(
            "residenceType"
        );


    return {

        admission_no:
            getValue(
                "admissionNo"
            ),

        admission_type:
            getValue(
                "admissionType"
            ),

        name:
            getValue(
                "studentName"
            ),

        father_name:
            getValue(
                "fatherName"
            ),

        guardian_name:
            getValue(
                "guardianName"
            ),

        cnic:
            formatCNIC(
                getValue(
                    "studentCNIC"
                )
            ),

        phone:
            cleanDigits(
                getValue(
                    "phone"
                ) ||
                getValue(
                    "studentPhone"
                )
            ),

        date_of_birth:
            getValue(
                "dateOfBirth"
            ) || null,

        student_class:
            getValue(
                "studentClass"
            ),

        admission_date:
            getValue(
                "admissionDate"
            ) || null,

        address:
            getValue(
                "address"
            ),

        residence_type:
            residenceType,

        previous_madrassa:
            getValue(
                "previousMadrassa"
            ) || null,

        transfer_date:
            getValue(
                "transferDate"
            ) || null,

        mahrams:
            residenceType === "ہاسٹل"
                ? collectMahrams()
                : []

    };
}


/* =====================================================
   VALIDATE STUDENT
===================================================== */

function validateStudentData(
    data
) {

    if (
        !data.admission_no ||
        !data.admission_type ||
        !data.name ||
        !data.father_name ||
        !data.guardian_name ||
        !data.cnic ||
        !data.phone ||
        !data.date_of_birth ||
        !data.student_class ||
        !data.admission_date ||
        !data.address ||
        !data.residence_type
    ) {

        return {
            valid: false,
            message:
                "تمام ضروری معلومات مکمل کریں۔"
        };
    }


    if (
        !validCNIC(
            data.cnic
        )
    ) {

        return {
            valid: false,
            message:
                "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔"
        };
    }


    if (
        !validPhone(
            data.phone
        )
    ) {

        return {
            valid: false,
            message:
                "موبائل نمبر 03 سے شروع ہونے والا 11 ہندسوں کا ہونا چاہیے۔"
        };
    }


    if (
        data.admission_type ===
        "منتقلی"
    ) {

        if (
            !data.previous_madrassa ||
            !data.transfer_date
        ) {

            return {
                valid: false,
                message:
                    "منتقلی کے داخلے کے لیے سابقہ مدرسہ اور منتقلی کی تاریخ ضروری ہے۔"
            };
        }
    }


    if (
        data.residence_type ===
        "ہاسٹل"
    ) {

        return validateMahrams(
            data.mahrams
        );
    }


    return {
        valid: true,
        message: ""
    };
}


/* =====================================================
   LOAD STUDENTS
===================================================== */

async function loadStudents() {

    if (
        !studentsList ||
        !checkSupabase()
    ) {

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
                .select("*")
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;
        }


        studentsCache =
            data || [];


        renderStudents(
            studentsCache
        );


    } catch (error) {

        console.error(
            "Load students error:",
            error
        );


        studentsList.innerHTML = `

            <div class="empty-students">
                طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔
            </div>
        `;
    }
}


/* =====================================================
   RENDER STUDENTS
===================================================== */

function renderStudents(
    students
) {

    if (!studentsList) {

        return;
    }


    if (studentCount) {

        studentCount.textContent =
            students.length;
    }


    if (!students.length) {

        studentsList.innerHTML = `

            <div class="empty-students">

                <div class="empty-icon">
                    👧
                </div>

                ابھی کوئی طالبہ موجود نہیں۔

            </div>
        `;

        return;
    }


    studentsList.innerHTML =
        students.map(
            student => `

                <div
                    class="student-card"
                    data-id="${escapeHTML(student.id)}"
                >

                    <div class="student-card-header">

                        <div class="student-avatar">
                            👧
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(student.name)}
                            </h3>

                            <span>
                                داخلہ نمبر:
                                ${escapeHTML(student.admission_no || "—")}
                            </span>

                        </div>

                    </div>


                    <div class="student-badges">

                        <span>
                            ${escapeHTML(student.student_class || "—")}
                        </span>

                        <span>
                            ${escapeHTML(student.residence_type || "—")}
                        </span>

                        <span>
                            ${escapeHTML(student.admission_type || "—")}
                        </span>

                    </div>


                    <div class="student-info">

                        <p>
                            والد:
                            ${escapeHTML(student.father_name || "—")}
                        </p>

                        <p>
                            موبائل:
                            ${escapeHTML(student.phone || "—")}
                        </p>

                    </div>


                    <div class="student-card-buttons">

                        <button
                            type="button"
                            class="view-student"
                            data-id="${escapeHTML(student.id)}"
                        >
                            تفصیلات
                        </button>

                        <button
                            type="button"
                            class="edit-student"
                            data-id="${escapeHTML(student.id)}"
                        >
                            ترمیم
                        </button>

                        <button
                            type="button"
                            class="delete-student"
                            data-id="${escapeHTML(student.id)}"
                        >
                            حذف
                        </button>

                    </div>

                </div>
            `
        ).join("");


    studentsList
        .querySelectorAll(
            ".view-student"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showStudentDetails(
                            button.dataset.id
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
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editStudent(
                            button.dataset.id
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
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteStudent(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =====================================================
   SAVE STUDENT
===================================================== */

async function saveStudent(
    event
) {

    event?.preventDefault();


    if (!requireAdmin()) {

        return;
    }


    const data =
        getStudentFormData();


    const validation =
        validateStudentData(
            data
        );


    if (!validation.valid) {

        showMessage(
            studentFormMessage,
            validation.message
        );

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    const button =
        getElement(
            "saveStudentButton"
        );


    try {

        if (button) {

            button.disabled =
                true;
        }


        clearMessage(
            studentFormMessage
        );


        let result;


        if (editingStudentId) {

            result =
                await supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .update(data)
                    .eq(
                        "id",
                        editingStudentId
                    );

        } else {

            result =
                await supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .insert([
                        data
                    ]);
        }


        if (result.error) {

            throw result.error;
        }


        showMessage(
            studentFormMessage,
            editingStudentId
                ? "طالبہ کا ریکارڈ کامیابی سے تبدیل ہو گیا۔"
                : "نئی طالبہ کامیابی سے شامل ہو گئی۔",
            "success"
        );


        await loadStudents();


        setTimeout(
            closeStudentForm,
            700
        );


    } catch (error) {

        console.error(
            "Save student error:",
            error
        );


        showMessage(
            studentFormMessage,
            "طالبہ کا ریکارڈ محفوظ نہیں ہو سکا۔"
        );


    } finally {

        if (button) {

            button.disabled =
                false;
        }
    }
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
            item =>
                String(item.id) ===
                String(id)
        );


    if (!student) {

        alert(
            "طالبہ کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    editingStudentId =
        student.id;


    setValue(
        "editStudentId",
        student.id
    );

    setValue(
        "admissionNo",
        student.admission_no
    );

    setValue(
        "admissionType",
        student.admission_type
    );

    setValue(
        "studentName",
        student.name
    );

    setValue(
        "fatherName",
        student.father_name
    );

    setValue(
        "guardianName",
        student.guardian_name
    );

    setValue(
        "studentCNIC",
        student.cnic
    );

    setValue(
        "phone",
        student.phone
    );

    setValue(
        "studentPhone",
        student.phone
    );

    setValue(
        "dateOfBirth",
        student.date_of_birth
    );

    setValue(
        "studentClass",
        student.student_class
    );

    setValue(
        "admissionDate",
        student.admission_date
    );

    setValue(
        "address",
        student.address
    );

    setValue(
        "residenceType",
        student.residence_type
    );

    setValue(
        "previousMadrassa",
        student.previous_madrassa
    );

    setValue(
        "transferDate",
        student.transfer_date
    );


    setText(
        "formTitle",
        "طالبہ کا ریکارڈ تبدیل کریں"
    );


    updateTransferFields();

    updateResidenceFields();


    if (mahramList) {

        mahramList.innerHTML = "";


        if (
            student.residence_type ===
            "ہاسٹل"
        ) {

            const mahrams =
                Array.isArray(
                    student.mahrams
                )
                    ? student.mahrams
                    : [];


            mahrams.forEach(
                mahram =>
                    addMahramField(
                        mahram
                    )
            );


            if (
                mahrams.length === 0
            ) {

                addMahramField();
            }
        }
    }


    showElement(
        studentFormContainer
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   DELETE STUDENT
===================================================== */

async function deleteStudent(id) {

    if (!requireAdmin()) {

        return;
    }


    const student =
        studentsCache.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!student) {

        return;
    }


    const confirmed =
        window.confirm(
            `کیا آپ واقعی ${student.name} کا ریکارڈ حذف کرنا چاہتے ہیں؟`
        );


    if (!confirmed) {

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
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
            "Delete student error:",
            error
        );


        alert(
            "طالبہ کا ریکارڈ حذف نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   STUDENT DETAILS
===================================================== */

function showStudentDetails(id) {

    const student =
        studentsCache.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (
        !student ||
        !studentDetailsOverlay ||
        !studentDetailsContent
    ) {

        return;
    }


    const mahrams =
        Array.isArray(
            student.mahrams
        )
            ? student.mahrams
            : [];


    const mahramHTML =
        mahrams.length
            ? mahrams.map(
                (mahram, index) => `

                    <div class="mahram-detail">

                        <p>
                            <strong>
                                محرم ${index + 1}:
                            </strong>

                            ${escapeHTML(mahram.name || "—")}
                        </p>

                        <p>
                            <strong>
                                رشتہ:
                            </strong>

                            ${escapeHTML(mahram.relation || "—")}
                        </p>

                        <p>
                            <strong>
                                موبائل:
                            </strong>

                            ${escapeHTML(mahram.phone || "—")}
                        </p>

                        <p>
                            <strong>
                                شناختی کارڈ:
                            </strong>

                            ${escapeHTML(mahram.cnic || "—")}
                        </p>

                    </div>

                `
            ).join("")
            : "<p>کوئی محرم درج نہیں۔</p>";


    studentDetailsContent.innerHTML = `

        <h3>
            بنیادی معلومات
        </h3>

        <p>
            <strong>نام:</strong>
            ${escapeHTML(student.name || "—")}
        </p>

        <p>
            <strong>والد:</strong>
            ${escapeHTML(student.father_name || "—")}
        </p>

        <p>
            <strong>سرپرست:</strong>
            ${escapeHTML(student.guardian_name || "—")}
        </p>

        <p>
            <strong>شناختی کارڈ:</strong>
            ${escapeHTML(student.cnic || "—")}
        </p>

        <p>
            <strong>موبائل:</strong>
            ${escapeHTML(student.phone || "—")}
        </p>

        <p>
            <strong>تاریخ پیدائش:</strong>
            ${escapeHTML(formatDate(student.date_of_birth))}
        </p>


        <h3>
            داخلہ
        </h3>

        <p>
            <strong>داخلہ نمبر:</strong>
            ${escapeHTML(student.admission_no || "—")}
        </p>

        <p>
            <strong>داخلہ کی قسم:</strong>
            ${escapeHTML(student.admission_type || "—")}
        </p>

        <p>
            <strong>کلاس:</strong>
            ${escapeHTML(student.student_class || "—")}
        </p>

        <p>
            <strong>داخلہ تاریخ:</strong>
            ${escapeHTML(formatDate(student.admission_date))}
        </p>

        <p>
            <strong>رہائش:</strong>
            ${escapeHTML(student.residence_type || "—")}
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHTML(student.address || "—")}
        </p>


        <h3>
            محرم
        </h3>

        ${mahramHTML}
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
   STUDENT SEARCH
===================================================== */

function searchStudents() {

    const query =
        safeString(
            studentSearch?.value
        ).toLowerCase();


    if (!query) {

        renderStudents(
            studentsCache
        );

        return;
    }


    const filtered =
        studentsCache.filter(
            student => {

                const text = [

                    student.name,
                    student.father_name,
                    student.guardian_name,
                    student.admission_no,
                    student.phone,
                    student.cnic,
                    student.student_class

                ]
                    .map(
                        safeString
                    )
                    .join(" ")
                    .toLowerCase();


                return text.includes(
                    query
                );
            }
        );


    renderStudents(
        filtered
    );
}


/* =====================================================
   INITIALIZE STUDENTS PAGE
===================================================== */

async function initializeStudentsPage() {

    if (!requireAdmin()) {

        return;
    }


    getElement(
        "showStudentForm"
    )?.addEventListener(
        "click",
        openStudentForm
    );


    getElement(
        "cancelStudentForm"
    )?.addEventListener(
        "click",
        closeStudentForm
    );


    getElement(
        "cancelStudentButton"
    )?.addEventListener(
        "click",
        closeStudentForm
    );


    getElement(
        "admissionType"
    )?.addEventListener(
        "change",
        updateTransferFields
    );


    getElement(
        "residenceType"
    )?.addEventListener(
        "change",
        updateResidenceFields
    );


    getElement(
        "addMahram"
    )?.addEventListener(
        "click",
        () => {

            addMahramField();
        }
    );


    studentForm?.addEventListener(
        "submit",
        saveStudent
    );


    studentSearch?.addEventListener(
        "input",
        searchStudents
    );


    getElement(
        "closeStudentDetails"
    )?.addEventListener(
        "click",
        closeStudentDetails
    );


    studentDetailsOverlay?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                studentDetailsOverlay
            ) {

                closeStudentDetails();
            }
        }
    );


    await loadStudents();
}


/* =====================================================
   TEACHER STATE / ELEMENTS
===================================================== */

let teachersCache = [];
let editingTeacherId = null;


const teacherForm =
    getElement(
        "teacherForm"
    );


const teacherFormContainer =
    getElement(
        "teacherFormContainer"
    );


const teacherFormMessage =
    getElement(
        "teacherFormMessage"
    );


const teacherList =
    getElement(
        "teacherList"
    );


const teacherSearch =
    getElement(
        "teacherSearch"
    );


const teacherDetailsOverlay =
    getElement(
        "teacherDetailsOverlay"
    );


const teacherDetailsContent =
    getElement(
        "teacherDetailsContent"
    );


/* =====================================================
   OPEN TEACHER FORM
===================================================== */

function openTeacherForm() {

    if (!requireAdmin()) {

        return;
    }


    editingTeacherId = null;


    teacherForm?.reset();


    setValue(
        "editTeacherId",
        ""
    );


    setValue(
        "teacherStatus",
        "active"
    );


    setText(
        "teacherFormTitle",
        "👩‍🏫 نئے استاد کی معلومات"
    );


    clearMessage(
        teacherFormMessage
    );


    showElement(
        teacherFormContainer
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   CLOSE TEACHER FORM
===================================================== */

function closeTeacherForm() {

    editingTeacherId = null;


    teacherForm?.reset();


    setValue(
        "editTeacherId",
        ""
    );


    hideElement(
        teacherFormContainer
    );


    clearMessage(
        teacherFormMessage
    );
}


/* =====================================================
   TEACHER FORM DATA
===================================================== */

function getTeacherFormData() {

    return {

        teacher_code:
            getValue(
                "teacherCode"
            ),

        name:
            getValue(
                "teacherName"
            ),

        father_name:
            getValue(
                "teacherFatherName"
            ),

        phone:
            cleanDigits(
                getValue(
                    "teacherPhone"
                )
            ),

        cnic:
            formatCNIC(
                getValue(
                    "teacherCNIC"
                )
            ),

        date_of_birth:
            getValue(
                "teacherDateOfBirth"
            ) || null,

        qualification:
            getValue(
                "teacherQualification"
            ),

        joining_date:
            getValue(
                "teacherJoiningDate"
            ) || null,

        status:
            getValue(
                "teacherStatus"
            ) || "active",

        address:
            getValue(
                "teacherAddress"
            )

    };
}


/* =====================================================
   VALIDATE TEACHER
===================================================== */

function validateTeacherData(
    data
) {

    if (
        !data.teacher_code ||
        !data.name ||
        !data.father_name ||
        !data.phone ||
        !data.cnic ||
        !data.qualification ||
        !data.joining_date ||
        !data.status ||
        !data.address
    ) {

        return {
            valid: false,
            message:
                "تمام ضروری معلومات مکمل کریں۔"
        };
    }


    if (
        !validPhone(
            data.phone
        )
    ) {

        return {
            valid: false,
            message:
                "موبائل نمبر 03 سے شروع ہونے والا 11 ہندسوں کا ہونا چاہیے۔"
        };
    }


    if (
        !validCNIC(
            data.cnic
        )
    ) {

        return {
            valid: false,
            message:
                "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔"
        };
    }


    return {
        valid: true,
        message: ""
    };
}


/* =====================================================
   LOAD TEACHERS
===================================================== */

async function loadTeachers() {

    if (
        !teacherList ||
        !checkSupabase()
    ) {

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    TEACHERS_TABLE
                )
                .select("*")
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;
        }


        teachersCache =
            data || [];


        renderTeachers(
            teachersCache
        );


    } catch (error) {

        console.error(
            "Load teachers error:",
            error
        );


        teacherList.innerHTML = `

            <div class="teacher-empty">
                اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔
            </div>
        `;
    }
}


/* =====================================================
   RENDER TEACHERS
===================================================== */

function renderTeachers(
    teachers
) {

    if (!teacherList) {

        return;
    }


    setText(
        "teacherListCount",
        teachers.length
    );


    setText(
        "teacherTotal",
        teachersCache.length
    );


    setText(
        "activeTeacherTotal",
        teachersCache.filter(
            teacher =>
                safeString(
                    teacher.status
                ).toLowerCase() ===
                "active"
        ).length
    );


    setText(
        "pendingTeacherTotal",
        teachersCache.filter(
            teacher =>
                safeString(
                    teacher.status
                ).toLowerCase() ===
                "pending"
        ).length
    );


    if (!teachers.length) {

        teacherList.innerHTML = `

            <div class="teacher-empty">
                ابھی کوئی استاد موجود نہیں۔
            </div>
        `;

        return;
    }


    teacherList.innerHTML =
        teachers.map(
            teacher => `

                <div
                    class="teacher-card"
                    data-id="${escapeHTML(teacher.id)}"
                >

                    <h3>
                        👩‍🏫
                        ${escapeHTML(teacher.name || "—")}
                    </h3>


                    <div class="teacher-card-info">

                        <p>
                            کوڈ:
                            ${escapeHTML(teacher.teacher_code || "—")}
                        </p>

                        <p>
                            موبائل:
                            ${escapeHTML(teacher.phone || "—")}
                        </p>

                        <p>
                            قابلیت:
                            ${escapeHTML(teacher.qualification || "—")}
                        </p>

                        <p>
                            حیثیت:
                            ${
                                safeString(
                                    teacher.status
                                ).toLowerCase() === "active"
                                    ? "فعال"
                                    : "غیر فعال"
                            }
                        </p>

                    </div>


                    <div class="teacher-card-buttons">

                        <button
                            type="button"
                            class="view-teacher"
                            data-id="${escapeHTML(teacher.id)}"
                        >
                            تفصیلات
                        </button>

                        <button
                            type="button"
                            class="edit-teacher"
                            data-id="${escapeHTML(teacher.id)}"
                        >
                            ترمیم
                        </button>

                        <button
                            type="button"
                            class="delete-teacher"
                            data-id="${escapeHTML(teacher.id)}"
                        >
                            حذف
                        </button>

                    </div>

                </div>
            `
        ).join("");


    teacherList
        .querySelectorAll(
            ".view-teacher"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showTeacherDetails(
                            button.dataset.id
                        );
                    }
                );
            }
        );


    teacherList
        .querySelectorAll(
            ".edit-teacher"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editTeacher(
                            button.dataset.id
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
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteTeacher(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =====================================================
   SAVE TEACHER
===================================================== */

async function saveTeacher(
    event
) {

    event?.preventDefault();


    if (!requireAdmin()) {

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    const data =
        getTeacherFormData();


    const validation =
        validateTeacherData(
            data
        );


    if (!validation.valid) {

        showMessage(
            teacherFormMessage,
            validation.message
        );

        return;
    }


    const button =
        getElement(
            "saveTeacherButton"
        );


    try {

        if (button) {

            button.disabled =
                true;
        }


        clearMessage(
            teacherFormMessage
        );


        let result;


        if (editingTeacherId) {

            result =
                await supabaseClient
                    .from(
                        TEACHERS_TABLE
                    )
                    .update(data)
                    .eq(
                        "id",
                        editingTeacherId
                    );

        } else {

            result =
                await supabaseClient
                    .from(
                        TEACHERS_TABLE
                    )
                    .insert([
                        data
                    ]);
        }


        if (result.error) {

            throw result.error;
        }


        showMessage(
            teacherFormMessage,
            editingTeacherId
                ? "استاد کا ریکارڈ کامیابی سے تبدیل ہو گیا۔"
                : "نیا استاد کامیابی سے شامل ہو گیا۔",
            "success"
        );


        await loadTeachers();


        setTimeout(
            closeTeacherForm,
            700
        );


    } catch (error) {

        console.error(
            "Save teacher error:",
            error
        );


        showMessage(
            teacherFormMessage,
            "استاد کا ریکارڈ محفوظ نہیں ہو سکا۔"
        );


    } finally {

        if (button) {

            button.disabled =
                false;
        }
    }
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
            item =>
                String(item.id) ===
                String(id)
        );


    if (!teacher) {

        alert(
            "استاد کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    editingTeacherId =
        teacher.id;


    setValue(
        "editTeacherId",
        teacher.id
    );


    setValue(
        "teacherCode",
        teacher.teacher_code
    );


    setValue(
        "teacherName",
        teacher.name
    );


    setValue(
        "teacherFatherName",
        teacher.father_name
    );


    setValue(
        "teacherPhone",
        teacher.phone
    );


    setValue(
        "teacherCNIC",
        teacher.cnic
    );


    setValue(
        "teacherDateOfBirth",
        teacher.date_of_birth
    );


    setValue(
        "teacherQualification",
        teacher.qualification
    );


    setValue(
        "teacherJoiningDate",
        teacher.joining_date
    );


    setValue(
        "teacherStatus",
        teacher.status || "active"
    );


    setValue(
        "teacherAddress",
        teacher.address
    );


    setText(
        "teacherFormTitle",
        "استاد کا ریکارڈ تبدیل کریں"
    );


    clearMessage(
        teacherFormMessage
    );


    showElement(
        teacherFormContainer
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   DELETE TEACHER
===================================================== */

async function deleteTeacher(id) {

    if (!requireAdmin()) {

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    const teacher =
        teachersCache.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!teacher) {

        return;
    }


    const confirmed =
        window.confirm(
            `کیا آپ واقعی ${teacher.name} کا ریکارڈ حذف کرنا چاہتے ہیں؟`
        );


    if (!confirmed) {

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    TEACHERS_TABLE
                )
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
            "Delete teacher error:",
            error
        );


        alert(
            "استاد کا ریکارڈ حذف نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   TEACHER DETAILS
===================================================== */

function showTeacherDetails(id) {

    const teacher =
        teachersCache.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (
        !teacher ||
        !teacherDetailsOverlay ||
        !teacherDetailsContent
    ) {

        return;
    }


    const status =
        safeString(
            teacher.status
        ).toLowerCase() === "active"
            ? "فعال"
            : "غیر فعال";


    teacherDetailsContent.innerHTML = `

        <h3>
            بنیادی معلومات
        </h3>

        <p>
            <strong>نام:</strong>
            ${escapeHTML(teacher.name || "—")}
        </p>

        <p>
            <strong>والد:</strong>
            ${escapeHTML(teacher.father_name || "—")}
        </p>

        <p>
            <strong>کوڈ:</strong>
            ${escapeHTML(teacher.teacher_code || "—")}
        </p>

        <p>
            <strong>موبائل:</strong>
            ${escapeHTML(teacher.phone || "—")}
        </p>

        <p>
            <strong>شناختی کارڈ:</strong>
            ${escapeHTML(teacher.cnic || "—")}
        </p>

        <p>
            <strong>تاریخ پیدائش:</strong>
            ${escapeHTML(formatDate(teacher.date_of_birth))}
        </p>

        <p>
            <strong>قابلیت:</strong>
            ${escapeHTML(teacher.qualification || "—")}
        </p>

        <p>
            <strong>تقرری:</strong>
            ${escapeHTML(formatDate(teacher.joining_date))}
        </p>

        <p>
            <strong>حیثیت:</strong>
            ${escapeHTML(status)}
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHTML(teacher.address || "—")}
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
   TEACHER SEARCH
===================================================== */

function searchTeachers() {

    const query =
        safeString(
            teacherSearch?.value
        ).toLowerCase();


    if (!query) {

        renderTeachers(
            teachersCache
        );

        return;
    }


    const filtered =
        teachersCache.filter(
            teacher => {

                const text = [

                    teacher.name,
                    teacher.father_name,
                    teacher.teacher_code,
                    teacher.phone,
                    teacher.cnic,
                    teacher.qualification

                ]
                    .map(
                        safeString
                    )
                    .join(" ")
                    .toLowerCase();


                return text.includes(
                    query
                );
            }
        );


    renderTeachers(
        filtered
    );
}


/* =====================================================
   INITIALIZE TEACHERS PAGE
===================================================== */

async function initializeTeachersPage() {

    if (!requireAdmin()) {

        return;
    }


    getElement(
        "showTeacherForm"
    )?.addEventListener(
        "click",
        openTeacherForm
    );


    getElement(
        "cancelTeacherButton"
    )?.addEventListener(
        "click",
        closeTeacherForm
    );


    teacherForm?.addEventListener(
        "submit",
        saveTeacher
    );


    teacherSearch?.addEventListener(
        "input",
        searchTeachers
    );


    getElement(
        "closeTeacherDetails"
    )?.addEventListener(
        "click",
        closeTeacherDetails
    );


    teacherDetailsOverlay?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                teacherDetailsOverlay
            ) {

                closeTeacherDetails();
            }
        }
    );


    await loadTeachers();
}


/* =====================================================
   PUBLIC STUDENT APPLICATION
===================================================== */

async function submitStudentApplication(
    event
) {

    event?.preventDefault();


    if (!checkSupabase()) {

        return;
    }


    const message =
        getElement(
            "studentApplicationMessage"
        ) ||
        getElement(
            "applicationMessage"
        );


    const button =
        getElement(
            "submitStudentApplication"
        );


    const residenceType =
        getValue(
            "residenceType"
        );


    const application = {

        name:
            getValue(
                "studentName"
            ),

        father_name:
            getValue(
                "fatherName"
            ),

        guardian_name:
            getValue(
                "guardianName"
            ),

        cnic:
            formatCNIC(
                getValue(
                    "studentCNIC"
                )
            ),

        phone:
            cleanDigits(
                getValue(
                    "phone"
                ) ||
                getValue(
                    "studentPhone"
                )
            ),

        date_of_birth:
            getValue(
                "dateOfBirth"
            ) || null,

        student_class:
            getValue(
                "studentClass"
            ),

        address:
            getValue(
                "address"
            ),

        residence_type:
            residenceType,

        admission_type:
            getValue(
                "admissionType"
            ) || "نیا داخلہ",

        previous_madrassa:
            getValue(
                "previousMadrassa"
            ) || null,

        transfer_date:
            getValue(
                "transferDate"
            ) || null,

        mahrams:
            residenceType === "ہاسٹل"
                ? collectMahrams()
                : [],

        status:
            "pending"

    };


    if (
        !application.name ||
        !application.father_name ||
        !application.guardian_name ||
        !application.phone ||
        !application.student_class
    ) {

        showMessage(
            message,
            "تمام ضروری معلومات مکمل کریں۔"
        );

        return;
    }


    if (
        application.cnic &&
        !validCNIC(
            application.cnic
        )
    ) {

        showMessage(
            message,
            "شناختی کارڈ نمبر درست درج کریں۔"
        );

        return;
    }


    if (
        !validPhone(
            application.phone
        )
    ) {

        showMessage(
            message,
            "موبائل نمبر درست درج کریں۔"
        );

        return;
    }


    if (
        application.residence_type ===
        "ہاسٹل"
    ) {

        const validation =
            validateMahrams(
                application.mahrams
            );


        if (!validation.valid) {

            showMessage(
                message,
                validation.message
            );

            return;
        }
    }


    try {

        if (button) {

            button.disabled =
                true;
        }


        const {
            error
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .insert([
                    application
                ]);


        if (error) {

            throw error;
        }


        showMessage(
            message,
            "آپ کی درخواست کامیابی سے جمع ہو گئی ہے۔ ایڈمن کی منظوری کے بعد داخلہ مکمل ہوگا۔",
            "success"
        );


        getElement(
            "studentApplicationForm"
        )?.reset();


        if (mahramList) {

            mahramList.innerHTML = "";
        }


        hideElement(
            mahramSection
        );


    } catch (error) {

        console.error(
            "Student application error:",
            error
        );


        showMessage(
            message,
            "درخواست جمع نہیں ہو سکی۔"
        );


    } finally {

        if (button) {

            button.disabled =
                false;
        }
    }
}


/* =====================================================
   PUBLIC TEACHER APPLICATION
===================================================== */

async function submitTeacherApplication(
    event
) {

    event?.preventDefault();


    if (!checkSupabase()) {

        return;
    }


    const message =
        getElement(
            "teacherApplicationMessage"
        ) ||
        getElement(
            "applicationMessage"
        );


    const button =
        getElement(
            "submitTeacherApplication"
        );


    const application = {

        name:
            getValue(
                "teacherName"
            ),

        father_name:
            getValue(
                "teacherFatherName"
            ),

        phone:
            cleanDigits(
                getValue(
                    "teacherPhone"
                )
            ),

        cnic:
            formatCNIC(
                getValue(
                    "teacherCNIC"
                )
            ),

        date_of_birth:
            getValue(
                "teacherDateOfBirth"
            ) || null,

        qualification:
            getValue(
                "teacherQualification"
            ),

        address:
            getValue(
                "teacherAddress"
            ),

        status:
            "pending"

    };


    if (
        !application.name ||
        !application.father_name ||
        !application.phone ||
        !application.cnic ||
        !application.qualification ||
        !application.address
    ) {

        showMessage(
            message,
            "تمام ضروری معلومات مکمل کریں۔"
        );

        return;
    }


    if (
        !validPhone(
            application.phone
        )
    ) {

        showMessage(
            message,
            "موبائل نمبر درست درج کریں۔"
        );

        return;
    }


    if (
        !validCNIC(
            application.cnic
        )
    ) {

        showMessage(
            message,
            "شناختی کارڈ نمبر درست درج کریں۔"
        );

        return;
    }


    try {

        if (button) {

            button.disabled =
                true;
        }


        const {
            error
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .insert([
                    application
                ]);


        if (error) {

            throw error;
        }


        showMessage(
            message,
            "آپ کی درخواست کامیابی سے جمع ہو گئی ہے۔ ایڈمن کی منظوری ضروری ہے۔",
            "success"
        );


        getElement(
            "teacherApplicationForm"
        )?.reset();


    } catch (error) {

        console.error(
            "Teacher application error:",
            error
        );


        showMessage(
            message,
            "درخواست جمع نہیں ہو سکی۔"
        );


    } finally {

        if (button) {

            button.disabled =
                false;
        }
    }
}


/* =====================================================
   INITIALIZE STUDENT APPLICATION
===================================================== */

function initializeStudentApplicationPage() {

    const form =
        getElement(
            "studentApplicationForm"
        );


    form?.addEventListener(
        "submit",
        submitStudentApplication
    );


    getElement(
        "admissionType"
    )?.addEventListener(
        "change",
        updateTransferFields
    );


    getElement(
        "residenceType"
    )?.addEventListener(
        "change",
        updateResidenceFields
    );


    getElement(
        "addMahram"
    )?.addEventListener(
        "click",
        () => {

            addMahramField();
        }
    );
}


/* =====================================================
   INITIALIZE TEACHER APPLICATION
===================================================== */

function initializeTeacherApplicationPage() {

    const form =
        getElement(
            "teacherApplicationForm"
        );


    form?.addEventListener(
        "submit",
        submitTeacherApplication
    );
}


/* =====================================================
   APPROVAL STATE
===================================================== */

let studentApplicationsCache = [];
let teacherApplicationsCache = [];


/* =====================================================
   LOAD APPROVALS
===================================================== */

async function loadApprovals() {

    if (!requireAdmin()) {

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    try {

        const [
            studentsResult,
            teachersResult
        ] =
            await Promise.all([

                supabaseClient
                    .from(
                        STUDENT_APPLICATIONS_TABLE
                    )
                    .select("*")
                    .eq(
                        "status",
                        "pending"
                    )
                    .order(
                        "id",
                        {
                            ascending: false
                        }
                    ),

                supabaseClient
                    .from(
                        TEACHER_APPLICATIONS_TABLE
                    )
                    .select("*")
                    .eq(
                        "status",
                        "pending"
                    )
                    .order(
                        "id",
                        {
                            ascending: false
                        }
                    )

            ]);


        if (
            studentsResult.error
        ) {

            throw studentsResult.error;
        }


        if (
            teachersResult.error
        ) {

            throw teachersResult.error;
        }


        studentApplicationsCache =
            studentsResult.data || [];


        teacherApplicationsCache =
            teachersResult.data || [];


        renderStudentApplications();

        renderTeacherApplications();


    } catch (error) {

        console.error(
            "Load approvals error:",
            error
        );


        showMessage(
            getElement(
                "approvalMessage"
            ),
            "درخواستیں لوڈ نہیں ہو سکیں۔"
        );
    }
}


/* =====================================================
   RENDER STUDENT APPLICATIONS
===================================================== */

function renderStudentApplications() {

    const container =
        getElement(
            "studentApplicationsList"
        );


    if (!container) {

        return;
    }


    if (
        !studentApplicationsCache.length
    ) {

        container.innerHTML = `

            <div class="empty-students">
                کوئی زیرِ منظوری طالبہ درخواست موجود نہیں۔
            </div>
        `;

        return;
    }


    container.innerHTML =
        studentApplicationsCache
            .map(
                application => `

                    <div class="student-card">

                        <h3>
                            👧
                            ${escapeHTML(application.name || "—")}
                        </h3>

                        <div class="student-info">

                            <p>
                                والد:
                                ${escapeHTML(application.father_name || "—")}
                            </p>

                            <p>
                                موبائل:
                                ${escapeHTML(application.phone || "—")}
                            </p>

                            <p>
                                کلاس:
                                ${escapeHTML(application.student_class || "—")}
                            </p>

                            <p>
                                رہائش:
                                ${escapeHTML(application.residence_type || "—")}
                            </p>

                        </div>


                        <div class="student-card-buttons">

                            <button
                                type="button"
                                class="approve-student-application save-button"
                                data-id="${escapeHTML(application.id)}"
                            >
                                ✅ منظور کریں
                            </button>

                            <button
                                type="button"
                                class="reject-student-application delete-student"
                                data-id="${escapeHTML(application.id)}"
                            >
                                ❌ مسترد کریں
                            </button>

                        </div>

                    </div>
                `
            )
            .join("");


    container
        .querySelectorAll(
            ".approve-student-application"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        approveStudentApplication(
                            button.dataset.id
                        );
                    }
                );
            }
        );


    container
        .querySelectorAll(
            ".reject-student-application"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        rejectStudentApplication(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =====================================================
   RENDER TEACHER APPLICATIONS
===================================================== */

function renderTeacherApplications() {

    const container =
        getElement(
            "teacherApplicationsList"
        );


    if (!container) {

        return;
    }


    if (
        !teacherApplicationsCache.length
    ) {

        container.innerHTML = `

            <div class="teacher-empty">
                کوئی زیرِ منظوری استاد درخواست موجود نہیں۔
            </div>
        `;

        return;
    }


    container.innerHTML =
        teacherApplicationsCache
            .map(
                application => `

                    <div class="teacher-card">

                        <h3>
                            👩‍🏫
                            ${escapeHTML(application.name || "—")}
                        </h3>

                        <div class="teacher-card-info">

                            <p>
                                والد:
                                ${escapeHTML(application.father_name || "—")}
                            </p>

                            <p>
                                موبائل:
                                ${escapeHTML(application.phone || "—")}
                            </p>

                            <p>
                                قابلیت:
                                ${escapeHTML(application.qualification || "—")}
                            </p>

                            <p>
                                شناختی کارڈ:
                                ${escapeHTML(application.cnic || "—")}
                            </p>

                        </div>


                        <div class="teacher-card-buttons">

                            <button
                                type="button"
                                class="approve-teacher-application save-button"
                                data-id="${escapeHTML(application.id)}"
                            >
                                ✅ منظور کریں
                            </button>

                            <button
                                type="button"
                                class="reject-teacher-application delete-teacher"
                                data-id="${escapeHTML(application.id)}"
                            >
                                ❌ مسترد کریں
                            </button>

                        </div>

                    </div>
                `
            )
            .join("");


    container
        .querySelectorAll(
            ".approve-teacher-application"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        approveTeacherApplication(
                            button.dataset.id
                        );
                    }
                );
            }
        );


    container
        .querySelectorAll(
            ".reject-teacher-application"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        rejectTeacherApplication(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =====================================================
   APPROVE STUDENT APPLICATION
===================================================== */

async function approveStudentApplication(
    id
) {

    if (!requireAdmin()) {

        return;
    }


    const application =
        studentApplicationsCache.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!application) {

        alert(
            "درخواست نہیں ملی۔"
        );

        return;
    }


    if (
        !window.confirm(
            `${application.name} کی درخواست منظور کریں؟`
        )
    ) {

        return;
    }


    try {

        const studentData = {

            admission_no:
                application.admission_no ||
                `S-${Date.now()}`,

            admission_type:
                application.admission_type ||
                "نیا داخلہ",

            name:
                application.name,

            father_name:
                application.father_name,

            guardian_name:
                application.guardian_name,

            cnic:
                application.cnic,

            phone:
                application.phone,

            date_of_birth:
                application.date_of_birth,

            student_class:
                application.student_class,

            admission_date:
                todayDate(),

            address:
                application.address,

            residence_type:
                application.residence_type,

            previous_madrassa:
                application.previous_madrassa,

            transfer_date:
                application.transfer_date,

            mahrams:
                application.mahrams || []

        };


        const {
            error: insertError
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
                .insert([
                    studentData
                ]);


        if (insertError) {

            throw insertError;
        }


        const {
            error: updateError
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .update({

                    status:
                        "approved",

                    approved_at:
                        new Date()
                            .toISOString(),

                    approved_by:
                        getCurrentUsername()

                })
                .eq(
                    "id",
                    id
                );


        if (updateError) {

            throw updateError;
        }


        showMessage(
            getElement(
                "approvalMessage"
            ),
            "طالبہ کی درخواست منظور ہو گئی۔",
            "success"
        );


        await loadApprovals();


    } catch (error) {

        console.error(
            "Approve student error:",
            error
        );


        showMessage(
            getElement(
                "approvalMessage"
            ),
            "طالبہ کی درخواست منظور نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   REJECT STUDENT APPLICATION
===================================================== */

async function rejectStudentApplication(
    id
) {

    if (!requireAdmin()) {

        return;
    }


    if (
        !window.confirm(
            "کیا آپ اس درخواست کو مسترد کرنا چاہتے ہیں؟"
        )
    ) {

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .update({

                    status:
                        "rejected",

                    approved_at:
                        new Date()
                            .toISOString(),

                    approved_by:
                        getCurrentUsername()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;
        }


        await loadApprovals();


    } catch (error) {

        console.error(
            "Reject student error:",
            error
        );


        alert(
            "درخواست مسترد نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   APPROVE TEACHER APPLICATION
===================================================== */

async function approveTeacherApplication(
    id
) {

    if (!requireAdmin()) {

        return;
    }


    const application =
        teacherApplicationsCache.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!application) {

        alert(
            "درخواست نہیں ملی۔"
        );

        return;
    }


    if (
        !window.confirm(
            `${application.name} کی درخواست منظور کریں؟`
        )
    ) {

        return;
    }


    try {

        const teacherData = {

            teacher_code:
                application.teacher_code ||
                `T-${Date.now()}`,

            name:
                application.name,

            father_name:
                application.father_name,

            phone:
                application.phone,

            cnic:
                application.cnic,

            date_of_birth:
                application.date_of_birth,

            qualification:
                application.qualification,

            joining_date:
                todayDate(),

            address:
                application.address,

            status:
                "active"

        };


        const {
            error: insertError
        } =
            await supabaseClient
                .from(
                    TEACHERS_TABLE
                )
                .insert([
                    teacherData
                ]);


        if (insertError) {

            throw insertError;
        }


        const {
            error: updateError
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .update({

                    status:
                        "approved",

                    approved_at:
                        new Date()
                            .toISOString(),

                    approved_by:
                        getCurrentUsername()

                })
                .eq(
                    "id",
                    id
                );


        if (updateError) {

            throw updateError;
        }


        showMessage(
            getElement(
                "approvalMessage"
            ),
            "استاد کی درخواست منظور ہو گئی۔",
            "success"
        );


        await loadApprovals();


    } catch (error) {

        console.error(
            "Approve teacher error:",
            error
        );


        showMessage(
            getElement(
                "approvalMessage"
            ),
            "استاد کی درخواست منظور نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   REJECT TEACHER APPLICATION
===================================================== */

async function rejectTeacherApplication(
    id
) {

    if (!requireAdmin()) {

        return;
    }


    if (
        !window.confirm(
            "کیا آپ اس درخواست کو مسترد کرنا چاہتے ہیں؟"
        )
    ) {

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .update({

                    status:
                        "rejected",

                    approved_at:
                        new Date()
                            .toISOString(),

                    approved_by:
                        getCurrentUsername()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;
        }


        await loadApprovals();


    } catch (error) {

        console.error(
            "Reject teacher error:",
            error
        );


        alert(
            "درخواست مسترد نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   INITIALIZE APPROVALS
===================================================== */

async function initializeApprovalsPage() {

    if (!requireAdmin()) {

        return;
    }


    await loadApprovals();
}


/* =====================================================
   END PART 2 / 3
   PART 3 MUST BE PASTED DIRECTLY BELOW THIS
===================================================== */


/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   مدرسہ شہناز اختر للبنات

   SCRIPT.JS
   PART 3 / 3

   ATTENDANCE + ANNOUNCEMENTS + FEEDBACK
   DASHBOARD + SESSION + FINAL INITIALIZATION
===================================================== */


/* =====================================================
   ATTENDANCE STATE
===================================================== */

let attendanceStudentsCache = [];
let attendanceRecordsCache = [];


/* =====================================================
   ATTENDANCE HELPERS
===================================================== */

function getAttendanceDate() {

    return (
        getValue("attendanceDate") ||
        todayDate()
    );
}


function getAttendanceClass() {

    return getValue(
        "attendanceClass"
    );
}


function getAttendancePeriod() {

    const value =
        Number(
            getValue(
                "attendancePeriod"
            )
        );


    if (
        value < 1 ||
        value > DAILY_PERIODS
    ) {

        return 0;
    }


    return value;
}


/* =====================================================
   LOAD ATTENDANCE STUDENTS
===================================================== */

async function loadAttendanceStudents() {

    if (!checkSupabase()) {

        return;
    }


    const studentClass =
        getAttendanceClass();


    const container =
        getElement(
            "attendanceStudentsList"
        );


    if (!container) {

        return;
    }


    if (!studentClass) {

        container.innerHTML = `

            <div class="empty-students">
                پہلے کلاس منتخب کریں۔
            </div>
        `;

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
                .select("*")
                .eq(
                    "student_class",
                    studentClass
                )
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {

            throw error;
        }


        attendanceStudentsCache =
            data || [];


        await loadExistingAttendance();


    } catch (error) {

        console.error(
            "Attendance students error:",
            error
        );


        container.innerHTML = `

            <div class="empty-students">
                طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔
            </div>
        `;
    }
}


/* =====================================================
   LOAD EXISTING ATTENDANCE
===================================================== */

async function loadExistingAttendance() {

    const container =
        getElement(
            "attendanceStudentsList"
        );


    if (!container) {

        return;
    }


    const attendanceDate =
        getAttendanceDate();


    const studentClass =
        getAttendanceClass();


    const period =
        getAttendancePeriod();


    if (
        !attendanceDate ||
        !studentClass ||
        !period
    ) {

        renderAttendanceStudents(
            []
        );

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    ATTENDANCE_TABLE
                )
                .select("*")
                .eq(
                    "attendance_date",
                    attendanceDate
                )
                .eq(
                    "student_class",
                    studentClass
                )
                .eq(
                    "period_no",
                    period
                );


        if (error) {

            throw error;
        }


        attendanceRecordsCache =
            data || [];


        renderAttendanceStudents(
            attendanceStudentsCache
        );


    } catch (error) {

        console.error(
            "Existing attendance error:",
            error
        );


        attendanceRecordsCache = [];


        renderAttendanceStudents(
            attendanceStudentsCache
        );
    }
}


/* =====================================================
   RENDER ATTENDANCE STUDENTS
===================================================== */

function renderAttendanceStudents(
    students
) {

    const container =
        getElement(
            "attendanceStudentsList"
        );


    if (!container) {

        return;
    }


    if (!students.length) {

        container.innerHTML = `

            <div class="empty-students">
                اس کلاس میں کوئی طالبہ موجود نہیں۔
            </div>
        `;

        return;
    }


    container.innerHTML =
        students.map(
            student => {

                const existing =
                    attendanceRecordsCache.find(
                        record =>
                            String(
                                record.student_id
                            ) ===
                            String(
                                student.id
                            )
                    );


                const status =
                    existing?.status ||
                    "present";


                return `

                    <div
                        class="attendance-student-card"
                        data-student-id="${escapeHTML(student.id)}"
                    >

                        <div class="attendance-student-name">

                            <strong>
                                ${escapeHTML(student.name || "—")}
                            </strong>

                            <span>
                                ${escapeHTML(student.admission_no || "")}
                            </span>

                        </div>


                        <div class="attendance-options">

                            <label>

                                <input
                                    type="radio"
                                    name="attendance-${escapeHTML(student.id)}"
                                    value="present"
                                    ${status === "present" ? "checked" : ""}
                                >

                                حاضر

                            </label>


                            <label>

                                <input
                                    type="radio"
                                    name="attendance-${escapeHTML(student.id)}"
                                    value="absent"
                                    ${status === "absent" ? "checked" : ""}
                                >

                                غیر حاضر

                            </label>


                            <label>

                                <input
                                    type="radio"
                                    name="attendance-${escapeHTML(student.id)}"
                                    value="leave"
                                    ${status === "leave" ? "checked" : ""}
                                >

                                رخصت

                            </label>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


/* =====================================================
   SAVE ATTENDANCE
===================================================== */

async function saveAttendance() {

    if (
        !requireTeacherOrAdmin()
    ) {

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    const message =
        getElement(
            "attendanceMessage"
        );


    const attendanceDate =
        getAttendanceDate();


    const studentClass =
        getAttendanceClass();


    const period =
        getAttendancePeriod();


    if (
        !attendanceDate ||
        !studentClass ||
        !period
    ) {

        showMessage(
            message,
            "تاریخ، کلاس اور پیریڈ منتخب کریں۔"
        );

        return;
    }


    if (
        !attendanceStudentsCache.length
    ) {

        showMessage(
            message,
            "اس کلاس میں کوئی طالبہ موجود نہیں۔"
        );

        return;
    }


    const teacherId =
        getCurrentUserId();


    const teacherName =
        getCurrentUsername();


    const records =
        attendanceStudentsCache.map(
            student => {

                const selected =
                    document.querySelector(
                        `input[name="attendance-${student.id}"]:checked`
                    );


                return {

                    student_id:
                        student.id,

                    student_name:
                        student.name,

                    student_class:
                        studentClass,

                    attendance_date:
                        attendanceDate,

                    period_no:
                        period,

                    status:
                        selected?.value ||
                        "present",

                    teacher_id:
                        teacherId || null,

                    teacher_name:
                        teacherName || null

                };
            }
        );


    const button =
        getElement(
            "saveAttendanceButton"
        );


    try {

        if (button) {

            button.disabled = true;
        }


        clearMessage(
            message
        );


        const {
            error: deleteError
        } =
            await supabaseClient
                .from(
                    ATTENDANCE_TABLE
                )
                .delete()
                .eq(
                    "attendance_date",
                    attendanceDate
                )
                .eq(
                    "student_class",
                    studentClass
                )
                .eq(
                    "period_no",
                    period
                );


        if (deleteError) {

            throw deleteError;
        }


        const {
            error: insertError
        } =
            await supabaseClient
                .from(
                    ATTENDANCE_TABLE
                )
                .insert(
                    records
                );


        if (insertError) {

            throw insertError;
        }


        showMessage(
            message,
            "حاضری کامیابی سے محفوظ ہو گئی۔",
            "success"
        );


        await loadExistingAttendance();


    } catch (error) {

        console.error(
            "Save attendance error:",
            error
        );


        showMessage(
            message,
            "حاضری محفوظ نہیں ہو سکی۔"
        );


    } finally {

        if (button) {

            button.disabled = false;
        }
    }
}


/* =====================================================
   INITIALIZE ATTENDANCE PAGE
===================================================== */

async function initializeAttendancePage() {

    if (
        !requireTeacherOrAdmin()
    ) {

        return;
    }


    setValue(
        "attendanceDate",
        todayDate()
    );


    getElement(
        "attendanceClass"
    )?.addEventListener(
        "change",
        loadAttendanceStudents
    );


    getElement(
        "attendancePeriod"
    )?.addEventListener(
        "change",
        loadAttendanceStudents
    );


    getElement(
        "attendanceDate"
    )?.addEventListener(
        "change",
        loadAttendanceStudents
    );


    getElement(
        "loadAttendanceButton"
    )?.addEventListener(
        "click",
        loadAttendanceStudents
    );


    getElement(
        "saveAttendanceButton"
    )?.addEventListener(
        "click",
        saveAttendance
    );
}


/* =====================================================
   ANNOUNCEMENTS STATE
===================================================== */

let announcementsCache = [];


/* =====================================================
   LOAD ANNOUNCEMENTS
===================================================== */

async function loadAnnouncements() {

    if (!checkSupabase()) {

        return;
    }


    const container =
        getElement(
            "announcementsList"
        );


    if (!container) {

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    ANNOUNCEMENTS_TABLE
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;
        }


        announcementsCache =
            data || [];


        renderAnnouncements();


    } catch (error) {

        console.error(
            "Load announcements error:",
            error
        );


        container.innerHTML = `

            <div class="empty-students">
                اعلانات لوڈ نہیں ہو سکے۔
            </div>
        `;
    }
}


/* =====================================================
   RENDER ANNOUNCEMENTS
===================================================== */

function renderAnnouncements() {

    const container =
        getElement(
            "announcementsList"
        );


    if (!container) {

        return;
    }


    const role =
        getCurrentRole();


    let records =
        announcementsCache;


    if (
        role === ROLE_STUDENT
    ) {

        const studentClass =
            safeString(
                getCurrentUser()?.student_class
            );


        records =
            announcementsCache.filter(
                item =>
                    !item.student_class ||
                    item.student_class ===
                        studentClass
            );
    }


    if (!records.length) {

        container.innerHTML = `

            <div class="empty-students">
                ابھی کوئی اعلان موجود نہیں۔
            </div>
        `;

        return;
    }


    container.innerHTML =
        records.map(
            item => `

                <div class="announcement-card">

                    <div class="announcement-header">

                        <h3>
                            📢
                            ${escapeHTML(item.title || "اعلان")}
                        </h3>

                        <span>
                            ${escapeHTML(formatDate(item.created_at))}
                        </span>

                    </div>


                    <p>
                        ${escapeHTML(item.message || "")}
                    </p>


                    ${
                        item.student_class
                            ? `
                                <div class="announcement-class">
                                    کلاس:
                                    ${escapeHTML(item.student_class)}
                                </div>
                            `
                            : `
                                <div class="announcement-class">
                                    تمام طالبات
                                </div>
                            `
                    }


                    ${
                        item.created_by_name
                            ? `
                                <small>
                                    جاری کنندہ:
                                    ${escapeHTML(item.created_by_name)}
                                </small>
                            `
                            : ""
                    }


                    ${
                        role === ROLE_ADMIN
                            ? `
                                <button
                                    type="button"
                                    class="delete-announcement"
                                    data-id="${escapeHTML(item.id)}"
                                >
                                    حذف کریں
                                </button>
                            `
                            : ""
                    }

                </div>
            `
        ).join("");


    container
        .querySelectorAll(
            ".delete-announcement"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteAnnouncement(
                            button.dataset.id
                        );
                    }
                );
            }
        );
}


/* =====================================================
   SAVE ANNOUNCEMENT
===================================================== */

async function saveAnnouncement(
    event
) {

    event?.preventDefault();


    if (
        !requireTeacherOrAdmin()
    ) {

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    const title =
        getValue(
            "announcementTitle"
        );


    const messageText =
        getValue(
            "announcementText"
        ) ||
        getValue(
            "announcementMessage"
        );


    const studentClass =
        getValue(
            "announcementClass"
        ) || null;


    const message =
        getElement(
            "announcementFormMessage"
        );


    if (
        !title ||
        !messageText
    ) {

        showMessage(
            message,
            "عنوان اور اعلان لکھیں۔"
        );

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    ANNOUNCEMENTS_TABLE
                )
                .insert([{

                    title:
                        title,

                    message:
                        messageText,

                    student_class:
                        studentClass,

                    created_by:
                        getCurrentUserId() ||
                        null,

                    created_by_name:
                        getCurrentUsername() ||
                        null

                }]);


        if (error) {

            throw error;
        }


        showMessage(
            message,
            "اعلان کامیابی سے جاری ہو گیا۔",
            "success"
        );


        getElement(
            "announcementForm"
        )?.reset();


        await loadAnnouncements();


    } catch (error) {

        console.error(
            "Save announcement error:",
            error
        );


        showMessage(
            message,
            "اعلان محفوظ نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   DELETE ANNOUNCEMENT
===================================================== */

async function deleteAnnouncement(id) {

    if (!requireAdmin()) {

        return;
    }


    if (
        !window.confirm(
            "کیا آپ یہ اعلان حذف کرنا چاہتے ہیں؟"
        )
    ) {

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    ANNOUNCEMENTS_TABLE
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;
        }


        await loadAnnouncements();


    } catch (error) {

        console.error(
            "Delete announcement error:",
            error
        );


        alert(
            "اعلان حذف نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   INITIALIZE ANNOUNCEMENTS PAGE
===================================================== */

async function initializeAnnouncementsPage() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }


    const role =
        getCurrentRole();


    const form =
        getElement(
            "announcementForm"
        );


    if (
        role !== ROLE_ADMIN &&
        role !== ROLE_TEACHER
    ) {

        hideElement(
            form
        );
    }


    form?.addEventListener(
        "submit",
        saveAnnouncement
    );


    await loadAnnouncements();
}


/* =====================================================
   FEEDBACK STATE
===================================================== */

let feedbackCache = [];


/* =====================================================
   LOAD FEEDBACK
===================================================== */

async function loadFeedback() {

    if (!checkSupabase()) {

        return;
    }


    const container =
        getElement(
            "feedbackList"
        );


    if (!container) {

        return;
    }


    try {

        let query =
            supabaseClient
                .from(
                    FEEDBACK_TABLE
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        const role =
            getCurrentRole();


        if (
            role === ROLE_TEACHER
        ) {

            const teacherId =
                getCurrentUserId();


            if (teacherId) {

                query =
                    query.eq(
                        "teacher_id",
                        teacherId
                    );
            }
        }


        if (
            role === ROLE_STUDENT
        ) {

            const studentId =
                getCurrentUserId();


            if (studentId) {

                query =
                    query.eq(
                        "student_id",
                        studentId
                    );
            }
        }


        const {
            data,
            error
        } =
            await query;


        if (error) {

            throw error;
        }


        feedbackCache =
            data || [];


        renderFeedback();


    } catch (error) {

        console.error(
            "Load feedback error:",
            error
        );


        container.innerHTML = `

            <div class="empty-students">
                تاثرات لوڈ نہیں ہو سکے۔
            </div>
        `;
    }
}


/* =====================================================
   RENDER FEEDBACK
===================================================== */

function renderFeedback() {

    const container =
        getElement(
            "feedbackList"
        );


    if (!container) {

        return;
    }


    if (!feedbackCache.length) {

        container.innerHTML = `

            <div class="empty-students">
                ابھی کوئی تبصرہ موجود نہیں۔
            </div>
        `;

        return;
    }


    container.innerHTML =
        feedbackCache.map(
            item => `

                <div class="feedback-card">

                    <div class="feedback-tags">

                        <span>
                            طالبہ:
                            ${escapeHTML(item.student_name || "—")}
                        </span>

                        <span>
                            استاد:
                            ${escapeHTML(item.teacher_name || "—")}
                        </span>

                    </div>


                    ${
                        item.rating
                            ? `
                                <p>
                                    درجہ بندی:
                                    ${escapeHTML(item.rating)}
                                    / 5
                                </p>
                            `
                            : ""
                    }


                    <p>
                        ${escapeHTML(item.comment || "")}
                    </p>


                    <small>
                        ${escapeHTML(formatDate(item.created_at))}
                    </small>

                </div>
            `
        ).join("");
}


/* =====================================================
   SAVE FEEDBACK
===================================================== */

async function saveFeedback(
    event
) {

    event?.preventDefault();


    if (
        !requireTeacherOrAdmin()
    ) {

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    const studentId =
        getValue(
            "feedbackStudent"
        );


    const student =
        studentsCache.find(
            item =>
                String(item.id) ===
                String(studentId)
        );


    const comment =
        getValue(
            "feedbackComment"
        );


    const rating =
        Number(
            getValue(
                "feedbackRating"
            )
        ) || null;


    const message =
        getElement(
            "feedbackMessage"
        );


    if (
        !studentId ||
        !student ||
        !comment
    ) {

        showMessage(
            message,
            "طالبہ منتخب کریں اور تبصرہ لکھیں۔"
        );

        return;
    }


    if (
        rating !== null &&
        (
            rating < 1 ||
            rating > 5
        )
    ) {

        showMessage(
            message,
            "درجہ بندی 1 سے 5 تک ہونی چاہیے۔"
        );

        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    FEEDBACK_TABLE
                )
                .insert([{

                    student_id:
                        student.id,

                    student_name:
                        student.name,

                    teacher_id:
                        getCurrentUserId() ||
                        null,

                    teacher_name:
                        getCurrentUsername() ||
                        null,

                    rating:
                        rating,

                    comment:
                        comment

                }]);


        if (error) {

            throw error;
        }


        showMessage(
            message,
            "تبصرہ کامیابی سے محفوظ ہو گیا۔",
            "success"
        );


        getElement(
            "feedbackForm"
        )?.reset();


        await loadFeedback();


    } catch (error) {

        console.error(
            "Save feedback error:",
            error
        );


        showMessage(
            message,
            "تبصرہ محفوظ نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   LOAD FEEDBACK STUDENTS
===================================================== */

async function loadFeedbackStudents() {

    const select =
        getElement(
            "feedbackStudent"
        );


    if (!select) {

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
                .select(
                    "id,name,student_class,admission_no"
                )
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {

            throw error;
        }


        studentsCache =
            data || [];


        select.innerHTML = `

            <option value="">
                طالبہ منتخب کریں
            </option>

            ${
                studentsCache.map(
                    student => `

                        <option
                            value="${escapeHTML(student.id)}"
                        >
                            ${escapeHTML(student.name)}
                            ${
                                student.student_class
                                    ? ` - ${escapeHTML(student.student_class)}`
                                    : ""
                            }
                        </option>
                    `
                ).join("")
            }
        `;


    } catch (error) {

        console.error(
            "Feedback students error:",
            error
        );
    }
}


/* =====================================================
   INITIALIZE FEEDBACK PAGE
===================================================== */

async function initializeFeedbackPage() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }


    const role =
        getCurrentRole();


    const form =
        getElement(
            "feedbackForm"
        );


    if (
        role === ROLE_ADMIN ||
        role === ROLE_TEACHER
    ) {

        await loadFeedbackStudents();


        form?.addEventListener(
            "submit",
            saveFeedback
        );

    } else {

        hideElement(
            form
        );
    }


    await loadFeedback();
}


/* =====================================================
   DASHBOARD COUNTS
===================================================== */

async function updateDashboardCounts() {

    if (!checkSupabase()) {

        return;
    }


    try {

        const [
            studentsResult,
            teachersResult
        ] =
            await Promise.all([

                supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    ),

                supabaseClient
                    .from(
                        TEACHERS_TABLE
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )

            ]);


        if (
            !studentsResult.error
        ) {

            setText(
                "studentTotal",
                studentsResult.count || 0
            );
        }


        if (
            !teachersResult.error
        ) {

            setText(
                "teacherTotal",
                teachersResult.count || 0
            );
        }


    } catch (error) {

        console.error(
            "Dashboard count error:",
            error
        );
    }
}


/* =====================================================
   DASHBOARD APPROVAL COUNT
===================================================== */

async function updatePendingApprovalCount() {

    if (
        getCurrentRole() !==
        ROLE_ADMIN
    ) {

        return;
    }


    if (!checkSupabase()) {

        return;
    }


    try {

        const [
            studentResult,
            teacherResult
        ] =
            await Promise.all([

                supabaseClient
                    .from(
                        STUDENT_APPLICATIONS_TABLE
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .eq(
                        "status",
                        "pending"
                    ),

                supabaseClient
                    .from(
                        TEACHER_APPLICATIONS_TABLE
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .eq(
                        "status",
                        "pending"
                    )

            ]);


        const total =
            (
                studentResult.count ||
                0
            ) +
            (
                teacherResult.count ||
                0
            );


        setText(
            "pendingApprovalTotal",
            total
        );


    } catch (error) {

        console.error(
            "Pending approval count error:",
            error
        );
    }
}


/* =====================================================
   DASHBOARD USER INFORMATION
===================================================== */

function showDashboardUser() {

    const user =
        getCurrentUser();


    if (!user) {

        return;
    }


    setText(
        "currentUserName",
        user.name ||
        user.username ||
        "صارف"
    );


    let roleText =
        "صارف";


    if (
        user.role ===
        ROLE_ADMIN
    ) {

        roleText =
            "ایڈمن";

    } else if (
        user.role ===
        ROLE_TEACHER
    ) {

        roleText =
            "استاد";

    } else if (
        user.role ===
        ROLE_STUDENT
    ) {

        roleText =
            "طالبہ";
    }


    setText(
        "currentUserRole",
        roleText
    );
}


/* =====================================================
   ROLE BASED DASHBOARD MENU
===================================================== */

function applyDashboardPermissions() {

    const role =
        getCurrentRole();


    document
        .querySelectorAll(
            "[data-admin-only]"
        )
        .forEach(
            element => {

                element.style.display =
                    role === ROLE_ADMIN
                        ? ""
                        : "none";
            }
        );


    document
        .querySelectorAll(
            "[data-teacher-only]"
        )
        .forEach(
            element => {

                element.style.display =
                    role === ROLE_TEACHER
                        ? ""
                        : "none";
            }
        );


    document
        .querySelectorAll(
            "[data-student-only]"
        )
        .forEach(
            element => {

                element.style.display =
                    role === ROLE_STUDENT
                        ? ""
                        : "none";
            }
        );


    document
        .querySelectorAll(
            "[data-teacher-admin]"
        )
        .forEach(
            element => {

                element.style.display =
                    (
                        role === ROLE_ADMIN ||
                        role === ROLE_TEACHER
                    )
                        ? ""
                        : "none";
            }
        );
}


/* =====================================================
   INITIALIZE DASHBOARD
===================================================== */

async function initializeDashboardPage() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }


    showDashboardUser();

    applyDashboardPermissions();


    await Promise.allSettled([

        updateDashboardCounts(),

        updatePendingApprovalCount()

    ]);
}


/* =====================================================
   PASSWORD VISIBILITY
===================================================== */

function initializePasswordToggles() {

    document
        .querySelectorAll(
            ".password-toggle, [data-password-toggle]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        let input = null;


                        const targetId =
                            button.dataset.target;


                        if (targetId) {

                            input =
                                getElement(
                                    targetId
                                );
                        }


                        if (!input) {

                            input =
                                button.parentElement
                                    ?.querySelector(
                                        'input[type="password"], input[data-password-field]'
                                    );
                        }


                        if (!input) {

                            return;
                        }


                        const hidden =
                            input.type ===
                            "password";


                        input.type =
                            hidden
                                ? "text"
                                : "password";


                        button.textContent =
                            hidden
                                ? "🙈"
                                : "👁️";
                    }
                );
            }
        );
}


/* =====================================================
   INPUT FORMATTERS
===================================================== */

function initializeInputFormatters() {

    const cnicIds = [

        "studentCNIC",
        "teacherCNIC",
        "loginCNIC"

    ];


    cnicIds.forEach(
        id => {

            const input =
                getElement(id);


            input?.addEventListener(
                "input",
                () => {

                    input.value =
                        formatCNIC(
                            input.value
                        );
                }
            );
        }
    );


    const phoneIds = [

        "phone",
        "studentPhone",
        "teacherPhone"

    ];


    phoneIds.forEach(
        id => {

            const input =
                getElement(id);


            input?.addEventListener(
                "input",
                () => {

                    input.value =
                        cleanDigits(
                            input.value
                        ).slice(
                            0,
                            11
                        );
                }
            );
        }
    );
}


/* =====================================================
   AUTO SAVE DRAFT
===================================================== */

function initializeDraftAutoSave() {

    if (
        getCurrentRole() !==
        ROLE_ADMIN
    ) {

        return;
    }


    const forms =
        document.querySelectorAll(
            "form[data-draft]"
        );


    forms.forEach(
        form => {

            const key =
                `madrassa_draft_${currentFile}_${form.id}`;


            try {

                const saved =
                    localStorage.getItem(
                        key
                    );


                if (saved) {

                    const data =
                        JSON.parse(
                            saved
                        );


                    Object.entries(
                        data
                    ).forEach(
                        ([name, value]) => {

                            const field =
                                form.elements[
                                    name
                                ];


                            if (!field) {

                                return;
                            }


                            if (
                                field.type ===
                                "checkbox"
                            ) {

                                field.checked =
                                    Boolean(value);

                            } else {

                                field.value =
                                    value ?? "";
                            }
                        }
                    );
                }


            } catch (error) {

                console.error(
                    "Draft restore error:",
                    error
                );
            }


            form.addEventListener(
                "input",
                () => {

                    const data = {};


                    Array.from(
                        form.elements
                    ).forEach(
                        field => {

                            if (
                                !field.name ||
                                field.type ===
                                "password"
                            ) {

                                return;
                            }


                            if (
                                field.type ===
                                "checkbox"
                            ) {

                                data[field.name] =
                                    field.checked;

                            } else {

                                data[field.name] =
                                    field.value;
                            }
                        }
                    );


                    localStorage.setItem(
                        key,
                        JSON.stringify(
                            data
                        )
                    );
                }
            );


            form.addEventListener(
                "submit",
                () => {

                    localStorage.removeItem(
                        key
                    );
                }
            );
        }
    );
}


/* =====================================================
   SESSION INACTIVITY
===================================================== */

let inactivityTimer = null;


function resetInactivityTimer() {

    if (
        !isAuthenticated()
    ) {

        return;
    }


    clearTimeout(
        inactivityTimer
    );


    inactivityTimer =
        setTimeout(
            () => {

                logoutUser(
                    true
                );

            },
            INACTIVITY_LIMIT
        );
}


function initializeInactivityLogout() {

    if (
        !isAuthenticated()
    ) {

        return;
    }


    const events = [

        "click",
        "touchstart",
        "keydown",
        "scroll"

    ];


    events.forEach(
        eventName => {

            document.addEventListener(
                eventName,
                resetInactivityTimer,
                {
                    passive: true
                }
            );
        }
    );


    resetInactivityTimer();
}


/* =====================================================
   LOGOUT BUTTONS
===================================================== */

function initializeLogoutButtons() {

    document
        .querySelectorAll(
            ".logout-button, [data-logout]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        logoutUser();
                    }
                );
            }
        );
}


/* =====================================================
   ESCAPE KEY MODALS
===================================================== */

function initializeEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;
            }


            closeStudentDetails();

            closeTeacherDetails();
        }
    );
}


/* =====================================================
   PAGE ROUTING
===================================================== */

async function initializeCurrentPage() {

    const page =
        currentFile;


    switch (page) {

        case "":
        case "index.html":

            initializeLoginPage();

            break;


        case "login.html":

            initializeLoginPage();

            break;


        case "admin.html":
        case "dashboard.html":

            await initializeDashboardPage();

            break;


        case "students.html":

            await initializeStudentsPage();

            break;


        case "teachers.html":

            await initializeTeachersPage();

            break;


        case "attendance.html":

            await initializeAttendancePage();

            break;


        case "announcements.html":

            await initializeAnnouncementsPage();

            break;


        case "feedback.html":

            await initializeFeedbackPage();

            break;


        case "approvals.html":

            await initializeApprovalsPage();

            break;


        case "student-application.html":

            initializeStudentApplicationPage();

            break;


        case "teacher-application.html":

            initializeTeacherApplicationPage();

            break;


        case "teacher.html":

            if (
                !requireRole(
                    ROLE_TEACHER
                )
            ) {

                return;
            }


            showDashboardUser();

            applyDashboardPermissions();

            break;


        case "student.html":

            if (
                !requireRole(
                    ROLE_STUDENT
                )
            ) {

                return;
            }


            showDashboardUser();

            applyDashboardPermissions();

            break;


        default:

            break;
    }
}


/* =====================================================
   GLOBAL INITIALIZATION
===================================================== */

async function initializeApplication() {

    try {

        initializePasswordToggles();

        initializeInputFormatters();

        initializeLogoutButtons();

        initializeEscapeKey();


        await initializeCurrentPage();


        initializeDraftAutoSave();

        initializeInactivityLogout();


    } catch (error) {

        console.error(
            "Application initialization error:",
            error
        );
    }
}


/* =====================================================
   DOM READY
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication
    );

} else {

    initializeApplication();
}


/* =====================================================
   GLOBAL FUNCTIONS FOR HTML BUTTONS
===================================================== */

window.openStudentForm =
    openStudentForm;

window.closeStudentForm =
    closeStudentForm;

window.addMahramField =
    addMahramField;

window.editStudent =
    editStudent;

window.deleteStudent =
    deleteStudent;

window.showStudentDetails =
    showStudentDetails;

window.closeStudentDetails =
    closeStudentDetails;


window.openTeacherForm =
    openTeacherForm;

window.closeTeacherForm =
    closeTeacherForm;

window.editTeacher =
    editTeacher;

window.deleteTeacher =
    deleteTeacher;

window.showTeacherDetails =
    showTeacherDetails;

window.closeTeacherDetails =
    closeTeacherDetails;


window.loadAttendanceStudents =
    loadAttendanceStudents;

window.saveAttendance =
    saveAttendance;


window.saveAnnouncement =
    saveAnnouncement;

window.deleteAnnouncement =
    deleteAnnouncement;


window.saveFeedback =
    saveFeedback;


window.approveStudentApplication =
    approveStudentApplication;

window.rejectStudentApplication =
    rejectStudentApplication;

window.approveTeacherApplication =
    approveTeacherApplication;

window.rejectTeacherApplication =
    rejectTeacherApplication;


window.logoutUser =
    logoutUser;


/* =====================================================
   END SCRIPT.JS
   PART 3 / 3
===================================================== */
