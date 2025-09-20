let items = [];

// Function to load and initialize items from items.json
async function initItems() {
    try {
        const response = await fetch('items.json');
        if (!response.ok) throw new Error('Failed to fetch items.json');
        const data = await response.json();
        items = [];
        const storedStock = JSON.parse(localStorage.getItem('itemStock') || '{}');
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
                    stock: storedStock[id] !== undefined ? storedStock[id] : 1
                };
                items.push(newItem);
            });
        });
        // Save initial stock to localStorage
        updateLocalStorage();
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Failed to load shop items. Please try again later.');
    }
}

// Update localStorage with current stock
function updateLocalStorage() {
    const stock = {};
    items.forEach(item => {
        stock[item.id] = item.stock;
    });
    localStorage.setItem('itemStock', JSON.stringify(stock));
}

// Load items for player shop
function loadItems() {
    const container = document.getElementById('items-container');
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
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
}

// Buy item (set stock to 0)
function buyItem(id) {
    const item = items.find(i => i.id === id);
    if (item && item.stock > 0) {
        item.stock = 0;
        updateLocalStorage();
        loadItems();
        alert('Item acquired! Check with your DM.');
    } else {
        alert('Item is out of stock!');
    }
}

// Load items for DM panel
function loadDMItems() {
    const container = document.getElementById('dm-items-container');
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
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
}

// Restock item (set stock to 1)
function restockItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.stock = 1;
        updateLocalStorage();
        loadDMItems();
        alert('Item restocked!');
    }
}

// Initialize and load based on page
initItems().then(() => {
    if (document.getElementById('items-container')) {
        loadItems();
    }
});
