(function ($) {
  "use strict";
  $(function () {
    const registerFormObj = {
      $emailInput: $("#inputEmail"),
      $passwordInput: $("#inputPassword"),
      $submitBtn: $("#poly-reg-btn"),
      $registerform: $("#form-register"),
      $invalidFields: $(".is-invalid"),
      $btnLoadingSpinner: $(".btn-loading-spinner"),
      BASE_URL: "https://axe.polygonbuilds.com/api",
      emailValue: null,
      passwordValue: null,
      Toast: null,
      invalidFieldsLen: 2,
      init: function () {
        this.initPlugins();
        this.handleEvents();
      },
      initPlugins: function () {
        const context = this;
        context.Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          customClass: {
            popup: "colored-toast",
          },
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          iconColor: "#ffff",
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
      },
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
          event.preventDefault();

          if (!context.validateLoginForm()) {
            event.preventDefault();
            event.stopPropagation();

            context.Toast.fire({
              icon: "error",
              title: "Please input valid credentials",
            });
          } else {
            context.setLoading(true);

            let userParams = {
              username: context.emailValue,
              email: context.emailValue,
              password: context.passwordValue,
            };

            let customerParams = {
              name: context.emailValue,
            };

            let params = {
              user: userParams,
              customer: customerParams,
            };
            $.ajax({
              type: "POST",
              url: context.BASE_URL + "/auth/signup",
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
                context.setLoading(false);
              },
              error: function (result) {
                context.Toast.fire({
                  icon: "error",
                  title: result.responseJSON.message,
                });
                context.setLoading(false);
              },
            });
            
          }
        });
      },
      validateLoginForm() {
        const context = this;
        return context.$invalidFields.length > 0 ||
          !context.emailValue ||
          !context.passwordValue
          ? false
          : true;
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
      setLoading(state) {
        const context = this;
        if (state) {
          context.$btnLoadingSpinner.show();
        } else {
          context.$btnLoadingSpinner.hide();
        }
      },
    };
    registerFormObj.init();
  });
})(jQuery);
