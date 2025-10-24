import React, { useState } from 'react';
import axios from 'axios';
import CreateProjectModal from './CreateProjectModal';
import './ProjectList.css';

function ProjectList({ projects, currentUser, onSelectProject, onProjectCreated }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProject = async (projectData) => {
    try {
      await axios.post('/api/projects', {
        name: projectData.name,
        description: projectData.description,
        owner_id: currentUser.id,
        notify_email: projectData.notify_email,
      });
      setShowCreateModal(false);
      onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project');
    }
  };

  const getProgressPercentage = (project) => {
    if (project.total_items === 0) return 0;
    return Math.round((project.completed_items / project.total_items) * 100);
  };

  return (
    <div className="project-list">
      <div className="project-list-header">
        <h2>My Projects</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <p>No projects yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`status-badge ${project.status}`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}

              <div className="project-stats">
                <div className="stat">
                  <span className="stat-label">Tasks:</span>
                  <span className="stat-value">{project.total_tasks || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Items:</span>
                  <span className="stat-value">{project.total_items || 0}</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className="progress-percentage">
                    {getProgressPercentage(project)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${getProgressPercentage(project)}%` }}
                  ></div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => onSelectProject(project)}
                style={{ width: '100%', marginTop: '10px' }}
              >
                View Project
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

export default ProjectList;
