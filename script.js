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

// Show / hide states
function showLoading() {
  loadingBox.hidden = false;
  errorBox.hidden = true;
  emptyBox.hidden = true;
  eventList.innerHTML = '';
  resultCount.textContent = '';
}

function showError() {
  loadingBox.hidden = true;
  emptyBox.hidden = true;
  errorBox.hidden = false;
  errorMessage.textContent = 'Could not load events. Please check your internet connection and try again.';
  resultCount.textContent = '';
}

//  Rendering
function getFilteredEvents() {
  const searchText = sanitize(searchInput.value).toLowerCase();
  const category = categoryFilter.value;

  return events
    .filter(function (item) {
      const matchesSearch =
        item.title.toLowerCase().includes(searchText) ||
        item.host.toLowerCase().includes(searchText);
      const matchesCategory = category === 'all' || item.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort(function (a, b) {
      return (a.date + a.time).localeCompare(b.date + b.time);
    });
}

function createEventCard(item) {
  const going = rsvpIds.includes(item.id);
  const seatsLeft = item.seats - (going ? 1 : 0);
  const buttonText = going ? 'Cancel RSVP' : 'RSVP';
  const buttonLabel = (going ? 'Cancel RSVP for ' : 'RSVP to ') + item.title;

  const card = document.createElement('li');
  card.className = 'event-card';

  // All values below are already sanitized, so innerHTML is safe here
  card.innerHTML =
    '<div class="event-date" aria-hidden="true">' +
      '<span class="event-day">' + getDayNumber(item.date) + '</span>' +
      '<span class="event-month">' + getMonthShort(item.date) + '</span>' +
    '</div>' +
    '<div class="event-body">' +
      '<h3>' + item.title + '</h3>' +
      '<p class="event-meta">' + item.category + ' | Hosted by ' + item.host + '</p>' +
      '<p class="event-meta"><time datetime="' + item.date + 'T' + item.time + '">' +
        formatDate(item.date) + ', ' + formatTime(item.time) + '</time></p>' +
      '<p class="event-desc">' + item.description + '</p>' +
      '<p class="event-seats">' + seatsLeft + ' seats left</p>' +
      '<button type="button" class="btn btn-secondary" data-rsvp="' + item.id + '" ' +
        'aria-label="' + buttonLabel + '">' + buttonText + '</button>' +
    '</div>';

  return card;
}

function renderEvents() {
  const filtered = getFilteredEvents();

  loadingBox.hidden = true;
  errorBox.hidden = true;
  eventList.innerHTML = '';

  if (filtered.length === 0) {
    emptyBox.hidden = false;
    resultCount.textContent = 'No events found.';
    return;
  }

  emptyBox.hidden = true;
  resultCount.textContent = 'Showing ' + filtered.length + ' of ' + events.length + ' events.';

  filtered.forEach(function (item) {
    eventList.appendChild(createEventCard(item));
  });
}

//  Loading events 
async function loadEvents() {
  showLoading();
  try {
    const data = await fetchEvents();
    events = data.map(function (item) {
      const newEvent = {
        id: nextId,
        title: sanitize(item.title),
        host: sanitize(item.host),
        date: item.date,
        time: item.time,
        category: item.category,
        seats: item.seats,
        description: sanitize(item.description)
      };
      nextId += 1;
      return newEvent;
    });
    renderEvents();
  } catch (error) {
    showError();
  }
}

//Search and filter
function clearFilters() {
  searchInput.value = '';
  categoryFilter.value = 'all';
  renderEvents();
}

//  RSVP 
function toggleRsvp(id) {
  const index = rsvpIds.indexOf(id);
  if (index === -1) {
    rsvpIds.push(id);
  } else {
    rsvpIds.splice(index, 1);
  }
  renderEvents();
  logAnalytics('RSVP updated');

  // keep keyboard focus on the same button after re-render
  const button = eventList.querySelector('[data-rsvp="' + id + '"]');
  if (button) {
    button.focus();
  }
}

//  Form
function getFormData() {
  return {
    title: sanitize(form.elements.title.value),
    host: sanitize(form.elements.host.value),
    date: form.elements.date.value,
    time: form.elements.time.value,
    category: form.elements.category.value,
    seats: form.elements.seats.value.trim(),
    description: sanitize(form.elements.description.value)
  };
}

function validateForm(data) {
  const errors = {};

  if (data.title.length < 3) {
    errors.title = 'Enter a title with at least 3 characters.';
  }
  if (data.host.length < 2) {
    errors.host = 'Enter the name of the host or author.';
  }
  if (!data.date) {
    errors.date = 'Choose a date for the event.';
  } else if (data.date < getTodayString()) {
    errors.date = 'The date cannot be in the past.';
  }
  if (!data.time) {
    errors.time = 'Choose a start time.';
  }
  if (!CATEGORIES.includes(data.category)) {
    errors.category = 'Select a category from the list.';
  }

  const seatsNumber = Number(data.seats);
  if (data.seats === '' || !Number.isInteger(seatsNumber) || seatsNumber < 1 || seatsNumber > 500) {
    errors.seats = 'Enter a whole number between 1 and 500.';
  }
  if (data.description.length < 10) {
    errors.description = 'Enter a description with at least 10 characters.';
  }

  return errors;
}

function clearFieldError(name) {
  const input = document.getElementById(name);
  const error = document.getElementById(name + '-error');
  input.classList.remove('invalid');
  input.removeAttribute('aria-invalid');
  error.textContent = '';
}

function showFieldError(name, message) {
  const input = document.getElementById(name);
  const error = document.getElementById(name + '-error');
  input.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
  error.textContent = message;
}

function clearAllErrors() {
  FIELD_NAMES.forEach(clearFieldError);
  formStatus.textContent = '';
}

function setSaving(isSaving) {
  submitButton.disabled = isSaving;
  submitButton.textContent = isSaving ? 'Saving event...' : 'Add event';
}

async function handleSubmit(event) {
  event.preventDefault();
  clearAllErrors();

  const data = getFormData();
  const errors = validateForm(data);
  const invalidFields = FIELD_NAMES.filter(function (name) {
    return errors[name];
  });

  if (invalidFields.length > 0) {
    invalidFields.forEach(function (name) {
      showFieldError(name, errors[name]);
    });
    document.getElementById(invalidFields[0]).focus();
    return;
  }

  setSaving(true);
  try {
    await saveEvent();
  } catch (error) {
    setSaving(false);
    formStatus.textContent = 'Could not save the event. Check your internet connection and try again.';
    return;
  }

  events.push({
    id: nextId,
    title: data.title,
    host: data.host,
    date: data.date,
    time: data.time,
    category: data.category,
    seats: Number(data.seats),
    description: data.description
  });
  nextId += 1;

  setSaving(false);
  form.reset();
  clearFilters();
  formStatus.textContent = 'Event added: ' + data.title;
  logAnalytics('Event added');
}

// ---------- Setup ----------
function fillCategories() {
  CATEGORIES.forEach(function (name) {
    const filterOption = document.createElement('option');
    filterOption.value = name;
    filterOption.textContent = name;
    categoryFilter.appendChild(filterOption);

    const formOption = document.createElement('option');
    formOption.value = name;
    formOption.textContent = name;
    form.elements.category.appendChild(formOption);
  });
}

function init() {
  fillCategories();
  form.elements.date.min = getTodayString();

  searchInput.addEventListener('input', function () {
    if (events.length > 0) {
      renderEvents();
    }
  });
  categoryFilter.addEventListener('change', function () {
    if (events.length > 0) {
      renderEvents();
    }
  });
  clearFiltersButton.addEventListener('click', clearFilters);
  retryButton.addEventListener('click', loadEvents);

  eventList.addEventListener('click', function (event) {
    const button = event.target.closest('[data-rsvp]');
    if (button) {
      toggleRsvp(Number(button.dataset.rsvp));
    }
  });

  FIELD_NAMES.forEach(function (name) {
    const input = document.getElementById(name);
    input.addEventListener('input', function () {
      clearFieldError(name);
    });
  });

  form.addEventListener('submit', handleSubmit);

  window.addEventListener('online', function () {
    if (events.length === 0 && !errorBox.hidden) {
      loadEvents();
    }
  });

  loadEvents();
}

init();
