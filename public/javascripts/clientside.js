//set div height to expand to window height exactly
window.addEventListener('DOMContentLoaded', function () {
  var main = document.getElementById('main')
  var content = document.getElementById('newForm')
      main.style.height = window.innerHeight + "px";
      content.style.height = (window.innerHeight - 50) + "px";
      content.style.overflow = "scroll";
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
  console.log("wtf");
  var payload = {}
      payload.type = "POST";
      payload.url = url;
  if(data){
      payload.data = data
  }
  return $.ajax(payload)
}

$('#postComment').on('click', function(e) {
  // Stop the browser from doing anything else
  e.preventDefault();
  var commentURL = document.getElementById('commentURL').value
  var commentTxt = document.getElementById('inputComment')
  var num = 0;
  // Do an AJAX post
  ninjaPost(commentURL,{comment: commentTxt.value}).then(function (result) {
    console.log(result);
    num++;
    var newCommentRow = document.getElementsByClassName('newCommentRow')
    var newCommenter = document.getElementsByClassName('newCommenter')
    var newCommentText = document.getElementsByClassName('newCommentText')
    console.log(newCommentRow);
    console.log(newCommenter);
    console.log(newCommentText);
    newCommentText[0].innerHTML = commentTxt.value;
    var cloneRow = newCommentRow[0]
        cloneCommenter = newCommenter[0]
        cloneCommentText = newCommentText[0]
    commentTxt.value = ''
    $(cloneRow).clone().insertAfter("#dividerDiv").fadeIn("slow")
    $(cloneCommentText).clone().appendTo(cloneRow).fadeIn("slow")
    $(cloneCommenter).clone().appendTo(cloneRow).fadeIn("slow")
    // newCommentRow[0].innerHTML = "shajkdhsjkahdjksahdkjhaskjhdjksahdkjahsk"
    newCommentRow[0].style.display = "inline-block"
    newCommenter[1].style.display = "none"
    newCommentText[1].style.display = "none"
    $(newCommentRow).first().hide()
    $(newCommenter).first().hide()
    $(newCommentText).first().hide()
  });
});


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
    ninjaPost(useURL)

  } else if (likedState === 'liked') {
    var useURL = likeURL.href + "/unlike/"
    likeURL.innerHTML = '&#9734;'
    likedState = 'notLiked'
    var likeCount = parseInt(document.getElementById('likeCount').innerHTML,10)
    document.getElementById('likeCount').innerHTML = likeCount - 1
    // Do an AJAX post
    ninjaPost(useURL)
  }
}

$('#like_button').on('click', function(e){
  e.preventDefault();
  likeCheck()
});

//change Background Image
if(document.getElementsByClassName('userArtwork')){
  var userArtworkItem = document.getElementsByClassName('profileItem');
  var row = document.getElementsByClassName('profileEntry')
  var artwork = document.getElementById('featuredProfile');

  for (var i = 0; i < userArtworkItem.length; i++) {
    row[i].addEventListener('mouseover', function () {
      artwork.style.backgroundImage = 'url('+this.children[1].innerHTML+')';
      artwork.style.backgroundSize = '300px';
    })
    userArtworkItem[i].addEventListener('mouseout', function () {
    })
  }
}

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

      $(confirmation).fadeIn("slow")
      //yes
      confirmation.children[0].addEventListener('click', function () {
        $(thisComment).fadeOut("slow")
        // Do an AJAX post
        ninjaPost(deleteHref);
      })

      //no
      confirmation.children[1].addEventListener('click', function () {
        $(this.parentNode).fadeOut("slow")
      })
    })
  }
}
