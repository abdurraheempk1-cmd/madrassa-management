document.addEventListener("DOMContentLoaded", function () {

/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://ggtnetudnjsmsmitvjmb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_AxbfXMmjCRPS3N7ILRUbQA_U20DE6-s";

let supabaseClient = null;


if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

}


/* =====================================================
   GLOBAL HELPERS
===================================================== */

function checkSupabase() {

    if (!supabaseClient) {

        console.error(
            "Supabase client load نہیں ہوا۔"
        );

        return false;

    }

    return true;

}


function showMessage(element, message) {

    if (element) {

        element.textContent =
            message;

    }

}


/* =====================================================
   INACTIVITY AUTO LOGOUT
===================================================== */

let inactivityTimer = null;

const INACTIVITY_TIME =
    5 * 60 * 1000;


function saveCurrentDraft() {

    try {

        const form =
            document.querySelector(
                "form"
            );

        if (!form) {
            return;
        }


        const inputs =
            form.querySelectorAll(
                "input, textarea, select"
            );

        const draft = {};


        inputs.forEach(
            function (input) {

                if (!input.id) {
                    return;
                }


                if (
                    input.type ===
                    "checkbox"
                ) {

                    draft[input.id] =
                        input.checked;

                } else {

                    draft[input.id] =
                        input.value;

                }

            }
        );


        localStorage.setItem(
            "currentDraft",
            JSON.stringify(draft)
        );

    } catch (error) {

        console.error(
            "Draft محفوظ نہیں ہو سکا۔",
            error
        );

    }

}


function clearCurrentDraft() {

    localStorage.removeItem(
        "currentDraft"
    );

}


function resetInactivityTimer() {

    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );

    }


    inactivityTimer =
        setTimeout(
            function () {

                saveCurrentDraft();


                localStorage.removeItem(
                    "loggedIn"
                );

                localStorage.removeItem(
                    "userRole"
                );


                window.location.href =
                    "index.html";

            },
            INACTIVITY_TIME
        );

}


document.addEventListener(
    "click",
    resetInactivityTimer
);

document.addEventListener(
    "touchstart",
    resetInactivityTimer
);

document.addEventListener(
    "keydown",
    resetInactivityTimer
);

document.addEventListener(
    "mousemove",
    resetInactivityTimer
);

document.addEventListener(
    "scroll",
    resetInactivityTimer
);


/* =====================================================
   PAGE NAME
===================================================== */

const currentPage =
    window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


/* =====================================================
   HOME PAGE LOGIN BUTTONS
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


if (adminLoginButton) {

    adminLoginButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "login.html?role=admin";

        }
    );

}


if (teacherLoginButton) {

    teacherLoginButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "login.html?role=teacher";

        }
    );

}


if (studentLoginButton) {

    studentLoginButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "login.html?role=student";

        }
    );

}


/* =====================================================
   LOGIN PAGE ELEMENTS
===================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const rememberMe =
    document.getElementById(
        "rememberMe"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const backButton =
    document.getElementById(
        "backButton"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


/* =====================================================
   LOGIN ROLE
===================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const loginRole =
    urlParams.get("role") ||
    "admin";


const roleTitles = {

    admin:
        "ایڈمن لاگ اِن",

    teacher:
        "استاد لاگ اِن",

    student:
        "طالبہ لاگ اِن"

};


const loginTitle =
    document.querySelector(
        ".login-container h1"
    );


if (
    loginTitle &&
    roleTitles[loginRole]
) {

    loginTitle.textContent =
        roleTitles[loginRole];

}


/* =====================================================
   LOGIN CREDENTIALS
===================================================== */

const loginCredentials = {

    admin: {

        username:
            "admin",

        password:
            "admin123"

    },

    teacher: {

        username:
            "teacher",

        password:
            "teacher123"

    },

    student: {

        username:
            "student",

        password:
            "student123"

    }

};


/* =====================================================
   REMEMBER ME
===================================================== */

if (
    usernameInput &&
    passwordInput
) {

    const savedUsername =
        localStorage.getItem(
            "rememberUsername"
        );

    const savedPassword =
        localStorage.getItem(
            "rememberPassword"
        );


    if (savedUsername) {

        usernameInput.value =
            savedUsername;

    }


    if (savedPassword) {

        passwordInput.value =
            savedPassword;

    }


    if (
        rememberMe &&
        savedUsername &&
        savedPassword
    ) {

        rememberMe.checked =
            true;

    }

}


/* =====================================================
   SHOW / HIDE PASSWORD
===================================================== */

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            if (!passwordInput) {
                return;
            }


            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

                togglePassword.setAttribute(
                    "aria-label",
                    "پاس ورڈ چھپائیں"
                );

            } else {

                passwordInput.type =
                    "password";

                togglePassword.textContent =
                    "👁️";

                togglePassword.setAttribute(
                    "aria-label",
                    "پاس ورڈ دکھائیں"
                );

            }

        }
    );

}


/* =====================================================
   BACK BUTTON
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
   LOGIN
===================================================== */

function performLogin() {

    const username =
        usernameInput
            ? usernameInput.value.trim()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (!username || !password) {

        showMessage(
            loginMessage,
            "براہِ کرم صارف نام اور پاس ورڈ درج کریں۔"
        );

        return;

    }


    const credentials =
        loginCredentials[
            loginRole
        ];


    if (
        credentials &&
        username ===
            credentials.username &&
        password ===
            credentials.password
    ) {

        localStorage.setItem(
            "loggedIn",
            "true"
        );

        localStorage.setItem(
            "userRole",
            loginRole
        );


        if (
            rememberMe &&
            rememberMe.checked
        ) {

            localStorage.setItem(
                "rememberUsername",
                username
            );

            localStorage.setItem(
                "rememberPassword",
                password
            );

        } else {

            localStorage.removeItem(
                "rememberUsername"
            );

            localStorage.removeItem(
                "rememberPassword"
            );

        }


        showMessage(
            loginMessage,
            "لاگ اِن کامیاب ہو گیا ہے۔"
        );


        resetInactivityTimer();


        setTimeout(
            function () {

                window.location.href =
                    "dashboard.html";

            },
            300
        );


    } else {

        showMessage(
            loginMessage,
            "صارف نام یا پاس ورڈ درست نہیں۔"
        );

    }

}


/* =====================================================
   LOGIN BUTTON
===================================================== */

