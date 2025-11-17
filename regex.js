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
                        text: "regex [pattern] with flags [flags] matches [text]",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "h.+o" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "i" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "HELLO" }
                        }
                    },
                    {
                        opcode: "match",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "first regex match [pattern] with flags [flags] in [text]",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "\\d+" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "age 14 lol" }
                        }
                    },
                    {
                        opcode: "matchAll",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "ALL regex matches [pattern] with flags [flags] in [text] (JSON list)",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "\\w+" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "g" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "one two three" }
                        }
                    },
                    {
                        opcode: "countMatches",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "COUNT regex matches [pattern] with flags [flags] in [text]",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "\\w+" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "g" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "one two three" }
                        }
                    },
                    {
                        opcode: "captureGroup",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "group [n] of [pattern] with flags [flags] in [text]",
                        arguments: {
                            n: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "(\\d+)-(...)" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "123-abc" }
                        }
                    },
                    {
                        opcode: "indexOfMatch",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "index of first match [pattern] with flags [flags] in [text]",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "cat" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "my cat is vibing" }
                        }
                    },
                    {
                        opcode: "replaceOne",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "replace first [pattern] with [repl] in [text] (flags [flags])",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "a" },
                            repl: { type: Scratch.ArgumentType.STRING, defaultValue: "🍕" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "banana" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "" }
                        }
                    },
                    {
                        opcode: "replaceAll",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "replace all [pattern] with [repl] in [text] (flags [flags])",
                        arguments: {
                            pattern: { type: Scratch.ArgumentType.STRING, defaultValue: "\\d" },
                            repl: { type: Scratch.ArgumentType.STRING, defaultValue: "#" },
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "a1b2c3" },
                            flags: { type: Scratch.ArgumentType.STRING, defaultValue: "g" }
                        }
                    },
                    {
                        opcode: "escape",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "escape text [text] for regex",
                        arguments: {
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: "hello. (world)?" }
                        }
                    }
                ]
            };
        }

        makeRegex(pattern, flags) {
            try {
                return new RegExp(pattern, flags);
            } catch (e) {
                console.error("regex went kapow 💥", e);
                return null;
            }
        }

        test({ pattern, flags, text }) {
            const r = this.makeRegex(pattern, flags);
            return r ? r.test(text) : false;
        }

        match({ pattern, flags, text }) {
            const r = this.makeRegex(pattern, flags);
            if (!r) return "";
            const m = text.match(r);
            return m ? m[0] : "";
        }

        // 🔥🔥🔥 MAX CONTROL MATCHALL (REAL JSON LIST) 🔥🔥🔥
        matchAll({ pattern, flags, text }) {
            if (!flags.includes("g")) flags += "g";
            const r = this.makeRegex(pattern, flags);
            if (!r) return "[]";
            const arr = [...text.matchAll(r)].map(x => x[0]);
            return JSON.stringify(arr);
        }

        // 🔥 Count matches
        countMatches({ pattern, flags, text }) {
            if (!flags.includes("g")) flags += "g";
            const r = this.makeRegex(pattern, flags);
            if (!r) return 0;
            return [...text.matchAll(r)].length;
        }

        captureGroup({ n, pattern, flags, text }) {
            const r = this.makeRegex(pattern, flags);
            if (!r) return "";
            const match = text.match(r);
            if (!match) return "";
            return match[n] || "";
        }

        indexOfMatch({ pattern, flags, text }) {
            const r = this.makeRegex(pattern, flags);
            if (!r) return -1;
            const m = r.exec(text);
            return m ? m.index : -1;
        }

        replaceOne({ pattern, repl, text, flags }) {
            const r = this.makeRegex(pattern, flags);
            if (!r) return text;
            return text.replace(r, repl);
        }

        replaceAll({ pattern, repl, text, flags }) {
            if (!flags.includes("g")) flags += "g";
            const r = this.makeRegex(pattern, flags);
            if (!r) return text;
            return text.replace(r, repl);
        }

        escape({ text }) {
            return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
    }

    Scratch.extensions.register(new RegexExt());
})(Scratch);
