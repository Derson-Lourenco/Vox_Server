const express = require('express');
const axios = require('axios');

const router = express.Router();

module.exports = connection => {
  // Rota para buscar licitações
  router.get('/', async (req, res) => {
    const userId = req.user.id; // Supondo que você tem o ID do usuário logado aqui

    try {
      // 1. Buscar o ID do município associado ao usuário
      const [municipioResult] = await connection.query(
        'SELECT municipio_id FROM municipios_usuario WHERE id_usuario = ?',
        [userId]
      );

      if (!municipioResult.length) {
        return res.status(404).json({ error: 'Nenhum município encontrado para o usuário.' });
      }

      const municipioId = municipioResult[0].municipio_id;

      console.log(`Buscando licitações para o município ID: ${municipioId}`); // Log para o ID do município

      // 2. Obter as licitações para o município encontrado
      const licitacoesResponse = await axios.get(
        `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${municipioId}`
      );

      console.log(`Licitações recebidas para município ID: ${municipioId}`, licitacoesResponse.data); // Log das licitações recebidas

      // Retornar os dados de licitações
      res.json(licitacoesResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error.message);
      res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
  });

  return router; // Retorne o router aqui
}
