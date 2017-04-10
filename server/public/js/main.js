$("#sidebar-toggle").click((e) => {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});

/*
$('button[type="submit"]').click((e) => {
  const btn = $(e.target);
  btn.prop('disabled', true);
  console.log(btn);
});
*/

$('form').submit(() => {
  // On form submit disable submit buttons
  const btns = $('button[type="submit"]');
  btns.each((i, btn) => {
    $(btn).prop('disabled', true);
  });
});
