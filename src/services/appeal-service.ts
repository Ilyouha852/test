import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

import { docClient } from '../config/dynamo-db.js';
import { TABLE_NAMES } from '../db/types.js';

export interface Appeal {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    user_id?: string;
    participants?: string[];
    created_at?: string;
}

const ddb = docClient;
const table = TABLE_NAMES.APPEALS;

/**
 * Перечислить открытые (in_progress) обращения и отформатировать читаемое сообщение.
 */
export async function listRequestsForUser(
    currentUserId: string | undefined,
): Promise<string> {
    if (!currentUserId)
        return 'Необходимо авторизоваться, чтобы увидеть обращения.';

    const params = {
        removeUndefinedValues: true,
        TableName: table,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#appealStatusId = :inProgress',
        ExpressionAttributeNames: { '#appealStatusId': 'appealStatusId' },
        ExpressionAttributeValues: { ':inProgress': 'in_progress' },
        ScanIndexForward: false,
        Limit: 20,
    } as any;

    let items: Appeal[] = [];

    try {
        const res = await ddb.send(new QueryCommand(params));
        items = (res.Items || []) as Appeal[];
    } catch {
        // Fallback на Scan, если Query/GSI недоступен
        try {
            const scanRes = await ddb.send(
                new ScanCommand({
                    TableName: table,
                    FilterExpression: '#appealStatusId = :inProgress',
                    ExpressionAttributeNames: {
                        '#appealStatusId': 'appealStatusId',
                    },
                    ExpressionAttributeValues: { ':inProgress': 'in_progress' },
                    Limit: 50,
                }),
            );
            items = (scanRes.Items || []) as Appeal[];
        } catch (error) {
            console.error('Failed to fetch appeals:', error);
            return 'Ошибка при получении обращений. Попробуйте позже.';
        }
    }

    if (!items || items.length === 0) return 'Нет обращений в работе.';

    const lines = items.map(req => {
        const createdAtDate = req.created_at
            ? new Date(req.created_at)
            : undefined;
        const createdAtFormatted = createdAtDate
            ? createdAtDate.toLocaleDateString()
            : 'Неизвестно';

        const snippet = `ID: ${req.id}\nНазвание: ${req.title || '(нет названия)'}\nОписание: ${req.description || '(без описания)'}\nСоздано: ${createdAtFormatted}`;

        const isAuthor =
            req.user_id && currentUserId && req.user_id === currentUserId;
        const isJoined =
            req.participants &&
            Array.isArray(req.participants) &&
            req.participants.includes(currentUserId!);

        if (isAuthor) {
            return `★ **${req.title || '(без названия)'}**\n${snippet}`;
        }
        if (isJoined) {
            return `**${req.title || '(без названия)'}**\n${snippet}`;
        }
        return snippet;
    });

    return lines.join('\n\n');
}

export default { listRequestsForUser };
