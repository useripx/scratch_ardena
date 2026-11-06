/**
 * Global Toast Notification Service (Singleton Event Emitter)
 * Mengelola antrean notifikasi melayang dengan durasi adaptif dan aksesibilitas WAI-ARIA.
 */

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'undo';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs: number;
  persistent?: boolean;
  onUndo?: () => void;
  undoLabel?: string;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastService {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private timers: Map<string, NodeJS.Timeout | number> = new Map();

  private notify() {
    const list = [...this.toasts];
    this.listeners.forEach((listener) => listener(list));
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getToasts(): ToastItem[] {
    return [...this.toasts];
  }

  dismiss(id: string) {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id) as any);
      this.timers.delete(id);
    }
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clearAll() {
    this.timers.forEach((timer) => clearTimeout(timer as any));
    this.timers.clear();
    this.toasts = [];
    this.notify();
  }

  private addToast(
    type: ToastType,
    title: string,
    message?: string,
    options?: {
      durationMs?: number;
      persistent?: boolean;
      onUndo?: () => void;
      undoLabel?: string;
    }
  ): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const defaultDuration =
      type === 'error' ? 0 : type === 'warning' ? 6000 : type === 'undo' ? 6000 : 4000;
    const durationMs = options?.durationMs ?? defaultDuration;
    const persistent = options?.persistent ?? (type === 'error' && durationMs === 0);

    const newToast: ToastItem = {
      id,
      type,
      title,
      message,
      durationMs,
      persistent,
      onUndo: options?.onUndo,
      undoLabel: options?.undoLabel || 'Batal',
      createdAt: Date.now(),
    };

    // Maksimal 5 toast sekaligus agar tidak membanjiri layar
    if (this.toasts.length >= 5) {
      const oldest = this.toasts[0];
      this.dismiss(oldest.id);
    }

    this.toasts.push(newToast);
    this.notify();

    if (!persistent && durationMs > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
      this.timers.set(id, timer);
    }

    return id;
  }

  success(title: string, message?: string, durationMs?: number): string {
    return this.addToast('success', title, message, { durationMs });
  }

  warning(title: string, message?: string, durationMs?: number): string {
    return this.addToast('warning', title, message, { durationMs: durationMs ?? 6000 });
  }

  error(title: string, message?: string, options?: { persistent?: boolean; durationMs?: number }): string {
    return this.addToast('error', title, message, {
      persistent: options?.persistent ?? true,
      durationMs: options?.durationMs ?? 0,
    });
  }

  info(title: string, message?: string, durationMs?: number): string {
    return this.addToast('info', title, message, { durationMs });
  }

  undo(
    title: string,
    message: string,
    onUndo: () => void,
    options?: { durationMs?: number; undoLabel?: string }
  ): string {
    return this.addToast('undo', title, message, {
      durationMs: options?.durationMs ?? 6000,
      onUndo,
      undoLabel: options?.undoLabel || 'Batal',
    });
  }
}

export const toast = new ToastService();

