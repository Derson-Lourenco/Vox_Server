const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb'); // Importando ObjectId

// Obtendo a referência ao banco de dados a partir do app.locals
const db = require('../server').db; // Ajuste o caminho se necessário

// Rota para obter detalhes do contrato
router.get('/getContratos', async (req, res) => {
  try {
    const collection = db.collection('contratos'); // Substitua 'contratos' pelo nome da sua coleção
    const contratos = await collection.find({}).toArray();
    res.status(200).json({ success: true, contratos });
  } catch (error) {
    console.error('Erro ao obter contratos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para salvar um novo contrato
router.post('/salvarContrato', async (req, res) => {
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

  try {
    const collection = db.collection('contratos'); // Substitua 'contratos' pelo nome da sua coleção
    const result = await collection.insertOne({
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
    });

    res.status(201).json({ success: true, contratoId: result.insertedId });
  } catch (error) {
    console.error('Erro ao salvar contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para excluir um contrato
router.delete('/excluirContrato/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const collection = db.collection('contratos'); // Substitua 'contratos' pelo nome da sua coleção
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Contrato não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao excluir contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
