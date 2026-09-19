/* =====================================================
   SCRIPT.JS
   PART 1 / 3

   مدرسہ شہناز اختر للبنات
   بنیادی نظام + SUPABASE + LOGIN + SECURITY
===================================================== */

"use strict";


/* =====================================================
   SUPABASE
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
            "Supabase لوڈ نہیں ہوا۔"
        );
    }

} catch (error) {

    console.error(
        "Supabase شروع کرنے میں خرابی:",
        error
    );
}


/* =====================================================
   TABLES
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


function getValue(id) {

    const element =
        getElement(id);

    return element
        ? safeString(element.value)
        : "";
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


function escapeHTML(value) {

    return safeString(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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
            "Supabase دستیاب نہیں ہے۔"
        );

        return false;
    }

    return true;
}


/* =====================================================
   DATE
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
   SESSION
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


function setStoredValue(
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


function getCurrentProfileId() {

    return safeString(
        getStoredValue(
            "profileId"
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

            sessionStorage.removeItem(
                key
            );

            localStorage.removeItem(
                key
            );
        }
    );
}


/* =====================================================
   LOGIN REDIRECT
===================================================== */

function redirectToLogin() {

    window.location.href =
        "login.html";
}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutUser(
    message = ""
) {

    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );

        inactivityTimer = null;
    }


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


/* =====================================================
   LOGIN REQUIRED
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


/* =====================================================
   ADMIN REQUIRED
===================================================== */

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
   HOME PAGE BUTTONS
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

    const studentApplyButton =
        getElement(
            "studentApplyButton"
        );

    const teacherApplyButton =
        getElement(
            "teacherApplyButton"
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


    if (studentApplyButton) {

        studentApplyButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "student-apply.html";
            }
        );
    }


    if (teacherApplyButton) {

        teacherApplyButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "teacher-apply.html";
            }
        );
    }
}


