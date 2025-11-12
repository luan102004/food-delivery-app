import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPromotion extends Document {
  userId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  usedAt: Date;
}

const UserPromotionSchema = new Schema<IUserPromotion>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  usedAt: { type: Date, default: Date.now },
});

UserPromotionSchema.index({ userId: 1, promotionId: 1 });

export default mongoose.models.UserPromotion ||
  mongoose.model<IUserPromotion>('UserPromotion', UserPromotionSchema);