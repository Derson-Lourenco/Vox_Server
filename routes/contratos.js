const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: 'vox.c34okqo2iv4k.us-east-1.rds.amazonaws.com',
  user: 'dersonls',
  password: 'Lara795816',
  database: 'gerenciador'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  }
});

// Rota para obter detalhes dos contratos
router.get('/getContratos', (req, res) => {
  connection.query('SELECT * FROM contratos', (err, results) => {
    if (err) {
      console.error('Erro ao obter contratos:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    res.status(200).json({ success: true, contratos: results });
  });
});

// Rota para salvar um novo contrato
router.post('/salvarContrato', (req, res) => {
  const {
    processoAno,
    numeroContrato,
    modalidade,
    registro,
    orgao,
    cnpjContratante,
    valorContratado,
    dataAssinatura,
    dataInicio,
    dataFinalizacao,
    objetoContrato,
    secretarias,
  } = req.body;

  const sql = `
    INSERT INTO contratos (
      processoAno,
      numeroContrato,
      modalidade,
      registro,
      orgao,
      cnpjContratante,
      valorContratado,
      dataAssinatura,
      dataInicio,
      dataFinalizacao,
      objetoContrato,
      secretarias
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    processoAno,
    numeroContrato,
    modalidade,
    registro,
    orgao,
    cnpjContratante,
    valorContratado,
    dataAssinatura,
    dataInicio,
    dataFinalizacao,
    objetoContrato,
    secretarias,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao salvar contrato:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
    res.status(201).json({ success: true, contratoId: result.insertId });
  });
});

// Rota para excluir um contrato
router.delete('/excluirContrato/:id', (req, res) => {
  const id = req.params.id;

  connection.query('DELETE FROM contratos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Erro ao excluir contrato:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Contrato não encontrado' });
    }
  });
});

module.exports = router;
