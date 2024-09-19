const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

module.exports = (connection) => {
  router.post('/register', async (req, res) => {
    const { nome, cpf_cnpj, email, password } = req.body;

    if (!nome || !cpf_cnpj || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    try {
      // Criptografa a senha
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `INSERT INTO clientes (nome, cpf_cnpj, email, senha) VALUES (?, ?, ?, ?)`;
      connection.query(query, [nome, cpf_cnpj, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Erro ao registrar cliente:', err);
          return res.status(500).json({ error: 'Erro ao registrar cliente' });
        }
        res.status(201).json({ message: 'Cliente registrado com sucesso!' });
      });
    } catch (error) {
      console.error('Erro ao criptografar a senha:', error);
      res.status(500).json({ error: 'Erro ao criptografar a senha' });
    }
  });

  return router;
};
