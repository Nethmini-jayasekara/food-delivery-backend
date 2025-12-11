const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5068";

export async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch products: ${res.status} - ${text}`);
    }

    return res.json();
  } catch (err) {
    console.error('Error fetching products:', err);
    throw err; // re-throw so your UI can handle it
  }
}


export async function postOrder(order: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(order),
  });

  if (!res.ok) throw new Error('Failed to submit order');

  return res.json();
}

export async function login(payload: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) throw new Error('Failed to login');
  
  return res.json();
}