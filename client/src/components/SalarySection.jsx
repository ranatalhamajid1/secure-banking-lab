import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Coffee, Home, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SalarySection = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const headingLine1Ref = useRef(null);
  const headingLine2Ref = useRef(null);
  const paraRef = useRef(null);
  const btnRef = useRef(null);
  const cardsContainerRef = useRef(null);
  
  const leftCardRef = useRef(null);
  const centerCardRef = useRef(null);
  const rightCardRef = useRef(null);

  // IntersectionObserver for floating loop
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // 1. Lenis Smooth Scrolling (Optimized for speed and responsiveness)
    const lenis = new Lenis({
      duration: 0.8, // Faster scroll transition
      easing: (t) => 1 - Math.pow(1 - t, 4), // Fast deceleration ease
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.8, // Moves more pixels per scroll tick
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    let ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        gsap.to([leftCardRef.current, centerCardRef.current, rightCardRef.current], {
          opacity: 1, y: 0, stagger: 0.2, duration: 1
        });
        return;
      }

      // MatchMedia Setup
      let mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Desktop Initial States
        gsap.set([headingLine1Ref.current, headingLine2Ref.current], { y: 100, opacity: 0 });
        gsap.set(paraRef.current, { opacity: 0, y: 30 });
        gsap.set(btnRef.current, { scale: 0.95, opacity: 0 });
        
        gsap.set(leftCardRef.current, { x: -320, z: -100, rotationY: 15, opacity: 0, filter: 'blur(10px)', force3D: true });
        gsap.set(centerCardRef.current, { x: 0, z: 50, opacity: 0, filter: 'blur(10px)', force3D: true, zIndex: 10 });
        gsap.set(rightCardRef.current, { x: 320, z: -100, rotationY: -15, opacity: 0, filter: 'blur(10px)', force3D: true });

        // Step 1: Text Entry (independent of scrub, starts earlier)
        gsap.to([headingLine1Ref.current, headingLine2Ref.current], { 
          y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", 
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } 
        });
        gsap.to(paraRef.current, { 
          opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.4, 
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } 
        });
        gsap.to(btnRef.current, { 
          scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.6, 
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } 
        });

        // Master Timeline for cards (pinned)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * 0.8, // Extremely fast scroll
            pin: true,
            scrub: 0.2, // Extremely tight scrub
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Velocity Motion Blur
              const velocity = self.getVelocity();
              const blurAmt = Math.min(Math.abs(velocity / 1000), 5);
              if (blurAmt > 1) {
                gsap.set(cardsContainerRef.current, { filter: `blur(${blurAmt}px)` });
              } else {
                gsap.to(cardsContainerRef.current, { filter: 'blur(0px)', duration: 0.2 });
              }
            }
          }
        });

        // Step 2: Cards Enter
        tl.to([leftCardRef.current, centerCardRef.current, rightCardRef.current], {
          opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: "power2.out"
        }, 0);

        // Step 3: Center scales, Z translates
        tl.to(centerCardRef.current, {
          scale: 1.05, z: 150, boxShadow: "0 40px 80px rgba(0,0,0,0.4)", filter: "brightness(1.1)", duration: 2, ease: "power2.inOut"
        }, 1.5);

        // Step 4: Sides move back
        tl.to(leftCardRef.current, {
          x: -400, z: -200, rotationY: 25, opacity: 0.7, filter: "brightness(0.6) blur(3px)", duration: 2, ease: "power2.inOut"
        }, 1.5)
        .to(rightCardRef.current, {
          x: 400, z: -200, rotationY: -25, opacity: 0.7, filter: "brightness(0.6) blur(3px)", duration: 2, ease: "power2.inOut"
        }, 1.5);

        // Step 5 & 6: Smooth swaps could be extended here. We'll do a graceful float rotation.
        tl.to(cardsContainerRef.current, {
          rotationY: 10, rotationX: 5, z: -50, duration: 2, ease: "sine.inOut"
        }, 3.5);
        
        tl.to(cardsContainerRef.current, {
          rotationY: -10, rotationX: -5, duration: 2, ease: "sine.inOut"
        }, 5.5);

        return () => tl.kill();
      });

      mm.add("(max-width: 1023px)", () => {
        // Mobile Initial States
        gsap.set([headingLine1Ref.current, headingLine2Ref.current, paraRef.current, btnRef.current], { y: 20, opacity: 0 });
        gsap.set(leftCardRef.current, { x: -20, y: -20, zIndex: 1, opacity: 0 });
        gsap.set(centerCardRef.current, { x: 0, y: 0, zIndex: 3, opacity: 0 });
        gsap.set(rightCardRef.current, { x: 20, y: 20, zIndex: 2, opacity: 0 });

        // Mobile Animations
        gsap.to([headingLine1Ref.current, headingLine2Ref.current, paraRef.current, btnRef.current], {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
        });

        gsap.to([leftCardRef.current, centerCardRef.current, rightCardRef.current], {
          opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out",
          scrollTrigger: { trigger: cardsContainerRef.current, start: "top 80%" }
        });
      });

      // Floating Loop (IntersectionObserver bounded)
      const floatCards = [leftCardRef.current, centerCardRef.current, rightCardRef.current];
      const floatTweens = floatCards.map((card, i) => {
        return gsap.to(card, {
          y: `+=${10 + i * 5}`,
          duration: 2 + i * 0.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          paused: true
        });
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !prefersReducedMotion) {
            floatTweens.forEach(t => t.play());
          } else {
            floatTweens.forEach(t => t.pause());
          }
        });
      });
      observer.observe(sectionRef.current);

      // Mouse Parallax (only for pointer: fine)
      if (window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
        const xTo = gsap.quickTo(cardsContainerRef.current, "rotationY", { ease: "power3.out", duration: 0.6 });
        const yTo = gsap.quickTo(cardsContainerRef.current, "rotationX", { ease: "power3.out", duration: 0.6 });

        const handleMouseMove = (e) => {
          if (!isVisibleRef.current) return;
          const { innerWidth, innerHeight } = window;
          const xPos = (e.clientX / innerWidth - 0.5) * 16; // max 8 deg each way
          const yPos = (e.clientY / innerHeight - 0.5) * -16;
          xTo(xPos);
          yTo(yPos);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
      }

    }, containerRef); // Context bounds

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ background: '#ffffff', position: 'relative', borderTopLeftRadius: '48px', borderTopRightRadius: '48px', marginTop: '-48px', zIndex: 20, boxShadow: '0 -20px 60px rgba(0,0,0,0.1)' }}>
      <section ref={sectionRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Header Block */}
        <div style={{ textAlign: 'center', paddingTop: '80px', flexShrink: 0, zIndex: 50 }}>
          <div style={{ overflow: 'hidden' }}>
            <h2 ref={headingLine1Ref} style={{ fontSize: 'clamp(3rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#18181b', margin: 0, lineHeight: 1 }}>
              Your salary,
            </h2>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
            <h2 ref={headingLine2Ref} style={{ fontSize: 'clamp(3rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#18181b', margin: 0, lineHeight: 1 }}>
              reimagined
            </h2>
          </div>
          <p ref={paraRef} style={{ fontSize: '1.25rem', color: '#52525b', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6, padding: '0 24px' }}>
            Spend smartly, send quickly, sort your salary automatically, and watch your savings grow — all with a SecureBank account.
          </p>
          <div ref={btnRef} style={{ marginTop: '32px' }}>
             <button style={{ background: '#111216', color: '#fff', padding: '16px 32px', borderRadius: '9999px', fontSize: '1rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
               Open an account
             </button>
          </div>
        </div>

        {/* 3D Cards Container */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1600px', paddingBottom: '40px' }}>
          <div ref={cardsContainerRef} style={{ position: 'relative', width: '320px', height: '480px', transformStyle: 'preserve-3d' }}>
            
            {/* LEFT CARD */}
            <div ref={leftCardRef} style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              borderRadius: '24px', background: 'linear-gradient(to bottom, #1a1614, #0a0807)', padding: '24px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backfaceVisibility: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '0.875rem', marginBottom: '8px' }}>Personal • USD</div>
                <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '16px' }}>$3,126</div>
                <div style={{ background: '#fff', color: '#000', padding: '8px 20px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, display: 'inline-block' }}>Accounts</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#3B59FF', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Coffee size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#000' }}>Coffee in Paris</div>
                    <div style={{ color: '#71717a', fontSize: '0.75rem' }}>Yesterday, 09:02</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#000' }}>-$3.25</div>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div ref={rightCardRef} style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              borderRadius: '24px', background: 'linear-gradient(to bottom, #0d1210, #050806)', padding: '24px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backfaceVisibility: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '0.875rem', marginBottom: '8px' }}>Personal</div>
                <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '16px' }}>$2,350</div>
                <div style={{ background: '#fff', color: '#000', padding: '8px 20px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, display: 'inline-block' }}>Accounts</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#06b6d4', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#000' }}>House bills</div>
                    <div style={{ color: '#71717a', fontSize: '0.75rem' }}>Due today</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#000' }}>-$225</div>
              </div>
            </div>

            {/* CENTER CARD (HERO) */}
            <div ref={centerCardRef} style={{
              position: 'absolute', top: '-20px', left: '-10px', width: '340px', height: '520px',
              borderRadius: '24px', backgroundImage: 'url(/hero-bg.png)', backgroundSize: '150%', backgroundPosition: 'center 35%', backgroundRepeat: 'no-repeat', padding: '24px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backfaceVisibility: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.2)', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
                <div style={{ background: '#111216', color: '#fff', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700 }}>
                  Move your salary
                </div>
              </div>
              <div style={{ position: 'absolute', top: '45%', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
                <div style={{ color: '#fff', fontSize: '0.875rem', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Personal</div>
                <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '16px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>$6,012</div>
                <div style={{ background: '#fff', color: '#000', padding: '8px 20px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, display: 'inline-block' }}>Accounts</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
                <div style={{ background: '#fff', color: '#000', borderRadius: '16px', padding: '16px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}><Shield size={16} style={{ marginRight: '4px' }} /> PROTECTED</div>
                <div style={{ background: '#fff', color: '#000', borderRadius: '16px', padding: '16px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>SWITCH GUARANTEE</div>
              </div>
            </div>

          </div>
        </div>

      </section>
    </div>
  );
};

export default SalarySection;
