// ==============================================================================
// SERVICE D'IMPRESSION THERMIQUE 80MM ESC/POS (BLUETOOTH & NATIF BROWSER)
// Lou Ame Tay ? - Ticket Cuisine, Caisse & Repas Personnel (NP)
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

  // État de connexion Bluetooth persistant en session
  private static connectedDevice: any = null;
  private static connectedCharacteristic: any = null;

  /**
   * Vérifie si un appareil Bluetooth est actuellement connecté
   */
  public static isBluetoothConnected(): boolean {
    return Boolean(this.connectedDevice && this.connectedDevice.gatt?.connected && this.connectedCharacteristic);
  }

  /**
   * Retourne le nom de l'appareil Bluetooth connecté
   */
  public static getConnectedDeviceName(): string | null {
    if (this.isBluetoothConnected()) {
      return this.connectedDevice.name || 'Imprimante Bluetooth ESC/POS';
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem('louametay_bluetooth_device_name');
    }
    return null;
  }

  /**
   * Connexion explicite à l'imprimante Bluetooth via Web Bluetooth API
   */
  public static async connectBluetooth(): Promise<{ success: boolean; deviceName?: string; name?: string; id?: string; connected?: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      return {
        success: false,
        error: 'Web Bluetooth non supporté sur ce navigateur ou cet appareil.'
      };
    }

    try {
      // Filtres standards pour imprimantes thermiques 80mm ESC/POS
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
          { services: ['0000ff00-0000-1000-8000-00805f9b34fb'] },
          { namePrefix: 'POS' },
          { namePrefix: 'RP' },
          { namePrefix: 'MTP' },
          { namePrefix: 'Printer' },
          { namePrefix: 'Bluetooth' },
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'
        ],
      });

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Impossible de se connecter au serveur GATT de l\'imprimante.');
      }

      // Recherche du service primaire compatible
      let service: any = null;
      const candidateServices = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '0000ff00-0000-1000-8000-00805f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455'
      ];

      for (const serviceUuid of candidateServices) {
        try {
          service = await server.getPrimaryService(serviceUuid);
          if (service) break;
        } catch {
          // Continuer la boucle
        }
      }

      if (!service) {
        // Tenter d'obtenir tous les services
        const services = await server.getPrimaryServices();
        if (services.length > 0) {
          service = services[0];
        }
      }

      if (!service) {
        throw new Error('Aucun service d\'écriture ESC/POS trouvé sur cet appareil.');
      }

      // Recherche de la caractéristique d'écriture
      const characteristics = await service.getCharacteristics();
      const writeChar = characteristics.find(
        (c: any) => c.properties.write || c.properties.writeWithoutResponse
      );

      if (!writeChar) {
        throw new Error('Aucune caractéristique d\'écriture disponible sur cette imprimante.');
      }

      this.connectedDevice = device;
      this.connectedCharacteristic = writeChar;

      const deviceName = device.name || 'Imprimante ESC/POS';
      if (typeof window !== 'undefined') {
        localStorage.setItem('louametay_bluetooth_device_name', deviceName);
        localStorage.setItem('louametay_printer_type', 'bluetooth');
      }

      // Écouter la déconnexion inopinée
      device.addEventListener('gattserverdisconnected', () => {
        console.warn('[EscPosPrinter] Imprimante Bluetooth déconnectée.');
        this.connectedDevice = null;
        this.connectedCharacteristic = null;
      });

      return {
        success: true,
        deviceName,
        name: deviceName,
        id: device.id,
        connected: true,
      };
    } catch (err: any) {
      this.connectedDevice = null;
      this.connectedCharacteristic = null;
      return {
        success: false,
        error: err.message || 'Impossible de se connecter à l\'imprimante Bluetooth.',
      };
    }
  }

  /**
   * Déconnexion manuelle de l'imprimante Bluetooth
   */
  public static async disconnectBluetooth(): Promise<void> {
    if (this.connectedDevice && this.connectedDevice.gatt?.connected) {
      await this.connectedDevice.gatt.disconnect();
    }
    this.connectedDevice = null;
    this.connectedCharacteristic = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('louametay_bluetooth_device_name');
    }
  }

  /**
   * Génère le flux d'octets brut ESC/POS pour une imprimante 80mm
   */
  public static generateTicketBytes(order: OrderType, restaurantName = 'LOU AME TAY ?'): Uint8Array {
    const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0 || !order.tableNumber;
    const tableHeader = order.locationDetail
      ? order.locationDetail.toUpperCase()
      : isExpress
      ? 'COMPTOIR EXPRESS'
      : `TABLE ${order.tableNumber < 10 ? `0${order.tableNumber}` : `${order.tableNumber}`}`;
    const effectiveTotal = (order as any).totalAmount ?? order.total ?? order.items?.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0) ?? 0;
    const orderDate = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let raw = '';
    raw += this.INIT;
    raw += this.ALIGN_CENTER;
    raw += this.BOLD_ON;
    raw += `${restaurantName}\n`;
    raw += 'BON DE COMMANDE CUISINE & CAISSE\n';
    raw += this.BOLD_OFF;
    raw += '==========================================\n';

    // Badge spécial Repas Personnel (NP)
    if (order.paymentMethod === 'STAFF_MEAL' || (order as any).employeeName) {
      raw += this.DOUBLE_SIZE;
      raw += this.BOLD_ON;
      raw += 'BON REPAS PERSONNEL (NP)\n';
      raw += this.NORMAL_SIZE;
      raw += `EMPLOYE : ${((order as any).employeeName || 'Non renseigne').toUpperCase()}\n`;
      raw += this.BOLD_OFF;
      raw += '------------------------------------------\n';
    } else {
      // Giant Table Header standard
      raw += this.DOUBLE_SIZE;
      raw += this.BOLD_ON;
      raw += `${tableHeader}\n`;
      raw += this.NORMAL_SIZE;
      raw += this.BOLD_OFF;
    }

    if (order.destinationService) {
      raw += `Service : ${order.destinationService}\n`;
    }
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
    raw += `TOTAL : ${formatFCFA(effectiveTotal)}\n`;
    if (order.paymentMethod === 'STAFF_MEAL') {
      raw += 'Reglement : REPAS DU PERSONNEL (NP)\n';
    } else {
      raw += `Mode de règlement : ${order.paymentMethod || 'Espèces / TPE'}\n`;
    }
    raw += '\n\n\n';
    raw += this.FULL_CUT;

    // Convert string to byte array
    const encoder = new TextEncoder();
    return encoder.encode(raw);
  }

  /**
   * Impression directe via Web Bluetooth API (sur tablettes et smartphones)
   * Si échec ou Bluetooth non connecté, lance une exception pour que le caissier puisse basculer.
   */
  public static async printViaBluetooth(order: OrderType, restaurantName?: string): Promise<boolean> {
    try {
      if (!this.isBluetoothConnected()) {
        // Tenter une connexion rapide
        await this.connectBluetooth();
      }

      if (!this.connectedCharacteristic) {
        throw new Error('Imprimante Bluetooth non connectée.');
      }

      const data = this.generateTicketBytes(order, restaurantName);

      // Envoi par paquets de 512 octets max (respect des MTU Bluetooth)
      const CHUNK_SIZE = 512;
      for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
        const chunk = data.slice(offset, offset + CHUNK_SIZE);
        if (this.connectedCharacteristic.writeValueWithResponse) {
          await this.connectedCharacteristic.writeValueWithResponse(chunk);
        } else {
          await this.connectedCharacteristic.writeValue(chunk);
        }
      }

      return true;
    } catch (err: any) {
      console.warn('[EscPosPrinter] Échec Bluetooth :', err);
      throw err;
    }
  }

  /**
   * Impression native du navigateur (Wi-Fi / Système par défaut / Fallback PDF 80mm)
   */
  public static printViaNative(order: OrderType, restaurantName = 'LOU AME TAY ?') {
    this.printAsPdf(order, restaurantName);
  }

  /**
   * Alias de compatibilité pour les composants historiques
   */
  public static printViaWindowFallback(order: OrderType, restaurantName = 'LOU AME TAY ?') {
    this.printAsPdf(order, restaurantName);
  }

  /**
   * Impression en PDF / Ticket 80mm via window.print() avec CSS dédié @media print
   */
  public static printAsPdf(order: OrderType, restaurantName = 'LOU AME TAY ?') {
    const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0 || !order.tableNumber;
    const tableHeader = order.locationDetail
      ? order.locationDetail.toUpperCase()
      : isExpress
      ? 'COMPTOIR EXPRESS'
      : `TABLE ${order.tableNumber < 10 ? `0${order.tableNumber}` : `${order.tableNumber}`}`;
    const effectiveTotal = (order as any).totalAmount ?? order.total ?? order.items?.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0) ?? 0;
    const orderDate = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const orderFullDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const isStaffMeal = order.paymentMethod === 'STAFF_MEAL' || Boolean((order as any).employeeName);
    const employeeName = (order as any).employeeName;

    const printWindow = window.open('', '_blank', 'width=460,height=700');
    if (!printWindow) return;

    const itemsHtml = order.items
      .map(
        (i) => `
        <div class="ticket-item">
          <div class="ticket-item-row">
            <span class="ticket-qty">${i.quantity}x</span>
            <span class="ticket-name">${i.name}</span>
            <span class="ticket-price">${formatFCFA((Number(i.price) || 0) * (Number(i.quantity) || 1))}</span>
          </div>
          ${i.options?.side ? `<div class="ticket-option">&gt; Accompagnement : ${i.options.side}</div>` : ''}
          ${i.options?.spiceLevel ? `<div class="ticket-option">&gt; Piment : ${i.options.spiceLevel}</div>` : ''}
          ${i.notes ? `<div class="ticket-note">* NOTE : ${i.notes}</div>` : ''}
        </div>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Ticket - ${isStaffMeal ? `NP ${employeeName}` : tableHeader} - ${restaurantName}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            @media print {
              html, body {
                width: 76mm !important;
                margin: 0 auto !important;
                padding: 4mm 2mm !important;
                background: #fff !important;
                color: #000 !important;
                font-family: 'Courier New', Courier, monospace !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 76mm;
              margin: 0 auto;
              padding: 6mm 3mm;
              color: #000;
              background: #fff;
              font-size: 13px;
              line-height: 1.25;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: 900; }
            .header-title { font-size: 17px; font-weight: 900; letter-spacing: 0.5px; }
            .header-sub { font-size: 11px; margin-top: 2px; }
            .giant-table {
              font-size: 20px;
              font-weight: 900;
              border-top: 2px dashed #000;
              border-bottom: 2px dashed #000;
              padding: 5px 0;
              margin: 8px 0;
              text-align: center;
              letter-spacing: 1px;
            }
            .staff-badge {
              border: 2px solid #000;
              padding: 6px;
              margin: 8px 0;
              text-align: center;
              background: #f1f5f9;
            }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .double-divider { border-bottom: 2px solid #000; margin: 6px 0; }
            .ticket-item { margin-bottom: 6px; }
            .ticket-item-row { display: flex; justify-content: space-between; align-items: baseline; }
            .ticket-qty { font-weight: 900; font-size: 14px; width: 28px; }
            .ticket-name { font-weight: 900; font-size: 14px; flex: 1; }
            .ticket-price { font-weight: 700; font-size: 13px; }
            .ticket-option { font-size: 11px; color: #333; margin-left: 28px; }
            .ticket-note { font-size: 11px; font-style: italic; background: #eee; padding: 2px 4px; border-radius: 3px; margin: 2px 0 0 28px; }
            .total-box {
              font-size: 16px;
              font-weight: 900;
              margin-top: 4px;
            }
            .footer-info {
              font-size: 10px;
              margin-top: 10px;
              color: #444;
            }
          </style>
        </head>
        <body>
          <div class="center bold header-title">${restaurantName}</div>
          <div class="center header-sub">Lou Ame Tay ? - Plateforme Restaurant</div>
          
          ${isStaffMeal ? `
            <div class="staff-badge">
              <div class="bold" style="font-size: 15px;">BON REPAS PERSONNEL (NP)</div>
              <div class="bold" style="font-size: 17px; margin-top: 2px;">EMPLOYÉ : ${(employeeName || 'Non renseigné').toUpperCase()}</div>
              <div style="font-size: 10px; margin-top: 2px;">À déduire ou facturer fin de mois</div>
            </div>
          ` : `
            <div class="giant-table">${tableHeader}</div>
          `}

          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>${orderFullDate} ${orderDate}</span>
            <span class="bold">#${order.id.slice(-6).toUpperCase()}</span>
          </div>

          ${order.destinationService ? `
            <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">
              Service : ${order.destinationService}
            </div>
          ` : ''}

          ${order.customerName && !isStaffMeal ? `
            <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">
              Client : ${order.customerName}
            </div>
          ` : ''}

          <div class="divider"></div>

          ${itemsHtml}

          ${order.customerNote || order.note ? `
            <div class="divider"></div>
            <div style="font-size: 11px;">
              <span class="bold">NOTE CUISINE :</span> ${order.customerNote || order.note}
            </div>
          ` : ''}

          <div class="double-divider"></div>

          <div class="ticket-item-row total-box">
            <span>TOTAL :</span>
            <span>${formatFCFA(effectiveTotal)}</span>
          </div>

          <div style="font-size: 11px; margin-top: 4px; text-align: right;">
            ${isStaffMeal ? 'Paiement : BONS REPAS DU PERSONNEL (NP)' : `Paiement : ${order.paymentMethod || 'Espèces'}`}
          </div>

          <div class="divider"></div>
          <div class="center footer-info">
            🇸🇳 Jërejëf ! Merci pour votre confiance !<br/>
            Plateforme Lou Ame Tay ? DAW Digital Arts Work
          </div>

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

  /**
   * Alias de compatibilité pour l'impression du rapport Z
   */
  public static printZReport(session: any, restaurantName = 'LOU AME TAY ?') {
    return this.printCashSessionZReport(session, restaurantName);
  }

  /**
   * Imprime le Ticket Rapport Z de clôture de caisse
   */
  public static printCashSessionZReport(session: any, restaurantName = 'LOU AME TAY ?') {
    const openingDate = new Date(session.openedAt).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const closingDate = session.closedAt
      ? new Date(session.closedAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'En cours';

    const cashierName = session.cashier?.name || 'Caissier(e)';
    const cashierShift = session.cashier?.shift || 'JOURNEE';

    const openingFloat = Number(session.openingFloat) || 0;
    const countedCash = Number(session.countedCash) || 0;
    const expectedCash = Number(session.expectedCash) || 0;
    const discrepancy = Number(session.cashDiscrepancy) || 0;
    const totalCash = Number(session.totalCash) || 0;
    const totalWave = Number(session.totalWave) || 0;
    const totalOM = Number(session.totalOM) || 0;
    const totalYas = Number(session.totalYas) || 0;
    const totalCard = Number(session.totalCard) || 0;
    const totalRevenue = Number(session.totalRevenue) || 0;

    let discrepancyLabel = '0 FCFA (Caisse Parfaite)';
    let discrepancyColor = '#059669'; // Vert
    if (discrepancy < 0) {
      discrepancyLabel = `-${formatFCFA(Math.abs(discrepancy))} (Déficit de caisse)`;
      discrepancyColor = '#dc2626'; // Rouge
    } else if (discrepancy > 0) {
      discrepancyLabel = `+${formatFCFA(discrepancy)} (Excédent de caisse)`;
      discrepancyColor = '#2563eb'; // Bleu
    }

    // Extraction d'audit enrichi éventuel (JSON structuré)
    let auditObj: any = session.closureAudit || null;
    let comparisonObj: any = session.comparison || null;
    let userRawNotes = typeof session.notes === 'string' ? session.notes : '';

    if (!auditObj && userRawNotes) {
      try {
        const parsed = JSON.parse(userRawNotes);
        if (parsed && typeof parsed === 'object') {
          auditObj = parsed;
          userRawNotes = parsed.userNotes || '';
          if (parsed.discrepancies) {
            // Reconstitution comparison si besoin
          }
        }
      } catch (e) {
        // Plain text notes
      }
    }

    if (auditObj?.userNotes !== undefined) {
      userRawNotes = auditObj.userNotes;
    }

    const printWindow = window.open('', '_blank', 'width=460,height=750');
    if (!printWindow) return;

    // Génération du bloc coupures si disponible
    const denominations = auditObj?.denominations || session.denominations || null;
    let denominationsHtml = '';
    if (denominations && typeof denominations === 'object') {
      const denomRows = Object.entries(denominations)
        .map(([val, qty]) => ({ val: Number(val), qty: Number(qty) || 0 }))
        .filter((d) => d.qty > 0)
        .sort((a, b) => b.val - a.val)
        .map((d) => `
          <div class="row" style="font-size: 11px;">
            <span>• ${formatFCFA(d.val)} × ${d.qty}</span>
            <span class="bold">${formatFCFA(d.val * d.qty)}</span>
          </div>
        `)
        .join('');

      if (denomRows) {
        denominationsHtml = `
          <div class="divider"></div>
          <div class="bold" style="margin-bottom: 3px;">DÉTAIL COUPURES BILAN TIROIR :</div>
          ${denomRows}
        `;
      }
    }

    // Tableau comparatif multi-canaux si disponible
    let multiChannelHtml = '';
    if (comparisonObj) {
      const channels = [
        { key: 'cash', label: 'Espèces (Tiroir)' },
        { key: 'wave', label: 'Wave' },
        { key: 'orangeMoney', label: 'Orange Money' },
        { key: 'freeMoney', label: 'Free Money' },
        { key: 'card', label: 'Cartes / TPE' },
      ];

      const rowsHtml = channels.map((c) => {
        const item = comparisonObj[c.key];
        if (!item) return '';
        const diff = Number(item.discrepancy) || 0;
        const diffColor = diff === 0 ? '#059669' : diff > 0 ? '#2563eb' : '#dc2626';
        const diffSign = diff > 0 ? '+' : '';
        return `
          <div style="margin-bottom: 4px; font-size: 11px;">
            <div class="row bold">
              <span>${c.label}</span>
              <span style="color: ${diffColor};">${diffSign}${formatFCFA(diff)}</span>
            </div>
            <div class="row" style="color: #555; font-size: 10px;">
              <span>Attendu : ${formatFCFA(item.expected)}</span>
              <span>Compté : ${formatFCFA(item.counted)}</span>
            </div>
          </div>
        `;
      }).join('');

      const totalItem = comparisonObj.total;
      const totalDiff = Number(totalItem?.discrepancy) || 0;
      const totalColor = totalDiff === 0 ? '#059669' : totalDiff > 0 ? '#2563eb' : '#dc2626';

      multiChannelHtml = `
        <div class="divider"></div>
        <div class="bold" style="margin-bottom: 4px;">CONTRÔLE COMPARATIF MULTI-CANAUX :</div>
        ${rowsHtml}
        <div class="double-divider"></div>
        <div class="row bold" style="font-size: 12px;">
          <span>ÉCART CONSOLIDÉ GLOBAL :</span>
          <span style="color: ${totalColor};">${totalDiff > 0 ? '+' : ''}${formatFCFA(totalDiff)}</span>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Rapport Z Caisse - ${cashierName} - ${restaurantName}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 76mm;
              margin: 0 auto;
              padding: 6mm 3mm;
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: 900; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .double-divider { border-bottom: 2px solid #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .badge-title {
              font-size: 15px;
              font-weight: 900;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 4px 0;
              margin: 6px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${restaurantName}</div>
          <div class="center" style="font-size: 11px;">Plateforme SaaS Lou Ame Tay ?</div>
          <div class="badge-title">CLOTURE DE CAISSE<br/>*** RAPPORT Z SHIFT ***</div>

          <div class="row"><span>Caissier(e) :</span> <span class="bold">${cashierName}</span></div>
          <div class="row"><span>Shift / Créneau :</span> <span>${cashierShift}</span></div>
          <div class="row"><span>Ouverture :</span> <span>${openingDate}</span></div>
          <div class="row"><span>Clôture :</span> <span>${closingDate}</span></div>
          <div class="row"><span>Nbre commandes :</span> <span class="bold">${session.orderCount || 0}</span></div>

          <div class="divider"></div>
          <div class="row bold">
            <span>Fond de caisse départ :</span>
            <span>${formatFCFA(openingFloat)}</span>
          </div>

          <div class="divider"></div>
          <div class="bold" style="margin-bottom: 4px;">VENTILATION DES ENCAISSEMENTS :</div>
          <div class="row"><span>• Espèces (Cash) :</span> <span>${formatFCFA(totalCash)}</span></div>
          <div class="row"><span>• Wave :</span> <span>${formatFCFA(totalWave)}</span></div>
          <div class="row"><span>• Orange Money :</span> <span>${formatFCFA(totalOM)}</span></div>
          <div class="row"><span>• Yas Money (Free) :</span> <span>${formatFCFA(totalYas)}</span></div>
          <div class="row"><span>• Cartes / TPE :</span> <span>${formatFCFA(totalCard)}</span></div>

          <div class="double-divider"></div>
          <div class="row bold" style="font-size: 14px;">
            <span>TOTAL RECETTES SHIFT :</span>
            <span>${formatFCFA(totalRevenue)}</span>
          </div>
          <div class="double-divider"></div>

          ${multiChannelHtml || `
            <div class="bold" style="margin-bottom: 4px;">CONTROLE TIROIR-CAISSE (ESPECES) :</div>
            <div class="row"><span>Espèces théoriques (Fond+Ventes):</span> <span class="bold">${formatFCFA(expectedCash)}</span></div>
            <div class="row"><span>Espèces réelles comptées:</span> <span class="bold">${formatFCFA(countedCash)}</span></div>
            <div class="row bold" style="font-size: 13px; color: ${discrepancyColor};">
              <span>ÉCART DE CAISSE :</span>
              <span>${discrepancyLabel}</span>
            </div>
          `}

          ${denominationsHtml}

          ${userRawNotes ? `
            <div class="divider"></div>
            <div class="bold">Notes / Observations :</div>
            <div style="font-size: 11px;">${userRawNotes}</div>
          ` : ''}

          <div class="divider"></div>
          <div style="margin-top: 15px; display: flex; justify-content: space-between; font-size: 11px;">
            <div>Signature Caissier :<br/><br/><br/>__________________</div>
            <div class="right">Signature Gérant :<br/><br/><br/>__________________</div>
          </div>
          <div class="center" style="font-size: 9px; margin-top: 20px; color: #555;">
            Document comptable interne infalsifiable - Lou Ame Tay ?
          </div>

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