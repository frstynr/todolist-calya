const STORAGE_KEY = 'calya_stitch_todos_v1';
const AVATAR_KEY = 'calya_stitch_avatar_v1';

const STITCH_IMAGES = [
  'titulo.jpg',
  'cute_stitch.jpg',
  'Instagram.jpg',
  'stitch_reading.jpg',
  'stitch_clipart.jpg',
  '1127518456803567736.jpg',
  '1141803311817114654.jpg',
  '348043877472708984.jpg',
  '397794579579397709.jpg',
  '676877019041682935.jpg',
  '850758185897801953.jpg',
  '974677544382029039.jpg',
  '975944181759713468.jpg',
];

const STITCH_QUOTES = {
  idle: [
    '"Ohana means nobody gets left behind — termasuk semua tugasmu hari ini, Calya!"',
    '"Aloha Calya! Pelan-pelan aja, yang penting satu per satu beres 💙"',
    '"Stitch siap jagain daftar tugas Calya hari ini! 🌺"',
    '"Jangan lupa minum air putih sambil ngerjain tugas ya, Calya! 🌊"',
    '"Setiap centang biru bikin Stitch makin seneng! ✨"',
  ],
  completed: [
    '"Yeay!! Satu tugas selesai! Calya keren banget! 💙🎉"',
    '"Woohoo! Stitch bangga sama Calya! Lanjut lagi yuk! 🌺"',
    '"Mantap Calya! Tinggal dikit lagi, pasti beres semua! ⭐"',
    '"Aloha! Keren banget sih Calya udah nyelesain tugas ini! 🛸💙"',
  ],
  added: [
    '"Oke, dicatat! Stitch bantu ingetin Calya ya! 📝💙"',
    '"Siap! Tugas baru udah masuk daftar Calya! ✨"',
  ],
  allDone: [
    '"HOREEE! Semua tugas Calya udah selesai! Waktunya istirahat & santai! 🌺🏖️💙"',
  ],
};

const CATEGORY_ICONS = {
  Belajar: '📚',
  Rumah: '🏠',
  Hobi: '🎨',
  Belanja: '🛍️',
  Lainnya: '💙',
};

const PRIORITY_LABELS = {
  penting: '🌺 Penting',
  normal: '✨ Normal',
  santai: '☁️ Santai',
};

// State
let todos = loadTodos();
let currentFilter = 'all';
let searchQuery = '';
let editingId = null;

