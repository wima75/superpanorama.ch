(function ($) {
    jQuery.fn.mailto = function () {
        return this.each(function () {
            var email_addr = $(this).attr("href").replace(/\s*\(.+\)\s*/, "@");
            var email_text = $(this).html();
            $(this).before('<a href="mailto:' + email_addr + '" rel="nofollow" title="' + email_addr + '">' + email_text + '</a>').remove();
        });
    };

})(jQuery);

function main() {

    (function () {
        'use strict';

        // Highlight the top nav as scrolling occurs
        $('body').scrollspy({
            target: '.navbar-fixed-top',
            offset: 75
        });

        var initPortfolio = function () {
            $.when(
                $.get("portfolio.min.css"),

                $.getScript("js/portfolio.min.js"))
                            .then(function (css1, js1) {
                                $("head").append("<style>" + css1 + "</style>");

                                $('#portfolio').Portfolio({
                                    thumbsSlider: '#thumbsSlider'
                                });
                            });
        };

        var allLoaded = function () {

            $('#banner02').attr('src', "img/banners/02_bg.jpg");
            $('#banner03').attr('src', "img/banners/03_bg.jpg");
            $('#banner04').attr('src', "img/banners/04_bg.jpg");
            $('#banner05').attr('src', "img/banners/05_bg.jpg");

            $('.email').mailto();

            $('#frmGottIst').attr('src', "https://www.youtube.com/embed/Nf2q2Pt9xVs?rel=0");
            $('#frmSommerInSchweden').attr('src', "https://www.youtube.com/embed/Zg0ml8-ta4Y?rel=0");

            initPortfolio();

            $.ajax({
                url: "css/animate.min.css",
                success: function (data) {
                    $("head").append("<style>" + data + "</style>");
                    $.getScript("js/wow.min.js", function (data, textStatus, jqxhr) {
                        new WOW().init();
                    });
                }
            });
            $.getScript("https://www.google.com/recaptcha/api.js", function (data, textStatus, jqxhr) {
            });
        };

        $(window).load(function () {
            setTimeout(allLoaded, 400);
        });

        $('.carousel').carousel({
            interval: 10000
        });

    }());
}

main();