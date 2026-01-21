
import React, { useState } from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import * as AuthService from '../services/authService';
import { Loader2, ArrowRight, LogIn, Sparkles, Palette, BookOpen } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
            <div className="fixed top-0 left-0 right-0 z-[60] text-center text-[10px] font-bold uppercase tracking-widest bg-amber-200 text-amber-900 py-1 pointer-events-none">
                Lab / Learning Project — Not a Product
            </div>
            {/* LEFT: ARTWORK / BRANDING */}
            <div className="hidden lg:flex w-1/2 bg-indigo-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-purple-900/80 to-transparent"></div>
                
                <div className="relative z-10 text-center text-white p-12 max-w-lg">
                    <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Logo className="w-24 h-24" />
                    </div>
                    <h1 className="text-5xl font-black mb-6 font-comic tracking-wider">AI COMIC STUDIO</h1>
                    <p className="text-xl text-indigo-200 font-medium leading-relaxed mb-8">
                        The world's first collaborative AI agent system for professional comic production. 
                        Script, Draw, and Publish in one seamless workflow.
                    </p>
                    
                    <div className="flex justify-center gap-4 text-sm font-bold tracking-widest uppercase">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><BookOpen className="w-6 h-6"/></div>
                            <span>Story</span>
                        </div>
                        <div className="w-12 h-px bg-white/20 self-center"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Palette className="w-6 h-6"/></div>
                            <span>Art</span>
                        </div>
                        <div className="w-12 h-px bg-white/20 self-center"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Sparkles className="w-6 h-6"/></div>
                            <span>Magic</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-900 relative">
                <div className="absolute top-4 right-4 lg:hidden">
                    <Logo className="w-12 h-12" />
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center lg:justify-start gap-3">
                            <LogIn className="w-8 h-8 text-indigo-600"/>
                            Creator Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Log in to manage your projects and assets.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ArrowRight className="w-5 h-5"/>}
                            Access Dashboard
                        </button>
                    </form>
                </div>
                
                <div className="absolute bottom-6 text-xs text-gray-400 dark:text-gray-600">
                    &copy; 2024 AI Comic Studio. Powered by Gemini.
                </div>
            </div>
        </div>
    );
};
