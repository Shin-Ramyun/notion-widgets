const display = document.querySelector('.display');
const buttons = document.querySelector('.buttons');

let currentInput = '0';
let operator = null;
let firstOperand = null;
let waitingForSecondOperand = false;
let secondFunctionActive = false; // State for the 2nd button
let cptActive = false; // --- NEW: State for CPT button ---

const tvmVariables = {
    n: null,
    iy: null, // I/Y is typically stored as a percentage, but calculations use decimal
    pv: null,
    pmt: null,
    fv: null
};

// Function to update the display
function updateDisplay() {
    display.textContent = currentInput;
}

// Function to display TVM variables
function displayTvmVariable(variableName) {
    const value = tvmVariables[variableName.toLowerCase()];
    // Format the display, e.g., "N = 10.00"
    // Use toFixed for consistent decimal places, maybe based on calculator mode later
    const formattedValue = value !== null ? parseFloat(value).toFixed(2) : '0.00';
    currentInput = `${variableName.toUpperCase()} = ${formattedValue}`;
    updateDisplay();
}


// Function to handle digit and decimal button clicks
function inputDigit(digit) {
    // If we were waiting for the second operand OR displaying a TVM variable/result OR CPT was active, start a new input
    if (waitingForSecondOperand === true || display.textContent.includes('=') || cptActive) {
        currentInput = digit;
        waitingForSecondOperand = false;
         if (display.textContent.includes('=')) {
             // Clear the "VAR = VALUE" display before starting new input
             updateDisplay();
         }
        // --- NEW: Reset CPT state when a digit is entered ---
        cptActive = false;
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
         // --- NEW: Reset CPT state if it was active but a non-TVM/CPT button was pressed ---
         // This is handled by the check at the start of the event listener, but good to be explicit
          cptActive = false;
    }
    updateDisplay();
}

