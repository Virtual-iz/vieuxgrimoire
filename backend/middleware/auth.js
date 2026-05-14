const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
        /*Vérifie si le header existe*/
       if (!req.headers.authorization) {
        return res.status(401).json({ message: "Token manquant ou invalide" });
        }
        const token = req.headers.authorization.split(' ')[1];
        /*vérifie présence token dans header Authorization et validité. Injecte usreId pour sécuriser opérations sur les livres*/
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };

    next();
    /*si tt est ok, prochain middleware*/

   } catch (error) {
    return res.status(401).json({ message: "Requête non authentifiée" });
  }
};

