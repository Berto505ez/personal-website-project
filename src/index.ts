import {Application, Router} from 'express'
import {Request, Response} from 'express'

let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let Recaptcha = require('express-recaptcha').RecaptchaV2
let formData = require('form-data')
let Mailgun = require('mailgun.js')
let mailgun = new Mailgun(formData)

let {check, validationResult} = require('express-validator')
let validation = [
    check('name', 'A valid name is required.').not().isEmpty().trim().escape(),
    check('email', 'Please provide a valid email.').isEmail(),
    check('message', 'A message of 3000 characters or less is required.').trim().escape().isLength({min:1, max:3000})
]

let app: Application = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

let recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)

let mg = mailgun.client({username:'api', key: process.env.MAILGUN_API_KEY})

let handleGetRequest = (request: Request, response:Response) =>{
    return response.json('This is on!!')
}

let handlePostRequest = (request: Request, response: Response) => {
    response.append('Content-Type', 'text/html')

    //@ts-ignore
    // if (request.recaptcha.error){
    //     return response.send(
    //         `<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong>There was a Recaptcha error. Please try again.</div>`
    //     )
    // }

    let errors = validationResult(request)

    if(errors.isEmpty() === false){
        let currentError = errors.array()[0]
        return response.send(
            `<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong>${currentError.msg}</div>`
        )
    }

    let {name,email,message}= request.body

    let mailgunData = {
        to: process.env.MAIL_RECIPIENT,
        from: `${name} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
        subject: `${email}`,
        text: message
    }

    mg.messages.create(process.env.MAILGUN_DOMAIN, mailgunData)
        .then((msg: any)=>
        response.send(`<div class='alert alert-success' role='alert'>Email Successfully Sent</div>`)
        )
        .catch((error:any) =>
        response.send(`<div class='alert alert-success' role='alert'>Email Failed. Please try again.</div>`)
        )

}


let indexRoute = express.Router()

indexRoute.route('/')
    .get(handleGetRequest)
    .post(recaptcha.middleware.verify, validation, handlePostRequest)

app.use('/apis', indexRoute)

app.listen(4200, () => {
    console.log('Express Successfully Built.')
})