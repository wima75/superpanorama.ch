$(function () {
    $('#captcha').hide();

    $('input,textarea').change(function () {
        $('#captcha').css({'opacity': 0}).slideDown(700, function() {
            $('#captcha').fadeTo(1000, 1, 'swing');
        });
    });

    $("input,textarea").jqBootstrapValidation(
       {
           preventSubmit: true,
           submitError: function ($form, event, errors) {
               // something to have when submit produces an error ?
               // Not decided if I need it yet
           },
           submitSuccess: function ($form, event) {
               event.preventDefault(); // prevent default submit behaviour
               // get values from FORM
               var captchaResponse = grecaptcha.getResponse();
               if (captchaResponse.length === 0) {
                   var cap = $('.g-recaptcha');
                   var helpBlock = cap.parent().find(".help-block").first();
                   helpBlock.html(cap.attr('data-validation-required-message'));
                   return;
               }
               var name = $("input#name").val();
               var email = $("input#email").val();
               var message = $("textarea#message").val();
               $.ajax({
                   url: "https://superpanorama-sendmail.azurewebsites.net/api/SendMail",
                   type: "POST",
                   data: { name: name, email: email, message: message, captcha: captchaResponse },
                   cache: false,
                   success: function() {
                       // Success message
                       $('#success').html("<div class='alert alert-success'>");
                       $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                           .append("</button>");
                       $('#success > .alert-success')
                           .append("<strong>Ihre Nachricht wurde gesendet. </strong>");
                       $('#success > .alert-success')
                           .append('</div>');
                       grecaptcha.reset();
                   },
                   error: function() {
                       // Fail message
                       $('#success').html("<div class='alert alert-danger'>");
                       $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                           .append("</button>");
                       $('#success > .alert-danger').append("<strong>Uups - da ist etwas schief gelaufen...</strong> Bitte kontaktieren Sie mich direkt unter <a href='mailto:info@superpanorama.ch'>info@superpanorama.ch</a>.");
                       $('#success > .alert-danger').append('</div>');
                       grecaptcha.reset();
                   }
               });
           },
           filter: function () {
               return $(this).is(":visible");
           },
       });

    $("a[data-toggle=\"tab\"]").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function () {
    $('#success').html('');
});
