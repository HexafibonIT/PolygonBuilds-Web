(function ($) {
  "use strict";
  $(function () {
    const printingObj = {
      BASE_URL: "https://axe.polygonbuilds.com/api",
      $fileInput: $("#file"),
      $addToCartBtn: $("#add-to-cart-btn"),
      tot_files_uploaded: 0,
      max_file_uploads: 6,
      model_files: [],
      promises: [],
      models: [],
      Toast: null,
      init: function () {
        this.initPlugins();
        this.handleEvents();
      },
      initPlugins: function () {
        const context = this;
        Lily.ready({
          target: "target", // target div id
          file: "file", // file input id
          path: "src", // path to source directory from current html file
        });
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
        context.$fileInput.on("change", function () {
          context.fileValidation();
        });
        context.$addToCartBtn.on("click", function() {
            context.placeOrder();
        });
      },
      fileValidation() {
        const context = this;
        var fileInput = document.getElementById("file");

        var filePath = fileInput.value;
        console.log(filePath);
        // Allowing file type
        var allowedExtensions = /(\.stl|\.STL|\.zip)$/i;

        if (!allowedExtensions.exec(filePath)) {
          context.Toast.fire({
            icon: "error",
            title: "Invalid file type. Please upload .stl files only.",
          });

          document.getElementById("file").value = "";

          return false;
        } else {
          context.tot_files_uploaded += fileInput.files.length;
          loadingModels();
          if (filePath.split(".").pop() === "zip") {
            $("#placeholder_img_con")
              .children("img")
              .attr(
                "src",
                "https://www.freeiconspng.com/uploads/no-image-icon-4.png"
              );
            $("#placeholder_img_con")
              .children("p")
              .html("Zip file detected! No preview available.")
              .css({
                color: "red",
                "font-size": "25px",
                "font-weight": "bold",
              });
            disableAddNewBtn();
          } else {
            $("#placeholder_img_con").hide();
          }

          for (let i = 0; i < fileInput.files.length; i++) {
            context.model_files.push(fileInput.files[i]);
          }

          // Image preview
          if (fileInput.files && fileInput.files[0]) {
            var reader = new FileReader();

            reader.readAsDataURL(fileInput.files[0]);
            setTimeout(function () {
              this.showButtons(context.tot_files_uploaded);
            }, 1000);

            console.log(context.tot_files_uploaded);
          }
        }
      },
      placeOrder() {
        const context = this;
        Swal.fire({
          title: "Are you sure!",
          text: "Do you want to submit the request?",
          preConfirm: false,
          allowOutsideClick: false,
          showLoaderOnConfirm: true,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes!",
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            Swal.fire({
              title: "Please Wait !",
              text: "Data processing...",
              allowOutsideClick: false,
              icon: "info",
            });
            Swal.showLoading();
      
            context.uploadFiles();
            Promise.all(context.promises).then((tasks) => {
              setTimeout(function () {
                context.submitOrderDetails();
              }, 2000);
            });
            
          }
        });
      },
      async uploadFiles() {
        const context = this;
        await $.each(context.model_files, function (i, file) {
            context.fileUpload(file);
        });
      },
      fileUpload(file) {
        const context = this;
        // File or Blob named mountains.jpg
        var file = file;
        var urlh = "";
        // Create the file metadata
        var metadata = {
          contentType: "file/stl",
        };
      
        const ref = firebase
          .storage()
          .ref()
          .child("Orders/" + file.name);
      
        // Upload file and metadata to the object 'images/mountains.jpg'
        var uploadTask = ref.put(file, metadata);
        context.promises.push(uploadTask);
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function (snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                break;
            }
          },
          function (error) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case "storage/unauthorized":
                // User doesn't have permission to access the object
                break;
      
              case "storage/canceled":
                // User canceled the upload
                break;
      
              case "storage/unknown":
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
          },
          function () {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(async function (url) {
                await context.models.push(url);
              })
              .catch(console.error);
          }
        );
      },
      async submitOrderDetails() {
        const context = this;
        var subOrderArr = [];
      
        for (var i = 0; i < context.models.length; i++) {
          var sub_order = {
            model: context.models[i],
            material: "material_list[i]",
            color: "color_list[i]",
            quality: "quality_list[i]",
            infil_type: "infil_type_list[i]",
            infil_perc: "infil_prec_list[i]",
            wall_thick: "wall_thick_list[i]",
          };
          subOrderArr.push(sub_order);
          console.log(context.models[i]);
        }
      
        const custDetails = {
          name: "custName",
          address: "optAddress",
          town_city: "city",
          postal_code: "postalCode",
          phone: "phone",
        };
      
        const orderDetails = {
          delv_remarks: "delv_remarks",
          ord_remarks: "ord_remarks",
        };
      
        const OrderData = {
          subOrders: subOrderArr,
          custDetails: custDetails,
          orderDetails: orderDetails,
        };
      
        $.ajax({
          type: "POST",
          url: context.BASE_URL + "/orders/",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("x-access-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ0Njg0MzcyLCJleHAiOjE2NDQ3NzA3NzJ9.-d8KYwlHEvg31tjO7m5iXIcY4b_K7_alkAxrRA2mPj0");
          },
          data: OrderData,
          success: function (data) {
            Swal.fire({
              title: "Your quotation request submitted successfully!",
              text: "Feel free to contact us if you have any question or concerns.",
              icon: "success",
            }).then((result) => {
              /* Read more about isConfirmed, isDenied below */
              if (result.isConfirmed) {
                window.location.href = "placeorder.html";
              }
            });
            setTimeout(function () {
              window.location.href = "placeorder.html";
            }, 2000);
          },
          error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status == 400) {
              Swal.fire({
                title: "Your request failed!",
                text: "Please try again.",
                icon: "error",
              });
            }
          },
        });
      }
    };
    printingObj.init();
  });
})(jQuery);
