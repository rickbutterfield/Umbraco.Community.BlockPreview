import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { SettingsRepository } from "..";
import { UmbObjectState, UmbStringState } from "@umbraco-cms/backoffice/observable-api";
import { BlockPreviewOptions } from "../api";
import { BlockPreviewRequestQueue } from "./block-preview-request-queue";

export class BlockPreviewContext extends UmbControllerBase {

    #settingsRepository: SettingsRepository;
    #requestQueue = new BlockPreviewRequestQueue(3);
    #stylesheetCache = new Map<string, CSSStyleSheet>();

    /** Shared concurrency-limited queue for preview API requests. */
    get requestQueue(): BlockPreviewRequestQueue {
        return this.#requestQueue;
    }

    #settings = new UmbObjectState<BlockPreviewOptions | undefined>(undefined);
    public readonly settings = this.#settings.asObservable();

    #unique = new UmbStringState('');
    public readonly unique = this.#unique.asObservable();

    #documentTypeUnique = new UmbStringState('');
    public readonly documentTypeUnique = this.#documentTypeUnique.asObservable();

    constructor(host: UmbControllerHost) {
        super(host);
        this.#settingsRepository = new SettingsRepository(host);

        this.getSettings();
    }

    async getSettings() {
        const settings = await this.#settingsRepository.getSettings();
        this.#settings.setValue(settings);
    }

    getUnique(): string {
        return this.#unique.getValue();
    }

    async setUnique(unique: string) {
        if (unique !== '') {
            this.#unique.setValue(unique);
        }
    }

    getDocumentTypeUnique(): string {
        return this.#documentTypeUnique.getValue();
    }

    async setDocumentTypeUnique(documentTypeUnique: string) {
        if (documentTypeUnique !== '') {
            this.#documentTypeUnique.setValue(documentTypeUnique);
        }
    }

    async getOrCreateStylesheet(href: string): Promise<CSSStyleSheet> {
        const cached = this.#stylesheetCache.get(href);
        if (cached) return cached;

        const response = await fetch(href);
        const css = await response.text();
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.#stylesheetCache.set(href, sheet);
        return sheet;
    }

}

export default BlockPreviewContext;