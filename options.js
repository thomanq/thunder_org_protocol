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

(async () => {
    const settings = await browser.storage.local.get();
    document.getElementById("protocol").value = settings.protocol || "capture";

    const savedParams = settings.params || {};
    defaultParams.forEach(param => {
        const savedValue = savedParams[param] || "custom";
        const savedCustomValue = savedParams[param + "_custom"] || "";
        document.getElementById("params").appendChild(createParamElement(param, savedValue, savedCustomValue));
    });
})();