'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  FolderOpen 
} from 'lucide-react';
import { SENEGALESE_FOOD_PHOTO_PRESETS } from '@/lib/order-routing';
import { toast } from 'sonner';

interface ImageUploadPickerProps {
  currentImageUrl: string;
  onImageChange: (url: string) => void;
  dishName?: string;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  currentImageUrl,
  onImageChange,
  dishName = '',
}) => {
  const [activeMode, setActiveMode] = useState<'UPLOAD' | 'URL' | 'PRESETS'>('UPLOAD');
  const [urlInput, setUrlInput] = useState(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Handle Local File Upload (PC / Mobile Gallery)
  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (Max: 8 Mo).');
      return;
    }

    setIsUploading(true);

    try {
      // Create instant local preview via FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const localDataUrl = e.target?.result as string;
        if (localDataUrl) {
          onImageChange(localDataUrl);
        }
      };
      reader.readAsDataURL(file);

      // Attempt cloud upload via API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'louametay/dishes');

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.image?.secureUrl || data?.image?.url) {
          const finalUrl = data.image.secureUrl || data.image.url;
          onImageChange(finalUrl);
          setUrlInput(finalUrl);
          toast.success('📷 Photo importée et optimisée en WebP sur le CDN !');
        }
      } else {
        toast.info('📷 Photo chargée en local (aperçu instantané conservé)');
      }
    } catch (err) {
      toast.info('📷 Photo chargée avec succès en local');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) {
      toast.error('Veuillez saisir une URL valide.');
      return;
    }
    onImageChange(urlInput.trim());
    toast.success('URL de photo appliquée !');
  };

  return (
    <div className="space-y-3.5 bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5">
      {/* Header Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Photo du Plat
          </span>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('UPLOAD')}
            className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
              activeMode === 'UPLOAD'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-orange-600" />
            <span>📁 Importer (Appareil)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('PRESETS')}
            className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
              activeMode === 'PRESETS'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>🖼️ Galerie HD Sénégal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('URL')}
            className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
              activeMode === 'URL'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>🔗 Lien URL</span>
          </button>
        </div>
      </div>

      {/* Main Content by Mode */}
      <div>
        {/* MODE 1: LOCAL FILE UPLOAD (DRAG & DROP / FILE BROWSER) */}
        {activeMode === 'UPLOAD' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-all ${
                dragOver
                  ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-white hover:border-amber-400 hover:bg-amber-50/20'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-3 text-amber-800">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <span className="text-xs font-bold">Importation et optimisation WebP...</span>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-900 block">
                      Cliquez pour choisir une photo ou glissez-la ici
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Formats supportés : JPG, PNG, WebP (Max: 8 Mo)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-1 py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-bold text-xs shadow-xs transition-all"
                  >
                    Parcourir mes fichiers
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: SENEGALESE HD FOOD PRESETS (1-CLICK SELECTION) */}
        {activeMode === 'PRESETS' && (
          <div className="space-y-2">
            <span className="text-[11px] text-slate-500 font-bold block">
              Sélectionnez une photo professionnelle de la gastronomie sénégalaise en 1 clic :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {SENEGALESE_FOOD_PHOTO_PRESETS.map((preset) => {
                const isSelected = currentImageUrl === preset.url;
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      onImageChange(preset.url);
                      setUrlInput(preset.url);
                      toast.success(`Photo « ${preset.name} » sélectionnée`);
                    }}
                    className={`p-1.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 text-left relative overflow-hidden group ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400'
                        : 'border-slate-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="relative w-full h-16 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                          <span className="p-1 bg-amber-500 text-slate-950 rounded-full shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-800 truncate w-full px-0.5">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 3: DIRECT URL INPUT */}
        {activeMode === 'URL' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-xs transition-all shrink-0"
              >
                Appliquer
              </button>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Collez le lien direct vers une image hébergée sur le web.
            </span>
          </div>
        )}
      </div>

      {/* Live Preview Card */}
      {currentImageUrl && (
        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentImageUrl}
              alt={dishName || 'Aperçu'}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
            />
            <div className="min-w-0">
              <span className="text-xs font-black text-slate-900 block truncate">
                {dishName || 'Photo actuelle du plat'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Image valide et prête</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onImageChange('');
              setUrlInput('');
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Supprimer la photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};