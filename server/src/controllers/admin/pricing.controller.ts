import { Request, Response } from 'express';
import { PricingPlanService } from '../../services/pricingPlan.service';

const pricingPlanService = new PricingPlanService();

/**
 * Get all pricing plans
 */
export const getAllPlans = async (req: Request, res: Response) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const plans = await pricingPlanService.getAllPlans(includeInactive);
        return res.json(plans);
    } catch (error) {
        console.error('Get all plans error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get plan by code
 */
export const getPlanByCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const plan = await pricingPlanService.getPlanByCode(code);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        return res.json(plan);
    } catch (error) {
        console.error('Get plan error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Create new plan
 */
export const createPlan = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        if (!data.code || !data.name) {
            return res.status(400).json({ message: 'Code and Name are required' });
        }

        const plan = await pricingPlanService.createPlan(data);

        return res.status(201).json(plan);
    } catch (error: any) {
        console.error('Create plan error:', error);
        if (error.message === 'Plan code already exists') {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Update plan configuration
 */
export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const data = req.body;

        const plan = await pricingPlanService.updatePlan(code, data);

        return res.json({
            message: 'Plan updated successfully',
            plan
        });
    } catch (error: any) {
        console.error('Update plan error:', error);
        if (error.message === 'Plan not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Toggle plan active status
 */
export const togglePlanStatus = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const { isActive } = req.body;

        const plan = await pricingPlanService.togglePlanStatus(code, isActive);

        return res.json({
            message: `Plan ${isActive ? 'activated' : 'deactivated'} successfully`,
            plan
        });
    } catch (error: any) {
        console.error('Toggle plan status error:', error);
        if (error.message === 'Plan not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
