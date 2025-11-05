import mongoose from "mongoose";

const AppealSchema = new mongoose.Schema(
  {
    appealId: { type: String, unique: true }, // Auto-generated unique ID
    
    // Appeal creator (coordinator)
    coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    aanganwadiCode: { type: String, required: true },
    aanganwadiName: { type: String, required: true },
    
    // Appeal details
    title: { type: String, required: true }, // Brief title of the appeal
    description: { type: String, required: true }, // Detailed description of need
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    
    // Items being requested
    requestedItems: [{
      itemType: {
        type: String,
        enum: ["money", "clothes", "books", "toys", "food", "stationary", "medical_supplies"],
        required: true
      },
      // For money requests
      amount: { type: Number }, // Amount needed
      purpose: { type: String }, // What the money will be used for
      
      // For physical items
      itemName: { type: String },
      quantity: { type: Number },
      specification: { type: String }, // Size, age group, etc.
      reason: { type: String }, // Why this item is needed
      
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
      }
    }],
    
    // Justification and supporting documents
    justification: { type: String, required: true }, // Why this appeal is necessary
    supportingDocuments: [{
      filename: String,
      url: String,
      publicId: String,
      uploadDate: { type: Date, default: Date.now },
      documentType: { type: String }, // "assessment_report", "photos", "needs_analysis", etc.
    }],
    
    // Current situation at aanganwadi
    currentSituation: {
      numberOfChildren: { type: Number },
      currentStock: { type: String }, // Description of current inventory
      immediateNeed: { type: String }, // Most urgent requirements
      impactIfNotFulfilled: { type: String }
    },
    
    // Appeal status and processing
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "partially_approved", "rejected", "fulfilled"],
      default: "pending"
    },
    
    // Admin/reviewer details
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewDate: { type: Date },
    reviewComments: { type: String },
    
    // Approval details
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: { type: Date },
    approvalComments: { type: String },
    
    // Approved items (might be different from requested)
    approvedItems: [{
      itemType: String,
      amount: Number, // For money
      itemName: String, // For physical items
      quantity: Number,
      specification: String,
      notes: String
    }],
    
    // Fulfillment tracking
    fulfillmentStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "partially_completed"],
      default: "not_started"
    },
    fulfilledItems: [{
      itemType: String,
      amount: Number,
      itemName: String,
      quantity: Number,
      fulfillmentDate: { type: Date },
      trackingNumber: String,
      notes: String
    }],
    
    // Timeline
    expectedFulfillmentDate: { type: Date },
    actualFulfillmentDate: { type: Date },
    
    // Communication
    statusUpdates: [{
      status: String,
      message: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now }
    }],
    
    // Feedback after fulfillment
    coordinatorFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      receivedDate: Date,
      feedbackDate: Date
    },
    
    // Additional metadata
    tags: [String], // For categorization
    isArchived: { type: Boolean, default: false },
    archivedDate: { type: Date },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Generate appeal ID
AppealSchema.pre('save', async function(next) {
  if (!this.appealId) {
    const count = await mongoose.model('Appeal').countDocuments();
    this.appealId = `APP${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Add status update when status changes
AppealSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusUpdates.push({
      status: this.status,
      message: `Status changed to ${this.status}`,
      updatedBy: this.reviewedBy || this.approvedBy,
      timestamp: new Date()
    });
  }
  next();
});

export const Appeal = mongoose.model("Appeal", AppealSchema);