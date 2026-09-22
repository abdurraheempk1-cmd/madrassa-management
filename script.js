/* =========================================================
   مدرسہ شہناز اختر للبنات
   COMPLETE FRONTEND SCRIPT
   Secure session + Admin + Teacher + Student + Print/PDF
   ========================================================= */

(function () {
    "use strict";

    const App = window.App = window.App || {};

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    App.SUPABASE_URL =
        "https://ggtnetudnjsmsmitvjmb.supabase.co";

    App.SUPABASE_KEY =
        "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";

    App.NAME =
        "مدرسہ شہناز اختر للبنات";

    App.ADDRESS =
        "گاؤں ہل غورغشتوں، ضلع بونیر";

    App.INACTIVITY_LIMIT =
        5 * 60 * 1000;

    App.HEARTBEAT_INTERVAL =
        60 * 1000;

    App.MAX_MAHRAMS = 5;

    App.client = null;

    App.session = null;

    App.lastInteraction =
        Date.now();

    App.heartbeatTimer = null;

    App.currentFile =
        String(
            window.location.pathname || ""
        )
            .split("/")
            .pop()
            .toLowerCase();


    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    App.safe = function (value) {

        return (
            value === null ||
            value === undefined
        )
            ? ""
            : String(value);
    };


    App.escape = function (value) {

        return App.safe(value)

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
    };


    App.normalizeDigits =
        function (value) {

            return App.safe(value)

                .replace(
                    /[٠-٩]/g,
                    digit =>
                        String(
                            "٠١٢٣٤٥٦٧٨٩"
                                .indexOf(digit)
                        )
                )

                .replace(
                    /[۰-۹]/g,
                    digit =>
                        String(
                            "۰۱۲۳۴۵۶۷۸۹"
                                .indexOf(digit)
                        )
                )

                .replace(
                    /\D/g,
                    ""
                );
        };


    App.formatCNIC =
        function (value) {

            const digits =
                App.normalizeDigits(
                    value
                )
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
                    digits.slice(5)
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
                digits.slice(12)
            );
        };


    App.normalizePhone =
        function (value) {

            return App
                .normalizeDigits(
                    value
                )
                .slice(
                    0,
                    11
                );
        };


    App.isUrduName =
        function (value) {

            const text =
                App.safe(
                    value
                ).trim();

            if (!text) {
                return false;
            }

            return /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/
                .test(text);
        };


    App.el = function (id) {

        return document
            .getElementById(
                id
            );
    };


    App.first =
        function (...ids) {

            for (
                const id of ids
            ) {

                const node =
                    App.el(id);

                if (node) {
                    return node;
                }
            }

            return null;
        };


    App.val = function (id) {

        const node =
            App.el(id);

        return node
            ? App.safe(
                node.value
            ).trim()
            : "";
    };


    App.setText =
        function (
            id,
            value,
            fallback = "—"
        ) {

            const node =
                App.el(id);

            if (!node) {
                return;
            }

            node.textContent =
                value === null ||
                value === undefined ||
                value === ""
                    ? fallback
                    : value;
        };


    App.setHTML =
        function (
            id,
            html
        ) {

            const node =
                App.el(id);

            if (node) {

                node.innerHTML =
                    html || "";
            }
        };


    App.show =
        function (
            nodeOrId,
            display = "block"
        ) {

            const node =
                typeof nodeOrId ===
                "string"
                    ? App.el(nodeOrId)
                    : nodeOrId;

            if (node) {

                node.hidden = false;

                node.style.display =
                    display;
            }
        };


    App.hide =
        function (nodeOrId) {

            const node =
                typeof nodeOrId ===
                "string"
                    ? App.el(nodeOrId)
                    : nodeOrId;

            if (node) {

                node.hidden = true;

                node.style.display =
                    "none";
            }
        };


    App.message =
        function (
            target,
            text,
            type = "info"
        ) {

            const node =
                typeof target ===
                "string"
                    ? App.el(target)
                    : target;

            if (!node) {
                return;
            }

            node.textContent =
                text || "";

            node.classList.remove(
                "success",
                "error",
                "warning",
                "info"
            );

            node.classList.add(
                type
            );
        };


    App.money =
        function (
            value,
            currency = "PKR"
        ) {

            const number =
                Number(
                    value || 0
                );

            return (
                number.toLocaleString(
                    "en-PK",
                    {
                        maximumFractionDigits: 2
                    }
                ) +
                " " +
                App.escape(currency)
            );
        };


    App.date =
        function (value) {

            if (!value) {
                return "—";
            }

            const date =
                new Date(value);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return App.safe(
                    value
                );
            }

            return new Intl.DateTimeFormat(
                "ur-PK",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }
            )
                .format(date);
        };


    App.dateTime =
        function (value) {

            if (!value) {
                return "—";
            }

            const date =
                new Date(value);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return App.safe(
                    value
                );
            }

            return new Intl.DateTimeFormat(
                "ur-PK",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
                .format(date);
        };


    App.statusUrdu =
        function (value) {

            const key =
                App.safe(value)
                    .trim()
                    .toLowerCase();

            const map = {

                active:
                    "فعال",

                inactive:
                    "غیر فعال",

                approved:
                    "منظور شدہ",

                pending:
                    "زیرِ انتظار",

                rejected:
                    "مسترد",

                present:
                    "حاضر",

                absent:
                    "غیر حاضر",

                leave:
                    "رخصت",

                late:
                    "تاخیر",

                completed:
                    "مکمل",

                submitted:
                    "جمع شدہ",

                checked:
                    "چیک شدہ",

                open:
                    "بقایا",

                paid:
                    "ادا شدہ",

                partial:
                    "جزوی ادا شدہ",

                due:
                    "واجب الادا",

                waived:
                    "معاف",

                cancelled:
                    "منسوخ",

                out:
                    "باہر",

                returned:
                    "واپس",

                promoted:
                    "ترقی یافتہ",

                repeated:
                    "کلاس دہرائی",

                graduated:
                    "فارغ التحصیل",

                transferred:
                    "منتقل"
            };

            return (
                map[key] ||
                App.safe(value) ||
                "—"
            );
        };


    App.empty =
        function (
            text =
                "کوئی ریکارڈ موجود نہیں۔"
        ) {

            return (
                `<div class="print-empty">` +
                App.escape(text) +
                `</div>`
            );
        };


    App.table =
        function (
            headers,
            rows
        ) {

            if (
                !Array.isArray(rows) ||
                !rows.length
            ) {

                return App.empty();
            }

            const head =
                headers
                    .map(
                        heading =>
                            `<th>${
                                App.escape(
                                    heading
                                )
                            }</th>`
                    )
                    .join("");


            const body =
                rows
                    .map(
                        row =>
                            `<tr>${
                                row
                                    .map(
                                        cell =>
                                            `<td>${
                                                cell === null ||
                                                cell === undefined ||
                                                cell === ""
                                                    ? "—"
                                                    : cell
                                            }</td>`
                                    )
                                    .join("")
                            }</tr>`
                    )
                    .join("");


            return (
                `<table>` +
                `<thead>` +
                `<tr>` +
                head +
                `</tr>` +
                `</thead>` +
                `<tbody>` +
                body +
                `</tbody>` +
                `</table>`
            );
        };


    App.infoGrid =
        function (items) {

            return (
                `<div class="print-info-grid">` +

                items
                    .filter(
                        item =>
                            item &&
                            item[0]
                    )

                    .map(
                        ([label, value]) =>

                            `<div class="print-info-item">` +

                            `<span class="print-info-label">` +
                            App.escape(label) +
                            `</span>` +

                            `<span class="print-info-value">` +

                            (
                                value === null ||
                                value === undefined ||
                                value === ""
                                    ? "—"
                                    : App.escape(
                                        value
                                    )
                            ) +

                            `</span>` +

                            `</div>`
                    )

                    .join("") +

                `</div>`
            );
        };


    App.downloadName =
        function (
            prefix,
            name
        ) {

            const clean =
                App.safe(name)

                    .replace(
                        /[\\/:*?"<>|]+/g,
                        "-"
                    )

                    .trim() ||
                "profile";

            return (
                prefix +
                "-" +
                clean
            );
        };


    /* =====================================================
       SUPABASE
       ===================================================== */

    App.initSupabase =
        function () {

            if (
                !window.supabase ||
                typeof window.supabase
                    .createClient !==
                    "function"
            ) {

                throw new Error(
                    "Supabase library is not loaded"
                );
            }


            App.client =
                window.supabase
                    .createClient(

                        App.SUPABASE_URL,

                        App.SUPABASE_KEY
                    );


            window.supabaseClient =
                App.client;
        };


    App.rpc =
        async function (
            name,
            args = {}
        ) {

            if (!App.client) {

                throw new Error(
                    "Database connection is not ready"
                );
            }


            const {
                data,
                error
            } =
                await App.client
                    .rpc(
                        name,
                        args
                    );


            if (error) {
                throw error;
            }


            if (
                typeof data ===
                "string"
            ) {

                try {

                    return JSON.parse(
                        data
                    );

                } catch (_) {

                    return data;
                }
            }


            return data;
        };


    App.authedRpc =
        async function (
            name,
            args = {}
        ) {

            const token =
                App.getToken();


            if (!token) {

                throw new Error(
                    "Session token missing"
                );
            }


            return App.rpc(
                name,

                Object.assign(
                    {
                        p_token:
                            token
                    },
                    args
                )
            );
        };


    App.query =
        async function (
            table,
            builder
        ) {

            if (!App.client) {

                throw new Error(
                    "Database connection is not ready"
                );
            }


            let query =
                App.client
                    .from(table)
                    .select("*");


            if (
                typeof builder ===
                "function"
            ) {

                query =
                    builder(query);
            }


            const {
                data,
                error
            } =
                await query;


            if (error) {
                throw error;
            }


            return data || [];
        };


    /* =====================================================
       SESSION / SECURITY
       ===================================================== */

    App.getToken =
        function () {

            return App.safe(
                localStorage.getItem(
                    "sessionToken"
                )
            ).trim();
        };


    App.getRole =
        function () {

            return App.safe(
                localStorage.getItem(
                    "userRole"
                )
            )
                .trim()
                .toLowerCase();
        };


    App.getAccountId =
        function () {

            return (
                Number(
                    localStorage
                        .getItem(
                            "accountId"
                        ) || 0
                ) ||
                null
            );
        };


    App.getStudentId =
        function () {

            return (
                Number(
                    localStorage
                        .getItem(
                            "studentId"
                        ) || 0
                ) ||
                null
            );
        };


    App.getTeacherId =
        function () {

            return (
                Number(
                    localStorage
                        .getItem(
                            "teacherId"
                        ) || 0
                ) ||
                null
            );
        };


    App.isLoggedIn =
        function () {

            return (
                localStorage.getItem(
                    "loggedIn"
                ) === "true" &&
                !!App.getToken()
            );
        };


    App.roleHome =
        function (role) {

            if (
                role === "admin"
            ) {

                return "admin.html";
            }

            if (
                role === "teacher"
            ) {

                return "teacher.html";
            }

            if (
                role === "student"
            ) {

                return "student.html";
            }

            return "index.html";
        };


    App.clearSession =
        function () {

            [
                "sessionToken",
                "loggedIn",
                "userRole",
                "accountId",
                "studentId",
                "teacherId",
                "username",
                "lastActivity"
            ]
                .forEach(
                    key =>
                        localStorage
                            .removeItem(
                                key
                            )
                );


            App.session = null;
        };


    App.saveSession =
        function (
            session,
            username
        ) {

            App.clearSession();


            localStorage.setItem(
                "sessionToken",
                App.safe(
                    session.token
                )
            );


            localStorage.setItem(
                "loggedIn",
                "true"
            );


            localStorage.setItem(
                "userRole",
                App.safe(
                    session.role
                )
                    .toLowerCase()
            );


            localStorage.setItem(
                "accountId",
                App.safe(
                    session.account_id
                )
            );


            localStorage.setItem(
                "username",
                App.safe(
                    username
                )
            );


            localStorage.setItem(
                "lastActivity",
                String(
                    Date.now()
                )
            );


            if (
                session.student_id
            ) {

                localStorage.setItem(
                    "studentId",
                    App.safe(
                        session.student_id
                    )
                );
            }


            if (
                session.teacher_id
            ) {

                localStorage.setItem(
                    "teacherId",
                    App.safe(
                        session.teacher_id
                    )
                );
            }


            App.session =
                session;


            App.lastInteraction =
                Date.now();
        };


    App.validateSession =
        async function (
            redirect = true
        ) {

            const token =
                App.getToken();


            if (!token) {

                if (redirect) {
                    App.goLogin();
                }

                return null;
            }


            try {

                const data =
                    await App.rpc(
                        "app_session_validate",
                        {
                            p_token:
                                token
                        }
                    );


                if (
                    !data ||
                    data.valid !== true
                ) {

                    throw new Error(
                        "Invalid session"
                    );
                }


                App.session =
                    data;


                localStorage.setItem(
                    "loggedIn",
                    "true"
                );


                localStorage.setItem(
                    "userRole",
                    App.safe(
                        data.role
                    )
                        .toLowerCase()
                );


                localStorage.setItem(
                    "accountId",
                    App.safe(
                        data.account_id
                    )
                );


                if (
                    data.student_id
                ) {

                    localStorage.setItem(
                        "studentId",
                        App.safe(
                            data.student_id
                        )
                    );
                }


                if (
                    data.teacher_id
                ) {

                    localStorage.setItem(
                        "teacherId",
                        App.safe(
                            data.teacher_id
                        )
                    );
                }


                return data;


            } catch (error) {

                console.error(
                    "Session validation error:",
                    error
                );


                App.clearSession();


                if (redirect) {
                    App.goLogin();
                }


                return null;
            }
        };


    App.goLogin =
        function () {

            if (
                App.currentFile ===
                "login.html"
            ) {

                return;
            }


            window.location.href =
                "index.html";
        };


    App.logout =
        async function () {

            const token =
                App.getToken();


            try {

                if (
                    token &&
                    App.client
                ) {

                    await App.rpc(
                        "logout_session",
                        {
                            p_token:
                                token
                        }
                    );
                }

            } catch (error) {

                console.warn(
                    "Logout RPC error:",
                    error
                );
            }


            App.clearSession();


            window.location.href =
                "index.html";
        };


    App.requireRole =
        async function (
            roles
        ) {

            const session =
                await App
                    .validateSession(
                        true
                    );


            if (!session) {
                return null;
            }


            const allowed =
                Array.isArray(roles)
                    ? roles
                    : [roles];


            if (
                !allowed.includes(
                    App.safe(
                        session.role
                    )
                        .toLowerCase()
                )
            ) {

                window.location.href =
                    App.roleHome(
                        App.safe(
                            session.role
                        )
                            .toLowerCase()
                    );


                return null;
            }


            return session;
        };


    App.startInactivityProtection =
        function () {

            const activity =
                function () {

                    App.lastInteraction =
                        Date.now();


                    localStorage.setItem(
                        "lastActivity",
                        String(
                            App.lastInteraction
                        )
                    );
                };


            [
                "click",
                "keydown",
                "touchstart",
                "scroll",
                "mousemove"
            ]
                .forEach(
                    eventName => {

                        window.addEventListener(
                            eventName,
                            activity,
                            {
                                passive: true
                            }
                        );
                    }
                );


            if (
                App.heartbeatTimer
            ) {

                clearInterval(
                    App.heartbeatTimer
                );
            }


            App.heartbeatTimer =
                window.setInterval(

                    async function () {

                        if (
                            !App.isLoggedIn()
                        ) {

                            return;
                        }


                        const idle =
                            Date.now() -
                            App.lastInteraction;


                        if (
                            idle >=
                            App.INACTIVITY_LIMIT
                        ) {

                            await App.logout();

                            return;
                        }


                        try {

                            await App
                                .validateSession(
                                    false
                                );

                        } catch (_) {
                            /* ignore */
                        }

                    },

                    App.HEARTBEAT_INTERVAL
                );
        };


    /* =====================================================
       ROUTE PROTECTION
       ===================================================== */

    App.publicPages =
        new Set([
            "",
            "index.html",
            "login.html",
            "student-apply.html",
            "teacher-apply.html"
        ]);


    App.adminPages =
        new Set([

            "admin.html",

            "admin-accounts.html",

            "admin-announcements.html",

            "admin-attendance.html",

            "admin-feedback.html",

            "admin-homework.html",

            "admin-marks.html",

            "admin-settings.html",

            "students.html",

            "teachers.html",

            "admin-finance.html",

            "admin-hostel.html",

            "admin-promotions.html",

            "admin-id-cards.html",

            "admin-reports.html",

            "print-profile.html"
        ]);


    App.teacherPages =
        new Set([

            "teacher.html",

            "attendance.html",

            "teacher-students.html",

            "teacher-marks.html",

            "teacher-homework.html",

            "teacher-announcements.html",

            "teacher-feedback.html",

            "teacher-settings.html"
        ]);


    App.studentPages =
        new Set([

            "student.html",

            "my-attendance.html",

            "my-marks.html",

            "homework.html",

            "announcements.html",

            "settings.html"
        ]);


    App.protectCurrentPage =
        async function () {

            if (
                App.publicPages.has(
                    App.currentFile
                )
            ) {

                return true;
            }


            if (
                App.adminPages.has(
                    App.currentFile
                )
            ) {

                return !!(
                    await App.requireRole(
                        "admin"
                    )
                );
            }


            if (
                App.teacherPages.has(
                    App.currentFile
                )
            ) {

                return !!(
                    await App.requireRole(
                        "teacher"
                    )
                );
            }


            if (
                App.studentPages.has(
                    App.currentFile
                )
            ) {

                return !!(
                    await App.requireRole(
                        "student"
                    )
                );
            }


            return true;
        };


    /* =====================================================
       COMMON UI / SIDEBARS
       ===================================================== */

    App.bindSidebar =
        function (
            buttonId,
            sidebarId,
            overlayId
        ) {

            const button =
                App.el(
                    buttonId
                );

            const sidebar =
                App.el(
                    sidebarId
                );

            const overlay =
                App.el(
                    overlayId
                );


            if (
                !button ||
                !sidebar
            ) {

                return;
            }


            const open =
                function () {

                    sidebar
                        .classList
                        .add(
                            "open",
                            "active"
                        );


                    if (overlay) {

                        overlay
                            .classList
                            .add(
                                "open",
                                "active"
                            );
                    }


                    document.body
                        .classList
                        .add(
                            "sidebar-open"
                        );
                };


            const close =
                function () {

                    sidebar
                        .classList
                        .remove(
                            "open",
                            "active"
                        );


                    if (overlay) {

                        overlay
                            .classList
                            .remove(
                                "open",
                                "active"
                            );
                    }


                    document.body
                        .classList
                        .remove(
                            "sidebar-open"
                        );
                };


            button.addEventListener(
                "click",
                function () {

                    if (
                        sidebar.classList
                            .contains(
                                "open"
                            ) ||
                        sidebar.classList
                            .contains(
                                "active"
                            )
                    ) {

                        close();

                    } else {

                        open();
                    }
                }
            );


            if (overlay) {

                overlay
                    .addEventListener(
                        "click",
                        close
                    );
            }


            sidebar
                .querySelectorAll(
                    "a"
                )
                .forEach(
                    link =>
                        link.addEventListener(
                            "click",
                            close
                        )
                );
        };


    App.bindCommonUI =
        function () {

            App.bindSidebar(
                "adminMenuButton",
                "adminSidebar",
                "adminSidebarOverlay"
            );


            App.bindSidebar(
                "teacherMenuButton",
                "teacherSidebar",
                "teacherSidebarOverlay"
            );


            App.bindSidebar(
                "studentMenuButton",
                "studentSidebar",
                "studentSidebarOverlay"
            );


            [
                "adminLogoutButton",
                "teacherLogoutButton",
                "studentLogoutButton",
                "settingsAdminLogoutButton",
                "settingsTeacherLogoutButton",
                "settingsStudentLogoutButton"
            ]
                .forEach(
                    id => {

                        const button =
                            App.el(id);


                        if (button) {

                            button
                                .addEventListener(
                                    "click",
                                    App.logout
                                );
                        }
                    }
                );


            const homeRoutes = {

                adminLoginButton:
                    "login.html?role=admin",

                teacherLoginButton:
                    "login.html?role=teacher",

                studentLoginButton:
                    "login.html?role=student",

                studentApplyButton:
                    "student-apply.html",

                teacherApplyButton:
                    "teacher-apply.html"
            };


            Object.entries(
                homeRoutes
            )
                .forEach(
                    ([id, url]) => {

                        const button =
                            App.el(id);


                        if (button) {

                            button
                                .addEventListener(
                                    "click",
                                    function () {

                                        window.location.href =
                                            url;
                                    }
                                );
                        }
                    }
                );


            document
                .querySelectorAll(
                    "input[data-cnic], input.cnic-input"
                )
                .forEach(
                    input => {

                        input
                            .addEventListener(
                                "input",
                                function () {

                                    input.value =
                                        App.formatCNIC(
                                            input.value
                                        );
                                }
                            );
                    }
                );


            document
                .querySelectorAll(
                    "input[data-phone], input.phone-input"
                )
                .forEach(
                    input => {

                        input
                            .addEventListener(
                                "input",
                                function () {

                                    input.value =
                                        App.normalizePhone(
                                            input.value
                                        );
                                }
                            );
                    }
                );
        };


    /* =====================================================
       LOGIN
       ===================================================== */

    App.initLogin =
        function () {

            const form =
                App.el(
                    "loginForm"
                );


            if (!form) {
                return;
            }


            const usernameInput =
                App.el(
                    "username"
                );

            const passwordInput =
                App.el(
                    "password"
                );

            const roleInput =
                App.el(
                    "loginRole"
                );

            const roleText =
                App.el(
                    "selectedRoleText"
                );

            const messageBox =
                App.el(
                    "loginMessage"
                );

            const toggleButton =
                App.el(
                    "togglePassword"
                );

            const backButton =
                App.el(
                    "backButton"
                );


            const params =
                new URLSearchParams(
                    window.location.search
                );


            const role =
                App.safe(
                    params.get(
                        "role"
                    )
                )
                    .toLowerCase();


            const roleNames = {

                admin:
                    "ایڈمن",

                teacher:
                    "استاد",

                student:
                    "طالبہ"
            };


            if (
                ![
                    "admin",
                    "teacher",
                    "student"
                ]
                    .includes(role)
            ) {

                window.location.href =
                    "index.html";

                return;
            }


            if (roleInput) {

                roleInput.value =
                    role;
            }


            if (roleText) {

                roleText.textContent =
                    roleNames[role];
            }


            if (
                toggleButton &&
                passwordInput
            ) {

                toggleButton
                    .addEventListener(
                        "click",
                        function () {

                            const hidden =
                                passwordInput.type ===
                                "password";


                            passwordInput.type =
                                hidden
                                    ? "text"
                                    : "password";


                            toggleButton.textContent =
                                hidden
                                    ? "🙈"
                                    : "👁️";
                        }
                    );
            }


            if (backButton) {

                backButton
                    .addEventListener(
                        "click",
                        function () {

                            window.location.href =
                                "index.html";
                        }
                    );
            }


            form.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const username =
                        App.safe(
                            usernameInput?.value
                        ).trim();


                    const password =
                        App.safe(
                            passwordInput?.value
                        );


                    if (
                        !username ||
                        !password
                    ) {

                        App.message(
                            messageBox,
                            "صارف نام اور پاس ورڈ درج کریں۔",
                            "error"
                        );

                        return;
                    }


                    App.message(
                        messageBox,
                        "لاگ اِن کیا جا رہا ہے...",
                        "info"
                    );


                    try {

                        const login =
                            await App.rpc(
                                "login_session",
                                {
                                    p_role:
                                        role,

                                    p_username:
                                        username,

                                    p_password:
                                        password
                                }
                            );


                        const token =
                            App.safe(
                                login?.token
                            ).trim();


                        if (!token) {

                            throw new Error(
                                "Session token missing"
                            );
                        }


                        const session =
                            await App.rpc(
                                "app_session_validate",
                                {
                                    p_token:
                                        token
                                }
                            );


                        if (
                            !session ||
                            session.valid !== true
                        ) {

                            throw new Error(
                                "Invalid session"
                            );
                        }


                        session.token =
                            token;


                        App.saveSession(
                            session,
                            username
                        );


                        window.location.href =
                            App.roleHome(
                                session.role
                            );


                    } catch (error) {

                        console.error(
                            "Login error:",
                            error
                        );


                        App.message(
                            messageBox,
                            "صارف نام، پاس ورڈ یا اکاؤنٹ کی حالت درست نہیں ہے۔",
                            "error"
                        );
                    }
                }
            );
        };

 /* =====================================================
   PART 2 / 4
   DASHBOARDS + STUDENTS + TEACHERS + ATTENDANCE
   ===================================================== */


