import { Router, type IRouter, type Request, type Response } from 'express';
import { analyzePackageWithAi } from '../lib/ai-vision';
import { logger } from '../lib/logger';

const router: IRouter = Router();

router.get('/ai/status', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);
  res.json({
    available: hasKey,
    model: process.env.AI_VISION_MODEL || 'google/gemini-2.5-flash',
    provider: 'OpenRouter Vision AI',
  });
});

router.post('/ai/analyze-image', async (req: Request, res: Response) => {
  try {
    const { image, text } = req.body || {};
    if (!image && !text) {
      res.status(400).json({ error: 'Please provide a package photo or label text to analyze.' });
      return;
    }

    const result = await analyzePackageWithAi({ image, text });
    res.json({
      success: true,
      analysis: result,
    });
  } catch (error: any) {
    logger.error({ err: error?.message || error }, 'AI analysis endpoint failed');
    res.status(500).json({
      error: error?.message || 'Failed to complete AI vision analysis on this package.',
    });
  }
});

export default router;
