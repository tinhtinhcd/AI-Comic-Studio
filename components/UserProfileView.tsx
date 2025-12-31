
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, Edit2, Save, User, Mail, Briefcase, Calendar, Star, Layers, Users } from 'lucide-react';
import * as AuthService from '../services/authService';

interface UserProfileViewProps {
    user: UserProfile;
    onUpdate: (updatedUser: UserProfile) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user.username,
        studioName: user.studioName || '',
        bio: user.bio || ''
    });

    const handleSave = async () => {
        try {
            const updated = await AuthService.updateUserProfile(user.id, formData);
            onUpdate(updated);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20">
            {/* Header / Banner */}
            <div className="relative h-48 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-16 shadow-lg">
                <div className="absolute -bottom-12 left-8 flex items-end gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 overflow-hidden shadow-xl">
                            <img src={user.avatar} className="w-full h-full object-cover" />
                        </div>
                        {isEditing && (
                            <button className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all">
                                <Camera className="w-4 h-4"/>
                            </button>
                        )}
                    </div>
                    <div className="mb-4">
                        <h2 className="text-3xl font-black text-white drop-shadow-md">{user.username}</h2>
                        <p className="text-white/80 font-medium flex items-center gap-2"><Briefcase className="w-4 h-4"/> {user.studioName || "Freelance Studio"}</p>
                    </div>
                </div>
                
                <div className="absolute top-4 right-4">
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/30"
                        >
                            <Edit2 className="w-4 h-4"/> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="bg-black/20 backdrop-blur-md hover:bg-black/30 text-white px-4 py-2 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-all"
                            >
                                <Save className="w-4 h-4"/> Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 text-sm uppercase tracking-wider">About</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Studio Name</label>
                                {isEditing ? (
                                    <input 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm"
                                        value={formData.studioName}
                                        onChange={(e) => setFormData({...formData, studioName: e.target.value})}
                                    />
                                ) : (
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{user.studioName || "Not set"}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Joined</label>
                                <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400"/>
                                    {new Date(user.joinDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Email</label>
                                <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400"/>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 text-sm uppercase tracking-wider">Biography</h3>
                        {isEditing ? (
                            <textarea 
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-sm min-h-[150px]"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                placeholder="Tell us about your creative style..."
                            />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {user.bio || "No biography provided yet."}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
                            <div className="w-10 h-10 mx-auto bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-white rounded-full flex items-center justify-center mb-2">
                                <Layers className="w-5 h-5"/>
                            </div>
                            <h4 className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{user.stats?.projectsCount || 0}</h4>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase">Projects</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800 text-center">
                            <div className="w-10 h-10 mx-auto bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-white rounded-full flex items-center justify-center mb-2">
                                <Users className="w-5 h-5"/>
                            </div>
                            <h4 className="text-2xl font-black text-purple-900 dark:text-purple-100">{user.stats?.charactersCount || 0}</h4>
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase">Characters</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-6 rounded-2xl border border-pink-100 dark:border-pink-800 text-center">
                            <div className="w-10 h-10 mx-auto bg-pink-200 dark:bg-pink-700 text-pink-700 dark:text-white rounded-full flex items-center justify-center mb-2">
                                <Star className="w-5 h-5"/>
                            </div>
                            <h4 className="text-2xl font-black text-pink-900 dark:text-pink-100">{user.stats?.chaptersCount || 0}</h4>
                            <p className="text-xs font-bold text-pink-600 dark:text-pink-300 uppercase">Chapters</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
