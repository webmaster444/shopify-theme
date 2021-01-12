var swiper = new Swiper('.swiper-container', {
    pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true,
    },
});

jQuery(document).ready(function() {
    jQuery(window).scroll(function() {
        if (jQuery(this).scrollTop() > 20) {
            jQuery("#masthead").addClass('sticky');
        } else {
            jQuery("#masthead").removeClass('sticky');
        }
    })

    if ($('body').hasClass('template-collection')) {
        let triggered = false;
        function scrollExecute() {
            scrollNode = $('#more').last();
            console.log($(scrollNode).offset().top);
            if((triggered==false)&&(($(scrollNode).offset().top - $(window).scrollTop()) < 800)){            
                scrollURL = $('#more p a').last().attr("href");
                console.log(scrollURL);
                triggered = true;
                $.ajax({
                    type: 'GET',
                    url: scrollURL,
                    beforeSend: function() {
                        $('.loading-gif-wrapper').removeClass('hide');
//                         scrollNode.hide();
                    },
                    success: function(data) {
                        let nextLoads = $(data).find('.default-pagination .next a');
                        let nextUrl = $(nextLoads).attr('href');
                        console.log(nextUrl);
                        if (nextUrl == undefined) {
                            scrollNode.hide();
                          triggered = true;
                        } else {
                            $('#more p a').attr('href', nextUrl);
                            scrollNode.show();
                          triggered = false;
                        }
                        var filteredData = $(data).find(".product-grid");
                        $(".products-inner").append(filteredData);
                        $('.loading-gif-wrapper').addClass('hide');
                    },
                    dataType: "html"
                });                
            }
        }

      $(window).scroll(function(){
        	scrollExecute();
      });
//         $(document).on('click', '#more', function(e) {
//             e.preventDefault();
//             scrollExecute();
//         })
    }

    jQuery('.tools .search').on('click', function() {
        jQuery('.site-search-wrap').slideToggle();
        jQuery('.mob-menu-header-holder').toggleClass('search-bar');
        if (window.innerWidth < 768) {
            jQuery('body').toggleClass('scroll-no');
        }
        if (jQuery('body').hasClass('show-nav-left')) {
            jQuery('.mobmenu-panel').addClass("hide-panel");
            jQuery('html').addClass("mob-menu-scroll");
            jQuery('.mob-menu-header-holder').removeClass('mob-menu-expaned');
        }
    })
    jQuery('.close-search').on('click', function() {
        jQuery('.site-search-wrap').hide();
        jQuery('.mob-menu-header-holder').removeClass('search-bar');
        jQuery('.aws-container .aws-search-field').val('');
        if (window.innerWidth < 768) {
            jQuery('body').removeClass('scroll-no');
        }
    })

    jQuery(document).on('click', '.plus', function() {
        let cuQty = parseInt($(this).siblings('#Quantity').val());
        cuQty++;
        $(this).siblings('#Quantity').val(cuQty);
    })

    jQuery(document).on('click', '.minus', function() {
        let cuQty = parseInt($(this).siblings('#Quantity').val());
        cuQty--;
        cuQty = cuQty > 1 ? cuQty : 1;
        console.log(cuQty);
        $(this).siblings('#Quantity').val(cuQty);
    })

    $(".add-to-cart-btn").on('click', function(e) {
        e.preventDefault();
        var $addToCartForm = $(this).closest('form');
        var $addToCartBtn = $addToCartForm.find('.add-to-cart-btn');

        $.ajax({
            url: '/cart/add.js',
            dataType: 'json',
            cache: false,
            type: 'post',
            data: $addToCartForm.serialize(),
            beforeSend: function() {
                $addToCartBtn.attr('disabled', 'disabled').addClass('disabled');
                $addToCartBtn.find('span').text('Adding...');
            },
            success: function(itemData) {
                $addToCartBtn.find('span').text('Added');
//                 popoverItem(itemData);

                window.setTimeout(function() {
                    $addToCartBtn.removeAttr('disabled').removeClass('disabled');
                    $addToCartBtn.find('.btn__text').text('Add to Cart');
                }, 1000);

                $.ajax({
                    url: '/cart.js',
                    dataType: "json",
                    cache: false,
                    success: function(cart) {
                        refreshCart(cart); //refresh your cart with newly added products
                    }
                });
            },
            error: function(XMLHttpRequest) {
                var response = eval('(' + XMLHttpRequest.responseText + ')');
                response = response.description;
                $('.warning').remove();
                var warning = '<p class="warning fadeIn">' + response.replace('All 1 ', 'All ') + '</p>';
                $addToCartForm.after(warning);
                $addToCartBtn.removeAttr('disabled').removeClass('disabled');
                $addToCartBtn.find('span').text('Add to Cart');
            }
        });
        return false;
    })

    function refreshCart(cart) {
        $(".mini-cart_count").empty();
        $cartBtn = $(".mini-cart_count");
        var value = $cartBtn.text() || '0';
        var cart_items_html = "";
        var cart_action_html = "";

        var $cart = $(".cart_content form");

        $cartBtn.text(value.replace(/[0-9]+/, cart.item_count));

        if (cart.item_count == 0) {
            $('.js-empty-cart__message').removeClass('hidden');
            $('.js-cart_content__form').addClass('hidden');
        } else {
            $('.js-empty-cart__message').addClass('hidden');
            $('.js-cart_content__form').removeClass('hidden');

            $.each(cart.items, function(index, item) {
                var line_id = index + 1;
                cart_items_html += '<li class="mini-cart_item clearfix">' +
                    '<a href="' + item.url + '">';
                if (item.image) {
                    cart_items_html += '<div class="mini-cart_image">' +
                        '<img src="' + item.image.replace(/(\.[^.]*)$/, "_compact$1").replace('http:', '') + '" alt="' + item.title + '" />' +
                        '</div>';
                }

                var item_title = item.title.split('-');
                cart_items_html += '<div class="mini-cart_item__wrapper"><div class="mini-cart_item__title">' + item_title[0] + '</div>';
                cart_items_html += '<div class="mini-cart_item_price">';

                if (item.price < item.compare_at_price) {
                    cart_items_html += '<span class="money was_price">' + theme.Currency.formatMoney(item.compare_at_price, slate.moneyFormat) + '</span>';
                }

                cart_items_html += '<span class="money">' + theme.Currency.formatMoney(item.price, slate.moneyFormat) + '</span>';
                cart_items_html += '</div>';
                cart_items_html += '<div class="mini-cart_item__variants">';

                $.each(item.options_with_values, function(index, option) {
                    cart_items_html += '<div class="mini-cart_item__variant"><span class="item-variant-label">' + option.name + ':</span><span class="item-variant-value">' + option.value + '</span></div>';
                });

                if (item.properties) {
                    $.each(item.properties, function(title, value) {
                        if (value) {
                            cart_items_html += '<div class="line-item">' + title + ': ' + value + '</div>';
                        }
                    });
                }

                cart_items_html += '</div>';

                cart_items_html += '<div class="mini-cart_item_quantity">' +
                    'Quantity: <span class="quantity">' + item.quantity + '</span>' +
                    '</div>';

                cart_items_html += '</div></a></li>';
            });
        }
        cart_action_html += '<li class="mini-cart_subtotal">' +
            '<span class="mini-cart_subtotal-label">Total</span>' +
            '<span class="mini-right"><span class="money">' + theme.Currency.formatMoney(cart.total_price, slate.moneyFormat) + '</span></span>' +
            '</li>' +
            '<li class="mini-cart-buttons">' +
            '<a href="/cart" class="btn">View Shopping Cart</a>' +
            '</li>';

        $('.js-mini-cart_items').html(cart_items_html);
        $('.js-cart__subtotal').html(cart_action_html);
        $('.js-mini-cart_content-title').html('<h3>Your Shopping Cart</h3>');
    }
  
  $('.close-minicart').on('click', function(){
    $('body').removeClass('js-drawer-open');
    $('.mini-cart').removeClass('drawer--is-open');
  })
  $('.cart').on('click', function(e){
    e.preventDefault();
    $('.mini-cart').toggleClass('drawer--is-open');
    $('body').toggleClass('js-drawer-open');
  })
})