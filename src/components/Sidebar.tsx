import { useState } from 'react';
import { Search, Plus, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';

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
    <div className="w-72 bg-white flex flex-col h-screen border-r border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-gray-900 font-bold text-xl mb-5 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          Note Taker
        </h1>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="p-4 flex-shrink-0">
        <Button onClick={onNewNote} className="w-full shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Note
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pt-0">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
          My Notes
        </div>
        <div className="space-y-1">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 ${
                activeNoteId === note.id 
                  ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${activeNoteId === note.id ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="truncate">{note.title || 'Untitled Note'}</span>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="px-2 py-8 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No notes found</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
