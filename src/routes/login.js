import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importando useNavigate
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Inicializando useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa a mensagem de erro antes de uma nova tentativa de login

    try {
      // Usando axios para fazer a requisição
      const response = await axios.post(`${apiUrl}/login/getLogin`, {
        email,
        senha,
      });

      // Se o login for bem-sucedido
      if (response.data && response.data.token) {
        alert('Login realizado com sucesso!');
        localStorage.setItem('token', response.data.token); // Armazena o token no localStorage
        
        // Redireciona para a página de dashboard
        navigate('/dashboard'); // Alterando a rota para '/dashboard'
      } else {
        throw new Error('Token não encontrado na resposta.');
      }
      
    } catch (err) {
      console.error('Erro ao fazer login:', err.response?.data || err.message); // Log para depuração
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique seu email e senha.');
    }
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '4px', backgroundColor: '#4CAF50', color: '#fff', border: 'none' }}>
          Entrar
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
