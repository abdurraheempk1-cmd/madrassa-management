/* =========================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 1 / 3

   CORE SYSTEM
   SUPABASE
   SESSION
   ADMIN SECURITY
   SIDEBAR
   COMMON HELPERS
   DASHBOARD
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL APP
   ========================================================= */

const App = {};


/* =========================================================
   SUPABASE
   ========================================================= */

App.SUPABASE_URL =
    "https://ggtnetudnjsmsmitvjmb.supabase.co";

App.SUPABASE_KEY =
    "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";

App.supabase = null;


/* =========================================================
   SUPABASE INITIALIZATION
   ========================================================= */

function initializeSupabase() {

    if (App.supabase) {
        return true;
    }

    if (
        typeof window.supabase === "undefined"
    ) {

        console.error(
            "Supabase library not loaded."
        );

        return false;
    }

    try {

        App.supabase =
            window.supabase.createClient(
                App.SUPABASE_URL,
                App.SUPABASE_KEY
            );

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        App.supabase = null;

        return false;
    }
}


initializeSupabase();


/* =========================================================
   TABLE NAMES
   ========================================================= */

App.TABLES = Object.freeze({

    ADMIN_ACCOUNTS:
        "AdminAccounts",

    STUDENT_ACCOUNTS:
        "StudentAccounts",

    TEACHER_ACCOUNTS:
        "TeacherAccounts",

    STUDENTS:
        "Students",

    TEACHERS:
        "Teachers",

    ATTENDANCE:
        "Attendance",

    MARKS:
        "Marks",

    HOMEWORK:
        "Homework",

    HOMEWORK_SUBMISSIONS:
        "HomeworkSubmissions",

    ANNOUNCEMENTS:
        "Announcements",

    ANNOUNCEMENT_READS:
        "AnnouncementReads",

    APP_SESSIONS:
        "AppSessions",

    STUDENT_APPLICATIONS:
        "student_applications",

    TEACHER_APPLICATIONS:
        "teacher_applications"

});


/* =========================================================
   SYSTEM SETTINGS
   ========================================================= */

App.SESSION_TIMEOUT =
    5 * 60 * 1000;

App.inactivityTimer = null;

App.currentPage =
    (
        window.location.pathname
            .split("/")
            .pop() ||
        "index.html"
    ).toLowerCase();


/* =========================================================
   DATA CACHE
   ========================================================= */

App.students = [];

App.teachers = [];

App.attendance = [];

App.marks = [];

App.homework = [];

App.announcements = [];

App.feedback = [];

App.studentAccounts = [];

App.teacherAccounts = [];

App.applications = [];


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function byId(id) {

    return document.getElementById(id);
}


function safeString(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}


function safeNumber(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


function escapeHTML(value) {

    return safeString(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getTodayISO() {

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

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}


function formatDate(value) {

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
        return safeString(value);
    }

    try {

        return new Intl.DateTimeFormat(
            "ur-PK",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        ).format(date);

    } catch (error) {

        return safeString(value);
    }
}


function formatTime(value) {

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
        return "—";
    }

    try {

        return new Intl.DateTimeFormat(
            "ur-PK",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(date);

    } catch (error) {

        return "—";
    }
}


function formatDateTime(value) {

    if (!value) {
        return "—";
    }

    return (
        formatDate(value) +
        " — " +
        formatTime(value)
    );
}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function calculatePercentage(
    obtained,
    total
) {

    const obtainedNumber =
        safeNumber(obtained);

    const totalNumber =
        safeNumber(total);

    if (
        totalNumber <= 0
    ) {
        return 0;
    }

    return Math.round(
        (
            obtainedNumber /
            totalNumber
        ) * 100
    );
}


/* =========================================================
   SET ELEMENT TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        byId(id);

    if (!element) {
        return;
    }

    element.textContent =
        value;
}


/* =========================================================
   SHOW / HIDE
   ========================================================= */

function showElement(element) {

    if (!element) {
        return;
    }

    element.hidden = false;
}


function hideElement(element) {

    if (!element) {
        return;
    }

    element.hidden = true;
}


/* =========================================================
   PORTAL MESSAGE
   ========================================================= */

function showPortalMessage(
    target,
    message,
    type = "info"
) {

    const element =
        typeof target === "string"
            ? byId(target)
            : target;

    if (!element) {
        return;
    }

    element.textContent =
        safeString(message);

    element.className =
        "portal-message " +
        safeString(type);

    element.hidden = false;
}


function hidePortalMessage(
    target
) {

    const element =
        typeof target === "string"
            ? byId(target)
            : target;

    if (!element) {
        return;
    }

    element.hidden = true;
}


/* =========================================================
   SUPABASE CHECK
   ========================================================= */

function checkSupabase(
    messageElement = null
) {

    if (
        App.supabase
    ) {
        return true;
    }

    if (
        initializeSupabase()
    ) {
        return true;
    }

    console.error(
        "Supabase connection unavailable."
    );

    if (messageElement) {

        showPortalMessage(
            messageElement,
            "ڈیٹا بیس سے رابطہ قائم نہیں ہوسکا۔",
            "error"
        );
    }

    return false;
}


/* =========================================================
   MODAL
   ========================================================= */

function openPortalModal(modal) {

    const element =
        typeof modal === "string"
            ? byId(modal)
            : modal;

    if (!element) {
        return;
    }

    element.hidden = false;

    document.body.style.overflow =
        "hidden";
}


function closePortalModal(modal) {

    const element =
        typeof modal === "string"
            ? byId(modal)
            : modal;

    if (!element) {
        return;
    }

    element.hidden = true;

    const anotherOpenModal =
        document.querySelector(
            ".portal-modal:not([hidden])"
        );

    if (!anotherOpenModal) {

        document.body.style.overflow =
            "";
    }
}


/* =========================================================
   CURRENT USER
   ========================================================= */

function isAuthenticated() {

    return (
        localStorage.getItem(
            "loggedIn"
        ) === "true"
    );
}


function getCurrentRole() {

    return safeString(
        localStorage.getItem(
            "userRole"
        )
    ).toLowerCase();
}


function getCurrentUserId() {

    return safeString(
        localStorage.getItem(
            "userId"
        ) ||
        localStorage.getItem(
            "accountId"
        )
    );
}


function getCurrentUserName() {

    return safeString(
        localStorage.getItem(
            "userName"
        ) ||
        localStorage.getItem(
            "accountName"
        )
    );
}


function isAdmin() {

    return (
        isAuthenticated() &&
        getCurrentRole() ===
            "admin"
    );
}


/* =========================================================
   ADMIN PAGE CHECK
   ========================================================= */

function isAdminPortalPage() {

    return (
        App.currentPage ===
            "admin.html" ||

        App.currentPage.startsWith(
            "admin-"
        )
    );
}


function requireAdmin() {

    if (
        !isAdminPortalPage()
    ) {
        return true;
    }

    if (
        isAdmin()
    ) {
        return true;
    }

    window.location.href =
        "login.html";

    return false;
}


/* =========================================================
   SESSION STORAGE
   ========================================================= */

function saveSessionStart() {

    if (
        !localStorage.getItem(
            "sessionStart"
        )
    ) {

        localStorage.setItem(
            "sessionStart",
            String(
                Date.now()
            )
        );
    }
}


function saveActivityTime() {

    localStorage.setItem(
        "lastActivity",
        String(
            Date.now()
        )
    );
}


function getLastActivity() {

    return safeNumber(
        localStorage.getItem(
            "lastActivity"
        )
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser(
    timedOut = false
) {

    clearTimeout(
        App.inactivityTimer
    );


    try {

        if (
            App.supabase &&
            getCurrentUserId()
        ) {

            await App.supabase
                .from(
                    App.TABLES
                        .APP_SESSIONS
                )
                .update({
                    is_active: false,

                    ended_at:
                        new Date()
                            .toISOString()
                })
                .eq(
                    "user_id",
                    getCurrentUserId()
                )
                .eq(
                    "is_active",
                    true
                );
        }

    } catch (error) {

        console.warn(
            "Session close error:",
            error
        );
    }


    const keys = [

        "loggedIn",

        "userRole",

        "userId",

        "userName",

        "accountId",

        "accountName",

        "lastActivity",

        "sessionStart"

    ];


    keys.forEach(
        key => {

            localStorage.removeItem(
                key
            );
        }
    );


    if (timedOut) {

        sessionStorage.setItem(
            "logoutMessage",
            "مسلسل 5 منٹ غیر فعالیت کی وجہ سے سیشن ختم ہوگیا۔"
        );
    }


    window.location.href =
        "login.html";
}


/* =========================================================
   5 MINUTE AUTO LOGOUT
   ========================================================= */

function resetInactivityTimer() {

    if (
        !isAuthenticated()
    ) {
        return;
    }

    saveActivityTime();

    clearTimeout(
        App.inactivityTimer
    );

    App.inactivityTimer =
        setTimeout(
            function () {

                logoutUser(true);

            },
            App.SESSION_TIMEOUT
        );
}


function checkExistingInactivity() {

    if (
        !isAuthenticated()
    ) {
        return;
    }

    const lastActivity =
        getLastActivity();

    if (
        lastActivity > 0 &&
        Date.now() -
            lastActivity >=
            App.SESSION_TIMEOUT
    ) {

        logoutUser(true);

        return;
    }

    resetInactivityTimer();
}


function initializeInactivitySystem() {

    if (
        !isAuthenticated()
    ) {
        return;
    }

    saveSessionStart();

    checkExistingInactivity();


    [
        "mousedown",
        "keydown",
        "touchstart",
        "scroll"
    ].forEach(
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
}


/* =========================================================
   ADMIN SIDEBAR
   ========================================================= */

function initializeAdminSidebar() {

    const sidebar =
        byId(
            "adminSidebar"
        );

    const overlay =
        byId(
            "adminSidebarOverlay"
        );

    const menuButton =
        byId(
            "adminMenuButton"
        );


    if (!sidebar) {
        return;
    }


    function openSidebar() {

        sidebar.classList.add(
            "open"
        );

        if (overlay) {

            overlay.classList.add(
                "active"
            );
        }
    }


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        if (overlay) {

            overlay.classList.remove(
                "active"
            );
        }
    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            function () {

                if (
                    sidebar.classList
                        .contains(
                            "open"
                        )
                ) {

                    closeSidebar();

                } else {

                    openSidebar();
                }
            }
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );
    }


    document
        .querySelectorAll(
            ".portal-nav-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    closeSidebar
                );
            }
        );


    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth >
                850
            ) {

                closeSidebar();
            }
        }
    );
}


/* =========================================================
   LOGOUT BUTTONS
   ========================================================= */

function initializeLogoutButtons() {

    [
        "adminLogoutButton",
        "settingsAdminLogoutButton"
    ].forEach(
        id => {

            const button =
                byId(id);

            if (!button) {
                return;
            }

            button.addEventListener(
                "click",
                function () {

                    logoutUser(false);
                }
            );
        }
    );
}


/* =========================================================
   PASSWORD EYE BUTTONS
   ========================================================= */

