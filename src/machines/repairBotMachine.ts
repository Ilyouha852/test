import { createMachine, assign } from 'xstate';

type BotEvent = 
  | { type: 'MOVE' }                    // "Да, двигается"
  | { type: 'NOT_MOVE' }                // "Нет, не двигается"  
  | { type: 'YES_SHOULD' }              // "Да, должно"
  | { type: 'NO_SHOULD' };              // "Нет, не должно"

export const repairBotMachine = createMachine({
  id: 'repairBot',
  initial: 'start',
  context: {
    moves: undefined as boolean | undefined, // Сохраняем ответ на первый вопрос
  },
  types: {} as {
    context: { moves: boolean | undefined };
    events: BotEvent;
  },
  states: {
    start: {
      on: {
        MOVE: {
          target: 'ask_should_move',
          actions: assign({ moves: true }) // Запоминаем "двигается"
        },
        NOT_MOVE: {
          target: 'ask_should_move', 
          actions: assign({ moves: false }) // Запоминаем "не двигается"
        }
      },
      meta: {
        question: 'Это двигается?'
      }
    },
    ask_should_move: {
      on: {
        YES_SHOULD: 'ok', // "Да, должно" → всё ок
        NO_SHOULD: [
          {
            target: 'tape',
            guard: ({ context }) => context.moves === true // Двигается + не должно = изолента
          },
          {
            target: 'wd40', 
            guard: ({ context }) => context.moves === false // Не двигается + не должно = WD-40
          }
        ]
      },
      meta: {
        question: 'А должно?'
      }
    },
    wd40: {
      type: 'final',
      meta: {
        result: 'Используй WD-40'
      }
    },
    tape: {
      type: 'final',
      meta: {
        result: 'Используй изоленту'
      }
    },
    ok: {
      type: 'final',
      meta: {
        result: 'Тогда всё в порядке'
      }
    }
  }
});