/* =====================================================
   PASSWORD SHOW / HIDE
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

    const message =
        getElement(
            "loginMessage"
        );

    const button =
        getElement(
            "loginButton"
        );

    const remember =
        Boolean(
            getElement(
                "rememberMe"
            )?.checked
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


    /*
       اہم:

       موجودہ profiles table میں:
       id
       full_name
       role
       status

       موجود ہیں۔

       username/password columns موجود نہیں ہیں۔

       اس لیے اصل محفوظ login کو
       Supabase Auth کے ذریعے کرنا ہوگا۔
    */


    try {

        if (button) {

            button.disabled = true;
        }


        /*
           username field میں فی الحال
           Supabase Auth email استعمال ہوگی۔
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        username,

                    password:
                        password

                });


        if (error) {

            throw error;
        }


        const user =
            data?.user;


        if (!user) {

            throw new Error(
                "User not returned."
            );
        }


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
                    user.id
                )
                .maybeSingle();


        if (profileError) {

            throw profileError;
        }


        if (!profile) {

            await supabaseClient
                .auth
                .signOut();

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

            await supabaseClient
                .auth
                .signOut();


            showMessage(
                message,
                "یہ اکاؤنٹ ابھی فعال نہیں ہے۔"
            );

            return;
        }


        const selectedRole =
            safeString(
                sessionStorage.getItem(
                    "selectedRole"
                )
            ).toLowerCase();


        const role =
            safeString(
                profile.role
            ).toLowerCase();


        if (
            selectedRole &&
            selectedRole !== role
        ) {

            await supabaseClient
                .auth
                .signOut();


            showMessage(
                message,
                "منتخب کردہ اکاؤنٹ کی قسم درست نہیں ہے۔"
            );

            return;
        }


        setStoredValue(
            "loggedIn",
            "true",
            remember
        );


        setStoredValue(
            "userRole",
            role,
            remember
        );


        setStoredValue(
            "username",
            profile.full_name ||
            username,
            remember
        );


        setStoredValue(
            "profileId",
            profile.id,
            remember
        );


        setStoredValue(
            "lastActivity",
            Date.now(),
            remember
        );


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
            "ای میل یا پاس ورڈ درست نہیں ہے۔"
        );


    } finally {

        if (button) {

            button.disabled = false;
        }
    }
}


/* =====================================================
   LOGIN PAGE
===================================================== */

function initializeLoginPage() {

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


    initializePasswordToggle();


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


    /*
       صرف FORM submit listener رکھا گیا ہے۔
       اس سے button click پر login دو بار نہیں چلے گا۔
    */

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
}


/* =====================================================
   LOGOUT BUTTON
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
   5 MINUTE INACTIVITY
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


    const remember =
        localStorage.getItem(
            "loggedIn"
        ) === "true";


    setStoredValue(
        "lastActivity",
        Date.now(),
        remember
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


function initializeInactivityProtection() {

    if (
        !isAuthenticated()
    ) {

        return;
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
   PART 1 INITIAL ROUTER SUPPORT
===================================================== */

function initializePartOneGlobalEvents() {

    initializeHomePage();

    initializeBackButtons();

    initializeLogoutButton();

    initializeInputFormatters();


    if (
        currentFile ===
        "login.html"
    ) {

        initializeLoginPage();
    }
}


/* =====================================================
   END PART 1 / 3

   PART 2 اسی کے فوراً نیچے paste کریں۔
   ابھی دوسرا script.js نہ بنائیں۔
===================================================== */


/* =====================================================
   SCRIPT.JS
   PART 2 / 3

   طالبات + اساتذہ
   ADD / EDIT / DELETE / SEARCH / DETAILS
===================================================== */


/* =====================================================
   STUDENTS STATE
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

    studentForm?.reset();

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

    studentForm?.reset();

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
   RESIDENCE
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


    card
        .querySelector(
            ".remove-mahram"
        )
        ?.addEventListener(
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

    if (
        mahrams.length < 1
    ) {

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
                    "محرم کی تمام معلومات مکمل کریں۔"
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
                    "محرم کا موبائل نمبر درست نہیں ہے۔"
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
                    "محرم کا شناختی کارڈ نمبر درست نہیں ہے۔"
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

    const residence =
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
            residence,

        previous_madrassa:
            getValue(
                "previousMadrassa"
            ) || null,

        transfer_date:
            getValue(
                "transferDate"
            ) || null,

        mahrams:
            residence === "ہاسٹل"
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
        "منتقلی" &&
        (
            !data.previous_madrassa ||
            !data.transfer_date
        )
    ) {

        return {
            valid: false,
            message:
                "منتقلی کے لیے سابقہ مدرسہ اور منتقلی کی تاریخ ضروری ہے۔"
        };
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
            "طالبات لوڈ کرنے میں خرابی:",
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
        students
            .map(
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
            )
            .join("");


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
            "طالبہ محفوظ کرنے میں خرابی:",
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
            "طالبہ حذف کرنے میں خرابی:",
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
            ? mahrams
                .map(
                    (mahram, index) => `

                        <p>

                            <strong>
                                محرم ${index + 1}:
                            </strong>

                            ${escapeHTML(mahram.name || "—")}
                            —
                            ${escapeHTML(mahram.relation || "—")}
                            —
                            ${escapeHTML(mahram.phone || "—")}

                        </p>
                    `
                )
                .join("")
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
   SEARCH STUDENTS
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

                const searchable = [

                    student.name,
                    student.father_name,
                    student.guardian_name,
                    student.admission_no,
                    student.phone,
                    student.cnic,
                    student.student_class

                ]
                    .map(safeString)
                    .join(" ")
                    .toLowerCase();


                return searchable.includes(
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


    studentDetailsOverlay
        ?.addEventListener(
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
   TEACHERS STATE
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


    setText(
        "teacherFormTitle",
        "👩‍🏫 نئے استاد کی معلومات"
    );


    setValue(
        "teacherStatus",
        "active"
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
            getValue(
                "teacherStatus"
            ) || "active"

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
            "اساتذہ لوڈ کرنے میں خرابی:",
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


    if (!teachers.length) {

        teacherList.innerHTML = `

            <div class="teacher-empty">
                ابھی کوئی استاد موجود نہیں۔
            </div>
        `;

        return;
    }


    teacherList.innerHTML =
        teachers
            .map(
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
            )
            .join("");


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


    if (!checkSupabase()) {
        return;
    }


    const button =
        getElement(
            "saveTeacherButton"
        );


    try {

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
            "استاد محفوظ کرنے میں خرابی:",
            error
        );


        showMessage(
            teacherFormMessage,
            "استاد کا ریکارڈ محفوظ نہیں ہو سکا۔"
        );


    } finally {

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

    setValue(
        "teacherStatus",
        teacher.status || "active"
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
            "استاد حذف کرنے میں خرابی:",
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
            <strong>قابلیت:</strong>
            ${escapeHTML(teacher.qualification || "—")}
        </p>

        <p>
            <strong>تقرری:</strong>
            ${escapeHTML(formatDate(teacher.joining_date))}
        </p>

        <p>
            <strong>حیثیت:</strong>
            ${
                safeString(
                    teacher.status
                ).toLowerCase() === "active"
                    ? "فعال"
                    : "غیر فعال"
            }
        </p>

        <p>
            <strong>پتہ:</strong>
            ${escapeHTML(teacher.address || "—")}
        </p>
    `;


    teacherDetailsOverlay
        .classList
        .remove(
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


    teacherDetailsOverlay
        .classList
        .add(
            "hidden"
        );


    document.body.classList.remove(
        "modal-open"
    );
}


/* =====================================================
   SEARCH TEACHERS
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

                const searchable = [

                    teacher.name,
                    teacher.father_name,
                    teacher.teacher_code,
                    teacher.phone,
                    teacher.cnic,
                    teacher.qualification

                ]
                    .map(safeString)
                    .join(" ")
                    .toLowerCase();


                return searchable.includes(
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


    teacherDetailsOverlay
        ?.addEventListener(
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
   ESCAPE KEY
===================================================== */

function initializeModalKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {

                return;
            }


            closeStudentDetails();

            closeTeacherDetails();
        }
    );
}


