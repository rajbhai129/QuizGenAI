const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');

router.post('/extract-pdf', async (req, res) => {
  try {
    const { pdf } = req.body;
    if (!pdf) {
      return res.status(400).json({ error: 'PDF data is required' });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdf, 'base64');
    
    // Extract text using pdf-parse
    const data = await pdfParse(pdfBuffer);
    
    if (!data.text) {
      throw new Error('No text could be extracted from the PDF');
    }
    
    res.json({ text: data.text });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract text from PDF',
      details: error.message 
    });
  }
});

module.exports = router;