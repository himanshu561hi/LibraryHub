import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    // Normalized actor fields
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    actorName: {
      type: String,
      default: '',
    },
    actorEmail: {
      type: String,
      default: '',
    },
    actorRole: {
      type: String,
      default: 'admin',
    },
    // Nested actor object for frontend and controller compatibility
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      role: { type: String, default: 'admin' },
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    // Target entity fields supporting both naming conventions
    entityType: {
      type: String,
      index: true,
    },
    targetEntity: {
      type: String,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    beforeState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    afterState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // provides createdAt & updatedAt
  }
);

// Pre-validate hook to seamlessly normalize both flat and nested structures
auditLogSchema.pre('validate', function (next) {
  // Normalize actor
  if (this.actor) {
    if (!this.actorId && this.actor.id) this.actorId = this.actor.id;
    if (!this.actorRole && this.actor.role) this.actorRole = this.actor.role;
    if (!this.actorEmail && this.actor.email) this.actorEmail = this.actor.email;
    if (!this.actorName && this.actor.name) this.actorName = this.actor.name;
  } else if (this.actorId) {
    this.actor = {
      id: this.actorId,
      name: this.actorName || '',
      email: this.actorEmail || '',
      role: this.actorRole || 'admin',
    };
  }

  // Fallback defaults if actor info is somehow missing
  if (!this.actorId) {
    this.actorId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
  }
  if (!this.actorRole) {
    this.actorRole = 'admin';
  }

  // Normalize target entity / entity type
  const entity = this.targetEntity || this.entityType || 'General';
  this.entityType = entity;
  this.targetEntity = entity;

  // Normalize target ID / entity ID
  const id = this.targetId || this.entityId || new mongoose.Types.ObjectId();
  this.entityId = id;
  this.targetId = id;

  if (!this.timestamp) {
    this.timestamp = this.createdAt || new Date();
  }

  next();
});

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ targetEntity: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