/* =====================================================
   END PART 2 / 3

   PART 3 اسی کے فوراً نیچے paste کریں۔
===================================================== */
/* =====================================================
   SCRIPT.JS
   PART 3 / 3

   DASHBOARD + ATTENDANCE + GLOBAL EVENTS
   PAGE INITIALIZATION
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
                ? count
                : 0;

    } catch (error) {

        console.error(
            "طالبات کی تعداد حاصل کرنے میں خرابی:",
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
                ? count
                : 0;

    } catch (error) {

        console.error(
            "اساتذہ کی تعداد حاصل کرنے میں خرابی:",
            error
        );

        element.textContent = "0";
    }
}


/* =====================================================
   DASHBOARD INITIALIZATION
===================================================== */

async function initializeDashboardPage() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }

    await Promise.allSettled([

        updateDashboardStudentCount(),

        updateDashboardTeacherCount()

    ]);
}


/* =====================================================
   ATTENDANCE STATE
===================================================== */

let attendanceStudents = [];

let attendanceRecords = [];


/* =====================================================
   ATTENDANCE ELEMENTS
===================================================== */

const attendanceForm =
    getElement("attendanceForm");

const attendanceList =
    getElement("attendanceList");

const attendanceMessage =
    getElement("attendanceMessage");

const attendanceClass =
    getElement("attendanceClass");

const attendanceDate =
    getElement("attendanceDate");

const attendancePeriod =
    getElement("attendancePeriod");


/* =====================================================
   SET TODAY DATE
===================================================== */

function setAttendanceToday() {

    if (
        !attendanceDate ||
        attendanceDate.value
    ) {
        return;
    }

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );

    attendanceDate.value =
        `${year}-${month}-${day}`;
}


/* =====================================================
   LOAD ATTENDANCE STUDENTS
===================================================== */

