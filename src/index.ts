import Elysia from "elysia";
import { add_static_directory } from "./static";

const app = new Elysia({})

add_static_directory(app, "www", "")
app.get("/", () => Bun.file("www/index.html"))

app.listen(9200);