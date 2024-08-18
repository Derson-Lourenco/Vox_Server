const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb'); // Verifique se está importando corretamente

const db = require('../serve').db; // Certifique-se de que o caminho está correto

router.get('/getContratos', async (req, res) => {
  try {
    const collection = db.collection('contratos');
    const contratos = await collection.find({}).toArray();
    res.status(200).json({ success: true, contratos });
  } catch (error) {
    console.error('Erro ao obter contratos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/salvarContrato', async (req, res) => {
  // Código similar ao anterior
});

router.delete('/excluirContrato/:id', async (req, res) => {
  // Código similar ao anterior
});

module.exports = router;
