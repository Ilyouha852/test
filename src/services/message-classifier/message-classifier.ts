// export type MessageRole = 'user' | 'staff';

// export type MessageClass =
//     | 'GREETING'
//     | 'NAVIGATION'
//     | 'PROBLEM_DESCRIPTION'
//     | 'CATEGORY_SELECTION'
//     | 'SOFTWARE_NAME'
//     | 'CRITICALITY_LEVEL'
//     | 'FILE_ATTACHMENT'
//     | 'SUPPORT_REPLY'
//     | 'STAFF_ACTION'
//     | 'CONFIRM'
//     | 'CANCEL'
//     | 'UNRECOGNIZED';

// export interface MessageClassificationResult {
//     class: MessageClass;
//     field: string | null;
//     state: string;
// }

// function flattenState(value: unknown): string {
//     // Приводит вложенное состояние XState к одной строке вида "createAppeal.waitingDescription".
//     if (typeof value === 'string') return value;
//     if (!value || typeof value !== 'object') return 'unknown';
//     const entries = Object.entries(value as Record<string, unknown>);
//     if (entries.length === 0) return 'unknown';
//     const firstEntry = entries[0];
//     if (!firstEntry) return 'unknown';
//     const [key, child] = firstEntry;
//     if (typeof child === 'string') return `${key}.${child}`;
//     return `${key}.${flattenState(child)}`;
// }

// class MessageClassifier {
//     classify(stateValue: unknown, role: MessageRole): MessageClassificationResult {
//         // Сначала читаем текущее состояние диалога, затем выбираем правила для пользователя или сотрудника.
//         const state = flattenState(stateValue);
//         if (role === 'staff') {
//             return this.classifyStaff(state);
//         }
//         return this.classifyUser(state);
//     }

//     private classifyUser(state: string): MessageClassificationResult {
//         // На этапе заполнения заявки текст пользователя относится к конкретному полю формы.
//         // Извлекаем последнюю часть состояния для switch (например, "createAppeal.waitingDescription" -> "waitingDescription")
//         const stateName = state.includes('.') ? state.split('.').pop() || state : state;

//         switch (stateName) {
//             case 'waitingDescription':
//                 return { class: 'PROBLEM_DESCRIPTION', field: 'message', state };
//             case 'chooseCategory':
//                 return { class: 'CATEGORY_SELECTION', field: 'category', state };
//             case 'waitingSoftware':
//                 return { class: 'SOFTWARE_NAME', field: 'software', state };
//             case 'waitingCriticality':
//                 return { class: 'CRITICALITY_LEVEL', field: 'criticality', state };
//             case 'waitingAttachments':
//                 return { class: 'FILE_ATTACHMENT', field: 'image', state };
//             case 'welcome':
//                 return { class: 'GREETING', field: null, state };
//             case 'listAppeals':
//             case 'specificAppeal':
//                 return { class: 'NAVIGATION', field: null, state };
//             case 'fixationAppeal':
//                 return { class: 'CONFIRM', field: null, state };
//             case 'cancelled':
//                 return { class: 'CANCEL', field: null, state };
//             default:
//                 return { class: 'UNRECOGNIZED', field: null, state };
//         }
//     }

//     private classifyStaff(state: string): MessageClassificationResult {
//         // Для сотрудника в состоянии Solving текст считается ответом/решением по обращению.
//         // Извлекаем последнюю часть состояния для switch
//         const stateName = state.includes('.') ? state.split('.').pop() || state : state;

//         switch (stateName) {
//             case 'Solving':
//                 return { class: 'SUPPORT_REPLY', field: 'context', state };
//             case 'Created':
//             case 'In_progress':
//                 return { class: 'STAFF_ACTION', field: null, state };
//             default:
//                 return { class: 'UNRECOGNIZED', field: null, state };
//         }
//     }
// }

// export const messageClassifier = new MessageClassifier();