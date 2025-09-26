import React, { useEffect } from 'react';

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor performance metrics using native APIs
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('Page Load Time:', navEntry.loadEventEnd - navEntry.loadEventStart);
          console.log('DOM Content Loaded:', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
          console.log('First Paint:', navEntry.loadEventEnd - navEntry.fetchStart);
        }
        
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          if (resource.name.includes('.js') || resource.name.includes('.css')) {
            console.log('Resource Load Time:', resource.name, resource.duration);
          }
        }
        
        if (entry.entryType === 'paint') {
          console.log('Paint Timing:', entry.name, entry.startTime);
        }
      }
    });

    // Observe different types of performance entries
    try {
      observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    } catch (error) {
      console.log('Performance Observer not supported:', error);
    }

    // Monitor Core Web Vitals manually
    const measureWebVitals = () => {
      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.log('LCP measurement not supported:', error);
        }
      }
    };

    measureWebVitals();

    return () => {
      try {
        observer.disconnect();
      } catch (error) {
        console.log('Observer disconnect error:', error);
      }
    };
  }, []);

  return null;
};

export default PerformanceMonitor;
