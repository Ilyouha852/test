import 'dotenv/config';

import { createId } from '@paralleldrive/cuid2';
import { describe, expect, it } from 'vitest';

import { createAppeal, deleteAppeal, getAppealById } from './appeal.js';
import {
    createAppealImage,
    deleteAppealImage,
    getAppealImageById,
} from './appeal-image.js';
// Import M:M Operations
import {
    createAppealUser,
    getUsersForAppeal,
    removeUserFromAppeal,
} from './appeal-user.js';
import { createChat, deleteChat, getChatById } from './chat.js';
import {
    createCommunication,
    deleteCommunication,
    getCommunicationById,
} from './communication.js';
import {
    createAppealCategory,
    deleteAppealCategory,
    getAppealCategoryByName,
} from './references/appeal-category.js';
import {
    createAppealCriticality,
    deleteAppealCriticality,
    getAppealCriticalityByName,
} from './references/appeal-criticality.js';
import {
    createAppealSoftware,
    deleteAppealSoftware,
    getAppealSoftwareByName,
} from './references/appeal-software.js';
import {
    createAppealStatus,
    deleteAppealStatus,
    getAppealStatusByName,
} from './references/appeal-status.js';
import {
    createAppealSubdivision,
    deleteAppealSubdivision,
    getAppealSubdivisionByName,
} from './references/appeal-subdivision.js';
import {
    createChatType,
    deleteChatType,
    getChatTypeByName,
} from './references/chat-type.js';
import {
    createMessenger,
    deleteMessenger,
    getMessengerByName,
} from './references/messenger.js';
import {
    createUserRelationToAppeal,
    deleteUserRelation,
    getUserRelationByName,
} from './references/user-relation.js';
// Import Reference Operations
import {
    createUserRole,
    deleteUserRole,
    getUserRoleByName,
} from './references/user-role.js';
import { createSolution, deleteSolution, getSolutionById } from './solution.js';
// Import Core Operations
import { createUser, deleteUser, getUserById } from './user.js';

