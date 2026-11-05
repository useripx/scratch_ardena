import { Router } from 'express';
import { generateGame } from '../controllers/game.controller';
import { validateGenerateGameRequest } from '../validators/request.validator';

const router = Router();

// POST /api/v1/games/generate
router.post('/games/generate', validateGenerateGameRequest, generateGame);

export default router;

