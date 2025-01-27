import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['vendor'], default: 'vendor' },
  specialization: [{ type: String }],
  activeTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  rejectedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  workProofsUploaded: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    imageUrl: String,
    description: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  quotations: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    materials: [{ material: String, cost: Number }],
    totalCost: Number,
    submittedAt: Date
  }],
  overdueTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
}, {
  timestamps: true
});


vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

vendorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Vendor', vendorSchema);
