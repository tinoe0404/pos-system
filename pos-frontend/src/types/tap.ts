import { Product } from './product';

export type KegStatus = 'NEW' | 'ACTIVE' | 'EMPTY' | 'TAP_RESERVED';

export interface Keg {
    id: string;
    product_id: string;
    total_volume: string | number;
    current_volume: string | number;
    status: KegStatus;
    tapped_at?: string;
    finished_at?: string;
    product?: Product;
}

export interface Tap {
    id: number;
    keg_id: string | null;
    is_active: boolean;
    keg?: Keg;
}
