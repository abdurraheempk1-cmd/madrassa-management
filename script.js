document.addEventListener("DOMContentLoaded", function () {

/* =====================================================
   GLOBAL LOGIN / SESSION
===================================================== */

const INACTIVITY_LIMIT = 5 * 60 * 1000;

let inactivityTimer = null;


function isLoggedIn() {

    return localStorage.getItem("loggedIn") === "true";
}


function autoSaveCurrentWork() {

    const studentForm =
        document.getElementById("studentForm");

    if (!studentForm) {
        return;
    }

    const formData = {};

    studentForm
        .querySelectorAll("input, select, textarea")
        .forEach(function (field) {

            if (!field.id) {
                return;
            }

            if (field.type === "checkbox") {

                formData[field.id] =
                    field.checked;

            } else {

                formData[field.id] =
                    field.value;
            }
        });


    const mahrams = [];

    document
        .querySelectorAll(".mahram-card")
        .forEach(function (card) {

            mahrams.push({

                name:
                    card.querySelector(".mahram-name")?.value || "",

                relation:
                    card.querySelector(".mahram-relation")?.value || "",

                phone:
                    card.querySelector(".mahram-phone")?.value || "",

                cnic:
                    card.querySelector(".mahram-cnic")?.value || "",

                approved:
                    card.querySelector(".mahram-approved")?.checked || false
            });
        });


    formData.mahrams = mahrams;


    const hasData =
        Object.keys(formData).some(function (key) {

            if (key === "mahrams") {
                return formData[key].length > 0;
            }

            return String(formData[key] || "").trim() !== "";
        });


    if (hasData) {

        localStorage.setItem(
            "studentDraft",
            JSON.stringify(formData)
        );
    }
}


function clearStudentDraft() {

    localStorage.removeItem("studentDraft");
}


function autoLogout() {

    autoSaveCurrentWork();

    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userRole");

    alert(
        "⏰ 5 منٹ تک ویب سائٹ استعمال نہ ہونے کی وجہ سے آپ کو خودکار طور پر لاگ آؤٹ کر دیا گیا ہے۔\n\nآپ کا موجودہ کام محفوظ کر دیا گیا ہے۔"
    );

    window.location.href = "index.html";
}


function resetInactivityTimer() {

    if (!isLoggedIn()) {
        return;
    }


    clearTimeout(inactivityTimer);


    inactivityTimer =
        setTimeout(
            autoLogout,
            INACTIVITY_LIMIT
        );
}


if (isLoggedIn()) {

    [
        "click",
        "touchstart",
        "touchmove",
        "mousemove",
        "keydown",
        "scroll",
        "input",
        "change"
    ].forEach(function (eventName) {

        document.addEventListener(
            eventName,
            resetInactivityTimer,
            true
        );
    });


    resetInactivityTimer();
}


/* =====================================================
   HOME PAGE
===================================================== */

const adminButton =
    document.getElementById("adminButton");

const teacherButton =
    document.getElementById("teacherButton");

const studentButton =
    document.getElementById("studentButton");


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


/* =====================================================
   LOGIN
===================================================== */

const loginTitle =
    document.getElementById("loginTitle");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const loginButton =
    document.getElementById("loginButton");

const backButton =
    document.getElementById("backButton");

const message =
    document.getElementById("message");

const rememberInput =
    document.getElementById("remember");


const urlParams =
    new URLSearchParams(
        window.location.search
    );

const role =
    urlParams.get("role");


if (loginTitle && role) {

    if (role === "admin") {

        loginTitle.textContent =
            "👑 ایڈمن لاگ اِن";
    }

    if (role === "teacher") {

        loginTitle.textContent =
            "👩‍🏫 استادہ لاگ اِن";
    }

    if (role === "student") {

        loginTitle.textContent =
            "👧 طالبہ لاگ اِن";
    }
}


/* Remember Me */

if (
    usernameInput &&
    passwordInput &&
    role
) {

    const savedRemember =
        localStorage.getItem(
            "rememberMe"
        );

    const savedRole =
        localStorage.getItem(
            "rememberRole"
        );


    if (
        savedRemember === "true" &&
        savedRole === role
    ) {

        usernameInput.value =
            localStorage.getItem(
                "savedUsername"
            ) || "";


        passwordInput.value =
            localStorage.getItem(
                "savedPassword"
            ) || "";


        if (rememberInput) {

            rememberInput.checked =
                true;
        }
    }
}


/* Password Eye */

if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        function () {

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


/* Login */

if (
    loginButton &&
    usernameInput &&
    passwordInput
) {

    loginButton.addEventListener(
        "click",
        function () {

            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value.trim();


            let correctUsername = "";
            let correctPassword = "";


            if (role === "admin") {

                correctUsername =
                    "admin";

                correctPassword =
                    "admin123";
            }


            if (role === "teacher") {

                correctUsername =
                    "teacher";

                correctPassword =
                    "teacher123";
            }


            if (role === "student") {

                correctUsername =
                    "student";

                correctPassword =
                    "student123";
            }


            if (
                username === correctUsername &&
                password === correctPassword
            ) {

                localStorage.setItem(
                    "loggedIn",
                    "true"
                );

                localStorage.setItem(
                    "userRole",
                    role
                );


                if (
                    rememberInput &&
                    rememberInput.checked
                ) {

                    localStorage.setItem(
                        "rememberMe",
                        "true"
                    );

                    localStorage.setItem(
                        "rememberRole",
                        role
                    );

                    localStorage.setItem(
                        "savedUsername",
                        username
                    );

                    localStorage.setItem(
                        "savedPassword",
                        password
                    );

                } else {

                    localStorage.removeItem(
                        "rememberMe"
                    );

                    localStorage.removeItem(
                        "rememberRole"
                    );

                    localStorage.removeItem(
                        "savedUsername"
                    );

                    localStorage.removeItem(
                        "savedPassword"
                    );
                }


                window.location.href =
                    "dashboard.html";

            } else {

                if (message) {

                    message.textContent =
                        "❌ صارف نام یا پاس ورڈ غلط ہے۔";
                }
            }
        }
    );
}


/* Back */

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
   PAGE PROTECTION
===================================================== */

const currentPage =
    window.location.pathname;


if (
    (
        currentPage.includes("dashboard.html") ||
        currentPage.includes("students.html")
    ) &&
    !isLoggedIn()
) {

    window.location.href =
        "index.html";

    return;
}


/* =====================================================
   DASHBOARD
===================================================== */

const dashboardTitle =
    document.getElementById(
        "dashboardTitle"
    );


const userRole =
    localStorage.getItem(
        "userRole"
    );


if (dashboardTitle) {

    if (userRole === "admin") {

        dashboardTitle.textContent =
            "👑 ایڈمن ڈیش بورڈ";
    }

    if (userRole === "teacher") {

        dashboardTitle.textContent =
            "👩‍🏫 استادہ ڈیش بورڈ";
    }

    if (userRole === "student") {

        dashboardTitle.textContent =
            "👧 طالبہ ڈیش بورڈ";
    }
}


function getStudents() {

    const data =
        localStorage.getItem("students");


    if (!data) {
        return [];
    }


    try {

        const parsed =
            JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        return [];
    }
}


function saveStudents(students) {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}


function updateDashboardStudentCount() {

    const studentTotal =
        document.getElementById(
            "studentTotal"
        );


    if (studentTotal) {

        studentTotal.textContent =
            getStudents().length;
    }
}


if (
    currentPage.includes(
        "dashboard.html"
    )
) {

    updateDashboardStudentCount();
}


/* Logout */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            clearTimeout(
                inactivityTimer
            );


            localStorage.removeItem(
                "loggedIn"
            );

            localStorage.removeItem(
                "userRole"
            );


            window.location.href =
                "index.html";
        }
    );
}


