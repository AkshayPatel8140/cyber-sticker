'use client';

import { useEffect } from 'react';

export default function ImageProtection() {
  useEffect(() => {
    // Prevent right-click context menu ONLY on images
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the click is on an image or inside an image container
      const isImage = target.tagName === 'IMG';
      const isImageContainer = target.closest('[data-image-protected]');
      
      // Allow context menu on buttons, inputs, text, and other interactive elements
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'A' ||
        target.isContentEditable ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input')
      ) {
        return; // Allow normal right-click
      }
      
      // Only prevent if it's an image or image container
      if (isImage || isImageContainer) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag and drop ONLY on images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('[data-image-protected]')) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent image selection ONLY
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('[data-image-protected]')) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return null;
}
