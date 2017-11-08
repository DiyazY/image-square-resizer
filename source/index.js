import imageSqResizer from './image-square-resizer.js'
import css from './style.css'

let resizer = new imageSqResizer(
    'image-input',   // &lt;input type="file" id="image-input"&gt; ('image-input')
    300,             // edge of a square in px (300)
    null             // (dataUrl) => document.getElementById('image-output').src = dataUrl;
);

function showResult(){   
    if(resizer.blob){
        let image = document.createElement('img');
        image.src = URL.createObjectURL(resizer.blob);
        document.body.appendChild(image);
    }   
}

document.getElementById('blob-result').addEventListener('click',showResult,false);

document.getElementById('code').innerHTML = `
            let resizer = new imageSqResizer(
                'image-input',   // &lt;input type="file" id="image-input"&gt; ('image-input')
                300,             // edge of a square in px (300)
                null             // (dataUrl) => document.getElementById('image-output').src = dataUrl;
            );

            function showResult(){   
                if(resizer.blob){
                    let image = document.createElement('img');
                    image.src = URL.createObjectURL(resizer.blob);
                    document.body.appendChild(image);
                }   
            }

            document.getElementById('blob-result').addEventListener('click',showResult,false);

`;