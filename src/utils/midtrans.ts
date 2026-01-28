/**
 * Midtrans Payment Gateway Integration
 * 
 * This utility handles Midtrans payment gateway integration
 * for seamless bank transfer directly in the application
 */

export interface MidtransConfig {
  clientKey: string;
  serverKey: string;
  isProduction: boolean;
}

export interface MidtransTransaction {
  order_id: string;
  gross_amount: number;
  customer_details: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  item_details: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  callbacks?: {
    finish?: string;
    unfinish?: string;
    error?: string;
  };
}

// Get Midtrans config from environment variables
export function getMidtransConfig(): MidtransConfig | null {
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  const serverKey = import.meta.env.VITE_MIDTRANS_SERVER_KEY;
  const isProduction = import.meta.env.VITE_MIDTRANS_PRODUCTION === 'true';

  if (!clientKey) {
    console.warn('Midtrans client key not configured');
    return null;
  }

  return {
    clientKey,
    serverKey: serverKey || '',
    isProduction: isProduction || false,
  };
}

// Check if Midtrans is enabled
export function isMidtransEnabled(): boolean {
  return !!import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
}

// Generate order ID from payment ID
export function generateOrderId(paymentId: string): string {
  const timestamp = Date.now();
  return `PAY-${paymentId.substring(0, 8)}-${timestamp}`;
}

// Create transaction data for Midtrans
export function createMidtransTransaction(
  paymentId: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  itemName: string,
  callbacks?: {
    finish?: string;
    unfinish?: string;
    error?: string;
  }
): MidtransTransaction {
  const orderId = generateOrderId(paymentId);

  return {
    order_id: orderId,
    gross_amount: amount,
    customer_details: {
      first_name: customerName.split(' ')[0] || customerName,
      last_name: customerName.split(' ').slice(1).join(' ') || undefined,
      email: customerEmail,
    },
    item_details: [
      {
        id: paymentId,
        price: amount,
        quantity: 1,
        name: itemName,
      },
    ],
    callbacks,
  };
}

