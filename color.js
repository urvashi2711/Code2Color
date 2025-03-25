const textarea = document.querySelector("#textarea");
    const copybtn = document.querySelector(".button.copy");
    const tooltip = document.querySelector(".tooltip");

    textarea.oninput = () => {
        const base = textarea.innerHTML.replace(/<(\/?(br|span|span class="ansi-[0-9]*"))>/g,"[$1]");
        if (base.includes("<") || base.includes(">")) {
            textarea.innerHTML = base.replace(/<.*?>/g, "").replace(/[<>]/g, "").replace(/\[(\/?(br|span|span class="ansi-[0-9]*"))\]/g, "<$1>");
        }
    };

    document.querySelectorAll(".style-button").forEach((btn) => {
        btn.onclick = () => {
            if (!btn.dataset.ansi) {
                textarea.innerText = textarea.innerText;
                return;
            }

            const selection = window.getSelection();
            const text = selection.toString();

            const span = document.createElement("span");
            span.innerText = text;
            span.classList.add(`ansi-${btn.dataset.ansi}`);

            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(span);

            range.selectNodeContents(span);
            selection.removeAllRanges();
            selection.addRange(range);
        };
    });

    copybtn.onclick = () => {
        const toCopy = "```ansi\n" + nodesToANSI(textarea.childNodes, [{ fg: 2, bg: 2, st: 2 }]) + "\n```";
        navigator.clipboard.writeText(toCopy).then(() => {
            copybtn.style.backgroundColor = "#3BA55D";
            copybtn.innerText = "Copied!";
            setTimeout(() => {
                copybtn.style.backgroundColor = null;
                copybtn.innerText = "Copy to Clipboard";
            }, 2000);
        });
    };

    function nodesToANSI(nodes, states) {
        let text = "";
        for (const node of nodes) {
            if (node.nodeType === 3) {
                text += node.textContent;
                continue;
            }
            if (node.nodeName === "BR") {
                text += "\n";
                continue;
            }
            const ansiCode = +(node.className.split("-")[1]);
            const newState = { ...states.at(-1) };

            states.push(newState);
            text += `\x1b[${newState.st};${ansiCode}m`;
            text += nodesToANSI(node.childNodes, states);
            states.pop();
            text += `\x1b[0m`;
        }
        return text;
    }