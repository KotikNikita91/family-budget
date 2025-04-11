// Конфигурация
const CONFIG = {
  SHEET_URL: "ВАШ_GOOGLE_SCRIPT_URL",
  CATEGORIES: [
    { name: "Продукты", icon: "shopping-basket" },
    { name: "Кафе", icon: "utensils" },
    { name: "Транспорт", icon: "bus" },
    { name: "Развлечения", icon: "gamepad" },
    { name: "Здоровье", icon: "heartbeat" },
    { name: "Другое", icon: "ellipsis-h" }
  ],
  COLORS: [
    '#6c5ce7', '#00b894', '#0984e3', 
    '#e17055', '#fd79a8', '#fdcb6e'
  ]
};

// DOM элементы
const elements = {
  amount: document.getElementById('amount'),
  category: document.getElementById('category'),
  comment: document.getElementById('comment'),
  addBtn: document.getElementById('add-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  themeSwitcher: document.getElementById('themeSwitcher')
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Инициализация темы
  initTheme();
  
  // Переключение вкладок
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Добавление расхода
  elements.addBtn.addEventListener('click', addExpense);
  
  // Переключение темы
  elements.themeSwitcher.addEventListener('click', toggleTheme);
  
  // Загрузка данных
  loadData();
});

// Инициализация темы
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// Переключение темы
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

// Обновление иконки темы
function updateThemeIcon(theme) {
  const icon = elements.themeSwitcher.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Переключение вкладок с анимацией
function switchTab(tabId) {
  elements.tabContents.forEach(content => {
    if (content.id === tabId) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  elements.tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (tabId === 'stats') {
    updateCharts();
  }
}

// Остальные функции (addExpense, loadData, updateCharts и т.д.) остаются без изменений
// из предыдущего примера, но вы можете их оптимизировать аналогично
