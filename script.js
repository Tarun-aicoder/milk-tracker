const startScreen = document.getElementById('start-screen');
const trackerScene = document.querySelector('.scene');
const goalCards = document.querySelectorAll('.goal-card');
const bgVideo = document.getElementById('bg-video');

// --- START SCREEN LOGIC ---
goalCards.forEach(card => {
  card.addEventListener('click', () => {
    const hero = card.getAttribute('data-hero');

    // 1. Play the universal background animation video
    bgVideo.style.display = 'block';
    bgVideo.play();

    // 2. Play the specific hero's MP3 audio
    const audio = document.getElementById(`audio-${hero}`);
    if (audio) {
      audio.currentTime = 0; 
      audio.play();
    }

    // 3. Clear the dark image background if it was there
    document.body.style.backgroundImage = 'none';

    // 4. Hide start screen and show tracker
    startScreen.style.display = 'none';
    trackerScene.style.display = 'block';
  });
});

// --- TRACKER LOGIC ---
const calendar = document.getElementById('calendar');
const totalEl = document.getElementById('total');
const countEl = document.getElementById('days-count');
const priceInput = document.getElementById('price');
const monthNameEl = document.getElementById('month-name');

const dayBar = document.getElementById('day-bar');
const selectedDayTitle = document.getElementById('selected-day-title');
const dayQtyInput = document.getElementById('day-qty');
const dayNoteInput = document.getElementById('day-note');

const today = new Date();
const currentMonth = today.getMonth(); 
const currentYear = today.getFullYear();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

monthNameEl.innerText = `${monthNames[currentMonth]} ${currentYear}`;
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

const storageKey = `milk_v2_${currentMonth}_${currentYear}`;
let dayData = JSON.parse(localStorage.getItem(storageKey)) || {};
let selectedDay = null;

for (let i = 1; i <= daysInMonth; i++) {
  const dayBtn = document.createElement('div');
  dayBtn.classList.add('day');
  dayBtn.innerText = i;
  
  if (dayData[i]) {
    dayBtn.classList.add('active');
  }
  
  dayBtn.addEventListener('click', () => {
    document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));

    if (!dayBtn.classList.contains('active')) {
      dayBtn.classList.add('active');
      dayBtn.classList.add('selected');
      dayData[i] = { qty: 1, note: "" };
      selectedDay = i;
      showDayBar(i);
    } 
    else if (selectedDay !== i) {
      dayBtn.classList.add('selected');
      selectedDay = i;
      showDayBar(i);
    }
    else {
      dayBtn.classList.remove('active');
      delete dayData[i];
      selectedDay = null;
      dayBar.style.display = 'none';
    }
    
    saveData();
    calculateTotal();
  });
  
  calendar.appendChild(dayBtn);
}

dayQtyInput.addEventListener('input', () => {
  if (selectedDay) {
    dayData[selectedDay].qty = parseFloat(dayQtyInput.value) || 0;
    saveData();
    calculateTotal();
  }
});

dayNoteInput.addEventListener('input', () => {
  if (selectedDay) {
    dayData[selectedDay].note = dayNoteInput.value;
    saveData();
  }
});

function showDayBar(dayNum) {
  selectedDayTitle.innerText = `Editing Day ${dayNum}`;
  dayQtyInput.value = dayData[dayNum].qty;
  dayNoteInput.value = dayData[dayNum].note;
  dayBar.style.display = 'block';
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(dayData));
}

function calculateTotal() {
  let totalQty = 0;
  let activeDaysCount = 0;

  for (const day in dayData) {
    totalQty += dayData[day].qty;
    activeDaysCount++;
  }

  const price = parseFloat(priceInput.value) || 0;
  countEl.innerText = activeDaysCount;
  totalEl.innerText = totalQty * price;
}

const savedPrice = localStorage.getItem('milk_price');
if (savedPrice !== null) {
  priceInput.value = savedPrice; 
}

calculateTotal();

priceInput.addEventListener('input', () => {
  localStorage.setItem('milk_price', priceInput.value);
  calculateTotal();
});

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(error => console.log('Service Worker failed:', error));
  });
}