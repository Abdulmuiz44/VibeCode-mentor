import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description, userId } = req.body;
        if (!name || !userId) {
            return res.status(400).json({ error: 'Name and userId are required' });
        }
        const project = await projectService.createProject(name, description, userId);
        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) {
            return res.status(400).json({ error: 'UserId is required' });
        }
        const projects = await projectService.getProjects(userId);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await projectService.getProjectById(id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};
