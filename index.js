const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Setting up mongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Successfully connected with mongoDB");
})
.catch((err) => {
    console.log("Error while connecting to mongoDB: ", err);
});

// Creating user schema and model for users collection(username, password)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Creating task schema and model to perform CRUD operations
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 3 },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Task = mongoose.model('Task', taskSchema);

// Middleware to verify token and secret key
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send("Access Denied !");
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(400).send("Invalid token");
    }
};

// Basic routes 
// User signup
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send("User signedup successfully..!");
    } catch (err) {
        console.log("Signup error", err);
        res.status(400).send("Error while user signing up");
    }
});

// Login route to verify user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("User not found");
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("Incorrect password");
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ message: "Login successful..!", token }); 
    } catch (err) {
        res.status(500).send("Error while login");
    }
});

// Create task route - only authorized user can access for CRUD
app.post('/tasks', authMiddleware, async (req, res) => {
    try {
        const { title, completed } = req.body;
        const task = new Task({
            title,
            completed: completed || false,
            userId: req.user.id // jwt decoded
        });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: "Error while creating task", error: err.message });
    }
});

// Get all tasks for authenticated user
app.get('/tasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Error while fetching tasks", error: err.message });
    }
});

// Update task by ID
app.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const { title, completed } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title, completed },
            { new: true }
        );
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (err) {
        res.status(400).json({ message: "Error while updating task", error: err.message });
    }
});


// Get specific task by ID
app.get('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (err) {
        res.status(400).json({ message: "Error while fetching task", error: err.message });
    }
});

// Delete task by ID
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "Error while deleting task", error: err.message });
    }
});

// Simple default route
app.get('/', (req, res) => {
    res.send("Hello, the server is running.");
});

// Health route for verifying API functionality
app.get('/health', (req, res) => {
    res.send("The task manager API is running...!!");
});

// Test route
app.post('/test', (req, res) => {
    console.log("Body received:", req.body);
    res.send({ received: req.body });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
