Shopping Cart Implementation in JavaScript

// Product class to manage product details
class Product {
    constructor(name, price, description, stock) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.price = parseFloat(price);
        this.description = description;
        this.stock = stock;
    }
}

// CartItem class to manage items in the cart
class CartItem {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    get subtotal() {
        return this.product.price * this.quantity;
    }
}

// ShoppingCart class to manage the shopping cart
class ShoppingCart {
    constructor() {
        this.items = new Map();
        this.createdAt = new Date();
        this.lastUpdated = new Date();
    }

    addItem(product, quantity = 1) {
        if (product.stock < quantity) {
            throw new Error('Not enough stock available');
        }

        if (this.items.has(product.id)) {
            const existingItem = this.items.get(product.id);
            if (product.stock < existingItem.quantity + quantity) {
                throw new Error('Not enough stock available');
            }
            existingItem.quantity += quantity;
        } else {
            this.items.set(product.id, new CartItem(product, quantity));
        }

        this.lastUpdated = new Date();
        return true;
    }

    removeItem(productId) {
        const removed = this.items.delete(productId);
        if (removed) {
            this.lastUpdated = new Date();
        }
        return removed;
    }

    updateQuantity(productId, quantity) {
        if (!this.items.has(productId)) {
            return false;
        }

        if (quantity <= 0) {
            return this.removeItem(productId);
        }

        const item = this.items.get(productId);
        if (item.product.stock < quantity) {
            throw new Error('Not enough stock available');
        }

        item.quantity = quantity;
        this.lastUpdated = new Date();
        return true;
    }

    get total() {
        let sum = 0;
        for (const item of this.items.values()) {
            sum += item.subtotal;
        }
        return sum;
    }

    get itemCount() {
        let count = 0;
        for (const item of this.items.values()) {
            count += item.quantity;
        }
        return count;
    }

    clear() {
        this.items.clear();
        this.lastUpdated = new Date();
    }

    getItems() {
        return Array.from(this.items.values());
    }
}

// Order class to manage orders
class Order {
    constructor(cart, userId) {
        this.id = crypto.randomUUID();
        this.userId = userId;
        this.items = cart.getItems();
        this.total = cart.total;
        this.createdAt = new Date();
        this.status = 'pending';
    }

    updateStatus(newStatus) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        newStatus = newStatus.toLowerCase();
        
        if (validStatuses.includes(newStatus)) {
            this.status = newStatus;
            return true;
        }
        return false;
    }
}

// Cart Manager to handle persistence
class CartManager {
    static saveCart(cart) {
        localStorage.setItem('shopping-cart', JSON.stringify({
            items: Array.from(cart.items.entries()),
            createdAt: cart.createdAt,
            lastUpdated: cart.lastUpdated
        }));
    }

    static loadCart() {
        const savedCart = localStorage.getItem('shopping-cart');
        if (!savedCart) return new ShoppingCart();

        const cartData = JSON.parse(savedCart);
        const cart = new ShoppingCart();
        cart.createdAt = new Date(cartData.createdAt);
        cart.lastUpdated = new Date(cartData.lastUpdated);
        
        cartData.items.forEach(([productId, itemData]) => {
            const product = new Product(
                itemData.product.name,
                itemData.product.price,
                itemData.product.description,
                itemData.product.stock
            );
            product.id = itemData.product.id;
            cart.items.set(productId, new CartItem(product, itemData.quantity));
        });

        return cart;
    }
}

// Example usage
function main() {
    // Create some products
    const laptop = new Product("Laptop", 999.99, "High-performance laptop", 10);
    const mouse = new Product("Mouse", 29.99, "Wireless mouse", 20);
    const keyboard = new Product("Keyboard", 59.99, "Mechanical keyboard", 15);

    // Create a shopping cart
    const cart = new ShoppingCart();

    try {
        // Add items to cart
        cart.addItem(laptop, 1);
        cart.addItem(mouse, 2);
        cart.addItem(keyboard, 1);

        // Print cart contents
        console.log(`Cart contains ${cart.itemCount} items`);
        cart.getItems().forEach(item => {
            console.log(`${item.product.name}: ${item.quantity} x $${item.product.price} = $${item.subtotal}`);
        });
        console.log(`Total: $${cart.total}`);

        // Save cart
        CartManager.saveCart(cart);

        // Create an order
        const order = new Order(cart, "user123");
        console.log(`Order created: ${order.id}`);
        console.log(`Order status: ${order.status}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Run the example
main();