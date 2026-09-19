/* =====================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 1
   CONFIGURATION + SUPABASE + GLOBAL HELPERS
===================================================== */


/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://ggtnetudnjsmsmitvjmb.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";


let supabaseClient = null;


if (
    typeof window.supabase !== "undefined" &&
    SUPABASE_URL &&
    SUPABASE_ANON_KEY
) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
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

const ACCOUNTS_TABLE =
    "accounts";

const ATTENDANCE_TABLE =
    "attendance";

const AUDIT_LOG_TABLE =
    "audit_logs";


/* =====================================================
   CURRENT PAGE
===================================================== */

function getCurrentPageName() {

    const path =
        window.location.pathname;

    const page =
        path
            .split("/")
            .pop()
            .toLowerCase();

    return page || "index.html";

}


const currentFile =
    getCurrentPageName();


/* =====================================================
   SAFE STRING
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


/* =====================================================
   ESCAPE HTML
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
   ELEMENT HELPER
===================================================== */

function getElement(id) {

    return document.getElementById(id);

}


/* =====================================================
   SUPABASE CHECK
===================================================== */

function checkSupabase() {

    if (!supabaseClient) {

        console.error(
            "Supabase client is not available."
        );

        return false;
    }

    return true;

}


/* =====================================================
   SHOW MESSAGE
===================================================== */

