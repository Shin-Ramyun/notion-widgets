const display = document.querySelector('.display');
const buttons = document.querySelector('.buttons');

let currentInput = '0';
let operator = null;
let firstOperand = null;
let waitingForSecondOperand = false;
let secondFunctionActive = false; // State for the 2nd button
let cptActive = false; // State for CPT button

const tvmVariables = {
    n: null,
    iy: null, // I/Y is typically stored as a percentage, but calculations use decimal
    pv: null,
    pmt: null,
    fv: null
};

// --- NEW: Function to get the interest rate per period (assuming annual I/Y and annual payments/compounding for now) ---
// Note: A real BA II Plus handles P/Y and C/Y separately, which impacts this calculation.
// For this simplified version, we assume annual periods, so i = IY / 100.
// We'll need to adjust this if we add P/Y and C/Y functionality.
function getRatePerPeriod(iy) {
    if (iy === null || isNaN(iy)) {
        return null; // Cannot calculate without I/Y
    }
    return iy / 100; // Assuming I/Y is entered as a percentage
}

// --- NEW: TVM Calculation Functions ---

// Calculate Future Value (FV)
function calculateFV() {
    const { n, iy, pv, pmt } = tvmVariables;
    const i = getRatePerPeriod(iy);

    // Need N, I/Y, PV, PMT to calculate FV
    if (n === null || i === null || pv === null || pmt === null) {
        return "Error: Need N, I/Y, PV, PMT";
    }

    const nNum = parseFloat(n);
    const pvNum = parseFloat(pv);
    const pmtNum = parseFloat(pmt);

    if (isNaN(nNum) || isNaN(pvNum) || isNaN(pmtNum) || isNaN(i)) {
         return "Error: Invalid Input";
    }

    // Formula for FV (assuming End mode payments)
    // FV = -PV*(1+i)^N - PMT * [((1+i)^N - 1) / i]
    // Handle case where i is 0
    if (i === 0) {
        return -pvNum - pmtNum * nNum;
    } else {
        const term1 = -pvNum * Math.pow(1 + i, nNum);
        const term2 = -pmtNum * ((Math.pow(1 + i, nNum) - 1) / i);
        return term1 + term2;
    }
}

// Calculate Present Value (PV)
function calculatePV() {
    const { n, iy, pmt, fv } = tvmVariables;
    const i = getRatePerPeriod(iy);

    // Need N, I/Y, PMT, FV to calculate PV
    if (n === null || i === null || pmt === null || fv === null) {
        return "Error: Need N, I/Y, PMT, FV";
    }

    const nNum = parseFloat(n);
    const pmtNum = parseFloat(pmt);
    const fvNum = parseFloat(fv);

     if (isNaN(nNum) || isNaN(pmtNum) || isNaN(fvNum) || isNaN(i)) {
          return "Error: Invalid Input";
     }

    // Formula for PV (assuming End mode payments)
    // PV = [-FV - PMT * [((1+i)^N - 1) / i]] / (1+i)^N
    // Handle case where i is 0
    if (i === 0) {
        return -fvNum - pmtNum * nNum; // Simplified for i = 0
    } else {
        const annuityFactor = (Math.pow(1 + i, nNum) - 1) / i;
        const term1 = -fvNum - pmtNum * annuityFactor;
        const discountFactor = Math.pow(1 + i, nNum);
        // Handle division by zero if discountFactor is 0 (e.g., very large negative N, not typical)
         if (discountFactor === 0) {
             return "Error: Calculation Issue"; // Or handle appropriately
         }
        return term1 / discountFactor;
    }
}

