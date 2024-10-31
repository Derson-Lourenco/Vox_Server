const express = require('express');
const router = express.Router();

// Recebe a conexão MySQL como argumento
module.exports = connection => {
  // Rota para obter todos os contratos
  // Rota para obter contratos do usuário logado
  router.get('/getContratos/:userId', (req, res) => {
    const userId = req.params.userId; // Pega o ID do usuário da URL
    connection.query('SELECT * FROM contratos WHERE cliente_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Erro ao obter contratos:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
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
      cliente_id
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
        secretarias,
        cliente_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      cliente_id
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao salvar contrato:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
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
        return res.status(500).json({ error: 'Erro interno do servidor' });
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
      cliente_id
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
        secretarias = ?,
        cliente_id = ?
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
      cliente_id,
      id
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao atualizar contrato:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (result.affectedRows > 0) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: 'Contrato não encontrado' });
      }
    });
  });

  // Rota para obter detalhes de um contrato específico
  router.get('/detalheContrato/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM contratos WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Erro ao buscar contrato:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      res.status(200).json({ success: true, contrato: result[0] });
    });
  });

  
  return router;
};
