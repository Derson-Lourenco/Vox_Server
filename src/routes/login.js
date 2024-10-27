const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

// Middleware para autenticação JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Acesso negado, token não fornecido.' });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    req.user = user;
    next();
  });
};

module.exports = (connection) => {
  // Rota de login
  router.post('/getLogin', [
    check('email').isEmail().withMessage('O e-mail deve ser válido.'),
    check('senha').notEmpty().withMessage('Senha é obrigatória.'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, senha } = req.body;

    try {
      const query = 'SELECT * FROM clientes WHERE email = ?';
      connection.query(query, [email], async (err, results) => {
        if (err) {
          console.error('Erro ao buscar o usuário no banco de dados:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (results.length === 0) {
          return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }

        const user = results[0];
        const match = await bcrypt.compare(senha, user.senha);
        
        if (!match) {
          return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }

        const token = jwt.sign({ email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.json({ success: true, token });
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
  });

  // Rota de Dashboard
  router.get('/dashboard', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado, apenas administradores podem acessar esta rota.' });
    }
    res.json({ message: 'Bem-vindo ao dashboard do administrador!' });
  });

  // Rota de teste para verificar se a API está funcionando
  router.get('/teste', (req, res) => {
    res.json({ message: 'API está funcionando corretamente!' });
  });

  return router;
};
