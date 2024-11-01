const express = require('express')
const axios = require('axios')

const router = express.Router()

module.exports = connection => {
  // Rota para buscar licitações
  router.get('/', async (req, res) => {
    try {
      console.log('Entrou na rota GET /') // Log indicando que a rota foi acessada

      const userId = req.query.userId; // Obter o ID do usuário da query string

      // 1. Buscar os municípios associados ao usuário no banco de dados
      const [municipios] = await connection.query('SELECT municipio_id FROM municipios_usuario WHERE id_usuario = ?', [userId]);
      
      if (municipios.length === 0) {
        return res.status(404).json({ message: 'Nenhum município encontrado para o usuário.' });
      }

      const idsMunicipios = municipios.map(municipio => municipio.municipio_id); // Extrair os IDs dos municípios

      // 2. Obter as licitações para cada ID de município
      const licitacoesPromises = idsMunicipios.map(async idUnidadeGestora => {
        console.log(`Buscando licitações para ID: ${idUnidadeGestora}`) // Log para cada ID

        const licitacoesResponse = await axios.get(
          `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`
        )

        console.log(`Licitações recebidas para ID: ${idUnidadeGestora}`, licitacoesResponse.data) // Log das licitações recebidas
        return { idUnidadeGestora, licitacoes: licitacoesResponse.data }
      })

      const licitacoesResults = await Promise.all(licitacoesPromises)

      console.log('Resultados de licitações:', licitacoesResults) // Log dos resultados obtidos

      // 3. Buscar detalhes para cada licitação
      const detalhesPromises = licitacoesResults.flatMap(
        ({ idUnidadeGestora, licitacoes }) =>
          licitacoes.map(async licitacao => {
            console.log(`Buscando detalhes para licitação ${licitacao.id} do ID ${idUnidadeGestora}`) // Log para cada detalhe de licitação

            const formattedDate = licitacao.data.split('T')[0].replace(/-/g, '') // Formatar data para AAAAMMDD
            const detalhesResponse = await axios.get(
              `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}/1/${formattedDate}`
            )

            console.log(`Detalhes recebidos para licitação ${licitacao.id}`, detalhesResponse.data) // Log dos detalhes recebidos
            return detalhesResponse.data
          })
      )

      const detalhesArray = await Promise.all(detalhesPromises)
      const detalhesFlattened = detalhesArray.flat()

      console.log('Detalhes combinados:', detalhesFlattened) // Log dos detalhes finais

      // Retornar os dados combinados
      res.json(detalhesFlattened)
    } catch (error) {
      console.error('Erro ao buscar dados:', error.message)
      res.status(500).json({ error: 'Erro ao buscar dados.' })
    }
  })

  return router // Retorne o router aqui
}