function showMessage(
    element,
    text,
    type = "error"
) {

    if (!element) {
        return;
    }

    element.textContent =
        safeString(text);


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


/* =====================================================
   CLEAR MESSAGE
===================================================== */

function clearMessage(element) {

    if (!element) {
        return;
    }

    element.textContent = "";

}


/* =====================================================
   DATE HELPER
===================================================== */

function getTodayDate() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =====================================================
   RANDOM CODE
===================================================== */

function generateRandomCode(
    prefix = "APP"
) {

    const time =
        Date.now()
            .toString()
            .slice(-7);

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return (
        prefix +
        "-" +
        time +
        "-" +
        random
    );

}


/* =====================================================
   NORMALIZE DIGITS
===================================================== */

function normalizeDigits(value) {

    return safeString(value)
        .replace(/[^\d]/g, "");

}


/* =====================================================
   CNIC FORMAT
===================================================== */

function formatCNIC(value) {

    const digits =
        normalizeDigits(value)
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


/* =====================================================
   CNIC VALIDATION
===================================================== */

function isValidCNIC(value) {

    return (
        normalizeDigits(value)
            .length === 13
    );

}


/* =====================================================
   PHONE VALIDATION
===================================================== */

function isValidPhone(value) {

    const phone =
        normalizeDigits(value);

    return (
        phone.length === 11 &&
        phone.startsWith("03")
    );

}


/* =====================================================
   USERNAME VALIDATION
===================================================== */

function isValidUsername(value) {

    const username =
        safeString(value);

    return (
        username.length >= 4 &&
        username.length <= 40
    );

}


/* =====================================================
   PASSWORD VALIDATION
===================================================== */

function isValidPassword(value) {

    return (
        safeString(value)
            .length >= 8
    );

}


/* =====================================================
   CURRENT ROLE
===================================================== */

function getCurrentRole() {

    return safeString(
        sessionStorage.getItem(
            "userRole"
        ) ||
        localStorage.getItem(
            "userRole"
        )
    ).toLowerCase();

}


/* =====================================================
   AUTHENTICATION STATUS
===================================================== */

function isAuthenticated() {

    const sessionLogin =
        sessionStorage.getItem(
            "loggedIn"
        );

    const localLogin =
        localStorage.getItem(
            "loggedIn"
        );

    return (
        sessionLogin === "true" ||
        localLogin === "true"
    );

}


/* =====================================================
   CURRENT USERNAME
===================================================== */

function getCurrentUsername() {

    return safeString(
        sessionStorage.getItem(
            "username"
        ) ||
        localStorage.getItem(
            "username"
        )
    );

}


/* =====================================================
   ADMIN CHECK
===================================================== */

function isAdmin() {

    return (
        isAuthenticated() &&
        getCurrentRole() === "admin"
    );

}


/* =====================================================
   REQUIRE ADMIN
===================================================== */

function requireAdmin() {

    if (isAdmin()) {
        return true;
    }

    alert(
        "یہ کام صرف ایڈمن کر سکتا ہے۔"
    );

    return false;

}


/* =====================================================
   LOGIN REDIRECT
===================================================== */

function redirectToLogin(role = "") {

    let url =
        "login.html";

    const safeRole =
        safeString(role);

    if (safeRole) {

        url +=
            "?role=" +
            encodeURIComponent(
                safeRole
            );

    }

    window.location.href =
        url;

}


/* =====================================================
   DASHBOARD REDIRECT
===================================================== */

function redirectToDashboard() {

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

    window.location.href =
        "index.html";

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {

    sessionStorage.removeItem(
        "loggedIn"
    );

    sessionStorage.removeItem(
        "userRole"
    );

    sessionStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "loginTime"
    );

    window.location.href =
        "index.html?logout=true";

}


/* =====================================================
   ADMIN-ONLY ELEMENTS
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
   AUTO FORMAT CNIC
===================================================== */

function setupCNICInput(id) {

    const input =
        getElement(id);

    if (!input) {
        return;
    }

    input.addEventListener(
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
   AUTO FORMAT PHONE
===================================================== */

function setupPhoneInput(id) {

    const input =
        getElement(id);

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        function () {

            this.value =
                normalizeDigits(
                    this.value
                )
                    .slice(0, 11);

        }
    );

}


/* =====================================================
   MODAL HELPERS
===================================================== */

function openModal(element) {

    if (!element) {
        return;
    }

    element.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(element) {

    if (!element) {
        return;
    }

    element.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


/* =====================================================
   END PART 1
===================================================== */

/* =====================================================
   SCRIPT.JS
   PART 2
   HOME PAGE + LOGIN SYSTEM
===================================================== */


/* =====================================================
   HOME PAGE BUTTONS
===================================================== */

function initializeHomePage() {

    if (
        currentFile !== "index.html" &&
        currentFile !== ""
    ) {
        return;
    }


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


    if (adminLoginButton) {

        adminLoginButton.addEventListener(
            "click",
            function () {

                redirectToLogin(
                    "admin"
                );

            }
        );

    }


    if (teacherLoginButton) {

        teacherLoginButton.addEventListener(
            "click",
            function () {

                redirectToLogin(
                    "teacher"
                );

            }
        );

    }


    if (studentLoginButton) {

        studentLoginButton.addEventListener(
            "click",
            function () {

                redirectToLogin(
                    "student"
                );

            }
        );

    }


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

}


/* =====================================================
   LOGIN ROLE FROM URL
===================================================== */

function getLoginRoleFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return safeString(
        params.get("role")
    ).toLowerCase();

}


/* =====================================================
   ROLE NAME
===================================================== */

function getRoleUrduName(role) {

    if (role === "admin") {
        return "ایڈمن";
    }

    if (role === "teacher") {
        return "استاد";
    }

    if (role === "student") {
        return "طالبہ";
    }

    return "منتخب نہیں";

}


/* =====================================================
   LOGIN ELEMENTS
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
   SET LOGIN ROLE
===================================================== */

function setLoginRole() {

    if (!loginRole) {
        return "";
    }

    const role =
        getLoginRoleFromURL();


    if (
        role !== "admin" &&
        role !== "teacher" &&
        role !== "student"
    ) {

        loginRole.value = "";

        if (selectedRoleText) {

            selectedRoleText.textContent =
                "منتخب نہیں";

        }

        return "";

    }


    loginRole.value =
        role;


    if (selectedRoleText) {

        selectedRoleText.textContent =
            getRoleUrduName(role);

    }


    return role;

}


/* =====================================================
   HIDE LOGIN STATUS MESSAGES
===================================================== */

function hideLoginStatusMessages() {

    if (pendingAccountMessage) {

        pendingAccountMessage.classList.add(
            "hidden"
        );

    }


    if (rejectedAccountMessage) {

        rejectedAccountMessage.classList.add(
            "hidden"
        );

    }

}


/* =====================================================
   SAVE LOGIN SESSION
===================================================== */

function saveLoginSession(
    username,
    role,
    remember
) {

    sessionStorage.removeItem(
        "loggedIn"
    );

    sessionStorage.removeItem(
        "userRole"
    );

    sessionStorage.removeItem(
        "username"
    );


    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "username"
    );


    const storage =
        remember
            ? localStorage
            : sessionStorage;


    storage.setItem(
        "loggedIn",
        "true"
    );

    storage.setItem(
        "userRole",
        role
    );

    storage.setItem(
        "username",
        username
    );


    localStorage.setItem(
        "loginTime",
        String(Date.now())
    );

}


/* =====================================================
   FIND ACCOUNT
===================================================== */

async function findLoginAccount(
    username,
    role
) {

    if (!checkSupabase()) {
        return null;
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


    return data || null;

}


/* =====================================================
   LOGIN
===================================================== */

async function handleLogin(event) {

    event.preventDefault();


    clearMessage(
        loginMessage
    );

    hideLoginStatusMessages();


    if (!checkSupabase()) {

        showMessage(
            loginMessage,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

        return;

    }


    const role =
        safeString(
            loginRole
                ? loginRole.value
                : ""
        ).toLowerCase();


    const username =
        safeString(
            usernameInput
                ? usernameInput.value
                : ""
        );


    const password =
        safeString(
            passwordInput
                ? passwordInput.value
                : ""
        );


    if (!role) {

        showMessage(
            loginMessage,
            "براہِ کرم پہلے اکاؤنٹ کی قسم منتخب کریں۔"
        );

        return;

    }


    if (!username) {

        showMessage(
            loginMessage,
            "صارف نام درج کریں۔"
        );

        return;

    }


    if (!password) {

        showMessage(
            loginMessage,
            "پاس ورڈ درج کریں۔"
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
                "صارف نام یا پاس ورڈ درست نہیں۔"
            );

            return;

        }


        const accountStatus =
            safeString(
                account.status
            ).toLowerCase();


        if (
            accountStatus === "pending"
        ) {

            if (pendingAccountMessage) {

                pendingAccountMessage
                    .classList
                    .remove(
                        "hidden"
                    );

            }

            showMessage(
                loginMessage,
                "آپ کا اکاؤنٹ ابھی منظوری کے انتظار میں ہے۔",
                "warning"
            );

            return;

        }


        if (
            accountStatus === "rejected"
        ) {

            if (rejectedAccountMessage) {

                rejectedAccountMessage
                    .classList
                    .remove(
                        "hidden"
                    );

            }

            showMessage(
                loginMessage,
                "آپ کی درخواست منظور نہیں ہوئی۔"
            );

            return;

        }


        if (
            accountStatus !== "active" &&
            accountStatus !== "approved"
        ) {

            showMessage(
                loginMessage,
                "یہ اکاؤنٹ فعال نہیں ہے۔"
            );

            return;

        }


        /*
         * موجودہ database structure میں password
         * field استعمال ہو رہی ہے۔
         *
         * Production system میں plain-text password
         * محفوظ نہیں کرنا چاہیے۔
         */

        const storedPassword =
            safeString(
                account.password
            );


        if (
            storedPassword !==
            password
        ) {

            showMessage(
                loginMessage,
                "صارف نام یا پاس ورڈ درست نہیں۔"
            );

            return;

        }


        saveLoginSession(
            username,
            role,
            Boolean(
                rememberMe &&
                rememberMe.checked
            )
        );


        showMessage(
            loginMessage,
            "لاگ اِن کامیاب ہوگیا۔",
            "success"
        );


        setTimeout(
            function () {

                redirectToDashboard();

            },
            300
        );

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            loginMessage,
            "لاگ اِن کے دوران خرابی پیش آئی۔"
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


/* =====================================================
   PASSWORD SHOW / HIDE
===================================================== */

function initializePasswordToggle() {

    if (
        !togglePassword ||
        !passwordInput
    ) {
        return;
    }


    togglePassword.addEventListener(
        "click",
        function () {

            const hidden =
                passwordInput.type ===
                "password";


            passwordInput.type =
                hidden
                    ? "text"
                    : "password";


            togglePassword.textContent =
                hidden
                    ? "🙈"
                    : "👁️";


            togglePassword.setAttribute(
                "aria-label",
                hidden
                    ? "پاس ورڈ چھپائیں"
                    : "پاس ورڈ دکھائیں"
            );

        }
    );

}


/* =====================================================
   LOGIN PAGE INITIALIZATION
===================================================== */

function initializeLoginPage() {

    if (
        currentFile !==
        "login.html"
    ) {
        return;
    }


    const role =
        setLoginRole();


    if (!role) {

        showMessage(
            loginMessage,
            "اکاؤنٹ کی قسم منتخب کرنے کے لیے واپس جائیں۔",
            "warning"
        );

    }


    initializePasswordToggle();


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


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
   END PART 2
===================================================== */

/* =====================================================
   SCRIPT.JS
   PART 3
   STUDENT MODULE
===================================================== */


/* =====================================================
   STUDENT ELEMENTS
===================================================== */

const studentForm =
    getElement("studentForm");

const studentFormContainer =
    getElement("studentFormContainer");

const studentFormMessage =
    getElement("studentFormMessage");

const studentListMessage =
    getElement("studentListMessage");

const studentsList =
    getElement("studentsList");

const studentCount =
    getElement("studentCount");

const studentSearch =
    getElement("studentSearch");

const showStudentFormButton =
    getElement("showStudentForm");

const cancelStudentFormButton =
    getElement("cancelStudentForm");

const saveStudentButton =
    getElement("saveStudentButton");

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

const previousMadrassaGroup =
    getElement("previousMadrassaGroup");

const previousMadrassa =
    getElement("previousMadrassa");

const transferDateGroup =
    getElement("transferDateGroup");

const transferDate =
    getElement("transferDate");

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


    if (previousMadrassaGroup) {

        previousMadrassaGroup
            .classList
            .toggle(
                "hidden",
                !isTransfer
            );

    }


    if (transferDateGroup) {

        transferDateGroup
            .classList
            .toggle(
                "hidden",
                !isTransfer
            );

    }


    if (previousMadrassa) {

        previousMadrassa.required =
            isTransfer;

        if (!isTransfer) {

            previousMadrassa.value =
                "";

        }

    }


    if (transferDate) {

        transferDate.required =
            isTransfer;

        if (!isTransfer) {

            transferDate.value =
                "";

        }

    }

}


/* =====================================================
   RESIDENCE / MAHRAM
===================================================== */

function updateResidenceFields() {

    if (!residenceType) {
        return;
    }


    const hostel =
        residenceType.value ===
        "ہاسٹل";


    if (mahramSection) {

        mahramSection
            .classList
            .toggle(
                "hidden",
                !hostel
            );

    }


    if (
        hostel &&
        mahramList &&
        mahramList.children.length === 0
    ) {

        addMahramCard();

    }


    if (
        !hostel &&
        mahramList
    ) {

        mahramList.innerHTML =
            "";

        mahramCounter = 0;


        if (mahramConfirmation) {

            mahramConfirmation.checked =
                false;

        }

    }

}


/* =====================================================
   ADD MAHRAM CARD
===================================================== */

function addMahramCard(data = {}) {

    if (!mahramList) {
        return;
    }


    const existing =
        mahramList.querySelectorAll(
            ".mahram-card"
        ).length;


    if (existing >= 5) {

        alert(
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return;

    }


    mahramCounter += 1;


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "mahram-card";


    card.innerHTML = `
        <div class="mahram-header">

            <strong>
                محرم ${mahramCounter}
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
                    placeholder="مثلاً والد، بھائی، چچا"
                    required
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
                    class="mahram-cnic"
                    inputmode="numeric"
                    maxlength="15"
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


    mahramList.appendChild(
        card
    );


    const removeButton =
        card.querySelector(
            ".remove-mahram"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                card.remove();

                renumberMahramCards();

            }
        );

    }


    const phoneInput =
        card.querySelector(
            ".mahram-phone"
        );


    if (phoneInput) {

        phoneInput.addEventListener(
            "input",
            function () {

                this.value =
                    normalizeDigits(
                        this.value
                    ).slice(
                        0,
                        11
                    );

            }
        );

    }


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

}


/* =====================================================
   RENUMBER MAHRAM CARDS
===================================================== */

function renumberMahramCards() {

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
                    `محرم ${index + 1}`;

            }

        }
    );


    mahramCounter =
        cards.length;

}


/* =====================================================
   GET MAHRAMS
===================================================== */

function getMahramData() {

    if (!mahramList) {
        return [];
    }


    const cards =
        mahramList.querySelectorAll(
            ".mahram-card"
        );


    return Array.from(cards).map(
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
                    normalizeDigits(
                        card.querySelector(
                            ".mahram-phone"
                        )?.value
                    ),

                cnic:
                    normalizeDigits(
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

function validateMahramData() {

    if (
        !residenceType ||
        residenceType.value !==
        "ہاسٹل"
    ) {

        return true;

    }


    const mahrams =
        getMahramData();


    if (mahrams.length < 1) {

        showMessage(
            studentFormMessage,
            "ہاسٹل طالبہ کے لیے کم از کم ایک شرعی محرم ضروری ہے۔"
        );

        return false;

    }


    if (mahrams.length > 5) {

        showMessage(
            studentFormMessage,
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return false;

    }


    for (
        const mahram of mahrams
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
                studentFormMessage,
                "تمام محرم کی مکمل اور درست معلومات درج کریں۔"
            );

            return false;

        }

    }


    if (
        !mahramConfirmation ||
        !mahramConfirmation.checked
    ) {

        showMessage(
            studentFormMessage,
            "شرعی محرم کی تصدیق ضروری ہے۔"
        );

        return false;

    }


    return true;

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


    if (editStudentId) {

        editStudentId.value =
            "";

    }


    if (formTitle) {

        formTitle.textContent =
            "نئی طالبہ کا اندراج";

    }


    if (studentStatus) {

        studentStatus.value =
            "active";

    }


    if (admissionDate) {

        admissionDate.value =
            getTodayDate();

    }


    if (mahramList) {

        mahramList.innerHTML =
            "";

    }


    mahramCounter = 0;


    updateTransferFields();

    updateResidenceFields();

    clearMessage(
        studentFormMessage
    );

}


/* =====================================================
   OPEN STUDENT FORM
===================================================== */

function openStudentForm() {

    if (!requireAdmin()) {
        return;
    }


    resetStudentForm();


    if (studentFormContainer) {

        studentFormContainer
            .classList
            .remove(
                "hidden"
            );

    }


    studentFormContainer
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =====================================================
   CLOSE STUDENT FORM
===================================================== */

function closeStudentForm() {

    resetStudentForm();


    if (studentFormContainer) {

        studentFormContainer
            .classList
            .add(
                "hidden"
            );

    }

}


/* =====================================================
   GET STUDENT PAYLOAD
===================================================== */

function getStudentPayload() {

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
            normalizeDigits(
                studentCNIC?.value
            ),

        phone:
            normalizeDigits(
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
                ? getMahramData()
                : [],

        status:
            safeString(
                studentStatus?.value
            ) || "active"

    };

}


/* =====================================================
   VALIDATE STUDENT
===================================================== */

function validateStudentForm() {

    if (
        !studentForm ||
        !studentForm.checkValidity()
    ) {

        studentForm?.reportValidity();

        return false;

    }


    if (
        !isValidCNIC(
            studentCNIC?.value
        )
    ) {

        showMessage(
            studentFormMessage,
            "شناختی کارڈ / ب فارم نمبر 13 ہندسوں کا ہونا چاہیے۔"
        );

        studentCNIC?.focus();

        return false;

    }


    if (
        !isValidPhone(
            phone?.value
        )
    ) {

        showMessage(
            studentFormMessage,
            "موبائل نمبر 03 سے شروع ہونے والا 11 ہندسوں کا نمبر ہونا چاہیے۔"
        );

        phone?.focus();

        return false;

    }


    if (
        admissionType?.value ===
        "منتقلی"
    ) {

        if (
            !safeString(
                previousMadrassa?.value
            ) ||
            !safeString(
                transferDate?.value
            )
        ) {

            showMessage(
                studentFormMessage,
                "منتقلی کے لیے سابقہ مدرسہ اور منتقلی کی تاریخ درج کریں۔"
            );

            return false;

        }

    }


    return validateMahramData();

}


/* =====================================================
   SAVE STUDENT
===================================================== */

async function saveStudent(event) {

    event.preventDefault();


    if (!requireAdmin()) {
        return;
    }


    clearMessage(
        studentFormMessage
    );


    if (!validateStudentForm()) {
        return;
    }


    if (!checkSupabase()) {

        showMessage(
            studentFormMessage,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

        return;

    }


    const payload =
        getStudentPayload();


    if (saveStudentButton) {

        saveStudentButton.disabled =
            true;

        saveStudentButton.textContent =
            "⏳ محفوظ ہو رہا ہے...";

    }


    try {

        let result;


        if (editingStudentId) {

            result =
                await supabaseClient

                    .from(
                        STUDENTS_TABLE
                    )

                    .update(
                        payload
                    )

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
                        payload
                    ]);

        }


        if (result.error) {

            throw result.error;

        }


        showMessage(
            studentFormMessage,
            editingStudentId
                ? "طالبہ کا ریکارڈ کامیابی سے تبدیل ہوگیا۔"
                : "طالبہ کا ریکارڈ کامیابی سے محفوظ ہوگیا۔",
            "success"
        );


        await loadStudents();


        setTimeout(
            function () {

                closeStudentForm();

            },
            700
        );

    } catch (error) {

        console.error(
            "Student save error:",
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
   END PART 3
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 4
   STUDENT LIST + SEARCH + DETAILS + EDIT + DELETE
===================================================== */


/* =====================================================
   STUDENT DETAILS ELEMENTS
===================================================== */

const studentDetailsOverlay =
    getElement("studentDetailsOverlay");

const studentDetailsContent =
    getElement("studentDetailsContent");

const closeStudentDetailsButton =
    getElement("closeStudentDetails");

const backToDashboard =
    getElement("backToDashboard");


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


    if (studentListMessage) {

        clearMessage(
            studentListMessage
        );

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
            Array.isArray(data)
                ? data
                : [];


        renderStudents(
            studentsCache
        );


    } catch (error) {

        console.error(
            "Student load error:",
            error
        );


        studentsCache = [];


        if (studentCount) {

            studentCount.textContent =
                "0";

        }


        if (studentsList) {

            studentsList.innerHTML = `
                <div class="empty-students">
                    <div class="empty-icon">
                        ⚠️
                    </div>
                    طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔
                </div>
            `;

        }


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

    const value =
        safeString(status)
            .toLowerCase();


    if (
        value === "inactive"
    ) {

        return "غیر فعال";

    }


    return "فعال";

}


/* =====================================================
   RENDER STUDENTS
===================================================== */

function renderStudents(list) {

    if (!studentsList) {
        return;
    }


    const students =
        Array.isArray(list)
            ? list
            : [];


    if (studentCount) {

        const activeCount =
            studentsCache.filter(
                student => {

                    const status =
                        safeString(
                            student.status
                        ).toLowerCase();

                    return (
                        !status ||
                        status === "active" ||
                        status === "approved"
                    );

                }
            ).length;


        studentCount.textContent =
            String(activeCount);

    }


    if (students.length === 0) {

        studentsList.innerHTML = `
            <div class="empty-students">

                <div class="empty-icon">
                    👧
                </div>

                کوئی طالبہ موجود نہیں۔

            </div>
        `;

        return;

    }


    studentsList.innerHTML =
        students
            .map(
                student => {

                    const id =
                        escapeHTML(
                            student.id
                        );

                    const name =
                        escapeHTML(
                            student.name ||
                            "نام موجود نہیں"
                        );

                    const admission =
                        escapeHTML(
                            student.admission_no ||
                            "-"
                        );

                    const className =
                        escapeHTML(
                            student.student_class ||
                            "-"
                        );

                    const phoneNumber =
                        escapeHTML(
                            student.phone ||
                            "-"
                        );

                    const residence =
                        escapeHTML(
                            student.residence_type ||
                            "-"
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
                                        ${name}
                                    </h3>

                                    <span>
                                        داخلہ نمبر:
                                        ${admission}
                                    </span>

                                </div>

                            </div>


                            <div class="student-badges">

                                <span>
                                    📚 ${className}
                                </span>

                                <span>
                                    🏠 ${residence}
                                </span>

                                <span>
                                    ${status}
                                </span>

                            </div>


                            <div class="student-info">

                                <p>
                                    📱 موبائل:
                                    ${phoneNumber}
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


    bindStudentCardButtons();

}


/* =====================================================
   BIND STUDENT BUTTONS
===================================================== */

function bindStudentCardButtons() {

    document
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


    document
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


    document
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

function searchStudents() {

    if (!studentSearch) {
        return;
    }


    const query =
        safeString(
            studentSearch.value
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

                const values = [

                    student.name,

                    student.father_name,

                    student.guardian_name,

                    student.admission_no,

                    student.phone,

                    student.cnic,

                    student.student_class

                ];


                return values.some(
                    value =>
                        safeString(value)
                            .toLowerCase()
                            .includes(query)
                );

            }
        );


    renderStudents(
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


    editingStudentId =
        student.id;


    if (editStudentId) {

        editStudentId.value =
            student.id;

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


    updateTransferFields();


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
            normalizeDigits(
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
            safeString(
                student.status
            ) || "active";

    }


    updateResidenceFields();


    if (mahramList) {

        mahramList.innerHTML =
            "";

    }


    mahramCounter = 0;


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

            mahrams = [];

        }

    }


    if (
        Array.isArray(mahrams) &&
        mahrams.length > 0
    ) {

        mahrams
            .slice(0, 5)
            .forEach(
                mahram => {

                    addMahramCard(
                        mahram
                    );

                }
            );


        if (mahramConfirmation) {

            mahramConfirmation.checked =
                true;

        }

    }


    if (formTitle) {

        formTitle.textContent =
            "طالبہ کا ریکارڈ تبدیل کریں";

    }


    if (studentFormContainer) {

        studentFormContainer
            .classList
            .remove(
                "hidden"
            );


        studentFormContainer
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }

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
            `کیا آپ واقعی "${safeString(
                student.name
            )}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
        );


    if (!confirmed) {
        return;
    }


    if (!checkSupabase()) {
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


        showMessage(
            studentListMessage,
            "طالبہ کا ریکارڈ حذف ہوگیا۔",
            "success"
        );


        await loadStudents();


    } catch (error) {

        console.error(
            "Student delete error:",
            error
        );


        showMessage(
            studentListMessage,
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
        !studentDetailsContent
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

            mahrams = [];

        }

    }


    if (!Array.isArray(mahrams)) {

        mahrams = [];

    }


    const mahramHTML =
        mahrams.length
            ? mahrams
                .map(
                    (mahram, index) => `

                        <div class="mahram-card">

                            <strong>
                                محرم ${index + 1}
                            </strong>

                            <p>
                                <strong>نام:</strong>
                                ${escapeHTML(mahram.name || "-")}
                            </p>

                            <p>
                                <strong>رشتہ:</strong>
                                ${escapeHTML(mahram.relation || "-")}
                            </p>

                            <p>
                                <strong>موبائل:</strong>
                                ${escapeHTML(mahram.phone || "-")}
                            </p>

                            <p>
                                <strong>شناختی کارڈ:</strong>
                                ${escapeHTML(
                                    formatCNIC(
                                        mahram.cnic || ""
                                    ) || "-"
                                )}
                            </p>

                        </div>

                    `
                )
                .join("")
            : "<p>کوئی محرم درج نہیں ہے۔</p>";


    studentDetailsContent.innerHTML = `

        <h3>
            👧 بنیادی معلومات
        </h3>

        <p>
            <strong>طالبہ کا نام:</strong>
            ${escapeHTML(student.name || "-")}
        </p>

        <p>
            <strong>والد کا نام:</strong>
            ${escapeHTML(student.father_name || "-")}
        </p>

        <p>
            <strong>سرپرست:</strong>
            ${escapeHTML(student.guardian_name || "-")}
        </p>

        <p>
            <strong>شناختی کارڈ / ب فارم:</strong>
            ${escapeHTML(
                formatCNIC(
                    student.cnic || ""
                ) || "-"
            )}
        </p>

        <p>
            <strong>تاریخ پیدائش:</strong>
            ${escapeHTML(student.date_of_birth || "-")}
        </p>

        <p>
            <strong>موبائل نمبر:</strong>
            ${escapeHTML(student.phone || "-")}
        </p>

        <p>
            <strong>مکمل پتہ:</strong>
            ${escapeHTML(student.address || "-")}
        </p>


        <h3>
            📋 داخلہ کی معلومات
        </h3>

        <p>
            <strong>داخلہ نمبر:</strong>
            ${escapeHTML(student.admission_no || "-")}
        </p>

        <p>
            <strong>داخلہ کی قسم:</strong>
            ${escapeHTML(student.admission_type || "-")}
        </p>

        <p>
            <strong>کلاس:</strong>
            ${escapeHTML(student.student_class || "-")}
        </p>

        <p>
            <strong>داخلہ کی تاریخ:</strong>
            ${escapeHTML(student.admission_date || "-")}
        </p>

        ${
            student.admission_type ===
            "منتقلی"
                ? `
                    <p>
                        <strong>سابقہ مدرسہ:</strong>
                        ${escapeHTML(student.previous_madrassa || "-")}
                    </p>

                    <p>
                        <strong>منتقلی کی تاریخ:</strong>
                        ${escapeHTML(student.transfer_date || "-")}
                    </p>
                `
                : ""
        }


        <h3>
            🏠 رہائش
        </h3>

        <p>
            <strong>رہائش کی قسم:</strong>
            ${escapeHTML(student.residence_type || "-")}
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


    openModal(
        studentDetailsOverlay
    );

}


/* =====================================================
   CLOSE STUDENT DETAILS
===================================================== */

function closeStudentDetails() {

    closeModal(
        studentDetailsOverlay
    );

}


/* =====================================================
   INITIALIZE STUDENT PAGE
===================================================== */

async function initializeStudentPage() {

    if (
        currentFile !==
        "students.html"
    ) {
        return;
    }


    if (!isAuthenticated()) {

        redirectToLogin();

        return;

    }


    applyRoleVisibility();


    setupCNICInput(
        "studentCNIC"
    );

    setupPhoneInput(
        "phone"
    );


    if (admissionDate) {

        admissionDate.max =
            getTodayDate();

    }


    if (dateOfBirth) {

        dateOfBirth.max =
            getTodayDate();

    }


    if (admissionType) {

        admissionType.addEventListener(
            "change",
            updateTransferFields
        );

    }


    if (residenceType) {

        residenceType.addEventListener(
            "change",
            updateResidenceFields
        );

    }


    if (addMahramButton) {

        addMahramButton.addEventListener(
            "click",
            function () {

                addMahramCard();

            }
        );

    }


    if (showStudentFormButton) {

        showStudentFormButton
            .addEventListener(
                "click",
                openStudentForm
            );

    }


    if (cancelStudentFormButton) {

        cancelStudentFormButton
            .addEventListener(
                "click",
                closeStudentForm
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

        closeStudentDetailsButton
            .addEventListener(
                "click",
                closeStudentDetails
            );

    }


    if (studentDetailsOverlay) {

        studentDetailsOverlay
            .addEventListener(
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


    if (backToDashboard) {

        backToDashboard.addEventListener(
            "click",
            redirectToDashboard
        );

    }


    resetStudentForm();

    await loadStudents();

}


/* =====================================================
   END PART 4
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 5
   TEACHER MODULE
===================================================== */


/* =====================================================
   TEACHER ELEMENTS
===================================================== */

const teacherForm =
    getElement("teacherForm");

const teacherFormContainer =
    getElement("teacherFormContainer");

const teacherFormMessage =
    getElement("teacherFormMessage");

const teacherListMessage =
    getElement("teacherListMessage");

const teacherList =
    getElement("teacherList");

const teacherSearch =
    getElement("teacherSearch");

const teacherTotal =
    getElement("teacherTotal");

const activeTeacherTotal =
    getElement("activeTeacherTotal");

const pendingTeacherTotal =
    getElement("pendingTeacherTotal");

const teacherListCount =
    getElement("teacherListCount");

const showTeacherFormButton =
    getElement("showTeacherForm");

const cancelTeacherButton =
    getElement("cancelTeacherButton");

const saveTeacherButton =
    getElement("saveTeacherButton");

const teacherFormTitle =
    getElement("teacherFormTitle");

const editTeacherId =
    getElement("editTeacherId");


/* =====================================================
   TEACHER FORM FIELDS
===================================================== */

const teacherCode =
    getElement("teacherCode");

const teacherName =
    getElement("teacherName");

const teacherFatherName =
    getElement("teacherFatherName");

const teacherPhone =
    getElement("teacherPhone");

const teacherCNIC =
    getElement("teacherCNIC");

const teacherDateOfBirth =
    getElement("teacherDateOfBirth");

const teacherQualification =
    getElement("teacherQualification");

const teacherJoiningDate =
    getElement("teacherJoiningDate");

const teacherStatus =
    getElement("teacherStatus");

const teacherAddress =
    getElement("teacherAddress");


/* =====================================================
   TEACHER DETAILS
===================================================== */

const teacherDetailsOverlay =
    getElement("teacherDetailsOverlay");

const teacherDetailsContent =
    getElement("teacherDetailsContent");

const closeTeacherDetailsButton =
    getElement("closeTeacherDetails");


let teachersCache = [];

let editingTeacherId = null;


/* =====================================================
   TEACHER STATUS TEXT
===================================================== */

function getTeacherStatusText(status) {

    const value =
        safeString(status)
            .toLowerCase();


    if (value === "inactive") {
        return "غیر فعال";
    }


    if (value === "pending") {
        return "زیرِ منظوری";
    }


    return "فعال";

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

        teacherStatus.value =
            "active";

    }


    if (teacherJoiningDate) {

        teacherJoiningDate.value =
            getTodayDate();

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


    if (teacherFormContainer) {

        teacherFormContainer
            .classList
            .remove("hidden");


        teacherFormContainer
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }

}


/* =====================================================
   CLOSE TEACHER FORM
===================================================== */

function closeTeacherForm() {

    resetTeacherForm();


    if (teacherFormContainer) {

        teacherFormContainer
            .classList
            .add("hidden");

    }

}


/* =====================================================
   TEACHER PAYLOAD
===================================================== */

function getTeacherPayload() {

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
            normalizeDigits(
                teacherPhone?.value
            ),

        cnic:
            normalizeDigits(
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
            safeString(
                teacherStatus?.value
            ) || "active",

        address:
            safeString(
                teacherAddress?.value
            )

    };

}


/* =====================================================
   VALIDATE TEACHER FORM
===================================================== */

function validateTeacherForm() {

    if (
        !teacherForm ||
        !teacherForm.checkValidity()
    ) {

        teacherForm?.reportValidity();

        return false;

    }


    if (
        !isValidCNIC(
            teacherCNIC?.value
        )
    ) {

        showMessage(
            teacherFormMessage,
            "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔"
        );

        teacherCNIC?.focus();

        return false;

    }


    if (
        !isValidPhone(
            teacherPhone?.value
        )
    ) {

        showMessage(
            teacherFormMessage,
            "موبائل نمبر 03 سے شروع ہونے والا 11 ہندسوں کا نمبر ہونا چاہیے۔"
        );

        teacherPhone?.focus();

        return false;

    }


    return true;

}


/* =====================================================
   CHECK DUPLICATE TEACHER
===================================================== */

async function checkDuplicateTeacher(
    payload,
    ignoreId = null
) {

    if (!checkSupabase()) {
        return false;
    }


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TEACHERS_TABLE
            )

            .select(
                "id, teacher_code, cnic, phone"
            )

            .or(
                `teacher_code.eq.${payload.teacher_code},cnic.eq.${payload.cnic},phone.eq.${payload.phone}`
            );


    if (error) {
        throw error;
    }


    const duplicates =
        Array.isArray(data)
            ? data.filter(
                item =>
                    String(item.id) !==
                    String(ignoreId)
            )
            : [];


    if (duplicates.length === 0) {

        return false;

    }


    const duplicate =
        duplicates[0];


    if (
        safeString(
            duplicate.teacher_code
        ) ===
        payload.teacher_code
    ) {

        showMessage(
            teacherFormMessage,
            "یہ استاد کوڈ پہلے سے موجود ہے۔"
        );

        return true;

    }


    if (
        normalizeDigits(
            duplicate.cnic
        ) ===
        payload.cnic
    ) {

        showMessage(
            teacherFormMessage,
            "یہ شناختی کارڈ نمبر پہلے سے موجود ہے۔"
        );

        return true;

    }


    if (
        normalizeDigits(
            duplicate.phone
        ) ===
        payload.phone
    ) {

        showMessage(
            teacherFormMessage,
            "یہ موبائل نمبر پہلے سے موجود ہے۔"
        );

        return true;

    }


    return false;

}


/* =====================================================
   SAVE TEACHER
===================================================== */

async function saveTeacher(event) {

    event.preventDefault();


    if (!requireAdmin()) {
        return;
    }


    clearMessage(
        teacherFormMessage
    );


    if (!validateTeacherForm()) {
        return;
    }


    if (!checkSupabase()) {

        showMessage(
            teacherFormMessage,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

        return;

    }


    const payload =
        getTeacherPayload();


    if (saveTeacherButton) {

        saveTeacherButton.disabled =
            true;

        saveTeacherButton.textContent =
            "⏳ محفوظ ہو رہا ہے...";

    }


    try {

        const duplicate =
            await checkDuplicateTeacher(
                payload,
                editingTeacherId
            );


        if (duplicate) {
            return;
        }


        let result;


        if (editingTeacherId) {

            result =
                await supabaseClient

                    .from(
                        TEACHERS_TABLE
                    )

                    .update(
                        payload
                    )

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
                        payload
                    ]);

        }


        if (result.error) {

            throw result.error;

        }


        showMessage(
            teacherFormMessage,
            editingTeacherId
                ? "استاد کا ریکارڈ کامیابی سے تبدیل ہوگیا۔"
                : "استاد کا ریکارڈ کامیابی سے محفوظ ہوگیا۔",
            "success"
        );


        await loadTeachers();


        setTimeout(
            function () {

                closeTeacherForm();

            },
            700
        );


    } catch (error) {

        console.error(
            "Teacher save error:",
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
            "Teacher load error:",
            error
        );


        teachersCache = [];


        if (teacherList) {

            teacherList.innerHTML = `
                <div class="teacher-empty">
                    اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔
                </div>
            `;

        }


        if (teacherTotal) {

            teacherTotal.textContent =
                "0";

        }


        if (activeTeacherTotal) {

            activeTeacherTotal.textContent =
                "0";

        }


        if (teacherListCount) {

            teacherListCount.textContent =
                "0";

        }


        showMessage(
            teacherListMessage,
            "اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔"
        );

    }

}


/* =====================================================
   TEACHER STATISTICS
===================================================== */

function updateTeacherStatistics() {

    const total =
        teachersCache.length;


    const active =
        teachersCache.filter(
            teacher => {

                const status =
                    safeString(
                        teacher.status
                    ).toLowerCase();


                return (
                    !status ||
                    status === "active" ||
                    status === "approved"
                );

            }
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


    if (teachers.length === 0) {

        teacherList.innerHTML = `
            <div class="teacher-empty">
                کوئی استاد موجود نہیں۔
            </div>
        `;

        return;

    }


    teacherList.innerHTML =
        teachers
            .map(
                teacher => {

                    const id =
                        escapeHTML(
                            teacher.id
                        );

                    const name =
                        escapeHTML(
                            teacher.name ||
                            "نام موجود نہیں"
                        );

                    const code =
                        escapeHTML(
                            teacher.teacher_code ||
                            "-"
                        );

                    const phoneNumber =
                        escapeHTML(
                            teacher.phone ||
                            "-"
                        );

                    const qualification =
                        escapeHTML(
                            teacher.qualification ||
                            "-"
                        );

                    const status =
                        escapeHTML(
                            getTeacherStatusText(
                                teacher.status
                            )
                        );


                    return `
                        <div
                            class="teacher-card"
                            data-id="${id}"
                        >

                            <h3>
                                👩‍🏫 ${name}
                            </h3>

                            <div class="teacher-card-info">

                                <p>
                                    <strong>
                                        استاد کوڈ:
                                    </strong>
                                    ${code}
                                </p>

                                <p>
                                    <strong>
                                        موبائل:
                                    </strong>
                                    ${phoneNumber}
                                </p>

                                <p>
                                    <strong>
                                        قابلیت:
                                    </strong>
                                    ${qualification}
                                </p>

                                <p>
                                    <strong>
                                        حیثیت:
                                    </strong>
                                    ${status}
                                </p>

                            </div>


                            <div class="teacher-card-buttons">

                                <button
                                    type="button"
                                    class="view-teacher"
                                    data-id="${id}"
                                >
                                    👁️ تفصیلات
                                </button>

                                ${
                                    isAdmin()
                                        ? `
                                            <button
                                                type="button"
                                                class="edit-teacher"
                                                data-id="${id}"
                                            >
                                                ✏️ ترمیم
                                            </button>

                                            <button
                                                type="button"
                                                class="delete-teacher"
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


    bindTeacherCardButtons();

}


/* =====================================================
   BIND TEACHER BUTTONS
===================================================== */

function bindTeacherCardButtons() {

    document
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


    document
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


    document
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
   SEARCH TEACHERS
===================================================== */

function searchTeachers() {

    if (!teacherSearch) {
        return;
    }


    const query =
        safeString(
            teacherSearch.value
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

                const values = [

                    teacher.name,

                    teacher.teacher_code,

                    teacher.father_name,

                    teacher.phone,

                    teacher.cnic,

                    teacher.qualification,

                    teacher.address

                ];


                return values.some(
                    value =>
                        safeString(value)
                            .toLowerCase()
                            .includes(query)
                );

            }
        );


    renderTeachers(
        filtered
    );

}


/* =====================================================
   END PART 5
===================================================== */


/* =====================================================
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
            safeString(
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


    if (teacherFormContainer) {

        teacherFormContainer
            .classList
            .remove("hidden");


        teacherFormContainer
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }

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


    const name =
        escapeHTML(
            teacher.name || "-"
        );

    const fatherName =
        escapeHTML(
            teacher.father_name || "-"
        );

    const code =
        escapeHTML(
            teacher.teacher_code || "-"
        );

    const phoneNumber =
        escapeHTML(
            teacher.phone || "-"
        );

    const cnic =
        escapeHTML(
            formatCNIC(
                teacher.cnic
            ) || "-"
        );

    const dateOfBirth =
        escapeHTML(
            teacher.date_of_birth || "-"
        );

    const qualification =
        escapeHTML(
            teacher.qualification || "-"
        );

    const joiningDate =
        escapeHTML(
            teacher.joining_date || "-"
        );

    const address =
        escapeHTML(
            teacher.address || "-"
        );

    const status =
        escapeHTML(
            getTeacherStatusText(
                teacher.status
            )
        );


    teacherDetailsContent.innerHTML = `

        <h3>
            👤 بنیادی معلومات
        </h3>

        <p>
            <strong>
                استاد کا نام:
            </strong>
            ${name}
        </p>

        <p>
            <strong>
                والد کا نام:
            </strong>
            ${fatherName}
        </p>

        <p>
            <strong>
                استاد کوڈ:
            </strong>
            ${code}
        </p>

        <p>
            <strong>
                شناختی کارڈ نمبر:
            </strong>
            ${cnic}
        </p>

        <p>
            <strong>
                موبائل نمبر:
            </strong>
            ${phoneNumber}
        </p>

        <p>
            <strong>
                تاریخ پیدائش:
            </strong>
            ${dateOfBirth}
        </p>


        <h3>
            📚 تعلیمی معلومات
        </h3>

        <p>
            <strong>
                تعلیمی قابلیت:
            </strong>
            ${qualification}
        </p>


        <h3>
            🏫 ملازمت کی معلومات
        </h3>

        <p>
            <strong>
                تقرری کی تاریخ:
            </strong>
            ${joiningDate}
        </p>

        <p>
            <strong>
                حیثیت:
            </strong>
            ${status}
        </p>


        <h3>
            🏠 رابطہ
        </h3>

        <p>
            <strong>
                مکمل پتہ:
            </strong>
            ${address}
        </p>

    `;


    teacherDetailsOverlay
        .classList
        .remove("hidden");


    document.body
        .classList
        .add("modal-open");

}


/* =====================================================
   CLOSE TEACHER DETAILS
===================================================== */

function closeTeacherDetails() {

    if (teacherDetailsOverlay) {

        teacherDetailsOverlay
            .classList
            .add("hidden");

    }


    document.body
        .classList
        .remove("modal-open");

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
            `کیا آپ واقعی "${safeString(
                teacher.name
            )}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
        );


    if (!confirmed) {
        return;
    }


    if (!checkSupabase()) {

        showMessage(
            teacherListMessage,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

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


        showMessage(
            teacherListMessage,
            "استاد کا ریکارڈ کامیابی سے حذف ہوگیا۔",
            "success"
        );


        await loadTeachers();


    } catch (error) {

        console.error(
            "Teacher delete error:",
            error
        );


        showMessage(
            teacherListMessage,
            "استاد کا ریکارڈ حذف نہیں ہو سکا۔"
        );

    }

}


/* =====================================================
   TEACHER INPUT FORMATTING
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


if (teacherPhone) {

    teacherPhone.addEventListener(
        "input",
        function () {

            this.value =
                normalizeDigits(
                    this.value
                ).slice(
                    0,
                    11
                );

        }
    );

}


/* =====================================================
   TEACHER EVENTS
===================================================== */

if (showTeacherFormButton) {

    showTeacherFormButton.addEventListener(
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


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            teacherDetailsOverlay &&
            !teacherDetailsOverlay
                .classList
                .contains("hidden")
        ) {

            closeTeacherDetails();

        }

    }
);


/* =====================================================
   INITIALIZE TEACHERS PAGE
===================================================== */

async function initializeTeachersPage() {

    if (
        getCurrentPageName() !==
        "teachers.html"
    ) {
        return;
    }


    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }


    applyRolePermissions();


    if (teacherJoiningDate) {

        teacherJoiningDate.value =
            teacherJoiningDate.value ||
            getTodayDate();

    }


    await loadTeachers();

}


/* =====================================================
   END PART 6
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 7
   STUDENT APPLICATION SYSTEM
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

const addApplyMahramButton =
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

const submitStudentApplication =
    document.getElementById(
        "submitStudentApplication"
    );

const cancelStudentApplication =
    document.getElementById(
        "cancelStudentApplication"
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
   APPLICATION NUMBER
===================================================== */

function generateStudentApplicationNumber() {

    const time =
        Date.now()
            .toString()
            .slice(-8);

    const random =
        Math.floor(
            100 + Math.random() * 900
        );

    return `SA-${time}-${random}`;

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


    if (applyPreviousMadrassaGroup) {

        applyPreviousMadrassaGroup
            .classList
            .toggle(
                "hidden",
                !isTransfer
            );

    }


    if (applyTransferDateGroup) {

        applyTransferDateGroup
            .classList
            .toggle(
                "hidden",
                !isTransfer
            );

    }


    if (applyPreviousMadrassa) {

        applyPreviousMadrassa.required =
            isTransfer;

        if (!isTransfer) {

            applyPreviousMadrassa.value =
                "";

        }

    }


    if (applyTransferDate) {

        applyTransferDate.required =
            isTransfer;

        if (!isTransfer) {

            applyTransferDate.value =
                "";

        }

    }

}


/* =====================================================
   APPLICATION RESIDENCE
===================================================== */

function updateStudentApplicationResidence() {

    if (!applyResidenceType) {
        return;
    }


    const hostel =
        applyResidenceType.value ===
        "ہاسٹل";


    if (applyMahramSection) {

        applyMahramSection
            .classList
            .toggle(
                "hidden",
                !hostel
            );

    }


    if (
        hostel &&
        applyMahramCount === 0
    ) {

        addStudentApplicationMahram();

    }

}


/* =====================================================
   ADD APPLICATION MAHRAM
===================================================== */

function addStudentApplicationMahram(
    data = {}
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
                    required
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
                    class="apply-mahram-relation"
                    required
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
                    inputmode="numeric"
                    maxlength="11"
                    class="apply-mahram-phone"
                    required
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
                    inputmode="numeric"
                    maxlength="15"
                    class="apply-mahram-cnic"
                    required
                    value="${escapeHTML(
                        formatCNIC(
                            data.cnic || ""
                        )
                    )}"
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

    const removeButton =
        card.querySelector(
            ".remove-apply-mahram"
        );


    if (phoneInput) {

        phoneInput.addEventListener(
            "input",
            function () {

                this.value =
                    normalizeDigits(
                        this.value
                    ).slice(
                        0,
                        11
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

                card.remove();

                refreshStudentApplicationMahrams();

            }
        );

    }


    refreshStudentApplicationMahrams();

}


