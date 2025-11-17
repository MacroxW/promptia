export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ')
}

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}