function initializePasswordEyes() {

    document
        .querySelectorAll(
            "[data-password-target]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const targetId =
                            safeString(
                                button.dataset
                                    .passwordTarget
                            );

                        const input =
                            byId(
                                targetId
                            );

                        if (!input) {
                            return;
                        }

                        if (
                            input.type ===
                            "password"
                        ) {

                            input.type =
                                "text";

                            button.textContent =
                                "🙈";

                        } else {

                            input.type =
                                "password";

                            button.textContent =
                                "👁";
                        }
                    }
                );
            }
        );
}


/* =========================================================
   MODAL CLOSE BINDER
   ========================================================= */

function bindModalClose(
    modalId,
    buttonIds = [],
    overlayId = ""
) {

    const modal =
        byId(
            modalId
        );

    if (!modal) {
        return;
    }


    buttonIds.forEach(
        id => {

            const button =
                byId(id);

            if (!button) {
                return;
            }

            button.addEventListener(
                "click",
                function () {

                    closePortalModal(
                        modal
                    );
                }
            );
        }
    );


    if (overlayId) {

        const overlay =
            byId(
                overlayId
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                function () {

                    closePortalModal(
                        modal
                    );
                }
            );
        }
    }
}


/* =========================================================
   COMMON MODAL EVENTS
   ========================================================= */

function initializeCommonModalEvents() {

    bindModalClose(
        "adminAttendanceEditModal",
        [
            "closeAdminAttendanceEdit",
            "cancelAdminAttendanceEdit"
        ],
        "adminAttendanceEditOverlay"
    );


    bindModalClose(
        "adminAddMarksModal",
        [
            "closeAdminAddMarks",
            "cancelAdminAddMarks"
        ],
        "adminAddMarksOverlay"
    );


    bindModalClose(
        "adminEditMarkModal",
        [
            "closeAdminEditMark",
            "cancelAdminEditMark"
        ],
        "adminEditMarkOverlay"
    );


    bindModalClose(
        "adminStudentMarksDetailsModal",
        [
            "closeAdminStudentMarksDetails",
            "closeAdminStudentMarksDetailsBottom"
        ],
        "adminStudentMarksDetailsOverlay"
    );


    bindModalClose(
        "adminCreateHomeworkModal",
        [
            "closeAdminCreateHomework",
            "cancelAdminCreateHomework"
        ],
        "adminCreateHomeworkOverlay"
    );


    bindModalClose(
        "adminHomeworkDetailsModal",
        [
            "closeAdminHomeworkDetails",
            "closeAdminHomeworkDetailsBottom"
        ],
        "adminHomeworkDetailsOverlay"
    );


    bindModalClose(
        "adminHomeworkReviewModal",
        [
            "closeAdminHomeworkReview",
            "cancelAdminHomeworkReview"
        ],
        "adminHomeworkReviewOverlay"
    );


    bindModalClose(
        "adminCreateAnnouncementModal",
        [
            "closeAdminCreateAnnouncement",
            "cancelAdminCreateAnnouncement"
        ],
        "adminCreateAnnouncementOverlay"
    );


    bindModalClose(
        "adminAnnouncementDetailsModal",
        [
            "closeAdminAnnouncementDetails",
            "closeAdminAnnouncementDetailsBottom"
        ],
        "adminAnnouncementDetailsOverlay"
    );


    bindModalClose(
        "adminDeleteAnnouncementModal",
        [
            "closeAdminDeleteAnnouncement",
            "cancelAdminDeleteAnnouncement"
        ],
        "adminDeleteAnnouncementOverlay"
    );


    bindModalClose(
        "adminFeedbackDetailsModal",
        [
            "closeAdminFeedbackDetails",
            "closeAdminFeedbackDetailsBottom"
        ],
        "adminFeedbackDetailsOverlay"
    );


    bindModalClose(
        "adminDeleteFeedbackModal",
        [
            "closeAdminDeleteFeedback",
            "cancelAdminDeleteFeedback"
        ],
        "adminDeleteFeedbackOverlay"
    );


    bindModalClose(
        "adminApplicationDetailsModal",
        [
            "closeAdminApplicationDetails",
            "closeAdminApplicationDetailsBottom"
        ],
        "adminApplicationDetailsOverlay"
    );


    bindModalClose(
        "adminApplicationDecisionModal",
        [
            "closeAdminApplicationDecision",
            "cancelAdminApplicationDecision"
        ],
        "adminApplicationDecisionOverlay"
    );


    bindModalClose(
        "adminAccountDetailsModal",
        [
            "closeAdminAccountDetails",
            "closeAdminAccountDetailsBottom"
        ],
        "adminAccountDetailsOverlay"
    );


    bindModalClose(
        "adminAccountStatusModal",
        [
            "closeAdminAccountStatus",
            "cancelAdminAccountStatus"
        ],
        "adminAccountStatusOverlay"
    );
}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

function initializeEscapeKey() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            const modal =
                document.querySelector(
                    ".portal-modal:not([hidden])"
                );

            if (modal) {

                closePortalModal(
                    modal
                );
            }
        }
    );
}


/* =========================================================
   TABLE COUNT
   ========================================================= */

async function getTableCount(
    tableName
) {

    if (
        !checkSupabase()
    ) {
        return 0;
    }

    try {

        const {
            count,
            error
        } =
            await App.supabase
                .from(
                    tableName
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


        return safeNumber(
            count
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


/* =========================================================
   PENDING APPLICATION COUNT
   ========================================================= */

async function getPendingApplicationCount(
    tableName
) {

    if (
        !checkSupabase()
    ) {
        return 0;
    }

    try {

        const {
            count,
            error
        } =
            await App.supabase
                .from(
                    tableName
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


        return safeNumber(
            count
        );

    } catch (error) {

        console.warn(
            "Pending application count:",
            error
        );

        return 0;
    }
}


/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

async function loadAdminDashboard() {

    if (
        App.currentPage !==
        "admin.html"
    ) {
        return;
    }


    if (
        !checkSupabase()
    ) {
        return;
    }


    try {

        const [
            students,
            teachers,
            homework,
            announcements,
            studentPending,
            teacherPending
        ] =
            await Promise.all([

                getTableCount(
                    App.TABLES
                        .STUDENTS
                ),

                getTableCount(
                    App.TABLES
                        .TEACHERS
                ),

                getTableCount(
                    App.TABLES
                        .HOMEWORK
                ),

                getTableCount(
                    App.TABLES
                        .ANNOUNCEMENTS
                ),

                getPendingApplicationCount(
                    App.TABLES
                        .STUDENT_APPLICATIONS
                ),

                getPendingApplicationCount(
                    App.TABLES
                        .TEACHER_APPLICATIONS
                )

            ]);


        const pending =
            studentPending +
            teacherPending;


        [
            "adminStudentTotal",
            "studentTotal"
        ].forEach(
            id => {

                setText(
                    id,
                    students
                );
            }
        );


        [
            "adminTeacherTotal",
            "teacherTotal"
        ].forEach(
            id => {

                setText(
                    id,
                    teachers
                );
            }
        );


        [
            "adminHomeworkTotalDashboard",
            "dashboardHomeworkTotal"
        ].forEach(
            id => {

                setText(
                    id,
                    homework
                );
            }
        );


        [
            "adminAnnouncementTotalDashboard",
            "dashboardAnnouncementTotal"
        ].forEach(
            id => {

                setText(
                    id,
                    announcements
                );
            }
        );


        [
            "adminPendingAccounts",
            "dashboardPendingAccounts"
        ].forEach(
            id => {

                setText(
                    id,
                    pending
                );
            }
        );


        const badge =
            byId(
                "adminPendingApprovalCount"
            );


        if (badge) {

            badge.textContent =
                pending;

            badge.hidden =
                pending <= 0;
        }


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );
    }
}


/* =========================================================
   DEFAULT DATES
   ========================================================= */

function initializeDefaultDates() {

    const today =
        getTodayISO();


    [
        "adminAttendanceDate",
        "adminAddMarksDate",
        "adminHomeworkAssignedDate"
    ].forEach(
        id => {

            const input =
                byId(id);

            if (
                input &&
                !input.value
            ) {

                input.value =
                    today;
            }
        }
    );
}


/* =========================================================
   CURRENT SESSION INFORMATION
   ========================================================= */

function updateVisibleSessionInformation() {

    const sessionStart =
        safeNumber(
            localStorage.getItem(
                "sessionStart"
            )
        );

    const lastActivity =
        getLastActivity();


    if (sessionStart) {

        setText(
            "settingsAdminSessionStart",
            formatDateTime(
                sessionStart
            )
        );
    }


    if (lastActivity) {

        setText(
            "settingsAdminLastActivity",
            formatDateTime(
                lastActivity
            )
        );
    }


    if (isAuthenticated()) {

        setText(
            "settingsAdminSessionStatus",
            "فعال"
        );
    }
}


/* =========================================================
   PART 1 INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        initializeSupabase();


        if (
            !requireAdmin()
        ) {
            return;
        }


        initializeAdminSidebar();

        initializeLogoutButtons();

        initializePasswordEyes();

        initializeDefaultDates();

        initializeCommonModalEvents();

        initializeEscapeKey();

        initializeInactivitySystem();

        updateVisibleSessionInformation();


        if (
            App.currentPage ===
            "admin.html"
        ) {

            await loadAdminDashboard();
        }

    }
);


/* =========================================================
   END PART 1 / 3

   PART 2 MUST BE PASTED DIRECTLY BELOW THIS LINE.
   ========================================================= */

/* =========================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 2 / 3

   ATTENDANCE
   MARKS
   HOMEWORK
   ========================================================= */


/* =========================================================
   GENERIC VALUE HELPERS
   ========================================================= */

function firstValue(
    object,
    keys,
    fallback = ""
) {

    if (!object) {
        return fallback;
    }

    for (const key of keys) {

        if (
            object[key] !== null &&
            object[key] !== undefined &&
            object[key] !== ""
        ) {

            return object[key];
        }
    }

    return fallback;
}


function normalizeStatus(value) {

    return safeString(value)
        .toLowerCase();
}


function urduAttendanceStatus(value) {

    const status =
        normalizeStatus(value);

    if (
        status === "present" ||
        status === "حاضر"
    ) {
        return "حاضر";
    }

    if (
        status === "absent" ||
        status === "غیر حاضر"
    ) {
        return "غیر حاضر";
    }

    if (
        status === "leave" ||
        status === "چھٹی"
    ) {
        return "چھٹی";
    }

    if (
        status === "late" ||
        status === "تاخیر"
    ) {
        return "تاخیر";
    }

    return safeString(value) || "—";
}


/* =========================================================
   LOAD STUDENTS
   ========================================================= */

async function loadStudentsForAdmin() {

    if (!checkSupabase()) {
        return [];
    }

    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.STUDENTS
                )
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        App.students =
            Array.isArray(data)
                ? data
                : [];


        return App.students;

    } catch (error) {

        console.error(
            "Students load error:",
            error
        );

        App.students = [];

        return [];
    }
}


/* =========================================================
   LOAD TEACHERS
   ========================================================= */

async function loadTeachersForAdmin() {

    if (!checkSupabase()) {
        return [];
    }

    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.TEACHERS
                )
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        App.teachers =
            Array.isArray(data)
                ? data
                : [];


        return App.teachers;

    } catch (error) {

        console.error(
            "Teachers load error:",
            error
        );

        App.teachers = [];

        return [];
    }
}


