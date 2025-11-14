(function (Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) {
        throw new Error("BRO THIS REGEX EXTENSION NEEDS UNSANDBOXED 😭");
    }

    class RegexExt {
        getInfo() {
            return {
                id: "regexGoBrrr",
                name: "Regex Go BRRR 🔥",
                color1: "#ff44aa",
                blocks: [
                    {
                        opcode: "test",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "regex [pattern] matches [text]",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "h.+o" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "hello" }
                        }
                    },
                    {
                        opcode: "match",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "first regex match [pattern] in [text]",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "\\d+" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "age 14 lol" }
                        }
                    },
                    {
                        opcode: "matchAll",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "all regex matches [pattern] in [text]",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "\\w+" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "one two three" }
                        }
                    }
                ]
            };
        }

        test({ pattern, text }) {
            try {
                const r = new RegExp(pattern);
                return r.test(text);
            } catch (e) {
                console.error("regex go kaboom 💥", e);
                return false;
            }
        }

        match({ pattern, text }) {
            try {
                const r = new RegExp(pattern);
                const m = text.match(r);
                return m ? m[0] : "";
            } catch (e) {
                console.error("regex big sad 😭", e);
                return "";
            }
        }

        matchAll({ pattern, text }) {
            try {
                const r = new RegExp(pattern, "g");
                const m = [...text.matchAll(r)].map(x => x[0]);
                return m.join(", ");
            } catch (e) {
                console.error("regex exploded 💀", e);
                return "";
            }
        }
    }

    Scratch.extensions.register(new RegexExt());
})(Scratch);
