import { notifyOrderUpdate } from './notificationService';

// Function to send notification to user
export const sendOrderNotification = async (userId, title, body, type) => {
  try {
    const response = await notifyOrderUpdate(userId, title, body);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

// Function to trigger notifications based on order status changes
export const handleOrderStatusChange = async (order, previousStatus) => {
  const { buyerId, sellerId, status, id: orderId } = order;
  
  // Notification details based on status change
  let buyerNotification, sellerNotification;
  
  switch (status) {
    case 'confirmed':
      buyerNotification = {
        title: 'Order Confirmed!',
        body: `Your order #${orderId.substring(0, 8)} has been confirmed by the seller. Get ready to enjoy your food!`,
        type: 'order_confirmed'
      };
      sellerNotification = {
        title: 'Order Confirmed',
        body: `You have confirmed order #${orderId.substring(0, 8)}. Remember to prepare the food.`,
        type: 'order_confirmation'
      };
      break;
      
    case 'delivered':
      buyerNotification = {
        title: 'Order Delivered!',
        body: `Your order #${orderId.substring(0, 8)} has been delivered. Enjoy your meal!`,
        type: 'order_delivered'
      };
      sellerNotification = {
        title: 'Order Delivered',
        body: `Order #${orderId.substring(0, 8)} has been marked as delivered.`,
        type: 'order_delivered'
      };
      break;
      
    default:
      // For other status changes, we might not send notifications
      break;
  }
  
  // Send notifications if defined
  const results = [];
  
  if (buyerNotification) {
    const buyerResult = await sendOrderNotification(buyerId, buyerNotification.title, buyerNotification.body, buyerNotification.type);
    results.push({ user: 'buyer', result: buyerResult });
  }
  
  if (sellerNotification) {
    const sellerResult = await sendOrderNotification(sellerId, sellerNotification.title, sellerNotification.body, sellerNotification.type);
    results.push({ user: 'seller', result: sellerResult });
  }
  
  return results;
};