/* Dashboard Menu */

const menuCards =
    document.querySelectorAll(
        ".menu-card"
    );


menuCards.forEach(function (card) {

    card.addEventListener(
        "click",
        function () {

            const page =
                card.getAttribute(
                    "data-page"
                );


            if (page === "students") {

                window.location.href =
                    "students.html";

            } else {

                alert(
                    "یہ نظام اگلے مرحلے میں تیار کیا جائے گا۔"
                );
            }
        }
    );
});


/* =====================================================
   STUDENTS PAGE
===================================================== */

const studentForm =
    document.getElementById(
        "studentForm"
    );


const studentsList =
    document.getElementById(
        "studentsList"
    );


if (
    !studentForm ||
    !studentsList
) {

    return;
}


const studentFormContainer =
    document.getElementById(
        "studentFormContainer"
    );

const showStudentForm =
    document.getElementById(
        "showStudentForm"
    );

const cancelStudentForm =
    document.getElementById(
        "cancelStudentForm"
    );

const formTitle =
    document.getElementById(
        "formTitle"
    );

const editStudentId =
    document.getElementById(
        "editStudentId"
    );

const admissionType =
    document.getElementById(
        "admissionType"
    );

const admissionNo =
    document.getElementById(
        "admissionNo"
    );

const previousMadrassa =
    document.getElementById(
        "previousMadrassa"
    );

