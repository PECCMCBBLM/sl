var menuobject; //Stores all menu items
var shuffle = 0;
var repeat = 0;
var playlist = [];
var playlist_pos = -1;
var paused = false;
var oSettings = [];
var oFavourites = [];

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',

        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}
$.fn.extend({
    //pass the options variable to the function
    accordion: function (options) {
        var defaults = {
            speed: 300
        };

        // Extend our default options with those provided.
        var opts = $.extend(defaults, options);
        //Assign current element to variable, in this case is UL element
        var $this = $(this);


        $('.menu').on("click", function () {
            var list = $(this).siblings("ol:first");
            if (list.is(":visible")) {
                $(this).find(".material-icons").html('keyboard_arrow_down');
                list.slideUp(opts.speed);
            } else {
                $(this).find(".material-icons").html('keyboard_arrow_up');
                list.slideDown(opts.speed);
                var scroller = $(this).parents(".tabcontent").first();
                scroller.animate({
                    scrollTop: scroller.scrollTop() + $(this).position().top - 110
                });
            }
            return false;
        });



        $('.danceinfo').on("click", function () {
            var dance;
            if ($(this).parents('#qo').length) {
                //clicked the queue - select all dances in the menu with the same ID.
                dance = $(this).parent();
            } else {
                //clicked a dance in the menu
                dance = $(this).parent().clone(true);
                var existing = $("#qo .dance[data-i='" + dance.data('i') + "']");
                var playing = $("#qo .playing").first();
                if (existing.length != 0) {
                    //this dance exists
                    if (playing.data('i') == dance.data('i')) {
                        dance = playing;
                    } else {
                        var first = playing.nextAll(".dance[data-i='" + dance.data('i') + "']").first();
                        if (first.length) {
                            dance = first;
                        } else {
                            var next = playing.prevAll(".dance[data-i='" + dance.data('i') + "']").first();
                            dance = next;
                        }
                    }
                } else {
                    if (playing.length != 0) {
                        playing.after(dance);
                    } else {
                        $("#qo").prepend(dance);
                    }
                }
            }
            //dance will now be in the queue - play it...
            play_dance(dance);
            playlist = playlist.slice(0, playlist_pos + 1);
            playlist_add(dance.data('i'));
            return false;
        });

        
        $('.atq').on("click", function () {
            var dance = $(this).parents('li').first().clone(true);
            dance.removeClass('playing paused');
            dance.find('.danceicon').text("directions_run");
            $("#qo").append(dance);
            return false;
        });

        $('.atf').on("click", function () {
            var dance = $(this).parents('li').first();
            var id = dance.data('i');

            if ($(this).text() == 'favorite_border') {
                $(".cdo .dance[data-i='" + id + "'] .atf").text("favorite");
                $(".qo .dance[data-i='" + id + "'] .atf").text("favorite");
                if (!$("#fav .dance[data-i='" + id + "']").length) {

                    $("#fav ol").first().append(dance.clone(true));
                    $("#fav").show();
                    //add to list of favourites
                    if (!~oFavourites.indexOf(id)) {
                        oFavourites.push(id);
                    }
                }
            }
            else {

                $("#fav .dance[data-i='" + id + "']").remove();
                $(".cdo .dance[data-i='" + id + "'] .atf").text("favorite_border");
                $(".qo .dance[data-i='" + id + "'] .atf").text("favorite_border");

                oFavourites = oFavourites.filter(item => item !== id);

                if ($("#fav ol").first().children().length == 0) {
                    $("#fav").hide();
                }

            }

        });


        $('.rfq').on("click", function () {
            var dance = $(this).parents('li').first();
            dance.remove();
            return false;
        });

    }
});

$(function () {

    $("#qo").sortable();
    $("#slider-range").slider({
        range: true,
        min: 30,
        max: 1800,
        step: 5,
        values: [30, 30],
        slide: function (event, ui) {
            $("#amount").html(gettimes(ui.values[0], ui.values[1]));
        }
    });
    $("#amount").html(gettimes($("#slider-range").slider("values", 0), $("#slider-range").slider("values", 1)));
});

