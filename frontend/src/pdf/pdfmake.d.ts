// src/types/pdfmake.d.ts

declare module "pdfmake/build/pdfmake" {
  import pdfMake from "pdfmake";
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const pdfFonts: {
    pdfMake: {
      vfs: any;
    };
  };
  export default pdfFonts;
}
