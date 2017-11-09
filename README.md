# image-square-resizer
js-utility for crop and resize image

## Build It Yourself/Run the Demos
Build: `npm install && npm run build`

Demos: `npm install && npm start`

![alt text](https://user-images.githubusercontent.com/16912141/32625724-183649a2-c59e-11e7-8845-9bc36125f56a.gif)

## imager square resizer  
Steps:

* make it square (if width &gt; heigh, crop from left and right sides proportionally)
* resize if width/height &gt; N px

## Init

```js
import imageSqResizer from './image-square-resizer.js'

let resizer1 = new imageSqResizer(
    'image-input',
    300,
    null 
);

let resizer2 = new imageSqResizer(
    'image-input',
    50,
    (dataUrl) => 
        document.getElementById('image-output').src = dataUrl;
);

let resizer3 = new imageSqResizer(
    'image-input',
    50
);
```

## Get blob

```js
let formData = new FormData();
formData.append('files[0]', resizer1.blob);
```

## Get dataUrl

```js
document.getElementById('image-output').src = resizer2.dataUrl;
```

## View Page

[View Page](https://diyazy.github.io/image-square-resizer/)