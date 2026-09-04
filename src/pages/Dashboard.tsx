import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NoteEditor from '../components/NoteEditor';
import { supabase } from '../lib/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
  images: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, images')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
      if (data.length > 0) setActiveNoteId(data[0].id);
    }
    setLoading(false);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleNewNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: 'New Note', content: '', images: [] })
      .select()
      .single();

    if (!error && data) {
      setNotes([data, ...notes]);
      setActiveNoteId(data.id);
      setIsSidebarOpen(false);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    
    await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        notes={notes} 
        activeNoteId={activeNoteId}
        onSelectNote={(id) => {
          setActiveNoteId(id);
          setIsSidebarOpen(false);
        }}
        onNewNote={handleNewNote}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {activeNote ? (
        <NoteEditor 
          key={activeNote.id}
          noteId={activeNote.id}
          initialTitle={activeNote.title}
          initialContent={activeNote.content || ''}
          initialImages={activeNote.images || []}
          onUpdate={(updates) => handleUpdateNote(activeNote.id, updates)}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mb-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg"
          >
            Open Notes List
          </button>
          Select a note or create a new one
        </div>
      )}
    </div>
  );
}
