
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
    <div className="fixed right-0 top-0 bottom-0 w-80 lg:w-96 bg-white border-l border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col z-20">
        <style>{`
          @keyframes kenburns {
            0% { transform: scale(1.0) translate(0, 0); }
            50% { transform: scale(1.15) translate(-1%, -1%); }
            100% { transform: scale(1.0) translate(0, 0); }
          }
          .animate-kenburns {
            animation: kenburns 15s ease-in-out infinite alternate;
          }
        `}</style>

        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                Live Preview
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">16:9 HD</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {/* Cover Page */}
            <div className="bg-white p-2 shadow-sm border border-slate-200 rounded-sm mb-8 relative group cursor-default">
                <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {project.coverImage ? (
                        <img src={project.coverImage} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-slate-400 font-bold uppercase tracking-widest text-xs flex flex-col items-center">
                            <span>Cover Pending</span>
                        </div>
                    )}
                    
                    <div className="absolute top-8 left-4 right-4 text-center">
                        <h1 className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-wider font-serif">
                            {project.title || "UNTITLED"}
                        </h1>
                        <p className="mt-2 text-sm text-white/80 font-medium">{project.language} Edition</p>
                    </div>
                </div>
            </div>

            <div className="text-center pb-4 border-b border-slate-200 mb-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 inline-block -mb-6 relative z-10">Story Content</p>
            </div>

            {project.panels.map((panel, idx) => (
                <div key={panel.id} className="bg-white p-2 shadow-sm border border-slate-200 rounded-sm mb-6">
                    <div className="border border-slate-900 bg-slate-100 aspect-[4/3] overflow-hidden relative group">
                         {/* Narrator */}
                         {panel.caption && (
                             <div className="absolute top-0 left-0 right-0 p-2 z-10 pointer-events-none">
                                <div className="bg-yellow-100 border-2 border-slate-900 p-2 shadow-[2px_2px_0px_rgba(15,23,42,1)] inline-block max-w-[90%]">
                                    <p className="text-[10px] font-bold text-slate-900 uppercase leading-tight font-sans tracking-wide">
                                        {panel.caption}
                                    </p>
                                </div>
                             </div>
                         )}

                         {/* Visual */}
                         {panel.isGenerating ? (
                             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2">
                                 <Loader2 className="w-6 h-6 animate-spin text-indigo-500"/>
                                 <span className="text-xs font-mono uppercase">Rendering...</span>
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
                             <img 
                                src={panel.imageUrl} 
                                className={`w-full h-full object-cover ${(!panel.shouldAnimate) ? 'animate-kenburns' : ''}`}
                             />
                         ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-4 text-center">
                                 <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center font-serif text-slate-400">?</div>
                                 <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Visuals</span>
                             </div>
                         )}
                    </div>
                    
                    {/* Dialogue */}
                    {panel.dialogue && (
                         <div className="mt-2 text-center px-4 relative">
                             <div className="bg-white border-2 border-slate-900 rounded-[20px] p-3 shadow-sm inline-block relative bubble-tail">
                                <span className="font-comic font-bold text-sm text-slate-900 uppercase leading-tight block">
                                    {panel.dialogue}
                                </span>
                             </div>
                         </div>
                    )}

                    {/* Audio Controls */}
                    {(panel.audioUrl || panel.captionAudioUrl) && (
                        <div className="mt-3 flex gap-2 justify-center border-t border-slate-100 pt-2">
                            {panel.captionAudioUrl && (
                                <button 
                                    onClick={() => playAudio(panel.captionAudioUrl!)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded hover:bg-amber-100 uppercase"
                                >
                                    <Book className="w-3 h-3" /> Narrator
                                </button>
                            )}
                            {panel.audioUrl && (
                                <button 
                                    onClick={() => playAudio(panel.audioUrl!)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 uppercase"
                                >
                                    <MessageSquare className="w-3 h-3" /> Dialogue
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
            
            <div className="text-center py-8 text-slate-300 text-xs font-serif italic">
                - END OF PREVIEW -
            </div>
        </div>
    </div>
  );
};

export default FinalComicView;
