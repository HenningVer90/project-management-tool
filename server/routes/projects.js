const express = require('express');
const pool = require('../db');
const { sendEmail, emailTemplates } = require('../email');
const router = express.Router();

// Get all projects for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT p.*, u.name as owner_name, u.email as owner_email,
        COALESCE(task_stats.total_tasks, 0)::INTEGER as total_tasks,
        COALESCE(task_stats.completed_items, 0)::INTEGER as completed_items,
        COALESCE(task_stats.total_items, 0)::INTEGER as total_items
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN (
        SELECT
          t.project_id,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT i.id) as total_items,
          COUNT(DISTINCT CASE WHEN i.status = 'completed' THEN i.id END) as completed_items
        FROM tasks t
        LEFT JOIN items i ON t.id = i.task_id
        GROUP BY t.project_id
      ) task_stats ON p.id = task_stats.project_id
      WHERE p.owner_id = $1 OR p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $1
      )
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get single project with progress
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(`
      SELECT p.*, u.name as owner_name, u.email as owner_email
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Calculate progress
    const progressResult = await pool.query(`
      SELECT
        COUNT(DISTINCT t.id)::INTEGER as total_tasks,
        COUNT(DISTINCT i.id)::INTEGER as total_items,
        COUNT(DISTINCT CASE WHEN i.status = 'completed' THEN i.id END)::INTEGER as completed_items
      FROM tasks t
      LEFT JOIN items i ON t.id = i.task_id
      WHERE t.project_id = $1
    `, [id]);

    const { total_tasks, total_items, completed_items } = progressResult.rows[0];
    const progress = (total_items > 0 && completed_items !== null) ? Math.round((parseInt(completed_items) / parseInt(total_items)) * 100) : 0;

    res.json({
      ...project,
      progress: {
        total_tasks,
        total_items,
        completed_items,
        percentage: progress
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description, owner_id, notify_email } = req.body;

    if (!name || !owner_id) {
      return res.status(400).json({ error: 'Name and owner_id are required' });
    }

    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '', owner_id, 'active']
    );

    const project = result.rows[0];

    // Send email notification
    if (notify_email) {
      const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [owner_id]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const html = emailTemplates.projectCreated(project.name, user.name);
        await sendEmail(notify_email, `New Project Created: ${project.name}`, html);
      }
    }

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const result = await pool.query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING *`,
      [name, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Close project
router.post('/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const { notify_email } = req.body;

    const result = await pool.query(
      `UPDATE projects SET
        status = 'closed',
        closed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = result.rows[0];

    // Send email notification
    if (notify_email) {
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [project.owner_id]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const html = emailTemplates.projectClosed(project.name, user.name);
        await sendEmail(notify_email, `Project Closed: ${project.name}`, html);
      }
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
