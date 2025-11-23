export const RequestStatus = {
  idle: 0,
  loading: 1,
  succeeded: 2,
  failed: 3,
} as const;
export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];


export const ResponseStatus = {
  FailedToSave: 0,
  SavedSuccessfully: 1,
  Exception: 2,
  Success: 3,
  Failed: 4,
  FailedToFindTheObject: 5,
  AlreadyExisting: 6,
} as const;
export type ResponseStatus = typeof ResponseStatus[keyof typeof ResponseStatus];


export const StatusENum = {
  Draft: 1,
  Published: 2,
} as const;
export type StatusENum = typeof StatusENum[keyof typeof StatusENum];


export const State = {
  NotDeleted: 0,
  Deleted: 1,
} as const;
export type State = typeof State[keyof typeof State];


export const Days = {
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7
} as const;
export type Days = typeof Days[keyof typeof Days];