if (loginButton) {

    loginButton.addEventListener(
        "click",
        function () {

            performLogin();

        }
    );

}


/* =====================================================
   LOGIN FORM
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            performLogin();

        }
    );

}


/* =====================================================
   LOGIN PAGE AUTO REDIRECT
===================================================== */

if (
    currentPage ===
    "login.html"
) {

    if (
        localStorage.getItem(
            "loggedIn"
        ) === "true"
    ) {

        /*
         * پہلے سے لاگ اِن صارف کو
         * دوبارہ لاگ اِن صفحہ نہ دکھائیں۔
         */

        window.location.href =
            "dashboard.html";

    }

}


/* =====================================================
   LOGOUT BUTTONS
===================================================== */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const logoutButtons =
    document.querySelectorAll(
        ".logout-button"
    );


function logoutUser() {

    saveCurrentDraft();


    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "userRole"
    );


    window.location.href =
        "index.html";

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutUser
    );

}


logoutButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            logoutUser
        );

    }
);


/* =====================================================
   PAGE PROTECTION
===================================================== */

const loggedIn =
    localStorage.getItem(
        "loggedIn"
    );

const userRole =
    localStorage.getItem(
        "userRole"
    );


if (
    currentPage ===
        "dashboard.html" ||
    currentPage ===
        "students.html" ||
    currentPage ===
        "teachers.html"
) {

    if (loggedIn !== "true") {

        window.location.href =
            "login.html?role=admin";

    }

}


/* =====================================================
   TEACHER PAGE ADMIN PROTECTION
===================================================== */

if (
    currentPage ===
    "teachers.html"
) {

    if (
        userRole !==
        "admin"
    ) {

        window.location.href =
            "dashboard.html";

    }

}


/* =====================================================
   INITIALIZE INACTIVITY
===================================================== */

if (
    loggedIn ===
    "true"
) {

    resetInactivityTimer();

}


/* =====================================================
   STUDENT DATA
===================================================== */

let studentsCache = [];

let editingStudentId = null;


/* =====================================================
   STUDENT ELEMENTS
===================================================== */

const studentForm =
    document.getElementById(
        "studentForm"
    );

const studentList =
    document.getElementById(
        "studentList"
    );

const studentSearch =
    document.getElementById(
        "studentSearch"
    );

const studentListCount =
    document.getElementById(
        "studentListCount"
    );

const studentFormMessage =
    document.getElementById(
        "studentFormMessage"
    );

const saveStudentButton =
    document.getElementById(
        "saveStudentButton"
    );

const cancelStudentButton =
    document.getElementById(
        "cancelStudentButton"
    );

const showStudentFormButton =
    document.getElementById(
        "showStudentForm"
    );


/* =====================================================
   STUDENT FIELD HELPERS
===================================================== */

function getStudentField(id) {

    return document.getElementById(
        id
    );

}


function getStudentValue(id) {

    const field =
        getStudentField(id);

    return field
        ? field.value.trim()
        : "";

}


/* =====================================================
   CNIC FORMATTER
===================================================== */

function formatCNIC(value) {

    let digits =
        String(value || "")
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                13
            );


    if (digits.length > 5) {

        digits =
            digits.slice(0, 5) +
            "-" +
            digits.slice(5);

    }


    if (digits.length > 13) {

        digits =
            digits.slice(0, 13) +
            "-" +
            digits.slice(13);

    }


    return digits;

}


const studentCNIC =
    document.getElementById(
        "studentCNIC"
    );


if (studentCNIC) {

    studentCNIC.addEventListener(
        "input",
        function () {

            const raw =
                this.value.replace(
                    /\D/g,
                    ""
                );

            this.value =
                formatCNIC(raw);

        }
    );

}


/* =====================================================
   STUDENT VALIDATION
===================================================== */

function isUrduText(value) {

    if (!value) {
        return false;
    }


    return /^[\u0600-\u06FF\s]+$/.test(
        value
    );

}


function validateStudent() {

    const name =
        getStudentValue(
            "studentName"
        );

    const fatherName =
        getStudentValue(
            "studentFatherName"
        );

    const phone =
        getStudentValue(
            "studentPhone"
        );

    const cnic =
        getStudentValue(
            "studentCNIC"
        );


    if (!name) {

        return "براہِ کرم طالبہ کا نام درج کریں۔";

    }


    if (!isUrduText(name)) {

        return "طالبہ کا نام صرف اردو حروف میں درج کریں۔";

    }


    if (
        fatherName &&
        !isUrduText(fatherName)
    ) {

        return "والد کا نام صرف اردو حروف میں درج کریں۔";

    }


    if (
        phone &&
        !/^\d{11}$/.test(phone)
    ) {

        return "موبائل نمبر 11 ہندسوں کا ہونا چاہیے۔";

    }


    if (
        cnic &&
        !/^\d{5}-?\d{7}-?\d$/.test(cnic)
    ) {

        return "شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔";

    }


    return "";

}


/* =====================================================
   MAHRAM DATA
===================================================== */

function getMahrams() {

    const mahrams = [];

    const rows =
        document.querySelectorAll(
            ".mahram-row"
        );


    rows.forEach(
        function (row) {

            const nameInput =
                row.querySelector(
                    ".mahram-name"
                );

            const relationInput =
                row.querySelector(
                    ".mahram-relation"
                );

            const phoneInput =
                row.querySelector(
                    ".mahram-phone"
                );


            if (
                nameInput &&
                nameInput.value.trim()
            ) {

                mahrams.push({

                    name:
                        nameInput.value.trim(),

                    relation:
                        relationInput
                            ? relationInput.value.trim()
                            : "",

                    phone:
                        phoneInput
                            ? phoneInput.value.trim()
                            : ""

                });

            }

        }
    );


    return mahrams.slice(
        0,
        5
    );

}


/* =====================================================
   MAHRAM APPROVAL
===================================================== */

function checkMahramLimit() {

    const rows =
        document.querySelectorAll(
            ".mahram-row"
        );


    if (rows.length <= 5) {
        return true;
    }


    return false;

}


/* =====================================================
   STUDENT FORM VISIBILITY
===================================================== */

if (showStudentFormButton) {

    showStudentFormButton.addEventListener(
        "click",
        function () {

            if (
                userRole !==
                "admin"
            ) {

                showMessage(
                    studentFormMessage,
                    "صرف ایڈمن طالبہ شامل کر سکتا ہے۔"
                );

                return;

            }


            if (studentForm) {

                studentForm.style.display =
                    "block";

            }

        }
    );

}


