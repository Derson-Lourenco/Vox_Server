// bd.js
const mysql = require('mysql2');

// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: '108.179.193.0', // Endpoint da HostGator
  user: 'voxger94_VoxGerenciador', // Usuário do MySQL
  password: 'L@r@795816', // Senha do MySQL
  database: 'voxger94_gerenciador' // Nome do banco de dados
});

// Conexão com o banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!');
});

module.exports = connection;
