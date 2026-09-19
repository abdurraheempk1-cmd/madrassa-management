/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 1
   بنیادی سیٹ اپ + SUPABASE + عمومی فنکشنز
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://ggtnetudnjsmsmitvjmb.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =====================================================
   TABLE NAMES
===================================================== */

const STUDENTS_TABLE =
    "students";

const TEACHERS_TABLE =
    "teachers";

const STUDENT_APPLICATIONS_TABLE =
    "student_applications";

const TEACHER_APPLICATIONS_TABLE =
    "teacher_applications";

const ACCOUNTS_TABLE =
    "accounts";

const ATTENDANCE_TABLE =
    "attendance";

const AUDIT_LOGS_TABLE =
    "audit_logs";


/* =====================================================
   CURRENT PAGE
===================================================== */

function getCurrentPageName() {

    const path =
        window.location.pathname;

    const file =
        path
            .split("/")
            .pop()
            .toLowerCase();

    return file || "index.html";
}


const currentFile =
    getCurrentPageName();


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


function safeLower(value) {

    return safeString(value)
        .toLowerCase();
}


function getElement(id) {

    return document.getElementById(id);
}


function setText(element, value) {

    if (!element) {
        return;
    }

    element.textContent =
        safeString(value);
}


function showElement(element) {

    if (!element) {
        return;
    }

    element.classList.remove("hidden");
}


function hideElement(element) {

    if (!element) {
        return;
    }

    element.classList.add("hidden");
}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {

    return safeString(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   MESSAGE
===================================================== */

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
            "#15803d";

    } else if (type === "warning") {

        element.style.color =
            "#c2410c";

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


/* =====================================================
   SUPABASE CHECK
===================================================== */

function checkSupabase() {

    if (!window.supabase) {

        console.error(
            "Supabase library not loaded."
        );

        return false;
    }


    if (!supabaseClient) {

        console.error(
            "Supabase client not initialized."
        );

        return false;
    }


    return true;
}


/* =====================================================
   LOGIN SESSION
===================================================== */

function isAuthenticated() {

    return (
        localStorage.getItem(
            "loggedIn"
        ) === "true"
    );
}


function getCurrentRole() {

    return safeLower(
        localStorage.getItem(
            "userRole"
        )
    );
}


function getCurrentUsername() {

    return safeString(
        localStorage.getItem(
            "username"
        )
    );
}


function setLoginSession(
    username,
    role,
    remember = false
) {

    localStorage.setItem(
        "loggedIn",
        "true"
    );

    localStorage.setItem(
        "username",
        safeString(username)
    );

    localStorage.setItem(
        "userRole",
        safeLower(role)
    );

    localStorage.setItem(
        "rememberLogin",
        remember
            ? "true"
            : "false"
    );

    localStorage.setItem(
        "lastActivity",
        String(Date.now())
    );
}


/* =====================================================
   LOGOUT
===================================================== */

function clearLoginSession() {

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "rememberLogin"
    );

    localStorage.removeItem(
        "lastActivity"
    );
}


function logoutUser() {

    clearLoginSession();

    window.location.href =
        "index.html?logout=true";
}


/* =====================================================
   ROLE CHECK
===================================================== */

function isAdmin() {

    return (
        isAuthenticated() &&
        getCurrentRole() === "admin"
    );
}


function isTeacher() {

    return (
        isAuthenticated() &&
        getCurrentRole() === "teacher"
    );
}


function isStudent() {

    return (
        isAuthenticated() &&
        getCurrentRole() === "student"
    );
}


/* =====================================================
   ADMIN SECURITY
===================================================== */

function requireAdmin() {

    if (!isAuthenticated()) {

        window.location.href =
            "index.html";

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
   REDIRECT HELPERS
===================================================== */

function redirectToLogin(role = "") {

    const selectedRole =
        safeLower(role);


    if (selectedRole) {

        sessionStorage.setItem(
            "selectedLoginRole",
            selectedRole
        );
    }


    window.location.href =
        "login.html";
}


function redirectToDashboard() {

    if (!isAuthenticated()) {

        window.location.href =
            "index.html";

        return;
    }


    const role =
        getCurrentRole();


    if (role === "admin") {

        window.location.href =
            "dashboard.html";

        return;
    }


    if (role === "teacher") {

        window.location.href =
            "teacher-dashboard.html";

        return;
    }


    if (role === "student") {

        window.location.href =
            "student-dashboard.html";

        return;
    }


    clearLoginSession();

    window.location.href =
        "index.html";
}


/* =====================================================
   ADMIN ONLY ELEMENTS
===================================================== */

function applyRoleVisibility() {

    const adminElements =
        document.querySelectorAll(
            ".admin-only"
        );


    adminElements.forEach(
        element => {

            if (isAdmin()) {

                element.classList.remove(
                    "hidden"
                );

            } else {

                element.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =====================================================
   CNIC FORMAT
===================================================== */

function formatCNIC(value) {

    const digits =
        safeString(value)
            .replace(/\D/g, "")
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


function getCNICDigits(value) {

    return safeString(value)
        .replace(/\D/g, "");
}


function isValidCNIC(value) {

    return (
        getCNICDigits(value)
            .length === 13
    );
}


/* =====================================================
   PHONE FORMAT
===================================================== */

function cleanPhone(value) {

    return safeString(value)
        .replace(/\D/g, "")
        .slice(0, 11);
}


function isValidPhone(value) {

    const phone =
        cleanPhone(value);

    return (
        phone.length === 11 &&
        phone.startsWith("03")
    );
}


/* =====================================================
   INPUT FORMATTERS
===================================================== */

function attachCNICFormatter(element) {

    if (!element) {
        return;
    }


    element.addEventListener(
        "input",
        function () {

            this.value =
                formatCNIC(
                    this.value
                );
        }
    );
}


function attachPhoneFormatter(element) {

    if (!element) {
        return;
    }


    element.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                );
        }
    );
}


/* =====================================================
   PASSWORD VALIDATION
===================================================== */

function isValidPassword(password) {

    return (
        safeString(password)
            .length >= 8
    );
}


/* =====================================================
   USERNAME VALIDATION
===================================================== */

function isValidUsername(username) {

    const value =
        safeString(username);

    return (
        value.length >= 4 &&
        value.length <= 40
    );
}


/* =====================================================
   APPLICATION NUMBER
===================================================== */

function generateApplicationNumber(
    prefix = "APP"
) {

    const time =
        Date.now()
            .toString()
            .slice(-8);

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return (
        safeString(prefix)
            .toUpperCase() +
        "-" +
        time +
        "-" +
        random
    );
}


/* =====================================================
   DATE
===================================================== */

function getTodayDate() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}


/* =====================================================
   5 MINUTE INACTIVITY LOGOUT
===================================================== */

const INACTIVITY_LIMIT =
    5 * 60 * 1000;


function updateLastActivity() {

    if (!isAuthenticated()) {
        return;
    }

    localStorage.setItem(
        "lastActivity",
        String(Date.now())
    );
}


function checkInactivity() {

    if (!isAuthenticated()) {
        return;
    }


    const lastActivity =
        Number(
            localStorage.getItem(
                "lastActivity"
            )
        );


    if (!lastActivity) {

        updateLastActivity();

        return;
    }


    const inactiveTime =
        Date.now() -
        lastActivity;


    if (
        inactiveTime >=
        INACTIVITY_LIMIT
    ) {

        clearLoginSession();

        alert(
            "غیرفعال رہنے کی وجہ سے آپ کو لاگ آؤٹ کر دیا گیا ہے۔"
        );

        window.location.href =
            "index.html?timeout=true";
    }
}


/* =====================================================
   ACTIVITY EVENTS
===================================================== */

[
    "click",
    "keydown",
    "touchstart",
    "scroll"
].forEach(
    eventName => {

        document.addEventListener(
            eventName,
            updateLastActivity,
            {
                passive: true
            }
        );
    }
);


setInterval(
    checkInactivity,
    30000
);


/* =====================================================
   GLOBAL LOGOUT BUTTON
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const logoutButton =
            event.target.closest(
                "#logoutButton"
            );


        if (!logoutButton) {
            return;
        }


        logoutUser();
    }
);


/* =====================================================
   INITIAL ROLE VISIBILITY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        applyRoleVisibility();
    }
);


/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 2
   HOME + LOGIN + PAGE SECURITY
===================================================== */


/* =====================================================
   HOME PAGE ELEMENTS
===================================================== */

const adminLoginButton =
    getElement("adminLoginButton");

const teacherLoginButton =
    getElement("teacherLoginButton");

const studentLoginButton =
    getElement("studentLoginButton");

const studentApplyButton =
    getElement("studentApplyButton");

const teacherApplyButton =
    getElement("teacherApplyButton");


/* =====================================================
   HOME LOGIN BUTTONS
===================================================== */

function openLoginForRole(role) {

    const cleanRole =
        safeLower(role);


    if (
        ![
            "admin",
            "teacher",
            "student"
        ].includes(cleanRole)
    ) {
        return;
    }


    sessionStorage.setItem(
        "selectedLoginRole",
        cleanRole
    );


    window.location.href =
        "login.html";
}


if (adminLoginButton) {

    adminLoginButton.addEventListener(
        "click",
        function () {

            openLoginForRole(
                "admin"
            );
        }
    );
}


if (teacherLoginButton) {

    teacherLoginButton.addEventListener(
        "click",
        function () {

            openLoginForRole(
                "teacher"
            );
        }
    );
}


if (studentLoginButton) {

    studentLoginButton.addEventListener(
        "click",
        function () {

            openLoginForRole(
                "student"
            );
        }
    );
}


/* =====================================================
   APPLICATION BUTTONS
===================================================== */

if (studentApplyButton) {

    studentApplyButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "student-apply.html";
        }
    );
}


if (teacherApplyButton) {

    teacherApplyButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "teacher-apply.html";
        }
    );
}


/* =====================================================
   LOGIN PAGE ELEMENTS
===================================================== */

const loginForm =
    getElement("loginForm");

const loginRole =
    getElement("loginRole");

const selectedRoleText =
    getElement("selectedRoleText");

const usernameInput =
    getElement("username");

const passwordInput =
    getElement("password");

const rememberMe =
    getElement("rememberMe");

const loginMessage =
    getElement("loginMessage");

const loginButton =
    getElement("loginButton");

const togglePassword =
    getElement("togglePassword");

const backButton =
    getElement("backButton");

const pendingAccountMessage =
    getElement(
        "pendingAccountMessage"
    );

const rejectedAccountMessage =
    getElement(
        "rejectedAccountMessage"
    );


/* =====================================================
   ROLE TEXT
===================================================== */

function getRoleUrdu(role) {

    switch (
        safeLower(role)
    ) {

        case "admin":
            return "ایڈمن";

        case "teacher":
            return "استاد";

        case "student":
            return "طالبہ";

        default:
            return "منتخب نہیں";
    }
}


/* =====================================================
   INITIALIZE LOGIN PAGE
===================================================== */

function initializeLoginPage() {

    if (
        currentFile !== "login.html"
    ) {
        return;
    }


    const selectedRole =
        safeLower(
            sessionStorage.getItem(
                "selectedLoginRole"
            )
        );


    if (
        ![
            "admin",
            "teacher",
            "student"
        ].includes(selectedRole)
    ) {

        window.location.href =
            "index.html";

        return;
    }


    if (loginRole) {

        loginRole.value =
            selectedRole;
    }


    if (selectedRoleText) {

        selectedRoleText.textContent =
            getRoleUrdu(
                selectedRole
            );
    }


    const rememberedUsername =
        localStorage.getItem(
            "rememberedUsername"
        );


    const rememberedRole =
        safeLower(
            localStorage.getItem(
                "rememberedRole"
            )
        );


    if (
        usernameInput &&
        rememberedUsername &&
        rememberedRole === selectedRole
    ) {

        usernameInput.value =
            rememberedUsername;


        if (rememberMe) {

            rememberMe.checked =
                true;
        }
    }


    hideElement(
        pendingAccountMessage
    );

    hideElement(
        rejectedAccountMessage
    );
}


/* =====================================================
   PASSWORD VISIBILITY
===================================================== */

if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        function () {

            const isHidden =
                passwordInput.type ===
                "password";


            passwordInput.type =
                isHidden
                    ? "text"
                    : "password";


            togglePassword.textContent =
                isHidden
                    ? "🙈"
                    : "👁️";


            togglePassword.setAttribute(
                "aria-label",
                isHidden
                    ? "پاس ورڈ چھپائیں"
                    : "پاس ورڈ دکھائیں"
            );
        }
    );
}


/* =====================================================
   LOGIN BACK BUTTON
===================================================== */

if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );
}


/* =====================================================
   ACCOUNT LOOKUP
===================================================== */

async function findLoginAccount(
    username,
    role
) {

    if (!checkSupabase()) {

        throw new Error(
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                ACCOUNTS_TABLE
            )
            .select("*")
            .eq(
                "username",
                username
            )
            .eq(
                "role",
                role
            )
            .maybeSingle();


    if (error) {

        throw error;
    }


    return data;
}


/* =====================================================
   ACCOUNT STATUS
===================================================== */

function getAccountStatus(account) {

    if (!account) {
        return "";
    }


    return safeLower(
        account.status ||
        account.account_status
    );
}


/* =====================================================
   PASSWORD CHECK
===================================================== */

function accountPasswordMatches(
    account,
    password
) {

    if (!account) {
        return false;
    }


    /*
       یہ موجودہ frontend login structure کے لیے ہے۔

       Production system میں plain-text password
       database میں محفوظ نہیں ہونا چاہیے۔

       بعد میں Supabase Auth استعمال کرنا بہتر ہوگا۔
    */

    const storedPassword =
        safeString(
            account.password
        );


    return (
        storedPassword !== "" &&
        storedPassword ===
        safeString(password)
    );
}


/* =====================================================
   LOGIN SUBMIT
===================================================== */

async function handleLoginSubmit(
    event
) {

    event.preventDefault();


    clearMessage(
        loginMessage
    );

    hideElement(
        pendingAccountMessage
    );

    hideElement(
        rejectedAccountMessage
    );


    const username =
        safeString(
            usernameInput?.value
        );


    const password =
        safeString(
            passwordInput?.value
        );


    const role =
        safeLower(
            loginRole?.value
        );


    if (
        !username ||
        !password ||
        !role
    ) {

        showMessage(
            loginMessage,
            "تمام معلومات درج کریں۔"
        );

        return;
    }


    if (
        ![
            "admin",
            "teacher",
            "student"
        ].includes(role)
    ) {

        showMessage(
            loginMessage,
            "اکاؤنٹ کی قسم درست نہیں ہے۔"
        );

        return;
    }


    if (loginButton) {

        loginButton.disabled =
            true;

        loginButton.textContent =
            "⏳ جانچ جاری ہے...";
    }


    try {

        const account =
            await findLoginAccount(
                username,
                role
            );


        if (!account) {

            showMessage(
                loginMessage,
                "صارف نام یا پاس ورڈ درست نہیں ہے۔"
            );

            return;
        }


        const status =
            getAccountStatus(
                account
            );


        if (
            status === "pending"
        ) {

            showElement(
                pendingAccountMessage
            );

            showMessage(
                loginMessage,
                "آپ کا اکاؤنٹ ابھی زیرِ منظوری ہے۔",
                "warning"
            );

            return;
        }


        if (
            status === "rejected"
        ) {

            showElement(
                rejectedAccountMessage
            );

            showMessage(
                loginMessage,
                "آپ کی درخواست منظور نہیں ہوئی۔"
            );

            return;
        }


        if (
            status !== "active" &&
            status !== "approved"
        ) {

            showMessage(
                loginMessage,
                "یہ اکاؤنٹ فعال نہیں ہے۔"
            );

            return;
        }


        if (
            !accountPasswordMatches(
                account,
                password
            )
        ) {

            showMessage(
                loginMessage,
                "صارف نام یا پاس ورڈ درست نہیں ہے۔"
            );

            return;
        }


        const remember =
            Boolean(
                rememberMe?.checked
            );


        setLoginSession(
            username,
            role,
            remember
        );


        if (remember) {

            localStorage.setItem(
                "rememberedUsername",
                username
            );

            localStorage.setItem(
                "rememberedRole",
                role
            );

        } else {

            localStorage.removeItem(
                "rememberedUsername"
            );

            localStorage.removeItem(
                "rememberedRole"
            );
        }


        showMessage(
            loginMessage,
            "لاگ اِن کامیاب۔",
            "success"
        );


        redirectToDashboard();


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            loginMessage,
            "لاگ اِن کے دوران مسئلہ پیش آیا۔"
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


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        handleLoginSubmit
    );
}


/* =====================================================
   PROTECTED PAGES
===================================================== */

const protectedPages = [

    "dashboard.html",

    "students.html",

    "teachers.html",

    "attendance.html",

    "approvals.html",

    "teacher-dashboard.html",

    "student-dashboard.html"

];


function protectCurrentPage() {

    if (
        !protectedPages.includes(
            currentFile
        )
    ) {
        return;
    }


    if (!isAuthenticated()) {

        window.location.href =
            "index.html";

        return;
    }


    const role =
        getCurrentRole();


    if (
        currentFile ===
            "dashboard.html" &&
        role !== "admin"
    ) {

        redirectToDashboard();

        return;
    }


    if (
        currentFile ===
            "approvals.html" &&
        role !== "admin"
    ) {

        redirectToDashboard();

        return;
    }


    if (
        currentFile ===
            "teacher-dashboard.html" &&
        role !== "teacher"
    ) {

        redirectToDashboard();

        return;
    }


    if (
        currentFile ===
            "student-dashboard.html" &&
        role !== "student"
    ) {

        redirectToDashboard();
    }
}


/* =====================================================
   BACK TO DASHBOARD
===================================================== */

const backToDashboard =
    getElement(
        "backToDashboard"
    );


if (backToDashboard) {

    backToDashboard.addEventListener(
        "click",
        function () {

            redirectToDashboard();
        }
    );
}


/* =====================================================
   BACK TO HOME
===================================================== */

const backToHome =
    getElement(
        "backToHome"
    );


if (backToHome) {

    backToHome.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );
}


/* =====================================================
   PAGE START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        protectCurrentPage();

        initializeLoginPage();

        applyRoleVisibility();
    }
);


/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 3
   STUDENT MODULE
   طالبات: فارم + محرم + فہرست + تلاش
===================================================== */


/* =====================================================
   STUDENT ELEMENTS
===================================================== */

const studentFormContainer =
    getElement("studentFormContainer");

const studentForm =
    getElement("studentForm");

const studentFormMessage =
    getElement("studentFormMessage");

const showStudentFormButton =
    getElement("showStudentForm");

const cancelStudentFormButton =
    getElement("cancelStudentForm");

const saveStudentButton =
    getElement("saveStudentButton");

const studentList =
    getElement("studentsList");

const studentListMessage =
    getElement("studentListMessage");

const studentCount =
    getElement("studentCount");

const studentSearch =
    getElement("studentSearch");

const formTitle =
    getElement("formTitle");

const editStudentId =
    getElement("editStudentId");


/* =====================================================
   STUDENT FORM FIELDS
===================================================== */

const admissionType =
    getElement("admissionType");

const admissionNo =
    getElement("admissionNo");

const previousMadrassa =
    getElement("previousMadrassa");

const previousMadrassaGroup =
    getElement("previousMadrassaGroup");

const transferDate =
    getElement("transferDate");

