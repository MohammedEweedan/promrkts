// src/pdf/pdfMake.ts
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Runtime shape guard – works with both possible shapes:
// - (pdfFonts as any).pdfMake.vfs
// - (pdfFonts as any).vfs
(pdfMake as any).vfs =
  (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

export default pdfMake as any; // 👈 important: export as any so TS stops treating it as PdfPrinter