function gettimes(a, b) {
    if (a == b) {
        return "Exactly<br>" + stringifytime(a);
    } else {
        return "Between " + stringifytime(a) + "<br>and " + stringifytime(b);
    }
}

function stringifytime(time) {
    var minutes = Math.floor(time / 60);
    if (minutes > 0) {
        if (minutes > 1) {
            minutes = minutes + " minutes ";
        } else {
            minutes = minutes + " minute ";
        }


        time = time % 60;
        if (time == 0) {
            time = "";
        } else {
            time = time + " seconds";
        }
    } else {
        time = time + " seconds";
        minutes = "";
    }

    return minutes + time;

}

$(function () {
    $("#slider-height").slider({
        min: -0.5,
        max: 0.5,
        step: 0.05,
        value: 0,
        slide: function (event, ui) {
            $("#avheight").html(ui.value + 'm');
        }
    });
    $("#avheight").html($("#slider-height").slider("value") + 'm');

    $("#progressbar").progressbar({
        value: 0
    });
});

$(function () {
    $('#minmax').on("click", function () {
        var direction = 'down';
        if ($(this).hasClass('fa-arrow-alt-circle-up')) {
            direction = 'up';
        }

        $.ajax({
            type: "GET",
            url: window.location.href + "/" + direction
        }).done(function (data) {
            $('#minmax').removeClass('fa-arrow-alt-circle-up fa-arrow-alt-circle-down').addClass('fa-arrow-alt-circle-' + data);

        }).fail(function (jqXHR, textStatus, errorThrown) {

        });


    });
});

