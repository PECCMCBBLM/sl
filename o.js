var menuobject,dance_start,dance_tick,dance_length,timer_id,shuffle=0,repeat=0,playlist=[],playlist_pos=-1,paused=!1,oSettings=[],oFavourites=[];function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:"en",layout:google.translate.TranslateElement.InlineLayout.SIMPLE,autoDisplay:!1},"google_translate_element")}function gettimes(e,a){return e==a?"Exactly<br>"+stringifytime(e):"Between "+stringifytime(e)+"<br>and "+stringifytime(a)}function stringifytime(e){var a=Math.floor(e/60);return a>0?(a+=a>1?" minutes ":" minute ",0==(e%=60)?e="":e+=" seconds"):(e+=" seconds",a=""),a+e}function dance_mode(e){}function displaymenu(){$(".tablinks[data-t='dances']").removeClass("x").addClass("selected").siblings().removeClass("selected"),$(".tablinks[data-t='queue']").removeClass("x"),$("#dances").removeClass("x").siblings().addClass("x"),$("#qo .dance").remove();var e=$("#cdShow").data("c");for(var a in $("#do").html("<li class='m notranslate' id='fav' style='display:none;'><div class='menu'><span>My Favourites</span><span class='right material-icons'>keyboard_arrow_down</span></div><ol></ol></li>"),menuobject){var t=menuobject[a];t.n==e&&$("#do").append(json_tree(t))}for(var n in $("#fav .dance").remove(),oFavourites)$("#fav ol").first().append($(".dance[data-i='"+oFavourites[n]+"']").first().clone(!0)),$(".dance[data-i='"+oFavourites[n]+"'] .atf").text("favorite");$("#fav ol").first().children().length>0?$("#fav").show():$("#fav").hide(),$("#do").off(),$("#do").removeClass().addClass("cdo"),$("#do").accordion()}function json_tree(e){var a="";if(e.hasOwnProperty("p")){var t,n,i=e.n,s="";e.hasOwnProperty("o")&&(i+=" "+e.o,s="<div>("+e.o+")</div>"),t=e.hasOwnProperty("d")?"d"+e.d:"i"+e.i,n=e.hasOwnProperty("g")?e.g:0,a="<li class='dance notranslate' data-i='"+t+"' data-s=' "+i+"'><div class='popup'><span class = 'right material-icons notranslate'>menu</span><div class='dropdown'><div class ='infomenu'><span class = 'material-icons atq notranslate'>playlist_add</span><span class='material-icons rfq notranslate'>delete_sweep</span><span class = 'material-icons atf notranslate'>favorite_border</span></div><div class='infotext notranslate'><a href='secondlife:///app/agent/"+e.l+"/about'>"+e.m+"</a>",e.m!=e.s&&(a+="<br/><div>"+e.s+"</div>"),a+=s+"</div></div></div><span class='danceinfo' data-d='"+e.p+"' data-l='"+n+"'><span class='danceicon material-icons notranslate'>directions_run</span><span class='dn'>"+e.n+"</span></span></li>"}else{if(e.hasOwnProperty("m"))for(var o in e.m){var l=e.m[o];a+="<li class='m notranslate'><div class='menu'><span>"+l.n+"</span><span class='right material-icons notranslate'>keyboard_arrow_down</span></div><ol>"+json_tree(l)+"</ol></li>"}if(e.hasOwnProperty("d"))for(var r in e.d){a+=json_tree(e.d[r])}}return a}function dance_clock(){if(dance_tick+=50,$("#prog").text(Math.floor(dance_tick/6e4)+"."+("0"+Math.floor(dance_tick%6e4/1e3)).slice(-2)),$("#remain").text(Math.floor((dance_length-dance_tick/1e3)/60)+"."+("0"+Math.ceil((dance_length-dance_tick/1e3)%60)).slice(-2)),$("#progressbar").progressbar("value",dance_tick),dance_tick/1e3>=dance_length)paused||next_dance();else{var e=(new Date).getTime()-dance_start-dance_tick;paused||(timer_id=setTimeout("dance_clock();",50-e))}}function stop_dance(){clearTimeout(timer_id),send_command("513|stand"),$("#qo .dance").remove(),$(".playing").find(".danceicon").text("directions_run"),$(".playing").removeClass("playing").removeClass("paused"),$(".ppn").addClass("dis"),$("#ctl_play").text("play_circle"),$("#np").text("..."),$("#prog").text("-.--"),$("#remain").text("-.--"),$("#progressbar").progressbar("value",0)}function next_dance(){var e=$("#qo .dance"),a=e.length,t=$("#qo .playing").first();if(1==a||repeat)play_dance(t);else{var n=!0;do{var i;if(playlist_pos+1<playlist.length){if(playlist_pos++,(i=$("#qo .dance[data-i='"+playlist[playlist_pos]+"']").first()).length>0)return n=!1,void play_dance(i)}else n=!1}while(n);if(shuffle){var s=e.map((function(){return $(this).data("i")})).get();s=[...new Set(s)];var o=Math.floor(s.length/2),l=playlist.slice(-o),r=(s=s.filter((e=>!l.includes(e))))[Math.floor(Math.random()*s.length)];i=$("#qo .dance[data-i='"+r+"']").first()}else{var d=e.index(t);i=d+1>=a?e.eq(0):e.eq(d+1)}play_dance(i),playlist_add(i.data("i"))}}function playlist_add(e){playlist_pos++,playlist.push(e);if(playlist.length>100){var a=playlist.length-100;playlist=playlist.slice(a,a+100),playlist_pos-=a}}function play_dance(e){paused=!1;var a=e.find(".danceinfo").data("d"),t=Number(a.charAt(0));a=a.substr(2),t|=512;var n,i=[];if(new TextEncoder("utf-8").encode(a).length>1024){var s,o,l,r=Array.from(a),d=r.length;for(s=0;s<d;s++)(l+=new TextEncoder("utf-8").encode(r[s]).length)<1e3?o+=r[s]:(i.push(String(8|t)+"|"+o),o=r[s]);o.push(String(t)+"|"+o)}else i.push(String(t)+"|"+a);var c=i.length;for(n=0;n<c;n++)$.ajax({type:"POST",url:window.location.href+"/command",dataType:"text",async:!1,data:i[n]}).done((function(e){})).fail((function(e,a,t){}));$(".playing").find(".danceicon").text("directions_run"),$(".playing").removeClass("playing").removeClass("paused"),e.addClass("playing").removeClass("paused"),e.find(".danceicon").text("data_usage");var p=$("#do .dance[data-i='"+e.data("i")+"']");p.addClass("playing").removeClass("paused"),p.find(".danceicon").text("data_usage"),$(".ppn").removeClass("dis"),$("#ctl_play").text("stop_circle");var f=e.find(".danceinfo").data("l"),u=$("#slider-range").slider("values",0),h=$("#slider-range").slider("values",1);f<u&&(f=Math.floor(Math.random()*(h-u+1)+u)),dance_length=f,$("#progressbar").progressbar("option","max",1e3*f),$("#np").text(e.find(".dn").text()),dance_start=(new Date).getTime(),dance_tick=0,timer_id=setTimeout("dance_clock();",50)}$.fn.extend({accordion:function(e){var a=$.extend({speed:300},e);$(this);$(".menu").on("click",(function(){var e=$(this).siblings("ol:first");if(e.is(":visible"))$(this).find(".material-icons").html("keyboard_arrow_down"),e.slideUp(a.speed);else{$(this).find(".material-icons").html("keyboard_arrow_up"),e.slideDown(a.speed);var t=$(this).parents(".tabcontent").first();t.animate({scrollTop:t.scrollTop()+$(this).position().top-110})}return!1})),$(".danceinfo").on("click",(function(){var e;if($(this).parents("#qo").length)e=$(this).parent();else{e=$(this).parent().clone(!0);var a=$("#qo .dance[data-i='"+e.data("i")+"']"),t=$("#qo .playing").first();if(0!=a.length)if(t.data("i")==e.data("i"))e=t;else{var n=t.nextAll(".dance[data-i='"+e.data("i")+"']").first();if(n.length)e=n;else{var i=t.prevAll(".dance[data-i='"+e.data("i")+"']").first();e=i}}else 0!=t.length?t.after(e):$("#qo").prepend(e)}return play_dance(e),playlist=playlist.slice(0,playlist_pos+1),playlist_add(e.data("i")),!1})),$(".atq").on("click",(function(){var e=$(this).parents("li").first().clone(!0);return e.removeClass("playing paused"),e.find(".danceicon").text("directions_run"),$("#qo").append(e),!1})),$(".atf").on("click",(function(){var e=$(this).parents("li").first(),a=e.data("i");"favorite_border"==$(this).text()?($(".cdo .dance[data-i='"+a+"'] .atf").text("favorite"),$(".qo .dance[data-i='"+a+"'] .atf").text("favorite"),$("#fav .dance[data-i='"+a+"']").length||($("#fav ol").first().append(e.clone(!0)),$("#fav").show(),~oFavourites.indexOf(a)||oFavourites.push(a))):($("#fav .dance[data-i='"+a+"']").remove(),$(".cdo .dance[data-i='"+a+"'] .atf").text("favorite_border"),$(".qo .dance[data-i='"+a+"'] .atf").text("favorite_border"),oFavourites=oFavourites.filter((e=>e!==a)),0==$("#fav ol").first().children().length&&$("#fav").hide())})),$(".rfq").on("click",(function(){return $(this).parents("li").first().remove(),!1}))}}),$((function(){$("#qo").sortable(),$("#slider-range").slider({range:!0,min:30,max:1800,step:5,values:[30,30],slide:function(e,a){$("#amount").html(gettimes(a.values[0],a.values[1]))}}),$("#amount").html(gettimes($("#slider-range").slider("values",0),$("#slider-range").slider("values",1)))})),$((function(){$("#slider-height").slider({min:-.5,max:.5,step:.05,value:0,slide:function(e,a){$("#avheight").html(a.value+"m")}}),$("#avheight").html($("#slider-height").slider("value")+"m"),$("#progressbar").progressbar({value:0})})),$((function(){$("#minmax").on("click",(function(){var e="down";$(this).hasClass("fa-arrow-alt-circle-up")&&(e="up"),$.ajax({type:"GET",url:window.location.href+"/"+e}).done((function(e){$("#minmax").removeClass("fa-arrow-alt-circle-up fa-arrow-alt-circle-down").addClass("fa-arrow-alt-circle-"+e)})).fail((function(e,a,t){}))}))})),$(document).ready((function(){send_command("1|ready"),$(".material-icons").addClass("notranslate"),$("#pbHdr").html("Please sit on the ball when it reaches you."),$(".i1").html("Ask if you can synchronize your dances with this person. If they accept, they will control your dancing."),$(".i2").html("Click a name to invite this person to dance."),$(".i3").html("Ask selected person to dance a couple dance with you."),$(".i4").html("Click a name to remove this person from the dance machine."),$(".i5").html("Sets how often dances will change when dancing from the queue, or when dancing random dances."),$(".i6").html("If you have a small or large avatar, use this control to adjust your position above the floor when sat on dance poseballs. Note this setting will persist across the grid.<br />To adjust your height temporarily for a particular dance, please use <b>Page-Up/Page-Down</b> buttons whilst seated."),$(".i7").html("If enabled, hosts can control your single dances, allowing them to lead a group synchronised dance."),$(".i8").html("Take this action when someone asks to sync their dancing with you."),$(".i9").html("Take this action when someone asks to dance with you."),$(".i10").html("Your favourite dances are synchronised across the grid. Favourites you select whilst using this Omnio will appear as favourites on all other Omnios in world."),$(".i11").html("To configure the Omnio, click the button above, and use the drop down menu when it appears. "),$(".tablinks").on("click",(function(){if("host"==$(this).attr("data-t")){var e=!$("body").data("h");$("body").attr("data-h",e),$("body").data("h",e),1==$("body").data("h")?$(this).css("color","#5f5"):$(this).css("color","#fff")}else $(this).addClass("selected").siblings().removeClass("selected"),$("#"+$(this).attr("data-t")).removeClass("x").siblings().addClass("x")})),$(".dc-btn").on("click",(function(){var e=$("#cdShow").data("c"),a=$(this).data("c");if(e!=a){$("#cdShow").data("c",a),0!=e&&stop_dance();var t=$(this).find(">:first-child");t.css({position:"fixed",top:93+167*Math.floor((a-1)/2)+"px",left:128+(a-1)%2*175+"px"}),t.animate({position:"absolute",top:"8px",left:"15px",fontSize:"25px"},{duration:500,complete:function(){$("#cdShow i").html(t.html()),t.css({position:"absolute",top:"10px",left:"45px","font-size":"55px"}),1==a||3==a||1==$("body").data("h")?displaymenu():(send_command(2==a?"2080|2|MF":"2080|1|-"),$("#pbWait").show())}})}else displaymenu()})),$("#rCancel").on("click",(function(){send_command("2112|-1"),$("#pbWait").hide(),showDC()})),$("#alarm").on("click",(function(){"keyboard_arrow_down"==$("#ctl_maxmin").text()?$.ajax({type:"POST",url:window.location.href+"/maxmin",dataType:"text",data:"keyboard_arrow_down"}).done((function(e){$("#ctl_maxmin").text(e),$("#srRequest").show(),$("#alarm").hide()})).fail((function(e,a,t){return"failed"})):($("#srRequest").show(),$("#alarm").hide())})),$("#rYes").on("click",(function(){send_command($("#rYes").data("c")),$("#srRequest").hide()})),$("#rNo").on("click",(function(){$("#srRequest").hide()})),$("#ctl_stop").on("click",(function(){var e='[{"DFV":"'+oFavourites.toString()+'"},{"DMU":"',a=$("#slider-range").slider("values",0),t=$("#slider-range").slider("values",1),n=$("#slider-height").slider("value");180==a&&300==t&&0==n||(e+=a+","+t+","+n),e+='"}]',$.ajax({type:"PUT",url:encodeURI("http://90.255.244.239:52974/api/setting/setsettings/051bc4c1-5188-4002-985f-e8e0e77da127/Actingill Igaly/-1"),dataType:"json",data:e,fail:function(e,a,t){alert(t)},complete:send_command("stop")})})),$("#ctl_shuffle").on("click",(function(){shuffle=shuffle?0:1,playlist=playlist.slice(0,playlist_pos+1),$("#ctl_shuffle").css("color",["#fff","#9D9AFF"][shuffle])})),$("#ctl_prev").on("click",(function(){if(!$(this).parent().hasClass("dis")){var e=!0;do{if(playlist_pos>0){playlist_pos--;var a=$("#qo .dance[data-i='"+playlist[playlist_pos]+"']").first();a.length>0&&(e=!1,play_dance(a))}else e=!1}while(e)}})),$("#ctl_play").on("click",(function(){$(this).parent().hasClass("dis")||("play_circle"==$(this).text()?play_dance($("#qo").find(".paused").first()):(paused=!0,$(".cdo .playing").addClass("paused").find(".danceicon").text("pause"),$(this).text("play_circle"),send_command("513|stand")))})),$("#ctl_next").on("click",(function(){if(!$(this).parent().hasClass("dis")){var e=repeat;repeat=!1,next_dance(),repeat=e}})),$("#ctl_repeat").on("click",(function(){repeat=repeat?0:1,$("#ctl_repeat").text(["repeat","repeat_one"][repeat])})),$("#ctl_maxmin").on("click",(function(){var e=$(this);$.ajax({type:"POST",url:window.location.href+"/maxmin",dataType:"text",data:e.text()}).done((function(a){e.text(a)})).fail((function(e,a,t){return"failed"}))})),$("#sch").keyup((function(){var e=" "+$(this).val();""==e.trim()?($("#do .dance").slideDown(0),$("#do .menu").slideDown(0),$("#do .fa-caret-down").parent().siblings("ol").slideUp(0),$("#do").slideDown(0)):($("#do .menu").slideUp(0),$("#do .dance:not([data-s*='"+e+"' i])").slideUp(0),$("#do .dance[data-s*='"+e+"' i]").slideDown(0).parents().slideDown(0).siblings(".menu").slideDown(0))})),$("#google_translate_element").on("click",(function(){$("iframe").contents().find(".goog-te-menu2-item div, .goog-te-menu2-item:link div, .goog-te-menu2-item:visited div, .goog-te-menu2-item:active div, .goog-te-menu2 *").css({color:"#ddd","background-color":"#191919","font-size":"20px"}),$("iframe").contents().find(".goog-te-menu2-item-selected").css("display","none"),$("iframe").contents().find(".goog-te-menu2").css("padding","10px"),$("iframe").contents().find(".goog-te-menu2-item div").css("padding","3px"),$("iframe").contents().find(".goog-te-menu2-item div").hover((function(){$(this).find("span.text").css("color","white")}),(function(){$(this).find("span.text").css("color","#ddd")})),$("iframe").contents().find(".goog-te-menu2").css("border","none"),$(".goog-te-menu-frame").css("box-shadow","0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 2px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.3)"),$(".goog-te-menu-frame").css({top:"55px",left:"50px",width:"400px",height:"350px","background-color":"#191919",border:"none","padding-right":"10px"}),$("iframe").contents().find(".goog-te-menu2").css({"background-color":"#191919",overflow:"scroll","max-width":"100%",height:"330px"})})),function e(a,t){$.ajax({type:"GET",url:a,dataType:"text"}).done((function(a){if("•"==a.charAt(0))t+=a.substr(1),menuobject=JSON.parse(t);else{var n=a.indexOf("•");t+=a.substr(n+1),e(a.substr(0,n),t)}})).fail((function(e,a,t){}))}(firsturl,""),$.ajax({type:"PUT",url:encodeURI("http://90.255.244.239:52974/api/setting/getsettings/051bc4c1-5188-4002-985f-e8e0e77da127/"),dataType:"json",data:'[{"DFV":""},{"DMU":""}]'}).done((function(e){!function(e){oFavourites=(oFavourites=e.find((e=>"DFV"==e.key)).value.split(",")).filter((e=>e)),3!=(oSettings=(oSettings=e.find((e=>"DMU"==e.key)).value.split(",")).filter((e=>e))).length&&(oSettings=[180,300,0]);if($("#slider-range").slider("option","values",[oSettings[0],oSettings[1]]),$("#amount").html(gettimes(oSettings[0],oSettings[1])),$("#slider-height").slider("option","value",oSettings[2]),$("#avheight").html(oSettings[2]+"m"),-1==$("#cdShow").data("c")){for(var a in $("#fav .dance").remove(),oFavourites)$("#fav ol").first().append($(".dance[data-i='"+oFavourites[a]+"']").first().clone(!0)),$(".dance[data-i='"+oFavourites[a]+"'] .atf").text("favorite");$("#fav ol").first().children().length>0?$("#fav").show():$("#fav").hide()}}(JSON.parse(e))})).fail((function(e,a){}))}));var lpReturn="0",lpWait=0;function send_command(e){$.ajax({type:"POST",url:window.location.href+"/command",dataType:"text",data:e}).done((function(e){return e})).fail((function(e,a,t){return"failed"}))}!function e(){Date.now()>lpWait?$.ajax({url:window.location.href+"/lp",type:"POST",dataType:"text",data:lpReturn,success:function(e){lpReturn="1";var a=e.split("|"),t=a[0];"d"==t||("p"==t?"m"==a[1]&&($("#pbWait").hide(),displaymenu()):"q"==t||"r"!=t&&"s"!=t||$("#srRequest").is(":visible")||($("#rAv").text(a[1]),"s"==t?($("#rHdr").text("Sync Request"),$("#rTxt").text(" wishes to sync their dancing with you."),$("#rYes").data("c","sy|"+a[2])):($("#rHdr").text("Dance Request"),$("#rTxt").text(" has requested a couple dance with you."),$("#rYes").data("c","dc|"+a[2])),$("#alarm").show()))},error:function(e,a){lpReturn="0","timeout"!=a&&(lpWait=Date.now()+5e3)},complete:e,timeout:2e4}):setTimeout("poll();",5e3)}();