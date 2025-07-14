export function generateReferralCode(userId: string): string {
  // Generate a unique 8-character code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const userHash = userId.slice(-4).toUpperCase()
  let code = userHash
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}