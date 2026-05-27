import { NextRequest } from "next/server";
import { serializeProduct } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";

const DEMO = [
  { id: "1",  name: "Dell XPS 15 Laptop",           description: "Intel Core i9, 32GB RAM, 1TB SSD, OLED 4K display. Built for professionals.",       price: 34199, stock: 12,  imageUrl: null, isActive: true, category: "Computers",    createdAt: new Date(), updatedAt: new Date() },
  { id: "2",  name: "HP EliteBook 840 G10",          description: "Intel Core i7, 16GB RAM, 512GB SSD. Enterprise-grade security & performance.",      price: 22499, stock: 8,   imageUrl: null, isActive: true, category: "Computers",    createdAt: new Date(), updatedAt: new Date() },
  { id: "3",  name: "Apple MacBook Pro M3",          description: "M3 Pro chip, 18GB unified memory, 512GB SSD. Supercharged for pros.",               price: 39599, stock: 5,   imageUrl: null, isActive: true, category: "Computers",    createdAt: new Date(), updatedAt: new Date() },
  { id: "4",  name: "Lenovo ThinkPad X1 Carbon",    description: "Ultra-light 14\" IPS, Core i7, 16GB RAM, 512GB NVMe.",                              price: 25199, stock: 7,   imageUrl: null, isActive: true, category: "Computers",    createdAt: new Date(), updatedAt: new Date() },
  { id: "5",  name: "Cisco Catalyst 2960 Switch",   description: "24-port Gigabit managed switch. Ideal for enterprise LAN deployments.",             price: 11699, stock: 3,   imageUrl: null, isActive: true, category: "Networking",   createdAt: new Date(), updatedAt: new Date() },
  { id: "6",  name: "TP-Link AX6000 Wi-Fi 6 Router",description: "Wi-Fi 6, 8-stream, 6000 Mbps. Perfect for high-density environments.",             price: 5399,  stock: 14,  imageUrl: null, isActive: true, category: "Networking",   createdAt: new Date(), updatedAt: new Date() },
  { id: "7",  name: "Samsung 27\" 4K Monitor",       description: "IPS, 144Hz, HDR600, USB-C. Crystal-clear visuals for any workflow.",               price: 9899,  stock: 20,  imageUrl: null, isActive: true, category: "ICT Products", createdAt: new Date(), updatedAt: new Date() },
  { id: "8",  name: "Logitech MX Keys Combo",        description: "Wireless keyboard & MX Master 3S mouse. Precision crafted for creators.",          price: 3599,  stock: 35,  imageUrl: null, isActive: true, category: "ICT Products", createdAt: new Date(), updatedAt: new Date() },
  { id: "9",  name: "SanDisk 2TB Portable SSD",     description: "USB-C, 1050MB/s read. Rugged pocket-sized storage for on-the-go.",                 price: 3239,  stock: 22,  imageUrl: null, isActive: true, category: "ICT Products", createdAt: new Date(), updatedAt: new Date() },
  { id: "10", name: "Webcam Logitech Brio 4K",       description: "4K Ultra HD, HDR, Windows Hello. Studio-quality video calls.",                    price: 3599,  stock: 18,  imageUrl: null, isActive: true, category: "ICT Products", createdAt: new Date(), updatedAt: new Date() },
  { id: "11", name: "Starter Web Hosting Plan",      description: "1 website, 10GB SSD, free SSL, 99.9% uptime. Perfect for personal projects.",      price: 72,    stock: 999, imageUrl: null, isActive: true, category: "Web Hosting",  createdAt: new Date(), updatedAt: new Date() },
  { id: "12", name: "Business Hosting Pro",          description: "Unlimited sites, 100GB NVMe SSD, free domain, daily backups & CDN.",              price: 234,   stock: 999, imageUrl: null, isActive: true, category: "Web Hosting",  createdAt: new Date(), updatedAt: new Date() },
  { id: "13", name: "VPS Cloud Server — 4 vCPU",    description: "4 vCPU, 8GB RAM, 160GB SSD, 4TB bandwidth. Full root access.",                    price: 719,   stock: 999, imageUrl: null, isActive: true, category: "Web Hosting",  createdAt: new Date(), updatedAt: new Date() },
  { id: "14", name: "Dedicated Server — Xeon E5",   description: "Xeon E5, 64GB ECC RAM, 2×2TB RAID. Maximum power for demanding workloads.",       price: 2699,  stock: 10,  imageUrl: null, isActive: true, category: "Web Hosting",  createdAt: new Date(), updatedAt: new Date() },
  { id: "15", name: "UPS APC Back-UPS 1500VA",      description: "1500VA/865W, 10 outlets, AVR, LCD display. Protect your equipment.",              price: 3959,  stock: 9,   imageUrl: null, isActive: true, category: "Accessories",  createdAt: new Date(), updatedAt: new Date() },
  { id: "16", name: "Antivirus — Kaspersky Total",  description: "5 devices, 1 year. Real-time protection, VPN, password manager.",                 price: 899,   stock: 999, imageUrl: null, isActive: true, category: "Accessories",  createdAt: new Date(), updatedAt: new Date() },
];

function applyFilters(products: typeof DEMO, search: string, category: string, minPrice: number, maxPrice: number) {
  return products.filter(p => {
    if (!p.isActive) return false;
    if (category && category !== "All") {
      if (p.category?.toLowerCase() !== category.toLowerCase()) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    if (minPrice > 0 && p.price < minPrice) return false;
    if (maxPrice > 0 && p.price > maxPrice) return false;
    return true;
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search   = searchParams.get("search")   ?? "";
  const category = searchParams.get("category") ?? "";
  const minPrice = Number(searchParams.get("minPrice") ?? 0);
  const maxPrice = Number(searchParams.get("maxPrice") ?? 0);

  try {
    const where: Record<string, unknown> = { isActive: true };
    if (search)   where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    if (category && category !== "All") where.category = category;
    if (minPrice > 0 || maxPrice > 0) {
      where.price = {};
      if (minPrice > 0) (where.price as Record<string, number>).gte = minPrice;
      if (maxPrice > 0) (where.price as Record<string, number>).lte = maxPrice;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return Response.json(products.map(serializeProduct));
  } catch {
    // DB unavailable — return filtered demo data
    const filtered = applyFilters(DEMO, search, category, minPrice, maxPrice);
    return Response.json(filtered.map(serializeProduct));
  }
}
