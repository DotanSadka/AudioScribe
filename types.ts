export interface TranscriptionResult {
  text: string;
  fileName: string;
  timestamp: Date;
}

export enum FileStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ProcessingState {
  status: FileStatus;
  message?: string;
  progress?: number;
}
