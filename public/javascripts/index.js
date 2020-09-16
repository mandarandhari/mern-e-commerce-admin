$(document).ready(function () {
    $(document).on('click', '.delete-user-btn', function () {
        $('#deleteUserForm').attr('action', $(this).attr('data-href'));
    });

    $(document).on('click', '.delete-customer-btn', function () {
        $('#deleteCustomerForm').attr('action', $(this).attr('data-href'));
    });

    $(document).on('click', '.delete-product-btn', function () {
        $('#deleteProductForm').attr('action', $(this).attr('data-href'));
    });

    $(document).on('click', '.delete-order-btn', function () {
        $('#deleteOrderForm').attr('action', $(this).attr('data-href'));
    });

    $(document).on('click', '.delete-contact-btn', function () {
        $('#deleteContactForm').attr('action', $(this).attr('data-href'));
    });

    $(document).on('change', '.original-price, .discount', function (e) {
        if ( $('.original-price').val() !== '' && !$.isNumeric($('.original-price').val()) ) {
            alert("Please enter valid value of product original price");
            return false;
        }

        if ( $('.discount').val() !== '' && !$.isNumeric($('.discount').val()) ) {
            alert("Please enter valid value of discount");
            return false;
        } else if ( parseInt($('.discount').val()) < 0 ||  parseInt($('.discount').val()) > 99 ) {
            alert("Discount value should be greater than or equal to 0 and less than 99");
            return false;
        }

        if ($('.original-price').val() !== '') {
            var discount =  $('.discount').val() !== '' ? $('.discount').val() : 0;

            $('.price').val(
                Math.ceil(
                    parseInt($('.original-price').val()) - ( parseInt($('.original-price').val()) * ( discount / 100 ) )
                )
            );
        }
    });

    $(document).on('change', '.product-image', function (e) {
        let file = e.target.files[0];
        let reader = new FileReader();

        reader.onloadend = function () {
            $('.product-img img').attr('src', reader.result);
            $('.product-img').show();
        };

        reader.readAsDataURL(file);
    });

    $(document).on('change', '#orderStatus', function() {
        $.ajax({
            url: location.origin + '/order/change_status/' + $('.order_id').val(),
            data: {
                status: $(this).children('option:selected').val()
            },
            dataType: 'json',
            type: 'post',
            success: function (response) {
                if (response.status) {
                    toastr.success('Order status updated successfully');
                } else {
                    toastr.error('Something went wrong');
                }
            }
        })
    });

    $(document).on('click', '.view-contact-btn', function() {
        $('.contact-name').html($(this).attr('data-name'));
        $('.contact-email').html($(this).attr('data-email'));
        $('.contact-message').html($(this).attr('data-message'));
    });
});