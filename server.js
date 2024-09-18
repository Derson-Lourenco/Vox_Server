const express = require('express');
const cors = require('cors');
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

// Importa e usa as rotas definidas em contratos.js
const contratosRouter = require('./routes/contratos')(connection);
app.use('/contratos', contratosRouter);

// Importa e usa as rotas definidas em licitacoes.js
const licitacoesRouter = require('./routes/licitacoes')(connection);
app.use('/licitacoes', licitacoesRouter);

const clientesRouter = require('./routes/clientes')(connection);
app.use('/clientes', clientesRouter);
// Inicia o servidor
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
