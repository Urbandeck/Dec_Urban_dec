'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ReactNode } from 'react';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  animation?: 'fade' | 'slide-left' | 'slide-right' | 'scale' | 'rotate';
  className?: string;
  threshold?: number;
  delay?: number;
}

export default function ScrollAnimationWrapper({
  children,
  animation = 'fade',
  className = '',
  threshold = 0.1,
  delay = 0
}: ScrollAnimationWrapperProps) {
  const animationClass = `scroll-${animation === 'fade' ? 'element' : animation}`;

  const { ref } = useScrollAnimation<HTMLDivElement>({
    threshold,
    animationClass: 'visible',
    delay
  });

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
    >
      {children}
    </div>
  );
}