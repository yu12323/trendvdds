export interface CloudflareAiConfig {
  accountId: string;
  apiToken: string;
}

export function getCloudflareAiConfig(): CloudflareAiConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID não configurado no ambiente do servidor.');
  }
  if (!/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID deve ser o ID de conta Cloudflare de 32 caracteres.');
  }
  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN não configurado no ambiente do servidor.');
  }

  return { accountId, apiToken };
}
