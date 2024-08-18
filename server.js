const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: 'vox.c34okqo2iv4k.us-east-1.rds.amazonaws.com', // Substitua pelo seu endpoint da AWS
  user: 'dersonls', // Substitua pelo seu usuário do MySQL
  password: 'Lara795816', // Substitua pela sua senha do MySQL
  database: 'gerenciador' // Substitua pelo nome do seu banco de dados
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!');
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware para registrar solicitações
app.use((req, res, next) => {
  console.log(`Recebida solicitação: ${req.method} ${req.url}`);
  next();
});

// Definindo rotas diretamente aqui
app.use('/contratos', (req, res) => {
  // Exemplo de rota para '/contratos'
  // Substitua o código abaixo pelo que você precisa
  if (req.method === 'GET') {
    connection.query('SELECT * FROM contratos', (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao consultar contratos' });
      }
      res.json(results);
    });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
});

// Endpoint de verificação de saúde
app.get('/health', (req, res) => {
  res.sendFile(path.join(__dirname, 'health.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
