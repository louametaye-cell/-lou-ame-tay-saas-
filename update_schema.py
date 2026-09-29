import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'passwordHash          String?            @map("password_hash")',
    'passwordHash          String?            @map("password_hash")\n  isTwoFactorEnabled    Boolean            @default(false) @map("is_two_factor_enabled")\n  twoFactorSecret       String?            @map("two_factor_secret")'
)

c = c.replace(
    'pinCode   String       @map("pin_code")',
    'pinCode           String       @map("pin_code")\n  failedPinAttempts Int          @default(0) @map("failed_pin_attempts")\n  lockedUntil       DateTime?    @map("locked_until")'
)

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(c)
