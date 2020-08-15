$(document).ready(function () {
    $(document).on('click', '.delete-user-btn', function () {
        $('#deleteUserForm').attr('action', $(this).attr('data-href'));
    });

    $(document).on('click', '.delete-customer-btn', function () {
        $('#deleteCustomerForm').attr('action', $(this).attr('data-href'));
    });
});