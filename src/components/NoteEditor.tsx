import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

interface NoteImage {
  id: string;
  url: string;
  x: number;
  y: number;
}

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  initialImages: NoteImage[];
  onUpdate: (updates: any) => void;
}

export default function NoteEditor({ noteId, initialTitle, initialContent, initialImages, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<NoteImage[]>(initialImages);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce for title and content
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (title !== initialTitle || content !== initialContent) {
        onUpdate({ title, content });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content]);

  // Sync images when they change
  useEffect(() => {
    // Only update if images actually changed length or positions (simplified check)
    onUpdate({ images });
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file); // Temporary!
      
      const newImage: NoteImage = {
        id: crypto.randomUUID(),
        url,
        x: 50,
        y: 50
      };
      
      setImages([...images, newImage]);
    }
  };

  const handleDragEnd = (id: string, info: any) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, x: img.x + info.offset.x, y: img.y + info.offset.y } : img
    ));
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 relative overflow-hidden">
      <div className="p-8 pb-4 flex items-center justify-between z-10">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 w-full"
        />
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ImageIcon className="w-4 h-4" /> Add Image
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 relative" ref={containerRef}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note here..."
          className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-lg text-gray-700 resize-none z-0"
        />

        {images.map((img) => (
          <motion.div
            key={img.id}
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragEnd={(_, info) => handleDragEnd(img.id, info)}
            initial={{ x: img.x, y: img.y }}
            className="absolute z-20 cursor-move rounded-lg shadow-xl overflow-hidden bg-white border border-gray-200 p-1"
            style={{ width: '200px' }}
          >
            <img src={img.url} alt="Note attachment" className="w-full h-auto rounded pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