/* =====================================================
   GENERIC DATABASE HELPERS
   ===================================================== */

App.countTable =
    async function (
        table,
        filterBuilder = null
    ) {

        let query =
            App.client
                .from(table)
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (
            typeof filterBuilder ===
            "function"
        ) {

            query =
                filterBuilder(
                    query
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
    };


App.selectTable =
    async function (
        table,
        columns = "*",
        builder = null
    ) {

        let query =
            App.client
                .from(table)
                .select(columns);


        if (
            typeof builder ===
            "function"
        ) {

            query =
                builder(query);
        }


        const {
            data,
            error
        } =
            await query;


        if (error) {
            throw error;
        }


        return data || [];
    };


App.one =
    async function (
        table,
        id,
        columns = "*"
    ) {

        const {
            data,
            error
        } =
            await App.client
                .from(table)
                .select(columns)
                .eq(
                    "id",
                    id
                )
                .maybeSingle();


        if (error) {
            throw error;
        }


        return data || null;
    };


/* =====================================================
   PROFILE PRINT LINK
   ===================================================== */

App.openPrintProfile =
    function (
        type,
        id
    ) {

        if (
            !type ||
            !id
        ) {
            return;
        }


        window.location.href =
            "print-profile.html" +
            "?type=" +
            encodeURIComponent(
                type
            ) +
            "&id=" +
            encodeURIComponent(
                id
            );
    };


window.openPrintProfile =
    App.openPrintProfile;


/* =====================================================
   ADMIN DASHBOARD
   ===================================================== */

App.initAdminDashboard =
    async function () {

        if (
            App.currentFile !==
            "admin.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "admin"
            );


        if (!session) {
            return;
        }


        try {

            const [
                studentTotal,
                teacherTotal,
                finance
            ] =
                await Promise.all([

                    App.countTable(
                        "Students"
                    )
                        .catch(
                            () => 0
                        ),

                    App.countTable(
                        "Teachers"
                    )
                        .catch(
                            () => 0
                        ),

                    App.authedRpc(
                        "admin_finance_dashboard"
                    )
                        .catch(
                            () => null
                        )
                ]);


            App.setText(
                "studentTotal",
                studentTotal
            );


            App.setText(
                "teacherTotal",
                teacherTotal
            );


            const balanceNodes = [

                "adminCurrentBalance",

                "adminMadrassaBalance",

                "currentBalance",

                "madrassaBalance"
            ];


            balanceNodes.forEach(
                id => {

                    if (
                        App.el(id) &&
                        finance
                    ) {

                        App.setText(
                            id,
                            App.money(
                                finance
                                    .current_balance ||
                                0
                            )
                        );
                    }
                }
            );


            App.setText(
                "adminFinanceReceived",
                finance
                    ? App.money(
                        finance
                            .total_received ||
                        0
                    )
                    : "0 PKR"
            );


            App.setText(
                "adminFinancePaid",
                finance
                    ? App.money(
                        finance
                            .total_paid ||
                        0
                    )
                    : "0 PKR"
            );


            App.setText(
                "adminRestrictedBalance",
                finance
                    ? App.money(
                        finance
                            .restricted_balance ||
                        0
                    )
                    : "0 PKR"
            );


            App.setText(
                "adminUnrestrictedBalance",
                finance
                    ? App.money(
                        finance
                            .unrestricted_donation_balance ||
                        0
                    )
                    : "0 PKR"
            );


            await App
                .loadAdminDashboardAttendance();


            await App
                .loadAdminDashboardClassCounts();


        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error
            );
        }
    };


App.loadAdminDashboardAttendance =
    async function () {

        try {

            const today =
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    );


            const records =
                await App.selectTable(
                    "Attendance",
                    "id,status,attendance_date",
                    query =>
                        query.eq(
                            "attendance_date",
                            today
                        )
                );


            const total =
                records.length;


            const present =
                records.filter(
                    row =>
                        App.safe(
                            row.status
                        )
                            .toLowerCase() ===
                        "present"
                ).length;


            const absent =
                records.filter(
                    row =>
                        App.safe(
                            row.status
                        )
                            .toLowerCase() ===
                        "absent"
                ).length;


            const leave =
                records.filter(
                    row =>
                        App.safe(
                            row.status
                        )
                            .toLowerCase() ===
                        "leave"
                ).length;


            const percentage =
                total
                    ? Math.round(
                        (
                            present /
                            total
                        ) *
                        100
                    )
                    : 0;


            App.setText(
                "adminAttendanceTotal",
                total
            );


            App.setText(
                "adminAttendancePresent",
                present
            );


            App.setText(
                "adminAttendanceAbsent",
                absent
            );


            App.setText(
                "adminAttendanceLeave",
                leave
            );


            App.setText(
                "adminTodayAttendancePercentage",
                percentage + "%"
            );


        } catch (error) {

            console.warn(
                "Dashboard attendance:",
                error
            );
        }
    };


App.loadAdminDashboardClassCounts =
    async function () {

        const map = {

            "ثانویہ عامہ":
                "adminClassThanviaAmma",

            "ثانویہ خاصہ":
                "adminClassThanviaKhasa",

            "عالیہ اول":
                "adminClassAliaFirst",

            "عالیہ دوم":
                "adminClassAliaSecond",

            "عالمیہ اول":
                "adminClassAlmiaFirst",

            "عالمیہ دوم":
                "adminClassAlmiaSecond"
        };


        try {

            const students =
                await App.selectTable(
                    "Students",
                    "id,student_class"
                );


            Object.entries(
                map
            )
                .forEach(
                    ([className, id]) => {

                        const count =
                            students
                                .filter(
                                    student =>
                                        App.safe(
                                            student
                                                .student_class
                                        )
                                            .trim() ===
                                        className
                                )
                                .length;


                        App.setText(
                            id,
                            count
                        );
                    }
                );


            const hostel =
                students
                    .filter(
                        student => {

                            const residence =
                                App.safe(
                                    student
                                        .residence_type
                                )
                                    .trim()
                                    .toLowerCase();


                            return (
                                residence ===
                                "ہاسٹل" ||
                                residence ===
                                "hostel"
                            );
                        }
                    )
                    .length;


            App.setText(
                "adminHostelStudentCount",
                hostel
            );


        } catch (error) {

            console.warn(
                "Class counts:",
                error
            );
        }
    };


/* =====================================================
   STUDENTS CACHE
   ===================================================== */

App.students = [];

App.studentEditingId =
    null;


/* =====================================================
   LOAD STUDENTS
   ===================================================== */

App.loadStudents =
    async function () {

        App.students =
            await App.selectTable(
                "Students",
                "*",
                query =>
                    query
                        .order(
                            "id",
                            {
                                ascending:
                                    false
                            }
                        )
            );


        return App.students;
    };


/* =====================================================
   STUDENT LIST
   ===================================================== */

App.renderStudentList =
    function (
        records =
            App.students
    ) {

        const container =
            App.first(
                "studentList",
                "studentsList",
                "adminStudentList"
            );


        if (!container) {
            return;
        }


        if (
            !records.length
        ) {

            container.innerHTML =
                App.empty(
                    "کوئی طالبہ موجود نہیں۔"
                );

            return;
        }


        container.innerHTML =
            records
                .map(
                    student => {

                        const id =
                            Number(
                                student.id
                            );


                        return `
                        <article class="record-card student-record-card">

                            <div class="record-card-main">

                                <h3>
                                    ${App.escape(
                                        student.name
                                    )}
                                </h3>

                                <p>
                                    داخلہ نمبر:
                                    <strong>
                                        ${App.escape(
                                            student
                                                .admission_no
                                        )}
                                    </strong>
                                </p>

                                <p>
                                    کلاس:
                                    ${App.escape(
                                        student
                                            .student_class ||
                                        "—"
                                    )}
                                </p>

                                <p>
                                    والد:
                                    ${App.escape(
                                        student
                                            .father_name ||
                                        "—"
                                    )}
                                </p>

                                <p>
                                    رہائش:
                                    ${App.escape(
                                        student
                                            .residence_type ||
                                        "—"
                                    )}
                                </p>

                            </div>

                            <div class="record-card-actions">

                                <button
                                    type="button"
                                    data-student-details="${id}">
                                    مکمل پروفائل
                                </button>

                                <button
                                    type="button"
                                    data-student-print="${id}">
                                    پرنٹ / پی ڈی ایف
                                </button>

                            </div>

                        </article>
                        `;
                    }
                )
                .join("");


        container
            .querySelectorAll(
                "[data-student-details]"
            )
            .forEach(
                button => {

                    button
                        .addEventListener(
                            "click",
                            function () {

                                App.showStudentDetails(
                                    Number(
                                        button.dataset
                                            .studentDetails
                                    )
                                );
                            }
                        );
                }
            );


        container
            .querySelectorAll(
                "[data-student-print]"
            )
            .forEach(
                button => {

                    button
                        .addEventListener(
                            "click",
                            function () {

                                App.openPrintProfile(
                                    "student",
                                    Number(
                                        button.dataset
                                            .studentPrint
                                    )
                                );
                            }
                        );
                }
            );
    };


/* =====================================================
   STUDENT SEARCH / FILTER
   ===================================================== */

App.filterStudents =
    function () {

        const search =
            App.safe(
                App.first(
                    "studentSearch",
                    "studentListSearch",
                    "adminStudentSearch"
                )?.value
            )
                .trim()
                .toLowerCase();


        const classFilter =
            App.safe(
                App.first(
                    "studentClassFilter",
                    "adminStudentClassFilter"
                )?.value
            )
                .trim();


        const residence =
            App.safe(
                App.first(
                    "studentResidenceFilter",
                    "adminStudentResidenceFilter"
                )?.value
            )
                .trim();


        const result =
            App.students
                .filter(
                    student => {

                        const haystack =
                            [
                                student.name,
                                student
                                    .father_name,
                                student
                                    .guardian_name,
                                student
                                    .admission_no,
                                student.phone,
                                student.cnic,
                                student
                                    .student_class
                            ]
                                .map(
                                    value =>
                                        App.safe(
                                            value
                                        )
                                            .toLowerCase()
                                )
                                .join(" ");


                        if (
                            search &&
                            !haystack.includes(
                                search
                            )
                        ) {

                            return false;
                        }


                        if (
                            classFilter &&
                            App.safe(
                                student
                                    .student_class
                            ) !==
                            classFilter
                        ) {

                            return false;
                        }


                        if (
                            residence &&
                            App.safe(
                                student
                                    .residence_type
                            ) !==
                            residence
                        ) {

                            return false;
                        }


                        return true;
                    }
                );


        App.renderStudentList(
            result
        );
    };


/* =====================================================
   STUDENT DETAIL MODAL / PANEL
   ===================================================== */

App.showStudentDetails =
    async function (id) {

        let student =
            App.students
                .find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(id)
                );


        if (!student) {

            student =
                await App.one(
                    "Students",
                    id
                );
        }


        if (!student) {

            alert(
                "طالبہ کا ریکارڈ نہیں ملا۔"
            );

            return;
        }


        const html =
            App.infoGrid([

                [
                    "نام",
                    student.name
                ],

                [
                    "والد کا نام",
                    student
                        .father_name
                ],

                [
                    "سرپرست",
                    student
                        .guardian_name
                ],

                [
                    "داخلہ نمبر",
                    student
                        .admission_no
                ],

                [
                    "داخلہ کی قسم",
                    student
                        .admission_type
                ],

                [
                    "شناختی کارڈ / ب فارم",
                    student.cnic
                ],

                [
                    "فون نمبر",
                    student.phone
                ],

                [
                    "تاریخ پیدائش",
                    App.date(
                        student
                            .date_of_birth
                    )
                ],

                [
                    "کلاس",
                    student
                        .student_class
                ],

                [
                    "داخلہ تاریخ",
                    App.date(
                        student
                            .admission_date
                    )
                ],

                [
                    "پتہ",
                    student.address
                ],

                [
                    "رہائش",
                    student
                        .residence_type
                ],

                [
                    "سابقہ مدرسہ",
                    student
                        .previous_madrassa
                ],

                [
                    "منتقلی تاریخ",
                    App.date(
                        student
                            .transfer_date
                    )
                ]
            ]);


        const target =
            App.first(
                "studentDetailsContent",
                "studentDetailContent",
                "adminStudentDetailsContent"
            );


        if (target) {

            target.innerHTML =
                html;
        }


        App.setText(
            "studentDetailsName",
            student.name
        );


        App.setText(
            "studentDetailName",
            student.name
        );


        const printButtons =
            [
                "studentDetailsPrint",
                "studentPrintProfileButton",
                "printStudentProfile"
            ];


        printButtons.forEach(
            buttonId => {

                const button =
                    App.el(
                        buttonId
                    );


                if (button) {

                    button.onclick =
                        function () {

                            App.openPrintProfile(
                                "student",
                                student.id
                            );
                        };
                }
            }
        );


        const modal =
            App.first(
                "studentDetailsModal",
                "studentDetailsOverlay",
                "studentDetailModal"
            );


        if (modal) {

            modal.hidden =
                false;

            modal.style.display =
                "flex";

        } else {

            const existing =
                document
                    .getElementById(
                        "generatedStudentDetails"
                    );


            if (existing) {
                existing.remove();
            }


            const wrapper =
                document
                    .createElement(
                        "div"
                    );


            wrapper.id =
                "generatedStudentDetails";


            wrapper.className =
                "generated-details-overlay";


            wrapper.innerHTML = `
                <div class="generated-details-card">

                    <button
                        type="button"
                        id="generatedStudentClose">
                        بند کریں
                    </button>

                    <h2>
                        ${App.escape(
                            student.name
                        )}
                    </h2>

                    ${html}

                    <button
                        type="button"
                        id="generatedStudentPrint">
                        مکمل پروفائل پرنٹ / پی ڈی ایف
                    </button>

                </div>
            `;


            document.body
                .appendChild(
                    wrapper
                );


            App.el(
                "generatedStudentClose"
            ).onclick =
                () =>
                    wrapper.remove();


            App.el(
                "generatedStudentPrint"
            ).onclick =
                () =>
                    App.openPrintProfile(
                        "student",
                        student.id
                    );
        }
    };


