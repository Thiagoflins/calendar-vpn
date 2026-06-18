'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView';
import { CalendarDayView } from '@/components/calendar/CalendarDayView';
import { CalendarExportView } from '@/components/calendar/CalendarExportView';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { EventTypePickerDialog } from '@/components/calendar/EventTypePickerDialog';
import { EventFormDialog } from '@/components/calendar/EventFormDialog';
import { useEvents, useCreateEvent, useCreateManyEvents, useUpdateEvent, useRemoveEvent } from '@/hooks/useEvents';
import { useExportCalendar } from '@/hooks/useExportCalendar';
import { CalendarEvent, EventType } from '@/types';

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function CalendarioContent() {
  const router = useRouter();
  const params = useSearchParams();
  const view = (params.get('view') ?? 'mes') as 'mes' | 'semana' | 'dia';
  const dateParam = params.get('date');
  const date = dateParam ? new Date(dateParam + 'T12:00:00') : new Date();
  const typeFilter = params.get('tf') ?? 'todos';

  const { data: allEvents = [] } = useEvents();
  const createEvent = useCreateEvent();
  const createMany = useCreateManyEvents();
  const updateEvent = useUpdateEvent();
  const removeEvent = useRemoveEvent();

  const [detailId, setDetailId] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<EventType>('culto');
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { containerRef, exportAs } = useExportCalendar(date);

  const handleExport = async (format: 'jpeg' | 'pdf') => {
    setShowShareMenu(false);
    setExporting(true);
    await new Promise(r => setTimeout(r, 120));
    await exportAs(format);
    setExporting(false);
  };

  const events = allEvents.filter(e => typeFilter === 'todos' || e.type === typeFilter);
  const dayEvents = events.filter(e => e.data === fd(date));

  const detailEvent = detailId ? allEvents.find(e => e.id === detailId) ?? null : null;

  const openAdd = (ds = '') => {
    setDefaultDate(ds);
    setEditEvent(null);
    setShowTypePicker(true);
  };

  const pickType = (t: EventType) => {
    setFormType(t);
    setShowTypePicker(false);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const ev = allEvents.find(e => e.id === id);
    if (!ev) return;
    setEditEvent(ev);
    setFormType(ev.type);
    setDetailId(null);
    setShowForm(true);
  };

  const handleSave = async (data: Omit<CalendarEvent, 'id'>, repetirQtd: number) => {
    if (editEvent) {
      await updateEvent.mutateAsync({ id: editEvent.id, patch: data });
    } else if (data.repetir && data.repetir !== 'nenhuma') {
      const step = data.repetir === 'semanal' ? 7 : data.repetir === 'quinzenal' ? 14 : 30;
      const [yr, mo, dy] = data.data.split('-').map(Number);
      let base = new Date(yr, mo - 1, dy);
      const evs = Array.from({ length: repetirQtd }, (_, i) => {
        const ds = fd(base);
        base.setDate(base.getDate() + step);
        return { ...data, data: ds };
      });
      await createMany.mutateAsync(evs);
    } else {
      await createEvent.mutateAsync(data);
    }
    setShowForm(false);
    setEditEvent(null);
  };

  const handleSaveCustom = async (events: Omit<CalendarEvent, 'id'>[]) => {
    await createMany.mutateAsync(events);
    setShowForm(false);
    setEditEvent(null);
  };

  const handleDelete = async (id: string) => {
    await removeEvent.mutateAsync(id);
    setDetailId(null);
    setShowForm(false);
  };

  const setTf = (tf: string) => {
    const p = new URLSearchParams(params.toString()); p.set('tf', tf); router.push(`/calendario?${p.toString()}`);
  };

  return (
    <AppShell onAddEvent={() => openAdd()} hideRightSidebar>
      <div style={{ padding: '12px 20px 24px' }}>
        {/* Filter + Export */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
          {[{ v: 'todos', l: 'Todos' }, { v: 'culto', l: 'Cultos' }, { v: 'atividade', l: 'Atividades' }].map(f => (
            <button key={f.v} onClick={() => setTf(f.v)} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid', borderColor: typeFilter === f.v ? '#2E5AAC' : '#E5E7EB', background: typeFilter === f.v ? '#E6F1FB' : '#fff', color: typeFilter === f.v ? '#2E5AAC' : '#6B7280', cursor: 'pointer', fontSize: 13, fontWeight: typeFilter === f.v ? 500 : 400 }}>{f.l}</button>
          ))}
          <div style={{ flex: 1 }} />
          {view === 'mes' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowShareMenu(v => !v)}
                disabled={exporting}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: exporting ? 'wait' : 'pointer', fontSize: 13, fontWeight: 400, transition: 'all 0.12s' }}
              >
                {exporting ? (
                  <><span style={{ fontSize: 14 }}>⏳</span> Gerando...</>
                ) : (
                  <><span style={{ fontSize: 14 }}>↑</span> Compartilhar</>
                )}
              </button>

              {showShareMenu && !exporting && (
                <>
                  {/* Backdrop */}
                  <div onClick={() => setShowShareMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                  {/* Menu */}
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', zIndex: 100, minWidth: 180, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 500, color: '#9AA3B5', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid #F3F4F6' }}>
                      Exportar escala mensal
                    </div>
                    <button
                      onClick={() => handleExport('jpeg')}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F7F9FC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: 18 }}>🖼️</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>Imagem JPEG</div>
                        <div style={{ fontSize: 11, color: '#9AA3B5' }}>Ideal para WhatsApp</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left', transition: 'background 0.1s', borderTop: '1px solid #F3F4F6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F7F9FC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: 18 }}>📄</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>Documento PDF</div>
                        <div style={{ fontSize: 11, color: '#9AA3B5' }}>Para imprimir ou arquivar</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {view === 'mes' && <CalendarMonthView date={date} events={events} onDayClick={ds => openAdd(ds)} onEventClick={id => setDetailId(id)} />}
        {view === 'semana' && <CalendarWeekView date={date} events={events} onEventClick={id => setDetailId(id)} />}
        {view === 'dia' && <CalendarDayView date={date} events={dayEvents} onEventClick={id => setDetailId(id)} />}
      </div>

      {/* Export canvas (oculto) */}
      <div ref={containerRef} style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1, pointerEvents: 'none' }}>
        <CalendarExportView date={date} events={events} />
      </div>

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailId(null)}
          onEdit={() => openEdit(detailEvent.id)}
          onDelete={() => handleDelete(detailEvent.id)}
        />
      )}
      {showTypePicker && (
        <EventTypePickerDialog onClose={() => setShowTypePicker(false)} onPick={pickType} />
      )}
      {showForm && (
        <EventFormDialog
          eventType={formType}
          editEvent={editEvent}
          defaultDate={defaultDate}
          onClose={() => { setShowForm(false); setEditEvent(null); }}
          onSave={handleSave}
          onSaveCustom={handleSaveCustom}
          onDelete={handleDelete}
        />
      )}
    </AppShell>
  );
}

export default function CalendarioPage() {
  return (
    <Suspense>
      <CalendarioContent />
    </Suspense>
  );
}
