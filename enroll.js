// ===== ENROLL MODAL LOGIC =====
// FIX: Prevent duplicate enrollments (same email + course)
// FIX: Login form no longer silently creates fake enrollments
// FIX: Redirect approved users to curriculum.html (not lms.html)

const modal = document.getElementById('enrollModal');
const closeModal = document.getElementById('closeModal');
const modalCourseName = document.getElementById('modalCourseName');
const modalSuccess = document.getElementById('modalSuccess');

let currentCourse = '';

// Open modal on any Enroll Now click — but NOT on masterclass cards
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-enroll');
  if (!btn) return;
  if (btn.closest('.mc-dynamic-card')) return;
  if (btn.getAttribute('onclick')) return;
  e.preventDefault();
  const card = btn.closest('.master-card, .course-card, .live-card');
  currentCourse = card ? (card.querySelector('h3')?.textContent || 'Course') : 'Course';
  if (modalCourseName) modalCourseName.textContent = currentCourse;
  const regCourse = document.getElementById('reg_course');
  if (regCourse) regCourse.value = currentCourse;
  if (modalSuccess) modalSuccess.style.display = 'none';
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  if (registerForm) registerForm.style.display = 'flex';
  if (loginForm) loginForm.style.display = 'none';
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  const regTab = document.querySelector('.modal-tab[data-tab="register"]');
  if (regTab) regTab.classList.add('active');
  if (modal) modal.classList.add('active');
});

// Close modal
if (closeModal) closeModal.addEventListener('click', () => modal && modal.classList.remove('active'));
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

// Tab switching
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    document.querySelectorAll('.modal-form').forEach(f => f.style.display = 'none');
    const targetForm = document.getElementById(target + 'Form');
    if (targetForm) targetForm.style.display = 'flex';
  });
});

// Register submit — FIX: check for duplicate enrollment before saving
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name   = document.getElementById('reg_name')?.value?.trim();
    const email  = document.getElementById('reg_email')?.value?.trim().toLowerCase();
    const phone  = document.getElementById('reg_phone')?.value?.trim();
    const country = document.getElementById('reg_country')?.value || '';
    const course = document.getElementById('reg_course')?.value || currentCourse;

    if (!name || !email) return;

    // FIX: Prevent duplicate enrollment for same email + course
    const existing = getEnrollments();
    const isDuplicate = existing.find(en =>
      en.email.toLowerCase() === email && en.course.toLowerCase() === course.toLowerCase()
    );
    if (isDuplicate) {
      const errEl = document.getElementById('enrollError');
      if (errEl) {
        errEl.textContent = '⚠️ You have already enrolled in this course.';
        errEl.style.display = 'block';
      } else {
        showToast('Already enrolled in this course.', 'warning');
      }
      return;
    }

    const enrollment = {
      id: Date.now(), name, email, phone, country, course,
      status: 'pending',
      date: new Date().toLocaleDateString('en-IN')
    };
    saveEnrollment(enrollment);
    showSuccess();
  });
}

// Login submit — FIX: only look up existing enrollment, never create fake one
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login_email')?.value?.trim().toLowerCase();
    if (!email) return;

    const enrollments = getEnrollments();
    const userEnrollments = enrollments.filter(en => en.email.toLowerCase() === email);

    if (userEnrollments.length === 0) {
      // FIX: Don't create a fake enrollment — show proper message
      const errEl = document.getElementById('loginError');
      if (errEl) {
        errEl.textContent = '❌ No enrollment found for this email. Please register first.';
        errEl.style.display = 'block';
      } else {
        showToast('No enrollment found for this email.\nPlease register first.', 'error');
      }
      return;
    }

    // Find approved enrollment for current course, or any approved enrollment
    const approved = userEnrollments.find(en =>
      en.status === 'approved' &&
      (currentCourse ? en.course.toLowerCase() === currentCourse.toLowerCase() : true)
    ) || userEnrollments.find(en => en.status === 'approved');

    if (approved) {
      // FIX: redirect to curriculum.html (not lms.html which doesn't exist)
      window.location.href = `curriculum.html?course=${encodeURIComponent(approved.course)}&user=${encodeURIComponent(approved.name)}`;
    } else {
      const pending = userEnrollments.find(en => en.status === 'pending');
      if (pending) {
        showToast('Enrollment pending approval.\nYou will be notified once approved.', 'info');
      } else {
        showToast('Enrollment rejected.\nPlease contact support.', 'error');
      }
    }
  });
}

function saveEnrollment(enrollment) {
  const list = getEnrollments();
  list.push(enrollment);
  localStorage.setItem('lf_enrollments', JSON.stringify(list));
  // Also push to Flask API so admin panel sees it
  if (typeof apiAddEnrollment !== 'undefined') {
    apiAddEnrollment({
      name: enrollment.name,
      email: enrollment.email,
      phone: enrollment.phone || '',
      course: enrollment.course,
      courseId: enrollment.courseId || ''
    }).catch(() => {});
  }
}

function getEnrollments() {
  return JSON.parse(localStorage.getItem('lf_enrollments') || '[]');
}

function showSuccess() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  if (registerForm) registerForm.style.display = 'none';
  if (loginForm) loginForm.style.display = 'none';
  if (modalSuccess) modalSuccess.style.display = 'flex';
}