window.showStudentDetails =
    App.showStudentDetails;


/* =====================================================
   STUDENTS PAGE
   ===================================================== */

App.initStudentsPage =
    async function () {

        if (
            App.currentFile !==
            "students.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "admin"
            );


        if (!session) {
            return;
        }


        const container =
            App.first(
                "studentList",
                "studentsList",
                "adminStudentList"
            );


        if (container) {

            container.innerHTML =
                App.empty(
                    "طالبات کا ریکارڈ لوڈ ہو رہا ہے..."
                );
        }


        try {

            await App.loadStudents();

            App.renderStudentList();


            [
                "studentSearch",
                "studentListSearch",
                "adminStudentSearch",
                "studentClassFilter",
                "adminStudentClassFilter",
                "studentResidenceFilter",
                "adminStudentResidenceFilter"
            ]
                .forEach(
                    id => {

                        const node =
                            App.el(id);


                        if (node) {

                            node.addEventListener(
                                "input",
                                App.filterStudents
                            );


                            node.addEventListener(
                                "change",
                                App.filterStudents
                            );
                        }
                    }
                );


            const clear =
                App.first(
                    "clearStudentFilters",
                    "clearAdminStudentFilters"
                );


            if (clear) {

                clear.addEventListener(
                    "click",
                    function () {

                        [
                            "studentSearch",
                            "studentListSearch",
                            "adminStudentSearch",
                            "studentClassFilter",
                            "adminStudentClassFilter",
                            "studentResidenceFilter",
                            "adminStudentResidenceFilter"
                        ]
                            .forEach(
                                id => {

                                    const node =
                                        App.el(id);


                                    if (node) {
                                        node.value = "";
                                    }
                                }
                            );


                        App.renderStudentList();
                    }
                );
            }


        } catch (error) {

            console.error(
                "Students page:",
                error
            );


            if (container) {

                container.innerHTML =
                    App.empty(
                        "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔"
                    );
            }
        }
    };


/* =====================================================
   TEACHERS CACHE
   ===================================================== */

App.teachers = [];


/* =====================================================
   LOAD TEACHERS
   ===================================================== */

App.loadTeachers =
    async function () {

        App.teachers =
            await App.selectTable(
                "Teachers",
                "*",
                query =>
                    query.order(
                        "id",
                        {
                            ascending:
                                false
                        }
                    )
            );


        return App.teachers;
    };


/* =====================================================
   TEACHER LIST
   ===================================================== */

App.renderTeacherList =
    function (
        records =
            App.teachers
    ) {

        const container =
            App.first(
                "teacherList",
                "teachersList",
                "adminTeacherList"
            );


        if (!container) {
            return;
        }


        if (
            !records.length
        ) {

            container.innerHTML =
                App.empty(
                    "کوئی استاد موجود نہیں۔"
                );

            return;
        }


        container.innerHTML =
            records
                .map(
                    teacher => {

                        const id =
                            Number(
                                teacher.id
                            );


                        return `
                        <article class="record-card teacher-record-card">

                            <div class="record-card-main">

                                <h3>
                                    ${App.escape(
                                        teacher.name
                                    )}
                                </h3>

                                <p>
                                    استاد کوڈ:
                                    <strong>
                                        ${App.escape(
                                            teacher
                                                .teacher_code ||
                                            "—"
                                        )}
                                    </strong>
                                </p>

                                <p>
                                    فون:
                                    ${App.escape(
                                        teacher.phone ||
                                        "—"
                                    )}
                                </p>

                                <p>
                                    تعلیم:
                                    ${App.escape(
                                        teacher
                                            .qualification ||
                                        "—"
                                    )}
                                </p>

                                <p>
                                    حالت:
                                    ${App.escape(
                                        App.statusUrdu(
                                            teacher.status
                                        )
                                    )}
                                </p>

                            </div>

                            <div class="record-card-actions">

                                <button
                                    type="button"
                                    data-teacher-details="${id}">
                                    مکمل پروفائل
                                </button>

                                <button
                                    type="button"
                                    data-teacher-print="${id}">
                                    پرنٹ / پی ڈی ایف
                                </button>

                            </div>

                        </article>
                        `;
                    }
                )
                .join("");


        container
            .querySelectorAll(
                "[data-teacher-details]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            App.showTeacherDetails(
                                Number(
                                    button.dataset
                                        .teacherDetails
                                )
                            );
                        }
                    );
                }
            );


        container
            .querySelectorAll(
                "[data-teacher-print]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            App.openPrintProfile(
                                "teacher",
                                Number(
                                    button.dataset
                                        .teacherPrint
                                )
                            );
                        }
                    );
                }
            );
    };


/* =====================================================
   TEACHER FILTER
   ===================================================== */

App.filterTeachers =
    function () {

        const search =
            App.safe(
                App.first(
                    "teacherSearch",
                    "teacherListSearch",
                    "adminTeacherSearch"
                )?.value
            )
                .trim()
                .toLowerCase();


        const result =
            App.teachers
                .filter(
                    teacher => {

                        const text =
                            [
                                teacher.name,
                                teacher
                                    .father_name,
                                teacher
                                    .teacher_code,
                                teacher.phone,
                                teacher.cnic,
                                teacher
                                    .qualification,
                                teacher
                                    .teaching_class,
                                teacher.subject
                            ]
                                .map(
                                    value =>
                                        App.safe(
                                            value
                                        )
                                            .toLowerCase()
                                )
                                .join(" ");


                        return (
                            !search ||
                            text.includes(
                                search
                            )
                        );
                    }
                );


        App.renderTeacherList(
            result
        );
    };


/* =====================================================
   TEACHER DETAILS
   ===================================================== */

App.showTeacherDetails =
    async function (id) {

        let teacher =
            App.teachers
                .find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(id)
                );


        if (!teacher) {

            teacher =
                await App.one(
                    "Teachers",
                    id
                );
        }


        if (!teacher) {

            alert(
                "استاد کا ریکارڈ نہیں ملا۔"
            );

            return;
        }


        const html =
            App.infoGrid([

                [
                    "نام",
                    teacher.name
                ],

                [
                    "والد کا نام",
                    teacher
                        .father_name
                ],

                [
                    "استاد کوڈ",
                    teacher
                        .teacher_code
                ],

                [
                    "شناختی کارڈ",
                    teacher.cnic
                ],

                [
                    "فون",
                    teacher.phone
                ],

                [
                    "تاریخ پیدائش",
                    App.date(
                        teacher
                            .date_of_birth
                    )
                ],

                [
                    "پتہ",
                    teacher.address
                ],

                [
                    "تعلیم",
                    teacher
                        .qualification
                ],

                [
                    "تخصص",
                    teacher
                        .specialization
                ],

                [
                    "تجربہ",
                    teacher
                        .experience_years
                        ? teacher
                            .experience_years +
                            " سال"
                        : ""
                ],

                [
                    "کلاس",
                    teacher
                        .teaching_class
                ],

                [
                    "مضمون",
                    teacher.subject
                ],

                [
                    "شمولیت تاریخ",
                    App.date(
                        teacher
                            .joining_date
                    )
                ],

                [
                    "حالت",
                    App.statusUrdu(
                        teacher.status
                    )
                ]
            ]);


        const target =
            App.first(
                "teacherDetailsContent",
                "teacherDetailContent",
                "adminTeacherDetailsContent"
            );


        if (target) {

            target.innerHTML =
                html;
        }


        const modal =
            App.first(
                "teacherDetailsModal",
                "teacherDetailsOverlay",
                "teacherDetailModal"
            );


        if (modal) {

            modal.hidden =
                false;

            modal.style.display =
                "flex";


        } else {

            const old =
                App.el(
                    "generatedTeacherDetails"
                );


            if (old) {
                old.remove();
            }


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.id =
                "generatedTeacherDetails";


            wrapper.className =
                "generated-details-overlay";


            wrapper.innerHTML = `
                <div class="generated-details-card">

                    <button
                        type="button"
                        id="generatedTeacherClose">
                        بند کریں
                    </button>

                    <h2>
                        ${App.escape(
                            teacher.name
                        )}
                    </h2>

                    ${html}

                    <button
                        type="button"
                        id="generatedTeacherPrint">
                        مکمل پروفائل پرنٹ / پی ڈی ایف
                    </button>

                </div>
            `;


            document.body
                .appendChild(
                    wrapper
                );


            App.el(
                "generatedTeacherClose"
            ).onclick =
                () =>
                    wrapper.remove();


            App.el(
                "generatedTeacherPrint"
            ).onclick =
                () =>
                    App.openPrintProfile(
                        "teacher",
                        teacher.id
                    );
        }
    };


window.showTeacherDetails =
    App.showTeacherDetails;


/* =====================================================
   TEACHERS PAGE
   ===================================================== */

App.initTeachersPage =
    async function () {

        if (
            App.currentFile !==
            "teachers.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "admin"
            );


        if (!session) {
            return;
        }


        const container =
            App.first(
                "teacherList",
                "teachersList",
                "adminTeacherList"
            );


        if (container) {

            container.innerHTML =
                App.empty(
                    "اساتذہ کا ریکارڈ لوڈ ہو رہا ہے..."
                );
        }


        try {

            await App.loadTeachers();

            App.renderTeacherList();


            [
                "teacherSearch",
                "teacherListSearch",
                "adminTeacherSearch"
            ]
                .forEach(
                    id => {

                        const input =
                            App.el(id);


                        if (input) {

                            input.addEventListener(
                                "input",
                                App.filterTeachers
                            );
                        }
                    }
                );


        } catch (error) {

            console.error(
                "Teachers page:",
                error
            );


            if (container) {

                container.innerHTML =
                    App.empty(
                        "اساتذہ کا ریکارڈ لوڈ نہیں ہو سکا۔"
                    );
            }
        }
    };


/* =====================================================
   TEACHER DASHBOARD PROFILE
   ===================================================== */

App.initTeacherDashboard =
    async function () {

        if (
            App.currentFile !==
            "teacher.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "teacher"
            );


        if (!session) {
            return;
        }


        const teacherId =
            session.teacher_id ||
            App.getTeacherId();


        if (!teacherId) {
            return;
        }


        try {

            const teacher =
                await App.one(
                    "Teachers",
                    teacherId
                );


            if (!teacher) {
                return;
            }


            const mapping = {

                teacherProfileName:
                    teacher.name,

                teacherName:
                    teacher.name,

                teacherProfileCode:
                    teacher
                        .teacher_code,

                teacherProfilePhone:
                    teacher.phone,

                teacherProfileCNIC:
                    teacher.cnic,

                teacherProfileQualification:
                    teacher
                        .qualification,

                teacherProfileClass:
                    teacher
                        .teaching_class,

                teacherProfileSubject:
                    teacher.subject,

                teacherProfileExperience:
                    teacher
                        .experience_years,

                teacherProfileJoiningDate:
                    App.date(
                        teacher
                            .joining_date
                    )
            };


            Object.entries(
                mapping
            )
                .forEach(
                    ([id, value]) =>
                        App.setText(
                            id,
                            value
                        )
                );


        } catch (error) {

            console.error(
                "Teacher dashboard:",
                error
            );
        }
    };


/* =====================================================
   STUDENT DASHBOARD PROFILE
   ===================================================== */

App.initStudentDashboard =
    async function () {

        if (
            App.currentFile !==
            "student.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "student"
            );


        if (!session) {
            return;
        }


        const studentId =
            session.student_id ||
            App.getStudentId();


        if (!studentId) {
            return;
        }


        try {

            const student =
                await App.one(
                    "Students",
                    studentId
                );


            if (!student) {
                return;
            }


            const mapping = {

                studentProfileName:
                    student.name,

                studentName:
                    student.name,

                studentProfileAdmissionNo:
                    student
                        .admission_no,

                studentProfileClass:
                    student
                        .student_class,

                studentProfileFatherName:
                    student
                        .father_name,

                studentProfileGuardianName:
                    student
                        .guardian_name,

                studentProfilePhone:
                    student.phone,

                studentProfileCNIC:
                    student.cnic,

                studentProfileDOB:
                    App.date(
                        student
                            .date_of_birth
                    ),

                studentProfileResidence:
                    student
                        .residence_type,

                studentProfileAddress:
                    student.address
            };


            Object.entries(
                mapping
            )
                .forEach(
                    ([id, value]) =>
                        App.setText(
                            id,
                            value
                        )
                );


            await App
                .loadStudentDashboardAttendance(
                    studentId
                );


            await App
                .loadStudentDashboardMarks(
                    studentId
                );


        } catch (error) {

            console.error(
                "Student dashboard:",
                error
            );
        }
    };


App.loadStudentDashboardAttendance =
    async function (
        studentId
    ) {

        try {

            const records =
                await App.selectTable(
                    "Attendance",
                    "*",
                    query =>
                        query
                            .eq(
                                "student_id",
                                studentId
                            )
                            .order(
                                "attendance_date",
                                {
                                    ascending:
                                        false
                                }
                            )
                );


            const total =
                records.length;


            const present =
                records.filter(
                    row =>
                        App.safe(
                            row.status
                        )
                            .toLowerCase() ===
                        "present"
                ).length;


            const absent =
                records.filter(
                    row =>
                        App.safe(
                            row.status
                        )
                            .toLowerCase() ===
                        "absent"
                ).length;


            const leave =
                records.filter(
                    row =>
                        App.safe(
                            row.status
                        )
                            .toLowerCase() ===
                        "leave"
                ).length;


            const percentage =
                total
                    ? Math.round(
                        present /
                        total *
                        100
                    )
                    : 0;


            App.setText(
                "studentAttendanceTotal",
                total
            );


            App.setText(
                "studentAttendancePresent",
                present
            );


            App.setText(
                "studentAttendanceAbsent",
                absent
            );


            App.setText(
                "studentAttendanceLeave",
                leave
            );


            App.setText(
                "studentAttendancePercentage",
                percentage + "%"
            );


        } catch (error) {

            console.warn(
                "Student attendance summary:",
                error
            );
        }
    };


App.loadStudentDashboardMarks =
    async function (
        studentId
    ) {

        try {

            const records =
                await App.selectTable(
                    "Marks",
                    "*",
                    query =>
                        query
                            .eq(
                                "student_id",
                                studentId
                            )
                            .order(
                                "exam_date",
                                {
                                    ascending:
                                        false
                                }
                            )
                );


            const total =
                records.reduce(
                    (
                        sum,
                        row
                    ) =>
                        sum +
                        Number(
                            row.total_marks ||
                            0
                        ),
                    0
                );


            const obtained =
                records.reduce(
                    (
                        sum,
                        row
                    ) =>
                        sum +
                        Number(
                            row.obtained_marks ||
                            0
                        ),
                    0
                );


            const percentage =
                total
                    ? (
                        obtained /
                        total *
                        100
                    ).toFixed(1)
                    : "0.0";


            App.setText(
                "studentMarksTotal",
                total
            );


            App.setText(
                "studentMarksObtained",
                obtained
            );


            App.setText(
                "studentMarksPercentage",
                percentage + "%"
            );


        } catch (error) {

            console.warn(
                "Student marks summary:",
                error
            );
        }
    };


/* =====================================================
   TEACHER ATTENDANCE PAGE
   Existing secure Attendance RPCs
   ===================================================== */

App.attendanceStudents = [];

App.attendanceTeacherId =
    null;


App.initTeacherAttendance =
    async function () {

        if (
            App.currentFile !==
            "attendance.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "teacher"
            );


        if (!session) {
            return;
        }


        App.attendanceTeacherId =
            session.teacher_id ||
            App.getTeacherId();


        const dateInput =
            App.first(
                "attendanceDate",
                "teacherAttendanceDate"
            );


        if (
            dateInput &&
            !dateInput.value
        ) {

            dateInput.value =
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    );
        }


        const loadButton =
            App.first(
                "loadAttendanceStudents",
                "attendanceLoadStudents",
                "loadStudentsButton"
            );


        if (loadButton) {

            loadButton.addEventListener(
                "click",
                App.loadAttendanceStudents
            );
        }


        const saveButton =
            App.first(
                "saveAttendanceButton",
                "attendanceSaveButton"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                App.saveAttendance
            );
        }


        const markPresent =
            App.first(
                "markAllPresent",
                "attendanceMarkAllPresent"
            );


        if (markPresent) {

            markPresent.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            "[data-attendance-status]"
                        )
                        .forEach(
                            select => {

                                select.value =
                                    "present";
                            }
                        );
                }
            );
        }
    };


App.loadAttendanceStudents =
    async function () {

        const studentClass =
            App.safe(
                App.first(
                    "attendanceClass",
                    "teacherAttendanceClass"
                )?.value
            ).trim();


        if (!studentClass) {

            alert(
                "کلاس منتخب کریں۔"
            );

            return;
        }


        try {

            const rows =
                await App.authedRpc(
                    "attendance_get_students",
                    {
                        p_class:
                            studentClass
                    }
                );


            App.attendanceStudents =
                Array.isArray(rows)
                    ? rows
                    : [];


            App.renderAttendanceStudents();


        } catch (error) {

            console.error(
                "Load attendance students:",
                error
            );


            alert(
                "طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔"
            );
        }
    };


