import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
});
 

export const ProductsResponseSchema = z.array(ProductSchema);