if (cancelStudentButton) {

    cancelStudentButton.addEventListener(
        "click",
        function () {

            if (studentForm) {

                studentForm.reset();

                studentForm.style.display =
                    "none";

            }


            editingStudentId =
                null;


            showMessage(
                studentFormMessage,
                ""
            );

        }
    );

}


/* =====================================================
   END OF PART 1
=====================================================*/

  /* =====================================================
   STUDENT FORM DATA
===================================================== */

function getStudentFormData() {

    const data = {

        admission_no:
            getStudentValue(
                "admissionNo"
            ),

        admission_type:
            getStudentValue(
                "admissionType"
            ),

        name:
            getStudentValue(
                "studentName"
            ),

        father_name:
            getStudentValue(
                "studentFatherName"
            ),

        guardian_name:
            getStudentValue(
                "studentGuardianName"
            ),

        cnic:
            formatCNIC(
                getStudentValue(
                    "studentCNIC"
                ).replace(
                    /\D/g,
                    ""
                )
            ),

        phone:
            getStudentValue(
                "studentPhone"
            ),

        date_of_birth:
            getStudentValue(
                "studentDOB"
            ) || null,

        student_class:
            getStudentValue(
                "studentClass"
            ),

        admission_date:
            getStudentValue(
                "admissionDate"
            ) || null,

        address:
            getStudentValue(
                "studentAddress"
            ),

        residence_type:
            getStudentValue(
                "residenceType"
            ),

        previous_madrassa:
            getStudentValue(
                "previousMadrassa"
            ),

        transfer_date:
            getStudentValue(
                "transferDate"
            ) || null,

        mahrams:
            getMahrams()

    };


    return data;

}


/* =====================================================
   SAVE STUDENT
===================================================== */

async function saveStudent() {

    if (
        userRole !==
        "admin"
    ) {

        showMessage(
            studentFormMessage,
            "صرف ایڈمن طالبہ محفوظ کر سکتا ہے۔"
        );

        return;

    }


    const validation =
        validateStudent();


    if (validation) {

        showMessage(
            studentFormMessage,
            validation
        );

        return;

    }


    if (
        !checkMahramLimit()
    ) {

        showMessage(
            studentFormMessage,
            "محرم کی زیادہ سے زیادہ تعداد 5 ہے۔"
        );

        return;

    }


    if (
        !checkSupabase()
    ) {

        showMessage(
            studentFormMessage,
            "ڈیٹا بیس دستیاب نہیں۔"
        );

        return;

    }


    const studentData =
        getStudentFormData();


    if (
        saveStudentButton
    ) {

        saveStudentButton.disabled =
            true;

    }


    try {

        let result;


        if (
            editingStudentId
        ) {

            result =
                await supabaseClient
                    .from("Students")
                    .update(
                        studentData
                    )
                    .eq(
                        "id",
                        editingStudentId
                    )
                    .select();


        } else {

            result =
                await supabaseClient
                    .from("Students")
                    .insert(
                        [studentData]
                    )
                    .select();

        }


        if (result.error) {

            console.error(
                "Student save error:",
                result.error
            );


            showMessage(
                studentFormMessage,
                "طالبہ محفوظ نہیں ہو سکی۔ " +
                "خرابی کا کوڈ: " +
                result.error.code
            );

            return;

        }


        showMessage(
            studentFormMessage,
            editingStudentId
                ? "طالبہ کی معلومات کامیابی سے تبدیل کر دی گئی ہیں۔"
                : "طالبہ کامیابی سے محفوظ کر دی گئی ہے۔"
        );


        editingStudentId =
            null;


        clearCurrentDraft();


        if (studentForm) {

            studentForm.reset();

            studentForm.style.display =
                "none";

        }


        await loadStudentsFromSupabase();


        displayStudents();


        updateDashboardStudentCount();


    } catch (error) {

        console.error(
            "Student save error:",
            error
        );


        showMessage(
            studentFormMessage,
            "طالبہ محفوظ نہیں ہو سکی۔"
        );


    } finally {

        if (
            saveStudentButton
        ) {

            saveStudentButton.disabled =
                false;

        }

    }

}


/* =====================================================
   SAVE STUDENT BUTTON
===================================================== */

if (saveStudentButton) {

    saveStudentButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            saveStudent();

        }
    );

}


if (studentForm) {

    studentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            saveStudent();

        }
    );

}


/* =====================================================
   LOAD STUDENTS
===================================================== */

async function loadStudentsFromSupabase() {

    if (
        !checkSupabase()
    ) {

        return studentsCache;

    }


    try {

        const result =
            await supabaseClient
                .from("Students")
                .select("*")
                .order(
                    "id",
                    {
                        ascending:
                            false
                    }
                );


        if (result.error) {

            console.error(
                "Students load error:",
                result.error
            );

            return studentsCache;

        }


        studentsCache =
            result.data || [];


        return studentsCache;


    } catch (error) {

        console.error(
            "Students load error:",
            error
        );

        return studentsCache;

    }

}


/* =====================================================
   STUDENT DISPLAY
===================================================== */

