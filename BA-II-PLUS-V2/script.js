const display = document.querySelector('.display');
const buttons = document.querySelector('.buttons');

let currentInput = '0';
let operator = null;
let firstOperand = null;
let waitingForSecondOperand = false;
let secondFunctionActive = false; // State for the 2nd button

// Function to update the display
function updateDisplay() {
    display.textContent = currentInput;
}

// Function to handle digit and decimal button clicks
function inputDigit(digit) {
    if (waitingForSecondOperand === true) {
        currentInput = digit;
        waitingForSecondOperand = false;
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
    const inputValue = parseFloat(currentInput);

    if (operator && waitingForSecondOperand) {
        // If an operator is already set and we're waiting for the second operand,
        // it means the user is chaining operations (e.g., 5 + 3 -)
        // We update the operator for the next calculation.
        operator = nextOperator;
        return;
    }

    if (firstOperand === null) {
        // If this is the first operand, store it
        firstOperand = inputValue;
    } else if (operator) {
        // If an operator exists and this is the second operand (or subsequent operation),
        // perform the calculation
        const result = performCalculation[operator](firstOperand, inputValue);

        // Update display with the result (limit decimal places if needed)
        currentInput = String(result);
        updateDisplay();

        // Set the result as the first operand for the next calculation
        firstOperand = result;
    }

    // Set the flag to indicate we are waiting for the second operand
    waitingForSecondOperand = true;
    // Store the operator for the next calculation
    operator = nextOperator;
}

// Object to store calculation functions
const performCalculation = {
    '/': (firstOperand, secondOperand) => secondOperand === 0 ? 'Error' : firstOperand / secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '=': (firstOperand, secondOperand) => secondOperand // The '=' just uses the last result/input
};


// Function to reset the calculator
function resetCalculator() {
    currentInput = '0';
    operator = null;
    firstOperand = null;
    waitingForSecondOperand = false;
    secondFunctionActive = false; // Also reset 2nd function state
    updateDisplay();
}

// Function to handle the '+/-' button
function toggleSign() {
    currentInput = String(parseFloat(currentInput) * -1);
    updateDisplay();
}

// Function to handle the '2nd' button
function handleSecondFunction() {
    secondFunctionActive = !secondFunctionActive; // Toggle the state
    // You might want to visually indicate the 2nd function is active
    // e.g., by adding a class to the calculator or a button
    console.log("2nd function active:", secondFunctionActive); // For debugging
    // Add visual feedback here later if needed
}

// Function to handle the 'CLR TVM' button
function clearTvm() {
    // This will depend on how you store TVM variables.
    // For now, let's just log a message.
    console.log("CLR TVM button pressed.");
    // Future: Implement logic to clear TVM variables
}

// Main event listener for button clicks
buttons.addEventListener('click', (event) => {
    // Check if the clicked element is a button
    if (!event.target.matches('button')) {
        return;
    }

    const { textContent } = event.target; // Get the text inside the button
    const dataButton = event.target.dataset.button; // Get the data-button attribute

    // Handle different button types based on data-button attribute
    switch (dataButton) {
        case 'plus':
        case 'minus':
        case 'multiply':
        case 'divide':
            handleOperator(textContent); // Use textContent for the operator symbol
            break;
        case 'equals':
            // Perform the final calculation
            if (operator && firstOperand !== null) {
                 const inputValue = parseFloat(currentInput);
                 const result = performCalculation[operator](firstOperand, inputValue);
                 currentInput = String(result);
                 updateDisplay();
                 // Reset for the next calculation, but keep the result on display
                 firstOperand = null;
                 operator = null;
                 waitingForSecondOperand = false;
            }
            break;
        case 'clrtvm':
             // The CLR TVM button on the BA II Plus usually clears the TVM sheet,
             // and often acts as an ALL CLEAR when the 2nd button is NOT active.
             // Let's make it an ALL CLEAR for now if 2nd is not active.
             // If 2nd is active, it would clear TVM variables (to be implemented).
             if (!secondFunctionActive) {
                  resetCalculator(); // Acts as AC (All Clear)
             } else {
                  clearTvm(); // Placeholder for clearing TVM variables
             }
             break;
        case 'plusminus':
             toggleSign();
             break;
        case '2nd':
             handleSecondFunction();
             break;
        // Add cases for other special function buttons (N, I/Y, PV, PMT, FV, CPT) later
        // For now, let's just handle the basic digits and operations
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
        case 'dot': // Assuming the decimal button has data-button="dot"
             inputDigit(textContent); // Use textContent for the digit/dot
             break;
        // Add a default case to log unhandled buttons if needed
        default:
            console.log(`Button clicked: ${textContent} (data-button="${dataButton}")`);
            // Handle other buttons later (TVM keys, ENTER, etc.)
    }
});

// Initialize the display when the script loads
updateDisplay();
