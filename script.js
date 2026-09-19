/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 1 / CORE SYSTEM
   ===================================================== */

(function () {
    "use strict";

    /* =====================================================
       GLOBAL APPLICATION OBJECT
       ===================================================== */

    const App = window.MadrassaApp =
        window.MadrassaApp || {};


    /* =====================================================
       SUPABASE CONFIGURATION
       ===================================================== */

    App.SUPABASE_URL =
        "https://ggtnetudnjsmsmitvjmb.supabase.co";

    App.SUPABASE_KEY =
        "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";

    App.supabase = null;


    App.initSupabase = function () {

        if (App.supabase) {
            return App.supabase;
        }

        if (
            !window.supabase ||
            typeof window.supabase.createClient !== "function"
        ) {
            console.error(
                "Supabase library is not available."
            );

            return null;
        }

        try {

            App.supabase =
                window.supabase.createClient(
                    App.SUPABASE_URL,
                    App.SUPABASE_KEY,
                    {
                        auth: {
                            persistSession: false,
                            autoRefreshToken: false,
                            detectSessionInUrl: false
                        }
                    }
                );

        } catch (error) {

            console.error(
                "Supabase initialization error:",
                error
            );

            App.supabase = null;
        }

        return App.supabase;
    };


    /* =====================================================
       APPLICATION CONSTANTS
       ===================================================== */

    App.APP_NAME =
        "مدرسہ شہناز اختر للبنات";

    App.SESSION_KEY =
        "madrassa_app_session_v1";

    App.INACTIVITY_LIMIT =
        5 * 60 * 1000;

    App.ACTIVITY_SAVE_INTERVAL =
        30 * 1000;

    App.MAX_MAHRAMS = 5;

    App.lastActivitySave = 0;

    App.inactivityTimer = null;


    /* =====================================================
       PAGE HELPERS
       ===================================================== */

    App.getCurrentPage = function () {

        const path =
            window.location.pathname || "";

        const file =
            path.split("/").pop();

        return file || "index.html";
    };


    App.currentPage =
        App.getCurrentPage();


    App.isPublicPage = function () {

        return [
            "index.html",
            "",
            "login.html",
            "student-apply.html",
            "teacher-apply.html"
        ].includes(App.currentPage);
    };


    /* =====================================================
       DOM HELPERS
       ===================================================== */

    App.byId = function (id) {

        return document.getElementById(id);
    };


    App.show = function (element) {

        if (!element) {
            return;
        }

        element.classList.remove("hidden");

        element.style.display = "";
    };


    App.hide = function (element) {

        if (!element) {
            return;
        }

        element.classList.add("hidden");

        element.style.display = "none";
    };


    App.setText = function (
        element,
        value
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);
    };


    App.showMessage = function (
        element,
        message,
        type = "info"
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            message || "";

        element.classList.remove(
            "success",
            "error",
            "info",
            "warning",
            "success-message",
            "error-message",
            "info-message"
        );

        if (type) {

            element.classList.add(type);
        }

        element.dataset.messageType =
            type || "info";

        element.style.display =
            message ? "block" : "none";
    };


    App.clearMessage = function (
        element
    ) {

        if (!element) {
            return;
        }

        element.textContent = "";

        element.style.display = "none";

        delete element.dataset.messageType;
    };


    App.setButtonBusy = function (
        button,
        busy,
        busyText = "براہ کرم انتظار کریں"
    ) {

        if (!button) {
            return;
        }

        if (busy) {

            if (
                button.dataset.originalText ===
                undefined
            ) {
                button.dataset.originalText =
                    button.textContent;
            }

            button.disabled = true;

            button.textContent =
                busyText;

        } else {

            button.disabled = false;

            if (
                button.dataset.originalText !==
                undefined
            ) {

                button.textContent =
                    button.dataset.originalText;

                delete button.dataset.originalText;
            }
        }
    };


    /* =====================================================
       STRING / HTML HELPERS
       ===================================================== */

    App.escapeHTML = function (value) {

        return String(
            value === null ||
            value === undefined
                ? ""
                : value
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };


    App.cleanText = function (value) {

        return String(
            value === null ||
            value === undefined
                ? ""
                : value
        ).trim();
    };


    App.digitsOnly = function (value) {

        return String(
            value || ""
        ).replace(/\D/g, "");
    };


    App.normalizeCNIC = function (value) {

        return App.digitsOnly(value)
            .slice(0, 13);
    };


    App.formatCNIC = function (value) {

        const digits =
            App.normalizeCNIC(value);

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
    };


    App.normalizePhone = function (value) {

        return App.digitsOnly(value)
            .slice(0, 11);
    };


    App.isValidCNIC = function (value) {

        return (
            App.normalizeCNIC(value)
                .length === 13
        );
    };


    App.isValidPhone = function (value) {

        return (
            App.normalizePhone(value)
                .length === 11
        );
    };


    App.isUrduText = function (value) {

        const text =
            App.cleanText(value);

        if (!text) {
            return false;
        }

        try {

            return /^[\p{Script=Arabic}\s.'’\-]+$/u
                .test(text);

        } catch (error) {

            return /^[\u0600-\u06FF\s.'’\-]+$/
                .test(text);
        }
    };


    /* =====================================================
       DATE HELPERS
       ===================================================== */

    App.todayISO = function () {

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

        return (
            year +
            "-" +
            month +
            "-" +
            day
        );
    };


    App.formatDate = function (value) {

        if (!value) {
            return "";
        }

        const date =
            new Date(
                String(value).length === 10
                    ? value + "T00:00:00"
                    : value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        try {

            return date.toLocaleDateString(
                "ur-PK",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }
            );

        } catch (error) {

            return String(value);
        }
    };


    /* =====================================================
       SESSION STORAGE HELPERS
       ===================================================== */

    App.getStoredSession = function () {

        let raw = null;

        try {

            raw =
                sessionStorage.getItem(
                    App.SESSION_KEY
                );

            if (!raw) {

                raw =
                    localStorage.getItem(
                        App.SESSION_KEY
                    );
            }

        } catch (error) {

            console.error(
                "Session read error:",
                error
            );

            return null;
        }

        if (!raw) {
            return null;
        }

        try {

            const session =
                JSON.parse(raw);

            if (
                !session ||
                typeof session !== "object"
            ) {
                return null;
            }

            return session;

        } catch (error) {

            App.clearStoredSession();

            return null;
        }
    };


    App.clearStoredSession = function () {

        try {

            sessionStorage.removeItem(
                App.SESSION_KEY
            );

        } catch (error) {
            /* ignore */
        }

        try {

            localStorage.removeItem(
                App.SESSION_KEY
            );

        } catch (error) {
            /* ignore */
        }
    };


    App.saveSession = function (
        loginData,
        remember = false
    ) {

        if (
            !loginData ||
            !loginData.token ||
            !loginData.role
        ) {
            throw new Error(
                "Invalid login session."
            );
        }

        const role =
            String(
                loginData.role
            )
                .trim()
                .toLowerCase();

        const session = {

            token:
                String(
                    loginData.token
                ),

            role:
                role,

            username:
                loginData.username ||
                loginData.admin_username ||
                "",

            accountId:
                loginData.account_id ||
                loginData.admin_id ||
                null,

            teacherId:
                loginData.teacher_id ||
                null,

            studentId:
                loginData.student_id ||
                null,

            authorizationStatus:
                loginData.authorization_status ||
                loginData.auth_status ||
                "approved",

            remember:
                Boolean(remember),

            loginTime:
                Date.now(),

            lastActivity:
                Date.now()
        };


        App.clearStoredSession();


        try {

            if (remember) {

                localStorage.setItem(
                    App.SESSION_KEY,
                    JSON.stringify(session)
                );

            } else {

                sessionStorage.setItem(
                    App.SESSION_KEY,
                    JSON.stringify(session)
                );
            }

        } catch (error) {

            throw new Error(
                "Session could not be saved."
            );
        }


        return session;
    };


    App.updateStoredSession = function (
        session
    ) {

        if (!session) {
            return;
        }

        try {

            if (session.remember) {

                localStorage.setItem(
                    App.SESSION_KEY,
                    JSON.stringify(session)
                );

                sessionStorage.removeItem(
                    App.SESSION_KEY
                );

            } else {

                sessionStorage.setItem(
                    App.SESSION_KEY,
                    JSON.stringify(session)
                );

                localStorage.removeItem(
                    App.SESSION_KEY
                );
            }

        } catch (error) {

            console.error(
                "Session update error:",
                error
            );
        }
    };


    App.getSessionToken = function () {

        const session =
            App.getStoredSession();

        return session
            ? session.token
            : null;
    };


    App.getCurrentRole = function () {

        const session =
            App.getStoredSession();

        return session
            ? session.role
            : null;
    };


    App.getCurrentUsername =
        function () {

            const session =
                App.getStoredSession();

            return session
                ? session.username
                : "";
        };


    App.isAuthenticated = function () {

        const session =
            App.getStoredSession();

        return Boolean(
            session &&
            session.token &&
            session.role
        );
    };


    /* =====================================================
       RPC HELPER
       ===================================================== */

    App.rpc = async function (
        functionName,
        params = {}
    ) {

        const client =
            App.initSupabase();

        if (!client) {

            throw new Error(
                "Supabase connection is not available."
            );
        }

        const {
            data,
            error
        } =
            await client.rpc(
                functionName,
                params
            );


        if (error) {

            console.error(
                "RPC error:",
                functionName,
                error
            );

            const message =
                error.message ||
                error.details ||
                "Database request failed.";

            throw new Error(message);
        }


        return data;
    };


    /* =====================================================
       ROLE / ACCESS HELPERS
       ===================================================== */

    App.redirectToLogin = function (
        reason = ""
    ) {

        const suffix =
            reason
                ? "?reason=" +
                  encodeURIComponent(
                      reason
                  )
                : "";

        window.location.href =
            "login.html" + suffix;
    };


    App.redirectToDashboard =
        function () {

            window.location.href =
                "dashboard.html";
        };


    App.requireSession = function (
        allowedRoles = null
    ) {

        const session =
            App.getStoredSession();


        if (
            !session ||
            !session.token ||
            !session.role
        ) {

            App.redirectToLogin(
                "login-required"
            );

            return null;
        }


        const lastActivity =
            Number(
                session.lastActivity || 0
            );


        if (
            !lastActivity ||
            Date.now() - lastActivity >
                App.INACTIVITY_LIMIT
        ) {

            App.logout(
                "timeout"
            );

            return null;
        }


        if (
            Array.isArray(
                allowedRoles
            ) &&
            allowedRoles.length > 0 &&
            !allowedRoles.includes(
                session.role
            )
        ) {

            App.redirectToDashboard();

            return null;
        }


        return session;
    };


    App.requireAdmin = function () {

        return App.requireSession(
            ["admin"]
        );
    };


    /* =====================================================
       ACTIVITY / INACTIVITY
       ===================================================== */

    App.touchSession = function (
        force = false
    ) {

        const session =
            App.getStoredSession();

        if (!session) {
            return;
        }


        const now =
            Date.now();


        if (
            !force &&
            now -
                App.lastActivitySave <
                App.ACTIVITY_SAVE_INTERVAL
        ) {
            return;
        }


        session.lastActivity =
            now;

        App.lastActivitySave =
            now;

        App.updateStoredSession(
            session
        );
    };


    App.checkInactivity =
        function () {

            const session =
                App.getStoredSession();

            if (!session) {
                return;
            }


            const lastActivity =
                Number(
                    session.lastActivity ||
                    0
                );


            if (
                !lastActivity ||
                Date.now() -
                    lastActivity >
                    App.INACTIVITY_LIMIT
            ) {

                App.logout(
                    "timeout"
                );
            }
        };


    App.startInactivityWatcher =
        function () {

            if (
                App.inactivityTimer
            ) {

                clearInterval(
                    App.inactivityTimer
                );
            }


            if (
                !App.isAuthenticated()
            ) {
                return;
            }


            const activityEvents = [
                "pointerdown",
                "keydown",
                "touchstart",
                "scroll"
            ];


            activityEvents.forEach(
                function (eventName) {

                    window.addEventListener(
                        eventName,
                        function () {

                            App.touchSession(
                                false
                            );
                        },
                        {
                            passive: true
                        }
                    );
                }
            );


            App.inactivityTimer =
                window.setInterval(
                    App.checkInactivity,
                    10000
                );


            App.checkInactivity();
        };


    /* =====================================================
       LOGOUT
       ===================================================== */

    App.logout = async function (
        reason = "logout"
    ) {

        const session =
            App.getStoredSession();

        const token =
            session
                ? session.token
                : null;


        App.clearStoredSession();


        if (
            App.inactivityTimer
        ) {

            clearInterval(
                App.inactivityTimer
            );

            App.inactivityTimer =
                null;
        }


        if (token) {

            try {

                await App.rpc(
                    "logout_session",
                    {
                        p_token:
                            token
                    }
                );

            } catch (error) {

                console.warn(
                    "Server logout warning:",
                    error
                );
            }
        }


        const suffix =
            reason
                ? "?reason=" +
                  encodeURIComponent(
                      reason
                  )
                : "";


        window.location.href =
            "login.html" +
            suffix;
    };


    /* =====================================================
       COMMON INPUT MASKS
       ===================================================== */

    App.bindCNICInput = function (
        input
    ) {

        if (!input) {
            return;
        }


        input.setAttribute(
            "inputmode",
            "numeric"
        );


        input.addEventListener(
            "input",
            function () {

                this.value =
                    App.formatCNIC(
                        this.value
                    );
            }
        );
    };


    App.bindPhoneInput = function (
        input
    ) {

        if (!input) {
            return;
        }


        input.setAttribute(
            "inputmode",
            "numeric"
        );


        input.addEventListener(
            "input",
            function () {

                this.value =
                    App.normalizePhone(
                        this.value
                    );
            }
        );
    };


    /* =====================================================
       DOCUMENT READY
       ===================================================== */

    App.ready = function (
        callback
    ) {

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                callback,
                {
                    once: true
                }
            );

        } else {

            callback();
        }
    };


    App.ready(
        function () {

            App.initSupabase();

            App.startInactivityWatcher();
        }
    );

})();

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 2 / HOME + LOGIN SYSTEM
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       ROLE HELPERS
       ===================================================== */

    App.ALLOWED_ROLES = [
        "admin",
        "teacher",
        "student"
    ];


    App.getRoleLabel = function (
        role
    ) {

        switch (
            String(role || "")
                .toLowerCase()
        ) {

            case "admin":
                return "ایڈمن";

            case "teacher":
                return "استاد";

            case "student":
                return "طالبہ";

            default:
                return "";
        }
    };


    App.getURLParameter =
        function (name) {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            return params.get(name);
        };


    App.getLoginRoleFromURL =
        function () {

            const role =
                String(
                    App.getURLParameter(
                        "role"
                    ) || ""
                )
                    .trim()
                    .toLowerCase();


            if (
                App.ALLOWED_ROLES.includes(
                    role
                )
            ) {
                return role;
            }


            return "admin";
        };


    App.goToLogin = function (
        role
    ) {

        const cleanRole =
            String(role || "")
                .trim()
                .toLowerCase();


        if (
            !App.ALLOWED_ROLES.includes(
                cleanRole
            )
        ) {
            return;
        }


        window.location.href =
            "login.html?role=" +
            encodeURIComponent(
                cleanRole
            );
    };


    /* =====================================================
       HOME PAGE
       ===================================================== */

    App.initializeHomePage =
        function () {

            if (
                App.currentPage !==
                    "index.html" &&
                App.currentPage !== ""
            ) {
                return;
            }


            const adminLoginButton =
                App.byId(
                    "adminLoginButton"
                );

            const teacherLoginButton =
                App.byId(
                    "teacherLoginButton"
                );

            const studentLoginButton =
                App.byId(
                    "studentLoginButton"
                );

            const studentApplyButton =
                App.byId(
                    "studentApplyButton"
                );

            const teacherApplyButton =
                App.byId(
                    "teacherApplyButton"
                );


            if (adminLoginButton) {

                adminLoginButton
                    .addEventListener(
                        "click",
                        function () {

                            App.goToLogin(
                                "admin"
                            );
                        }
                    );
            }


            if (teacherLoginButton) {

                teacherLoginButton
                    .addEventListener(
                        "click",
                        function () {

                            App.goToLogin(
                                "teacher"
                            );
                        }
                    );
            }


            if (studentLoginButton) {

                studentLoginButton
                    .addEventListener(
                        "click",
                        function () {

                            App.goToLogin(
                                "student"
                            );
                        }
                    );
            }


            if (studentApplyButton) {

                studentApplyButton
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "student-apply.html";
                        }
                    );
            }


            if (teacherApplyButton) {

                teacherApplyButton
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "teacher-apply.html";
                        }
                    );
            }
        };


    /* =====================================================
       LOGIN PAGE MESSAGE
       ===================================================== */

    App.showLoginReason =
        function () {

            const loginMessage =
                App.byId(
                    "loginMessage"
                );

            if (!loginMessage) {
                return;
            }


            const reason =
                App.getURLParameter(
                    "reason"
                );


            if (!reason) {
                return;
            }


            switch (reason) {

                case "timeout":

                    App.showMessage(
                        loginMessage,
                        "غیر فعالیت کی وجہ سے آپ کا سیشن ختم ہوگیا ہے۔ دوبارہ لاگ اِن کریں۔",
                        "info"
                    );

                    break;


                case "login-required":

                    App.showMessage(
                        loginMessage,
                        "براہ کرم پہلے لاگ اِن کریں۔",
                        "info"
                    );

                    break;


                case "logout":

                    App.showMessage(
                        loginMessage,
                        "آپ کامیابی سے لاگ آؤٹ ہوگئے ہیں۔",
                        "success"
                    );

                    break;


                default:
                    break;
            }
        };


    /* =====================================================
       LOGIN PAGE ROLE
       ===================================================== */

    App.setLoginPageRole =
        function (role) {

            const cleanRole =
                App.ALLOWED_ROLES.includes(
                    role
                )
                    ? role
                    : "admin";


            const loginRole =
                App.byId(
                    "loginRole"
                );

            const selectedRoleText =
                App.byId(
                    "selectedRoleText"
                );

            const selectedRoleBox =
                App.byId(
                    "selectedRoleBox"
                );


            if (loginRole) {

                loginRole.value =
                    cleanRole;
            }


            if (selectedRoleText) {

                selectedRoleText.textContent =
                    App.getRoleLabel(
                        cleanRole
                    );
            }


            if (selectedRoleBox) {

                selectedRoleBox.dataset.role =
                    cleanRole;
            }
        };


    /* =====================================================
       PASSWORD VISIBILITY
       ===================================================== */

    App.initializePasswordToggle =
        function () {

            const password =
                App.byId(
                    "password"
                );

            const togglePassword =
                App.byId(
                    "togglePassword"
                );


            if (
                !password ||
                !togglePassword
            ) {
                return;
            }


            togglePassword
                .addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const isHidden =
                            password.type ===
                            "password";


                        password.type =
                            isHidden
                                ? "text"
                                : "password";


                        togglePassword
                            .setAttribute(
                                "aria-label",
                                isHidden
                                    ? "پاس ورڈ چھپائیں"
                                    : "پاس ورڈ دکھائیں"
                            );


                        togglePassword
                            .setAttribute(
                                "aria-pressed",
                                isHidden
                                    ? "true"
                                    : "false"
                            );
                    }
                );
        };


    /* =====================================================
       LOGIN
       ===================================================== */

    App.handleLogin =
        async function (
            event
        ) {

            if (event) {
                event.preventDefault();
            }


            const loginRole =
                App.byId(
                    "loginRole"
                );

            const username =
                App.byId(
                    "username"
                );

            const password =
                App.byId(
                    "password"
                );

            const rememberMe =
                App.byId(
                    "rememberMe"
                );

            const loginMessage =
                App.byId(
                    "loginMessage"
                );

            const loginButton =
                App.byId(
                    "loginButton"
                );

            const pendingMessage =
                App.byId(
                    "pendingAccountMessage"
                );

            const rejectedMessage =
                App.byId(
                    "rejectedAccountMessage"
                );


            App.clearMessage(
                pendingMessage
            );

            App.clearMessage(
                rejectedMessage
            );


            const role =
                String(
                    loginRole
                        ? loginRole.value
                        : ""
                )
                    .trim()
                    .toLowerCase();


            const usernameValue =
                App.cleanText(
                    username
                        ? username.value
                        : ""
                );


            const passwordValue =
                password
                    ? password.value
                    : "";


            if (
                !App.ALLOWED_ROLES.includes(
                    role
                )
            ) {

                App.showMessage(
                    loginMessage,
                    "اکاؤنٹ کی قسم درست نہیں ہے۔",
                    "error"
                );

                return;
            }


            if (!usernameValue) {

                App.showMessage(
                    loginMessage,
                    "صارف نام درج کریں۔",
                    "error"
                );

                if (username) {
                    username.focus();
                }

                return;
            }


            if (!passwordValue) {

                App.showMessage(
                    loginMessage,
                    "پاس ورڈ درج کریں۔",
                    "error"
                );

                if (password) {
                    password.focus();
                }

                return;
            }


            App.clearMessage(
                loginMessage
            );


            App.setButtonBusy(
                loginButton,
                true,
                "لاگ اِن ہو رہا ہے"
            );


            try {

                const data =
                    await App.rpc(
                        "login_session",
                        {
                            p_role:
                                role,

                            p_username:
                                usernameValue,

                            p_password:
                                passwordValue
                        }
                    );


                if (
                    !data ||
                    !data.token ||
                    !data.role
                ) {

                    App.showMessage(
                        loginMessage,
                        "صارف نام یا پاس ورڈ غلط ہے، یا اکاؤنٹ ابھی منظور نہیں ہوا۔",
                        "error"
                    );

                    return;
                }


                const returnedRole =
                    String(
                        data.role
                    )
                        .trim()
                        .toLowerCase();


                if (
                    returnedRole !== role
                ) {

                    App.showMessage(
                        loginMessage,
                        "اکاؤنٹ کی قسم درست نہیں ہے۔",
                        "error"
                    );

                    return;
                }


                App.saveSession(
                    data,
                    Boolean(
                        rememberMe &&
                        rememberMe.checked
                    )
                );


                window.location.replace(
                    "dashboard.html"
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                App.showMessage(
                    loginMessage,
                    "لاگ اِن نہیں ہوسکا۔ صارف نام، پاس ورڈ اور اکاؤنٹ کی منظوری چیک کریں۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    loginButton,
                    false
                );
            }
        };


    /* =====================================================
       INITIALIZE LOGIN PAGE
       ===================================================== */

    App.initializeLoginPage =
        function () {

            if (
                App.currentPage !==
                "login.html"
            ) {
                return;
            }


            /*
             * اگر پہلے سے صحیح local session موجود ہے
             * تو دوبارہ login form نہ دکھائیں۔
             */

            if (
                App.isAuthenticated()
            ) {

                const session =
                    App.getStoredSession();


                if (
                    session &&
                    Number(
                        session.lastActivity ||
                        0
                    ) > 0 &&
                    Date.now() -
                        Number(
                            session.lastActivity
                        ) <=
                        App.INACTIVITY_LIMIT
                ) {

                    window.location.replace(
                        "dashboard.html"
                    );

                    return;
                }


                App.clearStoredSession();
            }


            const role =
                App.getLoginRoleFromURL();


            App.setLoginPageRole(
                role
            );


            App.showLoginReason();


            App.initializePasswordToggle();


            const loginForm =
                App.byId(
                    "loginForm"
                );

            const backButton =
                App.byId(
                    "backButton"
                );


            const pendingMessage =
                App.byId(
                    "pendingAccountMessage"
                );

            const rejectedMessage =
                App.byId(
                    "rejectedAccountMessage"
                );


            App.clearMessage(
                pendingMessage
            );

            App.clearMessage(
                rejectedMessage
            );


            if (loginForm) {

                loginForm
                    .addEventListener(
                        "submit",
                        App.handleLogin
                    );
            }


            if (backButton) {

                backButton
                    .addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            window.location.href =
                                "index.html";
                        }
                    );
            }
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeHomePage();

            App.initializeLoginPage();
        }
    );

})();


