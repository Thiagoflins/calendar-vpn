export const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export const DAYS_ABREV = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export function fd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function weekStart(d: Date): Date {
  const r = new Date(d);
  let dw = r.getDay();
  dw = dw === 0 ? 6 : dw - 1;
  r.setDate(r.getDate() - dw);
  return r;
}

export function weekEnd(d: Date): Date {
  const r = weekStart(d);
  r.setDate(r.getDate() + 6);
  return r;
}
