"use strict";

function isset()
{
  var a = arguments;
  var l = a.length;
  var i = 0;

  if( l == 0 ) return false;

  while( i != l ) {
    if( typeof(a[i]) == 'undefined' || a[i] === null ) {
      return false;
    } else {
      i++;
    }
  }
  return true;
}

function empty(mixed_var)
{
  var key;

  if( mixed_var === ""
      || mixed_var === 0
      || mixed_var === "0"
      || mixed_var === null
      || mixed_var === false
      || mixed_var === undefined
      || trim(mixed_var) == ""
  ){
    return true;
  }

  if( typeof mixed_var == 'object' ) {
    for( key in mixed_var ) {
      if( typeof mixed_var[key] !== 'function' ) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function trim(str, charlist)
{
  var whitespace, l = 0, i = 0;
  str += '';

  if( !charlist ) {
    whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
  } else {
    charlist += '';
    whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
  }

  l = str.length;
  for( i = 0; i < l; i++ ) {
    if( whitespace.indexOf(str.charAt(i)) === -1 ) {
      str = str.substring(i);
      break;
    }
  }

  l = str.length;
  for( i = l - 1; i >= 0; i-- ) {
    if( whitespace.indexOf(str.charAt(i)) === -1 ) {
      str = str.substring(0, i + 1);
      break;
    }
  }

  return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}

function addZero(x, n)
{
  while( x.toString().length < n ) {
    x = "0" + x;
  }
  return x;
}

function getTimedId()
{
  var d = new Date();
  var h = addZero(d.getHours(), 2);
  var m = addZero(d.getMinutes(), 2);
  var s = addZero(d.getSeconds(), 2);
  var ms = addZero(d.getMilliseconds(), 3);
  return h + "_" + m + "_" + s + "_" + ms;
}

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initSymbolCounter( $holder, max )
{
  function _initSymbolCounter()
  {
    var text = $holder.val();
    var residue = (text.length < max) ? max - text.length : 0;

    $holder.parent().find('.residue-symbols').text(residue);
    if( text.length > max ) return false;
  }

  _initSymbolCounter();
  $holder.keyup(_initSymbolCounter);
}

function checkboxToggle(checkbox, el)
{
  if( checkbox.checked ) $(el).show();
  else $(el).hide();
}

function resizeMainMenu()
{
  var $tablist = $('.tab_list_dropdown');
  var $vert = $('.next-tab-disclosure-container .tab_list_vertical');

  if( $tablist.length ) {
    var $vertTabs = $vert.find('a.next-tab');
    $vertTabs.each(function(i, el){
      $('li.next-tab-disclosure-container').before('<li>' + el.outerHTML + '</li>');
    });
    $vert.empty();
    $tablist.removeClass('tab_list_full');

    var $allA        = $tablist.find('a.next-tab').sort(sortTab);
    var $activeA     = $allA.filter('.active');
    var finalList    = [];
    var finalSubList = [];
    var moreWidth    = 80;
    var width        = 0;
    var rightMargin  = 16;
    var totalWidth   = $tablist.width() - rightMargin;

    $allA.each(function(i, el){ width += $(el).parent('li').outerWidth(); });

    if( width > totalWidth ) {
      //has droplist
      var actualWidth = totalWidth - moreWidth;
      var inactiveWidth = actualWidth - ( $activeA.length ? $activeA.parent('li').outerWidth() : 0 );

      width = 0;
      var activeAdded = false;
      var overflow    = false;

      $allA.each(function(i, el) {
        if( !overflow ) {
          if( $(el).hasClass('active') ) {
            activeAdded = true;
            inactiveWidth = actualWidth;
          }

          width += $(el).parent('li').outerWidth();
          if( width < inactiveWidth ) {
            finalList.push(el);
          } else {
            finalSubList.push(el);
            overflow = true;
          }
        } else {
          if( $(el).hasClass('active') ) return true;
          finalSubList.push(el);
        }
      });
      if( overflow && !activeAdded ) finalList.push($activeA[0]);

    } else {
      //hasn't droplist
      finalList = $allA;
    }

    $tablist.find('li:not(.next-tab-disclosure-container)').remove();
    $.each(finalList, function(i, el){
      $('li.next-tab-disclosure-container').before('<li>' + el.outerHTML + '</li>');
    });

    if( finalSubList.length ) {
      $.each(finalSubList, function(i, el) {
        $vert.append('<li>' + el.outerHTML + '</li>');
      });
      $tablist.addClass('tab_list_full');
    }

  }
}

function sortTab(a, b)
{
  return a.getAttribute('tabindex') - b.getAttribute('tabindex');
}