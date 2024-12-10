if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
}

const transactionsTable = document.getElementById('transactions');
const totalCreditElem = document.getElementById('totalCredit');
const totalDebitElem = document.getElementById('totalDebit');

document.getElementById('filterType').addEventListener('change', loadTransactions);
document.getElementById('sortTransactions').addEventListener('change', loadTransactions);

function loadTransactions() {
    let transactions = JSON.parse(localStorage.getItem('transactions'));
    const filterType = document.getElementById('filterType').value;
    const sortType = document.getElementById('sortTransactions').value;

    if (filterType !== 'all') {
        transactions = transactions.filter(t => t.type === filterType);
    }

    transactions.sort((a, b) => {
        if (sortType === 'dateDesc') return new Date(b.datetime) - new Date(a.datetime);
        if (sortType === 'dateAsc') return new Date(a.datetime) - new Date(b.datetime);
        if (sortType === 'amountDesc') return b.amount - a.amount;
        if (sortType === 'amountAsc') return a.amount - b.amount;
    });

    transactionsTable.innerHTML = '';
    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.amount}</td>
      <td>${new Date(transaction.datetime).toLocaleString()}</td>
      <td>${transaction.type}</td>
    `;
        transactionsTable.appendChild(row);

        if (transaction.type === 'credit') totalCredit += transaction.amount;
        else totalDebit += transaction.amount;
    });

    totalCreditElem.textContent = totalCredit.toFixed(2);
    totalDebitElem.textContent = totalDebit.toFixed(2);
}

document.getElementById('addTransaction').addEventListener('click', () => {
    const name = document.getElementById('name').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const datetime = document.getElementById('datetime').value;
    const type = document.getElementById('type').value;

    if (!name || !amount || !datetime) {
        alert('Please fill in all fields');
        return;
    }

    const newTransaction = { name, amount, datetime, type };
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    loadTransactions();

    document.getElementById('name').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('datetime').value = '';
});

function updateChart() {
    const transactions = JSON.parse(localStorage.getItem('transactions'));

    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach(t => {
        if (t.type === 'credit') totalCredit += t.amount;
        else totalDebit += t.amount;
    });

    financeChart.data.datasets[0].data = [totalCredit, totalDebit];
    financeChart.update();
}

const ctx = document.getElementById('financeChart').getContext('2d');
const financeChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Credit', 'Debit'],
        datasets: [{
            label: 'Amount',
            data: [0, 0],
            backgroundColor: ['#4caf50', '#f44336'],
            borderColor: ['#388e3c', '#d32f2f'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

document.getElementById('addTransaction').addEventListener('click', () => {
    loadTransactions();
    updateChart();
});

loadTransactions();
updateChart();
