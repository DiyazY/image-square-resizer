// Usage:
//    let firstArg = 'selectedLogoFile';//<input type="file" id="selectedLogoFile">
//    let secondArg = 'selectedLogoFileImage';//<img id="selectedLogoFileImage"/>
//    let thirdArg = 300;//300px size
//    this.image = new imageResizer(firstArg, secondArg, thirdArg);
//
// When uploaded file:
//    var formData = new FormData();
//    formData.append('files[0]', this.image.getBlob());


export default class imageSqResizer {

    constructor(uploaderId, imageId, size) {
        this.imageId = imageId;
        this.size = size;
        this._blob = null;

        this.setBlob = this.setBlob.bind(this);
        this.getBlob = this.getBlob.bind(this);
        this.resized = this.resized.bind(this);

        let upload = document.getElementById(uploaderId);

        upload.addEventListener('change', () => {
            Array.from(upload.files).forEach(file => {
                let imageType = /image.*/;
                if (!file.type.match(imageType)) {
                    console.warn('not image type');
                    return true;
                }
                this.resized(file, this.size);
            });
        });
    }

    //get blob object
    getBlob() {
        return this._blob;
    }
    //set blob object
    setBlob(blob) {
        this._blob = blob;
    }

    // resize
    resized(file, maxWidth) {

        let reader = new FileReader();
        reader.onload = () => {

            let tempImg = new Image();
            tempImg.src = reader.result;

            tempImg.onload = () => {
                // calc size
                let tempW = tempImg.width;
                let tempH = tempImg.height;
                let imageId = this.imageId || false;
                let min = tempW >= tempH ? tempH : tempW;
                maxWidth = maxWidth || min;
                
                if (tempH <= maxWidth && tempW <= maxWidth) {
                    let canvas = document.createElement('canvas');
                    canvas.width = tempW;
                    canvas.height = tempH;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(tempImg, 0, 0);
                    document.getElementById(imageId).src = canvas.toDataURL();
                }


                let startY = 0;
                if (min !== tempH) {
                    startY = Math.round(tempH / 2 - (min / 2));
                }
                let startX = 0;
                if (min !== tempW) {
                    startX = Math.round(tempW / 2 - (min / 2));
                }

                let setBlob = this.setBlob;

                let finalImg = new Image();
                finalImg.src = this.getImagePortion(tempImg, min, min, startX, startY, 1);

                finalImg.onload = function () {
                    let canvas = document.createElement('canvas');
                    canvas.width = maxWidth;
                    canvas.height = maxWidth;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(this, 0, 0, maxWidth, maxWidth);
                    if (imageId) {
                        document.getElementById(imageId).src = canvas.toDataURL();
                    }
                    canvas.toBlob((blob) => {
                        setBlob(blob);
                    });
                }
            }
        }
        reader.readAsDataURL(file);
    }

    //image crop
    getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio) {
        let tnCanvas = document.createElement('canvas');
        let tnCanvasContext = tnCanvas.getContext('2d');
        tnCanvas.width = newWidth; tnCanvas.height = newHeight;

        let bufferCanvas = document.createElement('canvas');
        let bufferContext = bufferCanvas.getContext('2d');
        bufferCanvas.width = imgObj.width;
        bufferCanvas.height = imgObj.height;
        bufferContext.drawImage(imgObj, 0, 0);

        tnCanvasContext.drawImage(bufferCanvas, startX, startY, newWidth * ratio, newHeight * ratio, 0, 0, newWidth, newHeight);
        return tnCanvas.toDataURL();
    }
}