const transferDateGroup =
    getElement("transferDateGroup");

const studentName =
    getElement("studentName");

const fatherName =
    getElement("fatherName");

const guardianName =
    getElement("guardianName");

const studentCNIC =
    getElement("studentCNIC");

const dateOfBirth =
    getElement("dateOfBirth");

const studentClass =
    getElement("studentClass");

const phone =
    getElement("phone");

const admissionDate =
    getElement("admissionDate");

const address =
    getElement("address");

const residenceType =
    getElement("residenceType");

const studentStatus =
    getElement("studentStatus");


/* =====================================================
   MAHRAM ELEMENTS
===================================================== */

const mahramSection =
    getElement("mahramSection");

const mahramList =
    getElement("mahramList");

const addMahramButton =
    getElement("addMahram");

const mahramConfirmation =
    getElement("mahramConfirmation");


/* =====================================================
   STUDENT DETAILS
===================================================== */

const studentDetailsOverlay =
    getElement("studentDetailsOverlay");

const studentDetailsContent =
    getElement("studentDetailsContent");

const closeStudentDetails =
    getElement("closeStudentDetails");


/* =====================================================
   STUDENT CACHE
===================================================== */

let studentsCache = [];

let editingStudentId = null;

let mahramCounter = 0;


/* =====================================================
   TRANSFER FIELDS
===================================================== */

function updateTransferFields() {

    if (!admissionType) {
        return;
    }


    const isTransfer =
        admissionType.value ===
        "منتقلی";


    if (isTransfer) {

        showElement(
            previousMadrassaGroup
        );

        showElement(
            transferDateGroup
        );


        if (previousMadrassa) {

            previousMadrassa.required =
                true;
        }


        if (transferDate) {

            transferDate.required =
                true;
        }

    } else {

        hideElement(
            previousMadrassaGroup
        );

        hideElement(
            transferDateGroup
        );


        if (previousMadrassa) {

            previousMadrassa.required =
                false;

            previousMadrassa.value =
                "";
        }


        if (transferDate) {

            transferDate.required =
                false;

            transferDate.value =
                "";
        }
    }
}


if (admissionType) {

    admissionType.addEventListener(
        "change",
        updateTransferFields
    );
}


/* =====================================================
   RESIDENCE / HOSTEL
===================================================== */

function updateResidenceFields() {

    if (!residenceType) {
        return;
    }


    const hostel =
        residenceType.value ===
        "ہاسٹل";


    if (hostel) {

        showElement(
            mahramSection
        );


        if (
            mahramList &&
            mahramList.children.length === 0
        ) {

            addMahram();
        }

    } else {

        hideElement(
            mahramSection
        );


        if (mahramConfirmation) {

            mahramConfirmation.checked =
                false;
        }
    }
}


if (residenceType) {

    residenceType.addEventListener(
        "change",
        updateResidenceFields
    );
}


/* =====================================================
   MAHRAM CARD
===================================================== */

function createMahramCard(
    data = {}
) {

    mahramCounter += 1;


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "mahram-card";


    card.dataset.mahramId =
        String(mahramCounter);


    card.innerHTML = `

        <div class="mahram-header">

            <strong>
                محرم نمبر ${mahramCounter}
            </strong>

            <button
                type="button"
                class="remove-mahram"
            >
                ❌ حذف کریں
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
                    required
                    placeholder="محرم کا نام"
                    value="${escapeHTML(
                        data.name || ""
                    )}"
                >

            </div>


            <div class="form-group">

                <label>
                    رشتہ
                </label>

                <input
                    type="text"
                    class="mahram-relation"
                    required
                    placeholder="مثلاً والد، بھائی، چچا"
                    value="${escapeHTML(
                        data.relation || ""
                    )}"
                >

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
                    required
                    placeholder="03XXXXXXXXX"
                    value="${escapeHTML(
                        data.phone || ""
                    )}"
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
                    required
                    placeholder="00000-0000000-0"
                    value="${escapeHTML(
                        data.cnic || ""
                    )}"
                >

            </div>


        </div>
    `;


    const removeButton =
        card.querySelector(
            ".remove-mahram"
        );


    const phoneInput =
        card.querySelector(
            ".mahram-phone"
        );


    const cnicInput =
        card.querySelector(
            ".mahram-cnic"
        );


    attachPhoneFormatter(
        phoneInput
    );

    attachCNICFormatter(
        cnicInput
    );


    removeButton?.addEventListener(
        "click",
        function () {

            card.remove();

            renumberMahrams();
        }
    );


    return card;
}


/* =====================================================
   ADD MAHRAM
===================================================== */

function addMahram(
    data = {}
) {

    if (!mahramList) {
        return;
    }


    if (
        mahramList.children.length >= 5
    ) {

        showMessage(
            studentFormMessage,
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔",
            "warning"
        );

        return;
    }


    const card =
        createMahramCard(
            data
        );


    mahramList.appendChild(
        card
    );


    renumberMahrams();
}


/* =====================================================
   RENUMBER MAHRAMS
===================================================== */

function renumberMahrams() {

    if (!mahramList) {
        return;
    }


    const cards =
        mahramList.querySelectorAll(
            ".mahram-card"
        );


    cards.forEach(
        (card, index) => {

            const title =
                card.querySelector(
                    ".mahram-header strong"
                );


            if (title) {

                title.textContent =
                    `محرم نمبر ${index + 1}`;
            }
        }
    );
}


/* =====================================================
   ADD MAHRAM BUTTON
===================================================== */

if (addMahramButton) {

    addMahramButton.addEventListener(
        "click",
        function () {

            addMahram();
        }
    );
}


/* =====================================================
   GET MAHRAMS
===================================================== */

function getMahramsFromForm() {

    if (!mahramList) {

        return [];
    }


    const cards =
        mahramList.querySelectorAll(
            ".mahram-card"
        );


    return Array.from(cards)
        .map(
            card => {

                return {

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
                        cleanPhone(
                            card.querySelector(
                                ".mahram-phone"
                            )?.value
                        ),

                    cnic:
                        formatCNIC(
                            card.querySelector(
                                ".mahram-cnic"
                            )?.value
                        )
                };
            }
        );
}


/* =====================================================
   VALIDATE MAHRAMS
===================================================== */

function validateMahrams(
    mahrams
) {

    if (
        residenceType?.value !==
        "ہاسٹل"
    ) {

        return true;
    }


    if (
        !Array.isArray(mahrams) ||
        mahrams.length < 1
    ) {

        showMessage(
            studentFormMessage,
            "ہاسٹل طالبہ کے لیے کم از کم ایک محرم ضروری ہے۔"
        );

        return false;
    }


    if (
        mahrams.length > 5
    ) {

        showMessage(
            studentFormMessage,
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return false;
    }


    for (
        let i = 0;
        i < mahrams.length;
        i += 1
    ) {

        const mahram =
            mahrams[i];


        if (
            !mahram.name ||
            !mahram.relation
        ) {

            showMessage(
                studentFormMessage,
                `محرم نمبر ${i + 1} کی مکمل معلومات درج کریں۔`
            );

            return false;
        }


        if (
            !isValidPhone(
                mahram.phone
            )
        ) {

            showMessage(
                studentFormMessage,
                `محرم نمبر ${i + 1} کا موبائل نمبر درست نہیں ہے۔`
            );

            return false;
        }


        if (
            !isValidCNIC(
                mahram.cnic
            )
        ) {

            showMessage(
                studentFormMessage,
                `محرم نمبر ${i + 1} کا شناختی کارڈ نمبر درست نہیں ہے۔`
            );

            return false;
        }
    }


    if (
        !mahramConfirmation?.checked
    ) {

        showMessage(
            studentFormMessage,
            "محرم کی تصدیق ضروری ہے۔"
        );

        return false;
    }


    return true;
}


/* =====================================================
   RESET STUDENT FORM
===================================================== */

function resetStudentForm() {

    if (!studentForm) {
        return;
    }


    studentForm.reset();


    editingStudentId =
        null;


    if (editStudentId) {

        editStudentId.value =
            "";
    }


    if (formTitle) {

        formTitle.textContent =
            "نئی طالبہ کا اندراج";
    }


    if (mahramList) {

        mahramList.innerHTML =
            "";
    }


    mahramCounter = 0;


    hideElement(
        previousMadrassaGroup
    );

    hideElement(
        transferDateGroup
    );

    hideElement(
        mahramSection
    );


    clearMessage(
        studentFormMessage
    );


    if (studentStatus) {

        studentStatus.value =
            "active";
    }


    if (admissionDate) {

        admissionDate.value =
            getTodayDate();
    }
}


/* =====================================================
   OPEN STUDENT FORM
===================================================== */

function openStudentForm() {

    if (!requireAdmin()) {
        return;
    }


    resetStudentForm();


    showElement(
        studentFormContainer
    );


    studentFormContainer?.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );
}


if (showStudentFormButton) {

    showStudentFormButton.addEventListener(
        "click",
        openStudentForm
    );
}


/* =====================================================
   CANCEL STUDENT FORM
===================================================== */

if (cancelStudentFormButton) {

    cancelStudentFormButton.addEventListener(
        "click",
        function () {

            resetStudentForm();

            hideElement(
                studentFormContainer
            );
        }
    );
}


/* =====================================================
   STUDENT INPUT FORMATTERS
===================================================== */

attachCNICFormatter(
    studentCNIC
);

attachPhoneFormatter(
    phone
);


/* =====================================================
   LOAD STUDENTS
===================================================== */

