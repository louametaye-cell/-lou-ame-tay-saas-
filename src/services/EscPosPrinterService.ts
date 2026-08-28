// ==============================================================================
// SERVICE D'IMPRESSION THERMIQUE 80MM ESC/POS (BLUETOOTH & IP DIRECT)
// Lou Ame Tay ? - Ticket Cuisine & Facturation
// ==============================================================================

import { OrderType } from '@/types';
import { formatFCFA } from '@/lib/utils';

export interface PrintOptions {
  printerIp?: string;
  printerPort?: number;
  useBluetooth?: boolean;
  cutPaper?: boolean;
}

export class EscPosPrinterService {
  // ESC/POS Command Constants
  private static readonly ESC = '\x1B';
  private static readonly GS = '\x1D';
  private static readonly INIT = `${EscPosPrinterService.ESC}@`;
  private static readonly ALIGN_LEFT = `${EscPosPrinterService.ESC}a\x00`;
  private static readonly ALIGN_CENTER = `${EscPosPrinterService.ESC}a\x01`;
  private static readonly ALIGN_RIGHT = `${EscPosPrinterService.ESC}a\x02`;
  private static readonly BOLD_ON = `${EscPosPrinterService.ESC}E\x01`;
  private static readonly BOLD_OFF = `${EscPosPrinterService.ESC}E\x00`;
  private static readonly DOUBLE_SIZE = `${EscPosPrinterService.GS}!\x11`;
  private static readonly NORMAL_SIZE = `${EscPosPrinterService.GS}!\x00`;
  private static readonly FULL_CUT = `${EscPosPrinterService.GS}V\x00`;

  /**
   * Génère le flux d'octets brut ESC/POS pour une imprimante 80mm
   */
  public static generateTicketBytes(order: OrderType, restaurantName = 'LOU AME TAY ?'): Uint8Array {
    const formattedTable = order.tableNumber < 10 ? `0${order.tableNumber}` : `${order.tableNumber}`;
    const orderDate = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let raw = '';
    raw += this.INIT;
    raw += this.ALIGN_CENTER;
    raw += this.BOLD_ON;
    raw += `${restaurantName}\n`;
    raw += 'BON DE COMMANDE CUISINE\n';
    raw += this.BOLD_OFF;
    raw += '==========================================\n';

    // Giant Table Header
    raw += this.DOUBLE_SIZE;
    raw += this.BOLD_ON;
    raw += `TABLE ${formattedTable}\n`;
    raw += this.NORMAL_SIZE;
    raw += this.BOLD_OFF;

    raw += `Heure : ${orderDate}  |  N° #${order.id.slice(-4).toUpperCase()}\n`;
    if (order.customerName) {
      raw += `Client : ${order.customerName}\n`;
    }
    raw += '------------------------------------------\n';
    raw += this.ALIGN_LEFT;

    // Items list
    order.items.forEach((item) => {
      raw += this.BOLD_ON;
      raw += `${item.quantity}x ${item.name}\n`;
      raw += this.BOLD_OFF;

      if (item.options?.side) {
        raw += `   > Accompagnement: ${item.options.side}\n`;
      }
      if (item.options?.spiceLevel) {
        raw += `   > Piment: ${item.options.spiceLevel}\n`;
      }
      if (item.notes) {
        raw += `   * NOTE: ${item.notes}\n`;
      }
    });

    if (order.customerNote || order.note) {
      raw += '------------------------------------------\n';
      raw += this.BOLD_ON;
      raw += `REMARQUE CUISINE:\n${order.customerNote || order.note}\n`;
      raw += this.BOLD_OFF;
    }

    raw += '==========================================\n';
    raw += this.ALIGN_RIGHT;
    raw += `TOTAL : ${formatFCFA(order.total)}\n`;
    raw += `Mode de règlement : ${order.paymentMethod || 'Espèces / TPE'}\n`;
    raw += '\n\n\n';
    raw += this.FULL_CUT;

    // Convert string to ASCII byte array
    const encoder = new TextEncoder();
    return encoder.encode(raw);
  }

  /**
   * Impression directe via Web Bluetooth API (sur tablettes et smartphones)
   */
  public static async printViaBluetooth(order: OrderType, restaurantName?: string): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
        throw new Error('Web Bluetooth non supporté sur ce navigateur.');
      }

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
      });

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      const data = this.generateTicketBytes(order, restaurantName);
      await characteristic?.writeValue(data);
      return true;
    } catch (err: any) {
      console.warn('[EscPosPrinter] Impression Bluetooth fallback fenêtre web:', err);
      this.printViaWindowFallback(order, restaurantName);
      return false;
    }
  }

  /**
   * Fenêtre d'impression standard 80mm
   */
  public static printViaWindowFallback(order: OrderType, restaurantName = 'LOU AME TAY ?') {
    const formattedTable = order.tableNumber < 10 ? `0${order.tableNumber}` : `${order.tableNumber}`;
    const orderDate = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const itemsHtml = order.items
      .map(
        (i) => `
        <div style="margin-bottom: 6px;">
          <div style="font-weight: 900; font-size: 15px;">${i.quantity}x ${i.name}</div>
          ${i.options?.side ? `<div style="font-size: 12px; color: #444;">&gt; Accompagnement: ${i.options.side}</div>` : ''}
          ${i.options?.spiceLevel ? `<div style="font-size: 12px; color: #444;">&gt; Piment: ${i.options.spiceLevel}</div>` : ''}
          ${i.notes ? `<div style="font-size: 12px; font-style: italic; background: #eee; padding: 2px 4px; border-radius: 4px; margin-top: 2px;">* NOTE: ${i.notes}</div>` : ''}
        </div>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket Cuisine - Table ${formattedTable}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 76mm;
              margin: 0 auto;
              padding: 6mm 2mm;
              color: #000;
              background: #fff;
              font-size: 13px;
              line-height: 1.2;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .giant-table {
              font-size: 24px;
              font-weight: 900;
              border-top: 2px dashed #000;
              border-bottom: 2px dashed #000;
              padding: 6px 0;
              margin: 8px 0;
              text-align: center;
            }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${restaurantName}</div>
          <div class="center bold">BON DE CUISINE</div>
          <div class="giant-table">TABLE ${formattedTable}</div>
          <div>Heure: ${orderDate} | #${order.id.slice(-4).toUpperCase()}</div>
          ${order.customerName ? `<div>Client: ${order.customerName}</div>` : ''}
          <div class="divider"></div>
          <div>${itemsHtml}</div>
          ${order.customerNote || order.note ? `
            <div class="divider"></div>
            <div class="bold">REMARQUE CUISINE:</div>
            <div>${order.customerNote || order.note}</div>
          ` : ''}
          <div class="divider"></div>
          <div class="right bold" style="font-size: 14px;">TOTAL: ${formatFCFA(order.total)}</div>
          <div class="right" style="font-size: 11px;">Règlement: ${order.paymentMethod || 'Espèces / TPE'}</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}