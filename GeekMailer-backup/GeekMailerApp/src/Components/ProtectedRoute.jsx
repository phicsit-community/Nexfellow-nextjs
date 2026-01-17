import { Navigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ element: Component }) => {
  // Safely parse localStorage values
  const token = localStorage.getItem('token');
  let expiresIn = null;

  try {
    const expiresInValue = localStorage.getItem('expiresIn');
    if (expiresInValue && expiresInValue !== 'undefined' && expiresInValue !== 'null') {
      expiresIn = new Date(JSON.parse(expiresInValue));
    }
  } catch (error) {
    console.error('Error parsing expiresIn from localStorage:', error);
    expiresIn = null;
  }

  const isAuthenticated = token && expiresIn && expiresIn > Date.now();

  return isAuthenticated ? <Component /> : <Navigate to='/login' />
};

export default ProtectedRoute;
