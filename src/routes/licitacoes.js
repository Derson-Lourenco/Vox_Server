const express = require('express')
const axios = require('axios')

const router = express.Router()

// Lista fixa de IDs predefinidos
const idsPredefinidos = ['127', '1478'] // IDs fixos para teste

module.exports = connection => {
  // Rota para buscar licitações
  router.get('/', async (req, res) => {
    try {
      console.log('Entrou na rota GET /') // Log indicando que a rota foi acessada

      // 1. Obter as licitações para cada ID predefinido
      const licitacoesPromises = idsPredefinidos.map(async idUnidadeGestora => {
        console.log(`Buscando licitações para ID: ${idUnidadeGestora}`) // Log para cada ID

        const licitacoesResponse = await axios.get(
          `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`
        )

        console.log(`Licitações recebidas para ID: ${idUnidadeGestora}`, licitacoesResponse.data) // Log das licitações recebidas
        return { idUnidadeGestora, licitacoes: licitacoesResponse.data }
      })

      const licitacoesResults = await Promise.all(licitacoesPromises)

      console.log('Resultados de licitações:', licitacoesResults) // Log dos resultados obtidos

      // 2. Buscar detalhes para cada licitação
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
