import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import './ProjectDetail.css';

function ProjectDetail({ project, onBack, onUpdate, onDelete, currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [project]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/tasks/project/${project.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    try {
      await axios.post('/api/tasks', {
        project_id: project.id,
        name: newTaskName,
        notify_email: project.owner_email,
      });
      setNewTaskName('');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  const handleCloseProject = async () => {
    if (window.confirm('Are you sure you want to close this project?')) {
      try {
        await axios.post(`/api/projects/${project.id}/close`, {
          notify_email: project.owner_email,
        });
        onDelete();
      } catch (error) {
        console.error('Error closing project:', error);
        alert('Error closing project');
      }
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${project.id}`);
        onDelete();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      }
    }
  };

  return (
    <div className="project-detail">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        ← Back to Projects
      </button>

      <div className="card">
        <div className="project-detail-header">
          <div>
            <h2>{project.name}</h2>
            {project.description && (
              <p className="project-description">{project.description}</p>
            )}
          </div>
          <div className="project-actions">
            {project.status === 'active' && (
              <button className="btn btn-danger" onClick={handleCloseProject}>
                Close Project
              </button>
            )}
            <button className="btn btn-danger" onClick={handleDeleteProject}>
              Delete
            </button>
          </div>
        </div>

        <div className="project-info">
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`status-badge ${project.status}`}>
              {project.status}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Owner:</span>
            <span>{project.owner_name}</span>
          </div>
        </div>

        {project.progress && (
          <div className="progress-detail">
            <h3>Project Progress</h3>
            <div className="progress-stats">
              <div className="stat-item">
                <span className="stat-label">Total Items:</span>
                <span className="stat-value">{project.progress.total_items}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed Items:</span>
                <span className="stat-value">{project.progress.completed_items}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Overall Progress:</span>
                <span className="stat-value">{project.progress.percentage}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${project.progress.percentage}%` }}
              >
                {project.progress.percentage}%
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedTask ? (
        <TaskList
          task={selectedTask}
          project={project}
          onBack={() => setSelectedTask(null)}
          onTaskUpdated={fetchTasks}
          currentUser={currentUser}
        />
      ) : (
        <div className="tasks-section">
          <div className="tasks-header">
            <h3>Tasks</h3>
          </div>

          <form onSubmit={handleAddTask} className="add-task-form">
            <input
              type="text"
              placeholder="Add new task..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="task-input"
            />
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </form>

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="card">
              <p>No tasks yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="task-item card"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="task-item-header">
                    <h4>{task.name}</h4>
                  </div>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-stats">
                    <span>{task.total_items || 0} items</span>
                    <span>{task.completed_items || 0} completed</span>
                  </div>
                  {task.total_items > 0 && (
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.round((task.completed_items / task.total_items) * 100)}%`
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
