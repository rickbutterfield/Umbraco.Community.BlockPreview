import { GetSettingsData, GetSettingsResponses } from "../api/types.gen";
import { RequestResult } from "../api/client";
import { getSettings as getSettingsApi } from "../api/sdk.gen.js";

export interface ISettingsDataSource {
    getSettings<ThrowOnError extends boolean = false>(throwOnError?: ThrowOnError):
        RequestResult<GetSettingsResponses, unknown, ThrowOnError>;
}

export class SettingsDataSource implements ISettingsDataSource {
    
    getSettings<ThrowOnError extends boolean = false>(throwOnError?: ThrowOnError):
        RequestResult<GetSettingsResponses, unknown, ThrowOnError> {
        const data = {} as GetSettingsData;
        return getSettingsApi({ ...data, throwOnError });
    }
}