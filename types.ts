
export interface GameIdea {
  title: string;
  description: string;
  rules: string[];
}

export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}
