// Scene class handles panoramic scrolling image outside window
class Scene {
    paraImgArr = [];
    paraCanArr = [];
    moveXBy = [];
    x = [];
    container;
    name;
    ended = false;
    bg;
    constructor(numPara, container) {
        this.numPara = numPara;
        this.container = container;
    }

    // Initializes paraImgArr. Images must all be placed in a folder sharing same name as images. Images are
    // named by adding 0 to n, where 0 is the frontmost image and n is the furthest image.
    initParaImg(name) {
        this.name = name;
        for (let i = 0; i < this.numPara; i++) {
            let img = new Image();
            img.src = "assets/" + name + "/" + name + i + ".png";
            this.paraImgArr.push(img);
            this.x.push(1);
        }
    }

    // adds the canvases to contain the pano images (aka scenery)
    // takes in sceneCont, the HTML div to contain all the canvases (aka the window)
    addCanvas(sceneCont) {
        for (let i = this.numPara - 1; i >= 0; i--) {
            sceneCont.innerHTML += "<canvas class='para_canvas' id='para" + this.name + i + "'></canvas>";
            let canvas = document.getElementById("para" + this.name + i);
            let rect = sceneCont.getBoundingClientRect();
            canvas.height = rect.height;
            canvas.width = rect.width;

            this.paraCanArr.push(canvas);
        }
    }

    // sets the speeds the pano images move.
    // Takes in speeds, an array with length == number of panos
    // formatted [furthest pano, furthest pano - 1, ..., closest pano], 
    setSpeeds(speeds) {
        this.moveXBy = speeds;
    }

    // TODO: figure out why this doesn't work.
    update() {
        for (let i = 0; i < this.numPara; i++) {
            let canvas = this.paraCanArr[i];
            let ctx = canvas.getContext("2d");
            if ((this.x[i]) * this.moveXBy[i] + Math.ceil(this.paraImgArr[i].height * 1.77) > this.paraImgArr[i].width) {
                if (i == 0) {
                    this.ended = true;
                }
                this.x[i] = 1;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Measurements get messed up for some reason so width of drawn pano image is determined by  multiplying height of frame by 16/9.
            // Means all images must have the same width/height ratio of 16/9 to prevent stuttering
            ctx.drawImage(this.paraImgArr[i], this.x[i] * this.moveXBy[i], 0, Math.ceil(this.paraImgArr[i].height * 1.77), this.paraImgArr[i].height, 0, 0, canvas.width, canvas.height);
            //ctx1.drawImage(currScene.paraImgArr[i], currScene.x[i] * currScene.moveXBy[i], currScene.paraImgArr[i].naturalHeight - canvas.height, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            currScene.x[i] += 1;
        }
    }
}

// Handles drawing the panaramic images onto the screen for the first time after the images load.
// Loops by starting to draw at the beginning of the pano image once image reaches right side of window. The last "frame" must be the same as the first "frame" of the pano image
// can probably be added as a method to Scene class
function draw(scene) {
    for (let i = 0; i < currScene.numPara; i++) {
        scene.paraImgArr[i].onload = function () {
            let canvas = document.getElementById("para" + currScene.name + i);
            let ctx1 = canvas.getContext("2d");
            scene.paraImgArr[i].style.height = scene.container.getBoundingClientRect().height + "px";
            scene.paraImgArr[i].style.width = "auto";

            ctx1.drawImage(scene.paraImgArr[i], 0, 0, Math.ceil(scene.paraImgArr[i].height * 1.7), scene.paraImgArr[i].height, 0, 0, canvas.width, canvas.height);
        }
    }
}
var animationId;
var currSceneNum = 0;

var frame = document.getElementById("main_frame");
var sceneCont = document.getElementById("scene");
var rect = sceneCont.getBoundingClientRect();

let currScene = new Scene(3, sceneCont);
currScene.setSpeeds([3, 2, 1]);
currScene.initParaImg("tess");
currScene.addCanvas(sceneCont);
currScene.bg = "url('assets/BGs/morningBG.jpeg')";

let newScene = new Scene(3, sceneCont);
newScene.setSpeeds([.9, .4, .24]);
newScene.initParaImg("lauren");
newScene.bg = "url('assets/BGs/nightBG.png')";

class Item {
    hint;
    name;
    scene; // equal to the Scene's name that this item belongs to 
    x;
    y;
    img;
    layer; // equal to the paraArr index of the layer the item is on in the Scene
    found = false;