function displayStudents(
    searchText = ""
) {

    if (!studentList) {
        return;
    }


    const search =
        String(searchText)
            .trim()
            .toLowerCase();


    let filteredStudents =
        studentsCache;


    if (search) {

        filteredStudents =
            studentsCache.filter(
                function (student) {

                    const text =
                        [
                            student.admission_no,
                            student.name,
                            student.father_name,
                            student.phone,
                            student.cnic,
                            student.student_class
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    return text.includes(
                        search
                    );

                }
            );

    }


    studentList.innerHTML =
        "";


    if (
        studentListCount
    ) {

        studentListCount.textContent =
            filteredStudents.length;

    }


    if (
        filteredStudents.length ===
        0
    ) {

        studentList.innerHTML =
            `
            <div class="empty-message">
                ${
                    search
                        ? "تلاش کے مطابق کوئی طالبہ نہیں ملی۔"
                        : "ابھی کوئی طالبہ موجود نہیں۔"
                }
            </div>
            `;

        return;

    }


    filteredStudents.forEach(
        function (student) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "student-card";


            const name =
                student.name ||
                "بغیر نام";


            const admissionNo =
                student.admission_no ||
                "";


            const studentClass =
                student.student_class ||
                "";


            card.innerHTML =
                `
                <div class="student-card-info">

                    <h3>
                        ${escapeHTML(name)}
                    </h3>

                    ${
                        admissionNo
                            ? `
                            <p>
                                داخلہ نمبر:
                                ${escapeHTML(admissionNo)}
                            </p>
                            `
                            : ""
                    }

                    ${
                        studentClass
                            ? `
                            <p>
                                جماعت:
                                ${escapeHTML(studentClass)}
                            </p>
                            `
                            : ""
                    }

                </div>


                <div class="student-card-actions">

                    <button
                        type="button"
                        class="view-student-button"
                        data-id="${student.id}"
                    >
                        👁️ دیکھیں
                    </button>

                    ${
                        userRole ===
                        "admin"
                            ? `
                            <button
                                type="button"
                                class="edit-student-button"
                                data-id="${student.id}"
                            >
                                ✏️ ترمیم
                            </button>

                            <button
                                type="button"
                                class="delete-student-button"
                                data-id="${student.id}"
                            >
                                🗑️ حذف
                            </button>
                            `
                            : ""
                    }

                </div>
                `;


            studentList.appendChild(
                card
            );

        }
    );


    attachStudentCardButtons();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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

}


/* =====================================================
   STUDENT SEARCH
===================================================== */

if (studentSearch) {

    studentSearch.addEventListener(
        "input",
        function () {

            displayStudents(
                this.value
            );

        }
    );

}


/* =====================================================
   FIND STUDENT
===================================================== */

function findStudentById(
    id
) {

    return studentsCache.find(
        function (student) {

            return String(
                student.id
            ) === String(id);

        }
    ) || null;

}


/* =====================================================
   VIEW STUDENT
===================================================== */

function viewStudent(
    id
) {

    const student =
        findStudentById(id);


    if (!student) {

        alert(
            "طالبہ کی معلومات نہیں مل سکیں۔"
        );

        return;

    }


    const mahrams =
        Array.isArray(
            student.mahrams
        )
            ? student.mahrams
            : [];


    let mahramText =
        "کوئی معلومات موجود نہیں۔";


    if (
        mahrams.length
    ) {

        mahramText =
            mahrams
                .map(
                    function (mahram) {

                        return `
                            ${escapeHTML(
                                mahram.name || ""
                            )}
                            ${
                                mahram.relation
                                    ? " — " +
                                      escapeHTML(
                                          mahram.relation
                                      )
                                    : ""
                            }
                            ${
                                mahram.phone
                                    ? " — " +
                                      escapeHTML(
                                          mahram.phone
                                      )
                                    : ""
                            }
                        `;

                    }
                )
                .join("<br>");

    }


    const details =
        `
        <div class="student-details">

            <h2>
                ${escapeHTML(
                    student.name || ""
                )}
            </h2>

            <p>
                داخلہ نمبر:
                ${escapeHTML(
                    student.admission_no || ""
                )}
            </p>

            <p>
                داخلہ کی قسم:
                ${escapeHTML(
                    student.admission_type || ""
                )}
            </p>

            <p>
                والد کا نام:
                ${escapeHTML(
                    student.father_name || ""
                )}
            </p>

            <p>
                سرپرست کا نام:
                ${escapeHTML(
                    student.guardian_name || ""
                )}
            </p>

            <p>
                شناختی کارڈ نمبر:
                ${escapeHTML(
                    student.cnic || ""
                )}
            </p>

            <p>
                موبائل نمبر:
                ${escapeHTML(
                    student.phone || ""
                )}
            </p>

            <p>
                تاریخ پیدائش:
                ${escapeHTML(
                    student.date_of_birth || ""
                )}
            </p>

            <p>
                جماعت:
                ${escapeHTML(
                    student.student_class || ""
                )}
            </p>

            <p>
                داخلہ تاریخ:
                ${escapeHTML(
                    student.admission_date || ""
                )}
            </p>

            <p>
                پتہ:
                ${escapeHTML(
                    student.address || ""
                )}
            </p>

            <p>
                رہائش:
                ${escapeHTML(
                    student.residence_type || ""
                )}
            </p>

            <p>
                سابقہ مدرسہ:
                ${escapeHTML(
                    student.previous_madrassa || ""
                )}
            </p>

            <p>
                منتقلی کی تاریخ:
                ${escapeHTML(
                    student.transfer_date || ""
                )}
            </p>

            <hr>

            <h3>
                محرم کی معلومات
            </h3>

            <p>
                ${mahramText}
            </p>

        </div>
        `;


    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "student-view-modal";


    modal.innerHTML =
        `
        <div class="student-view-box">

            <button
                type="button"
                class="close-student-modal"
            >
                ✖️
            </button>

            ${details}

        </div>
        `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        modal.querySelector(
            ".close-student-modal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );

    }


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                modal.remove();

            }

        }
    );

}


/* =====================================================
   EDIT STUDENT
===================================================== */

