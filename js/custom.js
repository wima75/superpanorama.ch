(function ($) {
    jQuery.fn.mailto = function () {
        return this.each(function () {
            var email_addr = $(this).attr("href").replace(/\s*\(.+\)\s*/, "@");
            var email_text = $(this).html();
            $(this).before('<a href="mailto:' + email_addr + '" rel="nofollow" title="' + email_addr + '">' + email_text + '</a>').remove();
        });
    };

})(jQuery);

function allLoaded() {
    $('#intro .intro-content')
        .css({ 'opacity': 0 })
        .slideDown(3000, 'easeInOutCubic')
        .animate(
            { opacity: 1 },
            { queue: false, duration: 3000 }
        );

    $('.email').mailto();
   
    
    $('#multivision').css("background-image", "url('img/03_about.jpg')");

    $('#frmGottIst').attr('src', "https://www.youtube.com/embed/Nf2q2Pt9xVs?rel=0");
    $('#frmSommerInSchweden').attr('src', "https://www.youtube.com/embed/Zg0ml8-ta4Y?rel=0");
    
    $.getScript("lib/sliderpro/js/jquery.sliderPro.js")
        .done(function (script, textStatus) {
      $.getScript("js/portfolio.js")
                .done(function (script, textStatus) {
            $('#portfolio').Portfolio({
                thumbsSlider: '#thumbsSlider'
            });
        });
    });
    $.getScript("https://www.google.com/recaptcha/api.js", function (data, textStatus, jqxhr) {
    });
}

$(window).load(function () {
    setTimeout(allLoaded, 400);
});