/* =========================================================
   STUDENT HELPERS
   ========================================================= */

function findStudentById(id) {

    return App.students.find(
        student =>
            String(student.id) ===
            String(id)
    ) || null;
}


function findTeacherById(id) {

    return App.teachers.find(
        teacher =>
            String(teacher.id) ===
            String(id)
    ) || null;
}


function getStudentName(student) {

    return safeString(
        firstValue(
            student,
            [
                "name",
                "student_name",
                "studentName"
            ],
            "—"
        )
    );
}


function getTeacherName(teacher) {

    return safeString(
        firstValue(
            teacher,
            [
                "name",
                "teacher_name",
                "teacherName"
            ],
            "—"
        )
    );
}


function getStudentClass(student) {

    return safeString(
        firstValue(
            student,
            [
                "student_class",
                "class",
                "class_name"
            ],
            ""
        )
    );
}


function getStudentAdmissionNo(student) {

    return safeString(
        firstValue(
            student,
            [
                "admission_no",
                "admissionNo"
            ],
            ""
        )
    );
}


/* =========================================================
   SELECT OPTION HELPERS
   ========================================================= */

function fillStudentSelect(
    select,
    students = App.students,
    placeholder = "طالبہ منتخب کریں"
) {

    if (!select) {
        return;
    }

    const currentValue =
        select.value;


    select.innerHTML =
        `<option value="">${escapeHTML(
            placeholder
        )}</option>`;


    students.forEach(
        student => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                student.id;

            option.textContent =
                getStudentName(student) +
                (
                    getStudentAdmissionNo(
                        student
                    )
                        ? " — " +
                          getStudentAdmissionNo(
                              student
                          )
                        : ""
                );

            select.appendChild(
                option
            );
        }
    );


    if (currentValue) {

        select.value =
            currentValue;
    }
}


function fillTeacherSelect(
    select,
    teachers = App.teachers,
    placeholder = "استاد منتخب کریں"
) {

    if (!select) {
        return;
    }

    const currentValue =
        select.value;


    select.innerHTML =
        `<option value="">${escapeHTML(
            placeholder
        )}</option>`;


    teachers.forEach(
        teacher => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                teacher.id;

            option.textContent =
                getTeacherName(
                    teacher
                );

            select.appendChild(
                option
            );
        }
    );


    if (currentValue) {

        select.value =
            currentValue;
    }
}


/* =========================================================
   ATTENDANCE
   ========================================================= */

async function loadAdminAttendance() {

    if (
        App.currentPage !==
        "admin-attendance.html"
    ) {
        return;
    }


    const message =
        byId(
            "adminAttendanceMessage"
        );


    if (
        !checkSupabase(message)
    ) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.ATTENDANCE
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


        App.attendance =
            Array.isArray(data)
                ? data
                : [];


        renderAdminAttendance();

        updateAttendanceSummary();


    } catch (error) {

        console.error(
            "Attendance load error:",
            error
        );

        showPortalMessage(
            message,
            "حاضری کا ریکارڈ لوڈ نہیں ہوسکا۔",
            "error"
        );
    }
}


function getFilteredAttendance() {

    let records =
        [...App.attendance];


    const date =
        byId(
            "adminAttendanceDate"
        )?.value || "";


    const className =
        byId(
            "adminAttendanceClassFilter"
        )?.value || "";


    const teacherId =
        byId(
            "adminAttendanceTeacherFilter"
        )?.value || "";


    const period =
        byId(
            "adminAttendancePeriodFilter"
        )?.value || "";


    const status =
        byId(
            "adminAttendanceStatusFilter"
        )?.value || "";


    if (date) {

        records =
            records.filter(
                record => {

                    const recordDate =
                        safeString(
                            firstValue(
                                record,
                                [
                                    "attendance_date",
                                    "date"
                                ]
                            )
                        );

                    return (
                        recordDate.slice(
                            0,
                            10
                        ) === date
                    );
                }
            );
    }


    if (className) {

        records =
            records.filter(
                record =>
                    safeString(
                        firstValue(
                            record,
                            [
                                "student_class",
                                "class_name",
                                "class"
                            ]
                        )
                    ) === className
            );
    }


    if (teacherId) {

        records =
            records.filter(
                record =>
                    String(
                        firstValue(
                            record,
                            [
                                "teacher_id",
                                "teacherId"
                            ]
                        )
                    ) ===
                    String(
                        teacherId
                    )
            );
    }


    if (period) {

        records =
            records.filter(
                record =>
                    String(
                        firstValue(
                            record,
                            [
                                "period",
                                "class_period",
                                "lesson_no"
                            ]
                        )
                    ) ===
                    String(period)
            );
    }


    if (status) {

        records =
            records.filter(
                record =>
                    normalizeStatus(
                        firstValue(
                            record,
                            [
                                "status",
                                "attendance_status"
                            ]
                        )
                    ) ===
                    normalizeStatus(
                        status
                    )
            );
    }


    return records;
}


function renderAdminAttendance() {

    const body =
        byId(
            "adminAttendanceBody"
        );

    if (!body) {
        return;
    }


    const records =
        getFilteredAttendance();


    if (!records.length) {

        body.innerHTML = `
            <tr>
                <td colspan="9"
                    class="table-empty">
                    کوئی حاضری ریکارڈ نہیں ملا۔
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML =
        records.map(
            record => {

                const student =
                    findStudentById(
                        firstValue(
                            record,
                            [
                                "student_id",
                                "studentId"
                            ]
                        )
                    );


                const teacher =
                    findTeacherById(
                        firstValue(
                            record,
                            [
                                "teacher_id",
                                "teacherId"
                            ]
                        )
                    );


                const date =
                    firstValue(
                        record,
                        [
                            "attendance_date",
                            "date",
                            "created_at"
                        ]
                    );


                const period =
                    firstValue(
                        record,
                        [
                            "period",
                            "class_period",
                            "lesson_no"
                        ],
                        "—"
                    );


                const className =
                    firstValue(
                        record,
                        [
                            "student_class",
                            "class_name",
                            "class"
                        ],
                        getStudentClass(
                            student
                        )
                    );


                const status =
                    urduAttendanceStatus(
                        firstValue(
                            record,
                            [
                                "status",
                                "attendance_status"
                            ]
                        )
                    );


                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                formatDate(
                                    date
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                String(
                                    period
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student
                                    ? getStudentName(
                                          student
                                      )
                                    : firstValue(
                                          record,
                                          [
                                              "student_name"
                                          ],
                                          "—"
                                      )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student
                                    ? getStudentAdmissionNo(
                                          student
                                      )
                                    : firstValue(
                                          record,
                                          [
                                              "admission_no"
                                          ],
                                          "—"
                                      )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                className ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                teacher
                                    ? getTeacherName(
                                          teacher
                                      )
                                    : firstValue(
                                          record,
                                          [
                                              "teacher_name"
                                          ],
                                          "—"
                                      )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                status
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "note",
                                        "remarks"
                                    ],
                                    "—"
                                )
                            )}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="small-action-button secondary admin-edit-attendance"
                                data-id="${escapeHTML(
                                    record.id
                                )}">
                                ترمیم
                            </button>
                        </td>

                    </tr>
                `;
            }
        ).join("");


    body
        .querySelectorAll(
            ".admin-edit-attendance"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        openAttendanceEdit(
                            this.dataset.id
                        );
                    }
                );
            }
        );
}


function updateAttendanceSummary() {

    const records =
        getFilteredAttendance();


    const present =
        records.filter(
            record =>
                urduAttendanceStatus(
                    firstValue(
                        record,
                        [
                            "status",
                            "attendance_status"
                        ]
                    )
                ) === "حاضر"
        ).length;


    const absent =
        records.filter(
            record =>
                urduAttendanceStatus(
                    firstValue(
                        record,
                        [
                            "status",
                            "attendance_status"
                        ]
                    )
                ) === "غیر حاضر"
        ).length;


    const leave =
        records.filter(
            record =>
                urduAttendanceStatus(
                    firstValue(
                        record,
                        [
                            "status",
                            "attendance_status"
                        ]
                    )
                ) === "چھٹی"
        ).length;


    const late =
        records.filter(
            record =>
                urduAttendanceStatus(
                    firstValue(
                        record,
                        [
                            "status",
                            "attendance_status"
                        ]
                    )
                ) === "تاخیر"
        ).length;


    [
        "adminAttendanceTotal",
        "attendanceTotal"
    ].forEach(
        id =>
            setText(
                id,
                records.length
            )
    );


    [
        "adminAttendancePresent",
        "attendancePresent"
    ].forEach(
        id =>
            setText(
                id,
                present
            )
    );


    [
        "adminAttendanceAbsent",
        "attendanceAbsent"
    ].forEach(
        id =>
            setText(
                id,
                absent
            )
    );


    [
        "adminAttendanceLeave",
        "attendanceLeave"
    ].forEach(
        id =>
            setText(
                id,
                leave
            )
    );


    [
        "adminAttendanceLate",
        "attendanceLate"
    ].forEach(
        id =>
            setText(
                id,
                late
            )
    );


    setText(
        "adminAttendancePercentage",
        records.length
            ? calculatePercentage(
                  present,
                  records.length
              ) + "%"
            : "0%"
    );
}


function openAttendanceEdit(id) {

    const record =
        App.attendance.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!record) {
        return;
    }


    const idInput =
        byId(
            "adminAttendanceEditId"
        );

    const statusInput =
        byId(
            "adminAttendanceEditStatus"
        );

    const noteInput =
        byId(
            "adminAttendanceEditNote"
        );


    if (idInput) {
        idInput.value =
            record.id;
    }


    if (statusInput) {

        statusInput.value =
            normalizeStatus(
                firstValue(
                    record,
                    [
                        "status",
                        "attendance_status"
                    ]
                )
            );
    }


    if (noteInput) {

        noteInput.value =
            firstValue(
                record,
                [
                    "note",
                    "remarks"
                ]
            );
    }


    openPortalModal(
        "adminAttendanceEditModal"
    );
}


