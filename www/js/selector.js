const img = document.getElementById("img")
const finalCanvas = document.querySelector(".box-selector")
finalCanvas.width = img.width
finalCanvas.height = img.height

const tempCanvas = document.querySelector(".box-selector-temp")
tempCanvas.width = img.width
tempCanvas.height = img.height

const ctx = finalCanvas.getContext("2d")
ctx.lineWidth = 4
ctx.strokeStyle = "red"

const tempCtx = tempCanvas.getContext("2d")
tempCtx.lineWidth = 4
tempCtx.strokeStyle = "blue"

const selections = document.getElementById("selections")
var firstPoint
window.addEventListener("mousedown", (event) => {
    firstPoint = [event.clientX, event.clientY]
})

window.addEventListener("mousemove", (event) => {
    if (!firstPoint) return
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
    const rectWidth = event.clientX - firstPoint[0]
    const rectHeight = event.clientY - firstPoint[1]
    tempCtx.beginPath()
    tempCtx.setLineDash([10])
    tempCtx.rect(firstPoint[0], firstPoint[1], rectWidth, rectHeight)
    tempCtx.stroke()
})

window.addEventListener("mouseup", (event) => {
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
    const rectWidth = event.clientX - firstPoint[0]
    const rectHeight = event.clientY - firstPoint[1]
    ctx.beginPath()
    ctx.rect(firstPoint[0], firstPoint[1], rectWidth, rectHeight)
    ctx.stroke()
    
    const li = document.createElement("li")

    const realX = Math.floor(localToImageX(img, firstPoint[0]))
    const realY = Math.floor(localToImageY(img, firstPoint[1]))
    const realWidth = Math.floor(localToImageX(img, rectWidth))
    const realHeight = Math.floor(localToImageY(img, rectHeight))

    li.textContent = `X: ${realX}; Y: ${realY}; WIDTH: ${realWidth}; HEIGHT: ${realHeight}`
    selections.appendChild(li)

    firstPoint = null
})

function clearSelection() {
    ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height)
}

function localToImageY(image, y) {
    const multiplier = image.naturalHeight/image.height
    return y * multiplier
}

function localToImageX(image, x) {
    const multiplier = image.naturalWidth/image.width
    return x * multiplier
}