App.renderAttendanceStudents =
    function () {

        const container =
            App.first(
                "attendanceStudentList",
                "attendanceStudentsBody",
                "teacherAttendanceStudents"
            );


        if (!container) {
            return;
        }


        if (
            !App.attendanceStudents.length
        ) {

            container.innerHTML =
                App.empty(
                    "اس کلاس میں کوئی طالبہ موجود نہیں۔"
                );

            return;
        }


        const isTbody =
            container.tagName
                .toLowerCase() ===
            "tbody";


        if (isTbody) {

            container.innerHTML =
                App.attendanceStudents
                    .map(
                        student => `
                        <tr>

                            <td>
                                ${App.escape(
                                    student
                                        .admission_no ||
                                    ""
                                )}
                            </td>

                            <td>
                                ${App.escape(
                                    student
                                        .student_name ||
                                    ""
                                )}
                            </td>

                            <td>
                                <select
                                    data-attendance-status
                                    data-student-id="${
                                        Number(
                                            student
                                                .student_id
                                        )
                                    }">

                                    <option value="present">
                                        حاضر
                                    </option>

                                    <option value="absent">
                                        غیر حاضر
                                    </option>

                                    <option value="leave">
                                        رخصت
                                    </option>

                                </select>
                            </td>

                            <td>
                                <input
                                    type="text"
                                    data-attendance-note
                                    data-student-id="${
                                        Number(
                                            student
                                                .student_id
                                        )
                                    }"
                                    placeholder="نوٹ">
                            </td>

                        </tr>
                    `
                    )
                    .join("");

        } else {

            container.innerHTML =
                App.attendanceStudents
                    .map(
                        student => `
                        <div class="attendance-student-row">

                            <div>
                                <strong>
                                    ${App.escape(
                                        student
                                            .student_name ||
                                        ""
                                    )}
                                </strong>

                                <small>
                                    ${App.escape(
                                        student
                                            .admission_no ||
                                        ""
                                    )}
                                </small>
                            </div>

                            <select
                                data-attendance-status
                                data-student-id="${
                                    Number(
                                        student
                                            .student_id
                                    )
                                }">

                                <option value="present">
                                    حاضر
                                </option>

                                <option value="absent">
                                    غیر حاضر
                                </option>

                                <option value="leave">
                                    رخصت
                                </option>

                            </select>

                            <input
                                type="text"
                                data-attendance-note
                                data-student-id="${
                                    Number(
                                        student
                                            .student_id
                                    )
                                }"
                                placeholder="نوٹ">

                        </div>
                    `
                    )
                    .join("");
        }
    };


App.saveAttendance =
    async function () {

        const studentClass =
            App.safe(
                App.first(
                    "attendanceClass",
                    "teacherAttendanceClass"
                )?.value
            ).trim();


        const date =
            App.safe(
                App.first(
                    "attendanceDate",
                    "teacherAttendanceDate"
                )?.value
            ).trim();


        const period =
            Number(
                App.first(
                    "attendancePeriod",
                    "teacherAttendancePeriod"
                )?.value ||
                0
            );


        if (
            !studentClass ||
            !date ||
            !period
        ) {

            alert(
                "تاریخ، کلاس اور پیریڈ منتخب کریں۔"
            );

            return;
        }


        const statuses =
            Array.from(
                document
                    .querySelectorAll(
                        "[data-attendance-status]"
                    )
            );


        if (!statuses.length) {

            alert(
                "پہلے طالبات کا ریکارڈ لوڈ کریں۔"
            );

            return;
        }


        const rows =
            statuses
                .map(
                    select => {

                        const studentId =
                            Number(
                                select.dataset
                                    .studentId
                            );


                        const note =
                            document
                                .querySelector(
                                    `[data-attendance-note][data-student-id="${studentId}"]`
                                );


                        return {

                            student_id:
                                studentId,

                            status:
                                select.value,

                            note:
                                note
                                    ? App.safe(
                                        note.value
                                    ).trim()
                                    : null
                        };
                    }
                );


        try {

            await App.authedRpc(
                "attendance_save",
                {
                    p_teacher_id:
                        App.attendanceTeacherId,

                    p_date:
                        date,

                    p_period:
                        period,

                    p_class:
                        studentClass,

                    p_rows:
                        rows
                }
            );


            alert(
                "حاضری کامیابی سے محفوظ ہوگئی۔"
            );


        } catch (error) {

            console.error(
                "Attendance save:",
                error
            );


            alert(
                "حاضری محفوظ نہیں ہو سکی۔"
            );
        }
    };


/* =====================================================
   STUDENT MY ATTENDANCE
   ===================================================== */

App.initMyAttendance =
    async function () {

        if (
            App.currentFile !==
            "my-attendance.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "student"
            );


        if (!session) {
            return;
        }


        const studentId =
            session.student_id ||
            App.getStudentId();


        try {

            const records =
                await App.selectTable(
                    "Attendance",
                    "*",
                    query =>
                        query
                            .eq(
                                "student_id",
                                studentId
                            )
                            .order(
                                "attendance_date",
                                {
                                    ascending:
                                        false
                                }
                            )
                            .order(
                                "period_number",
                                {
                                    ascending:
                                        true
                                }
                            )
                );


            App.renderMyAttendance(
                records
            );


        } catch (error) {

            console.error(
                "My attendance:",
                error
            );
        }
    };


App.renderMyAttendance =
    function (records) {

        const total =
            records.length;


        const present =
            records.filter(
                row =>
                    App.safe(
                        row.status
                    )
                        .toLowerCase() ===
                    "present"
            ).length;


        const absent =
            records.filter(
                row =>
                    App.safe(
                        row.status
                    )
                        .toLowerCase() ===
                    "absent"
            ).length;


        const leave =
            records.filter(
                row =>
                    App.safe(
                        row.status
                    )
                        .toLowerCase() ===
                    "leave"
            ).length;


        const percentage =
            total
                ? Math.round(
                    present /
                    total *
                    100
                )
                : 0;


        [
            [
                "myAttendanceTotal",
                total
            ],

            [
                "myAttendancePresent",
                present
            ],

            [
                "myAttendanceAbsent",
                absent
            ],

            [
                "myAttendanceLeave",
                leave
            ],

            [
                "myAttendancePercentage",
                percentage + "%"
            ]
        ]
            .forEach(
                ([id, value]) =>
                    App.setText(
                        id,
                        value
                    )
            );


        const body =
            App.first(
                "myAttendanceBody",
                "studentAttendanceBody",
                "attendanceRecordsBody"
            );


        if (!body) {
            return;
        }


        body.innerHTML =
            records
                .map(
                    row => `
                    <tr>

                        <td>
                            ${App.escape(
                                App.date(
                                    row
                                        .attendance_date
                                )
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row
                                    .student_class ||
                                ""
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row
                                    .period_number ||
                                ""
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                App.statusUrdu(
                                    row.status
                                )
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row.note ||
                                ""
                            )}
                        </td>

                    </tr>
                `
                )
                .join("");
    };


/* =====================================================
   STUDENT MY MARKS
   ===================================================== */

App.initMyMarks =
    async function () {

        if (
            App.currentFile !==
            "my-marks.html"
        ) {
            return;
        }


        const session =
            await App.requireRole(
                "student"
            );


        if (!session) {
            return;
        }


        const studentId =
            session.student_id ||
            App.getStudentId();


        try {

            const marks =
                await App.selectTable(
                    "Marks",
                    "*",
                    query =>
                        query
                            .eq(
                                "student_id",
                                studentId
                            )
                            .order(
                                "exam_date",
                                {
                                    ascending:
                                        false
                                }
                            )
                );


            App.renderMyMarks(
                marks
            );


        } catch (error) {

            console.error(
                "My marks:",
                error
            );
        }
    };


App.renderMyMarks =
    function (records) {

        const total =
            records.reduce(
                (
                    sum,
                    row
                ) =>
                    sum +
                    Number(
                        row.total_marks ||
                        0
                    ),
                0
            );


        const obtained =
            records.reduce(
                (
                    sum,
                    row
                ) =>
                    sum +
                    Number(
                        row.obtained_marks ||
                        0
                    ),
                0
            );


        const percentage =
            total
                ? (
                    obtained /
                    total *
                    100
                ).toFixed(1)
                : "0.0";


        [
            [
                "myMarksTotal",
                total
            ],

            [
                "myMarksObtained",
                obtained
            ],

            [
                "myMarksPercentage",
                percentage + "%"
            ],

            [
                "studentMarksTotalRecords",
                records.length
            ]
        ]
            .forEach(
                ([id, value]) =>
                    App.setText(
                        id,
                        value
                    )
            );


        const body =
            App.first(
                "myMarksBody",
                "studentMarksBody",
                "marksRecordsBody"
            );


        if (!body) {
            return;
        }


        body.innerHTML =
            records
                .map(
                    row => `
                    <tr>

                        <td>
                            ${App.escape(
                                App.date(
                                    row.exam_date
                                )
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row.exam_name ||
                                row.exam_type ||
                                ""
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row.student_class ||
                                ""
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row.obtained_marks
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row.total_marks
                            )}
                        </td>

                        <td>
                            ${App.escape(
                                row.marks_percentage ||
                                ""
                            )}%
                        </td>

                        <td>
                            ${App.escape(
                                row.note ||
                                ""
                            )}
                        </td>

                    </tr>
                `
                )
                .join("");
    };

 /* =====================================================
   PART 3 / 4
   MARKS + HOMEWORK + ANNOUNCEMENTS + FEEDBACK
   FINANCE + FEES + SALARY + HOSTEL + PROMOTIONS
   ID CARDS + SETTINGS
   ===================================================== */


/* =====================================================
   ADMIN MARKS
   ===================================================== */

