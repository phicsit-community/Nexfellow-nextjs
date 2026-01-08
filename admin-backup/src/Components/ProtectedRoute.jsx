import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem('token');
  const expiresIn = localStorage.getItem('expiresIn');
  
  // Check if token and expiresIn are valid, and parse expiresIn correctly
  if (!token || !expiresIn) {
    return <Navigate to='/login' />;
  }

  // Parse expiresIn from string to Date
  const expirationDate = new Date(JSON.parse(expiresIn));

  // If the token is valid and not expired, render the protected component
  return expirationDate > Date.now() ? <Component /> : <Navigate to='/login' />;
};

export default ProtectedRoute;
