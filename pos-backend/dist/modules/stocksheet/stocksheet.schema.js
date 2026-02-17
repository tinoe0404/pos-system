"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockSheetQuerySchema = void 0;
const zod_1 = require("zod");
exports.stockSheetQuerySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