App.loadAdminMarks =
    async function () {

        if (
            App.currentFile !==
            "admin-marks.html"
        ) {
            return;
        }


        const body =
            App.first(
                "adminMarksBody",
                "marksTableBody"
            );


        if (!body) {
            return;
        }


        try {

            let query =
                App.client
                    .from("Marks")
                    .select("*")
                    .order(
                        "exam_date",
                        {
                            ascending:
                                false
                        }
                    );


            const studentClass =
                App.val(
                    "adminMarksClassFilter"
                );


            const subject =
                App.val(
                    "adminMarksSubjectFilter"
                );


            const teacherId =
                Number(
                    App.val(
                        "adminMarksTeacherFilter"
                    ) || 0
                );


            const date =
                App.val(
                    "adminMarksDateFilter"
                );


            const exam =
                App.val(
                    "adminMarksExamFilter"
                );


            if (studentClass) {

                query =
                    query.eq(
                        "student_class",
                        studentClass
                    );
            }


            if (subject) {

                query =
                    query.eq(
                        "subject_id",
                        subject
                    );
            }


            if (teacherId) {

                query =
                    query.eq(
                        "teacher_id",
                        teacherId
                    );
            }


            if (date) {

                query =
                    query.eq(
                        "exam_date",
                        date
                    );
            }


            if (exam) {

                query =
                    query.or(
                        `exam_type.ilike.%${exam}%,exam_name.ilike.%${exam}%`
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


            const records =
                data || [];


            body.innerHTML =
                records.length
                    ? records
                        .map(
                            row => `
                            <tr>

                                <td>
                                    ${App.escape(
                                        row.student_id
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.student_class
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.exam_name ||
                                        row.exam_type
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.obtained_marks
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.total_marks
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.marks_percentage ||
                                        ""
                                    )}%
                                </td>

                                <td>
                                    ${App.escape(
                                        App.date(
                                            row.exam_date
                                        )
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.note ||
                                        ""
                                    )}
                                </td>

                            </tr>
                        `
                        )
                        .join("")
                    :
                    `<tr>
                        <td colspan="8">
                            کوئی ریکارڈ موجود نہیں۔
                        </td>
                    </tr>`;


            App.setText(
                "adminMarksTotalRecords",
                records.length,
                "0"
            );


        } catch (error) {

            console.error(
                "Admin marks:",
                error
            );


            body.innerHTML =
                `<tr>
                    <td colspan="8">
                        نتائج لوڈ نہیں ہو سکے۔
                    </td>
                </tr>`;
        }
    };


App.initAdminMarks =
    function () {

        if (
            App.currentFile !==
            "admin-marks.html"
        ) {
            return;
        }


        [
            "adminMarksClassFilter",
            "adminMarksSubjectFilter",
            "adminMarksTeacherFilter",
            "adminMarksDateFilter",
            "adminMarksExamFilter"
        ]
            .forEach(
                id => {

                    const node =
                        App.el(id);


                    if (node) {

                        node.addEventListener(
                            "change",
                            App.loadAdminMarks
                        );


                        node.addEventListener(
                            "input",
                            App.loadAdminMarks
                        );
                    }
                }
            );


        const clear =
            App.first(
                "clearAdminMarksFilters",
                "clearMarksFilters"
            );


        if (clear) {

            clear.addEventListener(
                "click",
                function () {

                    [
                        "adminMarksClassFilter",
                        "adminMarksSubjectFilter",
                        "adminMarksTeacherFilter",
                        "adminMarksDateFilter",
                        "adminMarksExamFilter"
                    ]
                        .forEach(
                            id => {

                                const node =
                                    App.el(id);


                                if (node) {
                                    node.value = "";
                                }
                            }
                        );


                    App.loadAdminMarks();
                }
            );
        }
    };


/* =====================================================
   STUDENT HOMEWORK
   ===================================================== */

App.loadStudentHomework =
    async function () {

        if (
            App.currentFile !==
            "homework.html"
        ) {
            return;
        }


        const studentId =
            App.getStudentId();


        const container =
            App.first(
                "studentHomeworkList",
                "homeworkList",
                "myHomeworkList"
            );


        if (
            !studentId ||
            !container
        ) {
            return;
        }


        try {

            const student =
                await App.one(
                    "Students",
                    studentId,
                    "id,student_class"
                );


            if (!student) {

                throw new Error(
                    "Student not found"
                );
            }


            const homework =
                await App.selectTable(
                    "Homework",
                    "*",
                    query =>
                        query
                            .eq(
                                "student_class",
                                student
                                    .student_class
                            )
                            .order(
                                "assigned_date",
                                {
                                    ascending:
                                        false
                                }
                            )
                );


            const submissions =
                await App.selectTable(
                    "HomeworkSubmissions",
                    "*",
                    query =>
                        query.eq(
                            "student_id",
                            studentId
                        )
                );


            const submissionMap =
                new Map(
                    submissions.map(
                        item => [
                            String(
                                item.homework_id
                            ),
                            item
                        ]
                    )
                );


            if (
                !homework.length
            ) {

                container.innerHTML =
                    App.empty(
                        "کوئی ہوم ورک موجود نہیں۔"
                    );

                return;
            }


            container.innerHTML =
                homework
                    .map(
                        item => {

                            const submission =
                                submissionMap
                                    .get(
                                        String(
                                            item.id
                                        )
                                    );


                            return `
                            <article class="portal-card homework-card">

                                <h3>
                                    ${App.escape(
                                        item.title
                                    )}
                                </h3>

                                <p>
                                    ${App.escape(
                                        item.description ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    مقررہ تاریخ:
                                    ${App.escape(
                                        App.date(
                                            item
                                                .assigned_date
                                        )
                                    )}
                                </p>

                                <p>
                                    آخری تاریخ:
                                    ${App.escape(
                                        App.date(
                                            item
                                                .due_date
                                        )
                                    )}
                                </p>

                                <p>
                                    حالت:
                                    <strong>
                                        ${App.escape(
                                            App.statusUrdu(
                                                submission
                                                    ?.status ||
                                                "pending"
                                            )
                                        )}
                                    </strong>
                                </p>

                                ${
                                    submission
                                        ?.teacher_note
                                        ? `
                                        <p>
                                            استاد کا نوٹ:
                                            ${App.escape(
                                                submission
                                                    .teacher_note
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                                <button
                                    type="button"
                                    data-homework-submit="${
                                        Number(
                                            item.id
                                        )
                                    }">
                                    ہوم ورک جمع کریں
                                </button>

                            </article>
                        `;
                        }
                    )
                    .join("");


            container
                .querySelectorAll(
                    "[data-homework-submit]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            function () {

                                App.submitHomework(
                                    Number(
                                        button.dataset
                                            .homeworkSubmit
                                    )
                                );
                            }
                        );
                    }
                );


        } catch (error) {

            console.error(
                "Student homework:",
                error
            );


            container.innerHTML =
                App.empty(
                    "ہوم ورک لوڈ نہیں ہو سکا۔"
                );
        }
    };


App.submitHomework =
    async function (
        homeworkId
    ) {

        const studentId =
            App.getStudentId();


        if (!studentId) {
            return;
        }


        const submissionText =
            window.prompt(
                "ہوم ورک کا متن درج کریں:",
                ""
            );


        if (
            submissionText ===
            null
        ) {
            return;
        }


        try {

            const {
                data: existing,
                error: existingError
            } =
                await App.client
                    .from(
                        "HomeworkSubmissions"
                    )
                    .select(
                        "id"
                    )
                    .eq(
                        "homework_id",
                        homeworkId
                    )
                    .eq(
                        "student_id",
                        studentId
                    )
                    .maybeSingle();


            if (existingError) {
                throw existingError;
            }


            if (
                existing &&
                existing.id
            ) {

                const {
                    error
                } =
                    await App.client
                        .from(
                            "HomeworkSubmissions"
                        )
                        .update({

                            submission_text:
                                submissionText,

                            status:
                                "submitted",

                            submitted_at:
                                new Date()
                                    .toISOString()
                        })
                        .eq(
                            "id",
                            existing.id
                        );


                if (error) {
                    throw error;
                }


            } else {

                const {
                    error
                } =
                    await App.client
                        .from(
                            "HomeworkSubmissions"
                        )
                        .insert({

                            homework_id:
                                homeworkId,

                            student_id:
                                studentId,

                            submission_text:
                                submissionText,

                            status:
                                "submitted",

                            submitted_at:
                                new Date()
                                    .toISOString()
                        });


                if (error) {
                    throw error;
                }
            }


            alert(
                "ہوم ورک کامیابی سے جمع ہوگیا۔"
            );


            await App
                .loadStudentHomework();


        } catch (error) {

            console.error(
                "Homework submission:",
                error
            );


            alert(
                "ہوم ورک جمع نہیں ہو سکا۔"
            );
        }
    };


/* =====================================================
   STUDENT ANNOUNCEMENTS
   ===================================================== */

App.loadStudentAnnouncements =
    async function () {

        if (
            App.currentFile !==
            "announcements.html"
        ) {
            return;
        }


        const studentId =
            App.getStudentId();


        const container =
            App.first(
                "studentAnnouncementsList",
                "announcementsList",
                "myAnnouncementsList"
            );


        if (
            !studentId ||
            !container
        ) {
            return;
        }


        try {

            const student =
                await App.one(
                    "Students",
                    studentId,
                    "id,student_class"
                );


            if (!student) {

                throw new Error(
                    "Student not found"
                );
            }


            const {
                data,
                error
            } =
                await App.client
                    .from(
                        "Announcements"
                    )
                    .select("*")
                    .or(
                        `student_class.is.null,student_class.eq.,student_class.eq.${student.student_class}`
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {
                throw error;
            }


            const records =
                data || [];


            container.innerHTML =
                records.length
                    ? records
                        .map(
                            announcement => `
                            <article class="portal-card announcement-card">

                                <h3>
                                    ${App.escape(
                                        announcement.title
                                    )}
                                </h3>

                                <p>
                                    ${App.escape(
                                        announcement.message
                                    )}
                                </p>

                                ${
                                    announcement
                                        .student_class
                                        ? `
                                        <p>
                                            کلاس:
                                            ${App.escape(
                                                announcement
                                                    .student_class
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                                <small>
                                    ${App.escape(
                                        App.dateTime(
                                            announcement
                                                .created_at
                                        )
                                    )}
                                </small>

                            </article>
                        `
                        )
                        .join("")
                    :
                    App.empty(
                        "کوئی اعلان موجود نہیں۔"
                    );


        } catch (error) {

            console.error(
                "Student announcements:",
                error
            );


            container.innerHTML =
                App.empty(
                    "اعلانات لوڈ نہیں ہو سکے۔"
                );
        }
    };


/* =====================================================
   ADMIN FEEDBACK
   ===================================================== */

App.loadAdminFeedback =
    async function () {

        if (
            App.currentFile !==
            "admin-feedback.html"
        ) {
            return;
        }


        const body =
            App.first(
                "adminFeedbackBody",
                "feedbackTableBody"
            );


        if (!body) {
            return;
        }


        try {

            const records =
                await App.selectTable(
                    "student_feedback",
                    "*",
                    query =>
                        query.order(
                            "feedback_date",
                            {
                                ascending:
                                    false
                            }
                        )
                );


            body.innerHTML =
                records.length
                    ? records
                        .map(
                            feedback => `
                            <tr>

                                <td>
                                    ${App.escape(
                                        feedback
                                            .student_id
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        feedback
                                            .teacher_id
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        feedback.rating ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        feedback
                                            .feedback_text ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        App.date(
                                            feedback
                                                .feedback_date
                                        )
                                    )}
                                </td>

                            </tr>
                        `
                        )
                        .join("")
                    :
                    `<tr>
                        <td colspan="5">
                            کوئی ریکارڈ موجود نہیں۔
                        </td>
                    </tr>`;


            App.setText(
                "adminFeedbackTotal",
                records.length,
                "0"
            );


        } catch (error) {

            console.error(
                "Admin feedback:",
                error
            );
        }
    };


/* =====================================================
   FINANCE DASHBOARD
   ===================================================== */

App.loadFinance =
    async function () {

        if (
            App.currentFile !==
            "admin-finance.html"
        ) {
            return;
        }


        const body =
            App.first(
                "financeHistoryBody",
                "adminFinanceHistoryBody"
            );


        try {

            const data =
                await App.authedRpc(
                    "admin_finance_dashboard"
                );


            if (!data) {
                return;
            }


            App.setText(
                "financeCurrentBalance",
                App.money(
                    data.current_balance ||
                    0
                )
            );


            App.setText(
                "financeTotalReceived",
                App.money(
                    data.total_received ||
                    0
                )
            );


            App.setText(
                "financeTotalPaid",
                App.money(
                    data.total_paid ||
                    0
                )
            );


            App.setText(
                "financeGeneralBalance",
                App.money(
                    data.general_balance ||
                    0
                )
            );


            App.setText(
                "financeRestrictedBalance",
                App.money(
                    data.restricted_balance ||
                    0
                )
            );


            App.setText(
                "financeDonationBalance",
                App.money(
                    data
                        .unrestricted_donation_balance ||
                    0
                )
            );


            if (body) {

                const history =
                    Array.isArray(
                        data.history
                    )
                        ? data.history
                        : [];


                body.innerHTML =
                    history.length
                        ? history
                            .map(
                                item => `
                                <tr>

                                    <td>
                                        ${App.escape(
                                            item
                                                .transaction_no ||
                                            ""
                                        )}
                                    </td>

                                    <td>
                                        ${
                                            item.direction ===
                                            "received"
                                                ? "وصولی"
                                                : "ادائیگی"
                                        }
                                    </td>

                                    <td>
                                        ${App.escape(
                                            item
                                                .fund_type ||
                                            ""
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            item.purpose ||
                                            ""
                                        )}
                                    </td>

                                    <td>
                                        ${App.money(
                                            item.amount ||
                                            0
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            App.dateTime(
                                                item
                                                    .transaction_at ||
                                                item.date_time
                                            )
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            item.receipt_no ||
                                            ""
                                        )}
                                    </td>

                                </tr>
                            `
                            )
                            .join("")
                        :
                        `<tr>
                            <td colspan="7">
                                کوئی لین دین موجود نہیں۔
                            </td>
                        </tr>`;
            }


        } catch (error) {

            console.error(
                "Finance:",
                error
            );
        }
    };


/* =====================================================
   DONATION FORM
   ===================================================== */

App.bindDonationForm =
    function () {

        const form =
            App.first(
                "donationForm",
                "adminDonationForm"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const amount =
                    Number(
                        App.val(
                            "donationAmount"
                        )
                    );


                const receivedFrom =
                    App.val(
                        "donationReceivedFrom"
                    );


                const fundType =
                    App.val(
                        "donationFundType"
                    );


                if (
                    !amount ||
                    amount <= 0
                ) {

                    alert(
                        "درست رقم درج کریں۔"
                    );

                    return;
                }


                if (!receivedFrom) {

                    alert(
                        "رقم دینے والے کا نام درج کریں۔"
                    );

                    return;
                }


                try {

                    const result =
                        await App.authedRpc(
                            "admin_receive_donation",
                            {

                                p_amount:
                                    amount,

                                p_received_from:
                                    receivedFrom,

                                p_fund_type:
                                    fundType ||
                                    "unrestricted_donation",

                                p_purpose:
                                    App.val(
                                        "donationPurpose"
                                    ) ||
                                    "فی سبیل اللہ",

                                p_payment_method:
                                    App.val(
                                        "donationPaymentMethod"
                                    ) ||
                                    null,

                                p_payment_reference:
                                    App.val(
                                        "donationReference"
                                    ) ||
                                    null,

                                p_notes:
                                    App.val(
                                        "donationNotes"
                                    ) ||
                                    null
                            }
                        );


                    alert(
                        "عطیہ محفوظ ہوگیا۔" +
                        (
                            result
                                ?.receipt_no
                                ? "\nرسید نمبر: " +
                                result
                                    .receipt_no
                                : ""
                        )
                    );


                    form.reset();


                    await App
                        .loadFinance();


                } catch (error) {

                    console.error(
                        "Donation:",
                        error
                    );


                    alert(
                        "عطیہ محفوظ نہیں ہو سکا۔"
                    );
                }
            }
        );
    };


/* =====================================================
   EXPENSE FORM
   ===================================================== */

App.bindExpenseForm =
    function () {

        const form =
            App.first(
                "expenseForm",
                "adminExpenseForm"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const amount =
                    Number(
                        App.val(
                            "expenseAmount"
                        )
                    );


                if (
                    !amount ||
                    amount <= 0
                ) {

                    alert(
                        "درست رقم درج کریں۔"
                    );

                    return;
                }


                const paidTo =
                    App.val(
                        "expensePaidTo"
                    );


                const purpose =
                    App.val(
                        "expensePurpose"
                    );


                if (
                    !paidTo ||
                    !purpose
                ) {

                    alert(
                        "ادائیگی وصول کرنے والا اور مقصد درج کریں۔"
                    );

                    return;
                }


                try {

                    const result =
                        await App.authedRpc(
                            "admin_record_expense",
                            {

                                p_amount:
                                    amount,

                                p_paid_to:
                                    paidTo,

                                p_purpose:
                                    purpose,

                                p_fund_type:
                                    App.val(
                                        "expenseFundType"
                                    ) ||
                                    "general",

                                p_student_id:
                                    Number(
                                        App.val(
                                            "expenseStudentId"
                                        ) ||
                                        0
                                    ) ||
                                    null,

                                p_teacher_id:
                                    Number(
                                        App.val(
                                            "expenseTeacherId"
                                        ) ||
                                        0
                                    ) ||
                                    null,

                                p_payment_method:
                                    App.val(
                                        "expensePaymentMethod"
                                    ) ||
                                    null,

                                p_payment_reference:
                                    App.val(
                                        "expenseReference"
                                    ) ||
                                    null,

                                p_notes:
                                    App.val(
                                        "expenseNotes"
                                    ) ||
                                    null
                            }
                        );


                    alert(
                        "ادائیگی محفوظ ہوگئی۔" +
                        (
                            result
                                ?.receipt_no
                                ? "\nرسید نمبر: " +
                                result
                                    .receipt_no
                                : ""
                        )
                    );


                    form.reset();


                    await App
                        .loadFinance();


                } catch (error) {

                    console.error(
                        "Expense:",
                        error
                    );


                    alert(
                        error?.message ||
                        "ادائیگی محفوظ نہیں ہو سکی۔"
                    );
                }
            }
        );
    };


App.initFinanceForms =
    function () {

        if (
            App.currentFile !==
            "admin-finance.html"
        ) {
            return;
        }


        App.bindDonationForm();

        App.bindExpenseForm();
    };


/* =====================================================
   STUDENT FEE HISTORY
   ===================================================== */

App.getStudentFeeHistory =
    async function (
        studentId
    ) {

        return App.authedRpc(
            "admin_student_fee_history",
            {
                p_student_id:
                    Number(
                        studentId
                    )
            }
        );
    };


/* =====================================================
   ADD STUDENT FEE CHARGE
   ===================================================== */

App.addStudentFee =
    async function (
        studentId,
        feeTypeId,
        amount,
        period,
        dueDate,
        notes = null
    ) {

        return App.authedRpc(
            "admin_add_student_fee",
            {

                p_student_id:
                    Number(
                        studentId
                    ),

                p_fee_type_id:
                    feeTypeId
                        ? Number(
                            feeTypeId
                        )
                        : null,

                p_amount:
                    Number(
                        amount
                    ),

                p_fee_period:
                    period ||
                    null,

                p_due_date:
                    dueDate ||
                    null,

                p_notes:
                    notes
            }
        );
    };


/* =====================================================
   RECEIVE STUDENT FEE
   ===================================================== */

App.receiveStudentFee =
    async function (
        studentId,
        amount,
        receivedFrom,
        method = null,
        reference = null,
        notes = null
    ) {

        return App.authedRpc(
            "admin_receive_student_fee",
            {

                p_student_id:
                    Number(
                        studentId
                    ),

                p_amount:
                    Number(
                        amount
                    ),

                p_received_from:
                    receivedFrom,

                p_payment_method:
                    method,

                p_payment_reference:
                    reference,

                p_notes:
                    notes
            }
        );
    };


App.openStudentFee =
    async function (
        studentId
    ) {

        const amount =
            window.prompt(
                "وصول شدہ فیس کی رقم:"
            );


        if (!amount) {
            return;
        }


        const receivedFrom =
            window.prompt(
                "رقم کس سے وصول ہوئی؟",
                ""
            );


        if (
            receivedFrom ===
            null
        ) {
            return;
        }


        try {

            const result =
                await App
                    .receiveStudentFee(

                        studentId,

                        amount,

                        receivedFrom
                    );


            alert(
                "فیس کامیابی سے محفوظ ہوگئی۔" +
                (
                    result?.receipt_no
                        ? "\nرسید نمبر: " +
                        result.receipt_no
                        : ""
                )
            );


        } catch (error) {

            console.error(
                "Student fee:",
                error
            );


            alert(
                "فیس محفوظ نہیں ہو سکی۔"
            );
        }
    };


window.openStudentFee =
    App.openStudentFee;


/* =====================================================
   TEACHER SALARY
   ===================================================== */

App.getTeacherSalaryHistory =
    async function (
        teacherId
    ) {

        return App.authedRpc(
            "admin_teacher_salary_history",
            {
                p_teacher_id:
                    Number(
                        teacherId
                    )
            }
        );
    };


App.setTeacherSalary =
    async function (
        teacherId,
        salaryAmount,
        effectiveFrom,
        notes = null
    ) {

        return App.authedRpc(
            "admin_set_teacher_salary",
            {

                p_teacher_id:
                    Number(
                        teacherId
                    ),

                p_salary_amount:
                    Number(
                        salaryAmount
                    ),

                p_effective_from:
                    effectiveFrom ||
                    null,

                p_notes:
                    notes
            }
        );
    };


App.createTeacherSalary =
    async function (
        teacherId,
        salaryPeriod,
        amount,
        dueDate,
        notes = null
    ) {

        return App.authedRpc(
            "admin_create_teacher_salary",
            {

                p_teacher_id:
                    Number(
                        teacherId
                    ),

                p_salary_period:
                    salaryPeriod,

                p_amount:
                    amount === null ||
                    amount === ""
                        ? null
                        : Number(
                            amount
                        ),

                p_due_date:
                    dueDate ||
                    null,

                p_notes:
                    notes
            }
        );
    };


App.payTeacherSalary =
    async function (
        teacherId,
        salaryChargeId,
        amount,
        method = null,
        reference = null,
        notes = null
    ) {

        return App.authedRpc(
            "admin_pay_teacher_salary",
            {

                p_teacher_id:
                    Number(
                        teacherId
                    ),

                p_salary_charge_id:
                    Number(
                        salaryChargeId
                    ),

                p_amount:
                    Number(
                        amount
                    ),

                p_payment_method:
                    method,

                p_payment_reference:
                    reference,

                p_notes:
                    notes
            }
        );
    };


/* =====================================================
   HOSTEL HISTORY
   ===================================================== */

App.getStudentHostelHistory =
    async function (
        studentId
    ) {

        return App.authedRpc(
            "admin_student_hostel_history",
            {
                p_student_id:
                    Number(
                        studentId
                    )
            }
        );
    };


/* =====================================================
   HOSTEL EXIT
   ===================================================== */

App.hostelExit =
    async function (
        studentId,
        mahramId,
        destination,
        reason,
        notes = null
    ) {

        return App.authedRpc(
            "admin_hostel_exit",
            {

                p_student_id:
                    Number(
                        studentId
                    ),

                p_mahram_id:
                    Number(
                        mahramId
                    ),

                p_destination:
                    destination ||
                    null,

                p_reason:
                    reason ||
                    null,

                p_notes:
                    notes
            }
        );
    };


/* =====================================================
   HOSTEL RETURN
   ===================================================== */

App.hostelReturn =
    async function (
        movementId,
        personName,
        relation,
        cnic,
        phone,
        notes = null
    ) {

        return App.authedRpc(
            "admin_hostel_return",
            {

                p_movement_id:
                    Number(
                        movementId
                    ),

                p_return_person_name:
                    personName ||
                    null,

                p_return_person_relation:
                    relation ||
                    null,

                p_return_person_cnic:
                    cnic
                        ? App.normalizeDigits(
                            cnic
                        )
                        : null,

                p_return_person_phone:
                    phone
                        ? App.normalizePhone(
                            phone
                        )
                        : null,

                p_notes:
                    notes
            }
        );
    };


/* =====================================================
   HOSTEL PAGE
   ===================================================== */

App.initHostelPage =
    async function () {

        if (
            App.currentFile !==
            "admin-hostel.html"
        ) {
            return;
        }


        const studentSelect =
            App.first(
                "hostelStudentId",
                "hostelStudentSelect"
            );


        if (studentSelect) {

            try {

                const students =
                    await App.loadStudents();


                studentSelect.innerHTML =
                    `<option value="">
                        طالبہ منتخب کریں
                    </option>` +

                    students
                        .filter(
                            student => {

                                const residence =
                                    App.safe(
                                        student
                                            .residence_type
                                    )
                                        .toLowerCase();


                                return (
                                    residence ===
                                    "ہاسٹل" ||
                                    residence ===
                                    "hostel"
                                );
                            }
                        )
                        .map(
                            student => `
                            <option value="${
                                Number(
                                    student.id
                                )
                            }">
                                ${App.escape(
                                    student
                                        .admission_no
                                )}
                                -
                                ${App.escape(
                                    student.name
                                )}
                            </option>
                        `
                        )
                        .join("");


            } catch (error) {

                console.error(
                    "Hostel students:",
                    error
                );
            }
        }


        const exitForm =
            App.first(
                "hostelExitForm",
                "studentHostelExitForm"
            );


        if (exitForm) {

            exitForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    try {

                        await App.hostelExit(

                            App.val(
                                "hostelStudentId"
                            ) ||
                            App.val(
                                "hostelStudentSelect"
                            ),

                            App.val(
                                "hostelMahramId"
                            ),

                            App.val(
                                "hostelDestination"
                            ),

                            App.val(
                                "hostelReason"
                            ),

                            App.val(
                                "hostelExitNotes"
                            ) ||
                            null
                        );


                        alert(
                            "طالبہ کا ہاسٹل سے خروج محفوظ ہوگیا۔"
                        );


                        exitForm.reset();


                    } catch (error) {

                        console.error(
                            "Hostel exit:",
                            error
                        );


                        alert(
                            error?.message ||
                            "خروج محفوظ نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }


        const returnForm =
            App.first(
                "hostelReturnForm",
                "studentHostelReturnForm"
            );


        if (returnForm) {

            returnForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    try {

                        await App.hostelReturn(

                            App.val(
                                "hostelMovementId"
                            ),

                            App.val(
                                "hostelReturnPersonName"
                            ),

                            App.val(
                                "hostelReturnRelation"
                            ),

                            App.val(
                                "hostelReturnCNIC"
                            ),

                            App.val(
                                "hostelReturnPhone"
                            ),

                            App.val(
                                "hostelReturnNotes"
                            ) ||
                            null
                        );


                        alert(
                            "طالبہ کی واپسی کامیابی سے محفوظ ہوگئی۔"
                        );


                        returnForm.reset();


                    } catch (error) {

                        console.error(
                            "Hostel return:",
                            error
                        );


                        alert(
                            error?.message ||
                            "واپسی محفوظ نہیں ہو سکی۔"
                        );
                    }
                }
            );
        }
    };


/* =====================================================
   STUDENT PROMOTION
   ===================================================== */

App.promoteStudent =
    async function (
        studentId,
        toClass,
        academicYear,
        examName,
        percentage,
        decision = "promoted",
        notes = null
    ) {

        return App.authedRpc(
            "admin_promote_student",
            {

                p_student_id:
                    Number(
                        studentId
                    ),

                p_to_class:
                    toClass,

                p_academic_year:
                    academicYear ||
                    null,

                p_exam_name:
                    examName ||
                    null,

                p_result_percentage:
                    percentage ===
                        null ||
                    percentage ===
                        ""
                        ? null
                        : Number(
                            percentage
                        ),

                p_decision:
                    decision,

                p_notes:
                    notes
            }
        );
    };


App.promoteSelectedStudents =
    async function (
        studentIds,
        toClass,
        academicYear,
        examName,
        decision = "promoted",
        notes = null
    ) {

        const ids =
            Array.from(
                new Set(
                    studentIds
                        .map(Number)
                        .filter(Boolean)
                )
            );


        if (!ids.length) {

            throw new Error(
                "کوئی طالبہ منتخب نہیں کی گئی۔"
            );
        }


        return App.authedRpc(
            "admin_promote_selected_students",
            {

                p_student_ids:
                    ids,

                p_to_class:
                    toClass,

                p_academic_year:
                    academicYear ||
                    null,

                p_exam_name:
                    examName ||
                    null,

                p_decision:
                    decision,

                p_notes:
                    notes
            }
        );
    };


App.promoteWholeClass =
    async function (
        fromClass,
        toClass,
        academicYear,
        examName,
        decision = "promoted",
        notes = null
    ) {

        return App.authedRpc(
            "admin_promote_whole_class",
            {

                p_from_class:
                    fromClass,

                p_to_class:
                    toClass,

                p_academic_year:
                    academicYear ||
                    null,

                p_exam_name:
                    examName ||
                    null,

                p_decision:
                    decision,

                p_notes:
                    notes
            }
        );
    };


App.getStudentPromotionHistory =
    async function (
        studentId
    ) {

        return App.authedRpc(
            "admin_student_promotion_history",
            {
                p_student_id:
                    Number(
                        studentId
                    )
            }
        );
    };


/* =====================================================
   PROMOTION PAGE
   ===================================================== */

App.initPromotionPage =
    function () {

        if (
            App.currentFile !==
            "admin-promotions.html"
        ) {
            return;
        }


        const singleForm =
            App.first(
                "singlePromotionForm",
                "promotionForm"
            );


        if (singleForm) {

            singleForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    try {

                        await App.promoteStudent(

                            App.val(
                                "promotionStudentId"
                            ),

                            App.val(
                                "promotionToClass"
                            ),

                            App.val(
                                "promotionAcademicYear"
                            ),

                            App.val(
                                "promotionExamName"
                            ),

                            App.val(
                                "promotionPercentage"
                            ),

                            App.val(
                                "promotionDecision"
                            ) ||
                            "promoted",

                            App.val(
                                "promotionNotes"
                            ) ||
                            null
                        );


                        alert(
                            "طالبہ کی کلاس کی تبدیلی کامیابی سے محفوظ ہوگئی۔"
                        );


                        singleForm.reset();


                    } catch (error) {

                        console.error(
                            "Promotion:",
                            error
                        );


                        alert(
                            error?.message ||
                            "ترقی محفوظ نہیں ہو سکی۔"
                        );
                    }
                }
            );
        }


        const wholeForm =
            App.first(
                "wholeClassPromotionForm",
                "classPromotionForm"
            );


        if (wholeForm) {

            wholeForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const confirmed =
                        window.confirm(
                            "کیا آپ واقعی پوری کلاس کا ریکارڈ تبدیل کرنا چاہتے ہیں؟"
                        );


                    if (!confirmed) {
                        return;
                    }


                    try {

                        await App
                            .promoteWholeClass(

                                App.val(
                                    "promotionFromClass"
                                ),

                                App.val(
                                    "promotionWholeToClass"
                                ) ||
                                App.val(
                                    "promotionToClass"
                                ),

                                App.val(
                                    "promotionWholeAcademicYear"
                                ) ||
                                App.val(
                                    "promotionAcademicYear"
                                ),

                                App.val(
                                    "promotionWholeExamName"
                                ) ||
                                App.val(
                                    "promotionExamName"
                                ),

                                App.val(
                                    "promotionWholeDecision"
                                ) ||
                                "promoted",

                                App.val(
                                    "promotionWholeNotes"
                                ) ||
                                null
                            );


                        alert(
                            "پوری کلاس کی ترقی محفوظ ہوگئی۔"
                        );


                        wholeForm.reset();


                    } catch (error) {

                        console.error(
                            "Whole class promotion:",
                            error
                        );


                        alert(
                            error?.message ||
                            "کلاس کی ترقی محفوظ نہیں ہو سکی۔"
                        );
                    }
                }
            );
        }
    };


