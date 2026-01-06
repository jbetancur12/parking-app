import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { FeatureDefinition } from '../../entities/FeatureDefinition';

export const getFeatures = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const features = await em.find(FeatureDefinition, {}, { orderBy: { category: 'ASC', key: 'ASC' } });
        return res.json(features);
    } catch (error) {
        console.error('Error fetching features:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createFeature = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { key, description, category } = req.body;

        if (!key || !description) {
            return res.status(400).json({ message: 'Key and description are required' });
        }

        const existing = await em.findOne(FeatureDefinition, { key });
        if (existing) {
            return res.status(409).json({ message: 'Feature key already exists' });
        }

        const feature = em.create(FeatureDefinition, {
            key,
            description,
            category,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await em.persistAndFlush(feature);
        return res.status(201).json(feature);
    } catch (error) {
        console.error('Error creating feature:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateFeature = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const { description, category } = req.body;

        const feature = await em.findOne(FeatureDefinition, { id: parseInt(id) });
        if (!feature) {
            return res.status(404).json({ message: 'Feature not found' });
        }

        if (description) feature.description = description;
        if (category !== undefined) feature.category = category;

        await em.persistAndFlush(feature);
        return res.json(feature);
    } catch (error) {
        console.error('Error updating feature:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteFeature = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const feature = await em.findOne(FeatureDefinition, { id: parseInt(id) });

        if (!feature) {
            return res.status(404).json({ message: 'Feature not found' });
        }

        await em.removeAndFlush(feature);
        return res.json({ message: 'Feature deleted successfully' });
    } catch (error) {
        console.error('Error deleting feature:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
