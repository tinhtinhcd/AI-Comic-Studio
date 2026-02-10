
import React, { useState } from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import * as AuthService from '../services/authService';
import { Loader2, ArrowRight, LogIn, Sparkles, Palette, BookOpen } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDemoLogin = async () => {
        setError('');
        setLoading(true);

        try {
            // Hardcode demo user for public access
            const demoUser: UserProfile = {
                id: 'demo-user-id',
                email: 'demo@ai-comic.studio',
                username: 'Demo User',
                joinDate: Date.now(),
                studioName: 'Demo Studio',
                avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=DemoUser',
                bio: "Demo account for public access.",
                stats: { projectsCount: 0, chaptersCount: 0, charactersCount: 0 }
            };
            
            // Store in localStorage for persistence
            localStorage.setItem('acs_session_v1', JSON.stringify(demoUser));
            
            // Simulate loading for UX
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            onLogin(demoUser);
        } catch (err: any) {
            setError('Failed to access demo. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen h-[100dvh] pt-6 sm:pt-7 bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
            <div className="fixed top-0 left-0 right-0 z-[60] text-center text-[10px] font-bold uppercase tracking-widest bg-amber-200 text-amber-900 py-1 pointer-events-none">
                Lab / Learning Project — Not a Product
            </div>
            {/* LEFT: ARTWORK / BRANDING */}
            <div className="hidden md:flex w-1/2 bg-indigo-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-purple-900/80 to-transparent"></div>
                
                <div className="relative z-10 text-center text-white p-12 max-w-lg">
                    <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Logo className="w-24 h-24" />
                    </div>
                    <h1 className="text-5xl font-black mb-6 font-comic tracking-wider">AI COMIC STUDIO</h1>
                    <p className="text-xl text-indigo-200 font-medium leading-relaxed mb-8">
                        Experience the future of comic creation with AI-powered agents. 
                        Script, design, and publish in one seamless workflow.
                    </p>
                    
                    <div className="flex justify-center gap-4 text-sm font-bold tracking-widest uppercase">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><BookOpen className="w-6 h-6"/></div>
                            <span>Script</span>
                        </div>
                        <div className="w-12 h-px bg-white/20 self-center"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Palette className="w-6 h-6"/></div>
                            <span>Design</span>
                        </div>
                        <div className="w-12 h-px bg-white/20 self-center"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Sparkles className="w-6 h-6"/></div>
                            <span>Create</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-indigo-200">
                            <strong>Demo Access Available</strong><br/>
                            Try all features without registration
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT: LOGIN FORM */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 bg-white dark:bg-gray-900 relative">
                <div className="absolute top-4 right-4 md:hidden">
                    <Logo className="w-12 h-12" />
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center lg:justify-start gap-3">
                            <LogIn className="w-8 h-8 text-indigo-600"/>
                            Demo Access
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Try AI Comic Studio with our demo account. No login required.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleDemoLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ArrowRight className="w-5 h-5"/>}
                        Try Demo Now
                    </button>

                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>Demo account with full access to all features</p>
                        <p className="mt-1">No registration or API key required</p>
                    </div>
                </div>
                
                <div className="mt-10 md:absolute md:bottom-6 text-xs text-gray-400 dark:text-gray-600">
                    &copy; 2024 AI Comic Studio. Powered by Gemini.
                </div>
            </div>
        </div>
    );
};