/* =====================================================
   DOCUMENT HISTORY
   ===================================================== */

App.getDocumentHistory =
    async function (
        ownerType,
        ownerId
    ) {

        return App.authedRpc(
            "admin_document_history",
            {

                p_owner_type:
                    ownerType,

                p_owner_id:
                    Number(
                        ownerId
                    )
            }
        );
    };


/* =====================================================
   ISSUED DOCUMENT HISTORY
   ===================================================== */

App.getIssuedDocuments =
    async function (
        ownerType,
        ownerId
    ) {

        return App.authedRpc(
            "admin_issued_document_history",
            {

                p_owner_type:
                    ownerType,

                p_owner_id:
                    Number(
                        ownerId
                    )
            }
        );
    };


/* =====================================================
   ISSUE MADRASSA DOCUMENT
   ===================================================== */

App.issueDocument =
    async function (
        ownerType,
        ownerId,
        documentType,
        title,
        snapshot = {}
    ) {

        return App.authedRpc(
            "admin_issue_document",
            {

                p_owner_type:
                    ownerType,

                p_owner_id:
                    Number(
                        ownerId
                    ),

                p_document_type:
                    documentType,

                p_title:
                    title,

                p_snapshot:
                    snapshot
            }
        );
    };


/* =====================================================
   ID CARDS
   ===================================================== */

App.registerIdCard =
    async function (
        ownerType,
        ownerId
    ) {

        return App.authedRpc(
            "admin_register_id_card",
            {

                p_owner_type:
                    ownerType,

                p_owner_id:
                    Number(
                        ownerId
                    )
            }
        );
    };


App.registerIdCardBatch =
    async function (
        ownerType,
        ownerIds
    ) {

        const ids =
            Array.from(
                new Set(
                    ownerIds
                        .map(Number)
                        .filter(Boolean)
                )
            );


        if (!ids.length) {

            throw new Error(
                "کوئی ریکارڈ منتخب نہیں کیا گیا۔"
            );
        }


        return App.authedRpc(
            "admin_register_id_card_batch",
            {

                p_owner_type:
                    ownerType,

                p_owner_ids:
                    ids
            }
        );
    };


App.initIdCardPage =
    function () {

        if (
            App.currentFile !==
            "admin-id-cards.html"
        ) {
            return;
        }


        const singleForm =
            App.first(
                "idCardSingleForm",
                "singleIdCardForm"
            );


        if (singleForm) {

            singleForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    try {

                        const type =
                            App.val(
                                "idCardOwnerType"
                            );


                        const id =
                            App.val(
                                "idCardOwnerId"
                            );


                        const result =
                            await App
                                .registerIdCard(
                                    type,
                                    id
                                );


                        alert(
                            "آئی ڈی کارڈ ریکارڈ تیار ہوگیا۔" +
                            (
                                result
                                    ?.card_no
                                    ? "\nکارڈ نمبر: " +
                                    result.card_no
                                    : ""
                            )
                        );


                    } catch (error) {

                        console.error(
                            "ID card:",
                            error
                        );


                        alert(
                            "آئی ڈی کارڈ تیار نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }


        const batchButton =
            App.first(
                "createSelectedIdCards",
                "idCardBatchButton"
            );


        if (batchButton) {

            batchButton.addEventListener(
                "click",
                async function () {

                    const type =
                        App.val(
                            "idCardBatchOwnerType"
                        ) ||
                        App.val(
                            "idCardOwnerType"
                        );


                    const ids =
                        Array.from(
                            document
                                .querySelectorAll(
                                    "[data-id-card-select]:checked"
                                )
                        )
                            .map(
                                checkbox =>
                                    Number(
                                        checkbox.value ||
                                        checkbox.dataset
                                            .idCardSelect
                                    )
                            )
                            .filter(Boolean);


                    try {

                        await App
                            .registerIdCardBatch(
                                type,
                                ids
                            );


                        alert(
                            "منتخب ریکارڈز کے آئی ڈی کارڈ تیار ہوگئے۔"
                        );


                    } catch (error) {

                        console.error(
                            "ID card batch:",
                            error
                        );


                        alert(
                            error?.message ||
                            "آئی ڈی کارڈ تیار نہیں ہو سکے۔"
                        );
                    }
                }
            );
        }
    };


/* =====================================================
   SETTINGS / PASSWORD
   ===================================================== */

App.bindPasswordForm =
    function (
        formId,
        currentId,
        newId,
        confirmId
    ) {

        const form =
            App.el(
                formId
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const currentPassword =
                    App.val(
                        currentId
                    );


                const newPassword =
                    App.val(
                        newId
                    );


                const confirmPassword =
                    App.val(
                        confirmId
                    );


                if (
                    !currentPassword
                ) {

                    alert(
                        "موجودہ پاس ورڈ درج کریں۔"
                    );

                    return;
                }


                if (
                    newPassword.length <
                    8
                ) {

                    alert(
                        "نیا پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
                    );

                    return;
                }


                if (
                    newPassword !==
                    confirmPassword
                ) {

                    alert(
                        "دونوں نئے پاس ورڈ ایک جیسے نہیں ہیں۔"
                    );

                    return;
                }


                try {

                    await App.authedRpc(
                        "account_change_password",
                        {

                            p_current_password:
                                currentPassword,

                            p_new_password:
                                newPassword
                        }
                    );


                    alert(
                        "پاس ورڈ کامیابی سے تبدیل ہوگیا۔ دوبارہ لاگ اِن کریں۔"
                    );


                    await App.logout();


                } catch (error) {

                    console.error(
                        "Password change:",
                        error
                    );


                    alert(
                        "پاس ورڈ تبدیل نہیں ہو سکا۔"
                    );
                }
            }
        );
    };


App.initSettings =
    function () {

        App.bindPasswordForm(
            "adminChangePasswordForm",
            "currentAdminPassword",
            "newAdminPassword",
            "confirmAdminPassword"
        );


        App.bindPasswordForm(
            "teacherChangePasswordForm",
            "currentTeacherPassword",
            "newTeacherPassword",
            "confirmTeacherPassword"
        );


        App.bindPasswordForm(
            "studentChangePasswordForm",
            "currentStudentPassword",
            "newStudentPassword",
            "confirmStudentPassword"
        );
    };

 /* =====================================================
   PART 4 / 4
   COMPLETE PROFILE PRINT / PDF
   REPORT HELPERS + FINAL ROUTING + INITIALIZATION
   ===================================================== */


/* =====================================================
   JSON / PROFILE HELPERS
   ===================================================== */

App.path =
    function (
        object,
        path,
        fallback = null
    ) {

        if (
            !object ||
            !path
        ) {
            return fallback;
        }


        const parts =
            Array.isArray(path)
                ? path
                : String(path)
                    .split(".");


        let value =
            object;


        for (
            const key of parts
        ) {

            if (
                value === null ||
                value === undefined ||
                typeof value !==
                "object" ||
                !(key in value)
            ) {

                return fallback;
            }


            value =
                value[key];
        }


        return (
            value === undefined
                ? fallback
                : value
        );
    };


App.pick =
    function (
        object,
        paths,
        fallback = null
    ) {

        for (
            const path of paths
        ) {

            const value =
                App.path(
                    object,
                    path,
                    undefined
                );


            if (
                value !== undefined &&
                value !== null
            ) {

                return value;
            }
        }


        return fallback;
    };


App.asArray =
    function (value) {

        if (
            Array.isArray(value)
        ) {

            return value;
        }


        if (
            value &&
            typeof value ===
            "object"
        ) {

            if (
                Array.isArray(
                    value.data
                )
            ) {

                return value.data;
            }


            if (
                Array.isArray(
                    value.records
                )
            ) {

                return value.records;
            }


            if (
                Array.isArray(
                    value.history
                )
            ) {

                return value.history;
            }


            if (
                Array.isArray(
                    value.items
                )
            ) {

                return value.items;
            }
        }


        return [];
    };


App.formatBoolean =
    function (value) {

        return (
            value === true ||
            value === "true"
        )
            ? "ہاں"
            : "نہیں";
    };


App.objectValue =
    function (
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "—";
        }


        if (
            typeof value ===
            "boolean"
        ) {

            return App.formatBoolean(
                value
            );
        }


        if (
            typeof value ===
            "object"
        ) {

            try {

                return JSON.stringify(
                    value
                );

            } catch (_) {

                return "—";
            }
        }


        return App.safe(
            value
        );
    };


App.fieldLabels = {

    id:
        "ریکارڈ نمبر",

    admission_no:
        "داخلہ نمبر",

    admission_type:
        "داخلہ کی قسم",

    name:
        "نام",

    full_name:
        "مکمل نام",

    father_name:
        "والد کا نام",

    guardian_name:
        "سرپرست کا نام",

    cnic:
        "شناختی کارڈ / ب فارم",

    phone:
        "فون نمبر",

    date_of_birth:
        "تاریخ پیدائش",

    student_class:
        "کلاس",

    admission_date:
        "داخلہ تاریخ",

    address:
        "پتہ",

    residence_type:
        "رہائش",

    previous_madrassa:
        "سابقہ مدرسہ",

    transfer_date:
        "منتقلی تاریخ",

    teacher_code:
        "استاد کوڈ",

    qualification:
        "تعلیم",

    specialization:
        "تخصص",

    experience_years:
        "تجربہ",

    previous_institute:
        "سابقہ ادارہ",

    teaching_class:
        "تدریسی کلاس",

    subject:
        "مضمون",

    joining_date:
        "شمولیت تاریخ",

    designation:
        "عہدہ",

    username:
        "صارف نام",

    authorization_status:
        "اکاؤنٹ حالت",

    status:
        "حالت",

    last_login:
        "آخری لاگ اِن",

    created_at:
        "تخلیق کی تاریخ",

    updated_at:
        "آخری تبدیلی",

    period_number:
        "پیریڈ",

    attendance_date:
        "حاضری تاریخ",

    check_in_time:
        "آمد کا وقت",

    check_out_time:
        "روانگی کا وقت",

    note:
        "نوٹ",

    notes:
        "نوٹس",

    relation:
        "رشتہ",

    academic_year:
        "تعلیمی سال",

    exam_name:
        "امتحان",

    exam_type:
        "امتحان کی قسم",

    exam_date:
        "امتحان تاریخ",

    obtained_marks:
        "حاصل کردہ نمبر",

    total_marks:
        "کل نمبر",

    marks_percentage:
        "فیصد",

    rating:
        "ریٹنگ",

    comment:
        "تبصرہ",

    feedback_text:
        "فیڈ بیک",

    feedback_date:
        "فیڈ بیک تاریخ",

    title:
        "عنوان",

    description:
        "تفصیل",

    message:
        "پیغام",

    assigned_date:
        "جاری تاریخ",

    due_date:
        "آخری تاریخ",

    submitted_at:
        "جمع کرنے کا وقت",

    teacher_note:
        "استاد کا نوٹ",

    amount:
        "رقم",

    due_amount:
        "واجب الادا رقم",

    paid_amount:
        "ادا شدہ رقم",

    pending_amount:
        "بقایا رقم",

    fee_period:
        "فیس مدت",

    salary_period:
        "تنخواہ مدت",

    payment_method:
        "ادائیگی طریقہ",

    payment_reference:
        "حوالہ نمبر",

    payment_at:
        "ادائیگی وقت",

    transaction_at:
        "لین دین کا وقت",

    received_from:
        "وصول از",

    paid_to:
        "ادائیگی بنام",

    purpose:
        "مقصد",

    receipt_no:
        "رسید نمبر",

    transaction_no:
        "لین دین نمبر",

    document_type:
        "دستاویز کی قسم",

    document_title:
        "دستاویز عنوان",

    original_file_name:
        "اصل فائل نام",

    file_path:
        "فائل",

    is_required:
        "لازمی دستاویز",

    is_verified:
        "تصدیق شدہ",

    verified_at:
        "تصدیق تاریخ",

    verification_note:
        "تصدیقی نوٹ",

    issued_no:
        "اجراء نمبر",

    issued_at:
        "اجراء تاریخ",

    from_class:
        "سابقہ کلاس",

    to_class:
        "نئی کلاس",

    decision:
        "فیصلہ",

    result_percentage:
        "نتیجہ فیصد",

    exit_at:
        "خروج وقت",

    returned_at:
        "واپسی وقت",

    destination:
        "منزل",

    reason:
        "وجہ",

    mahram_name:
        "محرم کا نام",

    mahram_relation:
        "محرم رشتہ",

    mahram_cnic:
        "محرم شناختی کارڈ",

    mahram_phone:
        "محرم فون",

    action:
        "کارروائی",

    entity_type:
        "ریکارڈ کی قسم",

    entity_id:
        "ریکارڈ نمبر",

    activity_type:
        "سرگرمی"
};


/* =====================================================
   DATE FIELD DETECTION
   ===================================================== */

App.isDateField =
    function (key) {

        return (
            key.endsWith(
                "_at"
            ) ||
            key.endsWith(
                "_date"
            ) ||
            key ===
            "date_of_birth" ||
            key ===
            "joining_date" ||
            key ===
            "admission_date" ||
            key ===
            "transfer_date"
        );
    };


App.prettyValue =
    function (
        key,
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "—";
        }


        if (
            typeof value ===
            "boolean"
        ) {

            return App.formatBoolean(
                value
            );
        }


        if (
            key === "status" ||
            key ===
            "authorization_status" ||
            key ===
            "decision"
        ) {

            return App.statusUrdu(
                value
            );
        }


        if (
            key === "cnic" ||
            key.endsWith(
                "_cnic"
            )
        ) {

            const digits =
                App.normalizeDigits(
                    value
                );


            return (
                digits.length === 13
                    ? App.formatCNIC(
                        digits
                    )
                    : App.safe(
                        value
                    )
            );
        }


        if (
            App.isDateField(
                key
            )
        ) {

            if (
                key.endsWith(
                    "_at"
                ) ||
                key.includes(
                    "time"
                )
            ) {

                return App.dateTime(
                    value
                );
            }


            return App.date(
                value
            );
        }


        if (
            key.includes(
                "amount"
            ) ||
            key.includes(
                "balance"
            )
        ) {

            if (
                !Number.isNaN(
                    Number(value)
                )
            ) {

                return App.money(
                    value
                );
            }
        }


        if (
            typeof value ===
            "object"
        ) {

            return App.objectValue(
                value
            );
        }


        return App.safe(
            value
        );
    };


/* =====================================================
   GENERIC OBJECT GRID
   ===================================================== */

App.renderObjectGrid =
    function (
        object,
        preferredFields = null
    ) {

        if (
            !object ||
            typeof object !==
            "object"
        ) {

            return App.empty();
        }


        let keys =
            Array.isArray(
                preferredFields
            )
                ? preferredFields
                : Object.keys(
                    object
                );


        keys =
            keys.filter(
                key =>
                    key !==
                    "password" &&
                    key !==
                    "password_hash" &&
                    key !==
                    "metadata" &&
                    key !==
                    "mahrams"
            );


        const items = [];


        keys.forEach(
            key => {

                if (
                    !(key in object)
                ) {
                    return;
                }


                const value =
                    object[key];


                if (
                    Array.isArray(
                        value
                    )
                ) {
                    return;
                }


                if (
                    value &&
                    typeof value ===
                    "object"
                ) {
                    return;
                }


                items.push([

                    App.fieldLabels[key] ||
                    key,

                    App.prettyValue(
                        key,
                        value
                    )
                ]);
            }
        );


        if (!items.length) {
            return App.empty();
        }


        return App.infoGrid(
            items
        );
    };


/* =====================================================
   GENERIC RECORD TABLE
   ===================================================== */

