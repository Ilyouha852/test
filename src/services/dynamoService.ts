// Заглушка dynamoService - реализует функцию createAppeal
// Должна быть заменена на правильную интеграцию с базой данных

import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { createId } from '@paralleldrive/cuid2';

import { docClient, TABLE_NAME } from '../config/dynamodb.js';

export interface AppealContext {
  appealId?: string;
  userId: string | null;
  description?: string;
  category?: string;
  software?: string;
  criticality?: string;
  attachments?: string[];
}

/**
 * Создать новое обращение в DynamoDB
 */
export async function createAppeal(ctx: AppealContext): Promise<string> {
  const appealId = ctx.appealId || createId();
  const timestamp = new Date().toISOString();

  const appeal = {
    id: appealId,
    user_id: ctx.userId,
    title: `Обращение от ${ctx.userId || 'Аноним'}`,
    description: ctx.description || '',
    category: ctx.category || 'Общее',
    software: ctx.software || 'Н/Д',
    criticality: ctx.criticality || 'Нормальная',
    status: 'in_progress',
    created_at: timestamp,
    updated_at: timestamp,
    participants: ctx.userId ? [ctx.userId] : [],
    attachments: ctx.attachments || [],
  };

  console.log(`📝 Attempting to save to table: ${TABLE_NAME}`);
  console.log(`📝 Appeal data:`, appeal);

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: appeal,
    }),
  );

  console.log(`✅ Обращение ${appealId} создано в базе данных`);
  return appealId;
}

export default { createAppeal };
