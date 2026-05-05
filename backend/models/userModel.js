import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema Definition
 * Stores information for both Farmers (role: 'user') and Nursery Managers (role: 'admin')
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // Prevents duplicate accounts with the same email
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['farmer', 'admin'],
      default: 'farmer', // Default is registered farmer
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

/**
 * METHOD: Match user entered password to hashed password in database
 * We use bcrypt.compare because we don't store passwords in plain text!
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * PRE-SAVE HOOK: Encrypt password using bcrypt before saving to DB
 * This runs automatically whenever a user document is created or password is changed.
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or being modified
  if (!this.isModified('password')) {
    next();
  }

  // Generate a security "salt" (10 rounds is standard for speed/security balance)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
