(function($) {
    "use strict";

    var Portfolio = function (instance, options) {
        this.instance = instance;
        this.options = options;
        this._blockGotoOnce = false;
        this.$portfolio = $(this.instance);
        this._init();
    };

    Portfolio.prototype = {

        _init: function() {
            var that = this;
            this.$thumbsSlider = $(this.options.thumbsSlider);

            $.getJSON("portfoliodata.json",{_: new Date().getTime()}, function (data) {
                that._gallery = data.gallery;
                that._enrichGallery();
                that._addFigures();
                that._initPhotoSwipe();
            });
        },
        _initSliderPro: function() {
            this.$thumbsSlider.sliderPro({
                width: 500,
                height: 10,
                fade: false,
                arrows: false,
                buttons: false,
                keyboard: false,
                fullScreen: false,
                shuffle: false,
                smallSize: 500,
                mediumSize: 1000,
                largeSize: 3000,
                thumbnailArrows: true,
                autoplay: false
            });
        },
        _enrichGallery: function () {
            var that = this;
            $.each(this._gallery, function(index, value) {
                if (value.id == undefined) {
                    value.id = that._cleanUpString(value.title);
                }
                $.each(value.images, function(photoIndex, photo) {
                    if (photo.id == undefined) {
                        photo.id = that._cleanUpString(photo.title);
                    }
                    photo.index = photoIndex;
                });
            });
        },
        _cleanUpString: function(value) {
            return value
                .replace(/ä/g, 'ae')
                .replace(/Ä/g, 'Ae')
                .replace(/ö/g, 'oe')
                .replace(/Ö/g, 'Oe')
                .replace(/ü/g, 'ue')
                .replace(/Ü/g, 'Ue')
                .replace(/[\s]/g, '_')
                .replace(/[^a-z0-9_]/ig, '');
        },
        _addFigures: function() {
            //var figTpl = '<figure class="effect-portfolio wow fadeIn" data-wow-duration="{wowDuration}s" itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">';
            var figTpl = '<figure class="effect-portfolio wow" data-wow-duration="{wowDuration}s" itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject"';
            figTpl += ' galleryId="{galleryId}">';
            figTpl += '<img src="photos/400x400/{img}" alt="{title}" itemprop="thumbnail" />';
            figTpl += '<figcaption>';
            figTpl += '<h2>{title}</h2>';
            figTpl += '<p>{description}</p>';
            figTpl += '<a title="{linktitle}" href="photos/{img}" data-lightbox-gallery="gallery1"></a>';
            figTpl += '</figcaption>';
            figTpl += '</figure>';
            var that = this;
            var duration = 0;
            $.each(this._gallery, function(index, value) {
                if (duration >= 6) {
                    duration = 0;
                }
                duration++;
                var figure = figTpl;
                figure = that._replaceAll(figure, "{wowDuration}", duration);
                var image = value.images[0];
                figure = that._replaceAll(figure, "{galleryId}", value.id);
                figure = that._replaceAll(figure, "{title}", value.title);
                figure = that._replaceAll(figure, "{linktitle}", value.title);
                figure = that._replaceAll(figure, "{description}", value.description == undefined ? "" : value.description);
                figure = that._replaceAll(figure, "{img}", image.img);
                $(figure).appendTo(that.$portfolio);
            });
        },

        _replaceAll: function (target, search, replacement) {
            return target.replace(new RegExp(search, 'g'), replacement);
        },

        _initPhotoSwipe: function () {
            var that = this;
            var closest = function closest(el, fn) {
                return el && (fn(el) ? el : closest(el.parentNode, fn));
            };
            this.$portfolio.click(function (e) {
                e = e || window.event;
                e.preventDefault ? e.preventDefault() : e.returnValue = false;

                var eTarget = e.target || e.srcElement;

                var clickedListItem = closest(eTarget, function (el) {
                    return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
                });

                if (!clickedListItem) {
                    return;
                }
                that._openPhotoSwipeFromClick(clickedListItem);
            });
            this.$thumbsSlider.on('gotoSlide', function (event) {
                if (that._blockGotoOnce) {
                    that._blockGotoOnce = false;
                    return;
                }
                that.photoSwipe.goTo(event.index);
            });
            var data = that._parseUrl();
            if (data != null && data.gid != undefined && data.pid != undefined) {
                that._openPhotoSwipeFromDeepLink(data.gid, data.pid);
            }
        },

        _parseUrl: function () {
            var hash = window.location.hash.substring(1);
            var params = {};
            if (hash.length < 5) {
                var pathname = window.location.pathname;
                var res = pathname.match(/^\/portfolio\/([A-z_]+)\/([A-z]+)(.jpg)?$/i);
                if (res == null) return null;
                params.gid = res[1];
                params.pid = res[2];
                return params;
            }
            var vars = hash.split('&');

            for (var i = 0; i < vars.length; i++) {
                if (!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if (pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            return params;
        },

        _findGallery: function(galleryId) {
            for (var i = 0; i < this._gallery.length; i++) {
                if (this._gallery[i].id === galleryId) {
                    return this._gallery[i];
                }
            }
            return null;
        },

        _findPhoto: function(gallery, photoId) {
            for (var i = 0; i < gallery.images.length; i++) {
                if (gallery.images[i].id === photoId) {
                    return gallery.images[i];
                }
            }
            return null;
        },

        _openPhotoSwipeFromClick: function (clickedListItem) {
            var galleryId = clickedListItem.getAttribute("galleryId");
            var thumbsBoundsFn = function(index) {
                if (clickedListItem == null) return null;
                var thumbnail = $(clickedListItem);
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                var rect = thumbnail[0].getBoundingClientRect();
                var yOffset = (rect.height - (327 / 981 * rect.height)) / 2;
                return { x: rect.left, y: rect.top + pageYScroll + yOffset, w: rect.width };
            };
            this._openPhotoSwipe(galleryId, null, thumbsBoundsFn);
        },

        _openPhotoSwipeFromDeepLink: function (galleryId, photoId) {
            this._openPhotoSwipe(galleryId, photoId, null);
            //this.photoSwipe.options.openedFromDeepLink = true;
        },       

        _openPhotoSwipe: function (galleryId, photoId, thumbsBoundsFn) {
            var portfolio = this;
            var gallery = this._findGallery(galleryId);
            
            var slider = this.$thumbsSlider.data('sliderPro');
            if (slider !== null && slider !== undefined) {
                slider.destroy();
                this.$thumbsSlider.empty();
            }
            var photos = this._getPhotos(gallery);
            this._initSliderPro();
            slider = this.$thumbsSlider.data('sliderPro');

            setTimeout(function () {
                slider.resize();
            }, 200);

            var pswpElement = document.querySelectorAll('.pswp')[0];
            var options = {
                galleryUID: galleryId,
                galleryPIDs: true,
                bgOpacity: 0.9,
                historyUseHash: false
            };
            if (photoId == null) {
                this._updateDocumentTitle(gallery, 0);
            } else {
                var photo = this._findPhoto(gallery, photoId);
                options.index = photo.index;
                this._updateDocumentTitle(gallery, photo.index);
            }

            if (thumbsBoundsFn != null) {
                options.getThumbBoundsFn = thumbsBoundsFn;
            }
            this.photoSwipe = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, photos, options);
            this.photoSwipe.init();
            this.photoSwipe.listen('afterChange', function () {
                var that = this;
                var index = that.getCurrentIndex();
                portfolio._blockGotoOnce = true;
                slider.gotoSlide(index);
                portfolio._blockGotoOnce = false;
                portfolio._updateDocumentTitle(gallery, index);
            });
            this.photoSwipe.listen('close', function() {
                document.title = 'superpanorama.ch';
            });
        },

        _track: function (gallery, photo) {
            ga('send', 'pageview', "gallery/" + gallery.id + "/" + photo.img);
        },

        _updateDocumentTitle: function (gallery, photoIndex) {
            var photo = gallery.images[photoIndex];
            document.title = photo.title + ' | ' + gallery.title + ' | superpanorama.ch';
            this._track(gallery, photo);
        },

        _getPhotos: function (gallery) {
            var items = [];
            var pseudoSlides = $('<div class="sp-slides"></div>').appendTo(this.$thumbsSlider);
            var thumbs = $('<div class="sp-thumbnails"></div>').appendTo(this.$thumbsSlider);

            $.each(gallery.images, function (index, photo) {
                var options = {
                    src: 'photos/' + photo.img,
                    title: photo.title,
                    pid: photo.id
                };
                if (photo.w != undefined) {
                    options.w = photo.w;
                    options.h = photo.h;
                } else if (gallery.w != undefined) {
                    options.w = gallery.w;
                    options.h = gallery.h;
                } else {
                    options.w = 2100;
                    options.h = 700;
                }
                items.push(options);
                $('<div class="sp-slide"></div>').appendTo(pseudoSlides);
                $('<img class="sp-thumbnail" src="photos/400x400/' + photo.img + '" />').appendTo(thumbs);
            });
            return items;
        }
    };

    $.fn.Portfolio = function (options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if (typeof $(this).data('Portfolio') === 'undefined') {
                var newInstance = new Portfolio(this, options);
                $(this).data('Portfolio', newInstance);
            } else if (typeof options !== 'undefined') {
                var currentInstance = $(this).data('Portfolio');
                if (typeof currentInstance[options] === 'function') {
                    currentInstance[options].apply(currentInstance, args);
                }
            }
        });
    };
}(jQuery));

