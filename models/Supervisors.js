import mongoose from 'mongoose';

const supervisorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['supervisor'], default: 'supervisor' },
  
  assignedBuildings: [{ buildingName: String, wing: String }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  approvedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' , unique: true}],
  rejectedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  overdueTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  alerts: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    reason: String,
    generatedAt: Date
  }]
}, {
  timestamps: true
});

export default mongoose.model('Supervisor', supervisorSchema);
