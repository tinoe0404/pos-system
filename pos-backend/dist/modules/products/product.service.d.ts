import { CreateProductInput, UpdateProductInput } from './product.schema';
export declare class ProductService {
    getAllProducts(): Promise<{
        products: any;
        count: any;
        cached: boolean;
    }>;
    getProductById(id: string): Promise<{
        price: string;
        id: string;
        created_at: Date;
        name: string;
        description: string | null;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
        updated_at: Date;
    } | null>;
    createProduct(data: CreateProductInput): Promise<{
        price: string;
        id: string;
        created_at: Date;
        name: string;
        description: string | null;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
        updated_at: Date;
    }>;
    updateProduct(id: string, data: UpdateProductInput): Promise<{
        price: string;
        id: string;
        created_at: Date;
        name: string;
        description: string | null;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
        updated_at: Date;
    }>;
    deleteProduct(id: string): Promise<{
        success: boolean;
    }>;
}
export declare const productService: ProductService;
//# sourceMappingURL=product.service.d.ts.map