/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 3 / DASHBOARD
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       DASHBOARD ROLE PERMISSIONS
       ===================================================== */

    App.applyDashboardPermissions =
        function (role) {

            const studentsButton =
                App.byId(
                    "studentsButton"
                );

            const teachersButton =
                App.byId(
                    "teachersButton"
                );

            const attendanceButton =
                App.byId(
                    "attendanceButton"
                );

            const approvalsButton =
                App.byId(
                    "approvalsButton"
                );

            const announcementsButton =
                App.byId(
                    "announcementsButton"
                );

            const reportsButton =
                App.byId(
                    "reportsButton"
                );


            const adminOnlyElements =
                document.querySelectorAll(
                    ".admin-only"
                );


            adminOnlyElements.forEach(
                function (element) {

                    if (role === "admin") {

                        App.show(
                            element
                        );

                    } else {

                        App.hide(
                            element
                        );
                    }
                }
            );


            /*
             * Students and Teachers management
             * currently uses secure ADMIN RPCs.
             */

            if (role === "admin") {

                App.show(
                    studentsButton
                );

                App.show(
                    teachersButton
                );

            } else {

                App.hide(
                    studentsButton
                );

                App.hide(
                    teachersButton
                );
            }


            /*
             * Attendance:
             * Admin + Teacher
             */

            if (
                role === "admin" ||
                role === "teacher"
            ) {

                App.show(
                    attendanceButton
                );

            } else {

                App.hide(
                    attendanceButton
                );
            }


            /*
             * Approvals:
             * Admin only
             */

            if (role === "admin") {

                App.show(
                    approvalsButton
                );

            } else {

                App.hide(
                    approvalsButton
                );
            }


            /*
             * Announcements:
             * Keep visible for all logged-in roles.
             * Actual page/module can be connected later.
             */

            App.show(
                announcementsButton
            );


            /*
             * Reports:
             * Admin only
             */

            if (role === "admin") {

                App.show(
                    reportsButton
                );

            } else {

                App.hide(
                    reportsButton
                );
            }
        };


    /* =====================================================
       DASHBOARD HEADER
       ===================================================== */

    App.renderDashboardHeader =
        function (session) {

            const dashboardWelcome =
                App.byId(
                    "dashboardWelcome"
                );

            const dashboardRoleText =
                App.byId(
                    "dashboardRoleText"
                );


            const username =
                App.cleanText(
                    session.username
                );


            if (dashboardWelcome) {

                dashboardWelcome.textContent =
                    username
                        ? "خوش آمدید، " +
                          username
                        : "خوش آمدید";
            }


            if (dashboardRoleText) {

                dashboardRoleText.textContent =
                    App.getRoleLabel(
                        session.role
                    );
            }
        };


    /* =====================================================
       DASHBOARD STATS PLACEHOLDERS
       ===================================================== */

    App.resetDashboardStats =
        function () {

            const studentTotal =
                App.byId(
                    "studentTotal"
                );

            const teacherTotal =
                App.byId(
                    "teacherTotal"
                );

            const pendingApplicationTotal =
                App.byId(
                    "pendingApplicationTotal"
                );

            const todayAttendanceTotal =
                App.byId(
                    "todayAttendanceTotal"
                );


            App.setText(
                studentTotal,
                "0"
            );

            App.setText(
                teacherTotal,
                "0"
            );

            App.setText(
                pendingApplicationTotal,
                "0"
            );

            App.setText(
                todayAttendanceTotal,
                "0"
            );
        };


    /* =====================================================
       LOAD ADMIN DASHBOARD STATS
       ===================================================== */

    App.loadAdminDashboardStats =
        async function (
            session
        ) {

            const studentTotal =
                App.byId(
                    "studentTotal"
                );

            const teacherTotal =
                App.byId(
                    "teacherTotal"
                );

            const pendingApplicationTotal =
                App.byId(
                    "pendingApplicationTotal"
                );

            const todayAttendanceTotal =
                App.byId(
                    "todayAttendanceTotal"
                );


            try {

                const data =
                    await App.rpc(
                        "admin_dashboard_stats",
                        {
                            p_token:
                                session.token
                        }
                    );


                const stats =
                    data &&
                    typeof data ===
                        "object"
                        ? data
                        : {};


                App.setText(
                    studentTotal,
                    Number(
                        stats.student_total ||
                        0
                    )
                );


                App.setText(
                    teacherTotal,
                    Number(
                        stats.teacher_total ||
                        0
                    )
                );


                App.setText(
                    pendingApplicationTotal,
                    Number(
                        stats.pending_application_total ||
                        0
                    )
                );


                App.setText(
                    todayAttendanceTotal,
                    Number(
                        stats.today_attendance_total ||
                        0
                    )
                );

            } catch (error) {

                console.error(
                    "Dashboard stats error:",
                    error
                );


                /*
                 * Invalid/expired server token.
                 */

                const message =
                    String(
                        error &&
                        error.message
                            ? error.message
                            : ""
                    ).toLowerCase();


                if (
                    message.includes(
                        "expired"
                    ) ||
                    message.includes(
                        "invalid"
                    ) ||
                    message.includes(
                        "session"
                    )
                ) {

                    await App.logout(
                        "login-required"
                    );
                }
            }
        };


    /* =====================================================
       NON-ADMIN DASHBOARD STATS
       ===================================================== */

    App.renderNonAdminDashboardStats =
        function () {

            const studentTotal =
                App.byId(
                    "studentTotal"
                );

            const teacherTotal =
                App.byId(
                    "teacherTotal"
                );

            const pendingApplicationTotal =
                App.byId(
                    "pendingApplicationTotal"
                );

            const todayAttendanceTotal =
                App.byId(
                    "todayAttendanceTotal"
                );


            /*
             * These admin-wide counts are not exposed
             * to Teacher/Student accounts.
             */

            App.setText(
                studentTotal,
                "—"
            );

            App.setText(
                teacherTotal,
                "—"
            );

            App.setText(
                pendingApplicationTotal,
                "—"
            );

            App.setText(
                todayAttendanceTotal,
                "—"
            );
        };


    /* =====================================================
       DASHBOARD BUTTONS
       ===================================================== */

    App.initializeDashboardButtons =
        function (
            session
        ) {

            const studentsButton =
                App.byId(
                    "studentsButton"
                );

            const teachersButton =
                App.byId(
                    "teachersButton"
                );

            const attendanceButton =
                App.byId(
                    "attendanceButton"
                );

            const approvalsButton =
                App.byId(
                    "approvalsButton"
                );

            const announcementsButton =
                App.byId(
                    "announcementsButton"
                );

            const reportsButton =
                App.byId(
                    "reportsButton"
                );

            const logoutButton =
                App.byId(
                    "logoutButton"
                );


            if (studentsButton) {

                studentsButton
                    .addEventListener(
                        "click",
                        function () {

                            if (
                                session.role !==
                                "admin"
                            ) {
                                return;
                            }


                            window.location.href =
                                "students.html";
                        }
                    );
            }


            if (teachersButton) {

                teachersButton
                    .addEventListener(
                        "click",
                        function () {

                            if (
                                session.role !==
                                "admin"
                            ) {
                                return;
                            }


                            window.location.href =
                                "teachers.html";
                        }
                    );
            }


            if (attendanceButton) {

                attendanceButton
                    .addEventListener(
                        "click",
                        function () {

                            if (
                                session.role !==
                                    "admin" &&
                                session.role !==
                                    "teacher"
                            ) {
                                return;
                            }


                            window.location.href =
                                "attendance.html";
                        }
                    );
            }


            if (approvalsButton) {

                approvalsButton
                    .addEventListener(
                        "click",
                        function () {

                            if (
                                session.role !==
                                "admin"
                            ) {
                                return;
                            }


                            window.location.href =
                                "approvals.html";
                        }
                    );
            }


            if (announcementsButton) {

                announcementsButton
                    .addEventListener(
                        "click",
                        function () {

                            /*
                             * announcements.html has not
                             * been supplied yet.
                             * Do not navigate to a missing page.
                             */

                            window.alert(
                                "اعلانات کا صفحہ ابھی شامل نہیں کیا گیا۔"
                            );
                        }
                    );
            }


            if (reportsButton) {

                reportsButton
                    .addEventListener(
                        "click",
                        function () {

                            if (
                                session.role !==
                                "admin"
                            ) {
                                return;
                            }


                            /*
                             * reports.html has not
                             * been supplied yet.
                             */

                            window.alert(
                                "رپورٹس کا صفحہ ابھی شامل نہیں کیا گیا۔"
                            );
                        }
                    );
            }


            if (logoutButton) {

                logoutButton
                    .addEventListener(
                        "click",
                        function () {

                            App.logout(
                                "logout"
                            );
                        }
                    );
            }
        };


    /* =====================================================
       INITIALIZE DASHBOARD
       ===================================================== */

    App.initializeDashboardPage =
        async function () {

            if (
                App.currentPage !==
                "dashboard.html"
            ) {
                return;
            }


            const session =
                App.requireSession(
                    [
                        "admin",
                        "teacher",
                        "student"
                    ]
                );


            if (!session) {
                return;
            }


            App.touchSession(
                true
            );


            App.resetDashboardStats();


            App.renderDashboardHeader(
                session
            );


            App.applyDashboardPermissions(
                session.role
            );


            App.initializeDashboardButtons(
                session
            );


            if (
                session.role ===
                "admin"
            ) {

                await App.loadAdminDashboardStats(
                    session
                );

            } else {

                App.renderNonAdminDashboardStats();
            }
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeDashboardPage();
        }
    );

})();


