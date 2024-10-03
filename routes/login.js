const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware para autenticação JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Acesso negado, token não fornecido.' });

  // Verifica o token JWT
  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    req.user = user;
    next();
  });
};

module.exports = (connection) => {
  // Login
  router.post('/login', async (req, res) => {
    const { cpf_cnpj, password } = req.body;

    if (!cpf_cnpj || !password) {
      return res.status(400).json({ success: false, message: 'CPF/CNPJ e senha são obrigatórios.' });
    }

    // Testando login com valores fixos
    const testCpfCnpj = '123';
    const testPassword = '123';

    try {
      if (cpf_cnpj === testCpfCnpj && password === testPassword) {
        // Gera o token
        const token = jwt.sign({ cpf_cnpj }, 'secretKey', { expiresIn: '1h' });
        return res.json({ success: true, token });
      }

      return res.status(401).json({ success: false, message: 'CPF/CNPJ ou senha incorretos.' });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
  });

  // Rota protegida de exemplo
  router.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Bem-vindo ao dashboard!' });
  });

  return router;
};
