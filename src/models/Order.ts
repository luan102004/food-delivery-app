import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promotionId?: mongoose.Types.ObjectId;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'picked_up'
    | 'delivering'
    | 'delivered'
    | 'cancelled';
  deliveryAddress: string;
  deliveryLocation: {
    type: string;
    coordinates: [number, number];
  };
  paymentMethod: 'cash' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'delivering',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    deliveryAddress: { type: String, required: true },
    deliveryLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'wallet'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    notes: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ driverId: 1 });
OrderSchema.index({ deliveryLocation: '2dsphere' });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);