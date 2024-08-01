const multer = require('multer');



// Utilisation de memoryStorage pour stocker les fichiers en mémoire pour permettre leur compression
const storage = multer.memoryStorage();

module.exports = multer({ storage }).single('image');