function editStudent(
    id
) {

    if (
        userRole !==
        "admin"
    ) {

        alert(
            "صرف ایڈمن طالبہ کی معلومات تبدیل کر سکتا ہے۔"
        );

        return;

    }


    const student =
        findStudentById(id);


    if (!student) {

        alert(
            "طالبہ کی معلومات نہیں مل سکیں۔"
        );

        return;

    }


    editingStudentId =
        student.id;


    const fields = {

        admissionNo:
            student.admission_no,

        admissionType:
            student.admission_type,

        studentName:
            student.name,

        studentFatherName:
            student.father_name,

        studentGuardianName:
            student.guardian_name,

        studentCNIC:
            student.cnic,

        studentPhone:
            student.phone,

        studentDOB:
            student.date_of_birth,

        studentClass:
            student.student_class,

        admissionDate:
            student.admission_date,

        studentAddress:
            student.address,

        residenceType:
            student.residence_type,

        previousMadrassa:
            student.previous_madrassa,

        transferDate:
            student.transfer_date

    };


    Object.keys(fields).forEach(
        function (id) {

            const field =
                document.getElementById(
                    id
                );


            if (field) {

                field.value =
                    fields[id] || "";

            }

        }
    );


    if (studentForm) {

        studentForm.style.display =
            "block";

    }


    if (
        studentFormMessage
    ) {

        studentFormMessage.textContent =
            "طالبہ کی معلومات ترمیم کے لیے کھول دی گئی ہیں۔";

    }


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =====================================================
   DELETE STUDENT
===================================================== */

async function deleteStudent(
    id
) {

    if (
        userRole !==
        "admin"
    ) {

        alert(
            "صرف ایڈمن طالبہ حذف کر سکتا ہے۔"
        );

        return;

    }


    const student =
        findStudentById(id);


    if (!student) {

        alert(
            "طالبہ کی معلومات نہیں مل سکیں۔"
        );

        return;

    }


    const confirmed =
        window.confirm(
            "کیا آپ واقعی اس طالبہ کا ریکارڈ حذف کرنا چاہتے ہیں؟"
        );


    if (!confirmed) {
        return;
    }


    if (
        !checkSupabase()
    ) {

        alert(
            "ڈیٹا بیس دستیاب نہیں۔"
        );

        return;

    }


    try {

        const result =
            await supabaseClient
                .from("Students")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (result.error) {

            console.error(
                "Student delete error:",
                result.error
            );


            alert(
                "طالبہ حذف نہیں ہو سکی۔ " +
                "خرابی کا کوڈ: " +
                result.error.code
            );

            return;

        }


        alert(
            "طالبہ کامیابی سے حذف کر دی گئی ہے۔"
        );


        await loadStudentsFromSupabase();


        displayStudents();


        updateDashboardStudentCount();


    } catch (error) {

        console.error(
            "Student delete error:",
            error
        );


        alert(
            "طالبہ حذف نہیں ہو سکی۔"
        );

    }

}


/* =====================================================
   STUDENT BUTTON EVENTS
===================================================== */

function attachStudentCardButtons() {

    const viewButtons =
        document.querySelectorAll(
            ".view-student-button"
        );

    const editButtons =
        document.querySelectorAll(
            ".edit-student-button"
        );

    const deleteButtons =
        document.querySelectorAll(
            ".delete-student-button"
        );


    viewButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    viewStudent(
                        this.dataset.id
                    );

                }
            );

        }
    );


    editButtons.forEach(
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


    deleteButtons.forEach(
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
   STUDENTS PAGE INITIALIZE
===================================================== */

async function initializeStudentsPage() {

    if (
        currentPage !==
        "students.html"
    ) {

        return;

    }


    await loadStudentsFromSupabase();


    displayStudents();


}


/* =====================================================
   DASHBOARD STUDENT COUNT
===================================================== */

async function updateDashboardStudentCount() {

    const dashboardStudentTotal =
        document.getElementById(
            "studentTotal"
        );


    if (!dashboardStudentTotal) {

        return;

    }


    const students =
        await loadStudentsFromSupabase();


    dashboardStudentTotal.textContent =
        students.length;

}


/* =====================================================
   STUDENT PAGE START
===================================================== */

initializeStudentsPage();


/* =====================================================
   END OF PART 2
===================================================== */

 /* =====================================================
    TEACHER MANAGEMENT
 ===================================================== */

 let teachersCache = [];

 let editingTeacherId = null;


 /* =====================================================
    TEACHER ELEMENTS
 ===================================================== */

 const teacherForm =
     document.getElementById(
         "teacherForm"
     );

 const teacherList =
     document.getElementById(
         "teacherList"
     );

 const teacherSearch =
     document.getElementById(
         "teacherSearch"
     );

 const teacherListCount =
     document.getElementById(
         "teacherListCount"
     );

 const teacherFormMessage =
     document.getElementById(
         "teacherFormMessage"
     );

 const saveTeacherButton =
     document.getElementById(
         "saveTeacherButton"
     );

 const cancelTeacherButton =
     document.getElementById(
         "cancelTeacherButton"
     );

 const showTeacherFormButton =
     document.getElementById(
         "showTeacherForm"
     );


 /* =====================================================
    TEACHER FIELD HELPER
 ===================================================== */

 function getTeacherValue(id) {

     const field =
         document.getElementById(
             id
         );

     return field
         ? field.value.trim()
         : "";

 }


 /* =====================================================
    TEACHER STATUS
 ===================================================== */

 function normalizeTeacherStatus(
     status
 ) {

     if (
         status ===
         "active"
     ) {

         return "active";

     }


     if (
         status ===
         "disabled"
     ) {

         return "disabled";

     }


     return "pending";

 }


 function getTeacherStatusText(
     status
 ) {

     const normalized =
         normalizeTeacherStatus(
             status
         );


     if (
         normalized ===
         "active"
     ) {

         return "فعال";

     }


     if (
         normalized ===
         "disabled"
     ) {

         return "غیر فعال";

     }


     return "زیرِ منظوری";

 }


 /* =====================================================
    TEACHER DATABASE CONVERSION
 ===================================================== */

 function dbRowToTeacher(
     row
 ) {

     return {

         id:
             row.id,

         teacherCode:
             row.teacher_code || "",

         name:
             row.name || "",

         fatherName:
             row.father_name || "",

         phone:
             row.phone || "",

         cnic:
             row.cnic || "",

         address:
             row.address || "",

         qualification:
             row.qualification || "",

         joiningDate:
             row.joining_date || "",

         status:
             normalizeTeacherStatus(
                 row.status
             ),

         createdAt:
             row.created_at || "",

         updatedAt:
             row.updated_at || ""

     };

 }


 /* =====================================================
    LOAD TEACHERS
 ===================================================== */

 async function loadTeachersFromSupabase() {

     if (
         !checkSupabase()
     ) {

         return teachersCache;

     }


     try {

         const result =
             await supabaseClient
                 .from("Teachers")
                 .select("*")
                 .order(
                     "id",
                     {
                         ascending:
                             false
                     }
                 );


         if (result.error) {

             console.error(
                 "Teacher load error:",
                 result.error
             );

             return teachersCache;

         }


         teachersCache =
             (result.data || [])
                 .map(
                     dbRowToTeacher
                 );


         return teachersCache;


     } catch (error) {

         console.error(
             "Teacher load error:",
             error
         );

         return teachersCache;

     }

 }


 /* =====================================================
    TEACHER VALIDATION
 ===================================================== */

 function validateTeacher() {

     const teacherCode =
         getTeacherValue(
             "teacherCode"
         );

     const name =
         getTeacherValue(
             "teacherName"
         );

     const phone =
         getTeacherValue(
             "teacherPhone"
         );

     const cnic =
         getTeacherValue(
             "teacherCNIC"
         );


     if (!teacherCode) {

         return "براہِ کرم استاد کا کوڈ درج کریں۔";

     }


     if (!name) {

         return "براہِ کرم استاد کا نام درج کریں۔";

     }


     if (
         !isUrduText(
             name
         )
     ) {

         return "استاد کا نام صرف اردو حروف میں درج کریں۔";

     }


     if (
         phone &&
         !/^\d{11}$/.test(
             phone
         )
     ) {

         return "استاد کا موبائل نمبر 11 ہندسوں کا ہونا چاہیے۔";

     }


     if (
         cnic &&
         !/^\d{5}-?\d{7}-?\d$/.test(
             cnic
         )
     ) {

         return "استاد کا شناختی کارڈ نمبر 13 ہندسوں کا ہونا چاہیے۔";

     }


     return "";

 }


 /* =====================================================
    TEACHER FORM DATA
 ===================================================== */

 function getTeacherFormData() {

     return {

         teacher_code:
             getTeacherValue(
                 "teacherCode"
             ),

         name:
             getTeacherValue(
                 "teacherName"
             ),

         father_name:
             getTeacherValue(
                 "teacherFatherName"
             ),

         phone:
             getTeacherValue(
                 "teacherPhone"
             ),

         cnic:
             formatCNIC(
                 getTeacherValue(
                     "teacherCNIC"
                 ).replace(
                     /\D/g,
                     ""
                 )
             ),

         qualification:
             getTeacherValue(
                 "teacherQualification"
             ),

         joining_date:
             getTeacherValue(
                 "teacherJoiningDate"
             ) || null,

         address:
             getTeacherValue(
                 "teacherAddress"
             ),

         status:
             editingTeacherId
                 ? (
                     teachersCache.find(
                         function (teacher) {

                             return String(
                                 teacher.id
                             ) === String(
                                 editingTeacherId
                             );

                         }
                     )?.status ||
                     "pending"
                 )
                 : "pending"

     };

 }


 /* =====================================================
    TEACHER CNIC FORMAT
 ===================================================== */

 const teacherCNIC =
     document.getElementById(
         "teacherCNIC"
     );


 if (teacherCNIC) {

     teacherCNIC.addEventListener(
         "input",
         function () {

             const raw =
                 this.value.replace(
                     /\D/g,
                     ""
                 );


             this.value =
                 formatCNIC(
                     raw
                 );

         }
     );

 }


 /* =====================================================
    SHOW TEACHER FORM
 ===================================================== */

 if (
     showTeacherFormButton
 ) {

     showTeacherFormButton.addEventListener(
         "click",
         function () {

             if (
                 userRole !==
                 "admin"
             ) {

                 showMessage(
                     teacherFormMessage,
                     "صرف ایڈمن استاد شامل کر سکتا ہے۔"
                 );

                 return;

             }


             editingTeacherId =
                 null;


             if (teacherForm) {

                 teacherForm.reset();

                 teacherForm.style.display =
                     "block";

             }


             showMessage(
                 teacherFormMessage,
                 ""
             );

         }
     );

 }


 /* =====================================================
    CANCEL TEACHER FORM
 ===================================================== */

 if (
     cancelTeacherButton
 ) {

     cancelTeacherButton.addEventListener(
         "click",
         function () {

             if (teacherForm) {

                 teacherForm.reset();

                 teacherForm.style.display =
                     "none";

             }


             editingTeacherId =
                 null;


             showMessage(
                 teacherFormMessage,
                 ""
             );

         }
     );

 }


 /* =====================================================
    SAVE TEACHER
 ===================================================== */

 async function saveTeacher() {

     if (
         userRole !==
         "admin"
     ) {

         showMessage(
             teacherFormMessage,
             "صرف ایڈمن استاد محفوظ کر سکتا ہے۔"
         );

         return;

     }


     const validation =
         validateTeacher();


     if (validation) {

         showMessage(
             teacherFormMessage,
             validation
         );

         return;

     }


     if (
         !checkSupabase()
     ) {

         showMessage(
             teacherFormMessage,
             "ڈیٹا بیس دستیاب نہیں۔"
         );

         return;

     }


     const teacherData =
         getTeacherFormData();


     /*
      * کوڈ پہلے سے موجود ہونے کی جانچ
      */

     const duplicateCode =
         teachersCache.find(
             function (teacher) {

                 return (
                     teacher.teacherCode
                         .toLowerCase() ===
                     teacherData.teacher_code
                         .toLowerCase() &&
                     String(
                         teacher.id
                     ) !== String(
                         editingTeacherId
                     )
                 );

             }
         );


     if (duplicateCode) {

         showMessage(
             teacherFormMessage,
             "یہ استاد کا کوڈ پہلے سے موجود ہے۔ براہِ کرم دوسرا کوڈ استعمال کریں۔"
         );

         return;

     }


     /*
      * شناختی کارڈ نمبر پہلے سے موجود ہونے کی جانچ
      */

     if (
         teacherData.cnic
     ) {

         const duplicateCNIC =
             teachersCache.find(
                 function (teacher) {

                     return (
                         teacher.cnic &&
                         teacher.cnic.replace(
                             /\D/g,
                             ""
                         ) ===
                         teacherData.cnic.replace(
                             /\D/g,
                             ""
                         ) &&
                         String(
                             teacher.id
                         ) !== String(
                             editingTeacherId
                         )
                     );

                 }
             );


         if (duplicateCNIC) {

             showMessage(
                 teacherFormMessage,
                 "یہ استاد کا شناختی کارڈ نمبر پہلے سے موجود ہے۔"
             );

             return;

         }

     }


     if (
         saveTeacherButton
     ) {

         saveTeacherButton.disabled =
             true;

     }


     try {

         let result;


         if (
             editingTeacherId
         ) {

             result =
                 await supabaseClient
                     .from("Teachers")
                     .update(
                         teacherData
                     )
                     .eq(
                         "id",
                         editingTeacherId
                     )
                     .select();


         } else {

             result =
                 await supabaseClient
                     .from("Teachers")
                     .insert(
                         [teacherData]
                     )
                     .select();

         }


         if (result.error) {

             console.error(
                 "Teacher save error:",
                 result.error
             );


             showMessage(
                 teacherFormMessage,
                 "استاد محفوظ نہیں ہو سکا۔ " +
                 "خرابی کا کوڈ: " +
                 result.error.code
             );

             return;

         }


         showMessage(
             teacherFormMessage,
             editingTeacherId
                 ? "استاد کی معلومات کامیابی سے تبدیل کر دی گئی ہیں۔"
                 : "استاد کامیابی سے محفوظ کر دیا گیا ہے۔"
         );


         editingTeacherId =
             null;


         if (teacherForm) {

             teacherForm.reset();

             teacherForm.style.display =
                 "none";

         }


         await loadTeachersFromSupabase();


         displayTeachers();


         updateDashboardTeacherCount();


     } catch (error) {

         console.error(
             "Teacher save error:",
             error
         );


         showMessage(
             teacherFormMessage,
             "استاد محفوظ نہیں ہو سکا۔"
         );


     } finally {

         if (
             saveTeacherButton
         ) {

             saveTeacherButton.disabled =
                 false;

         }

     }

 }


 /* =====================================================
    SAVE TEACHER BUTTON
 ===================================================== */

 if (
     saveTeacherButton
 ) {

     saveTeacherButton.addEventListener(
         "click",
         function (event) {

             event.preventDefault();

             saveTeacher();

         }
     );

 }


 if (teacherForm) {

     teacherForm.addEventListener(
         "submit",
         function (event) {

             event.preventDefault();

             saveTeacher();

         }
     );

 }


 /* =====================================================
    DISPLAY TEACHERS
 ===================================================== */

 function displayTeachers(
     searchText = ""
 ) {

     if (!teacherList) {
         return;
     }


     const search =
         String(
             searchText
         )
             .trim()
             .toLowerCase();


     let filteredTeachers =
         teachersCache;


     if (search) {

         filteredTeachers =
             teachersCache.filter(
                 function (teacher) {

                     const text =
                         [
                             teacher.teacherCode,
                             teacher.name,
                             teacher.fatherName,
                             teacher.phone,
                             teacher.cnic,
                             teacher.qualification,
                             teacher.address
                         ]
                             .filter(Boolean)
                             .join(" ")
                             .toLowerCase();


                     return text.includes(
                         search
                     );

                 }
             );

     }


     teacherList.innerHTML =
         "";


     if (
         teacherListCount
     ) {

         teacherListCount.textContent =
             filteredTeachers.length;

     }


     if (
         filteredTeachers.length ===
         0
     ) {

         teacherList.innerHTML =
             `
             <div class="empty-message">
                 ${
                     search
                         ? "تلاش کے مطابق کوئی استاد نہیں ملا۔"
                         : "ابھی کوئی استاد موجود نہیں۔"
                 }
             </div>
             `;

         updateTeacherStats();

         return;

     }


     filteredTeachers.forEach(
         function (teacher) {

             const card =
                 document.createElement(
                     "div"
                 );


             card.className =
                 "teacher-card";


             const status =
                 getTeacherStatusText(
                     teacher.status
                 );


             card.innerHTML =
                 `
                 <div class="teacher-card-info">

                     <h3>
                         ${escapeHTML(
                             teacher.name
                         )}
                     </h3>

                     <p>
                         استاد کا کوڈ:
                         ${escapeHTML(
                             teacher.teacherCode
                         )}
                     </p>

                     <p>
                         حیثیت:
                         ${escapeHTML(
                             status
                         )}
                     </p>

                 </div>


                 <div class="teacher-card-actions">

                     <button
                         type="button"
                         class="view-teacher-button"
                         data-id="${teacher.id}"
                     >
                         👁️ دیکھیں
                     </button>


                     ${
                         userRole ===
                         "admin"
                             ? `
                             <button
                                 type="button"
                                 class="edit-teacher-button"
                                 data-id="${teacher.id}"
                             >
                                 ✏️ ترمیم
                             </button>

                             <button
                                 type="button"
                                 class="delete-teacher-button"
                                 data-id="${teacher.id}"
                             >
                                 🗑️ حذف
                             </button>
                             `
                             : ""
                     }

                 </div>
                 `;


             teacherList.appendChild(
                 card
             );

         }
     );


     attachTeacherCardButtons();


     updateTeacherStats();

 }


 /* =====================================================
    TEACHER SEARCH
 ===================================================== */

 if (
     teacherSearch
 ) {

     teacherSearch.addEventListener(
         "input",
         function () {

             displayTeachers(
                 this.value
             );

         }
     );

 }


 /* =====================================================
    TEACHER STATS
 ===================================================== */

 function updateTeacherStats() {

     const total =
         document.getElementById(
             "teacherTotal"
         );

     const active =
         document.getElementById(
             "activeTeacherTotal"
         );

     const pending =
         document.getElementById(
             "pendingTeacherTotal"
         );


     if (total) {

         total.textContent =
             teachersCache.length;

     }


     if (active) {

         active.textContent =
             teachersCache.filter(
                 function (teacher) {

                     return (
                         normalizeTeacherStatus(
                             teacher.status
                         ) ===
                         "active"
                     );

                 }
             ).length;

     }


     if (pending) {

         pending.textContent =
             teachersCache.filter(
                 function (teacher) {

                     return (
                         normalizeTeacherStatus(
                             teacher.status
                         ) ===
                         "pending"
                     );

                 }
             ).length;

     }

 }


 /* =====================================================
    VIEW TEACHER
 ===================================================== */

 function viewTeacher(
     id
 ) {

     const teacher =
         teachersCache.find(
             function (item) {

                 return String(
                     item.id
                 ) === String(
                     id
                 );

             }
         );


     if (!teacher) {

         alert(
             "استاد کی معلومات نہیں مل سکیں۔"
         );

         return;

     }


     const details =
         `
         <div class="teacher-details">

             <h2>
                 ${escapeHTML(
                     teacher.name
                 )}
             </h2>

             <p>
                 استاد کا کوڈ:
                 ${escapeHTML(
                     teacher.teacherCode
                 )}
             </p>

             <p>
                 والد کا نام:
                 ${escapeHTML(
                     teacher.fatherName
                 )}
             </p>

             <p>
                 موبائل نمبر:
                 ${escapeHTML(
                     teacher.phone
                 )}
             </p>

             <p>
                 شناختی کارڈ نمبر:
                 ${escapeHTML(
                     teacher.cnic
                 )}
             </p>

             <p>
                 تعلیمی قابلیت:
                 ${escapeHTML(
                     teacher.qualification
                 )}
             </p>

             <p>
                 شمولیت کی تاریخ:
                 ${escapeHTML(
                     teacher.joiningDate
                 )}
             </p>

             <p>
                 پتہ:
                 ${escapeHTML(
                     teacher.address
                 )}
             </p>

             <p>
                 حیثیت:
                 ${escapeHTML(
                     getTeacherStatusText(
                         teacher.status
                     )
                 )}
             </p>

         </div>
         `;


     const modal =
         document.createElement(
             "div"
         );


     modal.className =
         "teacher-view-modal";


     modal.innerHTML =
         `
         <div class="teacher-view-box">

             <button
                 type="button"
                 class="close-teacher-modal"
             >
                 ✖️
             </button>

             ${details}

         </div>
         `;


     document.body.appendChild(
         modal
     );


     const closeButton =
         modal.querySelector(
             ".close-teacher-modal"
         );


     if (closeButton) {

         closeButton.addEventListener(
             "click",
             function () {

                 modal.remove();

             }
         );

     }


     modal.addEventListener(
         "click",
         function (event) {

             if (
                 event.target ===
                 modal
             ) {

                 modal.remove();

             }

         }
     );

 }


 /* =====================================================
    EDIT TEACHER
 ===================================================== */

 function editTeacher(
     id
 ) {

     if (
         userRole !==
         "admin"
     ) {

         alert(
             "صرف ایڈمن استاد کی معلومات تبدیل کر سکتا ہے۔"
         );

         return;

     }


     const teacher =
         teachersCache.find(
             function (item) {

                 return String(
                     item.id
                 ) === String(
                     id
                 );

             }
         );


     if (!teacher) {

         alert(
             "استاد کی معلومات نہیں مل سکیں۔"
         );

         return;

     }


     editingTeacherId =
         teacher.id;


     const fields = {

         teacherCode:
             teacher.teacherCode,

         teacherName:
             teacher.name,

         teacherFatherName:
             teacher.fatherName,

         teacherPhone:
             teacher.phone,

         teacherCNIC:
             teacher.cnic,

         teacherQualification:
             teacher.qualification,

         teacherJoiningDate:
             teacher.joiningDate,

         teacherAddress:
             teacher.address

     };


     Object.keys(
         fields
     ).forEach(
         function (id) {

             const field =
                 document.getElementById(
                     id
                 );


             if (field) {

                 field.value =
                     fields[id] || "";

             }

         }
     );


     if (teacherForm) {

         teacherForm.style.display =
             "block";

     }


     showMessage(
         teacherFormMessage,
         "استاد کی معلومات ترمیم کے لیے کھول دی گئی ہیں۔"
     );


     window.scrollTo(
         {
             top: 0,
             behavior: "smooth"
         }
     );

 }


 /* =====================================================
    DELETE TEACHER
 ===================================================== */

 async function deleteTeacher(
     id
 ) {

     if (
         userRole !==
         "admin"
     ) {

         alert(
             "صرف ایڈمن استاد حذف کر سکتا ہے۔"
         );

         return;

     }


     const teacher =
         teachersCache.find(
             function (item) {

                 return String(
                     item.id
                 ) === String(
                     id
                 );

             }
         );


     if (!teacher) {

         alert(
             "استاد کی معلومات نہیں مل سکیں۔"
         );

         return;

     }


     const confirmed =
         window.confirm(
             "کیا آپ واقعی اس استاد کا ریکارڈ حذف کرنا چاہتے ہیں؟"
         );


     if (!confirmed) {
         return;
     }


     if (
         !checkSupabase()
     ) {

         alert(
             "ڈیٹا بیس دستیاب نہیں۔"
         );

         return;

     }


     try {

         const result =
             await supabaseClient
                 .from("Teachers")
                 .delete()
                 .eq(
                     "id",
                     id
                 );


         if (result.error) {

             console.error(
                 "Teacher delete error:",
                 result.error
             );


             alert(
                 "استاد حذف نہیں ہو سکا۔ " +
                 "خرابی کا کوڈ: " +
                 result.error.code
             );

             return;

         }


         alert(
             "استاد کامیابی سے حذف کر دیا گیا ہے۔"
         );


         await loadTeachersFromSupabase();


         displayTeachers();


         updateDashboardTeacherCount();


     } catch (error) {

         console.error(
             "Teacher delete error:",
             error
         );


         alert(
             "استاد حذف نہیں ہو سکا۔"
         );

     }

 }


 /* =====================================================
    TEACHER BUTTON EVENTS
 ===================================================== */

 function attachTeacherCardButtons() {

     const viewButtons =
         document.querySelectorAll(
             ".view-teacher-button"
         );

     const editButtons =
         document.querySelectorAll(
             ".edit-teacher-button"
         );

     const deleteButtons =
         document.querySelectorAll(
             ".delete-teacher-button"
         );


     viewButtons.forEach(
         function (button) {

             button.addEventListener(
                 "click",
                 function () {

                     viewTeacher(
                         this.dataset.id
                     );

                 }
             );

         }
     );


     editButtons.forEach(
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


     deleteButtons.forEach(
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
    TEACHERS PAGE INITIALIZE
 ===================================================== */

 async function initializeTeachersPage() {

     if (
         currentPage !==
         "teachers.html"
     ) {

         return;

     }


     await loadTeachersFromSupabase();


     displayTeachers();


     updateTeacherStats();

 }


 initializeTeachersPage();


 /* =====================================================
    DASHBOARD TEACHER COUNT
 ===================================================== */

 async function updateDashboardTeacherCount() {

     const dashboardTeacherTotal =
         document.getElementById(
             "teacherTotal"
         );


     if (
         !dashboardTeacherTotal
     ) {

         return;

     }


     const teachers =
         await loadTeachersFromSupabase();


     dashboardTeacherTotal.textContent =
         teachers.length;

 }


 /* =====================================================
    DASHBOARD INITIALIZE
 ===================================================== */

 if (
     currentPage ===
     "dashboard.html"
 ) {

     updateDashboardStudentCount();

     updateDashboardTeacherCount();

 }


 /* =====================================================
    FINAL PAGE STATE
 ===================================================== */

 window.addEventListener(
     "beforeunload",
     function () {

         if (
             loggedIn ===
             "true"
         ) {

             saveCurrentDraft();

         }

     }
 );


 /* =====================================================
    SCRIPT COMPLETE
 ===================================================== */

});
  
  
