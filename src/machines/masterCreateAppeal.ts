import { assign, createMachine, sendParent } from 'xstate';

export interface AppealCreateContext {
  userId: string | null;
  description?: string;
  category?: string;
  software?: string;
  criticality?: string;
  attachments?: string[];
}

export type AppealCreateEvent =
  | { type: 'ADD_DESCRIPTION'; description?: string }
  | { type: 'SELECT_CATEGORY'; category?: string }
  | { type: 'CHOOSE_SOFTWARE'; software?: string }
  | { type: 'SET_CRITICALITY'; criticality?: string }
  | { type: 'ATTACH_FILE'; fileId?: string }
  | { type: 'STOP_ATTACHING' }
  | { type: 'CONFIRM_CREATION' }
  | { type: 'CANCEL_CREATION' }
  | { type: 'CONFIRM_FIXATION' }
  | { type: 'CANCEL_FIXATION' }
  | { type: 'BACK' }
  | { type: 'HELP' };

export const appealCreateMachine = createMachine(
  {
    id: 'appealCreate',
    initial: 'manageAppeal',

    types: {} as {
      context: AppealCreateContext;
      events: AppealCreateEvent;
    },

    context: {
      userId: null,
      description: '',
      category: '',
      software: '',
      criticality: '',
      attachments: [],
    },

    states: {
      manageAppeal: {
        entry: 'showManageMenu',
        on: {
          ADD_DESCRIPTION: {
            target: 'waitingDescription',
            actions: 'saveDescriptionFromEvent',
          },
          SELECT_CATEGORY: {
            target: 'chooseCategory',
            actions: 'saveCategoryFromEvent',
          },
          CHOOSE_SOFTWARE: {
            target: 'waitingSoftware',
            actions: 'saveSoftwareFromEvent',
          },
          SET_CRITICALITY: {
            target: 'waitingCriticality',
            actions: 'saveCriticalityFromEvent',
          },
          ATTACH_FILE: {
            target: 'waitingAttachments',
            actions: 'addAttachmentFromEvent',
          },
          CONFIRM_CREATION: { target: 'fixationAppeal' },
          CANCEL_CREATION: {
            target: 'cancelled',
            actions: 'notifyParentCancelled',
          },
          HELP: { actions: 'showHelp' },
        },
      },

      waitingDescription: {
        entry: 'promptDescription',
        on: {
          BACK: { target: 'manageAppeal' },
          HELP: { actions: 'showHelp' },
        },
      },

      chooseCategory: {
        entry: 'promptCategory',
        on: {
          BACK: { target: 'manageAppeal' },
          HELP: { actions: 'showHelp' },
        },
      },

      waitingSoftware: {
        entry: 'promptSoftware',
        on: {
          BACK: { target: 'manageAppeal' },
          HELP: { actions: 'showHelp' },
        },
      },

      waitingCriticality: {
        entry: 'promptCriticality',
        on: {
          BACK: { target: 'manageAppeal' },
          HELP: { actions: 'showHelp' },
        },
      },

      waitingAttachments: {
        entry: 'promptAttachments',
        on: {
          STOP_ATTACHING: { target: 'manageAppeal' },
          BACK: { target: 'manageAppeal' },
          HELP: { actions: 'showHelp' },
        },
      },

      fixationAppeal: {
        entry: 'showAppealPreview',
        on: {
          CONFIRM_FIXATION: {
            target: 'created',
            actions: 'notifyParentCreated',
          },
          CANCEL_FIXATION: { target: 'manageAppeal' },
          HELP: { actions: 'showHelp' },
        },
      },

      created: {
        type: 'final',
      },

      cancelled: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      showManageMenu: () => {
        console.log('🧭 Управление обращением:');
      },

      promptDescription: () => console.log('📝 Введите описание обращения...'),
      saveDescriptionFromEvent: assign({
        description: ({ context, event }) =>
          event.type === 'ADD_DESCRIPTION' && event.description
            ? event.description
            : context.description,
      }),

      promptCategory: () => console.log('📂 Выберите категорию обращения...'),
      saveCategoryFromEvent: assign({
        category: ({ context, event }) =>
          event.type === 'SELECT_CATEGORY' && event.category
            ? event.category
            : context.category,
      }),

      promptSoftware: () =>
        console.log('💻 Выберите программное обеспечение...'),
      saveSoftwareFromEvent: assign({
        software: ({ context, event }) =>
          event.type === 'CHOOSE_SOFTWARE' && event.software
            ? event.software
            : context.software,
      }),

      promptCriticality: () => console.log('⚠️ Укажите степень критичности...'),
      saveCriticalityFromEvent: assign({
        criticality: ({ context, event }) =>
          event.type === 'SET_CRITICALITY' && event.criticality
            ? event.criticality
            : context.criticality,
      }),

      promptAttachments: () => console.log('📎 Прикрепите файлы...'),
      addAttachmentFromEvent: assign({
        attachments: ({ context, event }) =>
          event.type === 'ATTACH_FILE' && event.fileId
            ? [...(context.attachments ?? []), event.fileId]
            : context.attachments,
      }),

      showAppealPreview: ({ context }) => {
        console.log('📌 Предпросмотр обращения:');
        console.log(`🧑 Пользователь: ${context.userId ?? '—'}`);
      },

      notifyParentCreated: sendParent(() => ({
        type: 'CREATION_RESULT',
        result: 'created' as const,
      })),

      notifyParentCancelled: sendParent(() => ({
        type: 'CREATION_RESULT',
        result: 'cancelled' as const,
      })),

      showHelp: () => {
        console.log('Список доступных вам команд: ');
      },
    },
  },
);