const transferDate =
    document.getElementById(
        "transferDate"
    );

const studentName =
    document.getElementById(
        "studentName"
    );

const fatherName =
    document.getElementById(
        "fatherName"
    );

const guardianName =
    document.getElementById(
        "guardianName"
    );

const studentCNIC =
    document.getElementById(
        "studentCNIC"
    );

const dateOfBirth =
    document.getElementById(
        "dateOfBirth"
    );

const studentClass =
    document.getElementById(
        "studentClass"
    );

const phone =
    document.getElementById(
        "phone"
    );

const admissionDate =
    document.getElementById(
        "admissionDate"
    );

const address =
    document.getElementById(
        "address"
    );

const residenceType =
    document.getElementById(
        "residenceType"
    );

const mahramSection =
    document.getElementById(
        "mahramSection"
    );

const mahramList =
    document.getElementById(
        "mahramList"
    );

const addMahram =
    document.getElementById(
        "addMahram"
    );

const studentSearch =
    document.getElementById(
        "studentSearch"
    );

const studentCount =
    document.getElementById(
        "studentCount"
    );

const backToDashboard =
    document.getElementById(
        "backToDashboard"
    );


/* =====================================================
   HELPERS
===================================================== */

function onlyDigits(value) {

    return String(value || "")
        .replace(/\D/g, "");
}


function formatCNIC(value) {

    const digits =
        onlyDigits(value)
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
        digits.slice(12)
    );
}


function isValidCNIC(value) {

    return (
        onlyDigits(value).length === 13
    );
}


function isValidPhone(value) {

    return (
        onlyDigits(value).length === 11
    );
}


const urduNamePattern =
    /^[\u0600-\u06FF\s\u200C\u200D]+$/;


function isValidUrduName(value) {

    const name =
        String(value || "").trim();


    if (!name) {
        return false;
    }


    return urduNamePattern.test(name);
}


function validateName(
    input,
    label
) {

    if (!input) {
        return true;
    }


    const value =
        input.value.trim();


    if (!value) {
        return true;
    }


    if (!isValidUrduName(value)) {

        alert(
            "⚠️ " +
            label +
            " صرف اردو حروف میں لکھیں۔"
        );

        input.focus();

        return false;
    }


    return true;
}


function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =====================================================
   INPUT FORMATTING
===================================================== */

if (phone) {

    phone.addEventListener(
        "input",
        function () {

            this.value =
                onlyDigits(
                    this.value
                ).slice(0, 11);
        }
    );
}


