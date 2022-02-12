(function ($) {
  "use strict";
  $(function () {
    const loginFormObj = {
      $emailInput: $("#inputEmail"),
      $passwordInput: $("#inputPassword"),
      $submitBtn: $("#poly-login-btn"),
      $loginform: $("#form-login"),
      $invalidFields: $(".is-invalid"),
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
          position: 'top-end',
          customClass: {
            popup: 'colored-toast'
          },
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          iconColor: '#ffff',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
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
          if (!context.validateLoginForm() ) {
            event.preventDefault();
            event.stopPropagation();

            context.Toast.fire({
              icon: 'error',
              title: 'Please input valid credentials'
            });
          }
          else {
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
                context.Toast.fire({
                  icon: 'error',
                  title: 'These credentials are not in our system'
                });
              },
            });
          }
        });
      },
      validateLoginForm() {
        const context = this;
        return context.$invalidFields.length > 0 || !context.emailValue || !context.passwordValue ? false : true;
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
