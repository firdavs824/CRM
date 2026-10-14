// ===================================================================
// EduPrime PRO CRM — Asosiy Dastur Mantiqi (App Logic)
// IERARXIK TUZILMA: SINFLAR VA TO'GARAKLAR BO'YICHA DAVOMAT VA TO'LOVLAR
// ===================================================================

const SCHOOL_CLASSES = [
  { id: "CLS-1A", name: "1-A sinf", studentsCount: 24, monthlyFee: 3200000, teacher: "Feruza Rahimova", room: "102-xona", debtCount: 1, attendanceRate: "96%" },
  { id: "CLS-5B", name: "5-B sinf", studentsCount: 22, monthlyFee: 3500000, teacher: "Akmal Saidov", room: "204-xona", debtCount: 0, attendanceRate: "91%" },
  { id: "CLS-8A", name: "8-A sinf", studentsCount: 20, monthlyFee: 3500000, teacher: "Javohir Rustamov", room: "304-xona", debtCount: 2, attendanceRate: "95%" },
  { id: "CLS-9A", name: "9-A sinf", studentsCount: 21, monthlyFee: 3800000, teacher: "Madina Karimova", room: "201-xona", debtCount: 1, attendanceRate: "100%" },
  { id: "CLS-10A", name: "10-A sinf", studentsCount: 18, monthlyFee: 4000000, teacher: "Sardorbek Ergashev", room: "402-xona", debtCount: 0, attendanceRate: "89%" },
  { id: "CLS-11A", name: "11-A sinf", studentsCount: 16, monthlyFee: 4200000, teacher: "Dilnoza Olimova", room: "405-xona", debtCount: 1, attendanceRate: "94%" }
];

const TUTOR_COURSES = [
  {
    id: "TUT-1",
    name: "Matematika",
    groupName: "Math-Prezident-1",
    days: "Dush / Chor / Juma",
    time: "14:30 - 16:00",
    monthlyFee: 850000,
    teacher: "Javohir Rustamov",
    studentsCount: 12,
    debtCount: 1
  },
  {
    id: "TUT-2",
    name: "Ingliz tili (IELTS)",
    groupName: "IELTS-Target-7.5",
    days: "Sesh / Pay / Shan",
    time: "15:00 - 16:30",
    monthlyFee: 1100000,
    teacher: "Madina Karimova",
    studentsCount: 8,
    debtCount: 0
  },
  {
    id: "TUT-3",
    name: "Fizika",
    groupName: "Fizika-DTM-Max",
    days: "Dush / Chor / Juma",
    time: "16:00 - 17:30",
    monthlyFee: 800000,
    teacher: "Sardorbek Ergashev",
    studentsCount: 10,
    debtCount: 1
  },
  {
    id: "TUT-4",
    name: "Kimyo & Biologiya",
    groupName: "Med-Start-2026",
    days: "Sesh / Pay / Shan",
    time: "14:30 - 16:30",
    monthlyFee: 900000,
    teacher: "Dilnoza Olimova",
    studentsCount: 9,
    debtCount: 0
  },
  {
    id: "TUT-5",
    name: "IT & Python",
    groupName: "Python-Junior-Pro",
    days: "Dush / Chor / Juma",
    time: "17:00 - 18:30",
    monthlyFee: 950000,
    teacher: "Bobur Mirzayev",
    studentsCount: 14,
    debtCount: 2
  },
  {
    id: "TUT-6",
    name: "Mental arifmetika",
    groupName: "Mental-Kids-Start",
    days: "Sesh / Pay",
    time: "14:00 - 15:30",
    monthlyFee: 600000,
    teacher: "Nigora Vohidova",
    studentsCount: 15,
    debtCount: 0
  }
];

let state = {
  data: null,
  currentView: "bosh-panel",
  financeMode: "school", // 'school' yoki 'tutor'
  activeAttendanceClass: null,
  attendanceRecords: {}
};

// Dastur boshlanishi
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  state.data = loadCRMData();

  const savedTheme = localStorage.getItem("EDUPRIME_THEME") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  setupNavigationEvents();
  renderAll();

  // 3D Tilt va Ripple effeklarini faollashtirish
  initAmbientCanvas();
  initLiveClock();
  init3DTiltEffects();
  initCountUpEffects();
  initRippleEffects();

  // Boshqaruv panelidan boshlash
  switchView("bosh-panel");
}

