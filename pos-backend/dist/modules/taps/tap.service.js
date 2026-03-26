"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tapService = exports.TapService = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
class TapService {
    async getAllTaps() {
        return prisma_1.default.tap.findMany({
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
    async getTapById(id) {
        return prisma_1.default.tap.findUnique({
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
    async createTap(data) {
        return prisma_1.default.tap.create({
            data: {
                id: data.id,
                keg_id: data.keg_id,
                is_active: data.is_active,
            },
        });
    }
    async updateTap(id, data) {
        return prisma_1.default.tap.update({
            where: { id },
            data: {
                keg_id: data.keg_id,
                is_active: data.is_active,
            },
        });
    }
    async assignKegToTap(tapId, kegId) {
        // First, set the keg status to ACTIVE
        await prisma_1.default.keg.update({
            where: { id: kegId },
            data: {
                status: 'ACTIVE',
                tapped_at: new Date(),
            },
        });
        // Then assign to tap
        return prisma_1.default.tap.update({
            where: { id: tapId },
            data: {
                keg_id: kegId,
            },
        });
    }
}
exports.TapService = TapService;
exports.tapService = new TapService();
