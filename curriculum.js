// ===== CURRICULUM VIEWER =====
// FIX: Progress now persisted to localStorage (lf_progress_<courseId>)
// FIX: Loads real LMS topics/lessons from admin-built course data
// FIX: Prev/Next buttons disabled at boundaries
// FIX: Falls back to keyword-based curriculum only if no LMS data exists

const params     = new URLSearchParams(window.location.search);
const courseName = params.get('course') || 'AI Course';
const userName   = params.get('user')   || 'Learner';
const courseId   = params.get('cid')    || '';

document.getElementById('sidebarCourseTitle').textContent = courseName;
document.getElementById('userInitials').textContent = userName.slice(0, 2).toUpperCase();

// ── Load curriculum: real LMS data first, fallback to keyword-based ───────────
function loadCurriculumData() {
  if (courseId) {
    const lms = JSON.parse(localStorage.getItem('lf_lms') || '{}');
    const course = lms[courseId];
    if (course && course.topics && course.topics.length > 0) {
      return course.topics
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(t => ({
          module: t.title,
          topicId: t.id,
          lessons: (t.lessons || []).map(l => ({
            id: l.id,
            title: l.title,
            type: l.type || 'Video',
            duration: l.duration || 30,
            content: l.content || '',
            video: l.video || ''
          }))
        }));
    }
  }
  // Fallback: keyword-based static curriculum
  return getKeywordCurriculum(courseName);
}

function getKeywordCurriculum(course) {
  const c = course.toLowerCase();
  if (c.includes('gpt') || c.includes('llm') || c.includes('generative')) return [
    { module: 'Module 1: Foundations', lessons: [
      {id:'s1',title:'Introduction to LLMs'},{id:'s2',title:'How GPT Works'},
      {id:'s3',title:'Tokenization & Embeddings'},{id:'s4',title:'Prompt Basics'}
    ]},
    { module: 'Module 2: Prompt Engineering', lessons: [
      {id:'s5',title:'Zero-Shot Prompting'},{id:'s6',title:'Few-Shot Prompting'},
      {id:'s7',title:'Chain-of-Thought'},{id:'s8',title:'System Prompts'}
    ]},
    { module: 'Module 3: RAG & Vector DBs', lessons: [
      {id:'s9',title:'What is RAG?'},{id:'s10',title:'Vector Databases'},
      {id:'s11',title:'LangChain Basics'},{id:'s12',title:'Building a RAG Pipeline'}
    ]},
    { module: 'Module 4: Fine-Tuning', lessons: [
      {id:'s13',title:'LoRA & QLoRA'},{id:'s14',title:'Dataset Preparation'},
      {id:'s15',title:'Training & Evaluation'},{id:'s16',title:'Deploying Fine-Tuned Models'}
    ]},
    { module: 'Module 5: Production AI', lessons: [
      {id:'s17',title:'API Integration'},{id:'s18',title:'Cost Optimization'},
      {id:'s19',title:'Monitoring & Observability'},{id:'s20',title:'Capstone Project'}
    ]},
  ];
  if (c.includes('agentic') || c.includes('agent')) return [
    { module: 'Module 1: Agent Fundamentals', lessons: [
      {id:'a1',title:'What are AI Agents?'},{id:'a2',title:'ReAct Framework'},
      {id:'a3',title:'Tool Use & Function Calling'},{id:'a4',title:'Memory Systems'}
    ]},
    { module: 'Module 2: Frameworks', lessons: [
      {id:'a5',title:'LangGraph Basics'},{id:'a6',title:'CrewAI Multi-Agents'},
      {id:'a7',title:'AutoGen Setup'},{id:'a8',title:'n8n AI Workflows'}
    ]},
    { module: 'Module 3: Cloud Agents', lessons: [
      {id:'a9',title:'AWS Bedrock Agents'},{id:'a10',title:'Azure AutoGen'},
      {id:'a11',title:'Vertex AI Agents'},{id:'a12',title:'Copilot Studio'}
    ]},
    { module: 'Module 4: Architecture', lessons: [
      {id:'a13',title:'Agent Design Patterns'},{id:'a14',title:'Orchestration Systems'},
      {id:'a15',title:'Error Handling'},{id:'a16',title:'Scalability'}
    ]},
    { module: 'Module 5: Enterprise', lessons: [
      {id:'a17',title:'Enterprise Integration'},{id:'a18',title:'Security & Governance'},
      {id:'a19',title:'AgentOps Monitoring'},{id:'a20',title:'Capstone Project'}
    ]},
  ];
  if (c.includes('data science') || c.includes('analytics')) return [
    { module: 'Module 1: Python for Data', lessons: [
      {id:'d1',title:'NumPy Basics'},{id:'d2',title:'Pandas DataFrames'},
      {id:'d3',title:'Data Cleaning'},{id:'d4',title:'EDA Techniques'}
    ]},
    { module: 'Module 2: Visualization', lessons: [
      {id:'d5',title:'Matplotlib'},{id:'d6',title:'Seaborn'},
      {id:'d7',title:'Power BI Basics'},{id:'d8',title:'Tableau Dashboards'}
    ]},
    { module: 'Module 3: Machine Learning', lessons: [
      {id:'d9',title:'Supervised Learning'},{id:'d10',title:'Unsupervised Learning'},
      {id:'d11',title:'Model Evaluation'},{id:'d12',title:'Feature Engineering'}
    ]},
    { module: 'Module 4: Projects', lessons: [
      {id:'d13',title:'Sales Forecasting'},{id:'d14',title:'Customer Segmentation'},
      {id:'d15',title:'Churn Prediction'},{id:'d16',title:'Capstone Project'}
    ]},
  ];
  return [
    { module: 'Module 1: Introduction', lessons: [
      {id:'g1',title:'Course Overview'},{id:'g2',title:'Setup & Tools'},
      {id:'g3',title:'Core Concepts'},{id:'g4',title:'First Project'}
    ]},
    { module: 'Module 2: Core Skills', lessons: [
      {id:'g5',title:'Fundamentals'},{id:'g6',title:'Hands-on Practice'},
      {id:'g7',title:'Real-World Examples'},{id:'g8',title:'Mini Project'}
    ]},
    { module: 'Module 3: Advanced Topics', lessons: [
      {id:'g9',title:'Advanced Concepts'},{id:'g10',title:'Industry Patterns'},
      {id:'g11',title:'Best Practices'},{id:'g12',title:'Case Studies'}
    ]},
    { module: 'Module 4: Production', lessons: [
      {id:'g13',title:'Deployment'},{id:'g14',title:'Optimization'},
      {id:'g15',title:'Monitoring'},{id:'g16',title:'Capstone Project'}
    ]},
  ];
}

