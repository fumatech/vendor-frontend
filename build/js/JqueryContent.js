
$(document).ready(() => {
  if (!$.fn.DataTable.isDataTable("#example1")) {
    $("#example1").DataTable({
      order: [[1, "desc"]], // Assuming the second column (index 1) is "Date"
      responsive: true,
      lengthChange: true,
      autoWidth: true,
      searching: true,
      ordering: true,
      info: true,
      autoWidth: true,
      responsive: true,
      paging: true,

      dom: "Bfrtip", // Adjust placement of buttons
    });
  }
});
