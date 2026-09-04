import React, { useState } from 'react';
import { Search, Plus, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Note {
  id: string;
  title: string;
}

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
}

export default function Sidebar({ notes, activeNoteId, onSelectNote, onNewNote }: SidebarProps) {
  const [search, setSearch] = useState('');
  const { signOut } = useAuth();

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-white font-bold text-lg mb-4">Note Taker</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 text-white rounded py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
          My Notes
        </div>
        <div className="space-y-1">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded text-sm text-left transition-colors ${
                activeNoteId === note.id ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{note.title || 'Untitled Note'}</span>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-gray-500">No notes found</div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
