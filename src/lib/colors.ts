import { EventColor, ColorMap } from '@/types';

export const COLOR_MAP: Record<EventColor, ColorMap> = {
  azul:    { bg: '#E6F1FB', text: '#185FA5', dot: '#2E5AAC' },
  verde:   { bg: '#E1F5EE', text: '#0F6E56', dot: '#1D9E75' },
  rosa:    { bg: '#FBEAF0', text: '#993556', dot: '#D4537E' },
  roxo:    { bg: '#EEEDFE', text: '#534AB7', dot: '#7F77DD' },
  laranja: { bg: '#FAECE7', text: '#993C1D', dot: '#D85A30' },
  amarelo: { bg: '#FAEEDA', text: '#854F0B', dot: '#BA7517' },
};

export const COLORS: EventColor[] = ['azul', 'verde', 'rosa', 'roxo', 'laranja', 'amarelo'];

export function getColor(cor: EventColor | undefined): ColorMap {
  return COLOR_MAP[cor ?? 'azul'] ?? COLOR_MAP.azul;
}
