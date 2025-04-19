// Ensure the script runs only after the DOM is loaded.
document.addEventListener("DOMContentLoaded", () => {
  // Global state variables.
  let currentInput = "";
  let activeParameter = null;
  const parameters = {
    PV: null,
    PMT: null,
    IY: null,
    N: null
  };

  // Cache DOM elements.
  const display = document.getElementById("calc-display");

  // Update the assigned values preview area.
  function updateAssignedValues() {
    document.getElementById("val-pv").textContent = parameters.PV !== null ? parameters.PV : "-";
    document.getElementById("val-pmt").textContent = parameters.PMT !== null ? parameters.PMT : "-";
    document.getElementById("val-iy").textContent = parameters.IY !== null ? parameters.IY : "-";
    document.getElementById("val-n").textContent = parameters.N !== null ? parameters.N : "-";
  }

  // Update the display area.
  function updateDisplay() {
    display.textContent = currentInput || "0";
  }

  // Handle numeric button input.
  document.querySelectorAll(".btn.num").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const value = e.target.getAttribute("data-num");
      // Append the digit or decimal point.
      currentInput += value;
      updateDisplay();
    });
  });

  // Handle operation keys.
  document.querySelectorAll(".btn.op").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const op = e.target.getAttribute("data-op");
      if (op === "CLR") {
        // Clear current input.
        currentInput = "";
        updateDisplay();
      } else if (op === "DEL") {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
      } else if (op === "+/-") {
        if (currentInput) {
          if (currentInput.startsWith("-")) {
            currentInput = currentInput.slice(1);
          } else {
            currentInput = "-" + currentInput;
          }
          updateDisplay();
        }
      } else if (op === "CPT") {
        // Perform the TVM computation.
        computeTVM();
      }
    });
  });

  // Handle function keys for storing a value as a parameter.
  document.querySelectorAll(".btn.func").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const func = e.target.getAttribute("data-func");
      // If there’s no current input, assume zero.
      if (currentInput === "") {
        parameters[func] = 0;
      } else {
        parameters[func] = parseFloat(currentInput);
      }
      activeParameter = func;
      currentInput = "";
      updateDisplay();
      updateAssignedValues();
    });
  });

  // Compute Future Value (FV) based on TVM formula:
  // FV = PV * (1 + i)^N + PMT * (( (1 + i)^N - 1 ) / i)
  function computeTVM() {
    let PV = parameters.PV !== null ? parameters.PV : 0;
    let PMT = parameters.PMT !== null ? parameters.PMT : 0;
    let IY = parameters.IY !== null ? parameters.IY / 100 : 0;
    let N = parameters.N !== null ? parameters.N : 0;
    
    let FV;
    if (IY === 0) {
      FV = PV + PMT * N;
    } else {
      FV = PV * Math.pow(1 + IY, N) + PMT * ((Math.pow(1 + IY, N) - 1) / IY);
    }
    display.textContent = "FV = " + FV.toFixed(2);
  }
});
