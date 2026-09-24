const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'src', 'app', 'login', 'page.tsx');
const registerPath = path.join(__dirname, 'src', 'app', 'register', 'page.tsx');

let loginCode = fs.readFileSync(loginPath, 'utf8');
let registerCode = fs.readFileSync(registerPath, 'utf8');

// Extract the button from login
const buttonRegex = /<button\s+type="button"\s+onClick=\{\(\) => setMostrarSenha\(!mostrarSenha\)\}[\s\S]*?<\/button>/;
const loginButtonMatch = loginCode.match(buttonRegex);

if (loginButtonMatch) {
  const loginButton = loginButtonMatch[0];
  
  // Replace all instances of the button in register
  const newRegisterCode = registerCode.replace(/<button\s+type="button"\s+onClick=\{\(\) => setMostrarSenha\(!mostrarSenha\)\}[\s\S]*?<\/button>/g, loginButton);
  
  fs.writeFileSync(registerPath, newRegisterCode, 'utf8');
  console.log("Successfully replaced register eye buttons with login eye button.");
} else {
  console.log("Could not find button in login/page.tsx");
}
