import { NextFunction, Request, Response } from 'express';
import {
  GenerateGameUseCase,
  OutputValidationError,
} from '../usecases/generate-game.usecase';
import { GenerateGameRequest } from '../validators/request.validator';

let defaultUseCase: GenerateGameUseCase | null = null;

export function getGenerateGameUseCase(): GenerateGameUseCase {
  if (!defaultUseCase) {
    defaultUseCase = new GenerateGameUseCase();
  }
  return defaultUseCase;
}

export function setGenerateGameUseCase(useCase: GenerateGameUseCase | null): void {
  defaultUseCase = useCase;
}

/**
 * Controller untuk menangani pembuatan game berbasis instruksi bahasa alami.
 * Terhubung ke GenerateGameUseCase, memanggil ProviderManager,
 * dan memvalidasi output skema Scratch v1.0 & Capability Allowlist.
 */
export async function generateGame(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = req.id || 'unknown';
  const validatedInput = req.body as GenerateGameRequest;

  try {
    const useCase = getGenerateGameUseCase();
    const result = await useCase.execute({
      ...validatedInput,
      requestId,
    });

    res.status(200).json({
      success: true,
      data: result.game,
      meta: {
        requestId,
        provider: result.meta.provider,
        modelUsed: result.meta.modelUsed,
        latencyMs: result.meta.durationMs,
        totalTokens: result.meta.totalTokens,
      },
    });
  } catch (err: unknown) {
    if (err instanceof OutputValidationError) {
      res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          retryable: false,
        },
        meta: {
          requestId,
        },
      });
      return;
    }
    next(err);
  }
}
