import { createId } from '@paralleldrive/cuid2';

import {
    createEntityId,
    METADATA_SK,
    TABLE_NAMES,
    type ChatType,
    type ReferenceCreateInput,
} from '../../types.js';
import { deleteItem, getItem, putItem, queryByGSI } from '../base.js';

export async function createChatType(
    input: ReferenceCreateInput,
): Promise<ChatType> {
    const id = createEntityId('CHATTYPE', createId());

    const chatType: ChatType = {
        id,
        sk: METADATA_SK,
        name: input.name,
    };

    await putItem(TABLE_NAMES.CHAT_TYPES, chatType);
    return chatType;
}

export async function getChatTypeById(
    chatTypeId: string,
): Promise<ChatType | null> {
    return getItem<ChatType>(TABLE_NAMES.CHAT_TYPES, chatTypeId);
}

export async function getChatTypeByName(
    name: string,
): Promise<ChatType | null> {
    const chatTypes = await queryByGSI<ChatType>(
        TABLE_NAMES.CHAT_TYPES,
        'NameIndex',
        '#name = :name',
        { ':name': name },
        { '#name': 'name' },
    );
    return chatTypes[0] || null;
}

export async function deleteChatType(chatTypeId: string): Promise<void> {
    await deleteItem(TABLE_NAMES.CHAT_TYPES, chatTypeId);
}
