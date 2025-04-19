const quotes = [
  "Perceive that which cannot be seen with the eye.",
  "Truth is not what you want it to be; it is what it is.",
  "If you know the Way broadly, you will see it in everything.",
  "The only reason a warrior is alive is to fight, and the only reason a warrior fights is to win."
];

function displayQuote() {
  // Use the day of the month to select a quote.
  const dayIndex = new Date().getDate() % quotes.length;
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.textContent = quotes[dayIndex];
}

document.addEventListener("DOMContentLoaded", displayQuote);
