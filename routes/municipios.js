const express = require('express');
const axios = require('axios');

module.exports = (connection) => {
  const router = express.Router();

  // Rota para obter a lista de municípios
  router.get('/', async (req, res) => {
    try {
      const response = await axios.get('http://sistemas.tce.pi.gov.br/api/portaldacidadania//prefeituras');
      const municipios = response.data.prefeituras;

      // Mapeia os dados para retornar apenas id e nome
      const resultado = municipios.map(municipio => ({
        id: municipio.id,
        nome: municipio.nome
      }));

      res.json(resultado); // Retorna a lista de municípios
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      res.status(500).json({ message: 'Erro ao buscar municípios' });
    }
  });

  return router; // Retorna o router para uso no server.js
};