// Calculate Payment (PMT)
function calculatePMT() {
    const { n, iy, pv, fv } = tvmVariables;
    const i = getRatePerPeriod(iy);

    // Need N, I/Y, PV, FV to calculate PMT
    if (n === null || i === null || pv === null || fv === null) {
        return "Error: Need N, I/Y, PV, FV";
    }

    const nNum = parseFloat(n);
    const pvNum = parseFloat(pv);
    const fvNum = parseFloat(fv);

     if (isNaN(nNum) || isNaN(pvNum) || isNaN(fvNum) || isNaN(i)) {
          return "Error: Invalid Input";
     }

    // Formula for PMT (assuming End mode payments)
    // PMT = [-FV - PV * (1+i)^N] / [((1+i)^N - 1) / i]
    // Handle case where i is 0
    if (i === 0) {
        // Simplified for i = 0: -FV - PV = PMT * N
        const denominator = nNum;
         if (denominator === 0) return "Error: Calculation Issue"; // Cannot calculate if N is 0
        return (-fvNum - pvNum) / denominator;
    } else {
        const numerator = -fvNum - pvNum * Math.pow(1 + i, nNum);
        const denominator = (Math.pow(1 + i, nNum) - 1) / i;
        // Handle division by zero if denominator is 0 (e.g., N=0)
         if (denominator === 0) return "Error: Calculation Issue"; // Cannot calculate if N is 0
        return numerator / denominator;
    }
}

// Calculate Number of Periods (N)
function calculateN() {
    const { iy, pv, pmt, fv } = tvmVariables;
    const i = getRatePerPeriod(iy);

    // Need I/Y, PV, PMT, FV to calculate N
    if (i === null || pv === null || pmt === null || fv === null) {
        return "Error: Need I/Y, PV, PMT, FV";
    }

    const pvNum = parseFloat(pv);
    const pmtNum = parseFloat(pmt);
    const fvNum = parseFloat(fv);

     if (isNaN(pvNum) || isNaN(pmtNum) || isNaN(fvNum) || isNaN(i)) {
          return "Error: Invalid Input";
     }

    // Formula for N (assuming End mode payments)
    // This formula is derived by rearranging the TVM equation and using logarithms.
    // It assumes constant payments.
    // TVM equation: PV*(1+i)^N + PMT * [((1+i)^N - 1) / i] + FV = 0
    // Rearranging to solve for N is complex. The formula below is for a specific case
    // where PMT and FV have the same sign, or PMT and PV have opposite signs.
    // A more general approach might be needed, or use a financial library.

    // Let's use a common algebraic solution for N where PMT != 0
     if (pmtNum === 0) {
          // If PMT is 0, the equation simplifies: PV*(1+i)^N + FV = 0
          // (1+i)^N = -FV / PV
          // N * log(1+i) = log(-FV / PV)
          // N = log(-FV / PV) / log(1+i)
           if (pvNum === 0) return "Error: Need PV"; // Cannot divide by zero
           const ratio = -fvNum / pvNum;
           if (ratio <= 0) return "Error: Invalid Input"; // Log of non-positive
           const logRatio = Math.log(ratio);
           const logOnePlusI = Math.log(1 + i);
            if (logOnePlusI === 0) return "Error: Calculation Issue"; // Log of 1 (i=0)
           return logRatio / logOnePlusI;

     } else {
          // Case where PMT != 0
          // This formula is sensitive to signs and edge cases.
          // Derived from: PMT/i + (PV + PMT/i)*(1+i)^N + FV = 0 (rearranged TVM)
          // (PV + PMT/i)*(1+i)^N = -FV - PMT/i
          // (1+i)^N = (-FV - PMT/i) / (PV + PMT/i)
          // N = log[(-FV - PMT/i) / (PV + PMT/i)] / log(1+i)

          if (i === 0) {
               // Handle i = 0 case for N
               // Simplified: PV + PMT*N + FV = 0
               // PMT*N = -PV - FV
               // N = (-PV - FV) / PMT
               if (pmtNum === 0) return "Error: Need PMT"; // Already handled above, but double check
               return (-pvNum - fvNum) / pmtNum;
          } else {
               const termNumerator = -fvNum - pmtNum / i;
               const termDenominator = pvNum + pmtNum / i;

               if (termDenominator === 0) return "Error: Calculation Issue"; // Division by zero
               const ratio = termNumerator / termDenominator;

                if (ratio <= 0) {
                    // This often indicates no solution or multiple solutions depending on cash flow signs
                    return "Error: No Solution"; // Or a specific BA II Plus error
                }

               const logRatio = Math.log(ratio);
               const logOnePlusI = Math.log(1 + i);

               if (logOnePlusI === 0) return "Error: Calculation Issue"; // Log of 1 (i=0)

               return logRatio / logOnePlusI;
          }
     }
}