function renderAll() {
  renderDashboard();
  renderReportsView();
  renderFinanceView();
  renderStudentsTable();
  renderGroupsView();
  renderAttendanceView();
  populatePaymentStudentSelect();
}

// ===================================================================
// Navigatsiya va Switch View
// ===================================================================
function setupNavigationEvents() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileSidebar();
      closeAllActiveModals();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMobileSidebar();
    }
  });
}

function switchView(viewId) {
  state.currentView = viewId;
  closeMobileSidebar();

  // Sidebar itemlarni yangilash
  document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("data-view") === viewId) {
      item.classList.add("active");
    }
  });

  // Mobil pastki menyuni yangilash
  document.querySelectorAll(".mobile-bottom-nav .bottom-nav-item").forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("data-view") === viewId) {
      item.classList.add("active");
    }
  });

  // Barcha view-section larni yashirish va faolini ochish
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active-view");
  });

  const activeSection = document.getElementById(viewId);
  if (activeSection) {
    activeSection.classList.add("active-view");
  }

  // To'lovlar yoki Davomatga o'tilganda boshlang'ich ro'yxat ko'rinishini tiklash
  if (viewId === "hisobot-kartasi-view") {
    closeFinanceDetail();
  }
  if (viewId === "hisobotlar-tahlili-view") {
    closeAttendanceClassDetail();
  }

  updateBreadcrumbs(viewId);
  playAudioFX('swoosh');
  setTimeout(() => { init3DTiltEffects(); initCountUpEffects(); }, 80);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateBreadcrumbs(viewId) {
  const titles = {
    "bosh-panel": { title: "Boshqaruv Paneli", subtitle: "Ziyo Nur Xususiy Maktabi & Repetitorlik Tizimi" },
    "maktab-faoliyati-view": { title: "Maktab faoliyati", subtitle: "Ziyo Nur Xususiy Maktabi umumiy ko'rsatkichlari" },
    "3d-gradient-view": { title: "Statistika", subtitle: "Akademik o'zlashtirish va o'quv ko'rsatkichlari" },
    "hisobot-kartasi-view": { title: "To'lovlar", subtitle: "Maktab va Repetitorlik to'lovlari hisoboti" },
    "maktab-hisoboti-view": { title: "O'quvchilar ro'yxati", subtitle: "Barcha o'quvchilar bazasi" },
    "hisobotlar-xaritasi-view": { title: "Repetitorlar", subtitle: "To'garaklar va Repetitorlik guruhlari" },
    "hisobotlar-tahlili-view": { title: "Sinflar", subtitle: "Sinflar bo'yicha kunlik davomat jurnali" }
  };

  const meta = titles[viewId] || { title: "Boshqaruv Paneli", subtitle: "EduPrime PRO CRM" };
  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");
  if (pageTitle) pageTitle.textContent = meta.title;
  if (pageSubtitle) pageSubtitle.textContent = meta.subtitle;
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) {
    const isOpen = sidebar.classList.toggle("mobile-open");
    if (backdrop) backdrop.classList.toggle("active", isOpen);
    document.body.classList.toggle("sidebar-lock-scroll", isOpen);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) sidebar.classList.remove("mobile-open");
  if (backdrop) backdrop.classList.remove("active");
  document.body.classList.remove("sidebar-lock-scroll");
}

function closeAllActiveModals() {
  document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
}

// ===================================================================
// PANEL 1: Maktab faoliyati
// ===================================================================
function renderDashboard() {
  const lessonsEl = document.getElementById("dashLessonsCount");
  const tutorsEl = document.getElementById("dashTutorsActivity");
  if (lessonsEl) lessonsEl.textContent = "48,364";
  if (tutorsEl) tutorsEl.textContent = "46.2k";
}

function renderReportsView() {
  // SVG grafiklar mavjud
}

// ===================================================================
// PANEL 3: TO'LOVLAR (MAKTAB VA REPETITOR IERARXIYASI)
// ===================================================================
function renderFinanceView() {
  const incomeEl = document.getElementById("financeTotalIncome");
  const debtEl = document.getElementById("financeTotalDebt");
  if (incomeEl) incomeEl.textContent = "35,460,000 UZS";
  if (debtEl) debtEl.textContent = "1 200 000 UZS";

  renderFinanceList();
}

function switchFinanceMode(mode) {
  state.financeMode = mode;

  const btnSchool = document.getElementById("btnFinanceSchoolMode");
  const btnTutor = document.getElementById("btnFinanceTutorMode");

  if (btnSchool && btnTutor) {
    if (mode === "school") {
      btnSchool.classList.add("active");
      btnTutor.classList.remove("active");
    } else {
      btnTutor.classList.add("active");
      btnSchool.classList.remove("active");
    }
  }

  closeFinanceDetail();
}