/* =====================================================
   REFRESH MAHRAM NUMBERS
===================================================== */

function refreshStudentApplicationMahrams() {

    if (!applyMahramList) {

        applyMahramCount = 0;

        return;

    }


    const cards =
        applyMahramList
            .querySelectorAll(
                ".apply-mahram-card"
            );


    applyMahramCount =
        cards.length;


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

}


/* =====================================================
   GET APPLICATION MAHRAMS
===================================================== */

function getStudentApplicationMahrams() {

    if (!applyMahramList) {
        return [];
    }


    return Array.from(
        applyMahramList
            .querySelectorAll(
                ".apply-mahram-card"
            )
    ).map(card => {

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
                normalizeDigits(
                    card.querySelector(
                        ".apply-mahram-phone"
                    )?.value
                ),

            cnic:
                normalizeDigits(
                    card.querySelector(
                        ".apply-mahram-cnic"
                    )?.value
                )

        };

    });

}


/* =====================================================
   VALIDATE APPLICATION
===================================================== */

function validateStudentApplication() {

    const cnic =
        normalizeDigits(
            applyCNIC?.value
        );


    const phoneNumber =
        normalizeDigits(
            applyPhone?.value
        );


    if (cnic.length !== 13) {

        showMessage(
            studentApplyMessage,
            "شناختی کارڈ / ب فارم نمبر 13 ہندسوں کا ہونا چاہیے۔"
        );

        return false;

    }


    if (phoneNumber.length !== 11) {

        showMessage(
            studentApplyMessage,
            "موبائل نمبر 11 ہندسوں کا ہونا چاہیے۔"
        );

        return false;

    }


    if (
        safeString(
            applyPassword?.value
        ).length < 8
    ) {

        showMessage(
            studentApplyMessage,
            "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
        );

        return false;

    }


    if (
        applyPassword?.value !==
        applyConfirmPassword?.value
    ) {

        showMessage(
            studentApplyMessage,
            "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
        );

        return false;

    }


    if (
        applyResidenceType?.value ===
        "ہاسٹل"
    ) {

        const mahrams =
            getStudentApplicationMahrams();


        if (mahrams.length < 1) {

            showMessage(
                studentApplyMessage,
                "ہاسٹل کی درخواست کے لیے کم از کم ایک محرم ضروری ہے۔"
            );

            return false;

        }


        for (
            const mahram of mahrams
        ) {

            if (
                !mahram.name ||
                !mahram.relation ||
                mahram.phone.length !== 11 ||
                mahram.cnic.length !== 13
            ) {

                showMessage(
                    studentApplyMessage,
                    "تمام محرم کی معلومات مکمل اور درست درج کریں۔"
                );

                return false;

            }

        }

    }


    return true;

}


