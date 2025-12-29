
import { useState, useRef, useEffect } from 'react';
import { ComicProject, AgentRole, SystemLog } from '../types';
import { INITIAL_PROJECT_STATE } from '../constants';
import * as StorageService from '../services/storageService';
import * as GeminiService from '../services/geminiService';

export const useProjectManagement = (
    project: ComicProject, 
    updateProject: (updates: Partial<ComicProject>) => void,
    uiLanguage: 'en' | 'vi'
) => {
    const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
    const [activeProjects, setActiveProjects] = useState<ComicProject[]>([]);
    const [library, setLibrary] = useState<ComicProject[]>([]);

    useEffect(() => {
        setActiveProjects(StorageService.getActiveProjects());
        setLibrary(StorageService.getLibrary());
    }, []);

    const addLog = (agentId: AgentRole, message: string, type: SystemLog['type'] = 'info') => {
        const newLog: SystemLog = {
            id: crypto.randomUUID(),
            agentId,
            message,
            timestamp: Date.now(),
            type
        };
        updateProject({ logs: [...project.logs, newLog] });
    };

    const handleSaveWIP = () => {
        setSaveStatus('SAVING');
        const result = StorageService.saveWorkInProgress(project);
        if (result.success) {
            setSaveStatus('SAVED');
            addLog(AgentRole.PROJECT_MANAGER, result.message === 'SAVED_WITHOUT_MEDIA' ? "Project Saved (Media stripped due to size)" : "Project Saved Successfully.", 'success');
            setActiveProjects(StorageService.getActiveProjects());
            setTimeout(() => setSaveStatus('IDLE'), 2000);
        } else {
            setSaveStatus('ERROR');
            alert("Storage Full");
        }
    };

    const handleLoadWIP = (p: ComicProject) => {
        if (confirm("Load this project? Unsaved changes in current workspace will be lost.")) {
            updateProject(p);
            addLog(AgentRole.PROJECT_MANAGER, `Loaded Workspace: ${p.title}`, 'info');
        }
    };

    const handleDeleteWIP = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this project?")) {
            StorageService.deleteActiveProject(id);
            setActiveProjects(StorageService.getActiveProjects());
        }
    };

    // Fixed: Added handleDeleteFromLibrary to hook to manage library state internally
    const handleDeleteFromLibrary = (id: string) => {
        if (confirm("Permanently delete this archived project?")) {
            StorageService.deleteProjectFromLibrary(id);
            setLibrary(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleExportProjectZip = async () => {
        addLog(AgentRole.PROJECT_MANAGER, "Compressing project assets...", 'info');
        try {
            const zipBlob = await StorageService.exportProjectToZip(project);
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.title || 'Project'}_Backup.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addLog(AgentRole.PROJECT_MANAGER, "Backup exported successfully.", 'success');
        } catch (e) {
            console.error(e);
            addLog(AgentRole.PROJECT_MANAGER, "Export failed.", 'error');
        }
    };

    const handleImportProjectZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        addLog(AgentRole.PROJECT_MANAGER, "Unzipping and restoring project...", 'info');
        try {
            const loadedProject = await StorageService.importProjectFromZip(file);
            const saveResult = StorageService.saveWorkInProgress(loadedProject);
            if (!saveResult.success) {
                if (confirm("Storage is full. Load into Workspace anyway?")) {
                    updateProject(loadedProject);
                    addLog(AgentRole.PROJECT_MANAGER, "Project loaded (Not Saved).", 'warning');
                }
            } else {
                updateProject(loadedProject);
                setActiveProjects(StorageService.getActiveProjects());
                addLog(AgentRole.PROJECT_MANAGER, "Project restored and saved.", 'success');
            }
        } catch (e: any) {
            console.error(e);
            alert("Import failed: " + e.message);
            addLog(AgentRole.PROJECT_MANAGER, "Import failed: " + e.message, 'error');
        }
    };

    const switchProjectLanguage = (newLang: string) => {
        if (newLang === project.activeLanguage) return;
        const currentLang = project.activeLanguage;
        
        const updatedPanels = project.panels.map(p => {
            const currentTranslation = { dialogue: p.dialogue, caption: p.caption };
            const newTranslations = { ...(p.translations || {}), [currentLang]: currentTranslation };
            
            const nextTranslation = newTranslations[newLang] || { dialogue: '', caption: '' };
            
            return {
                ...p,
                translations: newTranslations,
                dialogue: nextTranslation.dialogue || (newLang === project.masterLanguage ? p.dialogue : ''), 
                caption: nextTranslation.caption || (newLang === project.masterLanguage ? p.caption : '')
            };
        });
        updateProject({ activeLanguage: newLang, panels: updatedPanels });
        addLog(AgentRole.PROJECT_MANAGER, `Switched view to ${newLang}`, 'info');
    };

    const handleAddLanguage = async (newLang: string) => {
        if (!newLang || project.targetLanguages.includes(newLang)) return;
        
        addLog(AgentRole.TRANSLATOR, `Initializing new language layer: ${newLang}...`, 'info');
        
        updateProject({ targetLanguages: [...project.targetLanguages, newLang] });
        
        if (project.panels.length > 0) {
            addLog(AgentRole.TRANSLATOR, `Translating ${project.panels.length} panels to ${newLang}...`, 'info');
            try {
                const translatedPanels = await GeminiService.batchTranslatePanels(
                    project.panels, 
                    [newLang], 
                    project.modelTier
                );
                updateProject({ panels: translatedPanels });
                addLog(AgentRole.TRANSLATOR, `Localization complete for ${newLang}.`, 'success');
            } catch(e) {
                addLog(AgentRole.TRANSLATOR, `Localization failed for ${newLang}.`, 'error');
            }
        }
    };

    return {
        saveStatus,
        activeProjects,
        library,
        handleSaveWIP,
        handleLoadWIP,
        handleDeleteWIP,
        handleDeleteFromLibrary, // Fixed: Exported new handler
        handleExportProjectZip,
        handleImportProjectZip,
        switchProjectLanguage,
        handleAddLanguage,
        addLog
    };
};
