/* =====================================================
   FRONTEND PART 1
   SUPABASE CONNECTION
   ===================================================== */

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =====================================================
   CHECK SUPABASE CONNECTION
   ===================================================== */

async function checkSupabaseConnection() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        console.log(
            "Supabase connection successful"
        );

        return true;

    } catch (error) {

        console.error(
            "Supabase connection failed:",
            error
        );

        return false;
    }
}


/* =====================================================
   GET CURRENT SESSION
   ===================================================== */

async function getCurrentSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {

        console.error(
            "Session error:",
            error
        );

        return null;
    }

    return data.session || null;
}


/* =====================================================
   GET CURRENT USER
   ===================================================== */

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error) {

        console.error(
            "User error:",
            error
        );

        return null;
    }

    return data.user || null;
}


/* =====================================================
   INITIAL CONNECTION TEST
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await checkSupabaseConnection();

    }
);



/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   مدرسہ شہناز اختر للبنات

   SCRIPT.JS
   PART 1 / 3

   SUPABASE + SECURITY + LOGIN + DASHBOARD
   + GENERAL HELPERS
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
   SECURITY SETTINGS
===================================================== */

const SESSION_TIMEOUT =
    5 * 60 * 1000;

const MAX_MAHRAMS =
    5;

let inactivityTimer = null;


/* =====================================================
   PAGE
===================================================== */

function getCurrentPageName() {

    const path =
        window.location.pathname || "";

    let file =
        path
            .split("/")
            .pop()
            .trim()
            .toLowerCase();

    if (!file) {

        file = "index.html";
    }

    return file;
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


function setValue(id, value) {

    const element =
        getElement(id);

    if (!element) {

        return;
    }

    element.value =
        value ?? "";
}


function setText(id, value) {

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

    element.style.color =
        type === "success"
            ? "#16a34a"
            : type === "warning"
                ? "#d97706"
                : "#dc2626";
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

    } catch {

        return safeString(value);
    }
}


/* =====================================================
   URDU / PHONE / CNIC VALIDATION
===================================================== */

function isUrduText(value) {

    const text =
        safeString(value);

    if (!text) {

        return false;
    }

    return /^[\u0600-\u06FF\s۔،ءآأؤئۃٰ]+$/u.test(
        text
    );
}


function cleanDigits(value) {

    return safeString(value)
        .replace(/\D/g, "");
}


function formatCNIC(value) {

    const digits =
        cleanDigits(value)
            .slice(0, 13);

    if (digits.length <= 5) {

        return digits;
    }

    if (digits.length <= 12) {

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
        digits.slice(12, 13)
    );
}


function validCNIC(value) {

    return (
        cleanDigits(value).length === 13
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
   SESSION STORAGE
===================================================== */

function getSessionStorage() {

    const remembered =
        localStorage.getItem(
            "rememberMe"
        ) === "true";

    return remembered
        ? localStorage
        : sessionStorage;
}


function getStoredValue(key) {

    const sessionValue =
        sessionStorage.getItem(key);

    if (sessionValue !== null) {

        return sessionValue;
    }

    return localStorage.getItem(key);
}


function setSessionValue(
    key,
    value,
    remember = false
) {

    sessionStorage.removeItem(key);
    localStorage.removeItem(key);

    const storage =
        remember
            ? localStorage
            : sessionStorage;

    storage.setItem(
        key,
        String(value)
    );
}


/* =====================================================
   AUTHENTICATION
===================================================== */

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


function requireLogin() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return false;
    }

    return true;
}


function requireAdmin() {

    if (!requireLogin()) {

        return false;
    }

    if (
        getCurrentRole() !==
        "admin"
    ) {

        alert(
            "یہ کام صرف ایڈمن کر سکتا ہے۔"
        );

        return false;
    }

    return true;
}


/* =====================================================
   LOGOUT
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
}


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
   5 MINUTE INACTIVITY LOGOUT
===================================================== */

function updateLastActivity() {

    if (!isAuthenticated()) {

        return;
    }

    const storage =
        getSessionStorage();

    storage.setItem(
        "lastActivity",
        String(Date.now())
    );
}


function checkSessionTimeout() {

    if (!isAuthenticated()) {

        return;
    }

    const last =
        Number(
            getStoredValue(
                "lastActivity"
            )
        );

    if (
        last &&
        Date.now() - last >
            SESSION_TIMEOUT
    ) {

        logoutUser(
            "غیر فعالیت کی وجہ سے آپ کو لاگ آؤٹ کر دیا گیا ہے۔"
        );

        return;
    }

    updateLastActivity();
}


