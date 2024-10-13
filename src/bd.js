// bd.js
const mysql = require('mysql2')

// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: 'vox.c34okqo2iv4k.us-east-1.rds.amazonaws.com', // Endpoint da HostGator
  user: 'dersonls', // Usuário do MySQL
  password: 'Lara795816', // Senha do MySQL
  database: 'gerenciador' // Nome do banco de dados
})

// Conexão com o banco de dados
connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err)
    return
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!')
})

module.exports = connection