/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 4 / STUDENTS MODULE
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       STUDENT STATE
       ===================================================== */

    App.studentsCache = [];

    App.editingStudentId = null;


    /* =====================================================
       STUDENT STATUS
       ===================================================== */

    App.normalizeStudentStatus =
        function (value) {

            const status =
                App.cleanText(value)
                    .toLowerCase();

            if (
                status === "inactive" ||
                status === "disabled" ||
                status === "غیر فعال"
            ) {
                return "inactive";
            }

            return "active";
        };


    App.studentStatusLabel =
        function (status) {

            return (
                App.normalizeStudentStatus(
                    status
                ) === "inactive"
                    ? "غیر فعال"
                    : "فعال"
            );
        };


    /* =====================================================
       STUDENT PAGE ELEMENTS
       ===================================================== */

    App.getStudentElements =
        function () {

            return {

                backToDashboard:
                    App.byId(
                        "backToDashboard"
                    ),

                studentAdminActions:
                    App.byId(
                        "studentAdminActions"
                    ),

                showStudentForm:
                    App.byId(
                        "showStudentForm"
                    ),

                studentCount:
                    App.byId(
                        "studentCount"
                    ),

                studentFormContainer:
                    App.byId(
                        "studentFormContainer"
                    ),

                formTitle:
                    App.byId(
                        "formTitle"
                    ),

                studentFormMessage:
                    App.byId(
                        "studentFormMessage"
                    ),

                studentForm:
                    App.byId(
                        "studentForm"
                    ),

                editStudentId:
                    App.byId(
                        "editStudentId"
                    ),

                admissionType:
                    App.byId(
                        "admissionType"
                    ),

                admissionNo:
                    App.byId(
                        "admissionNo"
                    ),

                previousMadrassaGroup:
                    App.byId(
                        "previousMadrassaGroup"
                    ),

                previousMadrassa:
                    App.byId(
                        "previousMadrassa"
                    ),

                transferDateGroup:
                    App.byId(
                        "transferDateGroup"
                    ),

                transferDate:
                    App.byId(
                        "transferDate"
                    ),

                studentName:
                    App.byId(
                        "studentName"
                    ),

                fatherName:
                    App.byId(
                        "fatherName"
                    ),

                guardianName:
                    App.byId(
                        "guardianName"
                    ),

                studentCNIC:
                    App.byId(
                        "studentCNIC"
                    ),

                dateOfBirth:
                    App.byId(
                        "dateOfBirth"
                    ),

                studentClass:
                    App.byId(
                        "studentClass"
                    ),

                phone:
                    App.byId(
                        "phone"
                    ),

                admissionDate:
                    App.byId(
                        "admissionDate"
                    ),

                address:
                    App.byId(
                        "address"
                    ),

                residenceType:
                    App.byId(
                        "residenceType"
                    ),

                mahramSection:
                    App.byId(
                        "mahramSection"
                    ),

                mahramList:
                    App.byId(
                        "mahramList"
                    ),

                addMahram:
                    App.byId(
                        "addMahram"
                    ),

                mahramConfirmation:
                    App.byId(
                        "mahramConfirmation"
                    ),

                studentStatus:
                    App.byId(
                        "studentStatus"
                    ),

                saveStudentButton:
                    App.byId(
                        "saveStudentButton"
                    ),

                cancelStudentForm:
                    App.byId(
                        "cancelStudentForm"
                    ),

                studentSearch:
                    App.byId(
                        "studentSearch"
                    ),

                studentListMessage:
                    App.byId(
                        "studentListMessage"
                    ),

                studentsList:
                    App.byId(
                        "studentsList"
                    ),

                studentDetailsOverlay:
                    App.byId(
                        "studentDetailsOverlay"
                    ),

                studentDetailsTitle:
                    App.byId(
                        "studentDetailsTitle"
                    ),

                closeStudentDetails:
                    App.byId(
                        "closeStudentDetails"
                    ),

                studentDetailsContent:
                    App.byId(
                        "studentDetailsContent"
                    )
            };
        };


    /* =====================================================
       TRANSFER FIELDS
       ===================================================== */

    App.isTransferAdmission =
        function (value) {

            const text =
                App.cleanText(value)
                    .toLowerCase();

            return (
                text.includes("منتقل") ||
                text.includes("transfer")
            );
        };


    App.updateTransferFields =
        function () {

            const el =
                App.getStudentElements();

            const isTransfer =
                App.isTransferAdmission(
                    el.admissionType
                        ? el.admissionType.value
                        : ""
                );


            if (isTransfer) {

                App.show(
                    el.previousMadrassaGroup
                );

                App.show(
                    el.transferDateGroup
                );

            } else {

                App.hide(
                    el.previousMadrassaGroup
                );

                App.hide(
                    el.transferDateGroup
                );

                if (
                    el.previousMadrassa
                ) {
                    el.previousMadrassa.value =
                        "";
                }

                if (el.transferDate) {
                    el.transferDate.value =
                        "";
                }
            }
        };


    /* =====================================================
       HOSTEL / MAHRAM
       ===================================================== */

    App.isHostelResidence =
        function (value) {

            const text =
                App.cleanText(value);

            return (
                text === "ہاسٹل" ||
                text.toLowerCase() ===
                    "hostel"
            );
        };


    App.updateStudentMahramSection =
        function () {

            const el =
                App.getStudentElements();

            const isHostel =
                App.isHostelResidence(
                    el.residenceType
                        ? el.residenceType.value
                        : ""
                );


            if (isHostel) {

                App.show(
                    el.mahramSection
                );

                if (
                    el.mahramList &&
                    el.mahramList.children
                        .length === 0
                ) {

                    App.addStudentMahramRow();
                }

            } else {

                App.hide(
                    el.mahramSection
                );
            }
        };


    App.createMahramRow =
        function (data = {}) {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "mahram-row";

            row.innerHTML = `
                <div class="form-group">
                    <label>محرم کا نام</label>
                    <input
                        type="text"
                        class="mahram-name"
                        autocomplete="off"
                        value="${App.escapeHTML(
                            data.name || ""
                        )}"
                    >
                </div>

                <div class="form-group">
                    <label>رشتہ</label>
                    <input
                        type="text"
                        class="mahram-relation"
                        autocomplete="off"
                        value="${App.escapeHTML(
                            data.relation || ""
                        )}"
                    >
                </div>

                <div class="form-group">
                    <label>فون نمبر</label>
                    <input
                        type="tel"
                        class="mahram-phone"
                        inputmode="numeric"
                        maxlength="11"
                        value="${App.escapeHTML(
                            App.normalizePhone(
                                data.phone || ""
                            )
                        )}"
                    >
                </div>

                <div class="form-group">
                    <label>شناختی کارڈ نمبر</label>
                    <input
                        type="text"
                        class="mahram-cnic"
                        inputmode="numeric"
                        maxlength="15"
                        value="${App.escapeHTML(
                            App.formatCNIC(
                                data.cnic || ""
                            )
                        )}"
                    >
                </div>

                <button
                    type="button"
                    class="remove-mahram"
                >
                    محرم ہٹائیں
                </button>
            `;


            const phone =
                row.querySelector(
                    ".mahram-phone"
                );

            const cnic =
                row.querySelector(
                    ".mahram-cnic"
                );

            const removeButton =
                row.querySelector(
                    ".remove-mahram"
                );


            App.bindPhoneInput(
                phone
            );

            App.bindCNICInput(
                cnic
            );


            if (removeButton) {

                removeButton
                    .addEventListener(
                        "click",
                        function () {

                            row.remove();
                        }
                    );
            }


            return row;
        };


    App.addStudentMahramRow =
        function (data = {}) {

            const el =
                App.getStudentElements();

            if (!el.mahramList) {
                return;
            }


            const count =
                el.mahramList
                    .querySelectorAll(
                        ".mahram-row"
                    ).length;


            if (
                count >=
                App.MAX_MAHRAMS
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔",
                    "error"
                );

                return;
            }


            el.mahramList.appendChild(
                App.createMahramRow(
                    data
                )
            );
        };


    App.collectStudentMahrams =
        function () {

            const el =
                App.getStudentElements();

            if (!el.mahramList) {
                return [];
            }


            const rows =
                el.mahramList
                    .querySelectorAll(
                        ".mahram-row"
                    );

            const mahrams = [];


            rows.forEach(
                function (row) {

                    const name =
                        App.cleanText(
                            row.querySelector(
                                ".mahram-name"
                            )?.value
                        );

                    const relation =
                        App.cleanText(
                            row.querySelector(
                                ".mahram-relation"
                            )?.value
                        );

                    const phone =
                        App.normalizePhone(
                            row.querySelector(
                                ".mahram-phone"
                            )?.value
                        );

                    const cnic =
                        App.normalizeCNIC(
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
        };


    App.validateStudentMahrams =
        function (
            mahrams,
            residenceType
        ) {

            if (
                !App.isHostelResidence(
                    residenceType
                )
            ) {
                return true;
            }


            if (
                !Array.isArray(
                    mahrams
                ) ||
                mahrams.length < 1 ||
                mahrams.length >
                    App.MAX_MAHRAMS
            ) {

                return false;
            }


            for (
                const mahram
                of mahrams
            ) {

                if (
                    !App.cleanText(
                        mahram.name
                    ) ||
                    !App.cleanText(
                        mahram.relation
                    ) ||
                    !App.isValidPhone(
                        mahram.phone
                    ) ||
                    !App.isValidCNIC(
                        mahram.cnic
                    )
                ) {

                    return false;
                }
            }


            return true;
        };


    /* =====================================================
       FORM RESET / OPEN / CLOSE
       ===================================================== */

    App.resetStudentForm =
        function () {

            const el =
                App.getStudentElements();


            if (el.studentForm) {

                el.studentForm.reset();
            }


            App.editingStudentId =
                null;


            if (el.editStudentId) {

                el.editStudentId.value =
                    "";
            }


            if (el.mahramList) {

                el.mahramList.innerHTML =
                    "";
            }


            if (el.admissionDate) {

                el.admissionDate.value =
                    App.todayISO();
            }


            if (el.studentStatus) {

                const activeOption =
                    Array.from(
                        el.studentStatus.options ||
                        []
                    ).find(
                        function (option) {

                            return (
                                App.normalizeStudentStatus(
                                    option.value
                                ) ===
                                "active"
                            );
                        }
                    );

                if (activeOption) {

                    el.studentStatus.value =
                        activeOption.value;
                }
            }


            App.clearMessage(
                el.studentFormMessage
            );


            App.updateTransferFields();

            App.updateStudentMahramSection();
        };


    App.openStudentForm =
        function (
            student = null
        ) {

            const el =
                App.getStudentElements();


            if (!el.studentFormContainer) {
                return;
            }


            App.show(
                el.studentFormContainer
            );


            if (student) {

                App.editingStudentId =
                    student.id;


                if (el.editStudentId) {

                    el.editStudentId.value =
                        student.id || "";
                }


                App.setText(
                    el.formTitle,
                    "طالبہ کا ریکارڈ تبدیل کریں"
                );


                if (el.admissionType) {
                    el.admissionType.value =
                        student.admission_type ||
                        "";
                }

                if (el.admissionNo) {
                    el.admissionNo.value =
                        student.admission_no ||
                        "";
                }

                if (el.previousMadrassa) {
                    el.previousMadrassa.value =
                        student.previous_madrassa ||
                        "";
                }

                if (el.transferDate) {
                    el.transferDate.value =
                        student.transfer_date ||
                        "";
                }

                if (el.studentName) {
                    el.studentName.value =
                        student.name ||
                        "";
                }

                if (el.fatherName) {
                    el.fatherName.value =
                        student.father_name ||
                        "";
                }

                if (el.guardianName) {
                    el.guardianName.value =
                        student.guardian_name ||
                        "";
                }

                if (el.studentCNIC) {
                    el.studentCNIC.value =
                        App.formatCNIC(
                            student.cnic ||
                            ""
                        );
                }

                if (el.dateOfBirth) {
                    el.dateOfBirth.value =
                        student.date_of_birth ||
                        "";
                }

                if (el.studentClass) {
                    el.studentClass.value =
                        student.student_class ||
                        "";
                }

                if (el.phone) {
                    el.phone.value =
                        App.normalizePhone(
                            student.phone ||
                            ""
                        );
                }

                if (el.admissionDate) {
                    el.admissionDate.value =
                        student.admission_date ||
                        "";
                }

                if (el.address) {
                    el.address.value =
                        student.address ||
                        "";
                }

                if (el.residenceType) {
                    el.residenceType.value =
                        student.residence_type ||
                        "";
                }


                if (el.studentStatus) {

                    const targetStatus =
                        App.normalizeStudentStatus(
                            student.status
                        );


                    const option =
                        Array.from(
                            el.studentStatus.options ||
                            []
                        ).find(
                            function (item) {

                                return (
                                    App.normalizeStudentStatus(
                                        item.value
                                    ) ===
                                    targetStatus
                                );
                            }
                        );


                    if (option) {

                        el.studentStatus.value =
                            option.value;
                    }
                }


                if (el.mahramList) {

                    el.mahramList.innerHTML =
                        "";


                    const mahrams =
                        Array.isArray(
                            student.mahrams
                        )
                            ? student.mahrams
                            : [];


                    mahrams.forEach(
                        function (mahram) {

                            App.addStudentMahramRow(
                                mahram
                            );
                        }
                    );
                }


                App.updateTransferFields();

                App.updateStudentMahramSection();

            } else {

                App.resetStudentForm();


                App.setText(
                    el.formTitle,
                    "نئی طالبہ شامل کریں"
                );
            }


            el.studentFormContainer
                .scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });
        };


    App.closeStudentForm =
        function () {

            const el =
                App.getStudentElements();

            App.resetStudentForm();

            App.hide(
                el.studentFormContainer
            );
        };


    /* =====================================================
       STUDENT VALIDATION
       ===================================================== */

    App.getStudentFormData =
        function () {

            const el =
                App.getStudentElements();


            return {

                id:
                    App.editingStudentId ||
                    null,

                admissionNo:
                    App.cleanText(
                        el.admissionNo
                            ? el.admissionNo.value
                            : ""
                    ),

                admissionType:
                    App.cleanText(
                        el.admissionType
                            ? el.admissionType.value
                            : ""
                    ),

                name:
                    App.cleanText(
                        el.studentName
                            ? el.studentName.value
                            : ""
                    ),

                fatherName:
                    App.cleanText(
                        el.fatherName
                            ? el.fatherName.value
                            : ""
                    ),

                guardianName:
                    App.cleanText(
                        el.guardianName
                            ? el.guardianName.value
                            : ""
                    ),

                cnic:
                    App.normalizeCNIC(
                        el.studentCNIC
                            ? el.studentCNIC.value
                            : ""
                    ),

                phone:
                    App.normalizePhone(
                        el.phone
                            ? el.phone.value
                            : ""
                    ),

                dateOfBirth:
                    el.dateOfBirth
                        ? el.dateOfBirth.value
                        : "",

                studentClass:
                    App.cleanText(
                        el.studentClass
                            ? el.studentClass.value
                            : ""
                    ),

                admissionDate:
                    el.admissionDate
                        ? el.admissionDate.value
                        : "",

                address:
                    App.cleanText(
                        el.address
                            ? el.address.value
                            : ""
                    ),

                residenceType:
                    App.cleanText(
                        el.residenceType
                            ? el.residenceType.value
                            : ""
                    ),

                previousMadrassa:
                    App.cleanText(
                        el.previousMadrassa
                            ? el.previousMadrassa.value
                            : ""
                    ),

                transferDate:
                    el.transferDate
                        ? el.transferDate.value
                        : "",

                mahrams:
                    App.collectStudentMahrams(),

                status:
                    App.normalizeStudentStatus(
                        el.studentStatus
                            ? el.studentStatus.value
                            : "active"
                    )
            };
        };


    App.validateStudentData =
        function (data) {

            const el =
                App.getStudentElements();


            if (!data.admissionNo) {

                App.showMessage(
                    el.studentFormMessage,
                    "داخلہ نمبر درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.admissionType) {

                App.showMessage(
                    el.studentFormMessage,
                    "داخلہ کی قسم منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.name ||
                !App.isUrduText(
                    data.name
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "طالبہ کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.fatherName ||
                !App.isUrduText(
                    data.fatherName
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "والد کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.guardianName ||
                !App.isUrduText(
                    data.guardianName
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "سرپرست کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidCNIC(
                    data.cnic
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidPhone(
                    data.phone
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "فون نمبر 11 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (!data.dateOfBirth) {

                App.showMessage(
                    el.studentFormMessage,
                    "تاریخ پیدائش درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.studentClass) {

                App.showMessage(
                    el.studentFormMessage,
                    "درجہ منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.address) {

                App.showMessage(
                    el.studentFormMessage,
                    "پتہ درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.residenceType) {

                App.showMessage(
                    el.studentFormMessage,
                    "رہائش کی قسم منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !App.validateStudentMahrams(
                    data.mahrams,
                    data.residenceType
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "ہاسٹل طالبہ کے لیے کم از کم ایک اور زیادہ سے زیادہ پانچ مکمل محرم درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                App.isTransferAdmission(
                    data.admissionType
                ) &&
                !data.previousMadrassa
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "سابقہ مدرسہ درج کریں۔",
                    "error"
                );

                return false;
            }


            return true;
        };


    /* =====================================================
       SAVE STUDENT
       ===================================================== */

    App.saveStudent =
        async function (
            event
        ) {

            if (event) {
                event.preventDefault();
            }


            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const el =
                App.getStudentElements();

            const data =
                App.getStudentFormData();


            if (
                !App.validateStudentData(
                    data
                )
            ) {
                return;
            }


            App.clearMessage(
                el.studentFormMessage
            );


            App.setButtonBusy(
                el.saveStudentButton,
                true,
                "محفوظ ہو رہا ہے"
            );


            try {

                await App.rpc(
                    "admin_save_student",
                    {
                        p_token:
                            session.token,

                        p_id:
                            data.id,

                        p_admission_no:
                            data.admissionNo,

                        p_admission_type:
                            data.admissionType,

                        p_name:
                            data.name,

                        p_father_name:
                            data.fatherName,

                        p_guardian_name:
                            data.guardianName,

                        p_cnic:
                            data.cnic,

                        p_phone:
                            data.phone,

                        p_date_of_birth:
                            data.dateOfBirth ||
                            null,

                        p_student_class:
                            data.studentClass,

                        p_admission_date:
                            data.admissionDate ||
                            null,

                        p_address:
                            data.address,

                        p_residence_type:
                            data.residenceType,

                        p_previous_madrassa:
                            data.previousMadrassa ||
                            null,

                        p_transfer_date:
                            data.transferDate ||
                            null,

                        p_mahrams:
                            data.mahrams,

                        p_status:
                            data.status
                    }
                );


                App.showMessage(
                    el.studentFormMessage,
                    data.id
                        ? "طالبہ کا ریکارڈ کامیابی سے تبدیل ہوگیا۔"
                        : "نئی طالبہ کامیابی سے شامل ہوگئی۔",
                    "success"
                );


                await App.loadStudents();


                window.setTimeout(
                    function () {

                        App.closeStudentForm();
                    },
                    700
                );

            } catch (error) {

                App.showMessage(
                    el.studentFormMessage,
                    error.message ||
                    "طالبہ کا ریکارڈ محفوظ نہیں ہوسکا۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.saveStudentButton,
                    false
                );
            }
        };


    /* =====================================================
       LOAD STUDENTS
       ===================================================== */

    App.loadStudents =
        async function () {

            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const el =
                App.getStudentElements();


            App.showMessage(
                el.studentListMessage,
                "ریکارڈ لوڈ ہو رہا ہے۔",
                "info"
            );


            try {

                const data =
                    await App.rpc(
                        "admin_get_students",
                        {
                            p_token:
                                session.token
                        }
                    );


                App.studentsCache =
                    Array.isArray(data)
                        ? data
                        : [];


                App.clearMessage(
                    el.studentListMessage
                );


                App.renderStudents(
                    App.studentsCache
                );

            } catch (error) {

                App.studentsCache = [];


                App.renderStudents(
                    []
                );


                App.showMessage(
                    el.studentListMessage,
                    error.message ||
                    "طالبات کا ریکارڈ لوڈ نہیں ہوسکا۔",
                    "error"
                );
            }
        };


    /* =====================================================
       RENDER STUDENTS
       ===================================================== */

    App.renderStudents =
        function (students) {

            const el =
                App.getStudentElements();

            if (!el.studentsList) {
                return;
            }


            const list =
                Array.isArray(students)
                    ? students
                    : [];


            App.setText(
                el.studentCount,
                list.length
            );


            if (
                list.length === 0
            ) {

                el.studentsList.innerHTML =
                    `<div class="empty-state">
                        کوئی طالبہ موجود نہیں۔
                    </div>`;

                return;
            }


            el.studentsList.innerHTML =
                list.map(
                    function (student) {

                        const status =
                            App.studentStatusLabel(
                                student.status
                            );


                        return `
                            <div
                                class="student-card"
                                data-student-id="${App.escapeHTML(
                                    student.id
                                )}"
                            >
                                <div class="student-card-main">

                                    <h3>
                                        ${App.escapeHTML(
                                            student.name
                                        )}
                                    </h3>

                                    <p>
                                        داخلہ نمبر:
                                        ${App.escapeHTML(
                                            student.admission_no ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        والد:
                                        ${App.escapeHTML(
                                            student.father_name ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        درجہ:
                                        ${App.escapeHTML(
                                            student.student_class ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        حالت:
                                        ${App.escapeHTML(
                                            status
                                        )}
                                    </p>

                                </div>

                                <div class="student-card-actions">

                                    <button
                                        type="button"
                                        class="view-student"
                                        data-id="${App.escapeHTML(
                                            student.id
                                        )}"
                                    >
                                        تفصیل
                                    </button>

                                    <button
                                        type="button"
                                        class="edit-student"
                                        data-id="${App.escapeHTML(
                                            student.id
                                        )}"
                                    >
                                        ترمیم
                                    </button>

                                    ${
                                        App.normalizeStudentStatus(
                                            student.status
                                        ) ===
                                        "active"
                                            ? `
                                                <button
                                                    type="button"
                                                    class="deactivate-student"
                                                    data-id="${App.escapeHTML(
                                                        student.id
                                                    )}"
                                                >
                                                    غیر فعال کریں
                                                </button>
                                              `
                                            : ""
                                    }

                                </div>
                            </div>
                        `;
                    }
                ).join("");


            App.bindStudentListButtons();
        };


    /* =====================================================
       SEARCH STUDENTS
       ===================================================== */

    App.filterStudents =
        function () {

            const el =
                App.getStudentElements();


            const query =
                App.cleanText(
                    el.studentSearch
                        ? el.studentSearch.value
                        : ""
                ).toLowerCase();


            if (!query) {

                App.renderStudents(
                    App.studentsCache
                );

                return;
            }


            const filtered =
                App.studentsCache.filter(
                    function (student) {

                        const values = [
                            student.name,
                            student.father_name,
                            student.guardian_name,
                            student.admission_no,
                            student.cnic,
                            student.phone,
                            student.student_class,
                            student.address
                        ];


                        return values.some(
                            function (value) {

                                return String(
                                    value || ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    );
                            }
                        );
                    }
                );


            App.renderStudents(
                filtered
            );
        };


    /* =====================================================
       STUDENT DETAILS
       ===================================================== */

    App.showStudentDetails =
        function (id) {

            const el =
                App.getStudentElements();


            const student =
                App.studentsCache.find(
                    function (item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );
                    }
                );


            if (!student) {
                return;
            }


            App.setText(
                el.studentDetailsTitle,
                student.name ||
                "طالبہ کی تفصیل"
            );


            const mahrams =
                Array.isArray(
                    student.mahrams
                )
                    ? student.mahrams
                    : [];


            const mahramHTML =
                mahrams.length
                    ? mahrams.map(
                        function (
                            mahram,
                            index
                        ) {

                            return `
                                <div class="mahram-detail">
                                    <strong>
                                        محرم ${index + 1}
                                    </strong>

                                    <p>
                                        نام:
                                        ${App.escapeHTML(
                                            mahram.name ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        رشتہ:
                                        ${App.escapeHTML(
                                            mahram.relation ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        فون:
                                        ${App.escapeHTML(
                                            mahram.phone ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        شناختی کارڈ:
                                        ${App.escapeHTML(
                                            App.formatCNIC(
                                                mahram.cnic ||
                                                ""
                                            )
                                        )}
                                    </p>
                                </div>
                            `;
                        }
                    ).join("")
                    : "<p>کوئی محرم درج نہیں۔</p>";


            if (
                el.studentDetailsContent
            ) {

                el.studentDetailsContent.innerHTML = `
                    <p>
                        <strong>داخلہ نمبر:</strong>
                        ${App.escapeHTML(
                            student.admission_no ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>داخلہ کی قسم:</strong>
                        ${App.escapeHTML(
                            student.admission_type ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>طالبہ کا نام:</strong>
                        ${App.escapeHTML(
                            student.name ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>والد کا نام:</strong>
                        ${App.escapeHTML(
                            student.father_name ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>سرپرست:</strong>
                        ${App.escapeHTML(
                            student.guardian_name ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>شناختی کارڈ:</strong>
                        ${App.escapeHTML(
                            App.formatCNIC(
                                student.cnic ||
                                ""
                            )
                        )}
                    </p>

                    <p>
                        <strong>فون:</strong>
                        ${App.escapeHTML(
                            student.phone ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>تاریخ پیدائش:</strong>
                        ${App.escapeHTML(
                            App.formatDate(
                                student.date_of_birth
                            )
                        )}
                    </p>

                    <p>
                        <strong>درجہ:</strong>
                        ${App.escapeHTML(
                            student.student_class ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>تاریخ داخلہ:</strong>
                        ${App.escapeHTML(
                            App.formatDate(
                                student.admission_date
                            )
                        )}
                    </p>

                    <p>
                        <strong>پتہ:</strong>
                        ${App.escapeHTML(
                            student.address ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>رہائش:</strong>
                        ${App.escapeHTML(
                            student.residence_type ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>سابقہ مدرسہ:</strong>
                        ${App.escapeHTML(
                            student.previous_madrassa ||
                            "—"
                        )}
                    </p>

                    <p>
                        <strong>منتقلی کی تاریخ:</strong>
                        ${App.escapeHTML(
                            App.formatDate(
                                student.transfer_date
                            ) || "—"
                        )}
                    </p>

                    <p>
                        <strong>حالت:</strong>
                        ${App.escapeHTML(
                            App.studentStatusLabel(
                                student.status
                            )
                        )}
                    </p>

                    <hr>

                    <h3>
                        محرم
                    </h3>

                    ${mahramHTML}
                `;
            }


            App.show(
                el.studentDetailsOverlay
            );
        };


    App.closeStudentDetailsModal =
        function () {

            const el =
                App.getStudentElements();

            App.hide(
                el.studentDetailsOverlay
            );
        };


    /* =====================================================
       EDIT STUDENT
       ===================================================== */

    App.editStudent =
        function (id) {

            const student =
                App.studentsCache.find(
                    function (item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );
                    }
                );


            if (!student) {
                return;
            }


            App.openStudentForm(
                student
            );
        };


    /* =====================================================
       DEACTIVATE STUDENT
       ===================================================== */

    App.deactivateStudent =
        async function (id) {

            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const student =
                App.studentsCache.find(
                    function (item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );
                    }
                );


            if (!student) {
                return;
            }


            const confirmed =
                window.confirm(
                    "کیا آپ واقعی " +
                    student.name +
                    " کو غیر فعال کرنا چاہتے ہیں؟ ریکارڈ حذف نہیں ہوگا۔"
                );


            if (!confirmed) {
                return;
            }


            const el =
                App.getStudentElements();


            try {

                await App.rpc(
                    "admin_deactivate_student",
                    {
                        p_token:
                            session.token,

                        p_student_id:
                            student.id
                    }
                );


                App.showMessage(
                    el.studentListMessage,
                    "طالبہ کو غیر فعال کردیا گیا ہے۔",
                    "success"
                );


                await App.loadStudents();

            } catch (error) {

                App.showMessage(
                    el.studentListMessage,
                    error.message ||
                    "طالبہ کو غیر فعال نہیں کیا جاسکا۔",
                    "error"
                );
            }
        };


    /* =====================================================
       LIST BUTTON EVENTS
       ===================================================== */

    App.bindStudentListButtons =
        function () {

            const el =
                App.getStudentElements();

            if (!el.studentsList) {
                return;
            }


            el.studentsList
                .querySelectorAll(
                    ".view-student"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                App.showStudentDetails(
                                    this.dataset.id
                                );
                            }
                        );
                    }
                );


            el.studentsList
                .querySelectorAll(
                    ".edit-student"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                App.editStudent(
                                    this.dataset.id
                                );
                            }
                        );
                    }
                );


            el.studentsList
                .querySelectorAll(
                    ".deactivate-student"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                App.deactivateStudent(
                                    this.dataset.id
                                );
                            }
                        );
                    }
                );
        };


    /* =====================================================
       INITIALIZE STUDENTS PAGE
       ===================================================== */

    App.initializeStudentsPage =
        async function () {

            if (
                App.currentPage !==
                "students.html"
            ) {
                return;
            }


            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const el =
                App.getStudentElements();


            App.touchSession(
                true
            );


            App.show(
                el.studentAdminActions
            );


            App.hide(
                el.studentFormContainer
            );


            App.hide(
                el.studentDetailsOverlay
            );


            App.bindCNICInput(
                el.studentCNIC
            );


            App.bindPhoneInput(
                el.phone
            );


            if (el.backToDashboard) {

                el.backToDashboard
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "dashboard.html";
                        }
                    );
            }


            if (el.showStudentForm) {

                el.showStudentForm
                    .addEventListener(
                        "click",
                        function () {

                            App.openStudentForm();
                        }
                    );
            }


            if (el.cancelStudentForm) {

                el.cancelStudentForm
                    .addEventListener(
                        "click",
                        function () {

                            App.closeStudentForm();
                        }
                    );
            }


            if (el.studentForm) {

                el.studentForm
                    .addEventListener(
                        "submit",
                        App.saveStudent
                    );
            }


            if (el.admissionType) {

                el.admissionType
                    .addEventListener(
                        "change",
                        App.updateTransferFields
                    );
            }


            if (el.residenceType) {

                el.residenceType
                    .addEventListener(
                        "change",
                        App.updateStudentMahramSection
                    );
            }


            if (el.addMahram) {

                el.addMahram
                    .addEventListener(
                        "click",
                        function () {

                            App.addStudentMahramRow();
                        }
                    );
            }


            if (el.studentSearch) {

                el.studentSearch
                    .addEventListener(
                        "input",
                        App.filterStudents
                    );
            }


            if (el.closeStudentDetails) {

                el.closeStudentDetails
                    .addEventListener(
                        "click",
                        App.closeStudentDetailsModal
                    );
            }


            if (
                el.studentDetailsOverlay
            ) {

                el.studentDetailsOverlay
                    .addEventListener(
                        "click",
                        function (event) {

                            if (
                                event.target ===
                                el.studentDetailsOverlay
                            ) {

                                App.closeStudentDetailsModal();
                            }
                        }
                    );
            }


            App.resetStudentForm();


            App.hide(
                el.studentFormContainer
            );


            await App.loadStudents();
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeStudentsPage();
        }
    );

})();

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 5 / TEACHERS MODULE
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       TEACHER STATE
       ===================================================== */

    App.teachersCache = [];

    App.editingTeacherId = null;


    /* =====================================================
       TEACHER STATUS HELPERS
       ===================================================== */

    App.normalizeTeacherStatus =
        function (value) {

            const status =
                App.cleanText(value)
                    .toLowerCase();


            if (
                status === "disabled" ||
                status === "inactive" ||
                status === "غیر فعال"
            ) {
                return "disabled";
            }


            if (
                status === "pending" ||
                status === "زیر التواء" ||
                status === "زیرِ التواء"
            ) {
                return "pending";
            }


            return "active";
        };


    App.teacherStatusLabel =
        function (status) {

            const normalized =
                App.normalizeTeacherStatus(
                    status
                );


            if (
                normalized ===
                "disabled"
            ) {
                return "غیر فعال";
            }


            if (
                normalized ===
                "pending"
            ) {
                return "زیر التواء";
            }


            return "فعال";
        };


    /* =====================================================
       PAGE ELEMENTS
       ===================================================== */

    App.getTeacherElements =
        function () {

            return {

                backToDashboard:
                    App.byId(
                        "backToDashboard"
                    ),

                logoutButton:
                    App.byId(
                        "logoutButton"
                    ),

                teacherTotal:
                    App.byId(
                        "teacherTotal"
                    ),

                activeTeacherTotal:
                    App.byId(
                        "activeTeacherTotal"
                    ),

                pendingTeacherTotal:
                    App.byId(
                        "pendingTeacherTotal"
                    ),

                teacherAdminActions:
                    App.byId(
                        "teacherAdminActions"
                    ),

                showTeacherForm:
                    App.byId(
                        "showTeacherForm"
                    ),

                teacherFormContainer:
                    App.byId(
                        "teacherFormContainer"
                    ),

                teacherFormTitle:
                    App.byId(
                        "teacherFormTitle"
                    ),

                teacherFormMessage:
                    App.byId(
                        "teacherFormMessage"
                    ),

                teacherForm:
                    App.byId(
                        "teacherForm"
                    ),

                editTeacherId:
                    App.byId(
                        "editTeacherId"
                    ),

                teacherCode:
                    App.byId(
                        "teacherCode"
                    ),

                teacherName:
                    App.byId(
                        "teacherName"
                    ),

                teacherFatherName:
                    App.byId(
                        "teacherFatherName"
                    ),

                teacherPhone:
                    App.byId(
                        "teacherPhone"
                    ),

                teacherCNIC:
                    App.byId(
                        "teacherCNIC"
                    ),

                teacherDateOfBirth:
                    App.byId(
                        "teacherDateOfBirth"
                    ),

                teacherQualification:
                    App.byId(
                        "teacherQualification"
                    ),

                teacherJoiningDate:
                    App.byId(
                        "teacherJoiningDate"
                    ),

                teacherStatus:
                    App.byId(
                        "teacherStatus"
                    ),

                teacherAddress:
                    App.byId(
                        "teacherAddress"
                    ),

                saveTeacherButton:
                    App.byId(
                        "saveTeacherButton"
                    ),

                cancelTeacherButton:
                    App.byId(
                        "cancelTeacherButton"
                    ),

                teacherSearch:
                    App.byId(
                        "teacherSearch"
                    ),

                teacherListCount:
                    App.byId(
                        "teacherListCount"
                    ),

                teacherListMessage:
                    App.byId(
                        "teacherListMessage"
                    ),

                teacherList:
                    App.byId(
                        "teacherList"
                    ),

                teacherDetailsOverlay:
                    App.byId(
                        "teacherDetailsOverlay"
                    ),

                teacherDetailsTitle:
                    App.byId(
                        "teacherDetailsTitle"
                    ),

                closeTeacherDetails:
                    App.byId(
                        "closeTeacherDetails"
                    ),

                teacherDetailsContent:
                    App.byId(
                        "teacherDetailsContent"
                    )
            };
        };


    /* =====================================================
       FORM RESET
       ===================================================== */

    App.resetTeacherForm =
        function () {

            const el =
                App.getTeacherElements();


            if (el.teacherForm) {

                el.teacherForm.reset();
            }


            App.editingTeacherId =
                null;


            if (el.editTeacherId) {

                el.editTeacherId.value =
                    "";
            }


            if (el.teacherJoiningDate) {

                el.teacherJoiningDate.value =
                    App.todayISO();
            }


            if (el.teacherStatus) {

                const activeOption =
                    Array.from(
                        el.teacherStatus.options ||
                        []
                    ).find(
                        function (option) {

                            return (
                                App.normalizeTeacherStatus(
                                    option.value
                                ) ===
                                "active"
                            );
                        }
                    );


                if (activeOption) {

                    el.teacherStatus.value =
                        activeOption.value;
                }
            }


            App.clearMessage(
                el.teacherFormMessage
            );
        };


    /* =====================================================
       OPEN FORM
       ===================================================== */

    App.openTeacherForm =
        function (
            teacher = null
        ) {

            const el =
                App.getTeacherElements();


            if (!el.teacherFormContainer) {
                return;
            }


            App.show(
                el.teacherFormContainer
            );


            if (teacher) {

                App.editingTeacherId =
                    teacher.id;


                if (el.editTeacherId) {

                    el.editTeacherId.value =
                        teacher.id || "";
                }


                App.setText(
                    el.teacherFormTitle,
                    "استاد کا ریکارڈ تبدیل کریں"
                );


                if (el.teacherCode) {

                    el.teacherCode.value =
                        teacher.teacher_code ||
                        "";
                }


                if (el.teacherName) {

                    el.teacherName.value =
                        teacher.name ||
                        "";
                }


                if (el.teacherFatherName) {

                    el.teacherFatherName.value =
                        teacher.father_name ||
                        "";
                }


                if (el.teacherPhone) {

                    el.teacherPhone.value =
                        App.normalizePhone(
                            teacher.phone ||
                            ""
                        );
                }


                if (el.teacherCNIC) {

                    el.teacherCNIC.value =
                        App.formatCNIC(
                            teacher.cnic ||
                            ""
                        );
                }


                if (
                    el.teacherDateOfBirth
                ) {

                    el.teacherDateOfBirth.value =
                        teacher.date_of_birth ||
                        "";
                }


                if (
                    el.teacherQualification
                ) {

                    el.teacherQualification.value =
                        teacher.qualification ||
                        "";
                }


                if (
                    el.teacherJoiningDate
                ) {

                    el.teacherJoiningDate.value =
                        teacher.joining_date ||
                        "";
                }


                if (
                    el.teacherAddress
                ) {

                    el.teacherAddress.value =
                        teacher.address ||
                        "";
                }


                if (
                    el.teacherStatus
                ) {

                    const targetStatus =
                        App.normalizeTeacherStatus(
                            teacher.status
                        );


                    const option =
                        Array.from(
                            el.teacherStatus.options ||
                            []
                        ).find(
                            function (item) {

                                return (
                                    App.normalizeTeacherStatus(
                                        item.value
                                    ) ===
                                    targetStatus
                                );
                            }
                        );


                    if (option) {

                        el.teacherStatus.value =
                            option.value;
                    }
                }

            } else {

                App.resetTeacherForm();


                App.setText(
                    el.teacherFormTitle,
                    "نیا استاد شامل کریں"
                );
            }


            el.teacherFormContainer
                .scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });
        };


    /* =====================================================
       CLOSE FORM
       ===================================================== */

    App.closeTeacherForm =
        function () {

            const el =
                App.getTeacherElements();


            App.resetTeacherForm();


            App.hide(
                el.teacherFormContainer
            );
        };


    /* =====================================================
       FORM DATA
       ===================================================== */

    App.getTeacherFormData =
        function () {

            const el =
                App.getTeacherElements();


            return {

                id:
                    App.editingTeacherId ||
                    null,

                teacherCode:
                    App.cleanText(
                        el.teacherCode
                            ? el.teacherCode.value
                            : ""
                    ),

                name:
                    App.cleanText(
                        el.teacherName
                            ? el.teacherName.value
                            : ""
                    ),

                fatherName:
                    App.cleanText(
                        el.teacherFatherName
                            ? el.teacherFatherName.value
                            : ""
                    ),

                phone:
                    App.normalizePhone(
                        el.teacherPhone
                            ? el.teacherPhone.value
                            : ""
                    ),

                cnic:
                    App.normalizeCNIC(
                        el.teacherCNIC
                            ? el.teacherCNIC.value
                            : ""
                    ),

                dateOfBirth:
                    el.teacherDateOfBirth
                        ? el.teacherDateOfBirth.value
                        : "",

                qualification:
                    App.cleanText(
                        el.teacherQualification
                            ? el.teacherQualification.value
                            : ""
                    ),

                joiningDate:
                    el.teacherJoiningDate
                        ? el.teacherJoiningDate.value
                        : "",

                status:
                    App.normalizeTeacherStatus(
                        el.teacherStatus
                            ? el.teacherStatus.value
                            : "active"
                    ),

                address:
                    App.cleanText(
                        el.teacherAddress
                            ? el.teacherAddress.value
                            : ""
                    )
            };
        };


    /* =====================================================
       VALIDATION
       ===================================================== */

    App.validateTeacherData =
        function (data) {

            const el =
                App.getTeacherElements();


            if (!data.teacherCode) {

                App.showMessage(
                    el.teacherFormMessage,
                    "استاد کوڈ درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.name ||
                !App.isUrduText(
                    data.name
                )
            ) {

                App.showMessage(
                    el.teacherFormMessage,
                    "استاد کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                data.fatherName &&
                !App.isUrduText(
                    data.fatherName
                )
            ) {

                App.showMessage(
                    el.teacherFormMessage,
                    "والد کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                data.phone &&
                !App.isValidPhone(
                    data.phone
                )
            ) {

                App.showMessage(
                    el.teacherFormMessage,
                    "فون نمبر 11 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                data.cnic &&
                !App.isValidCNIC(
                    data.cnic
                )
            ) {

                App.showMessage(
                    el.teacherFormMessage,
                    "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            return true;
        };


    /* =====================================================
       SAVE TEACHER
       ===================================================== */

    App.saveTeacher =
        async function (
            event
        ) {

            if (event) {
                event.preventDefault();
            }


            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const el =
                App.getTeacherElements();


            const data =
                App.getTeacherFormData();


            if (
                !App.validateTeacherData(
                    data
                )
            ) {
                return;
            }


            App.clearMessage(
                el.teacherFormMessage
            );


            App.setButtonBusy(
                el.saveTeacherButton,
                true,
                "محفوظ ہو رہا ہے"
            );


            try {

                await App.rpc(
                    "admin_save_teacher",
                    {
                        p_token:
                            session.token,

                        p_id:
                            data.id,

                        p_teacher_code:
                            data.teacherCode,

                        p_name:
                            data.name,

                        p_father_name:
                            data.fatherName ||
                            null,

                        p_phone:
                            data.phone ||
                            null,

                        p_cnic:
                            data.cnic ||
                            null,

                        p_date_of_birth:
                            data.dateOfBirth ||
                            null,

                        p_address:
                            data.address ||
                            null,

                        p_qualification:
                            data.qualification ||
                            null,

                        p_joining_date:
                            data.joiningDate ||
                            null,

                        p_status:
                            data.status
                    }
                );


                App.showMessage(
                    el.teacherFormMessage,
                    data.id
                        ? "استاد کا ریکارڈ کامیابی سے تبدیل ہوگیا۔"
                        : "نیا استاد کامیابی سے شامل ہوگیا۔",
                    "success"
                );


                await App.loadTeachers();


                window.setTimeout(
                    function () {

                        App.closeTeacherForm();
                    },
                    700
                );

            } catch (error) {

                App.showMessage(
                    el.teacherFormMessage,
                    error.message ||
                    "استاد کا ریکارڈ محفوظ نہیں ہوسکا۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.saveTeacherButton,
                    false
                );
            }
        };


    /* =====================================================
       LOAD TEACHERS
       ===================================================== */

    App.loadTeachers =
        async function () {

            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const el =
                App.getTeacherElements();


            App.showMessage(
                el.teacherListMessage,
                "ریکارڈ لوڈ ہو رہا ہے۔",
                "info"
            );


            try {

                const data =
                    await App.rpc(
                        "admin_get_teachers",
                        {
                            p_token:
                                session.token
                        }
                    );


                App.teachersCache =
                    Array.isArray(data)
                        ? data
                        : [];


                App.clearMessage(
                    el.teacherListMessage
                );


                App.updateTeacherStats();


                App.renderTeachers(
                    App.teachersCache
                );

            } catch (error) {

                App.teachersCache =
                    [];


                App.updateTeacherStats();


                App.renderTeachers(
                    []
                );


                App.showMessage(
                    el.teacherListMessage,
                    error.message ||
                    "اساتذہ کا ریکارڈ لوڈ نہیں ہوسکا۔",
                    "error"
                );
            }
        };


    /* =====================================================
       TEACHER STATS
       ===================================================== */

    App.updateTeacherStats =
        function () {

            const el =
                App.getTeacherElements();


            const total =
                App.teachersCache.length;


            const active =
                App.teachersCache.filter(
                    function (teacher) {

                        return (
                            App.normalizeTeacherStatus(
                                teacher.status
                            ) ===
                            "active"
                        );
                    }
                ).length;


            const pending =
                App.teachersCache.filter(
                    function (teacher) {

                        return (
                            App.normalizeTeacherStatus(
                                teacher.status
                            ) ===
                            "pending"
                        );
                    }
                ).length;


            App.setText(
                el.teacherTotal,
                total
            );


            App.setText(
                el.activeTeacherTotal,
                active
            );


            App.setText(
                el.pendingTeacherTotal,
                pending
            );


            App.setText(
                el.teacherListCount,
                total
            );
        };


    /* =====================================================
       RENDER TEACHERS
       ===================================================== */

    App.renderTeachers =
        function (teachers) {

            const el =
                App.getTeacherElements();


            if (!el.teacherList) {
                return;
            }


            const list =
                Array.isArray(teachers)
                    ? teachers
                    : [];


            App.setText(
                el.teacherListCount,
                list.length
            );


            if (
                list.length === 0
            ) {

                el.teacherList.innerHTML =
                    `<div class="empty-state">
                        کوئی استاد موجود نہیں۔
                    </div>`;

                return;
            }


            el.teacherList.innerHTML =
                list.map(
                    function (teacher) {

                        const status =
                            App.teacherStatusLabel(
                                teacher.status
                            );


                        return `
                            <div
                                class="teacher-card"
                                data-teacher-id="${App.escapeHTML(
                                    teacher.id
                                )}"
                            >
                                <div class="teacher-card-main">

                                    <h3>
                                        ${App.escapeHTML(
                                            teacher.name
                                        )}
                                    </h3>

                                    <p>
                                        استاد کوڈ:
                                        ${App.escapeHTML(
                                            teacher.teacher_code ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        فون:
                                        ${App.escapeHTML(
                                            teacher.phone ||
                                            "—"
                                        )}
                                    </p>

                                    <p>
                                        قابلیت:
                                        ${App.escapeHTML(
                                            teacher.qualification ||
                                            "—"
                                        )}
                                    </p>

                                    <p>
                                        حالت:
                                        ${App.escapeHTML(
                                            status
                                        )}
                                    </p>

                                </div>

                                <div class="teacher-card-actions">

                                    <button
                                        type="button"
                                        class="view-teacher"
                                        data-id="${App.escapeHTML(
                                            teacher.id
                                        )}"
                                    >
                                        تفصیل
                                    </button>

                                    <button
                                        type="button"
                                        class="edit-teacher"
                                        data-id="${App.escapeHTML(
                                            teacher.id
                                        )}"
                                    >
                                        ترمیم
                                    </button>

                                    ${
                                        App.normalizeTeacherStatus(
                                            teacher.status
                                        ) !==
                                        "disabled"
                                            ? `
                                                <button
                                                    type="button"
                                                    class="deactivate-teacher"
                                                    data-id="${App.escapeHTML(
                                                        teacher.id
                                                    )}"
                                                >
                                                    غیر فعال کریں
                                                </button>
                                              `
                                            : ""
                                    }

                                </div>
                            </div>
                        `;
                    }
                ).join("");


            App.bindTeacherListButtons();
        };


    /* =====================================================
       SEARCH
       ===================================================== */

    App.filterTeachers =
        function () {

            const el =
                App.getTeacherElements();


            const query =
                App.cleanText(
                    el.teacherSearch
                        ? el.teacherSearch.value
                        : ""
                ).toLowerCase();


            if (!query) {

                App.renderTeachers(
                    App.teachersCache
                );

                return;
            }


            const filtered =
                App.teachersCache.filter(
                    function (teacher) {

                        const values = [
                            teacher.teacher_code,
                            teacher.name,
                            teacher.father_name,
                            teacher.phone,
                            teacher.cnic,
                            teacher.qualification,
                            teacher.address,
                            teacher.status
                        ];


                        return values.some(
                            function (value) {

                                return String(
                                    value || ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    );
                            }
                        );
                    }
                );


            App.renderTeachers(
                filtered
            );
        };


    /* =====================================================
       DETAILS
       ===================================================== */

    App.showTeacherDetails =
        function (id) {

            const el =
                App.getTeacherElements();


            const teacher =
                App.teachersCache.find(
                    function (item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );
                    }
                );


            if (!teacher) {
                return;
            }


            App.setText(
                el.teacherDetailsTitle,
                teacher.name ||
                "استاد کی تفصیل"
            );


            if (
                el.teacherDetailsContent
            ) {

                el.teacherDetailsContent.innerHTML = `
                    <p>
                        <strong>استاد کوڈ:</strong>
                        ${App.escapeHTML(
                            teacher.teacher_code ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>نام:</strong>
                        ${App.escapeHTML(
                            teacher.name ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>والد کا نام:</strong>
                        ${App.escapeHTML(
                            teacher.father_name ||
                            "—"
                        )}
                    </p>

                    <p>
                        <strong>فون:</strong>
                        ${App.escapeHTML(
                            teacher.phone ||
                            "—"
                        )}
                    </p>

                    <p>
                        <strong>شناختی کارڈ:</strong>
                        ${App.escapeHTML(
                            teacher.cnic
                                ? App.formatCNIC(
                                    teacher.cnic
                                )
                                : "—"
                        )}
                    </p>

                    <p>
                        <strong>تاریخ پیدائش:</strong>
                        ${App.escapeHTML(
                            App.formatDate(
                                teacher.date_of_birth
                            ) || "—"
                        )}
                    </p>

                    <p>
                        <strong>قابلیت:</strong>
                        ${App.escapeHTML(
                            teacher.qualification ||
                            "—"
                        )}
                    </p>

                    <p>
                        <strong>تاریخ شمولیت:</strong>
                        ${App.escapeHTML(
                            App.formatDate(
                                teacher.joining_date
                            ) || "—"
                        )}
                    </p>

                    <p>
                        <strong>پتہ:</strong>
                        ${App.escapeHTML(
                            teacher.address ||
                            "—"
                        )}
                    </p>

                    <p>
                        <strong>حالت:</strong>
                        ${App.escapeHTML(
                            App.teacherStatusLabel(
                                teacher.status
                            )
                        )}
                    </p>
                `;
            }


            App.show(
                el.teacherDetailsOverlay
            );
        };


    App.closeTeacherDetailsModal =
        function () {

            const el =
                App.getTeacherElements();


            App.hide(
                el.teacherDetailsOverlay
            );
        };


    /* =====================================================
       EDIT TEACHER
       ===================================================== */

    App.editTeacher =
        function (id) {

            const teacher =
                App.teachersCache.find(
                    function (item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );
                    }
                );


            if (!teacher) {
                return;
            }


            App.openTeacherForm(
                teacher
            );
        };


    /* =====================================================
       DEACTIVATE TEACHER
       ===================================================== */

    App.deactivateTeacher =
        async function (id) {

            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const teacher =
                App.teachersCache.find(
                    function (item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );
                    }
                );


            if (!teacher) {
                return;
            }


            const confirmed =
                window.confirm(
                    "کیا آپ واقعی " +
                    teacher.name +
                    " کو غیر فعال کرنا چاہتے ہیں؟ ریکارڈ حذف نہیں ہوگا۔"
                );


            if (!confirmed) {
                return;
            }


            const el =
                App.getTeacherElements();


            try {

                await App.rpc(
                    "admin_deactivate_teacher",
                    {
                        p_token:
                            session.token,

                        p_teacher_id:
                            teacher.id
                    }
                );


                App.showMessage(
                    el.teacherListMessage,
                    "استاد کو غیر فعال کردیا گیا ہے۔",
                    "success"
                );


                await App.loadTeachers();

            } catch (error) {

                App.showMessage(
                    el.teacherListMessage,
                    error.message ||
                    "استاد کو غیر فعال نہیں کیا جاسکا۔",
                    "error"
                );
            }
        };


    /* =====================================================
       LIST BUTTONS
       ===================================================== */

    App.bindTeacherListButtons =
        function () {

            const el =
                App.getTeacherElements();


            if (!el.teacherList) {
                return;
            }


            el.teacherList
                .querySelectorAll(
                    ".view-teacher"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                App.showTeacherDetails(
                                    this.dataset.id
                                );
                            }
                        );
                    }
                );


            el.teacherList
                .querySelectorAll(
                    ".edit-teacher"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                App.editTeacher(
                                    this.dataset.id
                                );
                            }
                        );
                    }
                );


            el.teacherList
                .querySelectorAll(
                    ".deactivate-teacher"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                App.deactivateTeacher(
                                    this.dataset.id
                                );
                            }
                        );
                    }
                );
        };


    /* =====================================================
       INITIALIZE PAGE
       ===================================================== */

    App.initializeTeachersPage =
        async function () {

            if (
                App.currentPage !==
                "teachers.html"
            ) {
                return;
            }


            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            App.touchSession(
                true
            );


            const el =
                App.getTeacherElements();


            App.show(
                el.teacherAdminActions
            );


            App.hide(
                el.teacherFormContainer
            );


            App.hide(
                el.teacherDetailsOverlay
            );


            App.bindPhoneInput(
                el.teacherPhone
            );


            App.bindCNICInput(
                el.teacherCNIC
            );


            if (
                el.backToDashboard
            ) {

                el.backToDashboard
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "dashboard.html";
                        }
                    );
            }


            if (
                el.logoutButton
            ) {

                el.logoutButton
                    .addEventListener(
                        "click",
                        function () {

                            App.logout(
                                "logout"
                            );
                        }
                    );
            }


            if (
                el.showTeacherForm
            ) {

                el.showTeacherForm
                    .addEventListener(
                        "click",
                        function () {

                            App.openTeacherForm();
                        }
                    );
            }


            if (
                el.cancelTeacherButton
            ) {

                el.cancelTeacherButton
                    .addEventListener(
                        "click",
                        function () {

                            App.closeTeacherForm();
                        }
                    );
            }


            if (
                el.teacherForm
            ) {

                el.teacherForm
                    .addEventListener(
                        "submit",
                        App.saveTeacher
                    );
            }


            if (
                el.teacherSearch
            ) {

                el.teacherSearch
                    .addEventListener(
                        "input",
                        App.filterTeachers
                    );
            }


            if (
                el.closeTeacherDetails
            ) {

                el.closeTeacherDetails
                    .addEventListener(
                        "click",
                        App.closeTeacherDetailsModal
                    );
            }


            if (
                el.teacherDetailsOverlay
            ) {

                el.teacherDetailsOverlay
                    .addEventListener(
                        "click",
                        function (event) {

                            if (
                                event.target ===
                                el.teacherDetailsOverlay
                            ) {

                                App.closeTeacherDetailsModal();
                            }
                        }
                    );
            }


            App.resetTeacherForm();


            App.hide(
                el.teacherFormContainer
            );


            await App.loadTeachers();
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeTeachersPage();
        }
    );

})();


