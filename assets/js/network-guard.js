(() => {
    const nativeFetch = window.fetch.bind(window);
    const DATA_JSON_PATTERN = /(?:^|\/)data\/[^/?#]+\.json(?:[?#]|$)/i;

    async function guardedFetch(input, init = {}) {
        const externalSignal = init.signal;
        let lastError;

        for (let attempt = 0; attempt < 2; attempt += 1) {
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 10000);

            if (externalSignal) {
                if (externalSignal.aborted) controller.abort();
                else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
            }

            try {
                const response = await nativeFetch(input, {
                    ...init,
                    cache: "no-store",
                    signal: controller.signal
                });

                if (response.ok || response.status < 500 || attempt === 1) return response;
                lastError = new Error(`HTTP ${response.status}`);
            } catch (error) {
                lastError = error;
                if (externalSignal?.aborted) throw error;
            } finally {
                window.clearTimeout(timeout);
            }

            await new Promise(resolve => window.setTimeout(resolve, 500));
        }

        throw lastError || new Error("JSON request failed");
    }

    window.fetch = (input, init = {}) => {
        const url = typeof input === "string" ? input : input?.url || "";
        return DATA_JSON_PATTERN.test(url)
            ? guardedFetch(input, init)
            : nativeFetch(input, init);
    };
})();
