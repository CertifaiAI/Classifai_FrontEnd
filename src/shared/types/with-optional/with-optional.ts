type AllKeyOf<T> = T extends never ? never : keyof T;

type Omit<T, K> = { [P in Exclude<keyof T, K>]: T[P] };

type Optional<T, K> = { [P in Extract<keyof T, K>]?: T[P] };

export type WithOptional<T, K extends AllKeyOf<T>> = T extends never ? never : Omit<T, K> & Optional<T, K>;