App.renderRecordTable =
    function (
        records,
        fields
    ) {

        records =
            App.asArray(
                records
            );


        if (!records.length) {

            return App.empty();
        }


        const availableFields =
            fields.filter(
                field =>
                    records.some(
                        row =>
                            row &&
                            row[field] !==
                            undefined
                    )
            );


        if (
            !availableFields.length
        ) {

            return App.empty();
        }


        const headers =
            availableFields.map(
                key =>
                    App.fieldLabels[key] ||
                    key
            );


        const rows =
            records.map(
                row =>
                    availableFields.map(
                        key =>
                            App.escape(
                                App.prettyValue(
                                    key,
                                    row?.[key]
                                )
                            )
                    )
            );


        return App.table(
            headers,
            rows
        );
    };


/* =====================================================
   PROFILE SECTION CONTROL
   ===================================================== */

App.setPrintSection =
    function (
        sectionId,
        targetId,
        html
    ) {

        const section =
            App.el(
                sectionId
            );


        const target =
            App.el(
                targetId
            );


        if (
            !section ||
            !target
        ) {
            return;
        }


        if (
            !html ||
            html ===
            App.empty()
        ) {

            section.hidden =
                true;

            section.style.display =
                "none";

            return;
        }


        target.innerHTML =
            html;


        section.hidden =
            false;

        section.style.display =
            "block";
    };


App.hideAllPrintSections =
    function () {

        [
            "printAccountSection",
            "printMahramSection",
            "printAttendanceSection",
            "printAssignmentsSection",
            "printResultsSection",
            "printRatingsSection",
            "printFeedbackSection",
            "printFeesSection",
            "printFeeSlipsSection",
            "printSalarySection",
            "printSalarySlipsSection",
            "printHomeworkSection",
            "printAnnouncementsSection",
            "printHostelSection",
            "printPromotionSection",
            "printUploadedDocumentsSection",
            "printIssuedDocumentsSection",
            "printActivitySection"
        ]
            .forEach(
                id => {

                    const node =
                        App.el(id);


                    if (node) {

                        node.hidden =
                            true;

                        node.style.display =
                            "none";
                    }
                }
            );
    };


/* =====================================================
   PERSONAL PROFILE RENDERER
   ===================================================== */

App.renderPrintPersonal =
    function (
        type,
        data
    ) {

        let record =
            null;


        if (
            type === "student"
        ) {

            record =
                App.pick(
                    data,
                    [
                        "core.student",
                        "core.personal",
                        "student",
                        "personal"
                    ],
                    {}
                );

        } else if (
            type === "teacher"
        ) {

            record =
                App.pick(
                    data,
                    [
                        "core.teacher",
                        "core.personal",
                        "teacher",
                        "personal"
                    ],
                    {}
                );

        } else {

            record =
                App.pick(
                    data,
                    [
                        "core.personal",
                        "personal"
                    ],
                    {}
                );
        }


        const fields =
            type === "student"
                ? [
                    "admission_no",
                    "admission_type",
                    "name",
                    "father_name",
                    "guardian_name",
                    "cnic",
                    "phone",
                    "date_of_birth",
                    "student_class",
                    "admission_date",
                    "address",
                    "residence_type",
                    "previous_madrassa",
                    "transfer_date"
                ]
                :
                type === "teacher"
                    ? [
                        "teacher_code",
                        "name",
                        "father_name",
                        "cnic",
                        "phone",
                        "date_of_birth",
                        "address",
                        "qualification",
                        "specialization",
                        "experience_years",
                        "previous_institute",
                        "teaching_class",
                        "subject",
                        "joining_date",
                        "status"
                    ]
                    :
                    [
                        "full_name",
                        "father_name",
                        "cnic",
                        "phone",
                        "date_of_birth",
                        "address",
                        "designation",
                        "joining_date",
                        "status"
                    ];


        App.setHTML(
            "printPersonalData",
            App.renderObjectGrid(
                record,
                fields
            )
        );


        return record;
    };


/* =====================================================
   ACCOUNT SECTION
   ===================================================== */

App.renderPrintAccount =
    function (
        data
    ) {

        const account =
            App.pick(
                data,
                [
                    "core.account",
                    "account"
                ],
                null
            );


        if (!account) {
            return;
        }


        App.setPrintSection(
            "printAccountSection",
            "printAccountData",
            App.renderObjectGrid(
                account,
                [
                    "id",
                    "username",
                    "authorization_status",
                    "status",
                    "last_login",
                    "created_at",
                    "updated_at"
                ]
            )
        );
    };


/* =====================================================
   MAHRAMS
   ===================================================== */

App.renderPrintMahrams =
    function (
        data
    ) {

        const records =
            App.asArray(
                App.pick(
                    data,
                    [
                        "core.mahrams",
                        "core.student_mahrams",
                        "mahrams"
                    ],
                    []
                )
            );


        App.setPrintSection(
            "printMahramSection",
            "printMahrams",

            App.renderRecordTable(
                records,
                [
                    "name",
                    "relation",
                    "phone",
                    "cnic",
                    "active",
                    "approved_at"
                ]
            )
        );
    };


/* =====================================================
   ATTENDANCE
   ===================================================== */

App.renderPrintAttendance =
    function (
        type,
        data
    ) {

        let records = [];


        if (
            type === "teacher"
        ) {

            records =
                App.asArray(
                    App.pick(
                        data,
                        [
                            "core.attendance",
                            "core.teacher_attendance",
                            "teacher_attendance"
                        ],
                        []
                    )
                );

        } else {

            records =
                App.asArray(
                    App.pick(
                        data,
                        [
                            "core.attendance",
                            "attendance"
                        ],
                        []
                    )
                );
        }


        if (!records.length) {
            return;
        }


        const present =
            records.filter(
                row =>
                    App.safe(
                        row.status
                    )
                        .toLowerCase() ===
                    "present"
            ).length;


        const absent =
            records.filter(
                row =>
                    App.safe(
                        row.status
                    )
                        .toLowerCase() ===
                    "absent"
            ).length;


        const leave =
            records.filter(
                row =>
                    App.safe(
                        row.status
                    )
                        .toLowerCase() ===
                    "leave"
            ).length;


        const late =
            records.filter(
                row =>
                    App.safe(
                        row.status
                    )
                        .toLowerCase() ===
                    "late"
            ).length;


        const percentage =
            records.length
                ? (
                    present /
                    records.length *
                    100
                ).toFixed(1)
                : "0.0";


        App.setHTML(
            "printAttendanceSummary",

            `
            <div class="print-summary-grid">

                <div class="print-summary-card">
                    کل
                    <strong>
                        ${records.length}
                    </strong>
                </div>

                <div class="print-summary-card">
                    حاضر
                    <strong>
                        ${present}
                    </strong>
                </div>

                <div class="print-summary-card">
                    غیر حاضر
                    <strong>
                        ${absent}
                    </strong>
                </div>

                <div class="print-summary-card">
                    فیصد
                    <strong>
                        ${percentage}%
                    </strong>
                </div>

                ${
                    late
                        ? `
                        <div class="print-summary-card">
                            تاخیر
                            <strong>
                                ${late}
                            </strong>
                        </div>
                        `
                        : ""
                }

                ${
                    leave
                        ? `
                        <div class="print-summary-card">
                            رخصت
                            <strong>
                                ${leave}
                            </strong>
                        </div>
                        `
                        : ""
                }

            </div>
            `
        );


        App.setHTML(
            "printAttendanceHistory",

            App.renderRecordTable(
                records,
                type === "teacher"
                    ? [
                        "attendance_date",
                        "status",
                        "check_in_time",
                        "check_out_time",
                        "note"
                    ]
                    : [
                        "attendance_date",
                        "student_class",
                        "period_number",
                        "status",
                        "note"
                    ]
            )
        );


        const section =
            App.el(
                "printAttendanceSection"
            );


        if (section) {

            section.hidden =
                false;

            section.style.display =
                "block";
        }
    };


/* =====================================================
   TEACHER ASSIGNMENTS
   ===================================================== */

App.renderPrintAssignments =
    function (
        data
    ) {

        const assignments =
            App.asArray(
                App.pick(
                    data,
                    [
                        "core.assignments",
                        "core.teacher_assignments",
                        "assignments"
                    ],
                    []
                )
            );


        App.setPrintSection(
            "printAssignmentsSection",
            "printAssignmentsHistory",

            App.renderRecordTable(
                assignments,
                [
                    "student_class",
                    "subject_name",
                    "period_number",
                    "academic_year",
                    "start_date",
                    "end_date",
                    "status",
                    "notes"
                ]
            )
        );
    };


/* =====================================================
   RESULTS
   ===================================================== */

App.renderPrintResults =
    function (
        type,
        data
    ) {

        const source =
            type === "student"
                ? App.pick(
                    data,
                    [
                        "results.marks",
                        "marks",
                        "results"
                    ],
                    []
                )
                :
                App.pick(
                    data,
                    [
                        "marks_ratings.marks",
                        "marks_and_ratings.marks",
                        "marks"
                    ],
                    []
                );


        const marks =
            App.asArray(
                source
            );


        if (!marks.length) {
            return;
        }


        const total =
            marks.reduce(
                (
                    sum,
                    row
                ) =>
                    sum +
                    Number(
                        row.total_marks ||
                        0
                    ),
                0
            );


        const obtained =
            marks.reduce(
                (
                    sum,
                    row
                ) =>
                    sum +
                    Number(
                        row.obtained_marks ||
                        0
                    ),
                0
            );


        const percentage =
            total
                ? (
                    obtained /
                    total *
                    100
                ).toFixed(1)
                : "0.0";


        App.setHTML(
            "printResultSummary",

            `
            <div class="print-summary-grid">

                <div class="print-summary-card">
                    اندراجات
                    <strong>
                        ${marks.length}
                    </strong>
                </div>

                <div class="print-summary-card">
                    کل نمبر
                    <strong>
                        ${total}
                    </strong>
                </div>

                <div class="print-summary-card">
                    حاصل کردہ
                    <strong>
                        ${obtained}
                    </strong>
                </div>

                <div class="print-summary-card">
                    مجموعی فیصد
                    <strong>
                        ${percentage}%
                    </strong>
                </div>

            </div>
            `
        );


        App.setHTML(
            "printResultsHistory",

            App.renderRecordTable(
                marks,
                [
                    "exam_date",
                    "exam_name",
                    "exam_type",
                    "student_class",
                    "subject_id",
                    "obtained_marks",
                    "total_marks",
                    "marks_percentage",
                    "note"
                ]
            )
        );


        const section =
            App.el(
                "printResultsSection"
            );


        if (section) {

            section.hidden =
                false;

            section.style.display =
                "block";
        }
    };


/* =====================================================
   RATINGS
   ===================================================== */

App.renderPrintRatings =
    function (
        type,
        data
    ) {

        const ratings =
            App.asArray(
                type === "student"
                    ? App.pick(
                        data,
                        [
                            "results.ratings",
                            "ratings"
                        ],
                        []
                    )
                    :
                    App.pick(
                        data,
                        [
                            "marks_ratings.ratings",
                            "marks_and_ratings.ratings",
                            "ratings"
                        ],
                        []
                    )
            );


        App.setPrintSection(
            "printRatingsSection",
            "printRatingsHistory",

            App.renderRecordTable(
                ratings,
                [
                    "created_at",
                    "rating",
                    "rating_by",
                    "teacher_id",
                    "student_id",
                    "comment"
                ]
            )
        );
    };


/* =====================================================
   FEEDBACK
   ===================================================== */

App.renderPrintFeedback =
    function (
        type,
        data
    ) {

        let records = [];


        if (
            type === "student"
        ) {

            records = [
                ...App.asArray(
                    App.pick(
                        data,
                        [
                            "results.student_feedback",
                            "student_feedback"
                        ],
                        []
                    )
                ),

                ...App.asArray(
                    App.pick(
                        data,
                        [
                            "results.feedback",
                            "results.legacy_feedback",
                            "feedback"
                        ],
                        []
                    )
                )
            ];

        } else if (
            type === "teacher"
        ) {

            records = [
                ...App.asArray(
                    App.pick(
                        data,
                        [
                            "feedback.student_feedback",
                            "student_feedback"
                        ],
                        []
                    )
                ),

                ...App.asArray(
                    App.pick(
                        data,
                        [
                            "feedback.feedback",
                            "feedback.legacy_feedback",
                            "legacy_feedback"
                        ],
                        []
                    )
                )
            ];
        }


        App.setPrintSection(
            "printFeedbackSection",
            "printFeedbackHistory",

            App.renderRecordTable(
                records,
                [
                    "feedback_date",
                    "created_at",
                    "student_id",
                    "teacher_id",
                    "rating",
                    "feedback_text",
                    "comment"
                ]
            )
        );
    };


/* =====================================================
   STUDENT FEES
   ===================================================== */

App.renderPrintFees =
    function (
        data
    ) {

        const fees =
            App.pick(
                data,
                [
                    "fees",
                    "fee_history"
                ],
                {}
            ) || {};


        const balance =
            App.pick(
                fees,
                [
                    "balance",
                    "summary"
                ],
                {}
            ) || {};


        const charges =
            App.asArray(
                App.pick(
                    fees,
                    [
                        "charges",
                        "fee_charges"
                    ],
                    []
                )
            );


        const payments =
            App.asArray(
                App.pick(
                    fees,
                    [
                        "payments",
                        "fee_payments"
                    ],
                    []
                )
            );


        if (
            !charges.length &&
            !payments.length &&
            !Object.keys(
                balance
            ).length
        ) {

            return;
        }


        App.setHTML(
            "printFeeSummary",

            App.renderObjectGrid(
                balance
            )
        );


        App.setHTML(
            "printFeeHistory",

            `
            <h4>
                واجب الادا فیس / چارجز
            </h4>

            ${
                App.renderRecordTable(
                    charges,
                    [
                        "fee_period",
                        "amount",
                        "due_amount",
                        "due_date",
                        "status",
                        "notes"
                    ]
                )
            }

            <h4>
                وصول شدہ فیس
            </h4>

            ${
                App.renderRecordTable(
                    payments,
                    [
                        "payment_at",
                        "amount",
                        "received_from",
                        "payment_method",
                        "payment_reference",
                        "status",
                        "notes"
                    ]
                )
            }
            `
        );


        const section =
            App.el(
                "printFeesSection"
            );


        if (section) {

            section.hidden =
                false;

            section.style.display =
                "block";
        }


        App.renderReceiptCards(
            "printFeeSlipsSection",
            "printFeeSlips",
            payments,
            "فیس رسید"
        );
    };


/* =====================================================
   SALARY
   ===================================================== */

App.renderPrintSalary =
    function (
        data
    ) {

        const salary =
            App.pick(
                data,
                [
                    "salary",
                    "salary_history"
                ],
                {}
            ) || {};


        const balance =
            App.pick(
                salary,
                [
                    "balance",
                    "summary"
                ],
                {}
            ) || {};


        const settings =
            App.pick(
                salary,
                [
                    "settings",
                    "salary_setting"
                ],
                {}
            ) || {};


        const charges =
            App.asArray(
                App.pick(
                    salary,
                    [
                        "charges",
                        "salary_charges"
                    ],
                    []
                )
            );


        const payments =
            App.asArray(
                App.pick(
                    salary,
                    [
                        "payments",
                        "salary_payments"
                    ],
                    []
                )
            );


        if (
            !charges.length &&
            !payments.length &&
            !Object.keys(
                settings
            ).length &&
            !Object.keys(
                balance
            ).length
        ) {

            return;
        }


        App.setHTML(
            "printSalarySummary",

            `
            ${
                App.renderObjectGrid(
                    settings
                )
            }

            ${
                App.renderObjectGrid(
                    balance
                )
            }
            `
        );


        App.setHTML(
            "printSalaryHistory",

            `
            <h4>
                تنخواہ واجبات
            </h4>

            ${
                App.renderRecordTable(
                    charges,
                    [
                        "salary_period",
                        "amount",
                        "due_amount",
                        "due_date",
                        "status",
                        "notes"
                    ]
                )
            }

            <h4>
                تنخواہ ادائیگیاں
            </h4>

            ${
                App.renderRecordTable(
                    payments,
                    [
                        "payment_at",
                        "amount",
                        "payment_method",
                        "payment_reference",
                        "status",
                        "notes"
                    ]
                )
            }
            `
        );


        const section =
            App.el(
                "printSalarySection"
            );


        if (section) {

            section.hidden =
                false;

            section.style.display =
                "block";
        }


        App.renderReceiptCards(
            "printSalarySlipsSection",
            "printSalarySlips",
            payments,
            "تنخواہ رسید"
        );
    };


/* =====================================================
   RECEIPT CARDS
   ===================================================== */

App.renderReceiptCards =
    function (
        sectionId,
        targetId,
        records,
        title
    ) {

        records =
            App.asArray(
                records
            );


        const withReceipt =
            records.filter(
                row =>
                    row &&
                    (
                        row.receipt_no ||
                        row.receipt ||
                        row.receipt_snapshot
                    )
            );


        if (
            !withReceipt.length
        ) {
            return;
        }


        const html =
            withReceipt
                .map(
                    row => {

                        const receipt =
                            (
                                row.receipt &&
                                typeof row.receipt ===
                                "object"
                            )
                                ? row.receipt
                                : (
                                    row.receipt_snapshot &&
                                    typeof row
                                        .receipt_snapshot ===
                                    "object"
                                        ? row
                                            .receipt_snapshot
                                        : row
                                );


                        return `
                        <div class="print-receipt">

                            <div class="print-receipt-header">

                                <strong>
                                    ${App.escape(
                                        title
                                    )}
                                </strong>

                                <span class="print-receipt-number">
                                    ${App.escape(
                                        receipt
                                            .receipt_no ||
                                        row.receipt_no ||
                                        "—"
                                    )}
                                </span>

                            </div>

                            ${
                                App.renderObjectGrid(
                                    receipt
                                )
                            }

                        </div>
                    `;
                    }
                )
                .join("");


        App.setPrintSection(
            sectionId,
            targetId,
            html
        );
    };


/* =====================================================
   HOMEWORK HISTORY
   ===================================================== */

App.renderPrintHomework =
    function (
        data
    ) {

        const source =
            App.pick(
                data,
                [
                    "homework",
                    "activity.homework"
                ],
                []
            );


        let records =
            App.asArray(
                source
            );


        if (
            source &&
            typeof source ===
            "object" &&
            !Array.isArray(
                source
            )
        ) {

            records = [
                ...App.asArray(
                    source.homework
                ),

                ...App.asArray(
                    source.submissions
                )
            ];
        }


        App.setPrintSection(
            "printHomeworkSection",
            "printHomeworkHistory",

            App.renderRecordTable(
                records,
                [
                    "assigned_date",
                    "due_date",
                    "title",
                    "description",
                    "student_class",
                    "status",
                    "submitted_at",
                    "teacher_note"
                ]
            )
        );
    };


/* =====================================================
   ANNOUNCEMENTS / ACTIVITY
   ===================================================== */

