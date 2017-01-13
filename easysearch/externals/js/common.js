function isset()
{
  var a = arguments;
  var l = a.length;
  var i = 0;

  if( l == 0 ) {
    throw new Error('Empty isset');
  }

  while( i != l ) {
    if( typeof(a[i])=='undefined' || a[i]===null ) {
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

function addZero(x,n) {
  while (x.toString().length < n) {
      x = "0" + x;
  }
  return x;
}

function checkboxToggle(checkbox, el)
{
  if( checkbox.checked ) $(el).show();
  else $(el).hide();
}