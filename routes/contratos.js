const express = require('express');
const router = express.Router();

// Receba a conexão MySQL como argumento
module.exports = (connection) => {
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

  // Rota para atualizar um contrato
  router.put('/atualizarContrato/:id', (req, res) => {
    const id = req.params.id;
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
      UPDATE contratos
      SET
        processoAno = ?,
        numeroContrato = ?,
        modalidade = ?,
        registro = ?,
        orgao = ?,
        cnpjContratante = ?,
        valorContratado = ?,
        dataAssinatura = ?,
        dataInicio = ?,
        dataFinalizacao = ?,
        objetoContrato = ?,
        secretarias = ?
      WHERE id = ?
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
      id
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao atualizar contrato:', err);
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

  // Rota para obter detalhes de um contrato específico
  router.get('/getContratos/:id', (req, res) => {
    const { id } = req.params;

    connection.query('SELECT * FROM contratos WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Erro ao buscar contrato:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
        return;
      }

      if (result.length === 0) {
        res.status(404).json({ error: 'Contrato não encontrado' });
      } else {
        res.status(200).json({ success: true, contrato: result[0] });
      }
    });
  });


  return router;
};
