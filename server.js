const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');  // Adicione o axios para fazer a requisição à API do TCE
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;


// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'vox.c34okqo2iv4k.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'dersonls',
  password: process.env.DB_PASSWORD || 'Lara795816',
  database: process.env.DB_NAME || 'gerenciador'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!');
});

// Configuração do CORS
const corsOptions = {
  origin: [
    'https://voxgerenciador.netlify.app', // URL de produção
    'http://localhost:3000' // URL do frontend local
  ]
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' https://www.gstatic.com");
  next();
});

app.use(express.json());

// Middleware para registrar solicitações
app.use((req, res, next) => {
  console.log(`Recebida solicitação: ${req.method} ${req.url}`);
  next();
});

// Nova rota para consumir a API do TCE-PI

app.use(express.json());

// Lista fixa de IDs predefinidos

// Rota unificada para buscar as licitações e seus detalhes com IDs fixos
app.get('/api/licitacoes-com-detalhes', async (req, res) => {
  
  const idsPredefinidos = ['127', '129']; // Adicione os IDs que você deseja
  try {
    // 1. Obter as licitações para cada ID predefinido
    const licitacoesPromises = idsPredefinidos.map(async (idUnidadeGestora) => {
      const licitacoesResponse = await axios.get(`https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}`);
      return { idUnidadeGestora, licitacoes: licitacoesResponse.data };
    });

    const licitacoesResults = await Promise.all(licitacoesPromises);

    // 2. Buscar detalhes para cada licitação
    const detalhesPromises = licitacoesResults.flatMap(({ idUnidadeGestora, licitacoes }) => 
      licitacoes.map(async (licitacao) => {
        const formattedDate = licitacao.data.split('T')[0].replace(/-/g, ''); // Formatar data para AAAAMMDD
        const detalhesResponse = await axios.get(`https://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}/1/${formattedDate}`);
        return detalhesResponse.data;
      })
    );

    const detalhesArray = await Promise.all(detalhesPromises);
    const detalhesFlattened = detalhesArray.flat();

    // Retornar os dados combinados
    res.json(detalhesFlattened);
  } catch (error) {
    console.error('Erro ao buscar dados:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
});

// app.listen(port, () => {
//   console.log(`API rodando em http://localhost:${port}`);
// });



// Importa e usa as rotas definidas em contratos.js
const contratosRouter = require('./routes/contratos')(connection);
app.use('/contratos', contratosRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
