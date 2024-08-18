const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// String de conexão do MongoDB Atlas com suas credenciais
const uri = 'mongodb+srv://andersonlourencor:MJhRbHW1M74sDfO0@voxbd.fjnre.mongodb.net/?retryWrites=true&w=majority&appName=VoxBD';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Conexão com o MongoDB Atlas estabelecida com sucesso!');
    app.locals.db = client.db('nomeDoBanco'); // Substitua pelo nome do seu banco de dados
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB Atlas:', err);
    process.exit(1); // Encerra o processo se a conexão falhar
  }
}

// Conectando ao MongoDB Atlas
connectToMongo();

// Definindo uma rota simples
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
