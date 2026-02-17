export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number | string; // Backend returns string (Decimal), frontend sometimes treats as number
    stock: number;
    min_stock?: number;
    sku: string;
    category: string | null;
    imageUrl?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}
