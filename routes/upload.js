const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

// Rota para upload da planilha
router.post('/upload', upload.single('excel'), async (req, res) => {
  try {
    // Lógica para manipular o arquivo Excel e salvar os dados no banco de dados
    const filePath = req.file.path;

    // Aqui você pode adicionar a lógica para processar o arquivo Excel e salvar no banco de dados

    res.json({ success: true, message: 'Dados salvos com sucesso no banco de dados.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao salvar os dados.' });
  }
});

module.exports = router;