$(document).ready(function () {
    send_command("1|ready");
    $('.material-icons').addClass('notranslate');

    //----------------------------------------------------------------------------------------------------------
    //---------------------------------------------buttons -----------------------------------------------------
    //----------------------------------------------------------------------------------------------------------
    $(".tablinks").on("click", function () {
        if ($(this).attr('data-t') == 'host') {
            var newvalue = !($('body').data('h'));
            $('body').attr('data-h', newvalue);
            $('body').data('h', newvalue);
            if ($('body').data('h') == true) {
                $(this).css('color', '#5f5');
            }
            else {
                $(this).css('color', '#fff');
            }

        }
        else {
            $(this).addClass("selected").siblings().removeClass("selected");
            $("#" + $(this).attr('data-t')).removeClass('x').siblings().addClass('x')
        }
    });

    $("#hcode").on("click", ".dc-btn", function () {    // Dance choice buttons
        var currChoice = $('#cdShow').data('c');
        var newChoice = $(this).data('c');
        if (currChoice != newChoice) { //new type of dance - clear the dance queue
            $('#cdShow').data('c', newChoice);
            if (currChoice != 0) stop_dance();

            var icon = $(this).find(">:first-child");
            icon.css({
                "position": "fixed",
                "top": (93 + (Math.floor((newChoice - 1) / 2)) * 167) + "px",
                "left": 128 + (((newChoice - 1) % 2) * 175) + "px"
            });
            icon.animate({
                position: 'absolute',
                top: '8px',
                left: '15px',
                fontSize: '25px'
            }, {
                duration: 500, complete: function () {
                    $('#cdShow i').html(icon.html());
                    icon.css({ "position": "absolute", "top": "10px", "left": "45px", "font-size": "55px" });
                    if ((newChoice == 1) || (newChoice == 3) || ($('body').data('h') == true)) { //Single or Multiple Dance Choice
                        displaymenu();
                    }
                    else { //Rez Poseballs
                        if (newChoice == 2) { //Couples Dance
                            send_command("2080|2|MF");
                        }
                        else { //Line Dance
                            send_command("2080|1|-");
                        }
                        $('#pbWait').show();
                    }
                }
            });
        }
        else {
            displaymenu();
        }


    });

    $('#rCancel').on("click", function () {
        send_command("2112|-1");
        $('#pbWait').hide();
        showDC();
    });

    //----------------------------- Notification -----------------------------------
    $('#alarm').on("click", function () {
        if ($('#ctl_maxmin').text() == "keyboard_arrow_down") {
            $.ajax({
                type: "POST",
                url: window.location.href + "/maxmin",
                dataType: "text",
                data: "keyboard_arrow_down"
            }).done(function (data) {
                $('#ctl_maxmin').text(data);
                $('#srRequest').show();
                $('#alarm').hide();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                return "failed";
            });
        }
        else {
            $('#srRequest').show();
            $('#alarm').hide();
        }
    });

    $('#rYes').on("click", function () {
        send_command($('#rYes').data('c'));
        $('#srRequest').hide();
    });

    $('#rNo').on("click", function () {
        $('#srRequest').hide();
    });


    //----------------------------- Media Player -----------------------------------

    $('#ctl_stop').on("click", function () {

        var settingdata = '[{"DFV":"' + oFavourites.toString() + '"},{"DMU":"';

        var rMin = $("#slider-range").slider("values", 0);
        var rMax = $("#slider-range").slider("values", 1);
        var hVal = $("#slider-height").slider("value");

        if ((rMin != 180) || (rMax != 300) || (hVal != 0)) {
            settingdata += rMin + ',' + rMax + ',' + hVal;
        }
        settingdata += '"}]';

        $.ajax({
            type: "PUT",
            url: encodeURI("http://90.255.244.239:52974/api/setting/setsettings/051bc4c1-5188-4002-985f-e8e0e77da127/Actingill Igaly/-1"),
            dataType: "json",
            data: settingdata,
            fail: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            },
            complete: send_command('stop')
        });
    });

    $('#ctl_shuffle').on("click", function () {
        shuffle = !shuffle ? 1 : 0;
        playlist = playlist.slice(0, playlist_pos + 1);
        $('#ctl_shuffle').css('color', ['#fff', '#9D9AFF'][shuffle]);
    });

    $('#ctl_prev').on("click", function () {
        if (!$(this).parent().hasClass('dis')) {
            var loop = true;
            do {
                if (playlist_pos > 0) {
                    playlist_pos--;
                    var next = $("#qo .dance[data-i='" + playlist[playlist_pos] + "']").first();
                    if (next.length > 0) {
                        loop = false;
                        play_dance(next);
                    }
                }
                else {
                    loop = false;
                }
            } while (loop);
        }
    });

    $('#ctl_play').on("click", function () {
        if (!$(this).parent().hasClass('dis')) {
            if ($(this).text() == 'play_circle') {
                play_dance($('#qo').find('.paused').first());
            }
            else {
                paused = true;
                $('.cdo .playing').addClass('paused').find('.danceicon').text("pause");
                $(this).text("play_circle");
                send_command('513|stand');
            }
        }
    });

    $('#ctl_next').on("click", function () {
        if (!$(this).parent().hasClass('dis')) {
            var rpt = repeat;
            repeat = false;
            next_dance();
            repeat = rpt;
        }
    });


    $('#ctl_repeat').on("click", function () {
        repeat = !repeat ? 1 : 0;
        $('#ctl_repeat').text(['repeat', 'repeat_one'][repeat]);
    });

    $('#ctl_maxmin').on("click", function () {
        var btn = $(this);
        $.ajax({
            type: "POST",
            url: window.location.href + "/maxmin",
            dataType: "text",
            data: btn.text()
        }).done(function (data) {
            btn.text(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            return "failed";
        });
    });

    $('#sch').keyup(function () {
        var filter = ' ' + $(this).val();
        if (filter.trim() == '') {
            $("#do .dance").slideDown(0);
            $("#do .menu").slideDown(0);
            $("#do .fa-caret-down").parent().siblings('ol').slideUp(0);
            $("#do").slideDown(0);
        } else {
            $("#do .menu").slideUp(0);
            $("#do .dance:not([data-s*='" + filter + "' i])").slideUp(0);
            $("#do .dance[data-s*='" + filter + "' i]").slideDown(0).parents().slideDown(0).siblings('.menu').slideDown(0);
        }
    });

    // RESTYLE THE DROPDOWN MENU
    $('#google_translate_element').on("click", function () {

        // Change font family and color
        $("iframe").contents().find(".goog-te-menu2-item div, .goog-te-menu2-item:link div, .goog-te-menu2-item:visited div, .goog-te-menu2-item:active div, .goog-te-menu2 *")
            .css({
                'color': '#ddd',
                'background-color': '#191919',
                'font-size': '20px',
            });
        // Remove the 'select language' heading
        $("iframe").contents().find('.goog-te-menu2-item-selected').css('display', 'none');

        // Change menu's padding
        $("iframe").contents().find('.goog-te-menu2').css('padding', '10px');

        // Change the padding of the languages
        $("iframe").contents().find('.goog-te-menu2-item div').css('padding', '3px');

        // Change the width of the languages
        //$("iframe").contents().find('.goog-te-menu2-item').css('width', '150px');
        //$("iframe").contents().find('td').css('width', '150px');

        // Change hover effects
        $("iframe").contents().find(".goog-te-menu2-item div").hover(function () {
            $(this).find('span.text').css('color', 'white');
        }, function () {
            $(this).find('span.text').css('color', '#ddd');
        });

        // Change Google's default blue border
        $("iframe").contents().find('.goog-te-menu2').css('border', 'none');

        // Change the iframe's box shadow
        $(".goog-te-menu-frame").css('box-shadow', '0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 2px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.3)');



        // Change the iframe's size and position?
        $(".goog-te-menu-frame").css({
            'top': '55px',
            'left': '50px',
            'width': '400px',
            'height': '350px',
            'background-color': '#191919',
            'border': 'none',
            'padding-right': '10px'
        });

        // Change iframes's size
        $("iframe").contents().find('.goog-te-menu2').css({
            'background-color': '#191919',
            'overflow': 'scroll',
            'max-width': '100%',
            'height': '330px'
        });
    });

    //--------------------------------------------------------------
    // Ran on startup
    //--------------------------------------------------------------
    //menuobject = [{ "n": "1", "m": [{ "n": "RecentlyAdded", "m": [], "d": [{ "i": 7206, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "1 Hit Wonder TIS - copy", "w": false, "p": "1|1 Hit Wonder TIS - copy" }, { "i": 7207, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Vishuddha TIS - copy", "w": false, "p": "1|Vishuddha TIS - copy" }, { "i": 7208, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Wagon Wheel TIS - copy", "w": false, "p": "1|Wagon Wheel TIS - copy" }, { "i": 7209, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Want Me TIS - copy", "w": false, "p": "1|Want Me TIS - copy" }, { "i": 7210, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Watch Me TIS - copy", "w": false, "p": "1|Watch Me TIS - copy" }, { "i": 7211, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "WheresMyDrink TIS - copy", "w": false, "p": "1|WheresMyDrink TIS - copy" }, { "i": 7212, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Whirling Dervish TIS - copy", "w": false, "p": "1|Whirling Dervish TIS - copy" }, { "i": 7213, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Wicked TIS - copy", "w": false, "p": "1|Wicked TIS - copy" }, { "i": 7214, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Work It! TIS - copy", "w": false, "p": "1|Work It! TIS - copy" }, { "i": 7215, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Wrath TIS - copy", "w": false, "p": "1|Wrath TIS - copy" }, { "i": 7216, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Y.M.C.A. TIS - copy", "w": false, "p": "1|Y.M.C.A. TIS - copy" }, { "i": 7217, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Yalta TIS - copy", "w": false, "p": "1|Yalta TIS - copy" }, { "i": 7218, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Zombie TIS - copy", "w": false, "p": "1|Zombie TIS - copy" }, { "i": 7219, "c": 1, "m": "Awaiting details", "s": "Awaiting details", "l": "051bc4c1-5188-4002-985f-e8e0e77da127", "n": "~WaitingAnimation", "w": false, "p": "1|~WaitingAnimation" }, { "d": 3635, "c": 1, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Candyman", "w": false, "g": 161.08, "p": "5|TIS Candman 1 - copy·25.08ØTIS Candman 2 - copy·28.00ØTIS Candman 3 - copy·28.00ØTIS Candman 4 - copy·25.83ØTIS Candman 5 - copy·27.00ØTIS Candman 6 - copy·27.17" }] }], "d": [] }, { "n": "2", "m": [{ "n": "RecentlyAdded", "m": [], "d": [{ "d": 3066, "c": 2, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "Waltz TIS", "w": false, "p": "2|Waltz TIS-M - copy·&lt;0,0,-0.175&gt;·&lt;0,0,0.707,-0.707&gt;·M¦Waltz TIS-F - copy·&lt;0,0,-0.166&gt;·&lt;0,0,0.707,-0.707&gt;·F" }, { "d": 3072, "c": 2, "m": "Dancing Lemon", "s": "There In Spirit", "l": "f40d0660-89fc-4323-bd03-5f4c730b1676", "n": "2Hearts", "w": false, "p": "2|2Hearts TIS-M - copy·&lt;0,0,-0.175&gt;·&lt;0,0,0.707,-0.707&gt;·M¦2Hearts TIS-F - copy·&lt;0,0,-0.166&gt;·&lt;0,0,0.707,-0.707&gt;·F" }] }], "d": [] }];


    get_next_url(firsturl, "");



    $.ajax({
        type: "PUT",
        url: encodeURI("http://90.255.244.239:52974/api/setting/getsettings/051bc4c1-5188-4002-985f-e8e0e77da127/"),
        dataType: "json",
        data: '[{"DFV":""},{"DMU":""}]'
    }).done(function (data) {
        parse_settings(JSON.parse(data));
    }).fail(function (jqXHR, textStatus) {
        //var tempsettings = [{ "key": "DFV", "value": "i7762,i7763,i7764,i7761,i7930,i7207" }, { "key": "DMU", "value": "30,210,0" }];
        //parse_settings(tempsettings);
    });


    function parse_settings(newsettings) {
        oFavourites = newsettings.find(x => x.key == "DFV").value.split(",");
        oFavourites = oFavourites.filter(n => n); //remove empty entries
        oSettings = newsettings.find(x => x.key == "DMU").value.split(",");
        oSettings = oSettings.filter(n => n); //remove empty entries
        if (oSettings.length != 3) {
            oSettings = [180, 300, 0];
        }

        $("#slider-range").slider("option", "values", [oSettings[0], oSettings[1]]);
        $("#amount").html(gettimes(oSettings[0], oSettings[1]));

        $("#slider-height").slider("option", "value", oSettings[2]);
        $("#avheight").html(oSettings[2] + 'm');


        if ($('#cdShow').data('c') == -1) {
            $("#fav .dance").remove();

            for (var f in oFavourites) {
                $("#fav ol").first().append($(".dance[data-i='" + oFavourites[f] + "']").first().clone(true));
                $(".dance[data-i='" + oFavourites[f] + "'] .atf").text("favorite");
            }

            if ($("#fav ol").first().children().length > 0) {
                $("#fav").show();
            }
            else {
                $("#fav").hide();
            }
        }
    }
    //$.ajax({
    //type: "GET",
    //url: window.location.href + "/loaded"
    //}).done(function (data) {

    //}).fail(function (jqXHR, textStatus, errorThrown) {

    //});



    function get_next_url(next_url, dance_data) {
        $.ajax({
            type: "GET",
            url: next_url,
            dataType: "text"
        }).done(function (data) {
            if (data.charAt(0) == "•") {
                dance_data += data.substr(1);
                menuobject = JSON.parse(dance_data);
            }
            else {
                var i = data.indexOf("•");
                dance_data += data.substr(i + 1);
                get_next_url(data.substr(0, i), dance_data);
            }

        }).fail(function (jqXHR, textStatus, errorThrown) {

        });
    }
});

