import React from 'react';

export type Variants = Record<string, any>;

export const AnimatePresence: React.FC<{ children: React.ReactNode; mode?: string }> = ({ children }) => {
  return <>{children}</>;
};

const createMotionComponent = (Tag: keyof React.JSX.IntrinsicElements) => {
  const Component = React.forwardRef<any, any>(
    ({ variants, initial, animate, exit, transition, whileHover, whileTap, layoutId, layout, className = '', style, ...props }, ref) => {
      // Add subtle entrance and transition classes
      const motionClass = `${className} transition-all duration-300 ease-out`;
      return React.createElement(Tag, {
        ref,
        className: motionClass,
        style,
        ...props,
      });
    }
  );
  Component.displayName = `motion.${Tag}`;
  return Component;
};

export const motion = {
  div: createMotionComponent('div'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  form: createMotionComponent('form'),
  span: createMotionComponent('span'),
  section: createMotionComponent('section'),
  header: createMotionComponent('header'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  h4: createMotionComponent('h4'),
};

export default motion;

