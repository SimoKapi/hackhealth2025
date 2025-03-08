import Elysia from "elysia";
import { add_static_directory } from "./static";

import { exec } from "child_process";

setInterval(() => {
    exec(`rpicam-still -o ${new Date().toISOString()}.jpeg -t 1`, function(err, stdout, stderr){
        //TODO detect errors here
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

app.listen(9200);