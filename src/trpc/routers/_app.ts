import { createTRPCRouter } from '../init';
import { generationsRouter } from './generations';
import { voicesRouter } from './voices';
import { sarvamRouter } from './sarvam';
export const appRouter = createTRPCRouter({
  voices: voicesRouter,
  generations: generationsRouter,
  sarvam: sarvamRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;