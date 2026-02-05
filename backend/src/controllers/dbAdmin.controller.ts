// Database Admin Controller - TablePlus-like functionality for admins
import { Request, Response } from 'express';
import prisma from '../config/prisma';

// List of models that can be managed via the admin interface
const MANAGEABLE_MODELS = [
  'users',
  'courseTier',
  'purchase',
  'studentProgress',
  'badge',
  'userBadge',
  'courseReview',
  'dailyActivity',
  'challengeAccount',
  'challengeDailyStat',
  'promoCode',
  'promoRedemption',
  'communication',
  'job',
  'jobApplication',
  'banner',
  'prize',
  'prizeDraw',
  'prizeWinner',
  'resource',
  'quiz',
  'quizQuestion',
  'quizOption',
  'quizAttempt',
  'conversation',
  'message',
  'privateMessage',
  'tokenSale',
  'tokenPurchase',
  'tokenPriceTick',
  'tokenTrade',
  'userTokenHolding',
  'userWallet',
  'walletAddress',
  'walletDeposit',
  'communityAccess',
  'brokerSignup',
  'affiliate',
  'referralAttribution',
  'referralReward',
  'session',
  'pageview',
  'event',
  'botFeedback',
  'tradeJournalEntry',
  'post',
  'dashboardWorkspace',
  'userHeroDashboardLayout',
  'userEntitlement',
  'userJourney',
  'profileSnapshot',
] as const;

type ModelName = typeof MANAGEABLE_MODELS[number];

// Check if model exists in Prisma
const hasModel = (name: string): boolean => {
  return Boolean((prisma as any)[name] && typeof (prisma as any)[name].findMany === 'function');
};

// Get list of available models
export const listModels = async (_req: Request, res: Response) => {
  try {
    const available = MANAGEABLE_MODELS.filter(hasModel);
    
    // Get row counts for each model
    const modelStats = await Promise.all(
      available.map(async (name) => {
        try {
          const count = await (prisma as any)[name].count();
          return { name, count, available: true };
        } catch {
          return { name, count: 0, available: false };
        }
      })
    );

    res.json({ models: modelStats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get records from a model with pagination, filtering, and sorting
export const getRecords = async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const {
      page = '1',
      limit = '50',
      sortBy,
      sortOrder = 'desc',
      search,
      filters,
    } = req.query;

    if (!hasModel(model)) {
      return res.status(404).json({ error: `Model "${model}" not found` });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    let where: any = {};
    
    // Parse filters if provided
    if (filters) {
      try {
        const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
        where = { ...where, ...parsedFilters };
      } catch {
        // Ignore invalid filters
      }
    }

    // Simple search across common fields
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { id: searchTerm },
      ].filter(Boolean);
    }

    // Build orderBy
    const orderBy: any = sortBy
      ? { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    // Fetch records
    const [records, total] = await Promise.all([
      (prisma as any)[model].findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        skip,
        take: limitNum,
        orderBy,
      }),
      (prisma as any)[model].count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    res.json({
      records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single record by ID
export const getRecord = async (req: Request, res: Response) => {
  try {
    const { model, id } = req.params;

    if (!hasModel(model)) {
      return res.status(404).json({ error: `Model "${model}" not found` });
    }

    const record = await (prisma as any)[model].findUnique({
      where: { id },
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ record });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new record
export const createRecord = async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const data = req.body;

    if (!hasModel(model)) {
      return res.status(404).json({ error: `Model "${model}" not found` });
    }

    // Remove id if provided (let DB generate it)
    delete data.id;

    const record = await (prisma as any)[model].create({ data });

    res.status(201).json({ record });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update a record
export const updateRecord = async (req: Request, res: Response) => {
  try {
    const { model, id } = req.params;
    const data = req.body;

    if (!hasModel(model)) {
      return res.status(404).json({ error: `Model "${model}" not found` });
    }

    // Remove id from data to prevent changing it
    delete data.id;

    const record = await (prisma as any)[model].update({
      where: { id },
      data,
    });

    res.json({ record });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete a record
export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const { model, id } = req.params;

    if (!hasModel(model)) {
      return res.status(404).json({ error: `Model "${model}" not found` });
    }

    await (prisma as any)[model].delete({
      where: { id },
    });

    res.json({ success: true, message: 'Record deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Bulk delete records
export const bulkDeleteRecords = async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const { ids } = req.body;

    if (!hasModel(model)) {
      return res.status(404).json({ error: `Model "${model}" not found` });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await (prisma as any)[model].deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ success: true, deleted: result.count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Execute raw SQL query (read-only for safety)
export const executeQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    // Only allow SELECT queries for safety
    const trimmed = query.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT')) {
      return res.status(403).json({ 
        error: 'Only SELECT queries are allowed for safety. Use the CRUD endpoints for modifications.' 
      });
    }

    const result = await prisma.$queryRawUnsafe(query);

    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get model schema/fields info
export const getModelSchema = async (req: Request, res: Response) => {
  try {
    const { model } = req.params;

    if (!hasModel(model)) {
      return res.status(404).json({ error: `Model "${model}" not found` });
    }

    // Get a sample record to infer fields
    const sample = await (prisma as any)[model].findFirst();
    
    const fields = sample 
      ? Object.keys(sample).map(key => ({
          name: key,
          type: typeof sample[key],
          sample: sample[key],
        }))
      : [];

    res.json({ model, fields });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Database stats
export const getDatabaseStats = async (_req: Request, res: Response) => {
  try {
    const stats: Record<string, number> = {};
    
    for (const model of MANAGEABLE_MODELS) {
      if (hasModel(model)) {
        try {
          stats[model] = await (prisma as any)[model].count();
        } catch {
          stats[model] = -1; // Error getting count
        }
      }
    }

    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