async function saveAttendanceEdit(
    event
) {

    event.preventDefault();


    const id =
        byId(
            "adminAttendanceEditId"
        )?.value;


    const status =
        byId(
            "adminAttendanceEditStatus"
        )?.value;


    const note =
        byId(
            "adminAttendanceEditNote"
        )?.value || "";


    if (
        !id ||
        !status
    ) {
        return;
    }


    try {

        const {
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.ATTENDANCE
                )
                .update({
                    status: status,
                    note: note,
                    updated_at:
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


        closePortalModal(
            "adminAttendanceEditModal"
        );


        showPortalMessage(
            "adminAttendanceMessage",
            "حاضری کامیابی سے تبدیل ہوگئی۔",
            "success"
        );


        await loadAdminAttendance();


    } catch (error) {

        console.error(
            "Attendance update:",
            error
        );


        showPortalMessage(
            "adminAttendanceMessage",
            "حاضری تبدیل نہیں ہوسکی۔",
            "error"
        );
    }
}


function initializeAttendancePage() {

    if (
        App.currentPage !==
        "admin-attendance.html"
    ) {
        return;
    }


    const form =
        byId(
            "adminAttendanceFilterForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                renderAdminAttendance();

                updateAttendanceSummary();
            }
        );
    }


    [
        "adminAttendanceDate",
        "adminAttendanceClassFilter",
        "adminAttendanceTeacherFilter",
        "adminAttendancePeriodFilter",
        "adminAttendanceStatusFilter"
    ].forEach(
        id => {

            const element =
                byId(id);

            if (element) {

                element.addEventListener(
                    "change",
                    function () {

                        renderAdminAttendance();

                        updateAttendanceSummary();
                    }
                );
            }
        }
    );


    const clearButton =
        byId(
            "clearAdminAttendanceFilters"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (form) {
                    form.reset();
                }

                renderAdminAttendance();

                updateAttendanceSummary();
            }
        );
    }


    const editForm =
        byId(
            "adminAttendanceEditForm"
        );


    if (editForm) {

        editForm.addEventListener(
            "submit",
            saveAttendanceEdit
        );
    }
}


/* =========================================================
   MARKS
   ========================================================= */

async function loadAdminMarks() {

    if (
        App.currentPage !==
        "admin-marks.html"
    ) {
        return;
    }


    if (
        !checkSupabase(
            byId(
                "adminMarksMessage"
            )
        )
    ) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.MARKS
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


        App.marks =
            Array.isArray(data)
                ? data
                : [];


        renderAdminMarks();

        updateMarksSummary();


    } catch (error) {

        console.error(
            "Marks load error:",
            error
        );


        showPortalMessage(
            "adminMarksMessage",
            "نمبر کا ریکارڈ لوڈ نہیں ہوسکا۔",
            "error"
        );
    }
}


function getFilteredMarks() {

    let records =
        [...App.marks];


    const studentSearch =
        safeString(
            byId(
                "adminMarksStudentSearch"
            )?.value
        ).toLowerCase();


    const className =
        byId(
            "adminMarksClassFilter"
        )?.value || "";


    const subject =
        safeString(
            byId(
                "adminMarksSubjectFilter"
            )?.value
        ).toLowerCase();


    const examType =
        safeString(
            byId(
                "adminMarksExamTypeFilter"
            )?.value
        ).toLowerCase();


    if (studentSearch) {

        records =
            records.filter(
                record => {

                    const student =
                        findStudentById(
                            firstValue(
                                record,
                                [
                                    "student_id",
                                    "studentId"
                                ]
                            )
                        );


                    const text =
                        (
                            (
                                student
                                    ? getStudentName(
                                          student
                                      )
                                    : firstValue(
                                          record,
                                          [
                                              "student_name"
                                          ]
                                      )
                            ) +
                            " " +
                            (
                                student
                                    ? getStudentAdmissionNo(
                                          student
                                      )
                                    : firstValue(
                                          record,
                                          [
                                              "admission_no"
                                          ]
                                      )
                            )
                        ).toLowerCase();


                    return text.includes(
                        studentSearch
                    );
                }
            );
    }


    if (className) {

        records =
            records.filter(
                record =>
                    safeString(
                        firstValue(
                            record,
                            [
                                "student_class",
                                "class_name",
                                "class"
                            ]
                        )
                    ) === className
            );
    }


    if (subject) {

        records =
            records.filter(
                record =>
                    safeString(
                        firstValue(
                            record,
                            [
                                "subject",
                                "subject_name"
                            ]
                        )
                    )
                        .toLowerCase()
                        .includes(
                            subject
                        )
            );
    }


    if (examType) {

        records =
            records.filter(
                record =>
                    safeString(
                        firstValue(
                            record,
                            [
                                "exam_type",
                                "test_type"
                            ]
                        )
                    )
                        .toLowerCase()
                        .includes(
                            examType
                        )
            );
    }


    return records;
}


function renderAdminMarks() {

    const body =
        byId(
            "adminMarksBody"
        );


    if (!body) {
        return;
    }


    const records =
        getFilteredMarks();


    if (!records.length) {

        body.innerHTML = `
            <tr>
                <td colspan="10"
                    class="table-empty">
                    نمبر کا کوئی ریکارڈ نہیں ملا۔
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML =
        records.map(
            record => {

                const student =
                    findStudentById(
                        firstValue(
                            record,
                            [
                                "student_id",
                                "studentId"
                            ]
                        )
                    );


                const obtained =
                    safeNumber(
                        firstValue(
                            record,
                            [
                                "obtained_marks",
                                "marks_obtained",
                                "obtained"
                            ]
                        )
                    );


                const total =
                    safeNumber(
                        firstValue(
                            record,
                            [
                                "total_marks",
                                "maximum_marks",
                                "total"
                            ]
                        )
                    );


                const percent =
                    calculatePercentage(
                        obtained,
                        total
                    );


                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                formatDate(
                                    firstValue(
                                        record,
                                        [
                                            "exam_date",
                                            "date",
                                            "created_at"
                                        ]
                                    )
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student
                                    ? getStudentName(
                                          student
                                      )
                                    : firstValue(
                                          record,
                                          [
                                              "student_name"
                                          ],
                                          "—"
                                      )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student
                                    ? getStudentAdmissionNo(
                                          student
                                      )
                                    : firstValue(
                                          record,
                                          [
                                              "admission_no"
                                          ],
                                          "—"
                                      )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "student_class",
                                        "class_name",
                                        "class"
                                    ],
                                    student
                                        ? getStudentClass(
                                              student
                                          )
                                        : "—"
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "subject",
                                        "subject_name"
                                    ],
                                    "—"
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "exam_type",
                                        "test_type"
                                    ],
                                    "—"
                                )
                            )}
                        </td>

                        <td>
                            ${obtained}
                        </td>

                        <td>
                            ${total}
                        </td>

                        <td>
                            ${percent}%
                        </td>

                        <td>
                            <button
                                type="button"
                                class="small-action-button secondary admin-edit-mark"
                                data-id="${escapeHTML(
                                    record.id
                                )}">
                                ترمیم
                            </button>
                        </td>

                    </tr>
                `;
            }
        ).join("");


    body
        .querySelectorAll(
            ".admin-edit-mark"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        openAdminMarkEdit(
                            this.dataset.id
                        );
                    }
                );
            }
        );
}


function updateMarksSummary() {

    const records =
        getFilteredMarks();


    let obtainedTotal = 0;

    let maximumTotal = 0;


    records.forEach(
        record => {

            obtainedTotal +=
                safeNumber(
                    firstValue(
                        record,
                        [
                            "obtained_marks",
                            "marks_obtained",
                            "obtained"
                        ]
                    )
                );


            maximumTotal +=
                safeNumber(
                    firstValue(
                        record,
                        [
                            "total_marks",
                            "maximum_marks",
                            "total"
                        ]
                    )
                );
        }
    );


    setText(
        "adminMarksTotalRecords",
        records.length
    );


    setText(
        "adminMarksAverage",
        maximumTotal > 0
            ? calculatePercentage(
                  obtainedTotal,
                  maximumTotal
              ) + "%"
            : "0%"
    );
}


function openAdminMarkEdit(id) {

    const record =
        App.marks.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!record) {
        return;
    }


    const fields = {

        adminEditMarkId:
            record.id,

        adminEditMarkObtained:
            firstValue(
                record,
                [
                    "obtained_marks",
                    "marks_obtained",
                    "obtained"
                ]
            ),

        adminEditMarkTotal:
            firstValue(
                record,
                [
                    "total_marks",
                    "maximum_marks",
                    "total"
                ]
            ),

        adminEditMarkNote:
            firstValue(
                record,
                [
                    "note",
                    "remarks"
                ]
            )

    };


    Object.entries(
        fields
    ).forEach(
        ([idName, value]) => {

            const input =
                byId(idName);

            if (input) {

                input.value =
                    value ?? "";
            }
        }
    );


    openPortalModal(
        "adminEditMarkModal"
    );
}


async function saveAdminMarkEdit(
    event
) {

    event.preventDefault();


    const id =
        byId(
            "adminEditMarkId"
        )?.value;


    const obtained =
        safeNumber(
            byId(
                "adminEditMarkObtained"
            )?.value
        );


    const total =
        safeNumber(
            byId(
                "adminEditMarkTotal"
            )?.value
        );


    const note =
        byId(
            "adminEditMarkNote"
        )?.value || "";


    if (!id) {
        return;
    }


    if (
        total <= 0 ||
        obtained < 0 ||
        obtained > total
    ) {

        showPortalMessage(
            "adminMarksMessage",
            "نمبر درست درج کریں۔ حاصل کردہ نمبر کل نمبر سے زیادہ نہیں ہوسکتے۔",
            "error"
        );

        return;
    }


    try {

        const {
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.MARKS
                )
                .update({
                    obtained_marks:
                        obtained,

                    total_marks:
                        total,

                    note: note,

                    updated_at:
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


        closePortalModal(
            "adminEditMarkModal"
        );


        showPortalMessage(
            "adminMarksMessage",
            "نمبر کامیابی سے تبدیل ہوگئے۔",
            "success"
        );


        await loadAdminMarks();


    } catch (error) {

        console.error(
            "Marks update:",
            error
        );


        showPortalMessage(
            "adminMarksMessage",
            "نمبر تبدیل نہیں ہوسکے۔",
            "error"
        );
    }
}


async function addAdminMarks(
    event
) {

    event.preventDefault();


    const studentId =
        byId(
            "adminAddMarksStudent"
        )?.value;


    const subject =
        safeString(
            byId(
                "adminAddMarksSubject"
            )?.value
        );


    const examType =
        safeString(
            byId(
                "adminAddMarksExamType"
            )?.value
        );


    const date =
        byId(
            "adminAddMarksDate"
        )?.value;


    const obtained =
        safeNumber(
            byId(
                "adminAddMarksObtained"
            )?.value
        );


    const total =
        safeNumber(
            byId(
                "adminAddMarksTotal"
            )?.value
        );


    const note =
        safeString(
            byId(
                "adminAddMarksNote"
            )?.value
        );


    if (
        !studentId ||
        !subject ||
        !examType ||
        !date ||
        total <= 0 ||
        obtained < 0 ||
        obtained > total
    ) {

        showPortalMessage(
            "adminMarksMessage",
            "تمام ضروری معلومات اور نمبر درست درج کریں۔",
            "error"
        );

        return;
    }


    const student =
        findStudentById(
            studentId
        );


    try {

        const {
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.MARKS
                )
                .insert({
                    student_id:
                        studentId,

                    student_class:
                        student
                            ? getStudentClass(
                                  student
                              )
                            : "",

                    subject:
                        subject,

                    exam_type:
                        examType,

                    exam_date:
                        date,

                    obtained_marks:
                        obtained,

                    total_marks:
                        total,

                    note:
                        note,

                    created_at:
                        new Date()
                            .toISOString()
                });


        if (error) {
            throw error;
        }


        closePortalModal(
            "adminAddMarksModal"
        );


        const form =
            byId(
                "adminAddMarksForm"
            );


        if (form) {
            form.reset();
        }


        const dateInput =
            byId(
                "adminAddMarksDate"
            );


        if (dateInput) {
            dateInput.value =
                getTodayISO();
        }


        showPortalMessage(
            "adminMarksMessage",
            "نمبر کامیابی سے محفوظ ہوگئے۔",
            "success"
        );


        await loadAdminMarks();


    } catch (error) {

        console.error(
            "Add marks:",
            error
        );


        showPortalMessage(
            "adminMarksMessage",
            "نمبر محفوظ نہیں ہوسکے۔",
            "error"
        );
    }
}


function initializeMarksPage() {

    if (
        App.currentPage !==
        "admin-marks.html"
    ) {
        return;
    }


    const openButton =
        byId(
            "openAdminAddMarksButton"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            function () {

                openPortalModal(
                    "adminAddMarksModal"
                );
            }
        );
    }


    const addForm =
        byId(
            "adminAddMarksForm"
        );


    if (addForm) {

        addForm.addEventListener(
            "submit",
            addAdminMarks
        );
    }


    const editForm =
        byId(
            "adminEditMarkForm"
        );


    if (editForm) {

        editForm.addEventListener(
            "submit",
            saveAdminMarkEdit
        );
    }


    const filterForm =
        byId(
            "adminMarksFilterForm"
        );


    if (filterForm) {

        filterForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                renderAdminMarks();

                updateMarksSummary();
            }
        );
    }


    const clearButton =
        byId(
            "clearAdminMarksFilters"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (filterForm) {
                    filterForm.reset();
                }

                renderAdminMarks();

                updateMarksSummary();
            }
        );
    }
}