async function loadStudents() {

    if (
        currentFile !==
        "students.html"
    ) {
        return;
    }


    if (!checkSupabase()) {
        return;
    }


    showMessage(
        studentListMessage,
        "طالبات کا ریکارڈ لوڈ ہو رہا ہے۔",
        "warning"
    );


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


        renderStudents(
            studentsCache
        );


        clearMessage(
            studentListMessage
        );


    } catch (error) {

        console.error(
            "Load students error:",
            error
        );


        studentsCache =
            [];


        renderStudents(
            []
        );


        showMessage(
            studentListMessage,
            "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   STUDENT STATUS
===================================================== */

function getStudentStatusText(
    status
) {

    return (
        safeLower(status) ===
        "inactive"
            ? "غیر فعال"
            : "فعال"
    );
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


    const list =
        Array.isArray(students)
            ? students
            : [];


    if (studentCount) {

        const activeCount =
            list.filter(
                student =>
                    safeLower(
                        student.status
                    ) !== "inactive"
            ).length;


        studentCount.textContent =
            String(activeCount);
    }


    if (list.length === 0) {

        studentList.innerHTML = `

            <div class="empty-students">

                <div class="empty-icon">
                    👧
                </div>

                کوئی طالبہ موجود نہیں۔

            </div>
        `;

        return;
    }


    studentList.innerHTML =
        list.map(
            student => {

                const id =
                    escapeHTML(
                        student.id
                    );

                const name =
                    escapeHTML(
                        student.name
                    );

                const father =
                    escapeHTML(
                        student.father_name
                    );

                const number =
                    escapeHTML(
                        student.admission_no
                    );

                const className =
                    escapeHTML(
                        student.student_class
                    );

                const studentPhone =
                    escapeHTML(
                        student.phone
                    );

                const residence =
                    escapeHTML(
                        student.residence_type
                    );

                const status =
                    escapeHTML(
                        getStudentStatusText(
                            student.status
                        )
                    );


                return `

                    <div
                        class="student-card"
                        data-id="${id}"
                    >

                        <div class="student-card-header">

                            <div class="student-avatar">
                                👧
                            </div>

                            <div>

                                <h3>
                                    ${name || "نام موجود نہیں"}
                                </h3>

                                <span>
                                    داخلہ نمبر:
                                    ${number || "-"}
                                </span>

                            </div>

                        </div>


                        <div class="student-badges">

                            <span>
                                📚 ${className || "-"}
                            </span>

                            <span>
                                🏠 ${residence || "-"}
                            </span>

                            <span>
                                ${status}
                            </span>

                        </div>


                        <div class="student-info">

                            <p>
                                <strong>
                                    والد:
                                </strong>
                                ${father || "-"}
                            </p>

                            <p>
                                <strong>
                                    موبائل:
                                </strong>
                                ${studentPhone || "-"}
                            </p>

                        </div>


                        <div class="student-card-buttons">

                            <button
                                type="button"
                                class="view-student"
                                data-id="${id}"
                            >
                                👁️ تفصیلات
                            </button>

                            ${
                                isAdmin()
                                    ? `
                                    <button
                                        type="button"
                                        class="edit-student"
                                        data-id="${id}"
                                    >
                                        ✏️ ترمیم
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-student"
                                        data-id="${id}"
                                    >
                                        🗑️ حذف
                                    </button>
                                    `
                                    : ""
                            }

                        </div>

                    </div>
                `;
            }
        )
        .join("");


    attachStudentCardEvents();
}


/* =====================================================
   STUDENT CARD EVENTS
===================================================== */

function attachStudentCardEvents() {

    if (!studentList) {
        return;
    }


    studentList
        .querySelectorAll(
            ".view-student"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        showStudentDetails(
                            this.dataset.id
                        );
                    }
                );
            }
        );


    studentList
        .querySelectorAll(
            ".edit-student"
        )
        .forEach(
            button => {

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


    studentList
        .querySelectorAll(
            ".delete-student"
        )
        .forEach(
            button => {

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
   STUDENT SEARCH
===================================================== */

if (studentSearch) {

    studentSearch.addEventListener(
        "input",
        function () {

            const query =
                safeLower(
                    this.value
                );


            if (!query) {

                renderStudents(
                    studentsCache
                );

                return;
            }


            const filtered =
                studentsCache.filter(
                    student => {

                        const searchable =
                            [
                                student.name,
                                student.father_name,
                                student.admission_no,
                                student.phone,
                                student.cnic,
                                student.student_class
                            ]
                                .map(
                                    safeLower
                                )
                                .join(" ");


                        return searchable.includes(
                            query
                        );
                    }
                );


            renderStudents(
                filtered
            );
        }
    );
}


/* =====================================================
   STUDENT PAGE INITIALIZATION
===================================================== */

function initializeStudentsPage() {

    if (
        currentFile !==
        "students.html"
    ) {
        return;
    }


    applyRoleVisibility();


    if (admissionDate) {

        admissionDate.max =
            getTodayDate();
    }


    if (dateOfBirth) {

        dateOfBirth.max =
            getTodayDate();
    }


    resetStudentForm();

    hideElement(
        studentFormContainer
    );


    loadStudents();
}


/* =====================================================
   START STUDENT MODULE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeStudentsPage();
    }
);


/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 4
   STUDENT SAVE + EDIT + DETAILS + DELETE
===================================================== */


/* =====================================================
   GET STUDENT FORM DATA
===================================================== */

function getStudentFormData() {

    const mahrams =
        getMahramsFromForm();


    return {

        admission_no:
            safeString(
                admissionNo?.value
            ),

        admission_type:
            safeString(
                admissionType?.value
            ),

        name:
            safeString(
                studentName?.value
            ),

        father_name:
            safeString(
                fatherName?.value
            ),

        guardian_name:
            safeString(
                guardianName?.value
            ),

        cnic:
            formatCNIC(
                studentCNIC?.value
            ),

        phone:
            cleanPhone(
                phone?.value
            ),

        date_of_birth:
            safeString(
                dateOfBirth?.value
            ) || null,

        student_class:
            safeString(
                studentClass?.value
            ),

        admission_date:
            safeString(
                admissionDate?.value
            ) || null,

        address:
            safeString(
                address?.value
            ),

        residence_type:
            safeString(
                residenceType?.value
            ),

        previous_madrassa:
            admissionType?.value ===
            "منتقلی"
                ? safeString(
                    previousMadrassa?.value
                )
                : null,

        transfer_date:
            admissionType?.value ===
            "منتقلی"
                ? (
                    safeString(
                        transferDate?.value
                    ) || null
                )
                : null,

        mahrams:
            residenceType?.value ===
            "ہاسٹل"
                ? mahrams
                : [],

        status:
            safeLower(
                studentStatus?.value
            ) || "active"
    };
}


/* =====================================================
   VALIDATE STUDENT FORM
===================================================== */

function validateStudentFormData(
    data
) {

    if (!data.admission_type) {

        showMessage(
            studentFormMessage,
            "داخلہ کی قسم منتخب کریں۔"
        );

        return false;
    }


    if (!data.admission_no) {

        showMessage(
            studentFormMessage,
            "داخلہ نمبر درج کریں۔"
        );

        return false;
    }


    if (!data.name) {

        showMessage(
            studentFormMessage,
            "طالبہ کا نام درج کریں۔"
        );

        return false;
    }


    if (!data.father_name) {

        showMessage(
            studentFormMessage,
            "والد کا نام درج کریں۔"
        );

        return false;
    }


    if (!data.guardian_name) {

        showMessage(
            studentFormMessage,
            "سرپرست کا نام درج کریں۔"
        );

        return false;
    }


    if (
        !isValidCNIC(
            data.cnic
        )
    ) {

        showMessage(
            studentFormMessage,
            "شناختی کارڈ / ب فارم نمبر 13 ہندسوں کا ہونا چاہیے۔"
        );

        return false;
    }


    if (
        !isValidPhone(
            data.phone
        )
    ) {

        showMessage(
            studentFormMessage,
            "موبائل نمبر درست درج کریں۔"
        );

        return false;
    }


    if (!data.date_of_birth) {

        showMessage(
            studentFormMessage,
            "تاریخ پیدائش درج کریں۔"
        );

        return false;
    }


    if (!data.student_class) {

        showMessage(
            studentFormMessage,
            "کلاس منتخب کریں۔"
        );

        return false;
    }


    if (!data.admission_date) {

        showMessage(
            studentFormMessage,
            "داخلہ کی تاریخ درج کریں۔"
        );

        return false;
    }


    if (!data.address) {

        showMessage(
            studentFormMessage,
            "مکمل پتہ درج کریں۔"
        );

        return false;
    }


    if (!data.residence_type) {

        showMessage(
            studentFormMessage,
            "رہائش کی قسم منتخب کریں۔"
        );

        return false;
    }


    if (
        data.admission_type ===
        "منتقلی"
    ) {

        if (
            !data.previous_madrassa
        ) {

            showMessage(
                studentFormMessage,
                "سابقہ مدرسہ درج کریں۔"
            );

            return false;
        }


        if (
            !data.transfer_date
        ) {

            showMessage(
                studentFormMessage,
                "منتقلی کی تاریخ درج کریں۔"
            );

            return false;
        }
    }


    if (
        !validateMahrams(
            data.mahrams
        )
    ) {

        return false;
    }


    return true;
}


/* =====================================================
   DUPLICATE STUDENT CHECK
===================================================== */

async function studentDuplicateExists(
    data,
    excludeId = null
) {

    let query =
        supabaseClient
            .from(
                STUDENTS_TABLE
            )
            .select(
                "id, admission_no, cnic"
            )
            .or(
                `admission_no.eq.${data.admission_no},cnic.eq.${data.cnic}`
            );


    if (excludeId !== null) {

        query =
            query.neq(
                "id",
                excludeId
            );
    }


    const {
        data: duplicateRows,
        error
    } =
        await query;


    if (error) {

        throw error;
    }


    return (
        Array.isArray(
            duplicateRows
        ) &&
        duplicateRows.length > 0
    );
}


/* =====================================================
   SAVE STUDENT
===================================================== */

async function saveStudent(
    event
) {

    event.preventDefault();


    if (!requireAdmin()) {
        return;
    }


    clearMessage(
        studentFormMessage
    );


    const data =
        getStudentFormData();


    if (
        !validateStudentFormData(
            data
        )
    ) {

        return;
    }


    if (saveStudentButton) {

        saveStudentButton.disabled =
            true;

        saveStudentButton.textContent =
            "⏳ محفوظ ہو رہا ہے...";
    }


    try {

        const duplicate =
            await studentDuplicateExists(
                data,
                editingStudentId
            );


        if (duplicate) {

            showMessage(
                studentFormMessage,
                "یہ داخلہ نمبر یا شناختی کارڈ نمبر پہلے سے موجود ہے۔"
            );

            return;
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


            await createAuditLog(
                "student_updated",
                "student",
                editingStudentId,
                data.name
            );


            showMessage(
                studentFormMessage,
                "طالبہ کا ریکارڈ کامیابی سے اپ ڈیٹ ہوگیا۔",
                "success"
            );


        } else {

            const {
                data: inserted,
                error
            } =
                await supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .insert(
                        [data]
                    )
                    .select()
                    .single();


            if (error) {

                throw error;
            }


            await createAuditLog(
                "student_created",
                "student",
                inserted?.id,
                data.name
            );


            showMessage(
                studentFormMessage,
                "نئی طالبہ کامیابی سے شامل ہوگئی۔",
                "success"
            );
        }


        await loadStudents();


        setTimeout(
            function () {

                resetStudentForm();

                hideElement(
                    studentFormContainer
                );

            },
            800
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

        if (saveStudentButton) {

            saveStudentButton.disabled =
                false;

            saveStudentButton.textContent =
                "💾 محفوظ کریں";
        }
    }
}


/* =====================================================
   STUDENT FORM SUBMIT
===================================================== */

if (studentForm) {

    studentForm.addEventListener(
        "submit",
        saveStudent
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
            item =>
                String(item.id) ===
                String(id)
        );


    if (!student) {

        showMessage(
            studentListMessage,
            "طالبہ کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    resetStudentForm();


    editingStudentId =
        student.id;


    if (editStudentId) {

        editStudentId.value =
            safeString(
                student.id
            );
    }


    if (formTitle) {

        formTitle.textContent =
            "طالبہ کی معلومات میں ترمیم";
    }


    if (admissionType) {

        admissionType.value =
            safeString(
                student.admission_type
            );
    }


    if (admissionNo) {

        admissionNo.value =
            safeString(
                student.admission_no
            );
    }


    if (studentName) {

        studentName.value =
            safeString(
                student.name
            );
    }


    if (fatherName) {

        fatherName.value =
            safeString(
                student.father_name
            );
    }


    if (guardianName) {

        guardianName.value =
            safeString(
                student.guardian_name
            );
    }


    if (studentCNIC) {

        studentCNIC.value =
            formatCNIC(
                student.cnic
            );
    }


    if (dateOfBirth) {

        dateOfBirth.value =
            safeString(
                student.date_of_birth
            );
    }


    if (studentClass) {

        studentClass.value =
            safeString(
                student.student_class
            );
    }


    if (phone) {

        phone.value =
            cleanPhone(
                student.phone
            );
    }


    if (admissionDate) {

        admissionDate.value =
            safeString(
                student.admission_date
            );
    }


    if (address) {

        address.value =
            safeString(
                student.address
            );
    }


    if (residenceType) {

        residenceType.value =
            safeString(
                student.residence_type
            );
    }


    if (studentStatus) {

        studentStatus.value =
            safeLower(
                student.status
            ) || "active";
    }


    if (previousMadrassa) {

        previousMadrassa.value =
            safeString(
                student.previous_madrassa
            );
    }


    if (transferDate) {

        transferDate.value =
            safeString(
                student.transfer_date
            );
    }


    updateTransferFields();

    updateResidenceFields();


    if (mahramList) {

        mahramList.innerHTML =
            "";
    }


    mahramCounter = 0;


    if (
        student.residence_type ===
        "ہاسٹل"
    ) {

        let mahrams =
            student.mahrams;


        if (
            typeof mahrams ===
            "string"
        ) {

            try {

                mahrams =
                    JSON.parse(
                        mahrams
                    );

            } catch {

                mahrams =
                    [];
            }
        }


        if (
            Array.isArray(mahrams)
        ) {

            mahrams
                .slice(0, 5)
                .forEach(
                    mahram => {

                        addMahram(
                            mahram
                        );
                    }
                );
        }


        if (
            mahramList &&
            mahramList.children.length === 0
        ) {

            addMahram();
        }


        if (mahramConfirmation) {

            mahramConfirmation.checked =
                true;
        }
    }


    showElement(
        studentFormContainer
    );


    studentFormContainer?.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );
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
        !studentDetailsContent ||
        !studentDetailsOverlay
    ) {

        return;
    }


    let mahrams =
        student.mahrams;


    if (
        typeof mahrams ===
        "string"
    ) {

        try {

            mahrams =
                JSON.parse(
                    mahrams
                );

        } catch {

            mahrams =
                [];
        }
    }


    if (
        !Array.isArray(mahrams)
    ) {

        mahrams =
            [];
    }


    const mahramHTML =
        mahrams.length
            ? mahrams.map(
                (mahram, index) => `

                    <div class="mahram-card">

                        <strong>
                            محرم نمبر ${index + 1}
                        </strong>

                        <p>
                            <strong>نام:</strong>
                            ${escapeHTML(mahram.name) || "-"}
                        </p>

                        <p>
                            <strong>رشتہ:</strong>
                            ${escapeHTML(mahram.relation) || "-"}
                        </p>

                        <p>
                            <strong>موبائل:</strong>
                            ${escapeHTML(mahram.phone) || "-"}
                        </p>

                        <p>
                            <strong>شناختی کارڈ:</strong>
                            ${escapeHTML(mahram.cnic) || "-"}
                        </p>

                    </div>

                `
            ).join("")
            : `
                <p>
                    کوئی محرم درج نہیں۔
                </p>
            `;


    studentDetailsContent.innerHTML = `

        <h3>
            👧 بنیادی معلومات
        </h3>

        <p>
            <strong>طالبہ:</strong>
            ${escapeHTML(student.name) || "-"}
        </p>

        <p>
            <strong>والد:</strong>
            ${escapeHTML(student.father_name) || "-"}
        </p>

        <p>
            <strong>سرپرست:</strong>
            ${escapeHTML(student.guardian_name) || "-"}
        </p>

        <p>
            <strong>شناختی کارڈ / ب فارم:</strong>
            ${escapeHTML(student.cnic) || "-"}
        </p>

        <p>
            <strong>تاریخ پیدائش:</strong>
            ${escapeHTML(student.date_of_birth) || "-"}
        </p>

        <p>
            <strong>موبائل:</strong>
            ${escapeHTML(student.phone) || "-"}
        </p>


        <h3>
            📚 داخلہ کی معلومات
        </h3>

        <p>
            <strong>داخلہ نمبر:</strong>
            ${escapeHTML(student.admission_no) || "-"}
        </p>

        <p>
            <strong>داخلہ کی قسم:</strong>
            ${escapeHTML(student.admission_type) || "-"}
        </p>

        <p>
            <strong>کلاس:</strong>
            ${escapeHTML(student.student_class) || "-"}
        </p>

        <p>
            <strong>داخلہ کی تاریخ:</strong>
            ${escapeHTML(student.admission_date) || "-"}
        </p>

        ${
            student.admission_type ===
            "منتقلی"
                ? `
                    <p>
                        <strong>سابقہ مدرسہ:</strong>
                        ${escapeHTML(student.previous_madrassa) || "-"}
                    </p>

                    <p>
                        <strong>منتقلی کی تاریخ:</strong>
                        ${escapeHTML(student.transfer_date) || "-"}
                    </p>
                `
                : ""
        }


        <h3>
            🏠 رہائش
        </h3>

        <p>
            <strong>رہائش کی قسم:</strong>
            ${escapeHTML(student.residence_type) || "-"}
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHTML(student.address) || "-"}
        </p>

        <p>
            <strong>حیثیت:</strong>
            ${escapeHTML(
                getStudentStatusText(
                    student.status
                )
            )}
        </p>


        ${
            student.residence_type ===
            "ہاسٹل"
                ? `
                    <h3>
                        👥 محرم کی معلومات
                    </h3>

                    ${mahramHTML}
                `
                : ""
        }
    `;


    showElement(
        studentDetailsOverlay
    );


    document.body.classList.add(
        "modal-open"
    );
}


/* =====================================================
   CLOSE STUDENT DETAILS
===================================================== */

function closeStudentDetailsModal() {

    hideElement(
        studentDetailsOverlay
    );


    document.body.classList.remove(
        "modal-open"
    );
}


if (closeStudentDetails) {

    closeStudentDetails.addEventListener(
        "click",
        closeStudentDetailsModal
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

                closeStudentDetailsModal();
            }
        }
    );
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

        showMessage(
            studentListMessage,
            "طالبہ کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `کیا آپ واقعی "${safeString(student.name)}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
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


        await createAuditLog(
            "student_deleted",
            "student",
            id,
            student.name
        );


        showMessage(
            studentListMessage,
            "طالبہ کا ریکارڈ حذف ہوگیا۔",
            "success"
        );


        await loadStudents();


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        showMessage(
            studentListMessage,
            "طالبہ کا ریکارڈ حذف نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   ESCAPE KEY CLOSE DETAILS
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            if (
                studentDetailsOverlay &&
                !studentDetailsOverlay.classList.contains(
                    "hidden"
                )
            ) {

                closeStudentDetailsModal();
            }
        }
    }
);

/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 5
   TEACHER MODULE
===================================================== */


/* =====================================================
   TEACHER ELEMENTS
===================================================== */

const teacherFormContainer =
    document.getElementById("teacherFormContainer");

const teacherForm =
    document.getElementById("teacherForm");

const teacherFormTitle =
    document.getElementById("teacherFormTitle");

const teacherFormMessage =
    document.getElementById("teacherFormMessage");

const showTeacherForm =
    document.getElementById("showTeacherForm");

const cancelTeacherButton =
    document.getElementById("cancelTeacherButton");

const saveTeacherButton =
    document.getElementById("saveTeacherButton");

const editTeacherId =
    document.getElementById("editTeacherId");

const teacherCode =
    document.getElementById("teacherCode");

const teacherName =
    document.getElementById("teacherName");

const teacherFatherName =
    document.getElementById("teacherFatherName");

const teacherPhone =
    document.getElementById("teacherPhone");

const teacherCNIC =
    document.getElementById("teacherCNIC");

const teacherDateOfBirth =
    document.getElementById("teacherDateOfBirth");

const teacherQualification =
    document.getElementById("teacherQualification");

const teacherJoiningDate =
    document.getElementById("teacherJoiningDate");

const teacherStatus =
    document.getElementById("teacherStatus");

const teacherAddress =
    document.getElementById("teacherAddress");

const teacherSearch =
    document.getElementById("teacherSearch");

const teacherList =
    document.getElementById("teacherList");

const teacherListMessage =
    document.getElementById("teacherListMessage");

const teacherListCount =
    document.getElementById("teacherListCount");

const activeTeacherTotal =
    document.getElementById("activeTeacherTotal");

const pendingTeacherTotal =
    document.getElementById("pendingTeacherTotal");

const teacherDetailsOverlay =
    document.getElementById("teacherDetailsOverlay");

const teacherDetailsContent =
    document.getElementById("teacherDetailsContent");

const closeTeacherDetails =
    document.getElementById("closeTeacherDetails");


/* =====================================================
   TEACHER CACHE
===================================================== */

let teachersCache = [];

let editingTeacherId = null;


/* =====================================================
   TEACHER STATUS TEXT
===================================================== */

function getTeacherStatusText(status) {

    return (
        safeLower(status) === "inactive"
            ? "غیر فعال"
            : "فعال"
    );
}


/* =====================================================
   RESET TEACHER FORM
===================================================== */

function resetTeacherForm() {

    if (teacherForm) {
        teacherForm.reset();
    }


    editingTeacherId = null;


    if (editTeacherId) {
        editTeacherId.value = "";
    }


    if (teacherFormTitle) {

        teacherFormTitle.textContent =
            "👩‍🏫 نئے استاد کی معلومات";
    }


    if (teacherStatus) {
        teacherStatus.value = "active";
    }


    clearMessage(
        teacherFormMessage
    );
}


/* =====================================================
   OPEN TEACHER FORM
===================================================== */

function openTeacherForm() {

    if (!requireAdmin()) {
        return;
    }


    resetTeacherForm();


    showElement(
        teacherFormContainer
    );


    teacherFormContainer?.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );
}


/* =====================================================
   CLOSE TEACHER FORM
===================================================== */

function closeTeacherForm() {

    resetTeacherForm();

    hideElement(
        teacherFormContainer
    );
}


/* =====================================================
   FORM BUTTON EVENTS
===================================================== */

if (showTeacherForm) {

    showTeacherForm.addEventListener(
        "click",
        openTeacherForm
    );
}


if (cancelTeacherButton) {

    cancelTeacherButton.addEventListener(
        "click",
        closeTeacherForm
    );
}


/* =====================================================
   TEACHER CNIC FORMAT
===================================================== */

if (teacherCNIC) {

    teacherCNIC.addEventListener(
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
   TEACHER PHONE FORMAT
===================================================== */

if (teacherPhone) {

    teacherPhone.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                ).slice(
                    0,
                    11
                );
        }
    );
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


    clearMessage(
        teacherListMessage
    );


    teacherList.innerHTML = `

        <div class="teacher-empty">
            اساتذہ کا ریکارڈ لوڈ ہو رہا ہے۔
        </div>

    `;


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
            Array.isArray(data)
                ? data
                : [];


        renderTeachers(
            teachersCache
        );


        updateTeacherStatistics();


    } catch (error) {

        console.error(
            "Load teachers error:",
            error
        );


        teachersCache = [];


        teacherList.innerHTML = `

            <div class="teacher-empty">
                اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔
            </div>

        `;


        updateTeacherStatistics();


        showMessage(
            teacherListMessage,
            "اساتذہ کا ریکارڈ لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
    }
}


/* =====================================================
   UPDATE TEACHER STATISTICS
===================================================== */

function updateTeacherStatistics() {

    const total =
        teachersCache.length;


    const active =
        teachersCache.filter(
            teacher =>
                safeLower(
                    teacher.status
                ) !== "inactive"
        ).length;


    if (teacherTotal) {

        teacherTotal.textContent =
            String(total);
    }


    if (activeTeacherTotal) {

        activeTeacherTotal.textContent =
            String(active);
    }


    if (teacherListCount) {

        teacherListCount.textContent =
            String(total);
    }
}


/* =====================================================
   LOAD PENDING TEACHER COUNT
===================================================== */

async function loadPendingTeacherCount() {

    if (
        !pendingTeacherTotal ||
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
                );


        if (error) {
            throw error;
        }


        pendingTeacherTotal.textContent =
            String(
                Number.isFinite(count)
                    ? count
                    : 0
            );


    } catch (error) {

        console.error(
            "Pending teacher count error:",
            error
        );


        pendingTeacherTotal.textContent =
            "0";
    }
}


/* =====================================================
   RENDER TEACHERS
===================================================== */

