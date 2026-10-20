'use strict';

// data
const CATEGORIES = ['Author Reading', 'Book Club', 'Kids Story Time', 'Workshop', 'Book Signing'];

const SEED_EVENTS = [
  {
    title: 'Author Reading: The River Notebooks',
    host: 'Meera Kapoor',
    date: '2026-11-07',
    time: '18:00',
    category: 'Author Reading',
    seats: 40,
    description: 'Meera reads from her new novel and answers questions from the audience.'
  },
  {
    title: 'Monthly Mystery Book Club',
    host: 'Rohan Desai',
    date: '2026-11-12',
    time: '19:00',
    category: 'Book Club',
    seats: 20,
    description: 'This month we discuss a classic detective novel. Tea and snacks provided.'
  },
  {
    title: 'Saturday Story Time for Kids',
    host: 'Anita Rao',
    date: '2026-11-14',
    time: '11:00',
    category: 'Kids Story Time',
    seats: 25,
    description: 'Picture books and puppets for children aged 4 to 8. Parents are welcome.'
  },
  {
    title: 'Zine Making Workshop',
    host: 'Sana Sheikh',
    date: '2026-11-21',
    time: '15:30',
    category: 'Workshop',
    seats: 15,
    description: 'Learn to fold, cut and print your own small zine. All materials included.'
  },
  {
    title: 'Book Signing: Poems from the Hills',
    host: 'Vikram Negi',
    date: '2026-12-05',
    time: '17:00',
    category: 'Book Signing',
    seats: 50,
    description: 'Meet the poet and get your copy signed. Short reading at 5:30 PM.'
  },
  {
    title: 'Beginner Creative Writing Workshop',
    host: 'Priya Menon',
    date: '2026-12-12',
    time: '14:00',
    category: 'Workshop',
    seats: 18,
    description: 'Simple writing exercises for beginners. Bring a notebook and a pen.'
  }
];

// state
let events = [];
let rsvpIds = [];
let nextId = 1;

// page elements
const eventList = document.getElementById('event-list');
const loadingBox = document.getElementById('loading-box');
const errorBox = document.getElementById('error-box');
const errorMessage = document.getElementById('error-message');
const emptyBox = document.getElementById('empty-box');
const resultCount = document.getElementById('result-count');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const retryButton = document.getElementById('retry-button');
const clearFiltersButton = document.getElementById('clear-filters');
const form = document.getElementById('event-form');
const submitButton = document.getElementById('submit-button');
const formStatus = document.getElementById('form-status');

const FIELD_NAMES = ['title', 'host', 'date', 'time', 'category', 'seats', 'description'];

// helpers
function logAnalytics(action) {
  // eslint-disable-next-line no-console
  console.log('[Analytics] User interacted with Independent Bookstore Events Page - ' + action);
}

// Removes HTML tags and escapes special characters (XSS protection)
function sanitize(text) {
  return String(text)
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return now.getFullYear() + '-' + month + '-' + day;
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTime(timeString) {
  const parts = timeString.split(':');
  let hour = Number(parts[0]);
  const minutes = parts[1];
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) {
    hour = 12;
  }
  return hour + ':' + minutes + ' ' + suffix;
}

function getMonthShort(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { month: 'short' });
}

function getDayNumber(dateString) {
  return Number(dateString.split('-')[2]);
}

// Fake server calls (simulate slow internet) 
function fetchEvents() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (!navigator.onLine) {
        reject(new Error('offline'));
        return;
      }
      resolve(SEED_EVENTS);
    }, 1200);
  });
}

function saveEvent() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (!navigator.onLine) {
        reject(new Error('offline'));
        return;
      }
      resolve();
    }, 800);
  });
}

