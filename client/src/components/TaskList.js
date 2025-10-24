import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ItemList from './ItemList';
import './TaskList.css';

function TaskList({ task, project, onBack, onTaskUpdated, currentUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');

  useEffect(() => {
    fetchItems();
  }, [task]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/items/task/${task.id}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    try {
      await axios.post('/api/items', {
        task_id: task.id,
        title: newItemTitle,
        priority: 'medium',
        notify_email: project.owner_email,
      });
      setNewItemTitle('');
      fetchItems();
      onTaskUpdated();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${task.id}`);
        onTaskUpdated();
        onBack();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task');
      }
    }
  };

  const taskProgress = items.length > 0
    ? Math.round(
        (items.filter(item => item.status === 'completed').length / items.length) *
          100
      )
    : 0;

  return (
    <div className="task-detail">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        ← Back to Tasks
      </button>

      <div className="card">
        <div className="task-detail-header">
          <div>
            <h2>{task.name}</h2>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </div>
          <button
            className="btn btn-danger"
            onClick={handleDeleteTask}
          >
            Delete Task
          </button>
        </div>

        <div className="task-progress">
          <h3>Task Progress</h3>
          <div className="progress-info">
            <span>Total Items: <strong>{items.length}</strong></span>
            <span>Completed: <strong>{items.filter(i => i.status === 'completed').length}</strong></span>
            <span>Progress: <strong>{taskProgress}%</strong></span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${taskProgress}%` }}
            >
              {taskProgress}%
            </div>
          </div>
        </div>
      </div>

      <div className="items-section">
        <h3>Items</h3>

        <form onSubmit={handleAddItem} className="add-item-form">
          <input
            type="text"
            placeholder="Add new item..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="item-input"
          />
          <button type="submit" className="btn btn-primary">
            Add Item
          </button>
        </form>

        {loading ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
          <div className="card">
            <p>No items yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map(item => (
              <ItemList
                key={item.id}
                item={item}
                task={task}
                project={project}
                onItemUpdated={fetchItems}
                onTaskUpdated={onTaskUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;