function renderTeachers(list) {

    if (!teacherList) {
        return;
    }


    const teachers =
        Array.isArray(list)
            ? list
            : [];


    if (teacherListCount) {

        teacherListCount.textContent =
            String(
                teachers.length
            );
    }


    if (
        teachers.length === 0
    ) {

        teacherList.innerHTML = `

            <div class="teacher-empty">
                کوئی استاد موجود نہیں۔
            </div>

        `;

        return;
    }


    const admin =
        getCurrentRole() ===
        "admin";


    teacherList.innerHTML =
        teachers.map(
            teacher => `

                <div
                    class="teacher-card"
                    data-id="${escapeHTML(teacher.id)}"
                >

                    <h3>
                        👩‍🏫
                        ${escapeHTML(teacher.name) || "نام موجود نہیں"}
                    </h3>


                    <div class="teacher-card-info">

                        <p>
                            <strong>استاد کا کوڈ:</strong>
                            ${escapeHTML(teacher.teacher_code) || "-"}
                        </p>

                        <p>
                            <strong>موبائل:</strong>
                            ${escapeHTML(teacher.phone) || "-"}
                        </p>

                        <p>
                            <strong>تعلیمی قابلیت:</strong>
                            ${escapeHTML(teacher.qualification) || "-"}
                        </p>

                        <p>
                            <strong>حیثیت:</strong>
                            ${escapeHTML(
                                getTeacherStatusText(
                                    teacher.status
                                )
                            )}
                        </p>

                    </div>


                    <div class="teacher-card-buttons">

                        <button
                            type="button"
                            class="view-teacher"
                            data-id="${escapeHTML(teacher.id)}"
                        >
                            👁️ تفصیلات
                        </button>


                        ${
                            admin
                                ? `

                                    <button
                                        type="button"
                                        class="edit-teacher"
                                        data-id="${escapeHTML(teacher.id)}"
                                    >
                                        ✏️ ترمیم
                                    </button>


                                    <button
                                        type="button"
                                        class="delete-teacher"
                                        data-id="${escapeHTML(teacher.id)}"
                                    >
                                        🗑️ حذف کریں
                                    </button>

                                `
                                : ""
                        }

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
                    function () {

                        showTeacherDetails(
                            this.dataset.id
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
                    function () {

                        editTeacher(
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
            button => {

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


/* =====================================================
   TEACHER SEARCH
===================================================== */

if (teacherSearch) {

    teacherSearch.addEventListener(
        "input",
        function () {

            const query =
                safeLower(
                    this.value
                );


            if (!query) {

                renderTeachers(
                    teachersCache
                );

                return;
            }


            const filtered =
                teachersCache.filter(
                    teacher => {

                        const values = [

                            teacher.name,

                            teacher.teacher_code,

                            teacher.cnic,

                            teacher.phone,

                            teacher.father_name,

                            teacher.qualification

                        ];


                        return values.some(
                            value =>
                                safeLower(
                                    value
                                ).includes(
                                    query
                                )
                        );
                    }
                );


            renderTeachers(
                filtered
            );
        }
    );
}


/* =====================================================
   GET TEACHER FORM DATA
===================================================== */

function getTeacherFormData() {

    return {

        teacher_code:
            safeString(
                teacherCode?.value
            ),

        name:
            safeString(
                teacherName?.value
            ),

        father_name:
            safeString(
                teacherFatherName?.value
            ),

        phone:
            cleanPhone(
                teacherPhone?.value
            ),

        cnic:
            formatCNIC(
                teacherCNIC?.value
            ),

        date_of_birth:
            safeString(
                teacherDateOfBirth?.value
            ) || null,

        qualification:
            safeString(
                teacherQualification?.value
            ),

        joining_date:
            safeString(
                teacherJoiningDate?.value
            ) || null,

        status:
            safeLower(
                teacherStatus?.value
            ) || "active",

        address:
            safeString(
                teacherAddress?.value
            )
    };
}


/* =====================================================
   VALIDATE TEACHER
===================================================== */

function validateTeacherFormData(
    data
) {

    if (!data.teacher_code) {

        showMessage(
            teacherFormMessage,
            "استاد کا کوڈ درج کریں۔"
        );

        return false;
    }


    if (!data.name) {

        showMessage(
            teacherFormMessage,
            "استاد کا نام درج کریں۔"
        );

        return false;
    }


    if (!data.father_name) {

        showMessage(
            teacherFormMessage,
            "والد کا نام درج کریں۔"
        );

        return false;
    }


    if (
        !isValidPhone(
            data.phone
        )
    ) {

        showMessage(
            teacherFormMessage,
            "موبائل نمبر درست درج کریں۔"
        );

        return false;
    }


    if (
        !isValidCNIC(
            data.cnic
        )
    ) {

        showMessage(
            teacherFormMessage,
            "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔"
        );

        return false;
    }


    if (!data.qualification) {

        showMessage(
            teacherFormMessage,
            "تعلیمی قابلیت درج کریں۔"
        );

        return false;
    }


    if (!data.joining_date) {

        showMessage(
            teacherFormMessage,
            "تقرری کی تاریخ درج کریں۔"
        );

        return false;
    }


    if (!data.address) {

        showMessage(
            teacherFormMessage,
            "مکمل پتہ درج کریں۔"
        );

        return false;
    }


    return true;
}


/* =====================================================
   DUPLICATE TEACHER CHECK
===================================================== */

async function teacherDuplicateExists(
    data,
    excludeId = null
) {

    let query =
        supabaseClient
            .from(
                TEACHERS_TABLE
            )
            .select(
                "id, teacher_code, cnic"
            )
            .or(
                `teacher_code.eq.${data.teacher_code},cnic.eq.${data.cnic}`
            );


    if (excludeId !== null) {

        query =
            query.neq(
                "id",
                excludeId
            );
    }


    const {
        data: rows,
        error
    } =
        await query;


    if (error) {
        throw error;
    }


    return (
        Array.isArray(rows) &&
        rows.length > 0
    );
}


/* =====================================================
   SAVE TEACHER
===================================================== */

async function saveTeacher(
    event
) {

    event.preventDefault();


    if (!requireAdmin()) {
        return;
    }


    clearMessage(
        teacherFormMessage
    );


    const data =
        getTeacherFormData();


    if (
        !validateTeacherFormData(
            data
        )
    ) {
        return;
    }


    if (saveTeacherButton) {

        saveTeacherButton.disabled =
            true;

        saveTeacherButton.textContent =
            "⏳ محفوظ ہو رہا ہے...";
    }


    try {

        const duplicate =
            await teacherDuplicateExists(
                data,
                editingTeacherId
            );


        if (duplicate) {

            showMessage(
                teacherFormMessage,
                "یہ استاد کوڈ یا شناختی کارڈ نمبر پہلے سے موجود ہے۔"
            );

            return;
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


            await createAuditLog(
                "teacher_updated",
                "teacher",
                editingTeacherId,
                data.name
            );


            showMessage(
                teacherFormMessage,
                "استاد کا ریکارڈ کامیابی سے اپ ڈیٹ ہوگیا۔",
                "success"
            );


        } else {

            const {
                data: inserted,
                error
            } =
                await supabaseClient
                    .from(
                        TEACHERS_TABLE
                    )
                    .insert(
                        [data]
                    )
                    .select()
                    .single();


            if (error) {
                throw error;
            }


            await createAuditLog(
                "teacher_created",
                "teacher",
                inserted?.id,
                data.name
            );


            showMessage(
                teacherFormMessage,
                "نیا استاد کامیابی سے شامل ہوگیا۔",
                "success"
            );
        }


        await loadTeachers();


        setTimeout(
            function () {

                closeTeacherForm();

            },
            800
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

        if (saveTeacherButton) {

            saveTeacherButton.disabled =
                false;

            saveTeacherButton.textContent =
                "💾 محفوظ کریں";
        }
    }
}


/* =====================================================
   TEACHER FORM SUBMIT
===================================================== */

if (teacherForm) {

    teacherForm.addEventListener(
        "submit",
        saveTeacher
    );
}

/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 6
   TEACHER EDIT / DETAILS / DELETE
===================================================== */


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
                String(item.id) === String(id)
        );


    if (!teacher) {

        showMessage(
            teacherListMessage,
            "استاد کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    editingTeacherId =
        teacher.id;


    if (editTeacherId) {

        editTeacherId.value =
            teacher.id;
    }


    if (teacherCode) {

        teacherCode.value =
            safeString(
                teacher.teacher_code
            );
    }


    if (teacherName) {

        teacherName.value =
            safeString(
                teacher.name
            );
    }


    if (teacherFatherName) {

        teacherFatherName.value =
            safeString(
                teacher.father_name
            );
    }


    if (teacherPhone) {

        teacherPhone.value =
            safeString(
                teacher.phone
            );
    }


    if (teacherCNIC) {

        teacherCNIC.value =
            formatCNIC(
                teacher.cnic
            );
    }


    if (teacherDateOfBirth) {

        teacherDateOfBirth.value =
            safeString(
                teacher.date_of_birth
            );
    }


    if (teacherQualification) {

        teacherQualification.value =
            safeString(
                teacher.qualification
            );
    }


    if (teacherJoiningDate) {

        teacherJoiningDate.value =
            safeString(
                teacher.joining_date
            );
    }


    if (teacherStatus) {

        teacherStatus.value =
            safeLower(
                teacher.status
            ) || "active";
    }


    if (teacherAddress) {

        teacherAddress.value =
            safeString(
                teacher.address
            );
    }


    if (teacherFormTitle) {

        teacherFormTitle.textContent =
            "✏️ استاد کی معلومات میں ترمیم";
    }


    clearMessage(
        teacherFormMessage
    );


    showElement(
        teacherFormContainer
    );


    teacherFormContainer?.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );
}


/* =====================================================
   SHOW TEACHER DETAILS
===================================================== */

function showTeacherDetails(id) {

    const teacher =
        teachersCache.find(
            item =>
                String(item.id) === String(id)
        );


    if (!teacher) {

        showMessage(
            teacherListMessage,
            "استاد کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    if (
        !teacherDetailsOverlay ||
        !teacherDetailsContent
    ) {
        return;
    }


    teacherDetailsContent.innerHTML = `

        <h3>
            👤 ذاتی معلومات
        </h3>

        <p>
            <strong>استاد کا نام:</strong>
            ${escapeHTML(teacher.name) || "-"}
        </p>

        <p>
            <strong>والد کا نام:</strong>
            ${escapeHTML(teacher.father_name) || "-"}
        </p>

        <p>
            <strong>استاد کا کوڈ:</strong>
            ${escapeHTML(teacher.teacher_code) || "-"}
        </p>

        <p>
            <strong>شناختی کارڈ نمبر:</strong>
            ${escapeHTML(teacher.cnic) || "-"}
        </p>

        <p>
            <strong>موبائل نمبر:</strong>
            ${escapeHTML(teacher.phone) || "-"}
        </p>

        <p>
            <strong>تاریخ پیدائش:</strong>
            ${escapeHTML(teacher.date_of_birth) || "-"}
        </p>


        <h3>
            📚 تعلیمی معلومات
        </h3>

        <p>
            <strong>تعلیمی قابلیت:</strong>
            ${escapeHTML(teacher.qualification) || "-"}
        </p>


        <h3>
            🏫 ملازمت کی معلومات
        </h3>

        <p>
            <strong>تقرری کی تاریخ:</strong>
            ${escapeHTML(teacher.joining_date) || "-"}
        </p>

        <p>
            <strong>حیثیت:</strong>
            ${escapeHTML(
                getTeacherStatusText(
                    teacher.status
                )
            )}
        </p>


        <h3>
            🏠 رابطہ
        </h3>

        <p>
            <strong>مکمل پتہ:</strong>
            ${escapeHTML(teacher.address) || "-"}
        </p>

    `;


    showElement(
        teacherDetailsOverlay
    );


    document.body.classList.add(
        "modal-open"
    );
}


/* =====================================================
   CLOSE TEACHER DETAILS
===================================================== */

function hideTeacherDetails() {

    hideElement(
        teacherDetailsOverlay
    );


    document.body.classList.remove(
        "modal-open"
    );
}


if (closeTeacherDetails) {

    closeTeacherDetails.addEventListener(
        "click",
        hideTeacherDetails
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

                hideTeacherDetails();
            }
        }
    );
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
                String(item.id) === String(id)
        );


    if (!teacher) {

        showMessage(
            teacherListMessage,
            "استاد کا ریکارڈ نہیں ملا۔"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `کیا آپ واقعی "${safeString(teacher.name)}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
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


        await createAuditLog(
            "teacher_deleted",
            "teacher",
            id,
            teacher.name
        );


        showMessage(
            teacherListMessage,
            "استاد کا ریکارڈ حذف ہوگیا۔",
            "success"
        );


        await loadTeachers();


    } catch (error) {

        console.error(
            "Delete teacher error:",
            error
        );


        showMessage(
            teacherListMessage,
            "استاد کا ریکارڈ حذف نہیں ہو سکا۔"
        );
    }
}


/* =====================================================
   ESCAPE KEY FOR DETAILS MODAL
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            teacherDetailsOverlay &&
            !teacherDetailsOverlay.classList.contains(
                "hidden"
            )
        ) {

            hideTeacherDetails();
        }
    }
);


/* =====================================================
   INITIALIZE TEACHER PAGE
===================================================== */

async function initializeTeacherPage() {

    if (
        currentFile !==
        "teachers.html"
    ) {
        return;
    }


    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }


    applyRoleVisibility();


    await Promise.allSettled(
        [
            loadTeachers(),
            loadPendingTeacherCount()
        ]
    );
}

/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 7
   STUDENT APPLICATION MODULE
===================================================== */


/* =====================================================
   STUDENT APPLICATION ELEMENTS
===================================================== */

const studentApplyForm =
    document.getElementById(
        "studentApplyForm"
    );

const studentApplyMessage =
    document.getElementById(
        "studentApplyMessage"
    );

const submitStudentApplication =
    document.getElementById(
        "submitStudentApplication"
    );

const cancelStudentApplication =
    document.getElementById(
        "cancelStudentApplication"
    );

const applyAdmissionType =
    document.getElementById(
        "applyAdmissionType"
    );

const applyClass =
    document.getElementById(
        "applyClass"
    );

const applyPreviousMadrassaGroup =
    document.getElementById(
        "applyPreviousMadrassaGroup"
    );

const applyPreviousMadrassa =
    document.getElementById(
        "applyPreviousMadrassa"
    );

const applyTransferDateGroup =
    document.getElementById(
        "applyTransferDateGroup"
    );

const applyTransferDate =
    document.getElementById(
        "applyTransferDate"
    );

const applyStudentName =
    document.getElementById(
        "applyStudentName"
    );

const applyFatherName =
    document.getElementById(
        "applyFatherName"
    );

const applyGuardianName =
    document.getElementById(
        "applyGuardianName"
    );

const applyCNIC =
    document.getElementById(
        "applyCNIC"
    );

const applyDateOfBirth =
    document.getElementById(
        "applyDateOfBirth"
    );

const applyPhone =
    document.getElementById(
        "applyPhone"
    );

const applyAddress =
    document.getElementById(
        "applyAddress"
    );

const applyResidenceType =
    document.getElementById(
        "applyResidenceType"
    );

const applyMahramSection =
    document.getElementById(
        "applyMahramSection"
    );

const applyMahramList =
    document.getElementById(
        "applyMahramList"
    );

const addApplyMahram =
    document.getElementById(
        "addApplyMahram"
    );

const applyUsername =
    document.getElementById(
        "applyUsername"
    );

const applyPassword =
    document.getElementById(
        "applyPassword"
    );

const applyConfirmPassword =
    document.getElementById(
        "applyConfirmPassword"
    );

const studentApplyConfirmation =
    document.getElementById(
        "studentApplyConfirmation"
    );

const studentApplicationNumber =
    document.getElementById(
        "studentApplicationNumber"
    );

const checkStudentApplicationStatus =
    document.getElementById(
        "checkStudentApplicationStatus"
    );

const studentApplicationStatusResult =
    document.getElementById(
        "studentApplicationStatusResult"
    );


/* =====================================================
   APPLICATION MAHRAM COUNTER
===================================================== */

let applyMahramCounter = 0;


/* =====================================================
   ADMISSION TYPE
===================================================== */

function updateApplyAdmissionType() {

    if (!applyAdmissionType) {
        return;
    }


    const isTransfer =
        applyAdmissionType.value ===
        "منتقلی";


    if (isTransfer) {

        showElement(
            applyPreviousMadrassaGroup
        );

        showElement(
            applyTransferDateGroup
        );


        if (applyPreviousMadrassa) {
            applyPreviousMadrassa.required =
                true;
        }


        if (applyTransferDate) {
            applyTransferDate.required =
                true;
        }


    } else {

        hideElement(
            applyPreviousMadrassaGroup
        );

        hideElement(
            applyTransferDateGroup
        );


        if (applyPreviousMadrassa) {

            applyPreviousMadrassa.required =
                false;

            applyPreviousMadrassa.value =
                "";
        }


        if (applyTransferDate) {

            applyTransferDate.required =
                false;

            applyTransferDate.value =
                "";
        }
    }
}


if (applyAdmissionType) {

    applyAdmissionType.addEventListener(
        "change",
        updateApplyAdmissionType
    );
}


/* =====================================================
   RESIDENCE TYPE
===================================================== */

function updateApplyResidenceType() {

    if (!applyResidenceType) {
        return;
    }


    const hostel =
        applyResidenceType.value ===
        "ہاسٹل";


    if (hostel) {

        showElement(
            applyMahramSection
        );


        if (
            applyMahramList &&
            applyMahramList.children.length === 0
        ) {

            createApplyMahram();
        }


    } else {

        hideElement(
            applyMahramSection
        );


        if (applyMahramList) {

            applyMahramList.innerHTML =
                "";
        }


        applyMahramCounter = 0;
    }
}


if (applyResidenceType) {

    applyResidenceType.addEventListener(
        "change",
        updateApplyResidenceType
    );
}


/* =====================================================
   CREATE APPLICATION MAHRAM
===================================================== */

function createApplyMahram(
    data = {}
) {

    if (!applyMahramList) {
        return;
    }


    if (
        applyMahramList.children.length >=
        MAX_MAHRAMS
    ) {

        showMessage(
            studentApplyMessage,
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return;
    }


    applyMahramCounter++;


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "mahram-card";


    card.innerHTML = `

        <div class="mahram-header">

            <strong>
                محرم ${applyMahramCounter}
            </strong>

            <button
                type="button"
                class="remove-mahram"
            >
                ✖ حذف کریں
            </button>

        </div>


        <div class="form-grid">


            <div class="form-group">

                <label>
                    محرم کا نام
                </label>

                <input
                    type="text"
                    class="apply-mahram-name"
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
                    class="apply-mahram-relation"
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
                    class="apply-mahram-phone"
                    value="${escapeHTML(data.phone || "")}"
                    placeholder="03XXXXXXXXX"
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
                    class="apply-mahram-cnic"
                    value="${escapeHTML(
                        formatCNIC(
                            data.cnic || ""
                        )
                    )}"
                    placeholder="00000-0000000-0"
                    required
                >

            </div>


        </div>

    `;


    applyMahramList.appendChild(
        card
    );


    const removeButton =
        card.querySelector(
            ".remove-mahram"
        );


    const phoneInput =
        card.querySelector(
            ".apply-mahram-phone"
        );


    const cnicInput =
        card.querySelector(
            ".apply-mahram-cnic"
        );


    removeButton?.addEventListener(
        "click",
        function () {

            card.remove();

            renumberApplyMahrams();
        }
    );


    phoneInput?.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                ).slice(
                    0,
                    11
                );
        }
    );


    cnicInput?.addEventListener(
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
   RENUMBER APPLICATION MAHRAMS
===================================================== */

function renumberApplyMahrams() {

    if (!applyMahramList) {
        return;
    }


    const cards =
        applyMahramList.querySelectorAll(
            ".mahram-card"
        );


    cards.forEach(
        (card, index) => {

            const title =
                card.querySelector(
                    ".mahram-header strong"
                );


            if (title) {

                title.textContent =
                    `محرم ${index + 1}`;
            }
        }
    );


    applyMahramCounter =
        cards.length;
}


/* =====================================================
   ADD MAHRAM BUTTON
===================================================== */

if (addApplyMahram) {

    addApplyMahram.addEventListener(
        "click",
        function () {

            createApplyMahram();
        }
    );
}


/* =====================================================
   APPLICATION CNIC
===================================================== */

if (applyCNIC) {

    applyCNIC.addEventListener(
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
   APPLICATION PHONE
===================================================== */

if (applyPhone) {

    applyPhone.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                ).slice(
                    0,
                    11
                );
        }
    );
}


/* =====================================================
   GET APPLICATION MAHRAMS
===================================================== */

function getApplyMahrams() {

    if (!applyMahramList) {
        return [];
    }


    return Array.from(
        applyMahramList.querySelectorAll(
            ".mahram-card"
        )
    ).map(
        card => {

            return {

                name:
                    safeString(
                        card.querySelector(
                            ".apply-mahram-name"
                        )?.value
                    ),

                relation:
                    safeString(
                        card.querySelector(
                            ".apply-mahram-relation"
                        )?.value
                    ),

                phone:
                    cleanPhone(
                        card.querySelector(
                            ".apply-mahram-phone"
                        )?.value
                    ),

                cnic:
                    formatCNIC(
                        card.querySelector(
                            ".apply-mahram-cnic"
                        )?.value
                    )
            };
        }
    );
}


/* =====================================================
   APPLICATION NUMBER
===================================================== */

function generateStudentApplicationNumber() {

    const time =
        Date.now()
            .toString()
            .slice(-8);


    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return `SA-${time}-${random}`;
}


/* =====================================================
   VALIDATE APPLICATION
===================================================== */

function validateStudentApplication(
    data
) {

    if (
        !data.admission_type ||
        !data.student_class
    ) {

        showMessage(
            studentApplyMessage,
            "داخلہ کی معلومات مکمل کریں۔"
        );

        return false;
    }


    if (
        data.admission_type ===
        "منتقلی"
    ) {

        if (
            !data.previous_madrassa ||
            !data.transfer_date
        ) {

            showMessage(
                studentApplyMessage,
                "منتقلی کے لیے سابقہ مدرسہ اور منتقلی کی تاریخ درج کریں۔"
            );

            return false;
        }
    }


    if (
        !data.name ||
        !data.father_name ||
        !data.guardian_name
    ) {

        showMessage(
            studentApplyMessage,
            "طالبہ کی ذاتی معلومات مکمل کریں۔"
        );

        return false;
    }


    if (
        !isValidCNIC(
            data.cnic
        )
    ) {

        showMessage(
            studentApplyMessage,
            "شناختی کارڈ / ب فارم نمبر درست درج کریں۔"
        );

        return false;
    }


    if (
        !isValidPhone(
            data.phone
        )
    ) {

        showMessage(
            studentApplyMessage,
            "موبائل نمبر درست درج کریں۔"
        );

        return false;
    }


    if (
        !data.date_of_birth ||
        !data.address ||
        !data.residence_type
    ) {

        showMessage(
            studentApplyMessage,
            "تمام ضروری معلومات مکمل کریں۔"
        );

        return false;
    }


    if (
        data.residence_type ===
        "ہاسٹل"
    ) {

        if (
            !Array.isArray(
                data.mahrams
            ) ||
            data.mahrams.length < 1
        ) {

            showMessage(
                studentApplyMessage,
                "ہاسٹل کے لیے کم از کم ایک محرم ضروری ہے۔"
            );

            return false;
        }


        for (
            const mahram of
            data.mahrams
        ) {

            if (
                !mahram.name ||
                !mahram.relation ||
                !isValidPhone(
                    mahram.phone
                ) ||
                !isValidCNIC(
                    mahram.cnic
                )
            ) {

                showMessage(
                    studentApplyMessage,
                    "محرم کی مکمل اور درست معلومات درج کریں۔"
                );

                return false;
            }
        }
    }


    if (!data.username) {

        showMessage(
            studentApplyMessage,
            "صارف نام درج کریں۔"
        );

        return false;
    }


    if (
        data.password.length < 8
    ) {

        showMessage(
            studentApplyMessage,
            "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
        );

        return false;
    }


    if (
        data.password !==
        data.confirm_password
    ) {

        showMessage(
            studentApplyMessage,
            "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
        );

        return false;
    }


    if (
        !studentApplyConfirmation?.checked
    ) {

        showMessage(
            studentApplyMessage,
            "معلومات کی تصدیق کرنا ضروری ہے۔"
        );

        return false;
    }


    return true;
}


