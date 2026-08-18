import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './FadeIn.css';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  className?: string;
  threshold?: number;
}

const FadeIn = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  duration = 0.8,
  className = '',
  threshold = 0.15
}: FadeInProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing once it becomes visible
          if (domRef.current) {
            observer.unobserve(domRef.current);
          }
        }
      });
    }, {
      threshold,
      rootMargin: '0px 0px -50px 0px'
    });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} fade-${direction} ${className}`}
      style={{
        transitionDelay: `${delay}s`,
        transitionDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
