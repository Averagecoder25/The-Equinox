// Replace with your Firebase config (get from Firebase console > Project Settings > Your Apps > Firebase SDK snippet)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Function to initialize items in DB if empty, loading from items.json
async function initItems() {
    const itemsRef = db.ref('items');
    const snapshot = await itemsRef.once('value');
    if (!snapshot.exists()) {
        const response = await fetch('items.json');
        const data = await response.json();
        let allItems = [];
        Object.keys(data).forEach(category => {
            data[category].forEach(item => {
                const id = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                let desc = '';
                if (item.type) desc += `Type: ${item.type}. `;
                if (item.damage) desc += `Damage: ${item.damage}. `;
                if (item.armor) desc += `Armor: ${item.armor}. `;
                if (item.ability) desc += `Ability: ${item.ability}. `;
                if (item.effect) desc += `Effect: ${item.effect}. `;
                if (item.description || item.flavor) desc += `${item.description || item.flavor} `;
                if (item.quest) desc += `Quest: ${item.quest}. `;
                if (item.price != null) desc += `Price: ${item.price}`;
                const newItem = {
                    id,
                    name: item.name,
                    desc: desc.trim(),
                    image: `https://placehold.co/400x300/0a0a0a/ff00ff?text=${encodeURIComponent(item.name)}`,
                    stock: 1
                };
                allItems.push(newItem);
            });
        });
        allItems.forEach(item => {
            itemsRef.child(item.id).set(item);
        });
    }
}

initItems();

// Load items for player shop
function loadItems() {
    const container = document.getElementById('items-container');
    const itemsRef = db.ref('items');
    itemsRef.on('value', snapshot => {
        container.innerHTML = '';
        snapshot.forEach(child => {
            const item = child.val();
            const card = document.createElement('div');
            card.classList.add('card');
            if (item.stock === 0) card.classList.add('out-of-stock');
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h2>${item.name}</h2>
                <p>${item.desc}</p>
                <button class="button" onclick="buyItem('${item.id}')">${item.stock > 0 ? 'Acquire' : 'Out of Stock'}</button>
            `;
            container.appendChild(card);
        });
    });
}

// Buy item (set stock to 0)
function buyItem(id) {
    db.ref(`items/${id}/stock`).set(0);
    alert('Item acquired! Check with your DM.');
}

// Load items for DM panel
function loadDMItems() {
    const container = document.getElementById('dm-items-container');
    const itemsRef = db.ref('items');
    itemsRef.on('value', snapshot => {
        container.innerHTML = '';
        snapshot.forEach(child => {
            const item = child.val();
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h2>${item.name}</h2>
                <p>${item.desc}</p>
                <p>Stock: ${item.stock}</p>
                <button class="button" onclick="restockItem('${item.id}')">Restock</button>
            `;
            container.appendChild(card);
        });
    });
}

// Restock item (set stock to 1)
function restockItem(id) {
    db.ref(`items/${id}/stock`).set(1);
    alert('Item restocked!');
}

// Load based on page
if (document.getElementById('items-container')) {
    loadItems();
}
