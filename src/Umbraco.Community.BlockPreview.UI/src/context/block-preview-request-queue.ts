/**
 * Concurrency-limited request queue for block preview API calls.
 *
 * When a page has many blocks, all preview elements fire API requests
 * simultaneously after their debounce timers expire. This overwhelms
 * the server and can cause empty or malformed responses.
 *
 * Inspired by the CMS `UmbManagementApiItemDataCache.scheduleBatchedFetch`
 * pattern, this queue limits concurrent in-flight requests so the server
 * processes a manageable number at a time.
 */
export class BlockPreviewRequestQueue {
    #maxConcurrent: number;
    #activeCount = 0;
    #queue: Array<() => void> = [];

    constructor(maxConcurrent: number = 3) {
        this.#maxConcurrent = maxConcurrent;
    }

    /**
     * Enqueue a task to run with concurrency limiting.
     * If fewer than `maxConcurrent` tasks are active, the task runs immediately.
     * Otherwise it waits until a slot is available.
     */
    async enqueue<T>(task: () => Promise<T>): Promise<T> {
        if (this.#activeCount >= this.#maxConcurrent) {
            await new Promise<void>((resolve) => {
                this.#queue.push(resolve);
            });
        }

        this.#activeCount++;
        try {
            return await task();
        } finally {
            this.#activeCount--;
            if (this.#queue.length > 0) {
                const next = this.#queue.shift()!;
                next();
            }
        }
    }
}
