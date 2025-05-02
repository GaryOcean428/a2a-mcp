/**
 * Asset Optimization Utilities
 * 
 * This file contains utilities for optimizing assets like images and fonts
 * to improve page rendering performance.
 */

import { addVersionToUrl } from '../version';

/**
 * Load an image with lazy loading and optimized settings
 */
export function optimizeImage(src: string, alt: string, className?: string) {
  // Ensure the src has a version parameter for cache busting
  const versionedSrc = addVersionToUrl(src);
  
  // Create an image element with optimized settings
  const img = document.createElement('img');
  img.src = versionedSrc;
  img.alt = alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  
  // Add class for styling
  if (className) {
    img.className = className;
  }
  
  // Add width and height if possible to prevent layout shifts
  const imgPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => {
      if (!img.hasAttribute('width')) {
        img.width = img.naturalWidth;
      }
      if (!img.hasAttribute('height')) {
        img.height = img.naturalHeight;
      }
      resolve(img);
    };
    img.onerror = reject;
  });
  
  return { img, promise: imgPromise };
}

/**
 * Preload critical images to improve perceived load time
 */
export function preloadCriticalImages(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Optimize font loading to prevent layout shifts
 */
export function optimizeFontLoading() {
  // Create font-display style
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap; /* Use swap to prevent FOIT */
      src: local('Inter'), local('Inter-Regular');
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 500;
      font-display: swap;
      src: local('Inter Medium'), local('Inter-Medium');
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: local('Inter SemiBold'), local('Inter-SemiBold');
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: local('Inter Bold'), local('Inter-Bold');
    }
  `;
  document.head.appendChild(style);
  
  // Add font preload link
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.as = 'font';
  fontPreload.type = 'font/woff2';
  fontPreload.crossOrigin = 'anonymous';
  fontPreload.href = '/font/inter.woff2'; // Path to your font
  document.head.appendChild(fontPreload);
}

/**
 * Initialize responsive images
 */
export function initResponsiveImages() {
  // Find all img elements with data-responsive attribute
  const respImages = document.querySelectorAll('img[data-responsive]');
  
  respImages.forEach((img) => {
    const imgElement = img as HTMLImageElement;
    const src = imgElement.getAttribute('data-src') || imgElement.src;
    const srcset = imgElement.getAttribute('data-srcset');
    const sizes = imgElement.getAttribute('data-sizes');
    
    if (srcset) {
      imgElement.srcset = srcset;
    }
    
    if (sizes) {
      imgElement.sizes = sizes;
    }
    
    // Set the actual src last to prevent multiple downloads
    if (src) {
      imgElement.src = src;
    }
  });
}