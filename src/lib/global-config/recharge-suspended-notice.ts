import type { RechargeSuspendedNoticeConfig } from "@/types/admin";

/**
 * Chave da configuração global (backend `global_config`) que guarda o texto
 * exibido em /recarregar quando o tenant está com `rechargeDisabled = true`.
 */
export const RECHARGE_SUSPENDED_NOTICE_KEY = "recharge_suspended_notice";

/**
 * Conteúdo original, hardcoded, do aviso — usado como fallback se o
 * global-config estiver indisponível (404, erro de rede, backend fora do ar)
 * e como valor inicial do formulário de edição quando ainda não há config
 * salva.
 */
export const DEFAULT_RECHARGE_SUSPENDED_NOTICE: RechargeSuspendedNoticeConfig = {
  title: "Sua recarga passa pelo suporte agora.",
  subtitle:
    "As APIs de pagamento estão instáveis. Enquanto a recarga automática está suspensa, o time credita seu saldo na hora, pelo WhatsApp.",
  steps: [
    {
      title: "Chame o suporte no WhatsApp",
      detail: "Diga o valor que você quer adicionar ao saldo.",
    },
    {
      title: "Faça o PIX na chave que o suporte enviar",
      detail: "A chave é informada na conversa — nunca por aqui.",
    },
    {
      title: "Envie o comprovante",
      detail: "O time confere e o saldo entra no seu cadastro.",
    },
  ],
};

/** Type guard defensivo — o value do global-config é JSON livre no backend. */
export function isValidRechargeSuspendedNoticeConfig(
  value: unknown,
): value is RechargeSuspendedNoticeConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.title === "string" &&
    v.title.trim().length > 0 &&
    typeof v.subtitle === "string" &&
    v.subtitle.trim().length > 0 &&
    Array.isArray(v.steps) &&
    v.steps.length > 0 &&
    v.steps.every(
      (step) =>
        step &&
        typeof step === "object" &&
        typeof (step as Record<string, unknown>).title === "string" &&
        typeof (step as Record<string, unknown>).detail === "string",
    )
  );
}
