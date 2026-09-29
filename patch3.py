with open('src/app/api/cashier/orders/route.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'const { tenantId, items, paymentMethod, cashierId, cashSessionId, customerName } = body;',
    'const { tenantId, items, paymentMethod, cashierId, cashSessionId, customerName, isPaidLater, tableNumber } = body;'
)

c = c.replace(
    "orderType: 'EXPRESS',",
    "orderType: isPaidLater ? 'TABLE' : 'EXPRESS',"
)

c = c.replace(
    "tableNumber: 0,",
    "tableNumber: isPaidLater ? (tableNumber || 0) : 0,"
)

c = c.replace(
    "locationDetail: 'COMPTOIR CAISSE',",
    "locationDetail: isPaidLater ? (tableNumber ? 'TABLE ' + tableNumber : 'SUR PLACE') : 'COMPTOIR CAISSE',"
)

c = c.replace(
    "paymentStatus: 'PAID',",
    "paymentStatus: isPaidLater ? 'UNPAID' : 'PAID',"
)

with open('src/app/api/cashier/orders/route.ts', 'w', encoding='utf-8') as f:
    f.write(c)
