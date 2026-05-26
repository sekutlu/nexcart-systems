import { Product } from "@prisma/client";

export function serializeProduct(product: Product) {
  return {
    ...product,
    price: Number(product.price)
  };
}