App.renderPrintAnnouncements =
    function (
        data
    ) {

        const activity =
            App.pick(
                data,
                [
                    "activity",
                    "activity_history"
                ],
                {}
            ) || {};


        const announcements = [
            ...App.asArray(
                activity
                    .announcements
            ),

            ...App.asArray(
                activity
                    .class_announcements
            ),

            ...App.asArray(
                activity
                    .legacy_announcements
            )
        ];


        App.setPrintSection(
            "printAnnouncementsSection",
            "printAnnouncementsHistory",

            App.renderRecordTable(
                announcements,
                [
                    "created_at",
                    "announcement_date",
                    "event_date",
                    "title",
                    "message",
                    "announcement_type",
                    "student_class",
                    "status"
                ]
            )
        );
    };


/* =====================================================
   HOSTEL HISTORY
   ===================================================== */

App.renderPrintHostel =
    function (
        data
    ) {

        const history =
            App.asArray(
                App.pick(
                    data,
                    [
                        "hostel_history",
                        "hostel"
                    ],
                    []
                )
            );


        App.setPrintSection(
            "printHostelSection",
            "printHostelHistory",

            App.renderRecordTable(
                history,
                [
                    "exit_at",
                    "mahram_name",
                    "mahram_relation",
                    "mahram_cnic",
                    "mahram_phone",
                    "destination",
                    "reason",
                    "returned_at",
                    "return_person_name",
                    "return_person_relation",
                    "notes",
                    "status"
                ]
            )
        );
    };


/* =====================================================
   PROMOTION HISTORY
   ===================================================== */

App.renderPrintPromotions =
    function (
        data
    ) {

        const history =
            App.asArray(
                App.pick(
                    data,
                    [
                        "promotion_history",
                        "promotions"
                    ],
                    []
                )
            );


        App.setPrintSection(
            "printPromotionSection",
            "printPromotionHistory",

            App.renderRecordTable(
                history,
                [
                    "academic_year",
                    "from_class",
                    "to_class",
                    "exam_name",
                    "result_percentage",
                    "decision",
                    "created_at",
                    "notes"
                ]
            )
        );
    };


/* =====================================================
   UPLOADED DOCUMENTS
   ===================================================== */

App.renderPrintDocuments =
    function (
        data
    ) {

        const documents =
            App.asArray(
                App.pick(
                    data,
                    [
                        "uploaded_documents",
                        "history.uploaded_documents",
                        "documents"
                    ],
                    []
                )
            );


        if (!documents.length) {
            return;
        }


        const html =
            documents
                .map(
                    document => `
                    <div class="print-document-item">

                        <strong>
                            ${App.escape(
                                document.title ||
                                document
                                    .document_title ||
                                App.fieldLabels[
                                    document
                                        .document_type
                                ] ||
                                document
                                    .document_type ||
                                "دستاویز"
                            )}
                        </strong>

                        <div>
                            فائل:
                            ${App.escape(
                                document
                                    .original_file_name ||
                                document
                                    .file_path ||
                                "—"
                            )}
                        </div>

                        <div>
                            تصدیق:
                            ${
                                document
                                    .is_verified
                                    ? "تصدیق شدہ"
                                    : "تصدیق باقی"
                            }
                        </div>

                        ${
                            document
                                .verification_note
                                ? `
                                <div>
                                    نوٹ:
                                    ${App.escape(
                                        document
                                            .verification_note
                                    )}
                                </div>
                                `
                                : ""
                        }

                        ${
                            document
                                .uploaded_at
                                ? `
                                <div>
                                    جمع کرنے کی تاریخ:
                                    ${App.escape(
                                        App.dateTime(
                                            document
                                                .uploaded_at
                                        )
                                    )}
                                </div>
                                `
                                : ""
                        }

                    </div>
                `
                )
                .join("");


        App.setPrintSection(
            "printUploadedDocumentsSection",
            "printUploadedDocuments",
            html
        );
    };


/* =====================================================
   MADRASSA ISSUED DOCUMENTS
   ===================================================== */

App.renderPrintIssuedDocuments =
    function (
        data
    ) {

        const documents =
            App.asArray(
                App.pick(
                    data,
                    [
                        "issued_documents",
                        "history.issued_documents"
                    ],
                    []
                )
            );


        App.setPrintSection(
            "printIssuedDocumentsSection",
            "printIssuedDocuments",

            App.renderRecordTable(
                documents,
                [
                    "issued_at",
                    "issued_no",
                    "document_type",
                    "title",
                    "status"
                ]
            )
        );
    };


/* =====================================================
   ACTIVITY / AUDIT
   ===================================================== */

App.renderPrintActivity =
    function (
        type,
        data
    ) {

        let records = [];


        if (
            type === "admin"
        ) {

            records = [
                ...App.asArray(
                    App.pick(
                        data,
                        [
                            "core.account_activity"
                        ],
                        []
                    )
                ),

                ...App.asArray(
                    App.pick(
                        data,
                        [
                            "history.audit_history"
                        ],
                        []
                    )
                )
            ];

        } else {

            const activity =
                App.pick(
                    data,
                    [
                        "activity",
                        "activity_history"
                    ],
                    {}
                ) || {};


            records = [
                ...App.asArray(
                    activity
                        .account_activity
                ),

                ...App.asArray(
                    activity
                        .activity
                )
            ];
        }


        App.setPrintSection(
            "printActivitySection",
            "printActivityHistory",

            App.renderRecordTable(
                records,
                [
                    "created_at",
                    "activity_type",
                    "action",
                    "entity_type",
                    "entity_id",
                    "details"
                ]
            )
        );
    };


/* =====================================================
   TEACHER CLASS ATTENDANCE ACTIVITY
   ===================================================== */

App.renderTeacherClassAttendance =
    function (
        data
    ) {

        const records =
            App.asArray(
                App.pick(
                    data,
                    [
                        "class_attendance_history"
                    ],
                    []
                )
            );


        if (!records.length) {
            return;
        }


        const html =
            `
            <h4>
                استاد کی طرف سے لی گئی کلاس حاضری
            </h4>
            ` +
            App.renderRecordTable(
                records,
                [
                    "attendance_date",
                    "student_class",
                    "period_number",
                    "student_id",
                    "status",
                    "note"
                ]
            );


        const target =
            App.el(
                "printActivityHistory"
            );


        const section =
            App.el(
                "printActivitySection"
            );


        if (
            target &&
            section
        ) {

            target.insertAdjacentHTML(
                "beforeend",
                html
            );


            section.hidden =
                false;

            section.style.display =
                "block";
        }
    };


/* =====================================================
   ADMIN FINANCE RELATED HISTORY
   ===================================================== */

App.renderAdminFinanceHistory =
    function (
        data
    ) {

        const records =
            App.asArray(
                App.pick(
                    data,
                    [
                        "finance",
                        "finance_history",
                        "history.finance"
                    ],
                    []
                )
            );


        if (!records.length) {
            return;
        }


        const html =
            `
            <h4>
                مالی ریکارڈ
            </h4>
            ` +
            App.renderRecordTable(
                records,
                [
                    "transaction_at",
                    "transaction_no",
                    "direction",
                    "amount",
                    "received_from",
                    "paid_to",
                    "purpose",
                    "payment_method",
                    "payment_reference"
                ]
            );


        const target =
            App.el(
                "printActivityHistory"
            );


        const section =
            App.el(
                "printActivitySection"
            );


        if (
            target &&
            section
        ) {

            target.insertAdjacentHTML(
                "beforeend",
                html
            );


            section.hidden =
                false;

            section.style.display =
                "block";
        }
    };


/* =====================================================
   PRINT PROFILE DATA
   ===================================================== */

App.loadPrintProfileData =
    async function (
        ownerType,
        ownerId
    ) {

        return App.authedRpc(
            "admin_print_profile_data",
            {
                p_owner_type:
                    ownerType,

                p_owner_id:
                    Number(
                        ownerId
                    )
            }
        );
    };


/* =====================================================
   PRINT PROFILE RENDERER
   ===================================================== */

App.renderPrintProfile =
    function (
        response
    ) {

        const type =
            App.safe(
                response
                    ?.profile_type
            )
                .toLowerCase();


        const data =
            response?.data ||
            {};


        App.hideAllPrintSections();


        let title =
            "مکمل پروفائل";


        if (
            type === "student"
        ) {

            title =
                "طالبہ کا مکمل تاریخی پروفائل";

        } else if (
            type === "teacher"
        ) {

            title =
                "استاد کا مکمل تاریخی پروفائل";

        } else if (
            type === "admin"
        ) {

            title =
                "ایڈمن کا مکمل تاریخی پروفائل";
        }


        App.setText(
            "printProfileTitle",
            title
        );


        const personal =
            App.renderPrintPersonal(
                type,
                data
            );


        App.renderPrintAccount(
            data
        );


        if (
            type === "student"
        ) {

            App.renderPrintMahrams(
                data
            );


            App.renderPrintAttendance(
                type,
                data
            );


            App.renderPrintResults(
                type,
                data
            );


            App.renderPrintRatings(
                type,
                data
            );


            App.renderPrintFeedback(
                type,
                data
            );


            App.renderPrintFees(
                data
            );


            App.renderPrintHomework(
                data
            );


            App.renderPrintAnnouncements(
                data
            );


            App.renderPrintHostel(
                data
            );


            App.renderPrintPromotions(
                data
            );


        } else if (
            type === "teacher"
        ) {

            App.renderPrintAttendance(
                type,
                data
            );


            App.renderPrintAssignments(
                data
            );


            App.renderPrintResults(
                type,
                data
            );


            App.renderPrintRatings(
                type,
                data
            );


            App.renderPrintFeedback(
                type,
                data
            );


            App.renderPrintSalary(
                data
            );


            App.renderPrintHomework(
                data
            );


            App.renderPrintAnnouncements(
                data
            );
        }


        App.renderPrintDocuments(
            data
        );


        App.renderPrintIssuedDocuments(
            data
        );


        App.renderPrintActivity(
            type,
            data
        );


        if (
            type === "teacher"
        ) {

            App.renderTeacherClassAttendance(
                data
            );
        }


        if (
            type === "admin"
        ) {

            App.renderAdminFinanceHistory(
                data
            );
        }


        App.setText(
            "printGeneratedDate",
            App.dateTime(
                new Date()
            )
        );


        const name =
            personal?.name ||
            personal?.full_name ||
            personal?.teacher_code ||
            personal?.admission_no ||
            "profile";


        document.title =
            App.downloadName(
                type,
                name
            );


        App.hide(
            "printProfileLoading"
        );


        App.hide(
            "printProfileError"
        );


        App.show(
            "printProfileContent",
            "block"
        );
    };


/* =====================================================
   PRINT / PDF PAGE
   ===================================================== */

App.initPrintProfilePage =
    async function () {

        if (
            App.currentFile !==
            "print-profile.html"
        ) {

            return;
        }


        const session =
            await App.requireRole(
                "admin"
            );


        if (!session) {
            return;
        }


        const params =
            new URLSearchParams(
                window.location.search
            );


        const type =
            App.safe(
                params.get(
                    "type"
                )
            )
                .trim()
                .toLowerCase();


        const id =
            Number(
                params.get(
                    "id"
                )
            );


        if (
            ![
                "student",
                "teacher",
                "admin"
            ]
                .includes(type) ||
            !id
        ) {

            App.hide(
                "printProfileLoading"
            );


            App.message(
                "printProfileError",
                "پروفائل کی معلومات درست نہیں ہیں۔",
                "error"
            );


            App.show(
                "printProfileError"
            );


            return;
        }


        const backButton =
            App.el(
                "profileBackButton"
            );


        if (backButton) {

            backButton.addEventListener(
                "click",
                function () {

                    if (
                        window.history.length >
                        1
                    ) {

                        window.history.back();

                    } else {

                        window.location.href =
                            "admin.html";
                    }
                }
            );
        }


        const printButton =
            App.el(
                "profilePrintButton"
            );


        if (printButton) {

            printButton.addEventListener(
                "click",
                function () {

                    window.print();
                }
            );
        }


        const pdfButton =
            App.el(
                "profilePdfButton"
            );


        if (pdfButton) {

            pdfButton.addEventListener(
                "click",
                function () {

                    window.print();
                }
            );
        }


        try {

            const profile =
                await App
                    .loadPrintProfileData(
                        type,
                        id
                    );


            if (
                !profile ||
                !profile.data
            ) {

                throw new Error(
                    "Profile data not found"
                );
            }


            App.renderPrintProfile(
                profile
            );


        } catch (error) {

            console.error(
                "Print profile:",
                error
            );


            App.hide(
                "printProfileLoading"
            );


            App.message(
                "printProfileError",
                "مکمل پروفائل لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
                "error"
            );


            App.show(
                "printProfileError"
            );
        }
    };


/* =====================================================
   GENERIC PRINT PROFILE BUTTONS
   ===================================================== */

App.bindProfilePrintButtons =
    function () {

        document
            .querySelectorAll(
                "[data-print-profile-type][data-print-profile-id]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            App.openPrintProfile(

                                button.dataset
                                    .printProfileType,

                                Number(
                                    button.dataset
                                        .printProfileId
                                )
                            );
                        }
                    );
                }
            );
    };


/* =====================================================
   CLOSE MODALS / OVERLAYS
   ===================================================== */

App.closeStudentDetails =
    function () {

        const modal =
            App.first(
                "studentDetailsModal",
                "studentDetailsOverlay",
                "studentDetailModal"
            );


        if (modal) {

            modal.hidden =
                true;

            modal.style.display =
                "none";
        }


        const generated =
            App.el(
                "generatedStudentDetails"
            );


        if (generated) {
            generated.remove();
        }
    };


App.closeTeacherDetails =
    function () {

        const modal =
            App.first(
                "teacherDetailsModal",
                "teacherDetailsOverlay",
                "teacherDetailModal"
            );


        if (modal) {

            modal.hidden =
                true;

            modal.style.display =
                "none";
        }


        const generated =
            App.el(
                "generatedTeacherDetails"
            );


        if (generated) {
            generated.remove();
        }
    };


window.closeStudentDetails =
    App.closeStudentDetails;


window.closeTeacherDetails =
    App.closeTeacherDetails;


/* =====================================================
   GLOBAL ESCAPE KEY
   ===================================================== */

App.bindEscapeKey =
    function () {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }


                App.closeStudentDetails();

                App.closeTeacherDetails();


                document
                    .querySelectorAll(
                        ".modal.open, .modal.active, .overlay.open, .overlay.active"
                    )
                    .forEach(
                        node => {

                            node.classList.remove(
                                "open",
                                "active"
                            );


                            node.style.display =
                                "none";
                        }
                    );
            }
        );
    };


/* =====================================================
   ONLINE / OFFLINE
   ===================================================== */

App.bindConnectionEvents =
    function () {

        const show =
            function (
                text,
                type
            ) {

                const node =
                    document
                        .querySelector(
                            "[data-connection-message]"
                        );


                if (!node) {
                    return;
                }


                node.textContent =
                    text;


                node.className =
                    "connection-message " +
                    type;
            };


        window.addEventListener(
            "online",
            function () {

                show(
                    "انٹرنیٹ کنکشن بحال ہوگیا۔",
                    "success"
                );
            }
        );


        window.addEventListener(
            "offline",
            function () {

                show(
                    "انٹرنیٹ کنکشن منقطع ہے۔",
                    "error"
                );
            }
        );
    };


/* =====================================================
   GLOBAL ERROR SAFETY
   ===================================================== */

App.bindGlobalErrors =
    function () {

        window.addEventListener(
            "unhandledrejection",
            function (event) {

                console.error(
                    "Unhandled promise rejection:",
                    event.reason
                );
            }
        );


        window.addEventListener(
            "error",
            function (event) {

                console.error(
                    "Global error:",
                    event.error ||
                    event.message
                );
            }
        );
    };


/* =====================================================
   LEGACY GLOBAL COMPATIBILITY
   ===================================================== */

window.logout =
    App.logout;


window.logoutUser =
    App.logout;


window.formatCNIC =
    App.formatCNIC;


window.normalizePhone =
    App.normalizePhone;


window.isAuthenticated =
    App.isLoggedIn;


window.getCurrentRole =
    App.getRole;


window.getUserRole =
    App.getRole;


window.isAdmin =
    function () {

        return (
            App.isLoggedIn() &&
            App.getRole() ===
            "admin"
        );
    };


window.requireAdmin =
    function () {

        if (
            !App.isLoggedIn() ||
            App.getRole() !==
            "admin"
        ) {

            window.location.href =
                "index.html";

            return false;
        }


        return true;
    };


/* =====================================================
   PAGE INITIALIZER
   ===================================================== */

App.initializeCurrentPage =
    async function () {

        const allowed =
            await App
                .protectCurrentPage();


        if (!allowed) {
            return;
        }


        App.bindCommonUI();

        App.bindProfilePrintButtons();


        if (
            App.isLoggedIn()
        ) {

            App.startInactivityProtection();
        }


        switch (
            App.currentFile
        ) {

            case "":
            case "index.html":

                break;


            case "login.html":

                App.initLogin();

                break;


            case "admin.html":

                await App
                    .initAdminDashboard();

                break;


            case "students.html":

                await App
                    .initStudentsPage();

                break;


            case "teachers.html":

                await App
                    .initTeachersPage();

                break;


            case "teacher.html":

                await App
                    .initTeacherDashboard();

                break;


            case "student.html":

                await App
                    .initStudentDashboard();

                break;


            case "attendance.html":

                await App
                    .initTeacherAttendance();

                break;


            case "my-attendance.html":

                await App
                    .initMyAttendance();

                break;


            case "my-marks.html":

                await App
                    .initMyMarks();

                break;


            case "homework.html":

                await App
                    .loadStudentHomework();

                break;


            case "announcements.html":

                await App
                    .loadStudentAnnouncements();

                break;


            case "admin-marks.html":

                App.initAdminMarks();

                await App
                    .loadAdminMarks();

                break;


            case "admin-feedback.html":

                await App
                    .loadAdminFeedback();

                break;


            case "admin-finance.html":

                App.initFinanceForms();

                await App
                    .loadFinance();

                break;


            case "admin-hostel.html":

                await App
                    .initHostelPage();

                break;


            case "admin-promotions.html":

                App.initPromotionPage();

                break;


            case "admin-id-cards.html":

                App.initIdCardPage();

                break;


            case "admin-settings.html":
            case "teacher-settings.html":
            case "settings.html":

                App.initSettings();

                break;


            case "print-profile.html":

                await App
                    .initPrintProfilePage();

                break;


            default:

                break;
        }
    };


/* =====================================================
   BOOT
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            App.initSupabase();


            App.bindEscapeKey();

            App.bindConnectionEvents();

            App.bindGlobalErrors();


            await App
                .initializeCurrentPage();


        } catch (error) {

            console.error(
                "Application startup error:",
                error
            );


            const message =
                document
                    .createElement(
                        "div"
                    );


            message.className =
                "system-message error";


            message.textContent =
                "نظام شروع نہیں ہو سکا۔ صفحہ دوبارہ کھولیں۔";


            document.body.prepend(
                message
            );
        }
    }
);


/* =====================================================
   END
   ===================================================== */

})();
