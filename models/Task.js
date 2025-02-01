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
    geoLocation: { 
      type: { type: String , default: 'Point' }, 
      coordinates: [Number] },
      uploadedAt: { type: Date, default: Date.now }
  }],
  finalBillMaterialUsed: {
    materials: [
      {
        material: { type: String, required: true },
        cost: { type: Number, required: true }
      }
    ],
    totalCost: { type: Number, default: 0 } // Will be calculated automatically
  },
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

// Pre-save hook to calculate totalCost for finalBillMaterialUsed
taskSchema.pre('save', function (next) {
  if (this.finalBillMaterialUsed && this.finalBillMaterialUsed.materials) {
    this.finalBillMaterialUsed.totalCost = this.finalBillMaterialUsed.materials.reduce(
      (sum, item) => sum + item.cost,
      0
    );
  }
  next();
});

// Middleware to handle updates and recalculate totalCost
taskSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update && update.finalBillMaterialUsed && update.finalBillMaterialUsed.materials) {
    const totalCost = update.finalBillMaterialUsed.materials.reduce(
      (sum, item) => sum + item.cost,
      0
    );
    update.finalBillMaterialUsed.totalCost = totalCost;
  }
  next();
});
export default mongoose.model('Task', taskSchema);
