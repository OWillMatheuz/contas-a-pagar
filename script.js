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
    const monthYear = account.date.substring(0, 7);
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

    accountsByMonth[monthYear].forEach((account, index) => {
      const row = document.createElement("tr");

      const daysUntilDue = calculateDaysUntilDue(account.date);
      let alertClass = "";
      if (daysUntilDue < 0) {
        alertClass = "alert-overdue";
      } else if (daysUntilDue === 1) {
        alertClass = "alert-close";
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
    });

    monthContainer.appendChild(table);
    accountsContainer.appendChild(monthContainer);
  }
}

function calculateDaysUntilDue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const timeDiff = due.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
}

function formatCurrency(value) {
  return parseFloat(value).toFixed(2).replace(".", ",");
}

function getMonthName(monthYear) {
  const [year, month] = monthYear.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleString("pt-BR", { month: "long", year: "numeric" });
}

function parseDate(dateString) {
  const day = dateString.slice(0, 2);
  const month = dateString.slice(2, 4) - 1; // Ajuste para o mês ser 0-indexado
  const year = dateString.slice(4, 8);
  const date = new Date(year, month, day);
  date.setHours(date.getHours() + date.getTimezoneOffset() / 60); // Ajuste para o fuso horário
  return date.toISOString().split('T')[0];
}

accountForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const account = {
    name: accountForm.name.value,
    date: parseDate(accountForm.date.value),
    type: accountForm.type.value,
    value: parseFloat(accountForm.value.value.replace(",", ".")),
    observations: accountForm.observations.value,
  };

  if (accountForm.dataset.mode === "edit") {
    const editIndex = parseInt(accountForm.dataset.index);
    accounts[editIndex] = account;
    accountForm.dataset.mode = "add";
    accountForm.querySelector('button[type="submit"]').textContent =
      "Adicionar Conta";
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
  accountForm.date.value = account.date.split("-").reverse().join(""); // Reverte para o formato ddmmaaaa
  accountForm.type.value = account.type;
  accountForm.value.value = account.value.toString().replace(".", ",");
  accountForm.observations.value = account.observations;

  accountForm.dataset.mode = "edit";
  accountForm.dataset.index = index;
  accountForm.querySelector('button[type="submit"]').textContent =
    "Salvar Edição";

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
