/**
 * Validates a Philippine mobile number
 * Format: 11 digits, starts with "09"
 */
export function isValidPHMobile(number: string): boolean {
  const cleanNumber = number.replace(/\D/g, '')
  return /^09\d{9}$/.test(cleanNumber)
}

/**
 * Sanitizes a phone number to exactly 11 digits
 */
export function sanitizePHMobile(number: string): string {
  return number.replace(/\D/g, '')
}
