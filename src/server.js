const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const findFreePort = require('find-free-port'); // Certifique-se de instalar essa biblioteca
const createMunicipiosRouter = require('./routes/municipios'); // Importa a função de criação do router

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const defaultPort = process.env.PORT || 5000;

// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'vox.c34okqo2iv4k.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'dersonls',
  password: process.env.DB_PASSWORD || 'Lara795816',
  database: process.env.DB_NAME || 'gerenciador'
});

// Conectar ao banco de dados MySQL
connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!');
});

// Configuração do CORS
const corsOptions = {
  origin: [
    'https://voxgerenciador.netlify.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Aplicar o middleware CORS
app.use(cors(corsOptions));
app.use(express.json()); // Permitir o uso de JSON no corpo das requisições

// Middleware para registrar solicitações
app.use((req, res, next) => {
  console.log(`Recebida solicitação: ${req.method} ${req.url}`);
  next();
});

// Rota de teste
app.get('/teste', (req, res) => {
  res.send('Servidor funcionando corretamente!');
});

// Importa e usa as rotas para páginas
const clientesRouter = require('./routes/clientes')(connection);
app.use('/clientes', clientesRouter);

// const municipiosRouter = createMunicipiosRouter(connection); // Cria o router
// app.use('/municipios', municipiosRouter);

const loginRouter = require('./routes/login')(connection);
app.use('/login', loginRouter);

const contratosRouter = require('./routes/contratos')(connection);
app.use('/contratos', contratosRouter);

const licitacoesRouter = require('./routes/licitacoes')(connection);
app.use('/licitacoes', licitacoesRouter);

// Encontre uma porta livre e inicie o servidor
findFreePort(defaultPort).then(([port]) => { // Pega o primeiro valor do array retornado
  console.log(`Porta livre encontrada: ${port}`); // Log da porta encontrada
  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}).catch((err) => {
  console.error(`Erro ao encontrar porta livre: ${err.message}`);
});
