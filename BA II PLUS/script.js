let inputs = {};

function input(value) {
  const screen = document.getElementById("screen");
  if (!inputs[value]) {
    inputs[value] = prompt(`Enter ${value}:`);
  }
  screen.textContent = JSON.stringify(inputs);
}

function calculate() {
  const screen = document.getElementById("screen");
  const PV = parseFloat(inputs['PV']);
  const FV = parseFloat(inputs['FV']);
  const N = parseFloat(inputs['N']);
  const IY = parseFloat(inputs['I/Y']) / 100;

  if (PV && FV && N && IY) {
    const calculation = PV * Math.pow(1 + IY, N); // Example formula for Future Value
    screen.textContent = `Result: ${calculation.toFixed(2)}`;
  } else {
    screen.textContent = "Incomplete Inputs!";
  }
}

function clearScreen() {
  inputs = {};
  document.getElementById("screen").textContent = "";
}
