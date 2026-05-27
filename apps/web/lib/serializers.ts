type ProductLike = {
  price: unknown;
  [key: string]: unknown;
};

export function serializeProduct(product: ProductLike) {
  return {
    ...product,
    price: Number(product.price)
  };
}
