const { writeFile } = require('fs');
require('dotenv').config();

// Detectamos si es producción buscando en los argumentos nativos de Node
const isProduction = process.argv.includes('--environment=prod');

const targetPath = isProduction
  ? `./src/environments/environment.prod.ts`
  : `./src/environments/environment.ts`;

const envConfigFile = `
export const environment = {
  production: ${isProduction},

  secretKey: "${process.env['SECRET_KEY'] || ''}",
  firebaseKey: "${process.env['FIREBASE_KEY'] || ''}",

  googleConfig: {
    geminiId: "${process.env['GOOGLE_GEMINI_ID'] || ''}",
    clientId: "${process.env['GOOGLE_CLIENT_ID'] || ''}",
    scope: "${process.env['GOOGLE_SCOPE'] || ''}",
    folderId: "${process.env['GOOGLE_FOLDER_ID'] || ''}",
  },

  userProfile: {
    admin: ${Number(process.env['USER_PROFILE_ADMIN']) || 0},
    support: ${Number(process.env['USER_PROFILE_SUPPORT']) || 1},
    user: ${Number(process.env['USER_PROFILE_USER']) || 2},
  },

  emailSender: {
    serviceId: "${process.env['EMAILSENDER_SERVICE_ID'] || ''}",
    templateId: "${process.env['EMAILSENDER_TEMPLATE_ID'] || ''}",
    publicKey: "${process.env['EMAILSENDER_PUBLIC_KEY'] || ''}",
  }
};
`;

writeFile(targetPath, envConfigFile, (err:any) => {
  if (err) {
    console.error('❌ Error al escribir el archivo:', err);
  } else {
    console.log(`✅ Archivo generado correctamente en ${targetPath} (${isProduction ? 'PROD' : 'DEV'})`);
  }
});
