//set div height to expand to window height exactly
window.addEventListener('DOMContentLoaded', function () {
  var main = document.getElementById('main')
      main.style.height = window.innerHeight + "px";
});

//update artwork preview div
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

//ajax NINJA
var ninjaPost = function (url,data) {
  var payload = {}
      payload.type = "POST";
      payload.url = url;
  if(data){
      payload.data = data
  }
  $.ajax(payload)
}

//check for likedHidden field
if(document.getElementById("likedHidden")){
  var likedState = document.getElementById("likedHidden").innerHTML
  var likeURL = document.getElementById('like_button')
}

//flip state on DOM for liked/update via NINJA
var likeCheck = function() {
  if(likedState === 'notLiked'){
    var useURL = likeURL.href + "/like/"
    likeURL.innerHTML = '&#9733;'
    likedState = 'liked'
    var likeCount = parseInt(document.getElementById('likeCount').innerHTML,10)
    document.getElementById('likeCount').innerHTML = likeCount + 1
    // Do an AJAX post
    ninjaPost(useURL);

  } else if (likedState === 'liked') {
    var useURL = likeURL.href + "/unlike/"
    likeURL.innerHTML = '&#9734;'
    likedState = 'notLiked'
    var likeCount = parseInt(document.getElementById('likeCount').innerHTML,10)
    document.getElementById('likeCount').innerHTML = likeCount - 1
    // Do an AJAX post
    ninjaPost(useURL);
  }
}

$('#like_button').on('click', function(e){
  e.preventDefault();
  likeCheck()
});

//create delete button array
if (document.getElementsByClassName('delete')){
  var dele = document.getElementsByClassName('delete');
  var deleteButtons = document.getElementsByClassName('deleteButton');
  var confirmations = document.getElementsByClassName('confirm')
  var yes = document.getElementsByClassName('confirm-yes')
  var no = document.getElementsByClassName('confirm-no')
  var commentItem = document.getElementsByClassName('commentList')

  for (var i = 0; i < commentItem.length; i++) {
    deleteButtons[i].addEventListener('click', function (event) {
      var thisComment = this.parentNode;
      var deleteHref = thisComment.children[3].value;
      var confirmation = thisComment.children[4];

      $(confirmation).fadeIn( "slow", function() {
        // Animation complete
      });

      //yes
      confirmation.children[0].addEventListener('click', function () {
        $(thisComment).fadeOut( "slow", function() {
          // Animation complete
        });
        // Do an AJAX post
        ninjaPost(deleteHref);
      })
      
      //no
      confirmation.children[1].addEventListener('click', function () {
        $(this.parentNode).fadeOut( "slow", function() {
          // Animation complete
        });
      })
    })
  }
}

$('#postComment').on('click', function(e) {
  // Stop the browser from doing anything else
  e.preventDefault();
  var commentURL = document.getElementById('commentURL').value
  var commentTxt = document.getElementById('inputComment').value
  // Do an AJAX post
  ninjaPost(commentURL,{comment: commentTxt});

  var newComment = document.getElementById('newCommentRow')
    $( "#newCommentRow" ).fadeIn( "slow", function() {
      // Animation complete
    });
  var newCommenter = document.getElementById('newCommenter')
    $( "#newCommenter" ).fadeIn( "slow", function() {
      // Animation complete
    });
  var newCommentText = document.getElementById('newCommentText')
      newCommentText.innerHTML = commentTxt;
});
