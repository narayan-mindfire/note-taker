import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NoteEditor from '../components/NoteEditor';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeNoteId, setActiveNoteId] = useState<string | null>('1');
  
  // Dummy data for initial UI setup - will be replaced with Supabase calls
  const [notes, setNotes] = useState([
    { id: '1', title: 'Getting Started with Supabase' },
    { id: '2', title: 'React Canvas Ideas' }
  ]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleNewNote = () => {
    const newNote = {
      id: crypto.randomUUID(),
      title: 'New Note'
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        notes={notes} 
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onNewNote={handleNewNote}
      />
      {activeNote ? (
        <NoteEditor 
          key={activeNote.id}
          noteId={activeNote.id}
          initialTitle={activeNote.title}
          initialContent=""
          initialImages={[]}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a note or create a new one
        </div>
      )}
    </div>
  );
}