/* =========================================================
   HOMEWORK
   ========================================================= */

async function loadAdminHomework() {

    if (
        App.currentPage !==
        "admin-homework.html"
    ) {
        return;
    }


    if (
        !checkSupabase(
            byId(
                "adminHomeworkMessage"
            )
        )
    ) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.HOMEWORK
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


        App.homework =
            Array.isArray(data)
                ? data
                : [];


        renderAdminHomework();

        updateHomeworkSummary();


    } catch (error) {

        console.error(
            "Homework load:",
            error
        );


        showPortalMessage(
            "adminHomeworkMessage",
            "ہوم ورک لوڈ نہیں ہوسکا۔",
            "error"
        );
    }
}


function getFilteredHomework() {

    let records =
        [...App.homework];


    const className =
        byId(
            "adminHomeworkClassFilter"
        )?.value || "";


    const teacherId =
        byId(
            "adminHomeworkTeacherFilter"
        )?.value || "";


    const subject =
        safeString(
            byId(
                "adminHomeworkSubjectFilter"
            )?.value
        ).toLowerCase();


    const search =
        safeString(
            byId(
                "adminHomeworkSearch"
            )?.value
        ).toLowerCase();


    if (className) {

        records =
            records.filter(
                record =>
                    safeString(
                        firstValue(
                            record,
                            [
                                "student_class",
                                "class_name",
                                "class"
                            ]
                        )
                    ) === className
            );
    }


    if (teacherId) {

        records =
            records.filter(
                record =>
                    String(
                        firstValue(
                            record,
                            [
                                "teacher_id",
                                "teacherId"
                            ]
                        )
                    ) ===
                    String(
                        teacherId
                    )
            );
    }


    if (subject) {

        records =
            records.filter(
                record =>
                    safeString(
                        firstValue(
                            record,
                            [
                                "subject",
                                "subject_name"
                            ]
                        )
                    )
                        .toLowerCase()
                        .includes(
                            subject
                        )
            );
    }


    if (search) {

        records =
            records.filter(
                record => {

                    const text =
                        (
                            safeString(
                                firstValue(
                                    record,
                                    [
                                        "title"
                                    ]
                                )
                            ) +
                            " " +
                            safeString(
                                firstValue(
                                    record,
                                    [
                                        "description",
                                        "homework_text",
                                        "details"
                                    ]
                                )
                            )
                        ).toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );
    }


    return records;
}


function renderAdminHomework() {

    const list =
        byId(
            "adminHomeworkList"
        );


    if (!list) {
        return;
    }


    const records =
        getFilteredHomework();


    setText(
        "adminHomeworkRecordCount",
        records.length +
        " ہوم ورک"
    );


    if (!records.length) {

        list.innerHTML = `
            <div class="portal-empty-state">
                کوئی ہوم ورک ریکارڈ نہیں ملا۔
            </div>
        `;

        return;
    }


    list.innerHTML =
        records.map(
            record => {

                const teacher =
                    findTeacherById(
                        firstValue(
                            record,
                            [
                                "teacher_id",
                                "teacherId"
                            ]
                        )
                    );


                return `
                    <article class="homework-card">

                        <span class="profile-label">
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "subject",
                                        "subject_name"
                                    ],
                                    "ہوم ورک"
                                )
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "title"
                                    ],
                                    "ہوم ورک"
                                )
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "description",
                                        "homework_text",
                                        "details"
                                    ],
                                    "—"
                                )
                            )}
                        </p>

                        <div class="student-profile-details">

                            <div class="profile-detail-item">
                                <span>جماعت</span>
                                <strong>
                                    ${escapeHTML(
                                        firstValue(
                                            record,
                                            [
                                                "student_class",
                                                "class_name",
                                                "class"
                                            ],
                                            "—"
                                        )
                                    )}
                                </strong>
                            </div>

                            <div class="profile-detail-item">
                                <span>استاد</span>
                                <strong>
                                    ${escapeHTML(
                                        teacher
                                            ? getTeacherName(
                                                  teacher
                                              )
                                            : firstValue(
                                                  record,
                                                  [
                                                      "teacher_name"
                                                  ],
                                                  "—"
                                              )
                                    )}
                                </strong>
                            </div>

                            <div class="profile-detail-item">
                                <span>جاری کرنے کی تاریخ</span>
                                <strong>
                                    ${escapeHTML(
                                        formatDate(
                                            firstValue(
                                                record,
                                                [
                                                    "assigned_date",
                                                    "created_at"
                                                ]
                                            )
                                        )
                                    )}
                                </strong>
                            </div>

                            <div class="profile-detail-item">
                                <span>آخری تاریخ</span>
                                <strong>
                                    ${escapeHTML(
                                        formatDate(
                                            firstValue(
                                                record,
                                                [
                                                    "due_date"
                                                ]
                                            )
                                        )
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div class="portal-form-actions">

                            <button
                                type="button"
                                class="small-action-button admin-homework-details"
                                data-id="${escapeHTML(
                                    record.id
                                )}">
                                تفصیل
                            </button>

                        </div>

                    </article>
                `;
            }
        ).join("");


    list
        .querySelectorAll(
            ".admin-homework-details"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        showAdminHomeworkDetails(
                            this.dataset.id
                        );
                    }
                );
            }
        );
}


function updateHomeworkSummary() {

    const records =
        getFilteredHomework();


    const today =
        getTodayISO();


    const active =
        records.filter(
            record => {

                const due =
                    safeString(
                        firstValue(
                            record,
                            [
                                "due_date"
                            ]
                        )
                    ).slice(
                        0,
                        10
                    );


                return (
                    !due ||
                    due >= today
                );
            }
        ).length;


    const expired =
        records.length -
        active;


    setText(
        "adminHomeworkTotal",
        records.length
    );


    setText(
        "adminHomeworkActive",
        active
    );


    setText(
        "adminHomeworkExpired",
        expired
    );
}


async function showAdminHomeworkDetails(
    id
) {

    const record =
        App.homework.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!record) {
        return;
    }


    const teacher =
        findTeacherById(
            firstValue(
                record,
                [
                    "teacher_id",
                    "teacherId"
                ]
            )
        );


    setText(
        "adminHomeworkDetailsTitle",
        firstValue(
            record,
            [
                "title"
            ],
            "ہوم ورک"
        )
    );


    setText(
        "adminHomeworkDetailsClass",
        firstValue(
            record,
            [
                "student_class",
                "class_name",
                "class"
            ],
            "—"
        )
    );


    setText(
        "adminHomeworkDetailsSubject",
        firstValue(
            record,
            [
                "subject",
                "subject_name"
            ],
            "—"
        )
    );


    setText(
        "adminHomeworkDetailsTeacher",
        teacher
            ? getTeacherName(
                  teacher
              )
            : firstValue(
                  record,
                  [
                      "teacher_name"
                  ],
                  "—"
              )
    );


    setText(
        "adminHomeworkDetailsAssignedDate",
        formatDate(
            firstValue(
                record,
                [
                    "assigned_date",
                    "created_at"
                ]
            )
        )
    );


    setText(
        "adminHomeworkDetailsDueDate",
        formatDate(
            firstValue(
                record,
                [
                    "due_date"
                ]
            )
        )
    );


    setText(
        "adminHomeworkDetailsText",
        firstValue(
            record,
            [
                "description",
                "homework_text",
                "details"
            ],
            "—"
        )
    );


    await loadHomeworkSubmissions(
        record.id
    );


    openPortalModal(
        "adminHomeworkDetailsModal"
    );
}


