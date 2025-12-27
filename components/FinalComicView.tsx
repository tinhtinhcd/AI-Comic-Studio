import React from 'react';
import { ComicProject } from '../types';
import { Download, Play, Volume2, Book, MessageSquare, Loader2 } from 'lucide-react';

interface FinalComicViewProps {
  project: ComicProject;
}

const FinalComicView: React.FC<FinalComicViewProps> = ({ project }) => {
  if (project.panels.length === 0) return null;

  const playAudio = (url: string) => {
      new Audio(url).play();
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 lg:w-96 bg-zinc-950 border-l border-zinc-800 shadow-2xl overflow-hidden flex flex-col z-20">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
            <h3 className="font-bold text-zinc-100">Live Preview</h3>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5">
            {/* Cover Page */}
            <div className="bg-zinc-900 p-2 shadow-lg mb-8 relative group cursor-default">
                <div className="aspect-[3/4] bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                    {project.coverImage ? (
                        <img src={project.coverImage} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-zinc-700 font-bold uppercase tracking-widest text-xs">
                            Cover Pending
                        </div>
                    )}
                    
                    {/* Title Overlay on Cover */}
                    <div className="absolute top-8 left-4 right-4 text-center">
                        <h1 className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-wider font-serif">
                            {project.title || "UNTITLED"}
                        </h1>
                        <p className="mt-2 text-sm text-white/80">{project.language} Edition</p>
                    </div>
                </div>
            </div>

            <div className="text-center pb-4 border-b border-white/10 mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Begin Story</p>
            </div>

            {project.panels.map((panel, idx) => (
                <div key={panel.id} className="bg-white p-2 shadow-sm rounded-sm mb-6">
                    <div className="border-2 border-black bg-zinc-100 aspect-[4/3] overflow-hidden relative group">
                         
                         {/* Narrator Caption Box */}
                         {panel.caption && (
                             <div className="absolute top-0 left-0 right-0 p-2 z-10 pointer-events-none">
                                <div className="bg-yellow-200 border-2 border-black p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] inline-block max-w-[90%]">
                                    <p className="text-[10px] font-bold text-black uppercase leading-tight font-sans tracking-wide">
                                        {panel.caption}
                                    </p>
                                </div>
                             </div>
                         )}

                         {/* Visual Content */}
                         {panel.isGenerating ? (
                             <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-200 text-zinc-500 gap-2">
                                 <Loader2 className="w-6 h-6 animate-spin text-indigo-500"/>
                                 <span className="text-xs font-mono uppercase">AI Artist Working...</span>
                             </div>
                         ) : panel.videoUrl ? (
                             <video 
                                src={panel.videoUrl} 
                                className="w-full h-full object-cover" 
                                controls 
                                playsInline 
                                loop
                                muted
                             />
                         ) : panel.imageUrl ? (
                             <img src={panel.imageUrl} className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2 p-4 text-center">
                                 <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-400 flex items-center justify-center">?</div>
                                 <span className="text-xs font-mono uppercase">Pending Art<br/>(Run Step 3)</span>
                             </div>
                         )}
                         
                    </div>
                    
                    {/* Dialogue Box */}
                    {panel.dialogue && (
                         <div className="mt-2 text-center px-4 relative">
                             <div className="bg-white border-2 border-black rounded-[20px] p-3 shadow-sm inline-block relative bubble-tail">
                                <span className="font-comic font-bold text-sm text-black uppercase leading-tight block">
                                    {panel.dialogue}
                                </span>
                             </div>
                         </div>
                    )}

                    {/* Audio Controls */}
                    {(panel.audioUrl || panel.captionAudioUrl) && (
                        <div className="mt-3 flex gap-2 justify-center border-t border-zinc-100 pt-2">
                            {panel.captionAudioUrl && (
                                <button 
                                    onClick={() => playAudio(panel.captionAudioUrl!)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 uppercase"
                                >
                                    <Book className="w-3 h-3" /> Narrator
                                </button>
                            )}
                            {panel.audioUrl && (
                                <button 
                                    onClick={() => playAudio(panel.audioUrl!)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 uppercase"
                                >
                                    <MessageSquare className="w-3 h-3" /> Dialogue
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
            
            <div className="text-center py-8 text-zinc-500 text-xs">
                - END -
            </div>
        </div>
    </div>
  );
};

export default FinalComicView;