let currentAvatarIdx = loadAvatarIndex();

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const taskDue = document.getElementById('taskDue');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const progressBar = document.getElementById('progressBar');
const progressStats = document.getElementById('progressStats');
const remainingCount = document.getElementById('remainingCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const searchInput = document.getElementById('searchInput');
const tabButtons = document.querySelectorAll('.tab-btn');
const stitchMascot = document.getElementById('stitchMascot');
const stitchImg = document.getElementById('stitchImg');
const stitchGallery = document.getElementById('stitchGallery');
const bgStitchCollage = document.getElementById('bgStitchCollage');
const stitchQuote = document.getElementById('stitchQuote');
const greetingText = document.getElementById('greetingText');
const sparkleLayer = document.getElementById('sparkleLayer');

function loadAvatarIndex() {
  try {
    const saved = parseInt(localStorage.getItem(AVATAR_KEY), 10);
    if (!Number.isNaN(saved) && saved >= 0 && saved < STITCH_IMAGES.length) {
      return saved;
    }
  } catch {
    // Ignore
  }
  return 0;
}

function setStitchAvatar(index) {
  currentAvatarIdx = ((index % STITCH_IMAGES.length) + STITCH_IMAGES.length) % STITCH_IMAGES.length;
  stitchImg.src = encodeURIComponent(STITCH_IMAGES[currentAvatarIdx]);
  try {
    localStorage.setItem(AVATAR_KEY, String(currentAvatarIdx));
  } catch {
    // Ignore
  }
  renderStitchGallery();
}

function renderStitchGallery() {
  stitchGallery.innerHTML = '';
  STITCH_IMAGES.forEach((filename, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `stitch-thumb${idx === currentAvatarIdx ? ' active' : ''}`;
    btn.title = `Pilih Stitch #${idx + 1}`;

    const img = document.createElement('img');
    img.src = encodeURIComponent(filename);
    img.alt = `Stitch ${idx + 1}`;

    btn.appendChild(img);
    btn.addEventListener('click', () => {
      setStitchAvatar(idx);
      setStitchMood('idle');
      spawnSparkles(stitchMascot);
    });
    stitchGallery.appendChild(btn);
  });
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Fallback if localStorage is unavailable
  }

  // Starter sample tasks on first visit
  return [
    {
      id: generateId(),
      text: 'Rapihin meja belajar & siapin alat tulis',
      category: 'Rumah',
      priority: 'normal',
      due: '',
      completed: false,
    },
    {
      id: generateId(),
      text: 'Minum air putih & stretching 5 menit',
      category: 'Lainnya',
      priority: 'santai',
      due: '',
      completed: true,
    },
  ];
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore storage quota errors
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function setTimeGreeting() {
  const hour = new Date().getHours();
  let timeWord = 'halo';
  if (hour >= 4 && hour < 11) timeWord = 'pagi';
  else if (hour >= 11 && hour < 15) timeWord = 'siang';
  else if (hour >= 15 && hour < 18) timeWord = 'sore';
  else timeWord = 'malem';

  greetingText.textContent = `${timeWord}, calya! let's slay ur tasks today 💙`;
}

function setStitchMood(type) {
  const pool = STITCH_QUOTES[type] || STITCH_QUOTES.idle;
  const randomQuote = pool[Math.floor(Math.random() * pool.length)];
  stitchQuote.textContent = randomQuote;

  stitchMascot.classList.remove('happy-bounce');
  // Trigger reflow so animation restarts cleanly
  void stitchMascot.offsetWidth;
  stitchMascot.classList.add('happy-bounce');
}

function spawnSparkles(originEl) {
  const rect = originEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const symbols = ['💙', '✨', '🌺', '⭐', '🫧'];

  for (let i = 0; i < 8; i++) {
    const span = document.createElement('span');
    span.className = 'sparkle';
    span.textContent = symbols[i % symbols.length];

    const angle = (Math.PI * 2 * i) / 8;
    const distance = 36 + Math.random() * 34;
    span.style.left = `${centerX}px`;
    span.style.top = `${centerY}px`;
    span.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    span.style.setProperty('--ty', `${Math.sin(angle) * distance - 12}px`);

    sparkleLayer.appendChild(span);
    setTimeout(() => span.remove(), 850);
  }
}

function formatDueDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${parseInt(parts[2], 10)} ${months[monthIdx] || parts[1]}`;
}

function getFilteredTodos() {
  return todos.filter((todo) => {
    if (currentFilter === 'active' && todo.completed) return false;
    if (currentFilter === 'completed' && !todo.completed) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchText = todo.text.toLowerCase().includes(q);
      const matchCat = todo.category.toLowerCase().includes(q);
      if (!matchText && !matchCat) return false;
    }
    return true;
  });
}

function updateProgress() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressBar.style.width = `${percent}%`;
  progressStats.textContent = `${completed} / ${total} done (${percent}%)`;
  remainingCount.textContent = `${active} left to do`;

  clearCompletedBtn.style.visibility = completed > 0 ? 'visible' : 'hidden';
}

function render() {
  const filtered = getFilteredTodos();
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filtered.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `task-item${todo.completed ? ' completed' : ''}`;

    // Check button
    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'check-btn';
    checkBtn.setAttribute('aria-label', todo.completed ? 'Tandai belum selesai' : 'Tandai selesai');
    checkBtn.textContent = todo.completed ? '✓' : '';
    checkBtn.addEventListener('click', () => toggleTodo(todo.id, checkBtn));

    // Body
    const body = document.createElement('div');
    body.className = 'task-body';

    if (editingId === todo.id) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'edit-input';
      editInput.value = todo.text;
      editInput.maxLength = 120;

      const commitEdit = () => {
        const trimmed = editInput.value.trim();
        if (trimmed) {
          todo.text = trimmed;
          saveTodos();
        }
        editingId = null;
        render();
      };

      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') {
          editingId = null;
          render();
        }
      });
      editInput.addEventListener('blur', commitEdit);

      body.appendChild(editInput);
      setTimeout(() => editInput.focus(), 0);
    } else {
      const textEl = document.createElement('div');
      textEl.className = 'task-text';
      textEl.textContent = todo.text;
      body.appendChild(textEl);

      const meta = document.createElement('div');
      meta.className = 'task-meta';

      const catPill = document.createElement('span');
      catPill.className = 'pill pill-category';
      catPill.textContent = `${CATEGORY_ICONS[todo.category] || '💙'} ${todo.category}`;
      meta.appendChild(catPill);

      const prioPill = document.createElement('span');
      prioPill.className = `pill pill-priority-${todo.priority}`;
      prioPill.textContent = PRIORITY_LABELS[todo.priority] || todo.priority;
      meta.appendChild(prioPill);

      if (todo.due) {
        const duePill = document.createElement('span');
        duePill.className = 'pill pill-due';
        duePill.textContent = `📅 ${formatDueDate(todo.due)}`;
        meta.appendChild(duePill);
      }

      body.appendChild(meta);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-btn';
    editBtn.title = 'Edit tugas';
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => {
      editingId = todo.id;
      render();
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'icon-btn delete';
    delBtn.title = 'Hapus tugas';
    delBtn.textContent = '🗑️';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkBtn);
    li.appendChild(body);
    li.appendChild(actions);
    taskList.appendChild(li);
  });

  updateProgress();
}

function addTodo(text, category, priority, due) {
  todos.unshift({
    id: generateId(),
    text,
    category,
    priority,
    due,
    completed: false,
  });
  saveTodos();
  render();
  setStitchMood('added');
}

function toggleTodo(id, btnEl) {
  const target = todos.find((t) => t.id === id);
  if (!target) return;
  target.completed = !target.completed;
  saveTodos();
  render();

  if (target.completed) {
    spawnSparkles(btnEl);
    const allDone = todos.length > 0 && todos.every((t) => t.completed);
    setStitchMood(allDone ? 'allDone' : 'completed');
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

// Event Listeners
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  addTodo(text, taskCategory.value, taskPriority.value, taskDue.value);
  taskInput.value = '';
  taskDue.value = '';
  taskInput.focus();
});

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  render();
});

clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
});

stitchMascot.addEventListener('click', () => {
  setStitchAvatar(currentAvatarIdx + 1);
  setStitchMood('idle');
  spawnSparkles(stitchMascot);
});

function renderBackgroundCollage() {
  if (!bgStitchCollage) return;
  bgStitchCollage.innerHTML = '';
  const totalTiles = 32;
  for (let i = 0; i < totalTiles; i++) {
    const filename = STITCH_IMAGES[i % STITCH_IMAGES.length];
    const tile = document.createElement('div');
    tile.className = 'bg-stitch-tile';

    const img = document.createElement('img');
    img.src = encodeURIComponent(filename);
    img.alt = '';
    img.loading = 'lazy';

    tile.appendChild(img);
    bgStitchCollage.appendChild(tile);
  }
}

// Init
setTimeGreeting();
renderBackgroundCollage();
setStitchAvatar(currentAvatarIdx);
render();
