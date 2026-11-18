// ── Conferência do pagamento antes de liberar ────────────────────────────────
// O webhook do Asaas é autenticado só por um token fixo no header (o Asaas não
// assina o corpo). Até 18/11/2026 o corpo era aceito como verdade: quem tivesse
// o token aprovava qualquer pedido com um POST. Agora, antes de liberar curso
// ou contrato, a cobrança é buscada de volta na API do Asaas com a NOSSA chave,
// e só vale o que a API disser: status pago, referência do pedido e valor.
//
// Falha de rede ao consultar → lança, e o webhook responde 500 para o Asaas
// reenviar. Divergência → não libera e avisa (não adianta o Asaas reenviar).

const PAGOS = new Set(['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']);

/**
 * @param {object} payment   corpo do webhook (só o id é usado)
 * @param {object} esperado  { referencia, installment?, valorMinimo }
 * @param {Function} obter   asaas.obterCobranca
 * @returns {Promise<{ok: boolean, motivo?: string, cobranca?: object}>}
 */
export async function pagamentoConfere(payment, esperado, obter) {
  if (!payment || !payment.id) return { ok: false, motivo: 'webhook sem id de cobrança' };
  const real = await obter(String(payment.id));
  if (!real || !real.id) return { ok: false, motivo: 'cobrança não encontrada na API do Asaas' };
  if (!PAGOS.has(String(real.status))) return { ok: false, motivo: `status na API é ${real.status}, não pago` };
  const refOk = real.externalReference === esperado.referencia
    || (esperado.installment && real.installment && String(real.installment) === String(esperado.installment));
  if (!refOk) return { ok: false, motivo: `cobrança ${real.id} pertence a outra referência (${real.externalReference || 'nenhuma'})` };
  // Pago a menos é divergência; a mais (juros/multa de boleto atrasado) não.
  if (Number(real.value) + 0.01 < Number(esperado.valorMinimo)) {
    return { ok: false, motivo: `valor na API R$ ${real.value} menor que o esperado R$ ${esperado.valorMinimo}` };
  }
  return { ok: true, cobranca: real };
}
