import { FastifyRequest, FastifyReply } from 'fastify';
import { tabsService } from './tabs.service';
import { CreateTabInput, DepositTabInput, CloseTabInput, TabSearchQuery } from './tabs.schema';

export async function createTabHandler(
    request: FastifyRequest<{ Body: CreateTabInput }>,
    reply: FastifyReply
) {
    try {
        const userId = (request as any).user.id;
        const tab = await tabsService.createTab(userId, request.body);
        return reply.code(201).send(tab);
    } catch (error: any) {
        return reply.code(400).send({ message: error.message });
    }
}

export async function getTabsHandler(
    request: FastifyRequest<{ Querystring: TabSearchQuery }>,
    reply: FastifyReply
) {
    try {
        const { q, status } = request.query as TabSearchQuery;
        const tabs = await tabsService.getTabs({ q, status });
        return reply.send({ tabs, count: tabs.length });
    } catch (error: any) {
        return reply.code(500).send({ message: error.message });
    }
}

export async function getTabByIdHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const tab = await tabsService.getTabById(request.params.id);
        return reply.send(tab);
    } catch (error: any) {
        return reply.code(404).send({ message: error.message });
    }
}

export async function depositToTabHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: DepositTabInput }>,
    reply: FastifyReply
) {
    try {
        const tab = await tabsService.depositToTab(
            request.params.id,
            request.body.amount,
            request.body.note
        );
        return reply.send(tab);
    } catch (error: any) {
        return reply.code(400).send({ message: error.message });
    }
}

export async function closeTabHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: CloseTabInput }>,
    reply: FastifyReply
) {
    try {
        const result = await tabsService.closeTab(request.params.id, request.body.note);
        return reply.send(result);
    } catch (error: any) {
        return reply.code(400).send({ message: error.message });
    }
}