// Calculate Interest Rate (I/Y) - This is complex and often requires numerical methods.
// We'll use a simplified iterative approach (e.g., bisection or a few iterations of Newton's method).
// A common function to find the root of the TVM equation f(i) = PV(1+i)^N + PMT * [((1+i)^N - 1) / i] + FV = 0
// We are looking for the value of i that makes f(i) ≈ 0.

function calculateIY() {
    const { n, pv, pmt, fv } = tvmVariables;

    // Need N, PV, PMT, FV to calculate I/Y
    if (n === null || pv === null || pmt === null || fv === null) {
        return "Error: Need N, PV, PMT, FV";
    }

    const nNum = parseFloat(n);
    const pvNum = parseFloat(pv);
    const pmtNum = parseFloat(pmt);
    const fvNum = parseFloat(fv);

     if (isNaN(nNum) || isNaN(pvNum) || isNaN(pmtNum) || isNaN(fvNum)) {
          return "Error: Invalid Input";
     }

    // Handle edge cases:
    if (nNum <= 0) return "Error: Invalid N";

    // Special case: If PV + PMT*N + FV = 0 (simplified for i=0), then I/Y = 0
     if (pvNum + pmtNum * nNum + fvNum === 0) {
          return 0; // Interest rate is 0%
     }

    // Use a simple iterative method to find 'i'.
    // We need a function that represents the TVM equation solved for 0:
    // f(i) = PV*(1+i)^N + PMT * [((1+i)^N - 1) / i] + FV
    // We are looking for 'i' such that f(i) is close to zero.

    // Let's use a simplified iterative guess-and-check method.
    // We'll make guesses for 'i' and see if f(i) is close to zero.
    // This is not as robust as Newton-Raphson but simpler to implement.

    // Define the TVM function f(i) assuming End mode
    const tvmFunction = (i) => {
         if (i === 0) {
              return pvNum + pmtNum * nNum + fvNum; // Limit as i approaches 0
         } else {
              return pvNum * Math.pow(1 + i, nNum) + pmtNum * ((Math.pow(1 + i, nNum) - 1) / i) + fvNum;
         }
    };

    // Simple Bisection Method (Requires finding an interval [a, b] where f(a) and f(b) have opposite signs)
    // This can be tricky to find guaranteed bounds.

    // Alternative: Simple iterative method based on rearrangement or a few steps of Newton's method (requires derivative).
    // Let's try a fixed-point iteration based on rearranging for i, though convergence is not guaranteed.
    // A common approach for financial calculators is a variant of Newton's method.

    // Let's implement a basic iterative solver. We'll start with a guess and refine it.
    // This implementation might not cover all edge cases or guarantee convergence like a professional library.

    let guess = 0.1; // Initial guess for 'i' (10%)
    const tolerance = 0.0000001; // Acceptable error margin for f(i) ≈ 0
    const maxIterations = 1000; // Prevent infinite loops

    for (let iter = 0; iter < maxIterations; iter++) {
        const f_i = tvmFunction(guess);

        if (Math.abs(f_i) < tolerance) {
            // Found a solution within tolerance. Convert back to percentage.
            return guess * 100;
        }

        // Need a way to update the guess.
        // Without the derivative (for Newton's method), a simple update rule is less effective.
        // A more robust approach is needed here for a reliable I/Y calculation.

        // Let's try a simple step adjustment based on the sign of f_i.
        // This is very basic and might not converge quickly or at all.
        if (f_i > 0) {
            guess = guess - 0.001; // If function value is positive, the rate is too high
        } else {
            guess = guess + 0.001; // If function value is negative, the rate is too low
        }

        // More advanced solvers use derivatives (Newton's method) or interval narrowing (bisection).
        // Implementing a full, robust solver is complex.

        // Let's refine the simple iterative approach. Instead of a fixed step,
        // let's try a simple derivative approximation or a small percentage adjustment.

         // Using a rough derivative approximation for Newton-like update: f'(i) ≈ (f(i + small_delta) - f(i)) / small_delta
         const delta = 0.0001; // Small change for derivative approximation
         const f_prime_i_approx = (tvmFunction(guess + delta) - f_i) / delta;

         if (f_prime_i_approx === 0) {
              // Avoid division by zero
              return "Error: Calculation Issue"; // Or try a different method
         }

         // Newton's method update rule: guess = guess - f(i) / f'(i)
         guess = guess - f_i / f_prime_i_approx;

         // Prevent the guess from becoming non-positive, as (1+i)^N is involved
         if (guess <= -1) {
              // If the guess goes below -1 (rate < -100%), it's invalid for (1+i)^N
              // The solution might not exist or is outside reasonable bounds.
              // Try resetting the guess or indicating an error.
              // Let's try resetting to a small positive value and continue iterations,
              // or indicate an error if it happens repeatedly.
              console.warn("IY guess went below -1. Resetting.");
              guess = 0.001; // Reset to a small positive rate
              // Or, decide this means no valid solution was found within bounds/iterations
              // return "Error: No Real Solution";
         }

         // Optional: Check for convergence based on guess change size as well
         // if (Math.abs(guess - previousGuess) < tolerance) { ... }
         // Need to store previous guess for this.
    }

    // If the loop finishes without finding a solution within tolerance
    return "Error: No Convergence"; // Or "Error: Check Inputs"
}


