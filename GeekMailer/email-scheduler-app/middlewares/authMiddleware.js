const jwt = require('jsonwebtoken');

module.exports.isAuthenticated = async (req, res, next) => {
  const token = req.signedCookies.adminjwt || req.cookies.adminjwt;

  if (!token) {
    console.log('Token not found in cookies');
    return res.status(404).json('No token provided');
  }
   
  try {
      const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
      if(!decoded) {
          return res.status(400).json('Invalid token');
      }
      next();
  } catch (error) {
      console.error(error);
      res.status(500).json('Internal server error');
  }
}