function resetInactivityTimer() {

    if (!isAuthenticated()) {

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


function initializeInactivitySecurity() {

    if (!isAuthenticated()) {

        return;
    }

    checkSessionTimeout();

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
   ROLE PAGE PROTECTION
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

    if (!isAuthenticated()) {

        redirectToLogin();

        return false;
    }

    const role =
        getCurrentRole();


    const adminOnlyPages = [

        "students.html",
        "teachers.html",
        "approvals.html"

    ];


    if (
        adminOnlyPages.includes(
            currentFile
        ) &&
        role !== "admin"
    ) {

        alert(
            "آپ کو اس صفحے کی اجازت نہیں ہے۔"
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

    const adminButton =
        getElement(
            "adminLoginButton"
        );

    const teacherButton =
        getElement(
            "teacherLoginButton"
        );

    const studentButton =
        getElement(
            "studentLoginButton"
        );


    if (adminButton) {

        adminButton.addEventListener(
            "click",
            () => {

                sessionStorage.setItem(
                    "selectedRole",
                    "admin"
                );

                window.location.href =
                    "login.html";
            }
        );
    }


    if (teacherButton) {

        teacherButton.addEventListener(
            "click",
            () => {

                sessionStorage.setItem(
                    "selectedRole",
                    "teacher"
                );

                window.location.href =
                    "login.html";
            }
        );
    }


    if (studentButton) {

        studentButton.addEventListener(
            "click",
            () => {

                sessionStorage.setItem(
                    "selectedRole",
                    "student"
                );

                window.location.href =
                    "login.html";
            }
        );
    }
}


/* =====================================================
   PASSWORD VISIBILITY
===================================================== */

function initializePasswordToggle() {

    const password =
        getElement(
            "password"
        );

    const toggle =
        getElement(
            "togglePassword"
        );

    if (
        !password ||
        !toggle
    ) {

        return;
    }


    toggle.addEventListener(
        "click",
        () => {

            const hidden =
                password.type ===
                "password";

            password.type =
                hidden
                    ? "text"
                    : "password";

            toggle.textContent =
                hidden
                    ? "🙈"
                    : "👁️";
        }
    );
}


/* =====================================================
   LOGIN
===================================================== */

async function handleLogin() {

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


    clearMessage(message);


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


    if (!checkSupabase()) {

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

            button.disabled = true;
        }


        /*
         * Login is read from profiles.
         *
         * IMPORTANT:
         * Database RLS must protect this table.
         * Secret/service_role key must NEVER
         * be placed in this browser file.
         */

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
                )
                .limit(1);


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
            await query.maybeSingle();


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


        /*
         * This comparison supports the current
         * project structure only.
         *
         * Real password verification should be
         * handled through Supabase Auth/server-side
         * password hashing rather than exposing
         * password hashes to the browser.
         */

        const storedPassword =
            safeString(
                data.password_hash
            );


        if (
            storedPassword !==
            password
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

            button.disabled = false;
        }
    }
}


/* =====================================================
   LOGIN PAGE INITIALIZATION
===================================================== */

function initializeLoginPage() {

    initializePasswordToggle();


    const loginButton =
        getElement(
            "loginButton"
        );

    const loginForm =
        getElement(
            "loginForm"
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


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            handleLogin
        );
    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                handleLogin();
            }
        );
    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";
            }
        );
    }
}


/* =====================================================
   DASHBOARD COUNTS
===================================================== */

async function updateDashboardStudentCount() {

    const element =
        getElement(
            "studentTotal"
        );

    if (
        !element ||
        !checkSupabase()
    ) {

        return;
    }


    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            throw error;
        }


        element.textContent =
            Number.isFinite(count)
                ? count
                : 0;


    } catch (error) {

        console.error(
            "Student count error:",
            error
        );

        element.textContent =
            "0";
    }
}


async function updateDashboardTeacherCount() {

    const element =
        getElement(
            "teacherTotal"
        );

    if (
        !element ||
        !checkSupabase()
    ) {

        return;
    }


    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from(
                    TEACHERS_TABLE
                )
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            throw error;
        }


        element.textContent =
            Number.isFinite(count)
                ? count
                : 0;


    } catch (error) {

        console.error(
            "Teacher count error:",
            error
        );

        element.textContent =
            "0";
    }
}


async function updateDashboardHostelCount() {

    const element =
        getElement(
            "hostelTotal"
        );

    if (
        !element ||
        !checkSupabase()
    ) {

        return;
    }


    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "residence_type",
                    "ہاسٹل"
                );


        if (error) {

            throw error;
        }


        element.textContent =
            Number.isFinite(count)
                ? count
                : 0;


    } catch (error) {

        console.error(
            "Hostel count error:",
            error
        );

        element.textContent =
            "0";
    }
}


