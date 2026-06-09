Task Manager API

A simple RESTful Task Manager API built with Node.js, Express, and MongoDB. It allows users to sign up, log in, and manage tasks (CRUD operations) with JWT authentication.

---

Live Demo

Deployed API: https://task-manager-api-26ge.onrender.com/

---

Tech Stack 🛠️

Node.js  
Express.js  
MongoDB & Mongoose  
JWT for authentication  
bcrypt for password hashing  
dotenv for environment variables  

---

API Endpoints

User Authentication
- Signup: POST /signup  
  Create a new user account  
  Body: { "username": "yourname", "email": "email@example.com", "password": "yourpassword" }

- Login: POST /login  
  Login with existing user credentials  
  Body: { "email": "email@example.com", "password": "yourpassword" }  
  Returns a JWT token for protected routes

Tasks (Protected – require JWT token)
- Get all tasks: GET /tasks  
  Fetch all tasks for the logged-in user

- Get task by ID: GET /tasks/:id  
  Fetch a specific task

- Create task: POST /tasks  
  Create a new task  
  Body: { "title": "Task title", "completed": false }

- Update task: PUT /tasks/:id  
  Update a task by ID  
  Body: { "title": "Updated title", "completed": true }

- Delete task: DELETE /tasks/:id  
  Delete a task by ID

Health Check
- Health: GET /health  
  Check if the API is running