async function loadHomeworkSubmissions(
    homeworkId
) {

    const body =
        byId(
            "adminHomeworkSubmissionsBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML = `
        <tr>
            <td colspan="7"
                class="table-empty">
                ریکارڈ لوڈ کیا جا رہا ہے...
            </td>
        </tr>
    `;


    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES
                        .HOMEWORK_SUBMISSIONS
                )
                .select("*")
                .eq(
                    "homework_id",
                    homeworkId
                )
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        const submissions =
            Array.isArray(data)
                ? data
                : [];


        setText(
            "adminHomeworkDetailsSubmitted",
            submissions.length
        );


        if (!submissions.length) {

            body.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="table-empty">
                        ابھی کوئی ہوم ورک جمع نہیں ہوا۔
                    </td>
                </tr>
            `;

            return;
        }


        body.innerHTML =
            submissions.map(
                submission => {

                    const student =
                        findStudentById(
                            firstValue(
                                submission,
                                [
                                    "student_id"
                                ]
                            )
                        );


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    student
                                        ? getStudentAdmissionNo(
                                              student
                                          )
                                        : "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    student
                                        ? getStudentName(
                                              student
                                          )
                                        : firstValue(
                                              submission,
                                              [
                                                  "student_name"
                                              ],
                                              "—"
                                          )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    student
                                        ? getStudentClass(
                                              student
                                          )
                                        : "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        firstValue(
                                            submission,
                                            [
                                                "submitted_at",
                                                "created_at"
                                            ]
                                        )
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatTime(
                                        firstValue(
                                            submission,
                                            [
                                                "submitted_at",
                                                "created_at"
                                            ]
                                        )
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    firstValue(
                                        submission,
                                        [
                                            "status"
                                        ],
                                        "جمع شدہ"
                                    )
                                )}
                            </td>

                            <td>
                                <button
                                    type="button"
                                    class="small-action-button secondary admin-review-homework"
                                    data-id="${escapeHTML(
                                        submission.id
                                    )}">
                                    جائزہ
                                </button>
                            </td>

                        </tr>
                    `;
                }
            ).join("");
    }


    catch (error) {

        console.error(
            "Homework submissions:",
            error
        );


        body.innerHTML = `
            <tr>
                <td colspan="7"
                    class="table-empty">
                    ریکارڈ لوڈ نہیں ہوسکا۔
                </td>
            </tr>
        `;
    }
}


async function createAdminHomework(
    event
) {

    event.preventDefault();


    const className =
        byId(
            "adminHomeworkTargetClass"
        )?.value;


    const subject =
        safeString(
            byId(
                "adminHomeworkSubject"
            )?.value
        );


    const title =
        safeString(
            byId(
                "adminHomeworkTitle"
            )?.value
        );


    const text =
        safeString(
            byId(
                "adminHomeworkText"
            )?.value
        );


    const assignedDate =
        byId(
            "adminHomeworkAssignedDate"
        )?.value ||
        getTodayISO();


    const dueDate =
        byId(
            "adminHomeworkDueDate"
        )?.value;


    if (
        !className ||
        !subject ||
        !title ||
        !text ||
        !dueDate
    ) {

        showPortalMessage(
            "adminHomeworkMessage",
            "تمام ضروری معلومات درج کریں۔",
            "error"
        );

        return;
    }


    try {

        const {
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.HOMEWORK
                )
                .insert({
                    student_class:
                        className,

                    subject:
                        subject,

                    title:
                        title,

                    description:
                        text,

                    assigned_date:
                        assignedDate,

                    due_date:
                        dueDate,

                    created_by:
                        getCurrentUserId(),

                    created_by_role:
                        "admin",

                    created_at:
                        new Date()
                            .toISOString()
                });


        if (error) {
            throw error;
        }


        closePortalModal(
            "adminCreateHomeworkModal"
        );


        const form =
            byId(
                "adminCreateHomeworkForm"
            );


        if (form) {
            form.reset();
        }


        const assignedInput =
            byId(
                "adminHomeworkAssignedDate"
            );


        if (assignedInput) {

            assignedInput.value =
                getTodayISO();
        }


        showPortalMessage(
            "adminHomeworkMessage",
            "ہوم ورک کامیابی سے جاری ہوگیا۔",
            "success"
        );


        await loadAdminHomework();


    } catch (error) {

        console.error(
            "Create homework:",
            error
        );


        showPortalMessage(
            "adminHomeworkMessage",
            "ہوم ورک جاری نہیں ہوسکا۔",
            "error"
        );
    }
}


function initializeHomeworkPage() {

    if (
        App.currentPage !==
        "admin-homework.html"
    ) {
        return;
    }


    const openButton =
        byId(
            "openAdminCreateHomeworkButton"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            function () {

                openPortalModal(
                    "adminCreateHomeworkModal"
                );
            }
        );
    }


    const createForm =
        byId(
            "adminCreateHomeworkForm"
        );


    if (createForm) {

        createForm.addEventListener(
            "submit",
            createAdminHomework
        );
    }


    const filterForm =
        byId(
            "adminHomeworkFilterForm"
        );


    if (filterForm) {

        filterForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                renderAdminHomework();

                updateHomeworkSummary();
            }
        );
    }


    const clearButton =
        byId(
            "clearAdminHomeworkFilters"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (filterForm) {
                    filterForm.reset();
                }

                renderAdminHomework();

                updateHomeworkSummary();
            }
        );
    }
}


/* =========================================================
   PART 2 PAGE DATA INITIALIZATION
   ========================================================= */

async function initializePart2Pages() {

    if (
        !isAdmin()
    ) {
        return;
    }


    if (
        App.currentPage ===
        "admin-attendance.html" ||
        App.currentPage ===
        "admin-marks.html" ||
        App.currentPage ===
        "admin-homework.html"
    ) {

        await Promise.all([
            loadStudentsForAdmin(),
            loadTeachersForAdmin()
        ]);
    }


    if (
        App.currentPage ===
        "admin-attendance.html"
    ) {

        fillTeacherSelect(
            byId(
                "adminAttendanceTeacherFilter"
            ),
            App.teachers,
            "تمام اساتذہ"
        );


        initializeAttendancePage();

        await loadAdminAttendance();
    }


    if (
        App.currentPage ===
        "admin-marks.html"
    ) {

        fillStudentSelect(
            byId(
                "adminAddMarksStudent"
            ),
            App.students
        );


        initializeMarksPage();

        await loadAdminMarks();
    }


    if (
        App.currentPage ===
        "admin-homework.html"
    ) {

        fillTeacherSelect(
            byId(
                "adminHomeworkTeacherFilter"
            ),
            App.teachers,
            "تمام اساتذہ"
        );


        initializeHomeworkPage();

        await loadAdminHomework();
    }
}


/* =========================================================
   RUN PART 2
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializePart2Pages()
            .catch(
                error => {

                    console.error(
                        "Part 2 initialization error:",
                        error
                    );
                }
            );
    }
);


/* =========================================================
   END PART 2 / 3

   PART 3 MUST BE PASTED DIRECTLY BELOW THIS LINE.
   ========================================================= */


/* =========================================================
   مدرسہ شہناز اختر للبنات
   SCRIPT.JS
   PART 3 / 3

   ANNOUNCEMENTS
   ACCOUNTS / APPLICATIONS
   SETTINGS
   FINAL INITIALIZATION
   ========================================================= */


/* =========================================================
   ANNOUNCEMENTS
   ========================================================= */

async function loadAdminAnnouncements() {

    if (
        App.currentPage !==
        "admin-announcements.html"
    ) {
        return;
    }

    if (
        !checkSupabase(
            byId("adminAnnouncementMessage")
        )
    ) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.ANNOUNCEMENTS
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

        App.announcements =
            Array.isArray(data)
                ? data
                : [];

        renderAdminAnnouncements();

        updateAnnouncementSummary();

    } catch (error) {

        console.error(
            "Announcements load error:",
            error
        );

        showPortalMessage(
            "adminAnnouncementMessage",
            "اعلانات لوڈ نہیں ہوسکے۔",
            "error"
        );
    }
}


function getFilteredAnnouncements() {

    let records =
        [...App.announcements];

    const search =
        safeString(
            byId(
                "adminAnnouncementSearch"
            )?.value
        ).toLowerCase();

    const target =
        safeString(
            byId(
                "adminAnnouncementTargetFilter"
            )?.value
        ).toLowerCase();

    if (search) {

        records =
            records.filter(
                record => {

                    const text =
                        (
                            safeString(
                                firstValue(
                                    record,
                                    [
                                        "title"
                                    ]
                                )
                            ) +
                            " " +
                            safeString(
                                firstValue(
                                    record,
                                    [
                                        "message",
                                        "description",
                                        "announcement_text"
                                    ]
                                )
                            )
                        ).toLowerCase();

                    return text.includes(
                        search
                    );
                }
            );
    }

    if (target) {

        records =
            records.filter(
                record =>
                    safeString(
                        firstValue(
                            record,
                            [
                                "target",
                                "target_type",
                                "audience"
                            ]
                        )
                    ).toLowerCase() ===
                    target
            );
    }

    return records;
}


function getAnnouncementTargetUrdu(
    value
) {

    const target =
        safeString(value)
            .toLowerCase();

    if (
        target === "all" ||
        target === "everyone"
    ) {
        return "سب";
    }

    if (
        target === "students" ||
        target === "student"
    ) {
        return "طالبات";
    }

    if (
        target === "teachers" ||
        target === "teacher"
    ) {
        return "اساتذہ";
    }

    if (
        target === "class"
    ) {
        return "جماعت";
    }

    return safeString(value) || "سب";
}


function renderAdminAnnouncements() {

    const list =
        byId(
            "adminAnnouncementList"
        );

    if (!list) {
        return;
    }

    const records =
        getFilteredAnnouncements();

    if (!records.length) {

        list.innerHTML = `
            <div class="portal-empty-state">
                کوئی اعلان موجود نہیں۔
            </div>
        `;

        return;
    }

    list.innerHTML =
        records.map(
            record => {

                const target =
                    firstValue(
                        record,
                        [
                            "target",
                            "target_type",
                            "audience"
                        ],
                        "all"
                    );

                return `
                    <article class="announcement-card">

                        <span class="profile-label">
                            ${escapeHTML(
                                getAnnouncementTargetUrdu(
                                    target
                                )
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "title"
                                    ],
                                    "اعلان"
                                )
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "message",
                                        "description",
                                        "announcement_text"
                                    ],
                                    "—"
                                )
                            )}
                        </p>

                        <div class="student-profile-details">

                            <div class="profile-detail-item">
                                <span>تاریخ</span>
                                <strong>
                                    ${escapeHTML(
                                        formatDate(
                                            firstValue(
                                                record,
                                                [
                                                    "created_at",
                                                    "announcement_date"
                                                ]
                                            )
                                        )
                                    )}
                                </strong>
                            </div>

                            <div class="profile-detail-item">
                                <span>جماعت</span>
                                <strong>
                                    ${escapeHTML(
                                        firstValue(
                                            record,
                                            [
                                                "student_class",
                                                "class_name"
                                            ],
                                            "سب"
                                        )
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div class="portal-form-actions">

                            <button
                                type="button"
                                class="small-action-button admin-announcement-details"
                                data-id="${escapeHTML(
                                    record.id
                                )}">
                                تفصیل
                            </button>

                            <button
                                type="button"
                                class="small-action-button danger admin-announcement-delete"
                                data-id="${escapeHTML(
                                    record.id
                                )}">
                                حذف کریں
                            </button>

                        </div>

                    </article>
                `;
            }
        ).join("");

    list
        .querySelectorAll(
            ".admin-announcement-details"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        showAdminAnnouncementDetails(
                            this.dataset.id
                        );
                    }
                );
            }
        );

    list
        .querySelectorAll(
            ".admin-announcement-delete"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        prepareAnnouncementDelete(
                            this.dataset.id
                        );
                    }
                );
            }
        );
}


function updateAnnouncementSummary() {

    const records =
        getFilteredAnnouncements();

    setText(
        "adminAnnouncementTotal",
        records.length
    );

    const studentCount =
        records.filter(
            record => {

                const target =
                    safeString(
                        firstValue(
                            record,
                            [
                                "target",
                                "target_type",
                                "audience"
                            ]
                        )
                    ).toLowerCase();

                return (
                    target === "students" ||
                    target === "student"
                );
            }
        ).length;

    const teacherCount =
        records.filter(
            record => {

                const target =
                    safeString(
                        firstValue(
                            record,
                            [
                                "target",
                                "target_type",
                                "audience"
                            ]
                        )
                    ).toLowerCase();

                return (
                    target === "teachers" ||
                    target === "teacher"
                );
            }
        ).length;

    setText(
        "adminAnnouncementStudentTotal",
        studentCount
    );

    setText(
        "adminAnnouncementTeacherTotal",
        teacherCount
    );
}


function showAdminAnnouncementDetails(
    id
) {

    const record =
        App.announcements.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!record) {
        return;
    }

    setText(
        "adminAnnouncementDetailsTitle",
        firstValue(
            record,
            ["title"],
            "اعلان"
        )
    );

    setText(
        "adminAnnouncementDetailsTarget",
        getAnnouncementTargetUrdu(
            firstValue(
                record,
                [
                    "target",
                    "target_type",
                    "audience"
                ],
                "all"
            )
        )
    );

    setText(
        "adminAnnouncementDetailsClass",
        firstValue(
            record,
            [
                "student_class",
                "class_name"
            ],
            "سب"
        )
    );

    setText(
        "adminAnnouncementDetailsDate",
        formatDateTime(
            firstValue(
                record,
                [
                    "created_at",
                    "announcement_date"
                ]
            )
        )
    );

    setText(
        "adminAnnouncementDetailsMessage",
        firstValue(
            record,
            [
                "message",
                "description",
                "announcement_text"
            ],
            "—"
        )
    );

    openPortalModal(
        "adminAnnouncementDetailsModal"
    );
}


async function createAdminAnnouncement(
    event
) {

    event.preventDefault();

    const title =
        safeString(
            byId(
                "adminAnnouncementTitle"
            )?.value
        );

    const message =
        safeString(
            byId(
                "adminAnnouncementText"
            )?.value
        );

    const target =
        safeString(
            byId(
                "adminAnnouncementTarget"
            )?.value
        );

    const className =
        safeString(
            byId(
                "adminAnnouncementClass"
            )?.value
        );

    if (
        !title ||
        !message ||
        !target
    ) {

        showPortalMessage(
            "adminAnnouncementMessage",
            "تمام ضروری معلومات درج کریں۔",
            "error"
        );

        return;
    }

    try {

        const {
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.ANNOUNCEMENTS
                )
                .insert({
                    title: title,

                    message: message,

                    target: target,

                    student_class:
                        className || null,

                    created_by:
                        getCurrentUserId(),

                    created_by_role:
                        "admin",

                    created_at:
                        new Date()
                            .toISOString()
                });

        if (error) {
            throw error;
        }

        closePortalModal(
            "adminCreateAnnouncementModal"
        );

        const form =
            byId(
                "adminCreateAnnouncementForm"
            );

        if (form) {
            form.reset();
        }

        showPortalMessage(
            "adminAnnouncementMessage",
            "اعلان کامیابی سے جاری ہوگیا۔",
            "success"
        );

        await loadAdminAnnouncements();

    } catch (error) {

        console.error(
            "Create announcement:",
            error
        );

        showPortalMessage(
            "adminAnnouncementMessage",
            "اعلان جاری نہیں ہوسکا۔",
            "error"
        );
    }
}


function prepareAnnouncementDelete(
    id
) {

    const input =
        byId(
            "adminDeleteAnnouncementId"
        );

    if (input) {
        input.value = id;
    }

    openPortalModal(
        "adminDeleteAnnouncementModal"
    );
}


async function confirmAnnouncementDelete() {

    const id =
        byId(
            "adminDeleteAnnouncementId"
        )?.value;

    if (!id) {
        return;
    }

    try {

        const {
            error
        } =
            await App.supabase
                .from(
                    App.TABLES.ANNOUNCEMENTS
                )
                .delete()
                .eq(
                    "id",
                    id
                );

        if (error) {
            throw error;
        }

        closePortalModal(
            "adminDeleteAnnouncementModal"
        );

        showPortalMessage(
            "adminAnnouncementMessage",
            "اعلان حذف ہوگیا۔",
            "success"
        );

        await loadAdminAnnouncements();

    } catch (error) {

        console.error(
            "Delete announcement:",
            error
        );

        showPortalMessage(
            "adminAnnouncementMessage",
            "اعلان حذف نہیں ہوسکا۔",
            "error"
        );
    }
}


function initializeAnnouncementPage() {

    if (
        App.currentPage !==
        "admin-announcements.html"
    ) {
        return;
    }

    const openButton =
        byId(
            "openAdminCreateAnnouncementButton"
        );

    if (openButton) {

        openButton.addEventListener(
            "click",
            function () {

                openPortalModal(
                    "adminCreateAnnouncementModal"
                );
            }
        );
    }

    const form =
        byId(
            "adminCreateAnnouncementForm"
        );

    if (form) {

        form.addEventListener(
            "submit",
            createAdminAnnouncement
        );
    }

    const deleteButton =
        byId(
            "confirmAdminDeleteAnnouncement"
        );

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            confirmAnnouncementDelete
        );
    }

    const filterForm =
        byId(
            "adminAnnouncementFilterForm"
        );

    if (filterForm) {

        filterForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                renderAdminAnnouncements();

                updateAnnouncementSummary();
            }
        );
    }
}


/* =========================================================
   APPLICATIONS
   ========================================================= */

async function loadApplicationsFromTable(
    table,
    type
) {

    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(table)
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

        return (
            Array.isArray(data)
                ? data
                : []
        ).map(
            item => ({
                ...item,
                application_type:
                    type,
                source_table:
                    table
            })
        );

    } catch (error) {

        console.error(
            "Application table error:",
            table,
            error
        );

        return [];
    }
}


async function loadAdminApplications() {

    if (
        App.currentPage !==
        "admin-accounts.html"
    ) {
        return;
    }

    const [
        students,
        teachers
    ] =
        await Promise.all([

            loadApplicationsFromTable(
                App.TABLES
                    .STUDENT_APPLICATIONS,
                "student"
            ),

            loadApplicationsFromTable(
                App.TABLES
                    .TEACHER_APPLICATIONS,
                "teacher"
            )

        ]);

    App.applications = [
        ...students,
        ...teachers
    ];

    renderAdminApplications();
}


function renderAdminApplications() {

    const body =
        byId(
            "adminApplicationsBody"
        );

    if (!body) {
        return;
    }

    const records =
        App.applications.filter(
            record =>
                safeString(
                    firstValue(
                        record,
                        ["status"],
                        "pending"
                    )
                ).toLowerCase() ===
                "pending"
        );

    setText(
        "adminPendingApplicationTotal",
        records.length
    );

    if (!records.length) {

        body.innerHTML = `
            <tr>
                <td colspan="7"
                    class="table-empty">
                    کوئی زیرِ التواء درخواست نہیں۔
                </td>
            </tr>
        `;

        return;
    }

    body.innerHTML =
        records.map(
            record => `
                <tr>

                    <td>
                        ${escapeHTML(
                            record.id
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            firstValue(
                                record,
                                [
                                    "name",
                                    "student_name",
                                    "teacher_name"
                                ],
                                "—"
                            )
                        )}
                    </td>

                    <td>
                        ${
                            record.application_type ===
                            "student"
                                ? "طالبہ"
                                : "استاد"
                        }
                    </td>

                    <td>
                        ${escapeHTML(
                            firstValue(
                                record,
                                ["phone"],
                                "—"
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            formatDate(
                                firstValue(
                                    record,
                                    [
                                        "created_at",
                                        "application_date"
                                    ]
                                )
                            )
                        )}
                    </td>

                    <td>
                        زیرِ التواء
                    </td>

                    <td>
                        <button
                            type="button"
                            class="small-action-button admin-application-details"
                            data-id="${escapeHTML(
                                record.id
                            )}"
                            data-table="${escapeHTML(
                                record.source_table
                            )}">
                            تفصیل
                        </button>
                    </td>

                </tr>
            `
        ).join("");

    body
        .querySelectorAll(
            ".admin-application-details"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        showApplicationDetails(
                            this.dataset.id,
                            this.dataset.table
                        );
                    }
                );
            }
        );
}


function findApplication(
    id,
    table
) {

    return App.applications.find(
        item =>
            String(item.id) ===
                String(id) &&
            item.source_table ===
                table
    ) || null;
}


function showApplicationDetails(
    id,
    table
) {

    const record =
        findApplication(
            id,
            table
        );

    if (!record) {
        return;
    }

    setText(
        "adminApplicationDetailsName",
        firstValue(
            record,
            [
                "name",
                "student_name",
                "teacher_name"
            ],
            "—"
        )
    );

    setText(
        "adminApplicationDetailsType",
        record.application_type ===
            "student"
            ? "طالبہ"
            : "استاد"
    );

    setText(
        "adminApplicationDetailsPhone",
        firstValue(
            record,
            ["phone"],
            "—"
        )
    );

    setText(
        "adminApplicationDetailsCNIC",
        firstValue(
            record,
            ["cnic"],
            "—"
        )
    );

    setText(
        "adminApplicationDetailsDate",
        formatDateTime(
            firstValue(
                record,
                [
                    "created_at",
                    "application_date"
                ]
            )
        )
    );

    const idInput =
        byId(
            "adminApplicationDecisionId"
        );

    const tableInput =
        byId(
            "adminApplicationDecisionTable"
        );

    if (idInput) {
        idInput.value = id;
    }

    if (tableInput) {
        tableInput.value = table;
    }

    openPortalModal(
        "adminApplicationDetailsModal"
    );
}


async function updateApplicationStatus(
    status
) {

    const id =
        byId(
            "adminApplicationDecisionId"
        )?.value;

    const table =
        byId(
            "adminApplicationDecisionTable"
        )?.value;

    if (
        !id ||
        !table
    ) {
        return;
    }

    try {

        const {
            error
        } =
            await App.supabase
                .from(table)
                .update({
                    status: status,

                    reviewed_by:
                        getCurrentUserId(),

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

        closePortalModal(
            "adminApplicationDetailsModal"
        );

        closePortalModal(
            "adminApplicationDecisionModal"
        );

        showPortalMessage(
            "adminAccountsMessage",
            status === "approved"
                ? "درخواست منظور ہوگئی۔"
                : "درخواست مسترد ہوگئی۔",
            "success"
        );

        await loadAdminApplications();

    } catch (error) {

        console.error(
            "Application decision:",
            error
        );

        showPortalMessage(
            "adminAccountsMessage",
            "درخواست پر کارروائی نہیں ہوسکی۔",
            "error"
        );
    }
}


/* =========================================================
   ACCOUNTS
   ========================================================= */

async function loadAccountTable(
    table,
    type
) {

    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(table)
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

        return (
            Array.isArray(data)
                ? data
                : []
        ).map(
            item => ({
                ...item,
                account_type: type,
                source_table: table
            })
        );

    } catch (error) {

        console.error(
            "Account load:",
            table,
            error
        );

        return [];
    }
}


async function loadAdminAccounts() {

    if (
        App.currentPage !==
        "admin-accounts.html"
    ) {
        return;
    }

    const [
        studentAccounts,
        teacherAccounts
    ] =
        await Promise.all([

            loadAccountTable(
                App.TABLES
                    .STUDENT_ACCOUNTS,
                "student"
            ),

            loadAccountTable(
                App.TABLES
                    .TEACHER_ACCOUNTS,
                "teacher"
            )

        ]);

    App.studentAccounts =
        studentAccounts;

    App.teacherAccounts =
        teacherAccounts;

    renderAdminAccounts();
}


function renderAdminAccounts() {

    const body =
        byId(
            "adminAccountsBody"
        );

    if (!body) {
        return;
    }

    const records = [
        ...App.studentAccounts,
        ...App.teacherAccounts
    ];

    if (!records.length) {

        body.innerHTML = `
            <tr>
                <td colspan="7"
                    class="table-empty">
                    کوئی اکاؤنٹ موجود نہیں۔
                </td>
            </tr>
        `;

        return;
    }

    body.innerHTML =
        records.map(
            record => {

                const active =
                    firstValue(
                        record,
                        [
                            "is_active",
                            "active"
                        ],
                        true
                    );

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                record.id
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "name",
                                        "username",
                                        "account_name"
                                    ],
                                    "—"
                                )
                            )}
                        </td>

                        <td>
                            ${
                                record.account_type ===
                                "student"
                                    ? "طالبہ"
                                    : "استاد"
                            }
                        </td>

                        <td>
                            ${escapeHTML(
                                firstValue(
                                    record,
                                    [
                                        "username",
                                        "phone"
                                    ],
                                    "—"
                                )
                            )}
                        </td>

                        <td>
                            ${
                                active === false
                                    ? "غیر فعال"
                                    : "فعال"
                            }
                        </td>

                        <td>
                            ${escapeHTML(
                                formatDate(
                                    firstValue(
                                        record,
                                        [
                                            "created_at"
                                        ]
                                    )
                                )
                            )}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="small-action-button secondary admin-account-toggle"
                                data-id="${escapeHTML(
                                    record.id
                                )}"
                                data-table="${escapeHTML(
                                    record.source_table
                                )}"
                                data-active="${
                                    active === false
                                        ? "false"
                                        : "true"
                                }">
                                ${
                                    active === false
                                        ? "فعال کریں"
                                        : "غیر فعال کریں"
                                }
                            </button>
                        </td>

                    </tr>
                `;
            }
        ).join("");

    body
        .querySelectorAll(
            ".admin-account-toggle"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        changeAccountStatus(
                            this.dataset.id,
                            this.dataset.table,
                            this.dataset.active !==
                                "true"
                        );
                    }
                );
            }
        );
}


