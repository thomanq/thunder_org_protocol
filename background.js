browser.messageDisplayAction.onClicked.addListener(async (tab) => {
    const settings = await browser.storage.local.get();
    const protocol = settings.protocol || "capture";
    const defaultParams = {
        template: "custom",
        url: "custom",
        title: "custom",
        body: "custom"
    };

    const params = settings.params || defaultParams;
    const message = await browser.messageDisplay.getDisplayedMessage(tab.id);
    const urlParams = [];
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = params[key];

            if (value === "custom") {
                const customValue = params[`${key}_custom`] || "";
                urlParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(customValue)}`);
            } else if (value === "message_id") {
                const messageId = message?.headerMessageId || "";
                urlParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(messageId)}`);
            }
            else if (value === "message_subject") {
                const messageSubject = message?.subject || "";
                urlParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(messageSubject)}`);
            }

        }
    }
    const urlParamsString = urlParams.join("&");
    const url = `org-protocol://${protocol}?${urlParamsString}`;
    browser.tabs.create({ url }, (tab) => {
        const listener = (tabId, changeInfo) => {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                browser.tabs.remove(tab.id);
                browser.tabs.onUpdated.removeListener(listener);
            }
        };
        browser.tabs.onUpdated.addListener(listener);
    });
});