// Function to update the display
function updateDisplay() {
    // --- NEW: Add basic formatting for numbers before displaying ---
    let displayedValue = currentInput;

    // If the currentInput is a number string and not an error message or TVM display
    if (!isNaN(parseFloat(currentInput)) && !currentInput.includes('=')) {
        const num = parseFloat(currentInput);
        // Limit decimal places, similar to a calculator display
        // Maybe use toFixed, but handle trailing zeros and significant digits later
        // For now, a simple toFixed(6) or similar might work.
        // Or, allow user to control decimal places (another feature).
        // Let's just display the string value from currentInput for now,
        // but calculations should use floating-point numbers.
        // When displaying results of calculations, we will format them.
    }

    // Ensure display doesn't overflow - CSS handles text-overflow: ellipsis, but maybe limit length
    // For simplicity, let CSS handle basic overflow display.

    display.textContent = currentInput; // Display the raw string for now
}

// Function to display TVM variables
function displayTvmVariable(variableName) {
    const value = tvmVariables[variableName.toLowerCase()];
    // Format the display, e.g., "N = 10.00"
    // Use toFixed for consistent decimal places when showing stored variables
    const formattedValue = value !== null ? parseFloat(value).toFixed(6) : '0.000000'; // Show more decimals for precision
    currentInput = `${variableName.toUpperCase()} = ${formattedValue}`;
    updateDisplay();
}


