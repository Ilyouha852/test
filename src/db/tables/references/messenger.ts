import { createId } from '@paralleldrive/cuid2';

import {
    createEntityId,
    METADATA_SK,
    TABLE_NAMES,
    type Messenger,
    type ReferenceCreateInput,
} from '../../types.js';
import { deleteItem, getItem, putItem, queryByGSI } from '../base.js';

export async function createMessenger(
    input: ReferenceCreateInput,
): Promise<Messenger> {
    const id = createEntityId('MESSENGER', createId());

    const messenger: Messenger = {
        id,
        sk: METADATA_SK,
        name: input.name,
    };

    await putItem(TABLE_NAMES.MESSENGERS, messenger);
    return messenger;
}

export async function getMessengerById(
    messengerId: string,
): Promise<Messenger | null> {
    return getItem<Messenger>(TABLE_NAMES.MESSENGERS, messengerId);
}

export async function getMessengerByName(
    name: string,
): Promise<Messenger | null> {
    const messengers = await queryByGSI<Messenger>(
        TABLE_NAMES.MESSENGERS,
        'NameIndex',
        '#name = :name',
        { ':name': name },
        { '#name': 'name' },
    );
    return messengers[0] || null;
}

export async function deleteMessenger(messengerId: string): Promise<void> {
    await deleteItem(TABLE_NAMES.MESSENGERS, messengerId);
}