const curriculum = loadCurriculumData();
let currentLesson = { moduleIdx: 0, lessonIdx: 0 };

// FIX: Load persisted progress from localStorage
const progressKey = courseId ? `lf_progress_${courseId}` : `lf_progress_name_${encodeURIComponent(courseName)}`;
const completedLessons = new Set(JSON.parse(localStorage.getItem(progressKey) || '[]'));

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify([...completedLessons]));
}

function getLessonId(mi, li) {
  const lesson = curriculum[mi]?.lessons[li];
  return lesson?.id || `${mi}-${li}`;
}

function renderModules() {
  const list = document.getElementById('moduleList');
  list.innerHTML = curriculum.map((mod, mi) => `
    <div class="module-item">
      <div class="module-title" onclick="toggleModule(${mi})">
        <span>${mod.module}</span>
        <span class="module-arrow" id="arrow-${mi}">▼</span>
      </div>
      <div class="module-lessons" id="lessons-${mi}">
        ${mod.lessons.map((lesson, li) => {
          const lid = getLessonId(mi, li);
          const isActive = mi === 0 && li === 0;
          const isDone = completedLessons.has(lid);
          return `
          <div class="lesson-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}"
               id="lesson-${mi}-${li}"
               onclick="loadLesson(${mi}, ${li})">
            <span class="lesson-dot">${isDone ? '✅' : '○'}</span>
            ${lesson.title || lesson}
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function toggleModule(mi) {
  const el = document.getElementById(`lessons-${mi}`);
  const arrow = document.getElementById(`arrow-${mi}`);
  el.classList.toggle('collapsed');
  arrow.textContent = el.classList.contains('collapsed') ? '▶' : '▼';
}

function loadLesson(mi, li) {
  currentLesson = { moduleIdx: mi, lessonIdx: li };
  const mod = curriculum[mi];
  const lesson = mod.lessons[li];
  const lessonTitle = lesson.title || lesson;
  const lessonContent = lesson.content || '';
  const lessonVideo = lesson.video || '';

  document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`lesson-${mi}-${li}`)?.classList.add('active');

  document.getElementById('lessonBreadcrumb').textContent = `${mod.module} › Lesson ${li + 1}`;
  document.getElementById('lessonTitle').textContent = lessonTitle;
  document.getElementById('videoLabel').textContent = `▶ ${lessonTitle}`;

  // FIX: Render real lesson content if available, else show placeholder
  const bodyEl = document.getElementById('lessonBody');
  if (lessonContent) {
    bodyEl.innerHTML = `
      <div class="lesson-description">
        <div class="lb-rich-content">${lessonContent}</div>
        <button class="btn-complete" onclick="markComplete(${mi}, ${li})">✅ Mark as Complete</button>
      </div>`;
  } else {
    bodyEl.innerHTML = `
      <div class="lesson-description">
        <h3>About this lesson</h3>
        <p>In this lesson, you will learn about <strong>${lessonTitle}</strong> as part of <em>${mod.module}</em> in the <strong>${courseName}</strong> program.</p>
        <ul>
          <li>📌 Understand the core concepts of ${lessonTitle}</li>
          <li>🛠 Hands-on exercises and real-world examples</li>
          <li>📝 Quiz at the end to test your understanding</li>
          <li>🎯 Project task to apply what you've learned</li>
        </ul>
        <button class="btn-complete" onclick="markComplete(${mi}, ${li})">✅ Mark as Complete</button>
      </div>`;
  }

  // Show video if available
  const videoEl = document.getElementById('lessonVideo');
  if (lessonVideo) {
    const videoId = lessonVideo.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
    if (videoId) {
      videoEl.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:12px"></iframe>`;
    } else {
      videoEl.innerHTML = `<div class="video-placeholder"><span>▶</span><p>${lessonTitle}</p></div>`;
    }
  } else {
    videoEl.innerHTML = `<div class="video-placeholder"><span>▶</span><p id="videoLabel">▶ ${lessonTitle}</p></div>`;
  }

  updateProgress();
  updateNavButtons();
}

function markComplete(mi, li) {
  const lid = getLessonId(mi, li);
  completedLessons.add(lid);
  saveProgress(); // FIX: persist to localStorage
  renderModules();
  loadLesson(mi, li);
  updateProgress();
}

function updateProgress() {
  const total = curriculum.reduce((s, m) => s + m.lessons.length, 0);
  const pct = total ? Math.round((completedLessons.size / total) * 100) : 0;
  document.getElementById('overallProgress').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = pct + '% Complete';
}

// FIX: Disable prev/next at boundaries
function updateNavButtons() {
  const { moduleIdx: mi, lessonIdx: li } = currentLesson;
  const prevBtn = document.getElementById('prevLesson');
  const nextBtn = document.getElementById('nextLesson');
  const isFirst = mi === 0 && li === 0;
  const lastMod = curriculum.length - 1;
  const isLast = mi === lastMod && li === curriculum[lastMod].lessons.length - 1;
  if (prevBtn) { prevBtn.disabled = isFirst; prevBtn.style.opacity = isFirst ? '0.4' : '1'; }
  if (nextBtn) { nextBtn.disabled = isLast;  nextBtn.style.opacity = isLast  ? '0.4' : '1'; }
}

document.getElementById('nextLesson').addEventListener('click', () => {
  let { moduleIdx: mi, lessonIdx: li } = currentLesson;
  li++;
  if (li >= curriculum[mi].lessons.length) { mi++; li = 0; }
  if (mi < curriculum.length) loadLesson(mi, li);
});

document.getElementById('prevLesson').addEventListener('click', () => {
  let { moduleIdx: mi, lessonIdx: li } = currentLesson;
  li--;
  if (li < 0) { mi--; if (mi >= 0) li = curriculum[mi].lessons.length - 1; }
  if (mi >= 0) loadLesson(mi, li);
});

renderModules();
loadLesson(0, 0);
