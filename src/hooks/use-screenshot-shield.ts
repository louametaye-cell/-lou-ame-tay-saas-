'use client';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useScreenshotShield(enabled: boolean) {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const triggerWarning = () => {
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch {
        // Clipboard write might be blocked by permission policy
      }
      setBlurred(true);
      toast({
        variant: 'destructive',
        title: 'Action Restreinte',
        description: "Merci de respecter le secret d'entreprise lou ame tay",
        duration: 3500,
      });
      setTimeout(() => setBlurred(false), 2500);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const isCaptureKey =
        e.key === 'PrintScreen' ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['S', 'I', 'C'].includes(e.key.toUpperCase())) ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
        (e.ctrlKey && e.key.toLowerCase() === 'p');

      if (isCaptureKey) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning();
    };

    const onBlur = () => setBlurred(true);
    const onFocus = () => setBlurred(false);

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', (e) => e.key === 'PrintScreen' && triggerWarning());
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('contextmenu', onContextMenu);
    };
  }, [enabled]);

  return { blurred };
}
