// Using base64 encoded simple sounds to avoid external dependencies
const fs = require('fs');
// Simple success sound (a short blip)

// Convert base64 to file
const convertBase64ToFile = (base64, outputPath) => {
  const base64Data = base64.replace(/^data:audio\/mp3;base64,/, '');
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log();
};

// Create files
convertBase64ToFile(successSoundBase64, 'public/sounds/success.mp3');
convertBase64ToFile(hitSoundBase64, 'public/sounds/hit.mp3');
