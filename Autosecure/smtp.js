const { SMTPServer } = require("smtp-server");
const { simpleParser } = require("mailparser");
const { queryParams } = require("./db/db");
const emserver = new SMTPServer({
    onData,
    authOptional: true,
    allowInsecureAuth: true,
});
emserver.listen(25, "0.0.0.0", () => {
    console.log(`SMTP listening on 25`);
});
emserver.on("error", (err) => {
    console.log(`Error: ${err.message}`);
});
function onData(stream, session, callback) {
    stream.on("end", callback);
    return handleMessageStream(stream);
}
async function handleMessageStream(stream) {
    return new Promise(async (resolve) => {
        simpleParser(stream, {}, async (parseErr, parsed) => {
            if (parseErr) {
                return console.log("Failed to parse");
            } else {
                let email = parsed?.to?.value[0]?.address;
                let from = parsed?.from?.value[0]?.address;
                let subject = parsed?.subject;
                let description = parsed?.text;
                console.log(`New Email ${from} --> ${email}`)
                try {
                    await queryParams(
                        `INSERT INTO emails(receiver,sender,subject,description,time) VALUES(?,?,?,?,?)`,
                        [email, from, subject, description, Date.now()]
                    );
                } catch (e) {
                    console.log(`Failed to put email into the database, ${e}`);
                }
            }
        });
    });
}
module.exports=emserver