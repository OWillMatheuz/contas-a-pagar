const accountForm = document.getElementById("accountForm");
const accountsContainer = document.getElementById("accountsContainer");

let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

function updateLocalStorage() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

function renderAccounts() {
  accountsContainer.innerHTML = "";

  const accountsByMonth = {};
  accounts.forEach((account) => {
    const monthYear = account.date.substring(0, 7); // Obtém o mês e ano (YYYY-MM)
    if (!accountsByMonth[monthYear]) {
      accountsByMonth[monthYear] = [];
    }
    accountsByMonth[monthYear].push(account);
  });

  for (const monthYear in accountsByMonth) {
    const monthContainer = document.createElement("div");
    const monthTitle = document.createElement("h3");
    monthTitle.textContent = getMonthName(monthYear);
    monthContainer.appendChild(monthTitle);

    const table = document.createElement("table");
    table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Observações</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
    const tbody = table.querySelector("tbody");

    let totalValueToPay = 0;
    let totalValuePaid = 0;

    accountsByMonth[monthYear].forEach((account, index) => {
      const row = document.createElement("tr");

      const daysUntilDue = calculateDaysUntilDue(account.date);
      let alertClass = "";
      if (daysUntilDue < 0 && account.type !== "Pago") {
        alertClass = "alert-overdue";
      } else if (daysUntilDue === 1 && account.type !== "Pago") {
        alertClass = "alert-close";
      } else if (account.type === "Pago") {
        alertClass = "paid-account";
      } else {
        alertClass = "alert-on-time";
      }

      row.innerHTML = `
                <td>${account.name}</td>
                <td>${formatDate(account.date)}</td>
                <td>${account.type}</td>
                <td>R$ ${formatCurrency(account.value)}</td>
                <td>${account.observations}</td>
                <td>
                    <button class="edit-btn" onclick="editAccount(${index})">Editar</button>
                    <button class="delete-btn" onclick="deleteAccount(${index})">Excluir</button>
                </td>
            `;

      row.classList.add(alertClass);
      tbody.appendChild(row);

      totalValueToPay += account.value;

      if (account.type === "Pago") {
        totalValuePaid += account.value;
      }
    });

    const remainingValue = totalValueToPay - totalValuePaid;
    const totalRowToPay = document.createElement("tr");
    totalRowToPay.innerHTML = `
            <td colspan="3"><strong>Total a Pagar:</strong></td>
            <td colspan="3"><strong>R$ ${formatCurrency(totalValueToPay)}</strong></td>
        `;
    const totalRowPaid = document.createElement("tr");
    totalRowPaid.innerHTML = `
            <td colspan="3"><strong>Total Pago:</strong></td>
            <td colspan="3"><strong>R$ ${formatCurrency(totalValuePaid)}</strong></td>
        `;
    const totalRowRemaining = document.createElement("tr");
    totalRowRemaining.innerHTML = `
            <td colspan="3"><strong>Total Restante:</strong></td>
            <td colspan="3"><strong>R$ ${formatCurrency(remainingValue)}</strong></td>
        `;
    tbody.appendChild(totalRowToPay);
    tbody.appendChild(totalRowPaid);
    tbody.appendChild(totalRowRemaining);

    monthContainer.appendChild(table);
    accountsContainer.appendChild(monthContainer);
  }
}

function calculateDaysUntilDue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = dueDate.split('-');
  const due = new Date(year, month - 1, day);
  const timeDiff = due.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
  return parseFloat(value).toFixed(2).replace(".", ",");
}

function getMonthName(monthYear) {
  const [year, month] = monthYear.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleString("pt-BR", { month: "long", year: "numeric" });
}

accountForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const account = {
    name: accountForm.name.value,
    date: accountForm.date.value,
    type: accountForm.type.value,
    value: parseFloat(accountForm.value.value.replace(",", ".")),
    observations: accountForm.observations.value,
  };

  if (accountForm.dataset.mode === "edit") {
    const editIndex = parseInt(accountForm.dataset.index);
    accounts[editIndex] = account;
    accountForm.dataset.mode = "add";
    accountForm.querySelector('button[type="submit"]').textContent = "Adicionar Conta";
    alert("Conta atualizada com sucesso!");
  } else {
    accounts.push(account);
    alert("Conta adicionada com sucesso!");
  }

  updateLocalStorage();
  renderAccounts();
  accountForm.reset();
});

function editAccount(index) {
  const account = accounts[index];
  accountForm.name.value = account.name;
  accountForm.date.value = account.date;
  accountForm.type.value = account.type;
  accountForm.value.value = account.value.toString().replace(".", ",");
  accountForm.observations.value = account.observations;

  accountForm.dataset.mode = "edit";
  accountForm.dataset.index = index;
  accountForm.querySelector('button[type="submit"]').textContent = "Salvar Edição";

  alert("Editando conta...");
}

function deleteAccount(index) {
  if (confirm("Tem certeza que quer excluir esta conta?")) {
    accounts.splice(index, 1);
    updateLocalStorage();
    renderAccounts();
    alert("Conta excluída com sucesso!");
  }
}

renderAccounts();
