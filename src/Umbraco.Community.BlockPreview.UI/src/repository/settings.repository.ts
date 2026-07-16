import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { SettingsDataSource } from "./settings.data-source";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

export class SettingsRepository extends UmbControllerBase {
    #settingsDataSource: SettingsDataSource;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#settingsDataSource = new SettingsDataSource();
    }

    async getSettings() {
        const settings = await this.#settingsDataSource.getSettings();

        if (settings && settings?.data) {
            return settings.data;
        }
    }
}