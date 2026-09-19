/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   مدرسہ شہناز اختر للبنات

   SCRIPT.JS
   PART 1 / 3

   SUPABASE AUTH
   SECURITY
   LOGIN / LOGOUT
   SESSION
   DASHBOARD
   GENERAL HELPERS
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

let currentAuthUser = null;

let currentProfile = null;


/* =====================================================
   CURRENT PAGE
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

    } catch {

        return safeString(value);
    }
}


/* =====================================================
   PHONE / CNIC
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
        cleanDigits(value)
            .length === 13
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
   SUPABASE AUTH SESSION
===================================================== */

async function getCurrentSession() {

    if (!checkSupabase()) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            throw error;
        }


        return (
            data.session ||
            null
        );

    } catch (error) {

        console.error(
            "Session error:",
            error
        );


        return null;
    }
}


async function getCurrentUser() {

    if (!checkSupabase()) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getUser();


        if (error) {

            throw error;
        }


        return (
            data.user ||
            null
        );

    } catch (error) {

        console.error(
            "User error:",
            error
        );


        return null;
    }
}


/* =====================================================
   LOAD CURRENT PROFILE
===================================================== */

async function loadCurrentProfile() {

    if (!checkSupabase()) {

        return null;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        currentAuthUser = null;
        currentProfile = null;

        return null;
    }


    currentAuthUser =
        user;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    PROFILES_TABLE
                )
                .select(
                    "id, full_name, role, status"
                )
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();


        if (error) {

            throw error;
        }


        currentProfile =
            data || null;


        return currentProfile;

    } catch (error) {

        console.error(
            "Profile load error:",
            error
        );


        currentProfile = null;

        return null;
    }
}


/* =====================================================
   AUTH HELPERS
===================================================== */

function isAuthenticated() {

    return Boolean(
        currentAuthUser &&
        currentProfile &&
        safeString(
            currentProfile.status
        ).toLowerCase() ===
            "active"
    );
}


function getCurrentRole() {

    return safeString(
        currentProfile?.role
    ).toLowerCase();
}


function getCurrentUsername() {

    return safeString(
        currentProfile?.full_name
    );
}


function getCurrentProfileId() {

    return safeString(
        currentProfile?.id
    );
}


function isAdmin() {

    return (
        isAuthenticated() &&
        getCurrentRole() ===
            "admin"
    );
}


function isTeacher() {

    return (
        isAuthenticated() &&
        getCurrentRole() ===
            "teacher"
    );
}


function isStudent() {

    return (
        isAuthenticated() &&
        getCurrentRole() ===
            "student"
    );
}


/* =====================================================
   REQUIRE LOGIN
===================================================== */

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


    if (!isAdmin()) {

        alert(
            "یہ کام صرف ایڈمن کر سکتا ہے۔"
        );


        return false;
    }


    return true;
}


/* =====================================================
   LOGIN REDIRECT
===================================================== */

function redirectToLogin() {

    if (
        currentFile !==
        "login.html"
    ) {

        window.location.href =
            "login.html";
    }
}


/* =====================================================
   LOGIN
===================================================== */