/* =====================================================
   SUBMIT STUDENT APPLICATION
===================================================== */

async function submitStudentApplicationForm(
    event
) {

    event.preventDefault();


    if (!checkSupabase()) {
        return;
    }


    clearMessage(
        studentApplyMessage
    );


    const data = {

        application_no:
            generateStudentApplicationNumber(),

        admission_type:
            safeString(
                applyAdmissionType?.value
            ),

        student_class:
            safeString(
                applyClass?.value
            ),

        previous_madrassa:
            safeString(
                applyPreviousMadrassa?.value
            ) || null,

        transfer_date:
            safeString(
                applyTransferDate?.value
            ) || null,

        name:
            safeString(
                applyStudentName?.value
            ),

        father_name:
            safeString(
                applyFatherName?.value
            ),

        guardian_name:
            safeString(
                applyGuardianName?.value
            ),

        cnic:
            formatCNIC(
                applyCNIC?.value
            ),

        date_of_birth:
            safeString(
                applyDateOfBirth?.value
            ) || null,

        phone:
            cleanPhone(
                applyPhone?.value
            ),

        address:
            safeString(
                applyAddress?.value
            ),

        residence_type:
            safeString(
                applyResidenceType?.value
            ),

        mahrams:
            getApplyMahrams(),

        username:
            safeString(
                applyUsername?.value
            ),

        password:
            safeString(
                applyPassword?.value
            ),

        confirm_password:
            safeString(
                applyConfirmPassword?.value
            ),

        status:
            "pending"
    };


    if (
        !validateStudentApplication(
            data
        )
    ) {
        return;
    }


    if (submitStudentApplication) {

        submitStudentApplication.disabled =
            true;

        submitStudentApplication.textContent =
            "⏳ درخواست جمع ہو رہی ہے...";
    }


    try {

        const insertData = {
            ...data
        };


        delete insertData.confirm_password;


        const {
            error
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .insert(
                    [insertData]
                );


        if (error) {
            throw error;
        }


        const applicationNumber =
            data.application_no;


        studentApplyForm.reset();


        if (applyMahramList) {

            applyMahramList.innerHTML =
                "";
        }


        applyMahramCounter = 0;


        updateApplyAdmissionType();

        updateApplyResidenceType();


        showMessage(
            studentApplyMessage,
            `درخواست کامیابی سے جمع ہوگئی۔ درخواست نمبر: ${applicationNumber}`,
            "success"
        );


        if (studentApplicationNumber) {

            studentApplicationNumber.value =
                applicationNumber;
        }


    } catch (error) {

        console.error(
            "Student application error:",
            error
        );


        showMessage(
            studentApplyMessage,
            "درخواست جمع نہیں ہو سکی۔ دوبارہ کوشش کریں۔"
        );


    } finally {

        if (submitStudentApplication) {

            submitStudentApplication.disabled =
                false;

            submitStudentApplication.textContent =
                "📤 درخواست جمع کریں";
        }
    }
}


/* =====================================================
   FORM SUBMIT
===================================================== */

if (studentApplyForm) {

    studentApplyForm.addEventListener(
        "submit",
        submitStudentApplicationForm
    );
}


/* =====================================================
   CANCEL APPLICATION
===================================================== */

if (cancelStudentApplication) {

    cancelStudentApplication.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );
}


/* =====================================================
   CHECK STUDENT APPLICATION STATUS
===================================================== */

if (checkStudentApplicationStatus) {

    checkStudentApplicationStatus.addEventListener(
        "click",
        async function () {

            const applicationNo =
                safeString(
                    studentApplicationNumber?.value
                );


            clearMessage(
                studentApplicationStatusResult
            );


            if (!applicationNo) {

                showMessage(
                    studentApplicationStatusResult,
                    "درخواست نمبر درج کریں۔"
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
                            STUDENT_APPLICATIONS_TABLE
                        )
                        .select(
                            "application_no, status, admin_note"
                        )
                        .eq(
                            "application_no",
                            applicationNo
                        )
                        .maybeSingle();


                if (error) {
                    throw error;
                }


                if (!data) {

                    showMessage(
                        studentApplicationStatusResult,
                        "اس درخواست نمبر کا ریکارڈ نہیں ملا۔"
                    );

                    return;
                }


                const status =
                    safeLower(
                        data.status
                    );


                let statusText =
                    "زیرِ منظوری";


                if (
                    status ===
                    "approved"
                ) {

                    statusText =
                        "منظور شدہ";

                } else if (
                    status ===
                    "rejected"
                ) {

                    statusText =
                        "نامنظور";
                }


                studentApplicationStatusResult.innerHTML = `

                    <strong>
                        درخواست کی حالت:
                    </strong>

                    ${escapeHTML(statusText)}

                    ${
                        data.admin_note
                            ? `<br><strong>ایڈمن نوٹ:</strong> ${escapeHTML(data.admin_note)}`
                            : ""
                    }

                `;


            } catch (error) {

                console.error(
                    "Application status error:",
                    error
                );


                showMessage(
                    studentApplicationStatusResult,
                    "درخواست کی حالت معلوم نہیں ہو سکی۔"
                );
            }
        }
    );
}


/* =====================================================
   INITIALIZE STUDENT APPLICATION PAGE
===================================================== */

function initializeStudentApplicationPage() {

    if (
        currentFile !==
        "student-apply.html"
    ) {
        return;
    }


    updateApplyAdmissionType();

    updateApplyResidenceType();
                       }

/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 8
   TEACHER APPLICATION MODULE
===================================================== */


/* =====================================================
   TEACHER APPLICATION ELEMENTS
===================================================== */

const teacherApplyForm =
    document.getElementById(
        "teacherApplyForm"
    );

const teacherApplyMessage =
    document.getElementById(
        "teacherApplyMessage"
    );

const submitTeacherApplication =
    document.getElementById(
        "submitTeacherApplication"
    );

const cancelTeacherApplication =
    document.getElementById(
        "cancelTeacherApplication"
    );

const applyTeacherName =
    document.getElementById(
        "applyTeacherName"
    );

const applyTeacherFatherName =
    document.getElementById(
        "applyTeacherFatherName"
    );

const applyTeacherCNIC =
    document.getElementById(
        "applyTeacherCNIC"
    );

const applyTeacherPhone =
    document.getElementById(
        "applyTeacherPhone"
    );

const applyTeacherDateOfBirth =
    document.getElementById(
        "applyTeacherDateOfBirth"
    );

const applyTeacherAddress =
    document.getElementById(
        "applyTeacherAddress"
    );

const applyTeacherQualification =
    document.getElementById(
        "applyTeacherQualification"
    );

const applyTeacherSpecialization =
    document.getElementById(
        "applyTeacherSpecialization"
    );

const applyTeacherExperience =
    document.getElementById(
        "applyTeacherExperience"
    );

const applyTeacherPreviousInstitute =
    document.getElementById(
        "applyTeacherPreviousInstitute"
    );

const applyTeacherPreferredClass =
    document.getElementById(
        "applyTeacherPreferredClass"
    );

const applyTeacherAvailableFrom =
    document.getElementById(
        "applyTeacherAvailableFrom"
    );

const applyTeacherUsername =
    document.getElementById(
        "applyTeacherUsername"
    );

const applyTeacherPassword =
    document.getElementById(
        "applyTeacherPassword"
    );

const applyTeacherConfirmPassword =
    document.getElementById(
        "applyTeacherConfirmPassword"
    );

const teacherApplyConfirmation =
    document.getElementById(
        "teacherApplyConfirmation"
    );

const teacherApplicationNumber =
    document.getElementById(
        "teacherApplicationNumber"
    );

const checkTeacherApplicationStatus =
    document.getElementById(
        "checkTeacherApplicationStatus"
    );

const teacherApplicationStatusResult =
    document.getElementById(
        "teacherApplicationStatusResult"
    );


/* =====================================================
   TEACHER APPLICATION CNIC FORMAT
===================================================== */

if (applyTeacherCNIC) {

    applyTeacherCNIC.addEventListener(
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
   TEACHER APPLICATION PHONE FORMAT
===================================================== */

if (applyTeacherPhone) {

    applyTeacherPhone.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                ).slice(
                    0,
                    11
                );
        }
    );
}


/* =====================================================
   GENERATE APPLICATION NUMBER
===================================================== */

function generateTeacherApplicationNumber() {

    const time =
        Date.now()
            .toString()
            .slice(-8);


    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return `TA-${time}-${random}`;
}


/* =====================================================
   GET TEACHER APPLICATION DATA
===================================================== */

function getTeacherApplicationData() {

    return {

        application_no:
            generateTeacherApplicationNumber(),

        name:
            safeString(
                applyTeacherName?.value
            ),

        father_name:
            safeString(
                applyTeacherFatherName?.value
            ),

        cnic:
            formatCNIC(
                applyTeacherCNIC?.value
            ),

        phone:
            cleanPhone(
                applyTeacherPhone?.value
            ),

        date_of_birth:
            safeString(
                applyTeacherDateOfBirth?.value
            ) || null,

        address:
            safeString(
                applyTeacherAddress?.value
            ),

        qualification:
            safeString(
                applyTeacherQualification?.value
            ),

        specialization:
            safeString(
                applyTeacherSpecialization?.value
            ) || null,

        experience:
            safeString(
                applyTeacherExperience?.value
            ) || null,

        previous_institute:
            safeString(
                applyTeacherPreviousInstitute?.value
            ) || null,

        preferred_class:
            safeString(
                applyTeacherPreferredClass?.value
            ),

        available_from:
            safeString(
                applyTeacherAvailableFrom?.value
            ) || null,

        username:
            safeString(
                applyTeacherUsername?.value
            ),

        password:
            safeString(
                applyTeacherPassword?.value
            ),

        confirm_password:
            safeString(
                applyTeacherConfirmPassword?.value
            ),

        status:
            "pending"
    };
}


/* =====================================================
   VALIDATE TEACHER APPLICATION
===================================================== */

function validateTeacherApplication(
    data
) {

    if (!data.name) {

        showMessage(
            teacherApplyMessage,
            "استاد کا نام درج کریں۔"
        );

        return false;
    }


    if (!data.father_name) {

        showMessage(
            teacherApplyMessage,
            "والد کا نام درج کریں۔"
        );

        return false;
    }


    if (
        !isValidCNIC(
            data.cnic
        )
    ) {

        showMessage(
            teacherApplyMessage,
            "شناختی کارڈ نمبر درست درج کریں۔"
        );

        return false;
    }


    if (
        !isValidPhone(
            data.phone
        )
    ) {

        showMessage(
            teacherApplyMessage,
            "موبائل نمبر درست درج کریں۔"
        );

        return false;
    }


    if (!data.date_of_birth) {

        showMessage(
            teacherApplyMessage,
            "تاریخ پیدائش درج کریں۔"
        );

        return false;
    }


    if (!data.address) {

        showMessage(
            teacherApplyMessage,
            "مکمل پتہ درج کریں۔"
        );

        return false;
    }


    if (!data.qualification) {

        showMessage(
            teacherApplyMessage,
            "تعلیمی قابلیت درج کریں۔"
        );

        return false;
    }


    if (!data.preferred_class) {

        showMessage(
            teacherApplyMessage,
            "مطلوبہ کلاس منتخب کریں۔"
        );

        return false;
    }


    if (!data.available_from) {

        showMessage(
            teacherApplyMessage,
            "دستیابی کی تاریخ درج کریں۔"
        );

        return false;
    }


    if (!data.username) {

        showMessage(
            teacherApplyMessage,
            "صارف نام درج کریں۔"
        );

        return false;
    }


    if (
        data.password.length < 8
    ) {

        showMessage(
            teacherApplyMessage,
            "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
        );

        return false;
    }


    if (
        data.password !==
        data.confirm_password
    ) {

        showMessage(
            teacherApplyMessage,
            "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
        );

        return false;
    }


    if (
        !teacherApplyConfirmation?.checked
    ) {

        showMessage(
            teacherApplyMessage,
            "معلومات کی تصدیق کرنا ضروری ہے۔"
        );

        return false;
    }


    return true;
}


/* =====================================================
   CHECK DUPLICATE TEACHER APPLICATION
===================================================== */

async function teacherApplicationDuplicateExists(
    data
) {

    const {
        data: rows,
        error
    } =
        await supabaseClient
            .from(
                TEACHER_APPLICATIONS_TABLE
            )
            .select(
                "id"
            )
            .or(
                `cnic.eq.${data.cnic},username.eq.${data.username}`
            )
            .eq(
                "status",
                "pending"
            );


    if (error) {
        throw error;
    }


    return (
        Array.isArray(rows) &&
        rows.length > 0
    );
}


/* =====================================================
   SUBMIT TEACHER APPLICATION
===================================================== */

async function submitTeacherApplicationForm(
    event
) {

    event.preventDefault();


    if (!checkSupabase()) {
        return;
    }


    clearMessage(
        teacherApplyMessage
    );


    const data =
        getTeacherApplicationData();


    if (
        !validateTeacherApplication(
            data
        )
    ) {
        return;
    }


    if (submitTeacherApplication) {

        submitTeacherApplication.disabled =
            true;

        submitTeacherApplication.textContent =
            "⏳ درخواست جمع ہو رہی ہے...";
    }


    try {

        const duplicate =
            await teacherApplicationDuplicateExists(
                data
            );


        if (duplicate) {

            showMessage(
                teacherApplyMessage,
                "اس شناختی کارڈ یا صارف نام کی درخواست پہلے سے زیرِ منظوری ہے۔"
            );

            return;
        }


        const insertData = {
            ...data
        };


        delete insertData.confirm_password;


        const {
            error
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .insert(
                    [insertData]
                );


        if (error) {
            throw error;
        }


        const applicationNumber =
            data.application_no;


        teacherApplyForm.reset();


        showMessage(
            teacherApplyMessage,
            `درخواست کامیابی سے جمع ہوگئی۔ درخواست نمبر: ${applicationNumber}`,
            "success"
        );


        if (teacherApplicationNumber) {

            teacherApplicationNumber.value =
                applicationNumber;
        }


    } catch (error) {

        console.error(
            "Teacher application error:",
            error
        );


        showMessage(
            teacherApplyMessage,
            "درخواست جمع نہیں ہو سکی۔ دوبارہ کوشش کریں۔"
        );


    } finally {

        if (submitTeacherApplication) {

            submitTeacherApplication.disabled =
                false;

            submitTeacherApplication.textContent =
                "📤 درخواست جمع کریں";
        }
    }
}


/* =====================================================
   TEACHER APPLICATION SUBMIT EVENT
===================================================== */

if (teacherApplyForm) {

    teacherApplyForm.addEventListener(
        "submit",
        submitTeacherApplicationForm
    );
}


/* =====================================================
   CANCEL TEACHER APPLICATION
===================================================== */

if (cancelTeacherApplication) {

    cancelTeacherApplication.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );
}


/* =====================================================
   CHECK TEACHER APPLICATION STATUS
===================================================== */

if (checkTeacherApplicationStatus) {

    checkTeacherApplicationStatus.addEventListener(
        "click",
        async function () {

            const applicationNo =
                safeString(
                    teacherApplicationNumber?.value
                );


            clearMessage(
                teacherApplicationStatusResult
            );


            if (!applicationNo) {

                showMessage(
                    teacherApplicationStatusResult,
                    "درخواست نمبر درج کریں۔"
                );

                return;
            }


            if (!checkSupabase()) {
                return;
            }


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from(
                            TEACHER_APPLICATIONS_TABLE
                        )
                        .select(
                            "application_no, status, admin_note"
                        )
                        .eq(
                            "application_no",
                            applicationNo
                        )
                        .maybeSingle();


                if (error) {
                    throw error;
                }


                if (!data) {

                    showMessage(
                        teacherApplicationStatusResult,
                        "اس درخواست نمبر کا ریکارڈ نہیں ملا۔"
                    );

                    return;
                }


                const status =
                    safeLower(
                        data.status
                    );


                let statusText =
                    "زیرِ منظوری";


                if (
                    status ===
                    "approved"
                ) {

                    statusText =
                        "منظور شدہ";

                } else if (
                    status ===
                    "rejected"
                ) {

                    statusText =
                        "نامنظور";
                }


                teacherApplicationStatusResult.innerHTML = `

                    <strong>
                        درخواست کی حالت:
                    </strong>

                    ${escapeHTML(statusText)}

                    ${
                        data.admin_note
                            ? `<br><strong>ایڈمن نوٹ:</strong> ${escapeHTML(data.admin_note)}`
                            : ""
                    }

                `;


            } catch (error) {

                console.error(
                    "Teacher application status error:",
                    error
                );


                showMessage(
                    teacherApplicationStatusResult,
                    "درخواست کی حالت معلوم نہیں ہو سکی۔"
                );
            }
        }
    );
}


/* =====================================================
   INITIALIZE TEACHER APPLICATION PAGE
===================================================== */

function initializeTeacherApplicationPage() {

    if (
        currentFile !==
        "teacher-apply.html"
    ) {
        return;
    }


    clearMessage(
        teacherApplyMessage
    );


    clearMessage(
        teacherApplicationStatusResult
    );
}


/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 9
   STUDENT APPLICATION MODULE
===================================================== */


/* =====================================================
   STUDENT APPLICATION ELEMENTS
===================================================== */

const studentApplyForm =
    document.getElementById(
        "studentApplyForm"
    );

const studentApplyMessage =
    document.getElementById(
        "studentApplyMessage"
    );

const submitStudentApplication =
    document.getElementById(
        "submitStudentApplication"
    );

const cancelStudentApplication =
    document.getElementById(
        "cancelStudentApplication"
    );

const applyAdmissionType =
    document.getElementById(
        "applyAdmissionType"
    );

const applyClass =
    document.getElementById(
        "applyClass"
    );

const applyPreviousMadrassaGroup =
    document.getElementById(
        "applyPreviousMadrassaGroup"
    );

const applyPreviousMadrassa =
    document.getElementById(
        "applyPreviousMadrassa"
    );

const applyTransferDateGroup =
    document.getElementById(
        "applyTransferDateGroup"
    );

const applyTransferDate =
    document.getElementById(
        "applyTransferDate"
    );

const applyStudentName =
    document.getElementById(
        "applyStudentName"
    );

const applyFatherName =
    document.getElementById(
        "applyFatherName"
    );

const applyGuardianName =
    document.getElementById(
        "applyGuardianName"
    );

