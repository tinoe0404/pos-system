import { FastifyRequest, FastifyReply } from 'fastify';
import { tabsService } from './tabs.service';
import { CreateTabInput, DepositTabInput, CloseTabInput, TabSearchQuery } from './tabs.schema';

export async function createTabHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const user = request.user as { id: string };
        const body = request.body as CreateTabInput;
        const tab = await tabsService.createTab(user.id, body);
        return reply.code(201).send(tab);
    } catch (error: any) {
        return reply.code(400).send({ message: error.message });
    }
}

export async function getTabsHandler(
    request: FastifyRequest,
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
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { id } = request.params as { id: string };
        const tab = await tabsService.getTabById(id);
        return reply.send(tab);
    } catch (error: any) {
        return reply.code(404).send({ message: error.message });
    }
}

export async function depositToTabHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { id } = request.params as { id: string };
        const body = request.body as DepositTabInput;
        const tab = await tabsService.depositToTab(
            id,
            body.amount,
            body.note
        );
        return reply.send(tab);
    } catch (error: any) {
        return reply.code(400).send({ message: error.message });
    }
}

export async function closeTabHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { id } = request.params as { id: string };
        const body = request.body as CloseTabInput;
        const result = await tabsService.closeTab(id, body.note);
        return reply.send(result);
    } catch (error: any) {
        return reply.code(400).send({ message: error.message });
    }
}
