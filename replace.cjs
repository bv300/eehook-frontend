const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir(directoryPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('NZD $')) {
        content = content.replace(/NZD \$/g, 'AED');
        changed = true;
    }
    if (content.includes('NZD ${')) {
        content = content.replace(/NZD \$\{/g, 'AED ${');
        changed = true;
    }
    if (content.includes('NZD')) {
        content = content.replace(/NZD/g, 'AED');
        changed = true;
    }
    if (content.includes('amora')) {
        content = content.replace(/amora/g, 'eehook');
        changed = true;
    }
    if (content.includes('Amora')) {
        content = content.replace(/Amora/g, 'Eehook');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
