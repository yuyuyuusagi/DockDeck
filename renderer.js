const { shell } = require("electron");

const dock = document.getElementById("dock");
const overlay = document.getElementById("overlay");

const nameInput = document.getElementById("nameInput");
const iconInput = document.getElementById("iconInput");
const urlInput = document.getElementById("urlInput");

const saveBtn = document.getElementById("saveBtn");
const addBtn = document.getElementById("addBtn");
const deleteBtn = document.getElementById("deleteBtn");
const closePanelBtn = document.getElementById("closePanelBtn");

let selectedIndex = null;

let settings = JSON.parse(localStorage.getItem("dockSettings")) || {
    direction: "horizontal",
    opacity: 90
};

let items = JSON.parse(localStorage.getItem("dockItems")) || [
    { name: "Edge", icon: "🌐", url: "https://www.microsoft.com/edge" },
    { name: "YouTube", icon: "▶️", url: "https://youtube.com" },
    { name: "GitHub", icon: "🐙", url: "https://github.com" },
    { name: "OpenAI", icon: "◎", url: "https://chat.openai.com" },
    { name: "空き", icon: "＋", url: "" },
    { name: "終了", icon: "×", url: "", type: "close" }
];

function saveAll() {
    localStorage.setItem("dockSettings", JSON.stringify(settings));
    localStorage.setItem("dockItems", JSON.stringify(items));
}

function applySettings() {
    dock.className = settings.direction;
    dock.style.opacity = settings.opacity / 100;
}

function openPanel(index) {
    selectedIndex = index;

    const item = items[index];

    nameInput.value = item.name || "";
    iconInput.value = item.icon || "";
    urlInput.value = item.url || "";

    overlay.classList.remove("hidden");
    renderDock();
}

function closePanel() {
    selectedIndex = null;
    overlay.classList.add("hidden");
    renderDock();
}

function renderDock() {
    dock.innerHTML = "";
    applySettings();

    items.forEach((item, index) => {
        const box = document.createElement("div");
        box.className = "dockItem";

        if (index === selectedIndex) box.classList.add("selected");
        if (item.type === "close") box.classList.add("close");

        box.innerHTML = `
      <div class="icon">${item.icon || "□"}</div>
      <div class="label">${item.name || "空き"}</div>
      <div class="indicator"></div>
    `;

        box.addEventListener("click", () => {
            if (item.type === "close") {
                window.close();
                return;
            }

            if (item.url) {
                shell.openExternal(item.url);
            } else {
                openPanel(index);
            }
        });

        box.addEventListener("dblclick", () => {
            if (item.type !== "close") {
                openPanel(index);
            }
        });

        dock.appendChild(box);
    });
}

saveBtn.addEventListener("click", () => {
    if (selectedIndex === null) return;

    items[selectedIndex] = {
        name: nameInput.value || "空き",
        icon: iconInput.value || "＋",
        url: urlInput.value || ""
    };

    saveAll();
    closePanel();
});

addBtn.addEventListener("click", () => {
    items.splice(items.length - 1, 0, {
        name: "新規",
        icon: "＋",
        url: ""
    });

    saveAll();
    openPanel(items.length - 2);
});

deleteBtn.addEventListener("click", () => {
    if (selectedIndex === null) return;
    if (items[selectedIndex]?.type === "close") return;

    items.splice(selectedIndex, 1);
    saveAll();
    closePanel();
});

closePanelBtn.addEventListener("click", closePanel);

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    const choice = prompt("1: 横向き\n2: 縦向き\n3: 透明度変更", "");

    if (choice === "1") settings.direction = "horizontal";
    if (choice === "2") settings.direction = "vertical";

    if (choice === "3") {
        const value = Number(prompt("透明度 30〜100", settings.opacity));
        if (!isNaN(value) && value >= 30 && value <= 100) {
            settings.opacity = value;
        }
    }

    saveAll();
    renderDock();
});

renderDock();