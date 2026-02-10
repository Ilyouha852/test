import type { AppealContext } from './dynamoService.js';
import { createAppeal } from './dynamoService.js';
import { moveTempToAppeal } from './s3Service.js';

export const saveAppealToDB = async (ctx: AppealContext) => {
    const appealId = await createAppeal(ctx);

    // Переносим все временные файлы
    const finalAttachments = [];
    for (const tempKey of ctx.attachments || []) {
        const newKey = await moveTempToAppeal(tempKey, appealId);
        finalAttachments.push(newKey);
    }

    return { appealId, attachments: finalAttachments };
};
