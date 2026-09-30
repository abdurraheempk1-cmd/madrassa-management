/* =========================================================
   مدرسہ شہناز اختر للبنات
   COMPLETE FRONTEND SCRIPT
   PART 1 / 4
   CORE + HIGH SECURITY + 5 MIN AUTO LOGOUT
   LOGIN + SIDEBAR + ADMIN DASHBOARD
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

    App.MAX_MAHRAMS = 5;

    App.CLASSES = [
        "قاعدہ",
        "ناظرہ",
        "ترجمہ",
        "حفظ",
        "تجوید",
        "اعدادیہ",
        "متوسطہ",
        "ثانویہ خاصہ سال اول",
        "ثانویہ خاصہ سال دوم",
        "عالیہ سال اول",
        "عالیہ سال دوم",
        "عالمیہ سال اول",
        "عالمیہ سال دوم / دورۂ حدیث"
    ];

    /* بنیادی جماعتوں میں نیا داخلہ ممکن ہے؛ اعلیٰ جماعتوں کے لیے منتقلی ضروری ہے۔ */
    App.NEW_ADMISSION_CLASSES = [
        "قاعدہ",
        "ناظرہ",
        "ترجمہ",
        "حفظ",
        "تجوید",
        "اعدادیہ",
        "متوسطہ",
        "ثانویہ خاصہ سال اول"
    ];

    /*
       EXACT INACTIVITY TIMEOUT
       5 minutes
    */

    App.INACTIVITY_LIMIT =
        5 * 60 * 1000;

    /*
       Do not call server on every click.
    */

    App.SERVER_ACTIVITY_INTERVAL =
        60 * 1000;

    App.PUBLIC_ENTRY_KEY =
        "madrassa_public_entry";

    App.PUBLIC_ENTRY_TTL =
        60 * 60 * 1000;

    App.client = null;

    App.session = null;

    App.inactivityTimer = null;

    App.lastServerActivity = 0;

    App.securityEventsBound = false;

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

    App.safe =
        function (value) {

            if (
                value === null ||
                value === undefined
            ) {
                return "";
            }

            return String(value);
        };


    App.escape =
        function (value) {

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


    App.el =
        function (id) {

            return document.getElementById(
                id
            );
        };


    App.first =
        function (...ids) {

            for (const id of ids) {

                const node =
                    App.el(id);

                if (node) {
                    return node;
                }
            }

            return null;
        };


    App.val =
        function (id) {

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
                    : String(value);
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

            if (!node) {
                return;
            }

            node.hidden = false;

            node.style.display =
                display;
        };


    App.hide =
        function (nodeOrId) {

            const node =
                typeof nodeOrId ===
                "string"
                    ? App.el(nodeOrId)
                    : nodeOrId;

            if (!node) {
                return;
            }

            node.hidden = true;

            node.style.display =
                "none";
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

            node.hidden = false;
        };


    App.normalizeDigits =
        function (value) {

            return App.safe(value)

                .replace(
                    /[٠-٩]/g,
                    digit =>
                        String(
                            "٠١٢٣٤٥٦٧٨٩"
                                .indexOf(
                                    digit
                                )
                        )
                )

                .replace(
                    /[۰-۹]/g,
                    digit =>
                        String(
                            "۰۱۲۳۴۵۶۷۸۹"
                                .indexOf(
                                    digit
                                )
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

            let digits = App.normalizeDigits(value);

            /*
               Pakistan mobile normalization:
               3412345678    -> 03412345678
               923412345678  -> 03412345678
               00923412345678 -> 03412345678
               This is especially important for Excel, which often
               removes the leading zero from numeric phone cells.
            */
            if (digits.length === 14 && digits.startsWith("0092")) {
                digits = "0" + digits.slice(4);
            } else if (digits.length === 12 && digits.startsWith("92")) {
                digits = "0" + digits.slice(2);
            } else if (digits.length === 10 && digits.startsWith("3")) {
                digits = "0" + digits;
            }

            return digits.slice(0, 11);
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
                        maximumFractionDigits:
                            2
                    }
                ) +
                " " +
                currency
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
            ).format(date);
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
            ).format(date);
        };


    App.statusUrdu =
        function (value) {

            const key =
                App.safe(value)
                    .trim()
                    .toLowerCase();

            const statuses = {

                active:
                    "فعال",

                inactive:
                    "غیر فعال",

                pending:
                    "زیرِ انتظار",

                approved:
                    "منظور شدہ",

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

                passed:
                    "کامیاب",

                failed:
                    "ناکام",

                graduated:
                    "فارغ التحصیل",

                transferred:
                    "منتقل"
            };

            return (
                statuses[key] ||
                App.safe(value) ||
                "—"
            );
        };


    App.empty =
        function (
            text =
                "کوئی ریکارڈ موجود نہیں۔"
        ) {

            return `
                <div class="print-empty">
                    ${App.escape(text)}
                </div>
            `;
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

            return `
                <div class="table-responsive">

                    <table>

                        <thead>
                            <tr>
                                ${
                                    headers
                                        .map(
                                            heading => `
                                                <th>
                                                    ${App.escape(
                                                        heading
                                                    )}
                                                </th>
                                            `
                                        )
                                        .join("")
                                }
                            </tr>
                        </thead>

                        <tbody>

                            ${
                                rows
                                    .map(
                                        row => `
                                            <tr>
                                                ${
                                                    row
                                                        .map(
                                                            cell => `
                                                                <td>
                                                                    ${
                                                                        cell === null ||
                                                                        cell === undefined ||
                                                                        cell === ""
                                                                            ? "—"
                                                                            : cell
                                                                    }
                                                                </td>
                                                            `
                                                        )
                                                        .join("")
                                                }
                                            </tr>
                                        `
                                    )
                                    .join("")
                            }

                        </tbody>

                    </table>

                </div>
            `;
        };


    App.infoGrid =
        function (items) {

            if (
                !Array.isArray(items) ||
                !items.length
            ) {
                return App.empty();
            }

            return `
                <div class="print-info-grid">

                    ${
                        items
                            .filter(
                                item =>
                                    item &&
                                    item[0]
                            )
                            .map(
                                ([label, value]) => `
                                    <div class="print-info-item">

                                        <span class="print-info-label">
                                            ${App.escape(
                                                label
                                            )}
                                        </span>

                                        <span class="print-info-value">
                                            ${
                                                value === null ||
                                                value === undefined ||
                                                value === ""
                                                    ? "—"
                                                    : App.escape(
                                                        value
                                                    )
                                            }
                                        </span>

                                    </div>
                                `
                            )
                            .join("")
                    }

                </div>
            `;
        };


    App.go =
        function (url) {

            if (!url) {
                return;
            }

            window.location.href =
                url;
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
                window.supabase.createClient(

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
                await App.client.rpc(
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


    /* =====================================================
       DIRECT READ HELPERS

       These remain only for pages whose secure RPC
       has not yet been created.

       Sensitive WRITE actions will use RPC.
       ===================================================== */

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
                        Number(id)
                    )
                    .maybeSingle();

            if (error) {
                throw error;
            }

            return data || null;
        };


    /* =====================================================
       SESSION GETTERS
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
                    localStorage.getItem(
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
                    localStorage.getItem(
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
                    localStorage.getItem(
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
                ) ===
                "true" &&
                !!App.getToken()
            );
        };


    App.roleHome =
        function (role) {

            role =
                App.safe(role)
                    .trim()
                    .toLowerCase();

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


    /* =====================================================
       SESSION CLEAR
       ===================================================== */

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
                    key => {

                        localStorage.removeItem(
                            key
                        );
                    }
                );

            App.session = null;

            App.lastServerActivity = 0;

            if (
                App.inactivityTimer
            ) {

                clearTimeout(
                    App.inactivityTimer
                );

                App.inactivityTimer =
                    null;
            }
        };


    /* =====================================================
       SAVE LOGIN SESSION
       ===================================================== */

    App.saveSession =
        function (
            session,
            username
        ) {

            App.clearSession();

            const now =
                Date.now();

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
                    .trim()
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
                String(now)
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

            } else {

                localStorage.removeItem(
                    "studentId"
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

            } else {

                localStorage.removeItem(
                    "teacherId"
                );
            }

            sessionStorage.removeItem(
                App.PUBLIC_ENTRY_KEY
            );

            App.session =
                session;

            App.lastServerActivity =
                now;
        };


    /* =====================================================
       LOCAL INACTIVITY CHECK
       BEFORE SERVER VALIDATION

       Prevents an old session being revived.
       ===================================================== */

    App.localSessionExpired =
        function () {

            const last =
                Number(
                    localStorage.getItem(
                        "lastActivity"
                    ) || 0
                );

            if (!last) {
                return false;
            }

            return (
                Date.now() -
                last >=
                App.INACTIVITY_LIMIT
            );
        };


    /* =====================================================
       VALIDATE SERVER SESSION
       ===================================================== */

    App.validateSession =
        async function (
            redirectOnFailure = true
        ) {

            const token =
                App.getToken();

            if (
                !token ||
                App.localSessionExpired()
            ) {

                App.clearSession();

                if (
                    redirectOnFailure
                ) {

                    window.location.replace(
                        "index.html"
                    );
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
                    data.valid === false ||
                    !data.role ||
                    !data.account_id
                ) {

                    throw new Error(
                        "Invalid or expired session"
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
                        .trim()
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

                } else {

                    localStorage.removeItem(
                        "studentId"
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

                } else {

                    localStorage.removeItem(
                        "teacherId"
                    );
                }

                App.lastServerActivity =
                    Date.now();

                return data;

            } catch (error) {

                console.error(
                    "Session validation:",
                    error
                );

                App.clearSession();

                if (
                    redirectOnFailure
                ) {

                    window.location.replace(
                        "index.html"
                    );
                }

                return null;
            }
        };


    /* =====================================================
       LOGOUT
       ===================================================== */

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
                    "Logout RPC:",
                    error
                );
            }

            App.clearSession();

            sessionStorage.removeItem(
                App.PUBLIC_ENTRY_KEY
            );

            window.location.replace(
                "index.html"
            );
        };


    /* =====================================================
       REQUIRE ROLE
       ===================================================== */

    App.requireRole =
        async function (roles) {

            const session =
                await App.validateSession(
                    true
                );

            if (!session) {
                return null;
            }

            const allowed =
                (
                    Array.isArray(
                        roles
                    )
                        ? roles
                        : [roles]
                )
                    .map(
                        role =>
                            App.safe(role)
                                .trim()
                                .toLowerCase()
                    );

            const role =
                App.safe(
                    session.role
                )
                    .trim()
                    .toLowerCase();

            if (
                !allowed.includes(
                    role
                )
            ) {

                window.location.replace(
                    App.roleHome(
                        role
                    )
                );

                return null;
            }

            return session;
        };


    /* =====================================================
       EXACT AUTO TIMEOUT
       ===================================================== */

    App.scheduleTimeout =
        function () {

            if (
                App.inactivityTimer
            ) {

                clearTimeout(
                    App.inactivityTimer
                );
            }

            if (
                !App.isLoggedIn()
            ) {
                return;
            }

            const last =
                Number(
                    localStorage.getItem(
                        "lastActivity"
                    ) || 0
                );

            if (!last) {

                localStorage.setItem(
                    "lastActivity",
                    String(
                        Date.now()
                    )
                );

                App.scheduleTimeout();

                return;
            }

            const remaining =
                App.INACTIVITY_LIMIT -
                (
                    Date.now() -
                    last
                );

            if (
                remaining <= 0
            ) {

                App.logout();

                return;
            }

            App.inactivityTimer =
                window.setTimeout(
                    App.checkTimeout,
                    remaining + 100
                );
        };


    App.checkTimeout =
        async function () {

            if (
                !App.isLoggedIn()
            ) {
                return;
            }

            const last =
                Number(
                    localStorage.getItem(
                        "lastActivity"
                    ) || 0
                );

            if (
                last &&
                (
                    Date.now() -
                    last
                ) >=
                App.INACTIVITY_LIMIT
            ) {

                await App.logout();

                return;
            }

            App.scheduleTimeout();
        };


    /* =====================================================
       REAL USER ACTIVITY
       ===================================================== */

    App.recordActivity =
        function () {

            if (
                !App.isLoggedIn()
            ) {
                return;
            }

            const now =
                Date.now();

            const previous =
                Number(
                    localStorage.getItem(
                        "lastActivity"
                    ) || 0
                );

            /*
               Do not revive expired session
               by clicking after timeout.
            */

            if (
                previous &&
                (
                    now -
                    previous
                ) >=
                App.INACTIVITY_LIMIT
            ) {

                App.logout();

                return;
            }

            localStorage.setItem(
                "lastActivity",
                String(now)
            );

            App.scheduleTimeout();

            /*
               Server validation only after
               actual activity and maximum once/minute.
            */

            if (
                (
                    now -
                    App.lastServerActivity
                ) >=
                App.SERVER_ACTIVITY_INTERVAL
            ) {

                App.lastServerActivity =
                    now;

                App.validateSession(
                    false
                )
                    .then(
                        session => {

                            if (!session) {

                                window.location.replace(
                                    "index.html"
                                );
                            }
                        }
                    )

                    .catch(
                        () => {

                            App.clearSession();

                            window.location.replace(
                                "index.html"
                            );
                        }
                    );
            }
        };


    App.startInactivityProtection =
        function () {

            if (
                !App.isLoggedIn()
            ) {
                return;
            }

            if (
                App.localSessionExpired()
            ) {

                App.logout();

                return;
            }

            if (
                !localStorage.getItem(
                    "lastActivity"
                )
            ) {

                localStorage.setItem(
                    "lastActivity",
                    String(
                        Date.now()
                    )
                );
            }

            if (
                !App.securityEventsBound
            ) {

                [
                    "pointerdown",
                    "touchstart",
                    "keydown",
                    "input",
                    "change",
                    "scroll"
                ]
                    .forEach(
                        eventName => {

                            window.addEventListener(
                                eventName,
                                App.recordActivity,
                                {
                                    passive: true
                                }
                            );
                        }
                    );

                document.addEventListener(
                    "visibilitychange",
                    function () {

                        if (
                            document.visibilityState ===
                            "visible"
                        ) {

                            App.checkTimeout();
                        }
                    }
                );

                window.addEventListener(
                    "focus",
                    App.checkTimeout
                );

                window.addEventListener(
                    "storage",
                    function (event) {

                        if (
                            event.key ===
                            "lastActivity"
                        ) {

                            App.scheduleTimeout();
                        }

                        if (
                            event.key ===
                                "sessionToken" &&
                            !event.newValue
                        ) {

                            window.location.replace(
                                "index.html"
                            );
                        }
                    }
                );

                App.securityEventsBound =
                    true;
            }

            App.scheduleTimeout();
        };


    /* =====================================================
       PUBLIC ENTRY SECURITY

       index.html = only direct public page.

       Login / application pages must first
       be opened from introduction page.
       ===================================================== */

    App.publicPages =
        new Set([
            "",
            "index.html"
        ]);


    App.entryPages =
        new Set([
            "login.html",
            "student-apply.html",
            "teacher-apply.html"
        ]);


    App.adminPages =
        new Set([

            "admin.html",

            "students.html",

            "teachers.html",

            "admin-attendance.html",

            "admin-marks.html",

            "admin-homework.html",

            "admin-announcements.html",

            "admin-feedback.html",

            "admin-finance.html",

            "admin-hostel.html",

            "admin-promotions.html",

            "admin-id-cards.html",

            "admin-reports.html",

            "admin-accounts.html",

            "approvals.html",

            "admin-settings.html",

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


    App.entryIdentity =
        function (url) {

            const target =
                new URL(
                    url,
                    window.location.href
                );

            const page =
                target.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();

            if (
                page ===
                "login.html"
            ) {

                const role =
                    App.safe(
                        target.searchParams.get(
                            "role"
                        )
                    )
                        .trim()
                        .toLowerCase();

                return (
                    page +
                    "?role=" +
                    role
                );
            }

            return page;
        };


    App.allowEntry =
        function (url) {

            const identity =
                App.entryIdentity(
                    url
                );

            const page =
                identity
                    .split("?")[0];

            if (
                !App.entryPages.has(
                    page
                )
            ) {
                return false;
            }

            sessionStorage.setItem(

                App.PUBLIC_ENTRY_KEY,

                JSON.stringify({

                    identity:
                        identity,

                    expires:
                        Date.now() +
                        App.PUBLIC_ENTRY_TTL
                })
            );

            return true;
        };


    App.hasEntryPermission =
        function () {

            try {

                const raw =
                    sessionStorage.getItem(
                        App.PUBLIC_ENTRY_KEY
                    );

                if (!raw) {
                    return false;
                }

                const permission =
                    JSON.parse(raw);

                if (
                    !permission ||
                    !permission.identity ||
                    !permission.expires
                ) {

                    return false;
                }

                if (
                    Date.now() >
                    Number(
                        permission.expires
                    )
                ) {

                    sessionStorage.removeItem(
                        App.PUBLIC_ENTRY_KEY
                    );

                    return false;
                }

                return (
                    permission.identity ===
                    App.entryIdentity(
                        window.location.href
                    )
                );

            } catch (_) {

                sessionStorage.removeItem(
                    App.PUBLIC_ENTRY_KEY
                );

                return false;
            }
        };


    App.openPublicEntry =
        function (url) {

            if (
                !App.allowEntry(
                    url
                )
            ) {
                return;
            }

            window.location.href =
                url;
        };


    /* =====================================================
       ROUTE PROTECTION
       ===================================================== */

    App.protectCurrentPage =
        async function () {

            const page =
                App.currentFile;

            /*
               Introduction only.
            */

            if (
                App.publicPages.has(
                    page
                )
            ) {

                return true;
            }

            /*
               Login / application.
            */

            if (
                App.entryPages.has(
                    page
                )
            ) {

                if (
                    App.isLoggedIn()
                ) {

                    if (
                        App.localSessionExpired()
                    ) {

                        App.clearSession();

                    } else {

                        const session =
                            await App.validateSession(
                                false
                            );

                        if (session) {

                            window.location.replace(
                                App.roleHome(
                                    session.role
                                )
                            );

                            return false;
                        }
                    }
                }

                /*
                   Login and application pages are public entry
                   points. Do not require a sessionStorage flag:
                   the introduction page has its own inline script
                   and therefore cannot create that flag reliably.
                   Authentication is still enforced before any
                   protected admin, teacher, or student page opens.
                */
                return true;
            }

            /*
               Protected Admin pages.
            */

            if (
                App.adminPages.has(
                    page
                )
            ) {

                return !!(
                    await App.requireRole(
                        "admin"
                    )
                );
            }

            /*
               Protected Teacher pages.
            */

            if (
                App.teacherPages.has(
                    page
                )
            ) {

                return !!(
                    await App.requireRole(
                        "teacher"
                    )
                );
            }

            /*
               Protected Student pages.
            */

            if (
                App.studentPages.has(
                    page
                )
            ) {

                return !!(
                    await App.requireRole(
                        "student"
                    )
                );
            }

            /*
               Unknown HTML page.
            */

            if (
                page.endsWith(
                    ".html"
                )
            ) {

                window.location.replace(
                    "index.html"
                );

                return false;
            }

            return true;
        };


    /* =====================================================
       INTRODUCTION PAGE ROUTES
       ===================================================== */

    App.bindIntroductionRoutes =
        function () {

            if (
                App.currentFile !== "" &&
                App.currentFile !==
                "index.html"
            ) {
                return;
            }

            /*
               Existing <a> links.
            */

            document.addEventListener(
                "click",
                function (event) {

                    const link =
                        event.target.closest(
                            "a[href]"
                        );

                    if (!link) {
                        return;
                    }

                    const href =
                        App.safe(
                            link.getAttribute(
                                "href"
                            )
                        ).trim();

                    if (!href) {
                        return;
                    }

                    let page = "";

                    try {

                        page =
                            new URL(
                                href,
                                window.location.href
                            )
                                .pathname
                                .split("/")
                                .pop()
                                .toLowerCase();

                    } catch (_) {
                        return;
                    }

                    if (
                        App.entryPages.has(
                            page
                        )
                    ) {

                        App.allowEntry(
                            href
                        );
                    }
                },
                true
            );
        };


    /* =====================================================
       SIDEBAR
       ===================================================== */

    App.bindSidebar =
        function (
            buttonId,
            sidebarId,
            overlayId
        ) {

            const button =
                App.el(buttonId);

            const sidebar =
                App.el(sidebarId);

            const overlay =
                App.el(overlayId);

            if (
                !button ||
                !sidebar
            ) {
                return;
            }

            if (
                button.dataset
                    .sidebarBound ===
                "true"
            ) {
                return;
            }

            button.dataset.sidebarBound =
                "true";

            const open =
                function () {

                    sidebar.classList.add(
                        "open",
                        "active"
                    );

                    if (overlay) {

                        overlay.classList.add(
                            "open",
                            "active"
                        );
                    }

                    document.body.classList.add(
                        "sidebar-open"
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );
                };


            const close =
                function () {

                    sidebar.classList.remove(
                        "open",
                        "active"
                    );

                    if (overlay) {

                        overlay.classList.remove(
                            "open",
                            "active"
                        );
                    }

                    document.body.classList.remove(
                        "sidebar-open"
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                };


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    if (
                        sidebar.classList.contains(
                            "open"
                        ) ||
                        sidebar.classList.contains(
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

                overlay.addEventListener(
                    "click",
                    close
                );
            }


            sidebar
                .querySelectorAll(
                    "a"
                )
                .forEach(
                    link => {

                        link.addEventListener(
                            "click",
                            close
                        );
                    }
                );


            document.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        close();
                    }
                }
            );
        };


    /* =====================================================
       ACTIVE SIDEBAR LINK
       ===================================================== */

    App.updateActiveSidebar =
        function () {

            const current =
                App.currentFile ||
                "index.html";

            const studentPortalPages =
                new Set([
                    "student.html",
                    "my-attendance.html",
                    "my-marks.html",
                    "homework.html",
                    "announcements.html",
                    "settings.html"
                ]);

            document
                .querySelectorAll(
                    ".portal-nav-link"
                )
                .forEach(
                    link => {

                        link.classList.remove(
                            "active"
                        );

                        /* Student sidebar keeps one consistent design on every page. */
                        if (studentPortalPages.has(current)) {
                            return;
                        }

                        const href =
                            App.safe(
                                link.getAttribute(
                                    "href"
                                )
                            )
                                .split("?")[0]
                                .split("#")[0]
                                .split("/")
                                .pop()
                                .toLowerCase();

                        if (
                            href === current
                        ) {

                            link.classList.add(
                                "active"
                            );
                        }
                    }
                );
        };


    /* =====================================================
       LOGOUT BUTTONS
       ===================================================== */

    App.bindLogoutButtons =
        function () {

            [
                "adminLogoutButton",
                "teacherLogoutButton",
                "studentLogoutButton",
                "settingsLogoutButton",
                "settingsAdminLogoutButton",
                "settingsTeacherLogoutButton",
                "settingsStudentLogoutButton"
            ]
                .forEach(
                    id => {

                        const button =
                            App.el(id);

                        if (!button) {
                            return;
                        }

                        if (
                            button.dataset
                                .logoutBound ===
                            "true"
                        ) {
                            return;
                        }

                        button.dataset.logoutBound =
                            "true";

                        button.addEventListener(
                            "click",
                            async function (
                                event
                            ) {

                                event.preventDefault();

                                button.disabled =
                                    true;

                                await App.logout();
                            }
                        );
                    }
                );
        };


    /* =====================================================
       COMMON INPUT FORMAT
       ===================================================== */

    App.bindInputFormatting =
        function () {

            document
                .querySelectorAll(
                    "input[data-cnic], input.cnic-input"
                )
                .forEach(
                    input => {

                        if (
                            input.dataset
                                .formatBound ===
                            "true"
                        ) {
                            return;
                        }

                        input.dataset.formatBound =
                            "true";

                        input.addEventListener(
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

                        if (
                            input.dataset
                                .formatBound ===
                            "true"
                        ) {
                            return;
                        }

                        input.dataset.formatBound =
                            "true";

                        input.addEventListener(
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
       COMMON UI
       ===================================================== */

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

            App.updateActiveSidebar();

            App.bindLogoutButtons();

            App.bindInputFormatting();


            /*
               Introduction page buttons.
            */

            const routes = {

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
                routes
            )
                .forEach(
                    ([id, url]) => {

                        const button =
                            App.el(id);

                        if (!button) {
                            return;
                        }

                        if (
                            button.dataset
                                .routeBound ===
                            "true"
                        ) {
                            return;
                        }

                        button.dataset.routeBound =
                            "true";

                        button.addEventListener(
                            "click",
                            function (event) {

                                event.preventDefault();

                                App.openPublicEntry(
                                    url
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

            if (
                App.currentFile !==
                "login.html"
            ) {
                return;
            }

            const form =
                App.el(
                    "loginForm"
                );

            if (!form) {
                return;
            }

            if (
                form.dataset
                    .loginBound ===
                "true"
            ) {
                return;
            }

            form.dataset.loginBound =
                "true";


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
                    .trim()
                    .toLowerCase();


            const roles = {

                admin:
                    "ایڈمن",

                teacher:
                    "استاد",

                student:
                    "طالبہ"
            };


            if (
                !Object.prototype
                    .hasOwnProperty
                    .call(
                        roles,
                        role
                    )
            ) {

                window.location.replace(
                    "index.html"
                );

                return;
            }


            if (roleInput) {

                roleInput.value =
                    role;
            }


            if (roleText) {

                roleText.textContent =
                    roles[role];
            }


            if (
                toggleButton &&
                passwordInput
            ) {

                toggleButton.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

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

                backButton.addEventListener(
                    "click",
                    function () {

                        window.location.replace(
                            "index.html"
                        );
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


                    const submitButton =
                        form.querySelector(
                            'button[type="submit"]'
                        );


                    if (submitButton) {

                        submitButton.disabled =
                            true;
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
                            session.valid === false ||
                            !session.role ||
                            !session.account_id
                        ) {

                            throw new Error(
                                "Invalid session"
                            );
                        }


                        if (
                            App.safe(
                                session.role
                            )
                                .toLowerCase() !==
                            role
                        ) {

                            throw new Error(
                                "Role mismatch"
                            );
                        }


                        session.token =
                            token;


                        App.saveSession(
                            session,
                            username
                        );


                        window.location.replace(
                            App.roleHome(
                                session.role
                            )
                        );


                    } catch (error) {

                        console.error(
                            "Login:",
                            error
                        );


                        App.message(
                            messageBox,
                            "صارف نام، پاس ورڈ یا اکاؤنٹ کی حالت درست نہیں ہے۔",
                            "error"
                        );


                        if (submitButton) {

                            submitButton.disabled =
                                false;
                        }
                    }
                }
            );
        };




    /* =====================================================
       ACCOUNT RECOVERY
       Student / Teacher: reference + CNIC + phone verification.
       Admin: configured recovery code verification.
       Student/Teacher require Admin review; Admin recovery code completes self-recovery.
       ===================================================== */

    App.recoveryRoleNames = {
        admin: "ایڈمن",
        teacher: "استاد",
        student: "طالبہ"
    };

    App.setRecoveryMessage = function (id, text, type) {
        const node = App.el(id);
        if (!node) return;
        node.textContent = text || "";
        node.className = "recovery-message" + (type ? " " + type : "");
    };

    App.openAccountRecovery = function (requestType) {
        const modal = App.el("accountRecoveryModal");
        if (!modal) return;

        const role = App.safe(new URLSearchParams(window.location.search).get("role")).trim().toLowerCase();
        if (!["admin", "teacher", "student"].includes(role)) return;

        App.el("recoveryRole").value = role;
        App.el("recoveryType").value = requestType;

        const roleName = App.recoveryRoleNames[role] || role;
        App.setText("accountRecoveryTitle", requestType === "username" ? "صارف نام کی بحالی" : "پاس ورڈ کی بحالی");
        App.setText(
            "accountRecoverySubtitle",
            role === "admin"
                ? "محفوظ بحالی کوڈ سے تصدیق کے بعد ایڈمن بحالی فوراً مکمل ہوگی۔"
                : "تصدیق کے بعد درخواست ایڈمن منظوری کے لیے جائے گی۔"
        );
        App.setText("accountRecoveryRoleNote", "اکاؤنٹ: " + roleName);

        const common = App.el("studentTeacherRecoveryFields");
        const admin = App.el("adminRecoveryFields");
        if (common) common.hidden = role === "admin";
        if (admin) admin.hidden = role !== "admin";

        const referenceLabel = App.el("recoveryReferenceLabel");
        if (referenceLabel) {
            referenceLabel.textContent = role === "student" ? "داخلہ / وفاق نمبر" : "استاد کوڈ";
        }

        const passFields = App.el("recoveryNewPasswordFields");
        if (passFields) passFields.hidden = requestType !== "password";

        const form = App.el("accountRecoveryForm");
        if (form) form.reset();
        App.el("recoveryRole").value = role;
        App.el("recoveryType").value = requestType;
        if (common) common.hidden = role === "admin";
        if (admin) admin.hidden = role !== "admin";
        if (passFields) passFields.hidden = requestType !== "password";

        const statusForm = App.el("recoveryStatusForm");
        if (statusForm) statusForm.hidden = true;
        App.setRecoveryMessage("recoveryRequestMessage", "", "");
        App.setRecoveryMessage("recoveryStatusMessage", "", "");

        modal.hidden = false;
        document.body.style.overflow = "hidden";
    };

    App.closeAccountRecovery = function () {
        const modal = App.el("accountRecoveryModal");
        if (modal) modal.hidden = true;
        document.body.style.overflow = "";
    };

    App.initAccountRecovery = function () {
        if (App.currentFile !== "login.html") return;

        const forgotUsername = App.el("forgotUsernameButton");
        const forgotPassword = App.el("forgotPasswordButton");
        const close = App.el("closeAccountRecovery");
        const backdrop = App.el("accountRecoveryBackdrop");
        const showStatus = App.el("showRecoveryStatusForm");
        const requestForm = App.el("accountRecoveryForm");
        const statusForm = App.el("recoveryStatusForm");

        if (forgotUsername && forgotUsername.dataset.bound !== "1") {
            forgotUsername.dataset.bound = "1";
            forgotUsername.addEventListener("click", () => App.openAccountRecovery("username"));
        }
        if (forgotPassword && forgotPassword.dataset.bound !== "1") {
            forgotPassword.dataset.bound = "1";
            forgotPassword.addEventListener("click", () => App.openAccountRecovery("password"));
        }
        [close, backdrop].forEach(node => {
            if (node && node.dataset.bound !== "1") {
                node.dataset.bound = "1";
                node.addEventListener("click", App.closeAccountRecovery);
            }
        });
        if (showStatus && showStatus.dataset.bound !== "1") {
            showStatus.dataset.bound = "1";
            showStatus.addEventListener("click", () => {
                if (statusForm) statusForm.hidden = !statusForm.hidden;
            });
        }

        if (requestForm && requestForm.dataset.bound !== "1") {
            requestForm.dataset.bound = "1";
            requestForm.addEventListener("submit", async function (event) {
                event.preventDefault();

                const role = App.val("recoveryRole");
                const type = App.val("recoveryType");
                const pin = App.val("recoveryPin");
                const newPassword = App.val("recoveryNewPassword");
                const confirmPassword = App.val("recoveryConfirmPassword");

                if (pin.length < 4) {
                    App.setRecoveryMessage("recoveryRequestMessage", "درخواست پن کم از کم 4 ہندسوں/حروف کا ہونا چاہیے۔", "error");
                    return;
                }
                if (type === "password") {
                    if (newPassword.length < 8) {
                        App.setRecoveryMessage("recoveryRequestMessage", "نیا پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔", "error");
                        return;
                    }
                    if (newPassword !== confirmPassword) {
                        App.setRecoveryMessage("recoveryRequestMessage", "دونوں نئے پاس ورڈ ایک جیسے نہیں ہیں۔", "error");
                        return;
                    }
                }

                const submit = App.el("submitRecoveryRequest");
                if (submit) submit.disabled = true;
                try {
                    const result = await App.rpc("request_account_recovery", {
                        p_role: role,
                        p_request_type: type,
                        p_reference: role === "admin" ? null : App.val("recoveryReference"),
                        p_cnic: role === "admin" ? null : App.normalizeDigits(App.val("recoveryCNIC")),
                        p_phone: role === "admin" ? null : App.normalizePhone(App.val("recoveryPhone")),
                        p_admin_recovery_code: role === "admin" ? App.val("recoveryAdminCode") : null,
                        p_new_password: type === "password" ? newPassword : null,
                        p_recovery_pin: pin
                    });
                    const number = App.safe(result?.request_no || result);
                    const resultStatus = App.safe(result?.status || "pending").toLowerCase();
                    let recoveryText;
                    if (role === "admin" && resultStatus === "approved") {
                        if (type === "username" && result?.username) {
                            recoveryText = "تصدیق کامیاب ہوگئی۔\nآپ کا صارف نام: " + result.username +
                                "\nدرخواست نمبر: " + number + "\nPIN محفوظ رکھیں۔";
                        } else {
                            recoveryText = "تصدیق کامیاب ہوگئی۔ نیا پاس ورڈ فعال کر دیا گیا ہے۔\nدرخواست نمبر: " +
                                number + "\nاب نئے پاس ورڈ سے لاگ اِن کریں۔";
                        }
                    } else {
                        recoveryText = "درخواست کامیابی سے جمع ہوگئی۔\nدرخواست نمبر: " + number +
                            "\nیہ نمبر اور PIN محفوظ رکھیں۔ Admin منظوری کے بعد حالت دوبارہ چیک کریں۔";
                    }
                    App.setRecoveryMessage("recoveryRequestMessage", recoveryText, "success");
                    const numberInput = App.el("recoveryStatusNumber");
                    if (numberInput) numberInput.value = number;
                } catch (error) {
                    console.error("Account recovery request:", error);
                    App.setRecoveryMessage("recoveryRequestMessage", error?.message || "تصدیق یا درخواست مکمل نہیں ہو سکی۔", "error");
                } finally {
                    if (submit) submit.disabled = false;
                }
            });
        }

        if (statusForm && statusForm.dataset.bound !== "1") {
            statusForm.dataset.bound = "1";
            statusForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                try {
                    const result = await App.rpc("get_account_recovery_status", {
                        p_request_no: App.val("recoveryStatusNumber"),
                        p_recovery_pin: App.val("recoveryStatusPin")
                    });
                    const status = App.safe(result?.status || "pending");
                    let text = "حالت: " + App.statusUrdu(status);
                    if (status === "approved" || status === "منظور") {
                        if (result?.request_type === "username" && result?.username) {
                            text += "\nآپ کا صارف نام: " + result.username;
                        } else if (result?.request_type === "password") {
                            text += "\nآپ کا نیا پاس ورڈ فعال کر دیا گیا ہے۔ اب لاگ اِن کریں۔";
                        }
                    }
                    if (result?.admin_note) text += "\nایڈمن نوٹ: " + result.admin_note;
                    App.setRecoveryMessage("recoveryStatusMessage", text, status === "rejected" ? "error" : "success");
                } catch (error) {
                    console.error("Recovery status:", error);
                    App.setRecoveryMessage("recoveryStatusMessage", error?.message || "درخواست کی حالت نہیں مل سکی۔", "error");
                }
            });
        }
    };

    App.recoveryRequests = [];

    App.renderRecoveryRequests = function (records) {
        const body = App.el("adminRecoveryRequestsBody");
        if (!body) return;
        records = Array.isArray(records) ? records : [];
        if (!records.length) {
            body.innerHTML = '<tr><td colspan="7" class="table-empty">کوئی اکاؤنٹ بحالی درخواست موجود نہیں۔</td></tr>';
            return;
        }
        body.innerHTML = records.map(item => {
            const role = App.recoveryRoleNames[App.safe(item.role).toLowerCase()] || App.safe(item.role);
            const kind = item.request_type === "username" ? "صارف نام" : "پاس ورڈ";
            const status = App.statusUrdu(item.status || "pending");
            const pending = App.safe(item.status || "pending").toLowerCase() === "pending";
            return `
                <tr>
                    <td>${App.escape(App.dateTime(item.created_at))}</td>
                    <td>${App.escape(item.request_no || "—")}</td>
                    <td>${App.escape(role)}</td>
                    <td>${App.escape(kind)}</td>
                    <td>${App.escape(item.reference_value || "—")}</td>
                    <td>${App.escape(status)}</td>
                    <td>${pending ? `
                        <div class="record-card-actions account-inline-actions">
                            <button type="button" data-recovery-approve="${Number(item.id)}">منظور کریں</button>
                            <button type="button" data-recovery-reject="${Number(item.id)}">مسترد کریں</button>
                        </div>` : "—"}</td>
                </tr>`;
        }).join("");

        body.querySelectorAll("[data-recovery-approve]").forEach(button => {
            button.addEventListener("click", () => App.reviewRecoveryRequest(Number(button.dataset.recoveryApprove), "approved"));
        });
        body.querySelectorAll("[data-recovery-reject]").forEach(button => {
            button.addEventListener("click", () => App.reviewRecoveryRequest(Number(button.dataset.recoveryReject), "rejected"));
        });
    };

    App.loadRecoveryRequests = async function () {
        if (App.currentFile !== "admin-accounts.html") return;
        try {
            const rows = App.asArray(await App.authedRpc("admin_get_recovery_requests"));
            App.recoveryRequests = rows;
            App.renderRecoveryRequests(rows);
            App.message("adminRecoveryRequestsMessage", "", "");
        } catch (error) {
            console.error("Recovery requests:", error);
            App.renderRecoveryRequests([]);
            App.message("adminRecoveryRequestsMessage", error?.message || "اکاؤنٹ بحالی کی درخواستیں لوڈ نہیں ہو سکیں۔", "error");
        }
    };

    App.reviewRecoveryRequest = async function (id, decision) {
        const label = decision === "approved" ? "منظور" : "مسترد";
        if (!window.confirm("کیا آپ یہ اکاؤنٹ بحالی درخواست " + label + " کرنا چاہتے ہیں؟")) return;
        const note = window.prompt("ایڈمن نوٹ (اختیاری):", "");
        if (note === null) return;
        try {
            await App.authedRpc("admin_review_recovery_request", {
                p_request_id: Number(id),
                p_decision: decision,
                p_admin_note: note || null
            });
            alert("درخواست " + label + " ہوگئی۔");
            await App.loadRecoveryRequests();
        } catch (error) {
            console.error("Review recovery:", error);
            alert(error?.message || "درخواست اپڈیٹ نہیں ہو سکی۔");
        }
    };

    App.bindAdminRecoveryCodeForm = function () {
        if (App.currentFile !== "admin-settings.html") return;
        const form = App.el("adminRecoveryCodeForm");
        if (!form || form.dataset.bound === "1") return;
        form.dataset.bound = "1";
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const code = App.val("adminRecoveryCode");
            const confirm = App.val("confirmAdminRecoveryCode");
            if (code.length < 8) {
                App.message("adminRecoveryCodeMessage", "بحالی کوڈ کم از کم 8 حروف/ہندسے کا ہونا چاہیے۔", "error");
                return;
            }
            if (code !== confirm) {
                App.message("adminRecoveryCodeMessage", "دونوں بحالی کوڈ ایک جیسے نہیں ہیں۔", "error");
                return;
            }
            try {
                await App.authedRpc("admin_set_recovery_code", { p_recovery_code: code });
                form.reset();
                App.message("adminRecoveryCodeMessage", "ایڈمن بحالی کوڈ محفوظ ہوگیا۔", "success");
            } catch (error) {
                console.error("Admin recovery code:", error);
                App.message("adminRecoveryCodeMessage", error?.message || "بحالی کوڈ محفوظ نہیں ہو سکا۔", "error");
            }
        });
    };


    /* =====================================================
       PRINT PROFILE LINK
       ===================================================== */

    App.openPrintProfile =
        function (
            type,
            id
        ) {

            if (
                !type ||
                !Number(id)
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
                    Number(id)
                );
        };


    window.openPrintProfile =
        App.openPrintProfile;


    /* =====================================================
       ADMIN DASHBOARD - TOP CARDS NON CLICKABLE

       Total Students
       Total Teachers
       Pending
       Current Balance

       DISPLAY ONLY.
       ===================================================== */

    App.disableDashboardSummaryLinks =
        function () {

            if (
                App.currentFile !==
                "admin.html"
            ) {
                return;
            }


            document
                .querySelectorAll(
                    ".admin-short-summary a"
                )
                .forEach(
                    card => {

                        if (
                            card.dataset
                                .summaryDisabled ===
                            "true"
                        ) {
                            return;
                        }

                        card.dataset.summaryDisabled =
                            "true";

                        card.setAttribute(
                            "aria-disabled",
                            "true"
                        );

                        card.addEventListener(
                            "click",
                            function (event) {

                                event.preventDefault();

                                event.stopPropagation();
                            }
                        );
                    }
                );
        };


    /* =====================================================
       CLASS SUMMARY CLICK

       Click one class =
       students.html?class=SELECTED_CLASS

       Only selected class will show.
       ===================================================== */

    App.bindDashboardClassCards =
        function () {

            if (
                App.currentFile !==
                "admin.html"
            ) {
                return;
            }


            const map = {

                adminClassQaida: "قاعدہ",
                adminClassNazra: "ناظرہ",
                adminClassTarjuma: "ترجمہ",
                adminClassHifz: "حفظ",
                adminClassTajweed: "تجوید",
                adminClassIdadiya: "اعدادیہ",
                adminClassMutawassita: "متوسطہ",
                adminClassThanviaKhasaFirst: "ثانویہ خاصہ سال اول",
                adminClassThanviaKhasaSecond: "ثانویہ خاصہ سال دوم",
                adminClassAliaFirst: "عالیہ سال اول",
                adminClassAliaSecond: "عالیہ سال دوم",
                adminClassAlmiaFirst: "عالمیہ سال اول",
                adminClassAlmiaSecond: "عالمیہ سال دوم / دورۂ حدیث"
            };


            Object.entries(
                map
            )
                .forEach(
                    ([id, className]) => {

                        const number =
                            App.el(id);

                        if (!number) {
                            return;
                        }

                        const card =
                            number.closest(
                                ".admin-short-classes > div, .admin-short-classes > a"
                            );

                        if (!card) {
                            return;
                        }

                        if (
                            card.dataset
                                .classBound ===
                            "true"
                        ) {
                            return;
                        }

                        card.dataset.classBound =
                            "true";

                        card.style.cursor =
                            "pointer";

                        card.setAttribute(
                            "role",
                            "button"
                        );

                        card.setAttribute(
                            "tabindex",
                            "0"
                        );


                        const openClass =
                            function (
                                event
                            ) {

                                if (event) {

                                    event.preventDefault();
                                }

                                window.location.href =
                                    "students.html" +
                                    "?class=" +
                                    encodeURIComponent(
                                        className
                                    );
                            };


                        card.addEventListener(
                            "click",
                            openClass
                        );


                        card.addEventListener(
                            "keydown",
                            function (event) {

                                if (
                                    event.key ===
                                        "Enter" ||
                                    event.key ===
                                        " "
                                ) {

                                    openClass(
                                        event
                                    );
                                }
                            }
                        );
                    }
                );


            /*
               Madrassa residence card.
            */

            const hostelNumber =
                App.el(
                    "adminHostelStudentCount"
                );


            if (hostelNumber) {

                const card =
                    hostelNumber.closest(
                        ".admin-short-classes > div, .admin-short-classes > a"
                    );

                if (
                    card &&
                    card.dataset
                        .hostelBound !==
                    "true"
                ) {

                    card.dataset.hostelBound =
                        "true";

                    card.style.cursor =
                        "pointer";

                    card.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            window.location.href =
                                "admin-hostel.html";
                        }
                    );
                }
            }
        };


    /* =====================================================
       ADMIN DASHBOARD HELPERS
       ===================================================== */

    App.dashboardSetText =
        function (
            ids,
            value,
            fallback = "0"
        ) {

            const list =
                Array.isArray(ids)
                    ? ids
                    : [ids];

            for (
                const id of list
            ) {

                const node =
                    App.el(id);

                if (!node) {
                    continue;
                }

                node.textContent =
                    value === null ||
                    value === undefined ||
                    value === ""
                        ? fallback
                        : String(value);
            }
        };


    App.dashboardStatusCount =
        function (
            statuses,
            names
        ) {

            if (
                !statuses ||
                typeof statuses !==
                "object"
            ) {
                return 0;
            }

            let total = 0;

            names.forEach(
                name => {

                    total +=
                        Number(
                            statuses[name] ||
                            0
                        );
                }
            );

            return total;
        };


    App.dashboardClassId =
        function (name) {

            const value = App.safe(name).trim();

            const map = {
                "قاعدہ": "adminClassQaida",
                "ناظرہ": "adminClassNazra",
                "ترجمہ": "adminClassTarjuma",
                "حفظ": "adminClassHifz",
                "تجوید": "adminClassTajweed",
                "اعدادیہ": "adminClassIdadiya",
                "متوسطہ": "adminClassMutawassita",
                "ثانویہ خاصہ سال اول": "adminClassThanviaKhasaFirst",
                "ثانویہ خاصہ سال دوم": "adminClassThanviaKhasaSecond",
                "عالیہ سال اول": "adminClassAliaFirst",
                "عالیہ سال دوم": "adminClassAliaSecond",
                "عالمیہ سال اول": "adminClassAlmiaFirst",
                "عالمیہ سال دوم / دورۂ حدیث": "adminClassAlmiaSecond"
            };

            return map[value] || null;
        };


    App.renderDashboardClasses =
        function (classes) {

            [
                "adminClassQaida",
                "adminClassNazra",
                "adminClassTarjuma",
                "adminClassHifz",
                "adminClassTajweed",
                "adminClassIdadiya",
                "adminClassMutawassita",
                "adminClassThanviaKhasaFirst",
                "adminClassThanviaKhasaSecond",
                "adminClassAliaFirst",
                "adminClassAliaSecond",
                "adminClassAlmiaFirst",
                "adminClassAlmiaSecond"
            ]
                .forEach(
                    id => {

                        App.setText(
                            id,
                            0,
                            "0"
                        );
                    }
                );


            if (
                !Array.isArray(
                    classes
                )
            ) {
                return;
            }


            classes.forEach(
                item => {

                    const id =
                        App.dashboardClassId(
                            item?.class
                        );

                    if (!id) {
                        return;
                    }

                    App.setText(
                        id,
                        Number(
                            item?.students ||
                            0
                        ),
                        "0"
                    );
                }
            );
        };


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


            /*
               Date
            */

            App.setText(
                "adminTodayDate",
                App.date(
                    new Date()
                )
            );


            /*
               Admin display name.
            */

            const savedUsername =
                localStorage.getItem(
                    "username"
                );


            if (
                savedUsername
            ) {

                App.setText(
                    "adminWelcomeName",
                    savedUsername,
                    "ایڈمن"
                );
            }


            App.disableDashboardSummaryLinks();

            App.bindDashboardClassCards();


            try {

                const data =
                    await App.authedRpc(
                        "admin_dashboard_overview"
                    );


                App.setText(
                    "studentTotal",
                    Number(
                        data
                            ?.students_total ||
                        0
                    ),
                    "0"
                );


                App.setText(
                    "teacherTotal",
                    Number(
                        data
                            ?.teachers_total ||
                        0
                    ),
                    "0"
                );


                const pending =
                    Number(
                        data
                            ?.pending_applications_total ||
                        (
                            Number(
                                data
                                    ?.pending_student_applications ||
                                0
                            ) +
                            Number(
                                data
                                    ?.pending_teacher_applications ||
                                0
                            )
                        )
                    );


                App.setText(
                    "adminPendingApplications",
                    pending,
                    "0"
                );


                App.setText(
                    "adminPendingApprovalCount",
                    pending,
                    "0"
                );


                const statuses =
                    data
                        ?.attendance_today_by_status ||
                    {};


                const present =
                    App.dashboardStatusCount(
                        statuses,
                        [
                            "present",
                            "حاضر"
                        ]
                    );


                const absent =
                    App.dashboardStatusCount(
                        statuses,
                        [
                            "absent",
                            "غیر حاضر",
                            "غیرحاضر"
                        ]
                    );


                const leave =
                    App.dashboardStatusCount(
                        statuses,
                        [
                            "leave",
                            "رخصت"
                        ]
                    );


                const total =
                    Number(
                        data
                            ?.attendance_today_total ||
                        0
                    );


                const percentage =
                    total > 0
                        ? (
                            present /
                            total *
                            100
                        ).toFixed(1)
                        : "0.0";


                App.setText(
                    "adminAttendanceTotal",
                    total,
                    "0"
                );


                App.setText(
                    "adminAttendancePresent",
                    present,
                    "0"
                );


                App.setText(
                    "adminAttendanceAbsent",
                    absent,
                    "0"
                );


                App.setText(
                    "adminAttendanceLeave",
                    leave,
                    "0"
                );


                App.setText(
                    "adminTodayAttendancePercentage",
                    percentage +
                    "%",
                    "0.0%"
                );


                App.renderDashboardClasses(
                    data?.classes ||
                    []
                );


                if (
                    data
                        ?.hostel_students_total !==
                    undefined
                ) {

                    App.setText(
                        "adminHostelStudentCount",
                        Number(
                            data
                                .hostel_students_total ||
                            0
                        ),
                        "0"
                    );
                }


                if (
                    data
                        ?.homework_total !==
                    undefined
                ) {

                    App.setText(
                        "adminHomeworkCount",
                        Number(
                            data.homework_total ||
                            0
                        ),
                        "0"
                    );
                }


            } catch (error) {

                console.error(
                    "Admin dashboard overview:",
                    error
                );


                App.message(
                    "adminDashboardMessage",
                    "ڈیش بورڈ کا مکمل ریکارڈ لوڈ نہیں ہو سکا۔",
                    "error"
                );
            }


            /*
               Finance separately.
            */

            try {

                const finance =
                    await App.authedRpc(
                        "admin_finance_dashboard"
                    );


                App.setText(
                    "adminCurrentBalance",
                    App.money(
                        finance
                            ?.current_balance ||
                        0
                    ),
                    "0 PKR"
                );


            } catch (error) {

                console.warn(
                    "Dashboard finance:",
                    error
                );


                App.setText(
                    "adminCurrentBalance",
                    "0 PKR",
                    "0 PKR"
                );
            }
        };


    /* =====================================================
       PAGE RESTORE SECURITY
       ===================================================== */

    App.bindPageRestoreSecurity =
        function () {

            window.addEventListener(
                "pageshow",
                async function (event) {

                    if (
                        !event.persisted
                    ) {
                        return;
                    }

                    const allowed =
                        await App.protectCurrentPage();

                    if (
                        allowed &&
                        App.isLoggedIn()
                    ) {

                        await App.checkTimeout();
                    }
                }
            );
        };


    /* =====================================================
       PART 1 END

       DO NOT ADD:
       })();

       PART 2 MUST CONTINUE DIRECTLY BELOW THIS.
       ===================================================== */

 /* =========================================================
   PART 2 / 4
   STUDENTS + TEACHERS
   SHORT LISTS + FULL A-Z DETAILS
   EDIT / UPDATE / DELETE / PRINT
   FEES + SALARY
   ========================================================= */


/* =====================================================
   COMMON PROFILE HELPERS
   ===================================================== */

App.profileHiddenKeys =
    new Set([
        "password",
        "password_hash",
        "requested_password_hash",
        "secret",
        "token",
        "session_token"
    ]);


App.profileLabel =
    function (key) {

        const labels = {

            id:
                "ریکارڈ نمبر",

            name:
                "نام",

            full_name:
                "مکمل نام",

            father_name:
                "والد کا نام",

            guardian_name:
                "سرپرست کا نام",

            admission_no:
                "داخلہ نمبر",

            legacy_registration_no:
                "رجسٹریشن نمبر",

            admission_type:
                "داخلہ کی قسم",

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

            status:
                "حالت",

            authorization_status:
                "اکاؤنٹ حالت",

            academic_year:
                "تعلیمی سال",

            attendance_date:
                "حاضری تاریخ",

            period_number:
                "پیریڈ",

            obtained_marks:
                "حاصل کردہ نمبر",

            total_marks:
                "کل نمبر",

            marks_percentage:
                "فیصد",

            exam_name:
                "امتحان",

            exam_type:
                "امتحان کی قسم",

            exam_date:
                "امتحان تاریخ",

            rating:
                "ریٹنگ",

            feedback_text:
                "فیڈ بیک",

            comment:
                "تبصرہ",

            title:
                "عنوان",

            description:
                "تفصیل",

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
                "لین دین وقت",

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

            relation:
                "رشتہ",

            notes:
                "نوٹس",

            note:
                "نوٹ",

            created_at:
                "تخلیق وقت",

            updated_at:
                "آخری تبدیلی",

            balance:
                "بیلنس",

            total_due:
                "کل واجب الادا",

            total_paid:
                "کل ادا شدہ",

            total_charged:
                "کل مقررہ رقم",

            student_name:
                "طالبہ کا نام",

            fee_type:
                "فیس کی قسم",

            fee_type_name:
                "فیس کی قسم",

            status_label:
                "حالت",

            last_login:
                "آخری لاگ اِن",

            last_login_at:
                "آخری لاگ اِن",

            issued_by_name:
                "جاری کنندہ",

            verified_by_name:
                "تصدیق کنندہ"
        };


        return (
            labels[key] ||
            App.safe(key)
                .replace(
                    /_/g,
                    " "
                )
        );
    };


App.profileDisplayValue =
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

            return value
                ? "ہاں"
                : "نہیں";
        }


        if (
            key === "status" ||
            key === "decision" ||
            key ===
                "authorization_status"
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


            return digits.length === 13
                ? App.formatCNIC(
                    digits
                )
                : App.safe(
                    value
                );
        }


        if (
            key.endsWith(
                "_at"
            )
        ) {

            return App.dateTime(
                value
            );
        }


        if (
            key.endsWith(
                "_date"
            ) ||
            [
                "date_of_birth",
                "joining_date",
                "admission_date",
                "transfer_date",
                "due_date",
                "exam_date"
            ].includes(key)
        ) {

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

            const number =
                Number(value);


            if (
                Number.isFinite(
                    number
                )
            ) {

                return App.money(
                    number
                );
            }
        }


        return App.safe(
            value
        );
    };


App.profileSectionTitle =
    function (key) {

        const titles = {

            core:
                "بنیادی معلومات",

            student:
                "طالبہ کی معلومات",

            teacher:
                "استاد کی معلومات",

            personal:
                "ذاتی معلومات",

            account:
                "اکاؤنٹ",

            mahrams:
                "محرم",

            student_mahrams:
                "محرم",

            attendance:
                "حاضری",

            teacher_attendance:
                "استاد کی حاضری",

            class_attendance_history:
                "کلاس حاضری",

            marks:
                "امتحانات و نمبرات",

            results:
                "نتائج",

            ratings:
                "ریٹنگ",

            feedback:
                "فیڈ بیک / نوٹس",

            student_feedback:
                "اساتذہ کے نوٹس",

            homework:
                "ہوم ورک",

            submissions:
                "ہوم ورک جمع شدہ",

            announcements:
                "اعلانات",

            class_announcements:
                "کلاس اعلانات",

            fees:
                "فیس",

            fee_history:
                "فیس ریکارڈ",

            charges:
                "واجبات",

            payments:
                "ادائیگیاں",

            salary:
                "تنخواہ",

            salary_history:
                "تنخواہ ریکارڈ",

            hostel:
                "مدرسہ میں رہائش",

            hostel_history:
                "خروج و واپسی",

            promotion_history:
                "ترقی / جماعت تبدیلی",

            promotions:
                "ترقی / جماعت تبدیلی",

            uploaded_documents:
                "جمع شدہ دستاویزات",

            documents:
                "دستاویزات",

            issued_documents:
                "جاری شدہ دستاویزات",

            assignments:
                "تدریسی ذمہ داریاں",

            teacher_assignments:
                "تدریسی ذمہ داریاں",

            activity:
                "سرگرمی",

            activity_history:
                "سرگرمی کی تاریخ",

            audit_history:
                "آڈٹ ریکارڈ",

            finance:
                "مالی ریکارڈ",

            history:
                "مکمل تاریخ"
        };


        return (
            titles[key] ||
            App.profileLabel(
                key
            )
        );
    };


App.renderDeepProfile =
    function (
        value,
        key = "record",
        depth = 0
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        if (
            App.profileHiddenKeys.has(
                key
            )
        ) {
            return "";
        }


        if (
            Array.isArray(
                value
            )
        ) {

            if (!value.length) {
                return "";
            }


            return `
                <section class="generated-profile-section">

                    <h3>
                        ${App.escape(
                            App.profileSectionTitle(
                                key
                            )
                        )}
                    </h3>

                    <div class="generated-profile-list">

                        ${
                            value
                                .map(
                                    (item, index) => {

                                        if (
                                            item &&
                                            typeof item ===
                                            "object"
                                        ) {

                                            return `
                                                <div class="generated-profile-record">

                                                    <h4>
                                                        ریکارڈ ${
                                                            index + 1
                                                        }
                                                    </h4>

                                                    ${
                                                        App.renderDeepProfile(
                                                            item,
                                                            "record",
                                                            depth + 1
                                                        )
                                                    }

                                                </div>
                                            `;
                                        }


                                        return `
                                            <div class="generated-profile-record">
                                                ${App.escape(
                                                    App.safe(
                                                        item
                                                    )
                                                )}
                                            </div>
                                        `;
                                    }
                                )
                                .join("")
                        }

                    </div>

                </section>
            `;
        }


        if (
            typeof value ===
            "object"
        ) {

            const primitiveItems = [];

            const nestedItems = [];


            Object.entries(
                value
            )
                .forEach(
                    ([childKey, childValue]) => {

                        if (
                            App.profileHiddenKeys
                                .has(
                                    childKey
                                )
                        ) {
                            return;
                        }


                        if (
                            childValue === null ||
                            childValue === undefined
                        ) {
                            return;
                        }


                        if (
                            typeof childValue ===
                                "object"
                        ) {

                            nestedItems.push(
                                [
                                    childKey,
                                    childValue
                                ]
                            );

                        } else {

                            primitiveItems.push(
                                [
                                    App.profileLabel(
                                        childKey
                                    ),

                                    App.profileDisplayValue(
                                        childKey,
                                        childValue
                                    )
                                ]
                            );
                        }
                    }
                );


            let html = "";


            if (
                primitiveItems.length
            ) {

                html +=
                    App.infoGrid(
                        primitiveItems
                    );
            }


            nestedItems.forEach(
                ([childKey, childValue]) => {

                    html +=
                        App.renderDeepProfile(
                            childValue,
                            childKey,
                            depth + 1
                        );
                }
            );


            if (!html) {
                return "";
            }


            if (
                key === "record" ||
                depth === 0
            ) {

                return html;
            }


            return `
                <section class="generated-profile-section">

                    <h3>
                        ${App.escape(
                            App.profileSectionTitle(
                                key
                            )
                        )}
                    </h3>

                    ${html}

                </section>
            `;
        }


        return App.escape(
            App.safe(value)
        );
    };


App.fetchCompleteProfile =
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


App.openGeneratedPanel =
    function (
        id,
        title,
        bodyHtml,
        footerHtml = ""
    ) {

        const old =
            App.el(id);


        if (old) {
            old.remove();
        }


        const overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            id;


        overlay.className =
            "generated-details-overlay";


        overlay.innerHTML = `
            <div class="generated-details-card">

                <div class="generated-details-header">

                    <h2>
                        ${App.escape(
                            title
                        )}
                    </h2>

                    <button
                        type="button"
                        data-generated-close
                    >
                        ✕
                    </button>

                </div>

                <div class="generated-details-body">
                    ${bodyHtml}
                </div>

                ${
                    footerHtml
                        ? `
                            <div class="generated-details-actions">
                                ${footerHtml}
                            </div>
                        `
                        : ""
                }

            </div>
        `;


        document.body.appendChild(
            overlay
        );


        const close =
            function () {

                overlay.remove();
            };


        overlay
            .querySelector(
                "[data-generated-close]"
            )
            ?.addEventListener(
                "click",
                close
            );


        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    overlay
                ) {

                    close();
                }
            }
        );


        return overlay;
    };


