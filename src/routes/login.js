  const express = require('express');
  const jwt = require('jsonwebtoken');
  const router = express.Router();

  module.exports = (connection) => {
    const gerarToken = (userId) => {
      return jwt.sign({ id: userId }, 'seu_segredo_aqui', { expiresIn: '1h' });
    };

    // Rota para login
    // Rota para login
router.post('/getLogin', (req, res) => {
  const { email, senha } = req.body;
  console.log('Requisição de login recebida com email:', email);

  const query = 'SELECT * FROM clientes WHERE email = ? AND senha = ?';
  connection.query(query, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro na consulta ao banco:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }

    if (results.length > 0) {
      const user = results[0];
      const token = gerarToken(user.id);

      // Armazenar o nome do usuário no localStorage
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }
  });
});


    // Nova rota para buscar dados do usuário
    router.get('/me', (req, res) => {
      const token = req.headers.authorization?.split(' ')[1]; // Pega o token do header

      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
      }

      jwt.verify(token, 'seu_segredo_aqui', (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Token inválido.' });
        }

        const userId = decoded.id;

        // Consulta para obter dados do usuário
        const query = 'SELECT * FROM clientes WHERE id = ?';
        connection.query(query, [userId], (err, results) => {
          if (err) {
            console.error('Erro na consulta ao banco:', err);
            return res.status(500).json({ message: 'Erro interno do servidor.' });
          }

          if (results.length > 0) {
            const user = results[0];
            return res.json({
              id: user.id,
              name: user.name,
              email: user.email,
            }); // Retorna o que você precisa
          } else {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
          }
        });
      });
    });

    return router;
  };
