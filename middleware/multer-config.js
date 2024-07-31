const multer = require('multer');



// Utilisation de memoryStorage pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();

module.exports = multer({ storage }).single('image');
