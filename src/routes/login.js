const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Importando bcrypt
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

// Rota principal exportada
module.exports = (connection) => {
  // Rota de login
  router.post('/', [
    check('email').isEmail().withMessage('O e-mail deve ser válido.'),
    check('senha').notEmpty().withMessage('Senha é obrigatória.'),
  ], async (req, res) => {
    console.log('Dados recebidos para login:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, senha } = req.body;

    try {
      const query = 'SELECT * FROM clientes WHERE email = ?';
      connection.query(query, [email], async (err, results) => { // Adicione "async" aqui
        if (err) {
          console.error('Erro ao buscar o usuário no banco de dados:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (results.length === 0) {
          return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }

        const user = results[0];

        // Comparando a senha usando bcrypt
        const match = await bcrypt.compare(senha, user.senha); // Usando bcrypt para comparar
        if (!match) {
          return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }

        // Gerar um token JWT
        const token = jwt.sign({ email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.json({ success: true, token });
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
  });

  // Rota para mostrar usuários (apenas para testes!)
  router.get('/usuarios', async (req, res) => {
    try {
      const query = 'SELECT email, senha FROM clientes'; // Altere os campos conforme necessário
      connection.query(query, (err, results) => {
        if (err) {
          console.error('Erro ao buscar usuários no banco de dados:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        console.log('Usuários:', results);
        res.json({ success: true, usuarios: results });
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuários.' });
    }
  });

  // Rota de Dashboard
  router.get('/dashboard', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado, apenas administradores podem acessar esta rota.' });
    }
    res.json({ message: 'Bem-vindo ao dashboard do administrador!' });
  });

  return router;
};
