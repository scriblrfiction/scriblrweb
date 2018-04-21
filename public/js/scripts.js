
  var temp=$('.search_collapse').html();
  $('#search_button').click(function(){
    $('.search_collapse').fadeOut("fast",function(){
      var new_div=$("<div class='container form-group' id='new'><input class='form-control' id='search-bar' type='text'/></div>");
      $(this).replaceWith(new_div);
      $("#new").fadeIn("fast");
    });
  });
  $('#content').click(function(){
    $('#new').fadeOut("fast",function(){
    $('#new').replaceWith("<div class='container search_collapse'>"+temp+"</div>");
    $('.search_collapse').fadeIn("fast");

    $('#search_button').click(function(){
      $('.search_collapse').fadeOut("fast",function(){
        var new_div=$("<div class='container form-group' id='new'><input class='form-control active' id='search-bar' type='text'/></div>");
        $(this).replaceWith(new_div);
        $("#new").fadeIn("fast");
      });
    });
    });
  });


// multi item slider


  $(document).ready(function () {
var itemsMainDiv = ('.MultiCarousel');
var itemsDiv = ('.MultiCarousel-inner');
var itemWidth = "";

$('.leftLst, .rightLst').click(function () {
    var condition = $(this).hasClass("leftLst");
    if (condition)
        click(0, this);
    else
        click(1, this)
});

ResCarouselSize();




$(window).resize(function () {
    ResCarouselSize();
});

//this function define the size of the items
function ResCarouselSize() {
    var incno = 0;
    var dataItems = ("data-items");
    var itemClass = ('.item');
    var id = 0;
    var btnParentSb = '';
    var itemsSplit = '';
    var sampwidth = $(itemsMainDiv).width();
    var bodyWidth = $('body').width();
    $(itemsDiv).each(function () {
        id = id + 1;
        var itemNumbers = $(this).find(itemClass).length;
        btnParentSb = $(this).parent().attr(dataItems);
        itemsSplit = btnParentSb.split(',');
        $(this).parent().attr("id", "MultiCarousel" + id);


        if (bodyWidth >= 1200) {
            incno = itemsSplit[3];
            itemWidth = sampwidth / incno;
        }
        else if (bodyWidth >= 992) {
            incno = itemsSplit[2];
            itemWidth = sampwidth / incno;
        }
        else if (bodyWidth >= 768) {
            incno = itemsSplit[1];
            itemWidth = sampwidth / incno;
        }
        else {
            incno = itemsSplit[0];
            itemWidth = sampwidth / incno;
        }
        $(this).css({ 'transform': 'translateX(0px)', 'width': itemWidth * itemNumbers });
        $(this).find(itemClass).each(function () {
            $(this).outerWidth(itemWidth);
        });

        $(".leftLst").addClass("over");
        $(".rightLst").removeClass("over");

    });
}


//this function used to move the items
function ResCarousel(e, el, s) {
    var leftBtn = ('.leftLst');
    var rightBtn = ('.rightLst');
    var translateXval = '';
    var e2='#'+($(el).children().attr("id"));
    var divStyle = $(e2 + ' ' + itemsDiv).css('transform');
    var values = divStyle.match(/-?[\d\.]+/g);
    var xds = Math.abs(values[4]);
    if (e == 0) {
        translateXval = parseInt(xds) - parseInt(itemWidth * s);
        $(rightBtn).removeClass("over");

        if (translateXval <= itemWidth / 2) {
            translateXval = 0;
            $(leftBtn).addClass("over");
        }
    }
    else if (e == 1) {
        var itemsCondition = $(e2).find(itemsDiv).width() - $(e2).width();
        translateXval = parseInt(xds) + parseInt(itemWidth * s);
        $(leftBtn).removeClass("over");

        if (translateXval >= itemsCondition - itemWidth / 2) {
            translateXval = itemsCondition;
            $(rightBtn).addClass("over");
        }
    }
    $(e2 + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
}

//It is used to get some elements from btn
function click(ell, ee) {
   var Parent = "#" + $(ee).parent().attr("id");
    var slide = $(Parent).children().attr("data-slide");
    ResCarousel(ell, Parent, slide);
}

});


 $(document).ready(function(){
      
$('.responsive').slick({
  dots: false,
  arrows: true,
  infinite: false,
  speed: 300,
  slidesToShow: 10,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1780,
      settings: {
        slidesToShow: 9,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
        
    },
      {
      breakpoint: 1620,
      settings: {
        slidesToShow: 8,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
        
    },
      {
      breakpoint: 1510,
      settings: {
        slidesToShow: 7,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
        
    },
      {
      breakpoint: 1330,
      settings: {
        slidesToShow: 6,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
        
    },
    {
      breakpoint: 1130,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1
      }
    },
      {
      breakpoint: 910,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
        
    },
      {
      breakpoint: 720,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
        
    },
      {
      breakpoint: 560,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
        
    },
      
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
          dots: false
    
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});
        
    
        $('.cont-responsive').slick({
  dots: false,
  arrows: true,
  infinite: false,
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1710,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 1320,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
          dots:false
      }
    },
    {
      breakpoint: 877,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
          dots:false
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});
        
        
        
        
        
    
        $('.single-item').slick();
    });
  </script>
    
   <script>
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#placeholder-image')
                    .attr('src', e.target.result)
                    .width(250)
                    .height(350);
            };

            reader.readAsDataURL(input.files[0]);
        }
    }
       

       
       
       $('#editorModal').on('shown.bs.modal', function () {
    $(this).find('#editor-modal-dialog').css({width:'auto',
                               height:'auto', 
                              'max-height':'100%'});
});

       
       </script>
    
    <script>
    
    $(document).ready(function(){
  
  /* 1. Visualizing things on Hover - See next part for action on click */
  $('#stars li').on('mouseover', function(){
    var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on
   
    // Now highlight all the stars that's not after the current hovered star
    $(this).parent().children('li.star').each(function(e){
      if (e < onStar) {
        $(this).addClass('hover');
      }
      else {
        $(this).removeClass('hover');
      }
    });
    
  }).on('mouseout', function(){
    $(this).parent().children('li.star').each(function(e){
      $(this).removeClass('hover');
    });
  });
  
  
  /* 2. Action to perform on click */
  $('#stars li').on('click', function(){
    var onStar = parseInt($(this).data('value'), 10); // The star currently selected
    var stars = $(this).parent().children('li.star');
    
    for (i = 0; i < stars.length; i++) {
      $(stars[i]).removeClass('selected');
    }
    
    for (i = 0; i < onStar; i++) {
      $(stars[i]).addClass('selected');
    }
    
    
  });
  
  
});

    
    </script>


