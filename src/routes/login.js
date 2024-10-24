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

// Rota principal exportada
module.exports = (connection) => {
  // Rota de login
  router.post('/login', [
    check('cpf_cnpj').isLength({ min: 11, max: 14 }).withMessage('CPF/CNPJ deve ter entre 11 e 14 caracteres'),
    check('password').notEmpty().withMessage('Senha é obrigatória'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { cpf_cnpj, password } = req.body;

    try {
      const query = 'SELECT * FROM clientes WHERE cpf_cnpj = ?';
      connection.query(query, [cpf_cnpj], async (err, results) => {
        if (err) {
          console.error('Erro ao buscar o usuário no banco de dados:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (results.length === 0) {
          return res.status(401).json({ success: false, message: 'CPF/CNPJ ou senha incorretos.' });
        }

        const user = results[0];

        // Comparar a senha fornecida com a senha armazenada
        const passwordMatch = await bcrypt.compare(password, user.senha);
        if (!passwordMatch) {
          return res.status(401).json({ success: false, message: 'CPF/CNPJ ou senha incorretos.' });
        }

        // Se a senha estiver correta, gere um token JWT
        const token = jwt.sign({ cpf_cnpj: user.cpf_cnpj, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.json({ success: true, token });
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
  });

  // Rota para mostrar usuários e senhas (apenas para testes!)
  router.get('/usuarios', async (req, res) => {
    try {
      const query = 'SELECT cpf_cnpj, senha FROM clientes'; // Altere os campos conforme necessário
      connection.query(query, (err, results) => {
        if (err) {
          console.error('Erro ao buscar usuários no banco de dados:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        // Exibe os usuários e senhas no console
        console.log('Usuários e senhas:', results);
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
