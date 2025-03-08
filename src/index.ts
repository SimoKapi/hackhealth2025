import Elysia from "elysia";
import { add_static_directory } from "./static";

import { exec } from "child_process";

import * as fs from "fs"
import { transform_image } from "./transform";

if (!fs.existsSync("photos")) {
    fs.mkdirSync("photos")
}

setInterval(() => {
    let path = `./photos/${new Date().toISOString()}.jpeg`
    exec(`rpicam-still -o ${path} -t 1`, function (err, stdout, stderr) {
        //TODO detect errors here
        transform_image(path)
    })
}, 5000)


const app = new Elysia({})

app.ws("/export/json", {
    open(ws) {
        ws.subscribe("json_export")
    },
    message(ws, message) {

    },
})

add_static_directory(app, "www", "")
app.get("/", () => Bun.file("www/index.html"))

console.log("done")
app.listen(9200);




// // let src = cv.imread('canvasInput');
// let dst = new cv.Mat();
// let dsize = new cv.Size(jimpSrc.height*10, jimpSrc.width*10);
// // console.log(jimpSrc.height, jimpSrc.width)
// let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, jimpSrc.height, 0, jimpSrc.height, jimpSrc.width, 0, jimpSrc.width]);
// let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, 
//     [
//         0, 0,
//         100, 100,
//         100, 100,
//         10, 100
//       ]
// );
// let M = cv.getPerspectiveTransform(srcTri, dstTri);
// cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
// // document.getElementById('imageInit').style.display = "none"
// // cv.imshow('imageResult', dst);
// new Jimp({
//     width: src.cols,
//     height: src.rows,
//     data: Buffer.from(src.data)
// })
//     .write('output1.png');