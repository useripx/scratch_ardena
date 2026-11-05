import { Router } from 'express';
import { getCapabilities } from '../controllers/meta.controller';

const router = Router();

// GET /api/v1/meta/capabilities
router.get('/meta/capabilities', getCapabilities);

export default router;

