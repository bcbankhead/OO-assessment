window.addEventListener('DOMContentLoaded', function () {
  var main = document.getElementById('main')
      main.style.height = window.innerHeight + "px";
});

if (document.getElementById('artworkURL')){
  var url = document.getElementById('artworkURL')
  url.addEventListener('blur', function () {
    console.log("clicked");
    var thumb = document.getElementById('featuredNew');
    thumb.style.backgroundImage = 'url('+ url.value + ')';
    thumb.style.backgroundSize = '220px 420px';
    thumb.style.backgroundPosition = '-10px -10px';
  })
}

$('#like_button').on('click', function(e) {

          // Stop the browser from doing anything else
          e.preventDefault();
          // Do an AJAX post
          var likeURL = document.getElementById('like_button')
          console.log(likeURL.href);
          likeURL.innerHTML = '&#9733;'
          // var artId = likeURL.href.substr(likeURL.href.length, -24);
          // console.log(artId);
          $.ajax({
            type: "POST",
            url: likeURL.href,
            // data: {
            //   id: artId // various ways to store the ID, you can choose
            // },
            success: function(data) {
              // POST was successful - do something with the response
              console.log('Server sent back: ' + data);
            },
            error: function(data) {
              // Server error, e.g. 404, 500, error
              console.log(data.responseText+"wtf");
            }
          });
        });
