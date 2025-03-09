require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define User Schema & Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    employees: { type: Number, required: true }
});
const User = mongoose.model('User', userSchema);

// ✅ Middleware
app.use(cors()); // Enable CORS (if frontend runs on a different port)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Default Route (For Testing)
app.get('/', (req, res) => {
    res.send("🚀 Backend is Running! Use /api/join to submit data.");
});

// ✅ Join Waitlist API
app.post('/api/join', async (req, res) => {
    try {
        console.log('📥 Received form data:', req.body);

        const { name, email, company, employees } = req.body;
        if (!name || !email || !company || !employees) {
            return res.status(400).json({ error: '❌ Missing required fields' });
        }

        // ✅ Check if email already exists (Prevent duplicates)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: '⚠️ Email already registered!' });
        }

        const newUser = new User({ name, email, company, employees });
        await newUser.save();

        console.log('✅ User saved successfully:', newUser);
        res.status(201).json({ message: '🎉 Successfully joined the waitlist!' });
    } catch (err) {
        console.error('❌ Error saving to database:', err);
        res.status(500).json({ error: '❌ Server error. Please try again later.' });
    }
});

// ✅ Get All Users (For Debugging)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json(users);
    } catch (err) {
        console.error('❌ Error fetching users:', err);
        res.status(500).json({ error: '❌ Error fetching user data' });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