async function changeAccountStatus(
    id,
    table,
    newStatus
) {

    try {

        const {
            error
        } =
            await App.supabase
                .from(table)
                .update({
                    is_active:
                        newStatus,

                    updated_at:
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

        showPortalMessage(
            "adminAccountsMessage",
            newStatus
                ? "اکاؤنٹ فعال ہوگیا۔"
                : "اکاؤنٹ غیر فعال ہوگیا۔",
            "success"
        );

        await loadAdminAccounts();

    } catch (error) {

        console.error(
            "Account status:",
            error
        );

        showPortalMessage(
            "adminAccountsMessage",
            "اکاؤنٹ کی حالت تبدیل نہیں ہوسکی۔",
            "error"
        );
    }
}


/* =========================================================
   ACCOUNT PAGE EVENTS
   ========================================================= */

function initializeAccountsPage() {

    if (
        App.currentPage !==
        "admin-accounts.html"
    ) {
        return;
    }

    const approveButton =
        byId(
            "approveAdminApplication"
        );

    const rejectButton =
        byId(
            "rejectAdminApplication"
        );

    if (approveButton) {

        approveButton.addEventListener(
            "click",
            function () {

                updateApplicationStatus(
                    "approved"
                );
            }
        );
    }

    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            function () {

                updateApplicationStatus(
                    "rejected"
                );
            }
        );
    }
}