async function updateDashboardClassCount() {

    const element =
        getElement(
            "classTotal"
        );

    if (
        !element ||
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
                .select(
                    "student_class"
                );


        if (error) {

            throw error;
        }


        const classes =
            new Set(
                (data || [])
                    .map(
                        item =>
                            safeString(
                                item.student_class
                            )
                    )
                    .filter(Boolean)
            );


        element.textContent =
            classes.size;


    } catch (error) {

        console.error(
            "Class count error:",
            error
        );

        element.textContent =
            "0";
    }
}


/* =====================================================
   DASHBOARD MENU
===================================================== */

function initializeDashboardMenu() {

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

                    window.location.href =
                        page;
                }
            );
        }
    );
}


/* =====================================================
   GLOBAL LOGOUT BUTTON
===================================================== */

function initializeLogoutButton() {

    const button =
        getElement(
            "logoutButton"
        );

    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        () => {

            logoutUser();
        }
    );
}


/* =====================================================
   BACK TO DASHBOARD
===================================================== */

function initializeBackToDashboard() {

    const button =
        getElement(
            "backToDashboard"
        );

    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "dashboard.html";
        }
    );
}


/* =====================================================
   DASHBOARD
===================================================== */

async function initializeDashboardPage() {

    if (!requireLogin()) {

        return;
    }


    const username =
        getCurrentUsername();

    const welcome =
        getElement(
            "welcomeMessage"
        );


    if (
        welcome &&
        username
    ) {

        welcome.textContent =
            `خوش آمدید، ${username}`;
    }


    initializeDashboardMenu();


    await Promise.allSettled([

        updateDashboardStudentCount(),

        updateDashboardTeacherCount(),

        updateDashboardHostelCount(),

        updateDashboardClassCount()

    ]);
}


/* =====================================================
   GLOBAL INPUT FORMATTERS
===================================================== */

