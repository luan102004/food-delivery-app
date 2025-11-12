import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  applicableRestaurants?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_delivery'],
      required: true,
    },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    applicableRestaurants: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
  },
  { timestamps: true }
);

export default mongoose.models.Promotion ||
  mongoose.model<IPromotion>('Promotion', PromotionSchema);