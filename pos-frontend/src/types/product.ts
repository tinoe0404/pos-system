export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    stock: number;
    min_stock?: number;
    sku: string;
    category: string | null;
    imageUrl?: string;
    active: boolean;
    // Beer-specific fields
    abv?: string;
    ibu?: number;
    brewery?: string;
    style?: string;
    is_tap_item?: boolean;
    unit_volume?: string;
    createdAt?: string;
    updatedAt?: string;
}
