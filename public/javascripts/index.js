function getResults(){
  $('#results');
  $.getJSON('/update-link', function(data) {
    for (var i = 0; i<data.length; i++){
      $('#results').prepend('<p id="dataentry" data-id=' +data[i]._id+ '>' + data[i].title + '<span class=deleter>X</span></p>');
    }
  });
}

getResults();
//
$('#makenew').on('click', function(){
  $.ajax({
    type: "POST",
    dataType: "json",
    url: '/submit',
    data: {
      note: $('#note').val(),
    }
  })
  .done(function(data){
    $('#results').prepend('<p id="dataentry" data-id=' +data._id+ '><span class=deleter>X</span></p>');
    $('#note').val("");
  }
  );
});
//
// $('#clearall').on('click', function(){
//   $.ajax({
//     type: "GET",
//     dataType: "json",
//     url: '/clearall',
//     success: function(response){
//       console.log(response);
//       $('#results').empty();
//     }
//   });
// });
//
//
// $(document).on('click', '.deleter', function(){
//   var selected = $(this).parent();
//   $.ajax({
//     type: "GET",
//     url: '/delete/' + selected.data('id'),
//     success: function(response){
//       console.log(response);
//       selected.remove();
//     }
//   });
// });
//
//
// $(document).on('click', '#dataentry', function(){
//   var selected = $(this);
//   console.log(selected);
//   $.ajax({
//     type: "GET",
//     url: '/find/' + selected.data('id'),
//     success: function(data){
//       $('#note').val(data.note);
//       $('#title').val(data.title);
//       $('#actionbutton').html('<button id="updater" data-id="'+ data._id +'">Update</button>');
//     }
//   });
// });
//
// $(document).on('click', '#updater', function(){
//   var selected = $(this);
//   console.log(selected);
//   $.ajax({
//     type: "POST",
//     url: '/update/' + selected.data('id'),
//     dataType:"json",
//     data: {
//       title: $('#title').val(),
//       note: $('#note').val()
//     },
//     success: function(data){
//       $('#note').val("");
//       $('#title').val("");
//       $('#actionbutton').html('<button id="makenew">Submit</button>');
//       getResults();
//     }
//   });
// });
