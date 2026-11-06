// Motion tokens from beui (github.com/starc007/ui-components, MIT, by Saura), used by the ported craftwork
// components so they keep their original feel.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const SPRING_PRESS = { type: "spring", stiffness: 500, damping: 30, mass: 0.6 } as const;
export const SPRING_MOUSE = { stiffness: 200, damping: 15, mass: 0.3 } as const;
