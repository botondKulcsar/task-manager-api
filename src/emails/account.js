const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bkulcsar@gmail.com',
        subject: `Thanks for joining in, ${name}!`,
        text: `Welcome to the app, ${name}! Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bkulcsar@gmail.com',
        subject: `Sorry to see you go, ${name}`,
        text: `Dear ${name}! 
        We'd like to take the opportunity to thank you for spending your time with us.
        Please let us know if there is anything we could have done to keep you on board.
        Yours faithfully,
        Botond Kulcsar
        CEO of Task Manager App`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}