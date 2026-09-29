import re

with open('src/components/cashier/CashierCart.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'onSubmit: (paymentMethod: string, customerName: string) => Promise<void>;',
    "onSubmit: (paymentMethod: string, customerName: string, isPaidLater: boolean, tableNumber: number) => Promise<void>;"
)

state_inj = """
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WAVE' | 'ORANGE_MONEY'>('CASH');
  const [orderMode, setOrderMode] = useState<'COMPTOIR' | 'TABLE'>('COMPTOIR');
  const [tableNumber, setTableNumber] = useState<string>('');
"""
c = c.replace(
    """  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WAVE' | 'ORANGE_MONEY'>('CASH');""",
    state_inj
)

submit_logic = """
  const handleSubmit = async () => {
    if (items.length === 0) return;
    const isPaidLater = orderMode === 'TABLE';
    const finalTable = isPaidLater ? (parseInt(tableNumber) || 0) : 0;
    const finalName = customerName || (isPaidLater ? `Table ${finalTable}` : 'Client Comptoir');
    await onSubmit(paymentMethod, finalName, isPaidLater, finalTable);
    setCustomerName('');
    setTableNumber('');
  };
"""
c = c.replace(
    """  const handleSubmit = async () => {
    if (items.length === 0) return;
    await onSubmit(paymentMethod, customerName || 'Client Comptoir');
    setCustomerName('');
  };""",
    submit_logic
)

name_input = """      {/* Nom du client ou Table */}
      <div className="p-3 border-b border-slate-100 shrink-0 space-y-2">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setOrderMode('COMPTOIR')}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md ${orderMode === 'COMPTOIR' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            COMPTOIR
          </button>
          <button 
            onClick={() => setOrderMode('TABLE')}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md ${orderMode === 'TABLE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            SUR PLACE
          </button>
        </div>
        
        <div className="flex gap-2">
          {orderMode === 'TABLE' && (
            <input
              type="number"
              placeholder="N° Table"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 font-bold"
            />
          )}
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nom du client (facultatif)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 transition-all"
            />
          </div>
        </div>
      </div>"""

c = c.replace("""      {/* Nom du client */}
      <div className="p-3 border-b border-slate-100 shrink-0">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Nom du client (facultatif)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 transition-all"
          />
        </div>
      </div>""", name_input)


zone_enc = """      {/* Zone d'Encaissement */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">{formatFCFA(total)}</span>
        </div>

        {orderMode === 'COMPTOIR' ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">Espèces</span>
              </button>
              <button
                onClick={() => setPaymentMethod('WAVE')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  paymentMethod === 'WAVE' ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">Wave</span>
              </button>
              <button
                onClick={() => setPaymentMethod('ORANGE_MONEY')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  paymentMethod === 'ORANGE_MONEY' ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">Orange M.</span>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Encaissement...</span>
              ) : (
                <>
                  <Check className="w-6 h-6" /> ENCAISSER
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Envoi Cuisine...</span>
            ) : (
              <>
                ENVOYER CUISINE (À PAYER)
              </>
            )}
          </button>
        )}
      </div>"""

# Need to accurately replace the whole zone, including the "Espèces" typo. I'll just use regex to replace everything from "Zone d'Encaissement" to the end.
c = re.sub(r'\{\/\* Zone d\'Encaissement \*\/}.*', zone_enc + '\n    </div>\n  );\n}\n\nconst ShoppingBag = ({ className }: { className?: string }) => (\n  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>\n    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />\n  </svg>\n);\n', c, flags=re.DOTALL)

with open('src/components/cashier/CashierCart.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

