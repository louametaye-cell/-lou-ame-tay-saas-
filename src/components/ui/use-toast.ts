import { toast as sonnerToast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function toast({
  title,
  description,
  variant = 'default',
  duration = 3500,
}: ToastProps) {
  if (variant === 'destructive') {
    return sonnerToast.error(title || 'Action Restreinte', {
      description,
      duration,
    });
  }

  return sonnerToast(title || '', {
    description,
    duration,
  });
}

export function useToast() {
  return { toast };
}
