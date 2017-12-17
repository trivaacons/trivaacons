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
var JumpFix = {
  fixItems: $('*[data-jump-fix]'),  // Get all items with the data attribute.
  isScrolling: false,
  timeoutScroll: null,

  // This sets 'isScrolling' to true for a certain amount of time.
  setScrollingStatus: function() {
    if (JumpFix.timeoutScroll) {
      clearTimeout(JumpFix.timeoutScroll);
    }
    JumpFix.isScrolling = true;
    JumpFix.timeoutScroll = setTimeout(function() {
      JumpFix.isScrolling = false;
    }, 100);
  },

  // Save actual heights
  saveHeights: function() {
    JumpFix.fixItems.each(function(i) {
      JumpFix.fixItems[i].savedHeight = $(this).height();
    })
  },

  // window and document actions here
  bindUIActions: function() {

    // Set isScrolling when the user scrolls or swipes.
    $(window).scroll(function() {
      if (JumpFix.isScrolling === false) {
        JumpFix.saveHeights();
      }
      JumpFix.setScrollingStatus();
    });

    $(window).on({
      'touchmove': function() {
        if (JumpFix.isScrolling === false) {
          JumpFix.saveHeights();
        }
        JumpFix.setScrollingStatus();
      }
    });

    // On resize: if user is scrolling use the saved height.
    // if user is NOT scrolling save the new nativ height after resize.
    $(window).resize(function() {
      if (JumpFix.isScrolling === true) {
        JumpFix.fixItems.each(function(i) {
          $(this).height(JumpFix.fixItems[i].savedHeight);
        })
      } else {
        JumpFix.fixItems.each(function() {
          $(this).css('height', '');
        });
      }
    });
  },

  init: function() {
    this.bindUIActions();
  }

};

$(function() {
  // Initialize the mobile browser 'address bar jump' fix.
  JumpFix.init();
});