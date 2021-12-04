(function ($) {
    "use strict";
    $(function () {
      const commonObj = {
        $yearText: $("#year"),
        BASE_URL: "https://axe.polygonbuilds.com/api",
        init: function () {
          this.initPlugins();
          this.handleEvents();
        },
        initPlugins: function () {},
        handleEvents: function () {
          const context = this;
          context.setCurrentYear();
        },
        setCurrentYear() {
            const context = this;
            context.$yearText.html(new Date().getFullYear());
        }
      };
      commonObj.init();
    });
  })(jQuery);