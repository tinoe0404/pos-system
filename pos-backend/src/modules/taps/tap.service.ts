import prisma from '../../shared/prisma';
import { CreateTapInput, UpdateTapInput } from '../kegs/keg.schema';

export class TapService {
    async getAllTaps() {
        return prisma.tap.findMany({
            include: {
                keg: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { id: 'asc' },
        });
    }

    async getTapById(id: number) {
        return prisma.tap.findUnique({
            where: { id },
            include: {
                keg: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async createTap(data: CreateTapInput) {
        return prisma.tap.create({
            data: {
                id: data.id,
                keg_id: data.keg_id,
                is_active: data.is_active,
            },
        });
    }

    async updateTap(id: number, data: UpdateTapInput) {
        return prisma.tap.update({
            where: { id },
            data: {
                keg_id: data.keg_id,
                is_active: data.is_active,
            },
        });
    }

    async assignKegToTap(tapId: number, kegId: string) {
        // First, set the keg status to ACTIVE
        await prisma.keg.update({
            where: { id: kegId },
            data: {
                status: 'ACTIVE',
                tapped_at: new Date(),
            },
        });

        // Then assign to tap
        return prisma.tap.update({
            where: { id: tapId },
            data: {
                keg_id: kegId,
            },
        });
    }
}

export const tapService = new TapService();
