// src/typings/jspdf.d.ts
import 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
    autoTable: (options: any) => jsPDF;
  }
}
