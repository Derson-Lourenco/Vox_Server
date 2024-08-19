// testInsert.js
const mysql = require('mysql2');

// Configurações de conexão MySQL
const connection = mysql.createConnection({
  host: 'vox.c34okqo2iv4k.us-east-1.rds.amazonaws.com',
  user: 'dersonls',
  password: 'Lara795816',
  database: 'gerenciador'
});

// Conectando ao MySQL
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    process.exit(1); // Encerra o processo se a conexão falhar
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!');

  // Dados para inserção
  const contrato = {
    processoAno: '2024',
    numeroContrato: '123456',
    modalidade: 'Licitação',
    registro: 'REG123',
    orgao: 'Secretaria Municipal',
    cnpjContratante: '12.345.678/0001-99',
    valorContratado: 100000.00,
    dataAssinatura: new Date('2024-08-01'),
    dataInicio: new Date('2024-08-15'),
    dataFinalizacao: new Date('2025-08-15'),
    objetoContrato: 'Prestação de serviços diversos',
    secretarias: JSON.stringify(['Saúde', 'Educação']) // Convertendo o array em JSON
  };

  // Comando SQL para inserção
  const sql = `
    INSERT INTO contratos (
      processoAno,
      numeroContrato,
      modalidade,
      registro,
      orgao,
      cnpjContratante,
      valorContratado,
      dataAssinatura,
      dataInicio,
      dataFinalizacao,
      objetoContrato,
      secretarias
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    contrato.processoAno,
    contrato.numeroContrato,
    contrato.modalidade,
    contrato.registro,
    contrato.orgao,
    contrato.cnpjContratante,
    contrato.valorContratado,
    contrato.dataAssinatura,
    contrato.dataInicio,
    contrato.dataFinalizacao,
    contrato.objetoContrato,
    contrato.secretarias
  ];

  // Inserindo dados
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir contrato:', err);
    } else {
      console.log('Contrato inserido com sucesso! ID:', result.insertId);
    }

    // Fechar a conexão após a inserção
    connection.end();
  });
});
