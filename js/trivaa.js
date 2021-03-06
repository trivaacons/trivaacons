"use strict";

$(function () {
  /**
   * Mobile Browser Address-bar Resize Jump Fix.
   *
   * Prevent items with a height depending on the viewport from jumping if the
   * mobile browser address bar appreas/disappears.
   * This fixes the address-bar viewport resize jump problem of many mobile
   * Browsers.
   *
   * Usage:
   *
   *   Put this data attribute: "data-jump-fix" on each html element that has
   *   height depending on the vp height.
   *
   *   load the script and call JumpFix.init()
   *
   */
  const JumpFix = {
    fixItems: $('*[data-jump-fix]'), // Get all items with the data attribute.
    isScrolling: false,
    timeoutScroll: null,

    // This sets 'isScrolling' to true for a certain amount of time.
    setScrollingStatus: function () {
      if (JumpFix.timeoutScroll) {
        clearTimeout(JumpFix.timeoutScroll);
      }
      JumpFix.isScrolling = true;
      JumpFix.timeoutScroll = setTimeout(function () {
        JumpFix.isScrolling = false;
      }, 100);
    },

    // Save actual heights
    saveHeights: function () {
      JumpFix.fixItems.each(function (i) {
        JumpFix.fixItems[i].savedHeight = $(this).height();
      })
    },

    // window and document actions here
    bindUIActions: function () {

      // Set isScrolling when the user scrolls or swipes.
      $(window).scroll(function () {
        if (JumpFix.isScrolling === false) {
          JumpFix.saveHeights();
        }
        JumpFix.setScrollingStatus();
      });

      $(window).on({
        'touchmove': function () {
          if (JumpFix.isScrolling === false) {
            JumpFix.saveHeights();
          }
          JumpFix.setScrollingStatus();
        }
      });

      // On resize: if user is scrolling use the saved height.
      // if user is NOT scrolling save the new nativ height after resize.
      $(window).resize(function () {
        if (JumpFix.isScrolling === true) {
          JumpFix.fixItems.each(function (i) {
            $(this).height(JumpFix.fixItems[i].savedHeight);
          })
        } else {
          JumpFix.fixItems.each(function () {
            $(this).css('height', '');
          });
        }
      });
    },

    init: function () {
      this.bindUIActions();
    }
  };

  /**
   * Configures smooth scroll of inner links within the specified container. Makes sure the location is not updated with the
   * hashtag of the anchor.
   * 
   * @param container
   *            JQuery object pointing to the container(s) in which to look for anchors
   */
  function configureScrollToTarget(container) {
    container.find('a[href*="#"]:not([href="#"])').off('click').click(function (e) {
      // This prevents the update of the location bar.
      e.preventDefault();

      // Find the target anchor.
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

      // Scroll to it.
      if (target.length) {
        var scrollTargetOffset = target.offset().top - $('.navbar').outerHeight();
        $('html, body').animate({
          scrollTop: scrollTargetOffset
        }, 400);
      }
    });
  }

  /**
   * Adds the logic to the reference filter form and to the carousel.
   */
  function configureReferences() {
    const form = $('form#referenceFilterForm');

    // Get the buttons.
    const yearFilterButton = form.find('button#btnYearFilter');
    const kindFilterButton = form.find('button#btnKindFilter');

    // Get the year and kind anchors.
    const yearAnchors = form.find('a[data-year]');
    const kindAnchors = form.find('a[data-kind]');

    // Get all possible years and kinds.
    const allYears = $.map(yearAnchors.filter(':not([data-year=""])'), (anchor) => $(anchor).data('year'));
    const allKinds = $.map(kindAnchors.filter(':not([data-kind=""])'), (anchor) => $(anchor).data('kind'));

    // Get the cards representing references. Each must have a 'year' and a 'kind' attribute.
    const referenceCards = $('#referencesSource .trivaa-references');

    // State variables storing the current selection.
    let currentYear = '';
    let currentKind = '';

    /**
     * Updates the specified dropdown button with the text of one of its anchor representing a selection.
     * 
     * @param {jQuery} button the button to update
     * @param {jQuery} anchor the anchor belonging to the button.
     */
    function updateButton(button, anchor) {
      button.find('span').text(anchor.text());
    }

    /**
     * Returns the JQuery object representing the result of the specified filter. If an argument is undefined then
     * it is not used in the filtering.
     * 
     * @param {jQuery} elements the elements to filter
     * @param {string} year the year to filter for
     * @param {string} kind the project kind to filter for
     */
    function filterElementsFor(elements, year, kind) {
      if (year !== undefined && kind !== undefined) return elements.filter(`[data-year="${year}"][data-kind="${kind}"]`);
      else if (year !== undefined) return elements.filter(`[data-year="${year}"]`);
      else if (kind !== undefined) return elements.filter(`[data-kind="${kind}"]`);
      else return elements;
    }

    /**
     * Shows the specified cards.
     * 
     * @param {jQuery} cards the cards to show
     */
    const showCards = (function () {
      // Logic that shows the latest selected cards again when resizing the screen.
      let width = $(window).width();
      let latestCards;
      $(window).on('resize', function () {
        if ($(this).width() != width) {
          width = $(this).width();
          if (latestCards) showCards(latestCards);
        }
      });

      return function (cards) {
        // Update the latest cards for the event handler.
        latestCards = cards;

        // Find the carousel.
        const carousel = $('#referencesCarousel');

        // Get its width using its parent. This works even if the carousel is empty.
        const carouselWidth = carousel.parent().width();

        // Find a card and get its width.
        const cardWidth = $('#referencesSource .trivaa-references').first().width();

        // Take the 90% of the carousel width and see how many cards fit in there.
        const numCards = Math.floor((carouselWidth * 0.90) / cardWidth);

        // Empty the carousel.
        const carouselInner = carousel.find('.carousel-inner');
        const carouselIndicators = carousel.find('.carousel-indicators');
        carouselInner.empty();
        carouselIndicators.empty();

        // Add the cards one by one.
        let latestItem;
        cards.each((idx, card) => {
          // Create the item div, if it's necessary.
          if (!latestItem) {
            // Create a wrapper which is the real item.
            const wrapperItemDiv = $('<div>').addClass('carousel-item');
            if (!idx) wrapperItemDiv.addClass('active');

            // Create the item that is a flexbox.
            latestItem = $('<div>').addClass('d-flex w-100 justify-content-around');
            wrapperItemDiv.append(latestItem);

            // Add the wrapper to the carousel.
            carouselInner.append(wrapperItemDiv);

            // Create the indicator.
            const indicator = $('<li>');
            if (!idx) indicator.addClass('active');
            indicator.data('data-target', '#referencesCarousel');
            indicator.data('data-slide-to', Math.floor(idx / numCards));

            // Add it to the indicator div.
            carouselIndicators.append(indicator);
          }

          // Append it the clone of the card.
          const clonedCard = $(card).clone();
          latestItem.append(clonedCard);

          // Add the click handler to the clone.
          clonedCard.click(() => {
            // Get the gallery parameters.
            const imageCount = parseInt(clonedCard.data('image-count'));
            const imageRoot = clonedCard.data('image-root');
            const description = clonedCard.data('description');

            // Build the objects describing each image, as blueimp expects it.
            const links = [];
            for (let i = 0; i < imageCount; i++) links.push({
              title: description,
              href: `${imageRoot}/${i + 1}.jpg`
            });

            // Show the gallery.
            blueimp.Gallery(links, {
              container: '#blueimp-gallery',
              carousel: false
            });
          });

          // See if this item is complete.
          if (idx % numCards == numCards - 1) latestItem = undefined;
        });
      };
    })();

    /**
     * Applies the year filter using 'currentYear'.
     */
    function applyYearFilter() {
      // Filter all the cards for the current year. The result set must be non-empty as the dropdown
      // is filled with dimensions directly derived from the data.
      let filteredCards = currentYear ? filterElementsFor(referenceCards, currentYear) : referenceCards;

      // If a concrete year selection is made then the kinds must be narrowed down to what is available.
      if (currentYear) {
        const availableKinds = $.map(filteredCards, (card) => $(card).data('kind'));
        kindAnchors.each((idx, anchor) => {
          anchor = $(anchor);
          let kind = anchor.data('kind');
          if (!kind || availableKinds.indexOf(kind) >= 0) anchor.show();
          else anchor.hide();
        })
      } else kindAnchors.show();

      // Narrow down using the kind filter too. Note that this is guaranteed to be in sync with which
      // kind selection is shown by the above code as the concrete kind selection has narrowed down
      // the year filter already.
      if (currentKind) filteredCards = filterElementsFor(filteredCards, undefined, currentKind);

      // Show matched cards.
      showCards(filteredCards);
    }

    /**
     * Applies the kind filter using 'currentKind'.
     */
    function applyKindFilter() {
      // Filter all the cards for the current kind. The result set must be non-empty as the dropdown
      // is filled with dimensions directly derived from the data.
      let filteredCards = currentKind ? filterElementsFor(referenceCards, undefined, currentKind) : referenceCards;

      // If a concrete year selection is made then the kinds must be narrowed down to what is available.
      if (currentKind) {
        const availableYears = $.map(filteredCards, (card) => $(card).data('year'));
        yearAnchors.each((idx, anchor) => {
          anchor = $(anchor);
          let year = anchor.data('year');
          if (!year || availableYears.indexOf(year) >= 0) anchor.show();
          else anchor.hide();
        })
      } else yearAnchors.show();

      // Narrow down using the year filter too. Note that this is guaranteed to be in sync with which
      // year selection is shown by the above code as the concrete year selection has narrowed down
      // the kind filter already.
      if (currentYear) filteredCards = filterElementsFor(filteredCards, currentYear);

      // Show matched cards.
      showCards(filteredCards);
    }

    // Add the logic to change the year.
    yearAnchors.click(function (e) {
      // Don't jump to href '#'.
      e.preventDefault();

      // Change the anchor text.
      const anchor = $(this);
      updateButton(yearFilterButton, anchor);

      // Apply the filter.
      currentYear = anchor.data('year');
      applyYearFilter();
    });

    // Add the logic to change the kind.
    kindAnchors.click(function (e) {
      // Don't jump to href '#'.
      e.preventDefault();

      // Change the anchor text.
      const anchor = $(this);
      updateButton(kindFilterButton, anchor);

      // Apply the filter.
      currentKind = anchor.data('kind');
      applyKindFilter();
    });

    // Add the logic of the 'Show All' button.
    $('button.trivaa-ref-showall').click(() => {
      // Show all anchors.
      yearAnchors.show();
      kindAnchors.show();

      // Reset the state variables.
      currentYear = '';
      currentKind = '';

      // Reset the selections in the buttons.
      updateButton(yearFilterButton, filterElementsFor(yearAnchors, ''));
      updateButton(kindFilterButton, filterElementsFor(kindAnchors, undefined, ''));

      // Show all cards.
      showCards(referenceCards);
    });

    // Show all cards by default.
    showCards(referenceCards);

    // Make the carousel respond nicely to swipe events.
    const carousel = $('#referencesCarousel');
    const hammerTime = new Hammer(carousel.find('.carousel-inner', {
      recognizers: [
        [Hammer.Swipe, {
          direction: Hammer.DIRECTION_HORIZONTAL
        }]
      ]
    }).get(0));
    hammerTime.on('swipe', function (e) {
      carousel.carousel(e.direction == Hammer.DIRECTION_LEFT ? 'next' : 'prev');
    });
  }

  /**
   * Configures the navbar so that it closes on the mobile automatically when an item is selected.
   */
  function configureMobileNavbar() {
    const navbarToggler = $('button.navbar-toggler');
    $('nav.navbar a.nav-link').click(() => {
      if (navbarToggler.is(':visible')) navbarToggler.click();
    });
  }

  /**
   * Page initialization.
   */

  // Initialize the mobile browser 'address bar jump' fix.
  JumpFix.init();

  // Configure smooth scrolling.
  configureScrollToTarget($('html, body'));

  // Show the page.
  $('.no-fouc').removeClass('no-fouc');

  // Configure the references part of the page.
  configureReferences();

  // Configure the navbar for mobile-specific behaviour.
  configureMobileNavbar();
});