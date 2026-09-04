import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Trash2, Menu } from 'lucide-react';
import { Button } from './ui/Button';

interface NoteImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width?: number;
}

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  initialImages: NoteImage[];
  onUpdate: (updates: any) => void;
  onMenuClick: () => void;
}

export default function NoteEditor({ noteId, initialTitle, initialContent, initialImages, onUpdate, onMenuClick }: NoteEditorProps) {
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
    onUpdate({ images });
  }, [images]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file); // Temporary object URL
      
      const newImage: NoteImage = {
        id: crypto.randomUUID(),
        url,
        x: Math.random() * 100 + 50,
        y: Math.random() * 100 + 50,
        width: 250
      };
      
      setImages([...images, newImage]);
    }
  };

  const handleDragEnd = (id: string, info: any) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, x: img.x + info.offset.x, y: img.y + info.offset.y } : img
    ));
  };

  const handleResize = (id: string, newWidth: number) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, width: newWidth } : img
    ));
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white relative overflow-hidden">
      <div className="px-6 md:px-12 pt-6 md:pt-12 pb-6 flex items-start justify-between z-10 sticky top-0 bg-gradient-to-b from-white via-white to-transparent gap-4">
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="text-3xl md:text-5xl font-black bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 w-full tracking-tight placeholder:text-gray-300"
          />
        </div>
        <div className="relative shrink-0 hidden md:block">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleImageUpload}
            title="Upload Image"
          />
          <Button variant="secondary" className="pointer-events-none relative z-0">
            <ImageIcon className="w-4 h-4 mr-2" /> Add Image
          </Button>
        </div>
        {/* Mobile image button */}
        <div className="relative shrink-0 md:hidden">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleImageUpload}
            title="Upload Image"
          />
          <button className="p-2 text-gray-500 bg-gray-100 rounded-lg">
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 md:px-12 relative" ref={containerRef}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your note here..."
          className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-lg md:text-xl text-gray-600 resize-none z-0 leading-relaxed font-serif pt-2 md:pt-4 placeholder:text-gray-300"
        />

        {images.map((img) => (
          <motion.div
            key={img.id}
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            onDragEnd={(_, info) => handleDragEnd(img.id, info)}
            initial={{ x: img.x, y: img.y }}
            className="absolute z-20 cursor-move group"
            style={{ width: img.width || 250 }}
          >
            <div className="relative rounded-xl shadow-xl border border-gray-200/50 bg-white p-1 md:p-1.5 hover:shadow-2xl transition-shadow flex flex-col">
              <button 
                onClick={() => removeImage(img.id)}
                className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 text-red-600 p-1 md:p-1.5 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <img src={img.url} alt="Note attachment" className="w-full h-auto rounded-lg pointer-events-none select-none" draggable={false} />
              
              {/* Resize Handle */}
              <div 
                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-1.5 z-10"
                onPointerDown={(e) => {
                  e.stopPropagation(); // Stop framer-motion drag
                  const startX = e.clientX;
                  const startWidth = img.width || 250;
                  
                  const onPointerMove = (moveEvent: PointerEvent) => {
                    // We directly mutate the DOM width for smooth 60fps resizing without React re-renders
                    const newWidth = Math.max(100, startWidth + (moveEvent.clientX - startX));
                    const parent = (e.target as HTMLElement).closest('.group') as HTMLElement;
                    if (parent) {
                      parent.style.width = `${newWidth}px`;
                    }
                  };
                  
                  const onPointerUp = (upEvent: PointerEvent) => {
                    window.removeEventListener('pointermove', onPointerMove);
                    window.removeEventListener('pointerup', onPointerUp);
                    const finalWidth = Math.max(100, startWidth + (upEvent.clientX - startX));
                    handleResize(img.id, finalWidth);
                  };
                  
                  window.addEventListener('pointermove', onPointerMove);
                  window.addEventListener('pointerup', onPointerUp);
                }}
              >
                <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15L15 21" />
                  <path d="M21 8L8 21" />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
