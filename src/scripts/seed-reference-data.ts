import 'dotenv/config';
import { createId } from '@paralleldrive/cuid2';

import { createEntityId, METADATA_SK, TABLE_NAMES } from '../db/types.js';
import { putItem } from '../db/tables/base.js';

// ✅ Данные из официальных словарей терминов проекта
const referenceData = {
    // Роли пользователей
    roles: ['Администратор', 'Сотрудник поддержки', 'Пользователь'],

    // ✅ Статусы обращений (Appeal_status) - из словаря статусов
    statuses: [
        'Новый', // Created
        'Прочитан', // Viewed
        'В работе', // In_progress
        'Ожидает ответа стороннего отдела', // Waiting_for_external
        'Решено', // Decided
        'Закрыт', // Closed
    ],

    // ✅ Категории обращений (Appeal_category) - из словаря категорий
    categories: [
        'Техническая ошибка', // Technical_bug
        'Консультация', // Consultation
        'Проблема с доступом', // Access_issue
    ],

    // ПО (Appeal_software)
    software: ['Windows', 'Office', '1С', 'Сеть', 'Другое'],

    // ✅ Критичность (Appeal_criticality) - из словаря критичностей
    criticality: [
        'Не проблема', // No_problem
        'Проблема', // Problem
        'Блокирующая проблема', // Blocking_problem
    ],

    // Подразделения (Appeal_subdivision)
    subdivisions: ['ИТ', 'Бухгалтерия', 'HR', 'Продажи', 'Маркетинг'],

    // ✅ Отношения пользователя к обращению (User_relation_to_appeal) - из словаря отношений
    relations: [
        'Заявитель', // Applicant
        'Принявший сотрудник', // Accepter_employee
        'Закрывший сотрудник', // Closer_employee
        'Подписчик', // Subscriber
    ],

    // Мессенджеры
    messengers: ['Telegram', 'WhatsApp', 'Email'],

    // ✅ Типы чатов - из словаря предметной области
    chatTypes: [
        'Личные сообщения', // Personal_messages
        'Группа', // Group_messages
    ],
};

async function seedReferenceData() {
    console.log('🌱 Seeding reference data with correct project terminology...');

    // Seed Roles
    console.log('\n📝 Creating User Roles...');
    for (const name of referenceData.roles) {
        const id = createEntityId('ROLE', createId());
        await putItem(TABLE_NAMES.USER_ROLES, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed Appeal Statuses (из словаря статусов)
    console.log('\n📝 Creating Appeal Statuses (from status dictionary)...');
    for (const name of referenceData.statuses) {
        const id = createEntityId('STATUS', createId());
        await putItem(TABLE_NAMES.APPEAL_STATUSES, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed Appeal Categories (из словаря категорий)
    console.log('\n📝 Creating Appeal Categories (from category dictionary)...');
    for (const name of referenceData.categories) {
        const id = createEntityId('CATEGORY', createId());
        await putItem(TABLE_NAMES.APPEAL_CATEGORIES, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed Software
    console.log('\n📝 Creating Software...');
    for (const name of referenceData.software) {
        const id = createEntityId('SOFTWARE', createId());
        await putItem(TABLE_NAMES.APPEAL_SOFTWARE, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed Criticality Levels (из словаря критичностей)
    console.log('\n📝 Creating Criticality Levels (from criticality dictionary)...');
    for (const name of referenceData.criticality) {
        const id = createEntityId('CRITICALITY', createId());
        await putItem(TABLE_NAMES.APPEAL_CRITICALITY, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed Subdivisions
    console.log('\n📝 Creating Subdivisions...');
    for (const name of referenceData.subdivisions) {
        const id = createEntityId('SUBDIVISION', createId());
        await putItem(TABLE_NAMES.APPEAL_SUBDIVISIONS, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed User Relations (из словаря отношений)
    console.log('\n📝 Creating User Relations (from relations dictionary)...');
    for (const name of referenceData.relations) {
        const id = createEntityId('RELATION', createId());
        await putItem(TABLE_NAMES.USER_RELATIONS, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed Messengers
    console.log('\n📝 Creating Messengers...');
    for (const name of referenceData.messengers) {
        const id = createEntityId('MESSENGER', createId());
        await putItem(TABLE_NAMES.MESSENGERS, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    // Seed Chat Types
    console.log('\n📝 Creating Chat Types...');
    for (const name of referenceData.chatTypes) {
        const id = createEntityId('CHATTYPE', createId());
        await putItem(TABLE_NAMES.CHAT_TYPES, { id, sk: METADATA_SK, name });
        console.log(`  ✅ ${name}`);
    }

    console.log(
        '\n🎉 Reference data seeded successfully with official project terminology!',
    );
    console.log('\n📚 Terminology sources:');
    console.log('  - Словарь статусов: 6 статусов');
    console.log('  - Словарь отношений: 4 типа отношений');
    console.log('  - Словарь критичностей: 3 уровня');
    console.log('  - Словарь категорий: 3 категории');
}

seedReferenceData()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error seeding data:', error);
        process.exit(1);
    });
