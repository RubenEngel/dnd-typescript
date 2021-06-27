import PointerTracker from 'pointer-tracker';

// create variables for accessing HTML elements
const dragObject = document.getElementById('drag-object')!
const dragBoundary = document.getElementById('boundary')!

// size of the draggable object on page load
let startWidth = dragObject.offsetWidth;
let startHeight = dragObject.offsetHeight;

// limits for scaling
const minHeight = startHeight / 4;
const minWidth = startWidth / 4;
const maxHeight = startHeight * 4;
const maxWidth = startWidth * 4;

// create global variables
// offsets of mouse from the top and left sides of teh draggabe object
var mouseOffsetX: number | null;
var mouseOffsetY: number | null;
// distance between two pointers when second is first pressed
var startPointerDistance: number | null;

// --------- Event handler functions

// centre draggable div on button press
function handleCentre() {
    dragObject.style.setProperty("transition", 'left 1s, top 1s')
    dragObject.style.setProperty('top', `${window.innerHeight / 2 - dragObject.offsetHeight / 2}px`);
    dragObject.style.setProperty('left', `${window.innerWidth / 2 - dragObject.offsetWidth / 2}px`);
}
document.getElementById('centre-button')?.addEventListener('click', handleCentre)

function handleReposition(e: any) {
    // stop transisition animations that may have been activated after pressing centre button
    dragObject.style.setProperty("transition", 'null')
    // get position of mouse in viewport
    const mousePositionY = e.clientY;
    const mousePositionX = e.clientX;
    // set position of draggable div and correct for starting mouse offset
    dragObject.style.setProperty('top', `${mousePositionY - mouseOffsetY!}px`);
    dragObject.style.setProperty('left', `${mousePositionX - mouseOffsetX!}px`);
}

function handleDragEnd(e: any) {
    const rect = dragObject.getBoundingClientRect();
    // out of bounds on left side
    if (rect.left < 20) {
        console.log('out of bounds')
        dragObject?.style.setProperty('left', `20px`);
    }
    // out of bounds on top side
    if (rect.top < 20) {
        console.log('out of bounds')
        dragObject?.style.setProperty('top', `20px`);
    }
    // out of bounds on right side
    if (rect.right > window.innerWidth - 20) {
        console.log('out of bounds')
        dragObject.style.setProperty('left', `${window.innerWidth - dragObject.offsetWidth - 20}px`);
    }
    // out of bounds on bottom side
    if (rect.bottom > window.innerHeight - 20) {
        console.log('out of bounds')
        dragObject.style.setProperty('top', `${window.innerHeight - dragObject.offsetHeight - 20}px`);
    }
}

function handleResize(scaleFactor: number) {
    // prevent scaling past the drag boundary region
    let newHeight = Math.min(scaleFactor * startHeight, window.innerHeight - 40);
    let newWidth = Math.min(scaleFactor * startWidth, window.innerWidth - 40);
    // when scaling is restricted by the window size, keep the shape square
    if (window.innerHeight > window.innerWidth) {
        newHeight = newWidth
    } else {
        newWidth = newHeight
    }
    // prevent scaling past 400% and below 25%
    

    // set CSS properties of the drag object
    dragObject.style.setProperty('height', `${newHeight}px`)
    dragObject.style.setProperty('width', `${newWidth}px`)
}

// ---------- keep element within bounds on window resize
window.addEventListener('resize', () => {
    let rect = dragObject.getBoundingClientRect();
    // only need to check for right and bottom sides, because div is positioned relative to the top and left sides of the window
    if (rect.right > window.innerWidth) {
        dragObject?.style.setProperty('left', `${window.innerWidth - dragObject.offsetWidth - 20}px`);
    }
    if (rect.bottom > window.innerHeight) {
        dragObject?.style.setProperty('top', `${window.innerHeight - dragObject.offsetHeight - 20}px`);
    }
});

// ----------- utils

interface Point {
    clientX: number;
    clientY: number;
  }

function getDistance(a: Point, b?: Point): number {
  if (!b) return 0;
  return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
}

// ------------- pointer tracking

const objectTracker = new PointerTracker(dragObject, {
    start(pointer: any, event: any) {
        // only track 1 pointer
        if (objectTracker.currentPointers.length === 1) return false;
        mouseOffsetX = event.offsetX;
        mouseOffsetY = event.offsetY;
        return true;
    },
    move(previousPointers, changedPointers, event) {
            handleReposition(event)
    },
    end(event) {
        handleDragEnd(event)
        startPointerDistance = null;
    }
});

const screenTracker = new PointerTracker(dragBoundary, {
    start(pointer: any, event: any) {
        // on start, the latest pointer is not yet in the currentPointers array
        // the currentPointers array length is therefore 1 when the second pointer is introduced
        if (screenTracker.currentPointers.length === 1) {
            startPointerDistance = getDistance(pointer, screenTracker.currentPointers[0]);
            startHeight = dragObject.offsetHeight
            startWidth =dragObject.offsetWidth
        }
        return true;
    },
    move() {
        if (screenTracker.currentPointers.length === 2) {
            const newPointerDistance = getDistance(screenTracker.currentPointers[0], screenTracker.currentPointers[1]);
            const scaleFactor = newPointerDistance / startPointerDistance!
            handleResize(scaleFactor)
        }
    }
})