const express = require('express');
const axios = require('axios');

const router = express.Router();

// Função para criar a rota, aceitando a conexão com o banco de dados
module.exports = connection => {
  // Rota para buscar licitações
  router.get('/:id_usuario', async (req, res) => {
    const idUsuario = 11// ID do usuário vindo da requisição

    try {
      console.log('Entrou na rota GET /');

      // 1. Consultar o banco de dados para obter os municipio_id com base no id_usuario
      connection.query(
        'SELECT municipio_id FROM municipios_usuario WHERE id_usuario = ?',
        [idUsuario],
        async (error, results) => {
          if (error) {
            console.error('Erro ao buscar IDs dos municípios:', error);
            return res.status(500).json({ error: 'Erro ao buscar IDs dos municípios' });
          }

          // Verifica se encontrou resultados
          if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhum município encontrado para este usuário' });
          }

          // Extrai os municipio_id dos resultados
          const idsPredefinidos = results.map(row => row.municipio_id);

          // 2. Obter as licitações para cada ID predefinido
          const licitacoesPromises = idsPredefinidos.map(async idUnidadeGestora => {
            console.log(`Buscando licitações para ID: ${idUnidadeGestora}`); // Log para cada ID

            try {
              const licitacoesResponse = await axios.get(
                `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`
              );
              return {
                idUnidadeGestora,
                licitacoes: licitacoesResponse.data,
              };
            } catch (erroAxios) {
              console.error(`Erro ao buscar licitações para ID ${idUnidadeGestora}:`, erroAxios);
              return {
                idUnidadeGestora,
                error: 'Erro ao buscar licitações',
              };
            }
          });

          // Aguarda todas as promessas serem resolvidas
          const licitacoesResultados = await Promise.all(licitacoesPromises);

          // Retorna as licitações encontradas
          res.status(200).json(licitacoesResultados);
        }
      );
    } catch (err) {
      console.error('Erro geral:', err);
      res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
  });

  return router;
};
