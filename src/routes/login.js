const express = require('express');
const jwt = require('jsonwebtoken'); // Para gerar tokens
const router = express.Router();

module.exports = (connection) => {
  // Função para gerar um token
  const gerarToken = (userId) => {
    return jwt.sign({ id: userId }, 'seu_segredo_aqui', { expiresIn: '1h' }); // Use uma chave secreta segura
  };

  // Rota de login
  router.post('/getLogin', (req, res) => {
    const { email, senha } = req.body;

    // Consulta ao banco de dados para verificar as credenciais
    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    connection.query(query, [email, senha], (err, results) => {
      if (err) {
        console.error('Erro na consulta ao banco:', err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
      }

      if (results.length > 0) {
        // Usuário encontrado, gera um token
        const token = gerarToken(results[0].id); // Gera o token com o ID do usuário
        return res.json({ token }); // Retorna o token
      } else {
        // Credenciais incorretas
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
      }
    });
  });

  return router;
};
