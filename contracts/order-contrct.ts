import { z } from "zod"

export const OrderSchema = z
  .object({
    status: z.string(),
    courierId: z.number().nullable(),
    customerName: z.string(),
    customerPhone: z.string(),
    comment: z.string(),
    id: z.number(),
  })
  .strict()
