import { z } from 'zod';

export const strictBoolean = z
  .literal([true, false, 'true', 'false'])
  .transform((val) => val === true || val === 'true');
