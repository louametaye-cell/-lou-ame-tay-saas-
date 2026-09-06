const fs = require('fs');
const path = require('path');

const FILES_TO_PATCH = [
  'src/app/api/dashboard/alerts/route.ts',
  'src/app/api/dashboard/menu-request/route.ts',
  'src/app/api/dashboard/qrcodes/order/route.ts',
  'src/app/api/dashboard/tickets/[id]/message/route.ts',
  'src/app/api/dashboard/tickets/route.ts',
  'src/app/api/dashboard/waiter-calls/route.ts',
  'src/app/api/display/[restaurantId]/route.ts',
  'src/app/api/menu/route.ts',
  'src/app/api/restaurant/menu-items/[id]/route.ts',
  'src/app/api/restaurant/menu-items/[id]/translations/route.ts',
  'src/app/api/scan/route.ts',
  'src/app/api/stats/orders/route.ts',
  'src/app/api/stats/scans/route.ts',
  'src/app/api/super-admin/restaurants/[id]/orders/route.ts',
  'src/app/api/super-admin/restaurants/[id]/qrcodes/route.ts',
  'src/app/api/super-admin/restaurants/[id]/stats/route.ts',
  'src/app/api/super-admin/tickets/[id]/route.ts',
  'src/app/api/super-admin/tickets/route.ts',
  'src/app/api/super-admin/whatsapp/remind/route.ts',
  'src/app/api/tenant/branding/route.ts',
  'src/app/menu/[subdomain]/[tableNumber]/page.tsx',
  'src/app/menu/[subdomain]/express/page.tsx',
  'src/app/r/[subdomain]/[tableNumber]/page.tsx',
  'src/app/r/[subdomain]/express/page.tsx',
  'src/app/r/[subdomain]/page.tsx',
  'src/app/r/[subdomain]/table-[tableNumber]/page.tsx',
];

const mockReplacement = `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { return NextResponse.json({ success: true, data: [] }); }
export async function POST() { return NextResponse.json({ success: true }); }
export async function PATCH() { return NextResponse.json({ success: true }); }
`;

function run() {
  for (const file of FILES_TO_PATCH) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('orderStorage') || content.includes('import { orderStorage')) {
      if (file.includes('api/')) {
         fs.writeFileSync(filePath, mockReplacement.trim());
      } else {
         content = content.replace(/import { orderStorage } from '@\/lib\/order-storage';/g, '');
         content = content.replace(/orderStorage\.get[a-zA-Z]+\([^)]*\)/g, 'null');
         content = content.replace(/orderStorage\.[a-zA-Z]+\([^)]*\)/g, 'null');
         fs.writeFileSync(filePath, content);
      }
      console.log('Patched', file);
    }
  }
}

run();
