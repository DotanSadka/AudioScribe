import { jsPDF } from "jspdf";

/**
 * Generates and downloads a PDF file from the given text.
 * @param text The text content to put in the PDF.
 * @param fileName The name of the file (without extension).
 */
export const downloadPDF = (text: string, fileName: string) => {
  const doc = new jsPDF();
  
  // Settings for formatting
  const fontSize = 12;
  const lineHeight = 1.5;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - (margin * 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  // Split text into lines that fit the page width
  const lines = doc.splitTextToSize(text, maxLineWidth);

  let cursorY = margin;

  lines.forEach((line: string) => {
    // Check if we need to add a new page
    if (cursorY + 10 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += (fontSize * lineHeight * 0.3527); // Convert pt to mm approx
  });

  doc.save(`${fileName}.pdf`);
};

/**
 * Generates and downloads a TXT file from the given text.
 * @param text The text content.
 * @param fileName The name of the file (without extension).
 */
export const downloadTXT = (text: string, fileName: string) => {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `${fileName}.txt`;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
};
