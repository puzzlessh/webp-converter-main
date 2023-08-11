export enum ProcessStatus {
  Success = 'success',
  Failed = 'failed',
}

export interface Process {
  name: string;
  path: string;
  status: ProcessStatus;
}
export interface ProcessSuccess extends Process {
  name: string;
  path: string;
  status: ProcessStatus.Success;
}

export interface ProcessFailed extends Process {
  name: string;
  status: ProcessStatus.Failed;
  error: string;
}

export type ProcessResult = ProcessSuccess | ProcessFailed;

export interface ProcessDone {
  success: ProcessSuccess[];
  failed: ProcessFailed[];
}

export function isProcessSuccess(value: ProcessResult): value is ProcessSuccess {
  return value.status === ProcessStatus.Success;
}

export function isProcessFailed(value: ProcessResult): value is ProcessFailed {
  return value.status === ProcessStatus.Failed;
}

export function processSuccess(name: string, path: string): ProcessSuccess {
  return { name, path, status: ProcessStatus.Success };
}

export function processFailed(name: string, path: string, error: unknown): ProcessFailed {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return { name, path, status: ProcessStatus.Failed, error: message };
}

export function processDone(results: ProcessResult[] = []): ProcessDone {
  const failed = results.filter(isProcessFailed);
  const success = results.filter(isProcessSuccess);

  return { failed, success };
}
