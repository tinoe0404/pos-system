import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginInput } from './auth.schema';
export declare function loginHandler(request: FastifyRequest<{
    Body: LoginInput;
}>, reply: FastifyReply): Promise<never>;
export declare function meHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=auth.controller.d.ts.map