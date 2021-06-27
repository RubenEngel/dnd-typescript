import PointerTracker from 'pointer-tracker';

// ------------------- Initialise values 

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
var mouseOffsetX: number;
var mouseOffsetY: number;
// distance between two pointers when second is first pressed
var startPointerDistance: number | null;

// ------------------- Event handler functions

// centre draggable div on button press
function handleCentre() {
    dragObject.style.setProperty("transition", 'left 1s, top 1s')
    dragObject.style.setProperty('top', `${window.innerHeight / 2 - dragObject.offsetHeight / 2}px`);
    dragObject.style.setProperty('left', `${window.innerWidth / 2 - dragObject.offsetWidth / 2}px`);
}
// activate handleCentre function when centre button is pressed
document.getElementById('centre-button')?.addEventListener('click', handleCentre)

function handleReposition(e: any) {
    // stop transisition animations that may have been activated after pressing centre button
    dragObject.style.setProperty("transition", 'null')
    // get position of mouse in viewport
    const mousePositionY = e.clientY as number;
    const mousePositionX = e.clientX as number;
    // set position of draggable div and correct for starting mouse offset
    dragObject.style.setProperty('top', `${mousePositionY - mouseOffsetY}px`);
    dragObject.style.setProperty('left', `${mousePositionX - mouseOffsetX}px`);
}

function handleDragEnd(e: any) {
    // get location of each side of the draggable div, relative to the top and left sides of the window
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
    if (newHeight < minHeight) {
        newHeight = minHeight
    }
    if (newHeight > maxHeight) {
        newHeight = maxHeight
    }
    if (newWidth < minWidth) {
        newWidth = minWidth
    }
    if (newWidth > maxWidth) {
        newWidth = maxWidth
    }
    // set CSS properties of the draggable div
    dragObject.style.setProperty('height', `${newHeight}px`)
    dragObject.style.setProperty('width', `${newWidth}px`)
}

// ------------------- keep element within bounds on window resize
window.addEventListener('resize', () => {
    // get location of each side of the draggable div, relative to the top and left sides of the window
    let rect = dragObject.getBoundingClientRect();
    // only need to check for right and bottom sides, because div is positioned relative to the top and left sides of the window
    if (rect.right > window.innerWidth) {
        dragObject?.style.setProperty('left', `${window.innerWidth - dragObject.offsetWidth - 20}px`);
    }
    if (rect.bottom > window.innerHeight) {
        dragObject?.style.setProperty('top', `${window.innerHeight - dragObject.offsetHeight - 20}px`);
    }
});

// ------------------- utils

interface Point {
    clientX: number;
    clientY: number;
  }

function getDistance(a: Point, b?: Point): number {
  if (!b) return 0;
  return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
}

// ------------------- pointer tracking

// track pointers on the draggable div
const objectTracker = new PointerTracker(dragObject, {
    start(_, event: any) {
        // only track 1 pointer
        if (objectTracker.currentPointers.length === 1) return false;
        // set starting offsets from draggable div top and left edges
        mouseOffsetX = event.offsetX;
        mouseOffsetY = event.offsetY;
        return true;
    },
    move(_,__,event: any) {
        // reposition div based on the current location of the pointer
        handleReposition(event)
    },
    end(event: any) {
        // check that the div is being dropped in the allowable region
        handleDragEnd(event)
    }
});

// track pointers anywhere in the draggable region
const screenTracker = new PointerTracker(dragBoundary, {
    start(pointer: Point) {
        // on start, the latest pointer is not yet in the currentPointers array
        // the currentPointers array length is therefore 1 when the second pointer is introduced
        if (screenTracker.currentPointers.length === 1) {
            // get intial distance between the 2 pointers
            startPointerDistance = getDistance(pointer, screenTracker.currentPointers[0]);
            // get the size of the draggable div at the start of resizing occuring
            startHeight = dragObject.offsetHeight
            startWidth = dragObject.offsetWidth
        }
        return true;
    },
    move() {
        // once the pointers are moving, both point trackers are in the currentPointers array
        if (screenTracker.currentPointers.length === 2) {
            // get current distacne between the two touched points
            const newPointerDistance = getDistance(screenTracker.currentPointers[0], screenTracker.currentPointers[1]);
            // calculate the scale factor based on the percentage change of the distance between tounched points
            const scaleFactor = newPointerDistance / startPointerDistance!
            // resize the elemtn with the calculated scale factor
            handleResize(scaleFactor)
        }
    }
})