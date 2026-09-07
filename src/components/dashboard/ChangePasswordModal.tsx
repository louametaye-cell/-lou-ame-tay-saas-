'use client';

import React, { useState } from 'react';
import { X, Lock, Key, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantSubdomain?: string;
  restaurantName?: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantSubdomain,
  restaurantName,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit comporter au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les deux nouveaux mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/restaurant/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'Mot de passe modifié avec succès !');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        toast.error(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      toast.error('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900">
              Sécurité & Mot de Passe
            </h3>
            <p className="text-xs text-slate-500">
              {restaurantName || 'Espace Restaurant'}
            </p>
          </div>
        </div>

        {restaurantSubdomain && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-500">Votre identifiant de connexion :</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {restaurantSubdomain}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Mot de passe actuel *
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Votre mot de passe actuel..."
                className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-slate-900 outline-none pr-10 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nouveau mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Au moins 6 caractères..."
                className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-slate-900 outline-none pr-10 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Confirmer le nouveau mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez le nouveau mot de passe..."
                className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl px-3.5 py-2.5 text-slate-900 outline-none pr-10 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium transition-colors"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 font-bold"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#FF6B00] to-amber-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enregistrer le mot de passe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
