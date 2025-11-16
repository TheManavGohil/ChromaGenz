import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColor {
  hex: string;
  rgb: string;
  hsl: string;
  name?: string;
}

export interface ITheme extends Document {
  name: string;
  colors: IColor[];
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ColorSchema: Schema = new Schema({
  hex: { type: String, required: true },
  rgb: { type: String, required: true },
  hsl: { type: String, required: true },
  name: { type: String },
});

const ThemeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
    },
    colors: {
      type: [ColorSchema],
      required: true,
      validate: {
        validator: (colors: IColor[]) => colors.length > 0,
        message: 'Theme must have at least one color',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
const Theme: Model<ITheme> = mongoose.models.Theme || mongoose.model<ITheme>('Theme', ThemeSchema);

export default Theme;


