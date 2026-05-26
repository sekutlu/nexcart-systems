export type Role = "CUSTOMER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
};

export type CartItem = {
  id: string;
  quantity: number;
  product: Product;
};

export type Order = {
  id: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
  total: number;
  createdAt: string;
};

type RequestOptions = {
  token?: string;
  body?: unknown;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? (options.body ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error ?? "API request failed");
    }

    return data as T;
  }

  login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/login", {
      body: { email, password }
    });
  }

  register(name: string, email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/register", {
      body: { name, email, password }
    });
  }

  products() {
    return this.request<Product[]>("/products");
  }

  cart(token: string) {
    return this.request<CartItem[]>("/cart", { token });
  }

  addToCart(token: string, productId: string, quantity = 1) {
    return this.request<CartItem>("/cart", {
      token,
      body: { productId, quantity }
    });
  }

  orders(token: string) {
    return this.request<Order[]>("/orders", { token });
  }

  createOrder(token: string) {
    return this.request<Order>("/orders", { token, method: "POST" });
  }
}
