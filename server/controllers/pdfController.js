const pdfParse = require('pdf-parse');

const extractPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);

    if (!data.text) {
      throw new Error('No text could be extracted from PDF');
    }

    res.json({ text: data.text });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract text from PDF',
      details: error.message 
    });
  }
};

module.exports = {
  extractPdf
};