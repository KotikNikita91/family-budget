const CONFIG = {
  SHEET_URL: "https://script.google.com/macros/s/AKfycbxPPXS72nG6I2rC3Zt2qR0edupwRXAKmEByu9N7lII3OVn28WfjfZFGGzTd_KdIBEgj5A/exec",
  CATEGORIES: ["Продукты", "Кафе", "Транспорт", "Развлечения", "Здоровье", "Другое"],
  COLORS: ['#b399d4', '#d4b3ff', '#c7a8e8', '#e0d0ff', '#a18bbc', '#9f86c7']
};

const elements = {
  amount: document.getElementById('amount'),
  category: document.getElementById('category'),
  comment: document.getElementById('comment'),
  addBtn: document.getElementById('add-btn'),
  errorMsg: document.getElementById('error-message'),
  tabContents: document.querySelectorAll('.tab-content'),
  tabBtns: document.querySelectorAll('.tab-btn')
};

document.addEventListener('DOMContentLoaded', () => {
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  elements.addBtn.addEventListener('click', addExpense);
  loadData();
});

async function addExpense() {
  elements.errorMsg.textContent = '';
  const author = document.querySelector('input[name="author"]:checked').value;
  
  const expense = {
    amount: elements.amount.value,
    category: elements.category.value,
    comment: elements.comment.value,
    author: author
  };

  if (!expense.amount || isNaN(expense.amount)) {
    showError("Укажите корректную сумму!");
    return;
  }

  try {
    const response = await fetch(CONFIG.SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expense)
    });

    const result = await response.text();
    if (!response.ok) throw new Error(result || 'Unknown error');

    elements.amount.value = '';
    elements.comment.value = '';
    loadData();
  } catch (error) {
    console.error('Error:', error);
    showError("Ошибка сохранения. Проверьте интернет и попробуйте снова.");
  }
}

function showError(message) {
  elements.errorMsg.textContent = message;
  setTimeout(() => elements.errorMsg.textContent = '', 5000);
}

async function loadData() {
  try {
    const response = await fetch(CONFIG.SHEET_URL);
    if (!response.ok) throw new Error('Load failed');
    window.expenseData = await response.json();
    updateCharts();
  } catch (error) {
    console.error("Load error:", error);
  }
}

function updateCharts() {
  if (!window.expenseData?.length) return;
  
  const monthlyData = analyzeMonthlyData();
  const categoryData = analyzeCategoryData();
  
  updateChart('monthlyChart', 'bar', monthlyData, CONFIG.COLORS[0]);
  updateChart('categoryChart', 'doughnut', categoryData, CONFIG.COLORS);
}

function updateChart(id, type, data, colors) {
  const ctx = document.getElementById(id).getContext('2d');
  if (window[id]) window[id].destroy();
  
  window[id] = new Chart(ctx, {
    type: type,
    data: {
      labels: data.labels,
      datasets: [{
        data: data.amounts,
        backgroundColor: Array.isArray(colors) ? colors : [colors],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { 
          position: 'right',
          labels: { font: { size: 14 } }
        }
      }
    }
  });
}

function analyzeMonthlyData() {
  const months = {};
  window.expenseData.forEach(expense => {
    const date = new Date(expense.date);
    const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;
    months[monthYear] = (months[monthYear] || 0) + parseFloat(expense.amount);
  });
  
  return {
    labels: Object.keys(months).map(m => m.replace('/', '.')),
    amounts: Object.values(months)
  };
}

function analyzeCategoryData() {
  const categories = {};
  window.expenseData.forEach(expense => {
    categories[expense.category] = (categories[expense.category] || 0) + parseFloat(expense.amount);
  });
  
  return {
    labels: Object.keys(categories),
    amounts: Object.values(categories)
  };
}

function switchTab(tabId) {
  elements.tabContents.forEach(c => c.classList.toggle('active', c.id === tabId));
  elements.tabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tabId));
  if (tabId === 'stats') updateCharts();
}
