import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  address: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  email: string;
  image: string;
  cuisine: string[];
  rating: number;
  isActive: boolean;
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String },
    cuisine: [{ type: String }],
    rating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
      },
    ],
  },
  { timestamps: true }
);

RestaurantSchema.index({ location: '2dsphere' });

export default mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);