const applyCNIC =
    document.getElementById(
        "applyCNIC"
    );

const applyDateOfBirth =
    document.getElementById(
        "applyDateOfBirth"
    );

const applyPhone =
    document.getElementById(
        "applyPhone"
    );

const applyAddress =
    document.getElementById(
        "applyAddress"
    );

const applyResidenceType =
    document.getElementById(
        "applyResidenceType"
    );

const applyMahramSection =
    document.getElementById(
        "applyMahramSection"
    );

const applyMahramList =
    document.getElementById(
        "applyMahramList"
    );

const addApplyMahram =
    document.getElementById(
        "addApplyMahram"
    );

const applyUsername =
    document.getElementById(
        "applyUsername"
    );

const applyPassword =
    document.getElementById(
        "applyPassword"
    );

const applyConfirmPassword =
    document.getElementById(
        "applyConfirmPassword"
    );

const studentApplyConfirmation =
    document.getElementById(
        "studentApplyConfirmation"
    );

const studentApplicationNumber =
    document.getElementById(
        "studentApplicationNumber"
    );

const checkStudentApplicationStatus =
    document.getElementById(
        "checkStudentApplicationStatus"
    );

const studentApplicationStatusResult =
    document.getElementById(
        "studentApplicationStatusResult"
    );


let applyMahramCount = 0;


/* =====================================================
   CNIC FORMAT
===================================================== */

if (applyCNIC) {

    applyCNIC.addEventListener(
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
   PHONE FORMAT
===================================================== */

if (applyPhone) {

    applyPhone.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                ).slice(
                    0,
                    11
                );
        }
    );
}


/* =====================================================
   ADMISSION TYPE
===================================================== */

function updateStudentApplicationAdmissionType() {

    if (!applyAdmissionType) {
        return;
    }


    const isTransfer =
        applyAdmissionType.value ===
        "منتقلی";


    applyPreviousMadrassaGroup
        ?.classList.toggle(
            "hidden",
            !isTransfer
        );


    applyTransferDateGroup
        ?.classList.toggle(
            "hidden",
            !isTransfer
        );


    if (applyPreviousMadrassa) {

        applyPreviousMadrassa.required =
            isTransfer;
    }


    if (applyTransferDate) {

        applyTransferDate.required =
            isTransfer;
    }


    if (!isTransfer) {

        if (applyPreviousMadrassa) {
            applyPreviousMadrassa.value = "";
        }

        if (applyTransferDate) {
            applyTransferDate.value = "";
        }
    }
}


if (applyAdmissionType) {

    applyAdmissionType.addEventListener(
        "change",
        updateStudentApplicationAdmissionType
    );
}


/* =====================================================
   RESIDENCE TYPE
===================================================== */

function updateStudentApplicationResidence() {

    if (!applyResidenceType) {
        return;
    }


    const hostel =
        applyResidenceType.value ===
        "ہاسٹل";


    applyMahramSection
        ?.classList.toggle(
            "hidden",
            !hostel
        );


    if (
        hostel &&
        applyMahramCount === 0
    ) {

        addStudentApplicationMahram();
    }


    if (!hostel) {

        if (applyMahramList) {
            applyMahramList.innerHTML = "";
        }

        applyMahramCount = 0;
    }
}


if (applyResidenceType) {

    applyResidenceType.addEventListener(
        "change",
        updateStudentApplicationResidence
    );
}


/* =====================================================
   ADD APPLICATION MAHRAM
===================================================== */

function addStudentApplicationMahram(
    existingData = {}
) {

    if (!applyMahramList) {
        return;
    }


    if (applyMahramCount >= 5) {

        showMessage(
            studentApplyMessage,
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return;
    }


    applyMahramCount++;


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "mahram-card apply-mahram-card";


    card.innerHTML = `

        <div class="mahram-header">

            <strong>
                محرم ${applyMahramCount}
            </strong>

            <button
                type="button"
                class="remove-mahram remove-apply-mahram"
            >
                ✖ حذف کریں
            </button>

        </div>


        <div class="form-grid">


            <div class="form-group">

                <label>
                    محرم کا نام
                </label>

                <input
                    type="text"
                    class="apply-mahram-name"
                    value="${escapeHTML(existingData.name || "")}"
                    placeholder="محرم کا نام"
                >

            </div>


            <div class="form-group">

                <label>
                    رشتہ
                </label>

                <input
                    type="text"
                    class="apply-mahram-relation"
                    value="${escapeHTML(existingData.relation || "")}"
                    placeholder="مثلاً والد، بھائی، چچا"
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
                    class="apply-mahram-phone"
                    value="${escapeHTML(existingData.phone || "")}"
                    placeholder="03XXXXXXXXX"
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
                    class="apply-mahram-cnic"
                    value="${escapeHTML(existingData.cnic || "")}"
                    placeholder="00000-0000000-0"
                >

            </div>


        </div>
    `;


    applyMahramList.appendChild(
        card
    );


    const phoneInput =
        card.querySelector(
            ".apply-mahram-phone"
        );


    const cnicInput =
        card.querySelector(
            ".apply-mahram-cnic"
        );


    phoneInput?.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                ).slice(
                    0,
                    11
                );
        }
    );


    cnicInput?.addEventListener(
        "input",
        function () {

            this.value =
                formatCNIC(
                    this.value
                );
        }
    );


    card
        .querySelector(
            ".remove-apply-mahram"
        )
        ?.addEventListener(
            "click",
            function () {

                card.remove();

                renumberStudentApplicationMahrams();
            }
        );
}


/* =====================================================
   RENUMBER APPLICATION MAHRAMS
===================================================== */

function renumberStudentApplicationMahrams() {

    if (!applyMahramList) {
        return;
    }


    const cards =
        [
            ...applyMahramList.querySelectorAll(
                ".apply-mahram-card"
            )
        ];


    cards.forEach(
        (card, index) => {

            const title =
                card.querySelector(
                    ".mahram-header strong"
                );


            if (title) {

                title.textContent =
                    `محرم ${index + 1}`;
            }
        }
    );


    applyMahramCount =
        cards.length;
}


/* =====================================================
   ADD MAHRAM BUTTON
===================================================== */

if (addApplyMahram) {

    addApplyMahram.addEventListener(
        "click",
        function () {

            addStudentApplicationMahram();
        }
    );
}


/* =====================================================
   GET APPLICATION MAHRAMS
===================================================== */

function getStudentApplicationMahrams() {

    if (!applyMahramList) {
        return [];
    }


    return [
        ...applyMahramList.querySelectorAll(
            ".apply-mahram-card"
        )
    ].map(
        card => ({

            name:
                safeString(
                    card.querySelector(
                        ".apply-mahram-name"
                    )?.value
                ),

            relation:
                safeString(
                    card.querySelector(
                        ".apply-mahram-relation"
                    )?.value
                ),

            phone:
                cleanPhone(
                    card.querySelector(
                        ".apply-mahram-phone"
                    )?.value
                ),

            cnic:
                formatCNIC(
                    card.querySelector(
                        ".apply-mahram-cnic"
                    )?.value
                )

        })
    );
}


/* =====================================================
   GENERATE STUDENT APPLICATION NUMBER
===================================================== */

function generateStudentApplicationNumber() {

    const time =
        Date.now()
            .toString()
            .slice(-8);


    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return `SA-${time}-${random}`;
}


/* =====================================================
   GET STUDENT APPLICATION DATA
===================================================== */

function getStudentApplicationData() {

    return {

        application_no:
            generateStudentApplicationNumber(),

        admission_type:
            safeString(
                applyAdmissionType?.value
            ),

        student_class:
            safeString(
                applyClass?.value
            ),

        previous_madrassa:
            safeString(
                applyPreviousMadrassa?.value
            ) || null,

        transfer_date:
            safeString(
                applyTransferDate?.value
            ) || null,

        name:
            safeString(
                applyStudentName?.value
            ),

        father_name:
            safeString(
                applyFatherName?.value
            ),

        guardian_name:
            safeString(
                applyGuardianName?.value
            ),

        cnic:
            formatCNIC(
                applyCNIC?.value
            ),

        date_of_birth:
            safeString(
                applyDateOfBirth?.value
            ) || null,

        phone:
            cleanPhone(
                applyPhone?.value
            ),

        address:
            safeString(
                applyAddress?.value
            ),

        residence_type:
            safeString(
                applyResidenceType?.value
            ),

        mahrams:
            getStudentApplicationMahrams(),

        username:
            safeString(
                applyUsername?.value
            ),

        password:
            safeString(
                applyPassword?.value
            ),

        confirm_password:
            safeString(
                applyConfirmPassword?.value
            ),

        status:
            "pending"
    };
}


/* =====================================================
   VALIDATE MAHRAMS
===================================================== */

function validateStudentApplicationMahrams(
    mahrams
) {

    if (
        !Array.isArray(mahrams) ||
        mahrams.length < 1
    ) {

        showMessage(
            studentApplyMessage,
            "ہاسٹل کے لیے کم از کم ایک شرعی محرم ضروری ہے۔"
        );

        return false;
    }


    if (mahrams.length > 5) {

        showMessage(
            studentApplyMessage,
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return false;
    }


    for (
        let index = 0;
        index < mahrams.length;
        index++
    ) {

        const mahram =
            mahrams[index];


        if (
            !mahram.name ||
            !mahram.relation
        ) {

            showMessage(
                studentApplyMessage,
                `محرم ${index + 1} کا نام اور رشتہ مکمل درج کریں۔`
            );

            return false;
        }


        if (
            !isValidPhone(
                mahram.phone
            )
        ) {

            showMessage(
                studentApplyMessage,
                `محرم ${index + 1} کا موبائل نمبر درست درج کریں۔`
            );

            return false;
        }


        if (
            !isValidCNIC(
                mahram.cnic
            )
        ) {

            showMessage(
                studentApplyMessage,
                `محرم ${index + 1} کا شناختی کارڈ نمبر درست درج کریں۔`
            );

            return false;
        }
    }


    return true;
}


/* =====================================================
   VALIDATE STUDENT APPLICATION
===================================================== */

function validateStudentApplication(
    data
) {

    if (!data.admission_type) {

        showMessage(
            studentApplyMessage,
            "داخلہ کی قسم منتخب کریں۔"
        );

        return false;
    }


    if (!data.student_class) {

        showMessage(
            studentApplyMessage,
            "مطلوبہ کلاس منتخب کریں۔"
        );

        return false;
    }


    if (
        data.admission_type ===
        "منتقلی"
    ) {

        if (!data.previous_madrassa) {

            showMessage(
                studentApplyMessage,
                "سابقہ مدرسہ درج کریں۔"
            );

            return false;
        }


        if (!data.transfer_date) {

            showMessage(
                studentApplyMessage,
                "منتقلی کی تاریخ درج کریں۔"
            );

            return false;
        }
    }


    if (
        !data.name ||
        !data.father_name ||
        !data.guardian_name
    ) {

        showMessage(
            studentApplyMessage,
            "طالبہ، والد اور سرپرست کا نام مکمل درج کریں۔"
        );

        return false;
    }


    if (
        !isValidCNIC(
            data.cnic
        )
    ) {

        showMessage(
            studentApplyMessage,
            "شناختی کارڈ / ب فارم نمبر درست درج کریں۔"
        );

        return false;
    }


    if (!data.date_of_birth) {

        showMessage(
            studentApplyMessage,
            "تاریخ پیدائش درج کریں۔"
        );

        return false;
    }


    if (
        !isValidPhone(
            data.phone
        )
    ) {

        showMessage(
            studentApplyMessage,
            "موبائل نمبر درست درج کریں۔"
        );

        return false;
    }


    if (!data.address) {

        showMessage(
            studentApplyMessage,
            "مکمل پتہ درج کریں۔"
        );

        return false;
    }


    if (!data.residence_type) {

        showMessage(
            studentApplyMessage,
            "رہائش کی قسم منتخب کریں۔"
        );

        return false;
    }


    if (
        data.residence_type ===
        "ہاسٹل"
    ) {

        if (
            !validateStudentApplicationMahrams(
                data.mahrams
            )
        ) {

            return false;
        }
    }


    if (!data.username) {

        showMessage(
            studentApplyMessage,
            "صارف نام درج کریں۔"
        );

        return false;
    }


    if (
        data.password.length < 8
    ) {

        showMessage(
            studentApplyMessage,
            "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
        );

        return false;
    }


    if (
        data.password !==
        data.confirm_password
    ) {

        showMessage(
            studentApplyMessage,
            "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
        );

        return false;
    }


    if (
        !studentApplyConfirmation?.checked
    ) {

        showMessage(
            studentApplyMessage,
            "معلومات کی تصدیق کرنا ضروری ہے۔"
        );

        return false;
    }


    return true;
}


/* =====================================================
   CHECK DUPLICATE APPLICATION
===================================================== */

async function studentApplicationDuplicateExists(
    data
) {

    const {
        data: rows,
        error
    } =
        await supabaseClient
            .from(
                STUDENT_APPLICATIONS_TABLE
            )
            .select(
                "id"
            )
            .or(
                `cnic.eq.${data.cnic},username.eq.${data.username}`
            )
            .eq(
                "status",
                "pending"
            );


    if (error) {
        throw error;
    }


    return (
        Array.isArray(rows) &&
        rows.length > 0
    );
}


/* =====================================================
   SUBMIT STUDENT APPLICATION
===================================================== */

async function submitStudentApplicationForm(
    event
) {

    event.preventDefault();


    if (!checkSupabase()) {
        return;
    }


    clearMessage(
        studentApplyMessage
    );


    const data =
        getStudentApplicationData();


    if (
        !validateStudentApplication(
            data
        )
    ) {
        return;
    }


    if (submitStudentApplication) {

        submitStudentApplication.disabled =
            true;

        submitStudentApplication.textContent =
            "⏳ درخواست جمع ہو رہی ہے...";
    }


    try {

        const duplicate =
            await studentApplicationDuplicateExists(
                data
            );


        if (duplicate) {

            showMessage(
                studentApplyMessage,
                "اس شناختی کارڈ یا صارف نام کی درخواست پہلے سے زیرِ منظوری ہے۔"
            );

            return;
        }


        const insertData = {
            ...data
        };


        delete insertData.confirm_password;


        if (
            data.residence_type !==
            "ہاسٹل"
        ) {

            insertData.mahrams = [];
        }


        const {
            error
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .insert(
                    [insertData]
                );


        if (error) {
            throw error;
        }


        const applicationNumber =
            data.application_no;


        studentApplyForm.reset();


        if (applyMahramList) {
            applyMahramList.innerHTML = "";
        }


        applyMahramCount = 0;


        updateStudentApplicationAdmissionType();

        updateStudentApplicationResidence();


        showMessage(
            studentApplyMessage,
            `درخواست کامیابی سے جمع ہوگئی۔ درخواست نمبر: ${applicationNumber}`,
            "success"
        );


        if (studentApplicationNumber) {

            studentApplicationNumber.value =
                applicationNumber;
        }


    } catch (error) {

        console.error(
            "Student application error:",
            error
        );


        showMessage(
            studentApplyMessage,
            "درخواست جمع نہیں ہو سکی۔ دوبارہ کوشش کریں۔"
        );


    } finally {

        if (submitStudentApplication) {

            submitStudentApplication.disabled =
                false;

            submitStudentApplication.textContent =
                "📤 درخواست جمع کریں";
        }
    }
}


/* =====================================================
   STUDENT APPLICATION SUBMIT EVENT
===================================================== */

if (studentApplyForm) {

    studentApplyForm.addEventListener(
        "submit",
        submitStudentApplicationForm
    );
}


/* =====================================================
   CANCEL STUDENT APPLICATION
===================================================== */

if (cancelStudentApplication) {

    cancelStudentApplication.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );
}


/* =====================================================
   CHECK STUDENT APPLICATION STATUS
===================================================== */

if (checkStudentApplicationStatus) {

    checkStudentApplicationStatus.addEventListener(
        "click",
        async function () {

            const applicationNo =
                safeString(
                    studentApplicationNumber?.value
                );


            clearMessage(
                studentApplicationStatusResult
            );


            if (!applicationNo) {

                showMessage(
                    studentApplicationStatusResult,
                    "درخواست نمبر درج کریں۔"
                );

                return;
            }


            if (!checkSupabase()) {
                return;
            }


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from(
                            STUDENT_APPLICATIONS_TABLE
                        )
                        .select(
                            "application_no, status, admin_note"
                        )
                        .eq(
                            "application_no",
                            applicationNo
                        )
                        .maybeSingle();


                if (error) {
                    throw error;
                }


                if (!data) {

                    showMessage(
                        studentApplicationStatusResult,
                        "اس درخواست نمبر کا ریکارڈ نہیں ملا۔"
                    );

                    return;
                }


                const status =
                    safeLower(
                        data.status
                    );


                let statusText =
                    "زیرِ منظوری";


                if (
                    status ===
                    "approved"
                ) {

                    statusText =
                        "منظور شدہ";

                } else if (
                    status ===
                    "rejected"
                ) {

                    statusText =
                        "نامنظور";
                }


                studentApplicationStatusResult.innerHTML = `

                    <strong>
                        درخواست کی حالت:
                    </strong>

                    ${escapeHTML(statusText)}

                    ${
                        data.admin_note
                            ? `<br><strong>ایڈمن نوٹ:</strong> ${escapeHTML(data.admin_note)}`
                            : ""
                    }

                `;


            } catch (error) {

                console.error(
                    "Student application status error:",
                    error
                );


                showMessage(
                    studentApplicationStatusResult,
                    "درخواست کی حالت معلوم نہیں ہو سکی۔"
                );
            }
        }
    );
}


/* =====================================================
   INITIALIZE STUDENT APPLICATION PAGE
===================================================== */

function initializeStudentApplicationPage() {

    if (
        currentFile !==
        "student-apply.html"
    ) {
        return;
    }


    updateStudentApplicationAdmissionType();

    updateStudentApplicationResidence();


    clearMessage(
        studentApplyMessage
    );


    clearMessage(
        studentApplicationStatusResult
    );
            }

/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 10
   TEACHER APPLICATION MODULE
===================================================== */


/* =====================================================
   TEACHER APPLICATION ELEMENTS
===================================================== */

const teacherApplyForm =
    document.getElementById(
        "teacherApplyForm"
    );

const teacherApplyMessage =
    document.getElementById(
        "teacherApplyMessage"
    );

const submitTeacherApplication =
    document.getElementById(
        "submitTeacherApplication"
    );

const cancelTeacherApplication =
    document.getElementById(
        "cancelTeacherApplication"
    );

const applyTeacherName =
    document.getElementById(
        "applyTeacherName"
    );

const applyTeacherFatherName =
    document.getElementById(
        "applyTeacherFatherName"
    );

const applyTeacherCNIC =
    document.getElementById(
        "applyTeacherCNIC"
    );

const applyTeacherPhone =
    document.getElementById(
        "applyTeacherPhone"
    );

const applyTeacherDateOfBirth =
    document.getElementById(
        "applyTeacherDateOfBirth"
    );

const applyTeacherAddress =
    document.getElementById(
        "applyTeacherAddress"
    );

const applyTeacherQualification =
    document.getElementById(
        "applyTeacherQualification"
    );

const applyTeacherSpecialization =
    document.getElementById(
        "applyTeacherSpecialization"
    );

const applyTeacherExperience =
    document.getElementById(
        "applyTeacherExperience"
    );

const applyTeacherPreviousInstitute =
    document.getElementById(
        "applyTeacherPreviousInstitute"
    );