function renderFinanceList() {
  const container = document.getElementById("financeListContainer");
  if (!container) return;

  if (state.financeMode === "school") {
    // 1. Maktab Sinflari To'lov Kartalari
    container.innerHTML = `
      <div class="finance-cards-grid">
        ${SCHOOL_CLASSES.map(cls => `
          <div class="item-hierarchy-card" onclick="openFinanceClassDetail('${cls.id}')">
            <div>
              <div class="item-card-header">
                <h4 class="item-card-title">${cls.name}</h4>
                <span class="item-card-badge">Maktab sinfi</span>
              </div>
              <div class="item-card-meta" style="margin-top: 14px;">
                <div class="meta-row">
                  <i class="fa-solid fa-user-tie"></i>
                  <span>Sinf rahbari: <strong>${cls.teacher}</strong></span>
                </div>
                <div class="meta-row">
                  <i class="fa-solid fa-users"></i>
                  <span>O'quvchilar: <strong>${cls.studentsCount} nafar</strong></span>
                </div>
                <div class="meta-row">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  <span>Qarzdorlik: <strong style="color: ${cls.debtCount > 0 ? '#fb7185' : '#34d399'};">${cls.debtCount > 0 ? cls.debtCount + ' nafar qarzdor' : 'To\'liq to\'langan'}</strong></span>
                </div>
              </div>
            </div>
            <div class="item-card-footer">
              <span class="item-fee-text">${cls.monthlyFee.toLocaleString('uz-UZ')} UZS <small style="font-size: 11px; color: var(--text-muted);">/ oy</small></span>
              <span class="item-open-btn">O'quvchilar <i class="fa-solid fa-chevron-right"></i></span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    // 2. Repetitorlik To'garaklari To'lov Kartalari (Nomi, Vaqti, Ustoz, Oylik to'lov)
    container.innerHTML = `
      <div class="finance-cards-grid">
        ${TUTOR_COURSES.map(tut => `
          <div class="item-hierarchy-card" onclick="openFinanceTutorDetail('${tut.id}')">
            <div>
              <div class="item-card-header">
                <div>
                  <h4 class="item-card-title">${tut.name}</h4>
                  <small style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">Guruh: ${tut.groupName}</small>
                </div>
                <span class="item-card-badge" style="background: rgba(129, 140, 248, 0.15); color: #a5b4fc; border-color: rgba(129, 140, 248, 0.3);">To'garak</span>
              </div>

              <div class="item-card-meta" style="margin-top: 14px;">
                <div class="meta-row">
                  <i class="fa-regular fa-clock"></i>
                  <span class="meta-time-pill">${tut.days} (${tut.time})</span>
                </div>
                <div class="meta-row">
                  <i class="fa-solid fa-chalkboard-user"></i>
                  <span>Ustoz: <strong>${tut.teacher}</strong></span>
                </div>
                <div class="meta-row">
                  <i class="fa-solid fa-users"></i>
                  <span>A'zolar: <strong>${tut.studentsCount} nafar</strong></span>
                </div>
              </div>
            </div>

            <div class="item-card-footer">
              <span class="item-fee-text">${tut.monthlyFee.toLocaleString('uz-UZ')} UZS <small style="font-size: 11px; color: var(--text-muted);">/ oy</small></span>
              <span class="item-open-btn">O'quvchilar <i class="fa-solid fa-chevron-right"></i></span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

function openFinanceClassDetail(classId) {
  const cls = SCHOOL_CLASSES.find(c => c.id === classId) || SCHOOL_CLASSES[3];
  const listContainer = document.getElementById("financeListContainer");
  const detailContainer = document.getElementById("financeDetailContainer");

  if (!listContainer || !detailContainer) return;

  listContainer.style.display = "none";
  detailContainer.style.display = "block";

  const students = (state.data && state.data.students) ? state.data.students.slice(0, 8) : [];
  const defaultAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
  ];

  detailContainer.innerHTML = `
    <div class="class-detail-view-bar">
      <div class="class-detail-title-box">
        <div class="class-detail-icon"><i class="fa-solid fa-school"></i></div>
        <div>
          <h3 class="class-detail-name">${cls.name} To'lovlar Hisoboti</h3>
          <p class="class-detail-desc">Sinf rahbari: ${cls.teacher} &bull; Oylik kontrakt: ${cls.monthlyFee.toLocaleString('uz-UZ')} UZS</p>
        </div>
      </div>
      <button class="back-to-main-btn" onclick="closeFinanceDetail()">
        <i class="fa-solid fa-arrow-left"></i> Barcha sinflarga qaytish
      </button>
    </div>

    <div class="panel-card table-panel-card">
      <div class="table-card-header">
        <h3 class="panel-card-title">${cls.name} O'quvchilari Ro'yxati</h3>
        <button class="btn-primary-sm" onclick="openPaymentModal('${cls.name}')">
          <i class="fa-solid fa-plus"></i> Yangi To'lov Qabul Qilish
        </button>
      </div>
      <div class="table-clean-wrap">
        <table class="panel-clean-table">
          <thead>
            <tr>
              <th>O'quvchi</th>
              <th>Oylik Kontrakt</th>
              <th>To'lov Holati</th>
              <th style="text-align: right;">Harakat</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((st, i) => {
              const isPaid = (i !== 1 && i !== 4);
              return `
                <tr>
                  <td>
                    <div class="user-cell-flex">
                      <img src="${defaultAvatars[i % defaultAvatars.length]}" alt="${st.name}" class="student-avatar-img">
                      <strong>${st.name}</strong>
                    </div>
                  </td>
                  <td>${cls.monthlyFee.toLocaleString('uz-UZ')} UZS</td>
                  <td>
                    ${isPaid 
                      ? '<span class="pill-paid"><i class="fa-solid fa-check"></i> To\'langan</span>' 
                      : '<span class="pill-debt"><i class="fa-solid fa-clock"></i> Qarzdor (' + cls.monthlyFee.toLocaleString('uz-UZ') + ' UZS)</span>'
                    }
                  </td>
                  <td style="text-align: right;">
                    <button class="btn-primary-sm" onclick="openPaymentModal('${st.name}')">
                      <i class="fa-solid fa-receipt"></i> Kvitansiya
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openFinanceTutorDetail(tutorId) {
  const tut = TUTOR_COURSES.find(t => t.id === tutorId) || TUTOR_COURSES[0];
  const listContainer = document.getElementById("financeListContainer");
  const detailContainer = document.getElementById("financeDetailContainer");

  if (!listContainer || !detailContainer) return;

  listContainer.style.display = "none";
  detailContainer.style.display = "block";

  const students = (state.data && state.data.students) ? state.data.students.slice(0, 6) : [];
  const defaultAvatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80"
  ];

  detailContainer.innerHTML = `
    <div class="class-detail-view-bar">
      <div class="class-detail-title-box">
        <div class="class-detail-icon"><i class="fa-solid fa-graduation-cap"></i></div>
        <div>
          <h3 class="class-detail-name">${tut.name} (${tut.groupName}) To'lovlari</h3>
          <p class="class-detail-desc">Vaqti: <strong>${tut.days} (${tut.time})</strong> &bull; Ustoz: ${tut.teacher} &bull; To'lov: ${tut.monthlyFee.toLocaleString('uz-UZ')} UZS</p>
        </div>
      </div>
      <button class="back-to-main-btn" onclick="closeFinanceDetail()">
        <i class="fa-solid fa-arrow-left"></i> Barcha to'garaklarga qaytish
      </button>
    </div>

    <div class="panel-card table-panel-card">
      <div class="table-card-header">
        <h3 class="panel-card-title">${tut.name} Kursi O'quvchilari</h3>
        <button class="btn-primary-sm" onclick="openPaymentModal('${tut.groupName}')">
          <i class="fa-solid fa-plus"></i> Kurs To'lovini Kiritish
        </button>
      </div>
      <div class="table-clean-wrap">
        <table class="panel-clean-table">
          <thead>
            <tr>
              <th>O'quvchi</th>
              <th>Kurs Vaqti</th>
              <th>Oylik To'lov</th>
              <th>Holat</th>
              <th style="text-align: right;">Harakat</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((st, i) => {
              const isPaid = (i !== 2);
              return `
                <tr>
                  <td>
                    <div class="user-cell-flex">
                      <img src="${defaultAvatars[i % defaultAvatars.length]}" alt="${st.name}" class="student-avatar-img">
                      <strong>${st.name}</strong>
                    </div>
                  </td>
                  <td><span class="meta-time-pill">${tut.time}</span></td>
                  <td>${tut.monthlyFee.toLocaleString('uz-UZ')} UZS</td>
                  <td>
                    ${isPaid 
                      ? '<span class="pill-paid"><i class="fa-solid fa-check"></i> To\'langan</span>' 
                      : '<span class="pill-debt"><i class="fa-solid fa-clock"></i> Qarzdor</span>'
                    }
                  </td>
                  <td style="text-align: right;">
                    <button class="btn-primary-sm" onclick="openPaymentModal('${st.name}')">
                      <i class="fa-solid fa-receipt"></i> Kvitansiya
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function closeFinanceDetail() {
  const listContainer = document.getElementById("financeListContainer");
  const detailContainer = document.getElementById("financeDetailContainer");
  if (listContainer) listContainer.style.display = "block";
  if (detailContainer) detailContainer.style.display = "none";
  renderFinanceList();
}

// ===================================================================
// PANEL 4: O'quvchilar Bazasi (Maktab hisoboti)
// ===================================================================
function renderStudentsTable(filterText = "") {
  const tbody = document.getElementById("studentsBaseTableBody");
  const subtitle = document.getElementById("studentsCountSubtitle");
  if (!tbody) return;

  let students = state.data && state.data.students ? state.data.students : [];
  if (subtitle) subtitle.textContent = `O'quvchilar bazasi (${students.length || 21} ta)`;

  if (filterText) {
    students = students.filter(s => 
      s.name.toLowerCase().includes(filterText.toLowerCase()) ||
      (s.schoolClass && s.schoolClass.toLowerCase().includes(filterText.toLowerCase())) ||
      (s.parentPhone && s.parentPhone.includes(filterText))
    );
  }

  const defaultAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
  ];

  tbody.innerHTML = students.map((s, idx) => `
    <tr>
      <td>
        <div class="user-cell-flex">
          <img src="${defaultAvatars[idx % defaultAvatars.length]}" alt="${s.name}" class="student-avatar-img">
          <strong>${s.name}</strong>
        </div>
      </td>
      <td>${s.schoolClass || "9-A sinf"}</td>
      <td>${s.parentPhone || "0112 355-.."}</td>
      <td style="text-align: right;">
        <button class="btn-primary-sm" onclick="openPaymentModal('${s.name}')" title="To'lov">
          <i class="fa-solid fa-receipt"></i> To'lov
        </button>
      </td>
    </tr>
  `).join("");
}

