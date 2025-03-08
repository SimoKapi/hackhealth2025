import Elysia, { t } from "elysia";
import { add_static_directory } from "./static";

import { exec, spawn } from "child_process";

import * as fs from "fs"
import { transform_image } from "./transform";
import { ocr_image } from "./ocr";


import { Jimp } from "jimp";
import cv from "@techstark/opencv-js"

let sanitize = require("sanitize-filename")

const impella_on = false
const ecmo_on = true

if (!fs.existsSync("./photos")) {
    fs.mkdirSync("./photos")
}
if (!fs.existsSync("./configurations")) {
    fs.mkdirSync("./configurations")
}

if (!fs.existsSync("./photos/ecmo")) {
    fs.mkdirSync("./photos/ecmo")
}
if (ecmo_on) setInterval(async () => {
    let path = `./photos/ecmo/latest.jpeg`
    exec(`rpicam-still -o ${path} -t 1`, function (err, stdout, stderr) {
        //TODO detect errors here
        // transform_image(path)
    });
    // console.log(await Bun.file("./configurations/ecmo").json())
    // let rects = (await Bun.file("./configurations/impella").json())["areas"].map(a => {
    //     return {
    //         name: a["label"],
    //         // unit: "l/min",
    //         unit: undefined,
    //         rectangle: ({
    //             left: a["x"],
    //             top: a["y"],
    //             width: a["width"],
    //             height: a["height"]
    //         } as Tesseract.Rectangle)
    //     }
    // })
    // app.server?.publish("ecmo_json_export", JSON.stringify(await ocr_image(`./photos/impella/latest.jpeg`, (await Bun.file("./configurations/impella").json())["areas"].map((a : any) => {
    //     return {
    //         name: a["label"],
    //         // unit: "l/min",
    //         unit: undefined,
    //         rectangle: ({
    //             left: a["x"],
    //             top: a["y"],
    //             width: a["width"],
    //             height: a["height"]
    //         } as Tesseract.Rectangle)
    //     }
    // }))))
}, 10000)

if (impella_on) setInterval(async () => {
    let path = `./photos/impella/latest.jpeg`;
    console.log("write")
    Bun.write(path, Bun.file("./photos/webcam.jpg"))
    app.server?.publish("impella_json_export", JSON.stringify(await ocr_image(`./photos/impella/latest.jpeg`, (await Bun.file("./configurations/impella").json())["areas"].map((a: any) => {
        return {
            name: a["label"],
            // unit: "l/min",
            unit: undefined,
            rectangle: ({
                left: a["x"],
                top: a["y"],
                width: a["width"],
                height: a["height"]
            } as Tesseract.Rectangle)
        }
    }))))
}, 10000)

if (!fs.existsSync("./photos/impella")) {
    fs.mkdirSync("./photos/impella")
}


if (impella_on) {
    let child = spawn('ffmpeg -y -f v4l2 -video_size 1280x720 -i /dev/video0 -r 1 -qscale:v 2 -update 1 -r 1 ./photos/webcam.jpg', {shell: true});

    child.on('close', (code) => {
        set_child();
    })

    function set_child(){
        setTimeout(() => {
            child = spawn('ffmpeg -y -f v4l2 -video_size 1280x720 -i /dev/video0 -r 1 -qscale:v 2 -update 1 ./photos/webcam.jpg', {shell: true});
            child.on('close', (code) => {
                set_child();
            })
            child.stderr.on("data", (data) => {
                console.log(`ffmpeg: ${data}`)
            })
        }, 2000)
    }
}

const app = new Elysia({})

app.get("/image/file/:series/:name", ({ params }) => {
    console.log(sanitize(params.name))
    return Bun.file(`./photos/${sanitize(params.series)}/${sanitize(params.name)}`)
})

app.get("/image/latest/:series", ({ params }) => {
    let photos = fs.readdirSync(`./photos/${sanitize(params.series)}`).sort();
    return photos[0]
})

app.post("/ocr/sample/:series", async ({ params, body }) => {
    let rects = body.areas.map(a => {
        return {
            name: a["label"],
            // unit: "l/min",
            unit: undefined,
            rectangle: ({
                left: a["x"],
                top: a["y"],
                width: a["width"],
                height: a["height"]
            } as Tesseract.Rectangle)
        }
    })
    return (await ocr_image(`./photos/${sanitize(params.series)}/${sanitize(body.image_name)}`, rects))
}, {
    body: t.Object({
        image_name: t.String(),
        areas: t.Array(t.Object({
            label: t.String(),
            x: t.Numeric(),
            y: t.Numeric(),
            width: t.Numeric(),
            height: t.Numeric(),
        }))
    })
})

app.post("/api/configure/:type", async ({ params, body }) => {
    await Bun.write(`./configurations/${sanitize(params.type)}`, JSON.stringify(body, null, 2))
}, {
    body: t.Object({
        areas: t.Array(t.Object({
            label: t.String(),
            x: t.Numeric(),
            y: t.Numeric(),
            width: t.Numeric(),
            height: t.Numeric(),
        }))
    })
})

app.ws("/ecmo/export/json", {
    open(ws) {
        ws.subscribe("ecmo_json_export")
    },
    message(ws, message) {

    },
});

app.ws("/impella/export/json", {
    open(ws) {
        ws.subscribe("impella_json_export")
    },
    message(ws, message) {

    },
})

add_static_directory(app, "www", "")
app.get("/", () => Bun.file("www/index.html"))
app.get("/configure/:type", () => Bun.file("www/configure.html"))



// var jimpSrc = await Jimp.read("Untitled.jpeg");
// var src = cv.matFromImageData(jimpSrc.bitmap);

// let srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, jimpSrc.height, 0, jimpSrc.height, jimpSrc.width, 0, jimpSrc.width]);



// // Define destination points (e.g. a rectangle of desired output dimensions)
// let width = jimpSrc.width + 500;  // desired width
// let height = jimpSrc.height + 500; // desired height

// let dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2,
//     [
//         0, 0,
//         jimpSrc.height - 150, 0,
//         jimpSrc.height - 400, jimpSrc.width + 300,
//         0, jimpSrc.width + 100
//     ]
// );

// // Get the perspective transformation matrix
// let M = cv.getPerspectiveTransform(srcPoints, dstPoints);

// // Create an output Mat and set the desired size
// let dst = new cv.Mat();
// let dsize = new cv.Size(width, height);

// // Apply the warp
// cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());


// // Don't forget to free memory
// srcPoints.delete(); dstPoints.delete(); M.delete();

// new Jimp({
//     width: dst.cols,
//     height: dst.rows,
//     data: Buffer.from(dst.data)
// })
// .greyscale()
// .write('output2.png');





console.log("done")
// app.listen(9200);
app.listen({
    hostname: "0.0.0.0",
    port: 9200
})




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