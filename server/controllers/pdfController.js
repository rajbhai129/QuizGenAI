const pdfParse = require('pdf-parse');

const extractPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // PDF parsing options
    const options = {
      max: 0, // No limit on pages
      version: 'v2.0.550'
    };

    try {
      const pdfBuffer = req.file.buffer;
      const data = await pdfParse(pdfBuffer, options);

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No readable text found in PDF');
      }

      // Clean up extracted text
      const cleanText = data.text
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Remove excess blank lines
        .trim();

      res.json({ text: cleanText });
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      
      // Specific error handling
      if (pdfError.message.includes('XRef')) {
        return res.status(400).json({ 
          error: 'Invalid PDF format',
          details: 'The PDF file appears to be corrupted or in an unsupported format'
        });
      }
      
      if (pdfError.message.includes('Password')) {
        return res.status(400).json({ 
          error: 'Protected PDF',
          details: 'Cannot read password-protected PDF files'
        });
      }

      throw pdfError; // Re-throw other errors
    }
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract text from PDF',
      details: error.message,
      hint: 'Try converting the PDF to text format first or use a different PDF file'
    });
  }
};

module.exports = {
  extractPdf
};