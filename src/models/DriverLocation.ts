import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverLocation extends Document {
  driverId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  isAvailable: boolean;
  currentOrderId?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const DriverLocationSchema = new Schema<IDriverLocation>(
  {
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    isAvailable: { type: Boolean, default: true },
    currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

DriverLocationSchema.index({ location: '2dsphere' });
DriverLocationSchema.index({ driverId: 1 });

export default mongoose.models.DriverLocation ||
  mongoose.model<IDriverLocation>('DriverLocation', DriverLocationSchema);