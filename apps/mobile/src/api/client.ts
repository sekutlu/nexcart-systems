import { ApiClient } from "@nexcart/shared";

export const api = new ApiClient(process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api");
