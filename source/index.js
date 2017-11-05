import imageSqResizer from './image-square-resizer.js'
import css from './style.css'

let resizer = new imageSqResizer(
    'image-input',  //&lt;input type="file" id="image-input"&gt; ('image-input')
    '',             //&lt;img id="image-output"&gt; ('')
    300             //edge of a square in px (300)
);

function showResult(){
    let image = document.createElement('img');
    let url = URL.createObjectURL(resizer.getBlob());
    image.src = url;
    document.body.appendChild(image);
}

document.getElementById('blob-result').addEventListener('click',showResult,false);

document.getElementById('code').innerHTML = `
            let resizer = new imageSqResizer(

                'image-input',  //&lt;input type="file" id="image-input"&gt; ('image-input')
                '',             //&lt;img id="image-output"&gt; ('')
                300             //edge of a square in px (300)
                
            );

            function showResult(){
                let image = document.createElement('img');
                let url = URL.createObjectURL(resizer.getBlob());
                image.src = url;
                document.body.appendChild(image);
            }

            document.getElementById('blob-result').addEventListener('click',showResult,false);

`;