/* =====================================================
   STUDENTS
   ===================================================== */

App.students = [];

App.currentStudentId =
    null;


App.studentListClassFilter =
    function () {

        const params =
            new URLSearchParams(
                window.location.search
            );


        return App.safe(
            params.get(
                "class"
            )
        ).trim();
    };


App.loadStudents =
    async function () {
        const selectedClass =
            App.studentListClassFilter();

        const response =
            await App.authedRpc(
                "admin_get_students"
            );

        App.students =
            App.asArray(response)
                .filter(
                    student =>
                        !selectedClass ||
                        App.safe(student.student_class) ===
                            selectedClass
                )
                .sort(
                    (a, b) =>
                        Number(b.id || 0) -
                        Number(a.id || 0)
                );


        return App.students;
    };


App.studentShortCard =
    function (student) {

        const id =
            Number(
                student.id
            );


        return `
            <article
                class="record-card student-record-card"
                data-student-card="${id}"
            >

                <div
                    class="record-card-main"
                    data-student-open="${id}"
                    role="button"
                    tabindex="0"
                >

                    <h3>
                        ${App.escape(
                            student.name ||
                            "—"
                        )}
                    </h3>

                    <p>
                        داخلہ نمبر:
                        <strong>
                            ${App.escape(
                                student
                                    .admission_no ||
                                "—"
                            )}
                        </strong>
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
                        کلاس:
                        ${App.escape(
                            student
                                .student_class ||
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
                        data-student-open="${id}"
                    >
                        مکمل تفصیل
                    </button>

                    <button
                        type="button"
                        data-student-print="${id}"
                    >
                        پرنٹ / PDF
                    </button>

                </div>

            </article>
        `;
    };


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
            !Array.isArray(records) ||
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
                    App.studentShortCard
                )
                .join("");


        container
            .querySelectorAll(
                "[data-student-open]"
            )
            .forEach(
                node => {

                    const open =
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();


                            App.openStudentCompleteDetails(
                                Number(
                                    node.dataset
                                        .studentOpen
                                )
                            );
                        };


                    node.addEventListener(
                        "click",
                        open
                    );


                    node.addEventListener(
                        "keydown",
                        function (event) {

                            if (
                                event.key ===
                                    "Enter" ||
                                event.key ===
                                    " "
                            ) {

                                open(
                                    event
                                );
                            }
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

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();


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
            ).trim();


        const residenceFilter =
            App.safe(
                App.first(
                    "studentResidenceFilter",
                    "adminStudentResidenceFilter"
                )?.value
            ).trim();


        const filtered =
            App.students.filter(
                student => {

                    const haystack =
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
                            student.student_class
                        ) !==
                        classFilter
                    ) {
                        return false;
                    }


                    if (
                        residenceFilter &&
                        App.safe(
                            student.residence_type
                        ) !==
                        residenceFilter
                    ) {
                        return false;
                    }


                    return true;
                }
            );


        App.renderStudentList(
            filtered
        );
    };


App.openStudentCompleteDetails =
    async function (studentId) {

        App.currentStudentId =
            Number(
                studentId
            );


        const student =
            App.students.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        studentId
                    )
            );


        const loading =
            App.openGeneratedPanel(
                "generatedStudentCompleteDetails",
                student?.name ||
                "طالبہ کا مکمل پروفائل",
                App.empty(
                    "مکمل ریکارڈ لوڈ ہو رہا ہے..."
                )
            );


        try {

            const response =
                await App.fetchCompleteProfile(
                    "student",
                    studentId
                );


            const data =
                response?.data ||
                response ||
                {};


            const html =
                App.renderDeepProfile(
                    data,
                    "student-profile"
                );


            const body =
                loading.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    html ||
                    App.empty(
                        "تفصیلات موجود نہیں۔"
                    );
            }


            const footer =
                document.createElement(
                    "div"
                );


            footer.className =
                "generated-details-actions";


            footer.innerHTML = `
                <button
                    type="button"
                    data-student-action="print"
                >
                    پرنٹ / PDF
                </button>

                <button
                    type="button"
                    data-student-action="edit"
                >
                    ترمیم / اپڈیٹ
                </button>

                <button
                    type="button"
                    data-student-action="fee"
                >
                    فیس
                </button>

                <button
                    type="button"
                    data-student-action="delete"
                >
                    حذف کریں
                </button>
            `;


            loading
                .querySelector(
                    ".generated-details-card"
                )
                ?.appendChild(
                    footer
                );


            footer.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-student-action]"
                        );


                    if (!button) {
                        return;
                    }


                    const action =
                        button.dataset
                            .studentAction;


                    if (
                        action === "print"
                    ) {

                        App.openPrintProfile(
                            "student",
                            studentId
                        );

                    } else if (
                        action === "edit"
                    ) {

                        App.openStudentEdit(
                            studentId
                        );

                    } else if (
                        action === "fee"
                    ) {

                        App.openStudentFinance(
                            studentId
                        );

                    } else if (
                        action === "delete"
                    ) {

                        App.deleteStudent(
                            studentId
                        );
                    }
                }
            );


        } catch (error) {

            console.error(
                "Student complete profile:",
                error
            );


            const body =
                loading.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    App.empty(
                        "طالبہ کا مکمل ریکارڈ لوڈ نہیں ہو سکا۔"
                    );
            }
        }
    };


window.showStudentDetails =
    App.openStudentCompleteDetails;


/* =====================================================
   STUDENT EDIT / UPDATE
   ===================================================== */

App.openStudentEdit =
    async function (studentId) {

        let student =
            App.students.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        studentId
                    )
            );


        if (!student) {
            await App.loadStudents();
            student =
                App.students.find(
                    item =>
                        Number(item.id) ===
                        Number(studentId)
                );
        }


        if (!student) {

            alert(
                "طالبہ کا ریکارڈ نہیں ملا۔"
            );

            return;
        }


        const overlay =
            App.openGeneratedPanel(
                "generatedStudentEdit",
                "طالبہ کی معلومات میں ترمیم",
                `
                    <form
                        id="generatedStudentEditForm"
                        class="generated-edit-form"
                    >

                        <label>
                            داخلہ / وفاق نمبر
                            <input
                                id="editStudentAdmissionNo"
                                type="text"
                                value="${App.escape(
                                    student.admission_no ||
                                    ""
                                )}"
                                required
                            >
                            <small>وفاق المدارس کا نمبر ملنے کے بعد یہاں درج کریں۔ یہ نمبر منفرد ہونا چاہیے۔</small>
                        </label>

                        <label>
                            نام
                            <input
                                id="editStudentName"
                                type="text"
                                value="${App.escape(
                                    student.name ||
                                    ""
                                )}"
                                required
                            >
                        </label>

                        <label>
                            والد کا نام
                            <input
                                id="editStudentFather"
                                type="text"
                                value="${App.escape(
                                    student.father_name ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            سرپرست
                            <input
                                id="editStudentGuardian"
                                type="text"
                                value="${App.escape(
                                    student.guardian_name ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            فون نمبر
                            <input
                                id="editStudentPhone"
                                type="text"
                                class="phone-input"
                                value="${App.escape(
                                    student.phone ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            شناختی کارڈ / ب فارم
                            <input
                                id="editStudentCNIC"
                                type="text"
                                class="cnic-input"
                                value="${App.escape(
                                    student.cnic ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            تاریخ پیدائش
                            <input
                                id="editStudentDOB"
                                type="date"
                                value="${App.escape(
                                    App.safe(
                                        student.date_of_birth
                                    ).slice(
                                        0,
                                        10
                                    )
                                )}"
                            >
                        </label>

                        <label>
                            کلاس
                            <select
                                id="editStudentClass"
                            >

                                ${
                                    App.CLASSES
                                        .map(
                                            item => `
                                                <option
                                                    value="${App.escape(
                                                        item
                                                    )}"
                                                    ${
                                                        App.safe(
                                                            student.student_class
                                                        ) ===
                                                        item
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    ${App.escape(
                                                        item
                                                    )}
                                                </option>
                                            `
                                        )
                                        .join("")
                                }

                            </select>
                        </label>

                        <label>
                            پتہ
                            <textarea
                                id="editStudentAddress"
                            >${App.escape(
                                student.address ||
                                ""
                            )}</textarea>
                        </label>

                        <label>
                            رہائش
                            <select
                                id="editStudentResidence"
                            >

                                <option
                                    value="گھر"
                                    ${
                                        App.safe(
                                            student.residence_type
                                        ) ===
                                        "گھر"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    گھر
                                </option>

                                <option
                                    value="مدرسہ میں رہائش"
                                    ${
                                        [
                                            "مدرسہ میں رہائش",
                                            "ہاسٹل",
                                            "hostel"
                                        ].includes(
                                            App.safe(
                                                student.residence_type
                                            )
                                        )
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    مدرسہ میں رہائش
                                </option>

                            </select>
                        </label>

                        <button
                            type="submit"
                        >
                            محفوظ کریں
                        </button>

                    </form>
                `
            );


        App.bindInputFormatting();


        overlay
            .querySelector(
                "#generatedStudentEditForm"
            )
            ?.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const payload = {

                        admission_no:
                            App.val(
                                "editStudentAdmissionNo"
                            ),

                        name:
                            App.val(
                                "editStudentName"
                            ),

                        father_name:
                            App.val(
                                "editStudentFather"
                            ) ||
                            null,

                        guardian_name:
                            App.val(
                                "editStudentGuardian"
                            ) ||
                            null,

                        phone:
                            App.normalizePhone(
                                App.val(
                                    "editStudentPhone"
                                )
                            ) ||
                            null,

                        cnic:
                            App.normalizeDigits(
                                App.val(
                                    "editStudentCNIC"
                                )
                            ) ||
                            null,

                        date_of_birth:
                            App.val(
                                "editStudentDOB"
                            ) ||
                            null,

                        student_class:
                            App.val(
                                "editStudentClass"
                            ),

                        address:
                            App.val(
                                "editStudentAddress"
                            ) ||
                            null,

                        residence_type:
                            App.val(
                                "editStudentResidence"
                            ) ||
                            null
                    };


                    try {

                        await App.authedRpc(
                            "admin_update_student",
                            {
                                p_student_id:
                                    Number(
                                        studentId
                                    ),

                                p_changes:
                                    payload
                            }
                        );


                        alert(
                            "طالبہ کی معلومات اپڈیٹ ہوگئیں۔"
                        );


                        overlay.remove();


                        await App.loadStudents();

                        App.renderStudentList();


                    } catch (error) {

                        console.error(
                            "Student update:",
                            error
                        );


                        alert(
                            error?.message ||
                            "طالبہ کی معلومات محفوظ نہیں ہو سکیں۔"
                        );
                    }
                }
            );
    };


