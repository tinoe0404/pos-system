import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AnalyticsSummary {
  totalValuation: number;
  lowStockCount: number;
  totalShrinkageValue: number;
  activeProductsCount: number;
}

export interface TopMovingItem {
  product_id: string;
  name: string;
  sku: string;
  quantity_sold: number;
  revenue: number;
}

export interface ShrinkageItem {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  type: string;
  quantity_lost: number;
  value_lost: number;
  reason: string;
  date: string;
}

export interface DeadStockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  value: number;
  category: string;
}

export interface InventoryAnalyticsResponse {
  summary: AnalyticsSummary;
  topMovingItems: TopMovingItem[];
  shrinkageList: ShrinkageItem[];
  deadStock: DeadStockItem[];
}

export const useInventoryAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ['inventory', 'analytics', days],
    queryFn: async () => {
      const res = await api.get<InventoryAnalyticsResponse>(`/api/inventory/analytics?days=${days}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
};
