/**
 * Generates a memorable 6-character alphanumeric booking code.
 * Excludes easily confusable characters (like 0, O, 1, I, L) for great user experience.
 */
export function generateBookingCode(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
