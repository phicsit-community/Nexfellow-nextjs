import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from "../slices/userSlice";

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async () => {
    try {
      console.log(apiUrl);
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful. Received data:', data);

        dispatch(setUser({
          user: data.user,
          token: data.token,
          expiresIn: data.expiresIn,
        }));

        localStorage.setItem('token', JSON.stringify(data.token));
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('expiresIn', JSON.stringify(data.expiresIn));

        alert('Login successful');
        navigate('/');
      } else {
        console.error('Login failed. Status:', response.status);
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className='text-3xl font-bold text-gray-900'>Welcome To </h1>
          <h1 className="text-text-gradient text-3xl font-bold">GeekMailer</h1>
          <p className="text-gray-600 text-wrap">Log-in with Admin Account to Continue</p>
        </div>

        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full py-2 px-4 text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-bg-1" // Using your custom button gradient class
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Login;
