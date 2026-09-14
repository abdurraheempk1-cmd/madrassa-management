/* =====/* =========================================================
   MASTER SCRIPT.JS
   PART 1
   CORE + SUPABASE + HOME + LOGIN + SESSION + DASHBOARD
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
       TABLE NAMES
    ===================================================== */

    const STUDENTS_TABLE =
        "Students";

    const TEACHERS_TABLE =
        "Teachers";


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


        return String(
            value
        ).trim();
    }


    function getElement(id) {

        return document.getElementById(
            id
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
            safeString(
                message
            );


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


        element.textContent =
            "";

        element.style.display =
            "none";
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
            safeString(
                role
            )
        );


        localStorage.setItem(
            SESSION_KEYS.userId,
            safeString(
                userId
            )
        );


        localStorage.setItem(
            SESSION_KEYS.username,
            safeString(
                username
            )
        );


        localStorage.setItem(
            SESSION_KEYS.remember,
            remember
                ? "true"
                : "false"
        );


        localStorage.setItem(
            SESSION_KEYS.lastActivity,
            String(
                Date.now()
            )
        );
    }


    function clearSession() {

        Object.values(
            SESSION_KEYS
        ).forEach(
            function (key) {

                localStorage.removeItem(
                    key
                );

            }
        );
    }


    function logout() {

        clearSession();

        sessionStorage.clear();


        window.location.href =
            "index.html";
    }


    /* =====================================================
       ROLE FROM URL
    ===================================================== */

    function getRequestedRole() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const role =
            safeString(
                params.get(
                    "role"
                )
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
            currentPage !==
            "index.html"
        ) {

            return;
        }


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
            function () {

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


                toggle.setAttribute(
                    "aria-label",
                    hidden
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


        if (
            !Array.isArray(
                data
            ) ||
            data.length === 0
        ) {

            return null;
        }


        return {

            id:
                data[0].admin_id,

            username:
                data[0].admin_username,

            status:
                data[0].auth_status

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


        if (!data) {

            return null;
        }


        return {

            id:
                data.teacher_id,

            accountId:
                data.account_id,

            username:
                data.username,

            status:
                data.authorization_status

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


        if (!data) {

            return null;
        }


        return {

            id:
                data.student_id,

            accountId:
                data.account_id,

            username:
                data.username,

            status:
                data.authorization_status

        };
    }


    /* =====================================================
       LOGIN PAGE
    ===================================================== */

    function initializeLoginPage() {

        if (
            currentPage !==
            "login.html"
        ) {

            return;
        }


        const form =
            getElement(
                "loginForm"
            );

        const usernameInput =
            getElement(
                "username"
            );

        const passwordInput =
            getElement(
                "password"
            );

        const rememberMe =
            getElement(
                "rememberMe"
            );

        const loginButton =
            getElement(
                "loginButton"
            );

        const backButton =
            getElement(
                "backButton"
            );

        const loginMessage =
            getElement(
                "loginMessage"
            );


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
                        passwordInput.value ||
                        ""
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


                if (usernameInput) {

                    usernameInput.focus();
                }


                return;
            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "پاس ورڈ درج کریں۔"
                );


                if (passwordInput) {

                    passwordInput.focus();
                }


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
                    requestedRole ===
                    "admin"
                ) {

                    user =
                        await loginAdmin(
                            username,
                            password
                        );


                } else if (
                    requestedRole ===
                    "teacher"
                ) {

                    user =
                        await loginTeacher(
                            username,
                            password
                        );


                } else if (
                    requestedRole ===
                    "student"
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
                        "صارف نام یا پاس ورڈ غلط ہے، یا اکاؤنٹ ابھی منظور نہیں ہوا۔"
                    );

                    return;
                }


                if (
                    safeString(
                        user.status
                    ).toLowerCase() !==
                    "approved"
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
                    user.username,
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


        if (form) {

            form.addEventListener(
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
       ADMIN ONLY
    ===================================================== */

    function requireAdmin() {

        if (
            !isAuthenticated() ||
            getCurrentRole() !==
            "admin"
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
                    .from(
                        tableName
                    )
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


    /* =====================================================
       DASHBOARD
    ===================================================== */

    async function initializeDashboardPage() {

        if (
            currentPage !==
            "dashboard.html"
        ) {

            return;
        }


        if (!protectPage()) {

            return;
        }


        const welcomeMessage =
            getElement(
                "welcomeMessage"
            );


        const username =
            safeString(
                localStorage.getItem(
                    SESSION_KEYS.username
                )
            );


        if (
            welcomeMessage &&
            username
        ) {

            welcomeMessage.textContent =
                "خوش آمدید، " +
                username;
        }


        const studentTotal =
            getElement(
                "studentTotal"
            );

        const teacherTotal =
            getElement(
                "teacherTotal"
            );

        const hostelTotal =
            getElement(
                "hostelTotal"
            );

        const classTotal =
            getElement(
                "classTotal"
            );


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
                )

            ]);


        if (studentTotal) {

            studentTotal.textContent =
                results[0].status ===
                "fulfilled"
                    ? results[0].value
                    : 0;
        }


        if (teacherTotal) {

            teacherTotal.textContent =
                results[1].status ===
                "fulfilled"
                    ? results[1].value
                    : 0;
        }


        if (hostelTotal) {

            hostelTotal.textContent =
                results[2].status ===
                "fulfilled"
                    ? results[2].value
                    : 0;
        }


        if (classTotal) {

            classTotal.textContent =
                "0";
        }


        const studentsMenu =
            getElement(
                "studentsMenu"
            );

        const teachersMenu =
            getElement(
                "teachersMenu"
            );


        if (studentsMenu) {

            studentsMenu.onclick =
                function () {

                    window.location.href =
                        "students.html";
                };
        }


        if (teachersMenu) {

            teachersMenu.onclick =
                function () {

                    window.location.href =
                        "teachers.html";
                };
        }
    }


    /* =====================================================
       GLOBAL BACK TO DASHBOARD
    ===================================================== */

    const backToDashboard =
        getElement(
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
       GLOBAL LOGOUT
    ===================================================== */

    const logoutButton =
        getElement(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    /* =====================================================
       START
    ===================================================== */

    initializeHomePage();

    initializeLoginPage();

    await initializeDashboardPage();


    /* =====================================================
       PART 1 ENDS HERE

       DO NOT ADD:
       });

       PART 2 MUST BE PASTED DIRECTLY BELOW THIS LINE.
    ===================================================== */

                          /* =========================================================
   MASTER SCRIPT.JS
   PART 2
   COMPLETE STUDENT MODULE
========================================================= */


/* =====================================================
   COMMON HELPERS
===================================================== */

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


function isUrduName(value) {

    const text =
        safeString(value);


    if (!text) {
        return false;
    }


    return /^[\u0600-\u06FF\s]+$/u.test(
        text
    );
}


function getRecordValue(
    record,
    keys,
    fallback = ""
) {

    if (!record) {
        return fallback;
    }


    const list =
        Array.isArray(keys)
            ? keys
            : [keys];


    for (const key of list) {

        if (
            Object.prototype.hasOwnProperty.call(
                record,
                key
            ) &&
            record[key] !== null &&
            record[key] !== undefined
        ) {

            return record[key];
        }
    }


    return fallback;
}


/* =====================================================
   STUDENT VARIABLES
===================================================== */

let studentsCache = [];

let editingStudentId = null;

let isSavingStudent = false;

let isDeletingStudent = false;


const studentFormContainer =
    getElement(
        "studentFormContainer"
    );

const studentForm =
    getElement(
        "studentForm"
    );

const studentFormTitle =
    getElement(
        "formTitle"
    );

const studentFormMessage =
    getElement(
        "studentFormMessage"
    );

const showStudentFormButton =
    getElement(
        "showStudentForm"
    );

const cancelStudentFormButton =
    getElement(
        "cancelStudentForm"
    );

const saveStudentButton =
    getElement(
        "saveStudentButton"
    );

const studentCount =
    getElement(
        "studentCount"
    );

const studentsList =
    getElement(
        "studentsList"
    );

const studentSearch =
    getElement(
        "studentSearch"
    );

const admissionType =
    getElement(
        "admissionType"
    );

const previousMadrassaGroup =
    getElement(
        "previousMadrassaGroup"
    );

const transferDateGroup =
    getElement(
        "transferDateGroup"
    );

const residenceType =
    getElement(
        "residenceType"
    );

const mahramSection =
    getElement(
        "mahramSection"
    );

const mahramList =
    getElement(
        "mahramList"
    );

const addMahramButton =
    getElement(
        "addMahram"
    );

const studentDetailsOverlay =
    getElement(
        "studentDetailsOverlay"
    );

const studentDetailsContent =
    getElement(
        "studentDetailsContent"
    );

const closeStudentDetailsButton =
    getElement(
        "closeStudentDetails"
    );


/* =====================================================
   STUDENT FIELD VALUE
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
        admissionType.value ===
        "منتقلی";


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
            getElement(
                "previousMadrassa"
            );

        const transferDate =
            getElement(
                "transferDate"
            );


        if (previousMadrassa) {
            previousMadrassa.value = "";
        }


        if (transferDate) {
            transferDate.value = "";
        }
    }
}


/* =====================================================
   MAHRAM RELATIONS
===================================================== */

const mahramRelations = [

    {
        value: "والد",
        label: "والد"
    },

    {
        value: "بھائی",
        label: "بھائی"
    },

    {
        value: "بیٹا",
        label: "بیٹا"
    },

    {
        value: "شوہر",
        label: "شوہر"
    },

    {
        value: "دادا",
        label: "دادا"
    },

    {
        value: "نانا",
        label: "نانا"
    },

    {
        value: "چچا",
        label: "چچا"
    },

    {
        value: "ماموں",
        label: "ماموں"
    },

    {
        value: "دیگر",
        label: "دیگر"
    }

];


/* =====================================================
   CREATE MAHRAM ROW
===================================================== */

function createMahramRow(
    data = {}
) {

    if (!mahramList) {
        return;
    }


    const existingRows =
        mahramList.querySelectorAll(
            ".mahram-row"
        );


    if (existingRows.length >= 5) {

        alert(
            "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔"
        );

        return;
    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "mahram-row mahram-card";


    const relationOptions =
        mahramRelations
            .map(function (item) {

                const selected =
                    safeString(
                        data.relation
                    ) === item.value
                        ? "selected"
                        : "";


                return `
                    <option
                        value="${escapeHtml(item.value)}"
                        ${selected}
                    >
                        ${escapeHtml(item.label)}
                    </option>
                `;
            })
            .join("");


    row.innerHTML = `

        <div class="mahram-header">

            <strong>
                محرم کی معلومات
            </strong>

            <button
                type="button"
                class="remove-mahram"
                data-remove-mahram
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
                    data-mahram-name
                    placeholder="محرم کا نام"
                    value="${escapeHtml(data.name || "")}"
                >

            </div>


            <div class="form-group">

                <label>
                    رشتہ
                </label>

                <select
                    data-mahram-relation
                >

                    <option value="">
                        منتخب کریں
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
                    inputmode="numeric"
                    maxlength="11"
                    data-mahram-phone
                    placeholder="03XXXXXXXXX"
                    value="${escapeHtml(
                        normalizePhone(
                            data.phone || ""
                        )
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
                    data-mahram-cnic
                    placeholder="00000-0000000-0"
                    value="${escapeHtml(
                        formatCNIC(
                            data.cnic || ""
                        )
                    )}"
                >

            </div>


        </div>

    `;


    mahramList.appendChild(
        row
    );


    const phoneField =
        row.querySelector(
            "[data-mahram-phone]"
        );


    const cnicField =
        row.querySelector(
            "[data-mahram-cnic]"
        );


    const removeButton =
        row.querySelector(
            "[data-remove-mahram]"
        );


    if (phoneField) {

        phoneField.addEventListener(
            "input",
            function () {

                this.value =
                    normalizePhone(
                        this.value
                    );
            }
        );
    }


    if (cnicField) {

        cnicField.addEventListener(
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

                updateMahramRemoveButtons();
            }
        );
    }


    updateMahramRemoveButtons();
}


/* =====================================================
   MAHRAM REMOVE BUTTONS
===================================================== */

function updateMahramRemoveButtons() {

    if (!mahramList) {
        return;
    }


    const rows =
        mahramList.querySelectorAll(
            ".mahram-row"
        );


    rows.forEach(
        function (row) {

            const button =
                row.querySelector(
                    "[data-remove-mahram]"
                );


            if (!button) {
                return;
            }


            button.style.display =
                rows.length > 1
                    ? "inline-block"
                    : "none";
        }
    );
}


/* =====================================================
   GET MAHRAMS
===================================================== */

function getMahrams() {

    if (!mahramList) {
        return [];
    }


    return Array.from(
        mahramList.querySelectorAll(
            ".mahram-row"
        )
    )
        .map(
            function (row) {

                const name =
                    row.querySelector(
                        "[data-mahram-name]"
                    );

                const relation =
                    row.querySelector(
                        "[data-mahram-relation]"
                    );

                const phone =
                    row.querySelector(
                        "[data-mahram-phone]"
                    );

                const cnic =
                    row.querySelector(
                        "[data-mahram-cnic]"
                    );


                return {

                    name:
                        name
                            ? safeString(
                                name.value
                            )
                            : "",

                    relation:
                        relation
                            ? safeString(
                                relation.value
                            )
                            : "",

                    phone:
                        phone
                            ? normalizePhone(
                                phone.value
                            )
                            : "",

                    cnic:
                        cnic
                            ? canonicalCNIC(
                                cnic.value
                            )
                            : ""

                };
            }
        )
        .filter(
            function (item) {

                return (
                    item.name ||
                    item.relation ||
                    item.phone ||
                    item.cnic
                );
            }
        );
}


/* =====================================================
   LOAD MAHRAMS
===================================================== */

function loadMahrams(
    mahrams = []
) {

    if (!mahramList) {
        return;
    }


    mahramList.innerHTML = "";


    if (
        Array.isArray(mahrams) &&
        mahrams.length
    ) {

        mahrams
            .slice(0, 5)
            .forEach(
                function (mahram) {

                    createMahramRow(
                        mahram
                    );
                }
            );

    } else {

        createMahramRow();
    }


    updateMahramRemoveButtons();
}


/* =====================================================
   MAHRAM SECTION
===================================================== */

function updateMahramSection() {

    if (
        !residenceType ||
        !mahramSection
    ) {
        return;
    }


    const hostel =
        residenceType.value ===
        "ہاسٹل";


    mahramSection.classList.toggle(
        "hidden",
        !hostel
    );


    if (hostel) {

        if (
            mahramList &&
            !mahramList.querySelector(
                ".mahram-row"
            )
        ) {

            createMahramRow();
        }

    } else if (mahramList) {

        mahramList.innerHTML = "";
    }
}


/* =====================================================
   STUDENT INPUT FORMATTING
===================================================== */

function initializeStudentFormatting() {

    const phone =
        getElement(
            "phone"
        );

    const cnic =
        getElement(
            "studentCNIC"
        );


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

    const residence =
        getStudentValue(
            "residenceType"
        );


    const hostel =
        residence === "ہاسٹل";


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
            residence || null,

        previous_madrassa:
            getStudentValue(
                "admissionType"
            ) === "منتقلی"
                ? (
                    getStudentValue(
                        "previousMadrassa"
                    ) || null
                )
                : null,

        transfer_date:
            getStudentValue(
                "admissionType"
            ) === "منتقلی"
                ? (
                    getStudentValue(
                        "transferDate"
                    ) || null
                )
                : null,

        mahrams:
            hostel
                ? getMahrams()
                : []

    };
}


/* =====================================================
   STUDENT VALIDATION
===================================================== */

function validateStudentForm() {

    const data =
        getStudentFormData();


    if (!data.admission_type) {

        return "داخلہ کی قسم منتخب کریں۔";
    }


    if (!data.admission_no) {

        return "داخلہ نمبر درج کریں۔";
    }


    if (!data.name) {

        return "طالبہ کا نام درج کریں۔";
    }


    if (!isUrduName(data.name)) {

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


    if (!data.guardian_name) {

        return "سرپرست کا نام درج کریں۔";
    }


    if (
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
        data.phone.length !== 11
    ) {

        return "موبائل نمبر 11 ہندسوں پر مشتمل ہونا چاہیے۔";
    }


    if (
        !data.phone.startsWith("03")
    ) {

        return "موبائل نمبر 03 سے شروع ہونا چاہیے۔";
    }


    if (!data.date_of_birth) {

        return "تاریخ پیدائش منتخب کریں۔";
    }


    if (!data.student_class) {

        return "کلاس منتخب کریں۔";
    }


    if (!data.admission_date) {

        return "داخلہ کی تاریخ منتخب کریں۔";
    }


    if (!data.address) {

        return "مکمل پتہ درج کریں۔";
    }


    if (!data.residence_type) {

        return "رہائش کی قسم منتخب کریں۔";
    }


    if (
        data.admission_type ===
        "منتقلی"
    ) {

        if (!data.previous_madrassa) {

            return "سابقہ مدرسے کا نام درج کریں۔";
        }


        if (!data.transfer_date) {

            return "منتقلی کی تاریخ منتخب کریں۔";
        }
    }


    if (
        data.residence_type ===
        "ہاسٹل"
    ) {

        const mahrams =
            data.mahrams;


        if (!mahrams.length) {

            return "ہاسٹل طالبہ کے لیے کم از کم ایک محرم ضروری ہے۔";
        }


        if (mahrams.length > 5) {

            return "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔";
        }


        for (
            let index = 0;
            index < mahrams.length;
            index++
        ) {

            const mahram =
                mahrams[index];


            if (!mahram.name) {

                return (
                    "محرم نمبر " +
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
                    "محرم نمبر " +
                    (index + 1) +
                    " کا نام اردو میں درج کریں۔"
                );
            }


            if (!mahram.relation) {

                return (
                    "محرم نمبر " +
                    (index + 1) +
                    " کا رشتہ منتخب کریں۔"
                );
            }


            if (
                !mahram.phone ||
                mahram.phone.length !== 11
            ) {

                return (
                    "محرم نمبر " +
                    (index + 1) +
                    " کا موبائل نمبر 11 ہندسوں کا ہونا چاہیے۔"
                );
            }


            if (
                !mahram.phone.startsWith(
                    "03"
                )
            ) {

                return (
                    "محرم نمبر " +
                    (index + 1) +
                    " کا موبائل نمبر 03 سے شروع ہونا چاہیے۔"
                );
            }


            if (
                !mahram.cnic ||
                mahram.cnic.length !== 13
            ) {

                return (
                    "محرم نمبر " +
                    (index + 1) +
                    " کا شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔"
                );
            }
        }
    }


    return "";
}


/* =====================================================
   DUPLICATE CHECK
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
            .from(
                STUDENTS_TABLE
            )
            .select(
                "id, admission_no, cnic, phone"
            );


    if (error) {
        throw error;
    }


    const duplicate =
        (rows || []).find(
            function (row) {

                if (
                    currentId !== null &&
                    String(row.id) ===
                    String(currentId)
                ) {

                    return false;
                }


                const sameAdmission =
                    safeString(
                        row.admission_no
                    ) ===
                    safeString(
                        data.admission_no
                    );


                const sameCNIC =
                    canonicalCNIC(
                        row.cnic
                    ) ===
                    canonicalCNIC(
                        data.cnic
                    );


                const samePhone =
                    normalizePhone(
                        row.phone
                    ) ===
                    normalizePhone(
                        data.phone
                    );


                return (
                    sameAdmission ||
                    sameCNIC ||
                    samePhone
                );
            }
        );


    if (!duplicate) {

        return "";
    }


    if (
        safeString(
            duplicate.admission_no
        ) ===
        safeString(
            data.admission_no
        )
    ) {

        return "یہ داخلہ نمبر پہلے سے موجود ہے۔";
    }


    if (
        canonicalCNIC(
            duplicate.cnic
        ) ===
        canonicalCNIC(
            data.cnic
        )
    ) {

        return "یہ شناختی کارڈ نمبر پہلے سے موجود ہے۔";
    }


    return "یہ موبائل نمبر پہلے سے موجود ہے۔";
}


/* =====================================================
   RESET STUDENT FORM
===================================================== */

function resetStudentForm() {

    if (studentForm) {

        studentForm.reset();
    }


    editingStudentId = null;


    const editStudentId =
        getElement(
            "editStudentId"
        );


    if (editStudentId) {

        editStudentId.value = "";
    }


    if (studentFormTitle) {

        studentFormTitle.textContent =
            "نئی طالبہ کا اندراج";
    }


    clearMessage(
        studentFormMessage
    );


    if (mahramList) {

        mahramList.innerHTML = "";
    }


    updateTransferFields();

    updateMahramSection();
}


/* =====================================================
   OPEN STUDENT FORM
===================================================== */

function openStudentForm() {

    if (!requireAdmin()) {
        return;
    }


    if (studentFormContainer) {

        studentFormContainer.classList.remove(
            "hidden"
        );
    }


    window.scrollTo({

        top:
            studentFormContainer
                ? studentFormContainer.offsetTop
                : 0,

        behavior:
            "smooth"

    });
}


/* =====================================================
   CLOSE STUDENT FORM
===================================================== */

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
   GET STUDENT MAHRAMS
===================================================== */

function getStudentMahrams(
    student
) {

    let value =
        getRecordValue(
            student,
            "mahrams",
            []
        );


    if (
        typeof value ===
        "string"
    ) {

        try {

            value =
                JSON.parse(
                    value
                );

        } catch (error) {

            value = [];
        }
    }


    return Array.isArray(value)
        ? value
        : [];
}


/* =====================================================
   LOAD STUDENTS
===================================================== */

async function loadStudents() {

    if (!supabaseClient) {
        return;
    }


    if (studentsList) {

        studentsList.innerHTML =
            "<p>⏳ ریکارڈ لوڈ ہو رہا ہے...</p>";
    }


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

        console.error(
            "Student load error:",
            error
        );

        if (studentsList) {

            studentsList.innerHTML =
                '<div class="empty-students"><p>طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔</p></div>';
        }

        return;
    }


    studentsCache =
        Array.isArray(data)
            ? data
            : [];


    displayStudents(
        studentsCache
    );
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


    if (studentCount) {

        studentCount.textContent =
            String(
                studentsCache.length
            );
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
                    نئی طالبہ شامل کرنے کے لیے اوپر والا بٹن استعمال کریں۔
                </p>

            </div>
        `;

        return;
    }


    studentsList.innerHTML =
        students
            .map(
                function (student) {

                    const id =
                        student.id;

                    const name =
                        getRecordValue(
                            student,
                            "name",
                            "-"
                        );

                    const father =
                        getRecordValue(
                            student,
                            "father_name",
                            "-"
                        );

                    const admissionNo =
                        getRecordValue(
                            student,
                            "admission_no",
                            "-"
                        );

                    const studentClass =
                        getRecordValue(
                            student,
                            "student_class",
                            "-"
                        );

                    const residence =
                        getRecordValue(
                            student,
                            "residence_type",
                            "-"
                        );

                    const phone =
                        getRecordValue(
                            student,
                            "phone",
                            "-"
                        );


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
                                    والد:
                                    ${escapeHtml(father)}
                                </p>

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

                            </div>

                        </div>
                    `;
                }
            )
            .join("");


    attachStudentCardEvents();
}


/* =====================================================
   STUDENT SEARCH
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

                        student.name,

                        student.father_name,

                        student.guardian_name,

                        student.admission_no,

                        student.phone,

                        student.cnic,

                        student.student_class,

                        student.address

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


    const editId =
        getElement(
            "editStudentId"
        );


    if (editId) {

        editId.value =
            student.id;
    }


    const fields = {

        admissionType:
            student.admission_type,

        admissionNo:
            student.admission_no,

        previousMadrassa:
            student.previous_madrassa,

        transferDate:
            student.transfer_date,

        studentName:
            student.name,

        fatherName:
            student.father_name,

        guardianName:
            student.guardian_name,

        dateOfBirth:
            student.date_of_birth,

        studentClass:
            student.student_class,

        phone:
            normalizePhone(
                student.phone
            ),

        admissionDate:
            student.admission_date,

        address:
            student.address,

        residenceType:
            student.residence_type

    };


    Object.entries(
        fields
    ).forEach(
        function (
            [idName, value]
        ) {

            const field =
                getElement(
                    idName
                );


            if (field) {

                field.value =
                    value === null ||
                    value === undefined
                        ? ""
                        : String(value);
            }
        }
    );


    const cnic =
        getElement(
            "studentCNIC"
        );


    if (cnic) {

        cnic.value =
            formatCNIC(
                student.cnic
            );
    }


    if (studentFormTitle) {

        studentFormTitle.textContent =
            "طالبہ کا ریکارڈ تبدیل کریں";
    }


    updateTransferFields();

    updateMahramSection();


    if (
        student.residence_type ===
        "ہاسٹل"
    ) {

        loadMahrams(
            getStudentMahrams(
                student
            )
        );
    }


    openStudentForm();
}


/* =====================================================
   SHOW STUDENT DETAILS
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


    if (
        !student ||
        !studentDetailsOverlay ||
        !studentDetailsContent
    ) {
        return;
    }


    const mahrams =
        getStudentMahrams(
            student
        );


    let mahramHtml = "";


    if (mahrams.length) {

        mahramHtml = `

            <div class="student-detail-full mahram-details-box">

                <h3>
                    محرم کی معلومات
                </h3>

                ${mahrams
                    .map(
                        function (
                            mahram,
                            index
                        ) {

                            return `

                                <div class="mahram-detail-card">

                                    <strong>
                                        محرم ${index + 1}
                                    </strong>

                                    <p>
                                        نام:
                                        ${escapeHtml(
                                            mahram.name || "-"
                                        )}
                                    </p>

                                    <p>
                                        رشتہ:
                                        ${escapeHtml(
                                            mahram.relation || "-"
                                        )}
                                    </p>

                                    <p>
                                        موبائل:
                                        ${escapeHtml(
                                            mahram.phone || "-"
                                        )}
                                    </p>

                                    <p>
                                        شناختی کارڈ:
                                        ${escapeHtml(
                                            formatCNIC(
                                                mahram.cnic || ""
                                            ) || "-"
                                        )}
                                    </p>

                                </div>
                            `;
                        }
                    )
                    .join("")}

            </div>
        `;
    }


    studentDetailsContent.innerHTML = `

        <div class="student-detail-item">

            <strong>
                داخلہ نمبر
            </strong>

            ${escapeHtml(
                student.admission_no || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                داخلہ کی قسم
            </strong>

            ${escapeHtml(
                student.admission_type || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                طالبہ کا نام
            </strong>

            ${escapeHtml(
                student.name || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                والد کا نام
            </strong>

            ${escapeHtml(
                student.father_name || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                سرپرست کا نام
            </strong>

            ${escapeHtml(
                student.guardian_name || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                شناختی کارڈ
            </strong>

            ${escapeHtml(
                formatCNIC(
                    student.cnic || ""
                ) || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                موبائل نمبر
            </strong>

            ${escapeHtml(
                student.phone || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                تاریخ پیدائش
            </strong>

            ${escapeHtml(
                student.date_of_birth || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                کلاس
            </strong>

            ${escapeHtml(
                student.student_class || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                داخلہ کی تاریخ
            </strong>

            ${escapeHtml(
                student.admission_date || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                رہائش
            </strong>

            ${escapeHtml(
                student.residence_type || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                سابقہ مدرسہ
            </strong>

            ${escapeHtml(
                student.previous_madrassa || "-"
            )}

        </div>


        <div class="student-detail-item">

            <strong>
                منتقلی کی تاریخ
            </strong>

            ${escapeHtml(
                student.transfer_date || "-"
            )}

        </div>


        <div class="student-detail-item student-detail-full">

            <strong>
                مکمل پتہ
            </strong>

            ${escapeHtml(
                student.address || "-"
            )}

        </div>


        ${mahramHtml}

    `;


    studentDetailsOverlay.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";
}


/* =====================================================
   CLOSE STUDENT DETAILS
===================================================== */

function closeStudentDetails() {

    if (studentDetailsOverlay) {

        studentDetailsOverlay.style.display =
            "none";
    }


    document.body.style.overflow =
        "";
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
                student.name
            )}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
        );


    if (!confirmed) {
        return;
    }


    isDeletingStudent = true;


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
            "طالبہ کا ریکارڈ حذف نہیں ہو سکا۔"
        );


    } finally {

        isDeletingStudent =
            false;
    }
}


