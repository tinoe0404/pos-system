"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefundHandler = createRefundHandler;
const refund_service_1 = require("./refund.service");
async function createRefundHandler(request, reply) {
    try {
        const saleId = request.params.id;
        const { items, reason } = request.body;
        const userId = request.user.id;
        // Call service
        const refund = await refund_service_1.refundService.processRefund(userId, {
            saleId,
            items,
            reason
        });
        return reply.code(201).send(refund);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(400).send({
            message: error.message || 'Refund processing failed',
            error: 'Bad Request'
        });
    }
}
