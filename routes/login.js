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

    try {
      // Consulta o usuário no banco de dados pelo CPF/CNPJ
      const query = 'SELECT * FROM usuarios WHERE cpf_cnpj = ?';
      connection.query(query, [cpf_cnpj], (err, results) => {
        if (err) {
          console.error('Erro ao buscar o usuário no banco de dados:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (results.length === 0) {
          return res.status(401).json({ success: false, message: 'CPF/CNPJ ou senha incorretos.' });
        }

        const user = results[0];

        // Compara a senha fornecida com a senha armazenada (sem criptografia)
        if (password !== user.senha) {
          return res.status(401).json({ success: false, message: 'CPF/CNPJ ou senha incorretos.' });
        }

        // Gera o token JWT
        const token = jwt.sign({ cpf_cnpj: user.cpf_cnpj }, 'secretKey', { expiresIn: '1h' });
        return res.json({ success: true, token });
      });
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
