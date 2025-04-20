const sliderImages = document.querySelector('.slider-images');
const images = document.querySelectorAll('.slider-images img');
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');

let currentIndex = 0;

function updateSlider() {
    sliderImages.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateSlider();
}

function showPreviousImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateSlider();
}

// Auto-slide functionality
setInterval(showNextImage, 3000);

// Event listeners for manual navigation
prevArrow.addEventListener('click', showPreviousImage);
nextArrow.addEventListener('click', showNextImage);
