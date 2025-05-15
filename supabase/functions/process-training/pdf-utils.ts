// pdf-utils.ts
import { PDFDocument } from "pdf-lib";

export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    // Get the PDF data as ArrayBuffer
    const pdfData = await response.arrayBuffer();

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfData);
    
    // Extract text from each page
    const pages = pdfDoc.getPages();
    let extractedText = '';

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const text = await page.getText();
      extractedText += text + '\n';
    }

    // Clean up the extracted text
    return extractedText
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();               // Remove leading/trailing whitespace
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}
