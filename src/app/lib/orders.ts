export interface OrderItem {
  nameAr: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  totalPrice: number;
  timestamp: number;
  status: 'pending' | 'completed';
}

const STORAGE_KEY = 'laguna-orders';

export function getOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function completeOrder(orderId: string): void {
  const orders = getOrders().map(o =>
    o.id === orderId ? { ...o, status: 'completed' as const } : o
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}
