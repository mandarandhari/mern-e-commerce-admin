$(document).ready(function () {
    $(document).on('click', '.delete-user-btn', function () {
        $('#deleteUserForm').attr('action', $(this).attr('data-href'));
    });
});