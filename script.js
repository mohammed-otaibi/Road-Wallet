// Firebase configuration remains unchanged
const firebaseConfig = {
  .....
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Travelers Management Logic
const manageTravelersBtn = document.getElementById("manageTravelers");
const travelerModal = document.getElementById("travelerModal");
const closeModalBtn = document.getElementById("closeModal");
const travelerForm = document.getElementById("travelerForm");
const travelerList = document.getElementById("travelerList");
let travelers = [];

// Custom Alert Function
function showCustomAlert(message, type = "info") {
  const alertBox = document.getElementById("customAlert");

  // Set message and styles
  alertBox.textContent = message;
  alertBox.className = ""; // Reset classes
  alertBox.classList.add("visible"); // Make the alert visible

  // Set background color based on type
  switch (type) {
    case "success":
      alertBox.style.backgroundColor = "#28a745";
      break;
    case "error":
      alertBox.style.backgroundColor = "#dc3545";
      break;
    case "warning":
      alertBox.style.backgroundColor = "#ffc107";
      break;
    default:
      alertBox.style.backgroundColor = "#007bff";
  }

  // Show alert for 3 seconds
  setTimeout(() => {
    alertBox.classList.remove("visible");
    alertBox.classList.add("hidden");
  }, 3000);
}

// Show the modal
manageTravelersBtn.addEventListener("click", () => {
  // Get total expenses and convert to number
  const totalExpenses = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;
  if (travelers.length > 0) {
    updateTravelerList();
  }
  travelerModal.classList.remove("hidden");
});

// Close the modal
closeModalBtn.addEventListener("click", () => {
  travelerModal.classList.add("hidden");
});

// Add traveler
travelerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const travelerName = document.getElementById("travelerName").value.trim();

  if (!travelerName) {
    showCustomAlert("Please enter a traveler name.", "warning");
    return;
  }

  if (travelers.includes(travelerName)) {
    showCustomAlert("This traveler name already exists. Please enter a unique name.", "error");
    return;
  }

  travelers.push(travelerName);
  updateTravelerList();
  showCustomAlert("Traveler added successfully!", "success");
  travelerForm.reset();
});

// Update traveler list
function updateTravelerList() {
  travelerList.innerHTML = ""; // Clear the list
  const totalExpenses = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;
  const perTravelerAmount = travelers.length > 0 ? (totalExpenses / travelers.length).toFixed(2) : 0;

  travelers.forEach((traveler, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${traveler} owes: $${perTravelerAmount}`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.marginLeft = "10px";
    deleteButton.addEventListener("click", () => {
      travelers.splice(index, 1);
      updateTravelerList();
      showCustomAlert("Traveler deleted successfully!", "success");
    });

    listItem.appendChild(deleteButton);
    travelerList.appendChild(listItem);
  });
}

// Expenses Logic
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("category").value = "Food";
});

document.getElementById("expenseForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!category || isNaN(amount) || amount <= 0) {
    showCustomAlert("Please enter valid data!", "warning");
    return;
  }

  const newExpenseRef = database.ref("expenses").push();
  newExpenseRef.set({
    category: category,
    amount: amount,
    timestamp: new Date().toISOString()
  })
    .then(() => {
      showCustomAlert("Expense added successfully!", "success");
      document.getElementById("expenseForm").reset();
      loadExpenses();
    })
    .catch((error) => {
      console.error("Error adding expense:", error);
      showCustomAlert("Error adding expense. Please try again.", "error");
    });
});

// Load and display expenses
function loadExpenses() {
  const expenseList = document.getElementById("expenseList");
  const totalExpensesSpan = document.getElementById("totalExpenses");
  let totalExpenses = 0;
  expenseList.innerHTML = "";

  database.ref("expenses").once("value", (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const expense = childSnapshot.val();
      const expenseId = childSnapshot.key;
      totalExpenses += expense.amount;

      const listItem = document.createElement("li");
      listItem.textContent = `${expense.category}: $${expense.amount.toFixed(2)}`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.style.marginLeft = "10px";
      deleteButton.addEventListener("click", () => deleteExpense(expenseId));

      listItem.appendChild(deleteButton);
      expenseList.appendChild(listItem);
    });

    totalExpensesSpan.textContent = `$${totalExpenses.toFixed(2)}`;
  });
}

// Delete an expense
function deleteExpense(expenseId) {
  database.ref(`expenses/${expenseId}`).remove()
    .then(() => {
      showCustomAlert("Expense deleted successfully!", "success");
      loadExpenses();
    })
    .catch((error) => {
      console.error("Error deleting expense:", error);
      showCustomAlert("Error deleting expense. Please try again.", "error");
    });
}

// Load expenses on page load
window.onload = function () {
  loadExpenses();
};