function filterStudentsTable(val) {
  renderStudentsTable(val);
}

// ===================================================================
// PANEL 5: Guruhlar (Hisobotlar xaritasi)
// ===================================================================
function renderGroupsView() {
  const container = document.getElementById("groupsCardsContainer");
  if (!container) return;

  container.innerHTML = TUTOR_COURSES.slice(0, 4).map(g => `
    <div class="group-item-card">
      <div class="group-card-top">
        <div>
          <h4 class="group-card-title">${g.name} (${g.groupName})</h4>
          <span class="group-card-students">${g.studentsCount} o'quvchi</span>
        </div>
        <button class="icon-btn" style="color: var(--text-muted);"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      </div>

      <div class="group-days-row">
        <span class="day-pill">${g.days}</span>
        <span class="day-pill" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">${g.time}</span>
      </div>

      <div class="group-card-footer">
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="${g.teacher}" class="student-avatar-img" style="width: 28px; height: 28px;">
        <span class="group-teacher-name">${g.teacher}</span>
      </div>
    </div>
  `).join("");
}

// ===================================================================
// PANEL 6: DAVOMAT (SINFLAR IERARXIYASI — ICHIGA KIRGANDA O'QUVCHILAR)
// ===================================================================
function renderAttendanceView() {
  const listContainer = document.getElementById("attendanceClassesListContainer");
  if (!listContainer) return;

  // 1. Dastlab Sinflar Kartalari Ko'rinadi
  listContainer.innerHTML = `
    <div class="attendance-classes-grid">
      ${SCHOOL_CLASSES.map(cls => `
        <div class="item-hierarchy-card" onclick="openAttendanceClassDetail('${cls.id}')">
          <div>
            <div class="item-card-header">
              <h4 class="item-card-title">${cls.name}</h4>
              <span class="item-card-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">
                ${cls.attendanceRate} davomat
              </span>
            </div>

            <div class="item-card-meta" style="margin-top: 14px;">
              <div class="meta-row">
                <i class="fa-solid fa-user-tie"></i>
                <span>Sinf rahbari: <strong>${cls.teacher}</strong></span>
              </div>
              <div class="meta-row">
                <i class="fa-solid fa-users"></i>
                <span>Jami o'quvchilar: <strong>${cls.studentsCount} nafar</strong></span>
              </div>
              <div class="meta-row">
                <i class="fa-solid fa-door-open"></i>
                <span>Xona: <strong>${cls.room}</strong></span>
              </div>
            </div>
          </div>

          <div class="item-card-footer">
            <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Bugun: 13.10.2026</span>
            <span class="item-open-btn">Sinf davomati <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function openAttendanceClassDetail(classId) {
  const cls = SCHOOL_CLASSES.find(c => c.id === classId) || SCHOOL_CLASSES[3];
  state.activeAttendanceClass = cls;

  const listContainer = document.getElementById("attendanceClassesListContainer");
  const detailContainer = document.getElementById("attendanceClassDetailContainer");

  if (!listContainer || !detailContainer) return;

  listContainer.style.display = "none";
  detailContainer.style.display = "block";

  const students = (state.data && state.data.students) ? state.data.students.slice(0, 8) : [];
  const defaultAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
  ];

  detailContainer.innerHTML = `
    <div class="class-detail-view-bar">
      <div class="class-detail-title-box">
        <div class="class-detail-icon"><i class="fa-solid fa-clipboard-check"></i></div>
        <div>
          <h3 class="class-detail-name">${cls.name} — Bugungi Davomat Jurnali</h3>
          <p class="class-detail-desc">Sinf rahbari: ${cls.teacher} &bull; Xona: ${cls.room} &bull; Sana: 13.10.2026</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button class="back-to-main-btn" onclick="closeAttendanceClassDetail()">
          <i class="fa-solid fa-arrow-left"></i> Barcha sinflarga qaytish
        </button>
        <button class="btn-primary" onclick="saveClassAttendance('${cls.name}')">
          <i class="fa-solid fa-check-double"></i> Saqlash
        </button>
      </div>
    </div>

    <div class="panel-card table-panel-card">
      <div class="table-card-header">
        <h3 class="panel-card-title">${cls.name} O'quvchilari (Bor / Yo'q)</h3>
        <span style="font-size: 12px; color: var(--text-muted); font-weight: 700;">Jami: ${cls.studentsCount} o'quvchi</span>
      </div>
      <div class="table-clean-wrap">
        <table class="panel-clean-table">
          <thead>
            <tr>
              <th>O'quvchi</th>
              <th style="text-align: right;">Davomat Holati</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((st, i) => {
              const status = state.attendanceRecords[cls.id + '_' + st.id] || (i % 3 === 0 ? "keldi" : (i % 3 === 1 ? "kelmadi" : "sababli"));
              return `
                <tr>
                  <td>
                    <div class="user-cell-flex">
                      <img src="${defaultAvatars[i % defaultAvatars.length]}" alt="${st.name}" class="student-avatar-img">
                      <strong>${st.name}</strong>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div class="att-actions-cell">
                      <button class="att-btn att-btn-keldi ${status === 'keldi' ? 'active' : ''}" onclick="markClassAttendance('${cls.id}', '${st.id}', 'keldi')">
                        <i class="fa-solid fa-check"></i> Keldi
                      </button>
                      <button class="att-btn att-btn-kelmadi ${status === 'kelmadi' ? 'active' : ''}" onclick="markClassAttendance('${cls.id}', '${st.id}', 'kelmadi')">
                        <i class="fa-solid fa-xmark"></i> Kelmagan
                      </button>
                      <button class="att-btn att-btn-sababli ${status === 'sababli' ? 'active' : ''}" onclick="markClassAttendance('${cls.id}', '${st.id}', 'sababli')">
                        <i class="fa-solid fa-clock"></i> Sababli
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function markClassAttendance(classId, studentId, status) {
  state.attendanceRecords[classId + '_' + studentId] = status;
  if (state.activeAttendanceClass) {
    openAttendanceClassDetail(state.activeAttendanceClass.id);
  }
}

function saveClassAttendance(className) {
  showToast(`${className} davomati muvaffaqiyatli saqlandi!`, "success");
}

function closeAttendanceClassDetail() {
  const listContainer = document.getElementById("attendanceClassesListContainer");
  const detailContainer = document.getElementById("attendanceClassDetailContainer");
  if (listContainer) listContainer.style.display = "block";
  if (detailContainer) detailContainer.style.display = "none";
  renderAttendanceView();
}

// ===================================================================
// Qidiruv, Mavzu & Modallar
// ===================================================================
function handleGlobalSearch(query) {
  if (!query) return;
  if (state.currentView !== "maktab-hisoboti-view") {
    switchView("maktab-hisoboti-view");
  }
  const input = document.getElementById("studentsSearchInput");
  if (input) input.value = query;
  renderStudentsTable(query);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("EDUPRIME_THEME", newTheme);
  showToast(`Mavzu ${newTheme === 'dark' ? 'Qorong\'u' : 'Yorug\''} rejimga o'zgardi`, "info");
}

function openAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  if (modal) modal.classList.add("active");
}

function closeAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  if (modal) modal.classList.remove("active");
}

function handleSaveNewStudent(e) {
  e.preventDefault();
  const name = document.getElementById("newStudentName").value.trim();
  const sClass = document.getElementById("newStudentClass").value.trim();
  const phone = document.getElementById("newStudentParentPhone").value.trim();

  if (!name || !sClass) return;

  const newStudent = {
    id: "STU-" + Date.now(),
    name: name,
    schoolClass: sClass,
    parentPhone: phone,
    status: "Faol"
  };

  if (!state.data.students) state.data.students = [];
  state.data.students.unshift(newStudent);
  saveCRMData(state.data);

  closeAddStudentModal();
  renderStudentsTable();
  showToast("Yangi o'quvchi muvaffaqiyatli qo'shildi!", "success");
  e.target.reset();
}

function openPaymentModal(studentName = "") {
  populatePaymentStudentSelect(studentName);
  const modal = document.getElementById("paymentModal");
  if (modal) modal.classList.add("active");
}

function closePaymentModal() {
  const modal = document.getElementById("paymentModal");
  if (modal) modal.classList.remove("active");
}

function populatePaymentStudentSelect(selectedName = "") {
  const select = document.getElementById("paymentStudentSelect");
  if (!select) return;

  const students = state.data && state.data.students ? state.data.students : [];
  select.innerHTML = students.map(s => `
    <option value="${s.name}" ${s.name === selectedName ? 'selected' : ''}>${s.name} (${s.schoolClass || 'Maktab'})</option>
  `).join("");
}

