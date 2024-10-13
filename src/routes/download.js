const express = require('express');
const router = express.Router();
const path = require('path');

// Rota para download do modelo de planilha
router.get('/download-template', (req, res) => {
  try {
    const file = path.join(__dirname, '..', 'uploads', 'modelo_planilha.xlsx'); // Caminho real do seu modelo
    res.download(file);
  } catch (error) {
    console.error('Erro ao baixar o modelo de planilha', error);
    res.status(500).json({ success: false, message: 'Erro ao baixar o modelo de planilha.' });
  }
});

module.exports = router;