function initializeInputFormatters() {

    const cnicFields = [

        "studentCNIC",
        "teacherCNIC",
        "applicationCNIC",
        "applicantCNIC"

    ];


    cnicFields.forEach(
        id => {

            const element =
                getElement(id);

            if (!element) {

                return;
            }


            element.addEventListener(
                "input",
                () => {

                    element.value =
                        formatCNIC(
                            element.value
                        );
                }
            );
        }
    );


    const phoneFields = [

        "phone",
        "studentPhone",
        "teacherPhone",
        "applicationPhone",
        "applicantPhone"

    ];


    phoneFields.forEach(
        id => {

            const element =
                getElement(id);

            if (!element) {

                return;
            }


            element.addEventListener(
                "input",
                () => {

                    element.value =
                        cleanDigits(
                            element.value
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
   GLOBAL ERROR SAFETY
===================================================== */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Global error:",
            event.error ||
            event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );
    }
);


/* =====================================================
   END OF PART 1 / 3

   DO NOT ADD ANOTHER script.js FILE.
   PART 2 MUST BE PASTED DIRECTLY BELOW THIS PART.
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 2 / 3

   STUDENTS + TEACHERS
   APPLICATIONS + ADMIN APPROVALS
===================================================== */


/* =====================================================
   STUDENT ELEMENTS / STATE
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
   STUDENT FORM
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

    if (type === "منتقلی") {

        showElement(previous);
        showElement(transfer);

    } else {

        hideElement(previous);
        hideElement(transfer);

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
        residence ===
        "ہاسٹل"
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
   STUDENT DATA
===================================================== */

function getStudentFormData() {

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
            getValue(
                "residenceType"
            ),

        previous_madrassa:
            getValue(
                "previousMadrassa"
            ) || null,

        transfer_date:
            getValue(
                "transferDate"
            ) || null,

        mahrams:
            getValue(
                "residenceType"
            ) === "ہاسٹل"
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
                                ${escapeHTML(student.admission_no)}
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
            button.disabled = true;
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
            button.disabled = false;
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
                addMahramField
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

                    <p>
                        <strong>
                            محرم ${index + 1}:
                        </strong>
                        ${escapeHTML(mahram.name)}
                        —
                        ${escapeHTML(mahram.relation)}
                        —
                        ${escapeHTML(mahram.phone)}
                    </p>

                `
            ).join("")
            : "<p>کوئی محرم درج نہیں۔</p>";


    studentDetailsContent.innerHTML = `

        <h3>
            بنیادی معلومات
        </h3>

        <p>
            <strong>نام:</strong>
            ${escapeHTML(student.name)}
        </p>

        <p>
            <strong>والد:</strong>
            ${escapeHTML(student.father_name)}
        </p>

        <p>
            <strong>سرپرست:</strong>
            ${escapeHTML(student.guardian_name)}
        </p>

        <p>
            <strong>شناختی کارڈ:</strong>
            ${escapeHTML(student.cnic)}
        </p>

        <p>
            <strong>موبائل:</strong>
            ${escapeHTML(student.phone)}
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
            ${escapeHTML(student.admission_no)}
        </p>

        <p>
            <strong>داخلہ:</strong>
            ${escapeHTML(student.admission_type)}
        </p>

        <p>
            <strong>کلاس:</strong>
            ${escapeHTML(student.student_class)}
        </p>

        <p>
            <strong>داخلہ تاریخ:</strong>
            ${escapeHTML(formatDate(student.admission_date))}
        </p>

        <p>
            <strong>رہائش:</strong>
            ${escapeHTML(student.residence_type)}
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHTML(student.address)}
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
                    student.admission_no,
                    student.phone,
                    student.student_class

                ]
                    .map(safeString)
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
        () => addMahramField()
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
   TEACHERS
===================================================== */

let teachersCache = [];
let editingTeacherId = null;

const teacherForm =
    getElement("teacherForm");

const teacherFormContainer =
    getElement("teacherFormContainer");

const teacherFormMessage =
    getElement("teacherFormMessage");

const teacherList =
    getElement("teacherList");

const teacherSearch =
    getElement("teacherSearch");

const teacherDetailsOverlay =
    getElement("teacherDetailsOverlay");

const teacherDetailsContent =
    getElement("teacherDetailsContent");


/* =====================================================
   TEACHER FORM
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
}


function closeTeacherForm() {

    editingTeacherId = null;

    teacherForm?.reset();

    hideElement(
        teacherFormContainer
    );

    clearMessage(
        teacherFormMessage
    );
}


/* =====================================================
   TEACHER DATA
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

        qualification:
            getValue(
                "teacherQualification"
            ),

        joining_date:
            getValue(
                "teacherJoiningDate"
            ) || null,

        address:
            getValue(
                "teacherAddress"
            ),

        status:
            "active"

    };
}


function validateTeacherData(
    data
) {

    if (
        !data.teacher_code ||
        !data.name
    ) {

        return {
            valid: false,
            message:
                "استاد کا کوڈ اور نام ضروری ہیں۔"
        };
    }


    if (
        data.phone &&
        !validPhone(
            data.phone
        )
    ) {

        return {
            valid: false,
            message:
                "موبائل نمبر درست درج کریں۔"
        };
    }


    if (
        data.cnic &&
        !validCNIC(
            data.cnic
        )
    ) {

        return {
            valid: false,
            message:
                "شناختی کارڈ نمبر درست درج کریں۔"
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
        teachers.length
    );


    setText(
        "activeTeacherTotal",
        teachers.filter(
            teacher =>
                safeString(
                    teacher.status
                ).toLowerCase() ===
                "active"
        ).length
    );


    setText(
        "pendingTeacherTotal",
        teachers.filter(
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

                <div class="teacher-card">

                    <h3>
                        👩‍🏫
                        ${escapeHTML(teacher.name)}
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


    try {

        const button =
            getElement(
                "saveTeacherButton"
            );


        if (button) {
            button.disabled = true;
        }


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
                ? "استاد کا ریکارڈ تبدیل ہو گیا۔"
                : "نیا استاد شامل ہو گیا۔",
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

        const button =
            getElement(
                "saveTeacherButton"
            );

        if (button) {
            button.disabled = false;
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
        "teacherQualification",
        teacher.qualification
    );

    setValue(
        "teacherJoiningDate",
        teacher.joining_date
    );

    setValue(
        "teacherAddress",
        teacher.address
    );


    setText(
        "teacherFormTitle",
        "استاد کا ریکارڈ تبدیل کریں"
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


    const teacher =
        teachersCache.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!teacher) {
        return;
    }


    if (
        !window.confirm(
            `کیا آپ واقعی ${teacher.name} کا ریکارڈ حذف کرنا چاہتے ہیں؟`
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


    teacherDetailsContent.innerHTML = `

        <h3>
            بنیادی معلومات
        </h3>

        <p>
            <strong>نام:</strong>
            ${escapeHTML(teacher.name)}
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
            <strong>قابلیت:</strong>
            ${escapeHTML(teacher.qualification || "—")}
        </p>

        <p>
            <strong>تقرری:</strong>
            ${escapeHTML(formatDate(teacher.joining_date))}
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHTML(teacher.address || "—")}
        </p>
    `;


    showElement(
        teacherDetailsOverlay
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeTeacherDetails() {

    hideElement(
        teacherDetailsOverlay
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


    renderTeachers(
        teachersCache.filter(
            teacher => {

                const text = [

                    teacher.name,
                    teacher.teacher_code,
                    teacher.phone,
                    teacher.cnic,
                    teacher.qualification

                ]
                    .map(safeString)
                    .join(" ")
                    .toLowerCase();


                return text.includes(
                    query
                );
            }
        )
    );
}


/* =====================================================
   INITIALIZE TEACHERS
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
            getValue(
                "residenceType"
            ),

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
            getValue(
                "residenceType"
            ) === "ہاسٹل"
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
            button.disabled = true;
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
            button.disabled = false;
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
        !application.phone ||
        !application.cnic ||
        !application.qualification
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
            button.disabled = true;
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
            button.disabled = false;
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
        () => addMahramField()
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
   APPROVALS
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


        if (studentsResult.error) {
            throw studentsResult.error;
        }


        if (teachersResult.error) {
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
                            ${escapeHTML(application.name)}
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
                            ${escapeHTML(application.name)}
                        </h3>

                        <div class="teacher-card-info">

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

        /*
         * Application is converted into
         * an active student record.
         */

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
   END OF PART 2 / 3

   PASTE PART 3 DIRECTLY BELOW THIS.
===================================================== */



/* =====================================================
   SCRIPT.JS
   PART 3 / 3

   ATTENDANCE
   DASHBOARD
   NAVIGATION
   LOGIN EVENTS
   PAGE INITIALIZATION
   SECURITY / SESSION
===================================================== */


/* =====================================================
   ATTENDANCE STATE
===================================================== */

let attendanceStudentsCache = [];
let attendanceRecordsCache = [];
let attendanceDraft = {};


/* =====================================================
   ATTENDANCE ELEMENTS
===================================================== */

const attendanceClass =
    getElement("attendanceClass");

const attendanceDate =
    getElement("attendanceDate");

const attendancePeriod =
    getElement("attendancePeriod");

const attendanceStudentsList =
    getElement("attendanceStudentsList");

const attendanceMessage =
    getElement("attendanceMessage");

const attendanceRecordsList =
    getElement("attendanceRecordsList");


/* =====================================================
   ATTENDANCE DATE
===================================================== */

function setDefaultAttendanceDate() {

    if (
        attendanceDate &&
        !attendanceDate.value
    ) {

        attendanceDate.value =
            todayDate();
    }
}


/* =====================================================
   LOAD STUDENTS FOR ATTENDANCE
===================================================== */

async function loadAttendanceStudents() {

    if (!checkSupabase()) {
        return;
    }


    const selectedClass =
        safeString(
            attendanceClass?.value
        );


    if (!selectedClass) {

        attendanceStudentsCache = [];

        if (attendanceStudentsList) {

            attendanceStudentsList.innerHTML = `

                <div class="empty-students">
                    پہلے کلاس منتخب کریں۔
                </div>
            `;
        }

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(STUDENTS_TABLE)
                .select("*")
                .eq(
                    "student_class",
                    selectedClass
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


        attendanceDraft = {};


        attendanceStudentsCache
            .forEach(
                student => {

                    attendanceDraft[
                        String(student.id)
                    ] = "present";
                }
            );


        renderAttendanceStudents();


    } catch (error) {

        console.error(
            "Attendance students error:",
            error
        );


        showMessage(
            attendanceMessage,
            "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   RENDER ATTENDANCE STUDENTS
===================================================== */

function renderAttendanceStudents() {

    if (!attendanceStudentsList) {
        return;
    }


    if (
        !attendanceStudentsCache.length
    ) {

        attendanceStudentsList.innerHTML = `

            <div class="empty-students">
                اس کلاس میں کوئی طالبہ موجود نہیں۔
            </div>
        `;

        return;
    }


    attendanceStudentsList.innerHTML =
        attendanceStudentsCache
            .map(
                student => {

                    const status =
                        attendanceDraft[
                            String(student.id)
                        ] || "present";


                    return `

                        <div
                            class="attendance-student-row"
                            data-student-id="${escapeHTML(student.id)}"
                        >

                            <div class="attendance-student-info">

                                <h3>
                                    ${escapeHTML(student.name)}
                                </h3>

                                <p>
                                    داخلہ نمبر:
                                    ${escapeHTML(student.admission_no || "—")}
                                </p>

                                <p>
                                    کلاس:
                                    ${escapeHTML(student.student_class || "—")}
                                </p>

                            </div>


                            <div class="attendance-options">

                                <button
                                    type="button"
                                    class="
                                        attendance-status-button
                                        present
                                        ${status === "present" ? "active" : ""}
                                    "
                                    data-status="present"
                                    data-id="${escapeHTML(student.id)}"
                                >
                                    حاضر
                                </button>


                                <button
                                    type="button"
                                    class="
                                        attendance-status-button
                                        absent
                                        ${status === "absent" ? "active" : ""}
                                    "
                                    data-status="absent"
                                    data-id="${escapeHTML(student.id)}"
                                >
                                    غیر حاضر
                                </button>


                                <button
                                    type="button"
                                    class="
                                        attendance-status-button
                                        leave
                                        ${status === "leave" ? "active" : ""}
                                    "
                                    data-status="leave"
                                    data-id="${escapeHTML(student.id)}"
                                >
                                    رخصت
                                </button>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");


    attendanceStudentsList
        .querySelectorAll(
            ".attendance-status-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            String(
                                button.dataset.id
                            );

                        const status =
                            button.dataset.status;


                        attendanceDraft[id] =
                            status;


                        const row =
                            button.closest(
                                ".attendance-student-row"
                            );


                        row
                            ?.querySelectorAll(
                                ".attendance-status-button"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );
                                }
                            );


                        button.classList.add(
                            "active"
                        );
                    }
                );
            }
        );
}


/* =====================================================
   MARK ALL ATTENDANCE
===================================================== */

function markAllAttendance(
    status
) {

    attendanceStudentsCache
        .forEach(
            student => {

                attendanceDraft[
                    String(student.id)
                ] = status;
            }
        );


    renderAttendanceStudents();
}


/* =====================================================
   SAVE ATTENDANCE
===================================================== */

async function saveAttendance() {

    if (!isAuthenticated()) {

        redirectToLogin();
        return;
    }


    const selectedClass =
        safeString(
            attendanceClass?.value
        );


    const selectedDate =
        safeString(
            attendanceDate?.value
        );


    const selectedPeriod =
        safeString(
            attendancePeriod?.value
        );


    if (
        !selectedClass ||
        !selectedDate ||
        !selectedPeriod
    ) {

        showMessage(
            attendanceMessage,
            "کلاس، تاریخ اور پیریڈ منتخب کریں۔"
        );

        return;
    }


    if (
        !attendanceStudentsCache.length
    ) {

        showMessage(
            attendanceMessage,
            "حاضری کے لیے کوئی طالبہ موجود نہیں۔"
        );

        return;
    }


    if (!checkSupabase()) {
        return;
    }


    const saveButton =
        getElement(
            "saveAttendanceButton"
        );


    try {

        if (saveButton) {
            saveButton.disabled = true;
        }


        clearMessage(
            attendanceMessage
        );


        const teacherIdentifier =
            getCurrentUsername();


        const records =
            attendanceStudentsCache
                .map(
                    student => ({

                        student_id:
                            student.id,

                        student_name:
                            student.name,

                        student_class:
                            selectedClass,

                        attendance_date:
                            selectedDate,

                        period_no:
                            selectedPeriod,

                        status:
                            attendanceDraft[
                                String(student.id)
                            ] || "present",

                        marked_by:
                            teacherIdentifier

                    })
                );


        /*
         * Delete the old attendance for the same
         * class/date/period before saving again.
         *
         * Database RLS must still restrict who is
         * allowed to perform this operation.
         */

        const {
            error: deleteError
        } =
            await supabaseClient
                .from(
                    ATTENDANCE_TABLE
                )
                .delete()
                .eq(
                    "student_class",
                    selectedClass
                )
                .eq(
                    "attendance_date",
                    selectedDate
                )
                .eq(
                    "period_no",
                    selectedPeriod
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
            attendanceMessage,
            "حاضری کامیابی سے محفوظ ہو گئی۔",
            "success"
        );


        await loadAttendanceRecords();


    } catch (error) {

        console.error(
            "Save attendance error:",
            error
        );


        showMessage(
            attendanceMessage,
            "حاضری محفوظ نہیں ہو سکی۔"
        );


    } finally {

        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}


/* =====================================================
   LOAD ATTENDANCE RECORDS
===================================================== */

async function loadAttendanceRecords() {

    if (
        !attendanceRecordsList ||
        !checkSupabase()
    ) {

        return;
    }


    try {

        let query =
            supabaseClient
                .from(
                    ATTENDANCE_TABLE
                )
                .select("*")
                .order(
                    "attendance_date",
                    {
                        ascending: false
                    }
                );


        if (
            attendanceClass?.value
        ) {

            query =
                query.eq(
                    "student_class",
                    attendanceClass.value
                );
        }


        if (
            attendanceDate?.value
        ) {

            query =
                query.eq(
                    "attendance_date",
                    attendanceDate.value
                );
        }


        const {
            data,
            error
        } =
            await query;


        if (error) {
            throw error;
        }


        attendanceRecordsCache =
            data || [];


        renderAttendanceRecords();


    } catch (error) {

        console.error(
            "Load attendance records error:",
            error
        );


        attendanceRecordsList.innerHTML = `

            <div class="empty-students">
                حاضری کا ریکارڈ لوڈ نہیں ہو سکا۔
            </div>
        `;
    }
}


/* =====================================================
   RENDER ATTENDANCE RECORDS
===================================================== */

function renderAttendanceRecords() {

    if (!attendanceRecordsList) {
        return;
    }


    if (
        !attendanceRecordsCache.length
    ) {

        attendanceRecordsList.innerHTML = `

            <div class="empty-students">
                ابھی کوئی حاضری ریکارڈ موجود نہیں۔
            </div>
        `;

        return;
    }


    const grouped = {};


    attendanceRecordsCache
        .forEach(
            record => {

                const key = [
                    record.attendance_date,
                    record.student_class,
                    record.period_no
                ].join("|");


                if (!grouped[key]) {

                    grouped[key] = {

                        date:
                            record.attendance_date,

                        studentClass:
                            record.student_class,

                        period:
                            record.period_no,

                        records: []

                    };
                }


                grouped[key].records.push(
                    record
                );
            }
        );


    attendanceRecordsList.innerHTML =
        Object.values(grouped)
            .map(
                group => {

                    const present =
                        group.records.filter(
                            record =>
                                record.status ===
                                "present"
                        ).length;


                    const absent =
                        group.records.filter(
                            record =>
                                record.status ===
                                "absent"
                        ).length;


                    const leave =
                        group.records.filter(
                            record =>
                                record.status ===
                                "leave"
                        ).length;


                    return `

                        <div class="attendance-record-card">

                            <h3>
                                ${escapeHTML(group.studentClass)}
                            </h3>

                            <p>
                                تاریخ:
                                ${escapeHTML(formatDate(group.date))}
                            </p>

                            <p>
                                پیریڈ:
                                ${escapeHTML(group.period)}
                            </p>


                            <div class="attendance-summary-line">

                                <span>
                                    حاضر:
                                    ${present}
                                </span>

                                <span>
                                    غیر حاضر:
                                    ${absent}
                                </span>

                                <span>
                                    رخصت:
                                    ${leave}
                                </span>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =====================================================
   INITIALIZE ATTENDANCE
===================================================== */

async function initializeAttendancePage() {

    if (!isAuthenticated()) {

        redirectToLogin();
        return;
    }


    setDefaultAttendanceDate();


    attendanceClass
        ?.addEventListener(
            "change",
            async () => {

                await loadAttendanceStudents();
                await loadAttendanceRecords();
            }
        );


    attendanceDate
        ?.addEventListener(
            "change",
            loadAttendanceRecords
        );


    getElement(
        "markAllPresent"
    )?.addEventListener(
        "click",
        () =>
            markAllAttendance(
                "present"
            )
    );


    getElement(
        "markAllAbsent"
    )?.addEventListener(
        "click",
        () =>
            markAllAttendance(
                "absent"
            )
    );


    getElement(
        "saveAttendanceButton"
    )?.addEventListener(
        "click",
        saveAttendance
    );


    await loadAttendanceRecords();
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
                        "id,residence_type"
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


        /*
         * Six classes are currently configured
         * in the attendance system.
         */

        setText(
            "classTotal",
            "6"
        );


    } catch (error) {

        console.error(
            "Dashboard counts error:",
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


    if (role === "admin") {

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
   DASHBOARD ROLE SECURITY
===================================================== */

function applyDashboardPermissions() {

    const role =
        getCurrentRole();


    const teachersMenu =
        getElement(
            "teachersMenu"
        );


    const approvalsMenu =
        getElement(
            "approvalsMenu"
        );


    /*
     * Only admin can access teacher management
     * and approval management.
     */

    if (
        role !== "admin"
    ) {

        if (teachersMenu) {
            teachersMenu.style.display =
                "none";
        }


        if (approvalsMenu) {
            approvalsMenu.style.display =
                "none";
        }
    }
}


/* =====================================================
   MENU NAVIGATION
===================================================== */

function initializeDashboardNavigation() {

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
                            button.dataset.page;


                        const destination =
                            pages[page];


                        if (!destination) {

                            alert(
                                "یہ حصہ ابھی تیار نہیں کیا گیا۔"
                            );

                            return;
                        }


                        if (
                            page === "teachers" &&
                            !isAdmin()
                        ) {

                            alert(
                                "یہ حصہ صرف ایڈمن کے لیے ہے۔"
                            );

                            return;
                        }


                        if (
                            page === "approvals" &&
                            !isAdmin()
                        ) {

                            alert(
                                "منظوری کا حصہ صرف ایڈمن کے لیے ہے۔"
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
   INITIALIZE DASHBOARD
===================================================== */

async function initializeDashboardPage() {

    if (!isAuthenticated()) {

        redirectToLogin();
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
   HOME PAGE BUTTONS
===================================================== */

function initializeHomePage() {

    getElement(
        "adminLoginButton"
    )?.addEventListener(
        "click",
        () => {

            sessionStorage.setItem(
                "requestedRole",
                "admin"
            );

            window.location.href =
                "login.html";
        }
    );


    getElement(
        "teacherLoginButton"
    )?.addEventListener(
        "click",
        () => {

            sessionStorage.setItem(
                "requestedRole",
                "teacher"
            );

            window.location.href =
                "login.html";
        }
    );


    getElement(
        "studentLoginButton"
    )?.addEventListener(
        "click",
        () => {

            sessionStorage.setItem(
                "requestedRole",
                "student"
            );

            window.location.href =
                "login.html";
        }
    );


    /*
     * Public application buttons.
     * These work when the corresponding IDs
     * exist in index.html.
     */

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


            button.setAttribute(
                "aria-label",
                hidden
                    ? "پاس ورڈ چھپائیں"
                    : "پاس ورڈ دکھائیں"
            );
        }
    );
}


/* =====================================================
   LOGIN BUTTON
===================================================== */

function initializeLoginPage() {

    const loginForm =
        getElement(
            "loginForm"
        );


    const loginButton =
        getElement(
            "loginButton"
        );


    if (
        !loginForm ||
        !loginButton
    ) {

        return;
    }


    /*
     * Prevent the browser's default form
     * submission.
     */

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            performLogin();
        }
    );


    loginButton.addEventListener(
        "click",
        performLogin
    );


    initializePasswordToggle();
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
                    logoutUser
                );
            }
        );
}


/* =====================================================
   CNIC / PHONE INPUT FORMATTERS
===================================================== */

function initializeInputFormatters() {

    const cnicIds = [

        "studentCNIC",
        "teacherCNIC"

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
   SESSION ACTIVITY
===================================================== */

let inactivityTimer = null;


/* =====================================================
   RESET INACTIVITY TIMER
===================================================== */

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


    /*
     * Five minute inactivity logout.
     */

    inactivityTimer =
        setTimeout(
            () => {

                alert(
                    "غیر فعالیت کی وجہ سے آپ کا سیشن ختم ہو گیا ہے۔"
                );

                logoutUser();

            },
            5 * 60 * 1000
        );
}


/* =====================================================
   ACTIVITY LISTENERS
===================================================== */

function initializeInactivityProtection() {

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
   PROTECT PRIVATE PAGES
===================================================== */

function protectCurrentPage() {

    const publicPages = [

        "",
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


    /*
     * Admin-only pages.
     */

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
   KEYBOARD MODAL CLOSE
===================================================== */

function initializeKeyboardEvents() {

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
   GLOBAL ERROR HANDLER
===================================================== */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Global JavaScript error:",
            event.error ||
            event.message
        );
    }
);


/* =====================================================
   UNHANDLED PROMISE ERROR
===================================================== */

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled promise error:",
            event.reason
        );
    }
);


/* =====================================================
   PAGE ROUTER
===================================================== */

async function initializeCurrentPage() {

    /*
     * These initializers are safe on every page
     * because they only attach listeners when
     * matching elements exist.
     */

    initializeHomePage();

    initializeBackButtons();

    initializeLogoutButtons();

    initializeInputFormatters();

    initializeKeyboardEvents();


    /*
     * Check private page access before loading
     * database information.
     */

    if (
        !protectCurrentPage()
    ) {

        return;
    }


    switch (currentFile) {


        /* =========================
           HOME
        ========================== */

        case "":
        case "index.html":

            break;


        /* =========================
           LOGIN
        ========================== */

        case "login.html":

            initializeLoginPage();

            break;


        /* =========================
           DASHBOARD
        ========================== */

        case "dashboard.html":

            await initializeDashboardPage();

            break;


        /* =========================
           STUDENTS
        ========================== */

        case "students.html":

            await initializeStudentsPage();

            break;


        /* =========================
           TEACHERS
        ========================== */

        case "teachers.html":

            await initializeTeachersPage();

            break;


        /* =========================
           ATTENDANCE
        ========================== */

        case "attendance.html":

            await initializeAttendancePage();

            break;


        /* =========================
           STUDENT APPLICATION
        ========================== */

        case "student-apply.html":

            initializeStudentApplicationPage();

            break;


        /* =========================
           TEACHER APPLICATION
        ========================== */

        case "teacher-apply.html":

            initializeTeacherApplicationPage();

            break;


        /* =========================
           ADMIN APPROVALS
        ========================== */

        case "approvals.html":

            await initializeApprovalsPage();

            break;


        default:

            console.log(
                "No special initializer for:",
                currentFile
            );
    }


    /*
     * Start inactivity protection only after
     * private-page security is verified.
     */

    initializeInactivityProtection();
}


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await initializeCurrentPage();

        } catch (error) {

            console.error(
                "Application initialization error:",
                error
            );
        }
    }
);


/* =====================================================
   END OF SCRIPT.JS
   PART 3 / 3
===================================================== */
