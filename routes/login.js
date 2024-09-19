const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Supondo que a conexão com o banco de dados é passada para este módulo
module.exports = (connection) => {
  router.post('/', async (req, res) => {
    const { cpf_cnpj, password } = req.body;

    if (!cpf_cnpj || !password) {
      return res.status(400).json({ success: false, message: 'CPF/CNPJ e senha são obrigatórios.' });
    }

    // Valores fixos para teste
    const testCpfCnpj = '123'; // CPF/CNPJ fixo
    const testPassword = '123'; // Senha fixa

    try {
      // Verifica se o CPF/CNPJ e a senha coincidem com os valores fixos
      if (cpf_cnpj === testCpfCnpj && password === testPassword) {
        // Gera o token
        const token = jwt.sign({ cpf_cnpj }, 'secretKey', { expiresIn: '1h' });
        return res.json({ success: true, token });
      }

      return res.status(401).json({ success: false, message: 'CPF/CNPJ ou senha incorretos.' });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
  });

  return router;
};