    constructor(name, scene, x, y, layer, sizeX, sizeY) {
        this.name = name;
        this.scene = scene;
        //this.x = currScene.paraImgArr[0].width /8 * 0.08;
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.img.src = "assets/items/" + name + ".png";
        this.layer = layer;
        this.sizeX = sizeX;
        this.sizeY = sizeY;

        console.log(this.x)
    }

    addHint(hint) {
        this.hint = hint;
    }
}

var item = new Item("tess0", currScene, 285, 100, 0, 60, 60);
var item1 = new Item("tess1", currScene, 1140, 190, 0, 55, 40);
var item2 = new Item("tess2", currScene, 1565, 115, 0, 90, 95);
var item3 = new Item("tess3", currScene, 2100, 280, 0, 70, 40);

item.addHint("this is red");
item1.addHint("this is a color");
item2.addHint("this is blue");

var itemL = new Item("lauren0", newScene, 465, 280, 1, 130, 120);
var itemL1 = new Item("lauren1", newScene, 900, 350, 0, 125, 115);
var itemL2 = new Item("lauren2", newScene, 980, 195, 1, 210, 180);
var itemL3 = new Item("lauren3", newScene, 1440, 310, 0, 55, 70);

var itemArr = [item, item1, item2, item3];
var newItems = [itemL, itemL1, itemL2, itemL3];

function getMouseOnFrame(x, y, scene) {
    let canvasX = x - (window.innerWidth - frame.getBoundingClientRect().width)/2;
    let canvasY = y - (window.innerHeight - frame.getBoundingClientRect().height)/2;

    let singleFrameRatioX = (currScene.paraImgArr[1].height * 1.77)/frame.getBoundingClientRect().width;
    let singleFrameRatioY = (currScene.paraImgArr[1].height)/frame.getBoundingClientRect().height;
    console.log("please: " + singleFrameRatioY);

    return [canvasX * singleFrameRatioX, canvasY * singleFrameRatioY];
}

frame.addEventListener('click', function(event) {
    console.log("width: " + currScene.paraImgArr[1].height);
    let coors = getMouseOnFrame(event.x, event.y, currScene);
    //coors[0] = (coors[0]/frame.getBoundingClientRect().width) / Math.ceil(currScene.paraImgArr[0].height * 1.77)
    console.log("coors:" + coors[0], coors[1]);
    for (let i = 0; i < itemArr.length; i++) {
        let paraCoors = [];
        paraCoors[0] = (itemArr[i].scene.x[itemArr[i].layer] * itemArr[i].scene.moveXBy[itemArr[i].layer]) + coors[0];
        paraCoors[1] = coors[1];

        console.log("para: " + paraCoors[0], paraCoors[1]);
        // console.log("x: " + itemArr[i].scene.x[itemArr[i].layer] * itemArr[i].scene.moveXBy[itemArr[i].layer])

        if(paraCoors[0] > itemArr[i].x && paraCoors[0] < itemArr[i].x + itemArr[i].sizeX) {
            if(paraCoors[1] < itemArr[i].y && paraCoors[1] > itemArr[i].y - itemArr[i].sizeY) {
                //alert("found");
                if (!itemArr[i].found) {
                    itemArr[i].found = true;
                    document.getElementById(itemArr[i].name).style.opacity = "0.1";
                    score++;
                    console.log(score);
                }
            }
            console.log("1");
            //alert("found" + i);
        }
    }
})

function fillItems(itemArr) {
    let itemDiv = document.getElementById("items_menu");
    itemDiv.innerHTML = "";
    for (let i = 0; i < itemArr.length; i++) {
        let tempImg = itemArr[i].img;
        tempImg.className = "item";
        tempImg.id = itemArr[i].name;
        itemDiv.appendChild(tempImg);
        tempImg.addEventListener("click", function() {
            //alert(itemArr[i].hint);
        })
    }
}

let score = 0;

// updates pano by clearing the canvases, changing the "frame" that is drawn onto the canvases, and drawing the updated frame.
// requires currScene (the current Scene object being animated) to be defined
function updateScene() {
    if (!currScene.ended) {
        for (let i = currScene.numPara - 1; i >= 0; i--) {
            let canvas = document.getElementById("para" + currScene.name + i);
            let ctx1 = canvas.getContext("2d");
            if ((currScene.x[i]) * currScene.moveXBy[i] + Math.ceil(currScene.paraImgArr[i].height * 1.77) > currScene.paraImgArr[i].width) {
                if (i == 0) {
                    currScene.ended = true;
                    showLevelEnd(newScene, newItems);
                    document.getElementById("byte").style.backgroundImage = "url('assets/idle.gif')";
                    return;
                }
                currScene.x[i] = 1;
            }
            ctx1.clearRect(0, 0, canvas.width, canvas.height);
    
            // Measurements get messed up for some reason so width of drawn pano image is determined by  multiplying height of frame by 16/9.
            // Means all images must have the same width/height ratio of 16/9 to prevent stuttering
            ctx1.drawImage(currScene.paraImgArr[i], currScene.x[i] * currScene.moveXBy[i], 0, Math.ceil(currScene.paraImgArr[i].height * 1.77), currScene.paraImgArr[i].height, 0, 0, canvas.width, canvas.height);
            currScene.x[i] += 1;
        }
        animationId = window.requestAnimationFrame(updateScene);
    }
}

function start(newScene, itemArr){
    currScene = newScene;
    score = 0;
    fillItems(itemArr);
}

function showLevelEnd(nextScene, newItems) {
    let endDiv = document.getElementById("level_end");
    endDiv.style.display = "block";
    document.getElementById("score").innerHTML = "You found " + score + "/" + itemArr.length + " items!";

}

let endDiv = document.getElementById("level_end");
document.getElementById("next_button").addEventListener("click", function() {
    currSceneNum+=1;
    endDiv.style.display = "none";
    document.body.style.backgroundImage = newScene.bg;
    score = 0;
    currScene.container.innerHTML = "";
    if (currSceneNum == 1) {
        document.getElementById("byte").style.backgroundImage = "url('assets/running.gif')";
        document.getElementById("byte").style.zIndex = 5;
        currScene = newScene;
        itemArr = newItems;
        fillItems(itemArr);
        draw(currScene);
        currScene.addCanvas(sceneCont);
        cancelAnimationFrame(animationId);
        updateScene();
    }
    if (currSceneNum == 2) {
        cancelAnimationFrame(animationId);
        frame.innerHTML = "<div id='endText'>Home Sweet Home</div>";
        frame.style.backgroundImage = "url('assets/EndScene.png')";
    }
});

document.getElementById("again_button").addEventListener("click", function() {
    document.getElementById("byte").style.backgroundImage = "url('assets/running.gif')";
    //currSceneNum--;
    endDiv.style.display = "none";
    //currScene.container.innerHTML = "";
    currScene.ended = false;
    for (let i = 0; i < currScene.numPara; i++) {
        currScene.x[i] = 1;
    }
    cancelAnimationFrame(animationId);
    updateScene();
});

fillItems(itemArr);
draw(currScene);

document.getElementById("tutorial_button").addEventListener("click", function() {
let tut = document.getElementById("tutorial");
tut.style.display = "block";
tut.innerHTML = "Welcome to Byte's Byte Sized Adventure! Byte is setting off the see the world and doesn't want to miss a single detail! Help Byte along the way by pointing out all the interesting things for him to see. As the world scrolls by, look carefully for the items Byte is searching for. When you see one, click it! But hurry, because once you pass it, you won't get another chance to see it until Byte passes through the area again. Good luck and have fun!";
});

document.getElementById("start_button").addEventListener("click", function() {
document.getElementById("start").remove();
document.body.style.backgroundImage = currScene.bg;
updateScene();
});


