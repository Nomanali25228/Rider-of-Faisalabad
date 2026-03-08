const fs = require('fs');
const files = fs.readdirSync('public/uploads');
const existing = fs.readFileSync('lib/products.js', 'utf8');

const newProducts = [];
let id = 38;

files.forEach(f => {
    if (f.endsWith('.jpg') || f.endsWith('.jpeg')) {
        if (!existing.includes(f) && !f.includes('raider') && !f.includes('easypaisa')) {
            newProducts.push({
                id: id++,
                label: f.replace(/\.[^/.]+$/, '').replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
                image: '/uploads/' + f,
                category: f.toLowerCase().includes('cake') ? 'Cake' : (f.toLowerCase().includes('boquete') || f.toLowerCase().includes('bouquet') || f.toLowerCase().includes('boqusdcete')) ? 'Bouquet' : f.toLowerCase().includes('box') ? 'Acrylic Box' : 'Custom Basket',
                price: '2500',
                color: '#d97706',
                description: 'A beautiful new addition to our store.'
            });
        }
    }
});
let output = '';
newProducts.forEach(p => {
    output += `    { id: ${p.id}, label: '${p.label}', image: '${p.image}', category: '${p.category}', price: '${p.price}', color: '${p.color}', description: '${p.description}' },\n`;
});
fs.writeFileSync('new_products_str.txt', output, 'utf8');
