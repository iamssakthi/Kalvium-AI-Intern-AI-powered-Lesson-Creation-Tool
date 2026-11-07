import { Variants } from '../motion';

// Page Transition Variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// Container with Staggered Children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Item Fade & Slide In
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// Card Hover & Tap
export const cardHoverVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.015, y: -3 },
};

// Button Press Feedback
export const buttonTapVariants: Variants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.96 },
};

// Accordion / Modal Transition
export const accordionVariants: Variants = {
  collapsed: { opacity: 0, height: 0 },
  expanded: { opacity: 1, height: 'auto' },
};
