import prisma from '../../shared/prisma';
import { CreateKegInput, UpdateKegInput } from './keg.schema';

export class KegService {
    async getAllKegs() {
        const kegs = await prisma.keg.findMany({
            include: {
                product: true,
            },
            orderBy: { created_at: 'desc' },
        });

        return kegs.map((keg) => ({
            ...keg,
            total_volume: keg.total_volume.toString(),
            current_volume: keg.current_volume.toString(),
        }));
    }

    async getKegById(id: string) {
        const keg = await prisma.keg.findUnique({
            where: { id },
            include: { product: true },
        });

        if (!keg) return null;

        return {
            ...keg,
            total_volume: keg.total_volume.toString(),
            current_volume: keg.current_volume.toString(),
        };
    }

    async createKeg(data: CreateKegInput) {
        const keg = await prisma.keg.create({
            data: {
                product_id: data.product_id,
                total_volume: data.total_volume,
                current_volume: data.current_volume ?? data.total_volume,
                status: data.status,
            },
        });

        return {
            ...keg,
            total_volume: keg.total_volume.toString(),
            current_volume: keg.current_volume.toString(),
        };
    }

    async updateKeg(id: string, data: UpdateKegInput) {
        const keg = await prisma.keg.update({
            where: { id },
            data: {
                status: data.status,
                current_volume: data.current_volume,
                finished_at: data.finished_at,
            },
        });

        return {
            ...keg,
            total_volume: keg.total_volume.toString(),
            current_volume: keg.current_volume.toString(),
        };
    }

    async deductVolume(id: string, amount: number) {
        const keg = await prisma.keg.findUnique({ where: { id } });
        if (!keg) throw new Error('Keg not found');

        const newVolume = Math.max(0, Number(keg.current_volume) - amount);
        const status = newVolume <= 0 ? 'EMPTY' : keg.status;

        return prisma.keg.update({
            where: { id },
            data: {
                current_volume: newVolume,
                status: status as any,
                finished_at: newVolume <= 0 ? new Date() : keg.finished_at,
            },
        });
    }
}

export const kegService = new KegService();
