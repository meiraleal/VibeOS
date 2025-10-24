import $APP from "/bootstrap.js";
import html from "/modules/mvc/view/html/index.js";
import T from "/modules/types/index.js";

$APP.events.on("INIT_APP", async () => {
	const btnOutset =
		"bg-neutral-200 border-2 border-solid border-t-neutral-100 border-l-neutral-100 border-r-neutral-400 border-b-neutral-400";
	const btnInset =
		"border-2 border-solid border-t-neutral-400 border-l-neutral-400 border-r-neutral-100 border-b-neutral-100";
	const panelInset =
		"bg-neutral-200 border-2 border-solid border-t-neutral-400 border-l-neutral-400 border-r-neutral-100 border-b-neutral-100";

	$APP.define("vibe-desktop", {
		properties: {
			windows: T.array([]),
			activeWindowId: T.string(""),
			time: T.string(""),
		},

		connected() {
			this.updateTime();
			this._timeInterval = setInterval(() => this.updateTime(), 1000);
		},

		disconnected() {
			if (this._timeInterval) clearInterval(this._timeInterval);
		},

		updateTime() {
			const now = new Date();
			this.time = now.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		},

		openApp(appId, appName, appIcon) {
			const existingWindow = this.windows.find((w) => w.appId === appId);
			if (existingWindow) {
				this.activeWindowId = existingWindow.id;
				this.restoreWindow(existingWindow.id); // Bring to front and unminimize
				return;
			}

			const newWindow = {
				id: `window-${Date.now()}`,
				appId,
				title: appName,
				icon: appIcon,
				x: Math.random() * 200 + 100,
				y: Math.random() * 100 + 50,
				minimized: false,
			};

			this.windows = [...this.windows, newWindow];
			this.activeWindowId = newWindow.id;
		},

		closeWindow(windowId) {
			this.windows = this.windows.filter((w) => w.id !== windowId);
			if (this.activeWindowId === windowId) {
				this.activeWindowId =
					this.windows.length > 0
						? this.windows[this.windows.length - 1].id
						: "";
			}
		},

		minimizeWindow(windowId) {
			this.windows = this.windows.map((w) =>
				w.id === windowId ? { ...w, minimized: true } : w,
			);
			if (this.activeWindowId === windowId) {
				this.activeWindowId = ""; // No active window when minimized
			}
		},

		restoreWindow(windowId) {
			this.windows = this.windows.map((w) =>
				w.id === windowId ? { ...w, minimized: false } : w,
			);
			this.activeWindowId = windowId;
		},

		focusWindow(windowId) {
			this.activeWindowId = windowId;
		},

		render() {
			// Re-themed apps to fit the Kingsway-style OS
			const apps = [
				{
					id: "player-status",
					name: "Player",
					icon: "👤", // Using emoji as placeholder for pixel art
				},
				{
					id: "inventory",
					name: "My Bag",
					icon: "🎒",
				},
				{
					id: "quest-log",
					name: "Quests",
					icon: "❓",
				},
				{
					id: "world-nav",
					name: "World...",
					icon: "🗺️",
				},
				{
					id: "combat-log",
					name: "Log",
					icon: "📝",
				},
			];

			return html`
                <!-- Google Font for pixel aesthetic -->
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
                    * {
                        font-family: 'VT323', monospace;
                        text-rendering: pixelated; /* Crispy pixels */
                        font-smooth: never;
                        -webkit-font-smoothing: none;
                        font-size: 18px; /* Base size for VT323 */
                        image-rendering: pixelated;
                    }
                    .ui-icon {
                        width: 48px;
                        height: 48px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 32px; /* Bigger emoji */
                        background: rgba(255,255,255,0.3);
                        border: 2px solid rgba(255,255,255,0.5);
                        border-radius: 8px;
                    }
                </style>
                
                <!-- Main Desktop Wallpaper -->
                <div class="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-purple-400 relative overflow-hidden">
                    
                    <!-- Desktop Icons Grid -->
                    <div class="absolute top-6 left-6 grid grid-cols-1 gap-4 z-0">
                        ${apps.map(
													(app) => html`
                                <div 
                                    @dblclick=${() => this.openApp(app.id, app.name, app.icon)}
                                    class="flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer hover:bg-black/10 group w-24"
                                >
                                    <div class="ui-icon">
                                        ${app.icon}
                                    </div>
                                    <span class="font-bold text-white text-center text-sm drop-shadow-[1px_1px_0px_rgba(0,0,0,0.7)]">
                                        ${app.name}
                                    </span>
                                </div>
                            `,
												)}
                    </div>

                    <!-- Windows -->
                    ${this.windows
											.filter((w) => !w.minimized)
											.map(
												(window, index) => html`
                                <div 
                                    @mousedown=${() => this.focusWindow(window.id)}
                                    class="absolute bg-neutral-200 ${btnOutset} shadow-lg rounded-sm overflow-hidden ${this.activeWindowId === window.id ? "z-20" : "z-10"}"
                                    style="left: ${window.x}px; top: ${window.y}px; width: 450px; min-height: 200px; font-size: 16px;"
                                >
                                    <!-- Title Bar -->
                                    <div class="p-1 flex items-center justify-between cursor-move ${this.activeWindowId === window.id ? "bg-blue-700 text-white" : "bg-neutral-300 text-gray-600"}">
                                        <div class="flex items-center gap-1">
                                            <span class="text-lg">${window.icon}</span>
                                            <span class="font-bold text-sm">
                                                ${window.title}
                                            </span>
                                        </div>
                                        <div class="flex gap-1">
                                            <button 
                                                @click=${(e) => {
																									e.stopPropagation();
																									this.minimizeWindow(
																										window.id,
																									);
																								}}
                                                class="w-5 h-5 ${btnOutset} active:${btnInset} font-bold text-black text-xs"
                                            >_</button>
                                            <button 
                                                @click=${(e) => {
																									e.stopPropagation();
																									this.closeWindow(window.id);
																								}}
                                                class="w-5 h-5 ${btnOutset} active:${btnInset} font-bold text-black text-xs"
                                            >×</button>
                                        </div>
                                    </div>

                                    <!-- Window Content -->
                                    <div class="h-auto overflow-auto bg-white ${btnInset} m-1" style="min-height: 200px;">
                                        ${this.renderWindowContent(window.appId)}
                                    </div>
                                </div>
                            `,
											)}

                    <!-- Taskbar -->
                    <div class="absolute bottom-0 left-0 right-0 h-10 bg-neutral-200 border-t-2 border-neutral-100 flex items-center justify-between px-1 z-30">
                        <div class="flex items-center gap-1">
                            <button class="px-2 py-0 h-8 ${btnOutset} active:${btnInset} flex items-center gap-1 font-bold">
                                🖥️ Menu
                            </button>

                            <div class="h-8 border-l-2 border-neutral-400 border-r-2 border-neutral-100 mx-1"></div>

                            ${this.windows.map(
															(window) => html`
                                    <button 
                                        @click=${() => (window.minimized ? this.restoreWindow(window.id) : this.focusWindow(window.id))}
                                        class="px-2 h-8 w-32 text-left truncate ${
																					this.activeWindowId === window.id &&
																					!window.minimized
																						? `${btnInset} bg-neutral-100`
																						: `${btnOutset} active:${btnInset}`
																				}"
                                    >
                                        <span class="text-sm">${window.icon} ${window.title}</span>
                                    </button>
                                `,
														)}
                        </div>

                        <div class="flex items-center gap-1">
                            <div class="px-2 py-1 ${panelInset} h-8">
                                <span class="font-bold text-sm">${this.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
		},

		renderWindowContent(appId) {
			switch (appId) {
				case "player-status":
					return html`<player-status></player-status>`;
				case "inventory":
					return html`<inventory-window></inventory-window>`;
				case "quest-log":
					return html`<quest-log></quest-log>`;
				case "world-nav":
					return html`<world-navigator></world-navigator>`;
				case "combat-log":
					return html`<combat-log></combat-log>`;
				default:
					return html`<div class="p-4 text-center text-gray-700">Content loading... ⚔️</div>`;
			}
		},
	});

	// --- NEW RPG APP COMPONENTS ---

	// Player Status Window
	$APP.define("player-status", {
		properties: {
			stats: T.object({
				health: 46,
				maxHealth: 76,
				magic: 28,
				maxMagic: 29,
				exp: 2614,
				maxExp: 3265,
			}),
		},
		render() {
			const healthPercent = (this.stats.health / this.stats.maxHealth) * 100;
			const magicPercent = (this.stats.magic / this.stats.maxMagic) * 100;
			const expPercent = (this.stats.exp / this.stats.maxExp) * 100;

			return html`
                <div class="p-2 text-sm">
                    <div class="mb-2">
                        <div class="flex justify-between">
                            <span>Health:</span>
                            <span>${this.stats.health} / ${this.stats.maxHealth}</span>
                        </div>
                        <div class="h-4 w-full bg-gray-300 ${btnInset} overflow-hidden">
                            <div class="h-full bg-red-500" style="width: ${healthPercent}%"></div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <div class="flex justify-between">
                            <span>Magic:</span>
                            <span>${this.stats.magic} / ${this.stats.maxMagic}</span>
                        </div>
                        <div class="h-4 w-full bg-gray-300 ${btnInset} overflow-hidden">
                            <div class="h-full bg-blue-500" style="width: ${magicPercent}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between">
                            <span>Experience / Next Level</span>
                        </div>
                        <div class="h-4 w-full bg-gray-300 ${btnInset} overflow-hidden">
                            <div class="h-full bg-green-500" style="width: ${expPercent}%"></div>
                        </div>
                    </div>
                </div>
            `;
		},
	});

	// Inventory Window
	$APP.define("inventory-window", {
		properties: {
			items: T.array([
				{ name: "Potion", icon: "🧪" },
				{ name: "King's...", icon: "👑" },
				{ name: "Master...", icon: "🗝️" },
				{ name: "Invisib...", icon: "💨" },
				{ name: "Sharpb...", icon: "🗡️" },
				{ name: "Hearty...", icon: "❤️" },
				{ name: "Book o...", icon: "📖" },
				{ name: "Gold N...", icon: "🪙" },
			]),
			weight: T.number(18.2),
			maxWeight: T.number(30),
		},
		render() {
			return html`
                <div class="p-1">
                    <div class="grid grid-cols-5 gap-1">
                        ${[...Array(10)].map((_, i) =>
													this.items[i]
														? html`
                                <div class="w-16 h-16 ${btnOutset} bg-neutral-100 flex items-center justify-center text-3xl cursor-pointer" title=${this.items[i].name}>
                                    ${this.items[i].icon}
                                </div>`
														: html`
                                <div class="w-16 h-16 ${btnInset} bg-neutral-100"></div>`,
												)}
                    </div>
                    <div class="mt-2 p-1 text-sm">
                        <span>Weight: ${this.weight} / ${this.maxWeight}</span>
                    </div>
                </div>
            `;
		},
	});

	// Quest Log Window
	$APP.define("quest-log", {
		properties: {
			quests: T.array([
				{
					id: 1,
					subject: "The King's Castle",
					from: "Adventure Corp",
					read: false,
					time: "11:09 AM",
				},
				{
					id: 2,
					subject: "Work from home",
					from: "Adventure Corp",
					read: true,
					time: "10:41 AM",
				},
				{
					id: 3,
					subject: "Community Watch",
					from: "Adventure Corp",
					read: true,
					time: "9:00 AM",
				},
			]),
			selectedQuestId: T.number(1),
		},
		selectQuest(id) {
			this.selectedQuestId = id;
			this.quests = this.quests.map((q) =>
				q.id === id ? { ...q, read: true } : q,
			);
		},
		render() {
			const selectedQuest = this.quests.find(
				(q) => q.id === this.selectedQuestId,
			);
			return html`
                <div class="flex h-full">
                    <!-- Quest List -->
                    <div class="w-1/2 border-r-2 ${btnInset} bg-neutral-100 overflow-y-auto">
                        <div class="p-1 border-b-2 ${btnOutset} bg-neutral-200">
                             <span class="text-sm">Subject</span>
                        </div>
                        ${this.quests.map(
													(q) => html`
                            <div 
                                @click=${() => this.selectQuest(q.id)}
                                class="p-1 border-b border-neutral-300 cursor-pointer ${this.selectedQuestId === q.id ? "bg-blue-200" : "hover:bg-neutral-100"} ${!q.read ? "font-bold" : ""}"
                            >
                                <span class="text-sm">${q.subject}</span>
                            </div>
                        `,
												)}
                    </div>
                    <!-- Quest Details -->
                    <div classs="w-1/2 p-2">
                        ${
													selectedQuest
														? html`
                            <div class="text-sm mb-2">
                                <strong>From:</strong> ${selectedQuest.from}<br>
                                <strong>Subject:</strong> ${selectedQuest.subject}
                            </div>
                            <hr class="border-neutral-300 my-1">
                            <p class="text-sm">
                                Hello, Player!
                                Making your way to the task.
                                There are three be the King's
                                Gate will open across the
                                island, and a powerful...
                            </p>
                        `
														: html`
                            <div class="p-2 text-sm text-gray-500">Select a quest to read.</div>
                        `
												}
                    </div>
                </div>
            `;
		},
	});

	// World Navigator Window
	$APP.define("world-navigator", {
		properties: {
			location: T.string("World / Outpost / Event"),
			story: T.string(
				"You stand at the entrance of the derelict house. There are several rooms. Where do you go?",
			),
			options: T.array(["Bedroom", "Hall", "Storeroom", "Library", "Leave"]),
		},
		render() {
			return html`
                <div class="p-1">
                    <div class="p-1 ${btnInset} bg-white mb-1">
                        <span class="text-sm">Location: ${this.location}</span>
                    </div>
                    <!-- Parchment Area -->
                    <div class="p-4 bg-amber-50 border-2 border-amber-800 my-2" style="min-height: 100px;">
                        <p>${this.story}</p>
                    </div>
                    <!-- Options -->
                    <div class="flex flex-col items-start gap-1">
                        ${this.options.map(
													(opt) => html`
                            <button class="text-blue-700 underline hover:text-blue-500 text-left">
                                ${opt}
                            </button>
                        `,
												)}
                    </div>
                </div>
            `;
		},
	});

	// Combat Log Window
	$APP.define("combat-log", {
		properties: {
			lines: T.array([
				{ text: "Player attacks Goat Man for 8 damage", color: "text-red-600" },
				{ text: "Defeated Goat Man", color: "text-green-600" },
				{ text: "Got 64 experience", color: "text-yellow-600" },
				{ text: "Got 7 gold", color: "text-yellow-600" },
				{ text: "Player uses Escape", color: "text-gray-600" },
				{ text: "Player ran away from Shrub Lord", color: "text-gray-600" },
			]),
		},
		render() {
			return html`
                <div class="p-1 text-sm overflow-y-auto">
                    ${this.lines.map(
											(line) => html`
                        <div class=${line.color}>${line.text}</div>
                    `,
										)}
                </div>
            `;
		},
	});

	// Main App Container
	$APP.define("app-container", {
		class: "w-full h-screen",
		render() {
			return html`<vibe-desktop></vibe-desktop>`;
		},
	});
});
