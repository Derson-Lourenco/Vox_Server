// server.js
const express = require('express');
const cors = require('cors');
const connection = require('./bd'); // Importa a conexão do MySQL
const routes = require('./routes/contratos');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware para registrar solicitações
app.use((req, res, next) => {
  console.log(`Recebida solicitação: ${req.method} ${req.url}`);
  next();
});

// Roteamento
app.use('/contratos', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
