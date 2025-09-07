import mongoose, { Schema } from "mongoose";
import type { IUser } from "../types/users";

// User schema definition
const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    picture: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "users",
  }
);

// Indexes for performance optimization
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ googleId: 1, isActive: 1 });

// Instance methods
userSchema.methods.toUserDto = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    picture: this.picture,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static methods
userSchema.statics.findByGoogleId = function (googleId: string) {
  return this.findOne({ googleId, isActive: true });
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

userSchema.statics.existsByEmail = function (email: string) {
  return this.exists({ email: email.toLowerCase(), isActive: true });
};

// Pre-save middleware to ensure email is lowercase
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Export additional types for static methods
export interface IUserModel extends mongoose.Model<IUser> {
  findByGoogleId(googleId: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  existsByEmail(email: string): Promise<boolean>;
}

// Export the model
export const User = mongoose.model<IUser>("User", userSchema) as IUserModel;
