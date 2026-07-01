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

const DB_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/orders';
const NOTIF_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/notifications';
const REPORTS_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/dailyReports';
const PASS_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/access/passwords';
const INVOICES_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/invoices';
const COUNTER_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/counters';

export interface DrinkSummary {
  nameAr: string;
  quantity: number;
  revenue: number;
}

export interface DailyReport {
  date: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  drinks: DrinkSummary[];
}

async function api(method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${DB_URL}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function apiId(id: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${DB_URL}/${id}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function notifApi(method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${NOTIF_URL}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function notifApiId(id: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${NOTIF_URL}/${id}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function getOrders(): Promise<Order[]> {
  const data = await api('GET');
  if (!data) return [];
  return Object.entries(data).map(([key, val]: [string, any]) => ({ ...val, id: key }));
}

export async function saveOrder(order: Omit<Order, 'id'>): Promise<void> {
  await api('POST', order);
}

export async function completeOrder(orderId: string): Promise<void> {
  await apiId(orderId, 'PATCH', { status: 'completed' });
}

export async function sendNotification(tableNumber: number): Promise<string> {
  const res = await notifApi('POST', {
    tableNumber,
    timestamp: Date.now(),
    read: false,
  });
  return res.name;
}

export interface Notification {
  id: string;
  tableNumber: number;
  timestamp: number;
  read: boolean;
}

export async function getNotifications(): Promise<Notification[]> {
  const data = await notifApi('GET');
  if (!data) return [];
  return Object.entries(data).map(([key, val]: [string, any]) => ({ ...val, id: key }));
}

export async function clearNotification(id: string): Promise<void> {
  await notifApiId(id, 'DELETE');
}

export async function clearAllOrders(): Promise<void> {
  const res = await fetch(`${DB_URL}.json`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear orders');
}

export async function clearOrdersByDate(dateStr: string): Promise<void> {
  const all = await getOrders();
  const dayStart = new Date(dateStr + 'T00:00:00').getTime();
  const dayEnd = dayStart + 86400000;
  const toDelete = all.filter(o => o.timestamp >= dayStart && o.timestamp < dayEnd);
  await Promise.all(toDelete.map(o =>
    fetch(`${DB_URL}/${o.id}.json`, { method: 'DELETE' })
  ));
}

async function reportsApi(method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${REPORTS_URL}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function reportsApiId(id: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${REPORTS_URL}/${id}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function saveDailyReport(report: DailyReport): Promise<void> {
  await reportsApiId(report.date, 'PUT', report);
}

export async function getDailyReports(): Promise<DailyReport[]> {
  const data = await reportsApi('GET');
  if (!data) return [];
  return Object.values(data).sort((a: DailyReport, b: DailyReport) => b.date.localeCompare(a.date));
}

export async function clearAllDailyReports(): Promise<void> {
  await reportsApi('DELETE');
}

export async function deleteDailyReport(date: string): Promise<void> {
  const res = await fetch(`${REPORTS_URL}/${date}.json`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete report');
}

// ── Passwords ────────────────────────────────────────────
export async function getPassword(role: 'waiter' | 'barista' | 'reports' | 'invoices'): Promise<string> {
  try {
    const res = await fetch(`${PASS_URL}/${role}.json`);
    const data = await res.json();
    return data || '';
  } catch {
    return '';
  }
}

export async function setPassword(role: string, password: string): Promise<void> {
  await fetch(`${PASS_URL}/${role}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(password),
  });
}

// ── Invoices ────────────────────────────────────────────
export interface Invoice {
  id: string;
  invoiceNumber: string;
  tableNumber: number;
  items: OrderItem[];
  totalPrice: number;
  createdAt: number;
  status: 'paid' | 'returned' | 'partial_return';
  returnedItems?: { nameAr: string; quantity: number }[];
}

export async function createInvoice(order: Order): Promise<Invoice | null> {
  try {
    const counterRes = await fetch(`${COUNTER_URL}/invoiceNumber.json`);
    let counter = await counterRes.json();
    counter = (counter || 0) + 1;
    await fetch(`${COUNTER_URL}/invoiceNumber.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(counter),
    });

    const invoice: Omit<Invoice, 'id'> = {
      invoiceNumber: `INV-${String(counter).padStart(4, '0')}`,
      tableNumber: order.tableNumber,
      items: order.items,
      totalPrice: order.totalPrice,
      createdAt: Date.now(),
      status: 'paid',
    };

    const res = await fetch(`${INVOICES_URL}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    const data = await res.json();
    return { ...invoice, id: data.name };
  } catch {
    return null;
  }
}

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetch(`${INVOICES_URL}.json`);
    const data = await res.json();
    if (!data) return [];
    return Object.entries(data).map(([key, val]: [string, any]) => ({ ...val, id: key }));
  } catch {
    return [];
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: 'paid' | 'returned' | 'partial_return',
  returnedItems?: { nameAr: string; quantity: number }[]
): Promise<void> {
  const body: any = { status };
  if (returnedItems) body.returnedItems = returnedItems;
  await fetch(`${INVOICES_URL}/${id}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
