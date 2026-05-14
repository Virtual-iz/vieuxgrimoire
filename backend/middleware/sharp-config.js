const sharp = require('sharp');
const fs = require('fs');

module.exports = async (req, res, next) => {
  // Si aucun fichier n'a été uploadé via Multer, on passe au middleware suivant
  if (!req.file) {
    return next();
  }

  try {
    // On utilise le chemin enregistré par Multer
    const inputPath = req.file.path;

    // Multer enregistre le fichier sans extension, donc on ajoute directement l'extension .webp 
    const outputPath = inputPath + '.webp';

    /* Sharp convertit en WebP et enregistre le nouveau fichier au chemin défini*/
    await sharp(inputPath)
      .rotate() 
      .resize({
        width: 260, //propriété bookimage css
        //height: 206, avec width conserve proportion auto, sinon recadre
        //fit: 'inside', normalement déjà géré par contain coté front
        //withoutEnlargement: true pour préserver la qualité si l'image est plus petite (si besoin)
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // On supprime l'ancien fichier. unlinkSync est synchrone : il bloque l'exécution jusqu'à suppression
    fs.unlinkSync(inputPath);

    // On met à jour le nom du fichier pour le contrôleur
    req.file.filename = req.file.filename + '.webp';

    // On passe au middleware suivant
    next();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur conversion image" });
  }
};