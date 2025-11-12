import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

export const triggerOrderUpdate = async (orderNumber: string, data: any) => {
  await pusherServer.trigger(`order-${orderNumber}`, 'order-updated', data);
};

export const triggerDriverLocation = async (driverId: string, location: any) => {
  await pusherServer.trigger(`driver-${driverId}`, 'location-updated', location);
};