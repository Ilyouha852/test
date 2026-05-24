// import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// import { docClient } from '../config/dynamo-db.js';
// import { TABLE_NAMES } from '../db/types.js';

// const TABLE = TABLE_NAMES.COUNTERS;
// const COUNTER_ID = 'COUNTER';
// const COUNTER_SK = 'MAIN';

// export class CounterService {
//     async getCurrentCount(): Promise<number> {
//         try {
//             const command = new GetCommand({
//                 TableName: TABLE,
//                 Key: { id: COUNTER_ID, sk: COUNTER_SK },
//             });

//             const result = await docClient.send(command);
//             return result.Item?.count || 0;
//         } catch (error) {
//             console.error('Ошибка получения счетчика:', error);
//             return 0;
//         }
//     }

//     async incrementCounter(): Promise<number> {
//         try {
//             const command = new UpdateCommand({
//                 TableName: TABLE,
//                 Key: { id: COUNTER_ID, sk: COUNTER_SK },
//                 UpdateExpression: 'ADD #count :inc SET #updatedAt = :now',
//                 ExpressionAttributeNames: {
//                     '#count': 'count',
//                     '#updatedAt': 'updatedAt',
//                 },
//                 ExpressionAttributeValues: {
//                     ':inc': 1,
//                     ':now': new Date().toISOString(),
//                 },
//                 ReturnValues: 'ALL_NEW',
//             });

//             const result = await docClient.send(command);
//             return result.Attributes?.count || 0;
//         } catch (error: any) {
//             if (error.name === 'ResourceNotFoundException') {
//                 await this.createCounter();
//                 return 1;
//             }
//             console.error('Ошибка инкремента счетчика:', error);
//             return 0;
//         }
//     }

//     private async createCounter(): Promise<void> {
//         try {
//             const command = new PutCommand({
//                 TableName: TABLE,
//                 Item: {
//                     id: COUNTER_ID,
//                     sk: COUNTER_SK,
//                     count: 1,
//                     updatedAt: new Date().toISOString(),
//                 },
//             });

//             await docClient.send(command);
//         } catch (error) {
//             console.error('Ошибка создания счетчика:', error);
//         }
//     }

//     async resetCounter(): Promise<void> {
//         try {
//             const command = new PutCommand({
//                 TableName: TABLE,
//                 Item: {
//                     id: COUNTER_ID,
//                     sk: COUNTER_SK,
//                     count: 0,
//                     updatedAt: new Date().toISOString(),
//                 },
//             });

//             await docClient.send(command);
//         } catch (error) {
//             console.error('Ошибка сброса счетчика:', error);
//         }
//     }
// }

// export default new CounterService();
