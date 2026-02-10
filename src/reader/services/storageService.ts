
import { ComicProject } from '../types';

export const getActiveProjects = async (): Promise<ComicProject[]> => {
    // Skip Cloud API for demo - Return empty array for now
    console.log("Reader: Loading projects in demo mode (local storage only)");
    return [];
};
