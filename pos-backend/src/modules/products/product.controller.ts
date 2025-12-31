import { FastifyRequest, FastifyReply } from 'fastify';
import { productService } from './product.service';
import { CreateProductInput, UpdateProductInput } from './product.schema';

export async function getAllProductsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await productService.getAllProducts();
    return reply.code(200).send(result);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch products',
    });
  }
}

export async function getProductByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const product = await productService.getProductById(id);

    if (!product) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'Product not found',
      });
    }

    return reply.code(200).send(product);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch product',
    });
  }
}

export async function createProductHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body as CreateProductInput;
    const product = await productService.createProduct(body);
    return reply.code(201).send(product);
  } catch (error: unknown) {
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

export async function updateProductHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateProductInput;
    const product = await productService.updateProduct(id, body);
    return reply.code(200).send(product);
  } catch (error: unknown) {
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

export async function deleteProductHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    await productService.deleteProduct(id);
    return reply.code(204).send();
  } catch (error: unknown) {
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