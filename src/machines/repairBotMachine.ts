import { createMachine, assign } from 'xstate';

export interface BotContext {
  problem?: string;
  solution?: string;
}

type BotEvent = 
  | { type: 'START' }
  | { type: 'DESCRIBE_PROBLEM'; problem: string }
  | { type: 'CONFIRM' }
  | { type: 'NEW_PROBLEM' }
  | { type: 'FINISH' };

export const repairBotMachine = createMachine({
  id: 'repairBot',
  initial: 'idle',
  context: {
    problem: undefined,
    solution: undefined
  },
  types: {} as {
    context: BotContext;
    events: BotEvent;
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'awaitingProblem',
          actions: () => console.log('🎯 Transition: idle -> awaitingProblem')
        }
      }
    },
    awaitingProblem: {
      entry: () => console.log('📝 Entering: awaitingProblem'),
      on: {
        DESCRIBE_PROBLEM: {
          target: 'solution',
          actions: [
            () => console.log('🎯 Transition: awaitingProblem -> solution'),
            assign({
              problem: ({ context, event }) => {
                console.log('📋 Problem received:', event.problem);
                return event.problem;
              },
              solution: ({ context, event }) => {
                const problem = event.problem.toLowerCase();
                let solution = '';
                
                if (problem.includes('скрипит') || problem.includes('заедает')) {
                  solution = 'WD-40';
                } else if (problem.includes('трещит') || problem.includes('отваливается')) {
                  solution = 'Изолента';
                } else {
                  solution = 'WD-40 или изолента';
                }
                
                console.log('💡 Solution determined:', solution);
                return solution;
              }
            })
          ]
        }
      }
    },
    solution: {
      entry: ({ context }) => console.log('✅ Entering: solution with:', context),
      on: {
        CONFIRM: 'success',
        NEW_PROBLEM: 'awaitingProblem',
        FINISH: 'idle'
      }
    },
    success: {
      entry: () => console.log('🎉 Entering: success'),
      on: {
        NEW_PROBLEM: 'awaitingProblem',
        FINISH: 'idle'
      }
    }
  }
});