/* =====================================================
   SUBMIT STUDENT APPLICATION
===================================================== */

async function saveStudentApplication(
    event
) {

    event.preventDefault();


    clearMessage(
        studentApplyMessage
    );


    if (
        !studentApplyForm ||
        !studentApplyForm
            .checkValidity()
    ) {

        studentApplyForm
            ?.reportValidity();

        return;

    }


    if (
        !validateStudentApplication()
    ) {
        return;
    }


    if (!checkSupabase()) {

        showMessage(
            studentApplyMessage,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

        return;

    }


    const applicationNumber =
        generateStudentApplicationNumber();


    const record = {

        application_no:
            applicationNumber,

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
            normalizeDigits(
                applyCNIC?.value
            ),

        date_of_birth:
            safeString(
                applyDateOfBirth?.value
            ),

        phone:
            normalizeDigits(
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
            applyResidenceType?.value ===
            "ہاسٹل"
                ? getStudentApplicationMahrams()
                : [],

        username:
            safeString(
                applyUsername?.value
            ),

        password:
            safeString(
                applyPassword?.value
            ),

        status:
            "pending",

        created_at:
            new Date().toISOString()

    };


    try {

        if (submitStudentApplication) {

            submitStudentApplication.disabled =
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
                    record
                ]);


        if (error) {
            throw error;
        }


        studentApplyForm.reset();


        if (applyMahramList) {

            applyMahramList.innerHTML =
                "";

        }


        applyMahramCount = 0;


        updateStudentApplicationAdmissionType();

        updateStudentApplicationResidence();


        showMessage(
            studentApplyMessage,
            `درخواست کامیابی سے جمع ہوگئی۔ آپ کا درخواست نمبر: ${applicationNumber}`,
            "success"
        );


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

        }

    }

}


/* =====================================================
   CHECK STUDENT APPLICATION STATUS
===================================================== */

