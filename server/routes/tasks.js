const express = require('express');
const pool = require('../db');
const { sendEmail, emailTemplates } = require('../email');
const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `SELECT t.*, COUNT(DISTINCT i.id) as total_items,
        COUNT(DISTINCT CASE WHEN i.status = 'completed' THEN i.id END) as completed_items
       FROM tasks t
       LEFT JOIN items i ON t.id = i.task_id
       WHERE t.project_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, COUNT(DISTINCT i.id) as total_items,
        COUNT(DISTINCT CASE WHEN i.status = 'completed' THEN i.id END) as completed_items
       FROM tasks t
       LEFT JOIN items i ON t.id = i.task_id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { project_id, name, description, notify_email } = req.body;

    if (!project_id || !name) {
      return res.status(400).json({ error: 'Project ID and name are required' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (project_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [project_id, name, description || '']
    );

    const task = result.rows[0];

    // Send email notification
    if (notify_email) {
      const projectResult = await pool.query('SELECT name FROM projects WHERE id = $1', [project_id]);
      if (projectResult.rows.length > 0) {
        const project = projectResult.rows[0];
        const html = emailTemplates.taskCreated(project.name, task.name, 'Team Member');
        await sendEmail(notify_email, `New Task Created: ${task.name}`, html);
      }
    }

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE tasks SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING *`,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
