import { NextResponse } from 'next/server';
import {
  CLOUDFLARE_AI_MODELS,
  DEFAULT_CLOUDFLARE_AI_MODEL,
  isCloudflareAiModelId,
} from '../../../config/cloudflare-ai-models';
import {
  getCloudflareAiConfig,
} from '../../../config/cloudflare-ai-config';

export const runtime = 'nodejs';
export const maxDuration = 240;

const MAX_INPUT_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_INPUT_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_OUTPUT_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_PROMPT_LENGTH = 2000;
const REQUEST_TIMEOUT_MS = 220_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloudflareError(payload: unknown): string {
  if (isRecord(payload) && Array.isArray(payload.errors)) {
    const messages = payload.errors
      .filter(isRecord)
      .map((error) => error.message)
      .filter((message): message is string => typeof message === 'string');
    if (messages.length > 0) return messages.join('; ').slice(0, 1000);
  }
  return 'O Cloudflare Workers AI não conseguiu gerar a imagem.';
}

function parseImageDataUrl(value: string): { format: string; buffer: Buffer } | null {
  const match = value.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return null;
  return {
    format: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

export async function POST(request: Request) {
  let config;
  try {
    config = getCloudflareAiConfig();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Configuração do Cloudflare ausente.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da solicitação inválido.' }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.image !== 'string' || typeof body.prompt !== 'string') {
    return NextResponse.json(
      { error: 'Informe a imagem e a instrução de edição.' },
      { status: 400 }
    );
  }
  const model = body.model === undefined ? DEFAULT_CLOUDFLARE_AI_MODEL : body.model;
  if (!isCloudflareAiModelId(model)) {
    return NextResponse.json({ error: 'Modelo Cloudflare Workers AI inválido.' }, { status: 400 });
  }

  const referenceImage = body.referenceImage;
  if (
    referenceImage !== undefined &&
    referenceImage !== null &&
    typeof referenceImage !== 'string'
  ) {
    return NextResponse.json({ error: 'A referência adicional deve ser uma imagem válida.' }, { status: 400 });
  }
  const hasAdditionalReference = typeof referenceImage === 'string';
  if (hasAdditionalReference && model !== CLOUDFLARE_AI_MODELS.klein9b.id) {
    return NextResponse.json(
      { error: 'Selecione FLUX.2 Klein 9B para usar duas imagens de referência.' },
      { status: 400 }
    );
  }

  const imageValues = [body.image];
  if (typeof referenceImage === 'string') imageValues.push(referenceImage);
  const images: Array<{ format: string; buffer: Buffer }> = [];
  for (const imageValue of imageValues) {
    const parsedImage = parseImageDataUrl(imageValue);
    if (!parsedImage) {
      return NextResponse.json(
        { error: 'As imagens devem ser JPEG, PNG ou WebP em formato base64.' },
        { status: 400 }
      );
    }
    images.push(parsedImage);
  }

  if (images.some(({ buffer }) => buffer.byteLength > MAX_INPUT_IMAGE_BYTES)) {
    return NextResponse.json(
      { error: 'Cada imagem deve ter no máximo 3 MB.' },
      { status: 413 }
    );
  }
  const totalImageBytes = images.reduce((total, { buffer }) => total + buffer.byteLength, 0);
  if (totalImageBytes > MAX_TOTAL_INPUT_IMAGE_BYTES) {
    return NextResponse.json(
      { error: 'O total das imagens de referência deve ser de no máximo 3 MB.' },
      { status: 413 }
    );
  }

  const prompt = body.prompt.trim();
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `A instrução deve ter entre 1 e ${MAX_PROMPT_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/ai/run/${model}`;

  try {
    const formData = new FormData();
    formData.set('prompt', prompt);
    images.forEach(({ format, buffer }, index) => {
      formData.set(
        `input_image_${index}`,
        new Blob([Uint8Array.from(buffer)], { type: `image/${format}` }),
        `reference-${index}.${format}`
      );
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
      body: formData,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return NextResponse.json(
        { error: 'O Cloudflare Workers AI retornou uma resposta inválida.' },
        { status: 502 }
      );
    }

    const responseBody = isRecord(payload) ? payload : null;
    const result = responseBody && isRecord(responseBody.result) ? responseBody.result : null;
    const generatedImage = result?.image;
    if (!response.ok || responseBody?.success !== true) {
      return NextResponse.json(
        { error: cloudflareError(payload) },
        { status: 502 }
      );
    }
    if (
      typeof generatedImage !== 'string' ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(generatedImage)
    ) {
      return NextResponse.json(
        { error: 'O Cloudflare Workers AI não retornou uma imagem válida.' },
        { status: 502 }
      );
    }

    const generatedBuffer = Buffer.from(generatedImage, 'base64');
    if (generatedBuffer.byteLength > MAX_OUTPUT_IMAGE_BYTES) {
      return NextResponse.json(
        { error: 'A imagem gerada excede o limite de tamanho permitido.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      image: `data:image/jpeg;base64,${generatedImage}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao gerar a imagem com Cloudflare Workers AI.',
      },
      { status: 502 }
    );
  }
}
