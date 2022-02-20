$(document).ready(function (){
    $('#contactForm').validate({
        debug: true,
        errorClass: 'alert alert-danger',
        ErrorLabelContainer: '#output-area',
        errorElement: 'div',

        rules: {
            name:{
                required: true
            },
            email:{
                email:true,
                required: true
            },
            message:{
                required:true,
                maxlength:3000
            },
            messages:{
                name:{
                    required:'Name is required.'
                },
                email:{
                    email:'Please provide a valid email.',
                    required:'Email is required.'
                },
                message:{
                    required: 'A message is required.',
                    maxlength: 'Message is too long.'
                }
            }
        },
        submitHandler:(form)=> {
            console.log('is this thing on?')
            $('#contactForm').ajaxSubmit({
                type:'POST',
                url:$('#contactForm').attr('action'),
                success: (ajaxOutput)=> {
                    $('#output-area').css('display','')
                    $('#output-area').html(ajaxOutput)

                    if ($('.alert-success' >= 1)){
                        $('#contactForm')[0].reset()
                    }
                }
            })
        }
    })
})