// Function to handle operator button clicks
function handleOperator(nextOperator) {
    // --- NEW: If CPT was active, clicking an operator is likely an error or cancels CPT state ---
     if (cptActive) {
         cptActive = false; // Cancel CPT state
         // Maybe show an error or just proceed with the operator?
         // Let's just proceed with the operator on the current input.
     }

     const inputValue = display.textContent.includes('=') ? parseFloat(display.textContent.split('=')[1].trim()) : parseFloat(currentInput);

     if (isNaN(inputValue) && currentInput !== 'Error') { // Handle cases where currentInput isn't a number
          currentInput = 'Error';
          updateDisplay();
          // Don't proceed with operator logic if input is bad
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

        currentInput = String(result);
        updateDisplay();

        firstOperand = result;
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
}

const performCalculation = {
    '/': (firstOperand, secondOperand) => secondOperand === 0 ? 'Error' : firstOperand / secondOperand,
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
    cptActive = false; // --- NEW: Reset CPT state on All Clear ---
    clearTvm(); // Use the clearTvm function
    updateDisplay();
}

// Function to handle the '+/-' button
function toggleSign() {
    // --- NEW: If CPT was active, toggleSign cancels CPT state ---
     if (cptActive) {
         cptActive = false; // Cancel CPT state
         // Then proceed with toggling the sign of the current input/display
     }

    if (display.textContent.includes('=')) {
        const [varName, varValueStr] = display.textContent.split('=');
        const varNameTrimmed = varName.trim().toLowerCase();
        const varValue = parseFloat(varValueStr);
        if (!isNaN(varValue)) {
             tvmVariables[varNameTrimmed] = varValue * -1;
             displayTvmVariable(varNameTrimmed); // Update the display with the new sign
        }
    } else {
        const numericValue = parseFloat(currentInput);
        if (!isNaN(numericValue)) {
            currentInput = String(numericValue * -1);
            updateDisplay();
        }
    }
}

// Function to handle the '2nd' button
function handleSecondFunction() {
    secondFunctionActive = !secondFunctionActive; // Toggle the state
    // --- NEW: Reset CPT state when 2nd is pressed ---
     cptActive = false; // 2nd key cancels CPT
    // TODO: Add visual feedback for 2nd active state
    console.log("2nd function active:", secondFunctionActive);
}

// clearTvm function implementation
function clearTvm() {
    tvmVariables.n = 0;
    tvmVariables.iy = 0;
    tvmVariables.pv = 0;
    tvmVariables.pmt = 0;
    tvmVariables.fv = 0;
    console.log("TVM variables cleared:", tvmVariables);
    // You might want to display "TVM CLEARED" briefly
     currentInput = 'TVM CLEARED';
     updateDisplay();
     // After a brief delay, maybe show '0' again?
     setTimeout(() => {
         if (currentInput === 'TVM CLEARED') { // Avoid clearing if user typed something else
             currentInput = '0';
             updateDisplay();
         }
     }, 1000); // Show message for 1 second
}

// Function to store value in a TVM variable
function storeTvmVariable(variableName) {
    // --- NEW: If CPT was active, pressing a TVM key after CPT triggers compute, not store ---
     if (cptActive) {
         computeTvmVariable(variableName); // Call compute function
         cptActive = false; // Reset CPT state after computation attempt
         return; // Exit function, don't store
     }

    const value = parseFloat(currentInput);
    if (!isNaN(value)) {
        tvmVariables[variableName.toLowerCase()] = value;
         displayTvmVariable(variableName); // Show the stored value on display
        console.log(`Stored ${value} in ${variableName}:`, tvmVariables);
         // After storing, reset input for the next number entry
         currentInput = '0'; // Or keep the value on display and let next digit overwrite?
                         // BA II Plus typically keeps the variable displayed. Let's try that.
         waitingForSecondOperand = false; // Allow starting a new number
    } else {
        currentInput = 'Error: Invalid Input';
        updateDisplay();
        // After an error, maybe reset state?
        // resetCalculator(); // This might be too aggressive
        waitingForSecondOperand = false; // Allow new input
    }
}

// --- NEW: Placeholder function to compute a TVM variable ---
function computeTvmVariable(variableName) {
    console.log(`Attempting to compute: ${variableName.toUpperCase()}`);

    // TODO: Implement check if sufficient variables are available for computation
    // TODO: Implement the calculation logic for the requested variable
    // TODO: Update the display with the computed result or an error

    // For now, just display which variable we *would* compute
    currentInput = `Compute ${variableName.toUpperCase()}`;
    updateDisplay();
    console.log("Current TVM variables:", tvmVariables);

    // After attempting compute (whether successful or not), reset CPT state
    cptActive = false; // This is also handled in the calling storeTvmVariable function, but good to have here too.

     // Example of how you might call a calculation function later:
     // if (variableName === 'fv') {
     //     const result = calculateFV();
     //     if (typeof result === 'number') {
     //          currentInput = String(result.toFixed(2)); // Format result
     //          tvmVariables.fv = result; // Store the computed result
     //          updateDisplay();
     //     } else {
     //          currentInput = result; // Display error message from calculation function
     //          updateDisplay();
     //     }
     // }
}

// TODO: Implement the actual calculation functions (calculateN, calculateIY, calculatePV, calculatePMT, calculateFV)
// These will read values from tvmVariables and apply the formulas.
// The formulas are complex, especially for I/Y.

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
            // For now, any other key press after 2nd cancels 2nd state
            default:
                console.log(`2nd + ${textContent} pressed (data-button="${dataButton}") - Unimplemented 2nd function.`);
                handleSecondFunction(); // Turn off 2nd function
                 // Maybe show an error or just revert to primary function behavior?
                 // Let's just revert for now. The keypress will be handled below as a primary function.
                 // If the primary function is also something that shouldn't happen after 2nd+key,
                 // we might need more specific logic. For simplicity, let's let it fall through
                 // UNLESS the key *only* has a 2nd function (like SET, BOND, etc. - which we haven't added yet).
                 // For now, let the primary function handling below run.
        }
         // If we handled a specific 2nd function and don't want primary handling, return here.
         // Since our default case falls through, we don't return immediately.
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
                 const inputValue = display.textContent.includes('=') ? parseFloat(display.textContent.split('=')[1].trim()) : parseFloat(currentInput);

                 if (isNaN(inputValue) && currentInput !== 'Error') {
                      currentInput = 'Error';
                      updateDisplay();
                      firstOperand = null;
                      operator = null;
                      waitingForSecondOperand = false;
                      break; // Exit switch
                 }

                 const result = performCalculation[operator](firstOperand, inputValue);
                 currentInput = String(result); // Display result as a string
                 updateDisplay();

                 // Reset for the next calculation, but keep the result on display
                 firstOperand = null;
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
             // This case is now ONLY reached if CPT was NOT active.
             // If CPT was active, it was handled in the `if (cptActive)` block above.
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
             // Basic calculator: ENTER often works like equals.
             // BA II Plus TVM: ENTER is not used with TVM keys directly.
             // Let's make it act like '=' for basic calculation flow for now.
             // TODO: Implement ENTER for worksheet data entry later if needed.
             // Calling the '=' case logic here.
             if (operator && firstOperand !== null) {
                  const inputValue = display.textContent.includes('=') ? parseFloat(display.textContent.split('=')[1].trim()) : parseFloat(currentInput);

                  if (isNaN(inputValue) && currentInput !== 'Error') {
                       currentInput = 'Error';
                       updateDisplay();
                       firstOperand = null;
                       operator = null;
                       waitingForSecondOperand = false;
                       break; // Exit switch
                  }

                  const result = performCalculation[operator](firstOperand, inputValue);
                  currentInput = String(result);
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
             // inputDigit handles resetting CPT state if it was active
             inputDigit(textContent);
             break;

        default:
            console.log(`Button clicked: ${textContent} (data-button="${dataButton}") - Unhandled primary function.`);
            // If any other button is pressed, ensure CPT state is off
            cptActive = false;
            // Handle other buttons later if needed (e.g., STO, RCL, BGN/END, etc.)
    }
});

// Initialize the display when the script loads
updateDisplay();