/* =========================================================
   SETTINGS
   ========================================================= */

async function loadAdminSettings() {

    if (
        App.currentPage !==
        "admin-settings.html"
    ) {
        return;
    }

    setText(
        "settingsAdminName",
        getCurrentUserName() ||
        "منتظم"
    );

    setText(
        "settingsAdminRole",
        "منتظم"
    );

    updateVisibleSessionInformation();

    if (
        !checkSupabase()
    ) {
        return;
    }

    const userId =
        getCurrentUserId();

    if (!userId) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await App.supabase
                .from(
                    App.TABLES
                        .ADMIN_ACCOUNTS
                )
                .select("*")
                .eq(
                    "id",
                    userId
                )
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return;
        }

        setText(
            "settingsAdminName",
            firstValue(
                data,
                [
                    "name",
                    "username"
                ],
                "منتظم"
            )
        );

        setText(
            "settingsAdminUsername",
            firstValue(
                data,
                [
                    "username",
                    "phone"
                ],
                "—"
            )
        );

    } catch (error) {

        console.error(
            "Admin settings load:",
            error
        );
    }
}


/* =========================================================
   PASSWORD VALIDATION
   ========================================================= */

function validateNewPassword(
    password
) {

    const value =
        safeString(password);

    return {
        length:
            value.length >= 8,

        letter:
            /[A-Za-z]/.test(
                value
            ),

        number:
            /[0-9]/.test(
                value
            )
    };
}


function updatePasswordRequirements() {

    const password =
        byId(
            "settingsAdminNewPassword"
        )?.value || "";

    const result =
        validateNewPassword(
            password
        );

    const mapping = {
        settingsPasswordLength:
            result.length,

        settingsPasswordLetter:
            result.letter,

        settingsPasswordNumber:
            result.number
    };

    Object.entries(
        mapping
    ).forEach(
        ([id, valid]) => {

            const element =
                byId(id);

            if (!element) {
                return;
            }

            element.classList.toggle(
                "valid",
                valid
            );
        }
    );

    return (
        result.length &&
        result.letter &&
        result.number
    );
}


/* =========================================================
   CHANGE ADMIN PASSWORD
   ========================================================= */

async function changeAdminPassword(
    event
) {

    event.preventDefault();

    const newPassword =
        byId(
            "settingsAdminNewPassword"
        )?.value || "";

    const confirmPassword =
        byId(
            "settingsAdminConfirmPassword"
        )?.value || "";

    if (
        !updatePasswordRequirements()
    ) {

        showPortalMessage(
            "settingsAdminMessage",
            "نیا پاس ورڈ کم از کم 8 حروف کا ہو اور اس میں حرف اور نمبر شامل ہوں۔",
            "error"
        );

        return;
    }

    if (
        newPassword !==
        confirmPassword
    ) {

        showPortalMessage(
            "settingsAdminMessage",
            "دونوں نئے پاس ورڈ ایک جیسے نہیں ہیں۔",
            "error"
        );

        return;
    }

    const userId =
        getCurrentUserId();

    if (!userId) {

        showPortalMessage(
            "settingsAdminMessage",
            "منتظم کا اکاؤنٹ شناخت نہیں ہوسکا۔",
            "error"
        );

        return;
    }

    try {

        const {
            error
        } =
            await App.supabase
                .from(
                    App.TABLES
                        .ADMIN_ACCOUNTS
                )
                .update({
                    password:
                        newPassword,

                    updated_at:
                        new Date()
                            .toISOString()
                })
                .eq(
                    "id",
                    userId
                );

        if (error) {
            throw error;
        }

        const form =
            byId(
                "settingsAdminPasswordForm"
            );

        if (form) {
            form.reset();
        }

        updatePasswordRequirements();

        showPortalMessage(
            "settingsAdminMessage",
            "پاس ورڈ کامیابی سے تبدیل ہوگیا۔",
            "success"
        );

    } catch (error) {

        console.error(
            "Password change:",
            error
        );

        showPortalMessage(
            "settingsAdminMessage",
            "پاس ورڈ تبدیل نہیں ہوسکا۔",
            "error"
        );
    }
}


/* =========================================================
   SETTINGS EVENTS
   ========================================================= */

function initializeSettingsPage() {

    if (
        App.currentPage !==
        "admin-settings.html"
    ) {
        return;
    }

    const password =
        byId(
            "settingsAdminNewPassword"
        );

    if (password) {

        password.addEventListener(
            "input",
            updatePasswordRequirements
        );
    }

    const form =
        byId(
            "settingsAdminPasswordForm"
        );

    if (form) {

        form.addEventListener(
            "submit",
            changeAdminPassword
        );
    }
}


/* =========================================================
   LOGIN TIMEOUT MESSAGE
   ========================================================= */

function showStoredLogoutMessage() {

    const message =
        sessionStorage.getItem(
            "logoutMessage"
        );

    if (!message) {
        return;
    }

    const target =
        byId(
            "loginMessage"
        );

    if (target) {

        showPortalMessage(
            target,
            message,
            "warning"
        );
    }

    sessionStorage.removeItem(
        "logoutMessage"
    );
}


/* =========================================================
   RESPONSIVE SIDEBAR SAFETY
   ========================================================= */

function initializeResponsiveSafety() {

    document.addEventListener(
        "click",
        function (event) {

            const sidebar =
                byId(
                    "adminSidebar"
                );

            const menu =
                byId(
                    "adminMenuButton"
                );

            const overlay =
                byId(
                    "adminSidebarOverlay"
                );

            if (
                !sidebar ||
                window.innerWidth > 850 ||
                !sidebar.classList.contains(
                    "open"
                )
            ) {
                return;
            }

            if (
                sidebar.contains(
                    event.target
                ) ||
                (
                    menu &&
                    menu.contains(
                        event.target
                    )
                )
            ) {
                return;
            }

            sidebar.classList.remove(
                "open"
            );

            if (overlay) {

                overlay.classList.remove(
                    "active"
                );
            }
        }
    );
}


/* =========================================================
   FINAL PAGE INITIALIZATION
   ========================================================= */

async function initializePart3Pages() {

    if (
        App.currentPage ===
        "login.html"
    ) {

        showStoredLogoutMessage();

        return;
    }

    if (
        !isAdmin()
    ) {
        return;
    }

    if (
        App.currentPage ===
        "admin-announcements.html"
    ) {

        initializeAnnouncementPage();

        await loadAdminAnnouncements();
    }

    if (
        App.currentPage ===
        "admin-accounts.html"
    ) {

        initializeAccountsPage();

        await Promise.all([
            loadAdminApplications(),
            loadAdminAccounts()
        ]);
    }

    if (
        App.currentPage ===
        "admin-settings.html"
    ) {

        initializeSettingsPage();

        await loadAdminSettings();
    }
}


/* =========================================================
   GLOBAL ERROR SAFETY
   ========================================================= */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Global script error:",
            event.error ||
            event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "Unhandled promise error:",
            event.reason
        );
    }
);


/* =========================================================
   FINAL RUN
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeResponsiveSafety();

        initializePart3Pages()
            .catch(
                error => {

                    console.error(
                        "Part 3 initialization error:",
                        error
                    );
                }
            );
    }
);


/* =========================================================
   SCRIPT.JS COMPLETE
   PART 3 / 3
   ========================================================= */

