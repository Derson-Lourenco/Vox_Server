const mongoose = require('mongoose');

// String de conexão do MongoDB Atlas com suas credenciais
const uri = 'mongodb+srv://andersonlourencor:MJhRbHW1M74sDfO0@voxbd.fjnre.mongodb.net/?retryWrites=true&w=majority&appName=VoxBD';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexão com o MongoDB Atlas estabelecida com sucesso!');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB Atlas:', err);
  process.exit(1); // Encerra o processo se a conexão falhar
});

// Definindo o esquema para contratos
const contrato = new mongoose.Schema({
  processoAno: String,
  numeroContrato: String,
  modalidade: String,
  registro: String,
  orgao: String,
  cnpjContratante: String,
  valorContratado: Number,
  dataAssinatura: Date,
  dataInicio: Date,
  dataFinalizacao: Date,
  objetoContrato: String,
  secretarias: [String], // Array de strings
}, { timestamps: true });

// Criando o modelo para a coleção
const Contrato = mongoose.model('Contrato', contrato);

// Criando a coleção se não existir
async function createCollection() {
  try {
    await Contrato.createCollection();
    console.log('Coleção de contratos criada com sucesso!');
  } catch (err) {
    console.error('Erro ao criar a coleção de contratos:', err);
  } finally {
    mongoose.connection.close(); // Fecha a conexão após a criação
  }
}

// Executar a função para criar a coleção
createCollection();