async function checkStudentApplication() {

    const applicationNumber =
        safeString(
            studentApplicationNumber?.value
        );


    clearMessage(
        studentApplicationStatusResult
    );


    if (!applicationNumber) {

        showMessage(
            studentApplicationStatusResult,
            "درخواست نمبر درج کریں۔"
        );

        return;

    }


    if (!checkSupabase()) {

        showMessage(
            studentApplicationStatusResult,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
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
                    "application_no,name,status,admin_note"
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

            showMessage(
                studentApplicationStatusResult,
                "اس درخواست نمبر کا کوئی ریکارڈ نہیں ملا۔"
            );

            return;

        }


        let statusText =
            "زیرِ منظوری";


        if (
            data.status ===
            "approved"
        ) {

            statusText =
                "منظور شدہ";

        } else if (
            data.status ===
            "rejected"
        ) {

            statusText =
                "نامنظور";

        }


        studentApplicationStatusResult.innerHTML = `

            <strong>
                ${escapeHTML(
                    data.name || ""
                )}
            </strong>

            <br>

            درخواست کی حالت:
            <strong>
                ${statusText}
            </strong>

            ${
                data.admin_note
                    ? `<br>ایڈمن نوٹ: ${escapeHTML(
                        data.admin_note
                    )}`
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


/* =====================================================
   APPLICATION INPUT EVENTS
===================================================== */

if (applyAdmissionType) {

    applyAdmissionType.addEventListener(
        "change",
        updateStudentApplicationAdmissionType
    );

}


if (applyResidenceType) {

    applyResidenceType.addEventListener(
        "change",
        updateStudentApplicationResidence
    );

}


if (addApplyMahramButton) {

    addApplyMahramButton.addEventListener(
        "click",
        function () {

            addStudentApplicationMahram();

        }
    );

}


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


if (applyPhone) {

    applyPhone.addEventListener(
        "input",
        function () {

            this.value =
                normalizeDigits(
                    this.value
                ).slice(
                    0,
                    11
                );

        }
    );

}


if (studentApplyForm) {

    studentApplyForm.addEventListener(
        "submit",
        saveStudentApplication
    );

}


if (cancelStudentApplication) {

    cancelStudentApplication.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


if (checkStudentApplicationStatus) {

    checkStudentApplicationStatus
        .addEventListener(
            "click",
            checkStudentApplication
        );

}


/* =====================================================
   INITIALIZE STUDENT APPLICATION PAGE
===================================================== */

function initializeStudentApplicationPage() {

    if (
        getCurrentPageName() !==
        "student-apply.html"
    ) {
        return;
    }


    updateStudentApplicationAdmissionType();

    updateStudentApplicationResidence();

}


/* =====================================================
   END PART 7
===================================================== */

/* =====================================================
   SCRIPT.JS
   PART 8
   TEACHER APPLICATION SYSTEM
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

const submitTeacherApplication =
    document.getElementById(
        "submitTeacherApplication"
    );

const cancelTeacherApplication =
    document.getElementById(
        "cancelTeacherApplication"
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
   GENERATE APPLICATION NUMBER
===================================================== */

function generateTeacherApplicationNumber() {

    const time =
        Date.now()
            .toString()
            .slice(-8);

    const random =
        Math.floor(
            100 + Math.random() * 900
        );

    return `TA-${time}-${random}`;

}


/* =====================================================
   VALIDATE TEACHER APPLICATION
===================================================== */

function validateTeacherApplication() {

    const cnic =
        normalizeDigits(
            applyTeacherCNIC?.value
        );

    const phone =
        normalizeDigits(
            applyTeacherPhone?.value
        );

    const username =
        safeString(
            applyTeacherUsername?.value
        );

    const password =
        safeString(
            applyTeacherPassword?.value
        );

    const confirmPassword =
        safeString(
            applyTeacherConfirmPassword?.value
        );


    if (cnic.length !== 13) {

        showMessage(
            teacherApplyMessage,
            "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔"
        );

        return false;

    }


    if (phone.length !== 11) {

        showMessage(
            teacherApplyMessage,
            "موبائل نمبر 11 ہندسوں کا ہونا چاہیے۔"
        );

        return false;

    }


    if (!username) {

        showMessage(
            teacherApplyMessage,
            "صارف نام درج کریں۔"
        );

        return false;

    }


    if (password.length < 8) {

        showMessage(
            teacherApplyMessage,
            "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
        );

        return false;

    }


    if (
        password !==
        confirmPassword
    ) {

        showMessage(
            teacherApplyMessage,
            "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
        );

        return false;

    }


    if (
        !teacherApplyConfirmation
            ?.checked
    ) {

        showMessage(
            teacherApplyMessage,
            "معلومات کی تصدیق ضروری ہے۔"
        );

        return false;

    }


    return true;

}


/* =====================================================
   CHECK DUPLICATE TEACHER APPLICATION
===================================================== */

async function checkDuplicateTeacherApplication(
    username,
    cnic,
    phone
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TEACHER_APPLICATIONS_TABLE
            )

            .select(
                "id,username,cnic,phone,status"
            )

            .or(
                `username.eq.${username},cnic.eq.${cnic},phone.eq.${phone}`
            )

            .limit(1);


    if (error) {
        throw error;
    }


    return (
        Array.isArray(data) &&
        data.length > 0
    );

}


/* =====================================================
   SAVE TEACHER APPLICATION
===================================================== */

async function saveTeacherApplication(
    event
) {

    event.preventDefault();


    clearMessage(
        teacherApplyMessage
    );


    if (
        !teacherApplyForm ||
        !teacherApplyForm
            .checkValidity()
    ) {

        teacherApplyForm
            ?.reportValidity();

        return;

    }


    if (
        !validateTeacherApplication()
    ) {
        return;
    }


    if (!checkSupabase()) {

        showMessage(
            teacherApplyMessage,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

        return;

    }


    const username =
        safeString(
            applyTeacherUsername?.value
        );

    const cnic =
        normalizeDigits(
            applyTeacherCNIC?.value
        );

    const phone =
        normalizeDigits(
            applyTeacherPhone?.value
        );


    try {

        if (submitTeacherApplication) {

            submitTeacherApplication
                .disabled = true;

        }


        const duplicate =
            await checkDuplicateTeacherApplication(
                username,
                cnic,
                phone
            );


        if (duplicate) {

            showMessage(
                teacherApplyMessage,
                "اس صارف نام، شناختی کارڈ یا موبائل نمبر سے پہلے ہی درخواست موجود ہے۔"
            );

            return;

        }


        const applicationNumber =
            generateTeacherApplicationNumber();


        const record = {

            application_no:
                applicationNumber,

            name:
                safeString(
                    applyTeacherName?.value
                ),

            father_name:
                safeString(
                    applyTeacherFatherName?.value
                ),

            cnic:
                cnic,

            phone:
                phone,

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
                username,

            password:
                safeString(
                    applyTeacherPassword?.value
                ),

            status:
                "pending",

            admin_note:
                null,

            created_at:
                new Date().toISOString()

        };


        const {
            error
        } =
            await supabaseClient

                .from(
                    TEACHER_APPLICATIONS_TABLE
                )

                .insert([
                    record
                ]);


        if (error) {
            throw error;
        }


        teacherApplyForm.reset();


        showMessage(
            teacherApplyMessage,
            `درخواست کامیابی سے جمع ہوگئی۔ آپ کا درخواست نمبر: ${applicationNumber}`,
            "success"
        );


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

            submitTeacherApplication
                .disabled = false;

        }

    }

}


/* =====================================================
   CHECK TEACHER APPLICATION STATUS
===================================================== */

async function checkTeacherApplication() {

    const applicationNumber =
        safeString(
            teacherApplicationNumber
                ?.value
        );


    clearMessage(
        teacherApplicationStatusResult
    );


    if (!applicationNumber) {

        showMessage(
            teacherApplicationStatusResult,
            "درخواست نمبر درج کریں۔"
        );

        return;

    }


    if (!checkSupabase()) {

        showMessage(
            teacherApplicationStatusResult,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
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
                    TEACHER_APPLICATIONS_TABLE
                )

                .select(
                    "application_no,name,status,admin_note"
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

            showMessage(
                teacherApplicationStatusResult,
                "اس درخواست نمبر کا کوئی ریکارڈ نہیں ملا۔"
            );

            return;

        }


        let statusText =
            "زیرِ منظوری";


        let statusClass =
            "pending-badge";


        if (
            data.status ===
            "approved"
        ) {

            statusText =
                "منظور شدہ";

            statusClass =
                "approved-badge";

        }


        if (
            data.status ===
            "rejected"
        ) {

            statusText =
                "نامنظور";

            statusClass =
                "rejected-badge";

        }


        teacherApplicationStatusResult
            .innerHTML = `

                <strong>
                    ${escapeHTML(
                        data.name || ""
                    )}
                </strong>

                <br>

                درخواست کی حالت:

                <span class="${statusClass}">
                    ${statusText}
                </span>

                ${
                    data.admin_note
                        ? `
                            <br>
                            ایڈمن نوٹ:
                            ${escapeHTML(
                                data.admin_note
                            )}
                          `
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


/* =====================================================
   CNIC FORMAT
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
   PHONE FORMAT
===================================================== */

if (applyTeacherPhone) {

    applyTeacherPhone.addEventListener(
        "input",
        function () {

            this.value =
                normalizeDigits(
                    this.value
                ).slice(
                    0,
                    11
                );

        }
    );

}


/* =====================================================
   FORM SUBMIT
===================================================== */

if (teacherApplyForm) {

    teacherApplyForm.addEventListener(
        "submit",
        saveTeacherApplication
    );

}


/* =====================================================
   CANCEL APPLICATION
===================================================== */

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
   CHECK APPLICATION STATUS BUTTON
===================================================== */

if (checkTeacherApplicationStatus) {

    checkTeacherApplicationStatus
        .addEventListener(
            "click",
            checkTeacherApplication
        );

}


/* =====================================================
   ENTER KEY ON APPLICATION NUMBER
===================================================== */

if (teacherApplicationNumber) {

    teacherApplicationNumber
        .addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    checkTeacherApplication();

                }

            }
        );

}


/* =====================================================
   INITIALIZE TEACHER APPLICATION PAGE
===================================================== */

function initializeTeacherApplicationPage() {

    if (
        getCurrentPageName() !==
        "teacher-apply.html"
    ) {
        return;
    }


    if (applyTeacherAvailableFrom) {

        applyTeacherAvailableFrom.min =
            getTodayDate();

    }

}


/* =====================================================
   END PART 8
===================================================== */

/* =====================================================
   SCRIPT.JS
   PART 9
   APPROVAL / APPLICATION MANAGEMENT
===================================================== */


/* =====================================================
   APPROVAL ELEMENTS
===================================================== */

const studentApplicationsSection =
    document.getElementById(
        "studentApplicationsSection"
    );

const teacherApplicationsSection =
    document.getElementById(
        "teacherApplicationsSection"
    );

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

const closeApplicationDetailsButton =
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

const approveApplicationButton =
    document.getElementById(
        "approveApplication"
    );

const rejectApplicationButton =
    document.getElementById(
        "rejectApplication"
    );


let studentApplicationsCache = [];

let teacherApplicationsCache = [];

let selectedApplication = null;

let selectedApplicationType = null;


/* =====================================================
   APPLICATION STATUS TEXT
===================================================== */

function getApplicationStatusText(status) {

    switch (
        safeString(status)
            .toLowerCase()
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
   APPLICATION STATUS CLASS
===================================================== */

function getApplicationStatusClass(status) {

    switch (
        safeString(status)
            .toLowerCase()
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
   RENDER STUDENT APPLICATIONS
===================================================== */

function renderStudentApplications(
    applications
) {

    if (!studentApplicationsList) {
        return;
    }


    const pendingCount =
        applications.filter(
            item =>
                item.status ===
                "pending"
        ).length;


    if (studentApplicationCount) {

        studentApplicationCount.textContent =
            pendingCount;

    }


    if (applications.length === 0) {

        studentApplicationsList.innerHTML = `

            <div class="empty-students">

                طالبات کی کوئی درخواست موجود نہیں۔

            </div>

        `;

        return;

    }


    studentApplicationsList.innerHTML =
        applications
            .map(application => {

                const status =
                    getApplicationStatusText(
                        application.status
                    );

                const statusClass =
                    getApplicationStatusClass(
                        application.status
                    );


                return `

                    <div class="application-card">

                        <div class="application-card-header">

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        application.name ||
                                        "-"
                                    )}
                                </h3>

                                <p>
                                    درخواست نمبر:
                                    ${escapeHTML(
                                        application.application_no ||
                                        "-"
                                    )}
                                </p>

                            </div>


                            <span
                                class="application-status ${statusClass}"
                            >
                                ${status}
                            </span>

                        </div>


                        <p>
                            کلاس:
                            ${escapeHTML(
                                application.student_class ||
                                "-"
                            )}
                        </p>

                        <p>
                            موبائل:
                            ${escapeHTML(
                                application.phone ||
                                "-"
                            )}
                        </p>


                        <div class="application-actions">

                            <button
                                type="button"
                                class="view-application"
                                data-type="student"
                                data-id="${escapeHTML(
                                    application.id
                                )}"
                            >
                                👁️ تفصیلات
                            </button>


                            ${
                                application.status ===
                                "pending"
                                    ? `

                                        <button
                                            type="button"
                                            class="approve-application"
                                            data-type="student"
                                            data-id="${escapeHTML(
                                                application.id
                                            )}"
                                        >
                                            ✅ منظور کریں
                                        </button>


                                        <button
                                            type="button"
                                            class="reject-application"
                                            data-type="student"
                                            data-id="${escapeHTML(
                                                application.id
                                            )}"
                                        >
                                            ❌ نامنظور کریں
                                        </button>

                                      `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            })
            .join("");


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


    const pendingCount =
        applications.filter(
            item =>
                item.status ===
                "pending"
        ).length;


    if (teacherApplicationCount) {

        teacherApplicationCount.textContent =
            pendingCount;

    }


    if (applications.length === 0) {

        teacherApplicationsList.innerHTML = `

            <div class="teacher-empty">

                اساتذہ کی کوئی درخواست موجود نہیں۔

            </div>

        `;

        return;

    }


    teacherApplicationsList.innerHTML =
        applications
            .map(application => {

                const status =
                    getApplicationStatusText(
                        application.status
                    );

                const statusClass =
                    getApplicationStatusClass(
                        application.status
                    );


                return `

                    <div class="application-card">

                        <div class="application-card-header">

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        application.name ||
                                        "-"
                                    )}
                                </h3>

                                <p>
                                    درخواست نمبر:
                                    ${escapeHTML(
                                        application.application_no ||
                                        "-"
                                    )}
                                </p>

                            </div>


                            <span
                                class="application-status ${statusClass}"
                            >
                                ${status}
                            </span>

                        </div>


                        <p>
                            قابلیت:
                            ${escapeHTML(
                                application.qualification ||
                                "-"
                            )}
                        </p>

                        <p>
                            موبائل:
                            ${escapeHTML(
                                application.phone ||
                                "-"
                            )}
                        </p>


                        <div class="application-actions">

                            <button
                                type="button"
                                class="view-application"
                                data-type="teacher"
                                data-id="${escapeHTML(
                                    application.id
                                )}"
                            >
                                👁️ تفصیلات
                            </button>


                            ${
                                application.status ===
                                "pending"
                                    ? `

                                        <button
                                            type="button"
                                            class="approve-application"
                                            data-type="teacher"
                                            data-id="${escapeHTML(
                                                application.id
                                            )}"
                                        >
                                            ✅ منظور کریں
                                        </button>


                                        <button
                                            type="button"
                                            class="reject-application"
                                            data-type="teacher"
                                            data-id="${escapeHTML(
                                                application.id
                                            )}"
                                        >
                                            ❌ نامنظور کریں
                                        </button>

                                      `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            })
            .join("");


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
   OPEN APPLICATION DETAILS
===================================================== */

function openApplicationDetails(
    type,
    id
) {

    const application =
        findApplication(
            type,
            id
        );


    if (
        !application ||
        !applicationDetailsOverlay ||
        !applicationDetailsContent
    ) {
        return;
    }


    selectedApplication =
        application;

    selectedApplicationType =
        type;


    if (applicationAdminNote) {

        applicationAdminNote.value =
            safeString(
                application.admin_note
            );

    }


    if (
        type ===
        "student"
    ) {

        const mahrams =
            Array.isArray(
                application.mahrams
            )
                ? application.mahrams
                : [];


        applicationDetailsContent.innerHTML = `

            <h3>
                👧 طالبہ کی معلومات
            </h3>

            <p>
                <strong>نام:</strong>
                ${escapeHTML(
                    application.name || "-"
                )}
            </p>

            <p>
                <strong>والد:</strong>
                ${escapeHTML(
                    application.father_name || "-"
                )}
            </p>

            <p>
                <strong>سرپرست:</strong>
                ${escapeHTML(
                    application.guardian_name || "-"
                )}
            </p>

            <p>
                <strong>شناختی کارڈ / ب فارم:</strong>
                ${escapeHTML(
                    formatCNIC(
                        application.cnic
                    ) || "-"
                )}
            </p>

            <p>
                <strong>موبائل:</strong>
                ${escapeHTML(
                    application.phone || "-"
                )}
            </p>

            <p>
                <strong>تاریخ پیدائش:</strong>
                ${escapeHTML(
                    application.date_of_birth || "-"
                )}
            </p>

            <p>
                <strong>کلاس:</strong>
                ${escapeHTML(
                    application.student_class || "-"
                )}
            </p>

            <p>
                <strong>داخلہ کی قسم:</strong>
                ${escapeHTML(
                    application.admission_type || "-"
                )}
            </p>

            <p>
                <strong>رہائش:</strong>
                ${escapeHTML(
                    application.residence_type || "-"
                )}
            </p>

            <p>
                <strong>پتہ:</strong>
                ${escapeHTML(
                    application.address || "-"
                )}
            </p>


            ${
                mahrams.length
                    ? `

                        <h3>
                            👤 محرم کی معلومات
                        </h3>

                        ${mahrams.map(
                            (mahram, index) => `

                                <p>
                                    <strong>
                                        محرم ${index + 1}:
                                    </strong>

                                    ${escapeHTML(
                                        mahram.name || "-"
                                    )}

                                    —
                                    ${escapeHTML(
                                        mahram.relation || "-"
                                    )}

                                    —
                                    ${escapeHTML(
                                        mahram.phone || "-"
                                    )}
                                </p>

                            `
                        ).join("")}

                      `
                    : ""
            }


            <h3>
                🔐 اکاؤنٹ
            </h3>

            <p>
                <strong>صارف نام:</strong>
                ${escapeHTML(
                    application.username || "-"
                )}
            </p>

        `;

    } else {

        applicationDetailsContent.innerHTML = `

            <h3>
                👩‍🏫 استاد کی معلومات
            </h3>

            <p>
                <strong>نام:</strong>
                ${escapeHTML(
                    application.name || "-"
                )}
            </p>

            <p>
                <strong>والد:</strong>
                ${escapeHTML(
                    application.father_name || "-"
                )}
            </p>

            <p>
                <strong>شناختی کارڈ:</strong>
                ${escapeHTML(
                    formatCNIC(
                        application.cnic
                    ) || "-"
                )}
            </p>

            <p>
                <strong>موبائل:</strong>
                ${escapeHTML(
                    application.phone || "-"
                )}
            </p>

            <p>
                <strong>تعلیمی قابلیت:</strong>
                ${escapeHTML(
                    application.qualification || "-"
                )}
            </p>

            <p>
                <strong>تخصص / مہارت:</strong>
                ${escapeHTML(
                    application.specialization || "-"
                )}
            </p>

            <p>
                <strong>تجربہ:</strong>
                ${escapeHTML(
                    application.experience || "-"
                )}
            </p>

            <p>
                <strong>مطلوبہ کلاس:</strong>
                ${escapeHTML(
                    application.preferred_class || "-"
                )}
            </p>

            <p>
                <strong>پتہ:</strong>
                ${escapeHTML(
                    application.address || "-"
                )}
            </p>


            <h3>
                🔐 اکاؤنٹ
            </h3>

            <p>
                <strong>صارف نام:</strong>
                ${escapeHTML(
                    application.username || "-"
                )}
            </p>

        `;

    }


    if (applicationDecisionSection) {

        applicationDecisionSection
            .classList
            .toggle(
                "hidden",
                application.status !==
                "pending"
            );

    }


    applicationDetailsOverlay
        .classList
        .remove("hidden");


    document.body
        .classList
        .add("modal-open");

}


