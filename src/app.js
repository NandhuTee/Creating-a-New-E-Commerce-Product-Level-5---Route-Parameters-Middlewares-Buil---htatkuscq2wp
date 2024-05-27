const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

// Importing products from products.json file
let products;
try {
    products = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'data/products.json'))
    );
} catch (error) {
    console.error('Failed to read products file:', error);
    products = [];
}

// Middleware
app.use(express.json());

// Validate product data
const validateProduct = (product) => {
    if (!product.name || typeof product.name !== 'string') {
        return 'Product name is required and should be a string.';
    }
    if (!product.price || typeof product.price !== 'number' || product.price <= 0) {
        return 'Product price is required and should be a positive number.';
    }
    if (!product.quantity || typeof product.quantity !== 'number' || product.quantity < 0) {
        return 'Product quantity is required and should be a non-negative number.';
    }
    return null;
};

// POST endpoint for creating new product
app.post('/api/v1/products', (req, res) => {
    const newProduct = req.body;

    // Validate the new product data
    const validationError = validateProduct(newProduct);
    if (validationError) {
        return res.status(400).json({
            status: 'fail',
            message: validationError
        });
    }

    try {
        // Generate new product ID
        const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
        newProduct.id = newId;

        // Add new product to the products array
        products.push(newProduct);

        // Save updated products array to the JSON file
        fs.writeFileSync(path.join(__dirname, 'data/products.json'), JSON.stringify(products, null, 2));

        // Return the new product
        res.status(201).json({
            status: 'Success',
            message: 'Product added successfully',
            data: {
                newProduct
            }
        });
    } catch (error) {
        console.error('Failed to add new product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});

// GET endpoint for sending the details of users
app.get('/api/v1/products', (req, res) => {
    try {
        res.status(200).json({
            status: 'Success',
            message: 'Details of products fetched successfully',
            data: {
                products
            }
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});

app.get('/api/v1/products/:id', (req, res) => {
    try {
        let { id } = req.params;
        id = parseInt(id, 10);

        const product = products.find(product => product.id === id);
        if (!product) {
            return res.status(404).send({ status: "failed", message: "Product not found!" });
        }

        res.status(200).send({
            status: 'success',
            message: "Product fetched successfully",
            data: {
                product
            }
        });
    } catch (error) {
        console.error('Failed to fetch product by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});

module.exports = app;
