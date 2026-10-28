/**
* Template Name: Dewi
* Template URL: https://bootstrapmade.com/dewi-free-multi-purpose-html-template/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll Top Button
   */
  let scrollTop = document.querySelector('.scroll-top');
  let floatingBtns = document.querySelector('.floating-btns');

  function toggleScrollTop() {
    if (scrollTop) {
      if (window.scrollY > 100) {
        scrollTop.classList.add('show');
        if (floatingBtns) floatingBtns.classList.add('scrolled');
      } else {
        scrollTop.classList.remove('show');
        if (floatingBtns) floatingBtns.classList.remove('scrolled');
      }
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox (only if the library is loaded on this page)
   */
  if (typeof GLightbox !== 'undefined') {
    let lightbox = GLightbox({
      selector: '.glightbox',
      autoplayVideos: true,
      videosWidth: '960px',
      preload: true
    });

    // While a fullscreen preview (image or video) is open, freeze every Swiper
    // autoplay on the page so the slider never swipes to the next slide while
    // the visitor is watching. Autoplay resumes when the preview is closed.
    let autoplaySwipers = [];
    lightbox.on('open', function() {
      autoplaySwipers = [];
      document.querySelectorAll('.init-swiper').forEach(function(el) {
        let swiper = el.swiper;
        if (swiper && swiper.autoplay && swiper.autoplay.running) {
          swiper.autoplay.stop();
          autoplaySwipers.push(swiper);
        }
      });
      // Force autoplay on mobile for videos in lightbox
      setTimeout(function() {
        document.querySelectorAll('.glightbox-container video').forEach(function(video) {
          try {
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('preload', 'auto');
            // Try to autoplay (muted helps on mobile)
            if (video.muted === false) {
              video.muted = true;
            }
            var playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(function() {
                // Autoplay blocked, user will need to tap play
              });
            }
          } catch (e) {}
        });
      }, 50);
    });
    lightbox.on('close', function() {
      autoplaySwipers.forEach(function(swiper) {
        if (swiper && swiper.autoplay) {
          swiper.autoplay.start();
        }
      });
      autoplaySwipers = [];
    });

    // Show a loading spinner inside the fullscreen preview until the image or
    // video is actually ready to be seen.
    function watchPreviewMedia(slide) {
      if (!slide) return;

      let mediaBox = slide.querySelector('.gslide-media');
      if (!mediaBox) return;

      let media = mediaBox.querySelector('video, img');
      if (!media) return;

      // Remove existing loader binding to re-attach for new slide
      if (mediaBox.dataset.loaderBound === 'true') {
        mediaBox.classList.remove('media-loading');
        mediaBox.dataset.loaderBound = 'false';
      }
      mediaBox.dataset.loaderBound = 'true';

      let show = function() {
        mediaBox.classList.add('media-loading');
      };
      let hide = function() {
        mediaBox.classList.remove('media-loading');
      };

      if (media.tagName === 'IMG') {
        if (media.complete && media.naturalWidth > 0) {
          hide();
          return;
        }
        show();
        media.addEventListener('load', hide, { once: true });
        media.addEventListener('error', hide, { once: true });
        return;
      }

      if (media.tagName === 'VIDEO') {
        try {
          media.setAttribute('playsinline', '');
          media.setAttribute('webkit-playsinline', '');
          media.setAttribute('preload', 'auto');
          if (media.muted === false) {
            media.muted = true;
          }
        } catch (e) {}
        if (media.readyState < 3) {
          show();
        } else {
          hide();
        }
        ['loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough', 'playing'].forEach(function(eventName) {
          media.addEventListener(eventName, hide, { once: eventName !== 'waiting' && eventName !== 'stalled' ? false : false });
        });
        ['waiting', 'stalled'].forEach(function(eventName) {
          media.addEventListener(eventName, show);
        });
        ['playing'].forEach(function(eventName) {
          media.addEventListener(eventName, function() {
            mediaBox.classList.remove('media-loading');
          }, { once: true });
        });
        // Try to autoplay
        setTimeout(function() {
          var p = media.play();
          if (p !== undefined) {
            p.catch(function() {});
          }
        }, 30);
      }
    }

    lightbox.on('slide_after_load', function(data) {
      watchPreviewMedia(data.slide || data.slideNode);
    });
    lightbox.on('slide_changed', function(data) {
      if (data && data.current) {
        watchPreviewMedia(data.current.slide);
      }
    });
    lightbox.on('open', function() {
      setTimeout(function() {
        var current = document.querySelector('.glightbox-container .gslide.current');
        if (current) {
          watchPreviewMedia(current);
        }
      }, 60);
    });
  }

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      let swiperInstance;
      if (swiperElement.classList.contains("swiper-tab")) {
        swiperInstance = initSwiperWithCustomPagination(swiperElement, config);
      } else {
        swiperInstance = new Swiper(swiperElement, config);
      }

      // Video safety net: pause any playing video when the active slide
      // changes so a video never keeps playing in the background, and never
      // let autoplay swipe to the next slide while a video is playing.
      if (swiperElement.querySelector('video')) {
        let pauseVideos = function() {
          swiperElement.querySelectorAll('video').forEach(function(video) {
            if (!video.paused) {
              video.pause();
            }
          });
        };
        swiperElement.querySelectorAll('video').forEach(function(video) {
          video.addEventListener('play', function() {
            if (swiperInstance && swiperInstance.autoplay && swiperInstance.autoplay.running) {
              swiperInstance.autoplay.stop();
            }
          });
          let resumeAutoplay = function() {
            if (swiperInstance && swiperInstance.autoplay &&
                !document.body.classList.contains('glightbox-open')) {
              swiperInstance.autoplay.start();
            }
          };
          video.addEventListener('pause', resumeAutoplay);
          video.addEventListener('ended', resumeAutoplay);
        });
        if (swiperInstance) {
          swiperInstance.on('slideChangeTransitionStart', pauseVideos);
          swiperInstance.on('slideChange', pauseVideos);
        }
      }
    });
  }


  window.addEventListener("load", initSwiper);

  /**
   * Init isotope layout and filters
   */
  if (typeof Isotope !== 'undefined' && typeof imagesLoaded !== 'undefined') {
    document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
      let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
      let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
      let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

      let initIsotope;
      imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
        initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
          itemSelector: '.isotope-item',
          layoutMode: layout,
          filter: filter,
          sortBy: sort
        });
      });

      isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
        filters.addEventListener('click', function() {
          isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
          this.classList.add('filter-active');
          if (initIsotope) {
            initIsotope.arrange({
              filter: this.getAttribute('data-filter')
            });
          }
          if (typeof aosInit === 'function') {
            aosInit();
          }
        }, false);
      });

    });
  }

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      let target = navmenulink.hash || navmenulink.getAttribute('data-scrollspy');
      if (!target) return;
      let section = document.querySelector(target);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();

/**
 * Hero typed items
 */
(function() {
  const el = document.querySelector('.hero-typed-text');
  if (!el) return;

  const items = JSON.parse(el.getAttribute('data-items'));
  let itemIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const word = items[itemIndex];
    el.textContent = word.substring(0, charIndex);
    let delay = deleting ? 40 : 90;

    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = 1400;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      itemIndex = (itemIndex + 1) % items.length;
      delay = 300;
    } else {
      charIndex += deleting ? -1 : 1;
    }
    setTimeout(tick, delay);
  }
  tick();
})();

/**
 * Media loading indicators
 */
(function() {
  const images = document.querySelectorAll('.gallery-item img, .service-slide-link img, .service-item .img img');

  images.forEach(function(img) {
    const host = img.closest('.gallery-item, .service-slide-link, .service-item .img');
    if (!host) return;

    host.classList.add('media-loading');

    const loaded = function() {
      host.classList.remove('media-loading');
    };

    if (img.complete && img.naturalWidth > 0) {
      loaded();
    } else {
      img.addEventListener('load', loaded, { once: true });
      img.addEventListener('error', loaded, { once: true });
    }
  });
})();