/* =====================================================
   DELETE STUDENT
   ===================================================== */

App.deleteStudent =
    async function (studentId) {

        const confirmed =
            window.confirm(
                "کیا آپ واقعی اس طالبہ کا ریکارڈ حذف کرنا چاہتے ہیں؟"
            );


        if (!confirmed) {
            return;
        }


        const second =
            window.confirm(
                "دوبارہ تصدیق کریں۔ متعلقہ فیس، حاضری، نمبرات اور دیگر ریکارڈ متاثر ہوسکتے ہیں۔"
            );


        if (!second) {
            return;
        }


        try {

            await App.authedRpc(
                "admin_deactivate_student",
                {
                    p_student_id:
                        Number(
                            studentId
                        )
                }
            );


            alert(
                "طالبہ کا ریکارڈ حذف ہوگیا۔"
            );


            App.el(
                "generatedStudentCompleteDetails"
            )?.remove();


            await App.loadStudents();

            App.renderStudentList();


        } catch (error) {

            console.error(
                "Student delete:",
                error
            );


            alert(
                error?.message ||
                "طالبہ کا ریکارڈ حذف نہیں ہو سکا۔"
            );
        }
    };


/* =====================================================
   STUDENT FEES
   ===================================================== */

App.openStudentFinance =
    async function (studentId) {

        const overlay =
            App.openGeneratedPanel(
                "generatedStudentFinance",
                "طالبہ کی فیس",
                App.empty(
                    "فیس کا ریکارڈ لوڈ ہو رہا ہے..."
                )
            );


        try {

            const data =
                await App.authedRpc(
                    "admin_student_fee_history",
                    {
                        p_student_id:
                            Number(
                                studentId
                            )
                    }
                );


            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    App.renderDeepProfile(
                        data,
                        "fees"
                    ) ||
                    App.empty(
                        "فیس کا ریکارڈ موجود نہیں۔"
                    );
            }


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "generated-details-actions";


            actions.innerHTML = `
                <button
                    type="button"
                    data-fee-action="receive"
                >
                    فیس وصول کریں
                </button>

                <button
                    type="button"
                    data-fee-action="add"
                >
                    فیس واجب کریں
                </button>

                <button
                    type="button"
                    data-fee-action="print"
                >
                    پروفائل / رسیدیں
                </button>
            `;


            overlay
                .querySelector(
                    ".generated-details-card"
                )
                ?.appendChild(
                    actions
                );


            actions.addEventListener(
                "click",
                async function (event) {

                    const button =
                        event.target.closest(
                            "[data-fee-action]"
                        );


                    if (!button) {
                        return;
                    }


                    const action =
                        button.dataset
                            .feeAction;


                    if (
                        action === "print"
                    ) {

                        App.openPrintProfile(
                            "student",
                            studentId
                        );

                        return;
                    }


                    if (
                        action === "receive"
                    ) {

                        const amount =
                            Number(
                                window.prompt(
                                    "وصول شدہ رقم:",
                                    ""
                                )
                            );


                        if (
                            !amount ||
                            amount <= 0
                        ) {
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
                                await App.authedRpc(
                                    "admin_receive_student_fee",
                                    {
                                        p_student_id:
                                            Number(
                                                studentId
                                            ),

                                        p_amount:
                                            amount,

                                        p_received_from:
                                            receivedFrom,

                                        p_payment_method:
                                            null,

                                        p_payment_reference:
                                            null,

                                        p_notes:
                                            null
                                    }
                                );


                            alert(
                                "فیس محفوظ ہوگئی۔" +
                                (
                                    result?.receipt_no
                                        ? "\nرسید نمبر: " +
                                        result.receipt_no
                                        : ""
                                )
                            );


                            overlay.remove();


                            App.openStudentFinance(
                                studentId
                            );


                        } catch (error) {

                            console.error(
                                "Receive fee:",
                                error
                            );


                            alert(
                                error?.message ||
                                "فیس محفوظ نہیں ہو سکی۔"
                            );
                        }


                        return;
                    }


                    if (
                        action === "add"
                    ) {

                        const amount =
                            Number(
                                window.prompt(
                                    "واجب فیس کی رقم:",
                                    ""
                                )
                            );


                        if (
                            !amount ||
                            amount <= 0
                        ) {
                            return;
                        }


                        const period =
                            window.prompt(
                                "فیس مدت / ماہ:",
                                ""
                            );


                        if (
                            period ===
                            null
                        ) {
                            return;
                        }


                        try {

                            await App.authedRpc(
                                "admin_add_student_fee",
                                {
                                    p_student_id:
                                        Number(
                                            studentId
                                        ),

                                    p_fee_type_id:
                                        null,

                                    p_amount:
                                        amount,

                                    p_fee_period:
                                        period ||
                                        null,

                                    p_due_date:
                                        null,

                                    p_notes:
                                        null
                                }
                            );


                            alert(
                                "فیس واجب کردی گئی۔"
                            );


                            overlay.remove();


                            App.openStudentFinance(
                                studentId
                            );


                        } catch (error) {

                            console.error(
                                "Add fee:",
                                error
                            );


                            alert(
                                error?.message ||
                                "فیس شامل نہیں ہو سکی۔"
                            );
                        }
                    }
                }
            );


        } catch (error) {

            console.error(
                "Student finance:",
                error
            );


            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    App.empty(
                        "فیس کا ریکارڈ لوڈ نہیں ہو سکا۔"
                    );
            }
        }
    };


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


        const selectedClass =
            App.studentListClassFilter();


        if (
            selectedClass
        ) {

            App.setText(
                "studentPageTitle",
                selectedClass
            );


            App.setText(
                "studentListTitle",
                selectedClass
            );


            const filter =
                App.first(
                    "studentClassFilter",
                    "adminStudentClassFilter"
                );


            if (filter) {

                filter.value =
                    selectedClass;
            }
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
                    "طالبات لوڈ ہو رہی ہیں..."
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


                        if (!node) {
                            return;
                        }


                        node.addEventListener(
                            "input",
                            App.filterStudents
                        );


                        node.addEventListener(
                            "change",
                            App.filterStudents
                        );
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

                        window.location.href =
                            "students.html";
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
   TEACHERS
   ===================================================== */

App.teachers = [];

App.currentTeacherId =
    null;


App.loadTeachers =
    async function () {

        const response =
            await App.authedRpc(
                "admin_get_teachers"
            );

        App.teachers =
            App.asArray(response)
                .sort(
                    (a, b) =>
                        Number(b.id || 0) -
                        Number(a.id || 0)
                );


        return App.teachers;
    };


App.teacherShortCard =
    function (teacher) {

        const id =
            Number(
                teacher.id
            );


        return `
            <article
                class="record-card teacher-record-card"
                data-teacher-card="${id}"
            >

                <div
                    class="record-card-main"
                    data-teacher-open="${id}"
                    role="button"
                    tabindex="0"
                >

                    <h3>
                        ${App.escape(
                            teacher.name ||
                            "—"
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
                        تعلیم:
                        ${App.escape(
                            teacher
                                .qualification ||
                            "—"
                        )}
                    </p>

                    <p>
                        کلاس:
                        ${App.escape(
                            teacher
                                .teaching_class ||
                            "—"
                        )}
                    </p>

                    <p>
                        مضمون:
                        ${App.escape(
                            teacher.subject ||
                            "—"
                        )}
                    </p>

                </div>

                <div class="record-card-actions">

                    <button
                        type="button"
                        data-teacher-open="${id}"
                    >
                        مکمل تفصیل
                    </button>

                    <button
                        type="button"
                        data-teacher-print="${id}"
                    >
                        پرنٹ / PDF
                    </button>

                </div>

            </article>
        `;
    };


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
            !Array.isArray(records) ||
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
                    App.teacherShortCard
                )
                .join("");


        container
            .querySelectorAll(
                "[data-teacher-open]"
            )
            .forEach(
                node => {

                    const open =
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();


                            App.openTeacherCompleteDetails(
                                Number(
                                    node.dataset
                                        .teacherOpen
                                )
                            );
                        };


                    node.addEventListener(
                        "click",
                        open
                    );


                    node.addEventListener(
                        "keydown",
                        function (event) {

                            if (
                                event.key ===
                                    "Enter" ||
                                event.key ===
                                    " "
                            ) {

                                open(
                                    event
                                );
                            }
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
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();


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


        const filtered =
            App.teachers.filter(
                teacher => {

                    if (!search) {
                        return true;
                    }


                    const text =
                        [
                            teacher.name,
                            teacher.father_name,
                            teacher.teacher_code,
                            teacher.phone,
                            teacher.cnic,
                            teacher.qualification,
                            teacher.specialization,
                            teacher.teaching_class,
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


                    return text.includes(
                        search
                    );
                }
            );


        App.renderTeacherList(
            filtered
        );
    };


App.openTeacherCompleteDetails =
    async function (teacherId) {

        App.currentTeacherId =
            Number(
                teacherId
            );


        const teacher =
            App.teachers.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        teacherId
                    )
            );


        const overlay =
            App.openGeneratedPanel(
                "generatedTeacherCompleteDetails",
                teacher?.name ||
                "استاد کا مکمل پروفائل",
                App.empty(
                    "مکمل ریکارڈ لوڈ ہو رہا ہے..."
                )
            );


        try {

            const response =
                await App.fetchCompleteProfile(
                    "teacher",
                    teacherId
                );


            const data =
                response?.data ||
                response ||
                {};


            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    App.renderDeepProfile(
                        data,
                        "teacher-profile"
                    ) ||
                    App.empty(
                        "تفصیلات موجود نہیں۔"
                    );
            }


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "generated-details-actions";


            actions.innerHTML = `
                <button
                    type="button"
                    data-teacher-action="print"
                >
                    پرنٹ / PDF
                </button>

                <button
                    type="button"
                    data-teacher-action="edit"
                >
                    ترمیم / اپڈیٹ
                </button>

                <button
                    type="button"
                    data-teacher-action="salary"
                >
                    تنخواہ
                </button>

                <button
                    type="button"
                    data-teacher-action="delete"
                >
                    حذف کریں
                </button>
            `;


            overlay
                .querySelector(
                    ".generated-details-card"
                )
                ?.appendChild(
                    actions
                );


            actions.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-teacher-action]"
                        );


                    if (!button) {
                        return;
                    }


                    const action =
                        button.dataset
                            .teacherAction;


                    if (
                        action === "print"
                    ) {

                        App.openPrintProfile(
                            "teacher",
                            teacherId
                        );

                    } else if (
                        action === "edit"
                    ) {

                        App.openTeacherEdit(
                            teacherId
                        );

                    } else if (
                        action === "salary"
                    ) {

                        App.openTeacherSalary(
                            teacherId
                        );

                    } else if (
                        action === "delete"
                    ) {

                        App.deleteTeacher(
                            teacherId
                        );
                    }
                }
            );


        } catch (error) {

            console.error(
                "Teacher complete profile:",
                error
            );


            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    App.empty(
                        "استاد کا مکمل ریکارڈ لوڈ نہیں ہو سکا۔"
                    );
            }
        }
    };


window.showTeacherDetails =
    App.openTeacherCompleteDetails;


/* =====================================================
   TEACHER EDIT / UPDATE
   ===================================================== */

App.openTeacherEdit =
    async function (teacherId) {

        let teacher =
            App.teachers.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        teacherId
                    )
            );


        if (!teacher) {
            await App.loadTeachers();
            teacher =
                App.teachers.find(
                    item =>
                        Number(item.id) ===
                        Number(teacherId)
                );
        }


        if (!teacher) {

            alert(
                "استاد کا ریکارڈ نہیں ملا۔"
            );

            return;
        }


        const overlay =
            App.openGeneratedPanel(
                "generatedTeacherEdit",
                "استاد کی معلومات میں ترمیم",
                `
                    <form
                        id="generatedTeacherEditForm"
                        class="generated-edit-form"
                    >

                        <label>
                            نام
                            <input
                                id="editTeacherName"
                                type="text"
                                value="${App.escape(
                                    teacher.name ||
                                    ""
                                )}"
                                required
                            >
                        </label>

                        <label>
                            والد کا نام
                            <input
                                id="editTeacherFather"
                                type="text"
                                value="${App.escape(
                                    teacher.father_name ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            فون
                            <input
                                id="editTeacherPhone"
                                type="text"
                                class="phone-input"
                                value="${App.escape(
                                    teacher.phone ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            شناختی کارڈ
                            <input
                                id="editTeacherCNIC"
                                type="text"
                                class="cnic-input"
                                value="${App.escape(
                                    teacher.cnic ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            تاریخ پیدائش
                            <input
                                id="editTeacherDOB"
                                type="date"
                                value="${App.escape(
                                    App.safe(
                                        teacher.date_of_birth
                                    ).slice(
                                        0,
                                        10
                                    )
                                )}"
                            >
                        </label>

                        <label>
                            تعلیم
                            <input
                                id="editTeacherQualification"
                                type="text"
                                value="${App.escape(
                                    teacher.qualification ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            تخصص
                            <input
                                id="editTeacherSpecialization"
                                type="text"
                                value="${App.escape(
                                    teacher.specialization ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            تجربہ سال
                            <input
                                id="editTeacherExperience"
                                type="number"
                                min="0"
                                value="${App.escape(
                                    teacher.experience_years ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            کلاس
                            <input
                                id="editTeacherClass"
                                type="text"
                                value="${App.escape(
                                    teacher.teaching_class ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            مضمون
                            <input
                                id="editTeacherSubject"
                                type="text"
                                value="${App.escape(
                                    teacher.subject ||
                                    ""
                                )}"
                            >
                        </label>

                        <label>
                            پتہ
                            <textarea
                                id="editTeacherAddress"
                            >${App.escape(
                                teacher.address ||
                                ""
                            )}</textarea>
                        </label>

                        <button
                            type="submit"
                        >
                            محفوظ کریں
                        </button>

                    </form>
                `
            );


        App.bindInputFormatting();


        overlay
            .querySelector(
                "#generatedTeacherEditForm"
            )
            ?.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const payload = {

                        name:
                            App.val(
                                "editTeacherName"
                            ),

                        father_name:
                            App.val(
                                "editTeacherFather"
                            ) ||
                            null,

                        phone:
                            App.normalizePhone(
                                App.val(
                                    "editTeacherPhone"
                                )
                            ) ||
                            null,

                        cnic:
                            App.normalizeDigits(
                                App.val(
                                    "editTeacherCNIC"
                                )
                            ) ||
                            null,

                        date_of_birth:
                            App.val(
                                "editTeacherDOB"
                            ) ||
                            null,

                        qualification:
                            App.val(
                                "editTeacherQualification"
                            ) ||
                            null,

                        specialization:
                            App.val(
                                "editTeacherSpecialization"
                            ) ||
                            null,

                        experience_years:
                            Number(
                                App.val(
                                    "editTeacherExperience"
                                ) ||
                                0
                            ),

                        teaching_class:
                            App.val(
                                "editTeacherClass"
                            ) ||
                            null,

                        subject:
                            App.val(
                                "editTeacherSubject"
                            ) ||
                            null,

                        address:
                            App.val(
                                "editTeacherAddress"
                            ) ||
                            null
                    };


                    try {

                        await App.authedRpc(
                            "admin_update_teacher",
                            {
                                p_teacher_id:
                                    Number(
                                        teacherId
                                    ),

                                p_changes:
                                    payload
                            }
                        );


                        alert(
                            "استاد کی معلومات اپڈیٹ ہوگئیں۔"
                        );


                        overlay.remove();


                        await App.loadTeachers();

                        App.renderTeacherList();


                    } catch (error) {

                        console.error(
                            "Teacher update:",
                            error
                        );


                        alert(
                            error?.message ||
                            "استاد کی معلومات محفوظ نہیں ہو سکیں۔"
                        );
                    }
                }
            );
    };


/* =====================================================
   DELETE TEACHER
   ===================================================== */

App.deleteTeacher =
    async function (teacherId) {

        const confirmed =
            window.confirm(
                "کیا آپ واقعی اس استاد کا ریکارڈ حذف کرنا چاہتے ہیں؟"
            );


        if (!confirmed) {
            return;
        }


        const second =
            window.confirm(
                "دوبارہ تصدیق کریں۔ متعلقہ حاضری، تنخواہ اور تدریسی ریکارڈ متاثر ہوسکتا ہے۔"
            );


        if (!second) {
            return;
        }


        try {

            await App.authedRpc(
                "admin_deactivate_teacher",
                {
                    p_teacher_id:
                        Number(
                            teacherId
                        )
                }
            );


            alert(
                "استاد کا ریکارڈ حذف ہوگیا۔"
            );


            App.el(
                "generatedTeacherCompleteDetails"
            )?.remove();


            await App.loadTeachers();

            App.renderTeacherList();


        } catch (error) {

            console.error(
                "Teacher delete:",
                error
            );


            alert(
                error?.message ||
                "استاد کا ریکارڈ حذف نہیں ہو سکا۔"
            );
        }
    };


/* =====================================================
   TEACHER SALARY
   ===================================================== */

App.openTeacherSalary =
    async function (teacherId) {

        const overlay =
            App.openGeneratedPanel(
                "generatedTeacherSalary",
                "استاد کی تنخواہ",
                App.empty(
                    "تنخواہ کا ریکارڈ لوڈ ہو رہا ہے..."
                )
            );


        try {

            const data =
                await App.authedRpc(
                    "admin_teacher_salary_history",
                    {
                        p_teacher_id:
                            Number(
                                teacherId
                            )
                    }
                );


            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    App.renderDeepProfile(
                        data,
                        "salary"
                    ) ||
                    App.empty(
                        "تنخواہ کا ریکارڈ موجود نہیں۔"
                    );
            }


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "generated-details-actions";


            actions.innerHTML = `
                <button
                    type="button"
                    data-salary-action="setting"
                >
                    ماہانہ تنخواہ مقرر کریں
                </button>

                <button
                    type="button"
                    data-salary-action="charge"
                >
                    ماہ کی تنخواہ بنائیں
                </button>

                <button
                    type="button"
                    data-salary-action="print"
                >
                    پروفائل / رسیدیں
                </button>
            `;


            overlay
                .querySelector(
                    ".generated-details-card"
                )
                ?.appendChild(
                    actions
                );


            actions.addEventListener(
                "click",
                async function (event) {

                    const button =
                        event.target.closest(
                            "[data-salary-action]"
                        );


                    if (!button) {
                        return;
                    }


                    const action =
                        button.dataset
                            .salaryAction;


                    if (
                        action === "print"
                    ) {

                        App.openPrintProfile(
                            "teacher",
                            teacherId
                        );

                        return;
                    }


                    if (
                        action === "setting"
                    ) {

                        const amount =
                            Number(
                                window.prompt(
                                    "ماہانہ تنخواہ:",
                                    ""
                                )
                            );


                        if (
                            !amount ||
                            amount <= 0
                        ) {
                            return;
                        }


                        try {

                            await App.authedRpc(
                                "admin_set_teacher_salary",
                                {
                                    p_teacher_id:
                                        Number(
                                            teacherId
                                        ),

                                    p_salary_amount:
                                        amount,

                                    p_effective_from:
                                        new Date()
                                            .toISOString()
                                            .slice(
                                                0,
                                                10
                                            ),

                                    p_notes:
                                        null
                                }
                            );


                            alert(
                                "تنخواہ مقرر ہوگئی۔"
                            );


                            overlay.remove();


                            App.openTeacherSalary(
                                teacherId
                            );


                        } catch (error) {

                            console.error(
                                "Salary setting:",
                                error
                            );


                            alert(
                                error?.message ||
                                "تنخواہ مقرر نہیں ہو سکی۔"
                            );
                        }


                        return;
                    }


                    if (
                        action === "charge"
                    ) {

                        const period =
                            window.prompt(
                                "تنخواہ کا ماہ / مدت:",
                                ""
                            );


                        if (
                            period ===
                            null ||
                            !period.trim()
                        ) {
                            return;
                        }


                        try {

                            await App.authedRpc(
                                "admin_create_teacher_salary",
                                {
                                    p_teacher_id:
                                        Number(
                                            teacherId
                                        ),

                                    p_salary_period:
                                        period.trim(),

                                    p_amount:
                                        null,

                                    p_due_date:
                                        null,

                                    p_notes:
                                        null
                                }
                            );


                            alert(
                                "تنخواہ واجب کردی گئی۔"
                            );


                            overlay.remove();


                            App.openTeacherSalary(
                                teacherId
                            );


                        } catch (error) {

                            console.error(
                                "Create salary:",
                                error
                            );


                            alert(
                                error?.message ||
                                "تنخواہ کا ریکارڈ نہیں بن سکا۔"
                            );
                        }
                    }
                }
            );


        } catch (error) {

            console.error(
                "Teacher salary:",
                error
            );


            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );


            if (body) {

                body.innerHTML =
                    App.empty(
                        "تنخواہ کا ریکارڈ لوڈ نہیں ہو سکا۔"
                    );
            }
        }
    };


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
                    "اساتذہ لوڈ ہو رہے ہیں..."
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


            const clear =
                App.first(
                    "clearTeacherFilters",
                    "clearAdminTeacherFilters"
                );


            if (clear) {

                clear.addEventListener(
                    "click",
                    function () {

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

                                        input.value =
                                            "";
                                    }
                                }
                            );


                        App.renderTeacherList();
                    }
                );
            }


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
   PART 2 END

   DO NOT ADD:
   })();

   PART 3 MUST CONTINUE DIRECTLY BELOW THIS.
   ===================================================== */


 /* =========================================================
   PART 3 / 4
   COMPLETE MANAGEMENT MODULES

   ADMIN:
   Attendance
   Exams & Marks
   Homework
   Announcements
   Teacher Notes
   Finance
   Madrassa Residence
   Promotion / Class Upgrade
   Student ID Cards
   Accounts / Approvals
   Settings

   TEACHER:
   Dashboard
   Students
   Marks
   Homework
   Announcements
   Feedback

   STUDENT:
   Dashboard
   Attendance
   Marks
   Homework
   Announcements
   ========================================================= */


/* =====================================================
   GENERAL MODULE HELPERS
   ===================================================== */

App.currentISODate =
    function () {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );
    };


App.toNumber =
    function (
        value,
        fallback = 0
    ) {

        const number =
            Number(value);


        return Number.isFinite(
            number
        )
            ? number
            : fallback;
    };


App.asArray =
    function (value) {

        if (
            Array.isArray(
                value
            )
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
                    value.items
                )
            ) {

                return value.items;
            }


            if (
                Array.isArray(
                    value.history
                )
            ) {

                return value.history;
            }
        }


        return [];
    };


App.bindOnce =
    function (
        node,
        key,
        eventName,
        handler
    ) {

        if (!node) {
            return;
        }


        const datasetKey =
            "bound" +
            key
                .charAt(0)
                .toUpperCase() +
            key.slice(1);


        if (
            node.dataset[
                datasetKey
            ] === "true"
        ) {

            return;
        }


        node.dataset[
            datasetKey
        ] =
            "true";


        node.addEventListener(
            eventName,
            handler
        );
    };


App.confirmAction =
    function (message) {

        return window.confirm(
            message
        );
    };


App.loadingHTML =
    function (
        text =
            "ریکارڈ لوڈ ہو رہا ہے..."
    ) {

        return App.empty(
            text
        );
    };


App.printCurrentPage =
    function () {

        window.print();
    };


/* =====================================================
   DATE RANGE HELPERS
   ===================================================== */

App.startOfWeek =
    function (date) {

        const result =
            new Date(date);


        const day =
            result.getDay();


        const diff =
            day === 0
                ? -6
                : 1 - day;


        result.setDate(
            result.getDate() +
            diff
        );


        result.setHours(
            0,
            0,
            0,
            0
        );


        return result;
    };


App.endOfWeek =
    function (date) {

        const result =
            App.startOfWeek(
                date
            );


        result.setDate(
            result.getDate() +
            6
        );


        result.setHours(
            23,
            59,
            59,
            999
        );


        return result;
    };


App.dateOnly =
    function (value) {

        if (!value) {
            return "";
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
            )
                .slice(
                    0,
                    10
                );
        }


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


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );
    };


App.setDateRangePreset =
    function (
        type,
        fromElement,
        toElement
    ) {

        if (
            !fromElement ||
            !toElement
        ) {
            return;
        }


        const now =
            new Date();


        let from =
            new Date(now);


        let to =
            new Date(now);


        if (
            type === "day"
        ) {

            /* today */


        } else if (
            type === "week"
        ) {

            from =
                App.startOfWeek(
                    now
                );


            to =
                App.endOfWeek(
                    now
                );


        } else if (
            type === "month"
        ) {

            from =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );


            to =
                new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0
                );


        } else if (
            type === "year"
        ) {

            from =
                new Date(
                    now.getFullYear(),
                    0,
                    1
                );


            to =
                new Date(
                    now.getFullYear(),
                    11,
                    31
                );
        }


        fromElement.value =
            App.dateOnly(
                from
            );


        toElement.value =
            App.dateOnly(
                to
            );
    };


/* =====================================================
   ATTENDANCE COMMON
   ===================================================== */

App.attendanceSummary =
    function (records) {

        const rows =
            Array.isArray(
                records
            )
                ? records
                : [];


        const result = {

            total:
                rows.length,

            present:
                0,

            absent:
                0,

            leave:
                0,

            late:
                0,

            percentage:
                "0.0"
        };


        rows.forEach(
            row => {

                const status =
                    App.safe(
                        row.status
                    )
                        .trim()
                        .toLowerCase();


                if (
                    status === "present" ||
                    status === "حاضر"
                ) {

                    result.present += 1;


                } else if (
                    status === "absent" ||
                    status === "غیر حاضر" ||
                    status === "غیرحاضر"
                ) {

                    result.absent += 1;


                } else if (
                    status === "leave" ||
                    status === "رخصت"
                ) {

                    result.leave += 1;


                } else if (
                    status === "late" ||
                    status === "تاخیر"
                ) {

                    result.late += 1;
                }
            }
        );


        if (
            result.total >
            0
        ) {

            result.percentage =
                (
                    result.present /
                    result.total *
                    100
                ).toFixed(1);
        }


        return result;
    };


App.applyAttendanceSummary =
    function (
        prefix,
        records
    ) {

        const summary =
            App.attendanceSummary(
                records
            );


        App.setText(
            prefix +
            "Total",
            summary.total,
            "0"
        );


        App.setText(
            prefix +
            "Present",
            summary.present,
            "0"
        );


        App.setText(
            prefix +
            "Absent",
            summary.absent,
            "0"
        );


        App.setText(
            prefix +
            "Leave",
            summary.leave,
            "0"
        );


        App.setText(
            prefix +
            "Late",
            summary.late,
            "0"
        );


        App.setText(
            prefix +
            "Percentage",
            summary.percentage +
            "%",
            "0.0%"
        );


        return summary;
    };


/* =====================================================
   ADMIN ATTENDANCE
   ===================================================== */

App.adminAttendanceRecords =
    [];


App.loadAdminAttendance =
    async function () {

        if (
            App.currentFile !==
            "admin-attendance.html"
        ) {

            return;
        }


        const body =
            App.first(
                "adminAttendanceBody",
                "attendanceTableBody"
            );


        try {

            App.adminAttendanceRecords =
                App.asArray(
                    await App.authedRpc(
                        "attendance_get_records",
                        {
                            p_date: null,
                            p_period: null,
                            p_class: null,
                            p_teacher_id: null
                        }
                    )
                );


            App.filterAdminAttendance();


        } catch (error) {

            console.error(
                "Admin attendance load:",
                error
            );


            if (body) {

                body.innerHTML = `
                    <tr>
                        <td colspan="9">
                            حاضری کا ریکارڈ لوڈ نہیں ہو سکا۔
                        </td>
                    </tr>
                `;
            }
        }
    };


App.filterAdminAttendance =
    function () {

        let records =
            Array.from(
                App.adminAttendanceRecords
            );


        const search =
            App.safe(
                App.first(
                    "adminAttendanceSearch",
                    "attendanceSearch"
                )?.value
            )
                .trim()
                .toLowerCase();


        const className =
            App.safe(
                App.first(
                    "adminAttendanceClass",
                    "attendanceClassFilter"
                )?.value
            ).trim();


        const status =
            App.safe(
                App.first(
                    "adminAttendanceStatus",
                    "attendanceStatusFilter"
                )?.value
            )
                .trim()
                .toLowerCase();


        const teacher =
            App.safe(
                App.first(
                    "adminAttendanceTeacher",
                    "attendanceTeacherFilter"
                )?.value
            ).trim();


        const from =
            App.safe(
                App.first(
                    "adminAttendanceFrom",
                    "attendanceDateFrom"
                )?.value
            ).trim();


        const to =
            App.safe(
                App.first(
                    "adminAttendanceTo",
                    "attendanceDateTo"
                )?.value
            ).trim();


        records =
            records.filter(
                row => {

                    const rowDate =
                        App.dateOnly(
                            row.attendance_date
                        );


                    if (
                        from &&
                        rowDate <
                        from
                    ) {
                        return false;
                    }


                    if (
                        to &&
                        rowDate >
                        to
                    ) {
                        return false;
                    }


                    if (
                        className &&
                        App.safe(
                            row.student_class
                        ) !==
                        className
                    ) {

                        return false;
                    }


                    if (
                        status &&
                        App.safe(
                            row.status
                        )
                            .toLowerCase() !==
                        status
                    ) {

                        return false;
                    }


                    if (
                        teacher &&
                        App.safe(
                            row.teacher_id
                        ) !==
                        teacher
                    ) {

                        return false;
                    }


                    if (search) {

                        const haystack =
                            [
                                row.student_id,
                                row.student_name,
                                row.teacher_id,
                                row.teacher_name,
                                row.student_class,
                                row.subject,
                                row.period_number,
                                row.note,
                                row.status
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
                            !haystack.includes(
                                search
                            )
                        ) {

                            return false;
                        }
                    }


                    return true;
                }
            );


        App.renderAdminAttendance(
            records
        );
    };


App.renderAdminAttendance =
    function (records) {

        records =
            Array.isArray(
                records
            )
                ? records
                : [];


        App.applyAttendanceSummary(
            "adminAttendance",
            records
        );


        const body =
            App.first(
                "adminAttendanceBody",
                "attendanceTableBody"
            );


        if (!body) {
            return;
        }


        body.innerHTML =
            records.length
                ? records
                    .map(
                        row => `
                            <tr>

                                <td>
                                    ${App.escape(
                                        App.date(
                                            row.attendance_date
                                        )
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.student_name ||
                                        row.student_id ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.student_class ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.period_number ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.teacher_name ||
                                        row.teacher_id ||
                                        "—"
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
                                        "—"
                                    )}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        data-admin-attendance-edit="${
                                            Number(
                                                row.id
                                            )
                                        }"
                                    >
                                        ترمیم
                                    </button>

                                </td>

                            </tr>
                        `
                    )
                    .join("")
                : `
                    <tr>
                        <td colspan="8">
                            کوئی حاضری ریکارڈ موجود نہیں۔
                        </td>
                    </tr>
                `;


        body
            .querySelectorAll(
                "[data-admin-attendance-edit]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            App.editAdminAttendance(
                                Number(
                                    button.dataset
                                        .adminAttendanceEdit
                                )
                            );
                        }
                    );
                }
            );
    };


