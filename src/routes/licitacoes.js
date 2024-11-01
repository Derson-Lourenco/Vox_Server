// api.js (ou o arquivo onde você define as rotas)
const express = require('express');
const axios = require('axios');

const router = express.Router();

module.exports = (connection) => {
  // Rota para buscar os municípios do usuário logado
  router.get('/municipios', async (req, res) => {
    const userId = req.user.id; // Supondo que você tenha uma forma de acessar o ID do usuário logado

    try {
      const [rows] = await connection.execute(
        'SELECT municipio_id FROM municipios_usuario WHERE id_usuario = ?',
        [userId]
      );
      
      const municipioIds = rows.map(row => row.municipio_id);
      res.json(municipioIds);
    } catch (error) {
      console.error('Erro ao buscar municípios do usuário:', error.message);
      res.status(500).json({ error: 'Erro ao buscar municípios do usuário.' });
    }
  });

  // Rota para buscar licitações
  router.get('/licitacoes', async (req, res) => {
    try {
      console.log('Entrou na rota GET /licitacoes');

      // 1. Obter os IDs dos municípios do usuário
      const response = await axios.get(`${req.protocol}://${req.get('host')}/municipios`);
      const idsPredefinidos = response.data;

      // 2. Obter as licitações para cada ID de município
      const licitacoesPromises = idsPredefinidos.map(async idUnidadeGestora => {
        console.log(`Buscando licitações para ID: ${idUnidadeGestora}`);

        const licitacoesResponse = await axios.get(
          `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`
        );

        console.log(`Licitações recebidas para ID: ${idUnidadeGestora}`, licitacoesResponse.data);
        return { idUnidadeGestora, licitacoes: licitacoesResponse.data };
      });

      const licitacoesResults = await Promise.all(licitacoesPromises);
      console.log('Resultados de licitações:', licitacoesResults);

      // 3. Buscar detalhes para cada licitação
      const detalhesPromises = licitacoesResults.flatMap(
        ({ idUnidadeGestora, licitacoes }) =>
          licitacoes.map(async licitacao => {
            console.log(`Buscando detalhes para licitação ${licitacao.id} do ID ${idUnidadeGestora}`);

            const formattedDate = licitacao.data.split('T')[0].replace(/-/g, '');
            const detalhesResponse = await axios.get(
              `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}/1/${formattedDate}`
            );

            console.log(`Detalhes recebidos para licitação ${licitacao.id}`, detalhesResponse.data);
            return detalhesResponse.data;
          })
      );

      const detalhesArray = await Promise.all(detalhesPromises);
      const detalhesFlattened = detalhesArray.flat();
      console.log('Detalhes combinados:', detalhesFlattened);

      res.json(detalhesFlattened);
    } catch (error) {
      console.error('Erro ao buscar dados:', error.message);
      res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
  });

  return router;
};