// Function to handle digit and decimal button clicks
function inputDigit(digit) {
    // If we were waiting for the second operand OR displaying a TVM variable/result OR CPT was active, start a new input
    if (waitingForSecondOperand === true || display.textContent.includes('=') || cptActive) {
        currentInput = (digit === '.') ? '0.' : digit; // Start with "0." if '.' is the first input
        waitingForSecondOperand = false;
         if (display.textContent.includes('=')) {
             updateDisplay(); // Clear the "VAR = VALUE" display before starting new input
         }
        cptActive = false; // Reset CPT state when a digit is entered
    } else {
        // Prevent multiple decimal points
        if (digit === '.' && currentInput.includes('.')) {
            return;
        }
        // Replace initial '0' unless the digit is '.'
        if (currentInput === '0' && digit !== '.') {
             currentInput = digit;
        } else {
             currentInput = currentInput + digit;
        }
    }
    updateDisplay();
}

// Function to handle operator button clicks
function handleOperator(nextOperator) {
     if (cptActive) {
         cptActive = false; // Cancel CPT state
     }

     // Use the currently displayed value as the input value for the operation
     const inputValue = parseFloat(display.textContent.includes('=') ? display.textContent.split('=')[1].trim() : currentInput);

     if (isNaN(inputValue) && currentInput !== 'Error') {
          currentInput = 'Error';
          updateDisplay();
          return;
     }

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = performCalculation[operator](firstOperand, inputValue);

        // --- NEW: Format basic calculation results ---
        if (typeof result === 'number') {
             currentInput = String(result.toFixed(8)); // Format basic calculation results
        } else {
             currentInput = String(result); // Display error messages
        }

        updateDisplay();
        firstOperand = result; // Use the result for chaining
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
}

const performCalculation = {
    '/': (firstOperand, secondOperand) => secondOperand === 0 ? 'Error: Div by 0' : firstOperand / secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    // '=' will be handled in the main event listener
};


// Function to reset the calculator (All Clear)
function resetCalculator() {
    currentInput = '0';
    operator = null;
    firstOperand = null;
    waitingForSecondOperand = false;
    secondFunctionActive = false;
    cptActive = false;
    clearTvm(); // Use the clearTvm function
    updateDisplay();
}

// Function to handle the '+/-' button
function toggleSign() {
     if (cptActive) {
         cptActive = false; // Cancel CPT state
     }

    if (display.textContent.includes('=')) {
        const [varName, varValueStr] = display.textContent.split('=');
        const varNameTrimmed = varName.trim().toLowerCase();
        const varValue = parseFloat(varValueStr);
        if (!isNaN(varValue)) {
             tvmVariables[varNameTrimmed] = varValue * -1;
             displayTvmVariable(varNameTrimmed); // Update the display with the new sign
        } else {
            // Handle case where the value next to '=' is not a number (e.g., "TVM CLEARED = ")
             currentInput = 'Error'; // Or revert to previous valid display
             updateDisplay();
        }
    } else {
        const numericValue = parseFloat(currentInput);
        if (!isNaN(numericValue)) {
            currentInput = String(numericValue * -1);
            updateDisplay();
        } else {
             // Handle case where currentInput is not a number (e.g., "Error")
             // Do nothing or show a specific error
        }
    }
}

// Function to handle the '2nd' button
function handleSecondFunction() {
    secondFunctionActive = !secondFunctionActive; // Toggle the state
    cptActive = false; // 2nd key cancels CPT
    // TODO: Add visual feedback for 2nd active state
    console.log("2nd function active:", secondFunctionActive);
}

// clearTvm function implementation
function clearTvm() {
    tvmVariables.n = null; // Use null to signify not set, rather than 0
    tvmVariables.iy = null;
    tvmVariables.pv = null;
    tvmVariables.pmt = null;
    tvmVariables.fv = null;
    console.log("TVM variables cleared:", tvmVariables);
     currentInput = 'TVM CLEARED';
     updateDisplay();
     setTimeout(() => {
         if (currentInput === 'TVM CLEARED') {
             currentInput = '0';
             updateDisplay();
         }
     }, 1000); // Show message for 1 second
}