async function handleLogin() {

    const email =
        getValue(
            "username"
        );


    const password =
        getValue(
            "password"
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
        !email ||
        !password
    ) {

        showMessage(
            message,
            "ای میل اور پاس ورڈ درج کریں۔"
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


    try {

        if (button) {

            button.disabled = true;
        }


        const {
            data: authData,
            error: authError
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


        if (authError) {

            throw authError;
        }


        if (
            !authData ||
            !authData.user
        ) {

            throw new Error(
                "Authentication failed."
            );
        }


        currentAuthUser =
            authData.user;


        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from(
                    PROFILES_TABLE
                )
                .select(
                    "id, full_name, role, status"
                )
                .eq(
                    "id",
                    authData.user.id
                )
                .maybeSingle();


        if (profileError) {

            throw profileError;
        }


        if (!profile) {

            await supabaseClient.auth
                .signOut();


            currentAuthUser = null;
            currentProfile = null;


            showMessage(
                message,
                "اس اکاؤنٹ کا پروفائل موجود نہیں ہے۔"
            );


            return;
        }


        if (
            safeString(
                profile.status
            ).toLowerCase() !==
            "active"
        ) {

            await supabaseClient.auth
                .signOut();


            currentAuthUser = null;
            currentProfile = null;


            showMessage(
                message,
                "یہ اکاؤنٹ ابھی فعال نہیں ہے۔"
            );


            return;
        }


        const role =
            safeString(
                profile.role
            ).toLowerCase();


        if (
            ![
                "admin",
                "teacher",
                "student"
            ].includes(
                role
            )
        ) {

            await supabaseClient.auth
                .signOut();


            currentAuthUser = null;
            currentProfile = null;


            showMessage(
                message,
                "اکاؤنٹ کا کردار درست نہیں ہے۔"
            );


            return;
        }


        const requestedRole =
            safeString(
                sessionStorage.getItem(
                    "requestedRole"
                )
            ).toLowerCase();


        if (
            requestedRole &&
            requestedRole !== role
        ) {

            await supabaseClient.auth
                .signOut();


            currentAuthUser = null;
            currentProfile = null;


            showMessage(
                message,
                "یہ اکاؤنٹ منتخب کردہ قسم سے مطابقت نہیں رکھتا۔"
            );


            return;
        }


        currentProfile =
            profile;


        sessionStorage.removeItem(
            "requestedRole"
        );


        sessionStorage.setItem(
            "lastActivity",
            String(
                Date.now()
            )
        );


        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        currentAuthUser = null;
        currentProfile = null;


        showMessage(
            message,
            "ای میل یا پاس ورڈ درست نہیں ہے۔"
        );


    } finally {

        if (button) {

            button.disabled = false;
        }
    }
}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutUser(
    message = ""
) {

    try {

        if (supabaseClient) {

            await supabaseClient.auth
                .signOut();
        }

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );
    }


    currentAuthUser = null;
    currentProfile = null;


    sessionStorage.removeItem(
        "lastActivity"
    );


    sessionStorage.removeItem(
        "requestedRole"
    );


    if (message) {

        sessionStorage.setItem(
            "logoutMessage",
            message
        );
    }


    window.location.href =
        "login.html?logout=true";
}


/* =====================================================
   LOGIN PAGE
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


function initializeLoginPage() {

    const form =
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


    initializePasswordToggle();


    if (form) {

        form.addEventListener(
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
                        "requestedRole",
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


    if (!isAuthenticated()) {

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
   INACTIVITY SECURITY
===================================================== */

function resetInactivityTimer() {

    if (!isAuthenticated()) {

        return;
    }


    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );
    }


    sessionStorage.setItem(
        "lastActivity",
        String(
            Date.now()
        )
    );


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


function checkPreviousActivity() {

    if (!isAuthenticated()) {

        return true;
    }


    const last =
        Number(
            sessionStorage.getItem(
                "lastActivity"
            )
        );


    if (
        last &&
        Date.now() - last >
            SESSION_TIMEOUT
    ) {

        logoutUser(
            "پانچ منٹ غیر فعالیت کی وجہ سے آپ کو لاگ آؤٹ کر دیا گیا ہے۔"
        );


        return false;
    }


    return true;
}


function initializeInactivityProtection() {

    if (!isAuthenticated()) {

        return;
    }


    if (!checkPreviousActivity()) {

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
        "backToHome"
    )?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";
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
}


/* =====================================================
   DASHBOARD PERMISSIONS
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
                            id === "teachersMenu" ||
                            id === "approvalsMenu"
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
                        "id, residence_type, student_class"
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
   DASHBOARD
===================================================== */

async function initializeDashboardPage() {

    if (!requireLogin()) {

        return;
    }


    const name =
        getCurrentUsername();


    if (name) {

        setText(
            "welcomeMessage",
            `خوش آمدید، ${name}`
        );
    }


    applyDashboardPermissions();

    initializeDashboardNavigation();


    await updateDashboardCounts();
}


/* =====================================================
   GLOBAL INPUT FORMATTERS
===================================================== */

function initializeInputFormatters() {

    const cnicFields = [

        "studentCNIC",
        "teacherCNIC",
        "applyStudentCNIC",
        "applyTeacherCNIC"

    ];


    cnicFields.forEach(
        id => {

            const input =
                getElement(id);


            if (!input) {

                return;
            }


            input.addEventListener(
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


    const phoneFields = [

        "phone",
        "studentPhone",
        "teacherPhone",
        "applyStudentPhone",
        "applyTeacherPhone"

    ];


    phoneFields.forEach(
        id => {

            const input =
                getElement(id);


            if (!input) {

                return;
            }


            input.addEventListener(
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
   AUTH STATE LISTENER
===================================================== */

function initializeAuthListener() {

    if (!supabaseClient) {

        return;
    }


    supabaseClient.auth
        .onAuthStateChange(
            (
                event,
                session
            ) => {

                if (
                    event ===
                    "SIGNED_OUT"
                ) {

                    currentAuthUser = null;
                    currentProfile = null;
                }


                if (
                    session?.user
                ) {

                    currentAuthUser =
                        session.user;
                }
            }
        );
}


/* =====================================================
   PART 1 COMPLETE

   PASTE PART 2 DIRECTLY BELOW THIS.
===================================================== */

/* =====================================================
   SCRIPT.JS
   PART 2 / 3

   STUDENTS
   TEACHERS
   APPLICATIONS
===================================================== */


/* =====================================================
   STUDENT VARIABLES
===================================================== */

let studentsCache = [];

let editingStudentId = null;

let mahramCounter = 0;


const studentForm =
    getElement("studentForm");

const studentList =
    getElement("studentList");

const studentMessage =
    getElement("studentMessage");

const studentFormContainer =
    getElement("studentFormContainer");

const studentListContainer =
    getElement("studentListContainer");

const studentDetails =
    getElement("studentDetails");

const studentDetailsContent =
    getElement("studentDetailsContent");

const mahramContainer =
    getElement("mahramContainer");


/* =====================================================
   STUDENT FORM DISPLAY
===================================================== */

function openStudentForm() {

    if (!requireAdmin()) {
        return;
    }

    editingStudentId = null;

    if (studentForm) {
        studentForm.reset();
    }

    clearMessage(studentMessage);

    clearMahramFields();

    setValue(
        "admissionDate",
        todayDate()
    );

    showElement(
        studentFormContainer
    );

    hideElement(
        studentListContainer
    );

    setText(
        "studentFormTitle",
        "نئی طالبہ شامل کریں"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function closeStudentForm() {

    if (studentForm) {
        studentForm.reset();
    }

    editingStudentId = null;

    clearMahramFields();

    hideElement(
        studentFormContainer
    );

    showElement(
        studentListContainer
    );
}


/* =====================================================
   MAHRAM FIELDS
===================================================== */

function clearMahramFields() {

    if (!mahramContainer) {
        return;
    }

    mahramContainer.innerHTML = "";

    mahramCounter = 0;
}


function addMahramField(
    mahram = {}
) {

    if (!mahramContainer) {
        return;
    }

    if (
        mahramCounter >=
        MAX_MAHRAMS
    ) {

        alert(
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return;
    }

    mahramCounter++;

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "mahram-item";

    wrapper.dataset.mahram =
        String(mahramCounter);

    wrapper.innerHTML = `
        <h4>
            محرم ${mahramCounter}
        </h4>

        <label>
            نام
        </label>

        <input
            type="text"
            class="mahram-name"
            value="${escapeHTML(
                mahram.name || ""
            )}"
        >

        <label>
            رشتہ
        </label>

        <input
            type="text"
            class="mahram-relation"
            value="${escapeHTML(
                mahram.relation || ""
            )}"
        >

        <label>
            فون نمبر
        </label>

        <input
            type="tel"
            class="mahram-phone"
            maxlength="11"
            value="${escapeHTML(
                mahram.phone || ""
            )}"
        >

        <label>
            شناختی کارڈ نمبر
        </label>

        <input
            type="text"
            class="mahram-cnic"
            maxlength="15"
            value="${escapeHTML(
                formatCNIC(
                    mahram.cnic || ""
                )
            )}"
        >

        <button
            type="button"
            class="remove-mahram"
        >
            محرم حذف کریں
        </button>
    `;

    mahramContainer.appendChild(
        wrapper
    );

    const phoneInput =
        wrapper.querySelector(
            ".mahram-phone"
        );

    const cnicInput =
        wrapper.querySelector(
            ".mahram-cnic"
        );

    const removeButton =
        wrapper.querySelector(
            ".remove-mahram"
        );


    phoneInput?.addEventListener(
        "input",
        () => {

            phoneInput.value =
                cleanDigits(
                    phoneInput.value
                ).slice(
                    0,
                    11
                );
        }
    );


    cnicInput?.addEventListener(
        "input",
        () => {

            cnicInput.value =
                formatCNIC(
                    cnicInput.value
                );
        }
    );


    removeButton?.addEventListener(
        "click",
        () => {

            wrapper.remove();

            updateMahramNumbers();
        }
    );
}


function updateMahramNumbers() {

    if (!mahramContainer) {
        return;
    }

    const items =
        mahramContainer
            .querySelectorAll(
                ".mahram-item"
            );

    items.forEach(
        (item, index) => {

            const heading =
                item.querySelector(
                    "h4"
                );

            if (heading) {

                heading.textContent =
                    `محرم ${index + 1}`;
            }
        }
    );

    mahramCounter =
        items.length;
}


function getMahramsFromForm() {

    if (!mahramContainer) {
        return [];
    }

    const result = [];

    mahramContainer
        .querySelectorAll(
            ".mahram-item"
        )
        .forEach(
            item => {

                const name =
                    safeString(
                        item.querySelector(
                            ".mahram-name"
                        )?.value
                    );

                const relation =
                    safeString(
                        item.querySelector(
                            ".mahram-relation"
                        )?.value
                    );

                const phone =
                    cleanDigits(
                        item.querySelector(
                            ".mahram-phone"
                        )?.value
                    );

                const cnic =
                    cleanDigits(
                        item.querySelector(
                            ".mahram-cnic"
                        )?.value
                    );

                if (
                    name ||
                    relation ||
                    phone ||
                    cnic
                ) {

                    result.push({
                        name,
                        relation,
                        phone,
                        cnic
                    });
                }
            }
        );

    return result;
}


/* =====================================================
   RESIDENCE TYPE
===================================================== */

function isHostelResidence(
    value
) {

    const residence =
        safeString(value)
            .toLowerCase();

    return (
        residence === "ہاسٹل" ||
        residence === "hostel"
    );
}


/* =====================================================
   STUDENT DATA
===================================================== */

function collectStudentData() {

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
            cleanDigits(
                getValue(
                    "studentCNIC"
                )
            ),

        phone:
            cleanDigits(
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
            ) || todayDate(),

        address:
            getValue(
                "studentAddress"
            ),

        residence_type:
            getValue(
                "residenceType"
            ),

        previous_madrassa:
            getValue(
                "previousMadrassa"
            ),

        transfer_date:
            getValue(
                "transferDate"
            ) || null,

        mahrams:
            getMahramsFromForm(),

        status:
            "active"

    };
}


/* =====================================================
   STUDENT VALIDATION
===================================================== */

function validateStudentData(
    data
) {

    if (!data.name) {

        return "طالبہ کا نام درج کریں۔";
    }

    if (!data.father_name) {

        return "والد کا نام درج کریں۔";
    }

    if (!data.student_class) {

        return "درجہ منتخب کریں۔";
    }

    if (
        data.phone &&
        !validPhone(
            data.phone
        )
    ) {

        return "فون نمبر 11 ہندسوں کا ہونا چاہیے اور 03 سے شروع ہونا چاہیے۔";
    }

    if (
        data.cnic &&
        !validCNIC(
            data.cnic
        )
    ) {

        return "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔";
    }

    if (
        data.mahrams.length >
        MAX_MAHRAMS
    ) {

        return "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔";
    }

    if (
        isHostelResidence(
            data.residence_type
        ) &&
        data.mahrams.length === 0
    ) {

        return "ہاسٹل کی طالبہ کے لیے کم از کم ایک محرم ضروری ہے۔";
    }

    for (
        const mahram of
        data.mahrams
    ) {

        if (
            !mahram.name ||
            !mahram.relation
        ) {

            return "ہر محرم کا نام اور رشتہ درج کریں۔";
        }

        if (
            mahram.phone &&
            !validPhone(
                mahram.phone
            )
        ) {

            return "محرم کا فون نمبر درست نہیں ہے۔";
        }

        if (
            mahram.cnic &&
            !validCNIC(
                mahram.cnic
            )
        ) {

            return "محرم کا شناختی کارڈ نمبر درست نہیں ہے۔";
        }
    }

    return "";
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

    if (!checkSupabase()) {
        return;
    }

    clearMessage(
        studentMessage
    );

    const data =
        collectStudentData();

    const validationError =
        validateStudentData(
            data
        );

    if (validationError) {

        showMessage(
            studentMessage,
            validationError
        );

        return;
    }

    const submitButton =
        studentForm?.querySelector(
            'button[type="submit"]'
        );

    try {

        if (submitButton) {
            submitButton.disabled = true;
        }

        if (editingStudentId) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .update(data)
                    .eq(
                        "id",
                        editingStudentId
                    );

            if (error) {
                throw error;
            }

            showMessage(
                studentMessage,
                "طالبہ کا ریکارڈ کامیابی سے تبدیل ہو گیا۔",
                "success"
            );

        } else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .insert(
                        [data]
                    );

            if (error) {
                throw error;
            }

            showMessage(
                studentMessage,
                "نئی طالبہ کامیابی سے شامل ہو گئی۔",
                "success"
            );
        }

        editingStudentId = null;

        if (studentForm) {
            studentForm.reset();
        }

        clearMahramFields();

        await loadStudents();

        setTimeout(
            () => {

                hideElement(
                    studentFormContainer
                );

                showElement(
                    studentListContainer
                );

            },
            700
        );

    } catch (error) {

        console.error(
            "Student save error:",
            error
        );

        showMessage(
            studentMessage,
            error.message ||
            "ریکارڈ محفوظ نہیں ہو سکا۔"
        );

    } finally {

        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}


/* =====================================================
   LOAD STUDENTS
===================================================== */

async function loadStudents() {

    if (!checkSupabase()) {
        return;
    }

    if (!studentList) {
        return;
    }

    studentList.innerHTML =
        "<p>ریکارڈ لوڈ ہو رہا ہے...</p>";

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
            "Students load error:",
            error
        );

        studentList.innerHTML =
            `<p>${escapeHTML(
                error.message ||
                "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔"
            )}</p>`;
    }
}


/* =====================================================
   RENDER STUDENTS
===================================================== */

function renderStudents(
    students
) {

    if (!studentList) {
        return;
    }

    if (
        !students ||
        students.length === 0
    ) {

        studentList.innerHTML =
            "<p>کوئی طالبہ موجود نہیں ہے۔</p>";

        return;
    }

    studentList.innerHTML =
        students
            .map(
                student => {

                    const adminButtons =
                        isAdmin()
                            ? `
                                <button
                                    type="button"
                                    class="edit-student"
                                    data-id="${student.id}"
                                >
                                    ترمیم
                                </button>

                                <button
                                    type="button"
                                    class="delete-student"
                                    data-id="${student.id}"
                                >
                                    حذف کریں
                                </button>
                            `
                            : "";

                    return `
                        <div class="record-card">

                            <h3>
                                ${escapeHTML(
                                    student.name
                                )}
                            </h3>

                            <p>
                                داخلہ نمبر:
                                ${escapeHTML(
                                    student.admission_no ||
                                    "—"
                                )}
                            </p>

                            <p>
                                درجہ:
                                ${escapeHTML(
                                    student.student_class ||
                                    "—"
                                )}
                            </p>

                            <p>
                                والد:
                                ${escapeHTML(
                                    student.father_name ||
                                    "—"
                                )}
                            </p>

                            <button
                                type="button"
                                class="view-student"
                                data-id="${student.id}"
                            >
                                مکمل تفصیل
                            </button>

                            ${adminButtons}

                        </div>
                    `;
                }
            )
            .join("");

    initializeStudentListButtons();
}


/* =====================================================
   STUDENT LIST BUTTONS
===================================================== */

function initializeStudentListButtons() {

    studentList
        ?.querySelectorAll(
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


    studentList
        ?.querySelectorAll(
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


    studentList
        ?.querySelectorAll(
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
   STUDENT DETAILS
===================================================== */

function showStudentDetails(
    id
) {

    const student =
        studentsCache.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (
        !student ||
        !studentDetailsContent
    ) {

        return;
    }

    let mahrams =
        Array.isArray(
            student.mahrams
        )
            ? student.mahrams
            : [];

    const mahramHTML =
        mahrams.length
            ? mahrams
                .map(
                    (
                        mahram,
                        index
                    ) => `
                        <div class="detail-section">

                            <h4>
                                محرم ${index + 1}
                            </h4>

                            <p>
                                نام:
                                ${escapeHTML(
                                    mahram.name ||
                                    "—"
                                )}
                            </p>

                            <p>
                                رشتہ:
                                ${escapeHTML(
                                    mahram.relation ||
                                    "—"
                                )}
                            </p>

                            <p>
                                فون:
                                ${escapeHTML(
                                    mahram.phone ||
                                    "—"
                                )}
                            </p>

                            <p>
                                شناختی کارڈ:
                                ${escapeHTML(
                                    mahram.cnic
                                        ? formatCNIC(
                                            mahram.cnic
                                        )
                                        : "—"
                                )}
                            </p>

                        </div>
                    `
                )
                .join("")
            : "<p>کوئی محرم درج نہیں ہے۔</p>";


    studentDetailsContent.innerHTML = `

        <h2>
            ${escapeHTML(
                student.name
            )}
        </h2>

        <p>
            داخلہ نمبر:
            ${escapeHTML(
                student.admission_no ||
                "—"
            )}
        </p>

        <p>
            داخلہ کی قسم:
            ${escapeHTML(
                student.admission_type ||
                "—"
            )}
        </p>

        <p>
            والد کا نام:
            ${escapeHTML(
                student.father_name ||
                "—"
            )}
        </p>

        <p>
            سرپرست:
            ${escapeHTML(
                student.guardian_name ||
                "—"
            )}
        </p>

        <p>
            شناختی کارڈ:
            ${escapeHTML(
                student.cnic
                    ? formatCNIC(
                        student.cnic
                    )
                    : "—"
            )}
        </p>

        <p>
            فون:
            ${escapeHTML(
                student.phone ||
                "—"
            )}
        </p>

        <p>
            تاریخ پیدائش:
            ${escapeHTML(
                formatDate(
                    student.date_of_birth
                )
            )}
        </p>

        <p>
            درجہ:
            ${escapeHTML(
                student.student_class ||
                "—"
            )}
        </p>

        <p>
            تاریخ داخلہ:
            ${escapeHTML(
                formatDate(
                    student.admission_date
                )
            )}
        </p>

        <p>
            پتہ:
            ${escapeHTML(
                student.address ||
                "—"
            )}
        </p>

        <p>
            رہائش:
            ${escapeHTML(
                student.residence_type ||
                "—"
            )}
        </p>

        <p>
            سابقہ مدرسہ:
            ${escapeHTML(
                student.previous_madrassa ||
                "—"
            )}
        </p>

        <p>
            منتقلی کی تاریخ:
            ${escapeHTML(
                formatDate(
                    student.transfer_date
                )
            )}
        </p>

        <h3>
            محرم
        </h3>

        ${mahramHTML}
    `;

    showElement(
        studentDetails
    );
}


/* =====================================================
   EDIT STUDENT
===================================================== */

function editStudent(
    id
) {

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
        formatCNIC(
            student.cnic
        )
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
        "studentAddress",
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

    clearMahramFields();

    if (
        Array.isArray(
            student.mahrams
        )
    ) {

        student.mahrams
            .slice(
                0,
                MAX_MAHRAMS
            )
            .forEach(
                mahram => {

                    addMahramField(
                        mahram
                    );
                }
            );
    }

    setText(
        "studentFormTitle",
        "طالبہ کا ریکارڈ تبدیل کریں"
    );

    showElement(
        studentFormContainer
    );

    hideElement(
        studentListContainer
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   DELETE STUDENT
===================================================== */

async function deleteStudent(
    id
) {

    if (!requireAdmin()) {
        return;
    }

    const confirmed =
        confirm(
            "کیا آپ واقعی اس طالبہ کا ریکارڈ حذف کرنا چاہتے ہیں؟"
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
            "Student delete error:",
            error
        );

        alert(
            error.message ||
            "ریکارڈ حذف نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   STUDENT SEARCH
===================================================== */

function searchStudents() {

    const search =
        safeString(
            getValue(
                "studentSearch"
            )
        ).toLowerCase();

    if (!search) {

        renderStudents(
            studentsCache
        );

        return;
    }

    const filtered =
        studentsCache.filter(
            student => {

                return [

                    student.name,
                    student.father_name,
                    student.guardian_name,
                    student.admission_no,
                    student.phone,
                    student.cnic,
                    student.student_class

                ]
                    .map(
                        value =>
                            safeString(
                                value
                            ).toLowerCase()
                    )
                    .some(
                        value =>
                            value.includes(
                                search
                            )
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
        "addStudentButton"
    )?.addEventListener(
        "click",
        openStudentForm
    );

    getElement(
        "cancelStudentButton"
    )?.addEventListener(
        "click",
        closeStudentForm
    );

    getElement(
        "addMahramButton"
    )?.addEventListener(
        "click",
        () => {

            addMahramField();
        }
    );

    getElement(
        "studentSearch"
    )?.addEventListener(
        "input",
        searchStudents
    );

    getElement(
        "closeStudentDetails"
    )?.addEventListener(
        "click",
        () => {

            hideElement(
                studentDetails
            );
        }
    );

    studentForm?.addEventListener(
        "submit",
        saveStudent
    );

    hideElement(
        studentFormContainer
    );

    hideElement(
        studentDetails
    );

    showElement(
        studentListContainer
    );

    await loadStudents();
}


/* =====================================================
   TEACHER VARIABLES
===================================================== */

let teachersCache = [];

let editingTeacherId = null;


const teacherForm =
    getElement("teacherForm");

const teacherList =
    getElement("teacherList");

const teacherMessage =
    getElement("teacherMessage");

const teacherFormContainer =
    getElement("teacherFormContainer");

const teacherListContainer =
    getElement("teacherListContainer");

const teacherDetails =
    getElement("teacherDetails");

const teacherDetailsContent =
    getElement("teacherDetailsContent");


/* =====================================================
   TEACHER DATA
===================================================== */

function collectTeacherData() {

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
            cleanDigits(
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
                "joiningDate"
            ) || todayDate(),

        address:
            getValue(
                "teacherAddress"
            ),

        status:
            "active"

    };
}


/* =====================================================
   TEACHER VALIDATION
===================================================== */

function validateTeacherData(
    data
) {

    if (!data.name) {

        return "استاد کا نام درج کریں۔";
    }

    if (
        data.phone &&
        !validPhone(
            data.phone
        )
    ) {

        return "فون نمبر درست نہیں ہے۔";
    }

    if (
        data.cnic &&
        !validCNIC(
            data.cnic
        )
    ) {

        return "شناختی کارڈ نمبر درست نہیں ہے۔";
    }

    return "";
}


/* =====================================================
   OPEN / CLOSE TEACHER FORM
===================================================== */

function openTeacherForm() {

    if (!requireAdmin()) {
        return;
    }

    editingTeacherId = null;

    teacherForm?.reset();

    clearMessage(
        teacherMessage
    );

    setValue(
        "joiningDate",
        todayDate()
    );

    setText(
        "teacherFormTitle",
        "نیا استاد شامل کریں"
    );

    showElement(
        teacherFormContainer
    );

    hideElement(
        teacherListContainer
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function closeTeacherForm() {

    teacherForm?.reset();

    editingTeacherId = null;

    hideElement(
        teacherFormContainer
    );

    showElement(
        teacherListContainer
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
        collectTeacherData();

    const validationError =
        validateTeacherData(
            data
        );

    if (validationError) {

        showMessage(
            teacherMessage,
            validationError
        );

        return;
    }

    const submitButton =
        teacherForm?.querySelector(
            'button[type="submit"]'
        );

    try {

        if (submitButton) {
            submitButton.disabled = true;
        }

        if (editingTeacherId) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        TEACHERS_TABLE
                    )
                    .update(data)
                    .eq(
                        "id",
                        editingTeacherId
                    );

            if (error) {
                throw error;
            }

            showMessage(
                teacherMessage,
                "استاد کا ریکارڈ کامیابی سے تبدیل ہو گیا۔",
                "success"
            );

        } else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        TEACHERS_TABLE
                    )
                    .insert(
                        [data]
                    );

            if (error) {
                throw error;
            }

            showMessage(
                teacherMessage,
                "نیا استاد کامیابی سے شامل ہو گیا۔",
                "success"
            );
        }

        editingTeacherId = null;

        teacherForm?.reset();

        await loadTeachers();

        setTimeout(
            () => {

                hideElement(
                    teacherFormContainer
                );

                showElement(
                    teacherListContainer
                );

            },
            700
        );

    } catch (error) {

        console.error(
            "Teacher save error:",
            error
        );

        showMessage(
            teacherMessage,
            error.message ||
            "استاد کا ریکارڈ محفوظ نہیں ہو سکا۔"
        );

    } finally {

        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}


/* =====================================================
   LOAD TEACHERS
===================================================== */

async function loadTeachers() {

    if (
        !checkSupabase() ||
        !teacherList
    ) {
        return;
    }

    teacherList.innerHTML =
        "<p>ریکارڈ لوڈ ہو رہا ہے...</p>";

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
            "Teachers load error:",
            error
        );

        teacherList.innerHTML =
            `<p>${escapeHTML(
                error.message ||
                "اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔"
            )}</p>`;
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

    if (
        !teachers ||
        teachers.length === 0
    ) {

        teacherList.innerHTML =
            "<p>کوئی استاد موجود نہیں ہے۔</p>";

        return;
    }

    teacherList.innerHTML =
        teachers
            .map(
                teacher => `
                    <div class="record-card">

                        <h3>
                            ${escapeHTML(
                                teacher.name
                            )}
                        </h3>

                        <p>
                            استاد کوڈ:
                            ${escapeHTML(
                                teacher.teacher_code ||
                                "—"
                            )}
                        </p>

                        <p>
                            فون:
                            ${escapeHTML(
                                teacher.phone ||
                                "—"
                            )}
                        </p>

                        <p>
                            قابلیت:
                            ${escapeHTML(
                                teacher.qualification ||
                                "—"
                            )}
                        </p>

                        <button
                            type="button"
                            class="view-teacher"
                            data-id="${teacher.id}"
                        >
                            مکمل تفصیل
                        </button>

                        <button
                            type="button"
                            class="edit-teacher"
                            data-id="${teacher.id}"
                        >
                            ترمیم
                        </button>

                        <button
                            type="button"
                            class="delete-teacher"
                            data-id="${teacher.id}"
                        >
                            حذف کریں
                        </button>

                    </div>
                `
            )
            .join("");

    initializeTeacherListButtons();
}


/* =====================================================
   TEACHER LIST BUTTONS
===================================================== */

function initializeTeacherListButtons() {

    teacherList
        ?.querySelectorAll(
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
        ?.querySelectorAll(
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
        ?.querySelectorAll(
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
   TEACHER DETAILS
===================================================== */

function showTeacherDetails(
    id
) {

    const teacher =
        teachersCache.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (
        !teacher ||
        !teacherDetailsContent
    ) {
        return;
    }

    teacherDetailsContent.innerHTML = `

        <h2>
            ${escapeHTML(
                teacher.name
            )}
        </h2>

        <p>
            استاد کوڈ:
            ${escapeHTML(
                teacher.teacher_code ||
                "—"
            )}
        </p>

        <p>
            والد کا نام:
            ${escapeHTML(
                teacher.father_name ||
                "—"
            )}
        </p>

        <p>
            فون:
            ${escapeHTML(
                teacher.phone ||
                "—"
            )}
        </p>

        <p>
            شناختی کارڈ:
            ${escapeHTML(
                teacher.cnic
                    ? formatCNIC(
                        teacher.cnic
                    )
                    : "—"
            )}
        </p>

        <p>
            قابلیت:
            ${escapeHTML(
                teacher.qualification ||
                "—"
            )}
        </p>

        <p>
            شمولیت کی تاریخ:
            ${escapeHTML(
                formatDate(
                    teacher.joining_date
                )
            )}
        </p>

        <p>
            پتہ:
            ${escapeHTML(
                teacher.address ||
                "—"
            )}
        </p>

        <p>
            حیثیت:
            ${escapeHTML(
                teacher.status ||
                "—"
            )}
        </p>
    `;

    showElement(
        teacherDetails
    );
}


/* =====================================================
   EDIT TEACHER
===================================================== */

function editTeacher(
    id
) {

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
        formatCNIC(
            teacher.cnic
        )
    );

    setValue(
        "teacherQualification",
        teacher.qualification
    );

    setValue(
        "joiningDate",
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

    hideElement(
        teacherListContainer
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   DELETE TEACHER
===================================================== */

async function deleteTeacher(
    id
) {

    if (!requireAdmin()) {
        return;
    }

    const confirmed =
        confirm(
            "کیا آپ واقعی اس استاد کا ریکارڈ حذف کرنا چاہتے ہیں؟"
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
            "Teacher delete error:",
            error
        );

        alert(
            error.message ||
            "ریکارڈ حذف نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   TEACHER SEARCH
===================================================== */

function searchTeachers() {

    const search =
        safeString(
            getValue(
                "teacherSearch"
            )
        ).toLowerCase();

    if (!search) {

        renderTeachers(
            teachersCache
        );

        return;
    }

    const filtered =
        teachersCache.filter(
            teacher => {

                return [

                    teacher.name,
                    teacher.father_name,
                    teacher.teacher_code,
                    teacher.phone,
                    teacher.cnic,
                    teacher.qualification

                ]
                    .map(
                        value =>
                            safeString(
                                value
                            ).toLowerCase()
                    )
                    .some(
                        value =>
                            value.includes(
                                search
                            )
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
        "addTeacherButton"
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

    getElement(
        "teacherSearch"
    )?.addEventListener(
        "input",
        searchTeachers
    );

    getElement(
        "closeTeacherDetails"
    )?.addEventListener(
        "click",
        () => {

            hideElement(
                teacherDetails
            );
        }
    );

    teacherForm?.addEventListener(
        "submit",
        saveTeacher
    );

    hideElement(
        teacherFormContainer
    );

    hideElement(
        teacherDetails
    );

    showElement(
        teacherListContainer
    );

    await loadTeachers();
}


/* =====================================================
   STUDENT APPLICATION
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
            "applicationMessage"
        );

    const data = {

        application_no:
            `SA-${Date.now()}`,

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
            cleanDigits(
                getValue(
                    "studentCNIC"
                )
            ),

        phone:
            cleanDigits(
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
                "studentAddress"
            ),

        residence_type:
            getValue(
                "residenceType"
            ),

        previous_madrassa:
            getValue(
                "previousMadrassa"
            ),

        transfer_date:
            getValue(
                "transferDate"
            ) || null,

        mahrams:
            getMahramsFromForm(),

        status:
            "pending"

    };

    if (
        !data.name ||
        !data.father_name
    ) {

        showMessage(
            message,
            "ضروری معلومات مکمل کریں۔"
        );

        return;
    }

    if (
        data.phone &&
        !validPhone(
            data.phone
        )
    ) {

        showMessage(
            message,
            "فون نمبر درست نہیں ہے۔"
        );

        return;
    }

    if (
        data.cnic &&
        !validCNIC(
            data.cnic
        )
    ) {

        showMessage(
            message,
            "شناختی کارڈ نمبر درست نہیں ہے۔"
        );

        return;
    }

    if (
        isHostelResidence(
            data.residence_type
        ) &&
        data.mahrams.length === 0
    ) {

        showMessage(
            message,
            "ہاسٹل کی طالبہ کے لیے کم از کم ایک محرم ضروری ہے۔"
        );

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
                .insert(
                    [data]
                );

        if (error) {
            throw error;
        }

        showMessage(
            message,
            "درخواست کامیابی سے جمع ہو گئی۔",
            "success"
        );

        event.target.reset();

        clearMahramFields();

    } catch (error) {

        console.error(
            "Student application error:",
            error
        );

        showMessage(
            message,
            error.message ||
            "درخواست جمع نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   TEACHER APPLICATION
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
            "applicationMessage"
        );

    const data = {

        application_no:
            `TA-${Date.now()}`,

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
            cleanDigits(
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
        !data.name ||
        !data.father_name
    ) {

        showMessage(
            message,
            "ضروری معلومات مکمل کریں۔"
        );

        return;
    }

    if (
        data.phone &&
        !validPhone(
            data.phone
        )
    ) {

        showMessage(
            message,
            "فون نمبر درست نہیں ہے۔"
        );

        return;
    }

    if (
        data.cnic &&
        !validCNIC(
            data.cnic
        )
    ) {

        showMessage(
            message,
            "شناختی کارڈ نمبر درست نہیں ہے۔"
        );

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
                .insert(
                    [data]
                );

        if (error) {
            throw error;
        }

        showMessage(
            message,
            "درخواست کامیابی سے جمع ہو گئی۔",
            "success"
        );

        event.target.reset();

    } catch (error) {

        console.error(
            "Teacher application error:",
            error
        );

        showMessage(
            message,
            error.message ||
            "درخواست جمع نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   INITIALIZE APPLICATION PAGES
===================================================== */

function initializeStudentApplicationPage() {

    const form =
        getElement(
            "studentApplicationForm"
        ) ||
        getElement(
            "studentApplyForm"
        );

    form?.addEventListener(
        "submit",
        submitStudentApplication
    );

    getElement(
        "addMahramButton"
    )?.addEventListener(
        "click",
        () => {

            addMahramField();
        }
    );
}


function initializeTeacherApplicationPage() {

    const form =
        getElement(
            "teacherApplicationForm"
        ) ||
        getElement(
            "teacherApplyForm"
        );

    form?.addEventListener(
        "submit",
        submitTeacherApplication
    );
}


/* =====================================================
   PART 2 COMPLETE

   PASTE PART 3 DIRECTLY BELOW THIS.
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 3 / 3

   DASHBOARD
   ATTENDANCE
   APPLICATION MANAGEMENT
   INITIALIZATION
===================================================== */


/* =====================================================
   DASHBOARD COUNTS
===================================================== */

async function updateDashboardStudentCount() {

    const element =
        getElement("studentTotal");

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
                .from(STUDENTS_TABLE)
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
                ? String(count)
                : "0";

    } catch (error) {

        console.error(
            "Student count error:",
            error
        );

        element.textContent = "0";
    }
}


async function updateDashboardTeacherCount() {

    const element =
        getElement("teacherTotal");

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
                .from(TEACHERS_TABLE)
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
                ? String(count)
                : "0";

    } catch (error) {

        console.error(
            "Teacher count error:",
            error
        );

        element.textContent = "0";
    }
}


/* =====================================================
   APPLICATION COUNTS
===================================================== */

async function updatePendingApplicationCounts() {

    if (
        !checkSupabase() ||
        !isAdmin()
    ) {
        return;
    }

    const studentElement =
        getElement(
            "pendingStudentApplications"
        );

    const teacherElement =
        getElement(
            "pendingTeacherApplications"
        );

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

        if (
            studentElement &&
            !studentResult.error
        ) {

            studentElement.textContent =
                String(
                    studentResult.count || 0
                );
        }

        if (
            teacherElement &&
            !teacherResult.error
        ) {

            teacherElement.textContent =
                String(
                    teacherResult.count || 0
                );
        }

    } catch (error) {

        console.error(
            "Application count error:",
            error
        );
    }
}


/* =====================================================
   INITIALIZE DASHBOARD
===================================================== */

async function initializeDashboardPage() {

    if (!requireAuthentication()) {
        return;
    }

    await Promise.allSettled([

        updateDashboardStudentCount(),

        updateDashboardTeacherCount(),

        updatePendingApplicationCounts()

    ]);
}


/* =====================================================
   ATTENDANCE VARIABLES
===================================================== */

let attendanceStudentsCache = [];

let attendanceTeacherRecord = null;


/* =====================================================
   FIND CURRENT TEACHER
===================================================== */

async function loadCurrentTeacherRecord() {

    if (
        !checkSupabase() ||
        !currentUser
    ) {
        return null;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(TEACHERS_TABLE)
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();

        if (error) {
            throw error;
        }

        attendanceTeacherRecord =
            data || null;

        return attendanceTeacherRecord;

    } catch (error) {

        console.error(
            "Teacher record error:",
            error
        );

        return null;
    }
}


/* =====================================================
   LOAD STUDENTS FOR ATTENDANCE
===================================================== */

async function loadAttendanceStudents() {

    if (!checkSupabase()) {
        return;
    }

    const container =
        getElement(
            "attendanceStudentList"
        );

    if (!container) {
        return;
    }

    const selectedClass =
        getValue(
            "attendanceClass"
        );

    if (!selectedClass) {

        container.innerHTML =
            "<p>پہلے درجہ منتخب کریں۔</p>";

        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(STUDENTS_TABLE)
                .select(
                    "id,name,student_class,status"
                )
                .eq(
                    "student_class",
                    selectedClass
                )
                .eq(
                    "status",
                    "active"
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

        renderAttendanceStudents();

    } catch (error) {

        console.error(
            "Attendance students error:",
            error
        );

        container.innerHTML =
            `<p>${escapeHTML(
                error.message ||
                "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔"
            )}</p>`;
    }
}


/* =====================================================
   RENDER ATTENDANCE STUDENTS
===================================================== */

function renderAttendanceStudents() {

    const container =
        getElement(
            "attendanceStudentList"
        );

    if (!container) {
        return;
    }

    if (
        attendanceStudentsCache.length === 0
    ) {

        container.innerHTML =
            "<p>اس درجے میں کوئی طالبہ موجود نہیں ہے۔</p>";

        return;
    }

    container.innerHTML =
        attendanceStudentsCache
            .map(
                student => `

                    <div
                        class="attendance-row"
                        data-student-id="${student.id}"
                    >

                        <div class="attendance-name">

                            ${escapeHTML(
                                student.name
                            )}

                        </div>

                        <select
                            class="attendance-status"
                        >

                            <option value="present">
                                حاضر
                            </option>

                            <option value="absent">
                                غیر حاضر
                            </option>

                            <option value="leave">
                                رخصت
                            </option>

                            <option value="late">
                                تاخیر
                            </option>

                        </select>

                        <input
                            type="text"
                            class="attendance-note"
                            placeholder="نوٹ"
                        >

                    </div>
                `
            )
            .join("");
}


/* =====================================================
   SAVE ATTENDANCE
===================================================== */

async function saveAttendance(
    event
) {

    event?.preventDefault();

    if (!requireAuthentication()) {
        return;
    }

    const message =
        getElement(
            "attendanceMessage"
        );

    clearMessage(message);

    const attendanceDate =
        getValue(
            "attendanceDate"
        ) ||
        todayDate();

    const studentClass =
        getValue(
            "attendanceClass"
        );

    const period =
        Number(
            getValue(
                "attendancePeriod"
            )
        );

    if (!studentClass) {

        showMessage(
            message,
            "درجہ منتخب کریں۔"
        );

        return;
    }

    if (
        !Number.isInteger(period) ||
        period < 1 ||
        period > 6
    ) {

        showMessage(
            message,
            "پیریڈ 1 سے 6 تک منتخب کریں۔"
        );

        return;
    }

    let teacher = null;

    if (isTeacher()) {

        teacher =
            attendanceTeacherRecord ||
            await loadCurrentTeacherRecord();

        if (!teacher) {

            showMessage(
                message,
                "استاد کا ریکارڈ نہیں ملا۔"
            );

            return;
        }
    }


    const rows =
        Array.from(
            document.querySelectorAll(
                ".attendance-row"
            )
        );

    if (rows.length === 0) {

        showMessage(
            message,
            "حاضری کے لیے کوئی طالبہ موجود نہیں ہے۔"
        );

        return;
    }


    const records =
        rows.map(
            row => {

                const studentId =
                    Number(
                        row.dataset.studentId
                    );

                const student =
                    attendanceStudentsCache
                        .find(
                            item =>
                                Number(item.id) ===
                                studentId
                        );

                const status =
                    safeString(
                        row.querySelector(
                            ".attendance-status"
                        )?.value
                    );

                const note =
                    safeString(
                        row.querySelector(
                            ".attendance-note"
                        )?.value
                    );

                return {

                    student_id:
                        studentId,

                    teacher_id:
                        teacher
                            ? teacher.id
                            : null,

                    attendance_date:
                        attendanceDate,

                    class_period:
                        period,

                    period_no:
                        period,

                    status,

                    note:
                        note || null,

                    created_by:
                        currentUser
                            ? currentUser.id
                            : null,

                    student_class:
                        studentClass,

                    student_name:
                        student
                            ? student.name
                            : "",

                    marked_by:
                        currentProfile
                            ? currentProfile.full_name
                            : ""

                };
            }
        );


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    ATTENDANCE_TABLE
                )
                .upsert(
                    records,
                    {
                        onConflict:
                            "student_id,attendance_date,class_period"
                    }
                );

        if (error) {
            throw error;
        }

        showMessage(
            message,
            "حاضری کامیابی سے محفوظ ہو گئی۔",
            "success"
        );

    } catch (error) {

        console.error(
            "Attendance save error:",
            error
        );

        showMessage(
            message,
            error.message ||
            "حاضری محفوظ نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   INITIALIZE ATTENDANCE PAGE
===================================================== */

async function initializeAttendancePage() {

    if (!requireAuthentication()) {
        return;
    }

    if (
        !isAdmin() &&
        !isTeacher()
    ) {

        redirectToDashboard();

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
        "loadAttendanceButton"
    )?.addEventListener(
        "click",
        loadAttendanceStudents
    );

    getElement(
        "attendanceForm"
    )?.addEventListener(
        "submit",
        saveAttendance
    );

    if (isTeacher()) {

        await loadCurrentTeacherRecord();
    }
}


/* =====================================================
   STUDENT APPLICATION MANAGEMENT
===================================================== */

let studentApplicationsCache = [];


async function loadStudentApplications() {

    if (!requireAdmin()) {
        return;
    }

    const container =
        getElement(
            "studentApplicationsList"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "<p>درخواستیں لوڈ ہو رہی ہیں...</p>";

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .select("*")
                .order(
                    "submitted_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        studentApplicationsCache =
            data || [];

        renderStudentApplications();

    } catch (error) {

        console.error(
            "Student applications error:",
            error
        );

        container.innerHTML =
            `<p>${escapeHTML(
                error.message ||
                "درخواستیں لوڈ نہیں ہو سکیں۔"
            )}</p>`;
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
        studentApplicationsCache.length === 0
    ) {

        container.innerHTML =
            "<p>کوئی درخواست موجود نہیں ہے۔</p>";

        return;
    }

    container.innerHTML =
        studentApplicationsCache
            .map(
                application => {

                    const pending =
                        application.status ===
                        "pending";

                    return `

                        <div class="record-card">

                            <h3>
                                ${escapeHTML(
                                    application.name
                                )}
                            </h3>

                            <p>
                                درخواست نمبر:
                                ${escapeHTML(
                                    application.application_no ||
                                    "—"
                                )}
                            </p>

                            <p>
                                والد:
                                ${escapeHTML(
                                    application.father_name ||
                                    "—"
                                )}
                            </p>

                            <p>
                                درجہ:
                                ${escapeHTML(
                                    application.student_class ||
                                    "—"
                                )}
                            </p>

                            <p>
                                حیثیت:
                                ${escapeHTML(
                                    application.status ||
                                    "pending"
                                )}
                            </p>

                            ${
                                pending
                                    ? `

                                        <button
                                            type="button"
                                            onclick="approveStudentApplication(${application.id})"
                                        >
                                            منظور کریں
                                        </button>

                                        <button
                                            type="button"
                                            onclick="rejectStudentApplication(${application.id})"
                                        >
                                            مسترد کریں
                                        </button>

                                    `
                                    : ""
                            }

                        </div>
                    `;
                }
            )
            .join("");
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
                Number(item.id) ===
                Number(id)
        );

    if (!application) {

        alert(
            "درخواست نہیں ملی۔"
        );

        return;
    }

    if (
        application.status !==
        "pending"
    ) {

        alert(
            "یہ درخواست پہلے ہی مکمل ہو چکی ہے۔"
        );

        return;
    }

    const confirmed =
        confirm(
            "کیا آپ اس طالبہ کی درخواست منظور کرنا چاہتے ہیں؟"
        );

    if (!confirmed) {
        return;
    }

    try {

        const studentData = {

            admission_no:
                application.application_no,

            admission_type:
                application.admission_type,

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
                application.mahrams || [],

            status:
                "active"

        };


        const {
            data: student,
            error: studentError
        } =
            await supabaseClient
                .from(
                    STUDENTS_TABLE
                )
                .insert(
                    [studentData]
                )
                .select(
                    "id"
                )
                .single();

        if (studentError) {
            throw studentError;
        }


        const {
            error: applicationError
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .update({

                    status:
                        "approved",

                    reviewed_at:
                        new Date()
                            .toISOString(),

                    approved_student_id:
                        student.id

                })
                .eq(
                    "id",
                    id
                );

        if (applicationError) {
            throw applicationError;
        }


        alert(
            "طالبہ کی درخواست منظور ہو گئی۔"
        );

        await loadStudentApplications();

        await updateDashboardStudentCount();

        await updatePendingApplicationCounts();

    } catch (error) {

        console.error(
            "Approve student error:",
            error
        );

        alert(
            error.message ||
            "درخواست منظور نہیں ہو سکی۔"
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

    const note =
        prompt(
            "درخواست مسترد کرنے کی وجہ لکھیں:"
        );

    if (note === null) {
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

                    admin_note:
                        safeString(note),

                    reviewed_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    id
                );

        if (error) {
            throw error;
        }

        await loadStudentApplications();

        await updatePendingApplicationCounts();

    } catch (error) {

        console.error(
            "Reject student error:",
            error
        );

        alert(
            error.message ||
            "درخواست مسترد نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   TEACHER APPLICATION MANAGEMENT
===================================================== */

let teacherApplicationsCache = [];


async function loadTeacherApplications() {

    if (!requireAdmin()) {
        return;
    }

    const container =
        getElement(
            "teacherApplicationsList"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "<p>درخواستیں لوڈ ہو رہی ہیں...</p>";

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .select("*")
                .order(
                    "submitted_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        teacherApplicationsCache =
            data || [];

        renderTeacherApplications();

    } catch (error) {

        console.error(
            "Teacher applications error:",
            error
        );

        container.innerHTML =
            `<p>${escapeHTML(
                error.message ||
                "درخواستیں لوڈ نہیں ہو سکیں۔"
            )}</p>`;
    }
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
        teacherApplicationsCache.length === 0
    ) {

        container.innerHTML =
            "<p>کوئی درخواست موجود نہیں ہے۔</p>";

        return;
    }

    container.innerHTML =
        teacherApplicationsCache
            .map(
                application => {

                    const pending =
                        application.status ===
                        "pending";

                    return `

                        <div class="record-card">

                            <h3>
                                ${escapeHTML(
                                    application.name
                                )}
                            </h3>

                            <p>
                                درخواست نمبر:
                                ${escapeHTML(
                                    application.application_no ||
                                    "—"
                                )}
                            </p>

                            <p>
                                والد:
                                ${escapeHTML(
                                    application.father_name ||
                                    "—"
                                )}
                            </p>

                            <p>
                                قابلیت:
                                ${escapeHTML(
                                    application.qualification ||
                                    "—"
                                )}
                            </p>

                            <p>
                                حیثیت:
                                ${escapeHTML(
                                    application.status ||
                                    "pending"
                                )}
                            </p>

                            ${
                                pending
                                    ? `

                                        <button
                                            type="button"
                                            onclick="approveTeacherApplication(${application.id})"
                                        >
                                            منظور کریں
                                        </button>

                                        <button
                                            type="button"
                                            onclick="rejectTeacherApplication(${application.id})"
                                        >
                                            مسترد کریں
                                        </button>

                                    `
                                    : ""
                            }

                        </div>
                    `;
                }
            )
            .join("");
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
                Number(item.id) ===
                Number(id)
        );

    if (!application) {

        alert(
            "درخواست نہیں ملی۔"
        );

        return;
    }

    if (
        application.status !==
        "pending"
    ) {

        alert(
            "یہ درخواست پہلے ہی مکمل ہو چکی ہے۔"
        );

        return;
    }

    const confirmed =
        confirm(
            "کیا آپ اس استاد کی درخواست منظور کرنا چاہتے ہیں؟"
        );

    if (!confirmed) {
        return;
    }

    try {

        const teacherData = {

            teacher_code:
                application.application_no,

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
            data: teacher,
            error: teacherError
        } =
            await supabaseClient
                .from(
                    TEACHERS_TABLE
                )
                .insert(
                    [teacherData]
                )
                .select(
                    "id"
                )
                .single();

        if (teacherError) {
            throw teacherError;
        }


        const {
            error: applicationError
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .update({

                    status:
                        "approved",

                    reviewed_at:
                        new Date()
                            .toISOString(),

                    approved_teacher_id:
                        teacher.id

                })
                .eq(
                    "id",
                    id
                );

        if (applicationError) {
            throw applicationError;
        }


        alert(
            "استاد کی درخواست منظور ہو گئی۔"
        );

        await loadTeacherApplications();

        await updateDashboardTeacherCount();

        await updatePendingApplicationCounts();

    } catch (error) {

        console.error(
            "Approve teacher error:",
            error
        );

        alert(
            error.message ||
            "درخواست منظور نہیں ہو سکی۔"
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

    const note =
        prompt(
            "درخواست مسترد کرنے کی وجہ لکھیں:"
        );

    if (note === null) {
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

                    admin_note:
                        safeString(note),

                    reviewed_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    id
                );

        if (error) {
            throw error;
        }

        await loadTeacherApplications();

        await updatePendingApplicationCounts();

    } catch (error) {

        console.error(
            "Reject teacher error:",
            error
        );

        alert(
            error.message ||
            "درخواست مسترد نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   APPLICATION MANAGEMENT PAGE
===================================================== */

async function initializeApplicationsPage() {

    if (!requireAdmin()) {
        return;
    }

    await Promise.allSettled([

        loadStudentApplications(),

        loadTeacherApplications()

    ]);
}


/* =====================================================
   INPUT FORMATTERS
===================================================== */

function initializeInputFormatters() {

    document
        .querySelectorAll(
            'input[id*="CNIC"], input[class*="cnic"]'
        )
        .forEach(
            input => {

                input.addEventListener(
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


    document
        .querySelectorAll(
            'input[type="tel"]'
        )
        .forEach(
            input => {

                input.addEventListener(
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
   PASSWORD TOGGLE
===================================================== */

function initializePasswordToggles() {

    document
        .querySelectorAll(
            "[data-password-toggle]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const targetId =
                            button.dataset
                                .passwordToggle;

                        const input =
                            getElement(
                                targetId
                            );

                        if (!input) {
                            return;
                        }

                        input.type =
                            input.type ===
                            "password"
                                ? "text"
                                : "password";
                    }
                );
            }
        );
}


/* =====================================================
   CLOSE MODALS
===================================================== */

function initializeModalBackgroundClose() {

    [
        studentDetails,
        teacherDetails
    ]
        .filter(Boolean)
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            hideElement(
                                modal
                            );
                        }
                    }
                );
            }
        );
}


/* =====================================================
   PAGE ROUTER
===================================================== */

async function initializeCurrentPage() {

    initializeInputFormatters();

    initializePasswordToggles();

    initializeModalBackgroundClose();


    const publicPages = [

        "",
        "index.html",
        "login.html",
        "student-application.html",
        "teacher-application.html",
        "student-apply.html",
        "teacher-apply.html"

    ];


    if (
        !publicPages.includes(
            currentFile
        )
    ) {

        const authenticated =
            await initializeAuthentication();

        if (!authenticated) {
            return;
        }

        initializeActivityTracking();
    }


    switch (currentFile) {

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


        case "applications.html":

            await initializeApplicationsPage();

            break;


        case "student-application.html":
        case "student-apply.html":

            initializeStudentApplicationPage();

            break;


        case "teacher-application.html":
        case "teacher-apply.html":

            initializeTeacherApplicationPage();

            break;


        default:

            break;
    }
}


/* =====================================================
   GLOBAL LOGOUT BUTTONS
===================================================== */

function initializeLogoutButtons() {

    document
        .querySelectorAll(
            "[data-logout], #logoutButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    logout
                );
            }
        );
}


/* =====================================================
   GLOBAL START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            initializeLogoutButtons();

            await initializeCurrentPage();

        } catch (error) {

            console.error(
                "Initialization error:",
                error
            );
        }
    }
);


/* =====================================================
   GLOBAL FUNCTIONS FOR INLINE BUTTONS
===================================================== */

window.approveStudentApplication =
    approveStudentApplication;

window.rejectStudentApplication =
    rejectStudentApplication;

window.approveTeacherApplication =
    approveTeacherApplication;

window.rejectTeacherApplication =
    rejectTeacherApplication;

window.openStudentForm =
    openStudentForm;

window.closeStudentForm =
    closeStudentForm;

window.openTeacherForm =
    openTeacherForm;

window.closeTeacherForm =
    closeTeacherForm;

window.addMahramField =
    addMahramField;

window.logout =
    logout;


/* =====================================================
   SCRIPT.JS COMPLETE
===================================================== */


