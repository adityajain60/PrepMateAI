import mongoose from 'mongoose';

// Create user schema for mongoDB

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User; 