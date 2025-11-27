export interface PasswordStrength {
  score: number; // 0-4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string[];
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'Weak',
      color: 'red',
      feedback: ['Password is required'],
    };
  }

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('One uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('One lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('One number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('One special character (!@#$%^&*)');
  }

  // Bonus for longer passwords
  if (password.length >= 12) {
    score = Math.min(5, score + 1);
  }

  // Determine label and color
  let label: PasswordStrength['label'];
  let color: string;

  if (score === 0 || score === 1) {
    label = 'Weak';
    color = 'red';
  } else if (score === 2) {
    label = 'Fair';
    color = 'orange';
  } else if (score === 3) {
    label = 'Good';
    color = 'yellow';
  } else if (score === 4) {
    label = 'Strong';
    color = 'green';
  } else {
    label = 'Very Strong';
    color = 'emerald';
  }

  return { score, label, color, feedback };
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-orange-500';
  if (score === 3) return 'bg-yellow-500';
  if (score === 4) return 'bg-green-500';
  return 'bg-emerald-500';
};

export const getPasswordStrengthTextColor = (score: number): string => {
  if (score <= 1) return 'text-red-600';
  if (score === 2) return 'text-orange-600';
  if (score === 3) return 'text-yellow-600';
  if (score === 4) return 'text-green-600';
  return 'text-emerald-600';
};
