import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['painting', 'plumbing', 'electrical', 'furniture', 'waterproofing', 'plastering', 'tile', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'assigned', 'in-progress', 'completed', 'rejected', 'overdue'],
    default: 'pending'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supervisor', 
    required: function() { return this.status !== 'pending'; } 
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  preferredCompletionTime: {
    startDate: { type: Date },
    endDate: { type: Date }
  },
  currentDeadline: { type: Date },
  completionDate: { type: Date },
  workProofs: [{
    description: String,
    imageUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  materialsUsed: [{
    material: String,
    cost: Number
  }],
  progress: [{
    status: { type: String, enum: ['Pending', 'Started', 'Halfway', 'Almost Done', 'Completed'] },
    description: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  quotation: {
    materials: [{ material: String, cost: Number }],
    totalCost: { type: Number }
  },
  overdueAlert: {
    reason: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);
