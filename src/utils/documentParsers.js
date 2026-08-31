// Document and Presentation Extractors for QuizGuard
// Client-side extraction for .pptx, .pdf, and raw text

import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up pdf.js worker reliably from bundled Vite asset with safe fallback
try {
  if (pdfjsWorker) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('[QuizGuard] PDF worker setup fallback:', e);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Clean & sanitize extracted text string
 */
export const sanitizeText = (str) => {
  if (!str) return '';
  return str
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extract slide text, slide numbers, titles, and speaker notes from a .pptx file
 * @param {File} file 
 * @returns {Promise<{ title: string, totalSlides: number, slides: Array<{ slideNumber: number, title: string, text: string, notes: string }> }>}
 */
export const parsePptxFile = async (file) => {
  if (!file) throw new Error('No file provided');
  if (!file.name.toLowerCase().endsWith('.pptx')) {
    throw new Error('Only PowerPoint (.pptx) files are supported in browser. For older .ppt, please save as .pptx first.');
  }

  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  const slideFiles = [];
  zipContent.forEach((relativePath) => {
    // Match ppt/slides/slide1.xml, slide2.xml, etc.
    const match = relativePath.match(/^ppt\/slides\/slide([0-9]+)\.xml$/i);
    if (match) {
      slideFiles.push({
        path: relativePath,
        number: parseInt(match[1], 10)
      });
    }
  });

  // Sort slides by their slide number
  slideFiles.sort((a, b) => a.number - b.number);

  if (slideFiles.length === 0) {
    throw new Error('No readable slides were found in the uploaded PowerPoint file.');
  }

  const parsedSlides = [];

  for (const slideInfo of slideFiles) {
    try {
      const slideXmlStr = await zipContent.file(slideInfo.path).async('string');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');

      // Extract all text elements (<a:t>)
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      const textArray = [];
      for (let i = 0; i < textNodes.length; i++) {
        const txt = textNodes[i].textContent?.trim();
        if (txt) textArray.push(txt);
      }

      // First substantial line as title or generic
      let slideTitle = `Slide ${slideInfo.number}`;
      if (textArray.length > 0) {
        slideTitle = textArray[0].length < 80 ? textArray[0] : `${textArray[0].substring(0, 75)}...`;
      }

      // Check for speaker notes in ppt/notesSlides/notesSlide{n}.xml
      let notesText = '';
      const notesPath = `ppt/notesSlides/notesSlide${slideInfo.number}.xml`;
      const notesFile = zipContent.file(notesPath);
      if (notesFile) {
        try {
          const notesXmlStr = await notesFile.async('string');
          const notesDoc = parser.parseFromString(notesXmlStr, 'application/xml');
          const noteNodes = notesDoc.getElementsByTagName('a:t');
          const notesArr = [];
          for (let j = 0; j < noteNodes.length; j++) {
            const nTxt = noteNodes[j].textContent?.trim();
            if (nTxt) notesArr.push(nTxt);
          }
          notesText = notesArr.join(' ');
        } catch (ne) {
          // ignore notes extraction error
        }
      }

      const fullText = sanitizeText(textArray.join('\n'));

      if (fullText.length > 0 || notesText.length > 0) {
        parsedSlides.push({
          slideNumber: slideInfo.number,
          title: slideTitle,
          text: fullText,
          notes: sanitizeText(notesText)
        });
      }
    } catch (slideErr) {
      console.warn(`Error parsing slide ${slideInfo.number}:`, slideErr);
    }
  }

  return {
    title: file.name.replace(/\.[^/.]+$/, ""),
    totalSlides: parsedSlides.length,
    slides: parsedSlides
  };
};

/**
 * Extract pages, headings, and text from a PDF file
 * @param {File} file 
 * @returns {Promise<{ title: string, totalPages: number, pages: Array<{ pageNumber: number, text: string }> }>}
 */
export const parsePdfFile = async (file) => {
  if (!file) throw new Error('No file provided');
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF (.pdf) files are supported.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ 
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    isEvalSupported: false
  });
  const pdf = await loadingTask.promise;

  const totalPages = pdf.numPages;
  const parsedPages = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      const cleanText = sanitizeText(pageText);
      if (cleanText.length > 0) {
        parsedPages.push({
          pageNumber: pageNum,
          text: cleanText
        });
      }
    } catch (pageErr) {
      console.warn(`Error parsing PDF page ${pageNum}:`, pageErr);
    }
  }

  if (parsedPages.length === 0) {
    throw new Error('No readable text could be extracted from this PDF document.');
  }

  return {
    title: file.name.replace(/\.[^/.]+$/, ""),
    totalPages: parsedPages.length,
    pages: parsedPages
  };
};

/**
 * Parse raw pasted study text into structured chunks
 * @param {string} text 
 * @param {string} customTitle 
 */
export const parseRawText = (text, customTitle = '') => {
  const clean = sanitizeText(text);
  if (!clean || clean.length < 20) {
    throw new Error('Please paste at least 20 characters of study material or lecture notes.');
  }

  // Split into logical sections/paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => sanitizeText(p))
    .filter(p => p.length > 15);

  return {
    title: customTitle.trim() || 'Study Notes Assessment',
    totalSections: paragraphs.length,
    sections: paragraphs.map((content, idx) => ({
      sectionNumber: idx + 1,
      text: content
    })),
    rawText: clean
  };
};
