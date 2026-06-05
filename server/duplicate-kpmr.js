const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/ojk/operasional-ojk/operasional-kpmr-ojk');
const destDir = path.join(__dirname, 'src/ojk/investasi-ojk/investasi-kpmr-ojk');

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

function copyAndReplace(src, dest) {
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    
    // Replace logic for filename
    let destName = item.name
      .replace(/operasional-kpmr-ojk/g, 'investasi-kpmr-ojk')
      .replace(/operasional-kpmr/g, 'investasi-kpmr')
      .replace(/operasional/g, 'investasi');

    const destPath = path.join(dest, destName);

    if (item.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyAndReplace(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      content = content.replace(/operasional-kpmr-ojk/g, 'investasi-kpmr-ojk');
      content = content.replace(/operasional-kpmr/g, 'investasi-kpmr');
      content = content.replace(/operasional_kpmr/g, 'investasi_kpmr');
      content = content.replace(/operasional_ojk/g, 'investasi_ojk');
      
      content = content.replace(/OperasionalKpmrOjk/g, 'InvestasiKpmrOjk');
      content = content.replace(/KpmrOperasionalOjk/g, 'KpmrInvestasiOjk');
      content = content.replace(/OperasionalKpmr/g, 'InvestasiKpmr');
      content = content.replace(/KpmrOperasional/g, 'KpmrInvestasi');
      content = content.replace(/operasionalId/g, 'investasiId');
      content = content.replace(/Operasional/g, 'Investasi');
      content = content.replace(/operasional/g, 'investasi');
      content = content.replace(/OPERASIONAL/g, 'INVESTASI');

      fs.writeFileSync(destPath, content, 'utf8');
    }
  }
}

copyAndReplace(srcDir, destDir);
console.log('Duplication complete');
