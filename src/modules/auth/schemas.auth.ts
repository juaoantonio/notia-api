import { z } from 'zod';

export const CallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().optional(),
});

export type CallbackQuery = z.infer<typeof CallbackQuerySchema>;