function dance_mode(mode) {


}

function displaymenu() {

    $(".tablinks[data-t='dances']").removeClass("x").addClass("selected").siblings().removeClass("selected");
    $(".tablinks[data-t='queue']").removeClass("x");
    $("#dances").removeClass("x").siblings().addClass("x");

    //clear the dance queue
    $("#qo .dance").remove();

    var currchoice = $('#cdShow').data('c');
    $("#do").html("<li class='m notranslate' id='fav' style='display:none;'><div class='menu'><span>My Favourites</span><span class='right material-icons'>keyboard_arrow_down</span></div><ol></ol></li>");


    for (var i in menuobject) {
        var menu = menuobject[i];
        if (menu.n == currchoice) {
            $("#do").append(json_tree(menu));
        }
    }

    $("#fav .dance").remove();

    for (var f in oFavourites) {
        $("#fav ol").first().append($(".dance[data-i='" + oFavourites[f] + "']").first().clone(true));
        $(".dance[data-i='" + oFavourites[f] + "'] .atf").text("favorite");
    }

    if ($("#fav ol").first().children().length > 0) {
        $("#fav").show();
    }
    else {
        $("#fav").hide();
    }

    $('#do').off();
    $('#do').removeClass().addClass('cdo');
    $('#do').accordion();

}

