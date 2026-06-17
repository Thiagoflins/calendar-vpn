'use client';
import { useCallback, useRef } from 'react';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function useExportCalendar(date: Date) {
  const containerRef = useRef<HTMLDivElement>(null);

  const exportAs = useCallback(async (format: 'jpeg' | 'pdf') => {
    const node = containerRef.current;
    if (!node) return;

    // Mover para document.body como absolute evita recorte do viewport (position:fixed corta o conteúdo)
    const originalParent = node.parentElement;
    const originalNext = node.nextElementSibling;
    const prev = { position: node.style.position, top: node.style.top, left: node.style.left, visibility: node.style.visibility };
    node.style.position = 'absolute';
    node.style.top = '0px';
    node.style.left = '-9999px';
    node.style.visibility = 'visible';
    document.body.appendChild(node);

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());
      },
    });

    // Restaurar posição original
    node.style.position = prev.position;
    node.style.top = prev.top;
    node.style.left = prev.left;
    node.style.visibility = prev.visibility;
    if (originalParent) {
      if (originalNext) originalParent.insertBefore(node, originalNext);
      else originalParent.appendChild(node);
    }

    const m = date.getMonth(), y = date.getFullYear();
    const filename = `escala-vpn-${MONTHS[m].toLowerCase()}-${y}`;

    if (format === 'jpeg') {
      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      return;
    }

    const { jsPDF } = await import('jspdf');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${filename}.pdf`);
  }, [date]);

  return { containerRef, exportAs };
}
