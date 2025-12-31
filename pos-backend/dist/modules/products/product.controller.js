"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsHandler = getAllProductsHandler;
exports.getProductByIdHandler = getProductByIdHandler;
exports.createProductHandler = createProductHandler;
exports.updateProductHandler = updateProductHandler;
exports.deleteProductHandler = deleteProductHandler;
const product_service_1 = require("./product.service");
async function getAllProductsHandler(request, reply) {
    try {
        const result = await product_service_1.productService.getAllProducts();
        return reply.code(200).send(result);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch products',
        });
    }
}
async function getProductByIdHandler(request, reply) {
    try {
        const { id } = request.params;
        const product = await product_service_1.productService.getProductById(id);
        if (!product) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Product not found',
            });
        }
        return reply.code(200).send(product);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to fetch product',
        });
    }
}
async function createProductHandler(request, reply) {
    try {
        const body = request.body;
        const product = await product_service_1.productService.createProduct(body);
        return reply.code(201).send(product);
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error && error.message === 'Product with this SKU already exists') {
            return reply.code(409).send({
                error: 'Conflict',
                message: error.message,
            });
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to create product',
        });
    }
}
async function updateProductHandler(request, reply) {
    try {
        const { id } = request.params;
        const body = request.body;
        const product = await product_service_1.productService.updateProduct(id, body);
        return reply.code(200).send(product);
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error) {
            if (error.message === 'Product not found') {
                return reply.code(404).send({
                    error: 'Not found',
                    message: error.message,
                });
            }
            if (error.message === 'Product with this SKU already exists') {
                return reply.code(409).send({
                    error: 'Conflict',
                    message: error.message,
                });
            }
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to update product',
        });
    }
}
async function deleteProductHandler(request, reply) {
    try {
        const { id } = request.params;
        await product_service_1.productService.deleteProduct(id);
        return reply.code(204).send();
    }
    catch (error) {
        request.log.error(error);
        if (error instanceof Error && error.message === 'Product not found') {
            return reply.code(404).send({
                error: 'Not found',
                message: error.message,
            });
        }
        return reply.code(500).send({
            error: 'Internal server error',
            message: 'Failed to delete product',
        });
    }
}
//# sourceMappingURL=product.controller.js.map