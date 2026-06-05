const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/ojk/operasional-ojk/operasional-ojk');
const destDir = path.join(__dirname, 'src/ojk/pasar-produk/pasar-produk-ojk');

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

function copyAndReplace(src, dest) {
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    
    // Replace logic for filename exactly matches content replace logic
    let destName = item.name
      .replace(/operasional-produk-/g, 'pasar-produk-')
      .replace(/operasional-inherent/g, 'pasar-produk-inherent')
      .replace(/operasional-ojk/g, 'pasar-produk-ojk')
      .replace(/operasional/g, 'pasar-produk'); // fallback

    const destPath = path.join(dest, destName);

    if (item.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyAndReplace(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      content = content.replace(/operasional-produk-/g, 'pasar-produk-');
      content = content.replace(/operasional-inherent/g, 'pasar-produk-inherent');
      content = content.replace(/operasional-ojk/g, 'pasar-produk-ojk');
      content = content.replace(/operasional_ojk/g, 'pasar_produk_ojk');
      
      content = content.replace(/OperasionalOjk/g, 'PasarProdukOjk');
      content = content.replace(/operasionalId/g, 'pasarProdukId');
      content = content.replace(/Operasional/g, 'PasarProduk');
      content = content.replace(/operasional/g, 'pasarProduk');
      content = content.replace(/OPERASIONAL/g, 'PASAR_PRODUK');

      fs.writeFileSync(destPath, content, 'utf8');
    }
  }
}

copyAndReplace(srcDir, destDir);
console.log('Duplication complete');
