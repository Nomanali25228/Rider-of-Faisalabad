const images = [
    { name: "6 month baby boy cake.jpg", category: "Cake", label: "6 Month Baby Boy Cake", price: "2500" },
    { name: "6 month baby girl cake.jpg", category: "Cake", label: "6 Month Baby Girl Cake", price: "2500" },
    { name: "acrylic box cake and boruete.jpg", category: "Acrylic Box", label: "Acrylic Box Cake & Bouquet", price: "4500" },
    { name: "acrylic box custom gift for boys.jpg", category: "Acrylic Box", label: "Custom Gift for Boys", price: "3500" },
    { name: "acrylic box custom gift for girls.jpg", category: "Acrylic Box", label: "Custom Gift for Girls", price: "3500" },
    { name: "acrylic box whit shoes.jpg", category: "Acrylic Box", label: "Acrylic Box with Shoes", price: "5500" },
    { name: "acrylic coustomize cake and gift.jpg", category: "Acrylic Box", label: "Customize Cake & Gift", price: "4800" },
    { name: "acrylic cutom girf box.jpg", category: "Acrylic Box", label: "Custom Gift Box", price: "3200" },
    { name: "baby cake.jpg", category: "Cake", label: "Baby Special Cake", price: "2200" },
    { name: "birthday bunny cake.jpg", category: "Cake", label: "Birthday Bunny Cake", price: "2800" },
    { name: "black eid cake.jpg", category: "Cake", label: "Black Eid Special Cake", price: "3000" },
    { name: "bmw them cake.jpg", category: "Cake", label: "BMW Theme Cake", price: "3500" },
    { name: "chocolate custom basket.jpg", category: "Custom Basket", label: "Chocolate Custom Basket", price: "2500" },
    { name: "cosmetics boquete.jpg", category: "Bouquet", label: "Cosmetics Bouquet", price: "4000" },
    { name: "custom Snack Basket.jpg", category: "Custom Basket", label: "Custom Snack Basket", price: "1800" },
    { name: "eid basket custom.jpg", category: "Custom Basket", label: "Eid Custom Basket", price: "2200" },
    { name: "eid boquete 100 note.jpg", category: "Bouquet", label: "Eid Note Bouquet", price: "5000" },
    { name: "eid boquetes for girls.jpg", category: "Bouquet", label: "Eid Bouquet for Girls", price: "2500" },
    { name: "eid boquetes.jpg", category: "Bouquet", label: "Eid Special Bouquet", price: "2200" },
    { name: "eid note custom boquete.jpg", category: "Bouquet", label: "Custom Note Bouquet", price: "3500" },
    { name: "gir eid basket.jpg", category: "Custom Basket", label: "Girl Eid Basket", price: "2000" },
    { name: "girl eid and wedding basket.jpg", category: "Custom Basket", label: "Eid & Wedding Basket", price: "3500" },
    { name: "girl eid basket.jpg", category: "Custom Basket", label: "Premium Girl Eid Basket", price: "2800" },
    { name: "lover cake.jpg", category: "Cake", label: "Lover Special Cake", price: "2400" },
    { name: "men eid and wedding basket.jpg", category: "Custom Basket", label: "Men's Eid & Wedding Basket", price: "3200" },
    { name: "mini eid boquetes.jpg", category: "Bouquet", label: "Mini Eid Bouquet", price: "1200" },
    { name: "mini rose boquete.jpg", category: "Bouquet", label: "Mini Rose Bouquet", price: "1500" },
    { name: "outfit custom boquetes.jpg", category: "Bouquet", label: "Outfit Custom Bouquet", price: "4500" },
    { name: "poetry cake.jpg", category: "Cake", label: "Poetry Special Cake", price: "2600" },
    { name: "poky cake.jpg", category: "Cake", label: "Poky Theme Cake", price: "2500" },
    { name: "red poetry cake.jpg", category: "Cake", label: "Red Poetry Cake", price: "2600" },
    { name: "red rose boquetes whit coustom note.jpg", category: "Bouquet", label: "Red Rose Custom Note Bouquet", price: "3000" },
    { name: "red rose boquetes.jpg", category: "Bouquet", label: "Red Rose Bouquet", price: "2000" },
    { name: "simple  birthday cake.jpg", category: "Cake", label: "Simple Birthday Cake", price: "1800" },
    { name: "spiderman cake.jpg", category: "Cake", label: "Spiderman Theme Cake", price: "2800" },
    { name: "umra cake.jpg", category: "Cake", label: "Umrah Mubarak Cake", price: "3000" },
    { name: "white eid cake.jpg", category: "Cake", label: "White Eid Special Cake", price: "2800" }
];

const galleryItems = images.map((img, index) => ({
    id: index + 1,
    label: img.label,
    image: `/uploads/${img.name}`,
    category: img.category,
    price: img.price,
    color: getColorForCategory(img.category)
}));

function getColorForCategory(cat) {
    switch (cat) {
        case 'Cake': return '#e879a0';
        case 'Bouquet': return '#2F8F83';
        case 'Acrylic Box': return '#7c3aed';
        case 'Custom Basket': return '#d97706';
        case 'Gift': return '#F4C542';
        default: return '#2F8F83';
    }
}

console.log(JSON.stringify(galleryItems, null, 2));
