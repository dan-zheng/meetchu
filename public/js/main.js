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
  // On submit disable its submit button
  console.log('hi');
  const btns = $('button[type="submit"]');
  btns.each((i, btn) => {
    $(btn).prop('disabled', true);
    // $(btn).removeAttr('type');
  });
});
