const express = require('express');
const axios = require('axios');

const router = express.Router();

// Rota para obter a lista de municípios
router.get('/', async (req, res) => {
  try {
    // 1. Fazer a requisição para a API de municípios
    console.log('Fazendo requisição para a API de Municípios...');
    const response = await axios.get('http://sistemas.tce.pi.gov.br/api/portaldacidadania//prefeituras');
    console.log('Resposta da API de Municípios:', response.data); // Para verificar a resposta

    const municipios = response.data; // Obter a lista de municípios

    // 2. Verifique se os dados estão disponíveis
    if (!municipios || !Array.isArray(municipios.prefeituras)) {
      console.error('Dados de municípios não disponíveis:', municipios);
      return res.status(500).json({ message: 'Dados de municípios não disponíveis' });
    }

    // 3. Filtrar e mapear apenas o ID e o nome
    const resultado = municipios.prefeituras.map(municipio => ({
      id: municipio.id,
      nome: municipio.nome
    }));

    console.log('Resultado:', resultado); // Para visualizar o resultado no console

    // 4. Retornar os dados filtrados
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar municípios:', error.message);
    res.status(500).json({ message: 'Erro ao buscar municípios' });
  }
});

module.exports = (connection) => {
  return router; // Retorne o router para uso no server.js
};