async function loadAttendanceStudents() {

    if (
        !attendanceList ||
        !checkSupabase()
    ) {
        return;
    }

    const selectedClass =
        safeString(
            attendanceClass?.value
        );

    if (!selectedClass) {

        attendanceStudents = [];

        attendanceList.innerHTML = `

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
                .from(STUDENTS_TABLE)
                .select(
                    "id,name,admission_no,student_class"
                )
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

        attendanceStudents =
            data || [];

        await loadExistingAttendance();

    } catch (error) {

        console.error(
            "حاضری کے لیے طالبات لوڈ کرنے میں خرابی:",
            error
        );

        attendanceList.innerHTML = `

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

    if (!attendanceList) {
        return;
    }

    const selectedDate =
        safeString(
            attendanceDate?.value
        );

    const selectedPeriod =
        Number(
            attendancePeriod?.value
        );

    if (
        !selectedDate ||
        !selectedPeriod
    ) {

        attendanceRecords = [];

        renderAttendanceStudents();

        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(ATTENDANCE_TABLE)
                .select("*")
                .eq(
                    "attendance_date",
                    selectedDate
                )
                .eq(
                    "class_period",
                    selectedPeriod
                );

        if (error) {
            throw error;
        }

        attendanceRecords =
            data || [];

        renderAttendanceStudents();

    } catch (error) {

        console.error(
            "پہلے سے موجود حاضری لوڈ کرنے میں خرابی:",
            error
        );

        attendanceRecords = [];

        renderAttendanceStudents();
    }
}


/* =====================================================
   GET EXISTING STATUS
===================================================== */

function getStudentAttendanceStatus(
    studentId
) {

    const record =
        attendanceRecords.find(
            item =>
                String(
                    item.student_id
                ) ===
                String(
                    studentId
                )
        );

    return record
        ? safeString(
            record.status
        )
        : "";
}


/* =====================================================
   RENDER ATTENDANCE STUDENTS
===================================================== */

function renderAttendanceStudents() {

    if (!attendanceList) {
        return;
    }

    if (
        !attendanceStudents.length
    ) {

        attendanceList.innerHTML = `

            <div class="empty-students">
                اس کلاس میں کوئی طالبہ موجود نہیں۔
            </div>
        `;

        return;
    }

    attendanceList.innerHTML =
        attendanceStudents
            .map(
                student => {

                    const status =
                        getStudentAttendanceStatus(
                            student.id
                        );

                    return `

                        <div
                            class="attendance-card"
                            data-student-id="${escapeHTML(student.id)}"
                        >

                            <div class="attendance-student-info">

                                <strong>
                                    ${escapeHTML(student.name)}
                                </strong>

                                <span>
                                    داخلہ نمبر:
                                    ${escapeHTML(student.admission_no || "—")}
                                </span>

                            </div>


                            <div class="attendance-options">

                                <label>

                                    <input
                                        type="radio"
                                        name="attendance_${escapeHTML(student.id)}"
                                        value="present"
                                        ${status === "present" ? "checked" : ""}
                                    >

                                    حاضر

                                </label>


                                <label>

                                    <input
                                        type="radio"
                                        name="attendance_${escapeHTML(student.id)}"
                                        value="absent"
                                        ${status === "absent" ? "checked" : ""}
                                    >

                                    غیر حاضر

                                </label>


                                <label>

                                    <input
                                        type="radio"
                                        name="attendance_${escapeHTML(student.id)}"
                                        value="leave"
                                        ${status === "leave" ? "checked" : ""}
                                    >

                                    رخصت

                                </label>

                            </div>


                            <textarea
                                class="attendance-note"
                                placeholder="نوٹ"
                            >${escapeHTML(
                                attendanceRecords.find(
                                    item =>
                                        String(
                                            item.student_id
                                        ) ===
                                        String(
                                            student.id
                                        )
                                )?.note || ""
                            )}</textarea>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =====================================================
   MARK ALL PRESENT
===================================================== */

function markAllPresent() {

    if (!attendanceList) {
        return;
    }

    attendanceList
        .querySelectorAll(
            'input[type="radio"][value="present"]'
        )
        .forEach(
            radio => {

                radio.checked = true;
            }
        );
}


/* =====================================================
   GET TEACHER ID
===================================================== */

async function getLoggedInTeacherId() {

    const userId =
        await getCurrentUserId();

    if (!userId) {
        return null;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(TEACHERS_TABLE)
                .select("id")
                .eq(
                    "user_id",
                    userId
                )
                .maybeSingle();

        if (error) {
            throw error;
        }

        return data?.id || null;

    } catch (error) {

        console.error(
            "استاد کی شناخت حاصل کرنے میں خرابی:",
            error
        );

        return null;
    }
}


/* =====================================================
   SAVE ATTENDANCE
===================================================== */

async function saveAttendance(
    event
) {

    event?.preventDefault();

    if (!checkSupabase()) {
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
        Number(
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
        selectedPeriod < 1 ||
        selectedPeriod > 6
    ) {

        showMessage(
            attendanceMessage,
            "پیریڈ 1 سے 6 تک ہونا چاہیے۔"
        );

        return;
    }

    if (
        !attendanceStudents.length
    ) {

        showMessage(
            attendanceMessage,
            "اس کلاس میں کوئی طالبہ موجود نہیں۔"
        );

        return;
    }

    const role =
        getCurrentRole();

    let teacherId = null;

    if (role === "teacher") {

        teacherId =
            await getLoggedInTeacherId();

        if (!teacherId) {

            showMessage(
                attendanceMessage,
                "استاد کا ریکارڈ نہیں ملا۔"
            );

            return;
        }
    }

    const userId =
        await getCurrentUserId();

    const rows = [];

    for (
        const student of attendanceStudents
    ) {

        const card =
            attendanceList
                ?.querySelector(
                    `[data-student-id="${student.id}"]`
                );

        if (!card) {
            continue;
        }

        const checked =
            card.querySelector(
                'input[type="radio"]:checked'
            );

        if (!checked) {

            showMessage(
                attendanceMessage,
                `${student.name} کی حاضری منتخب کریں۔`
            );

            return;
        }

        const note =
            safeString(
                card.querySelector(
                    ".attendance-note"
                )?.value
            );

        rows.push({

            student_id:
                student.id,

            teacher_id:
                teacherId,

            attendance_date:
                selectedDate,

            class_period:
                selectedPeriod,

            status:
                checked.value,

            note:
                note || null,

            created_by:
                userId,

            student_class:
                selectedClass,

            student_name:
                student.name,

            period_no:
                selectedPeriod,

            marked_by:
                role

        });
    }

    if (!rows.length) {

        showMessage(
            attendanceMessage,
            "حاضری محفوظ کرنے کے لیے کوئی ریکارڈ موجود نہیں۔"
        );

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

        /*
           پہلے اسی تاریخ، کلاس اور پیریڈ کی
           موجودہ حاضری حذف کی جاتی ہے۔
        */

        let deleteQuery =
            supabaseClient
                .from(ATTENDANCE_TABLE)
                .delete()
                .eq(
                    "attendance_date",
                    selectedDate
                )
                .eq(
                    "class_period",
                    selectedPeriod
                )
                .eq(
                    "student_class",
                    selectedClass
                );

        if (
            role === "teacher" &&
            teacherId
        ) {

            deleteQuery =
                deleteQuery.eq(
                    "teacher_id",
                    teacherId
                );
        }

        const {
            error: deleteError
        } =
            await deleteQuery;

        if (deleteError) {
            throw deleteError;
        }

        const {
            error: insertError
        } =
            await supabaseClient
                .from(ATTENDANCE_TABLE)
                .insert(rows);

        if (insertError) {
            throw insertError;
        }

        showMessage(
            attendanceMessage,
            "حاضری کامیابی سے محفوظ ہو گئی۔",
            "success"
        );

        await loadExistingAttendance();

    } catch (error) {

        console.error(
            "حاضری محفوظ کرنے میں خرابی:",
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
   INITIALIZE ATTENDANCE PAGE
===================================================== */

async function initializeAttendancePage() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }

    const role =
        getCurrentRole();

    if (
        role !== "admin" &&
        role !== "teacher"
    ) {

        redirectToDashboard();

        return;
    }

    setAttendanceToday();

    attendanceClass
        ?.addEventListener(
            "change",
            loadAttendanceStudents
        );

    attendanceDate
        ?.addEventListener(
            "change",
            loadExistingAttendance
        );

    attendancePeriod
        ?.addEventListener(
            "change",
            loadExistingAttendance
        );

    getElement(
        "markAllPresent"
    )?.addEventListener(
        "click",
        markAllPresent
    );

    attendanceForm
        ?.addEventListener(
            "submit",
            saveAttendance
        );

    if (
        attendanceClass?.value
    ) {

        await loadAttendanceStudents();
    }
}


/* =====================================================
   PHONE INPUT FORMATTERS
===================================================== */

function initializePhoneInputs() {

    const ids = [

        "phone",

        "teacherPhone"

    ];

    ids.forEach(
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
   CNIC INPUT FORMATTERS
===================================================== */

function initializeCNICInputs() {

    const ids = [

        "studentCNIC",

        "teacherCNIC"

    ];

    ids.forEach(
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
}


/* =====================================================
   PASSWORD EYE BUTTONS
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
                            button.getAttribute(
                                "data-password-toggle"
                            );

                        const input =
                            getElement(
                                targetId
                            );

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
   GLOBAL BUTTON ROUTING
===================================================== */

function initializeGlobalButtons() {

    /*
       HTML میں اگر data-page استعمال کیا گیا ہو
       تو یہ تمام navigation buttons چلاتا ہے۔
    */

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

                        if (page) {

                            window.location.href =
                                page;
                        }
                    }
                );
            }
        );


    /*
       data-back button
    */

    document
        .querySelectorAll(
            "[data-back]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        window.history.back();
                    }
                );
            }
        );


    /*
       logout buttons
    */

    document
        .querySelectorAll(
            ".logout-button, [data-logout]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await logoutUser();
                    }
                );
            }
        );
}


/* =====================================================
   PREVENT DOUBLE FORM SUBMIT
===================================================== */

function initializeFormSafety() {

    document
        .querySelectorAll("form")
        .forEach(
            form => {

                form.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key === "Enter" &&
                            event.target?.tagName ===
                            "TEXTAREA"
                        ) {

                            return;
                        }
                    }
                );
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
            "JavaScript خرابی:",
            event.error ||
            event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Promise خرابی:",
            event.reason
        );
    }
);


/* =====================================================
   PAGE ROUTER
===================================================== */

async function initializeCurrentPage() {

    const page =
        getCurrentPageName();


    /*
       ہر صفحے کے عمومی فنکشن
    */

    initializePasswordToggles();

    initializePhoneInputs();

    initializeCNICInputs();

    initializeGlobalButtons();

    initializeFormSafety();

    initializeModalKeyboard();


    /*
       LOGIN
    */

    if (
        page === "index.html" ||
        page === "login.html" ||
        page === ""
    ) {

        if (
            typeof initializeLoginPage ===
            "function"
        ) {

            await initializeLoginPage();
        }

        return;
    }


    /*
       PUBLIC STUDENT APPLICATION
    */

    if (
        page ===
        "student-application.html"
    ) {

        if (
            typeof initializeStudentApplicationPage ===
            "function"
        ) {

            await initializeStudentApplicationPage();
        }

        return;
    }


    /*
       PUBLIC TEACHER APPLICATION
    */

    if (
        page ===
        "teacher-application.html"
    ) {

        if (
            typeof initializeTeacherApplicationPage ===
            "function"
        ) {

            await initializeTeacherApplicationPage();
        }

        return;
    }


    /*
       باقی صفحات کے لیے login ضروری
    */

    if (!isAuthenticated()) {

        redirectToLogin();

        return;
    }


    /*
       DASHBOARD
    */

    if (
        page === "dashboard.html" ||
        page === "admin.html"
    ) {

        await initializeDashboardPage();

        return;
    }


    /*
       STUDENTS
    */

    if (
        page === "students.html"
    ) {

        await initializeStudentsPage();

        return;
    }


    /*
       TEACHERS
    */

    if (
        page === "teachers.html"
    ) {

        await initializeTeachersPage();

        return;
    }


    /*
       ATTENDANCE
    */

    if (
        page === "attendance.html"
    ) {

        await initializeAttendancePage();

        return;
    }


    /*
       TEACHER DASHBOARD
    */

    if (
        page === "teacher.html"
    ) {

        if (
            getCurrentRole() !==
            "teacher"
        ) {

            redirectToDashboard();

            return;
        }

        if (
            typeof initializeTeacherDashboard ===
            "function"
        ) {

            await initializeTeacherDashboard();
        }

        return;
    }


    /*
       STUDENT DASHBOARD
    */

    if (
        page === "student.html"
    ) {

        if (
            getCurrentRole() !==
            "student"
        ) {

            redirectToDashboard();

            return;
        }

        if (
            typeof initializeStudentDashboard ===
            "function"
        ) {

            await initializeStudentDashboard();
        }

        return;
    }
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
                "سسٹم شروع کرنے میں خرابی:",
                error
            );
        }
    }
);


/* =====================================================
   GLOBAL FUNCTIONS FOR HTML onclick COMPATIBILITY
===================================================== */

window.openStudentForm =
    openStudentForm;

window.closeStudentForm =
    closeStudentForm;

window.addMahramField =
    addMahramField;

window.updateTransferFields =
    updateTransferFields;

window.updateResidenceFields =
    updateResidenceFields;

window.showStudentDetails =
    showStudentDetails;

window.closeStudentDetails =
    closeStudentDetails;

window.editStudent =
    editStudent;

window.deleteStudent =
    deleteStudent;


window.openTeacherForm =
    openTeacherForm;

window.closeTeacherForm =
    closeTeacherForm;

window.showTeacherDetails =
    showTeacherDetails;

window.closeTeacherDetails =
    closeTeacherDetails;

window.editTeacher =
    editTeacher;

window.deleteTeacher =
    deleteTeacher;


window.markAllPresent =
    markAllPresent;

window.loadAttendanceStudents =
    loadAttendanceStudents;

window.saveAttendance =
    saveAttendance;


/* =====================================================
   END SCRIPT.JS
===================================================== */
