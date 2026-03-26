"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kegService = exports.KegService = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
class KegService {
    async getAllKegs() {
        const kegs = await prisma_1.default.keg.findMany({
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
    async getKegById(id) {
        const keg = await prisma_1.default.keg.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!keg)
            return null;
        return {
            ...keg,
            total_volume: keg.total_volume.toString(),
            current_volume: keg.current_volume.toString(),
        };
    }
    async createKeg(data) {
        const keg = await prisma_1.default.keg.create({
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
    async updateKeg(id, data) {
        const keg = await prisma_1.default.keg.update({
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
    async deductVolume(id, amount) {
        const keg = await prisma_1.default.keg.findUnique({ where: { id } });
        if (!keg)
            throw new Error('Keg not found');
        const newVolume = Math.max(0, Number(keg.current_volume) - amount);
        const status = newVolume <= 0 ? 'EMPTY' : keg.status;
        return prisma_1.default.keg.update({
            where: { id },
            data: {
                current_volume: newVolume,
                status: status,
                finished_at: newVolume <= 0 ? new Date() : keg.finished_at,
            },
        });
    }
}
exports.KegService = KegService;
exports.kegService = new KegService();
