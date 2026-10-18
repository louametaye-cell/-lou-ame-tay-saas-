'use client';

import React from 'react';
import { 
  X, 
  Receipt, 
  Clock, 
  User, 
  CreditCard, 
  Printer, 
  MessageCircle, 
  CheckCircle2, 
  AlertTriangle,
  UtensilsCrossed,
  MapPin,
  Tag,
  Trash2
} from 'lucide-react';
import { OrderType } from '@/types';
import { formatFCFA } from '@/lib/utils';

interface OrderDetailModalProps {
  order: OrderType | null;
  isOpen: boolean;
  onClose: () => void;
  onPayOrder?: (order: OrderType) => void;
  onPrintReceipt?: (order: OrderType) => void;
  onSendWhatsApp?: (order: OrderType) => void;
  onCancelOrder?: (order: OrderType) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onPayOrder,
  onPrintReceipt,
  onSendWhatsApp,
  onCancelOrder
}) => {
  if (!isOpen || !order) return null;

  const isPaid = order.paymentStatus === 'PAID';
  const isStaffMeal = order.paymentMethod === 'STAFF_MEAL' || order.paymentStatus === 'STAFF_NP';
  const totalAmount = (order as any).totalAmount ?? order.total ?? 0;
  const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0;

  const tableLabel = order.locationDetail
    ? order.locationDetail
    : isExpress
    ? 'Comptoir Express'
    : `Table ${order.tableNumber}`;

  const orderTime = order.createdAt 
    ? new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 text-slate-900 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modale */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Commande #{order.id.slice(-5).toUpperCase()}
                </h3>
                {isStaffMeal ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                    Repas Personnel
                  </span>
                ) : isPaid ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Payée
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    À Encaisser
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {orderDate} à {orderTime} • {tableLabel}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Métadonnées Commande */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Emplacement</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {tableLabel}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Client / Employé</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {order.employeeName || order.customerName || 'Client en salle'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Règlement</span>
              <span className="font-mono font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {order.paymentMethod || 'Espèces'}
              </span>
            </div>
          </div>

          {/* Liste détaillée des consommations */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Détail des Consommations ({order.items?.length || 0} articles) :
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-12 px-3.5 py-2 bg-slate-100/70 font-bold text-slate-500 text-[11px]">
                <div className="col-span-6">Article</div>
                <div className="col-span-2 text-center">Qté</div>
                <div className="col-span-2 text-right">P.U.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {order.items?.map((item, idx) => {
                const itemPrice = Number(item.price) || 0;
                const itemQty = Number(item.quantity) || 1;
                const lineTotal = itemPrice * itemQty;

                return (
                  <div key={idx} className="grid grid-cols-12 px-3.5 py-2.5 items-center hover:bg-slate-50">
                    <div className="col-span-6 font-bold text-slate-900">
                      <div>{item.name}</div>
                      {item.options?.side && (
                        <div className="text-[10px] text-slate-500 font-normal">
                          &gt; Accompagnement : {item.options.side}
                        </div>
                      )}
                      {item.options?.spiceLevel && (
                        <div className="text-[10px] text-slate-500 font-normal">
                          &gt; Piment : {item.options.spiceLevel}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-amber-700 font-medium italic">
                          * Note : {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-center font-mono font-bold text-slate-700">
                      {itemQty}
                    </div>
                    <div className="col-span-2 text-right font-mono text-slate-500 text-[11px]">
                      {formatFCFA(itemPrice)}
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                      {formatFCFA(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Encart Total & Statut Financier */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Net TTC
              </span>
              <span className="text-2xl font-mono font-black text-amber-400">
                {formatFCFA(totalAmount)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-300 block">
                Statut : <strong className={isPaid ? 'text-emerald-400' : 'text-amber-400'}>
                  {isPaid ? 'Encaissé' : 'En attente de paiement'}
                </strong>
              </span>
              {order.transactionRef && (
                <span className="text-[10px] text-slate-400 font-mono block">
                  Réf : {order.transactionRef}
                </span>
              )}
            </div>
          </div>

          {/* Remarques / Instructions spéciales */}
          {(order.customerNote || order.note) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold block">Remarque client / service :</span>
              <p className="mt-0.5">{order.customerNote || order.note}</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2.5 flex-wrap">
          
          {/* Bouton d'encaissement si non réglé */}
          {!isPaid && onPayOrder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPayOrder(order);
              }}
              className="flex-1 py-3 px-4 min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Encaisser {formatFCFA(totalAmount)}</span>
            </button>
          )}

          {/* Bouton Impression Ticket 80mm */}
          {onPrintReceipt && (
            <button
              type="button"
              onClick={() => onPrintReceipt(order)}
              className="py-3 px-4 min-h-[46px] bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              title="Imprimer le ticket de caisse"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Ticket 80mm</span>
            </button>
          )}

          {/* Bouton Partage WhatsApp */}
          {onSendWhatsApp && (
            <button
              type="button"
              onClick={() => onSendWhatsApp(order)}
              className="py-3 px-4 min-h-[46px] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              title="Partager le ticket WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Bouton Annulation Conditionnelle */}
          {onCancelOrder && order.status !== 'CANCELLED' && !isPaid && !isStaffMeal && (
            order.status === 'PENDING' ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCancelOrder(order);
                }}
                className="py-3 px-3.5 min-h-[46px] bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Annuler la commande (En attente)"
              >
                <Trash2 className="w-4 h-4" />
                <span>Annuler</span>
              </button>
            ) : (order.status === 'PREPARING' || order.status === 'READY') ? (
              <button
                type="button"
                onClick={() => {
                  onCancelOrder(order);
                }}
                className="py-3 px-3.5 min-h-[46px] bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                title="Impossible d'annuler : la cuisine a déjà commencé la préparation. Contactez le gérant."
              >
                <Trash2 className="w-4 h-4" />
                <span className="line-through">Annuler</span>
              </button>
            ) : null
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 min-h-[46px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer ml-auto"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
