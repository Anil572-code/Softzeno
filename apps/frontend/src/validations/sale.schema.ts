import { z } from 'zod'

export const paymentSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE', 'SPLIT']),
  amountPaid: z.number().min(0),
  notes: z.string().optional(),
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
})

export type PaymentFormData = z.infer<typeof paymentSchema>
export type CustomerFormData = z.infer<typeof customerSchema>
