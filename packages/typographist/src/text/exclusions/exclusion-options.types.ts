export type ExclusionOptions = {
  readonly addresses?: boolean;
  readonly numbers?: boolean;
  readonly underscores?: boolean;
  readonly camelCase?: boolean;
  readonly custom?: (word: string) => boolean;
};
