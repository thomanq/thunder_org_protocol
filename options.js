const defaultParams = ["template", "url", "title", "body"];

function createParamElement(param, savedValue = "custom", savedCustomValue = "") {
    const div = document.createElement("div");
    div.className = "param";

    const label = document.createElement("label");
    label.textContent = param + ": ";

    const select = document.createElement("select");
    select.innerHTML = `
    <option value="custom">Custom String</option>
    <option value="message_id">Message ID</option>
    <option value="message_subject">Message Subject</option>
  `;
    select.id = param;
    select.value = savedValue;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Custom value";
    input.id = param + "_custom";
    input.style.display = savedValue === "custom" ? "inline" : "none";
    input.value = savedCustomValue;

    const placeholder = document.createElement("div");
    placeholder.style.display = savedValue === "custom" ? "none" : "inline-block";
    placeholder.style.width = "100%";
    placeholder.style.height = "34px";

    select.addEventListener("change", () => {
        if (select.value === "custom") {
            input.style.display = "inline";
            placeholder.style.display = "none";
        } else {
            input.style.display = "none";
            placeholder.style.display = "inline-block";
        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
        div.remove();
    });

    div.appendChild(label);
    div.appendChild(select);
    div.appendChild(input);
    div.appendChild(placeholder);
    div.appendChild(deleteButton);

    // Ensure delete button is always in column 4
    div.style.display = "grid";
    div.style.gridTemplateColumns = "1fr 1fr 2fr auto";
    div.style.alignItems = "center";

    return div;
}

document.getElementById("add-param").addEventListener("click", () => {
    const param = prompt("Enter parameter name:");
    if (param) {
        document.getElementById("params").appendChild(createParamElement(param));
        updatePreviewURL();
    }
});

document.getElementById("save").addEventListener("click", async () => {
    const protocol = document.getElementById("protocol").value || "capture";
    const params = {};

    document.querySelectorAll(".param").forEach(div => {
        const select = div.querySelector("select");
        const input = div.querySelector("input");
        params[select.id] = select.value;
        if (select.value === "custom") {
            params[select.id + "_custom"] = input.value;
        }
    });

    await browser.storage.local.set({ protocol, params });
    alert("Settings saved!");
});

function updatePreviewURL() {
    const protocol = document.getElementById("protocol").value || "capture";
    const params = [];

    document.querySelectorAll(".param").forEach(div => {
        const select = div.querySelector("select");
        const input = div.querySelector("input");
        const key = select.id;
        const value = select.value === "custom" ? input.value : select.value.toUpperCase();
        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });

    const url = `org-protocol://${protocol}?${params.join("&")}`;
    document.getElementById("preview-url").textContent = url;
}

document.getElementById("protocol").addEventListener("input", updatePreviewURL);
document.getElementById("params").addEventListener("input", updatePreviewURL);
document.getElementById("params").addEventListener("change", updatePreviewURL);
document.getElementById("params").addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON" && event.target.textContent === "Delete") {
        updatePreviewURL();
    }
});

(async () => {
    const settings = await browser.storage.local.get();
    document.getElementById("protocol").value = settings.protocol || "capture";

    const paramsContainer = document.getElementById("params");
    const savedParams = settings.params;

    if (savedParams && Object.keys(savedParams).length > 0) {
        const paramNames = Object.keys(savedParams).filter(key => !key.endsWith("_custom"));

        paramNames.forEach(param => {
            const savedValue = savedParams[param];
            const savedCustomValue = savedParams[param + "_custom"] || "";
            paramsContainer.appendChild(createParamElement(param, savedValue, savedCustomValue));
        });
    } else {
        defaultParams.forEach(param => {
            paramsContainer.appendChild(createParamElement(param, "custom", ""));
        });
    }

    updatePreviewURL();
})();