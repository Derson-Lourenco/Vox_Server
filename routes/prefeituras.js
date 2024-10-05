const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://sistemas.tce.pi.gov.br/api/portaldacidadania//prefeituras');
    const municipios = response.data;

    // Verificando se os dados estão disponíveis
    if (!municipios || !Array.isArray(municipios)) {
      return res.status(500).json({ message: 'Dados de municípios não disponíveis' });
    }

    // Transformando o resultado
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

module.exports = router;
