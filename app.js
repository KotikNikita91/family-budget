// Конфигурация
const CONFIG = {
  SHEET_URL: "ВАШ_GOOGLE_SCRIPT_URL", // Вставьте сюда URL из Apps Script
  CATEGORIES: [
    "Продукты", "Кафе", "Транспорт", 
    "Развлечения", "Здоровье", "Другое"
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
  tabBtns: document.querySelectorAll('.tab-btn')
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Переключение вкладок
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Добавление расхода
  elements.addBtn.addEventListener('click', addExpense);
  
  // Загрузка данных и графиков
  loadData();
});

// Функции
function switchTab(tabId) {
  elements.tabContents.forEach(content => {
    content.classList.remove('active');
    if (content.id === tabId) {
      content.classList.add('active');
    }
  });

  elements.tabBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    }
  });

  if (tabId === 'stats') {
    updateCharts();
  }
}

async function addExpense() {
  const author = document.querySelector('input[name="author"]:checked').value;
  
  const expense = {
    amount: elements.amount.value,
    category: elements.category.value,
    comment: elements.comment.value,
    author: author
  };

  if (!expense.amount || isNaN(expense.amount)) {
    alert("Укажите корректную сумму!");
    return;
  }

  try {
    const response = await fetch(CONFIG.SHEET_URL, {
      method: 'POST',
      body: JSON.stringify(expense)
    });
    
    if (response.ok) {
      elements.amount.value = '';
      elements.comment.value = '';
      alert("Расход успешно добавлен!");
      loadData();
    }
  } catch (error) {
    alert("Ошибка при сохранении: " + error.message);
  }
}

async function loadData() {
  try {
    const response = await fetch(CONFIG.SHEET_URL);
    window.expenseData = await response.json();
    updateCharts();
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
}

function updateCharts() {
  if (!window.expenseData || window.expenseData.length === 0) return;
  
  // Анализ данных
  const monthlyData = analyzeMonthlyData();
  const categoryData = analyzeCategoryData();
  
  // График по месяцам
  const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(monthlyCtx, {
    type: 'bar',
    data: {
      labels: monthlyData.labels,
      datasets: [{
        label: 'Расходы по месяцам',
        data: monthlyData.amounts,
        backgroundColor: CONFIG.COLORS[0],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
  
  // График по категориям
  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: categoryData.labels,
      datasets: [{
        data: categoryData.amounts,
        backgroundColor: CONFIG.COLORS,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}

function analyzeMonthlyData() {
  // Группировка по месяцам
  const months = {};
  
  window.expenseData.forEach(expense => {
    const date = new Date(expense.date);
    const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;
    
    if (!months[monthYear]) {
      months[monthYear] = 0;
    }
    
    months[monthYear] += parseFloat(expense.amount);
  });
  
  return {
    labels: Object.keys(months),
    amounts: Object.values(months)
  };
}

function analyzeCategoryData() {
  // Группировка по категориям
  const categories = {};
  
  window.expenseData.forEach(expense => {
    if (!categories[expense.category]) {
      categories[expense.category] = 0;
    }
    
    categories[expense.category] += parseFloat(expense.amount);
  });
  
  return {
    labels: Object.keys(categories),
    amounts: Object.values(categories)
  };
}
