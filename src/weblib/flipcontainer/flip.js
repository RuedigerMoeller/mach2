
// <div data-bind: "flip: fipBool">
//   <div>
//     <div class="front"> </div>
//     <div class="back"> </div>
//   </fiv>
// </div>
ko.bindingHandlers.flip = {

    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        element.classList.add("flip-container");
        element.children[0].classList.add("flipper");
    },

    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        console.log("flip update"+valueAccessor());
        if ( valueAccessor() ) {
            element.classList.add("flip-container-flip");
            setTimeout( function() {
                element.children[0].children[0].visibility = "hidden";
                element.children[0].children[1].visibility = "visible";
            }, 600);
        } else {
//            setTimeout( function() {
                element.children[0].children[1].visibility = "hidden";
                element.children[0].children[0].visibility = "visible";
//            }, 600);
            element.classList.remove("flip-container-flip");
        }
    }

};
