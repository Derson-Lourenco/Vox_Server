const express = require('express');
const axios = require('axios');

const router = express.Router();

module.exports = (connection) => {
  // Rota para buscar licitações
  router.get('/buscar:id_usuario', async (req, res) => {
    try {
      console.log('Entrou na rota GET /'); // Log indicando que a rota foi acessada

      const id_usuario = req.query.id_usuario; // Obter o ID do usuário da query string
      if (!id_usuario) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
      }

      // 1. Buscar municípios associados ao ID do usuário
      const [municipios] = await connection.execute(
        'SELECT municipio_id FROM municipios_usuario WHERE id_usuario = ?',
        [id_usuario]
      );

      if (municipios.length === 0) {
        return res.status(404).json({ message: 'Nenhum município encontrado para o usuário.' });
      }

      // 2. Obter as licitações para cada município encontrado
      const licitacoesPromises = municipios.map(async ({ municipio_id }) => {
        console.log(`Buscando licitações para município ID: ${municipio_id}`); // Log para cada ID

        const licitacoesResponse = await axios.get(
          `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${municipio_id}`
        );

        console.log(`Licitações recebidas para município ID: ${municipio_id}`, licitacoesResponse.data); // Log das licitações recebidas
        return { municipio_id, licitacoes: licitacoesResponse.data };
      });

      const licitacoesResults = await Promise.all(licitacoesPromises);

      console.log('Resultados de licitações:', licitacoesResults); // Log dos resultados obtidos

      // 3. Buscar detalhes para cada licitação
      const detalhesPromises = licitacoesResults.flatMap(
        ({ municipio_id, licitacoes }) =>
          licitacoes.map(async (licitacao) => {
            console.log(`Buscando detalhes para licitação ${licitacao.id} do município ID ${municipio_id}`); // Log para cada detalhe de licitação

            const formattedDate = licitacao.data.split('T')[0].replace(/-/g, ''); // Formatar data para AAAAMMDD
            const detalhesResponse = await axios.get(
              `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${municipio_id}/1/${formattedDate}`
            );

            console.log(`Detalhes recebidos para licitação ${licitacao.id}`, detalhesResponse.data); // Log dos detalhes recebidos
            return detalhesResponse.data;
          })
      );

      const detalhesArray = await Promise.all(detalhesPromises);
      const detalhesFlattened = detalhesArray.flat();

      console.log('Detalhes combinados:', detalhesFlattened); // Log dos detalhes finais

      // Retornar os dados combinados
      res.json(detalhesFlattened);
    } catch (error) {
      console.error('Erro ao buscar dados:', error.message);
      res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
  });

  return router; // Retorne o router aqui
};
