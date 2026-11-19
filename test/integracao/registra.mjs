// node --import ./test/integracao/registra.mjs → '@neondatabase/serverless' vira PGlite.
import { register } from 'node:module';
register(new URL('./gancho.mjs', import.meta.url).href);
