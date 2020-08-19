$(document).ready(function () {
    $(document).on('click', '.delete-user-btn', function () {
        $('#deleteUserForm').attr('action', $(this).attr('data-href'));
    });

    $(document).on('click', '.delete-customer-btn', function () {
        $('#deleteCustomerForm').attr('action', $(this).attr('data-href'));
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
                parseInt($('.original-price').val()) - ( parseInt($('.original-price').val()) * ( discount / 100 ) )
            );
        }
    })
});