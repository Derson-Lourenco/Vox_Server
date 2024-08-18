// bd.js
const mysql = require('mysql2');

// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: 'vox.c34okqo2iv4k.us-east-1.rds.amazonaws.com', // Substitua pelo seu endpoint da AWS
  user: 'dersonls', // Substitua pelo seu usuário do MySQL
  password: 'Lara795816', // Substitua pela sua senha do MySQL
  database: 'gerenciador' // Substitua pelo nome do seu banco de dados
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!');
});

module.exports = connection;
