const express = require('express');
const axios = require('axios');

const router = express.Router();

module.exports = connection => {
  // Rota para buscar municípios do usuário
  router.get('/municipios/:idUsuario', async (req, res) => {
    const { idUsuario } = req.params;

    try {
      const [rows] = await connection.execute(
        'SELECT municipio_id FROM municipios_usuario WHERE id_usuario = ?',
        [idUsuario]
      );

      const municipioIds = rows.map(row => row.municipio_id);

      res.json(municipioIds);
    } catch (error) {
      console.error('Erro ao buscar municípios do usuário:', error.message);
      res.status(500).json({ error: 'Erro ao buscar municípios.' });
    }
  });

  // Rota para buscar licitações
  router.get('/licitacoes/:idUsuario', async (req, res) => {
    const { idUsuario } = req.params;

    try {
      // 1. Obter os IDs dos municípios do usuário
      const municipiosResponse = await axios.get(`${apiUrl}/municipios/${idUsuario}`);
      const idsPredefinidos = municipiosResponse.data;

      console.log('IDs de Municípios do Usuário:', idsPredefinidos);

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
