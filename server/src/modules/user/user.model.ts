import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../../types';

/*
=========== USER SCHEMA ============
*/
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;