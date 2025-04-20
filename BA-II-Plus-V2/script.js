function calculateFutureValue(pv, r, n, pmt) {
    return pv * Math.pow(1 + r / 100, n) + pmt * ((Math.pow(1 + r / 100, n) - 1) / (r / 100));
}

const screen = document.querySelector('.screen');
const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Example functionality
        const value = button.textContent;
        screen.textContent = value;
    });
});
