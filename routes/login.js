// routes/login.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Validação simples de CPF/CNPJ
const validateCpfCnpj = (value) => {
  // Adicione aqui a lógica de validação para CPF/CNPJ
  if (!/^\d{11}$/.test(value) && !/^\d{14}$/.test(value)) {
    throw new Error('CPF ou CNPJ inválido');
  }
  return true;
};

// Endpoint para login
router.post('/login',
  [
    body('cpf_cnpj').custom(validateCpfCnpj),
    body('senha').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cpf_cnpj, senha } = req.body;

    try {
      // Aqui você deve buscar o usuário no banco de dados
      const usuario = await User.findOne({ cpf_cnpj }); // Substitua por sua lógica de busca

      if (!usuario) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      // Verifica a senha
      const match = await bcrypt.compare(senha, usuario.senha);
      if (!match) {
        return res.status(401).json({ message: 'Senha incorreta' });
      }

      // Crie um token JWT (opcional)
      const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ token, usuario });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  }
);

module.exports = router;
