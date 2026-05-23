import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;
    // @ts-ignore - GSAP loaded from CDN
    const gsap = window.gsap;
    // @ts-ignore
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Eyebrow
      const eyebrows = ref.current!.querySelectorAll('.reveal-eyebrow');
      eyebrows.forEach((el) => {
        gsap.fromTo(el,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.5, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        );
      });

      // Headline
      const headlines = ref.current!.querySelectorAll('.reveal-headline');
      headlines.forEach((el) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        );
      });

      // Body
      const bodies = ref.current!.querySelectorAll('.reveal-body');
      bodies.forEach((el) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        );
      });

      // Cards/items with stagger
      const staggerContainers = ref.current!.querySelectorAll('.reveal-stagger');
      staggerContainers.forEach((container) => {
        const items = container.querySelectorAll('.reveal-item');
        gsap.fromTo(items,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: { trigger: container, start: 'top 80%', once: true }
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}
