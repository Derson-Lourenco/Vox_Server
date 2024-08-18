const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const routes = require('./routes/contratos'); // Verifique se o caminho está correto

const app = express();
const port = 5000;

const uri = process.env.MONGODB_URI; // Usa a variável de ambiente para o URI do MongoDB
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use((req, res, next) => {
  console.log(`Recebida solicitação: ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Conectar ao MongoDB Atlas
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

connectToMongo();

// Roteamento
app.use('/contratos', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
