const express = require('express');
const axios = require('axios');

const createMunicipiosRouter = (connection) => {
  const router = express.Router();

  // Rota para buscar municípios
  router.get('/', async (req, res) => {
    try {
      const response = await axios.get('http://sistemas.tce.pi.gov.br/api/portaldacidadania//prefeituras');
      const municipios = response.data.prefeituras;

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

  // Rota para salvar a relação entre contrato e municípios selecionados
  router.post('/salvar-prefeituras', async (req, res) => {
    const { contrato_id, municipios } = req.body;

    if (!contrato_id || !Array.isArray(municipios)) {
      return res.status(400).json({ message: 'Dados inválidos. Necessário contrato_id e lista de municipios.' });
    }

    try {
      // Salvar cada município selecionado com o contrato_id fornecido
      const values = municipios.map((municipio_id) => [contrato_id, municipio_id]);
      const query = 'INSERT INTO municipios_PI (contrato_id, municipio_id) VALUES ?';
      await connection.query(query, [values]);

      res.status(201).json({ message: 'Municípios salvos com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar municípios:', error.message);
      res.status(500).json({ message: 'Erro ao salvar municípios' });
    }
  });

  return router;
};

module.exports = createMunicipiosRouter;
