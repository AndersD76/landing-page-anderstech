// k6 de fumaça: 5 usuários por 30 s nas páginas de conversão. Falha se p95 > 1,5 s
// ou se mais de 1% das requisições der erro. Roda contra o servidor LOCAL do CI.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE || 'http://127.0.0.1:3001';
export const options = {
  vus: 5,
  duration: '30s',
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<1500'] },
};
const PAGINAS = ['/', '/iso-9001', '/iso-9001-2026', '/transicao-iso-9001-2026', '/contratar', '/pbqp-h', '/sitemap.xml'];

export default function () {
  for (const p of PAGINAS) {
    const r = http.get(BASE + p);
    check(r, { [`${p} 200`]: (x) => x.status === 200 });
  }
  sleep(1);
}
