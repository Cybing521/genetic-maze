// 键盘快捷键Hook
import { useEffect } from 'react';

export interface KeyboardHandlers {
  onSpacePress?: () => void;      // Space: Play/Pause
  onReset?: () => void;            // R: Reset
  onSingleStep?: () => void;       // S: Single step
  onExport?: () => void;           // E: Export
  onHelp?: () => void;             // H: Help
  onFullscreen?: () => void;       // F: Fullscreen
  onEscape?: () => void;           // Esc: Close dialogs
  onSpeed?: (speed: number) => void; // 1-9: Animation speed
}

export function useKeyboard(handlers: KeyboardHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的按键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // 防止默认行为（某些按键）
      const shouldPreventDefault = [' ', 'F', 'Escape'].includes(e.key);
      if (shouldPreventDefault) {
        e.preventDefault();
      }

      switch (e.key) {
        case ' ':
          handlers.onSpacePress?.();
          break;
        case 'r':
        case 'R':
          handlers.onReset?.();
          break;
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey) { // 避免与Ctrl+S冲突
            handlers.onSingleStep?.();
          }
          break;
        case 'e':
        case 'E':
          if (!e.ctrlKey && !e.metaKey) {
            handlers.onExport?.();
          }
          break;
        case 'h':
        case 'H':
          handlers.onHelp?.();
          break;
        case 'f':
        case 'F':
          handlers.onFullscreen?.();
          break;
        case 'Escape':
          handlers.onEscape?.();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          const speed = parseInt(e.key);
          handlers.onSpeed?.(speed);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
}

