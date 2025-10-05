import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Default commission rate (10%)
const DEFAULT_COMMISSION_RATE = 0.10;

// User functions
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await addDoc(collection(db, 'users'), {
        ...userData,
        userId,
        role: 'user', // default role
        banned: false,
        commissionRate: DEFAULT_COMMISSION_RATE, // Default commission rate for sellers
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...userData });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user commission rate
export const getUserCommissionRate = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.commissionRate || DEFAULT_COMMISSION_RATE;
    }
    return DEFAULT_COMMISSION_RATE;
  } catch (error) {
    console.error('Error getting user commission rate:', error);
    return DEFAULT_COMMISSION_RATE;
  }
};

// Update user commission rate (admin only)
export const updateUserCommissionRate = async (userId, commissionRate) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { commissionRate });
  } catch (error) {
    console.error('Error updating user commission rate:', error);
    throw error;
  }
};

// Product functions
export const createProduct = async (userId, productData) => {
  try {
    // Get user's commission rate
    const commissionRate = await getUserCommissionRate(userId);
    
    // Calculate prices
    const sellerPrice = parseFloat(productData.price);
    const adminCommission = sellerPrice * commissionRate;
    const finalPrice = sellerPrice + adminCommission;
    
    const productRef = await addDoc(collection(db, 'products'), {
      ...productData,
      ownerId: userId,
      sellerPrice: sellerPrice,
      adminCommission: adminCommission,
      finalPrice: finalPrice,
      commissionRate: commissionRate,
      status: 'available',
      createdAt: serverTimestamp(),
    });
    return productRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getProducts = async (status = 'available') => {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const getUserProducts = async (userId) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user products:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, { ...productData });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Order functions
export const createOrder = async (orderData) => {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      timestamp: serverTimestamp(),
    });
    
    // Update the product status to 'sold' when an order is placed
    try {
      const productRef = doc(db, 'products', orderData.productId);
      await updateDoc(productRef, { 
        status: 'sold',
        buyerId: orderData.buyerId // Track who bought it
      });
    } catch (productUpdateError) {
      console.error('Error updating product status:', productUpdateError);
      // Don't throw because order was still created successfully
    }
    
    // Send notification to seller about new order
    try {
      // In a real implementation, this would trigger a notification to the seller
      // through a server-side API call or Firebase Functions
      console.log(`New order placed for seller ${orderData.sellerId}. Order ID: ${orderRef.id}`);
    } catch (notificationError) {
      console.error('Error sending notification to seller:', notificationError);
      // Don't throw because order was still created successfully
    }
    
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId, isBuyer = true) => {
  try {
    const field = isBuyer ? 'buyerId' : 'sellerId';
    const q = query(
      collection(db, 'orders'),
      where(field, '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, sellerLocation = null) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData = { status };
    
    // If seller location is provided, update it as well
    if (sellerLocation) {
      updateData.sellerLocation = sellerLocation;
    }
    
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

export const banUser = async (userId, banned) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { banned });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all products:', error);
    throw error;
  }
};

// Admin commission management
export const updateGlobalCommissionRate = async (newRate) => {
  try {
    // Update all users with the new commission rate
    const users = await getAllUsers();
    const updatePromises = users.map(user => 
      updateUserCommissionRate(user.id, newRate)
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating global commission rate:', error);
    throw error;
  }
};