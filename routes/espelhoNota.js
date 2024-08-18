const express = require('express');
const router = express.Router();
const bd = require('../bd');

// Rota para obter detalhes de um contrato específico
router.get('/getContrato/:id', (req, res) => {
  const id = req.params.id;

  // Use o ID para buscar os detalhes do contrato no banco de dados
  const query = `
    SELECT *
    FROM contratos
    WHERE id = ?
  `;

  bd.query(query, [id], (error, results) => {
    if (error) {
      console.error('Erro ao obter detalhes do contrato:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    } else {
      // Verifique se encontrou algum contrato com o ID fornecido
      if (results.length > 0) {
        res.status(200).json({ success: true, contrato: results[0] });
      } else {
        res.status(404).json({ error: 'Contrato não encontrado' });
      }
    }
  });
});
module.exports = router;
