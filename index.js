// index.js - main server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 80;

// In-memory store (for demo purposes)
const tasks = new Map(); // id -> { id, title, description, createdAt }
let idCounter = 1;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Helpers
function createTask(title, description) {
  const id = String(idCounter++);
  const task = { id, title: title || 'Untitled Task', description: description || '', createdAt: new Date().toISOString() };
  tasks.set(id, task);
  return task;
}

// Routes
app.get('/', (req, res) => {
  const items = Array.from(tasks.values()).sort((a,b) => b.id - a.id);
  res.render('layout', { tasks: items, flash: req.cookies.flash || null });
  res.clearCookie('flash');
});

app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim().length === 0) {
    res.cookie('flash', { type: 'danger', message: 'Title is required.' }, { maxAge: 2000 });
    return res.redirect('/');
  }
  createTask(title.trim(), description ? description.trim() : '');
  res.cookie('flash', { type: 'success', message: 'Task added.' }, { maxAge: 2000 });
  res.redirect('/');
});

app.post('/tasks/:id/delete', (req, res) => {
  const id = req.params.id;
  if (tasks.has(id)) {
    tasks.delete(id);
    res.cookie('flash', { type: 'success', message: 'Task removed.' }, { maxAge: 2000 });
  } else {
    res.cookie('flash', { type: 'warning', message: 'Task not found.' }, { maxAge: 2000 });
  }
  res.redirect('/');
});

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// seed with a few tasks for demo
createTask('Welcome!', 'This is a beautiful task manager running on Express + EJS + Bootstrap');
createTask('Try it out', 'Add, view and delete tasks. This demo stores tasks in memory.');

// start
app.listen(PORT, () => {
  console.log(`Task Manager listening on port ${PORT}`);
});
