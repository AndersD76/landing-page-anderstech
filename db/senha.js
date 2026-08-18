// ── Recuperação e troca de senha (achado #71) ─────────────────────────────────
// Não existia em nenhum dos dois módulos. No portal a senha é gerada pelo
// sistema, então quem perdesse o e-mail ficava sem acesso e sem saída.
// Guardamos o hash do token, nunca o token — vazamento da tabela não permite
// redefinir a senha de ninguém.

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const VALIDADE_MIN = 30;

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function criarToken(sql, escopo, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await sql`
    INSERT INTO password_resets (escopo, user_id, token_hash, expira_em)
    VALUES (${escopo}, ${userId}, ${hashToken(token)}, NOW() + INTERVAL '${VALIDADE_MIN} minutes')
  `;
  return token;
}

export async function consumirToken(sql, escopo, token, novaSenha, tabela) {
  if (!token || typeof novaSenha !== 'string' || novaSenha.length < 8) {
    return { ok: false, erro: 'Senha deve ter pelo menos 8 caracteres' };
  }
  const linhas = await sql`
    SELECT id, user_id FROM password_resets
    WHERE escopo = ${escopo} AND token_hash = ${hashToken(token)}
      AND usado_em IS NULL AND expira_em > NOW()
    LIMIT 1
  `;
  if (!linhas.length) return { ok: false, erro: 'Link inválido ou expirado' };

  const hash = await bcrypt.hash(novaSenha, 10);
  const upd = tabela === 'portal_users'
    ? sql`UPDATE portal_users SET senha_hash = ${hash} WHERE id = ${linhas[0].user_id}`
    : sql`UPDATE ead_users SET senha_hash = ${hash} WHERE id = ${linhas[0].user_id}`;

  await sql.transaction([
    upd,
    sql`UPDATE password_resets SET usado_em = NOW() WHERE id = ${linhas[0].id}`,
  ]);
  return { ok: true };
}

export function emailReset({ nome, link }) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
    <h2 style="color:#0b1730">Redefinir sua senha</h2>
    <p>Olá, ${String(nome || '').split(' ')[0]}. Recebemos um pedido para redefinir sua senha.</p>
    <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#c5383c;color:#fff;text-decoration:none;font-weight:bold">Criar nova senha</a></p>
    <p style="font-size:13px;color:#666">O link vale por ${VALIDADE_MIN} minutos e só pode ser usado uma vez.
    Se não foi você quem pediu, ignore este e-mail — sua senha continua a mesma.</p>
  </div>`;
}
