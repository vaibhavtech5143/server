import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['resident'], default: 'resident' },
  address: {
    flatNumber: String,
    buildingName: String,
    wing: String,
    streetName: String,
    landmark: String,
    pinCode: String,
  },
  // Removed `unique: true` and added logic to enforce uniqueness programmatically
  repairHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
  ],
  mobile: { type: String, required: true },
  feedbacks: [
    {
      requestId: mongoose.Schema.Types.ObjectId,
      feedback: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Middleware to enforce uniqueness in `repairHistory`
userSchema.pre('save', function (next) {
  if (this.repairHistory) {
    // Remove duplicate ObjectIds
    this.repairHistory = [...new Set(this.repairHistory.map((id) => id.toString()))];
  }
  next();
});

// Compare user passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
