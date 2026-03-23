import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Printer, ChevronUp, ChevronDown, Folder, Music, BatteryFull, Image as ImageIcon, FileText, Cpu, X } from 'lucide-react';

interface PrintCard {
  id: string;
  text: string;
  time: string;
  fileName: string;
  fileSize: number;
  metadata: {
    title: string;
    format: string;
    class: string;
  };
  downloadUrl: string;
  downloadName: string;
  isTyping: boolean;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

const TypewriterText = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <>{displayed}</>;
};

const PrintCardView = ({ card, onRemove, finishTyping, containerRef, globalShatter }: any) => {
  const [isShattering, setIsShattering] = useState(false);

  useEffect(() => {
    if (globalShatter && !isShattering) {
      setIsShattering(true);
    }
  }, [globalShatter, isShattering]);

  const handleDelete = () => {
    setIsShattering(true);
    setTimeout(() => {
      onRemove(card.id);
    }, 1000);
  };

  const CardContent = () => (
    <div className="w-full h-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center text-xs text-black font-black tracking-widest mb-3 uppercase">
        <span>MESSAGE</span>
        <div className="flex items-center gap-3">
          <span>{card.time}</span>
          {!isShattering && (
            <button onClick={handleDelete} className="hover:text-red-500 transition-colors cursor-pointer z-10" title="Delete">
              <X size={16} strokeWidth={4} />
            </button>
          )}
        </div>
      </div>

      {/* Dashed line */}
      <div className="w-full border-t-4 border-dashed border-black mb-4"></div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col mb-6">
        <div className="text-black text-2xl font-black leading-snug whitespace-pre-wrap tracking-wide">
          {card.isTyping && !isShattering ? <TypewriterText text={card.text} onComplete={() => finishTyping(card.id)} /> : card.text}
          {card.isTyping && !isShattering && <span className="animate-pulse ml-1">|</span>}
        </div>

        {!card.isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 text-xs font-medium flex flex-col gap-1 mt-4">
            <div className="truncate">Title: {card.metadata.title}</div>
            <div className="truncate">Format: {card.metadata.format}</div>
            <div className="truncate">Class: {card.metadata.class}</div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-black font-black tracking-widest mb-5">
        <span>by TenzinDann</span>
        <span>ID: #{card.id}</span>
      </div>

      {!card.isTyping && (
        <div className="flex justify-center">
          <a
            href={card.downloadUrl}
            download={card.downloadName}
            className="bg-[#FF90E8] hover:bg-[#FF70E0] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 text-black px-6 py-2 rounded-full text-sm font-black tracking-widest transition-all uppercase"
          >
            DOWNLOAD
          </a>
        </div>
      )}
    </div>
  );

  const shards = [
    { clip: 'polygon(0% 0%, 35% 0%, 40% 35%, 0% 40%)', x: -80, y: 120, r: -15 },
    { clip: 'polygon(35% 0%, 70% 0%, 60% 45%, 40% 35%)', x: 0, y: 160, r: 5 },
    { clip: 'polygon(70% 0%, 100% 0%, 100% 50%, 60% 45%)', x: 80, y: 140, r: 20 },
    { clip: 'polygon(0% 40%, 40% 35%, 30% 100%, 0% 100%)', x: -100, y: 240, r: -25 },
    { clip: 'polygon(40% 35%, 60% 45%, 75% 100%, 30% 100%)', x: 20, y: 280, r: -5 },
    { clip: 'polygon(60% 45%, 100% 50%, 100% 100%, 75% 100%)', x: 100, y: 260, r: 15 },
  ];

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      initial={{ y: 0, opacity: 0, scale: 0.8, rotate: 0 }}
      animate={{ y: card.offsetY, x: card.offsetX, opacity: 1, scale: 1, rotate: card.rotation }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="absolute z-0 w-80"
      style={{ top: '50%', left: '50%', marginLeft: '-10rem', marginTop: '-10rem' }}
    >
      {!isShattering ? (
        <CardContent />
      ) : (
        <div className="relative w-full h-full">
          {shards.map((shard, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
              animate={{ x: shard.x, y: shard.y, rotate: shard.r, opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.8, 
                y: { ease: "easeIn" },
                x: { ease: "easeOut" },
                opacity: { ease: "easeIn" }
              }}
              className={i === 0 ? "relative w-full" : "absolute inset-0"}
              style={{ clipPath: shard.clip }}
            >
              <CardContent />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [inputFormat, setInputFormat] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [availableOutputs, setAvailableOutputs] = useState<string[]>(['---']);
  const [appMode, setAppMode] = useState('SYS-READY');
  const [ModeIcon, setModeIcon] = useState<React.ElementType>(() => Cpu);
  const [isConverting, setIsConverting] = useState(false);
  const [cards, setCards] = useState<PrintCard[]>([]);
  const [deletePrompt, setDeletePrompt] = useState(false);
  const [globalShatter, setGlobalShatter] = useState(false);
  const [displayOutput, setDisplayOutput] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const formatMap: Record<string, string[]> = {
    // Audio
    'mp3': ['WAV', 'FLAC', 'OGG', 'AAC'],
    'wav': ['MP3', 'FLAC', 'OGG', 'AAC'],
    'flac': ['MP3', 'WAV', 'OGG', 'AAC'],
    'ogg': ['MP3', 'WAV', 'FLAC', 'AAC'],
    'aac': ['MP3', 'WAV', 'FLAC', 'OGG'],
    'm4a': ['MP3', 'WAV', 'FLAC', 'OGG'],
    // Image
    'png': ['JPG', 'WEBP', 'PDF', 'GIF'],
    'jpg': ['PNG', 'WEBP', 'PDF', 'GIF'],
    'jpeg': ['PNG', 'WEBP', 'PDF', 'GIF'],
    'webp': ['PNG', 'JPG', 'PDF', 'GIF'],
    'gif': ['PNG', 'JPG', 'WEBP', 'MP4'],
    // Data/Doc
    'txt': ['MD', 'JSON', 'CSV', 'PDF'],
    'csv': ['JSON', 'TXT', 'HTML', 'PDF'],
    'json': ['CSV', 'TXT', 'YAML', 'PDF'],
    'md': ['TXT', 'HTML', 'PDF'],
    'pdf': ['TXT', 'PNG', 'JPG'],
    'docx': ['PDF', 'TXT', 'MD'],
  };

  const getModeInfo = (ext: string) => {
    const audioExts = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'];
    const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
    const docExts = ['txt', 'csv', 'json', 'md', 'pdf', 'docx'];

    if (audioExts.includes(ext)) return { name: 'MUSIC-MODE', icon: Music };
    if (imageExts.includes(ext)) return { name: 'IMAGE-MODE', icon: ImageIcon };
    if (docExts.includes(ext)) return { name: 'DATA-MODE', icon: FileText };
    return { name: 'UNKNOWN-MODE', icon: Cpu };
  };

  useEffect(() => {
    if (isConverting) {
      const interval = setInterval(() => {
        setDisplayOutput(Math.random().toString(36).substring(2, 6).toUpperCase());
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayOutput(outputFormat);
    }
  }, [isConverting, outputFormat]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const ext = selected.name.split('.').pop()?.toLowerCase() || '';
      const inFmt = ext.toUpperCase().slice(0, 4);
      setInputFormat(inFmt || 'FILE');

      const modeInfo = getModeInfo(ext);
      setAppMode(modeInfo.name);
      setModeIcon(() => modeInfo.icon);

      const outputs = formatMap[ext] || ['BIN', 'HEX', 'B64'];
      setAvailableOutputs(outputs);
      setOutputFormat(outputs[0]);
      setDeletePrompt(false);
    }
  };

  const handleUp = () => {
    const idx = availableOutputs.indexOf(outputFormat);
    const nextIdx = (idx - 1 + availableOutputs.length) % availableOutputs.length;
    setOutputFormat(availableOutputs[nextIdx]);
  };

  const handleDown = () => {
    const idx = availableOutputs.indexOf(outputFormat);
    const nextIdx = (idx + 1) % availableOutputs.length;
    setOutputFormat(availableOutputs[nextIdx]);
  };

  const handleConvert = () => {
    if (!file) return;
    setIsConverting(true);
    setDeletePrompt(false);

    setTimeout(() => {
      setIsConverting(false);

      const now = new Date();
      const newCard: PrintCard = {
        id: Math.random().toString(10).substring(2, 6),
        text: `SUCCESS!\n${inputFormat} ➔ ${outputFormat}`,
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        fileName: file.name,
        fileSize: file.size,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          format: outputFormat.toUpperCase(),
          class: appMode.replace('-MODE', '')
        },
        downloadUrl: URL.createObjectURL(new Blob([`Dummy converted content for ${file.name} to ${outputFormat}`], { type: 'text/plain' })),
        downloadName: `${file.name.split('.')[0]}.${outputFormat.toLowerCase()}`,
        isTyping: true,
        offsetX: Math.floor(Math.random() * 80) - 40,
        offsetY: -240 + Math.floor(Math.random() * 80) - 40,
        rotation: 0
      };

      setCards(prev => [...prev, newCard]);
    }, 2500);
  };

  const confirmPurge = () => {
    setGlobalShatter(true);
    setTimeout(() => {
      setCards([]);
      setFile(null);
      setInputFormat('');
      setOutputFormat('');
      setAvailableOutputs(['---']);
      setAppMode('SYS-READY');
      setModeIcon(() => Cpu);
      setDeletePrompt(false);
      setGlobalShatter(false);
    }, 1000);
  };

  const cancelPurge = () => {
    setDeletePrompt(false);
  };

  const handleTrashClick = () => {
    setDeletePrompt(true);
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const finishTyping = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, isTyping: false } : c));
  };

  return (
    <div className="relative min-h-screen bg-[#FFF3B0] overflow-hidden flex items-center justify-center font-sans" ref={containerRef}>
      {/* Grid background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='4' height='4' fill='%23E5D9A8'/%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px'
        }}
      ></div>

      {/* Paper Cards */}
      <AnimatePresence>
        {cards.map((card) => (
          <PrintCardView
            key={card.id}
            card={card}
            onRemove={removeCard}
            finishTyping={finishTyping}
            containerRef={containerRef}
            globalShatter={globalShatter}
          />
        ))}
      </AnimatePresence>

      {/* Hardware Device */}
      <div className="relative z-10 w-full max-w-xl bg-[#4DEEEA] rounded-[40px] p-6 md:p-8 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Top Black Slot */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-black rounded-t-2xl border-b-8 border-black z-20"></div>

        {/* Bottom Tag */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white border-4 border-black text-black font-black tracking-widest text-sm px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20">
          FORMAT-TRANSFORMER
        </div>

        {/* Top Status Bar */}
        <div className="flex justify-between items-start mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
            <div className="flex flex-col">
              <span className="text-black font-black text-sm tracking-wider">FORMAT-TRANSFORMER</span>
              <span className="text-black font-bold text-xs tracking-widest opacity-80">by TenzinDann</span>
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className="bg-white rounded-2xl p-6 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] mb-8 border-4 border-black relative overflow-hidden">
          
          {/* Screen Header */}
          <div className="flex justify-between items-center mb-6 text-black font-bold text-sm z-20 relative">
            <div className="flex items-center gap-2">
              <ModeIcon size={16} strokeWidth={3} />
              <span>{appMode}</span>
            </div>
            <div className="flex items-center gap-2">
              <BatteryFull size={20} className="text-black" />
            </div>
          </div>

          {/* Main Screen Content */}
          <div className="font-cartoon text-black font-black flex items-center text-3xl relative z-20 tracking-widest h-16">
            <span className="mr-4">{'>'}</span>
            
            {deletePrompt ? (
              <div className="text-red-500 flex items-center w-full justify-between">
                <span className="animate-pulse">CONFIRM PURGE?</span>
                <div className="flex flex-col gap-1 text-xs font-bold">
                  <button onClick={confirmPurge} className="hover:bg-red-500 hover:text-white px-3 py-0.5 rounded border border-red-500 leading-none transition-colors">YES</button>
                  <button onClick={cancelPurge} className="hover:bg-red-500 hover:text-white px-3 py-0.5 rounded border border-red-500 leading-none transition-colors">NO</button>
                </div>
              </div>
            ) : !file ? (
              <label className="cursor-pointer hover:opacity-70 transition-opacity flex items-center">
                <span>INSERT_FILE</span>
                <span className="animate-pulse ml-2">_</span>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex items-center w-full justify-between">
                <div className="truncate max-w-[150px]">{inputFormat || 'FILE'}</div>
                
                <div className={isConverting ? 'animate-spin mx-4' : 'animate-pulse mx-4'}>
                  {isConverting ? '*' : '=>'}
                </div>
                
                <div className="flex items-center gap-4">
                  <span>{displayOutput || '---'}</span>
                  <div className="flex flex-col gap-1">
                    <button onClick={handleUp} disabled={isConverting} className="hover:bg-gray-200 rounded p-1 disabled:opacity-50 border-2 border-transparent hover:border-black"><ChevronUp size={16} strokeWidth={3} /></button>
                    <button onClick={handleDown} disabled={isConverting} className="hover:bg-gray-200 rounded p-1 disabled:opacity-50 border-2 border-transparent hover:border-black"><ChevronDown size={16} strokeWidth={3} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between px-2">
          {/* Left Circular Buttons */}
          <div className="flex gap-4">
            <label className="w-16 h-16 rounded-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-pointer active:translate-y-1 active:translate-x-1 active:shadow-none transition-all text-black hover:bg-gray-100">
              <Upload size={24} strokeWidth={3} />
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
            <button 
              onClick={handleTrashClick}
              className={`w-16 h-16 rounded-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-pointer active:translate-y-1 active:translate-x-1 active:shadow-none transition-all text-black hover:bg-gray-100 ${deletePrompt ? 'bg-red-100 border-red-500 text-red-500 animate-pulse' : ''}`}
            >
              <Trash2 size={24} strokeWidth={3} />
            </button>
          </div>

          {/* Center Grill */}
          <div className="flex flex-col gap-2">
            <div className="w-16 h-2 bg-black rounded-full"></div>
            <div className="w-16 h-2 bg-black rounded-full"></div>
            <div className="w-16 h-2 bg-black rounded-full"></div>
          </div>

          {/* Right Print Button */}
          <button
            onClick={handleConvert}
            disabled={!file || isConverting}
            className="bg-[#FFD700] hover:bg-[#FFC800] disabled:bg-[#FFE866] disabled:opacity-80 text-black px-8 py-5 rounded-2xl font-black text-xl tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1.5 active:translate-x-1.5 active:shadow-none disabled:active:translate-y-0 disabled:active:translate-x-0 disabled:active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-3"
          >
            PRINT <Printer size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
