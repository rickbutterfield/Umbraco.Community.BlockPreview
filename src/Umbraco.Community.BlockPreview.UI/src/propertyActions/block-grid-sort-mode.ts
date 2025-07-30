import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbPropertyActionArgs } from "@umbraco-cms/backoffice/property-action";
import { UmbSortModePropertyAction } from "../property/sort-mode.property-action";
import { MetaPropertyActionSortModeKind } from "../property/types";

export class UmbBlockGridSortModePropertyAction extends UmbSortModePropertyAction {
    constructor(host: UmbControllerHost, args: UmbPropertyActionArgs<MetaPropertyActionSortModeKind>) {
        super(host, args);
    }
}

export { UmbBlockGridSortModePropertyAction as api };