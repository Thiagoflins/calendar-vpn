export function getInitials(nome?: string, email?: string): string {
  if (nome) {
    return nome.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
  return (email?.[0] ?? '?').toUpperCase();
}
