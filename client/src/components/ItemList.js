import React, { useState } from 'react';
import axios from 'axios';
import './ItemList.css';

function ItemList({ item, task, project, onItemUpdated, onTaskUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: item.title,
    description: item.description,
    priority: item.priority,
  });

  const handleMarkDone = async () => {
    try {
      await axios.post(`/api/items/${item.id}/complete`, {
        notify_email: project.owner_email,
      });
      onItemUpdated();
      onTaskUpdated();
    } catch (error) {
      console.error('Error marking item as done:', error);
      alert('Error marking item as done');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/items/${item.id}`, editData);
      setIsEditing(false);
      onItemUpdated();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/items/${item.id}`);
        onItemUpdated();
        onTaskUpdated();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const priorityColor = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#dc3545',
  };

  if (isEditing) {
    return (
      <div className="card item-edit-form">
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={editData.title}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={editData.description}
              onChange={handleEditChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={editData.priority}
              onChange={handleEditChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`card item-card ${item.status === 'completed' ? 'completed' : ''}`}>
      <div className="item-header">
        <div className="item-title-section">
          <input
            type="checkbox"
            checked={item.status === 'completed'}
            onChange={handleMarkDone}
            className="item-checkbox"
          />
          <div className="item-title-info">
            <h4 className={item.status === 'completed' ? 'completed-text' : ''}>
              {item.title}
            </h4>
            {item.description && (
              <p className="item-description">{item.description}</p>
            )}
          </div>
        </div>

        <div className="item-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(true)}
            title="Edit"
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="item-details">
        <div className="detail-item">
          <span className="detail-label">Priority:</span>
          <span
            className="priority-badge"
            style={{ backgroundColor: priorityColor[item.priority] || '#6c757d' }}
          >
            {item.priority}
          </span>
        </div>

        {item.due_date && (
          <div className="detail-item">
            <span className="detail-label">Due Date:</span>
            <span>{new Date(item.due_date).toLocaleDateString()}</span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">Status:</span>
          <span className={`status-badge ${item.status}`}>
            {item.status}
          </span>
        </div>

        {item.assigned_to_name && (
          <div className="detail-item">
            <span className="detail-label">Assigned To:</span>
            <span>{item.assigned_to_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemList;
