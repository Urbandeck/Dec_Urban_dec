'use client';

import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

type AnimationType =
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'scale'
  | 'rotate';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

const animationClasses: Record<AnimationType, string> = {
  'fade-in': 'scroll-fade-in',
  'slide-left': 'scroll-slide-left',
  'slide-right': 'scroll-slide-right',
  'slide-up': 'scroll-fade-in',
  'scale': 'scroll-scale',
  'rotate': 'scroll-fade-in'
};

export default function AnimatedSection({
  children,
  animation = 'fade-in',
  delay = 0,
  className = '',
  threshold = 0.1,
  rootMargin = '0px'
}: AnimatedSectionProps) {
  const { ref } = useScrollAnimation({
    threshold,
    rootMargin,
    delay,
    animationClass: 'visible'
  });

  const animationClass = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
    >
      {children}
    </div>
  );
}