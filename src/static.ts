import type Elysia from "elysia"
import * as fs from "fs"

export function add_static_directory(app: Elysia, dir: string, path: string) {
    // console.log(path)
    if (!fs.existsSync(dir + path)) {
        fs.mkdirSync(dir + path)
    }
    for (let a of fs.readdirSync(dir + path, { withFileTypes: true })) {
        if (a.isDirectory()) {
            add_static_directory(app, dir, path + "/" + a.name)
        } else {
            app.get(path + "/" + a.name, async ({ }) => {
                return Bun.file(dir + path + "/" + a.name)
            })
        }
        // app.get(path + "/" + a.name.split(".")[0], () => Bun.file(dir + path + "/" + a.name))
    }
}
