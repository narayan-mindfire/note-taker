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
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setDbError(null);
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, images')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST205') {
        setDbError("The 'notes' table doesn't exist in your database yet, or the schema cache needs reloading.");
      } else {
        setDbError(error.message);
      }
    } else if (data) {
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

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Database Error</h2>
          <p className="text-gray-600 mb-6">{dbError}</p>
          <div className="text-left bg-gray-50 p-4 rounded-lg text-sm text-gray-700 font-mono mb-6">
            <p className="mb-2 font-bold">How to fix this:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open your Supabase Dashboard</li>
              <li>Go to the <strong>SQL Editor</strong></li>
              <li>Run the migration script from <code>supabase/migrations/00000000000000_init_notes.sql</code></li>
              <li>If you already ran it, run this command to refresh the cache:<br/><code className="bg-gray-200 px-1 py-0.5 rounded mt-1 block">NOTIFY pgrst, 'reload schema';</code></li>
            </ol>
          </div>
          <button 
            onClick={fetchNotes}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
