import type { Transition, Variants } from "framer-motion";

// Stripe / Linear-feeling springs — tuned for premium UI motion
export const SPRING_BOUNCE: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.6,
};

export const SPRING_SMOOTH: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 0.7,
};

export const EASE_OUT: Transition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const EASE_IN_OUT: Transition = {
  duration: 0.45,
  ease: [0.65, 0, 0.35, 1] as const,
};

// Staggered grid entry — call with index
export const enterUp = (index = 0): Variants => ({
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_SMOOTH,
      delay: index * 0.045,
    },
  },
});

export const enterFade = (index = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { ...EASE_OUT, delay: index * 0.04 },
  },
});

export const enterSlideEnd = (index = 0): Variants => ({
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...SPRING_SMOOTH, delay: index * 0.04 },
  },
});

// Hover lift used on premium cards
export const HOVER_LIFT = {
  whileHover: { y: -3 },
  transition: SPRING_BOUNCE,
};