App.editAdminAttendance =
    async function (
        attendanceId
    ) {

        const record =
            App.adminAttendanceRecords
                .find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            attendanceId
                        )
                );


        if (!record) {

            alert(
                "حاضری کا ریکارڈ نہیں ملا۔"
            );

            return;
        }


        const overlay =
            App.openGeneratedPanel(
                "generatedAttendanceEdit",
                "حاضری میں ترمیم",
                `
                    <form id="generatedAttendanceEditForm">

                        <label>
                            حالت

                            <select id="generatedAttendanceStatus">

                                <option
                                    value="present"
                                    ${
                                        App.safe(
                                            record.status
                                        ) === "present"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    حاضر
                                </option>

                                <option
                                    value="absent"
                                    ${
                                        App.safe(
                                            record.status
                                        ) === "absent"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    غیر حاضر
                                </option>

                                <option
                                    value="leave"
                                    ${
                                        App.safe(
                                            record.status
                                        ) === "leave"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    رخصت
                                </option>

                                <option
                                    value="late"
                                    ${
                                        App.safe(
                                            record.status
                                        ) === "late"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    تاخیر
                                </option>

                            </select>

                        </label>

                        <label>
                            نوٹ

                            <textarea
                                id="generatedAttendanceNote"
                            >${App.escape(
                                record.note ||
                                ""
                            )}</textarea>

                        </label>

                        <button type="submit">
                            محفوظ کریں
                        </button>

                    </form>
                `
            );


        overlay
            .querySelector(
                "#generatedAttendanceEditForm"
            )
            ?.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    try {

                        await App.authedRpc(
                            "admin_update_attendance",
                            {
                                p_attendance_id:
                                    Number(
                                        attendanceId
                                    ),

                                p_status:
                                    App.val(
                                        "generatedAttendanceStatus"
                                    ),

                                p_note:
                                    App.val(
                                        "generatedAttendanceNote"
                                    ) ||
                                    null
                            }
                        );


                        alert(
                            "حاضری اپڈیٹ ہوگئی۔"
                        );


                        overlay.remove();


                        await App
                            .loadAdminAttendance();


                    } catch (error) {

                        console.error(
                            "Attendance update:",
                            error
                        );


                        alert(
                            error?.message ||
                            "حاضری اپڈیٹ نہیں ہو سکی۔"
                        );
                    }
                }
            );
    };


App.initAdminAttendance =
    async function () {

        if (
            App.currentFile !==
            "admin-attendance.html"
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


        [
            "adminAttendanceSearch",
            "attendanceSearch",
            "adminAttendanceClass",
            "attendanceClassFilter",
            "adminAttendanceStatus",
            "attendanceStatusFilter",
            "adminAttendanceTeacher",
            "attendanceTeacherFilter",
            "adminAttendanceFrom",
            "attendanceDateFrom",
            "adminAttendanceTo",
            "attendanceDateTo"
        ]
            .forEach(
                id => {

                    const node =
                        App.el(id);


                    if (!node) {
                        return;
                    }


                    node.addEventListener(
                        "input",
                        App.filterAdminAttendance
                    );


                    node.addEventListener(
                        "change",
                        App.filterAdminAttendance
                    );
                }
            );


        const from =
            App.first(
                "adminAttendanceFrom",
                "attendanceDateFrom"
            );


        const to =
            App.first(
                "adminAttendanceTo",
                "attendanceDateTo"
            );


        const presets = {

            attendanceDayButton:
                "day",

            adminAttendanceDay:
                "day",

            attendanceWeekButton:
                "week",

            adminAttendanceWeek:
                "week",

            attendanceMonthButton:
                "month",

            adminAttendanceMonth:
                "month",

            attendanceYearButton:
                "year",

            adminAttendanceYear:
                "year"
        };


        Object.entries(
            presets
        )
            .forEach(
                ([id, range]) => {

                    const button =
                        App.el(id);


                    if (!button) {
                        return;
                    }


                    button.addEventListener(
                        "click",
                        function () {

                            App.setDateRangePreset(
                                range,
                                from,
                                to
                            );


                            App.filterAdminAttendance();
                        }
                    );
                }
            );


        const printButton =
            App.first(
                "adminAttendancePrint",
                "attendancePrintButton"
            );


        if (printButton) {

            printButton.addEventListener(
                "click",
                App.printCurrentPage
            );
        }


        await App.loadAdminAttendance();
    };


/* =====================================================
   TEACHER ATTENDANCE ENTRY
   ===================================================== */

App.attendanceStudents =
    [];

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


        const date =
            App.first(
                "attendanceDate",
                "teacherAttendanceDate"
            );


        if (
            date &&
            !date.value
        ) {

            date.value =
                App.currentISODate();
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


        const bulkMap = {

            markAllPresent:
                "present",

            attendanceMarkAllPresent:
                "present",

            markAllAbsent:
                "absent",

            attendanceMarkAllAbsent:
                "absent",

            markAllLeave:
                "leave",

            attendanceMarkAllLeave:
                "leave"
        };


        Object.entries(
            bulkMap
        )
            .forEach(
                ([id, value]) => {

                    const button =
                        App.el(id);


                    if (!button) {
                        return;
                    }


                    button.addEventListener(
                        "click",
                        function () {

                            document
                                .querySelectorAll(
                                    "[data-attendance-status]"
                                )
                                .forEach(
                                    select => {

                                        select.value =
                                            value;
                                    }
                                );
                        }
                    );
                }
            );
    };


App.loadAttendanceStudents =
    async function () {

        const className =
            App.safe(
                App.first(
                    "attendanceClass",
                    "teacherAttendanceClass"
                )?.value
            ).trim();


        if (!className) {

            alert(
                "کلاس منتخب کریں۔"
            );

            return;
        }


        try {

            const response =
                await App.authedRpc(
                    "attendance_get_students",
                    {
                        p_class:
                            className
                    }
                );


            App.attendanceStudents =
                App.asArray(
                    response
                );


            App.renderAttendanceStudents();


        } catch (error) {

            console.error(
                "Attendance students:",
                error
            );


            alert(
                error?.message ||
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


        const students =
            App.attendanceStudents;


        if (!students.length) {

            container.innerHTML =
                App.empty(
                    "اس کلاس میں کوئی طالبہ موجود نہیں۔"
                );

            return;
        }


        const rows =
            students
                .map(
                    student => {

                        const studentId =
                            Number(
                                student.student_id ||
                                student.id
                            );


                        return `
                            <tr>

                                <td>
                                    ${App.escape(
                                        student.admission_no ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        student.student_name ||
                                        student.name ||
                                        "—"
                                    )}
                                </td>

                                <td>

                                    <select
                                        data-attendance-status
                                        data-student-id="${studentId}"
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

                                </td>

                                <td>

                                    <input
                                        type="text"
                                        data-attendance-note
                                        data-student-id="${studentId}"
                                        placeholder="نوٹ"
                                    >

                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");


        if (
            container.tagName
                .toLowerCase() ===
            "tbody"
        ) {

            container.innerHTML =
                rows;


        } else {

            container.innerHTML = `
                <div class="table-responsive">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    داخلہ نمبر
                                </th>

                                <th>
                                    طالبہ
                                </th>

                                <th>
                                    حاضری
                                </th>

                                <th>
                                    نوٹ
                                </th>

                            </tr>

                        </thead>

                        <tbody>
                            ${rows}
                        </tbody>

                    </table>

                </div>
            `;
        }
    };


App.saveAttendance =
    async function () {

        const className =
            App.safe(
                App.first(
                    "attendanceClass",
                    "teacherAttendanceClass"
                )?.value
            ).trim();


        const attendanceDate =
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
            !className ||
            !attendanceDate ||
            !period
        ) {

            alert(
                "تاریخ، کلاس اور پیریڈ منتخب کریں۔"
            );

            return;
        }


        const selects =
            Array.from(
                document
                    .querySelectorAll(
                        "[data-attendance-status]"
                    )
            );


        if (!selects.length) {

            alert(
                "پہلے طالبات لوڈ کریں۔"
            );

            return;
        }


        const rows =
            selects.map(
                select => {

                    const studentId =
                        Number(
                            select.dataset
                                .studentId
                        );


                    const note =
                        document.querySelector(
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
                                ).trim() ||
                                null
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
                        attendanceDate,

                    p_period:
                        period,

                    p_class:
                        className,

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
                error?.message ||
                "حاضری محفوظ نہیں ہو سکی۔"
            );
        }
    };


/* =====================================================
   STUDENT MY ATTENDANCE
   ===================================================== */

App.myAttendanceRecords =
    [];


App.renderMyAttendance =
    function (
        records
    ) {

        records =
            Array.isArray(
                records
            )
                ? records
                : [];


        App.applyAttendanceSummary(
            "myAttendance",
            records
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
            records.length
                ? records
                    .map(
                        row => `
                            <tr>

                                <td>
                                    ${App.escape(
                                        App.date(
                                            row.attendance_date
                                        )
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.student_class ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.subject ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.period_number ||
                                        "—"
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
                                        "—"
                                    )}
                                </td>

                            </tr>
                        `
                    )
                    .join("")
                : `
                    <tr>
                        <td colspan="6">
                            کوئی حاضری ریکارڈ موجود نہیں۔
                        </td>
                    </tr>
                `;
    };


App.filterMyAttendance =
    function () {

        const date =
            App.safe(
                App.first(
                    "myAttendanceDate",
                    "studentAttendanceDateFilter"
                )?.value
            ).trim();


        const period =
            App.safe(
                App.first(
                    "myAttendancePeriod",
                    "studentAttendancePeriodFilter"
                )?.value
            ).trim();


        const subject =
            App.safe(
                App.first(
                    "myAttendanceSubject",
                    "studentAttendanceSubjectFilter"
                )?.value
            )
                .trim()
                .toLowerCase();


        const records =
            App.myAttendanceRecords
                .filter(
                    row => {

                        if (
                            date &&
                            App.dateOnly(
                                row.attendance_date
                            ) !==
                            date
                        ) {

                            return false;
                        }


                        if (
                            period &&
                            App.safe(
                                row.period_number
                            ) !==
                            period
                        ) {

                            return false;
                        }


                        if (
                            subject &&
                            !App.safe(
                                row.subject
                            )
                                .toLowerCase()
                                .includes(
                                    subject
                                )
                        ) {

                            return false;
                        }


                        return true;
                    }
                );


        App.renderMyAttendance(
            records
        );
    };


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


        if (!studentId) {
            return;
        }


        try {

            App.myAttendanceRecords =
                App.asArray(
                    await App.authedRpc(
                        "attendance_get_student",
                        {
                            p_date: null,
                            p_subject: null,
                            p_period: null
                        }
                    )
                );


            App.renderMyAttendance(
                App.myAttendanceRecords
            );


            [
                "myAttendanceDate",
                "studentAttendanceDateFilter",
                "myAttendancePeriod",
                "studentAttendancePeriodFilter",
                "myAttendanceSubject",
                "studentAttendanceSubjectFilter"
            ]
                .forEach(
                    id => {

                        const node =
                            App.el(id);


                        if (!node) {
                            return;
                        }


                        node.addEventListener(
                            "change",
                            App.filterMyAttendance
                        );


                        node.addEventListener(
                            "input",
                            App.filterMyAttendance
                        );
                    }
                );


        } catch (error) {

            console.error(
                "My attendance:",
                error
            );
        }
    };


/* =====================================================
   MARKS COMMON
   ===================================================== */

App.calculateMarks =
    function (
        records
    ) {

        const rows =
            Array.isArray(
                records
            )
                ? records
                : [];


        const total =
            rows.reduce(
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
            rows.reduce(
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


        return {

            records:
                rows.length,

            total:
                total,

            obtained:
                obtained,

            percentage:
                total > 0
                    ? (
                        obtained /
                        total *
                        100
                    ).toFixed(1)
                    : "0.0"
        };
    };


/* =====================================================
   ADMIN EXAM / MARKS
   ===================================================== */

App.adminMarksRecords =
    [];


App.renderAdminMarks =
    function (
        records
    ) {

        records =
            Array.isArray(
                records
            )
                ? records
                : [];


        const summary =
            App.calculateMarks(
                records
            );


        App.setText(
            "adminMarksTotalRecords",
            summary.records,
            "0"
        );


        App.setText(
            "adminMarksTotalMarks",
            summary.total,
            "0"
        );


        App.setText(
            "adminMarksObtained",
            summary.obtained,
            "0"
        );


        App.setText(
            "adminMarksPercentage",
            summary.percentage +
            "%",
            "0.0%"
        );


        const body =
            App.first(
                "adminMarksBody",
                "marksTableBody"
            );


        if (!body) {
            return;
        }


        body.innerHTML =
            records.length
                ? records
                    .map(
                        row => {

                            const total =
                                Number(
                                    row.total_marks ||
                                    0
                                );


                            const obtained =
                                Number(
                                    row.obtained_marks ||
                                    0
                                );


                            const percentage =
                                total > 0
                                    ? (
                                        obtained /
                                        total *
                                        100
                                    ).toFixed(1)
                                    : "0.0";


                            return `
                                <tr>

                                    <td>
                                        ${App.escape(
                                            row.student_name ||
                                            row.student_id ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            row.student_class ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            row.exam_name ||
                                            row.exam_type ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            row.subject_name ||
                                            row.subject ||
                                            row.subject_id ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${obtained}
                                    </td>

                                    <td>
                                        ${total}
                                    </td>

                                    <td>
                                        ${percentage}%
                                    </td>

                                    <td>
                                        ${App.escape(
                                            App.date(
                                                row.exam_date
                                            )
                                        )}
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            data-mark-edit="${
                                                Number(
                                                    row.id
                                                )
                                            }"
                                        >
                                            ترمیم
                                        </button>

                                        <button
                                            type="button"
                                            data-mark-student-print="${
                                                Number(
                                                    row.student_id
                                                )
                                            }"
                                        >
                                            مارک شیٹ
                                        </button>

                                    </td>

                                </tr>
                            `;
                        }
                    )
                    .join("")
                : `
                    <tr>
                        <td colspan="9">
                            کوئی نتیجہ موجود نہیں۔
                        </td>
                    </tr>
                `;


        body
            .querySelectorAll(
                "[data-mark-edit]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            App.editMarksRecord(
                                Number(
                                    button.dataset
                                        .markEdit
                                )
                            );
                        }
                    );
                }
            );


        body
            .querySelectorAll(
                "[data-mark-student-print]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            App.openPrintProfile(
                                "student",
                                Number(
                                    button.dataset
                                        .markStudentPrint
                                )
                            );
                        }
                    );
                }
            );
    };


App.filterAdminMarks =
    function () {

        const search =
            App.safe(
                App.first(
                    "adminMarksSearch",
                    "marksSearch"
                )?.value
            )
                .trim()
                .toLowerCase();


        const className =
            App.val(
                "adminMarksClassFilter"
            );


        const exam =
            App.val(
                "adminMarksExamFilter"
            )
                .toLowerCase();


        const subject =
            App.val(
                "adminMarksSubjectFilter"
            )
                .toLowerCase();


        const teacher =
            App.val(
                "adminMarksTeacherFilter"
            );


        const date =
            App.val(
                "adminMarksDateFilter"
            );


        const records =
            App.adminMarksRecords
                .filter(
                    row => {

                        if (
                            className &&
                            App.safe(
                                row.student_class
                            ) !==
                            className
                        ) {

                            return false;
                        }


                        if (
                            teacher &&
                            App.safe(
                                row.teacher_id
                            ) !==
                            teacher
                        ) {

                            return false;
                        }


                        if (
                            date &&
                            App.dateOnly(
                                row.exam_date
                            ) !==
                            date
                        ) {

                            return false;
                        }


                        if (exam) {

                            const examText =
                                (
                                    App.safe(
                                        row.exam_name
                                    ) +
                                    " " +
                                    App.safe(
                                        row.exam_type
                                    )
                                )
                                    .toLowerCase();


                            if (
                                !examText.includes(
                                    exam
                                )
                            ) {

                                return false;
                            }
                        }


                        if (subject) {

                            const subjectText =
                                (
                                    App.safe(
                                        row.subject
                                    ) +
                                    " " +
                                    App.safe(
                                        row.subject_name
                                    ) +
                                    " " +
                                    App.safe(
                                        row.subject_id
                                    )
                                )
                                    .toLowerCase();


                            if (
                                !subjectText.includes(
                                    subject
                                )
                            ) {

                                return false;
                            }
                        }


                        if (search) {

                            const text =
                                [
                                    row.student_name,
                                    row.student_id,
                                    row.student_class,
                                    row.exam_name,
                                    row.exam_type,
                                    row.subject,
                                    row.subject_name,
                                    row.teacher_name,
                                    row.note
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
                                !text.includes(
                                    search
                                )
                            ) {

                                return false;
                            }
                        }


                        return true;
                    }
                );


        App.renderAdminMarks(
            records
        );
    };


App.loadAdminMarks =
    async function () {

        try {

            App.adminMarksRecords =
                App.asArray(
                    await App.authedRpc(
                        "marks_get_manage",
                        {
                            p_student_id: null
                        }
                    )
                );


            App.filterAdminMarks();


        } catch (error) {

            console.error(
                "Marks load:",
                error
            );
        }
    };


App.editMarksRecord =
    async function (
        markId
    ) {

        const record =
            App.adminMarksRecords
                .find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            markId
                        )
                );


        if (!record) {

            alert(
                "نمبرات کا ریکارڈ نہیں ملا۔"
            );

            return;
        }


        const overlay =
            App.openGeneratedPanel(
                "generatedMarksEdit",
                "نمبرات میں ترمیم",
                `
                    <form id="generatedMarksEditForm">

                        <label>
                            حاصل کردہ نمبر

                            <input
                                id="generatedObtainedMarks"
                                type="number"
                                min="0"
                                value="${App.escape(
                                    record.obtained_marks
                                )}"
                                required
                            >

                        </label>

                        <label>
                            کل نمبر

                            <input
                                id="generatedTotalMarks"
                                type="number"
                                min="1"
                                value="${App.escape(
                                    record.total_marks
                                )}"
                                required
                            >

                        </label>

                        <label>
                            نوٹ

                            <textarea
                                id="generatedMarksNote"
                            >${App.escape(
                                record.note ||
                                ""
                            )}</textarea>

                        </label>

                        <button type="submit">
                            محفوظ کریں
                        </button>

                    </form>
                `
            );


        overlay
            .querySelector(
                "#generatedMarksEditForm"
            )
            ?.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const obtained =
                        Number(
                            App.val(
                                "generatedObtainedMarks"
                            )
                        );


                    const total =
                        Number(
                            App.val(
                                "generatedTotalMarks"
                            )
                        );


                    if (
                        !Number.isFinite(
                            obtained
                        ) ||
                        !Number.isFinite(
                            total
                        ) ||
                        total <= 0 ||
                        obtained < 0 ||
                        obtained > total
                    ) {

                        alert(
                            "نمبرات درست درج کریں۔"
                        );

                        return;
                    }


                    try {

                        await App.authedRpc(
                            "admin_update_marks",
                            {
                                p_marks_id:
                                    Number(
                                        markId
                                    ),

                                p_obtained_marks:
                                    obtained,

                                p_total_marks:
                                    total,

                                p_note:
                                    App.val(
                                        "generatedMarksNote"
                                    ) ||
                                    null
                            }
                        );


                        alert(
                            "نمبرات اپڈیٹ ہوگئے۔"
                        );


                        overlay.remove();


                        await App.loadAdminMarks();


                    } catch (error) {

                        console.error(
                            "Marks update:",
                            error
                        );


                        alert(
                            error?.message ||
                            "نمبرات اپڈیٹ نہیں ہو سکے۔"
                        );
                    }
                }
            );
    };


App.initAdminMarks =
    async function () {

        if (
            App.currentFile !==
            "admin-marks.html"
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


        [
            "adminMarksSearch",
            "marksSearch",
            "adminMarksClassFilter",
            "adminMarksExamFilter",
            "adminMarksSubjectFilter",
            "adminMarksTeacherFilter",
            "adminMarksDateFilter"
        ]
            .forEach(
                id => {

                    const node =
                        App.el(id);


                    if (!node) {
                        return;
                    }


                    node.addEventListener(
                        "input",
                        App.filterAdminMarks
                    );


                    node.addEventListener(
                        "change",
                        App.filterAdminMarks
                    );
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
                        "adminMarksSearch",
                        "marksSearch",
                        "adminMarksClassFilter",
                        "adminMarksExamFilter",
                        "adminMarksSubjectFilter",
                        "adminMarksTeacherFilter",
                        "adminMarksDateFilter"
                    ]
                        .forEach(
                            id => {

                                const node =
                                    App.el(id);


                                if (node) {

                                    node.value =
                                        "";
                                }
                            }
                        );


                    App.filterAdminMarks();
                }
            );
        }


        const print =
            App.first(
                "adminMarksPrint",
                "marksPrintButton"
            );


        if (print) {

            print.addEventListener(
                "click",
                App.printCurrentPage
            );
        }


        await App.loadAdminMarks();
    };


/* =====================================================
   STUDENT MY MARKS
   ===================================================== */

App.myMarksRecords =
    [];


App.renderMyMarks =
    function (
        records
    ) {

        records =
            Array.isArray(
                records
            )
                ? records
                : [];


        const summary =
            App.calculateMarks(
                records
            );


        App.setText(
            "myMarksTotal",
            summary.total,
            "0"
        );


        App.setText(
            "myMarksObtained",
            summary.obtained,
            "0"
        );


        App.setText(
            "myMarksPercentage",
            summary.percentage +
            "%",
            "0.0%"
        );


        App.setText(
            "studentMarksTotalRecords",
            summary.records,
            "0"
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
            records.length
                ? records
                    .map(
                        row => {

                            const total =
                                Number(
                                    row.total_marks ||
                                    0
                                );


                            const obtained =
                                Number(
                                    row.obtained_marks ||
                                    0
                                );


                            return `
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
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            row.student_class ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            row.subject ||
                                            row.subject_name ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${obtained}
                                    </td>

                                    <td>
                                        ${total}
                                    </td>

                                    <td>
                                        ${
                                            total > 0
                                                ? (
                                                    obtained /
                                                    total *
                                                    100
                                                ).toFixed(1)
                                                : "0.0"
                                        }%
                                    </td>

                                    <td>
                                        ${App.escape(
                                            row.note ||
                                            "—"
                                        )}
                                    </td>

                                </tr>
                            `;
                        }
                    )
                    .join("")
                : `
                    <tr>
                        <td colspan="8">
                            کوئی نتیجہ موجود نہیں۔
                        </td>
                    </tr>
                `;
    };


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


        if (!studentId) {
            return;
        }


        try {

            App.myMarksRecords =
                App.asArray(
                    await App.authedRpc(
                        "marks_get_student"
                    )
                );


            App.renderMyMarks(
                App.myMarksRecords
            );


        } catch (error) {

            console.error(
                "My marks:",
                error
            );
        }
    };


/* =====================================================
   HOMEWORK - STUDENT
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

            const homework =
                App.asArray(
                    await App.authedRpc(
                        "homework_get_student"
                    )
                )
                    .map(
                        item => ({
                            ...item,
                            id: item.id || item.homework_id
                        })
                    );


            const submissions =
                homework.filter(
                    item =>
                        item.submission_id
                );


            const submissionMap =
                new Map(
                    submissions.map(
                        item => [
                            Number(item.homework_id),
                            {
                                id: item.submission_id,
                                status: item.submission_status,
                                teacher_note: item.teacher_note
                            }
                        ]
                    )
                );


            container.innerHTML =
                homework.length
                    ? homework
                        .map(
                            item => {

                                const submission =
                                    submissionMap.get(
                                        Number(
                                            item.id
                                        )
                                    );


                                return `
                                    <article class="portal-card homework-card">

                                        <h3>
                                            ${App.escape(
                                                item.title ||
                                                "ہوم ورک"
                                            )}
                                        </h3>

                                        <p>
                                            ${App.escape(
                                                item.description ||
                                                ""
                                            )}
                                        </p>

                                        <p>
                                            کلاس:
                                            ${App.escape(
                                                item.student_class ||
                                                "—"
                                            )}
                                        </p>

                                        <p>
                                            جاری:
                                            ${App.escape(
                                                App.date(
                                                    item.assigned_date
                                                )
                                            )}
                                        </p>

                                        <p>
                                            آخری تاریخ:
                                            ${App.escape(
                                                App.date(
                                                    item.due_date
                                                )
                                            )}
                                        </p>

                                        <p>
                                            حالت:
                                            <strong>
                                                ${App.escape(
                                                    App.statusUrdu(
                                                        submission?.status ||
                                                        "pending"
                                                    )
                                                )}
                                            </strong>
                                        </p>

                                        ${
                                            submission?.teacher_note
                                                ? `
                                                    <p>
                                                        استاد کا نوٹ:
                                                        ${App.escape(
                                                            submission.teacher_note
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
                                            }"
                                        >
                                            ہوم ورک جمع کریں
                                        </button>

                                    </article>
                                `;
                            }
                        )
                        .join("")
                    : App.empty(
                        "کوئی ہوم ورک موجود نہیں۔"
                    );


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

        const text =
            window.prompt(
                "ہوم ورک کا جواب درج کریں:",
                ""
            );


        if (
            text ===
            null
        ) {

            return;
        }


        if (
            !text.trim()
        ) {

            alert(
                "جواب درج کریں۔"
            );

            return;
        }


        try {

            await App.authedRpc(
                "homework_submit",
                {
                    p_homework_id:
                        Number(
                            homeworkId
                        ),

                    p_submission_text:
                        text.trim(),

                    p_attachment_url:
                        null
                }
            );


            alert(
                "ہوم ورک جمع ہوگیا۔"
            );


            await App.loadStudentHomework();


        } catch (error) {

            console.error(
                "Submit homework:",
                error
            );


            alert(
                error?.message ||
                "ہوم ورک جمع نہیں ہو سکا۔"
            );
        }
    };


/* =====================================================
   ADMIN HOMEWORK
   ===================================================== */

App.adminHomeworkRecords =
    [];


App.renderAdminHomework =
    function (
        records
    ) {

        const container =
            App.first(
                "adminHomeworkList",
                "homeworkAdminList"
            );


        if (!container) {
            return;
        }


        records =
            Array.isArray(
                records
            )
                ? records
                : [];


        container.innerHTML =
            records.length
                ? records
                    .map(
                        item => `
                            <article class="record-card">

                                <h3>
                                    ${App.escape(
                                        item.title ||
                                        "ہوم ورک"
                                    )}
                                </h3>

                                <p>
                                    کلاس:
                                    ${App.escape(
                                        item.student_class ||
                                        "—"
                                    )}
                                </p>

                                <p>
                                    ${App.escape(
                                        item.description ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    آخری تاریخ:
                                    ${App.escape(
                                        App.date(
                                            item.due_date
                                        )
                                    )}
                                </p>

                                <div class="record-card-actions">

                                    <button
                                        type="button"
                                        data-homework-edit="${
                                            Number(
                                                item.id
                                            )
                                        }"
                                    >
                                        ترمیم
                                    </button>

                                    <button
                                        type="button"
                                        data-homework-submissions="${
                                            Number(
                                                item.id
                                            )
                                        }"
                                    >
                                        جمع شدہ ہوم ورک
                                    </button>

                                </div>

                            </article>
                        `
                    )
                    .join("")
                : App.empty(
                    "کوئی ہوم ورک موجود نہیں۔"
                );


        container
            .querySelectorAll(
                "[data-homework-submissions]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            App.openHomeworkSubmissions(
                                Number(
                                    button.dataset
                                        .homeworkSubmissions
                                )
                            );
                        }
                    );
                }
            );
    };


App.openHomeworkSubmissions =
    async function (
        homeworkId
    ) {

        const overlay =
            App.openGeneratedPanel(
                "generatedHomeworkSubmissions",
                "جمع شدہ ہوم ورک",
                App.loadingHTML()
            );


        try {

                const records =
                    App.asArray(
                        await App.authedRpc(
                            "homework_get_submissions",
                            {
                                p_homework_id:
                                    Number(homeworkId)
                            }
                        )
                    );


            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );


            if (!body) {
                return;
            }


            body.innerHTML =
                records.length
                    ? records
                        .map(
                            item => `
                                <article class="record-card">

                                    <p>
                                        طالبہ:
                                        ${App.escape(
                                            item.student_name ||
                                            item.student_id ||
                                            "—"
                                        )}
                                    </p>

                                    <p>
                                        ${App.escape(
                                            item.submission_text ||
                                            ""
                                        )}
                                    </p>

                                    <p>
                                        حالت:
                                        ${App.escape(
                                            App.statusUrdu(
                                                item.status
                                            )
                                        )}
                                    </p>

                                    <p>
                                        استاد نوٹ:
                                        ${App.escape(
                                            item.teacher_note ||
                                            "—"
                                        )}
                                    </p>

                                    <button
                                        type="button"
                                        data-submission-check="${
                                            Number(
                                                item.id
                                            )
                                        }"
                                    >
                                        چیک / منظور
                                    </button>

                                </article>
                            `
                        )
                        .join("")
                    : App.empty(
                        "ابھی کوئی ہوم ورک جمع نہیں ہوا۔"
                    );


        } catch (error) {

            console.error(
                "Homework submissions:",
                error
            );
        }
    };


App.loadAdminHomework =
    async function () {

        try {

            App.adminHomeworkRecords =
                App.asArray(
                    await App.authedRpc(
                        "homework_get_manage"
                    )
                )
                    .map(
                        item => ({
                            ...item,
                            id: item.id || item.homework_id
                        })
                    );


            App.renderAdminHomework(
                App.adminHomeworkRecords
            );


        } catch (error) {

            console.error(
                "Admin homework:",
                error
            );
        }
    };


App.initAdminHomework =
    async function () {

        if (
            App.currentFile !==
            "admin-homework.html"
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


        await App.loadAdminHomework();
    };


/* =====================================================
   ANNOUNCEMENTS - STUDENT
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

            const records =
                App.asArray(
                    await App.authedRpc(
                        "announcement_get_student"
                    )
                );


            const filtered = records;


            container.innerHTML =
                filtered.length
                    ? filtered
                        .map(
                            item => `
                                <article class="portal-card">

                                    <h3>
                                        ${App.escape(
                                            item.title ||
                                            "اعلان"
                                        )}
                                    </h3>

                                    <p>
                                        ${App.escape(
                                            item.message ||
                                            ""
                                        )}
                                    </p>

                                    <small>
                                        ${App.escape(
                                            App.dateTime(
                                                item.created_at
                                            )
                                        )}
                                    </small>

                                </article>
                            `
                        )
                        .join("")
                    : App.empty(
                        "کوئی اعلان موجود نہیں۔"
                    );


        } catch (error) {

            console.error(
                "Student announcements:",
                error
            );
        }
    };


/* =====================================================
   ADMIN ANNOUNCEMENTS
   ===================================================== */

App.adminAnnouncementRecords =
    [];


App.renderAdminAnnouncements =
    function (
        records
    ) {

        const container =
            App.first(
                "adminAnnouncementsList",
                "announcementAdminList"
            );


        if (!container) {
            return;
        }


        records =
            Array.isArray(
                records
            )
                ? records
                : [];


        container.innerHTML =
            records.length
                ? records
                    .map(
                        item => `
                            <article class="record-card">

                                <h3>
                                    ${App.escape(
                                        item.title ||
                                        "اعلان"
                                    )}
                                </h3>

                                <p>
                                    ${App.escape(
                                        item.message ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    ${
                                        item.student_class
                                            ? "کلاس: " +
                                            App.escape(
                                                item.student_class
                                            )
                                            : "تمام کلاسیں"
                                    }
                                </p>

                                <small>
                                    ${App.escape(
                                        App.dateTime(
                                            item.created_at
                                        )
                                    )}
                                </small>

                                <div class="record-card-actions">

                                    <button
                                        type="button"
                                        data-announcement-edit="${
                                            Number(
                                                item.id
                                            )
                                        }"
                                    >
                                        ترمیم
                                    </button>

                                    <button
                                        type="button"
                                        data-announcement-print="${
                                            Number(
                                                item.id
                                            )
                                        }"
                                    >
                                        پرنٹ
                                    </button>

                                </div>

                            </article>
                        `
                    )
                    .join("")
                : App.empty(
                    "کوئی اعلان موجود نہیں۔"
                );


        container
            .querySelectorAll(
                "[data-announcement-print]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        App.printCurrentPage
                    );
                }
            );
    };


App.loadAdminAnnouncements =
    async function () {

        try {

            App.adminAnnouncementRecords =
                App.asArray(
                    await App.authedRpc(
                        "announcement_get_manage"
                    )
                )
                    .map(
                        item => ({
                            ...item,
                            id: item.id || item.announcement_id
                        })
                    );


            App.renderAdminAnnouncements(
                App.adminAnnouncementRecords
            );


        } catch (error) {

            console.error(
                "Admin announcements:",
                error
            );
        }
    };


