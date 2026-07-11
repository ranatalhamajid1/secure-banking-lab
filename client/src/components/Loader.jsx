import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      gap: '28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Logo Container */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Spinning Gradient Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2.5,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0%, #8b5cf6 30%, #06b6d4 60%, transparent 100%)',
            mask: 'radial-gradient(circle, transparent 55%, black 56%)',
            WebkitMask: 'radial-gradient(circle, transparent 55%, black 56%)',
          }}
        />

        {/* Inner logo square with pulse */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              '0 0 0 0 rgba(139, 92, 246, 0)',
              '0 0 20px 4px rgba(139, 92, 246, 0.2)',
              '0 0 0 0 rgba(139, 92, 246, 0)',
            ],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
            zIndex: 1,
          }}
        >
          S
        </motion.div>
      </div>

      {/* SecureBank text with shimmer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="animate-text-shimmer"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          SecureBank
        </motion.p>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;