/* =====================================================
   CLOSE APPLICATION DETAILS
===================================================== */

function closeApplicationDetails() {

    if (applicationDetailsOverlay) {

        applicationDetailsOverlay
            .classList
            .add("hidden");

    }


    document.body
        .classList
        .remove("modal-open");


    selectedApplication = null;

    selectedApplicationType = null;

}


/* =====================================================
   OPEN APPLICATION FOR DECISION
===================================================== */

function openApplicationForDecision(
    type,
    id
) {

    openApplicationDetails(
        type,
        id
    );

}


/* =====================================================
   UPDATE APPLICATION STATUS
===================================================== */

async function updateApplicationStatus(
    newStatus
) {

    if (!requireAdmin()) {
        return;
    }


    if (
        !selectedApplication ||
        !selectedApplicationType
    ) {
        return;
    }


    if (!checkSupabase()) {
        return;
    }


    const tableName =
        selectedApplicationType ===
        "student"
            ? STUDENT_APPLICATIONS_TABLE
            : TEACHER_APPLICATIONS_TABLE;


    const note =
        safeString(
            applicationAdminNote?.value
        );


    try {

        const {
            error
        } =
            await supabaseClient

                .from(
                    tableName
                )

                .update({

                    status:
                        newStatus,

                    admin_note:
                        note || null,

                    reviewed_at:
                        new Date()
                            .toISOString()

                })

                .eq(
                    "id",
                    selectedApplication.id
                );


        if (error) {
            throw error;
        }


        closeApplicationDetails();


        await Promise.allSettled([

            loadStudentApplications(),

            loadTeacherApplications()

        ]);


    } catch (error) {

        console.error(
            "Application decision error:",
            error
        );


        window.alert(
            "درخواست کی حالت تبدیل نہیں ہو سکی۔"
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
        .forEach(button => {

            button.onclick =
                function () {

                    openApplicationDetails(
                        this.dataset.type,
                        this.dataset.id
                    );

                };

        });


    document
        .querySelectorAll(
            ".approve-application"
        )
        .forEach(button => {

            button.onclick =
                function () {

                    openApplicationForDecision(
                        this.dataset.type,
                        this.dataset.id
                    );

                };

        });


    document
        .querySelectorAll(
            ".reject-application"
        )
        .forEach(button => {

            button.onclick =
                function () {

                    openApplicationForDecision(
                        this.dataset.type,
                        this.dataset.id
                    );

                };

        });

}


/* =====================================================
   APPROVE BUTTON
===================================================== */

if (approveApplicationButton) {

    approveApplicationButton
        .addEventListener(
            "click",
            function () {

                updateApplicationStatus(
                    "approved"
                );

            }
        );

}


/* =====================================================
   REJECT BUTTON
===================================================== */

if (rejectApplicationButton) {

    rejectApplicationButton
        .addEventListener(
            "click",
            function () {

                updateApplicationStatus(
                    "rejected"
                );

            }
        );

}


/* =====================================================
   CLOSE DETAILS BUTTON
===================================================== */

if (closeApplicationDetailsButton) {

    closeApplicationDetailsButton
        .addEventListener(
            "click",
            closeApplicationDetails
        );

}


/* =====================================================
   OVERLAY CLICK
===================================================== */

if (applicationDetailsOverlay) {

    applicationDetailsOverlay
        .addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    applicationDetailsOverlay
                ) {

                    closeApplicationDetails();

                }

            }
        );

}


/* =====================================================
   INITIALIZE APPROVAL PAGE
===================================================== */

async function initializeApprovalsPage() {

    if (
        getCurrentPageName() !==
        "approvals.html"
    ) {
        return;
    }


    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }


    if (
        getCurrentRole() !==
        "admin"
    ) {

        window.location.href =
            "index.html";

        return;
    }


    await Promise.allSettled([

        loadStudentApplications(),

        loadTeacherApplications()

    ]);

}


/* =====================================================
   END PART 9
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 10
   APPROVAL -> CREATE FINAL STUDENT / TEACHER RECORD
===================================================== */


/* =====================================================
   GENERATE STUDENT ADMISSION NUMBER
===================================================== */

function generateStudentAdmissionNumber() {

    const year =
        new Date().getFullYear();

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `S-${year}-${random}`;

}


/* =====================================================
   GENERATE TEACHER CODE
===================================================== */

function generateTeacherCode() {

    const year =
        new Date().getFullYear();

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `T-${year}-${random}`;

}


/* =====================================================
   CHECK FINAL STUDENT DUPLICATE
===================================================== */

async function finalStudentExists(
    application
) {

    const cnic =
        normalizeDigits(
            application.cnic
        );

    const phone =
        normalizeDigits(
            application.phone
        );


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                STUDENTS_TABLE
            )

            .select("id")

            .or(
                `cnic.eq.${cnic},phone.eq.${phone}`
            )

            .limit(1);


    if (error) {
        throw error;
    }


    return (
        Array.isArray(data) &&
        data.length > 0
    );

}


/* =====================================================
   CHECK FINAL TEACHER DUPLICATE
===================================================== */

async function finalTeacherExists(
    application
) {

    const cnic =
        normalizeDigits(
            application.cnic
        );

    const phone =
        normalizeDigits(
            application.phone
        );


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TEACHERS_TABLE
            )

            .select("id")

            .or(
                `cnic.eq.${cnic},phone.eq.${phone}`
            )

            .limit(1);


    if (error) {
        throw error;
    }


    return (
        Array.isArray(data) &&
        data.length > 0
    );

}


/* =====================================================
   CREATE FINAL STUDENT
===================================================== */

async function createStudentFromApplication(
    application
) {

    if (!application) {
        return;
    }


    const duplicate =
        await finalStudentExists(
            application
        );


    if (duplicate) {

        throw new Error(
            "STUDENT_ALREADY_EXISTS"
        );

    }


    const admissionNumber =
        generateStudentAdmissionNumber();


    const studentRecord = {

        admission_no:
            admissionNumber,

        admission_type:
            safeString(
                application.admission_type
            ) || "نیا داخلہ",

        name:
            safeString(
                application.name
            ),

        father_name:
            safeString(
                application.father_name
            ),

        guardian_name:
            safeString(
                application.guardian_name
            ),

        cnic:
            normalizeDigits(
                application.cnic
            ),

        phone:
            normalizeDigits(
                application.phone
            ),

        date_of_birth:
            application.date_of_birth ||
            null,

        student_class:
            safeString(
                application.student_class
            ),

        admission_date:
            getTodayDate(),

        address:
            safeString(
                application.address
            ),

        residence_type:
            safeString(
                application.residence_type
            ),

        previous_madrassa:
            safeString(
                application.previous_madrassa
            ) || null,

        transfer_date:
            application.transfer_date ||
            null,

        mahrams:
            Array.isArray(
                application.mahrams
            )
                ? application.mahrams
                : [],

        status:
            "active"

    };


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                STUDENTS_TABLE
            )

            .insert([
                studentRecord
            ])

            .select()

            .single();


    if (error) {
        throw error;
    }


    return data;

}


/* =====================================================
   CREATE FINAL TEACHER
===================================================== */

async function createTeacherFromApplication(
    application
) {

    if (!application) {
        return;
    }


    const duplicate =
        await finalTeacherExists(
            application
        );


    if (duplicate) {

        throw new Error(
            "TEACHER_ALREADY_EXISTS"
        );

    }


    const teacherCode =
        generateTeacherCode();


    const teacherRecord = {

        teacher_code:
            teacherCode,

        name:
            safeString(
                application.name
            ),

        father_name:
            safeString(
                application.father_name
            ),

        phone:
            normalizeDigits(
                application.phone
            ),

        cnic:
            normalizeDigits(
                application.cnic
            ),

        date_of_birth:
            application.date_of_birth ||
            null,

        qualification:
            safeString(
                application.qualification
            ),

        joining_date:
            getTodayDate(),

        address:
            safeString(
                application.address
            ),

        status:
            "active"

    };


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                TEACHERS_TABLE
            )

            .insert([
                teacherRecord
            ])

            .select()

            .single();


    if (error) {
        throw error;
    }


    return data;

}


/* =====================================================
   CREATE USER ACCOUNT RECORD
===================================================== */

async function createApprovedAccount(
    application,
    type,
    linkedRecord
) {

    if (!application) {
        return;
    }


    const username =
        safeString(
            application.username
        );


    if (!username) {

        throw new Error(
            "USERNAME_MISSING"
        );

    }


    const {
        data: existingAccount,
        error: existingError
    } =
        await supabaseClient

            .from(
                ACCOUNTS_TABLE
            )

            .select("id")

            .eq(
                "username",
                username
            )

            .limit(1);


    if (existingError) {
        throw existingError;
    }


    if (
        Array.isArray(
            existingAccount
        ) &&
        existingAccount.length > 0
    ) {

        throw new Error(
            "USERNAME_ALREADY_EXISTS"
        );

    }


    const accountRecord = {

        username:
            username,

        password:
            safeString(
                application.password
            ),

        role:
            type === "student"
                ? "student"
                : "teacher",

        status:
            "active",

        approved:
            true,

        student_id:
            type === "student"
                ? linkedRecord?.id || null
                : null,

        teacher_id:
            type === "teacher"
                ? linkedRecord?.id || null
                : null,

        created_at:
            new Date()
                .toISOString()

    };


    const {
        error
    } =
        await supabaseClient

            .from(
                ACCOUNTS_TABLE
            )

            .insert([
                accountRecord
            ]);


    if (error) {
        throw error;
    }

}


/* =====================================================
   APPROVE STUDENT APPLICATION COMPLETELY
===================================================== */

async function approveStudentApplication(
    application
) {

    const student =
        await createStudentFromApplication(
            application
        );


    try {

        await createApprovedAccount(
            application,
            "student",
            student
        );


    } catch (error) {

        if (student?.id) {

            await supabaseClient

                .from(
                    STUDENTS_TABLE
                )

                .delete()

                .eq(
                    "id",
                    student.id
                );

        }


        throw error;

    }


    return student;

}


/* =====================================================
   APPROVE TEACHER APPLICATION COMPLETELY
===================================================== */

async function approveTeacherApplication(
    application
) {

    const teacher =
        await createTeacherFromApplication(
            application
        );


    try {

        await createApprovedAccount(
            application,
            "teacher",
            teacher
        );


    } catch (error) {

        if (teacher?.id) {

            await supabaseClient

                .from(
                    TEACHERS_TABLE
                )

                .delete()

                .eq(
                    "id",
                    teacher.id
                );

        }


        throw error;

    }


    return teacher;

}


/* =====================================================
   COMPLETE APPLICATION APPROVAL
===================================================== */

async function completeApplicationApproval() {

    if (!requireAdmin()) {
        return;
    }


    if (
        !selectedApplication ||
        !selectedApplicationType
    ) {

        window.alert(
            "کوئی درخواست منتخب نہیں ہے۔"
        );

        return;

    }


    if (!checkSupabase()) {
        return;
    }


    const application =
        selectedApplication;

    const type =
        selectedApplicationType;

    const note =
        safeString(
            applicationAdminNote?.value
        );


    if (approveApplicationButton) {

        approveApplicationButton.disabled =
            true;

    }


    if (rejectApplicationButton) {

        rejectApplicationButton.disabled =
            true;

    }


    try {

        if (
            type ===
            "student"
        ) {

            await approveStudentApplication(
                application
            );

        } else {

            await approveTeacherApplication(
                application
            );

        }


        const tableName =
            type === "student"
                ? STUDENT_APPLICATIONS_TABLE
                : TEACHER_APPLICATIONS_TABLE;


        const {
            error
        } =
            await supabaseClient

                .from(
                    tableName
                )

                .update({

                    status:
                        "approved",

                    admin_note:
                        note || null,

                    reviewed_at:
                        new Date()
                            .toISOString()

                })

                .eq(
                    "id",
                    application.id
                );


        if (error) {
            throw error;
        }


        closeApplicationDetails();


        window.alert(
            type === "student"
                ? "طالبہ کی درخواست منظور ہوگئی اور اکاؤنٹ فعال ہوگیا۔"
                : "استاد کی درخواست منظور ہوگئی اور اکاؤنٹ فعال ہوگیا۔"
        );


        await Promise.allSettled([

            loadStudentApplications(),

            loadTeacherApplications()

        ]);


    } catch (error) {

        console.error(
            "Complete approval error:",
            error
        );


        let message =
            "درخواست منظور نہیں ہو سکی۔";


        if (
            error.message ===
            "STUDENT_ALREADY_EXISTS"
        ) {

            message =
                "اس طالبہ کا ریکارڈ پہلے سے موجود ہے۔";

        }


        if (
            error.message ===
            "TEACHER_ALREADY_EXISTS"
        ) {

            message =
                "اس استاد کا ریکارڈ پہلے سے موجود ہے۔";

        }


        if (
            error.message ===
            "USERNAME_ALREADY_EXISTS"
        ) {

            message =
                "یہ صارف نام پہلے سے استعمال ہو رہا ہے۔";

        }


        window.alert(
            message
        );


    } finally {

        if (approveApplicationButton) {

            approveApplicationButton.disabled =
                false;

        }


        if (rejectApplicationButton) {

            rejectApplicationButton.disabled =
                false;

        }

    }

}


