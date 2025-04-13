const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  db.run('INSERT INTO tasks (title, completed) VALUES (?, ?)', [title, false], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, title, completed: false });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  db.run('UPDATE tasks SET title = ? WHERE id = ?', [title, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ id: Number(id), title, completed: false });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  });
});

router.patch('/:id/toggle', (req, res) => {
  const { id } = req.params;
  db.get('SELECT completed FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Task not found' });

    const newStatus = !row.completed;
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [newStatus, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: Number(id), completed: newStatus });
    });
  });
});

module.exports = router;