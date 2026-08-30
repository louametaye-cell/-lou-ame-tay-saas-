import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  MapPin, 
  Phone, 
  Search, 
  Filter, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  DollarSign,
  Share2,
  Send,
  Calendar,
  Shield,
  UserCheck,
  UserPlus,
  Briefcase,
  Layers,
  ChevronRight,
  ArrowRightLeft,
  Award,
  KeyRound,
  FileText,
  Lock,
  Unlock,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Smartphone,
  BookOpen,
  HelpCircle,
  Printer,
  Target,
  ShieldCheck
} from 'lucide-react';
import { PROSPECTS_DATA, COMMERCIAL_AGENTS } from '@/components/landing/data/mockData';
import { OfficialLogo } from './OfficialLogo';
import { ProspectItem, CommercialAgent } from '@/components/landing/types';
import { 
  SALES_PITCH_STEPS, 
  OBJECTION_HANDLERS, 
  OFFICIAL_OFFERS, 
  OFFICIAL_INSTALLATION_PACK, 
  CONTRACT_ORDER_FORM_FIELDS 
} from '@/components/landing/data/salesGuideData';

interface CrmModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAgentSlug?: string;
}

export const CrmModal: React.FC<CrmModalProps> = ({ isOpen, onClose, initialAgentSlug }) => {
  // Main Data States
  const [commercials, setCommercials] = useState<CommercialAgent[]>(COMMERCIAL_AGENTS);
  const [prospects, setProspects] = useState<ProspectItem[]>(PROSPECTS_DATA);
  
  // Auth & Session State
  // authenticatedUser: null (shows login portal) or CommercialAgent
  const [authenticatedUser, setAuthenticatedUser] = useState<CommercialAgent | null>(null);
  
  // Login Form States
  const [selectedAgentForLogin, setSelectedAgentForLogin] = useState<string>('comm-1');
  const [inputPin, setInputPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPinHelp, setShowPinHelp] = useState(false);
  const [copiedLinkForAgentId, setCopiedLinkForAgentId] = useState<string | null>(null);

  // Navigation tabs inside CRM: 'pipeline' | 'guide' | 'team' (Admin Commercial Management)
  const [activeTab, setActiveTab] = useState<'pipeline' | 'guide' | 'team'>('pipeline');
  const [guideSubTab, setGuideSubTab] = useState<'pitch' | 'objections' | 'tarifs' | 'contrat'>('pitch');
  const [guideLanguage, setGuideLanguage] = useState<'fr' | 'wo'>('fr');
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminCommercialFilter, setAdminCommercialFilter] = useState<string>('all');
  const [selectedProspect, setSelectedProspect] = useState<ProspectItem | null>(null);

  // New Prospect Form State
  const [isAddingProspect, setIsAddingProspect] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('Thiès (Centre-ville)');
  const [newTables, setNewTables] = useState(10);
  const [newPlan, setNewPlan] = useState<'essentielle' | 'premium'>('premium');
  const [newAssignedCommId, setNewAssignedCommId] = useState<string>('comm-1');
  const [newNotes, setNewNotes] = useState('');

  // New Commercial Account Form State (Admin)
  const [isAddingCommercial, setIsAddingCommercial] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommEmail, setNewCommEmail] = useState('');
  const [newCommPhone, setNewCommPhone] = useState('+221 7');
  const [newCommZone, setNewCommZone] = useState('Thiès & Environs');
  const [newCommTarget, setNewCommTarget] = useState(12);
  const [newCommRate, setNewCommRate] = useState(20);
  const [newCommPin, setNewCommPin] = useState('1234');

  // Check URL slug / direct token on mount or update
  useEffect(() => {
    if (!isOpen) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const agentSlug = initialAgentSlug || urlParams.get('agent') || urlParams.get('crm');

      if (token) {
        // Direct auto-login with secure token
        const matchedByToken = commercials.find((c) => c.directToken === token);
        if (matchedByToken) {
          setAuthenticatedUser(matchedByToken);
          return;
        }
      }

      if (agentSlug) {
        // Pre-select agent in dropdown or auto-select
        const matched = commercials.find(
          (c) => c.slug === agentSlug || c.id === agentSlug || (agentSlug === 'admin' && c.role === 'admin')
        );
        if (matched) {
          setSelectedAgentForLogin(matched.id);
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen, initialAgentSlug, commercials]);

  if (!isOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const targetAgent = commercials.find((c) => c.id === selectedAgentForLogin);
    if (!targetAgent) {
      setLoginError('Agent introuvable');
      return;
    }

    if (targetAgent.accessPin && inputPin.trim() !== targetAgent.accessPin) {
      setLoginError(`Code PIN incorrect pour ${targetAgent.name}. (PIN par défaut : ${targetAgent.accessPin})`);
      return;
    }

    // Success
    setAuthenticatedUser(targetAgent);
    setInputPin('');
    setLoginError(null);
  };

  const handleQuickDemoLogin = (agent: CommercialAgent) => {
    setAuthenticatedUser(agent);
    setLoginError(null);
    setInputPin('');
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setSelectedProspect(null);
    setInputPin('');
    setLoginError(null);
  };

  const handleCopyDirectLink = (agent: CommercialAgent) => {
    const origin = window.location.origin;
    const directUrl = `${origin}?agent=${agent.slug || agent.id}&token=${agent.directToken || ''}`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLinkForAgentId(agent.id);
    setTimeout(() => setCopiedLinkForAgentId(null), 3000);
  };

  const handleSendWhatsAppAccess = (agent: CommercialAgent) => {
    const origin = window.location.origin;
    const directUrl = `${origin}?agent=${agent.slug || agent.id}&token=${agent.directToken || ''}`;
    const text = `Bonjour ${agent.name} ! Voici ton lien d'accès direct et sécurisé à ton CRM Terrain Lou Ame Tay :\n\n🔗 ${directUrl}\n\n🔐 Ton code PIN : ${agent.accessPin || '7721'}\n\nBonne prospection sur la zone ${agent.zone} !`;
    window.open(`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Check role
  const isCurrentAdmin = authenticatedUser?.role === 'admin';

  // Filter prospects based on current account view
  const visibleProspects = prospects.filter((item) => {
    if (!authenticatedUser) return false;

    // 1. Commercial isolation: if not admin, strictly only see assigned prospects
    if (!isCurrentAdmin && item.assignedCommercialId !== authenticatedUser.id) {
      return false;
    }

    // 2. Admin filter by commercial
    if (isCurrentAdmin && adminCommercialFilter !== 'all' && item.assignedCommercialId !== adminCommercialFilter) {
      return false;
    }

    // 3. Search query filter
    const matchesSearch = 
      item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedCommercialName && item.assignedCommercialName.toLowerCase().includes(searchQuery.toLowerCase()));

    // 4. Status filter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Keep selected prospect updated
  const currentSelected = selectedProspect && visibleProspects.some((p) => p.id === selectedProspect.id)
    ? selectedProspect
    : visibleProspects[0] || null;

  // KPI Calculations
  const wonCount = visibleProspects.filter((p) => p.status === 'gagne').length;
  const inNegotiationCount = visibleProspects.filter((p) => p.status === 'en_negociation').length;
  const toFollowUpCount = visibleProspects.filter((p) => p.status === 'a_relancer').length;
  
  const totalMrrInScope = visibleProspects
    .filter((p) => p.status === 'gagne')
    .reduce((sum, p) => sum + (p.interestPlan === 'premium' ? 25000 : 15000), 0);

  const earnedCommission = Math.round(totalMrrInScope * ((authenticatedUser?.commissionRate || 20) / 100));

  // Handle Prospect Creation
  const handleAddNewProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurant.trim() || !newContact.trim() || !newPhone.trim() || !authenticatedUser) return;

    const assignedId = isCurrentAdmin ? newAssignedCommId : authenticatedUser.id;
    const assignedComm = commercials.find((c) => c.id === assignedId);

    const newEntry: ProspectItem = {
      id: `p-${Date.now()}`,
      restaurantName: newRestaurant,
      contactName: newContact,
      phone: newPhone,
      city: newCity,
      status: 'contacte',
      tablesCount: Number(newTables),
      lastContactDate: new Date().toLocaleDateString('fr-FR'),
      nextActionDate: new Date(Date.now() + 2 * 86400000).toLocaleDateString('fr-FR'),
      nextActionNote: 'Envoyer la présentation WhatsApp et proposer une démo sur place',
      interestPlan: newPlan,
      assignedCommercialId: assignedId,
      assignedCommercialName: assignedComm ? assignedComm.name : 'Non assigné',
      notes: newNotes || 'Prospect ajouté lors de la prospection terrain.',
      priority: 'haute'
    };

    setProspects([newEntry, ...prospects]);
    setSelectedProspect(newEntry);
    setIsAddingProspect(false);
    setNewRestaurant('');
    setNewContact('');
    setNewPhone('');
    setNewNotes('');
  };

  // Handle Commercial Account Creation by Admin
  const handleAddNewCommercial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim() || !newCommEmail.trim()) return;

    const slug = newCommName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const directToken = `tok_${slug}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newAgent: CommercialAgent = {
      id: `comm-${Date.now()}`,
      name: newCommName,
      email: newCommEmail,
      phone: newCommPhone,
      zone: newCommZone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'commercial',
      targetClients: Number(newCommTarget),
      commissionRate: Number(newCommRate),
      accessPin: newCommPin || '1234',
      slug,
      directToken
    };

    setCommercials([...commercials, newAgent]);
    setIsAddingCommercial(false);
    setNewCommName('');
    setNewCommEmail('');
    setNewCommPhone('+221 7');
  };

  // Reassign Prospect to another commercial (Admin feature)
  const handleReassignProspect = (prospectId: string, targetCommercialId: string) => {
    const targetAgent = commercials.find((c) => c.id === targetCommercialId);
    const updated = prospects.map((p) => {
      if (p.id === prospectId) {
        return {
          ...p,
          assignedCommercialId: targetCommercialId,
          assignedCommercialName: targetAgent ? targetAgent.name : 'Non assigné'
        };
      }
      return p;
    });
    setProspects(updated);
    if (selectedProspect && selectedProspect.id === prospectId) {
      setSelectedProspect({
        ...selectedProspect,
        assignedCommercialId: targetCommercialId,
        assignedCommercialName: targetAgent ? targetAgent.name : 'Non assigné'
      });
    }
  };

  // Update Status
  const handleUpdateStatus = (id: string, newStatus: ProspectItem['status']) => {
    const updated = prospects.map((p) => p.id === id ? { ...p, status: newStatus } : p);
    setProspects(updated);
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect({ ...selectedProspect, status: newStatus });
    }
  };

  const getStatusBadge = (status: ProspectItem['status']) => {
    switch (status) {
      case 'gagne':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Client Actif</span>;
      case 'en_negociation':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">⚡ En Négociation</span>;
      case 'a_relancer':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">⏳ À Relancer</span>;
      case 'contacte':
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full">💬 Contacté</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-7xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        
        {/* ========================================================================= */}
        {/* VIEW 1: AUTHENTICATION PORTAL (IF NOT LOGGED IN)                           */}
        {/* ========================================================================= */}
        {!authenticatedUser ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
            
            {/* Left side: Brand & Info */}
            <div className="w-full md:w-5/12 bg-[#111827] text-white p-6 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-800">
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="p-2 bg-white/10 rounded-2xl border border-white/10 shrink-0">
                    <OfficialLogo variant="icon-only" size="sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading font-black text-xl text-white">Espace Terrain & CRM</h2>
                      <span className="bg-[#00A86B] text-white text-[9px] font-black px-2 py-0.5 rounded">SÉNÉGAL</span>
                    </div>
                    <p className="text-xs text-gray-400">Lou Ame Tay ? • Portail Commercial</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-gray-300">
                  <p className="leading-relaxed">
                    Bienvenue sur le portail commercial officiel de <strong>Lou Ame Tay ?</strong> (édité par <strong>Médias Graphisme Sénégal</strong>). Chaque agent terrain accède de manière isolée à son portefeuille de restaurants et à ses outils de prospection.
                  </p>

                  <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Smartphone className="w-4 h-4 text-[#00A86B]" />
                      <span>Modes de connexion disponibles :</span>
                    </div>
                    <ul className="space-y-1.5 text-gray-400 pl-4 list-disc">
                      <li>Sélection du profil + saisie du Code PIN (4 chiffres).</li>
                      <li>Lien direct sécurisé WhatsApp généré par l'administrateur.</li>
                      <li>Raccourci clavier secret : <code className="text-white font-mono bg-gray-800 px-1.5 py-0.5 rounded">Ctrl + Shift + A</code></li>
                    </ul>
                    <div className="pt-2 border-t border-gray-800 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>Inclus : Guide Commercial, Scripts Wolof & Bon de Commande 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Test Selector */}
              <div className="pt-6 border-t border-gray-800 mt-6">
                <span className="text-[11px] text-gray-400 block mb-2 font-bold uppercase tracking-wider">
                  ⚡ Connexion Rapide Démo (1-clic) :
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {commercials.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleQuickDemoLogin(agent)}
                      className="text-left p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-200 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate">
                        <span className="font-bold block truncate">{agent.name}</span>
                        <span className="text-[10px] text-gray-400 block truncate">{agent.role === 'admin' ? 'Super Admin' : agent.zone.split(' ')[0]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Login Form */}
            <div className="w-full md:w-7/12 p-6 sm:p-12 flex flex-col justify-center bg-white">
              <div className="max-w-md w-full mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-black text-2xl text-gray-900">Connexion Agent</h3>
                    <p className="text-xs text-gray-500 mt-1">Identifiez-vous pour ouvrir votre portefeuille</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Sélectionnez votre compte :
                    </label>
                    <select
                      value={selectedAgentForLogin}
                      onChange={(e) => {
                        setSelectedAgentForLogin(e.target.value);
                        setLoginError(null);
                      }}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#00A86B] focus:outline-none"
                    >
                      <option value="admin-1">👑 Super Administrateur (Direction Lou Ame Tay)</option>
                      <optgroup label="Agents Commerciaux Terrain">
                        {commercials.filter(c => c.role === 'commercial').map((c) => (
                          <option key={c.id} value={c.id}>
                            👤 {c.name} — {c.zone}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-800">
                        Code PIN de sécurité (4 chiffres) :
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPinHelp(!showPinHelp)}
                        className="text-[11px] text-[#00A86B] hover:underline font-bold"
                      >
                        {showPinHelp ? 'Masquer aide' : 'Code PIN oublié ?'}
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        maxLength={6}
                        required
                        placeholder="••••"
                        value={inputPin}
                        onChange={(e) => setInputPin(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-base tracking-widest font-mono text-gray-900 focus:ring-2 focus:ring-[#00A86B] focus:outline-none"
                      />
                    </div>

                    {showPinHelp && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 space-y-1">
                        <p className="font-bold">🔑 Codes PIN par défaut pour la démo :</p>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-700">
                          {commercials.map(c => (
                            <div key={c.id}>• {c.name.split(' ')[0]} : <strong>{c.accessPin}</strong></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#00A86B] hover:bg-[#00925d] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Ouvrir mon Tableau de Bord CRM</span>
                  </button>
                </form>

              </div>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: AUTHENTICATED DASHBOARD (LOGGED IN USER)                          */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Top Bar with User Badge & Logout */}
            <div className="bg-[#111827] text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-gray-800">
              
              {/* Logo & Agent Profile */}
              <div className="flex items-center gap-3.5">
                <div className="hidden sm:block p-1 bg-white/10 rounded-xl border border-white/10 shrink-0">
                  <OfficialLogo variant="icon-only" size="xs" />
                </div>
                <img 
                  src={authenticatedUser.avatar} 
                  alt={authenticatedUser.name}
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-[#00A86B] shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                      {authenticatedUser.name}
                    </h3>
                    {isCurrentAdmin ? (
                      <span className="bg-purple-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                        SUPER ADMIN
                      </span>
                    ) : (
                      <span className="bg-[#00A86B] text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                        COMMERCIAL TERRAIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    📍 {authenticatedUser.zone} • {authenticatedUser.phone}
                  </p>
                </div>
              </div>

              {/* Right Action: Direct link copy & Logout */}
              <div className="flex items-center gap-2.5 self-end md:self-auto">
                <button
                  onClick={() => handleCopyDirectLink(authenticatedUser)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Copier mon lien direct sécurisé"
                >
                  {copiedLinkForAgentId === authenticatedUser.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00A86B]" />
                      <span className="text-[#00A86B]">Lien copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                      <span className="hidden sm:inline">Mon Lien Direct</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Fermer le CRM"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Sub Header: Navigation & KPIs */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Navigation Tabs (Admin has Team tab, all users have Pipeline and Guide Commercial) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activeTab === 'pipeline' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 inline mr-1 text-[#00A86B]" />
                    {isCurrentAdmin ? 'Pipeline & Attribution' : `Portefeuille (${visibleProspects.length})`}
                  </button>

                  <button
                    onClick={() => setActiveTab('guide')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activeTab === 'guide' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 inline mr-1 text-[#00A86B]" />
                    Guide & Scripts Terrain
                  </button>

                  {isCurrentAdmin && (
                    <button
                      onClick={() => setActiveTab('team')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        activeTab === 'team' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 inline mr-1 text-[#FF6B00]" />
                      Gestion Commerciaux ({commercials.filter(c => c.role === 'commercial').length})
                    </button>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px]">
                    {isCurrentAdmin ? 'Total Clients Gagnés' : 'Objectif Personnel'}
                  </span>
                  <span className="font-heading font-black text-gray-900">
                    {isCurrentAdmin 
                      ? `${wonCount} restaurants actifs` 
                      : `${wonCount} / ${authenticatedUser.targetClients} restaurants (${Math.round((wonCount / (authenticatedUser.targetClients || 1)) * 100)}%)`}
                  </span>
                </div>

                <div className="text-right pl-3 border-l border-gray-200">
                  <span className="text-gray-500 block text-[10px]">
                    {isCurrentAdmin ? 'MRR Total National' : 'Mes Commissions du mois (20%)'}
                  </span>
                  <span className="font-heading font-black text-[#00A86B]">
                    {isCurrentAdmin 
                      ? `${totalMrrInScope.toLocaleString('fr-FR')} FCFA/mois`
                      : `${earnedCommission.toLocaleString('fr-FR')} FCFA`}
                  </span>
                </div>
              </div>

            </div>

            {/* TAB 1: PIPELINE & PROSPECTS VIEW */}
            {activeTab === 'pipeline' && (
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* Left Column: Prospects List */}
                <div className="w-full lg:w-5/12 border-r border-gray-200 flex flex-col h-full bg-[#FAFAFA]">
                  
                  {/* Search & Actions Bar */}
                  <div className="p-3 sm:p-4 border-b border-gray-200 space-y-2 bg-white">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Chercher restaurant, ville, gérant..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#00A86B]"
                        />
                      </div>
                      
                      <button
                        onClick={() => setIsAddingProspect(!isAddingProspect)}
                        className="bg-[#00A86B] hover:bg-[#00925d] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau</span>
                      </button>
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                      <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1">
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`px-2 py-1 rounded-lg font-bold cursor-pointer shrink-0 ${statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          Tous ({visibleProspects.length})
                        </button>
                        <button
                          onClick={() => setStatusFilter('gagne')}
                          className={`px-2 py-1 rounded-lg font-bold cursor-pointer shrink-0 ${statusFilter === 'gagne' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}
                        >
                          Gagnés ({wonCount})
                        </button>
                        <button
                          onClick={() => setStatusFilter('en_negociation')}
                          className={`px-2 py-1 rounded-lg font-bold cursor-pointer shrink-0 ${statusFilter === 'en_negociation' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}
                        >
                          Négo ({inNegotiationCount})
                        </button>
                        <button
                          onClick={() => setStatusFilter('a_relancer')}
                          className={`px-2 py-1 rounded-lg font-bold cursor-pointer shrink-0 ${statusFilter === 'a_relancer' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'}`}
                        >
                          Relances ({toFollowUpCount})
                        </button>
                      </div>

                      {/* Admin filter by agent */}
                      {isCurrentAdmin && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <span>Agent :</span>
                          <select
                            value={adminCommercialFilter}
                            onChange={(e) => setAdminCommercialFilter(e.target.value)}
                            className="bg-gray-100 font-bold border border-gray-300 rounded-md p-1 text-[11px] text-gray-800 cursor-pointer"
                          >
                            <option value="all">Tous ({prospects.length})</option>
                            {commercials.filter(c => c.role === 'commercial').map((comm) => (
                              <option key={comm.id} value={comm.id}>
                                {comm.name} ({prospects.filter(p => p.assignedCommercialId === comm.id).length})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Prospect Form */}
                  {isAddingProspect && (
                    <form onSubmit={handleAddNewProspect} className="p-4 bg-emerald-50/80 border-b border-green-200 space-y-2.5 text-xs animate-in slide-in-from-top-2">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span className="flex items-center gap-1.5 text-emerald-900">
                          <Plus className="w-4 h-4 text-[#00A86B]" />
                          Nouveau restaurant prospect terrain
                        </span>
                        <button type="button" onClick={() => setIsAddingProspect(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Nom du Restaurant *"
                          value={newRestaurant}
                          onChange={(e) => setNewRestaurant(e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg p-2 text-xs"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Nom du Gérant / Contact *"
                          value={newContact}
                          onChange={(e) => setNewContact(e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Téléphone (+221...) *"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg p-2 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Ville / Quartier"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-[11px]">Formule :</span>
                          <select
                            value={newPlan}
                            onChange={(e) => setNewPlan(e.target.value as any)}
                            className="bg-white border border-gray-300 rounded-lg p-1 text-xs font-bold flex-1"
                          >
                            <option value="premium">Premium (25k)</option>
                            <option value="essentielle">Essentielle (15k)</option>
                          </select>
                        </div>

                        {isCurrentAdmin && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 text-[11px]">Assigner à :</span>
                            <select
                              value={newAssignedCommId}
                              onChange={(e) => setNewAssignedCommId(e.target.value)}
                              className="bg-white border border-gray-300 rounded-lg p-1 text-xs font-bold flex-1"
                            >
                              {commercials.filter(c => c.role === 'commercial').map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingProspect(false)}
                          className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-xs font-medium"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="bg-[#00A86B] hover:bg-[#00925d] text-white px-4 py-1.5 rounded-lg font-bold shadow-xs cursor-pointer"
                        >
                          Enregistrer dans le CRM
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Prospects Cards List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {visibleProspects.length === 0 ? (
                      <div className="text-center py-12 px-4 text-gray-500 text-xs">
                        <Briefcase className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="font-bold text-gray-700">Aucun prospect trouvé</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {isCurrentAdmin 
                            ? 'Essayez de changer les filtres ou ajoutez un nouveau prospect.'
                            : 'L\'administrateur ne vous a pas encore assigné de prospect dans cette catégorie.'}
                        </p>
                      </div>
                    ) : (
                      visibleProspects.map((prospect) => {
                        const isSelected = currentSelected?.id === prospect.id;
                        return (
                          <button
                            key={prospect.id}
                            onClick={() => setSelectedProspect(prospect)}
                            className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white border-[#00A86B] shadow-md ring-2 ring-[#00A86B]/15'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="font-heading font-extrabold text-sm text-gray-900 truncate">
                                {prospect.restaurantName}
                              </h4>
                              {getStatusBadge(prospect.status)}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {prospect.city}
                              </span>
                              <span className="font-bold text-gray-800">
                                {prospect.interestPlan === 'premium' ? '25 000 FCFA' : '15 000 FCFA'}
                              </span>
                            </div>

                            {/* Assigned Commercial Tag (Admin View) */}
                            {isCurrentAdmin && prospect.assignedCommercialName && (
                              <div className="mb-2 flex items-center justify-between text-[10px] bg-purple-50 text-purple-900 border border-purple-100 px-2 py-0.5 rounded-md">
                                <span className="flex items-center gap-1">
                                  <UserCheck className="w-3 h-3 text-purple-600" />
                                  Assigné à : <strong>{prospect.assignedCommercialName}</strong>
                                </span>
                              </div>
                            )}

                            <div className="text-[11px] bg-gray-50 rounded-lg p-2 text-gray-600 border border-gray-100 flex items-start gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{prospect.nextActionNote}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* Right Column: Detailed Prospect View & 1-Click WhatsApp Pitch */}
                <div className="w-full lg:w-7/12 flex flex-col h-full bg-white overflow-y-auto p-5 sm:p-7">
                  {currentSelected ? (
                    <div className="space-y-6">
                      
                      {/* Prospect Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-heading font-black text-2xl text-gray-900">
                              {currentSelected.restaurantName}
                            </h3>
                            {getStatusBadge(currentSelected.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Contact : <strong>{currentSelected.contactName}</strong> • {currentSelected.city} • {currentSelected.tablesCount} tables
                          </p>
                        </div>

                        {/* Status Changer */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Statut :</span>
                          <select
                            value={currentSelected.status}
                            onChange={(e) => handleUpdateStatus(currentSelected.id, e.target.value as any)}
                            className="bg-gray-100 border border-gray-300 font-bold text-xs rounded-xl px-3 py-2 text-gray-900 cursor-pointer focus:outline-none"
                          >
                            <option value="contacte">💬 Contacté</option>
                            <option value="en_negociation">⚡ En Négociation</option>
                            <option value="a_relancer">⏳ À Relancer</option>
                            <option value="gagne">✓ Gagné (Client Actif)</option>
                          </select>
                        </div>
                      </div>

                      {/* Admin Reassignment Tool */}
                      {isCurrentAdmin && (
                        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4 text-purple-600 shrink-0" />
                            <div>
                              <span className="font-bold text-purple-950 block">Attribution Commerciale</span>
                              <span className="text-purple-800 text-[11px]">
                                Attribué à : <strong>{currentSelected.assignedCommercialName || 'Non attribué'}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-600">Transférer à :</span>
                            <select
                              value={currentSelected.assignedCommercialId || ''}
                              onChange={(e) => handleReassignProspect(currentSelected.id, e.target.value)}
                              className="bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-950 cursor-pointer focus:outline-none"
                            >
                              {commercials.filter(c => c.role === 'commercial').map((c) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.zone})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Key Info Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <span className="text-[11px] text-gray-500 block">Téléphone / WhatsApp</span>
                          <span className="font-bold text-xs text-gray-900">{currentSelected.phone}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <span className="text-[11px] text-gray-500 block">Formule Visée</span>
                          <span className="font-bold text-xs text-[#00A86B]">
                            {currentSelected.interestPlan === 'premium' ? 'Offre Premium (25k)' : 'Offre Essentielle (15k)'}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <span className="text-[11px] text-gray-500 block">Dernier Contact</span>
                          <span className="font-bold text-xs text-gray-900">{currentSelected.lastContactDate}</span>
                        </div>
                      </div>

                      {/* Meeting & Notes Box */}
                      <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-orange-950 uppercase tracking-wider">
                              Prochaine Action prévue le {currentSelected.nextActionDate}
                            </span>
                            <span className="text-[10px] text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded font-bold">
                              Priorité {currentSelected.priority || 'Haute'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-800 mt-1 leading-relaxed">
                            {currentSelected.nextActionNote}
                          </p>
                          {currentSelected.notes && (
                            <p className="text-[11px] text-gray-600 mt-2 pt-2 border-t border-orange-200/60 italic">
                              Notes terrain : {currentSelected.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ready-to-Send WhatsApp Pitch Message */}
                      <div className="p-5 rounded-2xl bg-[#EFEAE2] border border-[#d1c7b8] space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-700 pb-1 border-b border-black/10">
                          <span className="font-bold flex items-center gap-1.5 text-gray-900">
                            <MessageSquare className="w-4 h-4 text-[#25D366]" />
                            Script WhatsApp Terrain Personnalisé
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Signé : {authenticatedUser.name}
                          </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-xs text-xs text-gray-900 leading-relaxed border border-black/5 whitespace-pre-line font-mono">
                          {`Bonjour ${currentSelected.contactName} ! C'est ${authenticatedUser.name} de Lou Ame Tay. 

On a vu le succès de votre restaurant ${currentSelected.restaurantName} à ${currentSelected.city}. Pour vous aider à éliminer les erreurs de commandes aux tables et booster votre ticket moyen, on vous propose d'installer nos QR codes de table gratuitement pendant 14 jours.

Si vous avez 10 minutes aujourd'hui, je peux passer directement à votre restaurant vous faire une démonstration en direct avec votre équipe ! Qu'en pensez-vous ?`}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <a
                            href={`https://wa.me/${currentSelected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Bonjour ${currentSelected.contactName} ! C'est ${authenticatedUser.name} de Lou Ame Tay. On a vu le succès de votre restaurant ${currentSelected.restaurantName} à ${currentSelected.city}. Pour vous aider à éliminer les erreurs de commandes aux tables et booster votre ticket moyen, on vous propose d'installer nos QR codes de table gratuitement pendant 14 jours. Si vous avez 10 minutes aujourd'hui, je peux passer directement à votre restaurant pour une démo en direct !`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                            <span>Envoyer le Message WhatsApp ({currentSelected.contactName})</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                      Sélectionnez un prospect dans la liste de gauche pour voir sa fiche détaillée.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: GUIDE COMMERCIAL & SCRIPTS TERRAIN (AVAILABLE TO ALL LOGGED-IN USERS) */}
            {activeTab === 'guide' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA]">
                
                {/* Subnav for Guide */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                      onClick={() => setGuideSubTab('pitch')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        guideSubTab === 'pitch' ? 'bg-[#00A86B] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Pitch Terrain (3 Étapes)</span>
                    </button>

                    <button
                      onClick={() => setGuideSubTab('objections')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        guideSubTab === 'objections' ? 'bg-[#00A86B] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Traitement des 4 Objections</span>
                    </button>

                    <button
                      onClick={() => setGuideSubTab('tarifs')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        guideSubTab === 'tarifs' ? 'bg-[#00A86B] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Offres & Pack 50 000 F</span>
                    </button>

                    <button
                      onClick={() => setGuideSubTab('contrat')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        guideSubTab === 'contrat' ? 'bg-[#00A86B] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Bon de Commande & Checklist</span>
                    </button>
                  </div>

                  {(guideSubTab === 'pitch' || guideSubTab === 'objections') && (
                    <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 p-1 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-400 px-1.5">Langue :</span>
                      <button
                        onClick={() => setGuideLanguage('fr')}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          guideLanguage === 'fr' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🇫🇷 Français
                      </button>
                      <button
                        onClick={() => setGuideLanguage('wo')}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          guideLanguage === 'wo' ? 'bg-[#00A86B] text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🇸🇳 Wolof
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtab Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {guideSubTab === 'pitch' && (
                    <div className="max-w-4xl mx-auto space-y-5">
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-[#00A86B] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-heading font-black text-sm text-emerald-950">
                            Le Script de Prospection Terrain (Le Pitch Gagnant en moins de 4 minutes)
                          </h4>
                          <p className="text-xs text-emerald-800 mt-1">
                            À utiliser lors de vos visites physiques dans les restaurants de votre secteur pour décrocher l'accord immédiat du gérant.
                          </p>
                        </div>
                      </div>

                      {SALES_PITCH_STEPS.map((step) => {
                        const currentScript = guideLanguage === 'wo' && step.wolofScript ? step.wolofScript : step.frenchScript;
                        return (
                          <div key={step.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-xl bg-[#00A86B] text-white flex items-center justify-center font-black text-xs">
                                  {step.stepNumber}
                                </span>
                                <div>
                                  <h4 className="font-heading font-black text-sm text-gray-900">{step.title}</h4>
                                  <span className="text-[11px] text-gray-500">{step.objective}</span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 self-start sm:self-auto">
                                ⏱️ {step.duration}
                              </span>
                            </div>

                            <div className="mt-3 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-700">
                              <strong>Action terrain :</strong> {step.action}
                            </div>

                            <div className="mt-3 p-3.5 rounded-xl bg-gray-900 text-gray-100 text-xs font-mono whitespace-pre-line leading-relaxed">
                              {currentScript}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                              {step.tips.map((tip, idx) => (
                                <span key={idx} className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-100">
                                  💡 {tip}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {guideSubTab === 'objections' && (
                    <div className="max-w-4xl mx-auto space-y-5">
                      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-heading font-black text-sm text-blue-950">
                            Guide Stratégique du Traitement des Objections Clients
                          </h4>
                          <p className="text-xs text-blue-800 mt-1">
                            Réponses professionnelles pour lever les doutes sur le papier, la connexion internet ou le coût mensuel.
                          </p>
                        </div>
                      </div>

                      {OBJECTION_HANDLERS.map((obj, index) => {
                        const currentResponse = guideLanguage === 'wo' && obj.responseWolof ? obj.responseWolof : obj.responseFr;
                        return (
                          <div key={obj.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                                #{index + 1}
                              </span>
                              <div>
                                <h4 className="font-heading font-black text-sm text-gray-900">{obj.objection}</h4>
                                <span className="text-[11px] text-gray-500 italic block mt-0.5">{obj.context}</span>
                              </div>
                            </div>

                            <div className="mt-3.5 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs sm:text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                              <span className="font-bold text-[#00A86B] block text-[11px] uppercase mb-1.5">
                                Réponse Recommandée ({guideLanguage === 'wo' ? 'Wolof' : 'Français'}) :
                              </span>
                              {currentResponse}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-700">
                              {obj.keyArguments.map((arg, aIdx) => (
                                <span key={aIdx} className="bg-gray-100 px-2 py-0.5 rounded-md">
                                  ✓ {arg}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {guideSubTab === 'tarifs' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-[#00A86B] text-white px-2.5 py-0.5 rounded-full">
                            Prestation Initiale
                          </span>
                          <h4 className="font-heading font-black text-lg text-gray-900 mt-1">
                            {OFFICIAL_INSTALLATION_PACK.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Configuration complète, saisie du menu, 15-25 supports de table rigides/stickers et formation de 30 min.
                          </p>
                        </div>
                        <div className="text-right bg-white p-3 rounded-xl border border-emerald-200 shrink-0">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">Tarif Unique</span>
                          <span className="font-heading font-black text-2xl text-[#00A86B]">50 000</span>
                          <span className="text-xs font-bold text-gray-900 ml-1">FCFA</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {OFFICIAL_OFFERS.map((offer) => (
                          <div key={offer.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div>
                              {offer.recommended && (
                                <span className="text-[9px] font-black uppercase bg-[#00A86B] text-white px-2 py-0.5 rounded-md inline-block mb-1.5">
                                  Recommandée
                                </span>
                              )}
                              <h5 className="font-heading font-black text-sm text-gray-900">{offer.name}</h5>
                              <p className="text-[11px] text-gray-500 mt-1 min-h-[30px]">{offer.targetAudience}</p>
                              
                              <div className="my-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="font-heading font-black text-lg text-gray-900">{offer.monthlyPrice.toLocaleString('fr-FR')}</span>
                                <span className="text-xs font-bold text-[#00A86B] ml-1">FCFA/mois</span>
                                <span className="text-[10px] text-gray-500 block mt-0.5">ou {offer.annualPrice.toLocaleString('fr-FR')} FCFA/an (2 mois offerts)</span>
                              </div>

                              <div className="space-y-1.5 text-[11px] text-gray-700">
                                {offer.keyFeatures.map((feat, fIdx) => (
                                  <div key={fIdx} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-[#00A86B] shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {guideSubTab === 'contrat' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                        <div>
                          <h4 className="font-heading font-black text-sm text-gray-900">
                            Modèle de Bon de Commande Officiel & Checklist Transmission 48h
                          </h4>
                          <p className="text-xs text-gray-500">
                            Fiche d'inscription contractuelle pour valider la souscription du restaurant.
                          </p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#00A86B]" />
                          <span>Imprimer Fiche</span>
                        </button>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-gray-300 text-xs text-gray-800 space-y-4 font-sans">
                        <div className="border-b pb-3">
                          <span className="font-heading font-black text-lg text-[#00A86B] block">LOU AME TAY ?</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                            Édité par MÉDIAS GRAPHISME SÉNÉGAL • Liberté 6 Extension VDN, Dakar • Tél : +221 77 458 74 74 / +221 77 130 36 78
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                          <div>• Enseigne : _____________________________</div>
                          <div>• NINEA / Registre : _______________________</div>
                          <div>• Ville / Quartier : ________________________</div>
                          <div>• Gérant : _________________________________</div>
                          <div>• Téléphone / Wave : _______________________</div>
                          <div>• Formule : [ ] Starter [ ] Pro [ ] Premium</div>
                          <div>• Frais d'installation : <strong>50 000 FCFA</strong></div>
                          <div>• Acompte versé : __________________ FCFA</div>
                        </div>

                        <div className="pt-2 border-t flex justify-between text-[11px] text-gray-500">
                          <span>Signature Restaurant (« Bon pour Accord »)</span>
                          <span>Signature Médias Graphisme Sénégal</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
                        <h5 className="font-bold text-amber-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-700" />
                          Checklist post-signature pour livraison sous 48h :
                        </h5>
                        {CONTRACT_ORDER_FORM_FIELDS.checklistItems.map((item, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-amber-200/60 text-gray-800">
                            • {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: TEAM MANAGEMENT & DIRECT LINKS (ADMIN ONLY) */}
            {activeTab === 'team' && isCurrentAdmin && (
              <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] space-y-6">
                
                {/* Top Bar for Team Tab */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-black text-xl text-gray-900">
                      Gestion des Comptes Commerciaux & Liens Directs
                    </h3>
                    <p className="text-xs text-gray-500">
                      Créez des accès pour vos commerciaux, définissez leur PIN et envoyez-leur leur lien de connexion direct par WhatsApp.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingCommercial(!isAddingCommercial)}
                    className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer un Nouveau Commercial</span>
                  </button>
                </div>

                {/* New Commercial Form */}
                {isAddingCommercial && (
                  <form onSubmit={handleAddNewCommercial} className="p-6 bg-white rounded-2xl border border-orange-200 shadow-md space-y-4 text-xs animate-in slide-in-from-top-3">
                    <div className="flex items-center justify-between font-bold text-gray-900 border-b border-gray-100 pb-3">
                      <span className="flex items-center gap-2 text-sm text-[#FF6B00]">
                        <UserPlus className="w-5 h-5" />
                        Création d'un Nouveau Compte Commercial Terrain
                      </span>
                      <button type="button" onClick={() => setIsAddingCommercial(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Nom complet du commercial *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Modou Fall"
                          value={newCommName}
                          onChange={(e) => setNewCommName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Adresse Email professionnelle *</label>
                        <input
                          type="email"
                          required
                          placeholder="modou.fall@louametay.sn"
                          value={newCommEmail}
                          onChange={(e) => setNewCommEmail(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Numéro WhatsApp / Téléphone *</label>
                        <input
                          type="text"
                          required
                          placeholder="+221 77..."
                          value={newCommPhone}
                          onChange={(e) => setNewCommPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Zone géographique exclusive</label>
                        <input
                          type="text"
                          placeholder="Ex: Thiès (Dixième, Randoulène, Centre)"
                          value={newCommZone}
                          onChange={(e) => setNewCommZone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Code PIN (4 chiffres)</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Ex: 7721"
                          value={newCommPin}
                          onChange={(e) => setNewCommPin(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Taux de Commission (%)</label>
                        <input
                          type="number"
                          min="5"
                          max="50"
                          value={newCommRate}
                          onChange={(e) => setNewCommRate(Number(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsAddingCommercial(false)}
                        className="px-4 py-2 text-gray-600 font-bold"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="bg-[#00A86B] hover:bg-[#00925d] text-white px-5 py-2.5 rounded-xl font-bold shadow-md cursor-pointer"
                      >
                        Créer le Compte & Générer l'Accès Direct
                      </button>
                    </div>
                  </form>
                )}

                {/* Commercials Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-gray-800 uppercase tracking-wider">
                      Commerciaux Actifs & Liens d'Accès Sécurisés
                    </span>
                    <span className="text-xs text-gray-500">
                      {commercials.filter(c => c.role === 'commercial').length} agents en activité
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {commercials.filter(c => c.role === 'commercial').map((agent) => {
                      const agentProspects = prospects.filter(p => p.assignedCommercialId === agent.id);
                      const agentWon = agentProspects.filter(p => p.status === 'gagne').length;
                      const agentMrr = agentProspects
                        .filter(p => p.status === 'gagne')
                        .reduce((sum, p) => sum + (p.interestPlan === 'premium' ? 25000 : 15000), 0);
                      const agentCommission = Math.round(agentMrr * (agent.commissionRate / 100));

                      return (
                        <div key={agent.id} className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                          
                          {/* Agent Profile & PIN */}
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={agent.avatar} 
                              alt={agent.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-xs" 
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-heading font-extrabold text-sm text-gray-900">
                                  {agent.name}
                                </h4>
                                <span className="bg-emerald-50 text-[#00A86B] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                  {agent.commissionRate}% comm.
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-gray-200">
                                  PIN : {agent.accessPin || '7721'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {agent.email} • {agent.phone}
                              </p>
                              <p className="text-[11px] text-gray-600 mt-0.5">
                                📍 Zone : <strong>{agent.zone}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-3 gap-4 text-center xl:text-right border-t xl:border-t-0 pt-3 xl:pt-0 border-gray-100">
                            <div>
                              <span className="text-[10px] text-gray-400 block">Prospects Attribués</span>
                              <span className="font-heading font-black text-sm text-gray-900">
                                {agentProspects.length} restos
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block">Convertis / Objectif</span>
                              <span className="font-heading font-black text-sm text-emerald-600">
                                {agentWon} / {agent.targetClients}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block">Commission Due</span>
                              <span className="font-heading font-black text-sm text-gray-900">
                                {agentCommission.toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>
                          </div>

                          {/* Direct Actions: Copy Link, Send WhatsApp, Impersonate */}
                          <div className="flex items-center gap-2 self-end xl:self-auto pt-2 xl:pt-0">
                            <button
                              onClick={() => handleCopyDirectLink(agent)}
                              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                              title="Copier le lien direct du commercial"
                            >
                              {copiedLinkForAgentId === agent.id ? (
                                <Check className="w-4 h-4 text-[#00A86B]" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="text-[11px]">{copiedLinkForAgentId === agent.id ? 'Copié !' : 'Lien'}</span>
                            </button>

                            <button
                              onClick={() => handleSendWhatsAppAccess(agent)}
                              className="p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                              title="Envoyer les accès par WhatsApp au commercial"
                            >
                              <Send className="w-4 h-4" />
                              <span className="text-[11px]">WhatsApp</span>
                            </button>

                            <button
                              onClick={() => {
                                setAuthenticatedUser(agent);
                                setActiveTab('pipeline');
                                setSelectedProspect(null);
                              }}
                              className="bg-gray-900 hover:bg-[#00A86B] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>Ouvrir son espace</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
