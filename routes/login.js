const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = (connection) => {
  router.post('/', async (req, res) => {
    const { cpf_cnpj, password } = req.body;

    if (!cpf_cnpj || !password) {
      return res.status(400).json({ success: false, message: 'CPF/CNPJ e senha são obrigatórios.' });
    }

    try {
      // Busca o usuário pelo CPF/CNPJ
      const [rows] = await connection.execute('SELECT * FROM clientes WHERE cpf_cnpj = ?', [cpf_cnpj]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
      }

      const user = rows[0];

      // Comparação da senha criptografada
      const isMatch = await bcrypt.compare(password, user.senha);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Senha incorreta.' });
      }

      // Gera o token
      const token = jwt.sign({ id: user.id, cpf_cnpj: user.cpf_cnpj }, 'secretKey', { expiresIn: '1h' });

      res.json({ success: true, token });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
  });

  return router;
};
