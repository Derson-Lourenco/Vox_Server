// Em routes/auth.js ou similar

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importar o pool ou conexão MySQL aqui

// Rota para login
router.post('/login', async (req, res) => {
  const { cpfCnpj, password } = req.body;

  if (!cpfCnpj || !password) {
    return res.status(400).json({ success: false, message: 'CPF/CNPJ e senha são obrigatórios.' });
  }

  try {
    // Consulta ao banco para verificar o CPF/CNPJ e senha
    const [rows] = await connection.execute('SELECT * FROM users WHERE cpf_cnpj = ?', [cpfCnpj]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Senha incorreta.' });
    }

    // Gerar token JWT ou outro método de autenticação
    const token = jwt.sign({ id: user.id, cpfCnpj: user.cpf_cnpj }, 'secretKey', { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
  }
});

module.exports = router;
