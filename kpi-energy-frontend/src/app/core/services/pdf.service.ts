import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  async generateMonthlyReport(
    electricityData: any,
    waterData: any,
    year: number,
    month: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const monthName = this.monthNames[month - 1];

        // En-tête
        this.addHeader(doc, `Rapport Mensuel - ${monthName} ${year}`);

        // Section Électricité
        this.addElectricitySection(doc, electricityData, 40);

        // Section Eau
        doc.addPage();
        this.addWaterSection(doc, waterData, 20);

        // Pied de page
        this.addFooter(doc);

        resolve(doc.output('blob'));
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        reject(error);
      }
    });
  }

  async generateYearlyReport(
    monthlyData: any[],
    year: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');

        // En-tête
        this.addHeader(doc, `Rapport Annuel - ${year}`);

        // Tableau récapitulatif
        doc.setFontSize(14);
        doc.text('Récapitulatif Annuel', 20, 40);

        // Tableau Électricité
        const electricityBody = monthlyData.map(data => [
          this.monthNames[data.month - 1],
          data.electricityData.network60kvConsumption.toFixed(2),
          data.electricityData.network22kvConsumption.toFixed(2),
          (data.electricityData.network60kvConsumption + data.electricityData.network22kvConsumption).toFixed(2),
          data.electricityData.network60kvPowerFactor.toFixed(2)
        ]);

        autoTable(doc, {
          startY: 50,
          head: [['Mois', '60KV (KWh)', '22KV (KWh)', 'Total (KWh)', 'Facteur Puissance']],
          body: electricityBody,
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          },
          margin: { left: 20 }
        });

        // Tableau Eau
        doc.addPage();
        const waterBody = monthlyData.map(data => [
          this.monthNames[data.month - 1],
          data.waterData.f3bis.toFixed(2),
          data.waterData.f3.toFixed(2),
          data.waterData.se2.toFixed(2),
          data.waterData.se3bis.toFixed(2),
          (data.waterData.f3bis + data.waterData.f3 + data.waterData.se2 + data.waterData.se3bis).toFixed(2)
        ]);

        autoTable(doc, {
          startY: 20,
          head: [['Mois', 'F3BIS (m³)', 'F3 (m³)', 'SE2 (m³)', 'SE3BIS (m³)', 'Total (m³)']],
          body: waterBody,
          headStyles: {
            fillColor: [39, 174, 96],
            textColor: 255
          },
          margin: { left: 20 }
        });

        // Graphiques et totaux annuels
        doc.addPage();
        this.addAnnualSummary(doc, monthlyData);

        // Pied de page
        this.addFooter(doc);

        resolve(doc.output('blob'));
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        reject(error);
      }
    });
  }

  async generatePeriodReport(
    periodData: any[],
    year: number,
    startMonth: number,
    endMonth: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const periodText = `Période: ${this.monthNames[startMonth - 1]} à ${this.monthNames[endMonth - 1]} ${year}`;

        // En-tête
        this.addHeader(doc, `Rapport Périodique - ${periodText}`);

        // Tableau récapitulatif Électricité
        doc.setFontSize(14);
        doc.text('Consommation Électrique', 20, 40);

        const electricityBody = periodData.map(data => [
          this.monthNames[data.month - 1],
          data.electricityData.network60kvConsumption.toFixed(2),
          data.electricityData.network22kvConsumption.toFixed(2),
          (data.electricityData.network60kvConsumption + data.electricityData.network22kvConsumption).toFixed(2),
          data.electricityData.network60kvPowerFactor.toFixed(2)
        ]);

        autoTable(doc, {
          startY: 50,
          head: [['Mois', '60KV (KWh)', '22KV (KWh)', 'Total (KWh)', 'Facteur Puissance']],
          body: electricityBody,
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          },
          margin: { left: 20 }
        });

        // Tableau récapitulatif Eau
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Production d\'Eau', 20, 20);

        const waterBody = periodData.map(data => [
          this.monthNames[data.month - 1],
          data.waterData.f3bis.toFixed(2),
          data.waterData.f3.toFixed(2),
          data.waterData.se2.toFixed(2),
          data.waterData.se3bis.toFixed(2),
          (data.waterData.f3bis + data.waterData.f3 + data.waterData.se2 + data.waterData.se3bis).toFixed(2)
        ]);

        autoTable(doc, {
          startY: 30,
          head: [['Mois', 'F3BIS (m³)', 'F3 (m³)', 'SE2 (m³)', 'SE3BIS (m³)', 'Total (m³)']],
          body: waterBody,
          headStyles: {
            fillColor: [39, 174, 96],
            textColor: 255
          },
          margin: { left: 20 }
        });

        // Totaux de la période
        doc.addPage();
        this.addPeriodSummary(doc, periodData, periodText);

        // Pied de page
        this.addFooter(doc);

        resolve(doc.output('blob'));
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        reject(error);
      }
    });
  }

  private addHeader(doc: jsPDF, title: string): void {
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text('OCP Youssoufia', 105, 15, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(title, 105, 25, { align: 'center' });
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);
  }

  private addElectricitySection(doc: jsPDF, data: any, startY: number): void {
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('Consommation Électrique', 20, startY);

    // Réseau 60KV
    autoTable(doc, {
      startY: startY + 10,
      head: [['Réseau 60KV OCP YOUSSOUFIA', 'Valeur']],
      body: [
        ['Energie Active (KWh)', data.network60kvConsumption.toFixed(2)],
        ['Facteur de puissance', data.network60kvPowerFactor.toFixed(2)]
      ],
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      margin: { left: 20 }
    });

    // Réseau 22KV
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Réseau 22KV OCP YOUSSOUFIA', 'Valeur']],
      body: [
        ['Energie Active (KWh)', data.network22kvConsumption.toFixed(2)],
        ['Facteur de puissance', data.network22kvPowerFactor.toFixed(2)]
      ],
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      margin: { left: 20 }
    });

    // Total Électricité
    const totalEnergy = data.network60kvConsumption + data.network22kvConsumption;
    doc.setFontSize(12);
    doc.text(`Total Energie Active: ${totalEnergy.toFixed(2)} KWh`, 20, (doc as any).lastAutoTable.finalY + 15);
  }

  private addWaterSection(doc: jsPDF, data: any, startY: number): void {
    doc.setFontSize(14);
    doc.setTextColor(39, 174, 96);
    doc.text('Production d\'Eau', 20, startY);

    // Tableau Eau
    autoTable(doc, {
      startY: startY + 10,
      head: [['Source', 'Volume (m³)']],
      body: [
        ['F3BIS', data.f3bis.toFixed(2)],
        ['F3', data.f3.toFixed(2)],
        ['SE2', data.se2.toFixed(2)],
        ['SE3BIS', data.se3bis.toFixed(2)]
      ],
      headStyles: {
        fillColor: [39, 174, 96],
        textColor: 255
      },
      margin: { left: 20 }
    });

    // Total Eau
    const totalWater = data.f3bis + data.f3 + data.se2 + data.se3bis;
    doc.setFontSize(12);
    doc.text(`Total Production: ${totalWater.toFixed(2)} m³`, 20, (doc as any).lastAutoTable.finalY + 15);
  }

  private addAnnualSummary(doc: jsPDF, monthlyData: any[]): void {
    doc.setFontSize(16);
    doc.text('Synthèse Annuelle', 105, 20, { align: 'center' });

    // Calcul des totaux annuels
    const totalElectricity = monthlyData.reduce((sum, data) =>
      sum + data.electricityData.network60kvConsumption + data.electricityData.network22kvConsumption, 0);

    const totalWater = monthlyData.reduce((sum, data) =>
      sum + data.waterData.f3bis + data.waterData.f3 + data.waterData.se2 + data.waterData.se3bis, 0);

    // Affichage des totaux
    doc.setFontSize(14);
    doc.text('Totaux Annuels', 20, 40);

    autoTable(doc, {
      startY: 50,
      head: [['Type', 'Valeur Totale']],
      body: [
        ['Consommation Électrique (KWh)', totalElectricity.toFixed(2)],
        ['Production d\'Eau (m³)', totalWater.toFixed(2)]
      ],
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255
      },
      margin: { left: 20 }
    });

    // Moyennes
    doc.setFontSize(14);
    doc.text('Moyennes Mensuelles', 20, (doc as any).lastAutoTable.finalY + 20);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['Type', 'Valeur Moyenne']],
      body: [
        ['Consommation Électrique (KWh)', (totalElectricity / 12).toFixed(2)],
        ['Production d\'Eau (m³)', (totalWater / 12).toFixed(2)]
      ],
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255
      },
      margin: { left: 20 }
    });
  }

  private addPeriodSummary(doc: jsPDF, periodData: any[], periodText: string): void {
    doc.setFontSize(16);
    doc.text(`Synthèse Périodique - ${periodText}`, 105, 20, { align: 'center' });

    // Calcul des totaux
    const totalElectricity = periodData.reduce((sum, data) =>
      sum + data.electricityData.network60kvConsumption + data.electricityData.network22kvConsumption, 0);

    const totalWater = periodData.reduce((sum, data) =>
      sum + data.waterData.f3bis + data.waterData.f3 + data.waterData.se2 + data.waterData.se3bis, 0);

    const monthCount = periodData.length;

    // Affichage des totaux
    doc.setFontSize(14);
    doc.text('Totaux Périodiques', 20, 40);

    autoTable(doc, {
      startY: 50,
      head: [['Type', 'Valeur Totale']],
      body: [
        ['Consommation Électrique (KWh)', totalElectricity.toFixed(2)],
        ['Production d\'Eau (m³)', totalWater.toFixed(2)]
      ],
      headStyles: {
        fillColor: [155, 89, 182],
        textColor: 255
      },
      margin: { left: 20 }
    });

    // Moyennes
    doc.setFontSize(14);
    doc.text('Moyennes Mensuelles', 20, (doc as any).lastAutoTable.finalY + 20);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['Type', 'Valeur Moyenne']],
      body: [
        ['Consommation Électrique (KWh)', (totalElectricity / monthCount).toFixed(2)],
        ['Production d\'Eau (m³)', (totalWater / monthCount).toFixed(2)]
      ],
      headStyles: {
        fillColor: [155, 89, 182],
        textColor: 255
      },
      margin: { left: 20 }
    });
  }

  private addFooter(doc: jsPDF): void {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 285);
    doc.text('OCP Youssoufia - Direction Energie', 105, 285, { align: 'center' });
    doc.text('Page ' + doc.getNumberOfPages(), 190, 285, { align: 'right' });
  }
}
