'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Phone, 
  Trash2, 
  ArrowRightLeft, 
  Check, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ServerShiftMember, ServerShiftStatus } from '@/lib/server-shift';
import { toast } from 'sonner';

interface EditWaiterModalProps {
  member: ServerShiftMember | null;
  allMembers: ServerShiftMember[];
  isOpen: boolean;
  onClose: () => void;
  onSaveMember: (updated: ServerShiftMember) => void;
  onDeleteMember: (memberId: string) => void;
  onTransferTables: (fromMemberId: string, toMemberId: string) => void;
}

const PRESET_SHIFT_HOURS = [
  { label: '☀️ Service Midi (11h00 - 16h30)', hours: '11h00 - 16h30 (Service Midi)', type: 'LUNCH' },
  { label: '🌙 Service Soirée (17h00 - 00h30)', hours: '17h00 - 00h30 (Service Soirée)', type: 'DINNER' },
  { label: '⚡ Journée Complète (11h00 - 23h30)', hours: '11h00 - 23h30 (Journée Complète)', type: 'FULL_DAY' },
  { label: '✨ Renfort / Pause Décalée (12h00 - 20h00)', hours: '12h00 - 20h00 (Renfort)', type: 'CUSTOM' },
];

export const EditWaiterModal: React.FC<EditWaiterModalProps> = ({
  member,
  allMembers,
  isOpen,
  onClose,
  onSaveMember,
  onDeleteMember,
  onTransferTables,
}) => {
  const [name, setName] = useState(member?.name || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [shiftHours, setShiftHours] = useState(member?.shiftHours || '');
  const [status, setStatus] = useState<ServerShiftStatus>(member?.status || 'ACTIVE');
  const [transferTargetId, setTransferTargetId] = useState<string>('');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone || '');
      setShiftHours(member.shiftHours);
      setStatus(member.status);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const otherMembers = allMembers.filter((m) => m.id !== member.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom du serveur est obligatoire');
      return;
    }

    const updated: ServerShiftMember = {
      ...member,
      name: name.trim(),
      phone: phone.trim() || undefined,
      shiftHours,
      status,
    };

    onSaveMember(updated);
    toast.success(`✨ Fiche de ${name} mise à jour avec succès !`);
    onClose();
  };

  const handleExecuteTransfer = () => {
    if (!transferTargetId) {
      toast.error('Veuillez sélectionner un serveur remplaçant');
      return;
    }
    const target = allMembers.find((m) => m.id === transferTargetId);
    onTransferTables(member.id, transferTargetId);
    toast.success(`🔄 Tables de ${member.name} transférées à ${target?.name || 'Remplaçant'}`);
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer définitivement ${member.name} de l'équipe du shift ?`)) return;
    onDeleteMember(member.id);
    toast.success(`Serveur ${member.name} retiré du shift.`);
    onClose();
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-amber-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Modifier le Shift Serveur</h3>
              <p className="text-xs text-amber-300 font-medium">{member.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Nom & Téléphone */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nom &amp; Prénom du Serveur</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Numéro WhatsApp / Appel</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Horaires du Shift */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Horaires de Travail / Shift</label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_SHIFT_HOURS.map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => setShiftHours(preset.hours)}
                  className={`p-2 rounded-xl text-left font-bold transition-all border flex items-center justify-between ${
                    shiftHours === preset.hours
                      ? 'bg-amber-50 text-amber-950 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span>{preset.label}</span>
                  {shiftHours === preset.hours && <Check className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Statut en Direct */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Statut Actuel</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`p-2 rounded-xl text-center font-bold border transition-all ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                🟢 En Service
              </button>

              <button
                type="button"
                onClick={() => setStatus('BREAK')}
                className={`p-2 rounded-xl text-center font-bold border transition-all ${
                  status === 'BREAK'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                ⏸️ En Pause
              </button>

              <button
                type="button"
                onClick={() => setStatus('OFF')}
                className={`p-2 rounded-xl text-center font-bold border transition-all ${
                  status === 'OFF'
                    ? 'bg-rose-100 text-rose-900 border-rose-400 ring-1 ring-rose-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                🔴 Terminé
              </button>
            </div>
          </div>

          {/* Transfert Rapide de Tables si Pause ou Départ */}
          {member.assignedTables && member.assignedTables.length > 0 && otherMembers.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                <span>Transférer les Tables ({member.assignedTables.join(', ')}) :</span>
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold"
                >
                  <option value="">Sélectionner un collègue...</option>
                  {otherMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.status === 'ACTIVE' ? '🟢 En Service' : '⏸️ En Pause'})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
                >
                  Transférer
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1 transition-colors"
              title="Supprimer du shift"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Retirer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};