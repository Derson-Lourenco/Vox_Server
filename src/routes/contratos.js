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

  router.post('/upload-proposta/:userId/:contratoId', async (req, res) => {
    const { data } = req.body;
    const { userId, contratoId } = req.params;
  
    try {
      // Itera sobre cada linha dos dados recebidos
      for (let row of data) {
        const {
          codProd,
          itens,
          descricao,
          und,
          qnt,
          marca,
          fabricante,
          valor_unit,
          valor_total
        } = row;
  
        // Query para inserir os dados na tabela PropostaReadequada
        const sql = `
          INSERT INTO PropostaReadequada (
            user_id, contrato_id, codProd, itens, descricao, und, qnt, marca, fabricante, valor_unit, valor_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
  
        const values = [
          userId,
          contratoId,
          codProd,
          itens,
          descricao,
          und,
          qnt,
          marca || null, // Insere NULL se não houver marca
          fabricante || null, // Insere NULL se não houver fabricante
          valor_unit,
          valor_total
        ];
  
        // Executa a query de inserção
        await new Promise((resolve, reject) => {
          connection.query(sql, values, (err, result) => {
            if (err) {
              console.error('Erro ao salvar proposta:', err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      res.status(500).json({ success: false, message: 'Erro ao salvar dados' });
    }
  });
  
  router.get('/propostas/:userId/:contratoId', async (req, res) => {
    const { userId, contratoId } = req.params;
  
    if (!userId || !contratoId) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos ou ausentes' });
    }
  
    try {
      const sql = `
        SELECT 
          id, codProd, itens, descricao, quantidade_atual 
        FROM PropostaReadequada
        WHERE user_id = ? AND contrato_id = ?
      `;
  
      connection.query(sql, [userId, contratoId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar propostas:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar dados' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Nenhuma proposta encontrada' });
        }
  
        res.json({ success: true, data: results });
      });
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
      res.status(500).json({ success: false, message: 'Erro ao processar a solicitação' });
    }
  });
  
  
  
  router.put('/propostas/:id/retirar', async (req, res) => {
    const { id } = req.params;
    const { quantidade } = req.body;
  
    try {
      // Atualiza a quantidade atual subtraindo a quantidade retirada
      const sql = `
        UPDATE PropostaReadequada
        SET quantidade_atual = quantidade_atual - ?
        WHERE id = ? AND quantidade_atual >= ?
      `;
  
      connection.query(sql, [quantidade, id, quantidade], (err, result) => {
        if (err) {
          console.error('Erro ao atualizar quantidade:', err);
          return res.status(500).json({ success: false, message: 'Erro ao atualizar quantidade' });
        }
  
        if (result.affectedRows === 0) {
          return res.status(400).json({ success: false, message: 'Quantidade insuficiente para retirada' });
        }
  
        res.json({ success: true, message: 'Quantidade atualizada com sucesso' });
      });
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
      res.status(500).json({ success: false, message: 'Erro ao processar a solicitação' });
    }
  });
  
  return router;
};
