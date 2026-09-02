import { Injectable } from '@angular/core';
import type { BatteryCurrentDiagnostic, BatteryHistoryEntry } from './equipment.service';

/** Données nécessaires à la génération du rapport PDF batterie. */
export interface BatteryPdfReport {
  deviceId: string;
  /** Date ISO du rapport (affichée telle quelle dans le PDF). */
  rapportDate: string;
  diagnostic: BatteryCurrentDiagnostic | null;
  history: BatteryHistoryEntry[];
  /** Image PNG de la courbe SOH (facultative — issue du graphique affiché). */
  sohImageDataUrl: string | null;
}

/**
 * Exports du module batterie : CSV de l'historique et rapport PDF.
 *
 * L'export est réalisé côté frontend tant que le backend ne fournit pas
 * d'endpoint d'export dédié. Aucune logique de prédiction dans ce service :
 * il ne fait que mettre en forme les données déjà fournies par le backend.
 */
@Injectable({ providedIn: 'root' })
export class BatteryExportService {
  /** Seuil de température élevée (alertes signalées dans le rapport PDF). */
  private readonly TEMP_ALERT_THRESHOLD = 45;

  /** Télécharge l'historique batterie au format CSV (encodé UTF-8 pour Excel FR). */
  exportCsv(deviceId: string, history: BatteryHistoryEntry[]): void {
    if (typeof window === 'undefined' || history.length === 0) return;

    const header = ['date_heure', 'soh_pourcent', 'capacite_ah', 'rul_jours', 'temperature_c'];
    const rows = history.map(e => [
      e.date_heure,
      e.soh ?? '',
      e.capacite ?? '',
      e.rul_jours ?? '',
      e.temperature ?? ''
    ]);

    const csv =
      '\uFEFF' + [header, ...rows].map(r => r.join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const stamp = this.stampDate();
    this.triggerDownload(blob, `historique-batterie-${deviceId}-${stamp}.csv`);
  }

/**
   * Génère et télécharge le rapport PDF du diagnostic batterie.
   * Contient : identifiant du boîtier, date du rapport, état actuel, SOH,
   * capacité, durée de vie, courbe SOH, tableau historique et alertes de
   * température. En cas d'échec, l'erreur est propagée à l'appelant (la page
   * affiche un message sans bloquer le reste de l'interface).
   */
  async exportPdf(report: BatteryPdfReport): Promise<void> {
    if (typeof window === 'undefined') return;

    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // ===== En-tête du rapport =====
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RAPPORT DIAGNOSTIC BATTERIE', margin, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('SAFE TRACK — suivi de l\'état de santé des batteries', margin, 18);
    doc.setTextColor(20, 30, 50);

    // ===== Fiche d'informations =====
    const d = new Date(report.rapportDate);
    const dateLabel = isNaN(d.getTime())
      ? report.rapportDate
      : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

    const infoBody: string[][] = [
      ['Identifiant du boîtier', report.deviceId],
      ['Date du rapport', dateLabel],
      ['État actuel', this.etatLabel(report.diagnostic?.etat)],
      ['SOH', report.diagnostic?.soh_pourcent != null ? `${report.diagnostic.soh_pourcent} %` : 'Non disponible'],
      ['Capacité restante', report.diagnostic?.capacite_restante_ah != null ? `${report.diagnostic.capacite_restante_ah} Ah` : 'Non disponible'],
      ['Durée de vie estimée', report.diagnostic?.duree_estimee_jours != null ? `~${report.diagnostic.duree_estimee_jours} jours` : 'Non disponible']
    ];

    autoTable(doc, {
      startY: 36,
      head: [['Élément', 'Valeur']],
      body: infoBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 } }
    });

    let y = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 36;

    // ===== Courbe SOH (image du graphique Chart.js) =====
    if (report.sohImageDataUrl) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Courbe SOH (évolution de l\'état de santé)', margin, y);
      y += 4;
      try {
        const imgHeight = Math.min(52, contentWidth * 0.4);
        doc.addImage(report.sohImageDataUrl, 'PNG', margin, y, contentWidth, imgHeight);
        y += imgHeight + 6;
      } catch {
        y += 2;
      }
    }

    // ===== Tableau de l'historique =====
    if (report.history.length > 0) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Historique de la batterie', margin, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Date / heure', 'SOH (%)', 'Capacité (Ah)', 'RUL (jours)', 'Température (°C)']],
        body: report.history.map(e => [
          this.formatDateTime(e.date_heure),
          e.soh != null ? `${e.soh}` : '—',
          e.capacite != null ? `${e.capacite}` : '—',
          e.rul_jours != null ? `${e.rul_jours}` : '—',
          e.temperature != null ? `${e.temperature}` : '—'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 2 }
      });
      y = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
    }

// ===== Alertes de température =====
    const alerts: BatteryHistoryEntry[] = report.history.filter(
      e => e.temperature != null && e.temperature >= this.TEMP_ALERT_THRESHOLD
    );
    const currentTemp = report.diagnostic?.temperature_c;
    if (currentTemp != null && currentTemp >= this.TEMP_ALERT_THRESHOLD) {
      alerts.unshift({
        date_heure: report.diagnostic?.date_heure ?? new Date().toISOString(),
        soh: null,
        capacite: null,
        rul_jours: null,
        temperature: currentTemp
      });
    }

    if (alerts.length > 0) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text('Alertes de température', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      alerts.forEach((a, i) => {
        doc.text(
          `${i + 1}. ${this.formatDateTime(a.date_heure)} — ${a.temperature} °C (seuil ${this.TEMP_ALERT_THRESHOLD} °C dépassé)`,
          margin + 2,
          y + (i + 1) * 5
        );
      });
      y += alerts.length * 5 + 4;
    } else {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(18, 184, 134);
      doc.text('Aucune alerte de température détectée.', margin, y);
      doc.setTextColor(51, 65, 85);
      y += 8;
    }

    // ===== Pied de page =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 160);
    doc.text(
      'Rapport généré automatiquement par SAFE Track — Diagnostic batterie.',
      margin,
      Math.max(y, 280) + 6
    );

    const stamp = this.stampDate();
    doc.save(`rapport-batterie-${report.deviceId}-${stamp}.pdf`);
  }

  private etatLabel(etat: string | null | undefined): string {
    if (!etat) return 'Non disponible';
    return etat === 'A_remplacer' ? 'À remplacer' : etat;
  }

  private formatDateTime(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  private stampDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 200);
  }
}