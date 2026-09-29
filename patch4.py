import re

with open('src/components/cashier/CashierPOS.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'const handleSubmitNewOrder = async (method: string, customerName: string) => {',
    'const handleSubmitNewOrder = async (method: string, customerName: string, isPaidLater: boolean = false, tableNumber: number = 0) => {'
)

# Only replace the specific body payload instance
c = c.replace(
    '''          cashierId: currentCashier?.id,
          cashSessionId: currentSession?.id,
          customerName
        })''',
    '''          cashierId: currentCashier?.id,
          cashSessionId: currentSession?.id,
          customerName,
          isPaidLater,
          tableNumber
        })'''
)

with open('src/components/cashier/CashierPOS.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
