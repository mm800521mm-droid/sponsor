
/* =========================================
   FIVE NIGHTS AT RIFT ASH
   COMPLETE DIALOGUE SYSTEM
   ========================================= */

const DialogueSystem = (() => {

    const DEFAULT_SPEED = 35;
    const PUNCTUATION_DELAY = 180;

    let currentRun = 0;
    let skipRequested = false;

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const COMMAND_PATTERN =
        /(\*\d+(?:\.\d+)?|\/|\[(?:red|cyan|yellow|gray|white|shake|glitch|blink|big|fade|normal|boxglitch|speed=\d+)\])/g;

    const EFFECTS = [
        "red", "cyan", "yellow", "gray", "white",
        "shake", "glitch", "blink", "big", "fade"
    ];

    function clear(element) {
        if (!element) return;

        element.replaceChildren();
        element.classList.remove("box-glitch");
    }

    function stop(element) {
        currentRun++;
        skipRequested = false;

        if (element) {
            element.classList.remove("box-glitch");
        }
    }

    function skip() {
        skipRequested = true;
    }

    function addCharacter(element, char, effects) {
        const span = document.createElement("span");

        span.classList.add("dialogue-char");

        for (const effect of effects) {
            span.classList.add("dialogue-" + effect);
        }

        span.textContent = char;
        element.appendChild(span);
    }

    function processCommand(command, state, element, options) {

        if (command === "normal") {
            state.effects = [];
            state.speed = options.speed ?? DEFAULT_SPEED;
            element.classList.remove("box-glitch");
            return;
        }

        if (command === "boxglitch") {
            element.classList.add("box-glitch");
            return;
        }

        if (command.startsWith("speed=")) {
            const value = Number(command.split("=")[1]);

            if (Number.isFinite(value)) {
                state.speed = Math.max(0, value);
            }

            return;
        }

        if (EFFECTS.includes(command)) {
            if (!state.effects.includes(command)) {
                state.effects.push(command);
            }
        }
    }

    async function renderLine(text, element, runId, options) {

        const state = {
            effects: [],
            speed: options.speed ?? DEFAULT_SPEED
        };

        const tokens = String(text).split(COMMAND_PATTERN);

        for (const token of tokens) {

            if (runId !== currentRun) return;

            if (!token) continue;

            // 换行
            if (token === "/") {
                element.appendChild(document.createElement("br"));
                continue;
            }

            // 停顿
            if (/^\*\d+(?:\.\d+)?$/.test(token)) {
                if (!skipRequested) {
                    await wait(Number(token.slice(1)) * 1000);
                }
                continue;
            }

            // 控制符
            if (token.startsWith("[") && token.endsWith("]")) {
                processCommand(
                    token.slice(1, -1),
                    state,
                    element,
                    options
                );
                continue;
            }

            // 逐字显示
            for (let i = 0; i < token.length; i++) {

                if (runId !== currentRun) return;

                addCharacter(element, token[i], state.effects);

                // 跳过后直接显示本句剩余内容
                if (skipRequested) {
                    for (let j = i + 1; j < token.length; j++) {
                        addCharacter(element, token[j], state.effects);
                    }
                    break;
                }

                const delay = "，。！？；：,.!?;:……".includes(token[i])
                    ? PUNCTUATION_DELAY
                    : state.speed;

                if (delay > 0) {
                    await wait(delay);
                }
            }
        }

        if (runId === currentRun) {
            element.classList.remove("box-glitch");
        }
    }

    async function play(text, element, options = {}) {

        if (!element) {
            console.error("找不到字幕容器！");
            return;
        }

        const runId = ++currentRun;
        skipRequested = false;

        clear(element);

        await renderLine(text, element, runId, options);
    }

    async function playTape(tape, element, options = {}) {

        if (!element || !Array.isArray(tape)) {
            console.error("字幕容器或 tape 格式错误！");
            return;
        }

        const runId = ++currentRun;
        skipRequested = false;

        for (const line of tape) {

            if (runId !== currentRun) return;

            clear(element);

            await renderLine(line, element, runId, options);
        }

        if (runId === currentRun) {
            element.classList.remove("box-glitch");
        }
    }

    return {
        play,
        playTape,
        clear,
        stop,
        skip
    };

})();

/* =========================================
   GAME TEST AND BUTTON CONNECTIONS
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const dialogue = document.getElementById("dialogue");

    const skipButton = document.getElementById("skipButton");
    const stopButton = document.getElementById("stopButton");
    const testButton = document.getElementById("testButton");

    if (skipButton) {
        skipButton.addEventListener("click", () => {
            DialogueSystem.skip();
        });
    }

    if (stopButton) {
        stopButton.addEventListener("click", () => {
            DialogueSystem.stop(dialogue);
        });
    }

    if (testButton) {
        testButton.addEventListener("click", () => {

            DialogueSystem.playTape([
                "喂？有人吗？",
                "[yellow]这里是黄色文字。",
                "[red][shake]危险！！",
                "[cyan][glitch]滋滋滋——",
                "[blink]信号中断。",
                "[big][red]快关门！！",
                "[normal]普通字幕恢复。"
            ], dialogue);

        });
    }

});
