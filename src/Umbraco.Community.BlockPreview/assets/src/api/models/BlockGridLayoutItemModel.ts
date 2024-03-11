/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BlockGridLayoutAreaItemModel } from './BlockGridLayoutAreaItemModel';
import type { GuidUdiModel } from './GuidUdiModel';
import type { StringUdiModel } from './StringUdiModel';
import type { UnknownTypeUdiModel } from './UnknownTypeUdiModel';

export type BlockGridLayoutItemModel = {
    contentUdi?: (GuidUdiModel | StringUdiModel | UnknownTypeUdiModel) | null;
    settingsUdi?: (GuidUdiModel | StringUdiModel | UnknownTypeUdiModel) | null;
    columnSpan?: number | null;
    rowSpan?: number | null;
    areas: Array<BlockGridLayoutAreaItemModel>;
};
