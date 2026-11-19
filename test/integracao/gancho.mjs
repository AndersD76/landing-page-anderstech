const ADAPTADOR = new URL('./neon-pglite.mjs', import.meta.url).href;
export async function resolve(especificador, contexto, proximo) {
  if (especificador === '@neondatabase/serverless') return { url: ADAPTADOR, shortCircuit: true };
  return proximo(especificador, contexto);
}
