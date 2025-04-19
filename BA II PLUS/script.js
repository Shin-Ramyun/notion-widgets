// When the page loads, initialize the default mode.
window.onload = switchMode;

function switchMode() {
  let mode = document.getElementById("modeSelect").value;
  let calcArea = document.getElementById("calcArea");
  
  // Clear current content:
  calcArea.innerHTML = '';

  if (mode === "TVM") {
    // Inject TVM module HTML:
    calcArea.innerHTML = `
      <h3>TVM Calculation</h3>
      <form id="tvmForm">
        <div class="input-group">
          <label for="pv">PV:</label>
          <input type="number" id="pv" value="0" step="any">
        </div>
        <div class="input-group">
          <label for="pmt">PMT:</label>
          <input type="number" id="pmt" value="0" step="any">
        </div>
        <div class="input-group">
          <label for="iy">I/Y (%):</label>
          <input type="number" id="iy" value="0" step="any">
        </div>
        <div class="input-group">
          <label for="n">N (Periods):</label>
          <input type="number" id="n" value="0">
        </div>
        <div class="button-group">
          <button type="button" onclick="computeTVM()">CPT</button>
          <button type="button" onclick="clearTVM()">CLR</button>
        </div>
      </form>
      <div id="result">Result will be displayed here</div>
    `;
  } else if (mode === "CF") {
    calcArea.innerHTML = `<h3>Cash Flow Module</h3>
      <p>Cash Flow functionality to be added.</p>`;
  } else if (mode === "BOND") {
    calcArea.innerHTML = `<h3>Bond Module</h3>
      <p>Bond pricing functionality to be added.</p>`;
  } else if (mode === "DEP") {
    calcArea.innerHTML = `<h3>Depreciation Module</h3>
      <p>Depreciation functionality to be added.</p>`;
  }
}

function computeTVM() {
  // Retrieve and convert input values for TVM calculation:
  let pv = parseFloat(document.getElementById("pv").value);
  let pmt = parseFloat(document.getElementById("pmt").value);
  let iy = parseFloat(document.getElementById("iy").value) / 100;
  let n = parseFloat(document.getElementById("n").value);
  
  let resultDiv = document.getElementById("result");
  
  // Basic validation:
  if (isNaN(pv) || isNaN(pmt) || isNaN(iy) || isNaN(n)) {
    resultDiv.textContent = "Invalid input!";
    return;
  }
  
  // Calculate Future Value (FV) using TVM formula:
  // FV = PV * (1 + i)^n + PMT * [((1 + i)^n - 1) / i]
  let fv;
  if (iy === 0) {
    fv = pv + pmt * n;
  } else {
    fv = pv * Math.pow(1 + iy, n) + pmt * ((Math.pow(1 + iy, n) - 1) / iy);
  }
  
  resultDiv.textContent = `FV = ${fv.toFixed(2)}`;
}

function clearTVM() {
  // Reset all TVM input fields and result display:
  document.getElementById("pv").value = 0;
  document.getElementById("pmt").value = 0;
  document.getElementById("iy").value = 0;
  document.getElementById("n").value  = 0;
  document.getElementById("result").textContent = "Result will be displayed here";
}
