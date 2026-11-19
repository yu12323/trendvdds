'use client';

import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Download, Share2, HelpCircle, Clock } from 'lucide-react';

interface ResultsViewProps {
  onBack: () => void;
  onPublish: () => void;
  onRetryPublish: () => void;
  onOpenBid: (auctionId: string) => void;
  publishStatus: 'idle' | 'publishing' | 'published' | 'error';
  publishError: string;
  isPublishing: boolean;
  resultData: {
    postId: string;
    images: string[];
    captions: string[];
    sources: Array<'fooocus' | 'comfyui' | 'qwen' | 'cloudflare' | 'original'>;
    tiktokTitle: string;
  };
}

export default function ResultsView({
  onBack,
  onPublish,
  onRetryPublish,
  onOpenBid,
  publishStatus,
  publishError,
  isPublishing,
  resultData,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSaved, setDownloadSaved] = useState(false);
  const generatedSources = resultData.sources.filter((source) => source !== 'original');
  const distinctGeneratedSources = generatedSources.filter(
    (source, index) => generatedSources.indexOf(source) === index
  );
  const generatedLabel =
    distinctGeneratedSources.length > 1
      ? 'IA'
      : distinctGeneratedSources[0] === 'qwen'
      ? 'UltraQuality'
      : distinctGeneratedSources[0] === 'cloudflare'
      ? 'Cloudflare Workers AI'
      : distinctGeneratedSources[0] === 'comfyui'
      ? 'ComfyUI'
      : distinctGeneratedSources[0] === 'fooocus'
      ? 'Fooocus'
      : 'IA';

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(resultData.tiktokTitle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // REAL BROWSER DOWNLOAD FUNCTION (FIXED)
  const downloadSingleImage = async (imgSrc: string, index: number) => {
    try {
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = imgSrc;
        a.download = `na_verdade_foto_${index + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `na_verdade_foto_${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      const a = document.createElement('a');
      a.href = imgSrc;
      a.download = `na_verdade_foto_${index + 1}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      for (let i = 0; i < resultData.images.length; i++) {
        await downloadSingleImage(resultData.images[i], i);
        await new Promise((r) => setTimeout(r, 250));
      }
      setDownloadSaved(true);
    } catch (e) {
      console.warn('Download error:', e);
      setDownloadSaved(true);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadSaved(false), 3500);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-1 text-gray-700 hover:text-black">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-lg font-black text-gray-900">
          {generatedSources.length} imagens geradas por {generatedLabel}
        </h1>
        <p className="text-xs text-gray-500">
          A última é sua foto original. Deslize para ver e baixar.
        </p>
      </div>

      {/* 1. CARROSSEL DAS IMAGENS GERADAS COM LEGENDAS */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 px-1">
        {resultData.images.map((img, idx) => (
          <div
            key={idx}
            className="shrink-0 w-44 h-72 rounded-2xl overflow-hidden relative shadow-md bg-gray-100 border border-gray-200 group"
          >
            <img
              src={img}
              alt={`Imagem ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-black/60 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              {idx + 1}/{resultData.images.length}
            </span>
            <span
              className={`absolute top-9 left-2 text-white font-bold text-[9px] px-2 py-1 rounded-full ${
                resultData.sources[idx] === 'original' ? 'bg-gray-700/80' : 'bg-emerald-700/90'
              }`}
            >
              {resultData.sources[idx] === 'original'
                ? 'Foto original'
                : `Gerada pelo ${
                    resultData.sources[idx] === 'qwen'
                      ? 'UltraQuality'
                      : resultData.sources[idx] === 'cloudflare'
                      ? 'Cloudflare Workers AI'
                      : resultData.sources[idx] === 'comfyui'
                      ? 'ComfyUI'
                      : 'Fooocus'
                  }`}
            </span>

            {/* Single image download button */}
            <button
              onClick={() => downloadSingleImage(img, idx)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition shadow-sm"
              title="Baixar esta imagem"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-6">
              <p className="text-white font-extrabold text-xs leading-snug drop-shadow-sm">
                {resultData.captions[idx] || 'desculpa kkkkk'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 py-1">
        {resultData.images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#00A86B]' : 'bg-gray-300'}`}
          />
        ))}
      </div>

      {/* 2. TÍTULO DO TIKTOK + BOTÃO COPIAR */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800">Título do TikTok</span>
          <button
            onClick={handleCopyTitle}
            className="text-xs font-bold text-[#00A86B] flex items-center gap-1 hover:underline"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar título
              </>
            )}
          </button>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed font-medium">
          {resultData.tiktokTitle}
        </div>
      </div>

      {/* 3. BANNER DE LEILÃO AO VIVO (GRADIENTE AZUL / ROXO) */}
      <div
        onClick={() => onOpenBid('banner_results')}
        className="p-4 rounded-2xl bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-md cursor-pointer space-y-2 hover:opacity-95 transition"
      >
        <span className="font-bold text-xs block">Seu anúncio aqui – Leilão ao vivo</span>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/80">Lance atual</span>
            <div className="text-lg font-black text-amber-300">R$ 150,00</div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            00:15:30
          </div>
        </div>
      </div>

      {/* Download and required feed publication */}
      <div className="space-y-2 pt-1">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <label className="flex items-start gap-2 text-xs font-semibold text-gray-800">
            <input
              type="checkbox"
              checked
              disabled
              readOnly
              aria-label="Publicar no Feed Na Verdade"
              className="mt-0.5 accent-emerald-600"
            />
            <span>Postar no Feed Na Verdade (obrigatório)</span>
          </label>
          <p className="mt-1 pl-5 text-[11px] text-gray-600">
            A publicação inclui todas as imagens, inclusive a foto original, e ficará visível no feed.
          </p>
          {publishStatus === 'published' ? (
            <p role="status" className="mt-2 pl-5 text-xs font-semibold text-emerald-800">
              Publicado no Feed Na Verdade.
            </p>
          ) : isPublishing ? (
            <p role="status" aria-live="polite" className="mt-2 pl-5 text-xs text-emerald-800">
              Salvando imagens e publicando no feed…
            </p>
          ) : publishStatus === 'error' ? (
            <div className="mt-2 pl-5">
              <p role="alert" className="text-xs text-red-700">{publishError}</p>
              <button
                type="button"
                onClick={onRetryPublish}
                className="mt-2 text-xs font-bold text-emerald-800 underline"
              >
                Tentar publicar novamente
              </button>
            </div>
          ) : null}
        </div>

        <button
          onClick={handleDownloadAll}
          disabled={isDownloading}
          className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-60"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          {isDownloading
            ? 'Baixando Imagens para o seu Dispositivo...'
            : downloadSaved
            ? 'Imagens Baixadas com Sucesso! ✓'
            : `Baixar Todas (${resultData.images.length} Imagens)`}
        </button>

        <button
          onClick={onPublish}
          disabled={publishStatus !== 'published' || isPublishing}
          className="w-full py-3 bg-[#00A86B] hover:bg-[#046A4E] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          Ver no Feed Na Verdade
        </button>
      </div>
    </div>
  );
}