App.initAdminAnnouncements =
    async function () {

        if (
            App.currentFile !==
            "admin-announcements.html"
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


        await App
            .loadAdminAnnouncements();
    };


/* =====================================================
   TEACHER NOTES / FEEDBACK - ADMIN
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
                App.asArray(
                    await App.authedRpc(
                        "admin_get_feedback"
                    )
                );


            body.innerHTML =
                records.length
                    ? records
                        .map(
                            item => `
                                <tr>

                                    <td>
                                        ${App.escape(
                                            item.student_id ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            item.teacher_id ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            item.rating ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            item.feedback_text ||
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        ${App.escape(
                                            App.date(
                                                item.feedback_date ||
                                                item.created_at
                                            )
                                        )}
                                    </td>

                                </tr>
                            `
                        )
                        .join("")
                    : `
                        <tr>
                            <td colspan="5">
                                کوئی استاد نوٹ موجود نہیں۔
                            </td>
                        </tr>
                    `;


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
   FINANCE
   ===================================================== */

App.financeData =
    null;


App.loadFinance =
    async function () {

        if (
            App.currentFile !==
            "admin-finance.html"
        ) {

            return;
        }


        try {

            const data =
                await App.authedRpc(
                    "admin_finance_dashboard"
                );


            App.financeData =
                data;


            App.setText(
                "financeCurrentBalance",
                App.money(
                    data?.current_balance ||
                    0
                ),
                "0 PKR"
            );


            App.setText(
                "financeTotalReceived",
                App.money(
                    data?.total_received ||
                    0
                ),
                "0 PKR"
            );


            App.setText(
                "financeTotalPaid",
                App.money(
                    data?.total_paid ||
                    0
                ),
                "0 PKR"
            );


            App.setText(
                "financeGeneralBalance",
                App.money(
                    data?.general_balance ||
                    0
                ),
                "0 PKR"
            );


            App.setText(
                "financeRestrictedBalance",
                App.money(
                    data?.restricted_balance ||
                    0
                ),
                "0 PKR"
            );


            App.setText(
                "financeDonationBalance",
                App.money(
                    data
                        ?.unrestricted_donation_balance ||
                    0
                ),
                "0 PKR"
            );


            const history =
                App.asArray(
                    data?.history
                );


            const body =
                App.first(
                    "financeHistoryBody",
                    "adminFinanceHistoryBody"
                );


            if (body) {

                body.innerHTML =
                    history.length
                        ? history
                            .map(
                                item => `
                                    <tr>

                                        <td>
                                            ${App.escape(
                                                item.transaction_no ||
                                                "—"
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
                                                item.fund_type ||
                                                "—"
                                            )}
                                        </td>

                                        <td>
                                            ${App.escape(
                                                item.received_from ||
                                                item.paid_to ||
                                                "—"
                                            )}
                                        </td>

                                        <td>
                                            ${App.escape(
                                                item.purpose ||
                                                "—"
                                            )}
                                        </td>

                                        <td>
                                            ${
                                               App.escape(
    App.money(
        item.amount ||
        0
    )
)}
</td>

<td>
    ${App.escape(
        App.dateTime(
            item.transaction_at
        )
    )}
</td>

<td>
    ${App.escape(
        item.receipt_no ||
        "—"
    )}
</td>

</tr>
`
)
.join("")
: `
<tr>
    <td colspan="8">
        کوئی مالی ریکارڈ موجود نہیں۔
    </td>
</tr>
`;
            }


        } catch (error) {

            console.error(
                "Finance:",
                error
            );
        }
    };


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


        App.bindOnce(
            form,
            "donation",
            "submit",
            async function (event) {

                event.preventDefault();


                const amount =
                    Number(
                        App.val(
                            "donationAmount"
                        )
                    );


                const from =
                    App.val(
                        "donationReceivedFrom"
                    );


                if (
                    !amount ||
                    amount <= 0 ||
                    !from
                ) {

                    alert(
                        "رقم اور دینے والے کا نام درج کریں۔"
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
                                    from,

                                p_fund_type:
                                    App.val(
                                        "donationFundType"
                                    ) ||
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
                            result?.receipt_no
                                ? "\nرسید نمبر: " +
                                result.receipt_no
                                : ""
                        )
                    );


                    form.reset();


                    await App.loadFinance();


                } catch (error) {

                    console.error(
                        "Donation:",
                        error
                    );


                    alert(
                        error?.message ||
                        "عطیہ محفوظ نہیں ہو سکا۔"
                    );
                }
            }
        );
    };


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


        App.bindOnce(
            form,
            "expense",
            "submit",
            async function (event) {

                event.preventDefault();


                const amount =
                    Number(
                        App.val(
                            "expenseAmount"
                        )
                    );


                const paidTo =
                    App.val(
                        "expensePaidTo"
                    );


                const purpose =
                    App.val(
                        "expensePurpose"
                    );


                if (
                    !amount ||
                    amount <= 0 ||
                    !paidTo ||
                    !purpose
                ) {

                    alert(
                        "رقم، وصول کنندہ اور مقصد درج کریں۔"
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
                            result?.receipt_no
                                ? "\nرسید نمبر: " +
                                result.receipt_no
                                : ""
                        )
                    );


                    form.reset();


                    await App.loadFinance();


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


App.initFinancePage =
    async function () {

        if (
            App.currentFile !==
            "admin-finance.html"
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


        App.bindDonationForm();

        App.bindExpenseForm();


        const print =
            App.first(
                "financePrintButton",
                "adminFinancePrint"
            );


        if (print) {

            print.addEventListener(
                "click",
                App.printCurrentPage
            );
        }


        await App.loadFinance();
    };


/* =====================================================
   MADRASSA RESIDENCE / HOSTEL
   ===================================================== */

App.residentStudents =
    [];


App.isResidentStudent =
    function (student) {

        const residence =
            App.safe(
                student?.residence_type
            )
                .trim()
                .toLowerCase();


        return (
            residence === "hostel" ||
            residence === "ہاسٹل" ||
            residence === "مدرسہ میں رہائش"
        );
    };


App.loadResidentStudents =
    async function () {

        const students =
            await App.loadStudents();


        App.residentStudents =
            students.filter(
                App.isResidentStudent
            );


        return App.residentStudents;
    };


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


App.initHostelPage =
    async function () {

        if (
            App.currentFile !==
            "admin-hostel.html"
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

            const students =
                await App.loadResidentStudents();


            const select =
                App.first(
                    "hostelStudentId",
                    "hostelStudentSelect"
                );


            if (select) {

                select.innerHTML =
                    `
                    <option value="">
                        طالبہ منتخب کریں
                    </option>
                    ` +
                    students
                        .map(
                            student => `
                            <option value="${Number(
                                student.id
                            )}">
                                ${App.escape(
                                    student.admission_no ||
                                    ""
                                )}
                                -
                                ${App.escape(
                                    student.name ||
                                    ""
                                )}
                            </option>
                        `
                        )
                        .join("");
            }


        } catch (error) {

            console.error(
                "Resident students:",
                error
            );
        }


        const studentSelect =
            App.first(
                "hostelStudentId",
                "hostelStudentSelect"
            );


        if (studentSelect) {

            studentSelect
                .addEventListener(
                    "change",
                    async function () {

                        const studentId =
                            Number(
                                studentSelect.value
                            );


                        const historyBody =
                            App.first(
                                "hostelHistoryBody",
                                "studentHostelHistoryBody"
                            );


                        if (
                            !studentId ||
                            !historyBody
                        ) {
                            return;
                        }


                        try {

                            const response =
                                await App.getStudentHostelHistory(
                                    studentId
                                );


                            const history =
                                App.asArray(
                                    response
                                );


                            historyBody.innerHTML =
                                history.length
                                    ? history
                                        .map(
                                            item => `
                                            <tr>

                                                <td>
                                                    ${App.escape(
                                                        App.dateTime(
                                                            item.exit_at
                                                        )
                                                    )}
                                                </td>

                                                <td>
                                                    ${App.escape(
                                                        item.mahram_name ||
                                                        item.exit_person_name ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td>
                                                    ${App.escape(
                                                        item.destination ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td>
                                                    ${App.escape(
                                                        item.reason ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td>
                                                    ${App.escape(
                                                        App.dateTime(
                                                            item.returned_at
                                                        )
                                                    )}
                                                </td>

                                                <td>
                                                    ${App.escape(
                                                        App.statusUrdu(
                                                            item.status
                                                        )
                                                    )}
                                                </td>

                                            </tr>
                                        `
                                        )
                                        .join("")
                                    : `
                                    <tr>
                                        <td colspan="6">
                                            کوئی آمد و رفت ریکارڈ موجود نہیں۔
                                        </td>
                                    </tr>
                                `;


                        } catch (error) {

                            console.error(
                                "Hostel history:",
                                error
                            );
                        }
                    }
                );
        }


        const exitForm =
            App.first(
                "hostelExitForm",
                "studentHostelExitForm"
            );


        if (exitForm) {

            App.bindOnce(
                exitForm,
                "hostelExit",
                "submit",
                async function (event) {

                    event.preventDefault();


                    const studentId =
                        Number(
                            App.val(
                                "hostelStudentId"
                            ) ||
                            App.val(
                                "hostelStudentSelect"
                            )
                        );


                    const mahramId =
                        Number(
                            App.val(
                                "hostelMahramId"
                            )
                        );


                    if (
                        !studentId ||
                        !mahramId
                    ) {

                        alert(
                            "طالبہ اور منظور شدہ محرم منتخب کریں۔"
                        );

                        return;
                    }


                    try {

                        await App.authedRpc(
                            "admin_hostel_exit",
                            {
                                p_student_id:
                                    studentId,

                                p_mahram_id:
                                    mahramId,

                                p_destination:
                                    App.val(
                                        "hostelDestination"
                                    ) ||
                                    null,

                                p_reason:
                                    App.val(
                                        "hostelReason"
                                    ) ||
                                    null,

                                p_notes:
                                    App.val(
                                        "hostelExitNotes"
                                    ) ||
                                    null
                            }
                        );


                        alert(
                            "طالبہ کا خروج محفوظ ہوگیا۔"
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

            App.bindOnce(
                returnForm,
                "hostelReturn",
                "submit",
                async function (event) {

                    event.preventDefault();


                    const movementId =
                        Number(
                            App.val(
                                "hostelMovementId"
                            )
                        );


                    if (!movementId) {

                        alert(
                            "خروج ریکارڈ منتخب کریں۔"
                        );

                        return;
                    }


                    try {

                        await App.authedRpc(
                            "admin_hostel_return",
                            {
                                p_movement_id:
                                    movementId,

                                p_return_person_name:
                                    App.val(
                                        "hostelReturnPersonName"
                                    ) ||
                                    null,

                                p_return_person_relation:
                                    App.val(
                                        "hostelReturnRelation"
                                    ) ||
                                    null,

                                p_return_person_cnic:
                                    App.normalizeDigits(
                                        App.val(
                                            "hostelReturnCNIC"
                                        )
                                    ) ||
                                    null,

                                p_return_person_phone:
                                    App.normalizePhone(
                                        App.val(
                                            "hostelReturnPhone"
                                        )
                                    ) ||
                                    null,

                                p_notes:
                                    App.val(
                                        "hostelReturnNotes"
                                    ) ||
                                    null
                            }
                        );


                        alert(
                            "طالبہ کی واپسی محفوظ ہوگئی۔"
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
   PROMOTION / CLASS UPGRADE
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
                    percentage === "" ||
                    percentage === null
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


App.initPromotionPage =
    function () {

        if (
            App.currentFile !==
            "admin-promotions.html"
        ) {
            return;
        }


        const single =
            App.first(
                "singlePromotionForm",
                "promotionForm"
            );


        if (single) {

            App.bindOnce(
                single,
                "singlePromotion",
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
                            "طالبہ کا سالانہ نتیجہ / جماعت اپڈیٹ ہوگئی۔"
                        );


                        single.reset();


                    } catch (error) {

                        console.error(
                            "Student promotion:",
                            error
                        );


                        alert(
                            error?.message ||
                            "طالبہ کی جماعت اپڈیٹ نہیں ہو سکی۔"
                        );
                    }
                }
            );
        }


        const whole =
            App.first(
                "wholeClassPromotionForm",
                "classPromotionForm"
            );


        if (whole) {

            App.bindOnce(
                whole,
                "wholeClassPromotion",
                "submit",
                async function (event) {

                    event.preventDefault();


                    if (
                        !App.confirmAction(
                            "کیا آپ واقعی پوری کلاس کی جماعت تبدیل کرنا چاہتے ہیں؟"
                        )
                    ) {

                        return;
                    }


                    try {

                        await App.promoteWholeClass(

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
                            "پوری کلاس کا سالانہ ریکارڈ اپڈیٹ ہوگیا۔"
                        );


                        whole.reset();


                    } catch (error) {

                        console.error(
                            "Whole promotion:",
                            error
                        );


                        alert(
                            error?.message ||
                            "کلاس اپڈیٹ نہیں ہو سکی۔"
                        );
                    }
                }
            );
        }


        const selectedButton =
            App.first(
                "promoteSelectedStudents",
                "promotionSelectedButton"
            );


        if (selectedButton) {

            selectedButton.addEventListener(
                "click",
                async function () {

                    const ids =
                        Array.from(
                            document
                                .querySelectorAll(
                                    "[data-promotion-student]:checked"
                                )
                        )
                            .map(
                                checkbox =>
                                    Number(
                                        checkbox.value ||
                                        checkbox.dataset
                                            .promotionStudent
                                    )
                            )
                            .filter(Boolean);


                    try {

                        await App.promoteSelectedStudents(

                            ids,

                            App.val(
                                "promotionSelectedToClass"
                            ),

                            App.val(
                                "promotionSelectedAcademicYear"
                            ),

                            App.val(
                                "promotionSelectedExamName"
                            ),

                            App.val(
                                "promotionSelectedDecision"
                            ) ||
                            "promoted",

                            App.val(
                                "promotionSelectedNotes"
                            ) ||
                            null
                        );


                        alert(
                            "منتخب طالبات اپڈیٹ ہوگئیں۔"
                        );


                    } catch (error) {

                        alert(
                            error?.message ||
                            "منتخب طالبات اپڈیٹ نہیں ہو سکیں۔"
                        );
                    }
                }
            );
        }
    };


/* =====================================================
   DOCUMENTS
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
   STUDENT / TEACHER ID CARDS
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


App.initIdCards =
    function () {

        if (
            App.currentFile !==
            "admin-id-cards.html"
        ) {
            return;
        }


        const single =
            App.first(
                "idCardSingleForm",
                "singleIdCardForm"
            );


        if (single) {

            App.bindOnce(
                single,
                "singleIdCard",
                "submit",
                async function (event) {

                    event.preventDefault();


                    try {

                        const result =
                            await App.registerIdCard(

                                App.val(
                                    "idCardOwnerType"
                                ),

                                App.val(
                                    "idCardOwnerId"
                                )
                            );


                        alert(
                            "شناختی کارڈ تیار ہوگیا۔" +
                            (
                                result?.card_no
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
                            error?.message ||
                            "شناختی کارڈ تیار نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }


        const batch =
            App.first(
                "createSelectedIdCards",
                "idCardBatchButton"
            );


        if (batch) {

            batch.addEventListener(
                "click",
                async function () {

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

                        await App.registerIdCardBatch(

                            App.val(
                                "idCardBatchOwnerType"
                            ) ||
                            App.val(
                                "idCardOwnerType"
                            ),

                            ids
                        );


                        alert(
                            "منتخب شناختی کارڈ تیار ہوگئے۔"
                        );


                    } catch (error) {

                        alert(
                            error?.message ||
                            "شناختی کارڈ تیار نہیں ہو سکے۔"
                        );
                    }
                }
            );
        }


        const print =
            App.first(
                "idCardPrintButton",
                "printIdCards"
            );


        if (print) {

            print.addEventListener(
                "click",
                App.printCurrentPage
            );
        }
    };


/* =====================================================
   ACCOUNTS / APPLICATION APPROVAL
   ===================================================== */

App.accountApplications =
    [];


App.renderAccountApplications =
    function (records) {

        const container =
            App.first(
                "adminApplicationsBody",
                "accountApplicationsList",
                "adminAccountsList",
                "applicationsList"
            );

        if (!container) {
            return;
        }

        records =
            Array.isArray(records)
                ? records
                : [];

        const pendingRecords =
            records.filter(item => {
                const status = App.safe(item.status || "pending").trim().toLowerCase();
                return !status || status === "pending" || status === "زیر التواء" || status === "زیرِ التواء";
            });

        App.setText(
            "adminPendingApplicationsTotal",
            pendingRecords.length,
            "0"
        );

        if (!pendingRecords.length) {
            container.innerHTML =
                container.tagName.toLowerCase() === "tbody"
                    ? `<tr><td colspan="8" class="table-empty">کوئی زیرِ التواء درخواست موجود نہیں۔</td></tr>`
                    : App.empty("کوئی زیرِ التواء درخواست موجود نہیں۔");
            return;
        }

        const renderActions = applicationKey => `
            <div class="record-card-actions account-inline-actions">
                <button type="button" data-account-details="${App.escape(applicationKey)}">تفصیل</button>
                <button type="button" data-account-approve="${App.escape(applicationKey)}">منظور کریں</button>
                <button type="button" data-account-reject="${App.escape(applicationKey)}">مسترد کریں</button>
            </div>`;

        if (container.tagName.toLowerCase() === "tbody") {
            container.innerHTML = pendingRecords.map(item => {
                const id = Number(item.id);
                const type = App.safe(item.application_type || "student").toLowerCase();
                const applicationKey = type + ":" + id;
                const typeUrdu = type === "teacher" ? "استاد" : "طالبہ";
                const refNo = item.application_no || item.admission_no || item.teacher_code || item.request_no || id || "—";
                const created = App.date(item.created_at || item.submitted_at || item.application_date || item.created_on);
                return `
                    <tr>
                        <td class="account-select-cell"><input type="checkbox" data-account-select="${App.escape(applicationKey)}" aria-label="منتخب کریں"></td>
                        <td>${App.escape(created || "—")}</td>
                        <td>${App.escape(typeUrdu)}</td>
                        <td>${App.escape(item.name || item.full_name || "—")}</td>
                        <td>${App.escape(refNo)}</td>
                        <td>${App.escape(item.phone || "—")}</td>
                        <td>${App.escape(App.statusUrdu(item.status || "pending"))}</td>
                        <td>${renderActions(applicationKey)}</td>
                    </tr>`;
            }).join("");
        } else {
            container.innerHTML = pendingRecords.map(item => {
                const id = Number(item.id);
                const type = App.safe(item.application_type || "student").toLowerCase();
                const applicationKey = type + ":" + id;
                return `
                    <article class="record-card">
                        <h3>${App.escape(item.name || item.full_name || "—")}</h3>
                        <p>قسم: ${App.escape(type === "teacher" ? "استاد" : "طالبہ")}</p>
                        <p>فون: ${App.escape(item.phone || "—")}</p>
                        <p>حالت: ${App.escape(App.statusUrdu(item.status || "pending"))}</p>
                        ${renderActions(applicationKey)}
                    </article>`;
            }).join("");
        }

        container.querySelectorAll("[data-account-details]").forEach(button => {
            button.addEventListener("click", function () {
                const record = App.accountApplications.find(item =>
                    App.safe(item.application_type || "student") + ":" + Number(item.id) ===
                    button.dataset.accountDetails
                );
                if (!record) return;
                App.openGeneratedPanel(
                    "generatedAccountDetails",
                    "درخواست کی مکمل تفصیل",
                    App.renderDeepProfile(record, "account")
                );
            });
        });

        container.querySelectorAll("[data-account-approve]").forEach(button => {
            button.addEventListener("click", function () {
                App.reviewAccountApplication(button.dataset.accountApprove, "approved");
            });
        });

        container.querySelectorAll("[data-account-reject]").forEach(button => {
            button.addEventListener("click", function () {
                App.reviewAccountApplication(button.dataset.accountReject, "rejected");
            });
        });

        container.querySelectorAll("[data-account-select]").forEach(box => {
            box.addEventListener("change", App.updateBulkApprovalSelection);
        });
        App.updateBulkApprovalSelection();
    };

App.updateBulkApprovalSelection = function () {
    const boxes = Array.from(document.querySelectorAll("[data-account-select]"));
    const selected = boxes.filter(box => box.checked);
    App.setText("selectedApplicationsCount", `${selected.length} منتخب`, "0 منتخب");
    const button = App.el("approveSelectedApplications");
    if (button) button.disabled = selected.length === 0;
    const all = App.el("selectAllPendingApplications");
    if (all) {
        all.checked = boxes.length > 0 && selected.length === boxes.length;
        all.indeterminate = selected.length > 0 && selected.length < boxes.length;
    }
};

App.approveSelectedApplications = async function () {
    const keys = Array.from(document.querySelectorAll("[data-account-select]:checked")).map(box => box.dataset.accountSelect).filter(Boolean);
    if (!keys.length) return;
    if (!window.confirm(`${keys.length} منتخب درخواستیں منظور کی جائیں؟`)) return;
    const note = window.prompt("ایڈمن نوٹ:", "Bulk import / multiple approval");
    if (note === null) return;
    const button = App.el("approveSelectedApplications");
    if (button) button.disabled = true;
    let ok = 0, failed = 0;
    for (const key of keys) {
        try {
            const [requestedType, rawId] = App.safe(key).split(":");
            const applicationId = Number(rawId);
            const record = App.accountApplications.find(item => Number(item.id) === applicationId && App.safe(item.application_type || "student") === requestedType);
            const type = App.safe(record?.application_type || requestedType).toLowerCase();
            const rpcName = type === "teacher" ? "admin_approve_teacher_application" : "admin_approve_student_application";
            await App.authedRpc(rpcName,{p_application_id:applicationId,p_admin_note:note || null});
            ok++;
        } catch (error) {
            failed++;
            console.error("Bulk approval:",key,error);
        }
    }
    alert(`منظوری مکمل: ${ok} کامیاب، ${failed} ناکام۔`);
    await App.loadAccountApplications();
    if (button) button.disabled = false;
};

App.reviewAccountApplication =
    async function (
        applicationKey,
        decision
    ) {

        const confirmed =
            App.confirmAction(
                decision === "approved"
                    ? "کیا آپ یہ درخواست منظور کرنا چاہتے ہیں؟"
                    : "کیا آپ یہ درخواست مسترد کرنا چاہتے ہیں؟"
            );


        if (!confirmed) {
            return;
        }


        const note =
            window.prompt(
                "ایڈمن نوٹ:",
                ""
            );


        if (
            note ===
            null
        ) {
            return;
        }


        try {

            const [requestedType, rawId] =
                App.safe(applicationKey)
                    .split(":");

            const applicationId =
                Number(rawId || applicationKey);

            const record =
                App.accountApplications.find(
                    item =>
                        Number(item.id) === applicationId &&
                        App.safe(item.application_type || "student") ===
                            (requestedType || "student")
                );

            const type =
                App.safe(
                    record?.application_type
                ).toLowerCase();

            const rpcName =
                type === "teacher"
                    ? decision === "approved"
                        ? "admin_approve_teacher_application"
                        : "admin_reject_teacher_application"
                    : decision === "approved"
                        ? "admin_approve_student_application"
                        : "admin_reject_student_application";

            await App.authedRpc(
                rpcName,
                {
                    p_application_id:
                        Number(applicationId),
                    p_admin_note:
                        note || null
                }
            );


            alert(
                decision === "approved"
                    ? "درخواست منظور ہوگئی۔"
                    : "درخواست مسترد ہوگئی۔"
            );


            await App.loadAccountApplications();


        } catch (error) {

            console.error(
                "Application review:",
                error
            );


            alert(
                error?.message ||
                "درخواست اپڈیٹ نہیں ہو سکی۔"
            );
        }
    };


App.loadAccountApplications =
    async function () {

        let students = [];
        let teachers = [];
        const errors = [];

        try {
            students = App.asArray(
                await App.authedRpc(
                    "admin_get_student_applications"
                )
            );
        } catch (error) {
            console.error("Student applications:", error);
            errors.push("طالبات کی درخواستیں لوڈ نہیں ہو سکیں۔");
        }

        try {
            teachers = App.asArray(
                await App.authedRpc(
                    "admin_get_teacher_applications"
                )
            );
        } catch (error) {
            console.error("Teacher applications:", error);
            errors.push("اساتذہ کی درخواستیں لوڈ نہیں ہو سکیں۔");
        }

        App.accountApplications = [
            ...students.map(item => ({
                ...item,
                application_type: "student"
            })),
            ...teachers.map(item => ({
                ...item,
                application_type: "teacher"
            }))
        ];

        App.renderAccountApplications(
            App.accountApplications
        );

        if (errors.length) {
            App.message(
                "adminAccountsMessage",
                errors.join(" "),
                "error"
            );
        }
    };


/* =====================================================
   ADMIN BULK STUDENT IMPORT (EXCEL / CSV)
   Imported rows remain PENDING until Admin approval.
   ===================================================== */

App.bulkStudentRows = [];

App.bulkHeaderKey = function (value) {
    return App.safe(value)
        .replace(/[\u200c\u200d\ufeff]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
};

App.bulkPick = function (row, aliases) {
    if (!row || typeof row !== "object") return "";
    const normalized = new Map();
    Object.entries(row).forEach(([key, value]) => {
        normalized.set(App.bulkHeaderKey(key), value);
    });
    for (const alias of aliases) {
        const key = App.bulkHeaderKey(alias);
        if (normalized.has(key)) return normalized.get(key);
    }
    return "";
};

App.bulkNormalizeClass = function (value) {
    const raw = App.safe(value).replace(/\s+/g, " ").trim();
    const map = {
        "خاصہ سال اول": "ثانویہ خاصہ سال اول",
        "خاصہ سال دوم": "ثانویہ خاصہ سال دوم",
        "ثانویہ خاصہ اول": "ثانویہ خاصہ سال اول",
        "ثانویہ خاصہ دوم": "ثانویہ خاصہ سال دوم",
        "عالیہ اول": "عالیہ سال اول",
        "عالیہ دوم": "عالیہ سال دوم",
        "عالمیہ اول": "عالمیہ سال اول",
        "عالمیہ دوم": "عالمیہ سال دوم / دورۂ حدیث",
        "عالمیہ دوم / دورہ حدیث": "عالمیہ سال دوم / دورۂ حدیث",
        "دورہ حدیث": "عالمیہ سال دوم / دورۂ حدیث",
        "دورۂ حدیث": "عالمیہ سال دوم / دورۂ حدیث"
    };
    return map[raw] || raw;
};

App.bulkParseDate = function (value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number" && window.XLSX?.SSF?.parse_date_code) {
        const d = window.XLSX.SSF.parse_date_code(value);
        if (d?.y && d?.m && d?.d) {
            return `${String(d.y).padStart(4,"0")}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;
        }
    }
    let text = App.safe(value).trim();
    if (!text) return null;
    const iso = text.match(/^(\d{4})[-\/]([01]?\d)[-\/]([0-3]?\d)$/);
    if (iso) return `${iso[1]}-${String(iso[2]).padStart(2,"0")}-${String(iso[3]).padStart(2,"0")}`;
    const dmy = text.match(/^([0-3]?\d)[-\/]([01]?\d)[-\/](\d{4})$/);
    if (dmy) return `${dmy[3]}-${String(dmy[2]).padStart(2,"0")}-${String(dmy[1]).padStart(2,"0")}`;

    const months = {
        "جنوری":1,"فروری":2,"مارچ":3,"اپریل":4,"مئی":5,"جون":6,
        "جولائی":7,"اگست":8,"ستمبر":9,"اکتوبر":10,"نومبر":11,"دسمبر":12,
        "january":1,"february":2,"march":3,"april":4,"may":5,"june":6,
        "july":7,"august":8,"september":9,"october":10,"november":11,"december":12
    };
    text = text.replace(/،/g, ",").replace(/,/g, " ").replace(/\s+/g," ").trim();
    const parts = text.split(" ");
    if (parts.length >= 3) {
        const day = Number(App.normalizeDigits(parts[0]));
        const month = months[parts[1].toLowerCase()] || months[parts[1]];
        const year = Number(App.normalizeDigits(parts[2]));
        if (day >= 1 && day <= 31 && month && year >= 1900 && year <= 2200) {
            return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        }
    }
    return null;
};

App.bulkRandomPassword = function () {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const bytes = new Uint32Array(10);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i=0;i<bytes.length;i++) bytes[i] = Math.floor(Math.random()*0xffffffff);
    let out = "Msa#";
    for (let i=0;i<bytes.length;i++) out += chars[bytes[i] % chars.length];
    return out;
};

App.bulkUsername = function (legacy, wifaq, rowNo) {
    let base = App.normalizeDigits(legacy || "") || App.safe(wifaq).replace(/[^0-9A-Za-z]/g, "") || String(rowNo);
    base = base.slice(-12) || String(rowNo);
    return `std${base}_${String(Date.now()).slice(-4)}${rowNo}`.toLowerCase();
};

App.normalizeBulkStudentRow = function (row, rowNo) {
    const wifaq = App.safe(App.bulkPick(row,["رقم التسجیل","رقم التسجيل","وفاق نمبر","wifaq number","wifaq_no","admission_no"])).trim();
    const legacy = App.safe(App.bulkPick(row,["رجسٹریشن","رجسٹریشن نمبر","registration","registration no","registration_no"])).trim();
    const name = App.safe(App.bulkPick(row,["نام","طالبہ کا نام","name","student name"])).trim();
    const father = App.safe(App.bulkPick(row,["ولدیت","والد کا نام","father","father name","father_name"])).trim();
    const klass = App.bulkNormalizeClass(App.bulkPick(row,["درجہ","جماعت","کلاس","class","student_class"]));
    const dobRaw = App.bulkPick(row,["تاريخ پیدائش","تاریخ پیدائش","date of birth","dob","date_of_birth"]);
    const dob = App.bulkParseDate(dobRaw);
    const cnicRaw = App.safe(App.bulkPick(row,["شناختی کارڈ","شناختی کارڈ نمبر","ب فارم","cnic","b-form","bform"])).trim();
    const phoneRaw = App.safe(App.bulkPick(row,["رابطہ نمبر","فون نمبر","phone","mobile","contact"])).trim();
    const address = App.safe(App.bulkPick(row,["موجودہ پتہ","پتہ","address","current address"])).trim();
    const cnicDigits = App.normalizeDigits(cnicRaw);
    const phoneDigits = App.normalizePhone(phoneRaw);
    const cnic = (!cnicDigits || /^0+$/.test(cnicDigits) || cnicDigits.length !== 13) ? null : cnicDigits;
    const phone = (!phoneDigits || /^0+$/.test(phoneDigits) || phoneDigits.length !== 11) ? null : phoneDigits;
    const issues = [];
    const warnings = [];

    if (!name) issues.push("نام موجود نہیں");
    if (!klass) issues.push("جماعت موجود نہیں");
    else if (!App.CLASSES.includes(klass)) issues.push("غیر معروف جماعت");
    if (!father) warnings.push("والد کا نام خالی ہے");
    if (!dob) warnings.push("تاریخ پیدائش خالی یا غیر درست ہے");
    if (!cnicDigits || /^0+$/.test(cnicDigits)) warnings.push("شناختی کارڈ / ب فارم خالی ہے");
    else if (cnicDigits.length !== 13) warnings.push("شناختی کارڈ / ب فارم 13 ہندسوں کا نہیں؛ خالی درآمد ہوگا");
    if (!phoneDigits || /^0+$/.test(phoneDigits)) warnings.push("رابطہ نمبر خالی ہے");
    else if (phoneDigits.length !== 11) warnings.push("رابطہ نمبر 11 ہندسوں کا نہیں؛ خالی درآمد ہوگا");
    if (!wifaq) warnings.push("وفاق نمبر موجود نہیں؛ منظوری پر عارضی داخلہ نمبر بنے گا");

    const selection = App.val("studentBulkAdmissionType") || "منتقلی";
    const admissionType = selection === "auto"
        ? (App.NEW_ADMISSION_CLASSES.includes(klass) ? "نیا داخلہ" : "منتقلی")
        : selection;

    if (admissionType === "نیا داخلہ" && klass && !App.NEW_ADMISSION_CLASSES.includes(klass)) {
        issues.push("اس جماعت کے لیے نیا داخلہ قابل قبول نہیں؛ منتقلی منتخب کریں");
    }

    return {
        row_no: rowNo,
        wifaq_registration_no: wifaq || null,
        legacy_registration_no: legacy || null,
        admission_type: admissionType,
        name,
        father_name: father || null,
        guardian_name: father || null,
        student_class: klass || null,
        date_of_birth: dob,
        cnic,
        phone,
        address: address || null,
        residence_type: "گھر",
        previous_madrassa: null,
        transfer_date: null,
        mahrams: [],
        username: App.bulkUsername(legacy,wifaq,rowNo),
        password: App.bulkRandomPassword(),
        issues,
        warnings,
        valid: issues.length === 0,
        selected: issues.length === 0,
        imported: false
    };
};

App.readStudentBulkFile = async function (file) {
    if (!file) throw new Error("فائل منتخب کریں۔");
    const name = App.safe(file.name).toLowerCase();
    let records = [];

    if (window.XLSX) {
        const buffer = await file.arrayBuffer();
        const workbook = window.XLSX.read(buffer,{type:"array",cellDates:false});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        records = window.XLSX.utils.sheet_to_json(sheet,{defval:"",raw:true});
    } else if (name.endsWith(".csv") || name.endsWith(".tsv")) {
        const text = await file.text();
        const delimiter = name.endsWith(".tsv") ? "\t" : ",";
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        const headers = (lines.shift() || "").split(delimiter).map(x=>x.replace(/^\ufeff/,"").trim());
        records = lines.map(line => {
            const cells = line.split(delimiter);
            return Object.fromEntries(headers.map((h,i)=>[h,cells[i] ?? ""]));
        });
    } else {
        throw new Error("ایکسل فائل پڑھنے کا نظام دستیاب نہیں۔ صفحہ دوبارہ لوڈ کریں یا سی ایس وی فائل استعمال کریں۔");
    }

    return records.map((row,index)=>App.normalizeBulkStudentRow(row,index+2));
};

App.updateStudentBulkSelectionUI = function () {
    const rows = App.bulkStudentRows || [];
    const selectable = rows.filter(r => r.valid && !r.imported);
    const selected = selectable.filter(r => r.selected).length;
    App.setText("bulkImportSelectedRows", selected, "0");

    const master = App.el("selectAllStudentBulkRowsCheckbox");
    if (master) {
        master.checked = selectable.length > 0 && selected === selectable.length;
        master.indeterminate = selected > 0 && selected < selectable.length;
        master.disabled = selectable.length === 0;
    }

    const submit = App.el("submitStudentBulkImport");
    if (submit) submit.disabled = selected === 0;
};

App.setAllStudentBulkRowsSelected = function (selected) {
    (App.bulkStudentRows || []).forEach(r => {
        if (r.valid && !r.imported) r.selected = !!selected;
    });
    App.renderStudentBulkPreview();
};

App.renderStudentBulkPreview = function () {
    const body = App.el("studentBulkImportPreviewBody");
    const wrap = App.el("studentBulkImportPreviewWrap");
    const summary = App.el("studentBulkImportSummary");
    const toolbar = App.el("studentBulkImportSelectionToolbar");
    if (!body || !wrap || !summary) return;

    const rows = App.bulkStudentRows || [];
    const valid = rows.filter(r=>r.valid).length;
    const warnings = rows.filter(r=>r.valid && r.warnings.length).length;
    const invalid = rows.filter(r=>!r.valid).length;
    App.setText("bulkImportTotalRows",rows.length,"0");
    App.setText("bulkImportValidRows",valid,"0");
    App.setText("bulkImportWarningRows",warnings,"0");
    App.setText("bulkImportInvalidRows",invalid,"0");
    summary.hidden = false;
    wrap.hidden = false;
    if (toolbar) toolbar.hidden = false;

    body.innerHTML = rows.map((r,index)=>{
        const cls = r.imported ? "bulk-row-imported" : (!r.valid ? "bulk-row-invalid" : (r.warnings.length ? "bulk-row-warning" : "bulk-row-valid"));
        const result = r.imported
            ? "درآمد شدہ"
            : (!r.valid ? `غلط: ${r.issues.join("، ")}` : (r.warnings.length ? `تنبیہ: ${r.warnings.join("، ")}` : "درست"));
        const disabled = (!r.valid || r.imported) ? "disabled" : "";
        const checked = (r.valid && !r.imported && r.selected) ? "checked" : "";
        return `<tr class="${cls}">
            <td class="bulk-select-column"><input type="checkbox" class="student-bulk-row-select" data-bulk-row-no="${Number(r.row_no)}" ${checked} ${disabled} aria-label="منتخب"></td>
            <td>${index+1}</td>
            <td data-no-translate>${App.escape(r.wifaq_registration_no || "—")}</td>
            <td data-no-translate>${App.escape(r.legacy_registration_no || "—")}</td>
            <td data-no-translate>${App.escape(r.name || "—")}</td>
            <td data-no-translate>${App.escape(r.father_name || "—")}</td>
            <td>${App.escape(r.student_class || "—")}</td>
            <td data-no-translate>${App.escape(r.date_of_birth || "—")}</td>
            <td data-no-translate>${App.escape(r.cnic ? App.formatCNIC(r.cnic) : "—")}</td>
            <td data-no-translate>${App.escape(r.phone || "—")}</td>
            <td>${App.escape(result)}</td>
        </tr>`;
    }).join("");

    body.querySelectorAll(".student-bulk-row-select").forEach(box => {
        box.addEventListener("change", function () {
            const rowNo = Number(this.dataset.bulkRowNo);
            const row = (App.bulkStudentRows || []).find(x => Number(x.row_no) === rowNo);
            if (row && row.valid && !row.imported) row.selected = this.checked;
            App.updateStudentBulkSelectionUI();
        });
    });

    App.updateStudentBulkSelectionUI();
};

App.previewStudentBulkImport = async function () {
    const file = App.el("studentBulkImportFile")?.files?.[0];
    const message = App.el("studentBulkImportMessage");
    try {
        App.message(message,"فائل پڑھی جا رہی ہے...","info");
        App.bulkStudentRows = await App.readStudentBulkFile(file);
        if (!App.bulkStudentRows.length) throw new Error("فائل میں کوئی طالبہ موجود نہیں۔");
        App.renderStudentBulkPreview();
        App.message(message,`${App.bulkStudentRows.length} قطاریں پڑھ لی گئی ہیں۔ درآمد سے پہلے پیش منظر چیک کریں۔`,"success");
    } catch (error) {
        console.error("Bulk student preview:",error);
        App.bulkStudentRows = [];
        App.message(message,error?.message || "فائل نہیں پڑھی جا سکی۔","error");
    }
};

App.renderBulkCredentials = function (results) {
    const box = App.el("studentBulkImportCredentials");
    if (!box) return;
    const success = (results || []).filter(r=>r.ok).map(r=>{
        const source = App.bulkStudentRows.find(x=>Number(x.row_no)===Number(r.row_no));
        return source ? {name:source.name,username:source.username,password:source.password,wifaq:source.wifaq_registration_no,application_no:r.application_no} : null;
    }).filter(Boolean);
    if (!success.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = `<h3>عارضی لاگ اِن معلومات</h3><p>منظوری کے بعد اکاؤنٹ کے لیے یہ عارضی معلومات استعمال ہوں گی۔ محفوظ جگہ پر رکھیں۔</p>
        <div class="responsive-table-wrapper"><table><thead><tr><th>نام</th><th>وفاق نمبر</th><th>عارضی صارف نام</th><th>عارضی پاس ورڈ</th><th>درخواست نمبر</th></tr></thead><tbody>
        ${success.map(x=>`<tr><td data-no-translate>${App.escape(x.name)}</td><td data-no-translate>${App.escape(x.wifaq||"—")}</td><td data-no-translate>${App.escape(x.username)}</td><td data-no-translate>${App.escape(x.password)}</td><td data-no-translate>${App.escape(x.application_no||"—")}</td></tr>`).join("")}
        </tbody></table></div>`;
};

App.submitStudentBulkImport = async function () {
    const message = App.el("studentBulkImportMessage");
    const button = App.el("submitStudentBulkImport");
    const rows = (App.bulkStudentRows || []).filter(r=>r.valid && r.selected && !r.imported);
    if (!rows.length) return App.message(message,"درآمد کے لیے کم از کم ایک طالبہ منتخب کریں۔","error");
    if (!window.confirm(`${rows.length} منتخب طالبات کی درخواستیں زیرِ التواء حالت میں درآمد کی جائیں؟`)) return;
    if (button) button.disabled = true;
    try {
        App.message(message,"درآمد جاری ہے...","info");
        const payload = rows.map(r=>({
            row_no:r.row_no,
            wifaq_registration_no:r.wifaq_registration_no,
            legacy_registration_no:r.legacy_registration_no,
            admission_type:r.admission_type,
            name:r.name,
            father_name:r.father_name,
            guardian_name:r.guardian_name,
            cnic:r.cnic,
            phone:r.phone,
            date_of_birth:r.date_of_birth,
            student_class:r.student_class,
            address:r.address,
            residence_type:r.residence_type,
            previous_madrassa:r.previous_madrassa,
            transfer_date:r.transfer_date,
            mahrams:r.mahrams,
            username:r.username,
            password:r.password
        }));
        const result = await App.authedRpc("admin_bulk_import_student_applications",{p_rows:payload});
        const results = App.asArray(result?.results || result);
        const ok = results.filter(x=>x && x.ok === true).length;
        const failedRows = results.filter(x=>!x || x.ok !== true);
        const failed = failedRows.length;

        const successfulRowNumbers = new Set(
            results.filter(x => x && x.ok === true).map(x => Number(x.row_no))
        );
        (App.bulkStudentRows || []).forEach(r => {
            if (successfulRowNumbers.has(Number(r.row_no))) {
                r.imported = true;
                r.selected = false;
            }
        });

        App.renderBulkCredentials(results);
        App.renderStudentBulkPreview();

        const failureDetails = failedRows
            .slice(0, 5)
            .map(x => `قطار ${App.escape(x?.row_no || "—")}: ${App.escape(x?.error || "نامعلوم خرابی")}`)
            .join("<br>");

        if (ok === 0) {
            const detailText = failedRows
                .slice(0, 3)
                .map(x => `قطار ${x?.row_no || "—"}: ${x?.error || "نامعلوم خرابی"}`)
                .join("\n");
            App.message(
                message,
                `کوئی طالبہ درآمد نہیں ہوئی۔${failureDetails ? "<br>" + failureDetails : ""}`,
                "error"
            );
            message?.scrollIntoView?.({behavior:"smooth",block:"center"});
            window.alert(
                "درآمد ناکام ہوئی۔\n" +
                (detailText || "Bulk Import SQL یا database validation چیک کریں۔")
            );
        } else {
            App.message(
                message,
                `درآمد مکمل: ${ok} کامیاب، ${failed} ناکام۔ تمام کامیاب ریکارڈ ایڈمن منظوری کے منتظر ہیں۔${failureDetails ? "<br>" + failureDetails : ""}`,
                failed ? "info" : "success"
            );
            message?.scrollIntoView?.({behavior:"smooth",block:"center"});
            window.alert(`درآمد مکمل\nکامیاب: ${ok}\nناکام: ${failed}`);
        }

        await App.loadAccountApplications();
    } catch (error) {
        console.error("Bulk student import:",error);
        const rawMessage = App.safe(error?.message || "");
        const missingRpc = /admin_bulk_import_student_applications|PGRST202|function.*not found/i.test(rawMessage);
        const friendly = missingRpc
            ? "Bulk Import SQL ابھی database میں فعال نہیں ہے۔ sql-parts/06-bulk-student-import.sql چلائیں۔"
            : (rawMessage || "طالبات درآمد نہیں ہو سکیں۔");
        App.message(message,friendly,"error");
        message?.scrollIntoView?.({behavior:"smooth",block:"center"});
        window.alert(friendly);
    } finally {
        if (button) button.disabled = false;
    }
};

App.downloadStudentImportTemplate = function () {
    const csv = "\ufeffرقم التسجیل,رجسٹریشن,نام,ولدیت,درجہ,تاريخ پیدائش,شناختی کارڈ,رابطہ نمبر,موجودہ پتہ\n1447-05-000001,1,مثالی طالبہ,مثالی والد,ثانویہ خاصہ سال اول,01 جنوری 2012,15103-0000000-0,03000000000,گاؤں مثال ضلع بونیر\n";
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

App.initStudentBulkImport = function () {
    const preview = App.el("previewStudentBulkImport");
    const submit = App.el("submitStudentBulkImport");
    const template = App.el("downloadStudentImportTemplate");
    const type = App.el("studentBulkAdmissionType");
    const selectAllButton = App.el("selectAllStudentBulkRows");
    const clearSelectionButton = App.el("clearStudentBulkSelection");
    const masterCheckbox = App.el("selectAllStudentBulkRowsCheckbox");
    if (preview && preview.dataset.bound !== "1") { preview.dataset.bound="1"; preview.addEventListener("click",App.previewStudentBulkImport); }
    if (submit && submit.dataset.bound !== "1") { submit.dataset.bound="1"; submit.addEventListener("click",App.submitStudentBulkImport); }
    if (template && template.dataset.bound !== "1") { template.dataset.bound="1"; template.addEventListener("click",App.downloadStudentImportTemplate); }
    if (selectAllButton && selectAllButton.dataset.bound !== "1") { selectAllButton.dataset.bound="1"; selectAllButton.addEventListener("click",()=>App.setAllStudentBulkRowsSelected(true)); }
    if (clearSelectionButton && clearSelectionButton.dataset.bound !== "1") { clearSelectionButton.dataset.bound="1"; clearSelectionButton.addEventListener("click",()=>App.setAllStudentBulkRowsSelected(false)); }
    if (masterCheckbox && masterCheckbox.dataset.bound !== "1") { masterCheckbox.dataset.bound="1"; masterCheckbox.addEventListener("change",function(){ App.setAllStudentBulkRowsSelected(this.checked); }); }
    if (type && type.dataset.bound !== "1") { type.dataset.bound="1"; type.addEventListener("change",()=>{
        if (App.bulkStudentRows.length) {
            App.bulkStudentRows = App.bulkStudentRows.map(r=>{
                const updated = App.normalizeBulkStudentRow({
                    "رقم التسجیل":r.wifaq_registration_no,"رجسٹریشن":r.legacy_registration_no,"نام":r.name,"ولدیت":r.father_name,
                    "درجہ":r.student_class,"تاريخ پیدائش":r.date_of_birth,"شناختی کارڈ":r.cnic,"رابطہ نمبر":r.phone,"موجودہ پتہ":r.address
                },r.row_no);
                updated.username = r.username;
                updated.password = r.password;
                updated.imported = !!r.imported;
                updated.selected = updated.valid && !updated.imported && (r.selected !== false);
                return updated;
            });
            App.renderStudentBulkPreview();
        }
    }); }
};

App.initAccountsPage =
    async function () {

        if (
            App.currentFile !==
            "admin-accounts.html"
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


        await App.loadAccountApplications();
        await App.loadRecoveryRequests();
        App.initStudentBulkImport();

        const selectAllPending = App.el("selectAllPendingApplications");
        if (selectAllPending && selectAllPending.dataset.bound !== "1") {
            selectAllPending.dataset.bound = "1";
            selectAllPending.addEventListener("change", function () {
                document.querySelectorAll("[data-account-select]").forEach(box => { box.checked = selectAllPending.checked; });
                App.updateBulkApprovalSelection();
            });
        }

        const approveSelected = App.el("approveSelectedApplications");
        if (approveSelected && approveSelected.dataset.bound !== "1") {
            approveSelected.dataset.bound = "1";
            approveSelected.addEventListener("click", App.approveSelectedApplications);
        }

        const refreshRecovery = App.el("refreshRecoveryRequests");
        if (refreshRecovery && refreshRecovery.dataset.bound !== "1") {
            refreshRecovery.dataset.bound = "1";
            refreshRecovery.addEventListener("click", App.loadRecoveryRequests);
        }
    };


/* =====================================================
   DEDICATED APPLICATION APPROVAL PAGE
   approvals.html
   ===================================================== */

App.approvalPageRecords = [];
App.approvalPageSelectedKey = null;
App.approvalPageDecision = null;

App.approvalStatusKey = function (status) {
    const value = App.safe(status || "pending").trim().toLowerCase();

    if (["approved", "active", "منظور", "منظور شدہ", "فعال"].includes(value)) {
        return "approved";
    }

    if (["rejected", "declined", "مسترد", "نامنظور", "رد"].includes(value)) {
        return "rejected";
    }

    return "pending";
};

App.approvalPageShow = function (id) {
    const node = App.el(id);
    if (node) node.classList.remove("hidden");
};

App.approvalPageHide = function (id) {
    const node = App.el(id);
    if (node) node.classList.add("hidden");
};

App.renderApprovalPageList = function (type, records) {
    const isTeacher = type === "teacher";
    const list = App.el(isTeacher ? "teacherApplicationsList" : "studentApplicationsList");
    const count = App.el(isTeacher ? "teacherApplicationCount" : "studentApplicationCount");

    records = Array.isArray(records) ? records : [];

    if (count) count.textContent = String(records.length);
    if (!list) return;

    if (!records.length) {
        list.innerHTML = App.empty(isTeacher ? "اساتذہ کی کوئی درخواست موجود نہیں۔" : "طالبات کی کوئی درخواست موجود نہیں۔");
        return;
    }

    list.innerHTML = records.map(item => {
        const id = Number(item.id || 0);
        const key = type + ":" + id;
        const statusKey = App.approvalStatusKey(item.status);
        const statusText = App.statusUrdu(item.status || "pending");
        const name = item.name || item.full_name || "—";
        const ref = item.application_no || item.request_no || item.admission_no || item.teacher_code || id || "—";
        const cls = item.student_class || item.teaching_class || item.class_name || "—";
        const phone = item.phone || "—";
        const username = item.requested_username || item.username || "—";

        return `
            <article class="record-card application-record-card">
                <div class="record-card-main">
                    <h3>${App.escape(name)}</h3>
                    <p>درخواست نمبر: <strong>${App.escape(ref)}</strong></p>
                    <p>${isTeacher ? "تدریسی جماعت" : "جماعت"}: ${App.escape(cls)}</p>
                    <p>فون: ${App.escape(phone)}</p>
                    <p>صارف نام: ${App.escape(username)}</p>
                    <p>حالت: <strong>${App.escape(statusText)}</strong></p>
                </div>
                <div class="record-card-actions">
                    <button type="button" data-approval-view="${App.escape(key)}">تفصیل</button>
                    ${statusKey === "pending" ? `
                        <button type="button" data-approval-approve="${App.escape(key)}">منظور کریں</button>
                        <button type="button" data-approval-reject="${App.escape(key)}">نامنظور کریں</button>
                    ` : ""}
                </div>
            </article>`;
    }).join("");

    list.querySelectorAll("[data-approval-view]").forEach(button => {
        button.addEventListener("click", () => App.openApprovalPageDetails(button.dataset.approvalView));
    });

    list.querySelectorAll("[data-approval-approve]").forEach(button => {
        button.addEventListener("click", () => {
            App.openApprovalPageDetails(button.dataset.approvalApprove);
            App.prepareApprovalPageDecision("approved");
        });
    });

    list.querySelectorAll("[data-approval-reject]").forEach(button => {
        button.addEventListener("click", () => {
            App.openApprovalPageDetails(button.dataset.approvalReject);
            App.prepareApprovalPageDecision("rejected");
        });
    });
};

App.openApprovalPageDetails = function (key) {
    const record = App.approvalPageRecords.find(item => item.application_key === key);
    if (!record) return;

    App.approvalPageSelectedKey = key;

    App.setText(
        "applicationDetailsTitle",
        (record.application_type === "teacher" ? "استاد" : "طالبہ") + " کی درخواست"
    );

    const content = App.el("applicationDetailsContent");
    if (content) {
        content.innerHTML = App.renderDeepProfile(record, "account");
    }

    const note = App.el("applicationAdminNote");
    if (note) note.value = App.safe(record.admin_note || "");

    const decision = App.el("applicationDecisionSection");
    if (decision) {
        decision.style.display = App.approvalStatusKey(record.status) === "pending" ? "block" : "none";
    }

    App.approvalPageShow("applicationDetailsOverlay");
};

App.prepareApprovalPageDecision = function (decision) {
    if (!App.approvalPageSelectedKey) return;

    App.approvalPageDecision = decision;

    App.setText(
        "approvalConfirmationTitle",
        decision === "approved" ? "درخواست منظور کریں" : "درخواست نامنظور کریں"
    );

    const body = App.el("approvalConfirmationContent");
    if (body) {
        body.textContent = decision === "approved"
            ? "کیا آپ واقعی یہ درخواست منظور کرنا چاہتے ہیں؟"
            : "کیا آپ واقعی یہ درخواست نامنظور کرنا چاہتے ہیں؟";
    }

    App.approvalPageShow("approvalConfirmationOverlay");
};

App.confirmApprovalPageDecision = async function () {
    const key = App.approvalPageSelectedKey;
    const decision = App.approvalPageDecision;
    if (!key || !decision) return;

    const record = App.approvalPageRecords.find(item => item.application_key === key);
    if (!record) return;

    const note = App.safe(App.el("applicationAdminNote")?.value).trim() || null;
    const type = record.application_type;

    const rpcName =
        type === "teacher"
            ? decision === "approved"
                ? "admin_approve_teacher_application"
                : "admin_reject_teacher_application"
            : decision === "approved"
                ? "admin_approve_student_application"
                : "admin_reject_student_application";

    const confirmButton = App.el("confirmApplicationDecision");
    if (confirmButton) confirmButton.disabled = true;

    try {
        await App.authedRpc(rpcName, {
            p_application_id: Number(record.id),
            p_admin_note: note
        });

        alert(decision === "approved" ? "درخواست منظور ہوگئی۔" : "درخواست نامنظور ہوگئی۔");

        App.approvalPageHide("approvalConfirmationOverlay");
        App.approvalPageHide("applicationDetailsOverlay");
        App.approvalPageSelectedKey = null;
        App.approvalPageDecision = null;

        await App.loadApprovalPage();
    } catch (error) {
        console.error("Approval page decision:", error);
        alert(error?.message || "درخواست اپڈیٹ نہیں ہو سکی۔");
    } finally {
        if (confirmButton) confirmButton.disabled = false;
    }
};

App.loadApprovalPage = async function () {
    let students = [];
    let teachers = [];

    try {
        students = App.asArray(await App.authedRpc("admin_get_student_applications"));
        App.message("studentApplicationsMessage", "", "");
    } catch (error) {
        console.error("Approval student applications:", error);
        App.message("studentApplicationsMessage", "طالبات کی درخواستیں لوڈ نہیں ہو سکیں۔", "error");
    }

    try {
        teachers = App.asArray(await App.authedRpc("admin_get_teacher_applications"));
        App.message("teacherApplicationsMessage", "", "");
    } catch (error) {
        console.error("Approval teacher applications:", error);
        App.message("teacherApplicationsMessage", "اساتذہ کی درخواستیں لوڈ نہیں ہو سکیں۔", "error");
    }

    App.approvalPageRecords = [
        ...students.map(item => ({
            ...item,
            application_type: "student",
            application_key: "student:" + Number(item.id)
        })),
        ...teachers.map(item => ({
            ...item,
            application_type: "teacher",
            application_key: "teacher:" + Number(item.id)
        }))
    ];

    const pendingStudents = students.filter(item => App.approvalStatusKey(item.status) === "pending");
    const pendingTeachers = teachers.filter(item => App.approvalStatusKey(item.status) === "pending");
    const approvedTotal = App.approvalPageRecords.filter(item => App.approvalStatusKey(item.status) === "approved").length;
    const rejectedTotal = App.approvalPageRecords.filter(item => App.approvalStatusKey(item.status) === "rejected").length;

    App.setText("pendingStudentApplications", pendingStudents.length, "0");
    App.setText("pendingTeacherApplications", pendingTeachers.length, "0");
    App.setText("approvedApplicationsTotal", approvedTotal, "0");
    App.setText("rejectedApplicationsTotal", rejectedTotal, "0");

    App.renderApprovalPageList("student", students);
    App.renderApprovalPageList("teacher", teachers);
};

App.initApprovalsPage = async function () {
    if (App.currentFile !== "approvals.html") return;

    const session = await App.requireRole("admin");
    if (!session) return;

    const back = App.el("backToDashboard");
    if (back && back.dataset.bound !== "1") {
        back.dataset.bound = "1";
        back.addEventListener("click", () => {
            localStorage.setItem("lastActivity", String(Date.now()));
            window.location.href = "admin.html";
        });
    }

    const closeDetails = App.el("closeApplicationDetails");
    if (closeDetails && closeDetails.dataset.bound !== "1") {
        closeDetails.dataset.bound = "1";
        closeDetails.addEventListener("click", () => App.approvalPageHide("applicationDetailsOverlay"));
    }

    const approve = App.el("approveApplicationButton");
    if (approve && approve.dataset.bound !== "1") {
        approve.dataset.bound = "1";
        approve.addEventListener("click", () => App.prepareApprovalPageDecision("approved"));
    }

    const reject = App.el("rejectApplicationButton");
    if (reject && reject.dataset.bound !== "1") {
        reject.dataset.bound = "1";
        reject.addEventListener("click", () => App.prepareApprovalPageDecision("rejected"));
    }

    ["closeApprovalConfirmation", "cancelApplicationDecision"].forEach(id => {
        const node = App.el(id);
        if (node && node.dataset.bound !== "1") {
            node.dataset.bound = "1";
            node.addEventListener("click", () => App.approvalPageHide("approvalConfirmationOverlay"));
        }
    });

    const confirm = App.el("confirmApplicationDecision");
    if (confirm && confirm.dataset.bound !== "1") {
        confirm.dataset.bound = "1";
        confirm.addEventListener("click", App.confirmApprovalPageDecision);
    }

    await App.loadApprovalPage();
};


/* =====================================================
   TEACHER DASHBOARD
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
                await App.authedRpc(
                    "teacher_get_my_profile"
                );

            const teacherProfile =
                teacher?.profile ||
                teacher?.teacher ||
                teacher;


            if (!teacherProfile) {
                return;
            }


            const mapping = {

                teacherProfileName:
                    teacherProfile.name,

                teacherName:
                    teacherProfile.name,

                teacherProfileCode:
                    teacherProfile.teacher_code,

                teacherProfilePhone:
                    teacherProfile.phone,

                teacherProfileCNIC:
                    teacherProfile.cnic,

                teacherProfileQualification:
                    teacherProfile.qualification,

                teacherProfileClass:
                    teacherProfile.teaching_class,

                teacherProfileSubject:
                    teacherProfile.subject,

                teacherProfileExperience:
                    teacherProfile.experience_years,

                teacherProfileJoiningDate:
                    App.date(
                        teacherProfile.joining_date
                    )
            };


            Object.entries(
                mapping
            )
                .forEach(
                    ([id, value]) => {

                        App.setText(
                            id,
                            value
                        );
                    }
                );


        } catch (error) {

            console.error(
                "Teacher dashboard:",
                error
            );
        }
    };


/* =====================================================
   TEACHER STUDENTS
   ===================================================== */

App.initTeacherStudents =
    async function () {

        if (
            App.currentFile !==
            "teacher-students.html"
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


        const container =
            App.first(
                "teacherStudentsList",
                "studentsList"
            );


        if (!container) {
            return;
        }


        try {

            const students =
                App.asArray(
                    await App.authedRpc(
                        "attendance_get_students",
                        {
                            p_class: null
                        }
                    )
                );


            container.innerHTML =
                students.length
                    ? students
                        .map(
                            student => `
                            <article class="record-card">

                                <h3>
                                    ${App.escape(
                                        student.name
                                    )}
                                </h3>

                                <p>
                                    داخلہ:
                                    ${App.escape(
                                        student.admission_no ||
                                        "—"
                                    )}
                                </p>

                                <p>
                                    کلاس:
                                    ${App.escape(
                                        student.student_class ||
                                        "—"
                                    )}
                                </p>

                            </article>
                        `
                        )
                        .join("")
                    : App.empty(
                        "کوئی طالبہ موجود نہیں۔"
                    );


        } catch (error) {

            console.error(
                "Teacher students:",
                error
            );
        }
    };


/* =====================================================
   TEACHER MARKS
   ===================================================== */

App.initTeacherMarks =
    async function () {

        if (
            App.currentFile !==
            "teacher-marks.html"
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


        const body =
            App.first(
                "teacherMarksBody",
                "marksTableBody"
            );


        if (!body) {
            return;
        }


        try {

            const records =
                App.asArray(
                    await App.authedRpc(
                        "marks_get_manage",
                        {
                            p_student_id: null
                        }
                    )
                );


            body.innerHTML =
                records.length
                    ? records
                        .map(
                            row => `
                            <tr>

                                <td>
                                    ${App.escape(
                                        row.student_id ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        row.exam_name ||
                                        row.exam_type ||
                                        "—"
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
                                        App.date(
                                            row.exam_date
                                        )
                                    )}
                                </td>

                            </tr>
                        `
                        )
                        .join("")
                    : `
                    <tr>
                        <td colspan="5">
                            کوئی نمبرات موجود نہیں۔
                        </td>
                    </tr>
                `;


        } catch (error) {

            console.error(
                "Teacher marks:",
                error
            );
        }
    };


/* =====================================================
   TEACHER HOMEWORK
   ===================================================== */

App.initTeacherHomework =
    async function () {

        if (
            App.currentFile !==
            "teacher-homework.html"
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


        const container =
            App.first(
                "teacherHomeworkList",
                "homeworkList"
            );


        if (!container) {
            return;
        }


        try {

            const records =
                App.asArray(
                    await App.authedRpc(
                        "homework_get_manage"
                    )
                );


            container.innerHTML =
                records.length
                    ? records
                        .map(
                            row => `
                            <article class="portal-card">

                                <h3>
                                    ${App.escape(
                                        row.title ||
                                        "ہوم ورک"
                                    )}
                                </h3>

                                <p>
                                    ${App.escape(
                                        row.description ||
                                        ""
                                    )}
                                </p>

                                <p>
                                    کلاس:
                                    ${App.escape(
                                        row.student_class ||
                                        "—"
                                    )}
                                </p>

                                <p>
                                    آخری تاریخ:
                                    ${App.escape(
                                        App.date(
                                            row.due_date
                                        )
                                    )}
                                </p>

                            </article>
                        `
                        )
                        .join("")
                    : App.empty(
                        "کوئی ہوم ورک موجود نہیں۔"
                    );


        } catch (error) {

            console.error(
                "Teacher homework:",
                error
            );
        }
    };


/* =====================================================
   TEACHER ANNOUNCEMENTS
   ===================================================== */

App.initTeacherAnnouncements =
    async function () {

        if (
            App.currentFile !==
            "teacher-announcements.html"
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


        const container =
            App.first(
                "teacherAnnouncementsList",
                "announcementsList"
            );


        if (!container) {
            return;
        }


        try {

            const records =
                App.asArray(
                    await App.authedRpc(
                        "announcement_get_manage"
                    )
                );


            container.innerHTML =
                records.length
                    ? records
                        .map(
                            item => `
                            <article class="portal-card">

                                <h3>
                                    ${App.escape(
                                        item.title ||
                                        "اعلان"
                                    )}
                                </h3>

                                <p>
                                    ${App.escape(
                                        item.message ||
                                        ""
                                    )}
                                </p>

                                <small>
                                    ${App.escape(
                                        App.dateTime(
                                            item.created_at
                                        )
                                    )}
                                </small>

                            </article>
                        `
                        )
                        .join("")
                    : App.empty(
                        "کوئی اعلان موجود نہیں۔"
                    );


        } catch (error) {

            console.error(
                "Teacher announcements:",
                error
            );
        }
    };


/* =====================================================
   TEACHER FEEDBACK
   ===================================================== */

App.initTeacherFeedback =
    async function () {

        if (
            App.currentFile !==
            "teacher-feedback.html"
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
            Number(
                session.teacher_id ||
                App.getTeacherId()
            );


        const body =
            App.first(
                "teacherFeedbackBody",
                "feedbackTableBody"
            );


        if (!body) {
            return;
        }


        try {

            const records =
                App.asArray(
                    await App.authedRpc(
                        "teacher_get_feedback"
                    )
                );


            body.innerHTML =
                records.length
                    ? records
                        .map(
                            item => `
                            <tr>

                                <td>
                                    ${App.escape(
                                        item.student_id ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        item.rating ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        item.feedback_text ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${App.escape(
                                        App.date(
                                            item.feedback_date
                                        )
                                    )}
                                </td>

                            </tr>
                        `
                        )
                        .join("")
                    : `
                    <tr>
                        <td colspan="4">
                            کوئی نوٹ موجود نہیں۔
                        </td>
                    </tr>
                `;


        } catch (error) {

            console.error(
                "Teacher feedback:",
                error
            );
        }
    };


/* =====================================================
   STUDENT DASHBOARD
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
                await App.authedRpc(
                    "student_get_my_profile"
                );

            const studentProfile =
                student?.profile ||
                student?.student ||
                student;


            if (!studentProfile) {
                return;
            }


            const mapping = {

                studentProfileName:
                    studentProfile.name,

                studentName:
                    studentProfile.name,

                studentProfileAdmissionNo:
                    studentProfile.admission_no,

                studentProfileClass:
                    studentProfile.student_class,

                studentProfileFatherName:
                    studentProfile.father_name,

                studentProfileGuardianName:
                    studentProfile.guardian_name,

                studentProfilePhone:
                    studentProfile.phone,

                studentProfileCNIC:
                    studentProfile.cnic,

                studentProfileDOB:
                    App.date(
                        studentProfile.date_of_birth
                    ),

                studentProfileResidence:
                    studentProfile.residence_type,

                studentProfileAddress:
                    studentProfile.address
            };


            Object.entries(
                mapping
            )
                .forEach(
                    ([id, value]) => {

                        App.setText(
                            id,
                            value
                        );
                    }
                );


            try {

                const attendance =
                    await App.authedRpc(
                        "attendance_get_student_summary",
                        {
                            p_range: "year",
                            p_reference_date:
                                new Date()
                                    .toISOString()
                                    .slice(0, 10)
                        }
                    );


                const summary =
                    {
                        total: Number(attendance?.total_attendance || 0),
                        present: Number(attendance?.present_count || 0),
                        absent: Number(attendance?.absent_count || 0),
                        leave: Number(attendance?.leave_count || 0),
                        late: Number(attendance?.late_count || 0),
                        percentage: Number(attendance?.attendance_percentage || 0).toFixed(1)
                    };


                App.setText(
                    "studentAttendanceTotal",
                    summary.total,
                    "0"
                );


                App.setText(
                    "studentAttendancePresent",
                    summary.present,
                    "0"
                );


                App.setText(
                    "studentAttendanceAbsent",
                    summary.absent,
                    "0"
                );


                App.setText(
                    "studentAttendanceLeave",
                    summary.leave,
                    "0"
                );


                App.setText(
                    "studentAttendanceLate",
                    summary.late,
                    "0"
                );


                App.setText(
                    "studentAttendancePercentage",
                    summary.percentage +
                    "%",
                    "0.0%"
                );


            } catch (error) {

                console.warn(
                    "Student attendance summary:",
                    error
                );
            }


            try {

                const marks =
                    await App.authedRpc(
                        "marks_get_student_summary"
                    );


                const summary =
                    {
                        total: Number(marks?.total_marks || 0),
                        obtained: Number(marks?.obtained_marks || 0),
                        percentage: Number(marks?.percentage || 0).toFixed(1)
                    };


                App.setText(
                    "studentMarksTotal",
                    summary.total,
                    "0"
                );


                App.setText(
                    "studentMarksObtained",
                    summary.obtained,
                    "0"
                );


                App.setText(
                    "studentMarksPercentage",
                    summary.percentage +
                    "%",
                    "0.0%"
                );


            } catch (error) {

                console.warn(
                    "Student marks summary:",
                    error
                );
            }


        } catch (error) {

            console.error(
                "Student dashboard:",
                error
            );
        }
    };


/* =====================================================
   PASSWORD VISIBILITY BUTTONS
   ===================================================== */

App.bindPasswordVisibilityButtons =
    function () {

        document
            .querySelectorAll(
                "[data-password-target]"
            )
            .forEach(
                button => {

                    if (
                        button.dataset
                            .passwordEyeBound ===
                        "true"
                    ) {
                        return;
                    }

                    const targetId =
                        button.getAttribute(
                            "data-password-target"
                        );

                    const input =
                        targetId
                            ? App.el(targetId)
                            : null;

                    if (!input) {
                        return;
                    }

                    button.dataset.passwordEyeBound =
                        "true";

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            const show =
                                input.type ===
                                "password";

                            input.type =
                                show
                                    ? "text"
                                    : "password";

                            button.setAttribute(
                                "aria-label",
                                show
                                    ? "پاس ورڈ چھپائیں"
                                    : "پاس ورڈ دکھائیں"
                            );
                        }
                    );
                }
            );
    };


/* =====================================================
   STUDENT SETTINGS PROFILE
   ===================================================== */

App.loadStudentSettingsProfile =
    async function () {

        if (
            App.currentFile !==
            "settings.html"
        ) {
            return;
        }

        const message =
            App.el(
                "studentSettingsMessage"
            );

        try {

            const session =
                await App.requireRole(
                    "student"
                );

            if (!session) {
                return;
            }

            const result =
                await App.authedRpc(
                    "student_get_my_profile"
                );

            const profile =
                result?.profile ||
                result?.student ||
                result ||
                {};

            const mapping = {
                settingsStudentName:
                    profile.name ||
                    "—",
                settingsAdmissionNo:
                    profile.admission_no ||
                    "—",
                settingsFatherName:
                    profile.father_name ||
                    "—",
                settingsStudentClass:
                    profile.student_class ||
                    "—",
                settingsStudentPhone:
                    profile.phone ||
                    "—",
                settingsAccountStatus:
                    App.statusUrdu(
                        profile.account_status ||
                        profile.status ||
                        session.status ||
                        "active"
                    )
            };

            Object.entries(mapping)
                .forEach(
                    ([id, value]) => {
                        App.setText(
                            id,
                            value,
                            "—"
                        );
                    }
                );

            if (message) {
                message.textContent =
                    "";
                message.className =
                    "";
            }

        } catch (error) {

            console.error(
                "Student settings profile:",
                error
            );

            if (message) {
                App.message(
                    message,
                    "اکاؤنٹ کی معلومات لوڈ نہیں ہو سکیں۔",
                    "error"
                );
            }
        }
    };


App.bindStudentPasswordRequirements =
    function () {

        if (
            App.currentFile !==
            "settings.html"
        ) {
            return;
        }

        const password =
            App.el(
                "newStudentPassword"
            );

        const confirm =
            App.el(
                "confirmStudentPassword"
            );

        const lengthNode =
            App.el(
                "passwordLengthRequirement"
            );

        const matchNode =
            App.el(
                "passwordMatchRequirement"
            );

        if (!password || !confirm) {
            return;
        }

        const update =
            function () {

                const lengthOk =
                    password.value.length >=
                    8;

                const matchOk =
                    confirm.value.length > 0 &&
                    password.value ===
                    confirm.value;

                if (lengthNode) {
                    lengthNode.textContent =
                        (lengthOk ? "✓ " : "○ ") +
                        "کم از کم 8 حروف";
                }

                if (matchNode) {
                    matchNode.textContent =
                        (matchOk ? "✓ " : "○ ") +
                        "دونوں نئے پاس ورڈ ایک جیسے ہوں";
                }
            };

        [password, confirm]
            .forEach(
                input => {
                    if (
                        input.dataset
                            .passwordRequirementBound ===
                        "true"
                    ) {
                        return;
                    }
                    input.dataset.passwordRequirementBound =
                        "true";
                    input.addEventListener(
                        "input",
                        update
                    );
                }
            );

        update();
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


        App.bindOnce(
            form,
            "passwordChange",
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


                if (!currentPassword) {

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
                        "change_my_password",
                        {
                            p_current_password:
                                currentPassword,

                            p_new_password:
                                newPassword
                        }
                    );


                    alert(
                        "پاس ورڈ تبدیل ہوگیا۔ دوبارہ لاگ اِن کریں۔"
                    );


                    await App.logout();


                } catch (error) {

                    console.error(
                        "Password change:",
                        error
                    );


                    alert(
                        error?.message ||
                        "پاس ورڈ تبدیل نہیں ہو سکا۔"
                    );
                }
            }
        );
    };


App.applySavedLanguage =
    function () {

        const language =
            localStorage.getItem(
                "madrassaLanguage"
            ) ||
            "ur";


        document.documentElement.lang =
            language;


        document.documentElement.dir =
            language === "en"
                ? "ltr"
                : "rtl";


        return language;
    };


App.bindLanguageSetting =
    function () {

        const selector =
            App.first(
                "languageSelector",
                "settingsLanguage",
                "portalLanguage"
            );


        if (!selector) {
            return;
        }


        const current =
            App.applySavedLanguage();


        selector.value =
            current;


        App.bindOnce(
            selector,
            "language",
            "change",
            function () {

                const value =
                    selector.value ||
                    "ur";


                localStorage.setItem(
                    "madrassaLanguage",
                    value
                );


                document.documentElement.lang =
                    value;


                document.documentElement.dir =
                    value === "en"
                        ? "ltr"
                        : "rtl";


                window.location.reload();
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


        App.bindPasswordVisibilityButtons();

        App.bindStudentPasswordRequirements();

        App.bindAdminRecoveryCodeForm();

        App.bindLanguageSetting();

        if (
            App.currentFile ===
            "settings.html"
        ) {
            App.loadStudentSettingsProfile();
        }
    };


/* =====================================================
   PART 3 / 4 COMPLETE

   DO NOT ADD })();

   PART 4 / 4 MUST CONTINUE DIRECTLY BELOW.
   ===================================================== */

 /* =========================================================
   مدرسہ شہناز اختر للبنات
   COMPLETE FRONTEND SCRIPT
   PART 4 / 4
   APPLICATIONS + MISSING ACTIONS + REPORTS + PRINT PROFILE
   FINAL ROUTING / INITIALIZATION / BOOT
   ========================================================= */


/* =====================================================
   SECURE ACTION HELPERS
   ===================================================== */

App.rpcMissing =
    function (error) {

        const text =
            App.safe(
                error?.message ||
                error?.details ||
                error?.hint ||
                ""
            )
                .toLowerCase();

        return (
            text.includes("function") &&
            (
                text.includes("not found") ||
                text.includes("does not exist") ||
                text.includes("schema cache")
            )
        );
    };


App.secureAction =
    async function (
        rpcName,
        args = {},
        missingMessage =
            "یہ محفوظ عمل ابھی backend میں دستیاب نہیں ہے۔"
    ) {

        try {

            return await App.authedRpc(
                rpcName,
                args
            );

        } catch (error) {

            if (
                App.rpcMissing(error)
            ) {

                throw new Error(
                    missingMessage
                );
            }

            throw error;
        }
    };


App.valueAny =
    function (...ids) {

        const node =
            App.first(...ids);

        return node
            ? App.safe(
                node.value
            ).trim()
            : "";
    };


App.ageYears =
    function (value) {

        if (!value) {
            return null;
        }

        const birth =
            new Date(value);

        if (
            Number.isNaN(
                birth.getTime()
            )
        ) {
            return null;
        }

        const today =
            new Date();

        let age =
            today.getFullYear() -
            birth.getFullYear();

        const month =
            today.getMonth() -
            birth.getMonth();

        if (
            month < 0 ||
            (
                month === 0 &&
                today.getDate() <
                birth.getDate()
            )
        ) {
            age -= 1;
        }

        return age;
    };


/* =====================================================
   APPLICATION MAHRAMS
   ===================================================== */

App.collectApplicationMahrams =
    function () {

        const rows =
            Array.from(
                document.querySelectorAll(
                    "[data-mahram-row]"
                )
            );

        const result = [];

        if (rows.length) {

            rows
                .slice(
                    0,
                    App.MAX_MAHRAMS
                )
                .forEach(
                    row => {

                        const name =
                            App.safe(
                                row.querySelector(
                                    "[data-mahram-name], .mahram-name"
                                )?.value
                            ).trim();

                        const relation =
                            App.safe(
                                row.querySelector(
                                    "[data-mahram-relation], .mahram-relation"
                                )?.value
                            ).trim();

                        const cnic =
                            App.normalizeDigits(
                                row.querySelector(
                                    "[data-mahram-cnic], .mahram-cnic"
                                )?.value ||
                                ""
                            );

                        const phone =
                            App.normalizePhone(
                                row.querySelector(
                                    "[data-mahram-phone], .mahram-phone"
                                )?.value ||
                                ""
                            );

                        if (
                            name ||
                            relation ||
                            cnic ||
                            phone
                        ) {

                            result.push({
                                name:
                                    name ||
                                    null,

                                relation:
                                    relation ||
                                    null,

                                cnic:
                                    cnic ||
                                    null,

                                phone:
                                    phone ||
                                    null
                            });
                        }
                    }
                );

            return result;
        }

        for (
            let index = 1;
            index <= App.MAX_MAHRAMS;
            index += 1
        ) {

            const name =
                App.valueAny(
                    "mahramName" + index,
                    "studentMahramName" + index
                );

            const relation =
                App.valueAny(
                    "mahramRelation" + index,
                    "studentMahramRelation" + index
                );

            const cnic =
                App.normalizeDigits(
                    App.valueAny(
                        "mahramCNIC" + index,
                        "studentMahramCNIC" + index
                    )
                );

            const phone =
                App.normalizePhone(
                    App.valueAny(
                        "mahramPhone" + index,
                        "studentMahramPhone" + index
                    )
                );

            if (
                name ||
                relation ||
                cnic ||
                phone
            ) {

                result.push({
                    name:
                        name ||
                        null,

                    relation:
                        relation ||
                        null,

                    cnic:
                        cnic ||
                        null,

                    phone:
                        phone ||
                        null
                });
            }
        }

        return result;
    };


App.bindApplicationUtilities =
    function () {

        [
            "backToHome",
            "cancelStudentApplication",
            "cancelTeacherApplication"
        ].forEach(
            id => {
                const button = App.el(id);
                if (!button) return;
                App.bindOnce(
                    button,
                    "applicationBack",
                    "click",
                    () => window.location.replace("index.html")
                );
            }
        );

        const admissionType =
            App.el("applyAdmissionType");
        const classSelect =
            App.el("applyClass");
        const previousGroup =
            App.el("applyPreviousMadrassaGroup");
        const transferGroup =
            App.el("applyTransferDateGroup");

        const updateAdmissionFields =
            function () {
                if (!admissionType) return;
                const transfer =
                    admissionType.value === "منتقلی";
                [previousGroup, transferGroup]
                    .forEach(node => {
                        if (node) node.hidden = !transfer;
                    });
                if (classSelect) {
                    Array.from(classSelect.options)
                        .forEach(option => {
                            option.disabled =
                                !transfer &&
                                option.value &&
                                !App.NEW_ADMISSION_CLASSES.includes(option.value);
                        });
                    if (
                        !transfer &&
                        classSelect.value &&
                        !App.NEW_ADMISSION_CLASSES.includes(classSelect.value)
                    ) {
                        classSelect.value = "";
                    }
                }
            };

        if (admissionType) {
            App.bindOnce(
                admissionType,
                "admissionFields",
                "change",
                updateAdmissionFields
            );
            updateAdmissionFields();
        }

        const residence =
            App.el("applyResidenceType");
        const mahramSection =
            App.el("applyMahramSection");
        const mahramList =
            App.el("applyMahramList");

        const addMahramRow =
            function () {
                if (!mahramList) return;
                const count =
                    mahramList.querySelectorAll("[data-mahram-row]").length;
                if (count >= App.MAX_MAHRAMS) {
                    alert("زیادہ سے زیادہ پانچ محرم شامل کیے جا سکتے ہیں۔");
                    return;
                }
                const row = document.createElement("div");
                row.className = "mahram-row form-grid";
                row.dataset.mahramRow = String(count + 1);
                row.innerHTML = `
                    <input class="mahram-name" data-mahram-name required placeholder="محرم کا نام">
                    <input class="mahram-relation" data-mahram-relation required placeholder="رشتہ">
                    <input class="mahram-cnic cnic-input" data-mahram-cnic required placeholder="شناختی نمبر">
                    <input class="mahram-phone phone-input" data-mahram-phone placeholder="فون نمبر">
                    <button type="button" data-remove-mahram>ہٹائیں</button>`;
                row.querySelector("[data-remove-mahram]")
                    ?.addEventListener("click", () => row.remove());
                mahramList.appendChild(row);
                App.bindInputFormatting();
            };

        const updateResidence =
            function () {
                if (!residence || !mahramSection) return;
                const resident =
                    residence.value === "مدرسہ میں رہائش" ||
                    residence.value === "ہاسٹل";
                mahramSection.hidden = !resident;
                if (resident && mahramList && !mahramList.children.length) {
                    addMahramRow();
                }
            };

        if (residence) {
            App.bindOnce(residence, "residenceFields", "change", updateResidence);
            updateResidence();
        }

        const addMahram = App.el("addApplyMahram");
        if (addMahram) {
            App.bindOnce(addMahram, "addMahram", "click", addMahramRow);
        }

        const bindStatusCheck =
            function (buttonId, inputId, resultId, rpcName) {
                const button = App.el(buttonId);
                const input = App.el(inputId);
                const result = App.el(resultId);
                if (!button || !input || !result) return;
                App.bindOnce(
                    button,
                    "statusCheck",
                    "click",
                    async function () {
                        const number = App.safe(input.value).trim();
                        if (!number) {
                            App.message(result, "درخواست نمبر درج کریں۔", "error");
                            return;
                        }
                        button.disabled = true;
                        try {
                            const data = await App.rpc(
                                rpcName,
                                { p_application_no: number }
                            );
                            if (!data) throw new Error("درخواست نہیں ملی");
                            const status = App.statusUrdu(data.status || "pending");
                            result.innerHTML = `
                                <strong>حالت: ${App.escape(status)}</strong>
                                ${data.admin_note ? `<p>${App.escape(data.admin_note)}</p>` : ""}`;
                            result.className = "message success";
                        } catch (error) {
                            App.message(result, error?.message || "درخواست نہیں ملی۔", "error");
                        } finally {
                            button.disabled = false;
                        }
                    }
                );
            };

        bindStatusCheck(
            "checkStudentApplicationStatus",
            "studentApplicationNumber",
            "studentApplicationStatusResult",
            "get_student_application_status"
        );
        bindStatusCheck(
            "checkTeacherApplicationStatus",
            "teacherApplicationNumber",
            "teacherApplicationStatusResult",
            "get_teacher_application_status"
        );
    };


/* =====================================================
   STUDENT APPLICATION
   ===================================================== */

App.initStudentApplication =
    function () {

        if (
            App.currentFile !==
            "student-apply.html"
        ) {
            return;
        }

        App.bindApplicationUtilities();

        const form =
            App.first(
                "studentApplicationForm",
                "studentApplyForm"
            );

        if (!form) {
            return;
        }

        App.bindOnce(
            form,
            "studentApplication",
            "submit",
            async function (event) {

                event.preventDefault();

                const admissionType =
                    App.valueAny(
                        "admissionType",
                        "studentAdmissionType",
                        "applyAdmissionType"
                    );

                const studentClass =
                    App.valueAny(
                        "studentClass",
                        "applicationStudentClass",
                        "applyClass"
                    );

                if (
                    admissionType === "نیا داخلہ" &&
                    studentClass &&
                    !App.NEW_ADMISSION_CLASSES.includes(studentClass)
                ) {

                    alert(
                        "نئے داخلہ کے لیے قاعدہ، ناظرہ، ترجمہ، حفظ، تجوید، اعدادیہ، متوسطہ یا ثانویہ خاصہ سال اول منتخب کریں۔ اس سے اوپر کی جماعت کے لیے منتقلی منتخب کریں۔"
                    );

                    return;
                }

                const phone =
                    App.normalizePhone(
                        App.valueAny(
                        "studentPhone",
                        "phone",
                        "applyPhone"
                        )
                    );

                const cnic =
                    App.normalizeDigits(
                        App.valueAny(
                        "studentCNIC",
                        "studentBForm",
                        "cnic",
                        "applyCNIC"
                        )
                    );

                if (
                    phone &&
                    phone.length !== 11
                ) {

                    alert(
                        "فون نمبر 11 ہندسوں کا ہونا چاہیے۔"
                    );

                    return;
                }

                if (
                    cnic &&
                    cnic.length !== 13
                ) {

                    alert(
                        "شناختی کارڈ / ب فارم 13 ہندسوں کا ہونا چاہیے۔"
                    );

                    return;
                }

                const password =
                    App.valueAny(
                        "studentApplicationPassword",
                        "applicationPassword",
                        "password",
                        "applyPassword"
                    );

                const confirmPassword =
                    App.valueAny(
                        "studentApplicationConfirmPassword",
                        "confirmPassword",
                        "applyConfirmPassword"
                    );

                if (
                    password &&
                    password.length < 8
                ) {

                    alert(
                        "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
                    );

                    return;
                }

                if (
                    confirmPassword &&
                    password !==
                    confirmPassword
                ) {

                    alert(
                        "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
                    );

                    return;
                }

                const name =
                    App.valueAny(
                        "studentName",
                        "name",
                        "applyStudentName"
                    );

                if (!name) {

                    alert(
                        "طالبہ کا نام درج کریں۔"
                    );

                    return;
                }

                const submit =
                    form.querySelector(
                        'button[type="submit"]'
                    );

                if (submit) {
                    submit.disabled = true;
                }

                try {

                    const result =
                        await App.rpc(
                            "submit_student_application",
                            {
                                p_admission_type:
                                    admissionType ||
                                    null,

                                p_name:
                                    name,

                                p_father_name:
                                    App.valueAny(
                                        "fatherName",
                                        "studentFatherName",
                                        "applyFatherName"
                                    ) ||
                                    null,

                                p_guardian_name:
                                    App.valueAny(
                                        "guardianName",
                                        "studentGuardianName",
                                        "applyGuardianName"
                                    ) ||
                                    null,

                                p_cnic:
                                    cnic ||
                                    null,

                                p_phone:
                                    phone ||
                                    null,

                                p_date_of_birth:
                                    App.valueAny(
                                        "dateOfBirth",
                                        "studentDateOfBirth",
                                        "studentDOB",
                                        "applyDateOfBirth"
                                    ) ||
                                    null,

                                p_student_class:
                                    studentClass ||
                                    null,

                                p_address:
                                    App.valueAny(
                                        "address",
                                        "studentAddress",
                                        "applyAddress"
                                    ) ||
                                    null,

                                p_residence_type:
                                    App.valueAny(
                                        "residenceType",
                                        "studentResidenceType",
                                        "applyResidenceType"
                                    ) ||
                                    null,

                                p_previous_madrassa:
                                    App.valueAny(
                                        "previousMadrassa",
                                        "studentPreviousMadrassa",
                                        "applyPreviousMadrassa"
                                    ) ||
                                    null,

                                p_transfer_date:
                                    App.valueAny(
                                        "transferDate",
                                        "studentTransferDate",
                                        "applyTransferDate"
                                    ) ||
                                    null,

                                p_mahrams:
                                    App.collectApplicationMahrams(),

                                p_username:
                                    App.valueAny(
                                        "studentApplicationUsername",
                                        "applicationUsername",
                                        "username",
                                        "applyUsername"
                                    ) ||
                                    null,

                                p_password:
                                    password ||
                                    null
                            }
                        );

                    alert(
                        "درخواست کامیابی سے جمع ہوگئی۔" +
                        (
                            result?.application_no ||
                            typeof result === "string" ||
                            typeof result === "number"
                                ? "\nدرخواست نمبر: " +
                                  App.safe(
                                      result?.application_no ||
                                      result
                                  )
                                : ""
                        )
                    );

                    form.reset();

                    sessionStorage.removeItem(
                        App.PUBLIC_ENTRY_KEY
                    );

                } catch (error) {

                    console.error(
                        "Student application:",
                        error
                    );

                    alert(
                        error?.message ||
                        "درخواست جمع نہیں ہو سکی۔"
                    );

                } finally {

                    if (submit) {
                        submit.disabled = false;
                    }
                }
            }
        );
    };


/* =====================================================
   TEACHER APPLICATION
   ===================================================== */

App.initTeacherApplication =
    function () {

        if (
            App.currentFile !==
            "teacher-apply.html"
        ) {
            return;
        }

        App.bindApplicationUtilities();

        const form =
            App.first(
                "teacherApplicationForm",
                "teacherApplyForm"
            );

        if (!form) {
            return;
        }

        App.bindOnce(
            form,
            "teacherApplication",
            "submit",
            async function (event) {

                event.preventDefault();

                const dob =
                    App.valueAny(
                        "teacherDateOfBirth",
                        "dateOfBirth",
                        "teacherDOB",
                        "applyTeacherDateOfBirth"
                    );

                const age =
                    App.ageYears(dob);

                if (
                    age === null ||
                    age < 25
                ) {

                    alert(
                        "استاد کی عمر کم از کم 25 سال ہونی چاہیے۔"
                    );

                    return;
                }

                const experience =
                    Number(
                        App.valueAny(
                            "teacherExperience",
                            "teacherExperienceYears",
                            "experienceYears",
                            "applyTeacherExperience"
                        ) ||
                        0
                    );

                if (
                    !Number.isFinite(
                        experience
                    ) ||
                    experience < 5
                ) {

                    alert(
                        "استاد کے لیے کم از کم 5 سال تدریسی تجربہ ضروری ہے۔"
                    );

                    return;
                }

                const phone =
                    App.normalizePhone(
                        App.valueAny(
                        "teacherPhone",
                        "phone",
                        "applyTeacherPhone"
                        )
                    );

                const cnic =
                    App.normalizeDigits(
                        App.valueAny(
                        "teacherCNIC",
                        "cnic",
                        "applyTeacherCNIC"
                        )
                    );

                if (
                    phone &&
                    phone.length !== 11
                ) {

                    alert(
                        "فون نمبر 11 ہندسوں کا ہونا چاہیے۔"
                    );

                    return;
                }

                if (
                    cnic &&
                    cnic.length !== 13
                ) {

                    alert(
                        "شناختی کارڈ 13 ہندسوں کا ہونا چاہیے۔"
                    );

                    return;
                }

                const password =
                    App.valueAny(
                        "teacherApplicationPassword",
                        "applicationPassword",
                        "password",
                        "applyTeacherPassword"
                    );

                const confirmPassword =
                    App.valueAny(
                        "teacherApplicationConfirmPassword",
                        "confirmPassword",
                        "applyTeacherConfirmPassword"
                    );

                if (
                    password &&
                    password.length < 8
                ) {

                    alert(
                        "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"
                    );

                    return;
                }

                if (
                    confirmPassword &&
                    password !==
                    confirmPassword
                ) {

                    alert(
                        "دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"
                    );

                    return;
                }

                const name =
                    App.valueAny(
                        "teacherName",
                        "name",
                        "applyTeacherName"
                    );

                if (!name) {

                    alert(
                        "استاد کا نام درج کریں۔"
                    );

                    return;
                }

                const submit =
                    form.querySelector(
                        'button[type="submit"]'
                    );

                if (submit) {
                    submit.disabled = true;
                }

                try {

                    const result =
                        await App.rpc(
                            "submit_teacher_application",
                            {
                                p_name:
                                    name,

                                p_father_name:
                                    App.valueAny(
                                        "teacherFatherName",
                                        "fatherName",
                                        "applyTeacherFatherName"
                                    ) ||
                                    null,

                                p_phone:
                                    phone ||
                                    null,

                                p_cnic:
                                    cnic ||
                                    null,

                                p_qualification:
                                    App.valueAny(
                                        "teacherQualification",
                                        "qualification",
                                        "applyTeacherQualification"
                                    ) ||
                                    null,

                                p_address:
                                    App.valueAny(
                                        "teacherAddress",
                                        "address",
                                        "applyTeacherAddress"
                                    ) ||
                                    null,

                                p_date_of_birth:
                                    dob,

                                p_specialization:
                                    App.valueAny(
                                        "teacherSpecialization",
                                        "specialization",
                                        "applyTeacherSpecialization"
                                    ) ||
                                    null,

                                p_experience:
                                    App.valueAny(
                                        "teacherExperience",
                                        "teacherExperienceYears",
                                        "experienceYears",
                                        "applyTeacherExperience"
                                    ) || null,

                                p_previous_institute:
                                    App.valueAny(
                                        "previousInstitute",
                                        "teacherPreviousInstitute",
                                        "applyTeacherPreviousInstitute"
                                    ) ||
                                    null,

                                p_preferred_class:
                                    App.valueAny(
                                        "preferredClass",
                                        "teacherTeachingClass",
                                        "applyTeacherPreferredClass"
                                    ) ||
                                    null,

                                p_available_from:
                                    App.valueAny(
                                        "availableFrom",
                                        "teacherAvailableFrom",
                                        "applyTeacherAvailableFrom"
                                    ) ||
                                    null,

                                p_username:
                                    App.valueAny(
                                        "teacherApplicationUsername",
                                        "applicationUsername",
                                        "username",
                                        "applyTeacherUsername"
                                    ) ||
                                    null,

                                p_password:
                                    password ||
                                    null
                            }
                        );

                    alert(
                        "درخواست کامیابی سے جمع ہوگئی۔" +
                        (
                            result?.application_no ||
                            typeof result === "string" ||
                            typeof result === "number"
                                ? "\nدرخواست نمبر: " +
                                  App.safe(
                                      result?.application_no ||
                                      result
                                  )
                                : ""
                        )
                    );

                    form.reset();

                    sessionStorage.removeItem(
                        App.PUBLIC_ENTRY_KEY
                    );

                } catch (error) {

                    console.error(
                        "Teacher application:",
                        error
                    );

                    alert(
                        error?.message ||
                        "درخواست جمع نہیں ہو سکی۔"
                    );

                } finally {

                    if (submit) {
                        submit.disabled = false;
                    }
                }
            }
        );
    };


/* =====================================================
   ADMIN HOMEWORK - COMPLETE ACTIONS
   ===================================================== */

App.initAdminHomework =
    async function () {

        if (
            App.currentFile !==
            "admin-homework.html"
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
                "adminHomeworkList",
                "homeworkAdminList"
            );

        const load =
            async function () {

                if (!container) {
                    return;
                }

                try {

                    App.adminHomeworkRecords =
                        App.asArray(
                            await App.authedRpc(
                                "homework_get_manage"
                            )
                        );

                    container.innerHTML =
                        App.adminHomeworkRecords.length
                            ? App.adminHomeworkRecords
                                .map(
                                    item => `
                                        <article class="record-card">

                                            <h3>
                                                ${App.escape(
                                                    item.title ||
                                                    "ہوم ورک"
                                                )}
                                            </h3>

                                            <p>
                                                کلاس:
                                                ${App.escape(
                                                    item.student_class ||
                                                    "تمام کلاسیں"
                                                )}
                                            </p>

                                            <p>
                                                آخری تاریخ:
                                                ${App.escape(
                                                    App.date(
                                                        item.due_date
                                                    )
                                                )}
                                            </p>

                                            <div class="record-card-actions">

                                                <button
                                                    type="button"
                                                    data-admin-hw-edit="${Number(item.id)}"
                                                >
                                                    ترمیم
                                                </button>

                                                <button
                                                    type="button"
                                                    data-admin-hw-submissions="${Number(item.id)}"
                                                >
                                                    جمع شدہ ہوم ورک
                                                </button>

                                            </div>

                                        </article>
                                    `
                                )
                                .join("")
                            : App.empty(
                                "کوئی ہوم ورک موجود نہیں۔"
                            );

                    container
                        .querySelectorAll(
                            "[data-admin-hw-edit]"
                        )
                        .forEach(
                            button => {

                                button.addEventListener(
                                    "click",
                                    async function () {

                                        const title =
                                            window.prompt(
                                                "عنوان:",
                                                ""
                                            );

                                        if (
                                            title === null ||
                                            !title.trim()
                                        ) {
                                            return;
                                        }

                                        try {

                                            await App.secureAction(
                                                "admin_update_homework",
                                                {
                                                    p_homework_id:
                                                        Number(
                                                            button.dataset
                                                                .adminHwEdit
                                                        ),

                                                    p_title:
                                                        title.trim()
                                                },
                                                "ہوم ورک کی ترمیم کے لیے admin_update_homework RPC درکار ہے۔"
                                            );

                                            await load();

                                        } catch (error) {

                                            alert(
                                                error?.message ||
                                                "ہوم ورک اپڈیٹ نہیں ہو سکا۔"
                                            );
                                        }
                                    }
                                );
                            }
                        );

                    container
                        .querySelectorAll(
                            "[data-admin-hw-submissions]"
                        )
                        .forEach(
                            button => {

                                button.addEventListener(
                                    "click",
                                    function () {

                                        App.openHomeworkSubmissions(
                                            Number(
                                                button.dataset
                                                    .adminHwSubmissions
                                            )
                                        );
                                    }
                                );
                            }
                        );

                } catch (error) {

                    console.error(
                        "Admin homework:",
                        error
                    );

                    container.innerHTML =
                        App.empty(
                            "ہوم ورک لوڈ نہیں ہو سکا۔"
                        );
                }
            };

        const add =
            App.first(
                "addHomeworkButton",
                "adminAddHomework"
            );

        if (add) {

            App.bindOnce(
                add,
                "adminAddHomework",
                "click",
                async function () {

                    const title =
                        window.prompt(
                            "ہوم ورک عنوان:",
                            ""
                        );

                    if (!title) {
                        return;
                    }

                    const studentClass =
                        window.prompt(
                            "کلاس:",
                            "قاعدہ"
                        );

                    if (!studentClass) {
                        return;
                    }

                    try {

                        await App.secureAction(
                            "admin_add_homework",
                            {
                                p_title:
                                    title,

                                p_student_class:
                                    studentClass
                            },
                            "ہوم ورک شامل کرنے کے لیے admin_add_homework RPC درکار ہے۔"
                        );

                        await load();

                    } catch (error) {

                        alert(
                            error?.message ||
                            "ہوم ورک شامل نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }

        await load();
    };


/* =====================================================
   HOMEWORK SUBMISSIONS VIEW
   ===================================================== */

App.openHomeworkSubmissions =
    async function (homeworkId) {

        const overlay =
            App.openGeneratedPanel(
                "generatedHomeworkSubmissions",
                "جمع شدہ ہوم ورک",
                App.loadingHTML()
            );

        try {

            const records =
                App.asArray(
                    await App.authedRpc(
                        "homework_get_submissions",
                        {
                            p_homework_id:
                                Number(homeworkId)
                        }
                    )
                );

            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );

            if (body) {

                body.innerHTML =
                    records.length
                        ? App.renderDeepProfile(
                            records,
                            "submissions"
                        )
                        : App.empty(
                            "ابھی کوئی ہوم ورک جمع نہیں ہوا۔"
                        );
            }

        } catch (error) {

            console.error(
                "Homework submissions:",
                error
            );

            const body =
                overlay.querySelector(
                    ".generated-details-body"
                );

            if (body) {

                body.innerHTML =
                    App.empty(
                        "جمع شدہ ہوم ورک لوڈ نہیں ہو سکا۔"
                    );
            }
        }
    };


/* =====================================================
   ADMIN ANNOUNCEMENTS
   ===================================================== */

App.initAdminAnnouncements =
    async function () {

        if (
            App.currentFile !==
            "admin-announcements.html"
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
                "adminAnnouncementsList",
                "announcementAdminList"
            );

        const load =
            async function () {

                if (!container) {
                    return;
                }

                try {

                    App.adminAnnouncementRecords =
                        App.asArray(
                            await App.authedRpc(
                                "announcement_get_manage"
                            )
                        );

                    container.innerHTML =
                        App.adminAnnouncementRecords.length
                            ? App.adminAnnouncementRecords
                                .map(
                                    item => `
                                        <article class="record-card">

                                            <h3>
                                                ${App.escape(
                                                    item.title ||
                                                    "اعلان"
                                                )}
                                            </h3>

                                            <p>
                                                ${App.escape(
                                                    item.message ||
                                                    ""
                                                )}
                                            </p>

                                            <small>
                                                ${App.escape(
                                                    App.dateTime(
                                                        item.created_at
                                                    )
                                                )}
                                            </small>

                                            <div class="record-card-actions">

                                                <button
                                                    type="button"
                                                    data-admin-ann-edit="${Number(item.id)}"
                                                >
                                                    ترمیم
                                                </button>

                                                <button
                                                    type="button"
                                                    data-admin-ann-print="${Number(item.id)}"
                                                >
                                                    پرنٹ
                                                </button>

                                            </div>

                                        </article>
                                    `
                                )
                                .join("")
                            : App.empty(
                                "کوئی اعلان موجود نہیں۔"
                            );

                    container
                        .querySelectorAll(
                            "[data-admin-ann-print]"
                        )
                        .forEach(
                            button =>
                                button.addEventListener(
                                    "click",
                                    App.printCurrentPage
                                )
                        );

                    container
                        .querySelectorAll(
                            "[data-admin-ann-edit]"
                        )
                        .forEach(
                            button => {

                                button.addEventListener(
                                    "click",
                                    async function () {

                                        const title =
                                            window.prompt(
                                                "عنوان:",
                                                ""
                                            );

                                        if (
                                            title === null ||
                                            !title.trim()
                                        ) {
                                            return;
                                        }

                                        try {

                                            await App.secureAction(
                                                "admin_update_announcement",
                                                {
                                                    p_announcement_id:
                                                        Number(
                                                            button.dataset
                                                                .adminAnnEdit
                                                        ),

                                                    p_title:
                                                        title.trim()
                                                },
                                                "اعلان کی ترمیم کے لیے admin_update_announcement RPC درکار ہے۔"
                                            );

                                            await load();

                                        } catch (error) {

                                            alert(
                                                error?.message ||
                                                "اعلان اپڈیٹ نہیں ہو سکا۔"
                                            );
                                        }
                                    }
                                );
                            }
                        );

                } catch (error) {

                    console.error(
                        "Admin announcements:",
                        error
                    );

                    container.innerHTML =
                        App.empty(
                            "اعلانات لوڈ نہیں ہو سکے۔"
                        );
                }
            };

        const add =
            App.first(
                "addAnnouncementButton",
                "adminAddAnnouncement"
            );

        if (add) {

            App.bindOnce(
                add,
                "adminAddAnnouncement",
                "click",
                async function () {

                    const title =
                        window.prompt(
                            "اعلان عنوان:",
                            ""
                        );

                    if (!title) {
                        return;
                    }

                    const message =
                        window.prompt(
                            "اعلان:",
                            ""
                        );

                    if (message === null) {
                        return;
                    }

                    try {

                        await App.secureAction(
                            "admin_add_announcement",
                            {
                                p_title:
                                    title,

                                p_message:
                                    message
                            },
                            "اعلان شامل کرنے کے لیے admin_add_announcement RPC درکار ہے۔"
                        );

                        await load();

                    } catch (error) {

                        alert(
                            error?.message ||
                            "اعلان شامل نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }

        await load();
    };


/* =====================================================
   ADMIN FEEDBACK
   ===================================================== */

App.initAdminFeedback =
    async function () {

        if (
            App.currentFile !==
            "admin-feedback.html"
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

        await App.loadAdminFeedback();
    };


/* =====================================================
   TEACHER MARKS
   ===================================================== */

App.initTeacherMarks =
    async function () {

        if (
            App.currentFile !==
            "teacher-marks.html"
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

        const body =
            App.first(
                "teacherMarksBody",
                "marksTableBody"
            );

        const load =
            async function () {

                if (!body) {
                    return;
                }

                try {

                    const records =
                        App.asArray(
                            await App.authedRpc(
                                "marks_get_manage",
                                {
                                    p_student_id: null
                                }
                            )
                        );

                    body.innerHTML =
                        records.length
                            ? records
                                .map(
                                    row => `
                                        <tr>
                                            <td>${App.escape(row.student_id || "—")}</td>
                                            <td>${App.escape(row.student_class || "—")}</td>
                                            <td>${App.escape(row.exam_name || row.exam_type || "—")}</td>
                                            <td>${App.escape(row.obtained_marks ?? "—")}</td>
                                            <td>${App.escape(row.total_marks ?? "—")}</td>
                                            <td>${App.escape(App.date(row.exam_date))}</td>
                                        </tr>
                                    `
                                )
                                .join("")
                            : `
                                <tr>
                                    <td colspan="6">
                                        کوئی نمبرات موجود نہیں۔
                                    </td>
                                </tr>
                            `;

                } catch (error) {

                    console.error(
                        "Teacher marks:",
                        error
                    );

                    body.innerHTML = `
                        <tr>
                            <td colspan="6">
                                نمبرات لوڈ نہیں ہو سکے۔
                            </td>
                        </tr>
                    `;
                }
            };

        const add =
            App.first(
                "teacherAddMarksButton",
                "addMarksButton"
            );

        if (add) {

            App.bindOnce(
                add,
                "teacherAddMarks",
                "click",
                async function () {

                    const studentId =
                        Number(
                            window.prompt(
                                "طالبہ ریکارڈ نمبر:",
                                ""
                            )
                        );

                    if (!studentId) {
                        return;
                    }

                    const examName =
                        window.prompt(
                            "امتحان:",
                            ""
                        );

                    if (!examName) {
                        return;
                    }

                    const obtained =
                        Number(
                            window.prompt(
                                "حاصل کردہ نمبر:",
                                ""
                            )
                        );

                    const total =
                        Number(
                            window.prompt(
                                "کل نمبر:",
                                ""
                            )
                        );

                    if (
                        !Number.isFinite(obtained) ||
                        !Number.isFinite(total) ||
                        total <= 0 ||
                        obtained < 0 ||
                        obtained > total
                    ) {

                        alert(
                            "درست نمبر درج کریں۔"
                        );

                        return;
                    }

                    try {

                        await App.secureAction(
                            "teacher_save_marks",
                            {
                                p_student_id:
                                    studentId,

                                p_exam_name:
                                    examName,

                                p_obtained_marks:
                                    obtained,

                                p_total_marks:
                                    total
                            },
                            "نمبر محفوظ کرنے کے لیے teacher_save_marks RPC درکار ہے۔"
                        );

                        await load();

                    } catch (error) {

                        alert(
                            error?.message ||
                            "نمبر محفوظ نہیں ہو سکے۔"
                        );
                    }
                }
            );
        }

        const print =
            App.first(
                "teacherMarksPrintButton",
                "marksPrintButton"
            );

        if (print) {

            App.bindOnce(
                print,
                "teacherMarksPrint",
                "click",
                App.printCurrentPage
            );
        }

        await load();
    };


/* =====================================================
   TEACHER HOMEWORK
   ===================================================== */

App.initTeacherHomework =
    async function () {

        if (
            App.currentFile !==
            "teacher-homework.html"
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

        const container =
            App.first(
                "teacherHomeworkList",
                "homeworkList"
            );

        const load =
            async function () {

                if (!container) {
                    return;
                }

                try {

                    const records =
                        App.asArray(
                            await App.authedRpc(
                                "homework_get_manage"
                            )
                        );

                    container.innerHTML =
                        records.length
                            ? records
                                .map(
                                    item => `
                                        <article class="portal-card">

                                            <h3>
                                                ${App.escape(
                                                    item.title ||
                                                    "ہوم ورک"
                                                )}
                                            </h3>

                                            <p>
                                                کلاس:
                                                ${App.escape(
                                                    item.student_class ||
                                                    "—"
                                                )}
                                            </p>

                                            <p>
                                                آخری تاریخ:
                                                ${App.escape(
                                                    App.date(
                                                        item.due_date
                                                    )
                                                )}
                                            </p>

                                            <div class="record-card-actions">

                                                <button
                                                    type="button"
                                                    data-teacher-hw-sub="${Number(item.id)}"
                                                >
                                                    جمع شدہ کام
                                                </button>

                                                <button
                                                    type="button"
                                                    data-teacher-hw-edit="${Number(item.id)}"
                                                >
                                                    ترمیم
                                                </button>

                                            </div>

                                        </article>
                                    `
                                )
                                .join("")
                            : App.empty(
                                "کوئی ہوم ورک موجود نہیں۔"
                            );

                    container
                        .querySelectorAll(
                            "[data-teacher-hw-sub]"
                        )
                        .forEach(
                            button =>
                                button.addEventListener(
                                    "click",
                                    function () {

                                        App.openHomeworkSubmissions(
                                            Number(
                                                button.dataset
                                                    .teacherHwSub
                                            )
                                        );
                                    }
                                )
                        );

                    container
                        .querySelectorAll(
                            "[data-teacher-hw-edit]"
                        )
                        .forEach(
                            button => {

                                button.addEventListener(
                                    "click",
                                    async function () {

                                        const title =
                                            window.prompt(
                                                "عنوان:",
                                                ""
                                            );

                                        if (
                                            title === null ||
                                            !title.trim()
                                        ) {
                                            return;
                                        }

                                        try {

                                            await App.secureAction(
                                                "teacher_update_homework",
                                                {
                                                    p_homework_id:
                                                        Number(
                                                            button.dataset
                                                                .teacherHwEdit
                                                        ),

                                                    p_title:
                                                        title.trim()
                                                },
                                                "ہوم ورک ترمیم کے لیے teacher_update_homework RPC درکار ہے۔"
                                            );

                                            await load();

                                        } catch (error) {

                                            alert(
                                                error?.message ||
                                                "ہوم ورک اپڈیٹ نہیں ہو سکا۔"
                                            );
                                        }
                                    }
                                );
                            }
                        );

                } catch (error) {

                    console.error(
                        "Teacher homework:",
                        error
                    );

                    container.innerHTML =
                        App.empty(
                            "ہوم ورک لوڈ نہیں ہو سکا۔"
                        );
                }
            };

        const add =
            App.first(
                "teacherAddHomeworkButton",
                "addHomeworkButton"
            );

        if (add) {

            App.bindOnce(
                add,
                "teacherAddHomework",
                "click",
                async function () {

                    const title =
                        window.prompt(
                            "ہوم ورک عنوان:",
                            ""
                        );

                    if (!title) {
                        return;
                    }

                    const studentClass =
                        window.prompt(
                            "کلاس:",
                            ""
                        );

                    if (!studentClass) {
                        return;
                    }

                    try {

                        await App.secureAction(
                            "teacher_add_homework",
                            {
                                p_title:
                                    title,

                                p_student_class:
                                    studentClass
                            },
                            "ہوم ورک شامل کرنے کے لیے teacher_add_homework RPC درکار ہے۔"
                        );

                        await load();

                    } catch (error) {

                        alert(
                            error?.message ||
                            "ہوم ورک شامل نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }

        await load();
    };


/* =====================================================
   TEACHER ANNOUNCEMENTS
   ===================================================== */

App.initTeacherAnnouncements =
    async function () {

        if (
            App.currentFile !==
            "teacher-announcements.html"
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

        const container =
            App.first(
                "teacherAnnouncementsList",
                "announcementsList"
            );

        const load =
            async function () {

                if (!container) {
                    return;
                }

                try {

                    const records =
                        App.asArray(
                            await App.authedRpc(
                                "announcement_get_manage"
                            )
                        );

                    container.innerHTML =
                        records.length
                            ? records
                                .map(
                                    item => `
                                        <article class="portal-card">
                                            <h3>${App.escape(item.title || "اعلان")}</h3>
                                            <p>${App.escape(item.message || "")}</p>
                                            <small>${App.escape(App.dateTime(item.created_at))}</small>
                                        </article>
                                    `
                                )
                                .join("")
                            : App.empty(
                                "کوئی اعلان موجود نہیں۔"
                            );

                } catch (error) {

                    console.error(
                        "Teacher announcements:",
                        error
                    );

                    container.innerHTML =
                        App.empty(
                            "اعلانات لوڈ نہیں ہو سکے۔"
                        );
                }
            };

        const add =
            App.first(
                "teacherAddAnnouncementButton",
                "addAnnouncementButton"
            );

        if (add) {

            App.bindOnce(
                add,
                "teacherAddAnnouncement",
                "click",
                async function () {

                    const title =
                        window.prompt(
                            "عنوان:",
                            ""
                        );

                    if (!title) {
                        return;
                    }

                    const message =
                        window.prompt(
                            "اعلان:",
                            ""
                        );

                    if (message === null) {
                        return;
                    }

                    try {

                        await App.secureAction(
                            "teacher_add_announcement",
                            {
                                p_title:
                                    title,

                                p_message:
                                    message
                            },
                            "اعلان شامل کرنے کے لیے teacher_add_announcement RPC درکار ہے۔"
                        );

                        await load();

                    } catch (error) {

                        alert(
                            error?.message ||
                            "اعلان شامل نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }

        await load();
    };


/* =====================================================
   TEACHER FEEDBACK
   ===================================================== */

App.initTeacherFeedback =
    async function () {

        if (
            App.currentFile !==
            "teacher-feedback.html"
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

        const body =
            App.first(
                "teacherFeedbackBody",
                "feedbackTableBody"
            );

        const load =
            async function () {

                if (!body) {
                    return;
                }

                try {

                    const records =
                        App.asArray(
                            await App.authedRpc(
                                "teacher_get_feedback"
                            )
                        );

                    body.innerHTML =
                        records.length
                            ? records
                                .map(
                                    item => `
                                        <tr>
                                            <td>${App.escape(item.student_id || "—")}</td>
                                            <td>${App.escape(item.rating || "—")}</td>
                                            <td>${App.escape(item.feedback_text || "—")}</td>
                                            <td>${App.escape(App.date(item.feedback_date || item.created_at))}</td>
                                        </tr>
                                    `
                                )
                                .join("")
                            : `
                                <tr>
                                    <td colspan="4">
                                        کوئی نوٹ موجود نہیں۔
                                    </td>
                                </tr>
                            `;

                } catch (error) {

                    console.error(
                        "Teacher feedback:",
                        error
                    );

                    body.innerHTML = `
                        <tr>
                            <td colspan="4">
                                ریکارڈ لوڈ نہیں ہو سکا۔
                            </td>
                        </tr>
                    `;
                }
            };

        const add =
            App.first(
                "teacherAddFeedbackButton",
                "addFeedbackButton"
            );

        if (add) {

            App.bindOnce(
                add,
                "teacherAddFeedback",
                "click",
                async function () {

                    const studentId =
                        Number(
                            window.prompt(
                                "طالبہ ریکارڈ نمبر:",
                                ""
                            )
                        );

                    if (!studentId) {
                        return;
                    }

                    const text =
                        window.prompt(
                            "نوٹ / فیڈ بیک:",
                            ""
                        );

                    if (text === null) {
                        return;
                    }

                    const rating =
                        Number(
                            window.prompt(
                                "ریٹنگ 1 تا 5:",
                                "5"
                            )
                        );

                    if (
                        rating &&
                        (
                            rating < 1 ||
                            rating > 5
                        )
                    ) {

                        alert(
                            "ریٹنگ 1 سے 5 تک ہونی چاہیے۔"
                        );

                        return;
                    }

                    try {

                        await App.secureAction(
                            "teacher_add_feedback",
                            {
                                p_student_id:
                                    studentId,

                                p_feedback_text:
                                    text,

                                p_rating:
                                    rating ||
                                    null
                            },
                            "استاد نوٹ محفوظ کرنے کے لیے teacher_add_feedback RPC درکار ہے۔"
                        );

                        await load();

                    } catch (error) {

                        alert(
                            error?.message ||
                            "نوٹ محفوظ نہیں ہو سکا۔"
                        );
                    }
                }
            );
        }

        await load();
    };


/* =====================================================
   STUDENT PAGE INITIALIZERS
   ===================================================== */

App.initStudentHomeworkPage =
    async function () {

        if (
            App.currentFile !==
            "homework.html"
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

        await App.loadStudentHomework();
    };


App.initStudentAnnouncementsPage =
    async function () {

        if (
            App.currentFile !==
            "announcements.html"
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

        await App.loadStudentAnnouncements();
    };


/* =====================================================
   ADMIN REPORTS
   ===================================================== */

App.initAdminReports =
    async function () {

        if (
            App.currentFile !==
            "admin-reports.html"
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

            const results =
                await Promise.allSettled([
                    App.authedRpc(
                        "admin_dashboard_overview"
                    ),
                    App.authedRpc(
                        "admin_finance_dashboard"
                    )
                ]);

            const overview =
                results[0].status ===
                    "fulfilled"
                    ? results[0].value
                    : {};

            const finance =
                results[1].status ===
                    "fulfilled"
                    ? results[1].value
                    : {};

            App.setText(
                "reportStudentsTotal",
                Number(
                    overview?.students_total ||
                    0
                ),
                "0"
            );

            App.setText(
                "reportTeachersTotal",
                Number(
                    overview?.teachers_total ||
                    0
                ),
                "0"
            );

            App.setText(
                "reportAttendanceToday",
                Number(
                    overview?.attendance_today_total ||
                    0
                ),
                "0"
            );

            App.setText(
                "reportPendingApplications",
                Number(
                    overview?.pending_applications_total ||
                    0
                ),
                "0"
            );

            App.setText(
                "reportHomeworkTotal",
                Number(
                    overview?.homework_total ||
                    0
                ),
                "0"
            );

            App.setText(
                "reportAnnouncementsTotal",
                Number(
                    overview?.announcements_total ||
                    0
                ),
                "0"
            );

            App.setText(
                "reportCurrentBalance",
                App.money(
                    finance?.current_balance ||
                    0
                ),
                "0 PKR"
            );

            App.setText(
                "reportTotalReceived",
                App.money(
                    finance?.total_received ||
                    0
                ),
                "0 PKR"
            );

            App.setText(
                "reportTotalPaid",
                App.money(
                    finance?.total_paid ||
                    0
                ),
                "0 PKR"
            );

            App.setText(
                "reportRestrictedBalance",
                App.money(
                    finance?.restricted_balance ||
                    0
                ),
                "0 PKR"
            );

            const body =
                App.first(
                    "reportClassBody",
                    "reportsClassBody"
                );

            const classes =
                Array.isArray(
                    overview?.classes
                )
                    ? overview.classes
                    : [];

            if (body) {

                body.innerHTML =
                    classes.length
                        ? classes
                            .map(
                                item => `
                                    <tr>
                                        <td>${App.escape(item.class || "—")}</td>
                                        <td>${App.escape(item.students || 0)}</td>
                                    </tr>
                                `
                            )
                            .join("")
                        : `
                            <tr>
                                <td colspan="2">
                                    کوئی کلاس ریکارڈ موجود نہیں۔
                                </td>
                            </tr>
                        `;
            }

            const print =
                App.first(
                    "reportsPrintButton",
                    "reportPrintButton"
                );

            if (print) {

                App.bindOnce(
                    print,
                    "reportsPrint",
                    "click",
                    App.printCurrentPage
                );
            }

        } catch (error) {

            console.error(
                "Admin reports:",
                error
            );

            App.message(
                "reportsMessage",
                "رپورٹس لوڈ نہیں ہو سکیں۔",
                "error"
            );
        }
    };



/* =====================================================
   PROFESSIONAL PROFILE / PDF RENDERER
   Hides internal database fields and presents official sections.
   ===================================================== */

App.professionalHiddenKeys = new Set([
    "id","student_id","teacher_id","admin_id","account_id","owner_id","owner_type",
    "created_by","updated_by","approved_by","approved_at","reviewed_by","reviewed_at",
    "password","password_hash","requested_password_hash","secret","token","session_token",
    "file_path","storage_path","bucket","internal_id","application_id","fee_type_id",
    "homework_id","announcement_id","attendance_id","marks_id","document_id","transaction_id"
]);

App.professionalKeyHidden = function (key) {
    key = App.safe(key).toLowerCase().trim();
    const compact = key.replace(/[^a-z0-9]/g, "");
    const hiddenCompact = new Set([
        "id","studentid","teacherid","adminid","accountid","ownerid","ownertype",
        "createdby","updatedby","approvedby","approvedat","reviewedby","reviewedat",
        "password","passwordhash","requestedpasswordhash","secret","token","sessiontoken",
        "filepath","storagepath","bucket","internalid","applicationid","feetypeid",
        "homeworkid","announcementid","attendanceid","marksid","documentid","transactionid",
        "studentname","admissionno","studentclass","lastlogin"
    ]);
    return App.professionalHiddenKeys.has(key) || hiddenCompact.has(compact) ||
           /(^|_)(owner|student|teacher|account)_?id$/.test(key) || /_uuid$/.test(key);
};

App.professionalLabel = function (key) {
    const raw = App.safe(key).toLowerCase().trim();
    const compact = raw.replace(/[^a-z0-9]/g, "");
    const aliases = {
        balance: "بقایا", totaldue: "کل بقایا", totalpaid: "کل ادا شدہ",
        totalcharged: "کل واجب فیس", amount: "رقم", status: "حالت",
        paymentmethod: "ادائیگی کا طریقہ", paymentreference: "حوالہ نمبر",
        feeperiod: "فیس مدت", duedate: "آخری تاریخ", paymentat: "ادائیگی کی تاریخ",
        receivedfrom: "وصول کنندہ / ادا کنندہ", notes: "نوٹس", note: "نوٹ"
    };
    return aliases[compact] || App.profileLabel(key);
};

App.professionalSectionTitle = function (key) {
    const map = {
        personal:"ذاتی معلومات", student:"ذاتی معلومات", teacher:"ذاتی معلومات", admin:"ذاتی معلومات",
        account:"اکاؤنٹ کی معلومات", mahrams:"محرم کی تفصیلات", student_mahrams:"محرم کی تفصیلات",
        attendance:"مکمل حاضری", attendance_history:"مکمل حاضری", class_attendance_history:"مکمل حاضری",
        marks:"امتحانات اور نتائج", results:"امتحانات اور نتائج", marks_ratings:"امتحانات اور نتائج",
        fees:"فیس کی مکمل تفصیل", fee_history:"فیس کی مکمل تفصیل", salary:"تنخواہ کی مکمل تفصیل",
        salary_history:"تنخواہ کی مکمل تفصیل", homework:"ہوم ورک کی تاریخ", announcements:"اعلانات کی تاریخ",
        hostel_history:"مدرسہ میں رہائش — آمد و رفت کی مکمل تاریخ", hostel:"مدرسہ میں رہائش — آمد و رفت کی مکمل تاریخ",
        promotion_history:"کلاس اور ترقی کی تاریخ", promotions:"کلاس اور ترقی کی تاریخ",
        uploaded_documents:"جمع شدہ دستاویزات", documents:"جمع شدہ دستاویزات",
        issued_documents:"جاری شدہ دستاویزات", feedback:"فیڈ بیک اور نوٹس", ratings:"ریٹنگ",
        assignments:"تدریسی ذمہ داریاں", teacher_assignments:"تدریسی ذمہ داریاں",
        activity:"ریکارڈ اور سرگرمی کی تاریخ", activity_history:"ریکارڈ اور سرگرمی کی تاریخ",
        history:"مکمل تاریخ", balance:"مالی خلاصہ", summary:"خلاصہ", charges:"واجب رقوم", payments:"ادائیگیاں"
    };
    return map[key] || App.profileSectionTitle(key);
};

App.professionalPrimitivePairs = function (obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
    return Object.entries(obj).filter(([key,value]) => {
        if (App.professionalKeyHidden(key)) return false;
        if (value === null || value === undefined || value === "") return false;
        return typeof value !== "object";
    }).map(([key,value]) => [App.profileLabel(key), App.profileDisplayValue(key,value)]);
};

App.professionalNestedEntries = function (obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
    return Object.entries(obj).filter(([key,value]) => {
        if (App.professionalKeyHidden(key)) return false;
        if (value === null || value === undefined) return false;
        return typeof value === "object" && (Array.isArray(value) ? value.length : Object.keys(value).length);
    });
};

App.professionalTable = function (records) {
    records = App.asArray(records).filter(item => item && typeof item === "object" && !Array.isArray(item));
    if (!records.length) return App.empty("کوئی ریکارڈ موجود نہیں۔");
    const keys = [];
    records.forEach(item => Object.keys(item).forEach(key => {
        if (!App.professionalKeyHidden(key) && item[key] !== null && item[key] !== undefined && item[key] !== "" && typeof item[key] !== "object" && !keys.includes(key)) keys.push(key);
    }));
    const visible = keys.slice(0,8);
    if (!visible.length) return App.empty("کوئی ریکارڈ موجود نہیں۔");
    return `<div class="professional-table-wrap"><table class="professional-table"><thead><tr>${visible.map(k=>`<th>${App.escape(App.professionalLabel(k))}</th>`).join("")}</tr></thead><tbody>${records.map(item=>`<tr>${visible.map(k=>`<td>${App.escape(App.profileDisplayValue(k,item[k]))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
};

App.professionalMetrics = function (obj) {
    const pairs = App.professionalPrimitivePairs(obj);
    if (!pairs.length) return "";
    return `<div class="professional-metric-grid">${pairs.map(([label,value])=>`<div class="professional-metric"><span>${App.escape(label)}</span><strong>${App.escape(value)}</strong></div>`).join("")}</div>`;
};

App.professionalObject = function (obj, depth = 0) {
    if (!obj || typeof obj !== "object") return "";
    if (Array.isArray(obj)) return App.professionalTable(obj);
    let html = "";
    const pairs = App.professionalPrimitivePairs(obj);
    if (pairs.length) html += App.infoGrid(pairs);
    for (const [key,value] of App.professionalNestedEntries(obj)) {
        let body = "";
        if (Array.isArray(value)) body = App.professionalTable(value);
        else {
            const nestedPairs = App.professionalPrimitivePairs(value);
            const nestedNested = App.professionalNestedEntries(value);
            if (nestedPairs.length && nestedNested.length === 0 && ["balance","summary"].includes(key)) body = App.professionalMetrics(value);
            else body = App.professionalObject(value,depth+1);
        }
        if (body) html += `<div class="professional-subsection"><h4>${App.escape(App.professionalSectionTitle(key))}</h4>${body}</div>`;
    }
    return html;
};

App.professionalFindObject = function (data, paths) {
    for (const path of paths) {
        let value = data;
        for (const part of path.split(".")) value = value && typeof value === "object" ? value[part] : null;
        if (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length) return value;
    }
    return null;
};

App.professionalFindValue = function (data, keys) {
    const seen = new Set();
    const queue = [data];
    while (queue.length) {
        const obj = queue.shift();
        if (!obj || typeof obj !== "object" || seen.has(obj)) continue;
        seen.add(obj);
        for (const key of keys) if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") return obj[key];
        Object.values(obj).forEach(v => { if (v && typeof v === "object") queue.push(v); });
    }
    return "";
};

App.renderProfessionalProfile = function (data, type) {
    data = data || {};
    const personal = App.professionalFindObject(data,["core.personal","core.student","core.teacher","core.admin","personal","student","teacher","admin","profile"]) || {};
    const account = App.professionalFindObject(data,["core.account","account"]) || {};
    const name = App.professionalFindValue(personal,["name","full_name"]) || App.professionalFindValue(data,["name","full_name"]) || "—";
    const admission = App.professionalFindValue(personal,["admission_no","teacher_code","username"]);
    const klass = App.professionalFindValue(personal,["student_class","teaching_class","designation"]);
    const phone = App.professionalFindValue(personal,["phone"]);
    const roleName = type === "teacher" ? "استاد" : type === "admin" ? "ایڈمن" : "طالبہ";

    const personalPairs = App.professionalPrimitivePairs(personal).filter(([label]) => !["ریکارڈ نمبر"].includes(label));
    const accountPairs = App.professionalPrimitivePairs(account).filter(([label]) => ["صارف نام","حالت","اکاؤنٹ حالت"].includes(label));

    const used = new Set([personal,account]);
    const candidates = [
        ["mahrams","student_mahrams"], ["attendance","attendance_history","class_attendance_history"],
        ["marks","results","marks_ratings"], ["fees","fee_history"], ["salary","salary_history"],
        ["homework"], ["announcements"], ["hostel_history","hostel"], ["promotion_history","promotions"],
        ["feedback"], ["ratings"], ["assignments","teacher_assignments"], ["uploaded_documents","documents"],
        ["issued_documents"], ["activity","activity_history"]
    ];
    const sections = [];
    for (const names of candidates) {
        let value = null, key = names[0];
        for (const n of names) {
            value = data[n] || data?.core?.[n] || data?.history?.[n] || data?.results?.[n] || null;
            if (value) { key = n; break; }
        }
        if (!value || used.has(value) || (Array.isArray(value) && !value.length) || (!Array.isArray(value) && typeof value === "object" && !Object.keys(value).length)) continue;
        used.add(value);
        const body = Array.isArray(value) ? App.professionalTable(value) : App.professionalObject(value);
        if (body) sections.push(`<section class="professional-section"><div class="professional-section-title"><span></span><h3>${App.escape(App.professionalSectionTitle(key))}</h3></div>${body}</section>`);
    }

    return `
      <section class="professional-identity-card">
        <div class="professional-avatar">${type === "teacher" ? "👩‍🏫" : type === "admin" ? "🛡️" : "👩‍🎓"}</div>
        <div class="professional-identity-main">
          <span class="professional-role-badge">${App.escape(roleName)}</span>
          <h2 data-no-translate>${App.escape(name)}</h2>
          <div class="professional-identity-meta">
            ${admission ? `<span><b>${App.escape(type === "student" ? "داخلہ نمبر" : type === "teacher" ? "استاد کوڈ" : "صارف نام")}</b><em data-no-translate>${App.escape(admission)}</em></span>` : ""}
            ${klass ? `<span><b>${App.escape(type === "student" ? "جماعت" : "تدریسی جماعت")}</b><em>${App.escape(klass)}</em></span>` : ""}
            ${phone ? `<span><b>${App.escape("فون نمبر")}</b><em data-no-translate>${App.escape(phone)}</em></span>` : ""}
          </div>
        </div>
      </section>
      ${personalPairs.length ? `<section class="professional-section"><div class="professional-section-title"><span></span><h3>ذاتی معلومات</h3></div>${App.infoGrid(personalPairs)}</section>` : ""}
      ${accountPairs.length ? `<section class="professional-section"><div class="professional-section-title"><span></span><h3>اکاؤنٹ کی معلومات</h3></div>${App.infoGrid(accountPairs)}</section>` : ""}
      ${sections.join("")}
      <footer class="professional-document-footer">
        <div class="professional-generated"><span>ریکارڈ تیار کرنے کی تاریخ:</span><strong id="printGeneratedDate">${App.escape(App.dateTime(new Date()))}</strong></div>
        <div class="professional-signatures"><div><span>____________________</span><b>ایڈمن دستخط</b></div><div><span>____________________</span><b>مدرسہ مہر</b></div></div>
        <div class="professional-footer-line"><strong>${App.escape(App.NAME)}</strong><span>${App.escape(App.ADDRESS)}</span></div>
      </footer>`;
};

/* =====================================================
   PRINT PROFILE PAGE
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
                params.get("type") ||
                params.get("owner_type")
            )
                .trim()
                .toLowerCase();

        const id =
            Number(
                params.get("id") ||
                params.get("owner_id") ||
                0
            );

        if (
            ![
                "student",
                "teacher",
                "admin"
            ].includes(type) ||
            !id
        ) {

            App.message(
                "printProfileError",
                "پروفائل کی معلومات درست نہیں ہیں۔",
                "error"
            );

            App.hide(
                "printProfileLoading"
            );

            App.show(
                "printProfileError"
            );

            return;
        }

        const back =
            App.first(
                "profileBackButton",
                "printProfileBackButton"
            );

        if (back) {

            App.bindOnce(
                back,
                "printProfileBack",
                "click",
                function () {

                    if (
                        window.history.length > 1
                    ) {

                        window.history.back();

                    } else {

                        App.go(
                            "admin.html"
                        );
                    }
                }
            );
        }

        const print =
            App.first(
                "profilePrintButton",
                "printProfileButton"
            );

        if (print) {

            App.bindOnce(
                print,
                "printProfile",
                "click",
                App.printCurrentPage
            );
        }

        const pdf =
            App.el(
                "profilePdfButton"
            );

        if (pdf) {

            App.bindOnce(
                pdf,
                "profilePdf",
                "click",
                App.printCurrentPage
            );
        }

        try {

            const response =
                await App.fetchCompleteProfile(
                    type,
                    id
                );

            const data =
                response?.data ||
                response ||
                {};

            const container =
                App.first(
                    "printProfileContent",
                    "profilePrintContent",
                    "printProfileBody"
                );

            if (container) {

                container.innerHTML =
                    App.renderProfessionalProfile(
                        data,
                        type
                    ) ||
                    App.empty(
                        "پروفائل ریکارڈ موجود نہیں۔"
                    );

                container.hidden = false;
            }

            const name =
                data?.name ||
                data?.student?.name ||
                data?.teacher?.name ||
                data?.core?.student?.name ||
                data?.core?.teacher?.name ||
                data?.core?.personal?.name ||
                "مکمل پروفائل";

            App.setText(
                "printProfileTitle",
                (type === "teacher"
                    ? "استاد کا مکمل پروفائل"
                    : type === "admin"
                        ? "ایڈمن کا مکمل پروفائل"
                        : "طالبہ کا مکمل پروفائل") +
                " — " +
                name
            );

            App.setText(
                "printMadrassaName",
                App.NAME
            );

            App.setText(
                "printMadrassaAddress",
                App.ADDRESS
            );

            App.setText(
                "printGeneratedDate",
                App.dateTime(
                    new Date()
                )
            );

            App.hide(
                "printProfileLoading"
            );

            App.hide(
                "printProfileError"
            );

            document.title =
                name +
                " - " +
                App.NAME;

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
                "مکمل پروفائل لوڈ نہیں ہو سکا۔",
                "error"
            );

            App.show(
                "printProfileError"
            );
        }
    };


/* =====================================================
   GLOBAL COMPATIBILITY
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
            !window.isAdmin()
        ) {

            window.location.replace(
                "index.html"
            );

            return false;
        }

        return true;
    };


/* =====================================================
   GLOBAL ERROR / CONNECTION EVENTS
   ===================================================== */

App.bindGlobalEvents =
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

        window.addEventListener(
            "online",
            function () {

                const node =
                    document.querySelector(
                        "[data-connection-message]"
                    );

                if (node) {

                    node.textContent =
                        "انٹرنیٹ کنکشن بحال ہوگیا۔";
                }
            }
        );

        window.addEventListener(
            "offline",
            function () {

                const node =
                    document.querySelector(
                        "[data-connection-message]"
                    );

                if (node) {

                    node.textContent =
                        "انٹرنیٹ کنکشن منقطع ہے۔";
                }
            }
        );
    };


/* =====================================================
   FINAL PAGE INITIALIZER
   ===================================================== */

App.initializeCurrentPage =
    async function () {

        App.applySavedLanguage();

        App.bindIntroductionRoutes();

        const allowed =
            await App.protectCurrentPage();

        if (!allowed) {
            return;
        }

        App.bindCommonUI();

        App.initSettings();

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
                App.initAccountRecovery();

                break;


            case "student-apply.html":

                App.initStudentApplication();

                break;


            case "teacher-apply.html":

                App.initTeacherApplication();

                break;


            case "admin.html":

                await App.initAdminDashboard();

                break;


            case "students.html":

                await App.initStudentsPage();

                break;


            case "teachers.html":

                await App.initTeachersPage();

                break;


            case "admin-attendance.html":

                await App.initAdminAttendance();

                break;


            case "admin-marks.html":

                await App.initAdminMarks();

                break;


            case "admin-homework.html":

                await App.initAdminHomework();

                break;


            case "admin-announcements.html":

                await App.initAdminAnnouncements();

                break;


            case "admin-feedback.html":

                await App.initAdminFeedback();

                break;


            case "admin-finance.html":

                await App.initFinancePage();

                break;


            case "admin-hostel.html":

                await App.initHostelPage();

                break;


            case "admin-promotions.html":

                App.initPromotionPage();

                break;


            case "admin-id-cards.html":

                App.initIdCards();

                break;


            case "admin-reports.html":

                await App.initAdminReports();

                break;


            case "admin-accounts.html":

                await App.initAccountsPage();

                break;


            case "approvals.html":

                await App.initApprovalsPage();

                break;


            case "admin-settings.html":

                break;


            case "teacher.html":

                await App.initTeacherDashboard();

                break;


            case "attendance.html":

                await App.initTeacherAttendance();

                break;


            case "teacher-students.html":

                await App.initTeacherStudents();

                break;


            case "teacher-marks.html":

                await App.initTeacherMarks();

                break;


            case "teacher-homework.html":

                await App.initTeacherHomework();

                break;


            case "teacher-announcements.html":

                await App.initTeacherAnnouncements();

                break;


            case "teacher-feedback.html":

                await App.initTeacherFeedback();

                break;


            case "teacher-settings.html":

                break;


            case "student.html":

                await App.initStudentDashboard();

                break;


            case "my-attendance.html":

                await App.initMyAttendance();

                break;


            case "my-marks.html":

                await App.initMyMarks();

                break;


            case "homework.html":

                await App.initStudentHomeworkPage();

                break;


            case "announcements.html":

                await App.initStudentAnnouncementsPage();

                break;


            case "settings.html":

                break;


            case "print-profile.html":

                await App.initPrintProfilePage();

                break;


            default:

                break;
        }
    };


/* =====================================================
   FINAL BOOT
   ===================================================== */

App.start =
    async function () {

        try {

            App.initSupabase();

        } catch (error) {

            console.error(
                "Supabase initialization:",
                error
            );

            const message =
                document.createElement(
                    "div"
                );

            message.className =
                "system-message error";

            message.textContent =
                "ڈیٹا بیس کنکشن شروع نہیں ہو سکا۔";

            document.body.prepend(
                message
            );

            return;
        }

        App.bindGlobalEvents();

        App.bindPageRestoreSecurity();

        try {

            await App.initializeCurrentPage();

        } catch (error) {

            console.error(
                "Application startup:",
                error
            );

            const message =
                document.createElement(
                    "div"
                );

            message.className =
                "system-message error";

            message.textContent =
                "نظام مکمل طور پر شروع نہیں ہو سکا۔ صفحہ دوبارہ کھولیں۔";

            document.body.prepend(
                message
            );
        }
    };


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        App.start,
        {
            once: true
        }
    );

} else {

    App.start();
}


/* =====================================================
   COMPLETE SCRIPT END
   ===================================================== */

})();
