
import React, { useState, useEffect, useRef } from 'react';
import { ComicProject, Chapter, Comment } from './types';
import * as StorageService from './services/storageService';
import * as AuthService from '../studio/services/authService';
import { UserProfile } from '../shared/types';
import {
    BookOpen, ChevronLeft, Heart, Share2, Search, X, Star, Layers,
    Home, Compass, Library, User, Bell, Settings, MessageCircle,
    MoreHorizontal, ArrowRight, PlayCircle, Clock, ThumbsUp
} from 'lucide-react';
import { Logo } from './components/Logo';

const LabNotice: React.FC = () => (
    <div className="fixed top-0 left-0 right-0 z-[60] text-center text-[10px] font-bold uppercase tracking-widest bg-amber-200 text-amber-900 py-1 pointer-events-none">
        Lab / Learning Project — Not a Product
    </div>
);

const LoginGate: React.FC<{ onLogin: (user: UserProfile) => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await AuthService.login(email, password);
            onLogin(user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-white flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-2">Reader Login</h2>
                <p className="text-xs text-gray-400 mb-6">Access requires a valid account. Test mode (VITE_USE_TEST_AUTH): user@test.com / 123456</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-sm"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-sm"
                        required
                    />
                    {error && <div className="text-xs text-red-400">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-sm disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MOCK DATA GENERATORS (To fill gaps in backend data) ---
const MOCK_COMMENTS: Comment[] = [
    { id: '1', user: 'Kai_R', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai', text: 'The art style in this panel is insane! 🤯', timestamp: Date.now() - 100000, likes: 24 },
    { id: '2', user: 'MangaLover99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manga', text: 'Finally a new update. Can\'t wait for the next arc.', timestamp: Date.now() - 500000, likes: 12 },
    { id: '3', user: 'EditorSan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Editor', text: 'Great pacing.', timestamp: Date.now() - 900000, likes: 5 },
];

const ENRICH_PROJECT = (p: any): ComicProject => ({
    ...p,
    author: { name: 'AI Studio', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${p.title}` },
    rating: (4 + Math.random()).toFixed(1),
    viewCount: Math.floor(Math.random() * 500) + 'K',
    subscriberCount: Math.floor(Math.random() * 20) + 'K',
    tags: ['Fantasy', 'Action', 'Sci-Fi'].sort(() => 0.5 - Math.random()).slice(0, 2),
    status: Math.random() > 0.5 ? 'ONGOING' : 'COMPLETED'
});

// --- SUB-COMPONENTS ---

const BottomNav: React.FC<{ active: string, onChange: (v: string) => void }> = ({ active, onChange }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
        <div className="flex justify-around items-center h-16">
            {['Home', 'Explore', 'Library', 'Profile'].map((item) => {
                const isActive = active === item;
                const Icon = item === 'Home' ? Home : item === 'Explore' ? Compass : item === 'Library' ? Library : User;
                return (
                    <button
                        key={item}
                        onClick={() => onChange(item)}
                        className={`flex flex-col items-center gap-1 w-full h-full justify-center ${isActive ? 'text-indigo-600 dark:text-white' : 'text-gray-400'}`}
                    >
                        <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                        <span className="text-[10px] font-bold">{item}</span>
                    </button>
                )
            })}
        </div>
    </div>
);

const CommentDrawer: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md h-[70vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 slide-in-from-bottom">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Comments (342)</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {MOCK_COMMENTS.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <img src={c.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500">{c.user}</span>
                                    <span className="text-[10px] text-gray-400">2h ago</span>
                                </div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{c.text}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-indigo-500"><ThumbsUp className="w-3 h-3" /> {c.likes}</button>
                                    <button className="text-[10px] text-gray-400 font-bold">Reply</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="relative">
                        <input placeholder="Add a comment..." className="w-full bg-white dark:bg-gray-800 rounded-full py-3 pl-4 pr-12 text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <button className="absolute right-2 top-2 p-1 bg-indigo-600 rounded-full text-white"><ArrowRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

const ReaderApp: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [view, setView] = useState<'HOME' | 'DETAILS' | 'READ'>('HOME');
    const [navTab, setNavTab] = useState('Home');
    const [library, setLibrary] = useState<ComicProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<ComicProject | null>(null);
    const [uiVisible, setUiVisible] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Load Data
    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) setCurrentUser(user);
    }, []);

    useEffect(() => {
        const loadContent = async () => {
            const projects = await StorageService.getActiveProjects();
            // Filter valid projects and enrich them with mock metadata for the demo
            const clean = projects
                .filter(p => p.panels?.length > 0 && p.panels.some(panel => panel.imageUrl))
                .map(ENRICH_PROJECT);
            setLibrary(clean);
        };
        loadContent();
    }, []);

    // Ensure user is always available - No auth gate
    const user = currentUser || (() => {
        const demoUser: UserProfile = {
            id: 'demo-user-id',
            username: 'Demo User',
            email: 'demo@ai-comic.studio',
            joinDate: Date.now(),
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=DemoUser'
        };

        if (!currentUser) {
            localStorage.setItem('acs_session_v1', JSON.stringify(demoUser));
            setCurrentUser(demoUser);
        }
        return demoUser;
    })();

    if (false) { // Keep LoginGate code but skip it
        return (
            <>
                <LabNotice />
                <LoginGate onLogin={setCurrentUser} />
            </>
        );
    }

    const handleOpenProject = (project: ComicProject) => {
        setSelectedProject(project);
        setView('DETAILS');
    };

    const handleReadChapter = () => {
        setView('READ');
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(progress);
    };

    const toggleUi = () => setUiVisible(!uiVisible);

    const handleBack = () => {
        if (view === 'READ') setView('DETAILS');
        else if (view === 'DETAILS') setView('HOME');
    };

    // --- VIEW: HOME ---
    if (view === 'HOME') {
        const featured = library[0]; // Simple logic: First item is featured
        const trending = library.slice(1, 4);
        const newArrivals = library;

        return (
            <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-20">
                <LabNotice />
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Logo className="w-8 h-8" />
                        <span className="font-black text-lg tracking-tight hidden sm:block">ACS READER</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-500 hover:text-indigo-600"><Search className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-500 hover:text-indigo-600 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-8 pb-10">

                    {/* Hero Section */}
                    {featured ? (
                        <div onClick={() => handleOpenProject(featured)} className="relative w-full aspect-[4/5] md:aspect-[21/9] cursor-pointer group">
                            <div className="absolute inset-0">
                                <img src={featured.coverImage || featured.panels[0].imageUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                                <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">Featured</span>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-none">{featured.title}</h1>
                                <p className="text-gray-300 text-sm md:text-lg line-clamp-2 max-w-2xl mb-4">{featured.storyConcept?.premise || "An epic original series."}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <span>{featured.tags?.join(' • ')}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <p>No content available. Create comics in the Studio first.</p>
                            <a href="/studio/" className="text-indigo-500 font-bold mt-2 inline-block">Go to Studio</a>
                        </div>
                    )}

                    {/* Trending Rails */}
                    {trending.length > 0 && (
                        <div className="px-4">
                            <div className="flex justify-between items-end mb-4">
                                <h2 className="text-xl font-bold">Trending Now</h2>
                                <span className="text-xs font-bold text-indigo-500 cursor-pointer">View All</span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                {trending.map(p => (
                                    <div key={p.id} onClick={() => handleOpenProject(p)} className="snap-start min-w-[140px] md:min-w-[180px] cursor-pointer group">
                                        <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 relative">
                                            <img src={p.coverImage || p.panels[0].imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] text-white font-bold">
                                                #{Math.floor(Math.random() * 10) + 1}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-sm truncate">{p.title}</h3>
                                        <p className="text-xs text-gray-500">{p.author?.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Arrivals Grid */}
                    <div className="px-4">
                        <h2 className="text-xl font-bold mb-4">New Arrivals</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {newArrivals.map(p => (
                                <div key={p.id} onClick={() => handleOpenProject(p)} className="cursor-pointer group">
                                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 relative">
                                        <img src={p.coverImage || p.panels[0].imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute bottom-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-tl-lg font-bold">
                                            UP
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-sm truncate">{p.title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Heart className="w-3 h-3 fill-current text-gray-400" /> {p.rating}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <BottomNav active={navTab} onChange={setNavTab} />
            </div>
        );
    }

    // --- VIEW: SERIES DETAIL ---
    if (view === 'DETAILS' && selectedProject) {
        return (
            <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
                <LabNotice />
                {/* Navbar Overlay */}
                <div className="fixed top-0 left-0 right-0 p-4 z-40 flex justify-between items-center text-white mix-blend-difference">
                    <button onClick={handleBack} className="p-2 bg-white/10 backdrop-blur-md rounded-full"><ChevronLeft className="w-6 h-6" /></button>
                    <div className="flex gap-3">
                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-full"><Share2 className="w-5 h-5" /></button>
                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-full"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Hero Header */}
                <div className="relative w-full aspect-[4/3] md:aspect-[21/9]">
                    <img src={selectedProject.coverImage || selectedProject.panels[0].imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white dark:to-black"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12">
                        <div className="flex items-end gap-4 mb-4">
                            <div className="w-24 h-32 md:w-32 md:h-48 rounded-lg overflow-hidden shadow-2xl border-2 border-white dark:border-gray-800 shrink-0 hidden md:block">
                                <img src={selectedProject.coverImage || selectedProject.panels[0].imageUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-5xl font-black mb-2">{selectedProject.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium opacity-90">
                                    <span className="text-indigo-600 dark:text-indigo-400">{selectedProject.author?.name}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {selectedProject.rating}</div>
                                    <span>•</span>
                                    <div>{selectedProject.viewCount} Views</div>
                                    <span>•</span>
                                    <span className="text-emerald-500">{selectedProject.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions & Synopsis */}
                <div className="px-6 -mt-4 relative z-10">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                        {selectedProject.storyConcept?.premise || "Experience a groundbreaking story generated by Artificial Intelligence. Every panel, dialogue, and character is crafted by the AI Comic Studio engine."}
                    </p>

                    <div className="flex gap-4 mb-8">
                        <button onClick={handleReadChapter} className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            <BookOpen className="w-5 h-5" /> Read Ep. 1
                        </button>
                        <button className="p-3.5 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Heart className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Chapter List */}
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="font-bold text-lg">Episodes</h3>
                            <button className="text-xs font-bold text-gray-500 uppercase">Sort: Newest</button>
                        </div>
                        <div className="space-y-4 pb-20">
                            {[1, 2, 3].map(ep => (
                                <div key={ep} onClick={handleReadChapter} className="flex gap-4 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors group">
                                    <div className="w-24 h-20 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative shrink-0">
                                        {selectedProject.panels[0]?.imageUrl && <img src={selectedProject.panels[0].imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />}
                                        {ep === 1 && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><span className="text-[10px] font-bold text-white uppercase tracking-widest">Read</span></div>}
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h4 className="font-bold text-sm mb-1 group-hover:text-indigo-500">Episode {ep}</h4>
                                        <p className="text-xs text-gray-500 mb-2">24 May 2024</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 1.2K</span>
                                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> 45</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: IMMERSIVE READER ---
    if (view === 'READ' && selectedProject) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col h-screen">
                <LabNotice />
                {/* Reader Header */}
                <div className={`fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md text-white px-4 py-3 flex justify-between items-center border-b border-gray-800 z-50 transition-transform duration-300 ${uiVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                    <button onClick={handleBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2">
                        <ChevronLeft className="w-6 h-6" />
                        <span className="font-bold text-sm truncate max-w-[150px]">{selectedProject.title}</span>
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400"><Settings className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Progress Bar */}
                {uiVisible && (
                    <div className="fixed top-[60px] left-0 h-1 bg-indigo-600 z-50 transition-all" style={{ width: `${scrollProgress}%` }}></div>
                )}

                {/* Content Area */}
                <div
                    className="flex-1 overflow-y-auto bg-[#121212] custom-scrollbar"
                    onScroll={handleScroll}
                    onClick={toggleUi}
                >
                    <div className="max-w-3xl mx-auto min-h-screen bg-white dark:bg-gray-900 shadow-2xl pb-32">
                        {/* Title Splash */}
                        <div className="py-20 px-8 text-center bg-gray-50 dark:bg-gray-950 mb-4">
                            <h2 className="text-3xl font-black uppercase mb-2 text-gray-900 dark:text-white">Episode 1</h2>
                            <p className="text-gray-500 text-sm tracking-widest">{selectedProject.title}</p>
                        </div>

                        {/* Panels */}
                        <div className="flex flex-col">
                            {selectedProject.panels.map((panel, idx) => (
                                <div key={panel.id} className="w-full relative">
                                    {panel.imageUrl ? (
                                        <img src={panel.imageUrl} className="w-full h-auto block" loading="lazy" />
                                    ) : (
                                        <div className="aspect-video bg-gray-800 flex items-center justify-center text-gray-600 text-xs">
                                            Rendering Panel {idx + 1}...
                                        </div>
                                    )}
                                    {/* Webtoon-style spacing */}
                                    <div className="h-2 bg-white dark:bg-gray-900"></div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-12 text-center bg-gray-50 dark:bg-gray-950">
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-6">To Be Continued</p>
                            <div className="flex justify-center gap-6 mb-8">
                                <div className="text-center">
                                    <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-pink-500 hover:scale-110 transition-transform shadow-lg"><Heart className="w-6 h-6 fill-current" /></button>
                                    <span className="text-[10px] text-gray-500 font-bold mt-2 block">Like</span>
                                </div>
                                <div className="text-center">
                                    <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"><Share2 className="w-6 h-6" /></button>
                                    <span className="text-[10px] text-gray-500 font-bold mt-2 block">Share</span>
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all w-full max-w-xs mx-auto flex items-center justify-center gap-2">
                                Next Episode <ChevronLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer UI (Comments & Nav) */}
                <div className={`fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4 z-50 transition-transform duration-300 ${uiVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="max-w-3xl mx-auto flex justify-between items-center text-white">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors" disabled>
                            <ChevronLeft className="w-5 h-5" /> Prev
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors text-sm font-bold"
                        >
                            <MessageCircle className="w-4 h-4" /> 342 Comments
                        </button>
                        <button className="flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-colors">
                            Next <ChevronLeft className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Comment Drawer Overlay */}
                <CommentDrawer isOpen={showComments} onClose={() => setShowComments(false)} />
            </div>
        );
    }

    return null;
};

export default ReaderApp;