function json_tree(object) {
    var json = "";

    if (object.hasOwnProperty("p")) { //dance
        var searchterm = object.n;
        var origname = "";
        var ident;
        var len;
        if (object.hasOwnProperty("o")) {
            searchterm += " " + object.o;
            origname = "<div>(" + object.o + ")</div>";
        }

        if (object.hasOwnProperty("d")) {
            ident = "d" + object.d;
        } else {
            ident = "i" + object.i;
        }

        if (object.hasOwnProperty("g")) {
            len = object.g;
        } else {
            len = 0;
        }

        json = "<li class='dance notranslate' data-i='" + ident + "' data-s=' " + searchterm + "'><div class='popup'><span class = 'right material-icons notranslate'>menu</span><div class='dropdown'><div class ='infomenu'><span class = 'material-icons atq notranslate'>playlist_add</span><span class='material-icons rfq notranslate'>delete_sweep</span><span class = 'material-icons atf notranslate'>favorite_border</span></div><div class='infotext notranslate'><a href='secondlife:///app/agent/" + object.l + "/about'>" + object.m + "</a>";
        if (object.m != object.s) {
            json += "<br/><div>" + object.s + "</div>";
        }
        json += origname + "</div></div></div><span class='danceinfo' data-d='" + object.p + "' data-l='" + len + "'><span class='danceicon material-icons notranslate'>directions_run</span><span class='dn'>" + object.n + "</span></span></li>";
    } else { //menu
        if (object.hasOwnProperty("m")) {
            for (var i in object.m) {
                var menu = object.m[i];
                json += "<li class='m notranslate'><div class='menu'><span>" + menu.n + "</span><span class='right material-icons notranslate'>keyboard_arrow_down</span></div><ol>" + json_tree(menu) + "</ol></li>";
            }
        }


        if (object.hasOwnProperty("d")) {

            for (var x in object.d) {
                var dance = object.d[x];
                json += json_tree(dance);
            }
        }

    }
    return json;

}

