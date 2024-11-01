const express = require('express');
const axios = require('axios');

const router = express.Router();

module.exports = (connection) => {
  // Rota para buscar licitações
  router.get('/:id_usuario', async (req, res) => {
    try {
      console.log('Entrou na rota GET /');

      // Substitua aqui pelo método que você usa para obter o ID do usuário logado
      const idUsuarioLogado = req.query.idUsuario; // ou req.user.id, se você usa autenticação baseada em token

      if (!idUsuarioLogado) {
        return res.status(400).json({ error: 'ID do usuário não fornecido.' });
      }

      // Consulta no banco de dados para obter os municipios associados ao usuário logado
      const [rows] = await connection.query(
        'SELECT municipio_id FROM municipios_usuario WHERE id_usuario = ?',
        [idUsuarioLogado]
      );

      const idsMunicipios = rows.map(row => row.municipio_id.toString());

      if (idsMunicipios.length === 0) {
        return res.status(404).json({ error: 'Nenhum município encontrado para o usuário.' });
      }

      // Buscar licitações para cada ID de município obtido do banco
      const licitacoesPromises = idsMunicipios.map(async (idUnidadeGestora) => {
        console.log(`Buscando licitações para ID: ${idUnidadeGestora}`);

        const licitacoesResponse = await axios.get(
          `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`
        );

        console.log(`Licitações recebidas para ID: ${idUnidadeGestora}`, licitacoesResponse.data);
        return { idUnidadeGestora, licitacoes: licitacoesResponse.data };
      });

      const licitacoesResults = await Promise.all(licitacoesPromises);
      console.log('Resultados de licitações:', licitacoesResults);

      // Buscar detalhes para cada licitação
      const detalhesPromises = licitacoesResults.flatMap(
        ({ idUnidadeGestora, licitacoes }) =>
          licitacoes.map(async (licitacao) => {
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
