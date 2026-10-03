export const calculatePasswordStrength = (password: string) => {
  if (!password)
    return { score: 0, label: "", color: "bg-stone-300", percentage: 0 };

  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 12.5;
  if (/[^A-Za-z0-9]/.test(password)) score += 12.5;

  if (score <= 35) {
    return {
      score,
      label: "Weak",
      color: "bg-rose-500",
      text: "text-rose-600",
      percentage: Math.max(score, 15),
    };
  } else if (score <= 70) {
    return {
      score,
      label: "Medium",
      color: "bg-amber-500",
      text: "text-amber-600",
      percentage: score,
    };
  } else {
    return {
      score,
      label: "Strong",
      color: "bg-emerald-600",
      text: "text-emerald-600",
      percentage: 100,
    };
  }
};