const { MongoClient } = require('mongodb');

// String de conexão do MongoDB Atlas com suas credenciais
const uri = 'mongodb+srv://andersonlourencor:MJhRbHW1M74sDfO0@voxbd.fjnre.mongodb.net/?retryWrites=true&w=majority&appName=VoxBD';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connect() {
  try {
    await client.connect();
    console.log('Conexão com o MongoDB Atlas estabelecida com sucesso!');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB Atlas:', err);
  }
}

connect();

// Exportar o cliente para ser usado em outros arquivos
module.exports = client;
