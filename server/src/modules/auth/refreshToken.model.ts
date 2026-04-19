import mongoose, { Schema } from 'mongoose';
import { IRefreshToken } from '../../types';

/**
 * REFRESH TOKEN (JWT)d
 * WHOLE MONGOOSE MODEL
 */
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },

    device: {
      type: String,
    },

    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },
  },
  { timestamps: true },
);

/*
=========== INDEXES ===========
*/
// AUTO-DELETE EXPIRES TOKEN
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// QUERY ACTIVE SESSIONS FAST
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

// OPTIONAL: FASTER LOOKUP DURING REFRESH
refreshTokenSchema.index({ token: 1, isRevoked: 1 });

const RefreshToken = mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema,
);
export default RefreshToken;