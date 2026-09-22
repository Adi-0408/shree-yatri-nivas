const https = require('https');
const fs = require('fs');

https.get('https://yatrisstay-ccaai5es.manus.space/assets/index-H1uhyUjZ.js', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch/reference_js.js', data);
    console.log('Saved reference_js.js, size:', data.length);
    
    // Look for JSX / React text nodes or identifiable sections
    const lines = [];
    const re = /"([^"\\]{10,120})"/g;
    let m;
    while ((m = re.exec(data)) !== null) {
      const str = m[1];
      if (!str.includes('node_modules') && !str.includes('data:') && !str.includes('http') && !str.includes('px') && !str.includes('var(') && str.includes(' ')) {
        lines.push(str);
      }
    }
    const unique = [...new Set(lines)];
    fs.writeFileSync('scratch/reference_strings.txt', unique.join('\n'));
    console.log('Extracted', unique.length, 'strings');
  });
}).on('error', (e) => console.error(e));
