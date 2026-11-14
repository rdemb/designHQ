import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  Variants,
} from 'motion/react';

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const SPRING_SNAPPY = {
  type: 'spring' as const,
  stiffness: 440,
  damping: 32,
  mass: 0.75,
};

export const SPRING_TACTILE = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 26,
  mass: 0.7,
};

export const SPRING_PRESS = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 30,
  mass: 0.6,
};

export const SPRING_SMOOTH = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 26,
  mass: 0.9,
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.025,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.986 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: EASE_OUT_EXPO,
    },
  },
};

export const staggerCardGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

export const staggerCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.978 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: EASE_OUT_EXPO,
    },
  },
};

export const staggerTableBodyVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.042,
      delayChildren: 0.05,
    },
  },
};

export const staggerTableRowVariants: Variants = {
  hidden: { opacity: 0, x: -12, y: 3 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASE_OUT_EXPO,
    },
  },
};

export interface MotionStaggerProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionStaggerContainer: React.FC<MotionStaggerProps> = ({
  children,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const MotionStaggerItem: React.FC<MotionStaggerProps> = ({
  children,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
};

export interface MotionStaggerGridProps {
  children: React.ReactNode;
  className?: string;
  triggerOnView?: boolean;
}

export const MotionStaggerGrid: React.FC<MotionStaggerGridProps> = ({
  children,
  className = '',
  triggerOnView = false,
}) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  if (triggerOnView) {
    return (
      <motion.div
        variants={staggerCardGridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      variants={staggerCardGridVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const MotionStaggerCard: React.FC<MotionStaggerProps> = ({
  children,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div variants={staggerCardVariants} className={className}>
      {children}
    </motion.div>
  );
};

/**
 * Scroll-triggered unblur & rise reveal for sections below the fold
 */
export const ScrollRevealBlock: React.FC<MotionStaggerProps> = ({
  children,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Pointer-tracked 60fps Specular Spotlight Card with optional 3D micro-tilt,
 * Border Beam, and spring-physics hover/tap gestures for interactive cards.
 */
export interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  tilt3d?: boolean;
  borderBeam?: boolean;
  interactive?: boolean;
  inheritStagger?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(34, 211, 238, 0.12)',
  tilt3d = false,
  borderBeam = false,
  interactive = false,
  inheritStagger = false,
  ariaLabel,
  onClick,
}) => {
  const prefersReduced = useReducedMotion();
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);

  const rotateX = useSpring(rotateXRaw, { stiffness: 280, damping: 24 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 280, damping: 24 });

  const isClickable = Boolean(onClick);
  const isInteractive = isClickable || interactive;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);

    if (tilt3d) {
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;
      rotateXRaw.set(-py * 4.5);
      rotateYRaw.set(px * 4.5);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(-300);
    mouseY.set(-300);
    if (tilt3d) {
      rotateXRaw.set(0);
      rotateYRaw.set(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const spotlightBg = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

  const hoverGesture = prefersReduced
    ? undefined
    : isInteractive
    ? {
        y: tilt3d ? -4 : -3,
        scale: 1.012,
        transition: SPRING_TACTILE,
      }
    : {
        y: -1.5,
        transition: SPRING_SMOOTH,
      };

  const tapGesture =
    prefersReduced || !isInteractive
      ? undefined
      : {
          scale: 0.984,
          y: 0,
          transition: SPRING_PRESS,
        };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      style={
        tilt3d && !prefersReduced
          ? {
              transformPerspective: 1100,
              rotateX,
              rotateY,
            }
          : undefined
      }
      variants={inheritStagger && !prefersReduced ? staggerCardVariants : undefined}
      initial={inheritStagger || prefersReduced ? false : { opacity: 0, y: 10 }}
      animate={inheritStagger ? undefined : { opacity: 1, y: 0 }}
      whileHover={hoverGesture}
      whileTap={tapGesture}
      transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
      className={`group relative overflow-hidden bg-white/95 dark:bg-[#0A0F1A]/95 border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-cyan-500/35 rounded-xl hq-glass-panel transition-colors duration-150 ${
        isClickable
          ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500'
          : ''
      } ${borderBeam && !prefersReduced ? 'hq-border-beam' : ''} ${className}`}
    >
      {!prefersReduced && (
        <motion.div
          aria-hidden="true"
          style={{ background: spotlightBg }}
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

/**
 * Magnetic tactile wrapper for primary studio CTAs
 */
export const MagneticWrapper: React.FC<{
  children: React.ReactNode;
  strength?: number;
  className?: string;
}> = ({ children, strength = 0.2, className = '' }) => {
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 22 });
  const springY = useSpring(y, { stiffness: 320, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    x.set(dx);
    y.set(dy);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * Masked Kinetic Word-by-Word Reveal for Hero Typography
 */
export interface KineticHeadlineProps {
  text: string;
  accentWords?: string[];
  className?: string;
}

export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  text,
  accentWords = [],
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');
  const normalizedAccents = accentWords.map((w) => w.toLowerCase());

  if (prefersReduced) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <h1 className={className}>
      {words.map((word, idx) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?:;]/g, '');
        const isAccent = normalizedAccents.includes(cleanWord);
        return (
          <span
            key={`${word}-${idx}`}
            className="inline-block overflow-hidden align-bottom mr-[0.25em] pb-[0.06em]"
          >
            <motion.span
              initial={{ y: '110%', opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.48,
                delay: 0.03 + idx * 0.03,
                ease: EASE_OUT_EXPO,
              }}
              className={`inline-block ${
                isAccent
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent'
                  : ''
              }`}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
};

/**
 * Top hairline scroll progress bar: invisible at rest/non-scrolling states,
 * reveals and glows with theme cyan upon active scrolling (GPU-composited 60fps).
 */
export interface ScrollProgressLineProps {
  resetKey?: string;
}

export const ScrollProgressLine: React.FC<ScrollProgressLineProps> = ({
  resetKey,
}) => {
  const prefersReduced = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001,
  });

  const scrollVelocity = useVelocity(scrollY);
  const rawGlowOpacity = useTransform(
    scrollVelocity,
    [-1400, -120, 0, 120, 1400],
    [1, 0.55, 0.25, 0.55, 1]
  );
  const glowOpacity = useSpring(rawGlowOpacity, {
    stiffness: 240,
    damping: 26,
  });

  const activityOpacity = useMotionValue(0);
  const smoothOpacity = useSpring(activityOpacity, {
    stiffness: 260,
    damping: 30,
  });

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activityOpacity.set(0);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetKey, activityOpacity]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (prefersReduced) return;

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    const isScrollable =
      typeof document !== 'undefined' &&
      document.documentElement.scrollHeight > window.innerHeight + 4;

    if (!isScrollable || latest <= 1) {
      activityOpacity.set(0);
      return;
    }

    activityOpacity.set(1);
    idleTimerRef.current = setTimeout(() => {
      activityOpacity.set(0);
    }, 950);
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity: smoothOpacity }}
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
    >
      {/* Ambient cyan bloom modulated by scroll velocity */}
      <motion.div
        style={{ scaleX, transformOrigin: '0%', opacity: glowOpacity }}
        className="absolute inset-0 h-[5px] -top-[1px] bg-gradient-to-r from-cyan-500/70 via-cyan-400/90 to-sky-300/80 blur-[4px] will-change-transform"
      />
      {/* Crisp 2px cyan progress beam */}
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="relative h-full w-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-sky-300 shadow-[0_0_10px_rgba(34,211,238,0.85),0_0_20px_rgba(6,182,212,0.45)] will-change-transform"
      />
    </motion.div>
  );
};

/**
 * Smoothly ticks/slides tabular numbers on arrival or market switch without layout shift
 */
export interface AnimatedTickerProps {
  value: string;
  className?: string;
}

export const AnimatedTicker: React.FC<AnimatedTickerProps> = ({
  value,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 320);
    return () => clearTimeout(t);
  }, [value, prefersReduced]);

  if (prefersReduced) {
    return <span className={`tabular-nums ${className}`}>{value}</span>;
  }

  return (
    <span
      className={`relative inline-flex items-baseline overflow-hidden tabular-nums ${className}`}
    >
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
        className={`inline-block transition-colors duration-300 ${
          flash ? 'text-cyan-400 dark:text-cyan-300' : ''
        }`}
      >
        {value}
      </motion.span>
    </span>
  );
};
