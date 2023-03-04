/*
 * Autocomplete (Legacy Code)
 *
 * https://www.w3schools.com/howto/howto_js_autocomplete.asp
 * the autocomplete function takes two arguments,
 * the text field element and an array of possible autocompleted values
 *
 * modified with dependencies in hr-script.js  ¯\_(ツ)_/¯
 */


function autocomplete( inp, arr ) {
  var currentFocus;

  // execute a function when someone writes in the text field
  inp.addEventListener( "input", function( e ) {
    // a   the dropdown div
    // b   the inner dropdown div
    // i   the index of the array loop
    // val the input
    var a, b, i, val = this.value;

    // close any already open lists of autocompleted values
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;

    // create a DIV element that will contain the items (values)
    a = document.createElement("DIV");
    a.setAttribute( "id", this.id + "autocomplete-list" );
    a.setAttribute( "class", "autocomplete-items" );

    // append the DIV element as a child of the autocomplete container
    this.parentNode.appendChild(a);

    // for each item in the array...
    for( i = 0; i < arr.length; i++ ) {

      // check if the item contains the same letters as the text field value
      if( arr[i]["displayName"].toUpperCase().includes( val.toUpperCase() ) )  {
        if( arr[i]["pid"] == "") return;

        // create a DIV element for each matching element
        b = document.createElement("DIV");

        // make the matching letters bold
        b.innerHTML = "<strong>" + arr[i]["displayName"].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i]["displayName"].substr(val.length);
        b.innerHTML += "&nbsp;&middot;&nbsp;<span class='job-title'>" + arr[i]["jobTitle"] + "</span>"

        // insert a input field that will hold the current array item's value
        b.innerHTML += "<input type='hidden' value='" + arr[i]["pid"] + "'>";

        // execute a function when someone clicks on the item value (DIV element)
        b.addEventListener( "click", function(e) {

          // insert the value for the autocomplete text field
          inp.value = this.getElementsByTagName( "input" )[0].value;

          // close the list of autocompleted values
          // (or any other open lists of autocompleted values)
          closeAllLists();

          window.location.replace( `hr-tree.html?p=${inp.value}` ) ;
        });
        a.appendChild( b );
      }
    }
  });

  inp.addEventListener( "keydown", function( e ) {
    var x = document.getElementById( this.id + "autocomplete-list" );
    if( x ) x = x.getElementsByTagName( "div" );

    if( e.keyCode == 40 ) {           // ARROW DOWN
      currentFocus++;
      addActive( x );
    } else if ( e.keyCode == 38 ) {   // ARROW UP
      currentFocus--;
      addActive( x );
    } else if( e.keyCode == 13 ) {    // ENTER
      e.preventDefault();
      if( currentFocus > -1 ) {
        if( x ) x[currentFocus].click();
      }
    }
  });

  function addActive( x ) {
    if( !x ) return false;
    removeActive( x );
    if( currentFocus >= x.length ) currentFocus = 0;
    if( currentFocus < 0 ) currentFocus = ( x.length - 1 );
    x[currentFocus].classList.add( "autocomplete-active" );
  }

  function removeActive(x) {
    for( var i = 0; i < x.length; i++ ) {
      x[i].classList.remove( "autocomplete-active" );
    }
  }

  function closeAllLists( elmnt ) {
    // close all autocomplete lists in the document
    // except the one passed as an argument
    var x = document.getElementsByClassName( "autocomplete-items" );
    for( var i = 0; i < x.length; i++ ) {
      if( elmnt != x[i] && elmnt != inp ) {
        x[i].parentNode.removeChild( x[i] );
      }
    }
  }

  document.addEventListener( "click", function( e ) {
    closeAllLists( e.target );
  });
}
