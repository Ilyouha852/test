
import { createEntityId, METADATA_SK, TABLE_NAMES, type SupportStaff } from '../types.js';
import { getItem, putItem, deleteItem } from './base.js';

export async function createSupportStaff(login: string, name: string): Promise<SupportStaff> {
    const id = createEntityId('SUPPORT_STAFF', login);
    const now = new Date().toISOString();
    const staff: SupportStaff = {
        id,
        sk: METADATA_SK,
        login,
        name,
        createdAt: now,
    };
    await putItem(TABLE_NAMES.SUPPORT_STAFF, staff);
    return staff;
}

export async function getSupportStaffByLogin(login: string): Promise<SupportStaff | undefined> {
    const id = createEntityId('SUPPORT_STAFF', login);
    return getItem<SupportStaff>(TABLE_NAMES.SUPPORT_STAFF, id);
}

export async function isSupportStaff(login: string): Promise<boolean> {
    const staff = await getSupportStaffByLogin(login);
    return staff !== undefined;
}

export async function removeSupportStaff(login: string): Promise<void> {
    const id = createEntityId('SUPPORT_STAFF', login);
    await deleteItem(TABLE_NAMES.SUPPORT_STAFF, id);
}