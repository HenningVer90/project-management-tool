# Project Management Tool

A comprehensive project management application with support for projects, tasks, items, progress tracking, and email notifications. Built with Node.js/Express backend and React frontend, powered by PostgreSQL.

## Features

- **Project Management**: Create, update, and manage projects
- **Task Management**: Organize work within projects into tasks
- **Item Management**: Add items to tasks (similar to MS Planner)
- **Progress Tracking**: Automatic progress calculation at project and task levels
- **Email Notifications**: Receive notifications when:
  - A new project is created
  - A new task is created
  - A new item is added
  - An item is marked as done
  - A project is closed
- **User Management**: Create and manage multiple users
- **Multi-user Support**: Switch between users and view user-specific projects

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Nodemailer (Gmail)

### Frontend
- React 18
- Axios (HTTP client)
- CSS3

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/project-management-tool.git
cd project-management-tool
```

### 2. Set Up PostgreSQL Database

```bash
# Create database
createdb project_management

# Run schema
psql project_management < server/schema.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Update `.env` with:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=project_management

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

PORT=5000
NODE_ENV=development
```

**Note**: For Gmail, you need to generate an [App Password](https://myaccount.google.com/apppasswords) if you have 2FA enabled.

### 4. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 5. Start the Application

**Option 1: Run both server and client in separate terminals**

Terminal 1 - Start backend:
```bash
npm run dev
```

Terminal 2 - Start frontend:
```bash
npm run client
```

**Option 2: Run server in production**

Backend only:
```bash
npm start
```

## API Documentation

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects/user/:userId` - Get user's projects
- `GET /api/projects/:id` - Get project details with progress
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/close` - Close project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Items
- `GET /api/items/task/:taskId` - Get task items
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `POST /api/items/:id/complete` - Mark item as completed
- `DELETE /api/items/:id` - Delete item

## Project Structure

```
project-management-tool/
├── server/
│   ├── index.js              # Main server file
│   ├── db.js                 # Database connection
│   ├── email.js              # Email service
│   ├── schema.sql            # Database schema
│   └── routes/
│       ├── users.js          # User endpoints
│       ├── projects.js       # Project endpoints
│       ├── tasks.js          # Task endpoints
│       └── items.js          # Item endpoints
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js            # Main app component
│       ├── App.css
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── ProjectList.js
│           ├── ProjectDetail.js
│           ├── TaskList.js
│           ├── ItemList.js
│           ├── UserManagement.js
│           ├── CreateProjectModal.js
│           └── CSS files
├── .env.example              # Environment variables template
├── package.json              # Backend dependencies
└── README.md
```

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `projects` - Project definitions
- `project_members` - Project sharing
- `tasks` - Tasks within projects
- `items` - Individual work items
- `notifications` - Notification log

## Usage Guide

### Creating a Project
1. Click "+ New Project" button
2. Fill in project name and description
3. Optionally add an email for notifications
4. Click "Create Project"

### Adding Tasks
1. Open a project
2. Enter task name in the input field
3. Click "Add Task"

### Adding Items
1. Open a task
2. Enter item title
3. Click "Add Item"
4. Edit the item to add description, priority, and due date

### Marking Items Complete
- Click the checkbox next to an item to mark it as done
- A notification will be sent if configured

### Progress Tracking
- Project progress is calculated as: (completed items / total items) × 100
- Progress updates automatically as items are completed

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify credentials in `.env`
- Check if `project_management` database exists

### Email Not Sending
- Verify Gmail credentials
- Enable "Less secure app access" or use App Passwords
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`

### Frontend Not Loading
- Ensure backend is running on port 5000
- Check for CORS errors in browser console
- Verify proxy setting in `client/package.json`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please create an issue on GitHub.
