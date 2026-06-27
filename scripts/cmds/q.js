module.exports = {
    config: {
        name: "fakechat",
        aliases: ["q"],
        author: "Tawsif~",//Modified by Neoaz
        category: "fun",
        version: "2.5 pro",
        countDown: 5,
        role: 0,
        shortDescription: "create fakechat image",
        guide: {
            en: "<text> ++ <text> | reply | --own <texts> | --user <uid> | --attachment <image url> | --time <true or false> | --name <true or false> | blank\nSupports almost all themes"
        }
    },
    onStart: async function({
        message,
        usersData,
        threadsData,
        event,
        args,
        api
    }) {
        let prompt = args.join(" ").split("\n\n").join("##").split("\n").join("####");
        if (!prompt) {
            return message.reply("❌ | provide a text");
        }
        let themeMode = "dark";
        if (prompt.match(/--theme/)) {
            themeMode = (prompt.split("--theme ")[1]).split(" ")[0];
        }
        const ti = await api.getThreadInfo(event.threadID);

        let otc  = "3874ff";   
        let otcc = "ffffff";   
        let tc   = "3874ff";   
        let bc   = "1a1a1a";   
        let bg   = "";          

        const extractHex = (color) => {
            if (color === null || color === undefined) return null;

            if (typeof color === 'number') {
                if (!isFinite(color)) return null;
                const argb = (color >>> 0).toString(16).padStart(8, '0');
                return argb.slice(2); 
            }

            if (typeof color === 'string') {
                let hex = color.trim().replace(/^#/, '').replace(/^0x/i, '');

                if (hex.length === 8) hex = hex.slice(2);

                hex = hex.slice(0, 6).toLowerCase();

                if (hex.length === 6 && /^[0-9a-f]{6}$/.test(hex)) return hex;
            }

            return null;
        };

        const isDark = (hex) => {
            if (!hex || hex.length !== 6) return true; 
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
        };

        try {
            const themeId = ti?.threadTheme?.id;

            if (themeId) {
                let themeData = null;
                try {
                    const themeList = await api.theme("list", event.threadID);
                    themeData = themeList.find(t => t.id === themeId) || null;
                } catch (_) {}

                if (!themeData) {
                    try {
                        const fetched = await api.fetchThemeData(themeId);
                        if (fetched) {
                            themeData = {
                                gradientColors:              fetched.gradient_colors              || [],
                                backgroundGradientColors:    fetched.background_gradient_colors   || [],
                                inboundMessageGradientColors:fetched.inbound_message_gradient_colors || [],
                                messageTextColor:            fetched.message_text_color            || null,
                                inboundMessageTextColor:     fetched.inbound_message_text_color    || null,
                                composerBackgroundColor:     fetched.composer_background_color     || null,
                                composerInputBackgroundColor:fetched.composer_input_background_color || null,
                                titleBarBackgroundColor:     fetched.title_bar_background_color    || null,
                                titleBarButtonTintColor:     fetched.title_bar_button_tint_color   || null,
                                fallbackColor:               fetched.fallback_color                || null,
                                backgroundImage:             fetched.backgroundImage               || null,
                                appColorMode:                fetched.app_color_mode                || null,
                            };
                        }
                    } catch (_) {}
                }

                if (themeData) {
                    const outboundCandidates = [
                        ...(themeData.gradientColors || []),
                        themeData.titleBarButtonTintColor,
                        themeData.fallbackColor,
                    ];
                    for (const c of outboundCandidates) {
                        const h = extractHex(c);
                        if (h) { otc = h; break; }
                    }

                    const msgTextHex = extractHex(themeData.messageTextColor);
                    if (msgTextHex) otcc = msgTextHex;

                    const inboundList = themeData.inboundMessageGradientColors || [];
                    for (const c of inboundList) {
                        const h = extractHex(c);
                        if (h) {
                            if (isDark(h)) {
                                tc = h;   
                            } else {
                                tc = "2d2d2d";  
                            }
                            break;
                        }
                    }

                    const barCandidates = [
                        themeData.titleBarBackgroundColor,
                        themeData.composerBackgroundColor,
                    ];
                    for (const c of barCandidates) {
                        const h = extractHex(c);
                        if (h) {
                            bc = isDark(h) ? h : "1a1a1a";
                            break;
                        }
                    }

                    if (themeData.backgroundImage) bg = themeData.backgroundImage;
                }
            }
        } catch (_) {}

        let id = event.senderID;
        if (event.messageReply) {
            if (prompt.match(/--user/)) {
                const rawUID = prompt.split("--user ")[1].split(" ")[0];
                if (rawUID.match(/.com/)) {
                    try { id = await api.getUID(rawUID); }
                    catch (e) { message.reply("your bot is unable to fetch UID from profile link"); }
                } else {
                    id = rawUID;
                }
            } else {
                id = event.messageReply.senderID;
            }
        } else if (prompt.match(/--user/)) {
            const rawUID = prompt.split("--user ")[1].split(" ")[0];
            if (rawUID.match(/.com/)) {
                id = await api.getUID(rawUID);
            } else {
                id = rawUID;
            }
        }

        if (
            event?.messageReply?.senderID === "100063840894133" ||
            event?.messageReply?.senderID === "100083343477138"
        ) {
            if (
                event.senderID !== "100063840894133" &&
                event.senderID !== "100083343477138"
            ) {
                prompt = "hi guys I'm gay";
                id = event.senderID;
            }
        }

        if (Object.keys(await usersData.get(id)).length < 1) {
            await usersData.refreshInfo(id);
        }

        const name = prompt?.split("--name ")[1]?.split(" ")[0] === "false"
            ? ""
            : ti?.nicknames[id] || (await usersData.getName(id)).split(" ")[0];

        const avatarUrl = await usersData.getAvatarUrl(id);

        let replyImage;
        if (event?.messageReply?.attachments[0]) {
            replyImage = event.messageReply.attachments[0].url;
        } else if (prompt.match(/--attachment/)) {
            replyImage = (prompt.split("--attachment ")[1]).split(" ")[0];
        }

        let time = prompt?.split("--time ")[1];
        time = (!time || time === "true") ? "true" : "";

        let ownText = false;
        if (prompt.match(/--own/)) {
            ownText = prompt?.split("--own")[1]?.split("--")[0];
        }

        const { emoji } = ti;
        prompt = prompt.split("--")[0];

        message.reaction("⏳", event.messageID);

        try {
            let url = `https://tawsif.is-a.dev/fakechat/max`
                + `?theme=${themeMode}`
                + `&name=${encodeURIComponent(name)}`
                + `&avatar=${encodeURIComponent(avatarUrl)}`
                + `&text=${encodeURIComponent(prompt)}`
                + `&time=${time}`
                + `&emoji=${encodeURIComponent(emoji)}`
                + `&textBg=${encodeURIComponent("#" + tc)}`
                + `&ownTextBg=${encodeURIComponent("#" + otc)}`
                + `&bg=${encodeURIComponent(bg)}`
                + `&barColor=${encodeURIComponent("#" + bc)}`
                + `&ownTextColor=${encodeURIComponent("#" + otcc)}`;

            if (replyImage) url += `&replyImageUrl=${encodeURIComponent(replyImage)}`;
            if (ownText)    url += `&ownText=${encodeURIComponent(ownText)}`;

            message.reply({
                attachment: await global.utils.getStreamFromURL(url, 'gc.png')
            });
            message.reaction("✅", event.messageID);
        } catch (error) {
            message.send("❌ | " + error.message);
        }
    }
};
