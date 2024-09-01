const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const axios = require('axios');  // Adicione o axios para fazer a requisição à API do TCE

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
    'https://main--voxgerenciador.netlify.app', // URL de produção
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
app.get('/api/licitacoes/:idUnidadeGestora/:esfera/:data', async (req, res) => {
  const { idUnidadeGestora, esfera, data } = req.params;
  const { pagina = 1, qtdePorPagina = 10, campoOrdenacao = null, ascDesc = 0 } = req.query;

  try {
    const url = `http://sistemas.tce.pi.gov.br/api/portaldacidadania/licitacoes/${idUnidadeGestora}/${esfera}/${data}`;
    const response = await axios.get(url, {
      params: {
        pagina,
        qtdePorPagina,
        campoOrdenacao,
        ascDesc
      }
    });

    console.log('Dados recebidos do TCE-PI:', response.data);

    // Verifica se a resposta contém a chave 'licitacoes' e é um array
    if (response.data && Array.isArray(response.data.licitacoes)) {
      res.json(response.data.licitacoes);
    } else {
      console.error('Resposta da API não contém a chave "licitacoes" ou não é um array.');
      res.status(500).json({ error: 'Resposta da API não contém a chave "licitacoes" ou não é um array.' });
    }
  } catch (error) {
    console.error('Erro ao consumir a API do TCE-PI:', error.message);
    res.status(500).json({ error: 'Erro ao buscar licitações' });
  }
});




// Importa e usa as rotas definidas em contratos.js
const contratosRouter = require('./routes/contratos')(connection);
app.use('/contratos', contratosRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
