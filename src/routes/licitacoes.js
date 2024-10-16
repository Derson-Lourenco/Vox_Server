const express = require('express')
const axios = require('axios')

const router = express.Router()

// Lista fixa de IDs predefinidos
const idsPredefinidos = ['127', '1681'] // IDs fixos para teste

module.exports = connection => {
  // Rota para buscar licitações
  router.get('/', async (req, res) => {
    try {
      // 1. Obter as licitações para cada ID predefinido
      const licitacoesPromises = idsPredefinidos.map(async idUnidadeGestora => {
        const licitacoesResponse = await axios.get(
          `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`
        )
        return { idUnidadeGestora, licitacoes: licitacoesResponse.data }
      })

      const licitacoesResults = await Promise.all(licitacoesPromises)

      // 2. Buscar detalhes para cada licitação
      const detalhesPromises = licitacoesResults.flatMap(
        ({ idUnidadeGestora, licitacoes }) =>
          licitacoes.map(async licitacao => {
            const formattedDate = licitacao.data.split('T')[0].replace(/-/g, '') // Formatar data para AAAAMMDD
            const detalhesResponse = await axios.get(
              `https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}/1/${formattedDate}`
            )
            return detalhesResponse.data
          })
      )

      const detalhesArray = await Promise.all(detalhesPromises)
      const detalhesFlattened = detalhesArray.flat()

      // Retornar os dados combinados
      res.json(detalhesFlattened)
    } catch (error) {
      console.error('Erro ao buscar dados:', error.message)
      res.status(500).json({ error: 'Erro ao buscar dados.' })
    }
  })

  return router // Retorne o router aqui
}