/* =====================================================
   REJECT APPLICATION COMPLETELY
===================================================== */

async function completeApplicationRejection() {

    if (!requireAdmin()) {
        return;
    }


    if (
        !selectedApplication ||
        !selectedApplicationType
    ) {
        return;
    }


    const tableName =
        selectedApplicationType ===
        "student"
            ? STUDENT_APPLICATIONS_TABLE
            : TEACHER_APPLICATIONS_TABLE;


    const note =
        safeString(
            applicationAdminNote?.value
        );


    try {

        const {
            error
        } =
            await supabaseClient

                .from(
                    tableName
                )

                .update({

                    status:
                        "rejected",

                    admin_note:
                        note || null,

                    reviewed_at:
                        new Date()
                            .toISOString()

                })

                .eq(
                    "id",
                    selectedApplication.id
                );


        if (error) {
            throw error;
        }


        closeApplicationDetails();


        window.alert(
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


        window.alert(
            "درخواست نامنظور نہیں ہو سکی۔"
        );

    }

}


/* =====================================================
   REPLACE PART 9 BUTTON EVENTS
===================================================== */

if (approveApplicationButton) {

    approveApplicationButton.onclick =
        function () {

            completeApplicationApproval();

        };

}


if (rejectApplicationButton) {

    rejectApplicationButton.onclick =
        function () {

            completeApplicationRejection();

        };

}


/* =====================================================
   END PART 10
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 11
   LOGIN / ACCOUNT AUTHENTICATION / ROLE SECURITY
===================================================== */


/* =====================================================
   LOGIN ELEMENTS
===================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginUsername =
    document.getElementById(
        "username"
    );

const loginPassword =
    document.getElementById(
        "password"
    );

const loginRole =
    document.getElementById(
        "loginRole"
    );

const rememberMe =
    document.getElementById(
        "rememberMe"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const togglePasswordButton =
    document.getElementById(
        "togglePassword"
    );

const loginBackButton =
    document.getElementById(
        "backButton"
    );

const selectedRoleText =
    document.getElementById(
        "selectedRoleText"
    );

const pendingAccountMessage =
    document.getElementById(
        "pendingAccountMessage"
    );

const rejectedAccountMessage =
    document.getElementById(
        "rejectedAccountMessage"
    );


/* =====================================================
   ROLE TEXT
===================================================== */

function getRoleUrduText(role) {

    switch (
        safeString(role)
            .toLowerCase()
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
   VALID ROLE
===================================================== */

function isValidLoginRole(role) {

    return [
        "admin",
        "teacher",
        "student"
    ].includes(
        safeString(role)
            .toLowerCase()
    );

}


/* =====================================================
   GET LOGIN ROLE FROM URL
===================================================== */

function getLoginRoleFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const role =
        safeString(
            params.get("role")
        ).toLowerCase();


    return isValidLoginRole(role)
        ? role
        : "";

}


/* =====================================================
   SET LOGIN ROLE
===================================================== */

function setLoginRole(role) {

    const cleanRole =
        safeString(role)
            .toLowerCase();


    if (
        !isValidLoginRole(
            cleanRole
        )
    ) {
        return;
    }


    if (loginRole) {

        loginRole.value =
            cleanRole;

    }


    if (selectedRoleText) {

        selectedRoleText.textContent =
            getRoleUrduText(
                cleanRole
            );

    }

}


/* =====================================================
   HIDE LOGIN ACCOUNT MESSAGES
===================================================== */

function hideLoginAccountMessages() {

    pendingAccountMessage
        ?.classList
        .add("hidden");

    rejectedAccountMessage
        ?.classList
        .add("hidden");

}


/* =====================================================
   SHOW ACCOUNT STATUS
===================================================== */

function showLoginAccountStatus(
    status
) {

    hideLoginAccountMessages();


    const cleanStatus =
        safeString(status)
            .toLowerCase();


    if (
        cleanStatus ===
        "pending"
    ) {

        pendingAccountMessage
            ?.classList
            .remove("hidden");

    }


    if (
        cleanStatus ===
        "rejected"
    ) {

        rejectedAccountMessage
            ?.classList
            .remove("hidden");

    }

}


/* =====================================================
   SAVE LOGIN SESSION
===================================================== */

function saveLoginSession(
    account,
    remember
) {

    const storage =
        remember
            ? localStorage
            : sessionStorage;


    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "accountId"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "studentId"
    );

    localStorage.removeItem(
        "teacherId"
    );


    sessionStorage.removeItem(
        "loggedIn"
    );

    sessionStorage.removeItem(
        "userRole"
    );

    sessionStorage.removeItem(
        "accountId"
    );

    sessionStorage.removeItem(
        "username"
    );

    sessionStorage.removeItem(
        "studentId"
    );

    sessionStorage.removeItem(
        "teacherId"
    );


    storage.setItem(
        "loggedIn",
        "true"
    );

    storage.setItem(
        "userRole",
        safeString(
            account.role
        )
    );

    storage.setItem(
        "accountId",
        safeString(
            account.id
        )
    );

    storage.setItem(
        "username",
        safeString(
            account.username
        )
    );


    if (account.student_id) {

        storage.setItem(
            "studentId",
            safeString(
                account.student_id
            )
        );

    }


    if (account.teacher_id) {

        storage.setItem(
            "teacherId",
            safeString(
                account.teacher_id
            )
        );

    }


    storage.setItem(
        "lastActivity",
        String(
            Date.now()
        )
    );

}


/* =====================================================
   ACCOUNT LOOKUP
===================================================== */

async function findLoginAccount(
    username,
    role
) {

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


    return data || null;

}


/* =====================================================
   REDIRECT AFTER LOGIN
===================================================== */

function redirectAfterSuccessfulLogin(
    role
) {

    switch (
        safeString(role)
            .toLowerCase()
    ) {

        case "admin":

            window.location.href =
                "dashboard.html";

            break;


        case "teacher":

            window.location.href =
                "teacher-dashboard.html";

            break;


        case "student":

            window.location.href =
                "student-dashboard.html";

            break;


        default:

            window.location.href =
                "index.html";

    }

}


/* =====================================================
   LOGIN
===================================================== */

async function handleLogin(
    event
) {

    event.preventDefault();


    clearMessage(
        loginMessage
    );

    hideLoginAccountMessages();


    const username =
        safeString(
            loginUsername?.value
        );

    const password =
        safeString(
            loginPassword?.value
        );

    const role =
        safeString(
            loginRole?.value
        ).toLowerCase();


    if (
        !username ||
        !password
    ) {

        showMessage(
            loginMessage,
            "صارف نام اور پاس ورڈ درج کریں۔"
        );

        return;

    }


    if (
        !isValidLoginRole(
            role
        )
    ) {

        showMessage(
            loginMessage,
            "اکاؤنٹ کی قسم منتخب نہیں ہوئی۔"
        );

        return;

    }


    if (!checkSupabase()) {

        showMessage(
            loginMessage,
            "ڈیٹا بیس سے رابطہ نہیں ہو سکا۔"
        );

        return;

    }


    try {

        if (loginButton) {

            loginButton.disabled =
                true;

        }


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
            safeString(
                account.status
            ).toLowerCase();


        if (
            status ===
            "pending"
        ) {

            showLoginAccountStatus(
                "pending"
            );

            showMessage(
                loginMessage,
                "آپ کا اکاؤنٹ ابھی زیرِ منظوری ہے۔"
            );

            return;

        }


        if (
            status ===
            "rejected"
        ) {

            showLoginAccountStatus(
                "rejected"
            );

            showMessage(
                loginMessage,
                "آپ کی درخواست منظور نہیں ہوئی۔"
            );

            return;

        }


        if (
            status !== "active" ||
            account.approved === false
        ) {

            showMessage(
                loginMessage,
                "یہ اکاؤنٹ فعال نہیں ہے۔"
            );

            return;

        }


        if (
            safeString(
                account.password
            ) !== password
        ) {

            showMessage(
                loginMessage,
                "صارف نام یا پاس ورڈ درست نہیں ہے۔"
            );

            return;

        }


        saveLoginSession(
            account,
            Boolean(
                rememberMe?.checked
            )
        );


        showMessage(
            loginMessage,
            "لاگ اِن کامیاب ہوگیا۔",
            "success"
        );


        redirectAfterSuccessfulLogin(
            account.role
        );


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

        }

    }

}


/* =====================================================
   PASSWORD SHOW / HIDE
===================================================== */

function toggleLoginPassword() {

    if (!loginPassword) {
        return;
    }


    const show =
        loginPassword.type ===
        "password";


    loginPassword.type =
        show
            ? "text"
            : "password";


    if (togglePasswordButton) {

        togglePasswordButton.textContent =
            show
                ? "🙈"
                : "👁️";

        togglePasswordButton.setAttribute(
            "aria-label",
            show
                ? "پاس ورڈ چھپائیں"
                : "پاس ورڈ دکھائیں"
        );

    }

}


/* =====================================================
   LOGIN FORM EVENT
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


/* =====================================================
   PASSWORD BUTTON EVENT
===================================================== */

if (togglePasswordButton) {

    togglePasswordButton.addEventListener(
        "click",
        toggleLoginPassword
    );

}


/* =====================================================
   BACK BUTTON
===================================================== */

if (loginBackButton) {

    loginBackButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


/* =====================================================
   INITIALIZE LOGIN PAGE
===================================================== */

function initializeLoginPage() {

    if (
        getCurrentPageName() !==
        "login.html"
    ) {
        return;
    }


    const role =
        getLoginRoleFromURL();


    if (!role) {

        window.location.href =
            "index.html";

        return;

    }


    setLoginRole(
        role
    );


    hideLoginAccountMessages();


    if (
        isAuthenticated()
    ) {

        const currentRole =
            getCurrentRole();


        if (
            isValidLoginRole(
                currentRole
            )
        ) {

            redirectAfterSuccessfulLogin(
                currentRole
            );

        }

    }

}


/* =====================================================
   END PART 11
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 12
   SESSION / LOGOUT / 5-MINUTE INACTIVITY SECURITY
===================================================== */


/* =====================================================
   SESSION SETTINGS
===================================================== */

const SESSION_TIMEOUT =
    5 * 60 * 1000;


/* =====================================================
   GET ACTIVE STORAGE
===================================================== */

function getActiveSessionStorage() {

    if (
        localStorage.getItem(
            "loggedIn"
        ) === "true"
    ) {

        return localStorage;

    }


    if (
        sessionStorage.getItem(
            "loggedIn"
        ) === "true"
    ) {

        return sessionStorage;

    }


    return null;

}


/* =====================================================
   IS AUTHENTICATED
===================================================== */

function isAuthenticated() {

    const storage =
        getActiveSessionStorage();


    return Boolean(storage);

}


/* =====================================================
   GET CURRENT ROLE
===================================================== */

function getCurrentRole() {

    const storage =
        getActiveSessionStorage();


    if (!storage) {
        return "";
    }


    return safeString(
        storage.getItem(
            "userRole"
        )
    ).toLowerCase();

}


/* =====================================================
   GET CURRENT ACCOUNT ID
===================================================== */

function getCurrentAccountId() {

    const storage =
        getActiveSessionStorage();


    if (!storage) {
        return "";
    }


    return safeString(
        storage.getItem(
            "accountId"
        )
    );

}


/* =====================================================
   GET CURRENT USERNAME
===================================================== */

function getCurrentUsername() {

    const storage =
        getActiveSessionStorage();


    if (!storage) {
        return "";
    }


    return safeString(
        storage.getItem(
            "username"
        )
    );

}


/* =====================================================
   GET CURRENT STUDENT ID
===================================================== */

function getCurrentStudentId() {

    const storage =
        getActiveSessionStorage();


    if (!storage) {
        return "";
    }


    return safeString(
        storage.getItem(
            "studentId"
        )
    );

}


/* =====================================================
   GET CURRENT TEACHER ID
===================================================== */

function getCurrentTeacherId() {

    const storage =
        getActiveSessionStorage();


    if (!storage) {
        return "";
    }


    return safeString(
        storage.getItem(
            "teacherId"
        )
    );

}


/* =====================================================
   UPDATE LAST ACTIVITY
===================================================== */

function updateLastActivity() {

    const storage =
        getActiveSessionStorage();


    if (!storage) {
        return;
    }


    storage.setItem(
        "lastActivity",
        String(
            Date.now()
        )
    );

}


/* =====================================================
   GET LAST ACTIVITY
===================================================== */

function getLastActivity() {

    const storage =
        getActiveSessionStorage();


    if (!storage) {
        return 0;
    }


    const value =
        Number(
            storage.getItem(
                "lastActivity"
            )
        );


    return Number.isFinite(value)
        ? value
        : 0;

}


/* =====================================================
   CLEAR LOGIN SESSION
===================================================== */

function clearLoginSession() {

    const keys = [

        "loggedIn",
        "userRole",
        "accountId",
        "username",
        "studentId",
        "teacherId",
        "lastActivity"

    ];


    keys.forEach(key => {

        localStorage.removeItem(
            key
        );

        sessionStorage.removeItem(
            key
        );

    });

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser(
    message = ""
) {

    clearLoginSession();


    if (message) {

        sessionStorage.setItem(
            "logoutMessage",
            message
        );

    }


    window.location.href =
        "login.html";

}


/* =====================================================
   REDIRECT TO LOGIN
===================================================== */

function redirectToLogin() {

    const role =
        getCurrentRole();


    clearLoginSession();


    if (
        isValidLoginRole(role)
    ) {

        window.location.href =
            `login.html?role=${encodeURIComponent(
                role
            )}`;

        return;

    }


    window.location.href =
        "index.html";

}


/* =====================================================
   SESSION EXPIRED
===================================================== */

function expireSession() {

    if (
        !isAuthenticated()
    ) {
        return;
    }


    const role =
        getCurrentRole();


    clearLoginSession();


    sessionStorage.setItem(
        "logoutMessage",
        "پانچ منٹ تک کوئی سرگرمی نہ ہونے کی وجہ سے آپ کا سیشن ختم ہوگیا۔"
    );


    if (
        isValidLoginRole(role)
    ) {

        window.location.href =
            `login.html?role=${encodeURIComponent(
                role
            )}`;

    } else {

        window.location.href =
            "index.html";

    }

}


/* =====================================================
   CHECK SESSION TIMEOUT
===================================================== */

function checkSessionTimeout() {

    if (
        !isAuthenticated()
    ) {
        return;
    }


    const lastActivity =
        getLastActivity();


    if (!lastActivity) {

        updateLastActivity();

        return;

    }


    const inactiveTime =
        Date.now() -
        lastActivity;


    if (
        inactiveTime >=
        SESSION_TIMEOUT
    ) {

        expireSession();

    }

}


/* =====================================================
   ACTIVITY HANDLER
===================================================== */

let activityUpdateTimer = null;


function handleUserActivity() {

    if (
        !isAuthenticated()
    ) {
        return;
    }


    if (activityUpdateTimer) {
        return;
    }


    activityUpdateTimer =
        setTimeout(
            function () {

                updateLastActivity();

                activityUpdateTimer =
                    null;

            },
            1000
        );

}


/* =====================================================
   SESSION ACTIVITY EVENTS
===================================================== */

[
    "click",
    "keydown",
    "touchstart",
    "scroll",
    "mousemove"
].forEach(
    eventName => {

        document.addEventListener(
            eventName,
            handleUserActivity,
            {
                passive: true
            }
        );

    }
);


/* =====================================================
   SESSION CHECK INTERVAL
===================================================== */

setInterval(
    checkSessionTimeout,
    15000
);


/* =====================================================
   CHECK WHEN PAGE BECOMES ACTIVE
===================================================== */

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            checkSessionTimeout();

        }

    }
);


