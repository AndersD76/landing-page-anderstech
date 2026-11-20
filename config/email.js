// ── Cliente do Resend que não falha calado ──────────────────────────────────
// 20/11/2026: o domínio anderstech.net estava "Failed" no Resend (sem o registro
// DKIM resend._domainkey no DNS) e ninguém soube. O SDK não lança erro quando o
// envio é recusado: devolve { data: null, error }, e nenhum dos pontos de envio
// olhava o retorno. Resultado: log limpo, régua marcando "enviada" e contrato
// pago marcado como enviado sem ter saído.
// Aqui a recusa vira exceção (todo ponto de envio já está em try/catch, então o
// visitante não vê diferença) e fica registrada no log.
import { Resend } from 'resend';

export function blindar(cliente) {
  if (!cliente || !cliente.emails || typeof cliente.emails.send !== 'function') return cliente;
  const original = cliente.emails.send.bind(cliente.emails);
  cliente.emails.send = async (msg, opcoes) => {
    const r = await original(msg, opcoes);
    if (r && r.error) {
      const motivo = r.error.message || r.error.name || 'erro desconhecido';
      const e = new Error(`Resend recusou o envio (remetente ${msg && msg.from}): ${motivo}`);
      e.resend = r.error;
      console.error('[email]', e.message);
      throw e;
    }
    return r;
  };
  return cliente;
}

export function criarResend(chave = process.env.RESEND_API_KEY) {
  return chave ? blindar(new Resend(chave)) : null;
}