describe('DynamoDB CRUD Operations', () => {
    // Store IDs for cleanup and linking
    const ids: Record<string, string> = {};

    describe('1. Reference Tables', () => {
        it('should create and retrieve UserRole', async () => {
            const name = `Test Role ${createId()}`;
            const role = await createUserRole({ name });
            expect(role).toBeDefined();
            expect(role.name).toBe(name);
            ids.roleId = role.id;

            const fetched = await getUserRoleByName(name);
            expect(fetched).toBeDefined();
            expect(fetched?.id).toBe(role.id);
        });

        it('should create and retrieve AppealStatus', async () => {
            const name = `Test Status ${createId()}`;
            const status = await createAppealStatus({ name });
            ids.statusId = status.id;
            const fetched = await getAppealStatusByName(name);
            expect(fetched?.id).toBe(status.id);
        });

        it('should create and retrieve AppealCategory', async () => {
            const name = `Test Category ${createId()}`;
            const category = await createAppealCategory({ name });
            ids.categoryId = category.id;
            const fetched = await getAppealCategoryByName(name);
            expect(fetched?.id).toBe(category.id);
        });

        it('should create and retrieve AppealSoftware', async () => {
            const name = `Test Software ${createId()}`;
            const software = await createAppealSoftware({ name });
            ids.softwareId = software.id;
            const fetched = await getAppealSoftwareByName(name);
            expect(fetched?.id).toBe(software.id);
        });

        it('should create and retrieve AppealCriticality', async () => {
            const name = `Test Criticality ${createId()}`;
            const criticality = await createAppealCriticality({ name });
            ids.criticalityId = criticality.id;
            const fetched = await getAppealCriticalityByName(name);
            expect(fetched?.id).toBe(criticality.id);
        });

        it('should create and retrieve AppealSubdivision', async () => {
            const name = `Test Subdivision ${createId()}`;
            const subdivision = await createAppealSubdivision({ name });
            ids.subdivisionId = subdivision.id;
            const fetched = await getAppealSubdivisionByName(name);
            expect(fetched?.id).toBe(subdivision.id);
        });

        it('should create and retrieve UserRelation', async () => {
            const name = `Test Relation ${createId()}`;
            const relation = await createUserRelationToAppeal({ name });
            ids.relationId = relation.id;
            const fetched = await getUserRelationByName(name);
            expect(fetched?.id).toBe(relation.id);
        });

        it('should create and retrieve Messenger', async () => {
            const name = `Test Messenger ${createId()}`;
            const messenger = await createMessenger({ name });
            ids.messengerId = messenger.id;
            const fetched = await getMessengerByName(name);
            expect(fetched?.id).toBe(messenger.id);
        });

        it('should create and retrieve ChatType', async () => {
            const name = `Test ChatType ${createId()}`;
            const chatType = await createChatType({ name });
            ids.chatTypeId = chatType.id;
            const fetched = await getChatTypeByName(name);
            expect(fetched?.id).toBe(chatType.id);
        });
    });

    describe('2. Core Tables', () => {
        it('should create and retrieve User', async () => {
            const email = `test-${createId()}@example.com`;
            const user = await createUser({
                email,
                roleId: ids.roleId!,
                firstName: 'Test',
                lastName: 'User',
                hashedPassword: 'hashed-password',
            });
            ids.userId = user.id;

            const fetched = await getUserById(user.id);
            expect(fetched).toBeDefined();
            expect(fetched?.email).toBe(email);
        });

        it('should create and retrieve Solution', async () => {
            const solution = await createSolution({
                solutionText: 'Test Solution',
            });
            ids.solutionId = solution.id;

            const fetched = await getSolutionById(solution.id);
            expect(fetched).toBeDefined();
            expect(fetched?.solutionText).toBe('Test Solution');
        });

        it('should create and retrieve Appeal', async () => {
            const appeal = await createAppeal({
                textOfTheAppeal: 'Test Appeal Text',
                appealStatusId: ids.statusId!,
                appealCategoryId: ids.categoryId!,
                appealSoftwareId: ids.softwareId!,
                appealCriticalityId: ids.criticalityId!,
                appealSubdivisionId: ids.subdivisionId!,
                solutionId: ids.solutionId!,
            });
            ids.appealId = appeal.id;

            const fetched = await getAppealById(appeal.id);
            expect(fetched).toBeDefined();
            expect(fetched?.textOfTheAppeal).toBe('Test Appeal Text');
            expect(fetched?.solutionId).toBe(ids.solutionId);
        });

        it('should create and retrieve Chat', async () => {
            const chat = await createChat({
                messengerId: ids.messengerId!,
                chatTypeId: ids.chatTypeId!,
                chatMessengerId: '123456',
            });
            ids.chatId = chat.id;

            const fetched = await getChatById(chat.id);
            expect(fetched).toBeDefined();
            expect(fetched?.messengerId).toBe(ids.messengerId);
        });

        it('should create and retrieve Communication', async () => {
            const comm = await createCommunication({
                chatId: ids.chatId!,
                userId: ids.userId!,
                userMessengerId: 'user-123',
                email: 'comm@example.com',
            });
            ids.commId = comm.id;

            const fetched = await getCommunicationById(comm.id);
            expect(fetched).toBeDefined();
            expect(fetched?.chatId).toBe(ids.chatId);
        });

        it('should create and retrieve AppealImage', async () => {
            const image = await createAppealImage({
                appealId: ids.appealId!,
                fileName: 'test-image.jpg',
            });
            ids.imageId = image.id;
            ids.imageSk = image.sk; // Needed for deletion if composite key

            const fetched = await getAppealImageById(image.id);
            expect(fetched).toBeDefined();
            expect(fetched?.fileName).toBe('test-image.jpg');
        });
    });

    describe('3. Many-to-Many Relationships', () => {
        it('should link User to Appeal (AppealUsers)', async () => {
            await createAppealUser({
                appealId: ids.appealId!,
                userId: ids.userId!,
                relationId: ids.relationId!,
                userMessengerId: 'user-123',
            });

            const users = await getUsersForAppeal(ids.appealId!);
            if (users.length > 0) {
                const user = users[0];
                expect(user?.userId).toBe(ids.userId);
                expect(user?.relationId).toBe(ids.relationId);
            }
        });

        it('should remove User from Appeal', async () => {
            await removeUserFromAppeal(
                ids.appealId!,
                ids.userId!,
                ids.relationId!,
            );
            const users = await getUsersForAppeal(ids.appealId!);
            expect(users).toHaveLength(0);
        });
    });

    describe('4. Cleanup', () => {
        it('should delete all created entities', async () => {
            // Delete in reverse order of dependencies
            if (ids.imageId && ids.appealId)
                await deleteAppealImage(ids.appealId, ids.imageSk!);
            if (ids.commId) await deleteCommunication(ids.commId);
            if (ids.chatId) await deleteChat(ids.chatId);
            if (ids.appealId) await deleteAppeal(ids.appealId);
            if (ids.solutionId) await deleteSolution(ids.solutionId);
            if (ids.userId) await deleteUser(ids.userId);

            // References
            if (ids.chatTypeId) await deleteChatType(ids.chatTypeId);
            if (ids.messengerId) await deleteMessenger(ids.messengerId);
            if (ids.relationId) await deleteUserRelation(ids.relationId);
            if (ids.subdivisionId)
                await deleteAppealSubdivision(ids.subdivisionId);
            if (ids.criticalityId)
                await deleteAppealCriticality(ids.criticalityId);
            if (ids.softwareId) await deleteAppealSoftware(ids.softwareId);
            if (ids.categoryId) await deleteAppealCategory(ids.categoryId);
            if (ids.statusId) await deleteAppealStatus(ids.statusId);
            if (ids.roleId) await deleteUserRole(ids.roleId);
        });
    });
});
