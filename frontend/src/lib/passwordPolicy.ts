/**
 * Password policy validator — shared between frontend & referenced in schemas.py
 * Policy: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
 */
export function validatePassword(password: string): { valid: boolean; message: string; score: number; label: string; color: string } {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit:     /\d/.test(password),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score  = Math.round((passed / 5) * 100);

  let label = 'Too weak';
  let color = '#ef4444';
  if (passed >= 5) { label = 'Strong 💪'; color = '#10b981'; }
  else if (passed >= 4) { label = 'Good';    color = '#f59e0b'; }
  else if (passed >= 3) { label = 'Fair';    color = '#f97316'; }

  if (!checks.length)    return { valid: false, message: 'Password must be at least 8 characters.', score, label, color };
  if (!checks.uppercase) return { valid: false, message: 'Add at least one uppercase letter (A-Z).', score, label, color };
  if (!checks.lowercase) return { valid: false, message: 'Add at least one lowercase letter (a-z).', score, label, color };
  if (!checks.digit)     return { valid: false, message: 'Add at least one number (0-9).', score, label, color };
  if (!checks.special)   return { valid: false, message: 'Add at least one special character (!@#$%^&*).', score, label, color };

  return { valid: true, message: 'Strong password!', score, label, color };
}

export const PASSWORD_HINT = 'Min 8 chars · Uppercase · Lowercase · Number · Special char (!@#$)';
