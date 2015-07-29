window.addEventListener('DOMContentLoaded', function () {
  var main = document.getElementById('main')
      main.style.height = window.innerHeight + "px";
});

if (document.getElementById('newForm')){
  var url = document.getElementById('artworkURL')
  url.addEventListener('blur', function () {
    console.log("clicked");
    var thumb = document.getElementById('featuredNew');
    thumb.style.backgroundImage = 'url('+ url.value + ')';
    thumb.style.backgroundSize = '220px 420px';
    thumb.style.backgroundPosition = '-10px -10px';
  })
}
