(function ($) {
  "use strict";
  $(function () {
    const loginFormObj = {
      $emailInput: $("#inputEmail"),
      $passwordInput: $("#inputPassword"),
      $submitBtn: $("#poly-login-btn"),
      $loginform: $(".needs-validation"),
      $invalidFields: $(".is-invalid"),
      BASE_URL: "https://axe.polygonbuilds.com/api",
      emailValue: null,
      passwordValue: null,
      init: function () {
        this.initPlugins();
        this.handleEvents();
      },
      initPlugins: function () {},
      handleEvents: function () {
        const context = this;

        context.$emailInput.on("keyup", function () {
          if (context.validateEmail($(this).val())) {
            $(this).removeClass("is-invalid");
            context.emailValue = $(this).val();
          } else {
            $(this).addClass("is-invalid");
            context.emailValue = null;
          }
        });
        context.$passwordInput.on("keyup", function () {
          if (context.validatePassword($(this).val())) {
            $(this).removeClass("is-invalid");
            context.passwordValue = $(this).val();
          } else {
            $(this).addClass("is-invalid");
            context.passwordValue = null;
          }
        });
        context.$submitBtn.on("click", function (event) {
          if (context.validateLoginForm()) {
            let params = {
              username: context.emailValue,
              password: context.passwordValue
            };
            $.ajax({
              type: "POST",
              url: context.BASE_URL + "/auth/signin",
              data: params,
              success: function (result) {
                toastMessage("success", "Welcome to PolygonBuilds...");
                setTimeout(function () {
                  saveTokens(result.accessToken, "", function () {
                    setTimeout(function () {
                      window.location.href = "my-account.html";
                    }, 500);
                  });
                }, 1000);
              },
              error: function () {
                Swal.fire({
                  title: "Error!",
                  text: "These credentials are not in our system",
                  icon: "error",
                });
              },
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Please input valid credentials",
              icon: "error",
            });
          }
        });
      },
      validateLoginForm() {
        const context = this;
        return context.$invalidFields.length > 0 ? false : true;
      },
      validateEmail(email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      },
      validatePassword(password) {
        return password.length >= 8 ? true : false;
      },
    };
    loginFormObj.init();
  });
})(jQuery);
