import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  async generateElectricityWaterReport(
    electricityData: any,
    waterData: any,
    year: number,
    month: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const monthName = monthNames[month - 1];

        // Titre principal
        doc.setFontSize(18);
        doc.text('Consommation d\'énergie électrique', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Mois de ${monthName} ${year}`, 105, 30, { align: 'center' });

        // Section Électricité
        doc.setFontSize(14);
        doc.text('Comptage ONE', 20, 50);

        // Réseau 60KV
        autoTable(doc, {
          startY: 60,
          head: [['Réseau 60KV OCP YOUSSOUFIA', 'Valeur']],
          body: [
            ['Energie Active (KWh)', electricityData.network60kvConsumption.toFixed(2)],
            ['Facteur de puissance', electricityData.network60kvPowerFactor.toFixed(2)]
          ],
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          },
          margin: { left: 20 }
        });

        // Réseau 22KV
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 15,
          head: [['Réseau 22KV OCP YOUSSOUFIA', 'Valeur']],
          body: [
            ['Energie Active (KWh)', electricityData.network22kvConsumption.toFixed(2)],
            ['Facteur de puissance', electricityData.network22kvPowerFactor.toFixed(2)]
          ],
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          },
          margin: { left: 20 }
        });

        // Total Électricité
        const totalEnergy = electricityData.network60kvConsumption + electricityData.network22kvConsumption;
        doc.text(`Total Energie Active: ${totalEnergy.toFixed(2)} KWh`, 20, (doc as any).lastAutoTable.finalY + 20);

        // Nouvelle page pour l'eau
        doc.addPage();
        doc.setFontSize(18);
        doc.text('Production d\'eau', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Mois de ${monthName} ${year}`, 105, 30, { align: 'center' });

        // Tableau Eau
        autoTable(doc, {
          startY: 50,
          head: [['Source', 'Volume (m³)']],
          body: [
            ['F3BIS', waterData.f3bis.toFixed(2)],
            ['F3', waterData.f3.toFixed(2)],
            ['SE2', waterData.se2.toFixed(2)],
            ['SE3BIS', waterData.se3bis.toFixed(2)]
          ],
          headStyles: {
            fillColor: [39, 174, 96],
            textColor: 255
          },
          margin: { left: 20 }
        });

        // Total Eau
        const totalWater = waterData.f3bis + waterData.f3 + waterData.se2 + waterData.se3bis;
        doc.text(`Total Production: ${totalWater.toFixed(2)} m³`, 20, (doc as any).lastAutoTable.finalY + 20);

        // Pied de page
        doc.setFontSize(10);
        doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 20, 280);
        doc.text('OCP Youssoufia - Direction Energie', 105, 280, { align: 'center' });

        // Génération du Blob
        const pdfOutput = doc.output('blob');
        resolve(pdfOutput);

      } catch (error) {
        console.error('Erreur génération PDF:', error);
        reject(error);
      }
    });
  }
}