const applyTeacherPreferredClass =
    document.getElementById(
        "applyTeacherPreferredClass"
    );

const applyTeacherAvailableFrom =
    document.getElementById(
        "applyTeacherAvailableFrom"
    );

const applyTeacherUsername =
    document.getElementById(
        "applyTeacherUsername"
    );

const applyTeacherPassword =
    document.getElementById(
        "applyTeacherPassword"
    );

const applyTeacherConfirmPassword =
    document.getElementById(
        "applyTeacherConfirmPassword"
    );

const teacherApplyConfirmation =
    document.getElementById(
        "teacherApplyConfirmation"
    );

const teacherApplicationNumber =
    document.getElementById(
        "teacherApplicationNumber"
    );

const checkTeacherApplicationStatus =
    document.getElementById(
        "checkTeacherApplicationStatus"
    );

const teacherApplicationStatusResult =
    document.getElementById(
        "teacherApplicationStatusResult"
    );


/* =====================================================
   TEACHER CNIC FORMAT
===================================================== */

if (applyTeacherCNIC) {

    applyTeacherCNIC.addEventListener(
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
   TEACHER PHONE FORMAT
===================================================== */

if (applyTeacherPhone) {

    applyTeacherPhone.addEventListener(
        "input",
        function () {

            this.value =
                cleanPhone(
                    this.value
                ).slice(
                    0,
                    11
                );
        }
    );
}


/* =====================================================
   GENERATE TEACHER APPLICATION NUMBER
===================================================== */

function generateTeacherApplicationNumber() {

    const time =
        Date.now()
            .toString()
            .slice(-8);


    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return `TA-${time}-${random}`;
}


/* =====================================================
   GET TEACHER APPLICATION DATA
===================================================== */

function getTeacherApplicationData() {

    return {

        application_no:
            generateTeacherApplicationNumber(),

        name:
            safeString(
                applyTeacherName?.value
            ),

        father_name:
            safeString(
                applyTeacherFatherName?.value
            ),

        cnic:
            formatCNIC(
                applyTeacherCNIC?.value
            ),

        phone:
            cleanPhone(
                applyTeacherPhone?.value
            ),

        date_of_birth:
            safeString(
                applyTeacherDateOfBirth?.value
            ) || null,

        address:
            safeString(
                applyTeacherAddress?.value
            ),

        qualification:
            safeString(
                applyTeacherQualification?.value
            ),

        specialization:
            safeString(
                applyTeacherSpecialization?.value
            ) || null,

        experience:
            safeString(
                applyTeacherExperience?.value
            ) || null,

        previous_institute:
            safeString(
                applyTeacherPreviousInstitute?.value
            ) || null,

        preferred_class:
            safeString(
                applyTeacherPreferredClass?.value
            ),

        available_from:
            safeString(
                applyTeacherAvailableFrom?.value
            ) || null,

        username:
            safeString(
                applyTeacherUsername?.value
            ),

        password:
            safeString(
                applyTeacherPassword?.value
            ),

        confirm_password:
            safeString(
                applyTeacherConfirmPassword?.value
            ),

        status:
            "pending"
    };
}


/* =====================================================
   VALIDATE TEACHER APPLICATION
===================================================== */

function validateTeacherApplication(
    data
) {

    if (
        !data.name ||
        !data.father_name
    ) {

        showMessage(
            teacherApplyMessage,
            "استاد اور والد کا نام مکمل درج کریں۔"
        );

        return false;
    }


    if (
        !isValidCNIC(
            data.cnic
        )
    ) {

        showMessage(
            teacherApplyMessage,
            "شناختی کارڈ نمبر درست درج کریں۔"
        );

        return false;
    }


    if (
        !isValidPhone(
            data.phone
        )
    ) {

        showMessage(
            teacherApplyMessage,
            "موبائل نمبر درست درج کریں۔"
        );

        return false;
    }


    if (!data.date_of_birth) {

        showMessage(
            teacherApplyMessage,
            "تاریخ پیدائش درج کریں۔"
        );

        return false;
    }


    if (!data.address) {

        showMessage(
            teacherApplyMessage,
            "مکمل پتہ درج کریں۔"
        );

        return false;
    }


    if (!data.qualification) {

        showMessage(
            teacherApplyMessage,
            "تعلیمی قابلیت درج کریں۔"
        );

        return false;
    }


    if (!data.preferred_class) {

        showMessage(
            teacherApplyMessage,
            "مطلوبہ کلاس منتخب کریں۔"
        );

        return false;
    }


    if (!data.available_from) {

        showMessage(
            teacherApplyMessage,
            "دستیابی کی تاریخ درج کریں۔"
        );

        return false;
    }


    if (!data.username) {

        showMessage(
            teacherApplyMessage,
            "صارف نام درج کریں۔"
        );

        return false;
    }


    if (
        data.password.length < 8
    ) {

        showMessage(
            teacherApplyMessage,
            "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
        );

        return false;
    }


    if (
        data.password !==
        data.confirm_password
    ) {

        showMessage(
            teacherApplyMessage,
            "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
        );

        return false;
    }


    if (
        !teacherApplyConfirmation?.checked
    ) {

        showMessage(
            teacherApplyMessage,
            "معلومات کی تصدیق کرنا ضروری ہے۔"
        );

        return false;
    }


    return true;
}


/* =====================================================
   CHECK DUPLICATE TEACHER APPLICATION
===================================================== */

async function teacherApplicationDuplicateExists(
    data
) {

    const {
        data: rows,
        error
    } =
        await supabaseClient
            .from(
                TEACHER_APPLICATIONS_TABLE
            )
            .select(
                "id"
            )
            .or(
                `cnic.eq.${data.cnic},username.eq.${data.username}`
            )
            .eq(
                "status",
                "pending"
            );


    if (error) {
        throw error;
    }


    return (
        Array.isArray(rows) &&
        rows.length > 0
    );
}


/* =====================================================
   SUBMIT TEACHER APPLICATION
===================================================== */

async function submitTeacherApplicationForm(
    event
) {

    event.preventDefault();


    if (!checkSupabase()) {
        return;
    }


    clearMessage(
        teacherApplyMessage
    );


    const data =
        getTeacherApplicationData();


    if (
        !validateTeacherApplication(
            data
        )
    ) {
        return;
    }


    if (submitTeacherApplication) {

        submitTeacherApplication.disabled =
            true;

        submitTeacherApplication.textContent =
            "⏳ درخواست جمع ہو رہی ہے...";
    }


    try {

        const duplicate =
            await teacherApplicationDuplicateExists(
                data
            );


        if (duplicate) {

            showMessage(
                teacherApplyMessage,
                "اس شناختی کارڈ یا صارف نام کی درخواست پہلے سے زیرِ منظوری ہے۔"
            );

            return;
        }


        const insertData = {
            ...data
        };


        delete insertData.confirm_password;


        const {
            error
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .insert(
                    [insertData]
                );


        if (error) {
            throw error;
        }


        const applicationNumber =
            data.application_no;


        teacherApplyForm.reset();


        showMessage(
            teacherApplyMessage,
            `درخواست کامیابی سے جمع ہوگئی۔ درخواست نمبر: ${applicationNumber}`,
            "success"
        );


        if (teacherApplicationNumber) {

            teacherApplicationNumber.value =
                applicationNumber;
        }


    } catch (error) {

        console.error(
            "Teacher application error:",
            error
        );


        showMessage(
            teacherApplyMessage,
            "درخواست جمع نہیں ہو سکی۔ دوبارہ کوشش کریں۔"
        );


    } finally {

        if (submitTeacherApplication) {

            submitTeacherApplication.disabled =
                false;

            submitTeacherApplication.textContent =
                "📤 درخواست جمع کریں";
        }
    }
}


/* =====================================================
   TEACHER APPLICATION SUBMIT EVENT
===================================================== */

if (teacherApplyForm) {

    teacherApplyForm.addEventListener(
        "submit",
        submitTeacherApplicationForm
    );
}


/* =====================================================
   CANCEL TEACHER APPLICATION
===================================================== */

if (cancelTeacherApplication) {

    cancelTeacherApplication.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );
}


/* =====================================================
   CHECK TEACHER APPLICATION STATUS
===================================================== */

if (checkTeacherApplicationStatus) {

    checkTeacherApplicationStatus.addEventListener(
        "click",
        async function () {

            const applicationNo =
                safeString(
                    teacherApplicationNumber?.value
                );


            clearMessage(
                teacherApplicationStatusResult
            );


            if (!applicationNo) {

                showMessage(
                    teacherApplicationStatusResult,
                    "درخواست نمبر درج کریں۔"
                );

                return;
            }


            if (!checkSupabase()) {
                return;
            }


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from(
                            TEACHER_APPLICATIONS_TABLE
                        )
                        .select(
                            "application_no, status, admin_note"
                        )
                        .eq(
                            "application_no",
                            applicationNo
                        )
                        .maybeSingle();


                if (error) {
                    throw error;
                }


                if (!data) {

                    showMessage(
                        teacherApplicationStatusResult,
                        "اس درخواست نمبر کا ریکارڈ نہیں ملا۔"
                    );

                    return;
                }


                const status =
                    safeLower(
                        data.status
                    );


                let statusText =
                    "زیرِ منظوری";


                if (
                    status ===
                    "approved"
                ) {

                    statusText =
                        "منظور شدہ";

                } else if (
                    status ===
                    "rejected"
                ) {

                    statusText =
                        "نامنظور";
                }


                teacherApplicationStatusResult.innerHTML = `

                    <strong>
                        درخواست کی حالت:
                    </strong>

                    ${escapeHTML(statusText)}

                    ${
                        data.admin_note
                            ? `<br><strong>ایڈمن نوٹ:</strong> ${escapeHTML(data.admin_note)}`
                            : ""
                    }

                `;


            } catch (error) {

                console.error(
                    "Teacher application status error:",
                    error
                );


                showMessage(
                    teacherApplicationStatusResult,
                    "درخواست کی حالت معلوم نہیں ہو سکی۔"
                );
            }
        }
    );
}


/* =====================================================
   INITIALIZE TEACHER APPLICATION PAGE
===================================================== */

function initializeTeacherApplicationPage() {

    if (
        currentFile !==
        "teacher-apply.html"
    ) {
        return;
    }


    clearMessage(
        teacherApplyMessage
    );


    clearMessage(
        teacherApplicationStatusResult
    );
}


/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 11
   APPLICATION APPROVAL SYSTEM
===================================================== */


/* =====================================================
   APPROVAL PAGE ELEMENTS
===================================================== */

const studentApplicationsList =
    document.getElementById(
        "studentApplicationsList"
    );

const teacherApplicationsList =
    document.getElementById(
        "teacherApplicationsList"
    );

const studentApplicationCount =
    document.getElementById(
        "studentApplicationCount"
    );

const teacherApplicationCount =
    document.getElementById(
        "teacherApplicationCount"
    );

const applicationDetailsOverlay =
    document.getElementById(
        "applicationDetailsOverlay"
    );

const applicationDetailsContent =
    document.getElementById(
        "applicationDetailsContent"
    );

const closeApplicationDetails =
    document.getElementById(
        "closeApplicationDetails"
    );

const applicationDecisionSection =
    document.getElementById(
        "applicationDecisionSection"
    );

const applicationAdminNote =
    document.getElementById(
        "applicationAdminNote"
    );


let studentApplicationsCache = [];

let teacherApplicationsCache = [];

let selectedApplication = null;


/* =====================================================
   LOAD STUDENT APPLICATIONS
===================================================== */

async function loadStudentApplications() {

    if (
        !studentApplicationsList ||
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
                    STUDENT_APPLICATIONS_TABLE
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


        studentApplicationsCache =
            Array.isArray(data)
                ? data
                : [];


        renderStudentApplications(
            studentApplicationsCache
        );


    } catch (error) {

        console.error(
            "Student applications load error:",
            error
        );


        studentApplicationsList.innerHTML = `

            <div class="empty-students">
                طالبات کی درخواستیں لوڈ نہیں ہو سکیں۔
            </div>

        `;
    }
}


/* =====================================================
   LOAD TEACHER APPLICATIONS
===================================================== */

async function loadTeacherApplications() {

    if (
        !teacherApplicationsList ||
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
                    TEACHER_APPLICATIONS_TABLE
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


        teacherApplicationsCache =
            Array.isArray(data)
                ? data
                : [];


        renderTeacherApplications(
            teacherApplicationsCache
        );


    } catch (error) {

        console.error(
            "Teacher applications load error:",
            error
        );


        teacherApplicationsList.innerHTML = `

            <div class="teacher-empty">
                اساتذہ کی درخواستیں لوڈ نہیں ہو سکیں۔
            </div>

        `;
    }
}


/* =====================================================
   STATUS TEXT
===================================================== */

function getApplicationStatusText(
    status
) {

    switch (
        safeLower(status)
    ) {

        case "approved":
            return "منظور شدہ";

        case "rejected":
            return "نامنظور";

        default:
            return "زیرِ منظوری";
    }
}


/* =====================================================
   STATUS CLASS
===================================================== */

function getApplicationStatusClass(
    status
) {

    switch (
        safeLower(status)
    ) {

        case "approved":
            return "approved";

        case "rejected":
            return "rejected";

        default:
            return "pending";
    }
}


/* =====================================================
   RENDER STUDENT APPLICATIONS
===================================================== */

function renderStudentApplications(
    applications
) {

    if (!studentApplicationsList) {
        return;
    }


    const rows =
        Array.isArray(applications)
            ? applications
            : [];


    if (studentApplicationCount) {

        studentApplicationCount.textContent =
            rows.filter(
                item =>
                    safeLower(item.status) ===
                    "pending"
            ).length;
    }


    if (rows.length === 0) {

        studentApplicationsList.innerHTML = `

            <div class="empty-students">
                طالبات کی کوئی درخواست موجود نہیں۔
            </div>

        `;

        return;
    }


    studentApplicationsList.innerHTML =
        rows.map(
            item => {

                const status =
                    getApplicationStatusText(
                        item.status
                    );

                const statusClass =
                    getApplicationStatusClass(
                        item.status
                    );


                return `

                    <div class="application-card">

                        <div class="application-card-header">

                            <div>

                                <h3>
                                    ${escapeHTML(item.name)}
                                </h3>

                                <p>
                                    درخواست نمبر:
                                    ${escapeHTML(item.application_no)}
                                </p>

                                <p>
                                    کلاس:
                                    ${escapeHTML(item.student_class)}
                                </p>

                            </div>


                            <span
                                class="application-status ${statusClass}"
                            >
                                ${status}
                            </span>

                        </div>


                        <div class="application-actions">

                            <button
                                type="button"
                                class="view-application"
                                data-type="student"
                                data-id="${escapeHTML(item.id)}"
                            >
                                👁️ تفصیلات
                            </button>


                            ${
                                safeLower(item.status) ===
                                "pending"
                                    ? `

                                        <button
                                            type="button"
                                            class="approve-application"
                                            data-type="student"
                                            data-id="${escapeHTML(item.id)}"
                                        >
                                            ✅ منظور کریں
                                        </button>


                                        <button
                                            type="button"
                                            class="reject-application"
                                            data-type="student"
                                            data-id="${escapeHTML(item.id)}"
                                        >
                                            ❌ نامنظور کریں
                                        </button>

                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `;
            }
        ).join("");


    bindApplicationButtons();
}


/* =====================================================
   RENDER TEACHER APPLICATIONS
===================================================== */

function renderTeacherApplications(
    applications
) {

    if (!teacherApplicationsList) {
        return;
    }


    const rows =
        Array.isArray(applications)
            ? applications
            : [];


    if (teacherApplicationCount) {

        teacherApplicationCount.textContent =
            rows.filter(
                item =>
                    safeLower(item.status) ===
                    "pending"
            ).length;
    }


    if (rows.length === 0) {

        teacherApplicationsList.innerHTML = `

            <div class="teacher-empty">
                اساتذہ کی کوئی درخواست موجود نہیں۔
            </div>

        `;

        return;
    }


    teacherApplicationsList.innerHTML =
        rows.map(
            item => {

                const status =
                    getApplicationStatusText(
                        item.status
                    );

                const statusClass =
                    getApplicationStatusClass(
                        item.status
                    );


                return `

                    <div class="application-card">

                        <div class="application-card-header">

                            <div>

                                <h3>
                                    ${escapeHTML(item.name)}
                                </h3>

                                <p>
                                    درخواست نمبر:
                                    ${escapeHTML(item.application_no)}
                                </p>

                                <p>
                                    مطلوبہ کلاس:
                                    ${escapeHTML(item.preferred_class)}
                                </p>

                            </div>


                            <span
                                class="application-status ${statusClass}"
                            >
                                ${status}
                            </span>

                        </div>


                        <div class="application-actions">

                            <button
                                type="button"
                                class="view-application"
                                data-type="teacher"
                                data-id="${escapeHTML(item.id)}"
                            >
                                👁️ تفصیلات
                            </button>


                            ${
                                safeLower(item.status) ===
                                "pending"
                                    ? `

                                        <button
                                            type="button"
                                            class="approve-application"
                                            data-type="teacher"
                                            data-id="${escapeHTML(item.id)}"
                                        >
                                            ✅ منظور کریں
                                        </button>


                                        <button
                                            type="button"
                                            class="reject-application"
                                            data-type="teacher"
                                            data-id="${escapeHTML(item.id)}"
                                        >
                                            ❌ نامنظور کریں
                                        </button>

                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `;
            }
        ).join("");


    bindApplicationButtons();
}


/* =====================================================
   FIND APPLICATION
===================================================== */

function findApplication(
    type,
    id
) {

    const source =
        type === "student"
            ? studentApplicationsCache
            : teacherApplicationsCache;


    return source.find(
        item =>
            String(item.id) ===
            String(id)
    ) || null;
}


/* =====================================================
   SHOW APPLICATION DETAILS
===================================================== */

function showApplicationDetails(
    type,
    id
) {

    const item =
        findApplication(
            type,
            id
        );


    if (!item) {
        return;
    }


    selectedApplication = {
        type,
        id: item.id
    };


    if (!applicationDetailsContent) {
        return;
    }


    if (type === "student") {

        const mahrams =
            Array.isArray(item.mahrams)
                ? item.mahrams
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


        applicationDetailsContent.innerHTML = `

            <h3>
                👧 طالبہ کی معلومات
            </h3>

            <p>
                <strong>درخواست نمبر:</strong>
                ${escapeHTML(item.application_no)}
            </p>

            <p>
                <strong>نام:</strong>
                ${escapeHTML(item.name)}
            </p>

            <p>
                <strong>والد:</strong>
                ${escapeHTML(item.father_name)}
            </p>

            <p>
                <strong>سرپرست:</strong>
                ${escapeHTML(item.guardian_name)}
            </p>

            <p>
                <strong>شناختی کارڈ / ب فارم:</strong>
                ${escapeHTML(item.cnic)}
            </p>

            <p>
                <strong>موبائل:</strong>
                ${escapeHTML(item.phone)}
            </p>

            <p>
                <strong>تاریخ پیدائش:</strong>
                ${escapeHTML(item.date_of_birth)}
            </p>

            <p>
                <strong>کلاس:</strong>
                ${escapeHTML(item.student_class)}
            </p>

            <p>
                <strong>داخلہ کی قسم:</strong>
                ${escapeHTML(item.admission_type)}
            </p>

            <p>
                <strong>رہائش:</strong>
                ${escapeHTML(item.residence_type)}
            </p>

            <p>
                <strong>پتہ:</strong>
                ${escapeHTML(item.address)}
            </p>

            <p>
                <strong>صارف نام:</strong>
                ${escapeHTML(item.username)}
            </p>


            <h3>
                👥 محرم
            </h3>

            ${mahramHTML}

        `;

    } else {

        applicationDetailsContent.innerHTML = `

            <h3>
                👩‍🏫 استاد کی معلومات
            </h3>

            <p>
                <strong>درخواست نمبر:</strong>
                ${escapeHTML(item.application_no)}
            </p>

            <p>
                <strong>نام:</strong>
                ${escapeHTML(item.name)}
            </p>

            <p>
                <strong>والد:</strong>
                ${escapeHTML(item.father_name)}
            </p>

            <p>
                <strong>شناختی کارڈ:</strong>
                ${escapeHTML(item.cnic)}
            </p>

            <p>
                <strong>موبائل:</strong>
                ${escapeHTML(item.phone)}
            </p>

            <p>
                <strong>تاریخ پیدائش:</strong>
                ${escapeHTML(item.date_of_birth)}
            </p>

            <p>
                <strong>پتہ:</strong>
                ${escapeHTML(item.address)}
            </p>

            <p>
                <strong>تعلیمی قابلیت:</strong>
                ${escapeHTML(item.qualification)}
            </p>

            <p>
                <strong>تخصص / مہارت:</strong>
                ${escapeHTML(item.specialization)}
            </p>

            <p>
                <strong>تجربہ:</strong>
                ${escapeHTML(item.experience)}
            </p>

            <p>
                <strong>سابقہ ادارہ:</strong>
                ${escapeHTML(item.previous_institute)}
            </p>

            <p>
                <strong>مطلوبہ کلاس:</strong>
                ${escapeHTML(item.preferred_class)}
            </p>

            <p>
                <strong>دستیابی:</strong>
                ${escapeHTML(item.available_from)}
            </p>

            <p>
                <strong>صارف نام:</strong>
                ${escapeHTML(item.username)}
            </p>

        `;
    }


    applicationDetailsOverlay
        ?.classList.remove(
            "hidden"
        );


    document.body.classList.add(
        "modal-open"
    );
}


/* =====================================================
   CLOSE APPLICATION DETAILS
===================================================== */

function closeApplicationDetailsModal() {

    applicationDetailsOverlay
        ?.classList.add(
            "hidden"
        );


    document.body.classList.remove(
        "modal-open"
    );


    selectedApplication = null;
}


if (closeApplicationDetails) {

    closeApplicationDetails.addEventListener(
        "click",
        closeApplicationDetailsModal
    );
}


if (applicationDetailsOverlay) {

    applicationDetailsOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                applicationDetailsOverlay
            ) {

                closeApplicationDetailsModal();
            }
        }
    );
}


