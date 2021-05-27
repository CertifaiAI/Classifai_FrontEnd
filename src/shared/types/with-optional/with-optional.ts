/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type AllKeyOf<T> = T extends never ? never : keyof T;

type Omit<T, K> = { [P in Exclude<keyof T, K>]: T[P] };

type Optional<T, K> = { [P in Extract<keyof T, K>]?: T[P] };

export type WithOptional<T, K extends AllKeyOf<T>> = T extends never ? never : Omit<T, K> & Optional<T, K>;
