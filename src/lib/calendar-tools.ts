import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import {
    getAccessTokenForCompany,
    checkAvailability,
    listEvents,
    createEvent,
    updateEvent,
} from '@/lib/google-calendar';

export const CALENDAR_TOOLS: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'check_calendar_availability',
            description: 'Consulta si hay disponibilidad en el calendario en una fecha y hora específica. Usa esto antes de crear un evento para verificar que el horario esté libre.',
            parameters: {
                type: 'object',
                properties: {
                    date: {
                        type: 'string',
                        description: 'Fecha en formato YYYY-MM-DD (ej: 2026-03-03)',
                    },
                    startTime: {
                        type: 'string',
                        description: 'Hora de inicio en formato HH:MM (24h, ej: 15:00). Si no se especifica, consulta todo el día.',
                    },
                    endTime: {
                        type: 'string',
                        description: 'Hora de fin en formato HH:MM (24h, ej: 16:00). Si no se especifica, se asume 1 hora después del inicio.',
                    },
                },
                required: ['date'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'list_calendar_events',
            description: 'Lista los eventos del calendario en una fecha específica. Útil para mostrar la agenda del día.',
            parameters: {
                type: 'object',
                properties: {
                    date: {
                        type: 'string',
                        description: 'Fecha en formato YYYY-MM-DD (ej: 2026-03-03)',
                    },
                },
                required: ['date'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_calendar_event',
            description: 'Crea un nuevo evento en el calendario. Siempre verifica disponibilidad antes de crear.',
            parameters: {
                type: 'object',
                properties: {
                    summary: {
                        type: 'string',
                        description: 'Título o nombre del evento (ej: "Reunión con cliente")',
                    },
                    date: {
                        type: 'string',
                        description: 'Fecha en formato YYYY-MM-DD',
                    },
                    startTime: {
                        type: 'string',
                        description: 'Hora de inicio en formato HH:MM (24h, ej: 15:00)',
                    },
                    endTime: {
                        type: 'string',
                        description: 'Hora de fin en formato HH:MM (24h). Si no se especifica, se asume 1 hora después del inicio.',
                    },
                    description: {
                        type: 'string',
                        description: 'Descripción opcional del evento',
                    },
                    attendeeEmail: {
                        type: 'string',
                        description: 'Email del asistente (opcional)',
                    },
                },
                required: ['summary', 'date', 'startTime'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_calendar_event',
            description: 'Actualiza un evento existente en el calendario.',
            parameters: {
                type: 'object',
                properties: {
                    eventId: {
                        type: 'string',
                        description: 'ID del evento a actualizar',
                    },
                    summary: {
                        type: 'string',
                        description: 'Nuevo título del evento',
                    },
                    date: {
                        type: 'string',
                        description: 'Nueva fecha en formato YYYY-MM-DD',
                    },
                    startTime: {
                        type: 'string',
                        description: 'Nueva hora de inicio en formato HH:MM (24h)',
                    },
                    endTime: {
                        type: 'string',
                        description: 'Nueva hora de fin en formato HH:MM (24h)',
                    },
                },
                required: ['eventId'],
            },
        },
    },
];

const TIMEZONE = 'America/Bogota';

function buildDateTime(date: string, time: string): string {
    return `${date}T${time}:00-05:00`; // Colombia UTC-5
}

function addOneHour(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const newH = (h + 1) % 24;
    return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function executeCalendarTool(
    toolName: string,
    args: Record<string, string>,
    companyId: string,
    calendarId: string,
): Promise<string> {
    try {
        const accessToken = await getAccessTokenForCompany(companyId);

        switch (toolName) {
            case 'check_calendar_availability': {
                const { date, startTime, endTime } = args;
                const start = startTime
                    ? buildDateTime(date, startTime)
                    : `${date}T00:00:00-05:00`;
                const end = endTime
                    ? buildDateTime(date, endTime)
                    : startTime
                        ? buildDateTime(date, addOneHour(startTime))
                        : `${date}T23:59:59-05:00`;

                const result = await checkAvailability(accessToken, calendarId, start, end);

                if (result.busy) {
                    const slots = result.busySlots.map(s => {
                        const from = new Date(s.start).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIMEZONE });
                        const to = new Date(s.end).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIMEZONE });
                        return `${from} - ${to}`;
                    });
                    return JSON.stringify({ available: false, message: `No disponible. Ocupado: ${slots.join(', ')}` });
                }
                return JSON.stringify({ available: true, message: 'Horario disponible' });
            }

            case 'list_calendar_events': {
                const { date } = args;
                const timeMin = `${date}T00:00:00-05:00`;
                const timeMax = `${date}T23:59:59-05:00`;

                const events = await listEvents(accessToken, calendarId, timeMin, timeMax);

                if (events.length === 0) {
                    return JSON.stringify({ events: [], message: 'No hay eventos para esta fecha' });
                }

                const formatted = events.map(e => ({
                    id: e.id,
                    title: e.summary,
                    start: new Date(e.start.dateTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIMEZONE }),
                    end: new Date(e.end.dateTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIMEZONE }),
                }));

                return JSON.stringify({ events: formatted, message: `${events.length} evento(s) encontrado(s)` });
            }

            case 'create_calendar_event': {
                const { summary, date, startTime, endTime, description, attendeeEmail } = args;
                const end = endTime || addOneHour(startTime);

                const event = await createEvent(accessToken, calendarId, {
                    summary,
                    description,
                    start: { dateTime: buildDateTime(date, startTime), timeZone: TIMEZONE },
                    end: { dateTime: buildDateTime(date, end), timeZone: TIMEZONE },
                    attendees: attendeeEmail ? [{ email: attendeeEmail }] : undefined,
                });

                const startFormatted = new Date(event.start.dateTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIMEZONE });
                const endFormatted = new Date(event.end.dateTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIMEZONE });

                return JSON.stringify({
                    success: true,
                    eventId: event.id,
                    message: `Evento "${summary}" creado para el ${date} de ${startFormatted} a ${endFormatted}`,
                });
            }

            case 'update_calendar_event': {
                const { eventId, summary, date, startTime, endTime } = args;
                const updates: Record<string, unknown> = {};

                if (summary) updates.summary = summary;
                if (date && startTime) {
                    const end = endTime || addOneHour(startTime);
                    updates.start = { dateTime: buildDateTime(date, startTime), timeZone: TIMEZONE };
                    updates.end = { dateTime: buildDateTime(date, end), timeZone: TIMEZONE };
                }

                const event = await updateEvent(accessToken, calendarId, eventId, updates);
                return JSON.stringify({ success: true, message: `Evento "${event.summary}" actualizado` });
            }

            default:
                return JSON.stringify({ error: `Tool "${toolName}" not found` });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`[CalendarTool] ${toolName} error:`, message);
        return JSON.stringify({ error: message });
    }
}
