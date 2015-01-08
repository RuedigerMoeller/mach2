ko.components.register('ns-filterstrip', {
    template:  { element: "filterstrip" },
    viewModel: {
        createViewModel: function(params,componentInfo) {
            return new FilterStripModel(params,componentInfo);
        }
    }
});

function FilterStripModel(params, compInfo) {
    var self = this;
    self.filter = params.filter;
    self.values = [];
    self.label = params.label ? params.label : "Go!"; //"&#9654";
    self.btnClass = params.btnClass ? params.btnClass : 'btn btn-default';

    $.each(self.filter, function(i,fi) {
        self.values.push(fi.value);
        return true;
    });
    self.doFilter = function() {
        params.click.apply(self,[]);
    };

    self.keyPressed = function( data, event ) {
        if ( event.keyCode == 13 ) {
            self.doFilter();
            return false;
        }
        return true;
    }
}