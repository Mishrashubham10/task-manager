import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../types';
import bcrypt from 'bcrypt';

/*
=========== USER SCHEMA ============
*/
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // hide by default
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
  },
  {
    timestamps: true,
  },
);

/*
=========== INDEXES ============
*/
userSchema.index({ email: 1 });

// PASSWORD HASHING WITH PRE METHOD
userSchema.pre('save', async function name() {
  if (!this.isModified(this.password)) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// METHOD - COMPARE PASSWORD
userSchema.methods.comparePassword = async function (candidatePwd: string) {
  return bcrypt.compare(candidatePwd, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;