const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // Rota para registrar um cliente
  router.post('/register', (req, res) => {
    const { nome, cpfCnpj, email, password } = req.body;

    if (!nome || !cpfCnpj || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    // Consulta para inserir o cliente no banco de dados
    const query = `INSERT INTO clientes (nome, cpfCnpj, email, password) VALUES (?, ?, ?, ?)`;

    connection.query(query, [nome, cpfCnpj, email, password], (err, result) => {
      if (err) {
        console.error('Erro ao registrar cliente:', err);
        return res.status(500).json({ error: 'Erro ao registrar cliente' });
      }
      res.status(201).json({ message: 'Cliente registrado com sucesso!' });
    });
  });

  return router;
};
