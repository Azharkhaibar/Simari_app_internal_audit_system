// useDropdownPortal.js
import { useEffect } from 'react';

export function useDropdownPortal({ open, setOpen, triggerRef, containerRef, closeOnEsc = true }) {
  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      const inTrigger = triggerRef?.current?.contains(e.target);
      const inContainer = containerRef?.current?.contains(e.target);

      if (!inTrigger && !inContainer) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, setOpen, triggerRef, containerRef]);

  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, closeOnEsc, setOpen]);

  // auto close saat component unmount / tab switch
  useEffect(() => {
    return () => setOpen(false);
  }, [setOpen]);
}
