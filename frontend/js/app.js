const API_URL = 'http://localhost:5000/tasks';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterTasks = document.getElementById('filter-tasks');

let tasks = [];

async function fetchTasks() {
  const response = await fetch(API_URL);
  tasks = await response.json();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  const filter = filterTasks.value;

  tasks
    .filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'incomplete') return !task.completed;
      return true;
    })
    .forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id}, this.checked)">
        <span>${task.title}</span>
        <button class="edit" onclick="editTask(${task.id}, '${task.title}')">Редактировать</button>
        <button class="delete" onclick="deleteTask(${task.id})">Удалить</button>
      `;
      taskList.appendChild(li);
    });
}

taskForm.addEventListener('submit', async e => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (response.ok) {
    taskInput.value = '';
    fetchTasks();
  }
});

async function toggleTask(id, completed) {
  const response = await fetch(`${API_URL}/${id}/toggle`, {
    method: 'PATCH',
  });

  if (response.ok) {
    fetchTasks();
  }
}

async function editTask(id, currentTitle) {
  const newTitle = prompt('Редактировать задачу:', currentTitle);
  if (newTitle && newTitle.trim()) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() }),
    });

    if (response.ok) {
      fetchTasks();
    }
  }
}

async function deleteTask(id) {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchTasks();
    }
  }
}

filterTasks.addEventListener('change', renderTasks);

fetchTasks();