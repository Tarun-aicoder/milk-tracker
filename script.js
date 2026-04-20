const startScreen = document.getElementById('start-screen');
const trackerScene = document.querySelector('.scene');
const goalCards = document.querySelectorAll('.goal-card');
const bgVideo = document.getElementById('bg-video');

// --- START SCREEN LOGIC ---
goalCards.forEach(card => {
  card.addEventListener('click', () => {
    const hero = card.getAttribute('data-hero');
    bgVideo.style.display = 'block';
    bgVideo.play();
    const audio = document.getElementById(`audio-${hero}`);
    if (audio) { audio.currentTime = 0; audio.play(); }
    document.body.style.backgroundImage = 'none';
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

// NEW: Navigation Buttons
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const dayBar = document.getElementById('day-bar');
const selectedDayTitle = document.getElementById('selected-day-title');
const dayQtyInput = document.getElementById('day-qty');
const dayNoteInput = document.getElementById('day-note');

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// NEW: Mutable Date Variables
let currentDate = new Date();
let displayMonth = currentDate.getMonth(); 
let displayYear = currentDate.getFullYear();
let storageKey = "";
let dayData = {};
let selectedDay = null;

// NEW: Master Function to Render the Calendar
function renderCalendar() {
  monthNameEl.innerText = `${monthNames[displayMonth]} ${displayYear}`;
  
  // Create a unique database key for whichever month we are looking at
  storageKey = `milk_v2_${displayMonth}_${displayYear}`;
  dayData = JSON.parse(localStorage.getItem(storageKey)) || {};
  
  selectedDay = null;
  dayBar.style.display = 'none'; // Hide the editor when switching months
  calendar.innerHTML = ''; // Wipe the old calendar squares

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

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
  calculateTotal();
}

// NEW: Button Click Events
prevMonthBtn.addEventListener('click', () => {
  displayMonth--;
  if (displayMonth < 0) { displayMonth = 11; displayYear--; }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  displayMonth++;
  if (displayMonth > 11) { displayMonth = 0; displayYear++; }
  renderCalendar();
});

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
if (savedPrice !== null) { priceInput.value = savedPrice; }

priceInput.addEventListener('input', () => {
  localStorage.setItem('milk_price', priceInput.value);
  calculateTotal();
});

// INITIAL LOAD
renderCalendar();

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(error => console.log('Service Worker failed:', error));
  });
}
