import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import UserManagement from './components/UserManagement';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      if (response.data.length > 0) {
        setCurrentUser(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Error fetching users', 'error');
    }
  };

  const fetchProjects = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`/api/projects/user/${currentUser.id}`);
      setProjects(response.data);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showAlert('Error fetching projects', 'error');
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const response = await axios.post('/api/users', userData);
      setUsers([...users, response.data]);
      setCurrentUser(response.data);
      setShowUserModal(false);
      showAlert('User created successfully!', 'success');
    } catch (error) {
      console.error('Error creating user:', error);
      showAlert('Error creating user', 'error');
    }
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    setSelectedProject(null);
  };

  const handleProjectCreated = () => {
    fetchProjects();
    showAlert('Project created successfully!', 'success');
  };

  const handleProjectUpdated = () => {
    fetchProjects();
    if (selectedProject) {
      setSelectedProject(null);
    }
  };

  const handleProjectDeleted = () => {
    fetchProjects();
    setSelectedProject(null);
    showAlert('Project deleted successfully!', 'success');
  };

  const showAlert = (message, type) => {
    setAlertMessage({ text: message, type });
    setTimeout(() => setAlertMessage(''), 3000);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Management Tool</h1>
        <div className="header-actions">
          {currentUser && (
            <div className="user-info">
              <span>Logged in as: <strong>{currentUser.name}</strong></span>
              <select
                value={currentUser.id}
                onChange={(e) => handleSwitchUser(users.find(u => u.id == e.target.value))}
                className="user-select"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setShowUserModal(true)}
          >
            + New User
          </button>
        </div>
      </header>

      {alertMessage && (
        <div className={`alert alert-${alertMessage.type}`}>
          {alertMessage.text}
        </div>
      )}

      <div className="app-container">
        {currentUser ? (
          <>
            {selectedProject ? (
              <ProjectDetail
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
                onUpdate={handleProjectUpdated}
                onDelete={handleProjectDeleted}
                currentUser={currentUser}
              />
            ) : (
              <ProjectList
                projects={projects}
                currentUser={currentUser}
                onSelectProject={setSelectedProject}
                onProjectCreated={handleProjectCreated}
              />
            )}
          </>
        ) : (
          <div className="card">
            <h2>Welcome to Project Management Tool</h2>
            <p>Please create a user to get started.</p>
          </div>
        )}
      </div>

      {showUserModal && (
        <UserManagement
          onClose={() => setShowUserModal(false)}
          onUserCreated={handleAddUser}
        />
      )}
    </div>
  );
}

export default App;