if (studentCNIC) {

    studentCNIC.addEventListener(
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
   TRANSFER FIELDS FIX
===================================================== */

function updateTransferFields() {

    const fields =
        document.querySelectorAll(
            ".transfer-fields"
        );


    const isTransfer =
        admissionType &&
        admissionType.value ===
        "transfer";


    fields.forEach(function (field) {

        if (isTransfer) {

            field.classList.remove(
                "hidden"
            );

        } else {

            field.classList.add(
                "hidden"
            );
        }
    });


    if (!isTransfer) {

        if (previousMadrassa) {
            previousMadrassa.value = "";
        }

        if (transferDate) {
            transferDate.value = "";
        }
    }
}


if (admissionType) {

    admissionType.addEventListener(
        "change",
        updateTransferFields
    );


    updateTransferFields();
}


/* =====================================================
   RESIDENCE
===================================================== */

function updateResidence() {

    if (
        residenceType &&
        residenceType.value ===
        "hostel"
    ) {

        mahramSection.classList.remove(
            "hidden"
        );

    } else {

        mahramSection.classList.add(
            "hidden"
        );

        mahramList.innerHTML = "";
    }
}


if (residenceType) {

    residenceType.addEventListener(
        "change",
        updateResidence
    );
}


/* =====================================================
   MAHRAMS
===================================================== */

const mahramRelations = [

    "والد",
    "دادا",
    "نانا",
    "سگا بھائی",
    "باپ شریک بھائی",
    "ماں شریک بھائی",
    "بیٹا",
    "پوتا",
    "نواسہ",
    "چچا",
    "تایا",
    "ماموں",
    "بھتیجا",
    "بھانجا"
];


function createMahram(data = {}) {

    const current =
        mahramList.querySelectorAll(
            ".mahram-card"
        ).length;


    if (current >= 5) {

        alert(
            "⚠️ زیادہ سے زیادہ 5 محرم درج کیے جا سکتے ہیں۔"
        );

        return;
    }


    const card =
        document.createElement("div");


    card.className =
        "mahram-card";


    let relationOptions =
        `<option value="">رشتہ منتخب کریں</option>`;


    mahramRelations.forEach(
        function (relation) {

            relationOptions +=
                `<option value="${escapeHTML(relation)}"
                ${data.relation === relation ? "selected" : ""}>
                ${escapeHTML(relation)}
                </option>`;
        }
    );


    card.innerHTML = `

        <div class="mahram-header">

            <strong>
                👤 محرم نمبر ${current + 1}
            </strong>

            <button
                type="button"
                class="remove-mahram"
            >
                ❌
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
                    placeholder="پورا نام"
                    value="${escapeHTML(data.name)}"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    رشتہ
                </label>

                <select
                    class="mahram-relation"
                    required
                >
                    ${relationOptions}
                </select>

            </div>

            <div class="form-group">

                <label>
                    موبائل نمبر
                </label>

                <input
                    type="tel"
                    class="mahram-phone"
                    placeholder="03XXXXXXXXX"
                    maxlength="11"
                    inputmode="numeric"
                    value="${escapeHTML(data.phone)}"
                    required
                >

            </div>

            <div class="form-group">

                <label>
                    CNIC نمبر
                </label>

                <input
                    type="text"
                    class="mahram-cnic"
                    placeholder="XXXXX-XXXXXXX-X"
                    maxlength="15"
                    inputmode="numeric"
                    value="${escapeHTML(formatCNIC(data.cnic))}"
                    required
                >

            </div>

        </div>

        <div class="mahram-confirm">

            <label>

                <input
                    type="checkbox"
                    class="mahram-approved"
                    ${data.approved ? "checked" : ""}
                >

                میں تصدیق کرتا/کرتی ہوں کہ یہ شخص
                طالبہ کا شرعی محرم ہے۔

            </label>

        </div>
    `;


    mahramList.appendChild(card);


    const mahramPhone =
        card.querySelector(
            ".mahram-phone"
        );


    mahramPhone.addEventListener(
        "input",
        function () {

            this.value =
                onlyDigits(
                    this.value
                ).slice(0, 11);
        }
    );


    const mahramCNIC =
        card.querySelector(
            ".mahram-cnic"
        );


    mahramCNIC.addEventListener(
        "input",
        function () {

            this.value =
                formatCNIC(
                    this.value
                );
        }
    );


    card.querySelector(
        ".remove-mahram"
    ).addEventListener(
        "click",
        function () {

            card.remove();

            refreshMahramNumbers();
        }
    );
}


function refreshMahramNumbers() {

    mahramList
        .querySelectorAll(
            ".mahram-card"
        )
        .forEach(
            function (card, index) {

                const title =
                    card.querySelector(
                        "strong"
                    );


                if (title) {

                    title.textContent =
                        "👤 محرم نمبر " +
                        (index + 1);
                }
            }
        );
}


if (addMahram) {

    addMahram.addEventListener(
        "click",
        function () {

            createMahram();
        }
    );
}


function getMahramData() {

    const mahrams = [];


    mahramList
        .querySelectorAll(
            ".mahram-card"
        )
        .forEach(
            function (card) {

                mahrams.push({

                    name:
                        card.querySelector(
                            ".mahram-name"
                        ).value.trim(),

                    relation:
                        card.querySelector(
                            ".mahram-relation"
                        ).value,

                    phone:
                        card.querySelector(
                            ".mahram-phone"
                        ).value.trim(),

                    cnic:
                        card.querySelector(
                            ".mahram-cnic"
                        ).value.trim(),

                    approved:
                        card.querySelector(
                            ".mahram-approved"
                        ).checked
                });
            }
        );


    return mahrams;
}


/* =====================================================
   DRAFT RESTORE
===================================================== */

function restoreStudentDraft() {

    const draft =
        localStorage.getItem(
            "studentDraft"
        );


    if (!draft) {
        return;
    }


    try {

        const data =
            JSON.parse(draft);


        Object.keys(data).forEach(
            function (key) {

                if (
                    key === "mahrams"
                ) {
                    return;
                }


                const field =
                    document.getElementById(
                        key
                    );


                if (!field) {
                    return;
                }


                if (
                    field.type ===
                    "checkbox"
                ) {

                    field.checked =
                        Boolean(
                            data[key]
                        );

                } else {

                    field.value =
                        data[key] || "";
                }
            }
        );


        updateTransferFields();
        updateResidence();


        if (
            Array.isArray(
                data.mahrams
            ) &&
            data.mahrams.length > 0
        ) {

            mahramList.innerHTML = "";


            data.mahrams.forEach(
                function (mahram) {

                    createMahram(
                        mahram
                    );
                }
            );
        }


        const hasDraftData =
            Object.keys(data).some(
                function (key) {

                    if (
                        key === "mahrams"
                    ) {

                        return (
                            data.mahrams &&
                            data.mahrams.length
                        );
                    }

                    return String(
                        data[key] || ""
                    ).trim() !== "";
                }
            );


        if (hasDraftData) {

            studentFormContainer.classList.remove(
                "hidden"
            );


            formTitle.textContent =
                "📝 محفوظ شدہ کام جاری رکھیں";


            const continueDraft =
                confirm(
                    "آپ کا پچھلا نامکمل کام محفوظ ہے۔ کیا آپ اسے جاری رکھنا چاہتے ہیں؟"
                );


            if (!continueDraft) {

                clearStudentDraft();

                resetStudentForm();
            }
        }

    } catch (error) {

        clearStudentDraft();
    }
}


/* =====================================================
   RESET FORM
===================================================== */

function resetStudentForm() {

    studentForm.reset();


    editStudentId.value = "";


    mahramList.innerHTML = "";


    mahramSection.classList.add(
        "hidden"
    );


    formTitle.textContent =
        "➕ نئی طالبہ شامل کریں";


    updateTransferFields();
}


/* =====================================================
   SHOW FORM
===================================================== */

if (showStudentForm) {

    showStudentForm.addEventListener(
        "click",
        function () {

            resetStudentForm();

            studentFormContainer.classList.remove(
                "hidden"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}


/* =====================================================
   CANCEL
===================================================== */

if (cancelStudentForm) {

    cancelStudentForm.addEventListener(
        "click",
        function () {

            resetStudentForm();

            clearStudentDraft();

            studentFormContainer.classList.add(
                "hidden"
            );
        }
    );
}


/* =====================================================
   SAVE STUDENT
===================================================== */

studentForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (!studentForm.checkValidity()) {

            studentForm.reportValidity();

            return;
        }


        if (
            !validateName(
                studentName,
                "طالبہ کا نام"
            )
        ) {
            return;
        }


        if (
            !validateName(
                fatherName,
                "والد کا نام"
            )
        ) {
            return;
        }


        if (
            !validateName(
                guardianName,
                "سرپرست کا نام"
            )
        ) {
            return;
        }


        /* Student CNIC */

        if (
            studentCNIC &&
            studentCNIC.value.trim()
        ) {

            if (
                !isValidCNIC(
                    studentCNIC.value
                )
            ) {

                alert(
                    "⚠️ طالبہ کا CNIC لازماً 13 digits کا ہونا چاہیے۔"
                );

                studentCNIC.focus();

                return;
            }
        }


        /* Phone */

        const studentPhone =
            onlyDigits(
                phone.value
            );


        if (!isValidPhone(studentPhone)) {

            alert(
                "⚠️ رابطہ نمبر لازماً 11 digits کا ہونا چاہیے۔"
            );

            phone.focus();

            return;
        }


        phone.value =
            studentPhone;


        /* Transfer */

        if (
            admissionType.value ===
            "transfer"
        ) {

            if (
                !previousMadrassa.value.trim()
            ) {

                alert(
                    "⚠️ سابقہ مدرسہ کا نام درج کریں۔"
                );

                previousMadrassa.focus();

                return;
            }


            if (!transferDate.value) {

                alert(
                    "⚠️ منتقلی کی تاریخ درج کریں۔"
                );

                transferDate.focus();

                return;
            }
        }


        const students =
            getStudents();


        /* Duplicate admission */

        const duplicateAdmission =
            students.some(
                function (student) {

                    return (

                        String(
                            student.admissionNo
                        )
                        .trim()
                        .toLowerCase() ===

                        admissionNo.value
                            .trim()
                            .toLowerCase()

                        &&

                        String(
                            student.id
                        ) !==
                        String(
                            editStudentId.value
                        )
                    );
                }
            );


        if (duplicateAdmission) {

            alert(
                "⚠️ یہ داخلہ نمبر پہلے سے موجود ہے۔"
            );

            admissionNo.focus();

            return;
        }


        /* Duplicate CNIC */

        if (
            studentCNIC &&
            studentCNIC.value.trim()
        ) {

            const duplicateCNIC =
                students.some(
                    function (student) {

                        return (

                            onlyDigits(
                                student.studentCNIC
                            ) ===
                            onlyDigits(
                                studentCNIC.value
                            )

                            &&

                            String(
                                student.id
                            ) !==
                            String(
                                editStudentId.value
                            )
                        );
                    }
                );


            if (duplicateCNIC) {

                alert(
                    "⚠️ یہ CNIC پہلے سے موجود ہے۔"
                );

                studentCNIC.focus();

                return;
            }
        }


        /* Mahram */

        let mahrams = [];


        if (
            residenceType.value ===
            "hostel"
        ) {

            mahrams =
                getMahramData();


            if (
                mahrams.length === 0
            ) {

                alert(
                    "⚠️ ہاسٹل کی طالبہ کے لیے کم از کم ایک محرم درج کریں۔"
                );

                return;
            }


            for (
                let i = 0;
                i < mahrams.length;
                i++
            ) {

                if (
                    !isValidUrduName(
                        mahrams[i].name
                    )
                ) {

                    alert(
                        "⚠️ محرم نمبر " +
                        (i + 1) +
                        " کا نام صرف اردو حروف میں لکھیں۔"
                    );

                    return;
                }


                if (
                    !isValidPhone(
                        mahrams[i].phone
                    )
                ) {

                    alert(
                        "⚠️ محرم نمبر " +
                        (i + 1) +
                        " کا موبائل نمبر 11 digits کا ہونا چاہیے۔"
                    );

                    return;
                }


                if (
                    !isValidCNIC(
                        mahrams[i].cnic
                    )
                ) {

                    alert(
                        "⚠️ محرم نمبر " +
                        (i + 1) +
                        " کا CNIC 13 digits کا ہونا چاہیے۔"
                    );

                    return;
                }


                if (
                    !mahrams[i].approved
                ) {

                    alert(
                        "⚠️ ہر محرم کے لیے تصدیق ضروری ہے۔"
                    );

                    return;
                }
            }
        }


        const studentData = {

            admissionType:
                admissionType.value,

            admissionNo:
                admissionNo.value.trim(),

            previousMadrassa:
                admissionType.value ===
                "transfer"
                ? previousMadrassa.value.trim()
                : "",

            transferDate:
                admissionType.value ===
                "transfer"
                ? transferDate.value
                : "",

            name:
                studentName.value.trim(),

            fatherName:
                fatherName.value.trim(),

            guardianName:
                guardianName.value.trim(),

            studentCNIC:
                studentCNIC
                ? studentCNIC.value.trim()
                : "",

            dateOfBirth:
                dateOfBirth.value,

            studentClass:
                studentClass.value.trim(),

            phone:
                phone.value.trim(),

            admissionDate:
                admissionDate.value,

            address:
                address.value.trim(),

            residenceType:
                residenceType.value,

            mahrams:
                mahrams
        };


        if (editStudentId.value) {

            const index =
                students.findIndex(
                    function (student) {

                        return (
                            String(
                                student.id
                            ) ===
                            String(
                                editStudentId.value
                            )
                        );
                    }
                );


            if (index !== -1) {

                students[index] = {

                    ...students[index],

                    ...studentData
                };


                saveStudents(
                    students
                );


                alert(
                    "✅ طالبہ کی معلومات کامیابی سے تبدیل ہو گئی ہیں۔"
                );
            }

        } else {

            studentData.id =
                Date.now();


            students.push(
                studentData
            );


            saveStudents(
                students
            );


            alert(
                "✅ نئی طالبہ کامیابی سے محفوظ ہو گئی۔"
            );
        }


        clearStudentDraft();


        resetStudentForm();


        studentFormContainer.classList.add(
            "hidden"
        );


        displayStudents();
    }
);


/* =====================================================
   DISPLAY STUDENTS
===================================================== */

function displayStudents() {

    const students =
        getStudents();


    if (studentCount) {

        studentCount.textContent =
            students.length;
    }


    const searchText =
        studentSearch
        ? studentSearch.value
            .trim()
            .toLowerCase()
        : "";


    const filtered =
        students.filter(
            function (student) {

                const name =
                    String(
                        student.name || ""
                    ).toLowerCase();


                const admission =
                    String(
                        student.admissionNo || ""
                    ).toLowerCase();


                const phoneNumber =
                    String(
                        student.phone || ""
                    ).toLowerCase();


                return (
                    name.includes(
                        searchText
                    ) ||

                    admission.includes(
                        searchText
                    ) ||

                    phoneNumber.includes(
                        searchText
                    )
                );
            }
        );


    if (filtered.length === 0) {

        studentsList.innerHTML = `

            <div class="empty-students">

                <div class="empty-icon">
                    👧
                </div>

                <h3>
                    ${
                        students.length === 0
                        ? "ابھی کوئی طالبہ شامل نہیں"
                        : "کوئی طالبہ نہیں ملی"
                    }
                </h3>

                <p>
                    ${
                        students.length === 0
                        ? "نئی طالبہ شامل کرنے کے لیے اوپر والے بٹن پر کلک کریں۔"
                        : "نام، فون یا داخلہ نمبر دوبارہ چیک کریں۔"
                    }
                </p>

            </div>
        `;

        return;
    }


    studentsList.innerHTML =
        filtered
        .map(
            function (student) {

                const admission =
                    student.admissionType ===
                    "transfer"
                    ? "🔄 منتقل شدہ"
                    : "🆕 نیا داخلہ";


                const residence =
                    student.residenceType ===
                    "hostel"
                    ? "🛏️ ہاسٹل"
                    : "🏠 گھر";


                return `

                    <div class="student-card">

                        <div class="student-card-header">

                            <div class="student-avatar">
                                👧
                            </div>

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        student.name
                                    )}
                                </h3>

                                <span>
                                    داخلہ نمبر:
                                    ${escapeHTML(
                                        student.admissionNo
                                    )}
                                </span>

                            </div>

                        </div>

                        <div class="student-badges">

                            <span>
                                ${admission}
                            </span>

                            <span>
                                ${residence}
                            </span>

                        </div>

                        <div class="student-info">

                            <p>

                                <strong>
                                    👨 والد:
                                </strong>

                                ${
                                    escapeHTML(
                                        student.fatherName
                                    ) ||
                                    "درج نہیں"
                                }

                            </p>

                            <p>

                                <strong>
                                    🎓 کلاس:
                                </strong>

                                ${
                                    escapeHTML(
                                        student.studentClass
                                    ) ||
                                    "درج نہیں"
                                }

                            </p>

                            <p>

                                <strong>
                                    📞 رابطہ:
                                </strong>

                                ${
                                    escapeHTML(
                                        student.phone
                                    ) ||
                                    "درج نہیں"
                                }

                            </p>

                        </div>

                        <div class="student-card-buttons">

                            <button
                                type="button"
                                class="view-student"
                                data-id="${student.id}"
                            >
                                👁️ دیکھیں
                            </button>

                            <button
                                type="button"
                                class="edit-student"
                                data-id="${student.id}"
                            >
                                ✏️ ترمیم
                            </button>

                            <button
                                type="button"
                                class="delete-student"
                                data-id="${student.id}"
                            >
                                🗑️ حذف
                            </button>

                        </div>

                    </div>
                `;
            }
        )
        .join("");


    document
        .querySelectorAll(
            ".view-student"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        viewStudent(
                            Number(
                                button.dataset.id
                            )
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
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editStudent(
                            Number(
                                button.dataset.id
                            )
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
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteStudent(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );
}


/* =====================================================
   EDIT
===================================================== */

function editStudent(id) {

    const student =
        getStudents().find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );
            }
        );


    if (!student) {
        return;
    }


    editStudentId.value =
        student.id;


    admissionType.value =
        student.admissionType || "";


    admissionNo.value =
        student.admissionNo || "";


    previousMadrassa.value =
        student.previousMadrassa || "";


    transferDate.value =
        student.transferDate || "";


    studentName.value =
        student.name || "";


    fatherName.value =
        student.fatherName || "";


    guardianName.value =
        student.guardianName || "";


    if (studentCNIC) {

        studentCNIC.value =
            formatCNIC(
                student.studentCNIC || ""
            );
    }


    dateOfBirth.value =
        student.dateOfBirth || "";


    studentClass.value =
        student.studentClass || "";


    phone.value =
        onlyDigits(
            student.phone || ""
        ).slice(0, 11);


    admissionDate.value =
        student.admissionDate || "";


    address.value =
        student.address || "";


    residenceType.value =
        student.residenceType || "";


    updateTransferFields();


    updateResidence();


    mahramList.innerHTML = "";


    if (
        student.residenceType ===
        "hostel" &&
        Array.isArray(
            student.mahrams
        )
    ) {

        student.mahrams.forEach(
            function (mahram) {

                createMahram(
                    mahram
                );
            }
        );
    }


    formTitle.textContent =
        "✏️ طالبہ کی معلومات میں ترمیم";


    studentFormContainer.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"
    });
}


/* =====================================================
   VIEW
===================================================== */

function viewStudent(id) {

    const student =
        getStudents().find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );
            }
        );


    if (!student) {
        return;
    }


    let text =

        "👧 طالبہ کی مکمل معلومات\n\n" +

        "داخلہ نمبر: " +
        (
            student.admissionNo ||
            "درج نہیں"
        ) +

        "\nداخلہ کی قسم: " +

        (
            student.admissionType ===
            "transfer"
            ? "دوسرے مدرسہ سے منتقل شدہ"
            : "نیا داخلہ"
        ) +

        "\nنام: " +
        (
            student.name ||
            "درج نہیں"
        ) +

        "\nوالد کا نام: " +
        (
            student.fatherName ||
            "درج نہیں"
        ) +

        "\nسرپرست: " +
        (
            student.guardianName ||
            "درج نہیں"
        ) +

        "\nCNIC: " +
        (
            student.studentCNIC ||
            "درج نہیں"
        ) +

        "\nتاریخ پیدائش: " +
        (
            student.dateOfBirth ||
            "درج نہیں"
        ) +

        "\nکلاس: " +
        (
            student.studentClass ||
            "درج نہیں"
        ) +

        "\nرابطہ: " +
        (
            student.phone ||
            "درج نہیں"
        ) +

        "\nداخلہ تاریخ: " +
        (
            student.admissionDate ||
            "درج نہیں"
        ) +

        "\nرہائش: " +

        (
            student.residenceType ===
            "hostel"
            ? "مدرسہ ہاسٹل"
            : "گھر"
        ) +

        "\nپتہ: " +

        (
            student.address ||
            "درج نہیں"
        );


    if (
        student.admissionType ===
        "transfer"
    ) {

        text +=

            "\n\n🏫 سابقہ مدرسہ: " +

            (
                student.previousMadrassa ||
                "درج نہیں"
            ) +

            "\nمنتقلی کی تاریخ: " +

            (
                student.transferDate ||
                "درج نہیں"
            );
    }


    if (
        student.residenceType ===
        "hostel" &&
        Array.isArray(
            student.mahrams
        ) &&
        student.mahrams.length
    ) {

        text +=
            "\n\n🔐 مجاز شرعی محرم:";


        student.mahrams.forEach(
            function (
                mahram,
                index
            ) {

                text +=

                    "\n\n" +
                    (index + 1) +
                    ". " +
                    (
                        mahram.name ||
                        ""
                    ) +

                    "\nرشتہ: " +
                    (
                        mahram.relation ||
                        ""
                    ) +

                    "\nفون: " +
                    (
                        mahram.phone ||
                        ""
                    ) +

                    "\nCNIC: " +
                    (
                        mahram.cnic ||
                        ""
                    ) +

                    "\nتصدیق: " +

                    (
                        mahram.approved
                        ? "تصدیق شدہ"
                        : "غیر تصدیق شدہ"
                    );
            }
        );
    }


    alert(text);
}


/* =====================================================
   DELETE
===================================================== */

function deleteStudent(id) {

    const students =
        getStudents();


    const student =
        students.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );
            }
        );


    if (!student) {
        return;
    }


    const confirmed =
        confirm(
            "کیا آپ واقعی " +
            student.name +
            " کا ریکارڈ حذف کرنا چاہتے ہیں؟"
        );


    if (!confirmed) {
        return;
    }


    const remaining =
        students.filter(
            function (item) {

                return (
                    Number(item.id) !==
                    Number(id)
                );
            }
        );


    saveStudents(
        remaining
    );


    displayStudents();


    alert(
        "✅ طالبہ کا ریکارڈ حذف کر دیا گیا ہے۔"
    );
}


/* =====================================================
   SEARCH
===================================================== */

if (studentSearch) {

    studentSearch.addEventListener(
        "input",
        displayStudents
    );
}


/* =====================================================
   BACK
===================================================== */

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
   START
===================================================== */

displayStudents();

restoreStudentDraft();

});