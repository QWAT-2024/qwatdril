import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from '../../firebase/firestore';
// Import the default CSS first
import 'react-big-calendar/lib/css/react-big-calendar.css';
// Import your custom CSS file (or use a style block as shown below)
import '../../styles/MyCalendar.css'; // Adjust the path as necessary

const localizer = momentLocalizer(moment);

interface MyEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  notes?: string;
}

const MyCalendar = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          start: data.start.toDate(),
          end: data.end.toDate(),
          notes: data.notes,
        };
      });
      setEvents(eventsList);
    };
    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setEventTitle('');
    setEventNotes('');
    setSelectedEvent({ id: '', start, end, title: '' });
    setModalOpen(true);
  };

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventNotes(event.notes || '');
    setModalOpen(true);
  };

  const saveEvent = async () => {
    if (selectedEvent && eventTitle) { // Ensure title is not empty
      const eventToSave = {
        title: eventTitle,
        notes: eventNotes,
        start: selectedEvent.start,
        end: selectedEvent.end,
      };

      if (selectedEvent.id) {
        const eventRef = doc(db, 'events', selectedEvent.id);
        await updateDoc(eventRef, eventToSave);
        setEvents(events.map((e) => (e.id === selectedEvent.id ? { ...e, ...eventToSave } : e)));
      } else {
        const docRef = await addDoc(collection(db, 'events'), eventToSave);
        setEvents([...events, { ...eventToSave, id: docRef.id }]);
      }
      setModalOpen(false);
    }
  };

  const deleteEvent = async () => {
    if (selectedEvent) {
      const eventRef = doc(db, 'events', selectedEvent.id);
      await deleteDoc(eventRef);
      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      setModalOpen(false);
    }
  };

  return (
    <div className="calendar-container bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-200 dark:border-dark-700 rounded-xl p-6 text-gray-800 dark:text-white">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-blue-500/30 rounded-xl max-w-lg w-full text-gray-800 dark:text-white">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedEvent?.id ? 'Edit Event' : 'Add New Event'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">Notes</label>
                <textarea
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="p-6 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-800 dark:text-white">
                Cancel
              </button>
              {selectedEvent?.id ? (
                <button onClick={deleteEvent} className="px-4 py-2 bg-blue-600 dark:bg-blue-800 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors duration-200 text-white">
                  Delete
                </button>
              ) : null}
              <button onClick={saveEvent} className="px-4 py-2 bg-blue-500 dark:bg-blue-600 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
