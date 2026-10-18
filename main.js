$(document).ready(function ($) {
  "use strict";

  /* ===== MOBILE MENU TOGGLE ===== */
  jQuery(".menu-toggle").click(function () {
    jQuery(".main-navigation").toggleClass("toggled");
  });

  jQuery(".header-menu ul li a").click(function () {
    jQuery(".main-navigation").removeClass("toggled");
  });

  /* ===== STICKY HEADER ===== */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    var elementFirst = document.querySelector(".site-header");
    if (elementFirst) {
      ScrollTrigger.create({
        trigger: "body",
        start: "30px top",
        end: "bottom bottom",
        onEnter: () => elementFirst.classList.add("sticky_head"),
        onLeaveBack: () => elementFirst.classList.remove("sticky_head"),
      });
    }
  }

  /* ===== MENU FILTER (MixItUp) ===== */
  if ($("#menu-dish").length && $.fn.mixItUp) {
    $("#menu-dish").mixItUp({
      selectors: {
        target: ".dish-box-wp",
        filter: ".filter",
      },
      animation: {
        effects: "fade",
        easing: "ease-in-out",
        duration: 500,
      },
      load: {
        filter: ".all",
      },
    });
  }

  /* ===== FILTER INDICATOR ===== */
  if (typeof gsap !== "undefined") {
    var targets = document.querySelectorAll(".filter");
    var activeTab = 0;
    var old = 0;
    var animation;

    if (targets.length && document.querySelector(".filter-active")) {
      for (let i = 0; i < targets.length; i++) {
        targets[i].index = i;
        targets[i].addEventListener("click", moveBar);
      }

      gsap.set(".filter-active", {
        x: targets[0].offsetLeft,
        width: targets[0].offsetWidth,
      });

      function moveBar() {
        if (this.index !== activeTab) {
          if (animation && animation.isActive()) {
            animation.progress(1);
          }
          animation = gsap.timeline({
            defaults: { duration: 0.4 },
          });
          old = activeTab;
          activeTab = this.index;
          animation.to(".filter-active", {
            x: targets[activeTab].offsetLeft,
            width: targets[activeTab].offsetWidth,
          });
          animation.to(targets[old], { color: "#0d0d25", ease: "none" }, 0);
          animation.to(targets[activeTab], { color: "#fff", ease: "none" }, 0);
        }
      }
    }
  }

  /* ===== PARALLAX ===== */
  if (typeof Parallax !== "undefined") {
    var scene = document.querySelector(".js-parallax-scene");
    if (scene) new Parallax(scene);
  }

  /* ===== SWIPER ===== */
  if (typeof Swiper !== "undefined") {
    if (document.querySelector(".book-table-img-slider")) {
      new Swiper(".book-table-img-slider", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false },
        speed: 1000,
        effect: "coverflow",
        coverflowEffect: {
          rotate: 3,
          stretch: 2,
          depth: 100,
          modifier: 5,
          slideShadows: false,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: { el: ".swiper-pagination", clickable: true },
      });
    }

    if (document.querySelector(".team-slider")) {
      new Swiper(".team-slider", {
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false },
        speed: 2000,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: { el: ".swiper-pagination", clickable: true },
        breakpoints: {
          0: { slidesPerView: 1.2 },
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
          1200: { slidesPerView: 3 },
        },
      });
    }
  }

  /* ===== CLEAN BODY ===== */
  jQuery(window).on("load", function () {
    $("body").removeClass("body-fixed");
  });
});