// Function to store value in a TVM variable
function storeTvmVariable(variableName) {
     if (cptActive) {
         computeTvmVariable(variableName); // Call compute function
         cptActive = false; // Reset CPT state after computation attempt
         return;
     }

    const value = parseFloat(currentInput);
    if (!isNaN(value)) {
        tvmVariables[variableName.toLowerCase()] = value;
         displayTvmVariable(variableName); // Show the stored value on display
        console.log(`Stored ${value} in ${variableName}:`, tvmVariables);
         // After storing, the display shows the variable value, next digit input starts a new number.
         // No need to reset currentInput to '0' here, inputDigit handles starting a new number.
         waitingForSecondOperand = false; // Ensure next digit starts new input
    } else {
        currentInput = 'Error: Invalid Input';
        updateDisplay();
         waitingForSecondOperand = false; // Allow new input
    }
}

// --- NEW: Function to count how many TVM variables have values ---
function countSetTvmVariables() {
    let count = 0;
    for (const key in tvmVariables) {
        // Check if the value is not null and is a number (or can be parsed as one)
         if (tvmVariables[key] !== null && !isNaN(parseFloat(tvmVariables[key]))) {
            count++;
        }
    }
    return count;
}

// --- NEW: Main function to compute a TVM variable ---
function computeTvmVariable(variableToCompute) {
    console.log(`Attempting to compute: ${variableToCompute.toUpperCase()}`);
    cptActive = false; // Reset CPT state

    const setVariableCount = countSetTvmVariables();

    if (setVariableCount !== 4) {
        currentInput = `Error: Need 4 vars (Have ${setVariableCount})`;
        updateDisplay();
        console.error("Cannot compute:", currentInput);
        return;
    }

    let result = null;
    let error = null;

    // Identify the variable to compute and call the corresponding function
    switch (variableToCompute.toLowerCase()) {
        case 'n':
            result = calculateN();
            break;
        case 'iy':
            result = calculateIY();
            break;
        case 'pv':
            result = calculatePV();
            break;
        case 'pmt':
            result = calculatePMT();
            break;
        case 'fv':
            result = calculateFV();
            break;
        default:
            error = "Error: Unknown TVM Var";
            console.error(error);
            break;
    }

    // Handle the result of the calculation
    if (typeof result === 'number') {
        // Store the computed result in the TVM variables
        tvmVariables[variableToCompute.toLowerCase()] = result;
        // Display the result (format it)
        currentInput = String(result.toFixed(6)); // Display computed result with precision
        updateDisplay();
        console.log(`Computed ${variableToCompute.toUpperCase()} = ${result}`, tvmVariables);
    } else if (typeof result === 'string' && result.startsWith('Error')) {
        // Display the error message from the calculation function
        currentInput = result;
        updateDisplay();
        console.error("Calculation Error:", result);
    } else {
         // Unexpected result type
         currentInput = "Error: Calc Failed";
         updateDisplay();
         console.error("Unexpected calculation result:", result);
    }

     // After computation, reset waitingForSecondOperand to allow new number entry
     waitingForSecondOperand = false;
}


