'use client';

import React, { useRef, useState } from 'react';
import {
  User,
  Mail,
  Lock,
  LogOut,
  Camera,
  Sparkles,
  Gavel,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { AppUser } from '../lib/auth';

interface ProfileViewProps {
  onCreateClick: () => void;
  onAuctionClick: () => void;
  currentUser: AppUser | null;
  onAvatarChange: (avatarUrl: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onCreateClick,
  onAuctionClick,
  currentUser,
  onAvatarChange,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ text: 'Por favor preencha email e senha', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseClient();
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          text: data.session
            ? 'Conta criada com sucesso! Você já está conectado.'
            : 'Conta criada. Confirme seu e-mail para entrar.',
          type: 'success',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          text: 'Login realizado com sucesso!',
          type: 'success',
        });
      }
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Não foi possível autenticar. Tente novamente.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw error;
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Não foi possível sair da conta.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (!currentUser) {
      setMessage({ text: 'Entre na sua conta antes de enviar uma foto.', type: 'error' });
      input.value = '';
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({ text: 'Use uma imagem JPG, PNG ou WebP.', type: 'error' });
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'A imagem deve ter no máximo 5 MB.', type: 'error' });
      input.value = '';
      return;
    }

    setUploadingAvatar(true);
    setMessage(null);
    try {
      const path = `avatars/${currentUser.id}/avatar`;
      const supabase = getSupabaseClient();
      const { error: uploadError } = await supabase.storage
        .from('naverdade-images')
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const publicUrl = `${supabase.storage.from('naverdade-images').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      onAvatarChange(publicUrl);
      setMessage({ text: 'Foto de perfil atualizada.', type: 'success' });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Não foi possível enviar a foto. Tente novamente.',
        type: 'error',
      });
    } finally {
      setUploadingAvatar(false);
      input.value = '';
    }
  };

  return (
    <div className="pb-16 max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 opacity-90" />

        <div className="relative pt-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-emerald-100 flex items-center justify-center mb-3">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-emerald-600" />
            )}
          </div>

          {currentUser && (
            <>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                {uploadingAvatar ? 'Enviando foto...' : 'Alterar foto'}
              </button>
            </>
          )}

          {currentUser && message && (
            <p
              className={`mb-2 text-xs ${
                message.type === 'success' ? 'text-emerald-700' : 'text-red-600'
              }`}
              role="status"
            >
              {message.text}
            </p>
          )}

          <h2 className="text-xl font-extrabold text-gray-900">
            {currentUser ? currentUser.displayName : 'Criador Visitante'}
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {currentUser ? currentUser.email : 'Login opcional — crie e dê lances sem conta'}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-5 border-t border-gray-100">
            <div className="bg-emerald-50/60 rounded-2xl p-2.5">
              <div className="text-lg font-black text-emerald-700">4</div>
              <div className="text-[11px] text-gray-500 font-medium">Posts Feitos</div>
            </div>
            <div className="bg-emerald-50/60 rounded-2xl p-2.5">
              <div className="text-lg font-black text-emerald-700">R$ 160</div>
              <div className="text-[11px] text-gray-500 font-medium">Lances Ativos</div>
            </div>
            <div className="bg-emerald-50/60 rounded-2xl p-2.5">
              <div className="text-lg font-black text-emerald-700">12.4K</div>
              <div className="text-[11px] text-gray-500 font-medium">Alcance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth / Account Card */}
      {currentUser ? (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900">Conta conectada</div>
              <div className="text-xs text-gray-500">{currentUser.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>{loading ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {isSignUp ? 'Criar Conta (Opcional)' : 'Entrar na Conta (Opcional)'}
              </h3>
              <p className="text-xs text-gray-500">
                Sincronize seus posts e gerencie seus lances de qualquer lugar.
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-2xl text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Processando...' : isSignUp ? 'Criar Conta Grátis' : 'Entrar'}
            </button>
          </form>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              {isSignUp ? 'Já tem conta? Fazer login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="space-y-3">
        <button
          onClick={onCreateClick}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:brightness-105 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Criar Novo Post da Trend</div>
              <div className="text-xs text-emerald-100">Gere 4 imagens instantâneas com IA</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-200" />
        </button>

        <button
          onClick={onAuctionClick}
          className="w-full bg-white border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:bg-emerald-50/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Gavel className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-gray-900">Leilão de Espaços</div>
              <div className="text-xs text-gray-500">4 banners exclusivos para anunciar</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* About App */}
      <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/60 text-xs text-gray-600 space-y-1">
        <div className="font-bold text-emerald-900">Sobre o "Na Verdade"</div>
        <p>
          O aplicativo mobile e web definitivo para a trend viral "Na Verdade". Conectado em tempo
          real com Supabase e gerado com IA.
        </p>
      </div>
    </div>
  );
};
