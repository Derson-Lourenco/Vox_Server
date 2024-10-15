const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente do arquivo .env, se existir
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
    'https://voxgerenciador.netlify.app', // URL do frontend em produção
    'http://localhost:3000' // URL do frontend local
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

// Rota para salvar municípios
app.post('/salvar-municipios', (req, res) => {
  const { municipios } = req.body;

  // Validação dos dados recebidos
  if (!municipios || !Array.isArray(municipios)) {
    return res.status(400).json({ message: 'Dados inválidos.' });
  }

  const query = 'INSERT INTO municipios (id) VALUES ?';
  const values = municipios.map(id => [id]); // Formata os dados para a consulta

  // Executa a consulta ao banco de dados
  connection.query(query, [values], (error, results) => {
    if (error) {
      console.error('Erro ao salvar municípios:', error);
      return res.status(500).json({ message: 'Erro ao salvar municípios' });
    }

    res.status(201).json({ message: 'Municípios salvos com sucesso!' });
  });
});

// Importa e usa as rotas para páginas (descomente conforme necessário)
const clientesRouter = require('./routes/clientes')(connection);
app.use('/clientes', clientesRouter);

const loginRouter = require('./routes/login')(connection);
app.use('/login', loginRouter);

const contratosRouter = require('./routes/contratos')(connection);
app.use('/contratos', contratosRouter);

const licitacoesRouter = require('./routes/licitacoes')(connection);
app.use('/licitacoes', licitacoesRouter);

// Inicializa o servidor na porta especificada
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
