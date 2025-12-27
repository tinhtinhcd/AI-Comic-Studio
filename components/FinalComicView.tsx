import React from 'react';
import { ComicProject } from '../types';
import { Download, Play, Volume2 } from 'lucide-react';

interface FinalComicViewProps {
  project: ComicProject;
}

const FinalComicView: React.FC<FinalComicViewProps> = ({ project }) => {
  if (project.panels.length === 0) return null;

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
                <div key={panel.id} className="bg-white p-2 shadow-sm rounded-sm">
                    <div className="border-2 border-black bg-zinc-100 aspect-[4/3] overflow-hidden relative group">
                         {panel.videoUrl ? (
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
                             <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-mono uppercase">
                                 Pending Art...
                             </div>
                         )}
                         
                         {/* Audio overlay icon if audio exists but video doesn't (or separate control) */}
                         {panel.audioUrl && !panel.videoUrl && (
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    new Audio(panel.audioUrl).play();
                                }}
                                className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
                             >
                                 <Volume2 className="w-4 h-4" />
                             </button>
                         )}
                    </div>
                    {panel.dialogue && (
                         <div className="mt-2 text-center">
                             <span className="font-comic font-bold text-sm text-black uppercase">{panel.dialogue}</span>
                         </div>
                    )}
                    {panel.audioUrl && (
                        <audio src={panel.audioUrl} controls className="w-full h-6 mt-1 opacity-50 hover:opacity-100" />
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
