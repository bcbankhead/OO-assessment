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

if(document.getElementById("likedHidden")){
  var likedState = document.getElementById("likedHidden").innerHTML
}
console.log(likedState);

var likeCheck = function(e) {
console.log(likedState);
  // Stop the browser from doing anything else
  e.preventDefault();
  // Do an AJAX post
  if(likedState === 'notLiked'){
  var likeURL = document.getElementById('like_button')
  likeURL.innerHTML = '&#9733;'
  likedState = 'liked'
} else {
  var likeURL = document.getElementById('unLike_button')
  likeURL.innerHTML = '&#9734;'
  likedState = 'notLiked'
}
  console.log(likeURL.href);
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
}


$('#like_button').on('click', function(e){
  likeCheck(e)
});
$('#unLike_button').on('click', function(e){
  likeCheck(e)
});


if (document.getElementsByClassName('delete')){
  var dele = document.getElementsByClassName('delete');
  var deleteButtons = document.getElementsByClassName('deleteButton');
  var confirmations = document.getElementsByClassName('confirm')
  var yes = document.getElementsByClassName('confirm-yes')
  var no = document.getElementsByClassName('confirm-no')
  var commentItem = document.getElementsByClassName('commentList')
  console.log(commentItem.length);
  for (var i = 0; i < commentItem.length; i++) {
    deleteButtons[i].addEventListener('click', function (event) {
      var thisComment = this.parentNode;
      var deleteHref = thisComment.children[3].value;
      var confirmation = thisComment.children[4];
      confirmation.style.display = "inline-block";
      confirmation.children[0].addEventListener('click', function () {
        thisComment.style.display = 'none';

        $.ajax({
          type: "POST",
          url: deleteHref,
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
      })
      confirmation.children[1].addEventListener('click', function () {
        console.log(i);
        this.parentNode.style.display = "none"
      })
    })
  }
}

$('#postComment').on('click', function(e) {

  // Stop the browser from doing anything else
  e.preventDefault();
  // Do an AJAX post
  var commentURL = document.getElementById('commentURL')
  var commentTxt = document.getElementById('inputComment')
  console.log(commentTxt.value);
  console.log(commentURL.value);
  $.ajax({
    type: "POST",
    url: commentURL.value,
    data: {
       comment: commentTxt.value // various ways to store the ID, you can choose
    },
    success: function(data) {
      // POST was successful - do something with the response
      console.log('Server sent back: ' + data);
    },
    error: function(data) {
      // Server error, e.g. 404, 500, error
      console.log(data.responseText+"wtf");
    }
  });

var newComment = document.getElementById('newCommentRow')
  newComment.style.display = "inline-block";
var newCommenter = document.getElementById('newCommenter')
console.log(newCommenter);
  newCommenter.style.display = "inline-block";
var newCommentText = document.getElementById('newCommentText')
console.log(newCommentText);
    newCommentText.innerHTML = commentTxt.value;
});