/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 6 / STUDENT APPLICATION
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       APPLICATION HELPERS
       ===================================================== */

    App.applicationStatusLabel =
        function (status) {

            switch (
                App.cleanText(status)
                    .toLowerCase()
            ) {

                case "approved":
                    return "منظور شدہ";

                case "rejected":
                    return "مسترد شدہ";

                case "pending":
                    return "زیرِ التواء";

                default:
                    return "نامعلوم";
            }
        };


    App.getApplicationErrorMessage =
        function (error) {

            const message =
                String(
                    error &&
                    error.message
                        ? error.message
                        : ""
                ).toLowerCase();


            if (
                message.includes(
                    "username already exists"
                )
            ) {
                return "یہ صارف نام پہلے سے استعمال ہو رہا ہے۔";
            }


            if (
                message.includes(
                    "pending application already exists"
                )
            ) {
                return "اس صارف نام سے ایک درخواست پہلے ہی زیرِ التواء ہے۔";
            }


            if (
                message.includes(
                    "invalid cnic"
                )
            ) {
                return "شناختی کارڈ نمبر درست نہیں ہے۔";
            }


            if (
                message.includes(
                    "invalid phone"
                )
            ) {
                return "فون نمبر درست نہیں ہے۔";
            }


            if (
                message.includes(
                    "password"
                )
            ) {
                return "پاس ورڈ کم از کم 8 حروف یا اعداد پر مشتمل ہونا چاہیے۔";
            }


            if (
                message.includes(
                    "hostel"
                ) ||
                message.includes(
                    "mahram"
                )
            ) {
                return "ہاسٹل طالبہ کے لیے کم از کم ایک مکمل محرم درج کریں۔";
            }


            return "درخواست جمع نہیں ہوسکی۔ دوبارہ کوشش کریں۔";
        };


    /* =====================================================
       PAGE ELEMENTS
       ===================================================== */

    App.getStudentApplicationElements =
        function () {

            return {

                backToHome:
                    App.byId(
                        "backToHome"
                    ),

                studentApplyMessage:
                    App.byId(
                        "studentApplyMessage"
                    ),

                studentApplyForm:
                    App.byId(
                        "studentApplyForm"
                    ),

                applyAdmissionType:
                    App.byId(
                        "applyAdmissionType"
                    ),

                applyClass:
                    App.byId(
                        "applyClass"
                    ),

                applyPreviousMadrassaGroup:
                    App.byId(
                        "applyPreviousMadrassaGroup"
                    ),

                applyPreviousMadrassa:
                    App.byId(
                        "applyPreviousMadrassa"
                    ),

                applyTransferDateGroup:
                    App.byId(
                        "applyTransferDateGroup"
                    ),

                applyTransferDate:
                    App.byId(
                        "applyTransferDate"
                    ),

                applyStudentName:
                    App.byId(
                        "applyStudentName"
                    ),

                applyFatherName:
                    App.byId(
                        "applyFatherName"
                    ),

                applyGuardianName:
                    App.byId(
                        "applyGuardianName"
                    ),

                applyCNIC:
                    App.byId(
                        "applyCNIC"
                    ),

                applyDateOfBirth:
                    App.byId(
                        "applyDateOfBirth"
                    ),

                applyPhone:
                    App.byId(
                        "applyPhone"
                    ),

                applyAddress:
                    App.byId(
                        "applyAddress"
                    ),

                applyResidenceType:
                    App.byId(
                        "applyResidenceType"
                    ),

                applyMahramSection:
                    App.byId(
                        "applyMahramSection"
                    ),

                applyMahramList:
                    App.byId(
                        "applyMahramList"
                    ),

                addApplyMahram:
                    App.byId(
                        "addApplyMahram"
                    ),

                applyUsername:
                    App.byId(
                        "applyUsername"
                    ),

                applyPassword:
                    App.byId(
                        "applyPassword"
                    ),

                applyConfirmPassword:
                    App.byId(
                        "applyConfirmPassword"
                    ),

                studentApplyConfirmation:
                    App.byId(
                        "studentApplyConfirmation"
                    ),

                submitStudentApplication:
                    App.byId(
                        "submitStudentApplication"
                    ),

                cancelStudentApplication:
                    App.byId(
                        "cancelStudentApplication"
                    ),

                studentApplicationNumber:
                    App.byId(
                        "studentApplicationNumber"
                    ),

                checkStudentApplicationStatus:
                    App.byId(
                        "checkStudentApplicationStatus"
                    ),

                studentApplicationStatusResult:
                    App.byId(
                        "studentApplicationStatusResult"
                    )
            };
        };


    /* =====================================================
       TRANSFER FIELDS
       ===================================================== */

    App.updateStudentApplicationTransferFields =
        function () {

            const el =
                App.getStudentApplicationElements();


            const value =
                el.applyAdmissionType
                    ? el.applyAdmissionType.value
                    : "";


            const isTransfer =
                typeof App.isTransferAdmission ===
                "function"
                    ? App.isTransferAdmission(
                        value
                    )
                    : (
                        App.cleanText(value)
                            .toLowerCase()
                            .includes("transfer") ||
                        App.cleanText(value)
                            .includes("منتقل")
                    );


            if (isTransfer) {

                App.show(
                    el.applyPreviousMadrassaGroup
                );

                App.show(
                    el.applyTransferDateGroup
                );

            } else {

                App.hide(
                    el.applyPreviousMadrassaGroup
                );

                App.hide(
                    el.applyTransferDateGroup
                );


                if (
                    el.applyPreviousMadrassa
                ) {

                    el.applyPreviousMadrassa.value =
                        "";
                }


                if (
                    el.applyTransferDate
                ) {

                    el.applyTransferDate.value =
                        "";
                }
            }
        };


    /* =====================================================
       HOSTEL / MAHRAM
       ===================================================== */

    App.isStudentApplicationHostel =
        function (value) {

            const text =
                App.cleanText(value);


            return (
                text === "ہاسٹل" ||
                text.toLowerCase() ===
                    "hostel"
            );
        };


    App.createStudentApplicationMahramRow =
        function (data = {}) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "mahram-row";


            row.innerHTML = `
                <div class="form-group">
                    <label>
                        محرم کا نام
                    </label>

                    <input
                        type="text"
                        class="apply-mahram-name"
                        autocomplete="off"
                        value="${App.escapeHTML(
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
                        autocomplete="off"
                        value="${App.escapeHTML(
                            data.relation || ""
                        )}"
                    >
                </div>

                <div class="form-group">
                    <label>
                        فون نمبر
                    </label>

                    <input
                        type="tel"
                        class="apply-mahram-phone"
                        inputmode="numeric"
                        maxlength="11"
                        value="${App.escapeHTML(
                            App.normalizePhone(
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
                        class="apply-mahram-cnic"
                        inputmode="numeric"
                        maxlength="15"
                        value="${App.escapeHTML(
                            App.formatCNIC(
                                data.cnic || ""
                            )
                        )}"
                    >
                </div>

                <button
                    type="button"
                    class="remove-apply-mahram"
                >
                    محرم ہٹائیں
                </button>
            `;


            const phone =
                row.querySelector(
                    ".apply-mahram-phone"
                );

            const cnic =
                row.querySelector(
                    ".apply-mahram-cnic"
                );

            const removeButton =
                row.querySelector(
                    ".remove-apply-mahram"
                );


            App.bindPhoneInput(
                phone
            );


            App.bindCNICInput(
                cnic
            );


            if (removeButton) {

                removeButton
                    .addEventListener(
                        "click",
                        function () {

                            row.remove();
                        }
                    );
            }


            return row;
        };


    App.addStudentApplicationMahram =
        function (data = {}) {

            const el =
                App.getStudentApplicationElements();


            if (!el.applyMahramList) {
                return;
            }


            const count =
                el.applyMahramList
                    .querySelectorAll(
                        ".mahram-row"
                    ).length;


            if (
                count >=
                App.MAX_MAHRAMS
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔",
                    "error"
                );

                return;
            }


            el.applyMahramList
                .appendChild(
                    App.createStudentApplicationMahramRow(
                        data
                    )
                );
        };


    App.updateStudentApplicationMahramSection =
        function () {

            const el =
                App.getStudentApplicationElements();


            const isHostel =
                App.isStudentApplicationHostel(
                    el.applyResidenceType
                        ? el.applyResidenceType.value
                        : ""
                );


            if (isHostel) {

                App.show(
                    el.applyMahramSection
                );


                if (
                    el.applyMahramList &&
                    el.applyMahramList
                        .querySelectorAll(
                            ".mahram-row"
                        ).length === 0
                ) {

                    App.addStudentApplicationMahram();
                }

            } else {

                App.hide(
                    el.applyMahramSection
                );
            }
        };


    App.collectStudentApplicationMahrams =
        function () {

            const el =
                App.getStudentApplicationElements();


            if (!el.applyMahramList) {
                return [];
            }


            const result = [];


            el.applyMahramList
                .querySelectorAll(
                    ".mahram-row"
                )
                .forEach(
                    function (row) {

                        const name =
                            App.cleanText(
                                row.querySelector(
                                    ".apply-mahram-name"
                                )?.value
                            );


                        const relation =
                            App.cleanText(
                                row.querySelector(
                                    ".apply-mahram-relation"
                                )?.value
                            );


                        const phone =
                            App.normalizePhone(
                                row.querySelector(
                                    ".apply-mahram-phone"
                                )?.value
                            );


                        const cnic =
                            App.normalizeCNIC(
                                row.querySelector(
                                    ".apply-mahram-cnic"
                                )?.value
                            );


                        if (
                            name ||
                            relation ||
                            phone ||
                            cnic
                        ) {

                            result.push({
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


            return result;
        };


    /* =====================================================
       FORM DATA
       ===================================================== */

    App.getStudentApplicationData =
        function () {

            const el =
                App.getStudentApplicationElements();


            return {

                admissionType:
                    App.cleanText(
                        el.applyAdmissionType
                            ? el.applyAdmissionType.value
                            : ""
                    ),

                studentClass:
                    App.cleanText(
                        el.applyClass
                            ? el.applyClass.value
                            : ""
                    ),

                previousMadrassa:
                    App.cleanText(
                        el.applyPreviousMadrassa
                            ? el.applyPreviousMadrassa.value
                            : ""
                    ),

                transferDate:
                    el.applyTransferDate
                        ? el.applyTransferDate.value
                        : "",

                name:
                    App.cleanText(
                        el.applyStudentName
                            ? el.applyStudentName.value
                            : ""
                    ),

                fatherName:
                    App.cleanText(
                        el.applyFatherName
                            ? el.applyFatherName.value
                            : ""
                    ),

                guardianName:
                    App.cleanText(
                        el.applyGuardianName
                            ? el.applyGuardianName.value
                            : ""
                    ),

                cnic:
                    App.normalizeCNIC(
                        el.applyCNIC
                            ? el.applyCNIC.value
                            : ""
                    ),

                dateOfBirth:
                    el.applyDateOfBirth
                        ? el.applyDateOfBirth.value
                        : "",

                phone:
                    App.normalizePhone(
                        el.applyPhone
                            ? el.applyPhone.value
                            : ""
                    ),

                address:
                    App.cleanText(
                        el.applyAddress
                            ? el.applyAddress.value
                            : ""
                    ),

                residenceType:
                    App.cleanText(
                        el.applyResidenceType
                            ? el.applyResidenceType.value
                            : ""
                    ),

                mahrams:
                    App.collectStudentApplicationMahrams(),

                username:
                    App.cleanText(
                        el.applyUsername
                            ? el.applyUsername.value
                            : ""
                    ),

                password:
                    el.applyPassword
                        ? el.applyPassword.value
                        : "",

                confirmPassword:
                    el.applyConfirmPassword
                        ? el.applyConfirmPassword.value
                        : ""
            };
        };


    /* =====================================================
       VALIDATION
       ===================================================== */

    App.validateStudentApplication =
        function (data) {

            const el =
                App.getStudentApplicationElements();


            if (!data.admissionType) {

                App.showMessage(
                    el.studentApplyMessage,
                    "داخلہ کی قسم منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.studentClass) {

                App.showMessage(
                    el.studentApplyMessage,
                    "درجہ منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.name ||
                !App.isUrduText(
                    data.name
                )
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "طالبہ کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.fatherName ||
                !App.isUrduText(
                    data.fatherName
                )
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "والد کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.guardianName ||
                !App.isUrduText(
                    data.guardianName
                )
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "سرپرست کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidCNIC(
                    data.cnic
                )
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (!data.dateOfBirth) {

                App.showMessage(
                    el.studentApplyMessage,
                    "تاریخ پیدائش درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidPhone(
                    data.phone
                )
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "فون نمبر 11 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (!data.address) {

                App.showMessage(
                    el.studentApplyMessage,
                    "پتہ درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.residenceType) {

                App.showMessage(
                    el.studentApplyMessage,
                    "رہائش کی قسم منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (
                typeof App.isTransferAdmission ===
                    "function" &&
                App.isTransferAdmission(
                    data.admissionType
                ) &&
                !data.previousMadrassa
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "سابقہ مدرسہ درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                App.isStudentApplicationHostel(
                    data.residenceType
                )
            ) {

                if (
                    data.mahrams.length < 1 ||
                    data.mahrams.length >
                        App.MAX_MAHRAMS
                ) {

                    App.showMessage(
                        el.studentApplyMessage,
                        "ہاسٹل طالبہ کے لیے کم از کم ایک اور زیادہ سے زیادہ پانچ محرم درج کریں۔",
                        "error"
                    );

                    return false;
                }


                for (
                    const mahram
                    of data.mahrams
                ) {

                    if (
                        !mahram.name ||
                        !App.isUrduText(
                            mahram.name
                        ) ||
                        !mahram.relation ||
                        !App.isUrduText(
                            mahram.relation
                        ) ||
                        !App.isValidPhone(
                            mahram.phone
                        ) ||
                        !App.isValidCNIC(
                            mahram.cnic
                        )
                    ) {

                        App.showMessage(
                            el.studentApplyMessage,
                            "تمام محرم کی مکمل اور درست معلومات درج کریں۔",
                            "error"
                        );

                        return false;
                    }
                }
            }


            if (
                data.username.length < 4
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "صارف نام کم از کم 4 حروف یا اعداد پر مشتمل ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                data.password.length < 8
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "پاس ورڈ کم از کم 8 حروف یا اعداد پر مشتمل ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                data.password !==
                data.confirmPassword
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔",
                    "error"
                );

                return false;
            }


            if (
                el.studentApplyConfirmation &&
                !el.studentApplyConfirmation.checked
            ) {

                App.showMessage(
                    el.studentApplyMessage,
                    "درخواست جمع کرنے سے پہلے تصدیق کریں۔",
                    "error"
                );

                return false;
            }


            return true;
        };


    /* =====================================================
       SUBMIT APPLICATION
       ===================================================== */

    App.submitStudentApplication =
        async function (event) {

            if (event) {
                event.preventDefault();
            }


            const el =
                App.getStudentApplicationElements();


            const data =
                App.getStudentApplicationData();


            App.clearMessage(
                el.studentApplyMessage
            );


            if (
                !App.validateStudentApplication(
                    data
                )
            ) {
                return;
            }


            App.setButtonBusy(
                el.submitStudentApplication,
                true,
                "درخواست جمع ہو رہی ہے"
            );


            try {

                const applicationNo =
                    await App.rpc(
                        "submit_student_application",
                        {
                            p_admission_type:
                                data.admissionType,

                            p_student_class:
                                data.studentClass,

                            p_previous_madrassa:
                                data.previousMadrassa ||
                                null,

                            p_transfer_date:
                                data.transferDate ||
                                null,

                            p_name:
                                data.name,

                            p_father_name:
                                data.fatherName,

                            p_guardian_name:
                                data.guardianName,

                            p_cnic:
                                data.cnic,

                            p_date_of_birth:
                                data.dateOfBirth,

                            p_phone:
                                data.phone,

                            p_address:
                                data.address,

                            p_residence_type:
                                data.residenceType,

                            p_mahrams:
                                data.mahrams,

                            p_username:
                                data.username,

                            p_password:
                                data.password
                        }
                    );


                if (!applicationNo) {

                    throw new Error(
                        "Application number missing"
                    );
                }


                try {

                    localStorage.setItem(
                        "madrassa_last_student_application_no",
                        String(
                            applicationNo
                        )
                    );

                } catch (error) {
                    /* ignore */
                }


                if (
                    el.studentApplicationNumber
                ) {

                    if (
                        "value" in
                        el.studentApplicationNumber
                    ) {

                        el.studentApplicationNumber.value =
                            String(
                                applicationNo
                            );

                    } else {

                        el.studentApplicationNumber.textContent =
                            String(
                                applicationNo
                            );
                    }
                }


                App.showMessage(
                    el.studentApplyMessage,
                    "درخواست کامیابی سے جمع ہوگئی۔ درخواست نمبر: " +
                    String(
                        applicationNo
                    ),
                    "success"
                );


                if (
                    el.studentApplicationStatusResult
                ) {

                    el.studentApplicationStatusResult.innerHTML = `
                        <div class="application-status-card">
                            <p>
                                <strong>
                                    درخواست نمبر:
                                </strong>
                                ${App.escapeHTML(
                                    applicationNo
                                )}
                            </p>

                            <p>
                                <strong>
                                    حالت:
                                </strong>
                                زیرِ التواء
                            </p>
                        </div>
                    `;
                }


                if (
                    el.studentApplyForm
                ) {

                    el.studentApplyForm.reset();
                }


                if (
                    el.applyMahramList
                ) {

                    el.applyMahramList.innerHTML =
                        "";
                }


                App.updateStudentApplicationTransferFields();

                App.updateStudentApplicationMahramSection();

            } catch (error) {

                App.showMessage(
                    el.studentApplyMessage,
                    App.getApplicationErrorMessage(
                        error
                    ),
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.submitStudentApplication,
                    false
                );
            }
        };


    /* =====================================================
       CHECK APPLICATION STATUS
       ===================================================== */

    App.checkStudentApplicationStatus =
        async function () {

            const el =
                App.getStudentApplicationElements();


            const applicationNo =
                App.cleanText(
                    el.studentApplicationNumber
                        ? (
                            "value" in
                            el.studentApplicationNumber
                                ? el.studentApplicationNumber.value
                                : el.studentApplicationNumber.textContent
                        )
                        : ""
                );


            if (!applicationNo) {

                App.showMessage(
                    el.studentApplicationStatusResult,
                    "درخواست نمبر درج کریں۔",
                    "error"
                );

                return;
            }


            App.setButtonBusy(
                el.checkStudentApplicationStatus,
                true,
                "چیک ہو رہا ہے"
            );


            try {

                const data =
                    await App.rpc(
                        "get_student_application_status",
                        {
                            p_application_no:
                                applicationNo
                        }
                    );


                if (
                    !data ||
                    typeof data !==
                        "object"
                ) {

                    App.showMessage(
                        el.studentApplicationStatusResult,
                        "اس نمبر کی درخواست نہیں ملی۔",
                        "error"
                    );

                    return;
                }


                const statusLabel =
                    App.applicationStatusLabel(
                        data.status
                    );


                const note =
                    App.cleanText(
                        data.admin_note
                    );


                if (
                    el.studentApplicationStatusResult
                ) {

                    el.studentApplicationStatusResult.innerHTML = `
                        <div class="application-status-card">

                            <p>
                                <strong>
                                    درخواست نمبر:
                                </strong>
                                ${App.escapeHTML(
                                    data.application_no ||
                                    applicationNo
                                )}
                            </p>

                            <p>
                                <strong>
                                    طالبہ:
                                </strong>
                                ${App.escapeHTML(
                                    data.name ||
                                    ""
                                )}
                            </p>

                            <p>
                                <strong>
                                    حالت:
                                </strong>
                                ${App.escapeHTML(
                                    statusLabel
                                )}
                            </p>

                            ${
                                note
                                    ? `
                                        <p>
                                            <strong>
                                                ایڈمن نوٹ:
                                            </strong>
                                            ${App.escapeHTML(
                                                note
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                        </div>
                    `;
                }

            } catch (error) {

                App.showMessage(
                    el.studentApplicationStatusResult,
                    "درخواست کی حالت معلوم نہیں ہوسکی۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.checkStudentApplicationStatus,
                    false
                );
            }
        };


    /* =====================================================
       INITIALIZE PAGE
       ===================================================== */

    App.initializeStudentApplicationPage =
        function () {

            if (
                App.currentPage !==
                "student-apply.html"
            ) {
                return;
            }


            const el =
                App.getStudentApplicationElements();


            App.bindCNICInput(
                el.applyCNIC
            );


            App.bindPhoneInput(
                el.applyPhone
            );


            if (
                el.backToHome
            ) {

                el.backToHome
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "index.html";
                        }
                    );
            }


            if (
                el.cancelStudentApplication
            ) {

                el.cancelStudentApplication
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "index.html";
                        }
                    );
            }


            if (
                el.applyAdmissionType
            ) {

                el.applyAdmissionType
                    .addEventListener(
                        "change",
                        App.updateStudentApplicationTransferFields
                    );
            }


            if (
                el.applyResidenceType
            ) {

                el.applyResidenceType
                    .addEventListener(
                        "change",
                        App.updateStudentApplicationMahramSection
                    );
            }


            if (
                el.addApplyMahram
            ) {

                el.addApplyMahram
                    .addEventListener(
                        "click",
                        function () {

                            App.addStudentApplicationMahram();
                        }
                    );
            }


            if (
                el.studentApplyForm
            ) {

                el.studentApplyForm
                    .addEventListener(
                        "submit",
                        App.submitStudentApplication
                    );
            }


            if (
                el.checkStudentApplicationStatus
            ) {

                el.checkStudentApplicationStatus
                    .addEventListener(
                        "click",
                        App.checkStudentApplicationStatus
                    );
            }


            try {

                const savedApplicationNo =
                    localStorage.getItem(
                        "madrassa_last_student_application_no"
                    );


                if (
                    savedApplicationNo &&
                    el.studentApplicationNumber &&
                    "value" in
                    el.studentApplicationNumber &&
                    !el.studentApplicationNumber.value
                ) {

                    el.studentApplicationNumber.value =
                        savedApplicationNo;
                }

            } catch (error) {
                /* ignore */
            }


            App.updateStudentApplicationTransferFields();

            App.updateStudentApplicationMahramSection();
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeStudentApplicationPage();
        }
    );

})();

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 7 / TEACHER APPLICATION
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       PAGE ELEMENTS
       ===================================================== */

    App.getTeacherApplicationElements =
        function () {

            return {

                backToHome:
                    App.byId(
                        "backToHome"
                    ),

                teacherApplyMessage:
                    App.byId(
                        "teacherApplyMessage"
                    ),

                teacherApplyForm:
                    App.byId(
                        "teacherApplyForm"
                    ),

                applyTeacherName:
                    App.byId(
                        "applyTeacherName"
                    ),

                applyTeacherFatherName:
                    App.byId(
                        "applyTeacherFatherName"
                    ),

                applyTeacherCNIC:
                    App.byId(
                        "applyTeacherCNIC"
                    ),

                applyTeacherPhone:
                    App.byId(
                        "applyTeacherPhone"
                    ),

                applyTeacherDateOfBirth:
                    App.byId(
                        "applyTeacherDateOfBirth"
                    ),

                applyTeacherAddress:
                    App.byId(
                        "applyTeacherAddress"
                    ),

                applyTeacherQualification:
                    App.byId(
                        "applyTeacherQualification"
                    ),

                applyTeacherSpecialization:
                    App.byId(
                        "applyTeacherSpecialization"
                    ),

                applyTeacherExperience:
                    App.byId(
                        "applyTeacherExperience"
                    ),

                applyTeacherPreviousInstitute:
                    App.byId(
                        "applyTeacherPreviousInstitute"
                    ),

                applyTeacherPreferredClass:
                    App.byId(
                        "applyTeacherPreferredClass"
                    ),

                applyTeacherAvailableFrom:
                    App.byId(
                        "applyTeacherAvailableFrom"
                    ),

                applyTeacherUsername:
                    App.byId(
                        "applyTeacherUsername"
                    ),

                applyTeacherPassword:
                    App.byId(
                        "applyTeacherPassword"
                    ),

                applyTeacherConfirmPassword:
                    App.byId(
                        "applyTeacherConfirmPassword"
                    ),

                teacherApplyConfirmation:
                    App.byId(
                        "teacherApplyConfirmation"
                    ),

                submitTeacherApplication:
                    App.byId(
                        "submitTeacherApplication"
                    ),

                cancelTeacherApplication:
                    App.byId(
                        "cancelTeacherApplication"
                    ),

                teacherApplicationNumber:
                    App.byId(
                        "teacherApplicationNumber"
                    ),

                checkTeacherApplicationStatus:
                    App.byId(
                        "checkTeacherApplicationStatus"
                    ),

                teacherApplicationStatusResult:
                    App.byId(
                        "teacherApplicationStatusResult"
                    )
            };
        };


    /* =====================================================
       FORM DATA
       ===================================================== */

    App.getTeacherApplicationData =
        function () {

            const el =
                App.getTeacherApplicationElements();


            return {

                name:
                    App.cleanText(
                        el.applyTeacherName
                            ? el.applyTeacherName.value
                            : ""
                    ),

                fatherName:
                    App.cleanText(
                        el.applyTeacherFatherName
                            ? el.applyTeacherFatherName.value
                            : ""
                    ),

                cnic:
                    App.normalizeCNIC(
                        el.applyTeacherCNIC
                            ? el.applyTeacherCNIC.value
                            : ""
                    ),

                phone:
                    App.normalizePhone(
                        el.applyTeacherPhone
                            ? el.applyTeacherPhone.value
                            : ""
                    ),

                dateOfBirth:
                    el.applyTeacherDateOfBirth
                        ? el.applyTeacherDateOfBirth.value
                        : "",

                address:
                    App.cleanText(
                        el.applyTeacherAddress
                            ? el.applyTeacherAddress.value
                            : ""
                    ),

                qualification:
                    App.cleanText(
                        el.applyTeacherQualification
                            ? el.applyTeacherQualification.value
                            : ""
                    ),

                specialization:
                    App.cleanText(
                        el.applyTeacherSpecialization
                            ? el.applyTeacherSpecialization.value
                            : ""
                    ),

                experience:
                    App.cleanText(
                        el.applyTeacherExperience
                            ? el.applyTeacherExperience.value
                            : ""
                    ),

                previousInstitute:
                    App.cleanText(
                        el.applyTeacherPreviousInstitute
                            ? el.applyTeacherPreviousInstitute.value
                            : ""
                    ),

                preferredClass:
                    App.cleanText(
                        el.applyTeacherPreferredClass
                            ? el.applyTeacherPreferredClass.value
                            : ""
                    ),

                availableFrom:
                    el.applyTeacherAvailableFrom
                        ? el.applyTeacherAvailableFrom.value
                        : "",

                username:
                    App.cleanText(
                        el.applyTeacherUsername
                            ? el.applyTeacherUsername.value
                            : ""
                    ),

                password:
                    el.applyTeacherPassword
                        ? el.applyTeacherPassword.value
                        : "",

                confirmPassword:
                    el.applyTeacherConfirmPassword
                        ? el.applyTeacherConfirmPassword.value
                        : ""
            };
        };


    /* =====================================================
       VALIDATION
       ===================================================== */

    App.validateTeacherApplication =
        function (data) {

            const el =
                App.getTeacherApplicationElements();


            if (
                !data.name ||
                !App.isUrduText(
                    data.name
                )
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "استاد کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                data.fatherName &&
                !App.isUrduText(
                    data.fatherName
                )
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "والد کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidCNIC(
                    data.cnic
                )
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidPhone(
                    data.phone
                )
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "فون نمبر 11 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (!data.dateOfBirth) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "تاریخ پیدائش درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.address) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "پتہ درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.qualification) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "تعلیمی قابلیت درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                data.username.length < 4
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "صارف نام کم از کم 4 حروف یا اعداد پر مشتمل ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                data.password.length < 8
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "پاس ورڈ کم از کم 8 حروف یا اعداد پر مشتمل ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                data.password !==
                data.confirmPassword
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔",
                    "error"
                );

                return false;
            }


            if (
                el.teacherApplyConfirmation &&
                !el.teacherApplyConfirmation.checked
            ) {

                App.showMessage(
                    el.teacherApplyMessage,
                    "درخواست جمع کرنے سے پہلے تصدیق کریں۔",
                    "error"
                );

                return false;
            }


            return true;
        };


    /* =====================================================
       TEACHER APPLICATION ERROR
       ===================================================== */

    App.getTeacherApplicationError =
        function (error) {

            const message =
                String(
                    error &&
                    error.message
                        ? error.message
                        : ""
                ).toLowerCase();


            if (
                message.includes(
                    "username already exists"
                )
            ) {

                return "یہ صارف نام پہلے سے استعمال ہو رہا ہے۔";
            }


            if (
                message.includes(
                    "pending application already exists"
                )
            ) {

                return "اس صارف نام سے ایک درخواست پہلے ہی زیرِ التواء ہے۔";
            }


            if (
                message.includes(
                    "invalid cnic"
                )
            ) {

                return "شناختی کارڈ نمبر درست نہیں ہے۔";
            }


            if (
                message.includes(
                    "invalid phone"
                )
            ) {

                return "فون نمبر درست نہیں ہے۔";
            }


            if (
                message.includes(
                    "password"
                )
            ) {

                return "پاس ورڈ کم از کم 8 حروف یا اعداد پر مشتمل ہونا چاہیے۔";
            }


            return "درخواست جمع نہیں ہوسکی۔ دوبارہ کوشش کریں۔";
        };


    /* =====================================================
       SUBMIT TEACHER APPLICATION
       ===================================================== */

    App.submitTeacherApplication =
        async function (event) {

            if (event) {
                event.preventDefault();
            }


            const el =
                App.getTeacherApplicationElements();


            App.clearMessage(
                el.teacherApplyMessage
            );


            const data =
                App.getTeacherApplicationData();


            if (
                !App.validateTeacherApplication(
                    data
                )
            ) {
                return;
            }


            App.setButtonBusy(
                el.submitTeacherApplication,
                true,
                "درخواست جمع ہو رہی ہے"
            );


            try {

                const applicationNo =
                    await App.rpc(
                        "submit_teacher_application",
                        {
                            p_name:
                                data.name,

                            p_father_name:
                                data.fatherName ||
                                null,

                            p_cnic:
                                data.cnic,

                            p_phone:
                                data.phone,

                            p_date_of_birth:
                                data.dateOfBirth ||
                                null,

                            p_address:
                                data.address ||
                                null,

                            p_qualification:
                                data.qualification ||
                                null,

                            p_specialization:
                                data.specialization ||
                                null,

                            p_experience:
                                data.experience ||
                                null,

                            p_previous_institute:
                                data.previousInstitute ||
                                null,

                            p_preferred_class:
                                data.preferredClass ||
                                null,

                            p_available_from:
                                data.availableFrom ||
                                null,

                            p_username:
                                data.username,

                            p_password:
                                data.password
                        }
                    );


                if (!applicationNo) {

                    throw new Error(
                        "Application number missing"
                    );
                }


                try {

                    localStorage.setItem(
                        "madrassa_last_teacher_application_no",
                        String(
                            applicationNo
                        )
                    );

                } catch (error) {
                    /* ignore */
                }


                if (
                    el.teacherApplicationNumber
                ) {

                    if (
                        "value" in
                        el.teacherApplicationNumber
                    ) {

                        el.teacherApplicationNumber.value =
                            String(
                                applicationNo
                            );

                    } else {

                        el.teacherApplicationNumber.textContent =
                            String(
                                applicationNo
                            );
                    }
                }


                App.showMessage(
                    el.teacherApplyMessage,
                    "درخواست کامیابی سے جمع ہوگئی۔ درخواست نمبر: " +
                    String(
                        applicationNo
                    ),
                    "success"
                );


                if (
                    el.teacherApplicationStatusResult
                ) {

                    el.teacherApplicationStatusResult.innerHTML = `
                        <div class="application-status-card">

                            <p>
                                <strong>
                                    درخواست نمبر:
                                </strong>

                                ${App.escapeHTML(
                                    applicationNo
                                )}
                            </p>

                            <p>
                                <strong>
                                    حالت:
                                </strong>

                                زیرِ التواء
                            </p>

                        </div>
                    `;
                }


                if (
                    el.teacherApplyForm
                ) {

                    el.teacherApplyForm.reset();
                }

            } catch (error) {

                console.error(
                    "Teacher application error:",
                    error
                );


                App.showMessage(
                    el.teacherApplyMessage,
                    App.getTeacherApplicationError(
                        error
                    ),
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.submitTeacherApplication,
                    false
                );
            }
        };


    /* =====================================================
       CHECK TEACHER APPLICATION STATUS
       ===================================================== */

    App.checkTeacherApplicationStatus =
        async function () {

            const el =
                App.getTeacherApplicationElements();


            const applicationNo =
                App.cleanText(
                    el.teacherApplicationNumber
                        ? (
                            "value" in
                            el.teacherApplicationNumber
                                ? el.teacherApplicationNumber.value
                                : el.teacherApplicationNumber.textContent
                        )
                        : ""
                );


            if (!applicationNo) {

                App.showMessage(
                    el.teacherApplicationStatusResult,
                    "درخواست نمبر درج کریں۔",
                    "error"
                );

                return;
            }


            App.setButtonBusy(
                el.checkTeacherApplicationStatus,
                true,
                "چیک ہو رہا ہے"
            );


            try {

                const data =
                    await App.rpc(
                        "get_teacher_application_status",
                        {
                            p_application_no:
                                applicationNo
                        }
                    );


                if (
                    !data ||
                    typeof data !==
                        "object"
                ) {

                    App.showMessage(
                        el.teacherApplicationStatusResult,
                        "اس نمبر کی درخواست نہیں ملی۔",
                        "error"
                    );

                    return;
                }


                const statusLabel =
                    typeof App.applicationStatusLabel ===
                    "function"
                        ? App.applicationStatusLabel(
                            data.status
                        )
                        : App.cleanText(
                            data.status
                        );


                const note =
                    App.cleanText(
                        data.admin_note
                    );


                if (
                    el.teacherApplicationStatusResult
                ) {

                    el.teacherApplicationStatusResult.innerHTML = `
                        <div class="application-status-card">

                            <p>
                                <strong>
                                    درخواست نمبر:
                                </strong>

                                ${App.escapeHTML(
                                    data.application_no ||
                                    applicationNo
                                )}
                            </p>

                            <p>
                                <strong>
                                    استاد:
                                </strong>

                                ${App.escapeHTML(
                                    data.name ||
                                    ""
                                )}
                            </p>

                            <p>
                                <strong>
                                    حالت:
                                </strong>

                                ${App.escapeHTML(
                                    statusLabel
                                )}
                            </p>

                            ${
                                note
                                    ? `
                                        <p>
                                            <strong>
                                                ایڈمن نوٹ:
                                            </strong>

                                            ${App.escapeHTML(
                                                note
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                        </div>
                    `;
                }

            } catch (error) {

                console.error(
                    "Teacher application status error:",
                    error
                );


                App.showMessage(
                    el.teacherApplicationStatusResult,
                    "درخواست کی حالت معلوم نہیں ہوسکی۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.checkTeacherApplicationStatus,
                    false
                );
            }
        };


    /* =====================================================
       RESTORE LAST APPLICATION NUMBER
       ===================================================== */

    App.restoreTeacherApplicationNumber =
        function () {

            const el =
                App.getTeacherApplicationElements();


            if (
                !el.teacherApplicationNumber ||
                !(
                    "value" in
                    el.teacherApplicationNumber
                )
            ) {
                return;
            }


            if (
                App.cleanText(
                    el.teacherApplicationNumber.value
                )
            ) {
                return;
            }


            try {

                const saved =
                    localStorage.getItem(
                        "madrassa_last_teacher_application_no"
                    );


                if (saved) {

                    el.teacherApplicationNumber.value =
                        saved;
                }

            } catch (error) {
                /* ignore */
            }
        };


    /* =====================================================
       INITIALIZE TEACHER APPLICATION PAGE
       ===================================================== */

    App.initializeTeacherApplicationPage =
        function () {

            if (
                App.currentPage !==
                "teacher-apply.html"
            ) {
                return;
            }


            const el =
                App.getTeacherApplicationElements();


            App.bindCNICInput(
                el.applyTeacherCNIC
            );


            App.bindPhoneInput(
                el.applyTeacherPhone
            );


            if (
                el.backToHome
            ) {

                el.backToHome
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "index.html";
                        }
                    );
            }


            if (
                el.cancelTeacherApplication
            ) {

                el.cancelTeacherApplication
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "index.html";
                        }
                    );
            }


            if (
                el.teacherApplyForm
            ) {

                el.teacherApplyForm
                    .addEventListener(
                        "submit",
                        App.submitTeacherApplication
                    );
            }


            if (
                el.checkTeacherApplicationStatus
            ) {

                el.checkTeacherApplicationStatus
                    .addEventListener(
                        "click",
                        App.checkTeacherApplicationStatus
                    );
            }


            App.restoreTeacherApplicationNumber();
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeTeacherApplicationPage();
        }
    );

})();


/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 8 / APPLICATION APPROVALS
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       APPROVAL STATE
       ===================================================== */

    App.studentApplicationsCache = [];

    App.teacherApplicationsCache = [];

    App.selectedApplicationType = null;

    App.selectedApplicationId = null;

    App.pendingApplicationDecision = null;


    /* =====================================================
       PAGE ELEMENTS
       ===================================================== */

    App.getApprovalElements =
        function () {

            return {

                backToDashboard:
                    App.byId(
                        "backToDashboard"
                    ),

                pendingStudentApplications:
                    App.byId(
                        "pendingStudentApplications"
                    ),

                pendingTeacherApplications:
                    App.byId(
                        "pendingTeacherApplications"
                    ),

                approvedApplicationsTotal:
                    App.byId(
                        "approvedApplicationsTotal"
                    ),

                rejectedApplicationsTotal:
                    App.byId(
                        "rejectedApplicationsTotal"
                    ),

                studentApplicationsSection:
                    App.byId(
                        "studentApplicationsSection"
                    ),

                studentApplicationCount:
                    App.byId(
                        "studentApplicationCount"
                    ),

                studentApplicationsMessage:
                    App.byId(
                        "studentApplicationsMessage"
                    ),

                studentApplicationsList:
                    App.byId(
                        "studentApplicationsList"
                    ),

                teacherApplicationsSection:
                    App.byId(
                        "teacherApplicationsSection"
                    ),

                teacherApplicationCount:
                    App.byId(
                        "teacherApplicationCount"
                    ),

                teacherApplicationsMessage:
                    App.byId(
                        "teacherApplicationsMessage"
                    ),

                teacherApplicationsList:
                    App.byId(
                        "teacherApplicationsList"
                    ),

                applicationDetailsOverlay:
                    App.byId(
                        "applicationDetailsOverlay"
                    ),

                applicationDetailsTitle:
                    App.byId(
                        "applicationDetailsTitle"
                    ),

                closeApplicationDetails:
                    App.byId(
                        "closeApplicationDetails"
                    ),

                applicationDetailsContent:
                    App.byId(
                        "applicationDetailsContent"
                    ),

                applicationDecisionSection:
                    App.byId(
                        "applicationDecisionSection"
                    ),

                applicationAdminNote:
                    App.byId(
                        "applicationAdminNote"
                    ),

                approveApplicationButton:
                    App.byId(
                        "approveApplicationButton"
                    ),

                rejectApplicationButton:
                    App.byId(
                        "rejectApplicationButton"
                    ),

                approvalConfirmationOverlay:
                    App.byId(
                        "approvalConfirmationOverlay"
                    ),

                approvalConfirmationTitle:
                    App.byId(
                        "approvalConfirmationTitle"
                    ),

                closeApprovalConfirmation:
                    App.byId(
                        "closeApprovalConfirmation"
                    ),

                approvalConfirmationContent:
                    App.byId(
                        "approvalConfirmationContent"
                    ),

                confirmApplicationDecision:
                    App.byId(
                        "confirmApplicationDecision"
                    ),

                cancelApplicationDecision:
                    App.byId(
                        "cancelApplicationDecision"
                    )
            };
        };


    /* =====================================================
       STATUS HELPERS
       ===================================================== */

    App.normalizeApplicationStatus =
        function (status) {

            const value =
                App.cleanText(
                    status
                ).toLowerCase();


            if (
                value === "approved"
            ) {
                return "approved";
            }


            if (
                value === "rejected"
            ) {
                return "rejected";
            }


            return "pending";
        };


    App.getApprovalStatusLabel =
        function (status) {

            const value =
                App.normalizeApplicationStatus(
                    status
                );


            if (
                value === "approved"
            ) {
                return "منظور شدہ";
            }


            if (
                value === "rejected"
            ) {
                return "مسترد شدہ";
            }


            return "زیرِ التواء";
        };


    App.getApplicationTypeLabel =
        function (type) {

            return (
                type === "teacher"
                    ? "استاد"
                    : "طالبہ"
            );
        };


    /* =====================================================
       FIND APPLICATION
       ===================================================== */

    App.findApplication =
        function (
            type,
            id
        ) {

            const list =
                type === "teacher"
                    ? App.teacherApplicationsCache
                    : App.studentApplicationsCache;


            return (
                list.find(
                    function (item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(id)
                        );
                    }
                ) ||
                null
            );
        };


    /* =====================================================
       STATISTICS
       ===================================================== */

    App.updateApprovalStats =
        function () {

            const el =
                App.getApprovalElements();


            const allApplications = [
                ...App.studentApplicationsCache,
                ...App.teacherApplicationsCache
            ];


            const pendingStudents =
                App.studentApplicationsCache
                    .filter(
                        function (item) {

                            return (
                                App.normalizeApplicationStatus(
                                    item.status
                                ) ===
                                "pending"
                            );
                        }
                    ).length;


            const pendingTeachers =
                App.teacherApplicationsCache
                    .filter(
                        function (item) {

                            return (
                                App.normalizeApplicationStatus(
                                    item.status
                                ) ===
                                "pending"
                            );
                        }
                    ).length;


            const approved =
                allApplications
                    .filter(
                        function (item) {

                            return (
                                App.normalizeApplicationStatus(
                                    item.status
                                ) ===
                                "approved"
                            );
                        }
                    ).length;


            const rejected =
                allApplications
                    .filter(
                        function (item) {

                            return (
                                App.normalizeApplicationStatus(
                                    item.status
                                ) ===
                                "rejected"
                            );
                        }
                    ).length;


            App.setText(
                el.pendingStudentApplications,
                pendingStudents
            );


            App.setText(
                el.pendingTeacherApplications,
                pendingTeachers
            );


            App.setText(
                el.approvedApplicationsTotal,
                approved
            );


            App.setText(
                el.rejectedApplicationsTotal,
                rejected
            );


            App.setText(
                el.studentApplicationCount,
                App.studentApplicationsCache.length
            );


            App.setText(
                el.teacherApplicationCount,
                App.teacherApplicationsCache.length
            );
        };


    /* =====================================================
       APPLICATION CARD
       ===================================================== */

    App.createApplicationCardHTML =
        function (
            application,
            type
        ) {

            const status =
                App.normalizeApplicationStatus(
                    application.status
                );


            const statusLabel =
                App.getApprovalStatusLabel(
                    status
                );


            const applicationNo =
                application.application_no ||
                "";


            const name =
                application.name ||
                "";


            const phone =
                application.phone ||
                "—";


            const submitted =
                App.formatDate(
                    application.submitted_at
                ) || "—";


            return `
                <div
                    class="application-card"
                    data-application-id="${App.escapeHTML(
                        application.id
                    )}"
                    data-application-type="${App.escapeHTML(
                        type
                    )}"
                >

                    <div class="application-card-main">

                        <h3>
                            ${App.escapeHTML(
                                name
                            )}
                        </h3>

                        <p>
                            درخواست نمبر:
                            ${App.escapeHTML(
                                applicationNo
                            )}
                        </p>

                        <p>
                            فون:
                            ${App.escapeHTML(
                                phone
                            )}
                        </p>

                        <p>
                            تاریخ:
                            ${App.escapeHTML(
                                submitted
                            )}
                        </p>

                        <p>
                            حالت:
                            ${App.escapeHTML(
                                statusLabel
                            )}
                        </p>

                    </div>

                    <div class="application-card-actions">

                        <button
                            type="button"
                            class="view-application"
                            data-id="${App.escapeHTML(
                                application.id
                            )}"
                            data-type="${App.escapeHTML(
                                type
                            )}"
                        >
                            تفصیل
                        </button>

                    </div>

                </div>
            `;
        };


    /* =====================================================
       RENDER STUDENT APPLICATIONS
       ===================================================== */

    App.renderStudentApplications =
        function () {

            const el =
                App.getApprovalElements();


            if (
                !el.studentApplicationsList
            ) {
                return;
            }


            if (
                App.studentApplicationsCache
                    .length === 0
            ) {

                el.studentApplicationsList.innerHTML =
                    `
                        <div class="empty-state">
                            طالبات کی کوئی درخواست موجود نہیں۔
                        </div>
                    `;

                return;
            }


            el.studentApplicationsList.innerHTML =
                App.studentApplicationsCache
                    .map(
                        function (application) {

                            return (
                                App.createApplicationCardHTML(
                                    application,
                                    "student"
                                )
                            );
                        }
                    )
                    .join("");


            App.bindApplicationCards(
                el.studentApplicationsList
            );
        };


    /* =====================================================
       RENDER TEACHER APPLICATIONS
       ===================================================== */

    App.renderTeacherApplications =
        function () {

            const el =
                App.getApprovalElements();


            if (
                !el.teacherApplicationsList
            ) {
                return;
            }


            if (
                App.teacherApplicationsCache
                    .length === 0
            ) {

                el.teacherApplicationsList.innerHTML =
                    `
                        <div class="empty-state">
                            اساتذہ کی کوئی درخواست موجود نہیں۔
                        </div>
                    `;

                return;
            }


            el.teacherApplicationsList.innerHTML =
                App.teacherApplicationsCache
                    .map(
                        function (application) {

                            return (
                                App.createApplicationCardHTML(
                                    application,
                                    "teacher"
                                )
                            );
                        }
                    )
                    .join("");


            App.bindApplicationCards(
                el.teacherApplicationsList
            );
        };


    /* =====================================================
       BIND APPLICATION CARDS
       ===================================================== */

    App.bindApplicationCards =
        function (container) {

            if (!container) {
                return;
            }


            container
                .querySelectorAll(
                    ".view-application"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                App.showApplicationDetails(
                                    this.dataset.type,
                                    this.dataset.id
                                );
                            }
                        );
                    }
                );
        };


    /* =====================================================
       LOAD APPLICATIONS
       ===================================================== */

    App.loadApplications =
        async function () {

            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const el =
                App.getApprovalElements();


            App.showMessage(
                el.studentApplicationsMessage,
                "درخواستیں لوڈ ہو رہی ہیں۔",
                "info"
            );


            App.showMessage(
                el.teacherApplicationsMessage,
                "درخواستیں لوڈ ہو رہی ہیں۔",
                "info"
            );


            try {

                const results =
                    await Promise.all([
                        App.rpc(
                            "admin_get_student_applications",
                            {
                                p_token:
                                    session.token
                            }
                        ),

                        App.rpc(
                            "admin_get_teacher_applications",
                            {
                                p_token:
                                    session.token
                            }
                        )
                    ]);


                App.studentApplicationsCache =
                    Array.isArray(
                        results[0]
                    )
                        ? results[0]
                        : [];


                App.teacherApplicationsCache =
                    Array.isArray(
                        results[1]
                    )
                        ? results[1]
                        : [];


                App.clearMessage(
                    el.studentApplicationsMessage
                );


                App.clearMessage(
                    el.teacherApplicationsMessage
                );


                App.updateApprovalStats();

                App.renderStudentApplications();

                App.renderTeacherApplications();

            } catch (error) {

                console.error(
                    "Application loading error:",
                    error
                );


                App.studentApplicationsCache =
                    [];

                App.teacherApplicationsCache =
                    [];


                App.updateApprovalStats();

                App.renderStudentApplications();

                App.renderTeacherApplications();


                App.showMessage(
                    el.studentApplicationsMessage,
                    error.message ||
                    "درخواستیں لوڈ نہیں ہوسکیں۔",
                    "error"
                );


                App.showMessage(
                    el.teacherApplicationsMessage,
                    error.message ||
                    "درخواستیں لوڈ نہیں ہوسکیں۔",
                    "error"
                );
            }
        };


    /* =====================================================
       STUDENT DETAILS HTML
       ===================================================== */

    App.getStudentApplicationDetailsHTML =
        function (
            application
        ) {

            const mahrams =
                Array.isArray(
                    application.mahrams
                )
                    ? application.mahrams
                    : [];


            const mahramHTML =
                mahrams.length > 0
                    ? mahrams
                        .map(
                            function (
                                mahram,
                                index
                            ) {

                                return `
                                    <div class="mahram-detail">

                                        <h4>
                                            محرم ${index + 1}
                                        </h4>

                                        <p>
                                            <strong>
                                                نام:
                                            </strong>

                                            ${App.escapeHTML(
                                                mahram.name ||
                                                ""
                                            )}
                                        </p>

                                        <p>
                                            <strong>
                                                رشتہ:
                                            </strong>

                                            ${App.escapeHTML(
                                                mahram.relation ||
                                                ""
                                            )}
                                        </p>

                                        <p>
                                            <strong>
                                                فون:
                                            </strong>

                                            ${App.escapeHTML(
                                                mahram.phone ||
                                                ""
                                            )}
                                        </p>

                                        <p>
                                            <strong>
                                                شناختی کارڈ:
                                            </strong>

                                            ${App.escapeHTML(
                                                App.formatCNIC(
                                                    mahram.cnic ||
                                                    ""
                                                )
                                            )}
                                        </p>

                                    </div>
                                `;
                            }
                        )
                        .join("")
                    : "<p>کوئی محرم درج نہیں۔</p>";


            return `
                <p>
                    <strong>درخواست نمبر:</strong>
                    ${App.escapeHTML(
                        application.application_no ||
                        ""
                    )}
                </p>

                <p>
                    <strong>طالبہ:</strong>
                    ${App.escapeHTML(
                        application.name ||
                        ""
                    )}
                </p>

                <p>
                    <strong>والد:</strong>
                    ${App.escapeHTML(
                        application.father_name ||
                        ""
                    )}
                </p>

                <p>
                    <strong>سرپرست:</strong>
                    ${App.escapeHTML(
                        application.guardian_name ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>شناختی کارڈ:</strong>
                    ${App.escapeHTML(
                        App.formatCNIC(
                            application.cnic ||
                            ""
                        )
                    )}
                </p>

                <p>
                    <strong>فون:</strong>
                    ${App.escapeHTML(
                        application.phone ||
                        ""
                    )}
                </p>

                <p>
                    <strong>تاریخ پیدائش:</strong>
                    ${App.escapeHTML(
                        App.formatDate(
                            application.date_of_birth
                        ) || "—"
                    )}
                </p>

                <p>
                    <strong>درجہ:</strong>
                    ${App.escapeHTML(
                        application.student_class ||
                        ""
                    )}
                </p>

                <p>
                    <strong>داخلہ کی قسم:</strong>
                    ${App.escapeHTML(
                        application.admission_type ||
                        ""
                    )}
                </p>

                <p>
                    <strong>سابقہ مدرسہ:</strong>
                    ${App.escapeHTML(
                        application.previous_madrassa ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>منتقلی کی تاریخ:</strong>
                    ${App.escapeHTML(
                        App.formatDate(
                            application.transfer_date
                        ) || "—"
                    )}
                </p>

                <p>
                    <strong>رہائش:</strong>
                    ${App.escapeHTML(
                        application.residence_type ||
                        ""
                    )}
                </p>

                <p>
                    <strong>پتہ:</strong>
                    ${App.escapeHTML(
                        application.address ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>صارف نام:</strong>
                    ${App.escapeHTML(
                        application.username ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>درخواست کی حالت:</strong>
                    ${App.escapeHTML(
                        App.getApprovalStatusLabel(
                            application.status
                        )
                    )}
                </p>

                <p>
                    <strong>جمع ہونے کی تاریخ:</strong>
                    ${App.escapeHTML(
                        App.formatDate(
                            application.submitted_at
                        ) || "—"
                    )}
                </p>

                ${
                    application.admin_note
                        ? `
                            <p>
                                <strong>
                                    سابقہ ایڈمن نوٹ:
                                </strong>

                                ${App.escapeHTML(
                                    application.admin_note
                                )}
                            </p>
                          `
                        : ""
                }

                <hr>

                <h3>
                    محرم
                </h3>

                ${mahramHTML}
            `;
        };


    /* =====================================================
       TEACHER DETAILS HTML
       ===================================================== */

    App.getTeacherApplicationDetailsHTML =
        function (
            application
        ) {

            return `
                <p>
                    <strong>درخواست نمبر:</strong>
                    ${App.escapeHTML(
                        application.application_no ||
                        ""
                    )}
                </p>

                <p>
                    <strong>استاد:</strong>
                    ${App.escapeHTML(
                        application.name ||
                        ""
                    )}
                </p>

                <p>
                    <strong>والد:</strong>
                    ${App.escapeHTML(
                        application.father_name ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>شناختی کارڈ:</strong>
                    ${App.escapeHTML(
                        App.formatCNIC(
                            application.cnic ||
                            ""
                        )
                    )}
                </p>

                <p>
                    <strong>فون:</strong>
                    ${App.escapeHTML(
                        application.phone ||
                        ""
                    )}
                </p>

                <p>
                    <strong>تاریخ پیدائش:</strong>
                    ${App.escapeHTML(
                        App.formatDate(
                            application.date_of_birth
                        ) || "—"
                    )}
                </p>

                <p>
                    <strong>قابلیت:</strong>
                    ${App.escapeHTML(
                        application.qualification ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>تخصص:</strong>
                    ${App.escapeHTML(
                        application.specialization ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>تجربہ:</strong>
                    ${App.escapeHTML(
                        application.experience ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>سابقہ ادارہ:</strong>
                    ${App.escapeHTML(
                        application.previous_institute ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>پسندیدہ درجہ:</strong>
                    ${App.escapeHTML(
                        application.preferred_class ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>دستیابی:</strong>
                    ${App.escapeHTML(
                        App.formatDate(
                            application.available_from
                        ) || "—"
                    )}
                </p>

                <p>
                    <strong>پتہ:</strong>
                    ${App.escapeHTML(
                        application.address ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>صارف نام:</strong>
                    ${App.escapeHTML(
                        application.username ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>درخواست کی حالت:</strong>
                    ${App.escapeHTML(
                        App.getApprovalStatusLabel(
                            application.status
                        )
                    )}
                </p>

                <p>
                    <strong>جمع ہونے کی تاریخ:</strong>
                    ${App.escapeHTML(
                        App.formatDate(
                            application.submitted_at
                        ) || "—"
                    )}
                </p>

                ${
                    application.admin_note
                        ? `
                            <p>
                                <strong>
                                    سابقہ ایڈمن نوٹ:
                                </strong>

                                ${App.escapeHTML(
                                    application.admin_note
                                )}
                            </p>
                          `
                        : ""
                }
            `;
        };


    /* =====================================================
       SHOW APPLICATION DETAILS
       ===================================================== */

    App.showApplicationDetails =
        function (
            type,
            id
        ) {

            const el =
                App.getApprovalElements();


            const application =
                App.findApplication(
                    type,
                    id
                );


            if (!application) {
                return;
            }


            App.selectedApplicationType =
                type;

            App.selectedApplicationId =
                application.id;

            App.pendingApplicationDecision =
                null;


            App.setText(
                el.applicationDetailsTitle,
                App.getApplicationTypeLabel(
                    type
                ) +
                " کی درخواست"
            );


            if (
                el.applicationDetailsContent
            ) {

                el.applicationDetailsContent.innerHTML =
                    type === "teacher"
                        ? App.getTeacherApplicationDetailsHTML(
                            application
                        )
                        : App.getStudentApplicationDetailsHTML(
                            application
                        );
            }


            if (
                el.applicationAdminNote
            ) {

                el.applicationAdminNote.value =
                    application.admin_note ||
                    "";
            }


            if (
                App.normalizeApplicationStatus(
                    application.status
                ) === "pending"
            ) {

                App.show(
                    el.applicationDecisionSection
                );

            } else {

                App.hide(
                    el.applicationDecisionSection
                );
            }


            App.show(
                el.applicationDetailsOverlay
            );
        };


    /* =====================================================
       CLOSE DETAILS
       ===================================================== */

    App.closeApplicationDetailsModal =
        function () {

            const el =
                App.getApprovalElements();


            App.hide(
                el.applicationDetailsOverlay
            );


            App.selectedApplicationType =
                null;

            App.selectedApplicationId =
                null;

            App.pendingApplicationDecision =
                null;
        };


    /* =====================================================
       OPEN CONFIRMATION
       ===================================================== */

    App.openApplicationDecisionConfirmation =
        function (
            decision
        ) {

            const el =
                App.getApprovalElements();


            if (
                !App.selectedApplicationType ||
                !App.selectedApplicationId
            ) {
                return;
            }


            const application =
                App.findApplication(
                    App.selectedApplicationType,
                    App.selectedApplicationId
                );


            if (!application) {
                return;
            }


            if (
                App.normalizeApplicationStatus(
                    application.status
                ) !== "pending"
            ) {
                return;
            }


            App.pendingApplicationDecision =
                decision;


            const isApproval =
                decision === "approve";


            App.setText(
                el.approvalConfirmationTitle,
                isApproval
                    ? "درخواست منظور کریں"
                    : "درخواست مسترد کریں"
            );


            if (
                el.approvalConfirmationContent
            ) {

                el.approvalConfirmationContent.innerHTML = `
                    <p>
                        کیا آپ واقعی
                        <strong>
                            ${App.escapeHTML(
                                application.name ||
                                ""
                            )}
                        </strong>
                        کی درخواست
                        ${
                            isApproval
                                ? "منظور"
                                : "مسترد"
                        }
                        کرنا چاہتے ہیں؟
                    </p>
                `;
            }


            if (
                el.confirmApplicationDecision
            ) {

                el.confirmApplicationDecision.textContent =
                    isApproval
                        ? "ہاں، منظور کریں"
                        : "ہاں، مسترد کریں";
            }


            App.show(
                el.approvalConfirmationOverlay
            );
        };


    /* =====================================================
       CLOSE CONFIRMATION
       ===================================================== */

    App.closeApplicationConfirmation =
        function () {

            const el =
                App.getApprovalElements();


            App.hide(
                el.approvalConfirmationOverlay
            );


            App.pendingApplicationDecision =
                null;
        };


    /* =====================================================
       EXECUTE DECISION
       ===================================================== */

    App.executeApplicationDecision =
        async function () {

            const session =
                App.requireAdmin();

            if (!session) {
                return;
            }


            const type =
                App.selectedApplicationType;


            const id =
                App.selectedApplicationId;


            const decision =
                App.pendingApplicationDecision;


            if (
                !type ||
                !id ||
                !decision
            ) {
                return;
            }


            const el =
                App.getApprovalElements();


            const note =
                App.cleanText(
                    el.applicationAdminNote
                        ? el.applicationAdminNote.value
                        : ""
                );


            let rpcName = "";


            if (
                type === "student" &&
                decision === "approve"
            ) {

                rpcName =
                    "admin_approve_student_application";

            } else if (
                type === "student" &&
                decision === "reject"
            ) {

                rpcName =
                    "admin_reject_student_application";

            } else if (
                type === "teacher" &&
                decision === "approve"
            ) {

                rpcName =
                    "admin_approve_teacher_application";

            } else if (
                type === "teacher" &&
                decision === "reject"
            ) {

                rpcName =
                    "admin_reject_teacher_application";
            }


            if (!rpcName) {
                return;
            }


            App.setButtonBusy(
                el.confirmApplicationDecision,
                true,
                decision === "approve"
                    ? "منظور ہو رہی ہے"
                    : "مسترد ہو رہی ہے"
            );


            try {

                await App.rpc(
                    rpcName,
                    {
                        p_token:
                            session.token,

                        p_application_id:
                            Number(id),

                        p_admin_note:
                            note ||
                            null
                    }
                );


                App.hide(
                    el.approvalConfirmationOverlay
                );


                App.hide(
                    el.applicationDetailsOverlay
                );


                App.selectedApplicationType =
                    null;

                App.selectedApplicationId =
                    null;

                App.pendingApplicationDecision =
                    null;


                await App.loadApplications();


                if (
                    type === "student"
                ) {

                    App.showMessage(
                        el.studentApplicationsMessage,
                        decision === "approve"
                            ? "طالبہ کی درخواست منظور ہوگئی۔"
                            : "طالبہ کی درخواست مسترد ہوگئی۔",
                        "success"
                    );

                } else {

                    App.showMessage(
                        el.teacherApplicationsMessage,
                        decision === "approve"
                            ? "استاد کی درخواست منظور ہوگئی۔"
                            : "استاد کی درخواست مسترد ہوگئی۔",
                        "success"
                    );
                }

            } catch (error) {

                console.error(
                    "Application decision error:",
                    error
                );


                if (
                    el.approvalConfirmationContent
                ) {

                    el.approvalConfirmationContent.innerHTML = `
                        <p class="error-message">
                            ${App.escapeHTML(
                                error.message ||
                                "درخواست پر کارروائی نہیں ہوسکی۔"
                            )}
                        </p>
                    `;
                }

            } finally {

                App.setButtonBusy(
                    el.confirmApplicationDecision,
                    false
                );
            }
        };


    /* =====================================================
       INITIALIZE APPROVALS PAGE
       ===================================================== */

    App.initializeApprovalsPage =
        async function () {

            if (
                App.currentPage !==
                "approvals.html"
            ) {
                return;
            }


            const session =
                App.requireAdmin();


            if (!session) {
                return;
            }


            App.touchSession(
                true
            );


            const el =
                App.getApprovalElements();


            App.hide(
                el.applicationDetailsOverlay
            );


            App.hide(
                el.approvalConfirmationOverlay
            );


            if (
                el.backToDashboard
            ) {

                el.backToDashboard
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "dashboard.html";
                        }
                    );
            }


            if (
                el.closeApplicationDetails
            ) {

                el.closeApplicationDetails
                    .addEventListener(
                        "click",
                        App.closeApplicationDetailsModal
                    );
            }


            if (
                el.applicationDetailsOverlay
            ) {

                el.applicationDetailsOverlay
                    .addEventListener(
                        "click",
                        function (event) {

                            if (
                                event.target ===
                                el.applicationDetailsOverlay
                            ) {

                                App.closeApplicationDetailsModal();
                            }
                        }
                    );
            }


            if (
                el.approveApplicationButton
            ) {

                el.approveApplicationButton
                    .addEventListener(
                        "click",
                        function () {

                            App.openApplicationDecisionConfirmation(
                                "approve"
                            );
                        }
                    );
            }


            if (
                el.rejectApplicationButton
            ) {

                el.rejectApplicationButton
                    .addEventListener(
                        "click",
                        function () {

                            App.openApplicationDecisionConfirmation(
                                "reject"
                            );
                        }
                    );
            }


            if (
                el.closeApprovalConfirmation
            ) {

                el.closeApprovalConfirmation
                    .addEventListener(
                        "click",
                        App.closeApplicationConfirmation
                    );
            }


            if (
                el.cancelApplicationDecision
            ) {

                el.cancelApplicationDecision
                    .addEventListener(
                        "click",
                        App.closeApplicationConfirmation
                    );
            }


            if (
                el.approvalConfirmationOverlay
            ) {

                el.approvalConfirmationOverlay
                    .addEventListener(
                        "click",
                        function (event) {

                            if (
                                event.target ===
                                el.approvalConfirmationOverlay
                            ) {

                                App.closeApplicationConfirmation();
                            }
                        }
                    );
            }


            if (
                el.confirmApplicationDecision
            ) {

                el.confirmApplicationDecision
                    .addEventListener(
                        "click",
                        App.executeApplicationDecision
                    );
            }


            await App.loadApplications();
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeApprovalsPage();
        }
    );

})();

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 9 / ATTENDANCE MODULE
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       ATTENDANCE STATE
       ===================================================== */

    App.attendanceTeachersCache = [];

    App.attendanceStudentsCache = [];


    /* =====================================================
       PAGE ELEMENTS
       ===================================================== */

    App.getAttendanceElements =
        function () {

            return {

                backToDashboard:
                    App.byId(
                        "backToDashboard"
                    ),

                attendanceMessage:
                    App.byId(
                        "attendanceMessage"
                    ),

                attendanceDate:
                    App.byId(
                        "attendanceDate"
                    ),

                attendanceClass:
                    App.byId(
                        "attendanceClass"
                    ),

                attendancePeriod:
                    App.byId(
                        "attendancePeriod"
                    ),

                attendanceTeacher:
                    App.byId(
                        "attendanceTeacher"
                    ),

                loadAttendanceStudents:
                    App.byId(
                        "loadAttendanceStudents"
                    ),

                attendanceStudentsSection:
                    App.byId(
                        "attendanceStudentsSection"
                    ),

                markAllPresent:
                    App.byId(
                        "markAllPresent"
                    ),

                clearAttendance:
                    App.byId(
                        "clearAttendance"
                    ),

                attendanceStudentsList:
                    App.byId(
                        "attendanceStudentsList"
                    ),

                saveAttendance:
                    App.byId(
                        "saveAttendance"
                    ),

                attendanceRecordDate:
                    App.byId(
                        "attendanceRecordDate"
                    ),

                attendanceRecordClass:
                    App.byId(
                        "attendanceRecordClass"
                    ),

                attendanceRecordPeriod:
                    App.byId(
                        "attendanceRecordPeriod"
                    ),

                loadAttendanceRecords:
                    App.byId(
                        "loadAttendanceRecords"
                    ),

                attendanceRecordsMessage:
                    App.byId(
                        "attendanceRecordsMessage"
                    ),

                attendanceRecordsList:
                    App.byId(
                        "attendanceRecordsList"
                    )
            };
        };


    /* =====================================================
       STATUS HELPERS
       ===================================================== */

    App.attendanceStatusLabel =
        function (status) {

            switch (
                App.cleanText(status)
                    .toLowerCase()
            ) {

                case "present":
                    return "حاضر";

                case "absent":
                    return "غیر حاضر";

                case "leave":
                    return "رخصت";

                default:
                    return "نامعلوم";
            }
        };


    /* =====================================================
       LOAD TEACHERS
       ===================================================== */

    App.loadAttendanceTeachers =
        async function (
            session
        ) {

            const el =
                App.getAttendanceElements();


            if (
                !el.attendanceTeacher
            ) {
                return;
            }


            try {

                const data =
                    await App.rpc(
                        "attendance_get_teachers",
                        {
                            p_token:
                                session.token
                        }
                    );


                App.attendanceTeachersCache =
                    Array.isArray(data)
                        ? data
                        : [];


                el.attendanceTeacher.innerHTML =
                    "";


                if (
                    App.attendanceTeachersCache
                        .length === 0
                ) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value = "";

                    option.textContent =
                        "کوئی استاد موجود نہیں";

                    el.attendanceTeacher
                        .appendChild(
                            option
                        );

                    return;
                }


                if (
                    session.role ===
                    "admin"
                ) {

                    const placeholder =
                        document.createElement(
                            "option"
                        );

                    placeholder.value = "";

                    placeholder.textContent =
                        "استاد منتخب کریں";

                    el.attendanceTeacher
                        .appendChild(
                            placeholder
                        );
                }


                App.attendanceTeachersCache
                    .forEach(
                        function (teacher) {

                            const option =
                                document.createElement(
                                    "option"
                                );


                            option.value =
                                String(
                                    teacher.teacher_id
                                );


                            option.textContent =
                                teacher.teacher_name ||
                                "استاد";


                            el.attendanceTeacher
                                .appendChild(
                                    option
                                );
                        }
                    );


                if (
                    session.role ===
                        "teacher" &&
                    App.attendanceTeachersCache
                        .length === 1
                ) {

                    el.attendanceTeacher.value =
                        String(
                            App.attendanceTeachersCache[0]
                                .teacher_id
                        );


                    el.attendanceTeacher.disabled =
                        true;

                } else {

                    el.attendanceTeacher.disabled =
                        false;
                }

            } catch (error) {

                App.showMessage(
                    el.attendanceMessage,
                    error.message ||
                    "اساتذہ کی فہرست لوڈ نہیں ہوسکی۔",
                    "error"
                );
            }
        };


    /* =====================================================
       LOAD STUDENTS
       ===================================================== */

    App.loadAttendanceStudents =
        async function () {

            const session =
                App.requireSession(
                    [
                        "admin",
                        "teacher"
                    ]
                );

            if (!session) {
                return;
            }


            const el =
                App.getAttendanceElements();


            const studentClass =
                App.cleanText(
                    el.attendanceClass
                        ? el.attendanceClass.value
                        : ""
                );


            const teacherId =
                Number(
                    el.attendanceTeacher
                        ? el.attendanceTeacher.value
                        : 0
                );


            const attendanceDate =
                el.attendanceDate
                    ? el.attendanceDate.value
                    : "";


            const period =
                Number(
                    el.attendancePeriod
                        ? el.attendancePeriod.value
                        : 0
                );


            if (!attendanceDate) {

                App.showMessage(
                    el.attendanceMessage,
                    "حاضری کی تاریخ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (!studentClass) {

                App.showMessage(
                    el.attendanceMessage,
                    "درجہ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (
                period < 1 ||
                period > 6
            ) {

                App.showMessage(
                    el.attendanceMessage,
                    "پیریڈ 1 سے 6 کے درمیان منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (!teacherId) {

                App.showMessage(
                    el.attendanceMessage,
                    "استاد منتخب کریں۔",
                    "error"
                );

                return;
            }


            App.setButtonBusy(
                el.loadAttendanceStudents,
                true,
                "طالبات لوڈ ہو رہی ہیں"
            );


            App.clearMessage(
                el.attendanceMessage
            );


            try {

                const data =
                    await App.rpc(
                        "attendance_get_students",
                        {
                            p_token:
                                session.token,

                            p_class:
                                studentClass
                        }
                    );


                App.attendanceStudentsCache =
                    Array.isArray(data)
                        ? data
                        : [];


                App.renderAttendanceStudents(
                    App.attendanceStudentsCache
                );


                App.show(
                    el.attendanceStudentsSection
                );


                /*
                 * اگر اسی تاریخ / پیریڈ / استاد کی
                 * حاضری پہلے موجود ہے تو اسے بھی لوڈ کریں۔
                 */

                await App.loadExistingAttendanceIntoForm(
                    session,
                    attendanceDate,
                    period,
                    studentClass,
                    teacherId
                );


                if (
                    App.attendanceStudentsCache
                        .length === 0
                ) {

                    App.showMessage(
                        el.attendanceMessage,
                        "اس درجہ میں کوئی طالبہ موجود نہیں۔",
                        "info"
                    );

                } else {

                    App.showMessage(
                        el.attendanceMessage,
                        "طالبات کی فہرست لوڈ ہوگئی۔",
                        "success"
                    );
                }

            } catch (error) {

                App.attendanceStudentsCache =
                    [];


                App.renderAttendanceStudents(
                    []
                );


                App.showMessage(
                    el.attendanceMessage,
                    error.message ||
                    "طالبات کی فہرست لوڈ نہیں ہوسکی۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.loadAttendanceStudents,
                    false
                );
            }
        };


    /* =====================================================
       RENDER ATTENDANCE STUDENTS
       ===================================================== */

    App.renderAttendanceStudents =
        function (students) {

            const el =
                App.getAttendanceElements();


            if (
                !el.attendanceStudentsList
            ) {
                return;
            }


            const list =
                Array.isArray(students)
                    ? students
                    : [];


            if (
                list.length === 0
            ) {

                el.attendanceStudentsList.innerHTML =
                    `
                        <div class="empty-state">
                            کوئی طالبہ موجود نہیں۔
                        </div>
                    `;

                return;
            }


            el.attendanceStudentsList.innerHTML =
                list.map(
                    function (student) {

                        return `
                            <div
                                class="attendance-student-row"
                                data-student-id="${App.escapeHTML(
                                    student.student_id
                                )}"
                            >

                                <div class="attendance-student-info">

                                    <strong>
                                        ${App.escapeHTML(
                                            student.student_name ||
                                            ""
                                        )}
                                    </strong>

                                    <span>
                                        داخلہ نمبر:
                                        ${App.escapeHTML(
                                            student.admission_no ||
                                            ""
                                        )}
                                    </span>

                                </div>


                                <div class="attendance-options">

                                    <label>
                                        <input
                                            type="radio"
                                            name="attendance_${App.escapeHTML(
                                                student.student_id
                                            )}"
                                            value="present"
                                        >
                                        حاضر
                                    </label>


                                    <label>
                                        <input
                                            type="radio"
                                            name="attendance_${App.escapeHTML(
                                                student.student_id
                                            )}"
                                            value="absent"
                                        >
                                        غیر حاضر
                                    </label>


                                    <label>
                                        <input
                                            type="radio"
                                            name="attendance_${App.escapeHTML(
                                                student.student_id
                                            )}"
                                            value="leave"
                                        >
                                        رخصت
                                    </label>

                                </div>


                                <div class="attendance-note">

                                    <input
                                        type="text"
                                        class="attendance-note-input"
                                        placeholder="نوٹ"
                                        autocomplete="off"
                                    >

                                </div>

                            </div>
                        `;
                    }
                ).join("");
        };


    /* =====================================================
       LOAD EXISTING ATTENDANCE INTO FORM
       ===================================================== */

    App.loadExistingAttendanceIntoForm =
        async function (
            session,
            attendanceDate,
            period,
            studentClass,
            teacherId
        ) {

            const el =
                App.getAttendanceElements();


            try {

                const records =
                    await App.rpc(
                        "attendance_get_records",
                        {
                            p_token:
                                session.token,

                            p_date:
                                attendanceDate,

                            p_period:
                                period,

                            p_class:
                                studentClass,

                            p_teacher_id:
                                teacherId
                        }
                    );


                if (
                    !Array.isArray(records) ||
                    records.length === 0
                ) {
                    return;
                }


                records.forEach(
                    function (record) {

                        const row =
                            el.attendanceStudentsList
                                ? el.attendanceStudentsList
                                    .querySelector(
                                        `[data-student-id="${CSS.escape(
                                            String(
                                                record.student_id
                                            )
                                        )}"]`
                                    )
                                : null;


                        if (!row) {
                            return;
                        }


                        const status =
                            App.cleanText(
                                record.status
                            ).toLowerCase();


                        const radio =
                            row.querySelector(
                                `input[type="radio"][value="${CSS.escape(
                                    status
                                )}"]`
                            );


                        if (radio) {

                            radio.checked =
                                true;
                        }


                        const noteInput =
                            row.querySelector(
                                ".attendance-note-input"
                            );


                        if (noteInput) {

                            noteInput.value =
                                record.note ||
                                "";
                        }
                    }
                );

            } catch (error) {

                console.warn(
                    "Existing attendance load error:",
                    error
                );
            }
        };


    /* =====================================================
       MARK ALL PRESENT
       ===================================================== */

    App.markAllAttendancePresent =
        function () {

            const el =
                App.getAttendanceElements();


            if (
                !el.attendanceStudentsList
            ) {
                return;
            }


            el.attendanceStudentsList
                .querySelectorAll(
                    'input[type="radio"][value="present"]'
                )
                .forEach(
                    function (radio) {

                        radio.checked =
                            true;
                    }
                );
        };


    /* =====================================================
       CLEAR ATTENDANCE
       ===================================================== */

    App.clearAttendanceForm =
        function () {

            const el =
                App.getAttendanceElements();


            if (
                !el.attendanceStudentsList
            ) {
                return;
            }


            el.attendanceStudentsList
                .querySelectorAll(
                    'input[type="radio"]'
                )
                .forEach(
                    function (radio) {

                        radio.checked =
                            false;
                    }
                );


            el.attendanceStudentsList
                .querySelectorAll(
                    ".attendance-note-input"
                )
                .forEach(
                    function (input) {

                        input.value =
                            "";
                    }
                );
        };


    /* =====================================================
       COLLECT ATTENDANCE ROWS
       ===================================================== */

    App.collectAttendanceRows =
        function () {

            const el =
                App.getAttendanceElements();


            if (
                !el.attendanceStudentsList
            ) {
                return [];
            }


            const rows = [];


            el.attendanceStudentsList
                .querySelectorAll(
                    ".attendance-student-row"
                )
                .forEach(
                    function (row) {

                        const studentId =
                            Number(
                                row.dataset.studentId
                            );


                        const selected =
                            row.querySelector(
                                'input[type="radio"]:checked'
                            );


                        const noteInput =
                            row.querySelector(
                                ".attendance-note-input"
                            );


                        if (
                            studentId &&
                            selected
                        ) {

                            rows.push({
                                student_id:
                                    studentId,

                                status:
                                    selected.value,

                                note:
                                    App.cleanText(
                                        noteInput
                                            ? noteInput.value
                                            : ""
                                    )
                            });
                        }
                    }
                );


            return rows;
        };


    /* =====================================================
       SAVE ATTENDANCE
       ===================================================== */

    App.saveAttendance =
        async function () {

            const session =
                App.requireSession(
                    [
                        "admin",
                        "teacher"
                    ]
                );

            if (!session) {
                return;
            }


            const el =
                App.getAttendanceElements();


            const attendanceDate =
                el.attendanceDate
                    ? el.attendanceDate.value
                    : "";


            const studentClass =
                App.cleanText(
                    el.attendanceClass
                        ? el.attendanceClass.value
                        : ""
                );


            const period =
                Number(
                    el.attendancePeriod
                        ? el.attendancePeriod.value
                        : 0
                );


            const teacherId =
                Number(
                    el.attendanceTeacher
                        ? el.attendanceTeacher.value
                        : 0
                );


            const rows =
                App.collectAttendanceRows();


            if (!attendanceDate) {

                App.showMessage(
                    el.attendanceMessage,
                    "حاضری کی تاریخ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (!studentClass) {

                App.showMessage(
                    el.attendanceMessage,
                    "درجہ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (
                period < 1 ||
                period > 6
            ) {

                App.showMessage(
                    el.attendanceMessage,
                    "درست پیریڈ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (!teacherId) {

                App.showMessage(
                    el.attendanceMessage,
                    "استاد منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (
                App.attendanceStudentsCache
                    .length === 0
            ) {

                App.showMessage(
                    el.attendanceMessage,
                    "پہلے طالبات کی فہرست لوڈ کریں۔",
                    "error"
                );

                return;
            }


            if (
                rows.length !==
                App.attendanceStudentsCache
                    .length
            ) {

                App.showMessage(
                    el.attendanceMessage,
                    "تمام طالبات کی حاضری منتخب کریں۔",
                    "error"
                );

                return;
            }


            App.setButtonBusy(
                el.saveAttendance,
                true,
                "حاضری محفوظ ہو رہی ہے"
            );


            try {

                const result =
                    await App.rpc(
                        "attendance_save",
                        {
                            p_token:
                                session.token,

                            p_teacher_id:
                                teacherId,

                            p_date:
                                attendanceDate,

                            p_period:
                                period,

                            p_class:
                                studentClass,

                            p_rows:
                                rows
                        }
                    );


                const savedCount =
                    result &&
                    typeof result ===
                        "object"
                        ? Number(
                            result.saved ||
                            rows.length
                        )
                        : rows.length;


                App.showMessage(
                    el.attendanceMessage,
                    savedCount +
                    " طالبات کی حاضری محفوظ ہوگئی۔",
                    "success"
                );


                /*
                 * Records filters کو بھی اسی values
                 * کے ساتھ synchronize کریں۔
                 */

                if (
                    el.attendanceRecordDate
                ) {

                    el.attendanceRecordDate.value =
                        attendanceDate;
                }


                if (
                    el.attendanceRecordClass
                ) {

                    el.attendanceRecordClass.value =
                        studentClass;
                }


                if (
                    el.attendanceRecordPeriod
                ) {

                    el.attendanceRecordPeriod.value =
                        String(
                            period
                        );
                }

            } catch (error) {

                App.showMessage(
                    el.attendanceMessage,
                    error.message ||
                    "حاضری محفوظ نہیں ہوسکی۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.saveAttendance,
                    false
                );
            }
        };


    /* =====================================================
       LOAD ATTENDANCE RECORDS
       ===================================================== */

    App.loadAttendanceRecords =
        async function () {

            const session =
                App.requireSession(
                    [
                        "admin",
                        "teacher"
                    ]
                );

            if (!session) {
                return;
            }


            const el =
                App.getAttendanceElements();


            const attendanceDate =
                el.attendanceRecordDate
                    ? el.attendanceRecordDate.value
                    : "";


            const studentClass =
                App.cleanText(
                    el.attendanceRecordClass
                        ? el.attendanceRecordClass.value
                        : ""
                );


            const period =
                Number(
                    el.attendanceRecordPeriod
                        ? el.attendanceRecordPeriod.value
                        : 0
                );


            const teacherId =
                Number(
                    el.attendanceTeacher
                        ? el.attendanceTeacher.value
                        : 0
                );


            if (!attendanceDate) {

                App.showMessage(
                    el.attendanceRecordsMessage,
                    "تاریخ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (!studentClass) {

                App.showMessage(
                    el.attendanceRecordsMessage,
                    "درجہ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (
                period < 1 ||
                period > 6
            ) {

                App.showMessage(
                    el.attendanceRecordsMessage,
                    "درست پیریڈ منتخب کریں۔",
                    "error"
                );

                return;
            }


            if (!teacherId) {

                App.showMessage(
                    el.attendanceRecordsMessage,
                    "اوپر استاد منتخب کریں۔",
                    "error"
                );

                return;
            }


            App.setButtonBusy(
                el.loadAttendanceRecords,
                true,
                "ریکارڈ لوڈ ہو رہا ہے"
            );


            App.clearMessage(
                el.attendanceRecordsMessage
            );


            try {

                const records =
                    await App.rpc(
                        "attendance_get_records",
                        {
                            p_token:
                                session.token,

                            p_date:
                                attendanceDate,

                            p_period:
                                period,

                            p_class:
                                studentClass,

                            p_teacher_id:
                                teacherId
                        }
                    );


                App.renderAttendanceRecords(
                    Array.isArray(records)
                        ? records
                        : []
                );

            } catch (error) {

                App.renderAttendanceRecords(
                    []
                );


                App.showMessage(
                    el.attendanceRecordsMessage,
                    error.message ||
                    "حاضری کا ریکارڈ لوڈ نہیں ہوسکا۔",
                    "error"
                );

            } finally {

                App.setButtonBusy(
                    el.loadAttendanceRecords,
                    false
                );
            }
        };


    /* =====================================================
       RENDER ATTENDANCE RECORDS
       ===================================================== */

    App.renderAttendanceRecords =
        function (records) {

            const el =
                App.getAttendanceElements();


            if (
                !el.attendanceRecordsList
            ) {
                return;
            }


            const list =
                Array.isArray(records)
                    ? records
                    : [];


            if (
                list.length === 0
            ) {

                el.attendanceRecordsList.innerHTML =
                    `
                        <div class="empty-state">
                            کوئی حاضری ریکارڈ نہیں ملا۔
                        </div>
                    `;

                return;
            }


            el.attendanceRecordsList.innerHTML =
                list.map(
                    function (record) {

                        return `
                            <div class="attendance-record-card">

                                <p>
                                    <strong>
                                        طالبہ:
                                    </strong>

                                    ${App.escapeHTML(
                                        record.student_name ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        درجہ:
                                    </strong>

                                    ${App.escapeHTML(
                                        record.student_class ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        تاریخ:
                                    </strong>

                                    ${App.escapeHTML(
                                        App.formatDate(
                                            record.attendance_date
                                        )
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        پیریڈ:
                                    </strong>

                                    ${App.escapeHTML(
                                        record.period_number
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        حاضری:
                                    </strong>

                                    ${App.escapeHTML(
                                        App.attendanceStatusLabel(
                                            record.status
                                        )
                                    )}
                                </p>

                                ${
                                    record.note
                                        ? `
                                            <p>
                                                <strong>
                                                    نوٹ:
                                                </strong>

                                                ${App.escapeHTML(
                                                    record.note
                                                )}
                                            </p>
                                          `
                                        : ""
                                }

                            </div>
                        `;
                    }
                ).join("");
        };


    /* =====================================================
       SYNC RECORD FILTERS
       ===================================================== */

    App.syncAttendanceRecordFilters =
        function () {

            const el =
                App.getAttendanceElements();


            if (
                el.attendanceDate &&
                el.attendanceRecordDate
            ) {

                el.attendanceRecordDate.value =
                    el.attendanceDate.value;
            }


            if (
                el.attendanceClass &&
                el.attendanceRecordClass
            ) {

                el.attendanceRecordClass.value =
                    el.attendanceClass.value;
            }


            if (
                el.attendancePeriod &&
                el.attendanceRecordPeriod
            ) {

                el.attendanceRecordPeriod.value =
                    el.attendancePeriod.value;
            }
        };


    /* =====================================================
       INITIALIZE ATTENDANCE PAGE
       ===================================================== */

    App.initializeAttendancePage =
        async function () {

            if (
                App.currentPage !==
                "attendance.html"
            ) {
                return;
            }


            const session =
                App.requireSession(
                    [
                        "admin",
                        "teacher"
                    ]
                );


            if (!session) {
                return;
            }


            App.touchSession(
                true
            );


            const el =
                App.getAttendanceElements();


            App.hide(
                el.attendanceStudentsSection
            );


            if (
                el.attendanceDate &&
                !el.attendanceDate.value
            ) {

                el.attendanceDate.value =
                    App.todayISO();
            }


            if (
                el.attendanceRecordDate &&
                !el.attendanceRecordDate.value
            ) {

                el.attendanceRecordDate.value =
                    App.todayISO();
            }


            if (
                el.backToDashboard
            ) {

                el.backToDashboard
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "dashboard.html";
                        }
                    );
            }


            if (
                el.loadAttendanceStudents
            ) {

                el.loadAttendanceStudents
                    .addEventListener(
                        "click",
                        App.loadAttendanceStudents
                    );
            }


            if (
                el.markAllPresent
            ) {

                el.markAllPresent
                    .addEventListener(
                        "click",
                        App.markAllAttendancePresent
                    );
            }


            if (
                el.clearAttendance
            ) {

                el.clearAttendance
                    .addEventListener(
                        "click",
                        App.clearAttendanceForm
                    );
            }


            if (
                el.saveAttendance
            ) {

                el.saveAttendance
                    .addEventListener(
                        "click",
                        App.saveAttendance
                    );
            }


            if (
                el.loadAttendanceRecords
            ) {

                el.loadAttendanceRecords
                    .addEventListener(
                        "click",
                        App.loadAttendanceRecords
                    );
            }


            [
                el.attendanceDate,
                el.attendanceClass,
                el.attendancePeriod
            ]
                .filter(Boolean)
                .forEach(
                    function (element) {

                        element.addEventListener(
                            "change",
                            App.syncAttendanceRecordFilters
                        );
                    }
                );


            App.syncAttendanceRecordFilters();


            await App.loadAttendanceTeachers(
                session
            );
        };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.initializeAttendancePage();
        }
    );

})();

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 10 / DRAFT + GLOBAL SAFETY + FINAL HELPERS
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       DRAFT CONFIGURATION
       ADMIN FORMS ONLY
       ===================================================== */

    App.DRAFT_KEYS = {

        student:
            "madrassa_admin_student_draft_v1",

        teacher:
            "madrassa_admin_teacher_draft_v1"
    };


    App.DRAFT_SAVE_DELAY =
        500;


    App.studentDraftTimer =
        null;

    App.teacherDraftTimer =
        null;


    /* =====================================================
       LOCAL JSON HELPERS
       ===================================================== */

    App.saveLocalJSON =
        function (
            key,
            value
        ) {

            try {

                localStorage.setItem(
                    key,
                    JSON.stringify(
                        value
                    )
                );

                return true;

            } catch (error) {

                console.warn(
                    "Draft save error:",
                    error
                );

                return false;
            }
        };


    App.getLocalJSON =
        function (key) {

            try {

                const value =
                    localStorage.getItem(
                        key
                    );


                if (!value) {
                    return null;
                }


                return JSON.parse(
                    value
                );

            } catch (error) {

                return null;
            }
        };


    App.removeLocalItem =
        function (key) {

            try {

                localStorage.removeItem(
                    key
                );

            } catch (error) {
                /* ignore */
            }
        };


    /* =====================================================
       STUDENT DRAFT
       ===================================================== */

    App.saveStudentDraft =
        function () {

            if (
                App.currentPage !==
                "students.html"
            ) {
                return;
            }


            if (
                App.editingStudentId
            ) {
                return;
            }


            if (
                typeof App.getStudentFormData !==
                "function"
            ) {
                return;
            }


            const el =
                typeof App.getStudentElements ===
                "function"
                    ? App.getStudentElements()
                    : null;


            if (
                !el ||
                !el.studentFormContainer
            ) {
                return;
            }


            const data =
                App.getStudentFormData();


            const hasData =
                Boolean(
                    data.admissionNo ||
                    data.name ||
                    data.fatherName ||
                    data.guardianName ||
                    data.cnic ||
                    data.phone ||
                    data.address ||
                    data.previousMadrassa ||
                    (
                        Array.isArray(
                            data.mahrams
                        ) &&
                        data.mahrams.length
                    )
                );


            if (!hasData) {

                App.removeLocalItem(
                    App.DRAFT_KEYS.student
                );

                return;
            }


            App.saveLocalJSON(
                App.DRAFT_KEYS.student,
                {
                    savedAt:
                        Date.now(),

                    data:
                        data
                }
            );
        };


    App.scheduleStudentDraft =
        function () {

            if (
                App.studentDraftTimer
            ) {

                clearTimeout(
                    App.studentDraftTimer
                );
            }


            App.studentDraftTimer =
                window.setTimeout(
                    function () {

                        App.saveStudentDraft();

                    },
                    App.DRAFT_SAVE_DELAY
                );
        };


    App.clearStudentDraft =
        function () {

            App.removeLocalItem(
                App.DRAFT_KEYS.student
            );
        };


    App.restoreStudentDraft =
        function () {

            if (
                App.currentPage !==
                "students.html"
            ) {
                return false;
            }


            if (
                App.editingStudentId
            ) {
                return false;
            }


            const saved =
                App.getLocalJSON(
                    App.DRAFT_KEYS.student
                );


            if (
                !saved ||
                !saved.data
            ) {
                return false;
            }


            const data =
                saved.data;


            const el =
                App.getStudentElements();


            if (
                el.admissionNo
            ) {
                el.admissionNo.value =
                    data.admissionNo ||
                    "";
            }


            if (
                el.admissionType
            ) {
                el.admissionType.value =
                    data.admissionType ||
                    "";
            }


            if (
                el.studentName
            ) {
                el.studentName.value =
                    data.name ||
                    "";
            }


            if (
                el.fatherName
            ) {
                el.fatherName.value =
                    data.fatherName ||
                    "";
            }


            if (
                el.guardianName
            ) {
                el.guardianName.value =
                    data.guardianName ||
                    "";
            }


            if (
                el.studentCNIC
            ) {
                el.studentCNIC.value =
                    App.formatCNIC(
                        data.cnic ||
                        ""
                    );
            }


            if (
                el.phone
            ) {
                el.phone.value =
                    App.normalizePhone(
                        data.phone ||
                        ""
                    );
            }


            if (
                el.dateOfBirth
            ) {
                el.dateOfBirth.value =
                    data.dateOfBirth ||
                    "";
            }


            if (
                el.studentClass
            ) {
                el.studentClass.value =
                    data.studentClass ||
                    "";
            }


            if (
                el.admissionDate
            ) {
                el.admissionDate.value =
                    data.admissionDate ||
                    App.todayISO();
            }


            if (
                el.address
            ) {
                el.address.value =
                    data.address ||
                    "";
            }


            if (
                el.residenceType
            ) {
                el.residenceType.value =
                    data.residenceType ||
                    "";
            }


            if (
                el.previousMadrassa
            ) {
                el.previousMadrassa.value =
                    data.previousMadrassa ||
                    "";
            }


            if (
                el.transferDate
            ) {
                el.transferDate.value =
                    data.transferDate ||
                    "";
            }


            if (
                el.studentStatus
            ) {

                const targetStatus =
                    typeof App.normalizeStudentStatus ===
                    "function"
                        ? App.normalizeStudentStatus(
                            data.status
                        )
                        : "active";


                const option =
                    Array.from(
                        el.studentStatus.options ||
                        []
                    ).find(
                        function (item) {

                            return (
                                App.normalizeStudentStatus(
                                    item.value
                                ) ===
                                targetStatus
                            );
                        }
                    );


                if (option) {

                    el.studentStatus.value =
                        option.value;
                }
            }


            if (
                el.mahramList
            ) {

                el.mahramList.innerHTML =
                    "";


                const mahrams =
                    Array.isArray(
                        data.mahrams
                    )
                        ? data.mahrams
                        : [];


                mahrams.forEach(
                    function (mahram) {

                        App.addStudentMahramRow(
                            mahram
                        );
                    }
                );
            }


            if (
                typeof App.updateTransferFields ===
                "function"
            ) {

                App.updateTransferFields();
            }


            if (
                typeof App.updateStudentMahramSection ===
                "function"
            ) {

                App.updateStudentMahramSection();
            }


            App.showMessage(
                el.studentFormMessage,
                "آپ کا پچھلا محفوظ مسودہ بحال کردیا گیا ہے۔",
                "info"
            );


            return true;
        };


    /* =====================================================
       TEACHER DRAFT
       ===================================================== */

    App.saveTeacherDraft =
        function () {

            if (
                App.currentPage !==
                "teachers.html"
            ) {
                return;
            }


            if (
                App.editingTeacherId
            ) {
                return;
            }


            if (
                typeof App.getTeacherFormData !==
                "function"
            ) {
                return;
            }


            const data =
                App.getTeacherFormData();


            const hasData =
                Boolean(
                    data.teacherCode ||
                    data.name ||
                    data.fatherName ||
                    data.phone ||
                    data.cnic ||
                    data.qualification ||
                    data.address
                );


            if (!hasData) {

                App.removeLocalItem(
                    App.DRAFT_KEYS.teacher
                );

                return;
            }


            App.saveLocalJSON(
                App.DRAFT_KEYS.teacher,
                {
                    savedAt:
                        Date.now(),

                    data:
                        data
                }
            );
        };


    App.scheduleTeacherDraft =
        function () {

            if (
                App.teacherDraftTimer
            ) {

                clearTimeout(
                    App.teacherDraftTimer
                );
            }


            App.teacherDraftTimer =
                window.setTimeout(
                    function () {

                        App.saveTeacherDraft();

                    },
                    App.DRAFT_SAVE_DELAY
                );
        };


    App.clearTeacherDraft =
        function () {

            App.removeLocalItem(
                App.DRAFT_KEYS.teacher
            );
        };


    App.restoreTeacherDraft =
        function () {

            if (
                App.currentPage !==
                "teachers.html"
            ) {
                return false;
            }


            if (
                App.editingTeacherId
            ) {
                return false;
            }


            const saved =
                App.getLocalJSON(
                    App.DRAFT_KEYS.teacher
                );


            if (
                !saved ||
                !saved.data
            ) {
                return false;
            }


            const data =
                saved.data;


            const el =
                App.getTeacherElements();


            if (
                el.teacherCode
            ) {
                el.teacherCode.value =
                    data.teacherCode ||
                    "";
            }


            if (
                el.teacherName
            ) {
                el.teacherName.value =
                    data.name ||
                    "";
            }


            if (
                el.teacherFatherName
            ) {
                el.teacherFatherName.value =
                    data.fatherName ||
                    "";
            }


            if (
                el.teacherPhone
            ) {
                el.teacherPhone.value =
                    App.normalizePhone(
                        data.phone ||
                        ""
                    );
            }


            if (
                el.teacherCNIC
            ) {
                el.teacherCNIC.value =
                    App.formatCNIC(
                        data.cnic ||
                        ""
                    );
            }


            if (
                el.teacherDateOfBirth
            ) {
                el.teacherDateOfBirth.value =
                    data.dateOfBirth ||
                    "";
            }


            if (
                el.teacherQualification
            ) {
                el.teacherQualification.value =
                    data.qualification ||
                    "";
            }


            if (
                el.teacherJoiningDate
            ) {
                el.teacherJoiningDate.value =
                    data.joiningDate ||
                    App.todayISO();
            }


            if (
                el.teacherAddress
            ) {
                el.teacherAddress.value =
                    data.address ||
                    "";
            }


            if (
                el.teacherStatus
            ) {

                const targetStatus =
                    App.normalizeTeacherStatus(
                        data.status
                    );


                const option =
                    Array.from(
                        el.teacherStatus.options ||
                        []
                    ).find(
                        function (item) {

                            return (
                                App.normalizeTeacherStatus(
                                    item.value
                                ) ===
                                targetStatus
                            );
                        }
                    );


                if (option) {

                    el.teacherStatus.value =
                        option.value;
                }
            }


            App.showMessage(
                el.teacherFormMessage,
                "آپ کا پچھلا محفوظ مسودہ بحال کردیا گیا ہے۔",
                "info"
            );


            return true;
        };


    /* =====================================================
       WRAP STUDENT FORM OPEN / CLOSE
       ===================================================== */

    if (
        typeof App.openStudentForm ===
        "function"
    ) {

        const originalOpenStudentForm =
            App.openStudentForm;


        App.openStudentForm =
            function (student = null) {

                originalOpenStudentForm(
                    student
                );


                if (!student) {

                    App.restoreStudentDraft();
                }
            };
    }


    if (
        typeof App.closeStudentForm ===
        "function"
    ) {

        const originalCloseStudentForm =
            App.closeStudentForm;


        App.closeStudentForm =
            function () {

                App.clearStudentDraft();

                originalCloseStudentForm();
            };
    }


    /* =====================================================
       WRAP TEACHER FORM OPEN / CLOSE
       ===================================================== */

    if (
        typeof App.openTeacherForm ===
        "function"
    ) {

        const originalOpenTeacherForm =
            App.openTeacherForm;


        App.openTeacherForm =
            function (teacher = null) {

                originalOpenTeacherForm(
                    teacher
                );


                if (!teacher) {

                    App.restoreTeacherDraft();
                }
            };
    }


    if (
        typeof App.closeTeacherForm ===
        "function"
    ) {

        const originalCloseTeacherForm =
            App.closeTeacherForm;


        App.closeTeacherForm =
            function () {

                App.clearTeacherDraft();

                originalCloseTeacherForm();
            };
    }


    /* =====================================================
       RPC SESSION ERROR SAFETY
       ===================================================== */

    if (
        typeof App.rpc ===
        "function"
    ) {

        const originalRPC =
            App.rpc;


        App.rpc =
            async function (
                functionName,
                params = {}
            ) {

                try {

                    return await originalRPC(
                        functionName,
                        params
                    );

                } catch (error) {

                    const message =
                        String(
                            error &&
                            error.message
                                ? error.message
                                : ""
                        ).toLowerCase();


                    const sessionFailure =
                        message.includes(
                            "invalid or expired admin session"
                        ) ||
                        message.includes(
                            "invalid or expired session"
                        ) ||
                        message.includes(
                            "attendance access denied"
                        );


                    if (
                        sessionFailure &&
                        !App.isPublicPage()
                    ) {

                        App.clearStoredSession();


                        window.location.replace(
                            "login.html?reason=" +
                            encodeURIComponent(
                                "login-required"
                            )
                        );
                    }


                    throw error;
                }
            };
    }


    /* =====================================================
       ESCAPE KEY
       CLOSE OPEN MODALS
       ===================================================== */

    App.handleGlobalEscape =
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            if (
                App.currentPage ===
                "students.html" &&
                typeof App.closeStudentDetailsModal ===
                "function"
            ) {

                App.closeStudentDetailsModal();
            }


            if (
                App.currentPage ===
                "teachers.html" &&
                typeof App.closeTeacherDetailsModal ===
                "function"
            ) {

                App.closeTeacherDetailsModal();
            }


            if (
                App.currentPage ===
                "approvals.html"
            ) {

                if (
                    typeof App.closeApplicationConfirmation ===
                    "function"
                ) {

                    App.closeApplicationConfirmation();
                }


                if (
                    typeof App.closeApplicationDetailsModal ===
                    "function"
                ) {

                    App.closeApplicationDetailsModal();
                }
            }
        };


    /* =====================================================
       ADMIN DRAFT EVENT BINDING
       ===================================================== */

    App.initializeAdminDrafts =
        function () {

            const session =
                App.getStoredSession();


            if (
                !session ||
                session.role !==
                "admin"
            ) {
                return;
            }


            if (
                App.currentPage ===
                "students.html"
            ) {

                const el =
                    App.getStudentElements();


                if (
                    el.studentForm
                ) {

                    el.studentForm
                        .addEventListener(
                            "input",
                            App.scheduleStudentDraft
                        );


                    el.studentForm
                        .addEventListener(
                            "change",
                            App.scheduleStudentDraft
                        );
                }


                if (
                    el.addMahram
                ) {

                    el.addMahram
                        .addEventListener(
                            "click",
                            function () {

                                window.setTimeout(
                                    App.scheduleStudentDraft,
                                    0
                                );
                            }
                        );
                }
            }


            if (
                App.currentPage ===
                "teachers.html"
            ) {

                const el =
                    App.getTeacherElements();


                if (
                    el.teacherForm
                ) {

                    el.teacherForm
                        .addEventListener(
                            "input",
                            App.scheduleTeacherDraft
                        );


                    el.teacherForm
                        .addEventListener(
                            "change",
                            App.scheduleTeacherDraft
                        );
                }
            }
        };


    /* =====================================================
       BASIC PROTECTED PAGE GUARD
       ===================================================== */

    App.applyFinalPageGuard =
        function () {

            const adminPages = [
                "students.html",
                "teachers.html",
                "approvals.html"
            ];


            const staffPages = [
                "attendance.html"
            ];


            if (
                adminPages.includes(
                    App.currentPage
                )
            ) {

                App.requireSession(
                    ["admin"]
                );

                return;
            }


            if (
                staffPages.includes(
                    App.currentPage
                )
            ) {

                App.requireSession(
                    [
                        "admin",
                        "teacher"
                    ]
                );

                return;
            }


            if (
                App.currentPage ===
                "dashboard.html"
            ) {

                App.requireSession(
                    [
                        "admin",
                        "teacher",
                        "student"
                    ]
                );
            }
        };


    /* =====================================================
       FINAL INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            document.addEventListener(
                "keydown",
                App.handleGlobalEscape
            );


            App.applyFinalPageGuard();


            App.initializeAdminDrafts();
        }
    );

})();


/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 11 / FINAL SAFETY + URDU ERRORS + SESSION FIXES
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       USER FRIENDLY URDU DATABASE ERRORS
       ===================================================== */

    App.translateSystemError =
        function (
            message,
            fallback =
                "کارروائی مکمل نہیں ہوسکی۔ دوبارہ کوشش کریں۔"
        ) {

            const original =
                String(
                    message || ""
                ).trim();


            if (!original) {
                return fallback;
            }


            const text =
                original.toLowerCase();


            const translations = [

                [
                    "invalid or expired admin session",
                    "آپ کا ایڈمن سیشن ختم ہوچکا ہے۔ دوبارہ لاگ اِن کریں۔"
                ],

                [
                    "invalid or expired session",
                    "آپ کا سیشن ختم ہوچکا ہے۔ دوبارہ لاگ اِن کریں۔"
                ],

                [
                    "attendance access denied",
                    "آپ کو حاضری کے اس حصے تک رسائی حاصل نہیں ہے۔"
                ],

                [
                    "teacher access denied",
                    "استاد کو صرف اپنے حاضری ریکارڈ تک رسائی حاصل ہے۔"
                ],

                [
                    "student record not found",
                    "طالبہ کا ریکارڈ نہیں ملا۔"
                ],

                [
                    "teacher record not found",
                    "استاد کا ریکارڈ نہیں ملا۔"
                ],

                [
                    "student application not found",
                    "طالبہ کی درخواست نہیں ملی۔"
                ],

                [
                    "teacher application not found",
                    "استاد کی درخواست نہیں ملی۔"
                ],

                [
                    "pending student application not found",
                    "طالبہ کی زیرِ التواء درخواست نہیں ملی۔"
                ],

                [
                    "pending teacher application not found",
                    "استاد کی زیرِ التواء درخواست نہیں ملی۔"
                ],

                [
                    "application already reviewed",
                    "اس درخواست پر پہلے ہی کارروائی ہوچکی ہے۔"
                ],

                [
                    "application username missing",
                    "درخواست میں صارف نام موجود نہیں ہے۔"
                ],

                [
                    "application password missing",
                    "درخواست میں پاس ورڈ کی معلومات موجود نہیں ہیں۔"
                ],

                [
                    "username already exists",
                    "یہ صارف نام پہلے سے استعمال ہو رہا ہے۔"
                ],

                [
                    "pending application already exists",
                    "اس صارف نام سے ایک درخواست پہلے ہی زیرِ التواء ہے۔"
                ],

                [
                    "admission number already exists",
                    "یہ داخلہ نمبر پہلے سے موجود ہے۔"
                ],

                [
                    "cnic already exists",
                    "یہ شناختی کارڈ نمبر پہلے سے موجود ہے۔"
                ],

                [
                    "student already exists",
                    "اس طالبہ کا ریکارڈ پہلے سے موجود ہے۔"
                ],

                [
                    "teacher already exists",
                    "اس استاد کا ریکارڈ پہلے سے موجود ہے۔"
                ],

                [
                    "invalid cnic",
                    "شناختی کارڈ نمبر درست نہیں ہے۔"
                ],

                [
                    "invalid phone number",
                    "فون نمبر درست نہیں ہے۔"
                ],

                [
                    "invalid student status",
                    "طالبہ کی حالت درست نہیں ہے۔"
                ],

                [
                    "invalid teacher status",
                    "استاد کی حالت درست نہیں ہے۔"
                ],

                [
                    "invalid period number",
                    "پیریڈ نمبر درست نہیں ہے۔"
                ],

                [
                    "invalid attendance data",
                    "حاضری کا ڈیٹا درست نہیں ہے۔"
                ],

                [
                    "invalid attendance status",
                    "حاضری کی حالت درست نہیں ہے۔"
                ],

                [
                    "invalid student",
                    "طالبہ کا ریکارڈ درست نہیں ہے۔"
                ],

                [
                    "hostel student requires 1 to 5 mahrams",
                    "ہاسٹل طالبہ کے لیے کم از کم ایک اور زیادہ سے زیادہ پانچ محرم ضروری ہیں۔"
                ],

                [
                    "student name is required",
                    "طالبہ کا نام درج کریں۔"
                ],

                [
                    "father name is required",
                    "والد کا نام درج کریں۔"
                ],

                [
                    "teacher name is required",
                    "استاد کا نام درج کریں۔"
                ],

                [
                    "admission number is required",
                    "داخلہ نمبر درج کریں۔"
                ],

                [
                    "admission type is required",
                    "داخلہ کی قسم منتخب کریں۔"
                ],

                [
                    "guardian name is required",
                    "سرپرست کا نام درج کریں۔"
                ],

                [
                    "date of birth is required",
                    "تاریخ پیدائش درج کریں۔"
                ],

                [
                    "student class is required",
                    "درجہ منتخب کریں۔"
                ],

                [
                    "address is required",
                    "پتہ درج کریں۔"
                ],

                [
                    "residence type is required",
                    "رہائش کی قسم منتخب کریں۔"
                ],

                [
                    "teacher code is required",
                    "استاد کوڈ درج کریں۔"
                ],

                [
                    "username must contain at least 4 characters",
                    "صارف نام کم از کم 4 حروف یا اعداد پر مشتمل ہونا چاہیے۔"
                ],

                [
                    "password must contain at least 8 characters",
                    "پاس ورڈ کم از کم 8 حروف یا اعداد پر مشتمل ہونا چاہیے۔"
                ]
            ];


            for (
                const item
                of translations
            ) {

                if (
                    text.includes(
                        item[0]
                    )
                ) {

                    return item[1];
                }
            }


            /*
             * اگر message پہلے ہی اردو میں ہے
             * تو وہی دکھائیں۔
             */

            if (
                /[\u0600-\u06FF]/
                    .test(original)
            ) {

                return original;
            }


            /*
             * Database/PostgREST کا raw English error
             * UI پر نہیں دکھانا۔
             */

            return fallback;
        };


    /* =====================================================
       SAFE SHOW MESSAGE
       ===================================================== */

    if (
        typeof App.showMessage ===
        "function"
    ) {

        const originalShowMessage =
            App.showMessage;


        App.showMessage =
            function (
                element,
                message,
                type = "info"
            ) {

                let safeMessage =
                    message;


                if (
                    type === "error"
                ) {

                    safeMessage =
                        App.translateSystemError(
                            message
                        );
                }


                originalShowMessage(
                    element,
                    safeMessage,
                    type
                );
            };
    }


    /* =====================================================
       STRICT 5 MINUTE INACTIVITY
       ===================================================== */

    App.touchSession =
        function (
            force = false
        ) {

            const session =
                App.getStoredSession();


            if (!session) {
                return;
            }


            const now =
                Date.now();


            const lastActivity =
                Number(
                    session.lastActivity ||
                    0
                );


            /*
             * پہلے timeout چیک ہوگا۔
             * 5 منٹ بعد پہلی touch/click
             * session کو دوبارہ زندہ نہیں کرے گی۔
             */

            if (
                lastActivity &&
                now -
                    lastActivity >
                    App.INACTIVITY_LIMIT
            ) {

                App.logout(
                    "timeout"
                );

                return;
            }


            if (
                !force &&
                now -
                    App.lastActivitySave <
                    App.ACTIVITY_SAVE_INTERVAL
            ) {

                return;
            }


            session.lastActivity =
                now;


            App.lastActivitySave =
                now;


            App.updateStoredSession(
                session
            );
        };


    App.checkInactivity =
        function () {

            const session =
                App.getStoredSession();


            if (!session) {
                return;
            }


            const lastActivity =
                Number(
                    session.lastActivity ||
                    0
                );


            if (
                !lastActivity ||
                Date.now() -
                    lastActivity >
                    App.INACTIVITY_LIMIT
            ) {

                App.logout(
                    "timeout"
                );
            }
        };


    /* =====================================================
       SAFE SINGLE LOGOUT
       ===================================================== */

    App.logoutInProgress =
        false;


    App.logout =
        async function (
            reason = "logout"
        ) {

            if (
                App.logoutInProgress
            ) {
                return;
            }


            App.logoutInProgress =
                true;


            const session =
                App.getStoredSession();


            const token =
                session
                    ? session.token
                    : null;


            App.clearStoredSession();


            if (
                App.inactivityTimer
            ) {

                clearInterval(
                    App.inactivityTimer
                );


                App.inactivityTimer =
                    null;
            }


            /*
             * Server session کو بھی ختم کریں۔
             * زیادہ delay ہونے کی صورت میں
             * login redirect نہیں رکے گا۔
             */

            if (token) {

                try {

                    const client =
                        App.initSupabase();


                    if (client) {

                        await Promise.race([

                            client.rpc(
                                "logout_session",
                                {
                                    p_token:
                                        token
                                }
                            ),

                            new Promise(
                                function (
                                    resolve
                                ) {

                                    window.setTimeout(
                                        resolve,
                                        1200
                                    );
                                }
                            )
                        ]);
                    }

                } catch (error) {

                    console.warn(
                        "Server logout warning:",
                        error
                    );
                }
            }


            const suffix =
                "?reason=" +
                encodeURIComponent(
                    reason
                );


            window.location.replace(
                "login.html" +
                suffix
            );
        };


    /* =====================================================
       CHECK SESSION WHEN TAB RETURNS
       ===================================================== */

    App.handleVisibilityChange =
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                App.checkInactivity();
            }
        };


    /* =====================================================
       APPROVAL EXECUTION
       FINAL SAFE VERSION
       ===================================================== */

    App.executeApplicationDecision =
        async function () {

            const session =
                App.requireAdmin();


            if (!session) {
                return;
            }


            const type =
                App.selectedApplicationType;


            const id =
                App.selectedApplicationId;


            const decision =
                App.pendingApplicationDecision;


            if (
                !type ||
                !id ||
                !decision
            ) {
                return;
            }


            const el =
                App.getApprovalElements();


            const note =
                App.cleanText(
                    el.applicationAdminNote
                        ? el.applicationAdminNote.value
                        : ""
                );


            let rpcName = "";


            if (
                type === "student" &&
                decision === "approve"
            ) {

                rpcName =
                    "admin_approve_student_application";

            } else if (
                type === "student" &&
                decision === "reject"
            ) {

                rpcName =
                    "admin_reject_student_application";

            } else if (
                type === "teacher" &&
                decision === "approve"
            ) {

                rpcName =
                    "admin_approve_teacher_application";

            } else if (
                type === "teacher" &&
                decision === "reject"
            ) {

                rpcName =
                    "admin_reject_teacher_application";
            }


            if (!rpcName) {
                return;
            }


            App.setButtonBusy(
                el.confirmApplicationDecision,
                true,
                decision === "approve"
                    ? "منظور ہو رہی ہے"
                    : "مسترد ہو رہی ہے"
            );


            try {

                await App.rpc(
                    rpcName,
                    {
                        p_token:
                            session.token,

                        p_application_id:
                            Number(id),

                        p_admin_note:
                            note ||
                            null
                    }
                );


                App.hide(
                    el.approvalConfirmationOverlay
                );


                App.hide(
                    el.applicationDetailsOverlay
                );


                App.selectedApplicationType =
                    null;

                App.selectedApplicationId =
                    null;

                App.pendingApplicationDecision =
                    null;


                await App.loadApplications();


                if (
                    type === "student"
                ) {

                    App.showMessage(
                        el.studentApplicationsMessage,
                        decision === "approve"
                            ? "طالبہ کی درخواست کامیابی سے منظور ہوگئی۔"
                            : "طالبہ کی درخواست مسترد کردی گئی۔",
                        "success"
                    );

                } else {

                    App.showMessage(
                        el.teacherApplicationsMessage,
                        decision === "approve"
                            ? "استاد کی درخواست کامیابی سے منظور ہوگئی۔"
                            : "استاد کی درخواست مسترد کردی گئی۔",
                        "success"
                    );
                }

            } catch (error) {

                const message =
                    App.translateSystemError(
                        error &&
                        error.message
                            ? error.message
                            : "",
                        "درخواست پر کارروائی نہیں ہوسکی۔"
                    );


                if (
                    el.approvalConfirmationContent
                ) {

                    el.approvalConfirmationContent.innerHTML = `
                        <p class="error-message">
                            ${App.escapeHTML(
                                message
                            )}
                        </p>
                    `;
                }

            } finally {

                App.setButtonBusy(
                    el.confirmApplicationDecision,
                    false
                );
            }
        };


    /* =====================================================
       DISABLE MULTIPLE FAST SUBMITS
       ===================================================== */

    App.preventDoubleClick =
        function (
            button
        ) {

            if (!button) {
                return;
            }


            button.addEventListener(
                "click",
                function () {

                    if (
                        this.dataset.locked ===
                        "true"
                    ) {

                        return;
                    }


                    this.dataset.locked =
                        "true";


                    window.setTimeout(
                        () => {

                            this.dataset.locked =
                                "false";
                        },
                        500
                    );
                }
            );
        };


    /* =====================================================
       FINAL PAGE INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            document.addEventListener(
                "visibilitychange",
                App.handleVisibilityChange
            );


            window.addEventListener(
                "pageshow",
                function () {

                    App.checkInactivity();
                }
            );


            /*
             * Protected session کو load ہوتے ہی
             * ایک دفعہ دوبارہ چیک کریں۔
             */

            if (
                !App.isPublicPage()
            ) {

                App.checkInactivity();
            }
        }
    );

})();

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 12 / FINAL COMPATIBILITY + BINDING CHECK
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       SAFE FIND ATTENDANCE STUDENT ROW
       CSS.escape dependency removed
       ===================================================== */

    App.findAttendanceStudentRow =
        function (
            studentId
        ) {

            const el =
                typeof App.getAttendanceElements ===
                "function"
                    ? App.getAttendanceElements()
                    : null;


            if (
                !el ||
                !el.attendanceStudentsList
            ) {
                return null;
            }


            const rows =
                el.attendanceStudentsList
                    .querySelectorAll(
                        ".attendance-student-row"
                    );


            for (
                const row
                of rows
            ) {

                if (
                    String(
                        row.dataset.studentId
                    ) ===
                    String(
                        studentId
                    )
                ) {

                    return row;
                }
            }


            return null;
        };


    /* =====================================================
       SAFE EXISTING ATTENDANCE LOADER
       ===================================================== */

    App.loadExistingAttendanceIntoForm =
        async function (
            session,
            attendanceDate,
            period,
            studentClass,
            teacherId
        ) {

            if (
                !session ||
                !session.token
            ) {
                return;
            }


            try {

                const records =
                    await App.rpc(
                        "attendance_get_records",
                        {
                            p_token:
                                session.token,

                            p_date:
                                attendanceDate,

                            p_period:
                                Number(
                                    period
                                ),

                            p_class:
                                studentClass,

                            p_teacher_id:
                                Number(
                                    teacherId
                                )
                        }
                    );


                if (
                    !Array.isArray(
                        records
                    ) ||
                    records.length === 0
                ) {

                    return;
                }


                records.forEach(
                    function (record) {

                        const row =
                            App.findAttendanceStudentRow(
                                record.student_id
                            );


                        if (!row) {
                            return;
                        }


                        const status =
                            App.cleanText(
                                record.status
                            ).toLowerCase();


                        const radios =
                            row.querySelectorAll(
                                'input[type="radio"]'
                            );


                        radios.forEach(
                            function (radio) {

                                radio.checked =
                                    String(
                                        radio.value
                                    ).toLowerCase() ===
                                    status;
                            }
                        );


                        const noteInput =
                            row.querySelector(
                                ".attendance-note-input"
                            );


                        if (noteInput) {

                            noteInput.value =
                                record.note ||
                                "";
                        }
                    }
                );

            } catch (error) {

                console.warn(
                    "Existing attendance load error:",
                    error
                );
            }
        };


    /* =====================================================
       MAHRAM DRAFT REMOVE FIX
       ===================================================== */

    App.bindStudentMahramDraftEvents =
        function () {

            if (
                App.currentPage !==
                "students.html"
            ) {
                return;
            }


            if (
                typeof App.getStudentElements !==
                "function"
            ) {
                return;
            }


            const el =
                App.getStudentElements();


            if (!el.mahramList) {
                return;
            }


            el.mahramList
                .addEventListener(
                    "click",
                    function (event) {

                        const button =
                            event.target.closest(
                                ".remove-mahram"
                            );


                        if (!button) {
                            return;
                        }


                        window.setTimeout(
                            function () {

                                if (
                                    typeof App.scheduleStudentDraft ===
                                    "function"
                                ) {

                                    App.scheduleStudentDraft();
                                }
                            },
                            0
                        );
                    }
                );
        };


    /* =====================================================
       APPROVAL CONFIRM BUTTON
       FORCE FINAL FUNCTION BINDING
       ===================================================== */

    App.rebindApprovalConfirmationButton =
        function () {

            if (
                App.currentPage !==
                "approvals.html"
            ) {
                return;
            }


            const oldButton =
                App.byId(
                    "confirmApplicationDecision"
                );


            if (
                !oldButton ||
                !oldButton.parentNode
            ) {
                return;
            }


            /*
             * Clone removes any older event listener
             * and guarantees that the final version of
             * executeApplicationDecision is used.
             */

            const newButton =
                oldButton.cloneNode(
                    true
                );


            oldButton.parentNode
                .replaceChild(
                    newButton,
                    oldButton
                );


            newButton
                .addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        if (
                            typeof App.executeApplicationDecision ===
                            "function"
                        ) {

                            App.executeApplicationDecision();
                        }
                    }
                );
        };


    /* =====================================================
       FORM ENTER SAFETY
       ===================================================== */

    App.preventAccidentalModalSubmit =
        function () {

            if (
                App.currentPage !==
                "approvals.html"
            ) {
                return;
            }


            const note =
                App.byId(
                    "applicationAdminNote"
                );


            if (!note) {
                return;
            }


            note.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();
                    }
                }
            );
        };


    /* =====================================================
       FINAL SESSION PAGE CHECK
       ===================================================== */

    App.finalSessionPageCheck =
        function () {

            const page =
                App.currentPage;


            if (
                page ===
                "dashboard.html"
            ) {

                App.requireSession(
                    [
                        "admin",
                        "teacher",
                        "student"
                    ]
                );

                return;
            }


            if (
                [
                    "students.html",
                    "teachers.html",
                    "approvals.html"
                ].includes(
                    page
                )
            ) {

                App.requireSession(
                    ["admin"]
                );

                return;
            }


            if (
                page ===
                "attendance.html"
            ) {

                App.requireSession(
                    [
                        "admin",
                        "teacher"
                    ]
                );
            }
        };


    /* =====================================================
       REQUIRED FUNCTION SELF CHECK
       ===================================================== */

    App.runSystemSelfCheck =
        function () {

            const requiredCore = [
                "initSupabase",
                "rpc",
                "getStoredSession",
                "saveSession",
                "clearStoredSession",
                "requireSession",
                "logout",
                "escapeHTML",
                "cleanText"
            ];


            const missing = [];


            requiredCore.forEach(
                function (name) {

                    if (
                        typeof App[name] !==
                        "function"
                    ) {

                        missing.push(
                            name
                        );
                    }
                }
            );


            if (
                missing.length > 0
            ) {

                console.error(
                    "Missing core functions:",
                    missing
                );

                return false;
            }


            return true;
        };


    /* =====================================================
       FINAL INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            if (
                !App.runSystemSelfCheck()
            ) {
                return;
            }


            App.finalSessionPageCheck();


            App.bindStudentMahramDraftEvents();


            App.rebindApprovalConfirmationButton();


            App.preventAccidentalModalSubmit();


            /*
             * Ensure current active session timestamp
             * is checked once more after all modules.
             */

            if (
                App.isAuthenticated()
            ) {

                App.checkInactivity();
            }
        }
    );

})();

