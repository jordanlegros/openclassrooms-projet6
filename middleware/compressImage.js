const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const MIME_TYPES = {
    'image/jpg': '.jpg',
    'image/jpeg': '.jpg',
    'image/png': '.png'
};

const compressAndSaveImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const { buffer, originalname, mimetype } = req.file;

    // Déterminer l'extension en fonction du MIME type
    const extension = MIME_TYPES[mimetype];
    if (!extension) {
        return res.status(400).json({ error: 'Type MIME non supporté' });
    }

    // Créer un nom de fichier unique avec un timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Remplacer les caractères invalides pour les noms de fichiers
    // Enlever l'extension originale du nom du fichier
    const name = path.parse(originalname).name.split(' ').join('_');
    const filename = `${timestamp}-${name}${extension}`;

    // Définir le chemin du fichier compressé dans le répertoire `images`
    const imagesDir = path.join(__dirname, '../images'); // Chemin relatif vers le dossier images
    const filePath = path.join(imagesDir, filename);

    try {
        // Assurer que le répertoire existe
        await fs.mkdir(imagesDir, { recursive: true });

        // Utiliser sharp pour compresser l'image
        const image = sharp(buffer);
        if (mimetype === 'image/png') {
            await image
                .png({ quality: 80 }) // Utiliser PNG pour les images PNG
                .toFile(filePath);
        } else {
            await image
                .jpeg({ quality: 80 }) // Utiliser JPEG pour les images JPEG
                .toFile(filePath);
        }

         // Mettre à jour `req.file.path` pour que le chemin du fichier soit correct
         req.file.filename = filename; // Assurez-vous que filename est défini
         req.file.path = filePath;     // Vous pouvez aussi mettre à jour le chemin

        console.log('Image compressée et enregistrée avec succès.');
        next();
    } catch (error) {
        console.error('Erreur lors de la compression de l\'image :', error);
        res.status(500).json({ error: 'Erreur lors de la compression de l\'image.' });
    }
};

module.exports = compressAndSaveImage;