function handleSavePayment(e) {
  e.preventDefault();
  const student = document.getElementById("paymentStudentSelect").value;
  const amount = document.getElementById("paymentAmountInput").value;
  
  closePaymentModal();
  showToast(`${student} uchun ${amount} UZS to'lov qabul qilindi!`, "success");
}

function openAddGroupModal() {
  const modal = document.getElementById("addGroupModal");
  if (modal) modal.classList.add("active");
}

function closeAddGroupModal() {
  const modal = document.getElementById("addGroupModal");
  if (modal) modal.classList.remove("active");
}

function handleSaveNewGroup(e) {
  e.preventDefault();
  closeAddGroupModal();
  showToast("Yangi guruh muvaffaqiyatli ochildi!", "success");
}

function openSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.add("active");
}

function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.remove("active");
}

function saveSettings() {
  closeSettingsModal();
  showToast("Tizim sozlamalari saqlandi!", "success");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.style.cssText = `
    background: ${type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#3b82f6')};
    color: #ffffff;
    padding: 12px 22px;
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 700;
    box-shadow: 0 10px 25px rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 99999;
  `;
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}


// ===================================================================
// 15. ULTRA-WOW INTERAKTIV VA AUDIO MODULI (MUKAMMAL ISHLAYDI)
// ===================================================================