//--------------------------------------------------------------------
//------------------------    TIMERS    ------------------------------
//--------------------------------------------------------------------
var dance_start;
var dance_tick;
var dance_length;
var timer_id;


function dance_clock() {
    dance_tick += 50;

    $('#prog').text(Math.floor(dance_tick / 60000) + "." + ("0" + Math.floor((dance_tick % 60000) / 1000)).slice(-2));
    $('#remain').text(Math.floor((dance_length - (dance_tick / 1000)) / 60) + "." + ("0" + Math.ceil((dance_length - (dance_tick / 1000)) % 60)).slice(-2));
    $('#progressbar').progressbar("value", dance_tick);

    if ((dance_tick / 1000) >= dance_length) {
        //timer complete
        if (!paused) { next_dance() };
    } else {
        //next iteration;
        var diff = new Date().getTime() - dance_start - dance_tick;
        if (!paused) { timer_id = setTimeout('dance_clock();', 50 - diff) };
    }

}

function stop_dance() {
    clearTimeout(timer_id);
    send_command('513|stand');
    $("#qo .dance").remove();
    $(".playing").find('.danceicon').text("directions_run");
    $(".playing").removeClass('playing').removeClass('paused');
    $(".ppn").addClass('dis');
    $('#ctl_play').text('play_circle');
    $('#np').text("...");
    $('#prog').text("-.--");
    $('#remain').text("-.--");
    $('#progressbar').progressbar("value", 0);
}

