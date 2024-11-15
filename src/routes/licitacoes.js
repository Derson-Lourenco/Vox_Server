    const express = require('express');
    const axios = require('axios');

    const router = express.Router();

    // Função para criar a rota, aceitando a conexão com o banco de dados
    module.exports = connection => {
      // Rota para buscar licitações
      router.get('/', async (req, res) => {
        const idUsuario = req.query.idUsuario; // Agora pega do frontend
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

                const licitacoesResponse = await axios.get(
                  `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`
                );

                console.log(`Licitações recebidas para ID: ${idUnidadeGestora}`, licitacoesResponse.data); // Log das licitações recebidas
                return { idUnidadeGestora, licitacoes: licitacoesResponse.data };
              });

              const licitacoesResults = await Promise.all(licitacoesPromises);
              console.log('Resultados de licitações:', licitacoesResults); // Log dos resultados obtidos

              // 3. Buscar detalhes para cada licitação
              const detalhesPromises = licitacoesResults.flatMap(
                ({ idUnidadeGestora, licitacoes }) =>
                  licitacoes.map(async licitacao => {
                    console.log(`Buscando detalhes para licitação ${licitacao.id} do ID ${idUnidadeGestora}`); // Log para cada detalhe de licitação

                    const formattedDate = licitacao.data.split('T')[0].replace(/-/g, ''); // Formatar data para AAAAMMDD
                    const detalhesResponse = await axios.get(
                      `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}/1/${formattedDate}`
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
            }
          );
        } catch (error) {
          console.error('Erro ao buscar dados:', error.message);
          res.status(500).json({ error: 'Erro ao buscar dados.' });
        }
      });

      // Rota para salvar licitação
      // Rota para salvar licitação
    router.post('/salvar_licitacao', (req, res) => {
      const { idUsuario, orgao, modalidade, valorPrevisto, data, link } = req.body;

      if (!idUsuario || !orgao || !modalidade || !valorPrevisto || !data || !link) {
        return res.status(400).json({ error: 'Dados incompletos.' });
      }

      const query = `
        INSERT INTO licitacoes_salvas (id_usuario, orgao, modalidade, valor_previsto, data, link)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      connection.query(query, [idUsuario, orgao, modalidade, valorPrevisto, data, link], (error, results) => {
        if (error) {
          console.error('Erro ao salvar licitação:', error);
          return res.status(500).json({ error: 'Erro ao salvar licitação.' });
        }

        res.status(200).json({ message: 'Licitação salva com sucesso.' });
      });
    });

    // Rota para buscar as licitações salvas
    router.get('/salvas/:idUsuario', (req, res) => {
      const { idUsuario } = req.params;  // Corrigido para acessar req.params

      console.log('ID do usuário recebido:', idUsuario);  // Log para depuração

      if (!idUsuario) {
        return res.status(400).json({ error: 'Parâmetro idUsuario é necessário.' });
      }

      const query = 'SELECT * FROM licitacoes_salvas WHERE id_usuario = ?';
      connection.query(query, [idUsuario], (error, results) => {
        if (error) {
          console.error('Erro ao buscar licitações salvas:', error);  // Log de erro detalhado
          return res.status(500).json({ error: 'Erro ao buscar licitações salvas.' });
        }

        console.log('Resultados encontrados:', results);  // Log dos resultados retornados
        res.json(results);  // Retorna as licitações salvas
      });
    });

    router.delete('/salvas/:id', (req, res) => {
      const { id } = req.params;
    
      console.log('ID da licitação a ser excluída:', id);
    
      if (!id) {
        return res.status(400).json({ error: 'Parâmetro id é necessário.' });
      }
    
      const query = 'DELETE FROM licitacoes_salvas WHERE id = ?';
      connection.query(query, [id], (error, results) => {
        if (error) {
          console.error('Erro ao excluir licitação salva:', error);
          return res.status(500).json({ error: 'Erro ao excluir licitação salva.' });
        }
    
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Licitação não encontrada.' });
        }
    
        res.json({ message: 'Licitação excluída com sucesso.' });
      });
    });
    
    // Rota para obter a quantidade de licitações salvas por usuário
  router.get('/quantidadeSalvas/:idUsuario', (req, res) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
      return res.status(400).json({ error: 'Parâmetro idUsuario é necessário.' });
    }

    const query = 'SELECT COUNT(*) AS quantidade FROM licitacoes_salvas WHERE id_usuario = ?';
    connection.query(query, [idUsuario], (error, results) => {
      if (error) {
        console.error('Erro ao contar licitações salvas:', error);
        return res.status(500).json({ error: 'Erro ao contar licitações salvas.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Nenhuma licitação salva encontrada para este usuário.' });
      }

      res.json({ quantidade: results[0].quantidade });
    });
  });


      return router;
    };