/* =====================================================
   GENERATE TEACHER CODE
===================================================== */

async function generateNextTeacherCode() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                TEACHERS_TABLE
            )
            .select(
                "teacher_code"
            );


    if (error) {
        throw error;
    }


    let highest = 0;


    (
        Array.isArray(data)
            ? data
            : []
    ).forEach(
        item => {

            const match =
                safeString(
                    item.teacher_code
                ).match(
                    /(\d+)/
                );


            if (match) {

                highest =
                    Math.max(
                        highest,
                        Number(
                            match[1]
                        ) || 0
                    );
            }
        }
    );


    return `T-${String(
        highest + 1
    ).padStart(
        3,
        "0"
    )}`;
}


/* =====================================================
   APPROVE STUDENT APPLICATION
===================================================== */

async function approveStudentApplication(
    item
) {

    const admissionNo =
        `S-${Date.now()
            .toString()
            .slice(-7)}`;


    const studentData = {

        admission_no:
            admissionNo,

        admission_type:
            item.admission_type,

        name:
            item.name,

        father_name:
            item.father_name,

        guardian_name:
            item.guardian_name,

        cnic:
            item.cnic,

        phone:
            item.phone,

        date_of_birth:
            item.date_of_birth,

        student_class:
            item.student_class,

        admission_date:
            getTodayDate(),

        address:
            item.address,

        residence_type:
            item.residence_type,

        previous_madrassa:
            item.previous_madrassa || null,

        transfer_date:
            item.transfer_date || null,

        mahrams:
            Array.isArray(item.mahrams)
                ? item.mahrams
                : [],

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
            .select()
            .single();


    if (studentError) {
        throw studentError;
    }


    const accountData = {

        username:
            item.username,

        password:
            item.password,

        role:
            "student",

        status:
            "active",

        reference_id:
            student.id
    };


    const {
        error: accountError
    } =
        await supabaseClient
            .from(
                ACCOUNTS_TABLE
            )
            .insert(
                [accountData]
            );


    if (accountError) {

        await supabaseClient
            .from(
                STUDENTS_TABLE
            )
            .delete()
            .eq(
                "id",
                student.id
            );

        throw accountError;
    }


    return student;
}


/* =====================================================
   APPROVE TEACHER APPLICATION
===================================================== */

async function approveTeacherApplication(
    item
) {

    const teacherCode =
        await generateNextTeacherCode();


    const teacherData = {

        teacher_code:
            teacherCode,

        name:
            item.name,

        father_name:
            item.father_name,

        phone:
            item.phone,

        cnic:
            item.cnic,

        date_of_birth:
            item.date_of_birth,

        qualification:
            item.qualification,

        joining_date:
            getTodayDate(),

        address:
            item.address,

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
            .select()
            .single();


    if (teacherError) {
        throw teacherError;
    }


    const accountData = {

        username:
            item.username,

        password:
            item.password,

        role:
            "teacher",

        status:
            "active",

        reference_id:
            teacher.id
    };


    const {
        error: accountError
    } =
        await supabaseClient
            .from(
                ACCOUNTS_TABLE
            )
            .insert(
                [accountData]
            );


    if (accountError) {

        await supabaseClient
            .from(
                TEACHERS_TABLE
            )
            .delete()
            .eq(
                "id",
                teacher.id
            );

        throw accountError;
    }


    return teacher;
}


/* =====================================================
   APPROVE APPLICATION
===================================================== */

async function approveApplication(
    type,
    id
) {

    if (!requireAdmin()) {
        return;
    }


    const item =
        findApplication(
            type,
            id
        );


    if (!item) {
        return;
    }


    if (
        safeLower(item.status) !==
        "pending"
    ) {
        return;
    }


    const confirmed =
        window.confirm(
            "کیا آپ واقعی اس درخواست کو منظور کرنا چاہتے ہیں؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        if (
            type ===
            "student"
        ) {

            await approveStudentApplication(
                item
            );

        } else {

            await approveTeacherApplication(
                item
            );
        }


        const table =
            type === "student"
                ? STUDENT_APPLICATIONS_TABLE
                : TEACHER_APPLICATIONS_TABLE;


        const {
            error
        } =
            await supabaseClient
                .from(
                    table
                )
                .update({
                    status:
                        "approved",

                    admin_note:
                        safeString(
                            applicationAdminNote?.value
                        ) || null,

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


        alert(
            "درخواست کامیابی سے منظور ہوگئی۔"
        );


        await Promise.allSettled([
            loadStudentApplications(),
            loadTeacherApplications()
        ]);


    } catch (error) {

        console.error(
            "Application approval error:",
            error
        );


        alert(
            "درخواست منظور نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   REJECT APPLICATION
===================================================== */

async function rejectApplication(
    type,
    id
) {

    if (!requireAdmin()) {
        return;
    }


    const item =
        findApplication(
            type,
            id
        );


    if (!item) {
        return;
    }


    if (
        safeLower(item.status) !==
        "pending"
    ) {
        return;
    }


    const confirmed =
        window.confirm(
            "کیا آپ واقعی اس درخواست کو نامنظور کرنا چاہتے ہیں؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const table =
            type === "student"
                ? STUDENT_APPLICATIONS_TABLE
                : TEACHER_APPLICATIONS_TABLE;


        const {
            error
        } =
            await supabaseClient
                .from(
                    table
                )
                .update({

                    status:
                        "rejected",

                    admin_note:
                        safeString(
                            applicationAdminNote?.value
                        ) || null,

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


        alert(
            "درخواست نامنظور کر دی گئی۔"
        );


        await Promise.allSettled([
            loadStudentApplications(),
            loadTeacherApplications()
        ]);


    } catch (error) {

        console.error(
            "Application rejection error:",
            error
        );


        alert(
            "درخواست نامنظور نہیں ہو سکی۔"
        );
    }
}


/* =====================================================
   BIND APPLICATION BUTTONS
===================================================== */

function bindApplicationButtons() {

    document
        .querySelectorAll(
            ".view-application"
        )
        .forEach(
            button => {

                button.onclick =
                    function () {

                        showApplicationDetails(
                            this.dataset.type,
                            this.dataset.id
                        );
                    };
            }
        );


    document
        .querySelectorAll(
            ".approve-application"
        )
        .forEach(
            button => {

                button.onclick =
                    function () {

                        approveApplication(
                            this.dataset.type,
                            this.dataset.id
                        );
                    };
            }
        );


    document
        .querySelectorAll(
            ".reject-application"
        )
        .forEach(
            button => {

                button.onclick =
                    function () {

                        rejectApplication(
                            this.dataset.type,
                            this.dataset.id
                        );
                    };
            }
        );
}


/* =====================================================
   INITIALIZE APPROVAL PAGE
===================================================== */

async function initializeApprovalsPage() {

    if (
        currentFile !==
        "approvals.html"
    ) {
        return;
    }


    if (!requireAdmin()) {
        return;
    }


    await Promise.allSettled([

        loadStudentApplications(),

        loadTeacherApplications()

    ]);
       }


/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 12
   APPLICATION STATUS + FINAL INITIALIZATION
===================================================== */


/* =====================================================
   STUDENT APPLICATION STATUS
===================================================== */

async function checkStudentApplicationStatus() {

    const applicationNumberInput =
        document.getElementById(
            "studentApplicationNumber"
        );

    const resultBox =
        document.getElementById(
            "studentApplicationStatusResult"
        );


    if (
        !applicationNumberInput ||
        !resultBox
    ) {
        return;
    }


    const applicationNumber =
        safeString(
            applicationNumberInput.value
        ).trim();


    if (!applicationNumber) {

        resultBox.textContent =
            "درخواست نمبر درج کریں۔";

        return;
    }


    if (!checkSupabase()) {
        return;
    }


    resultBox.textContent =
        "درخواست تلاش کی جا رہی ہے۔۔۔";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    STUDENT_APPLICATIONS_TABLE
                )
                .select(
                    "application_no,status,admin_note,created_at,reviewed_at"
                )
                .eq(
                    "application_no",
                    applicationNumber
                )
                .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {

            resultBox.innerHTML = `

                <div class="rejected-badge">
                    درخواست نہیں ملی۔
                </div>

            `;

            return;
        }


        const status =
            safeLower(
                data.status
            );


        let statusText =
            "زیرِ منظوری";

        let statusClass =
            "pending-badge";


        if (
            status ===
            "approved"
        ) {

            statusText =
                "درخواست منظور ہوگئی ہے";

            statusClass =
                "approved-badge";

        } else if (
            status ===
            "rejected"
        ) {

            statusText =
                "درخواست منظور نہیں ہوئی";

            statusClass =
                "rejected-badge";
        }


        resultBox.innerHTML = `

            <div class="${statusClass}">
                ${statusText}
            </div>

            ${
                safeString(
                    data.admin_note
                )
                    ? `

                        <div class="security-card">

                            <strong>
                                انتظامیہ کا پیغام:
                            </strong>

                            <br>

                            ${escapeHTML(
                                data.admin_note
                            )}

                        </div>

                    `
                    : ""
            }

        `;


    } catch (error) {

        console.error(
            "Student application status error:",
            error
        );


        resultBox.textContent =
            "درخواست کی حالت معلوم نہیں ہو سکی۔";
    }
}


/* =====================================================
   TEACHER APPLICATION STATUS
===================================================== */

async function checkTeacherApplicationStatus() {

    const applicationNumberInput =
        document.getElementById(
            "teacherApplicationNumber"
        );

    const resultBox =
        document.getElementById(
            "teacherApplicationStatusResult"
        );


    if (
        !applicationNumberInput ||
        !resultBox
    ) {
        return;
    }


    const applicationNumber =
        safeString(
            applicationNumberInput.value
        ).trim();


    if (!applicationNumber) {

        resultBox.textContent =
            "درخواست نمبر درج کریں۔";

        return;
    }


    if (!checkSupabase()) {
        return;
    }


    resultBox.textContent =
        "درخواست تلاش کی جا رہی ہے۔۔۔";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    TEACHER_APPLICATIONS_TABLE
                )
                .select(
                    "application_no,status,admin_note,created_at,reviewed_at"
                )
                .eq(
                    "application_no",
                    applicationNumber
                )
                .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {

            resultBox.innerHTML = `

                <div class="rejected-badge">
                    درخواست نہیں ملی۔
                </div>

            `;

            return;
        }


        const status =
            safeLower(
                data.status
            );


        let statusText =
            "زیرِ منظوری";

        let statusClass =
            "pending-badge";


        if (
            status ===
            "approved"
        ) {

            statusText =
                "درخواست منظور ہوگئی ہے";

            statusClass =
                "approved-badge";

        } else if (
            status ===
            "rejected"
        ) {

            statusText =
                "درخواست منظور نہیں ہوئی";

            statusClass =
                "rejected-badge";
        }


        resultBox.innerHTML = `

            <div class="${statusClass}">
                ${statusText}
            </div>

            ${
                safeString(
                    data.admin_note
                )
                    ? `

                        <div class="security-card">

                            <strong>
                                انتظامیہ کا پیغام:
                            </strong>

                            <br>

                            ${escapeHTML(
                                data.admin_note
                            )}

                        </div>

                    `
                    : ""
            }

        `;


    } catch (error) {

        console.error(
            "Teacher application status error:",
            error
        );


        resultBox.textContent =
            "درخواست کی حالت معلوم نہیں ہو سکی۔";
    }
}


/* =====================================================
   STATUS BUTTON EVENTS
===================================================== */

const checkStudentApplicationStatusButton =
    document.getElementById(
        "checkStudentApplicationStatus"
    );


if (
    checkStudentApplicationStatusButton
) {

    checkStudentApplicationStatusButton
        .addEventListener(
            "click",
            checkStudentApplicationStatus
        );
}


const checkTeacherApplicationStatusButton =
    document.getElementById(
        "checkTeacherApplicationStatus"
    );


if (
    checkTeacherApplicationStatusButton
) {

    checkTeacherApplicationStatusButton
        .addEventListener(
            "click",
            checkTeacherApplicationStatus
        );
}


/* =====================================================
   ENTER KEY FOR APPLICATION STATUS
===================================================== */

const studentApplicationNumberInput =
    document.getElementById(
        "studentApplicationNumber"
    );


if (
    studentApplicationNumberInput
) {

    studentApplicationNumberInput
        .addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    checkStudentApplicationStatus();
                }
            }
        );
}


const teacherApplicationNumberInput =
    document.getElementById(
        "teacherApplicationNumber"
    );


if (
    teacherApplicationNumberInput
) {

    teacherApplicationNumberInput
        .addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    checkTeacherApplicationStatus();
                }
            }
        );
}


/* =====================================================
   BACK BUTTONS
===================================================== */

document
    .querySelectorAll(
        "#backToDashboard"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "dashboard.html";
                }
            );
        }
    );


document
    .querySelectorAll(
        "#backToHome"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "index.html";
                }
            );
        }
    );


/* =====================================================
   CANCEL APPLICATION BUTTONS
===================================================== */

const cancelStudentApplication =
    document.getElementById(
        "cancelStudentApplication"
    );


if (cancelStudentApplication) {

    cancelStudentApplication
        .addEventListener(
            "click",
            function () {

                window.location.href =
                    "index.html";
            }
        );
}


const cancelTeacherApplication =
    document.getElementById(
        "cancelTeacherApplication"
    );


if (cancelTeacherApplication) {

    cancelTeacherApplication
        .addEventListener(
            "click",
            function () {

                window.location.href =
                    "index.html";
            }
        );
}


/* =====================================================
   ESCAPE KEY MODAL CLOSE
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        if (
            applicationDetailsOverlay &&
            !applicationDetailsOverlay
                .classList
                .contains(
                    "hidden"
                )
        ) {

            closeApplicationDetailsModal();
        }


        if (
            typeof closeStudentDetailsModal ===
            "function"
        ) {

            closeStudentDetailsModal();
        }


        if (
            typeof closeTeacherDetailsModal ===
            "function"
        ) {

            closeTeacherDetailsModal();
        }
    }
);


/* =====================================================
   ADMIN ONLY ELEMENTS
===================================================== */

function updateAdminOnlyElements() {

    const admin =
        getCurrentRole() ===
        "admin";


    document
        .querySelectorAll(
            ".admin-only"
        )
        .forEach(
            element => {

                if (admin) {

                    element.classList.remove(
                        "hidden"
                    );

                } else {

                    element.classList.add(
                        "hidden"
                    );
                }
            }
        );
}


/* =====================================================
   PROTECTED PAGE CHECK
===================================================== */

function protectCurrentPage() {

    const protectedPages = [

        "dashboard.html",
        "students.html",
        "teachers.html",
        "attendance.html",
        "approvals.html"

    ];


    if (
        !protectedPages.includes(
            currentFile
        )
    ) {
        return true;
    }


    if (!isAuthenticated()) {

        redirectToLogin();

        return false;
    }


    if (
        currentFile ===
            "approvals.html" &&
        getCurrentRole() !==
            "admin"
    ) {

        window.location.href =
            "dashboard.html";

        return false;
    }


    return true;
}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

async function initializeCurrentPage() {

    if (!protectCurrentPage()) {
        return;
    }


    updateAdminOnlyElements();


    try {

        switch (
            currentFile
        ) {

            case "":
            case "index.html":

                if (
                    typeof initializeHomePage ===
                    "function"
                ) {

                    initializeHomePage();
                }

                break;


            case "login.html":

                if (
                    typeof initializeLoginPage ===
                    "function"
                ) {

                    initializeLoginPage();
                }

                break;


            case "dashboard.html":

                if (
                    typeof initializeDashboardPage ===
                    "function"
                ) {

                    await initializeDashboardPage();
                }

                break;


            case "students.html":

                if (
                    typeof initializeStudentsPage ===
                    "function"
                ) {

                    await initializeStudentsPage();
                }

                break;


            case "teachers.html":

                if (
                    typeof initializeTeachersPage ===
                    "function"
                ) {

                    await initializeTeachersPage();
                }

                break;


            case "attendance.html":

                if (
                    typeof initializeAttendancePage ===
                    "function"
                ) {

                    await initializeAttendancePage();
                }

                break;


            case "student-apply.html":

                if (
                    typeof initializeStudentApplicationPage ===
                    "function"
                ) {

                    initializeStudentApplicationPage();
                }

                break;


            case "teacher-apply.html":

                if (
                    typeof initializeTeacherApplicationPage ===
                    "function"
                ) {

                    initializeTeacherApplicationPage();
                }

                break;


            case "approvals.html":

                await initializeApprovalsPage();

                break;
        }


    } catch (error) {

        console.error(
            "Page initialization error:",
            error
        );
    }
}


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeCurrentPage();
    }
);


