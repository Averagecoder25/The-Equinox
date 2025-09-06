import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBwsqlKB5RM6oojwK1jA1jhKu8lvs00EuM",
    authDomain: "dnd-shop-fb62c.firebaseapp.com",
    databaseURL: "https://dnd-shop-fb62c-default-rtdb.firebaseio.com",
    projectId: "dnd-shop-fb62c",
    storageBucket: "dnd-shop-fb62c.firebasestorage.app",
    messagingSenderId: "377211997733",
    appId: "1:377211997733:web:a31a04a2c4dbbcfb43b9cc",
    measurementId: "G-DZVY47PE4Z"
};

// const app = firebase.initializeApp(firebaseConfig);
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = firebase.database();
const analytics = getAnalytics(app);

// Function to initialize items in DB if empty, loading from items.json
async function initItems() {
    const itemsRef = db.ref('items');
    const snapshot = await itemsRef.once('value');
    if (!snapshot.exists()) {
        try {
            const response = await fetch('items.json');
            if (!response.ok) throw new Error('Failed to fetch items.json');
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
                    else desc += `Price: Contact DM`;
                    const newItem = {
                        id,
                        name: item.name,
                        desc: desc.trim(),
                        stock: 1
                    };
                    allItems.push(newItem);
                });
            });
            allItems.forEach(item => {
                itemsRef.child(item.id).set(item);
            });
        } catch (error) {
            console.error('Error initializing items:', error);
            alert('Failed to load shop items. Please try again later.');
        }
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
                <h2>${item.name}</h2>
                <p>${item.desc}</p>
                <button class="button" onclick="buyItem('${item.id}')">${item.stock > 0 ? 'Acquire' : 'Out of Stock'}</button>
            `;
            container.appendChild(card);
        });
    }, error => {
        console.error('Error loading items:', error);
        alert('Failed to load items. Please refresh.');
    });
}

// Buy item (set stock to 0)
function buyItem(id) {
    db.ref(`items/${id}/stock`).set(0)
        .then(() => alert('Item acquired! Check with your DM.'))
        .catch(error => alert('Purchase failed: ' + error.message));
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
                <h2>${item.name}</h2>
                <p>${item.desc}</p>
                <p>Stock: ${item.stock}</p>
                <button class="button" onclick="restockItem('${item.id}')">Restock</button>
            `;
            container.appendChild(card);
        });
    }, error => {
        console.error('Error loading DM items:', error);
        alert('Failed to load DM items. Please refresh.');
    });
}

// Restock item (set stock to 1)
function restockItem(id) {
    db.ref(`items/${id}/stock`).set(1)
        .then(() => alert('Item restocked!'))
        .catch(error => alert('Restock failed: ' + error.message));
}

// Load based on page
if (document.getElementById('items-container')) {
    loadItems();
}