function next_dance() {
    var queue = $("#qo .dance");
    var queuelength = queue.length;
    var playing = $("#qo .playing").first();
    if ((queuelength == 1) || (repeat)) {
        play_dance(playing);
    }
    else {
        var loop = true;
        do {
            if ((playlist_pos + 1) < playlist.length) {
                playlist_pos++;
                var next = $("#qo .dance[data-i='" + playlist[playlist_pos] + "']").first();
                if (next.length > 0) {
                    loop = false;
                    play_dance(next);
                    return;
                }
            }
            else {
                loop = false;
            }
        } while (loop);

        var next;
        if (shuffle) {

            //30% rule - won't pick from the last 50% of the queue played
            var uniqueQ = queue.map(function () {
                return $(this).data('i');
            }).get();

            uniqueQ = [...new Set(uniqueQ)];

            var cutlength = Math.floor(uniqueQ.length / 2);
            var cutlist = playlist.slice(-cutlength); //contains half of recently played items still in list.


            uniqueQ = uniqueQ.filter((el) => !cutlist.includes(el));
            var nextID = uniqueQ[Math.floor(Math.random() * uniqueQ.length)];

            next = $("#qo .dance[data-i='" + nextID + "']").first();
        }
        else {
            var playingindex = queue.index(playing);

            if ((playingindex + 1) >= queuelength) {
                //Reached the end of the queue.. start over
                next = queue.eq(0);
            }
            else {
                next = queue.eq(playingindex + 1);
            }
        }
        play_dance(next);
        playlist_add(next.data('i'));
    }
}

function playlist_add(id) {
    playlist_pos++;
    playlist.push(id);
    var max = 100;
    if (playlist.length > max) {
        var over = playlist.length - max;
        playlist = playlist.slice(over, over + max);
        playlist_pos -= over;
    }
}

