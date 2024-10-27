const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (connection) => {
  const gerarToken = (userId) => {
    return jwt.sign({ id: userId }, 'seu_segredo_aqui', { expiresIn: '1h' });
  };

  router.post('/getLogin', (req, res) => {
    const { email, senha } = req.body;
    console.log('Requisição de login recebida com email:', email); // Adiciona o log para verificar o email recebido

    const query = 'SELECT * FROM clientes WHERE email = ? AND senha = ?';
    connection.query(query, [email, senha], (err, results) => {
      if (err) {
        console.error('Erro na consulta ao banco:', err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
      }

      if (results.length > 0) {
        const token = gerarToken(results[0].id);
        return res.json({ token });
      } else {
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
      }
    });
  });

  return router;
};
