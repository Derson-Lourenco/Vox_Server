const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

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
app.use(cors({
  origin: ['https://main--voxgerenciador.netlify.app'],
}));

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
const contratosRouter = require('./routes/contratos')(connection); // Passe a conexão como argumento
app.use('/contratos', contratosRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