// Main event listener for button clicks
buttons.addEventListener('click', (event) => {
    if (!event.target.matches('button')) {
        return;
    }

    const { textContent } = event.target;
    const dataButton = event.target.dataset.button;

    // --- NEW: If CPT is active, handle the subsequent key press ---
     if (cptActive) {
         // If the next button is a TVM key, trigger compute
         if (['n', 'iy', 'pv', 'pmt', 'fv'].includes(dataButton)) {
              computeTvmVariable(dataButton);
              // cptActive is reset inside computeTvmVariable
              return; // Exit handler
         } else {
              // If CPT was active but a non-TVM key was pressed, cancel CPT state
              cptActive = false;
              // Proceed with the regular handling of the non-TVM button
         }
     }

    // If 2nd function is active, handle secondary functions first
    if (secondFunctionActive) {
        switch (dataButton) {
            case 'clrtvm':
                clearTvm(); // Clear TVM variables when 2nd + CLR TVM is pressed
                handleSecondFunction(); // Turn off 2nd function after use
                break;
            // TODO: Add cases for other 2nd + Key combinations (e.g., 2nd + N for P/Y)
            default:
                console.log(`2nd + ${textContent} pressed (data-button="${dataButton}") - Unimplemented 2nd function.`);
                handleSecondFunction(); // Turn off 2nd function
                 // Let the primary function handling below run if applicable.
        }
         // If a specific 2nd function was handled above and you DON'T want the primary action, return here.
         // For now, most unhandled 2nd+key will fall through to primary handling after 2nd state is off.
    }

    // Handle primary button functions (when 2nd is NOT active OR after an unhandled 2nd+key)
    switch (dataButton) {
        case 'plus':
        case 'minus':
        case 'multiply':
        case 'divide':
            handleOperator(textContent);
            break;
        case 'equals':
            // Perform the final calculation
            if (operator && firstOperand !== null) {
                 const inputValue = parseFloat(display.textContent.includes('=') ? display.textContent.split('=')[1].trim() : currentInput);

                 if (isNaN(inputValue) && currentInput !== 'Error') {
                      currentInput = 'Error';
                      updateDisplay();
                      firstOperand = null;
                      operator = null;
                      waitingForSecondOperand = false;
                      break;
                 }

                 const result = performCalculation[operator](firstOperand, inputValue);
                 if (typeof result === 'number') {
                      currentInput = String(result.toFixed(8)); // Format result
                 } else {
                      currentInput = String(result); // Display error
                 }
                 updateDisplay();

                 firstOperand = null; // Result is the new starting point for operations
                 operator = null;
                 waitingForSecondOperand = false;
            }
            break;
        case 'clrtvm':
             // When 2nd is NOT active, CLR TVM acts as ALL CLEAR
             resetCalculator();
             break;
        case 'plusminus':
             toggleSign();
             break;
        case '2nd':
             handleSecondFunction();
             break;

        // Handle TVM variable input
        case 'n':
        case 'iy':
        case 'pv':
        case 'pmt':
        case 'fv':
             // This case is only reached if CPT was NOT active.
             storeTvmVariable(dataButton);
             break;

        case 'cpt':
             // This case is only reached if 2nd was NOT active and CPT was NOT already active.
             cptActive = true;
             currentInput = 'CPT '; // Indicate CPT mode on display
             updateDisplay();
             console.log("CPT button pressed. Waiting for TVM variable key.");
             break;

        case 'enter':
             console.log("ENTER button pressed.");
             // For basic calculator function, ENTER acts like '='.
             // For BA II Plus worksheets, it stores data. Let's keep it like '=' for now.
             // Re-using the equals logic:
              if (operator && firstOperand !== null) {
                   const inputValue = parseFloat(display.textContent.includes('=') ? display.textContent.split('=')[1].trim() : currentInput);

                   if (isNaN(inputValue) && currentInput !== 'Error') {
                        currentInput = 'Error';
                        updateDisplay();
                        firstOperand = null;
                        operator = null;
                        waitingForSecondOperand = false;
                        break; // Exit switch
                   }

                   const result = performCalculation[operator](firstOperand, inputValue);
                    if (typeof result === 'number') {
                         currentInput = String(result.toFixed(8)); // Format result
                    } else {
                         currentInput = String(result); // Display error
                    }
                   updateDisplay();

                   firstOperand = null;
                   operator = null;
                   waitingForSecondOperand = false;
              }
             break;


        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case 'dot':
             inputDigit(textContent);
             break;

        default:
            console.log(`Button clicked: ${textContent} (data-button="${dataButton}") - Unhandled primary function.`);
            cptActive = false; // If any other button is pressed, ensure CPT state is off
    }
});

// Initialize the display when the script loads
updateDisplay();
