const express = require('express');
const pool = require('../db');
const { sendEmail, emailTemplates } = require('../email');
const router = express.Router();

// Get all items for a task
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(
      `SELECT i.*, u.name as assigned_to_name, u.email as assigned_to_email
       FROM items i
       LEFT JOIN users u ON i.assigned_to = u.id
       WHERE i.task_id = $1
       ORDER BY i.created_at DESC`,
      [taskId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, u.name as assigned_to_name, u.email as assigned_to_email
       FROM items i
       LEFT JOIN users u ON i.assigned_to = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const { task_id, title, description, priority, due_date, assigned_to, notify_email } = req.body;

    if (!task_id || !title) {
      return res.status(400).json({ error: 'Task ID and title are required' });
    }

    const result = await pool.query(
      `INSERT INTO items (task_id, title, description, priority, due_date, assigned_to, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [task_id, title, description || '', priority || 'medium', due_date, assigned_to, 'pending']
    );

    const item = result.rows[0];

    // Send email notification
    if (notify_email) {
      const taskResult = await pool.query(
        `SELECT t.name, p.name as project_name FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         WHERE t.id = $1`,
        [task_id]
      );

      if (taskResult.rows.length > 0) {
        const task = taskResult.rows[0];
        const html = emailTemplates.itemCreated(task.project_name, task.name, item.title, 'Team Member');
        await sendEmail(notify_email, `New Item Created: ${item.title}`, html);
      }
    }

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_to } = req.body;

    const result = await pool.query(
      `UPDATE items SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        assigned_to = COALESCE($6, assigned_to),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *`,
      [title, description, status, priority, due_date, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Mark item as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { notify_email } = req.body;

    const itemResult = await pool.query(
      `UPDATE items SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *`,
      [id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];

    // Send email notification
    if (notify_email) {
      const taskResult = await pool.query(
        `SELECT t.name, p.name as project_name FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         WHERE t.id = $1`,
        [item.task_id]
      );

      if (taskResult.rows.length > 0) {
        const task = taskResult.rows[0];
        const html = emailTemplates.itemCompleted(task.project_name, task.name, item.title, 'Team Member');
        await sendEmail(notify_email, `Item Completed: ${item.title}`, html);
      }
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
