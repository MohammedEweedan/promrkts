import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/authJwt';

// GET /api/resources/tier/:tierId - Get all resources for a tier
export const getTierResources = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    const { tierId } = req.params;
    
    try {
      const resources = await prisma.resource.findMany({
        where: { tierId },
        orderBy: { order: 'asc' },
      });
      
      res.json(resources);
    } catch (error) {
      console.error('Error fetching tier resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  },
];

// GET /api/resources/:id - Get a single resource
export const getResource = [
  requireAuth,
  async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;
    
    try {
      const resource = await prisma.resource.findUnique({
        where: { id },
        include: { tier: true },
      });
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ error: 'Failed to fetch resource' });
    }
  },
];