/* =====================================================
   LOGOUT BUTTONS
===================================================== */

document
    .querySelectorAll(
        "#logoutButton, .logout-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const role =
                    getCurrentRole();


                clearLoginSession();


                if (
                    isValidLoginRole(role)
                ) {

                    window.location.href =
                        `login.html?role=${encodeURIComponent(
                            role
                        )}`;

                } else {

                    window.location.href =
                        "index.html";

                }

            }
        );

    });


/* =====================================================
   SHOW LOGOUT MESSAGE ON LOGIN PAGE
===================================================== */

function showSavedLogoutMessage() {

    if (
        getCurrentPageName() !==
        "login.html"
    ) {
        return;
    }


    const message =
        sessionStorage.getItem(
            "logoutMessage"
        );


    if (!message) {
        return;
    }


    sessionStorage.removeItem(
        "logoutMessage"
    );


    showMessage(
        loginMessage,
        message
    );

}


/* =====================================================
   PROTECTED PAGE CHECK
===================================================== */

function protectCurrentPage() {

    const page =
        getCurrentPageName();


    const publicPages = [

        "",
        "index.html",
        "login.html",
        "student-apply.html",
        "teacher-apply.html"

    ];


    if (
        publicPages.includes(
            page
        )
    ) {
        return true;
    }


    if (
        !isAuthenticated()
    ) {

        window.location.href =
            "index.html";

        return false;

    }


    checkSessionTimeout();


    return isAuthenticated();

}


/* =====================================================
   ADMIN PAGE SECURITY
===================================================== */

function protectAdminPage() {

    const page =
        getCurrentPageName();


    const adminPages = [

        "dashboard.html",
        "students.html",
        "teachers.html",
        "approvals.html"

    ];


    if (
        !adminPages.includes(
            page
        )
    ) {
        return true;
    }


    if (
        !isAuthenticated()
    ) {

        window.location.href =
            "index.html";

        return false;

    }


    if (
        getCurrentRole() !==
        "admin"
    ) {

        window.location.href =
            "index.html";

        return false;

    }


    return true;

}


/* =====================================================
   ADMIN-ONLY ELEMENTS
===================================================== */

function updateAdminOnlyElements() {

    const isAdmin =
        getCurrentRole() ===
        "admin";


    document
        .querySelectorAll(
            ".admin-only"
        )
        .forEach(element => {

            if (isAdmin) {

                element.classList
                    .remove("hidden");

            } else {

                element.classList
                    .add("hidden");

            }

        });

}


/* =====================================================
   REQUIRE ADMIN
===================================================== */

function requireAdmin() {

    if (
        !isAuthenticated() ||
        getCurrentRole() !==
        "admin"
    ) {

        window.alert(
            "یہ اختیار صرف ایڈمن کے لیے ہے۔"
        );

        return false;

    }


    return true;

}


/* =====================================================
   INITIALIZE SESSION SECURITY
===================================================== */

function initializeSessionSecurity() {

    if (
        !protectCurrentPage()
    ) {
        return;
    }


    if (
        !protectAdminPage()
    ) {
        return;
    }


    if (
        isAuthenticated()
    ) {

        checkSessionTimeout();

        updateAdminOnlyElements();

    }


    showSavedLogoutMessage();

}


/* =====================================================
   END PART 12
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 13
   HOME NAVIGATION / GLOBAL PAGE INITIALIZATION
===================================================== */


/* =====================================================
   HOME PAGE ELEMENTS
===================================================== */

const adminLoginButton =
    document.getElementById(
        "adminLoginButton"
    );

const teacherLoginButton =
    document.getElementById(
        "teacherLoginButton"
    );

const studentLoginButton =
    document.getElementById(
        "studentLoginButton"
    );

const studentApplyButton =
    document.getElementById(
        "studentApplyButton"
    );

const teacherApplyButton =
    document.getElementById(
        "teacherApplyButton"
    );


/* =====================================================
   OPEN LOGIN PAGE
===================================================== */

function openLoginPage(role) {

    const cleanRole =
        safeString(role)
            .toLowerCase();


    if (
        !isValidLoginRole(
            cleanRole
        )
    ) {
        return;
    }


    window.location.href =
        `login.html?role=${encodeURIComponent(
            cleanRole
        )}`;

}


/* =====================================================
   HOME LOGIN BUTTON EVENTS
===================================================== */

if (adminLoginButton) {

    adminLoginButton.addEventListener(
        "click",
        function () {

            openLoginPage(
                "admin"
            );

        }
    );

}


if (teacherLoginButton) {

    teacherLoginButton.addEventListener(
        "click",
        function () {

            openLoginPage(
                "teacher"
            );

        }
    );

}


if (studentLoginButton) {

    studentLoginButton.addEventListener(
        "click",
        function () {

            openLoginPage(
                "student"
            );

        }
    );

}


/* =====================================================
   APPLICATION BUTTON EVENTS
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
   BACK TO HOME BUTTONS
===================================================== */

document
    .querySelectorAll(
        "#backToHome"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                window.location.href =
                    "index.html";

            }
        );

    });


/* =====================================================
   BACK TO DASHBOARD BUTTONS
===================================================== */

document
    .querySelectorAll(
        "#backToDashboard"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const role =
                    getCurrentRole();


                if (
                    role ===
                    "admin"
                ) {

                    window.location.href =
                        "dashboard.html";

                } else if (
                    role ===
                    "teacher"
                ) {

                    window.location.href =
                        "teacher-dashboard.html";

                } else if (
                    role ===
                    "student"
                ) {

                    window.location.href =
                        "student-dashboard.html";

                } else {

                    window.location.href =
                        "index.html";

                }

            }
        );

    });


/* =====================================================
   DASHBOARD MENU NAVIGATION
===================================================== */

function initializeDashboardNavigation() {

    const navigationMap = {

        studentsButton:
            "students.html",

        teachersButton:
            "teachers.html",

        attendanceButton:
            "attendance.html",

        approvalsButton:
            "approvals.html",

        studentApplicationsButton:
            "approvals.html",

        teacherApplicationsButton:
            "approvals.html"

    };


    Object.entries(
        navigationMap
    ).forEach(
        ([id, page]) => {

            const button =
                document.getElementById(
                    id
                );


            if (!button) {
                return;
            }


            button.addEventListener(
                "click",
                function () {

                    window.location.href =
                        page;

                }
            );

        }
    );

}


/* =====================================================
   ESCAPE KEY FOR MODALS
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
            studentDetailsOverlay &&
            !studentDetailsOverlay
                .classList
                .contains("hidden")
        ) {

            closeStudentDetails();

        }


        if (
            teacherDetailsOverlay &&
            !teacherDetailsOverlay
                .classList
                .contains("hidden")
        ) {

            closeTeacherDetails();

        }


        if (
            applicationDetailsOverlay &&
            !applicationDetailsOverlay
                .classList
                .contains("hidden")
        ) {

            closeApplicationDetails();

        }

    }
);


/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

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
   INITIALIZE CURRENT PAGE
===================================================== */

async function initializeCurrentPage() {

    try {

        initializeSessionSecurity();

        initializeDashboardNavigation();


        const page =
            getCurrentPageName();


        switch (page) {

            case "":
            case "index.html":

                break;


            case "login.html":

                initializeLoginPage();

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


            case "student-apply.html":

                initializeStudentApplicationPage();

                break;


            case "teacher-apply.html":

                initializeTeacherApplicationPage();

                break;


            case "approvals.html":

                await initializeApprovalsPage();

                break;


            case "attendance.html":

                if (
                    typeof initializeAttendancePage ===
                    "function"
                ) {

                    await initializeAttendancePage();

                }

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

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCurrentPage
    );

} else {

    initializeCurrentPage();

}


/* =====================================================
   END PART 13
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 14
   FINAL SAFETY / FORM HELPERS / INITIAL CHECKS
===================================================== */


/* =====================================================
   PREVENT FUTURE DATE OF BIRTH
===================================================== */

function setMaximumBirthDates() {

    const today =
        getTodayDate();


    [
        "dateOfBirth",
        "teacherDateOfBirth",
        "applyDateOfBirth",
        "applyTeacherDateOfBirth"
    ].forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.max =
                today;

        }

    });

}


/* =====================================================
   SET DEFAULT ADMISSION / JOINING DATE
===================================================== */

function setDefaultDates() {

    const today =
        getTodayDate();


    const admissionDateInput =
        document.getElementById(
            "admissionDate"
        );


    const teacherJoiningDateInput =
        document.getElementById(
            "teacherJoiningDate"
        );


    if (
        admissionDateInput &&
        !admissionDateInput.value
    ) {

        admissionDateInput.value =
            today;

    }


    if (
        teacherJoiningDateInput &&
        !teacherJoiningDateInput.value
    ) {

        teacherJoiningDateInput.value =
            today;

    }

}


/* =====================================================
   NORMALIZE PHONE INPUTS
===================================================== */

function initializePhoneInputs() {

    const phoneIds = [

        "phone",
        "studentPhone",
        "teacherPhone",
        "applyPhone",
        "applyTeacherPhone"

    ];


    phoneIds.forEach(id => {

        const input =
            document.getElementById(id);


        if (!input) {
            return;
        }


        if (
            input.dataset
                .phoneReady ===
            "true"
        ) {
            return;
        }


        input.dataset.phoneReady =
            "true";


        input.addEventListener(
            "input",
            function () {

                this.value =
                    normalizeDigits(
                        this.value
                    ).slice(
                        0,
                        11
                    );

            }
        );

    });

}


/* =====================================================
   NORMALIZE CNIC INPUTS
===================================================== */

function initializeCNICInputs() {

    const cnicIds = [

        "studentCNIC",
        "teacherCNIC",
        "applyCNIC",
        "applyTeacherCNIC"

    ];


    cnicIds.forEach(id => {

        const input =
            document.getElementById(id);


        if (!input) {
            return;
        }


        if (
            input.dataset
                .cnicReady ===
            "true"
        ) {
            return;
        }


        input.dataset.cnicReady =
            "true";


        input.addEventListener(
            "input",
            function () {

                this.value =
                    formatCNIC(
                        this.value
                    );

            }
        );

    });

}


/* =====================================================
   PREVENT DOUBLE FORM SUBMISSION
===================================================== */

function lockSubmitButton(
    button,
    locked
) {

    if (!button) {
        return;
    }


    button.disabled =
        Boolean(locked);


    button.setAttribute(
        "aria-busy",
        locked
            ? "true"
            : "false"
    );

}


/* =====================================================
   SAFE TEXT INPUT TRIM
===================================================== */

function trimTextInputs() {

    document
        .querySelectorAll(
            'input[type="text"], textarea'
        )
        .forEach(input => {

            input.addEventListener(
                "blur",
                function () {

                    this.value =
                        this.value.trim();

                }
            );

        });

}


/* =====================================================
   PREVENT ACCIDENTAL MODAL FORM SUBMIT
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                'button[type="button"]'
            );


        if (!button) {
            return;
        }


        if (button.disabled) {

            event.preventDefault();

        }

    }
);


/* =====================================================
   CHECK SUPABASE CONNECTION
===================================================== */

async function testSupabaseConnection() {

    if (!checkSupabase()) {

        console.error(
            "Supabase client is not available."
        );

        return false;

    }


    try {

        const {
            error
        } =
            await supabaseClient

                .from(
                    STUDENTS_TABLE
                )

                .select(
                    "id",
                    {
                        head: true,
                        count: "exact"
                    }
                );


        if (error) {

            console.warn(
                "Supabase connection/table check:",
                error.message
            );

            return false;

        }


        return true;


    } catch (error) {

        console.error(
            "Supabase connection error:",
            error
        );

        return false;

    }

}


/* =====================================================
   FORM AUTOCOMPLETE SAFETY
===================================================== */

function initializeFormAutocomplete() {

    document
        .querySelectorAll(
            'input[type="password"]'
        )
        .forEach(input => {

            if (
                !input.getAttribute(
                    "autocomplete"
                )
            ) {

                input.setAttribute(
                    "autocomplete",
                    "current-password"
                );

            }

        });

}


/* =====================================================
   PAGE-SPECIFIC BACKUP SECURITY
===================================================== */

function runFinalPageSecurityCheck() {

    const page =
        getCurrentPageName();


    const adminOnlyPages = [

        "dashboard.html",
        "students.html",
        "teachers.html",
        "approvals.html"

    ];


    if (
        adminOnlyPages.includes(page) &&
        getCurrentRole() !== "admin"
    ) {

        window.location.href =
            "index.html";

        return false;

    }


    return true;

}


/* =====================================================
   INITIALIZE FINAL HELPERS
===================================================== */

function initializeFinalHelpers() {

    setMaximumBirthDates();

    setDefaultDates();

    initializePhoneInputs();

    initializeCNICInputs();

    trimTextInputs();

    initializeFormAutocomplete();

    runFinalPageSecurityCheck();

}


/* =====================================================
   RUN FINAL HELPERS
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFinalHelpers
    );

} else {

    initializeFinalHelpers();

}


/* =====================================================
   FINAL SCRIPT MARKER
===================================================== */

console.log(
    "مدرسہ مینجمنٹ سسٹم: مرکزی اسکرپٹ لوڈ ہوگیا۔"
);


/* =====================================================
   END PART 14
   END OF SCRIPT.JS
===================================================== */