function play_dance(dance) {
    //parameter 'dance' will be a dance in the queue
    //set it to playing and also all the dances in the menu with the same id..
    paused = false;
    var danceinfo = dance.find(".danceinfo").data('d');

    var code = Number(danceinfo.charAt(0));
    danceinfo = danceinfo.substr(2);
    code = code | 512; //add the code that determines this is dance info.

    var splitcommands = [];
    if ((new TextEncoder('utf-8').encode(danceinfo)).length > 1024) {
        var charArray = Array.from(danceinfo)
        var i;
        var len = charArray.length;
        var tempcommand;
        var templen;
        for (i = 0; i < len; i++) {

            templen += (new TextEncoder('utf-8').encode(charArray[i])).length;
            if (templen < 1000) {
                tempcommand += charArray[i];
            }
            else {
                splitcommands.push(String(code | 8) + '|' + tempcommand);
                tempcommand = charArray[i];
            }
        }
        tempcommand.push(String(code) + '|' + tempcommand);
    }
    else {
        splitcommands.push(String(code) + '|' + danceinfo);
    }



    var a;
    var alen = splitcommands.length;
    for (a = 0; a < alen; a++) {
        $.ajax({
            type: "POST",
            url: window.location.href + "/command",
            dataType: "text",
            async: false,
            data: splitcommands[a]
        }).done(function (data) {

        }).fail(function (jqXHR, textStatus, errorThrown) {

        });
    }

    //first remove all the playing classes (both queue and menu
    $(".playing").find('.danceicon').text("directions_run");
    $(".playing").removeClass('playing').removeClass('paused');

    //Now set the queue dance to playing
    dance.addClass('playing').removeClass('paused');
    dance.find('.danceicon').text("data_usage");

    //set all the menu items to playing
    var menudances = $("#do .dance[data-i='" + dance.data('i') + "']");
    menudances.addClass('playing').removeClass('paused');
    menudances.find('.danceicon').text("data_usage");

    //Ensure the controls are enabled
    $('.ppn').removeClass('dis');
    $('#ctl_play').text('stop_circle');



    //now send the dance info to the hud and set timers.
    var dancelength = dance.find(".danceinfo").data('l');

    var min = $("#slider-range").slider("values", 0);
    var max = $("#slider-range").slider("values", 1);

    if (dancelength < min) {
        dancelength = Math.floor(Math.random() * (max - min + 1) + min);;
    }
    dance_length = dancelength;
    $('#progressbar').progressbar("option", "max", dancelength * 1000);
    $('#np').text(dance.find('.dn').text());

    dance_start = new Date().getTime();
    dance_tick = 0;
    timer_id = setTimeout('dance_clock();', 50);
}


//--------------------------------------------------------------------
//----------------------    LONG POLLING    --------------------------
//--------------------------------------------------------------------
var lpReturn = "0";
var lpWait = 0;
(function poll() {
    //$('#sch').attr('placeholder',Date.now());
    if (Date.now() > lpWait) {
        $.ajax({
            url: window.location.href + "/lp",
            type: "POST",
            dataType: "text",
            data: lpReturn,
            success: function (data) {
                lpReturn = "1";
                //Process the data
                var commands = data.split("|");
                var commandKey = commands[0];
                if (commandKey == "d") {
                    //playing dance
                }
                else if (commandKey == "p") {
                    //Avatar has sat on a poseball - This will tell us whether to display menu
                    //or notification of who is controlling dance
                    if (commands[1] == "m") { //i'm the master - show menu
                        $('#pbWait').hide();
                        displaymenu();
                    }
                    else { //display message of who is controlling dance.

                    }
                }
                else if (commandKey == "q") {
                    //Added to queue
                }
                else if ((commandKey == "r") || (commandKey == "s")) {

                    //Dance Request or Sync Request
                    if (!($('#srRequest').is(":visible"))) { //Don't show the request if the box is already shown
                        //$('#sch').attr('placeholder', "hi");
                        $('#rAv').text(commands[1]);

                        if (commandKey == "s") {
                            $('#rHdr').text('Sync Request');
                            $('#rTxt').text(' wishes to sync their dancing with you.');
                            $('#rYes').data('c', 'sy|' + commands[2]); //avID
                        }
                        else {
                            $('#rHdr').text('Dance Request');
                            $('#rTxt').text(' has requested a couple dance with you.');
                            $('#rYes').data('c', 'dc|' + commands[2]); //avID
                        }
                        $('#alarm').show();
                    }
                }
            },
            error: function (jqXHR, exception) {
                lpReturn = "0";
                if (exception != 'timeout') {
                    lpWait = Date.now() + 5000; //wait 5 seconds before next execution
                }
            },
            complete: poll,
            timeout: 20000
        });
    }
    else {
        setTimeout('poll();', 5000);
    }
})();

function send_command(command) {
    $.ajax({
        type: "POST",
        url: window.location.href + "/command",
        dataType: "text",
        data: command

    }).done(function (data) {
        return (data);

    }).fail(function (jqXHR, textStatus, errorThrown) {
        return "failed";
    });
}
