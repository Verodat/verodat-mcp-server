import { z } from 'zod';
import { MessageSchema } from '../types/schemas.js';
export function validateMessage(data) {
    try {
        MessageSchema.parse(data);
        return true;
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid message format: ${error.message}`);
        }
        throw error;
    }
}
