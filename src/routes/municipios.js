const express = require('express');
const axios = require('axios');

const createMunicipiosRouter = (connection) => {
  const router = express.Router();

  // Rota para buscar municípios
  router.get('/', async (req, res) => {
    try {
      const response = await axios.get('http://sistemas.tce.pi.gov.br/api/portaldacidadania//prefeituras');
      const municipios = response.data;

      if (!municipios || !Array.isArray(municipios)) {
        return res.status(500).json({ message: 'Dados de municípios não disponíveis' });
      }

      const resultado = municipios.map(municipio => ({
        id: municipio.id,
        nome: municipio.nome,
      }));

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao buscar municípios:', error.message);
      res.status(500).json({ message: 'Erro ao buscar municípios', error: error.message });
    }
  });
  // Exemplo de rota para buscar municípios salvos
  router.get('/municipios/salvos/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;

    const query = 'SELECT municipio_id, nome_municipio FROM municipios_usuario WHERE id_usuario = ?';
    
    connection.query(query, [id_usuario], (error, results) => {
      if (error) {
        console.error('Erro ao buscar municípios salvos:', error);
        return res.status(500).json({ message: 'Erro ao buscar municípios salvos' });
      }
      res.status(200).json(results);
    });
  });
  // Rota para salvar municípios selecionados com o ID do usuário
  router.post('/salvar-prefeituras', async (req, res) => {
    const { municipios, id_usuario } = req.body;

    if (!municipios || !id_usuario) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    try {
      // Verifique se os municípios já estão salvos para o usuário
      const idsMunicipios = municipios.map(municipio => municipio.municipio_id);
      const queryVerificacao = 'SELECT municipio_id FROM municipios_usuario WHERE municipio_id IN (?) AND id_usuario = ?';
      
      connection.query(queryVerificacao, [idsMunicipios, id_usuario], (error, results) => {
        if (error) {
          console.error('Erro ao verificar municípios:', error);
          return res.status(500).json({ message: 'Erro ao verificar municípios' });
        }

        const municipiosExistentes = results.map(row => row.municipio_id);
        const municipiosNovos = municipios.filter(municipio => !municipiosExistentes.includes(municipio.municipio_id));

        // Se não houver novos municípios, retorne uma mensagem apropriada
        if (municipiosNovos.length === 0) {
          return res.status(409).json({ message: 'Todos os municípios já estão salvos para este usuário.' });
        }

        const values = municipiosNovos.map(municipio => [municipio.municipio_id, municipio.nome_municipio, id_usuario]);
        const queryInsercao = 'INSERT INTO municipios_usuario (municipio_id, nome_municipio, id_usuario) VALUES ?';

        connection.query(queryInsercao, [values], (error) => {
          if (error) {
            console.error('Erro ao inserir municípios:', error);
            return res.status(500).json({ message: 'Erro ao salvar municípios' });
          }
          res.status(200).json({ message: 'Municípios salvos com sucesso!' });
        });
      });
    } catch (error) {
      console.error('Erro ao processar a solicitação de salvamento:', error);
      res.status(500).json({ message: 'Erro ao salvar municípios' });
    }
  });

  // Rota para remover municípios
  router.post('/remover-prefeituras', async (req, res) => {
    const { municipios, id_usuario } = req.body;

    if (!municipios || !id_usuario) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    const queryRemocao = 'DELETE FROM municipios_usuario WHERE municipio_id IN (?) AND id_usuario = ?';

    connection.query(queryRemocao, [municipios, id_usuario], (error) => {
      if (error) {
        console.error('Erro ao remover municípios:', error);
        return res.status(500).json({ message: 'Erro ao remover municípios' });
      }
      res.status(200).json({ message: 'Municípios removidos com sucesso!' });
    });
  });

  return router;
};

module.exports = createMunicipiosRouter;
