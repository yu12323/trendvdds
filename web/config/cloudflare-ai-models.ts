export const CLOUDFLARE_AI_MODELS = {
  klein4b: {
    id: '@cf/black-forest-labs/flux-2-klein-4b',
    label: 'FLUX.2 Klein 4B',
  },
  klein9b: {
    id: '@cf/black-forest-labs/flux-2-klein-9b',
    label: 'FLUX.2 Klein 9B',
  },
} as const;

export type CloudflareAiModelId =
  (typeof CLOUDFLARE_AI_MODELS)[keyof typeof CLOUDFLARE_AI_MODELS]['id'];

export const DEFAULT_CLOUDFLARE_AI_MODEL = CLOUDFLARE_AI_MODELS.klein4b.id;

export function isCloudflareAiModelId(value: unknown): value is CloudflareAiModelId {
  return Object.values(CLOUDFLARE_AI_MODELS).some((model) => model.id === value);
}
