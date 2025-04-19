// Store the focused input field
let activeInput = null;

// Function to set the active input field when clicked
document.querySelectorAll(".inputs input").forEach(input => {
  input.addEventListener("focus", () => {
    activeInput = input;
  });
});

// Function to append values via the keypad
function appendValue(value) {
  if (activeInput) {
    activeInput.value += value;
  }
}

// Calculation Function
function calculate() {
  const PV = parseFloat(document.getElementById("PV").value);
  const FV = parseFloat(document.getElementById("FV").value);
  const N = parseFloat(document.getElementById("N").value);
  const IY = parseFloat(document.getElementById("IY").value) / 100;

  const screen = document.getElementById("screen");

  if (PV && FV && N && IY) {
    const calculation = PV * Math.pow(1 + IY, N); // Example calculation: FV
    screen.textContent = `Result: ${calculation.toFixed(2)}`;
  } else {
    screen.textContent = "Please enter all values!";
  }
}

// Clear Function
function clearScreen() {
  document.getElementById("PV").value = "";
  document.getElementById("FV").value = "";
  document.getElementById("N").value = "";
  document.getElementById("IY").value = "";
  document.getElementById("screen").textContent = "Result will appear here";
}