/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 13 / FINAL COMPATIBILITY PATCHES
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       FINAL TRANSFER ADMISSION DETECTION
       ===================================================== */

    App.isTransferAdmission =
        function (value) {

            const text =
                App.cleanText(
                    value
                ).toLowerCase();


            return (
                text.includes("منتقل") ||
                text.includes("منتقلی") ||
                text.includes("تبادلہ") ||
                text.includes("transfer")
            );
        };


    /* =====================================================
       FINAL STUDENT MAHRAM VALIDATION
       ===================================================== */

    App.validateStudentMahrams =
        function (
            mahrams,
            residenceType
        ) {

            if (
                !App.isHostelResidence(
                    residenceType
                )
            ) {

                return true;
            }


            if (
                !Array.isArray(
                    mahrams
                ) ||
                mahrams.length < 1 ||
                mahrams.length >
                    App.MAX_MAHRAMS
            ) {

                return false;
            }


            for (
                const mahram
                of mahrams
            ) {

                if (
                    !App.cleanText(
                        mahram.name
                    ) ||
                    !App.isUrduText(
                        mahram.name
                    ) ||
                    !App.cleanText(
                        mahram.relation
                    ) ||
                    !App.isUrduText(
                        mahram.relation
                    ) ||
                    !App.isValidPhone(
                        mahram.phone
                    ) ||
                    !App.isValidCNIC(
                        mahram.cnic
                    )
                ) {

                    return false;
                }
            }


            return true;
        };


    /* =====================================================
       FINAL STUDENT VALIDATION
       INCLUDING MAHRAM CONFIRMATION
       ===================================================== */

    App.validateStudentData =
        function (data) {

            const el =
                App.getStudentElements();


            if (!data.admissionNo) {

                App.showMessage(
                    el.studentFormMessage,
                    "داخلہ نمبر درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.admissionType) {

                App.showMessage(
                    el.studentFormMessage,
                    "داخلہ کی قسم منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.name ||
                !App.isUrduText(
                    data.name
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "طالبہ کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.fatherName ||
                !App.isUrduText(
                    data.fatherName
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "والد کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !data.guardianName ||
                !App.isUrduText(
                    data.guardianName
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "سرپرست کا نام اردو میں درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidCNIC(
                    data.cnic
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (
                !App.isValidPhone(
                    data.phone
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "فون نمبر 11 ہندسوں کا ہونا چاہیے۔",
                    "error"
                );

                return false;
            }


            if (!data.dateOfBirth) {

                App.showMessage(
                    el.studentFormMessage,
                    "تاریخ پیدائش درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.studentClass) {

                App.showMessage(
                    el.studentFormMessage,
                    "درجہ منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.admissionDate) {

                App.showMessage(
                    el.studentFormMessage,
                    "تاریخ داخلہ درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.address) {

                App.showMessage(
                    el.studentFormMessage,
                    "پتہ درج کریں۔",
                    "error"
                );

                return false;
            }


            if (!data.residenceType) {

                App.showMessage(
                    el.studentFormMessage,
                    "رہائش کی قسم منتخب کریں۔",
                    "error"
                );

                return false;
            }


            if (
                App.isTransferAdmission(
                    data.admissionType
                )
            ) {

                if (
                    !data.previousMadrassa
                ) {

                    App.showMessage(
                        el.studentFormMessage,
                        "سابقہ مدرسہ درج کریں۔",
                        "error"
                    );

                    return false;
                }


                if (
                    !data.transferDate
                ) {

                    App.showMessage(
                        el.studentFormMessage,
                        "منتقلی کی تاریخ درج کریں۔",
                        "error"
                    );

                    return false;
                }

            } else {

                data.previousMadrassa =
                    "";

                data.transferDate =
                    "";
            }


            if (
                !App.validateStudentMahrams(
                    data.mahrams,
                    data.residenceType
                )
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "ہاسٹل طالبہ کے لیے ایک سے پانچ مکمل محرم درج کریں۔",
                    "error"
                );

                return false;
            }


            if (
                App.isHostelResidence(
                    data.residenceType
                ) &&
                el.mahramConfirmation &&
                !el.mahramConfirmation.checked
            ) {

                App.showMessage(
                    el.studentFormMessage,
                    "محرم کی معلومات کی تصدیق کریں۔",
                    "error"
                );

                return false;
            }


            return true;
        };


    /* =====================================================
       STUDENT APPLICATION TRANSFER VALIDATION FIX
       ===================================================== */

    if (
        typeof App.validateStudentApplication ===
        "function"
    ) {

        const originalStudentApplicationValidation =
            App.validateStudentApplication;


        App.validateStudentApplication =
            function (data) {

                const valid =
                    originalStudentApplicationValidation(
                        data
                    );


                if (!valid) {
                    return false;
                }


                const el =
                    App.getStudentApplicationElements();


                if (
                    App.isTransferAdmission(
                        data.admissionType
                    ) &&
                    !data.transferDate
                ) {

                    App.showMessage(
                        el.studentApplyMessage,
                        "منتقلی کی تاریخ درج کریں۔",
                        "error"
                    );

                    return false;
                }


                return true;
            };
    }


    /* =====================================================
       RESET STUDENT MAHRAM CONFIRMATION
       ===================================================== */

    if (
        typeof App.resetStudentForm ===
        "function"
    ) {

        const originalResetStudentForm =
            App.resetStudentForm;


        App.resetStudentForm =
            function () {

                originalResetStudentForm();


                const el =
                    App.getStudentElements();


                if (
                    el.mahramConfirmation
                ) {

                    el.mahramConfirmation.checked =
                        false;
                }
            };
    }


    /* =====================================================
       EDIT STUDENT MAHRAM CONFIRMATION
       ===================================================== */

    if (
        typeof App.openStudentForm ===
        "function"
    ) {

        const previousOpenStudentForm =
            App.openStudentForm;


        App.openStudentForm =
            function (
                student = null
            ) {

                previousOpenStudentForm(
                    student
                );


                if (!student) {
                    return;
                }


                const el =
                    App.getStudentElements();


                if (
                    el.mahramConfirmation &&
                    App.isHostelResidence(
                        student.residence_type
                    )
                ) {

                    el.mahramConfirmation.checked =
                        true;
                }
            };
    }


    /* =====================================================
       CLEAR DRAFT ONLY AFTER SUCCESSFUL SAVE
       ===================================================== */

    if (
        typeof App.saveStudent ===
        "function"
    ) {

        const originalSaveStudent =
            App.saveStudent;


        App.saveStudent =
            async function (
                event
            ) {

                const before =
                    App.studentsCache.length;


                await originalSaveStudent(
                    event
                );


                const after =
                    App.studentsCache.length;


                if (
                    after !== before ||
                    App.editingStudentId ===
                        null
                ) {

                    /*
                     * Successful closeStudentForm also
                     * clears draft. This is only a final
                     * safety cleanup.
                     */

                    if (
                        typeof App.clearStudentDraft ===
                        "function"
                    ) {

                        const message =
                            App.getStudentElements()
                                .studentFormMessage;


                        if (
                            message &&
                            message.dataset.messageType ===
                                "success"
                        ) {

                            App.clearStudentDraft();
                        }
                    }
                }
            };
    }


    if (
        typeof App.saveTeacher ===
        "function"
    ) {

        const originalSaveTeacher =
            App.saveTeacher;


        App.saveTeacher =
            async function (
                event
            ) {

                await originalSaveTeacher(
                    event
                );


                if (
                    typeof App.clearTeacherDraft ===
                    "function"
                ) {

                    const message =
                        App.getTeacherElements()
                            .teacherFormMessage;


                    if (
                        message &&
                        message.dataset.messageType ===
                            "success"
                    ) {

                        App.clearTeacherDraft();
                    }
                }
            };
    }


    /* =====================================================
       FINAL PASSWORD AUTOCOMPLETE SETTINGS
       ===================================================== */

    App.applyPasswordSafety =
        function () {

            const loginPassword =
                App.byId(
                    "password"
                );


            if (loginPassword) {

                loginPassword.setAttribute(
                    "autocomplete",
                    "current-password"
                );
            }


            const newPasswords = [

                App.byId(
                    "applyPassword"
                ),

                App.byId(
                    "applyConfirmPassword"
                ),

                App.byId(
                    "applyTeacherPassword"
                ),

                App.byId(
                    "applyTeacherConfirmPassword"
                )
            ];


            newPasswords
                .filter(Boolean)
                .forEach(
                    function (input) {

                        input.setAttribute(
                            "autocomplete",
                            "new-password"
                        );
                    }
                );
        };


    /* =====================================================
       FINAL FORM SUBMIT SAFETY
       ===================================================== */

    App.disableNativeInvalidNavigation =
        function () {

            const forms =
                document.querySelectorAll(
                    "form"
                );


            forms.forEach(
                function (form) {

                    form.addEventListener(
                        "invalid",
                        function (
                            event
                        ) {

                            const target =
                                event.target;


                            if (
                                target &&
                                typeof target.scrollIntoView ===
                                    "function"
                            ) {

                                target.scrollIntoView({
                                    behavior:
                                        "smooth",

                                    block:
                                        "center"
                                });
                            }

                        },
                        true
                    );
                }
            );
        };


    /* =====================================================
       FINAL ONLINE / OFFLINE MESSAGE
       ===================================================== */

    App.showOfflineWarning =
        function () {

            const pageMessageIds = [

                "loginMessage",

                "studentFormMessage",

                "teacherFormMessage",

                "studentApplyMessage",

                "teacherApplyMessage",

                "studentApplicationsMessage",

                "teacherApplicationsMessage",

                "attendanceMessage"
            ];


            let target = null;


            for (
                const id
                of pageMessageIds
            ) {

                const element =
                    App.byId(
                        id
                    );


                if (element) {

                    target =
                        element;

                    break;
                }
            }


            if (target) {

                App.showMessage(
                    target,
                    "انٹرنیٹ کنکشن دستیاب نہیں ہے۔",
                    "error"
                );
            }
        };


    /* =====================================================
       FINAL INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.applyPasswordSafety();


            App.disableNativeInvalidNavigation();


            window.addEventListener(
                "offline",
                App.showOfflineWarning
            );


            window.addEventListener(
                "online",
                function () {

                    /*
                     * Page is online again.
                     * Current data remains untouched.
                     */

                    console.log(
                        "Internet connection restored."
                    );
                }
            );


            if (
                navigator.onLine ===
                false
            ) {

                App.showOfflineWarning();
            }
        }
    );

})();


/* =====================================================
   MADRASSA MANAGEMENT SYSTEM
   SCRIPT.JS
   PART 14 / 14
   FINAL BUTTON + FORM COMPATIBILITY
   ===================================================== */

(function () {
    "use strict";

    const App =
        window.MadrassaApp;

    if (!App) {
        console.error(
            "MadrassaApp core is not loaded."
        );

        return;
    }


    /* =====================================================
       BUTTON TYPE HELPER
       ===================================================== */

    App.setButtonType =
        function (
            id,
            type
        ) {

            const button =
                App.byId(id);


            if (
                button &&
                button.tagName ===
                    "BUTTON"
            ) {

                button.type =
                    type;
            }
        };


    /* =====================================================
       CORRECT ALL BUTTON TYPES
       ===================================================== */

    App.applyFinalButtonTypes =
        function () {

            /* LOGIN */

            App.setButtonType(
                "loginButton",
                "submit"
            );

            App.setButtonType(
                "togglePassword",
                "button"
            );

            App.setButtonType(
                "backButton",
                "button"
            );


            /* HOME */

            [
                "adminLoginButton",
                "teacherLoginButton",
                "studentLoginButton",
                "studentApplyButton",
                "teacherApplyButton"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );


            /* DASHBOARD */

            [
                "studentsButton",
                "teachersButton",
                "attendanceButton",
                "approvalsButton",
                "announcementsButton",
                "reportsButton",
                "logoutButton"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );


            /* STUDENTS */

            App.setButtonType(
                "saveStudentButton",
                "submit"
            );


            [
                "backToDashboard",
                "showStudentForm",
                "cancelStudentForm",
                "addMahram",
                "closeStudentDetails"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );


            /* TEACHERS */

            App.setButtonType(
                "saveTeacherButton",
                "submit"
            );


            [
                "showTeacherForm",
                "cancelTeacherButton",
                "closeTeacherDetails"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );


            /* STUDENT APPLICATION */

            App.setButtonType(
                "submitStudentApplication",
                "submit"
            );


            [
                "cancelStudentApplication",
                "addApplyMahram",
                "checkStudentApplicationStatus"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );


            /* TEACHER APPLICATION */

            App.setButtonType(
                "submitTeacherApplication",
                "submit"
            );


            [
                "cancelTeacherApplication",
                "checkTeacherApplicationStatus"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );


            /* APPROVALS */

            [
                "approveApplicationButton",
                "rejectApplicationButton",
                "closeApplicationDetails",
                "closeApprovalConfirmation",
                "confirmApplicationDecision",
                "cancelApplicationDecision"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );


            /* ATTENDANCE */

            [
                "loadAttendanceStudents",
                "markAllPresent",
                "clearAttendance",
                "saveAttendance",
                "loadAttendanceRecords"
            ].forEach(
                function (id) {

                    App.setButtonType(
                        id,
                        "button"
                    );
                }
            );
        };


    /* =====================================================
       DATE LIMITS
       ===================================================== */

    App.applyDateLimits =
        function () {

            const today =
                App.todayISO();


            /*
             * Birth dates cannot be
             * in the future.
             */

            [
                "dateOfBirth",
                "teacherDateOfBirth",
                "applyDateOfBirth",
                "applyTeacherDateOfBirth"
            ].forEach(
                function (id) {

                    const input =
                        App.byId(id);


                    if (input) {

                        input.max =
                            today;
                    }
                }
            );
        };


    /* =====================================================
       PREVENT ENTER ON SEARCH FIELDS
       ===================================================== */

    App.preventSearchSubmit =
        function () {

            [
                "studentSearch",
                "teacherSearch"
            ].forEach(
                function (id) {

                    const input =
                        App.byId(id);


                    if (!input) {
                        return;
                    }


                    input.addEventListener(
                        "keydown",
                        function (event) {

                            if (
                                event.key ===
                                "Enter"
                            ) {

                                event.preventDefault();
                            }
                        }
                    );
                }
            );
        };


    /* =====================================================
       FINAL SESSION VALIDITY CHECK
       ===================================================== */

    App.finalSessionValidation =
        function () {

            if (
                App.isPublicPage()
            ) {
                return;
            }


            const session =
                App.getStoredSession();


            if (
                !session ||
                !session.token ||
                !session.role
            ) {

                App.clearStoredSession();


                window.location.replace(
                    "login.html?reason=" +
                    encodeURIComponent(
                        "login-required"
                    )
                );

                return;
            }


            const lastActivity =
                Number(
                    session.lastActivity ||
                    0
                );


            if (
                !lastActivity ||
                Date.now() -
                    lastActivity >
                    App.INACTIVITY_LIMIT
            ) {

                App.logout(
                    "timeout"
                );
            }
        };


    /* =====================================================
       PREVENT DUPLICATE PAGE INITIALIZATION
       ===================================================== */

    App.markSystemReady =
        function () {

            document.documentElement
                .setAttribute(
                    "data-madrassa-system",
                    "ready"
                );
        };


    /* =====================================================
       GLOBAL ERROR LOGGING
       ===================================================== */

    App.initializeGlobalErrorLogging =
        function () {

            window.addEventListener(
                "error",
                function (event) {

                    console.error(
                        "Application error:",
                        event.error ||
                        event.message
                    );
                }
            );


            window.addEventListener(
                "unhandledrejection",
                function (event) {

                    console.error(
                        "Unhandled request error:",
                        event.reason
                    );
                }
            );
        };


    /* =====================================================
       FINAL INITIALIZATION
       ===================================================== */

    App.ready(
        function () {

            App.applyFinalButtonTypes();


            App.applyDateLimits();


            App.preventSearchSubmit();


            App.finalSessionValidation();


            App.initializeGlobalErrorLogging();


            App.markSystemReady();
        }
    );

})();


