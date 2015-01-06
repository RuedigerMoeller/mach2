function UploadModel(params,compInfo) {
    var self = this;

    self.fileElem = $(compInfo.element).find('#files');
    self.imageDiv = $(compInfo.element).find('.nsupload-container')[0];
    self.errorMsg = ko.observable("");
    self.maxSize = params.maxSize ? params.maxSize : 100000;

    self.onLoadEnd = function(file, data) {
        if ( file.size > self.maxSize )
            self.errorMsg("File too large: "+(file.size/1000).toFixed(0)+"kB,<br> allowed:"+(self.maxSize/1000).toFixed(0)+"kB");
        else {
            var objectURL = URL.createObjectURL(file);
            console.log("upload "+objectURL);
            self.image(objectURL);
            if ( params.onUpload ) {
                self.errorMsg("uploading ..");
                params.onUpload.apply(null,[ file, data, self.errorMsg ]);
            }
        }
    };

    self.fileProps = {
        onLoaded: self.onLoadEnd,
        //onProgress: onProgress,
        //onError: onError,
        fileFilter: 'image.*',
        readAs: 'binary'
    };

    self.width  = '128px';
    self.height = '128px';

    if ( ko.isObservable(params.image))
        self.image = ko.observable(params.image());
    else
        self.image = ko.observable(params.image);
}

ko.components.register('ns-upload', {
    viewModel: {
        createViewModel: function(params, componentInfo) {
            // - 'params' is an object whose key/value pairs are the parameters
            //   passed from the component binding or custom element
            // - 'componentInfo.element' is the element the component is being
            //   injected into. When createViewModel is called, the template has
            //   already been injected into this element, but isn't yet bound.

            // Return the desired view model instance, e.g.:
            return new UploadModel(params,componentInfo);
        }
    },
    template: { element: "nsupload" }
});

