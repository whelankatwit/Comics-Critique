import { useState } from 'react';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const { setUser } = useUser();  // Get setUser from context
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);  // Set user after successful sign-in
        navigate('/home');
      } else {
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignIn}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;