let audioFxEnabled = localStorage.getItem("EDUPRIME_AUDIO_FX") !== "false";
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function toggleAudioFX() {
  audioFxEnabled = !audioFxEnabled;
  localStorage.setItem("EDUPRIME_AUDIO_FX", audioFxEnabled);
  
  const btn = document.getElementById("audioToggleBtn");
  if (btn) {
    if (audioFxEnabled) {
      btn.className = "icon-btn audio-fx-btn active";
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      btn.title = "Ovoz effektlari (Yoqilgan)";
      playAudioFX("success");
      showToast("Ovoz effektlari yoqildi 🔔", "info");
    } else {
      btn.className = "icon-btn audio-fx-btn muted";
      btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      btn.title = "Ovoz effektlari (O'chirilgan)";
      showToast("Ovoz effektlari o'chirildi 🔕", "info");
    }
  }
}

function playAudioFX(type) {
  if (!audioFxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === "pop" || type === "hover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "hover" ? 640 : 820, now);
      osc.frequency.exponentialRampToValueAtTime(type === "hover" ? 880 : 1050, now + 0.04);
      gain.gain.setValueAtTime(type === "hover" ? 0.015 : 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === "success") {
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.05, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.23);
      });
    } else if (type === "swoosh") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {}
}

function initLiveClock() {
  const clockEl = document.getElementById("liveTimeClock");
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    const secs = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${hours}:${mins}:${secs}`;
  }
  update();
  setInterval(update, 1000);
}

function initAmbientCanvas() {
  const canvas = document.getElementById("ambientGlowCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 140 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(36, Math.floor(width / 32));
  const particles = [];
  const colors = [
    "rgba(56, 189, 248, ",
    "rgba(99, 102, 241, ",
    "rgba(168, 85, 247, ",
    "rgba(52, 211, 153, "
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      size: Math.random() * 2.2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ")";
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color + "0.6)";
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = p.color + (0.12 * (1 - dist / 110)) + ")";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(renderParticles);
  }

  renderParticles();
}

function init3DTiltEffects() {
  const cards = document.querySelectorAll(".card-3d, .item-hierarchy-card, .stat-card");

  cards.forEach((card) => {
    let bounds;

    function onMouseEnter(e) {
      bounds = card.getBoundingClientRect();
      playAudioFX("hover");
    }

    function onMouseMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const halfWidth = bounds.width / 2;
      const halfHeight = bounds.height / 2;

      const xNorm = (mouseX - halfWidth) / halfWidth;
      const yNorm = (mouseY - halfHeight) / halfHeight;

      const rotX = -yNorm * 10;
      const rotY = xNorm * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;

      card.style.setProperty("--mouse-x", `${mouseX}px`);
      card.style.setProperty("--mouse-y", `${mouseY}px`);
    }

    function onMouseLeave() {
      bounds = null;
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }

    card.removeEventListener("mouseenter", onMouseEnter);
    card.removeEventListener("mousemove", onMouseMove);
    card.removeEventListener("mouseleave", onMouseLeave);

    card.addEventListener("mouseenter", onMouseEnter);
    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);
  });
}

function initRippleEffects() {
  const buttons = document.querySelectorAll(".btn-primary, .btn-secondary, .back-to-main-btn, .finance-mode-btn, .att-btn, .card-3d");

  buttons.forEach(btn => {
    btn.addEventListener("click", function(e) {
      playAudioFX("click");
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const circle = document.createElement("span");
      circle.classList.add("ripple-circle");
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;

      const prevCircle = this.querySelector(".ripple-circle");
      if (prevCircle) prevCircle.remove();

      this.appendChild(circle);

      setTimeout(() => circle.remove(), 600);
    });
  });
}

function spawnConfetti(originX, originY) {
  const colors = ["#38bdf8", "#818cf8", "#f43f5e", "#10b981", "#fbbf24", "#a855f7", "#ec4899"];
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement("div");
    el.className = "wow-confetti";
    document.body.appendChild(el);

    const size = Math.random() * 8 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
    const velocity = Math.random() * 120 + 80;

    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity + 60;

    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.background = color;
    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.boxShadow = `0 0 10px ${color}`;
    el.style.transform = "translate(0, 0) scale(1) rotate(0deg)";
    el.style.opacity = "1";
    el.style.transition = "transform 0.85s cubic-bezier(0.12, 0.8, 0.32, 1), opacity 0.85s ease-out";

    requestAnimationFrame(() => {
      el.style.transform = `translate(${destX}px, ${destY}px) scale(0.4) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = "0";
    });

    setTimeout(() => el.remove(), 900);
  }
}

function initCountUpEffects() {
  const statNumbers = document.querySelectorAll(".stat-value, .banner-stat-box .num, .item-fee-text");
  statNumbers.forEach(el => {
    const text = el.innerText.trim();
    const match = text.match(/(\d[\d\s,.]*)/);
    if (!match) return;

    const rawStr = match[1].replace(/\s/g, '').replace(/,/g, '');
    const targetVal = parseFloat(rawStr);
    if (isNaN(targetVal) || targetVal === 0) return;

    const prefix = text.split(match[1])[0] || "";
    const suffix = text.split(match[1])[1] || "";

    const duration = 750;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(ease * targetVal);

      el.innerText = prefix + currentVal.toLocaleString("ru-RU") + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.innerText = text;
      }
    }

    requestAnimationFrame(step);
  });
}