/* =====================================================
   STUDENT CARD EVENTS
===================================================== */

function attachStudentCardEvents() {

    if (!studentsList) {
        return;
    }


    studentsList
        .querySelectorAll(
            ".view-student"
        )
        .forEach(
            function (button) {

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
   SAVE STUDENT
===================================================== */

async function saveStudent(
    event
) {

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


    const formData =
        getStudentFormData();


    isSavingStudent = true;


    if (saveStudentButton) {

        saveStudentButton.disabled =
            true;

        saveStudentButton.textContent =
            "⏳ محفوظ ہو رہا ہے...";
    }


    try {

        const duplicateMessage =
            await checkStudentDuplicates(
                formData,
                editingStudentId
            );


        if (duplicateMessage) {

            showMessage(
                studentFormMessage,
                duplicateMessage
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
                    .update(
                        formData
                    )
                    .eq(
                        "id",
                        editingStudentId
                    );


            if (error) {
                throw error;
            }


        } else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        STUDENTS_TABLE
                    )
                    .insert([
                        formData
                    ]);


            if (error) {
                throw error;
            }
        }


        resetStudentForm();

        closeStudentForm();

        await loadStudents();


        alert(
            editingStudentId
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


        if (
            error &&
            (
                error.code === "23505" ||
                safeString(
                    error.message
                )
                    .toLowerCase()
                    .includes(
                        "duplicate"
                    )
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
                "💾 محفوظ کریں";
        }
    }
}


/* =====================================================
   STUDENT PAGE INITIALIZATION
===================================================== */

async function initializeStudentsPage() {

    if (
        currentPage !==
        "students.html"
    ) {
        return;
    }


    if (!protectPage()) {
        return;
    }


    initializeStudentFormatting();


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

                if (!requireAdmin()) {
                    return;
                }


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


    if (
        closeStudentDetailsButton
    ) {

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

   DO NOT ADD:
   });

   MAIN DOMContentLoaded WRAPPER IS STILL OPEN.
   PASTE PART 3 DIRECTLY BELOW THIS LINE.
===================================================== */

/* =========================================================
   MASTER SCRIPT.JS
   PART 3
   COMPLETE TEACHER MODULE
========================================================= */


/* =====================================================
   TEACHER VARIABLES
===================================================== */

let teachersCache = [];

let editingTeacherId = null;

let isSavingTeacher = false;

let isDeletingTeacher = false;


const teacherFormContainer =
    getElement(
        "teacherFormContainer"
    );

const teacherForm =
    getElement(
        "teacherForm"
    );

const showTeacherFormButton =
    getElement(
        "showTeacherForm"
    );

const cancelTeacherButton =
    getElement(
        "cancelTeacherButton"
    );

const saveTeacherButton =
    getElement(
        "saveTeacherButton"
    );

const teacherFormMessage =
    getElement(
        "teacherFormMessage"
    );

const teacherSearch =
    getElement(
        "teacherSearch"
    );

const teacherList =
    getElement(
        "teacherList"
    );

const teacherListCount =
    getElement(
        "teacherListCount"
    );

const teacherTotalPage =
    currentPage === "teachers.html"
        ? getElement("teacherTotal")
        : null;

const activeTeacherTotal =
    getElement(
        "activeTeacherTotal"
    );

const pendingTeacherTotal =
    getElement(
        "pendingTeacherTotal"
    );


/* =====================================================
   TEACHER FIELD VALUE
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


/* =====================================================
   TEACHER INPUT FORMATTING
===================================================== */

function initializeTeacherFormatting() {

    const phone =
        getElement(
            "teacherPhone"
        );

    const cnic =
        getElement(
            "teacherCNIC"
        );


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
                    canonicalCNIC(
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
        data.phone.length !== 11
    ) {

        return "موبائل نمبر 11 ہندسوں پر مشتمل ہونا چاہیے۔";
    }


    if (
        data.phone &&
        !data.phone.startsWith(
            "03"
        )
    ) {

        return "موبائل نمبر 03 سے شروع ہونا چاہیے۔";
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
   TEACHER DATABASE DATA

   teacher_code is supported when that column exists.
   If the older Teachers table has no teacher_code column,
   saveTeacherRecord() automatically retries without it.
===================================================== */

function getTeacherDatabaseData() {

    const data =
        getTeacherFormData();


    return {

        teacher_code:
            data.teacher_code,

        name:
            data.name,

        father_name:
            data.father_name,

        phone:
            data.phone,

        cnic:
            data.cnic,

        qualification:
            data.qualification,

        joining_date:
            data.joining_date,

        address:
            data.address

    };
}


/* =====================================================
   REMOVE UNSUPPORTED TEACHER CODE
===================================================== */

function withoutTeacherCode(
    data
) {

    const copy = {
        ...data
    };


    delete copy.teacher_code;


    return copy;
}


/* =====================================================
   DETECT MISSING COLUMN ERROR
===================================================== */

function isMissingTeacherCodeError(
    error
) {

    const text =
        safeString(
            error &&
            error.message
        ).toLowerCase();


    return (
        text.includes(
            "teacher_code"
        ) &&
        (
            text.includes(
                "column"
            ) ||
            text.includes(
                "schema cache"
            ) ||
            text.includes(
                "could not find"
            )
        )
    );
}


/* =====================================================
   UPDATE TEACHER STATISTICS
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
                    teacher.status ||
                    teacher.authorization_status
                ).toLowerCase();


            if (
                !status ||
                status === "approved" ||
                status === "active" ||
                status === "فعال" ||
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


    editingTeacherId = null;


    clearMessage(
        teacherFormMessage
    );


    const heading =
        teacherFormContainer
            ? teacherFormContainer.querySelector(
                "h2"
            )
            : null;


    if (heading) {

        heading.textContent =
            "👩‍🏫 نئے استاد کی معلومات";
    }
}


/* =====================================================
   OPEN TEACHER FORM
===================================================== */

function openTeacherForm() {

    if (!requireAdmin()) {
        return;
    }


    if (teacherFormContainer) {

        teacherFormContainer.classList.remove(
            "hidden"
        );
    }


    window.scrollTo({

        top:
            teacherFormContainer
                ? teacherFormContainer.offsetTop
                : 0,

        behavior:
            "smooth"

    });
}


/* =====================================================
   CLOSE TEACHER FORM
===================================================== */

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

        teacherList.innerHTML =
            '<div class="teacher-empty">⏳ ریکارڈ لوڈ ہو رہا ہے...</div>';
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

            teacherList.innerHTML =
                '<div class="teacher-empty">اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔</div>';
        }
    }
}


/* =====================================================
   GET TEACHER DISPLAY CODE
===================================================== */

function getTeacherCode(
    teacher
) {

    const savedCode =
        safeString(
            teacher.teacher_code ||
            teacher.teacherCode ||
            teacher.code
        );


    if (savedCode) {
        return savedCode;
    }


    if (
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
   DISPLAY TEACHERS
===================================================== */

function displayTeachers(
    teachers = teachersCache
) {

    if (!teacherList) {
        return;
    }


    if (
        !Array.isArray(teachers) ||
        teachers.length === 0
    ) {

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
                function (teacher) {

                    const id =
                        teacher.id;

                    const code =
                        getTeacherCode(
                            teacher
                        );

                    const name =
                        getRecordValue(
                            teacher,
                            "name",
                            "-"
                        );

                    const fatherName =
                        getRecordValue(
                            teacher,
                            "father_name",
                            "-"
                        );

                    const phone =
                        normalizePhone(
                            getRecordValue(
                                teacher,
                                "phone",
                                ""
                            )
                        ) || "-";

                    const qualification =
                        getRecordValue(
                            teacher,
                            "qualification",
                            "-"
                        );

                    const joiningDate =
                        getRecordValue(
                            teacher,
                            "joining_date",
                            "-"
                        );


                    return `

                        <div
                            class="student-card teacher-record-card"
                            data-id="${escapeHtml(id)}"
                        >

                            <div class="student-card-header">

                                <div class="student-avatar">
                                    👩‍🏫
                                </div>

                                <div>

                                    <h3>
                                        ${escapeHtml(name)}
                                    </h3>

                                    <span>
                                        استاد کوڈ:
                                        ${escapeHtml(code)}
                                    </span>

                                </div>

                            </div>


                            <div class="student-badges">

                                <span>
                                    🎓 ${escapeHtml(qualification)}
                                </span>

                                <span>
                                    📅 ${escapeHtml(joiningDate)}
                                </span>

                            </div>


                            <div class="student-info">

                                <p>
                                    والد:
                                    ${escapeHtml(fatherName)}
                                </p>

                                <p>
                                    موبائل:
                                    ${escapeHtml(phone)}
                                </p>

                            </div>


                            <div class="student-card-buttons">

                                <button
                                    type="button"
                                    class="view-teacher"
                                    data-id="${escapeHtml(id)}"
                                >
                                    👁️ تفصیلات
                                </button>

                                <button
                                    type="button"
                                    class="edit-teacher"
                                    data-id="${escapeHtml(id)}"
                                >
                                    ✏️ تبدیل کریں
                                </button>

                                <button
                                    type="button"
                                    class="delete-teacher"
                                    data-id="${escapeHtml(id)}"
                                >
                                    🗑️ حذف کریں
                                </button>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");


    attachTeacherCardEvents();
}


/* =====================================================
   TEACHER SEARCH
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
            .from(
                TEACHERS_TABLE
            )
            .select("*");


    if (error) {
        throw error;
    }


    for (
        const row of
        rows || []
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
                row.teacher_code ||
                row.teacherCode ||
                row.code
            ).toLowerCase();


        const newCode =
            safeString(
                data.teacher_code
            ).toLowerCase();


        if (
            existingCode &&
            newCode &&
            existingCode ===
            newCode
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
            existingPhone ===
            data.phone
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
            existingCNIC ===
            data.cnic
        ) {

            return "یہ شناختی کارڈ نمبر پہلے سے موجود ہے۔";
        }
    }


    return "";
}


/* =====================================================
   SAVE TEACHER RECORD
===================================================== */

async function saveTeacherRecord(
    data
) {

    let result;


    if (editingTeacherId) {

        result =
            await supabaseClient
                .from(
                    TEACHERS_TABLE
                )
                .update(
                    data
                )
                .eq(
                    "id",
                    editingTeacherId
                )
                .select();


    } else {

        result =
            await supabaseClient
                .from(
                    TEACHERS_TABLE
                )
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
                    .from(
                        TEACHERS_TABLE
                    )
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
                    .from(
                        TEACHERS_TABLE
                    )
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
   SAVE TEACHER
===================================================== */

async function saveTeacher(
    event
) {

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
        getTeacherDatabaseData();


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
                error &&
                error.message
            ).toLowerCase();


        if (
            error &&
            (
                error.code === "23505" ||
                errorText.includes(
                    "duplicate"
                ) ||
                errorText.includes(
                    "unique"
                )
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
                "💾 استاد محفوظ کریں";
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


    const fields = {

        teacherCode:
            getTeacherCode(
                teacher
            ),

        teacherName:
            teacher.name,

        teacherFatherName:
            teacher.father_name,

        teacherPhone:
            normalizePhone(
                teacher.phone
            ),

        teacherCNIC:
            canonicalCNIC(
                teacher.cnic
            ),

        teacherQualification:
            teacher.qualification,

        teacherJoiningDate:
            teacher.joining_date,

        teacherAddress:
            teacher.address

    };


    Object.entries(
        fields
    ).forEach(
        function (
            [idName, value]
        ) {

            const field =
                getElement(
                    idName
                );


            if (field) {

                field.value =
                    value === null ||
                    value === undefined
                        ? ""
                        : String(value);
            }
        }
    );


    const heading =
        teacherFormContainer
            ? teacherFormContainer.querySelector(
                "h2"
            )
            : null;


    if (heading) {

        heading.textContent =
            "👩‍🏫 استاد کا ریکارڈ تبدیل کریں";
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


    const details = [

        "استاد کوڈ: " +
        getTeacherCode(
            teacher
        ),

        "نام: " +
        safeString(
            teacher.name || "-"
        ),

        "والد کا نام: " +
        safeString(
            teacher.father_name || "-"
        ),

        "موبائل نمبر: " +
        safeString(
            teacher.phone || "-"
        ),

        "شناختی کارڈ: " +
        (
            canonicalCNIC(
                teacher.cnic
            ) || "-"
        ),

        "تعلیمی قابلیت: " +
        safeString(
            teacher.qualification || "-"
        ),

        "تقرری کی تاریخ: " +
        safeString(
            teacher.joining_date || "-"
        ),

        "پتہ: " +
        safeString(
            teacher.address || "-"
        )

    ];


    alert(
        details.join(
            "\n"
        )
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


    const confirmed =
        window.confirm(
            `"${safeString(
                teacher.name
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
            "استاد کا ریکارڈ حذف نہیں ہو سکا۔"
        );


    } finally {

        isDeletingTeacher =
            false;
    }
}


/* =====================================================
   TEACHER CARD EVENTS
===================================================== */

function attachTeacherCardEvents() {

    if (!teacherList) {
        return;
    }


    teacherList
        .querySelectorAll(
            ".view-teacher"
        )
        .forEach(
            function (button) {

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
            function (button) {

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


/* =====================================================
   TEACHER PAGE INITIALIZATION
===================================================== */

async function initializeTeachersPage() {

    if (
        currentPage !==
        "teachers.html"
    ) {
        return;
    }


    if (!protectPage()) {
        return;
    }


    initializeTeacherFormatting();


    if (showTeacherFormButton) {

        showTeacherFormButton.addEventListener(
            "click",
            function () {

                if (!requireAdmin()) {
                    return;
                }


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


    await loadTeachers();
}


/* =====================================================
   START TEACHER MODULE
===================================================== */

await initializeTeachersPage();


/* =====================================================
   PART 3 ENDS HERE

   DO NOT ADD:
   });

   MAIN DOMContentLoaded WRAPPER IS STILL OPEN.
   PASTE PART 4 DIRECTLY BELOW THIS LINE.
===================================================== */

/* =========================================================
   MASTER SCRIPT.JS
   PART 4
   SESSION TIMEOUT + GLOBAL NAVIGATION + FINAL INITIALIZATION
========================================================= */


/* =====================================================
   SESSION TIMEOUT
   5 MINUTES OF INACTIVITY
===================================================== */

const INACTIVITY_LIMIT =
    5 * 60 * 1000;

let inactivityTimer = null;


/* =====================================================
   UPDATE LAST ACTIVITY
===================================================== */

function updateLastActivity() {

    if (!isAuthenticated()) {
        return;
    }


    localStorage.setItem(
        SESSION_KEYS.lastActivity,
        String(Date.now())
    );
}


/* =====================================================
   CHECK SESSION TIMEOUT
===================================================== */

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


/* =====================================================
   RESET INACTIVITY TIMER
===================================================== */

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
            function () {

                checkSessionTimeout();

            },
            INACTIVITY_LIMIT
        );
}


/* =====================================================
   INITIALIZE INACTIVITY SYSTEM
===================================================== */

function initializeInactivitySystem() {

    if (!isAuthenticated()) {
        return;
    }


    checkSessionTimeout();


    const activityEvents = [

        "click",

        "keydown",

        "touchstart",

        "scroll"

    ];


    activityEvents.forEach(
        function (eventName) {

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
   SESSION STORAGE COMPATIBILITY
===================================================== */

function restoreCompatibleSession() {

    const localLoggedIn =
        localStorage.getItem(
            SESSION_KEYS.loggedIn
        );


    if (
        localLoggedIn ===
        "true"
    ) {

        return;
    }


    const sessionLoggedIn =
        sessionStorage.getItem(
            SESSION_KEYS.loggedIn
        );


    if (
        sessionLoggedIn !==
        "true"
    ) {

        return;
    }


    Object.values(
        SESSION_KEYS
    ).forEach(
        function (key) {

            const value =
                sessionStorage.getItem(
                    key
                );


            if (
                value !== null
            ) {

                localStorage.setItem(
                    key,
                    value
                );
            }
        }
    );
}


/* =====================================================
   DASHBOARD MENU NAVIGATION
===================================================== */

function initializeDashboardNavigation() {

    if (
        currentPage !==
        "dashboard.html"
    ) {
        return;
    }


    const menuRoutes = {

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
            "reports.html"

    };


    Object.entries(
        menuRoutes
    ).forEach(
        function (
            [elementId, page]
        ) {

            const button =
                getElement(
                    elementId
                );


            if (!button) {
                return;
            }


            button.onclick =
                function () {

                    /*
                      Students and Teachers pages
                      currently exist.

                      Remaining modules will be
                      activated when their HTML
                      pages are added.
                    */

                    if (
                        page ===
                        "students.html" ||
                        page ===
                        "teachers.html"
                    ) {

                        window.location.href =
                            page;

                        return;
                    }


                    alert(
                        "یہ حصہ اگلے مرحلے میں شامل کیا جائے گا۔"
                    );
                };
        }
    );
}


/* =====================================================
   PREVENT NON-ADMIN RECORD CHANGES
===================================================== */

function applyRolePermissions() {

    const role =
        getCurrentRole();


    if (!role) {
        return;
    }


    const adminOnlyElements = [

        "showStudentForm",

        "saveStudentButton",

        "addMahram",

        "showTeacherForm",

        "saveTeacherButton"

    ];


    if (role === "admin") {

        adminOnlyElements.forEach(
            function (id) {

                const element =
                    getElement(id);


                if (element) {

                    element.style.display =
                        "";
                }
            }
        );


        return;
    }


    adminOnlyElements.forEach(
        function (id) {

            const element =
                getElement(id);


            if (element) {

                element.style.display =
                    "none";
            }
        }
    );


    document
        .querySelectorAll(
            ".edit-student, .delete-student, .edit-teacher, .delete-teacher"
        )
        .forEach(
            function (element) {

                element.style.display =
                    "none";
            }
        );
}


/* =====================================================
   SAFE LOGOUT
===================================================== */

function performGlobalLogout() {

    clearSession();


    sessionStorage.clear();


    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );

        inactivityTimer = null;
    }


    window.location.href =
        "index.html";
}


/* =====================================================
   REPLACE LOGOUT BUTTON HANDLER
===================================================== */

function initializeFinalLogout() {

    const button =
        getElement(
            "logoutButton"
        );


    if (!button) {
        return;
    }


    /*
      Part 1 already attached a logout
      event listener.

      This assignment also provides a
      final safe logout path.
    */

    button.onclick =
        performGlobalLogout;
}


/* =====================================================
   KEYBOARD ESCAPE SUPPORT
===================================================== */

function initializeKeyboardControls() {

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
                studentDetailsOverlay.style.display ===
                "flex"
            ) {

                closeStudentDetails();

                return;
            }


            if (
                currentPage ===
                "students.html" &&
                studentFormContainer &&
                !studentFormContainer.classList.contains(
                    "hidden"
                )
            ) {

                closeStudentForm();

                return;
            }


            if (
                currentPage ===
                "teachers.html" &&
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
   GLOBAL ERROR HANDLER
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


/* =====================================================
   UNHANDLED PROMISE ERROR
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
   FINAL STARTUP
===================================================== */

restoreCompatibleSession();

initializeDashboardNavigation();

applyRolePermissions();

initializeFinalLogout();

initializeKeyboardControls();

initializeInactivitySystem();


/* =====================================================
   REFRESH ROLE PERMISSIONS AFTER RECORD LISTS LOAD
===================================================== */

if (
    currentPage ===
    "students.html"
) {

    setTimeout(
        applyRolePermissions,
        100
    );
}


if (
    currentPage ===
    "teachers.html"
) {

    setTimeout(
        applyRolePermissions,
        100
    );
}


/* =====================================================
   FINAL CLOSE

   THIS CLOSES THE SINGLE DOMContentLoaded
   WRAPPER STARTED IN PART 1.

   DO NOT ADD ANOTHER:
   });

   AFTER THIS.
===================================================== */

});

                          
