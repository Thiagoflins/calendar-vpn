'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView';
import { CalendarDayView } from '@/components/calendar/CalendarDayView';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { EventTypePickerDialog } from '@/components/calendar/EventTypePickerDialog';
import { EventFormDialog } from '@/components/calendar/EventFormDialog';
import { useEvents, useCreateEvent, useCreateManyEvents, useUpdateEvent, useRemoveEvent } from '@/hooks/useEvents';
import { CalendarEvent, EventType } from '@/types';

function fd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function CalendarioContent() {
  const router = useRouter();
  const params = useSearchParams();
  const view = (params.get('view') ?? 'mes') as 'mes' | 'semana' | 'dia';
  const dateParam = params.get('date');
  const date = dateParam ? new Date(dateParam + 'T12:00:00') : new Date(2026, 5, 15);
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

  const handleDelete = async (id: string) => {
    await removeEvent.mutateAsync(id);
    setDetailId(null);
    setShowForm(false);
  };

  const setTf = (tf: string) => {
    const p = new URLSearchParams(params.toString()); p.set('tf', tf); router.push(`/calendario?${p.toString()}`);
  };

  return (
    <AppShell onAddEvent={() => openAdd()}>
      <div style={{ padding: '12px 20px 24px' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[{ v: 'todos', l: 'Todos' }, { v: 'culto', l: '⛪ Cultos' }, { v: 'atividade', l: '📅 Atividades' }].map(f => (
            <button key={f.v} onClick={() => setTf(f.v)} style={{ padding: '5px 14px', borderRadius: 999, border: '1px solid', borderColor: typeFilter === f.v ? '#2E5AAC' : '#E5E7EB', background: typeFilter === f.v ? '#E6F1FB' : '#fff', color: typeFilter === f.v ? '#2E5AAC' : '#6B7280', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{f.l}</button>
          ))}
        </div>

        {view === 'mes' && <CalendarMonthView date={date} events={events} onDayClick={ds => openAdd(ds)} onEventClick={id => setDetailId(id)} />}
        {view === 'semana' && <CalendarWeekView date={date} events={events} onEventClick={id => setDetailId(id)} />}
        {view === 'dia' && <CalendarDayView date={date} events={dayEvents} onEventClick={id => setDetailId(id)} />}
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
