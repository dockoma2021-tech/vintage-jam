(() => {
    const nativeFetch = window.fetch.bind(window);
    const DATA_JSON_PATTERN = /(?:^|\/)data\/[^/?#]+\.json(?:[?#]|$)/i;

    window.fetch = (input, init = {}) => {
        const url = typeof input === "string" ? input : input?.url || "";
        if (!DATA_JSON_PATTERN.test(url)) return nativeFetch(input, init);

        const externalSignal = init.signal;
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);

        if (externalSignal) {
            if (externalSignal.aborted) controller.abort();
            else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
        }

        return nativeFetch(input, {
            ...init,
            cache: "no-store",
            signal: controller.signal
        }).finally(() => window.clearTimeout(timeout));
    };
})();
