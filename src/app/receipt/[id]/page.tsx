import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DigitalCustomerReceipt, { ReceiptData } from '@/components/receipt/DigitalCustomerReceipt';
import { Metadata } from 'next';

interface ReceiptPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ReceiptPageProps): Promise<Metadata> {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { tenant: true },
  });

  if (!order) {
    return {
      title: 'Ticket introuvable | Lou Ame Tay ?',
    };
  }

  const orderNum = order.tableNumber ? `Table ${order.tableNumber}` : `#${order.id.slice(-4).toUpperCase()}`;
  return {
    title: `Reçu Commande ${orderNum} - ${order.tenant.businessName} | Lou Ame Tay ?`,
    description: `Ticket numérique officiel et éco-responsable certifié pour ${order.tenant.businessName}.`,
  };
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      tenant: true,
      items: true,
      cashier: true,
    },
  });

  if (!order) {
    notFound();
  }

  const tenantBranding = order.tenant.branding as any;
  const googleReviewUrl = tenantBranding?.googleReviewUrl || undefined;

  const orderNumber = order.tableNumber && order.tableNumber > 0
    ? `#${order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}`
    : `#${order.id.slice(-4).toUpperCase()}`;

  const receiptData: ReceiptData = {
    orderId: order.id,
    orderNumber,
    createdAt: new Date(order.createdAt).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    restaurantName: order.tenant.businessName,
    restaurantAddress: order.tenant.address || undefined,
    restaurantPhone: order.tenant.phone || undefined,
    restaurantSlug: order.tenant.subdomain,
    restaurantGoogleReviewUrl: googleReviewUrl,
    tableNumber: order.tableNumber || undefined,
    serviceType: order.tableNumber && order.tableNumber > 0 ? 'DINE_IN' : 'EXPRESS',
    paymentMethod: order.paymentMethod ? String(order.paymentMethod).replace('_', ' ') : 'Espèces',
    paymentStatus: order.paymentStatus || 'PAID',
    items: order.items.map((it) => ({
      id: it.id,
      name: it.name,
      quantity: it.quantity,
      price: Number(it.price),
      selectedSide: it.selectedSide || undefined,
      selectedSpice: it.selectedSpice || undefined,
      notes: it.customNotes || undefined,
    })),
    subtotal: Number(order.totalAmount),
    total: Number(order.totalAmount),
    cashierName: order.cashier?.name || undefined,
    customerName: order.customerName || undefined,
  };

  return <DigitalCustomerReceipt receipt={receiptData} />;
}
