class Rectangle {
  constructor(width, height, color, index) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.index = index;
    this.x = 0;
    this.y = 0;
    this.rotated = false;
  }

  rotate() {
    [this.width, this.height] = [this.height, this.width];
    this.rotated = !this.rotated;
  }
}

class Container {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.blocks = [];
  }

  calculateFullness() {
    let totalArea = this.width * this.height;
    let filledArea = this.blocks.reduce(
      (acc, block) => acc + block.width * block.height,
      0
    );
    let innerEmptyArea = 0;

    for (let i = 0; i < this.blocks.length; i++) {
      for (let j = i + 1; j < this.blocks.length; j++) {
        let intersectArea = this.calculateIntersectionArea(
          this.blocks[i],
          this.blocks[j]
        );
        innerEmptyArea += intersectArea;
      }
    }

    return 1 - innerEmptyArea / (filledArea + innerEmptyArea);
  }

  calculateIntersectionArea(rect1, rect2) {
    let xOverlap = Math.max(
      0,
      Math.min(rect1.x + rect1.width, rect2.x + rect2.width) -
        Math.max(rect1.x, rect2.x)
    );
    let yOverlap = Math.max(
      0,
      Math.min(rect1.y + rect1.height, rect2.y + rect2.height) -
        Math.max(rect1.y, rect2.y)
    );

    return xOverlap * yOverlap;
  }
}

function generateRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function createBlockElement(rectangle) {
  const blockElement = document.createElement("div");
  blockElement.className = "block";
  blockElement.style.width = rectangle.width + "px";
  blockElement.style.height = rectangle.height + "px";
  blockElement.style.backgroundColor = rectangle.color;
  blockElement.style.transform = rectangle.rotated
    ? "rotate(90deg)"
    : "rotate(0deg)";
  blockElement.innerText = rectangle.index;
  blockElement.style.display = "flex";
  blockElement.style.alignItems = "center";
  blockElement.style.justifyContent = "center";

  return blockElement;
}

function packRectangles(container, blocks) {
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  for (let block of blocks) {
    let bestFit = findBestFit(container, block);

    if (bestFit) {
      block.x = bestFit.x;
      block.y = bestFit.y;
      container.width = Math.max(container.width, block.x + block.width);
      container.height = Math.max(container.height, block.y + block.height);
      container.blocks.push(block);
    }
  }
}

function findBestFit(container, block) {
  let bestFit = null;

  for (let y = container.height - block.height; y >= 0; y--) {
    for (let x = 0; x <= container.width - block.width; x++) {
      let overlapping = false;
      for (let other of container.blocks) {
        if (
          !(
            x + block.width <= other.x ||
            other.x + other.width <= x ||
            y + block.height <= other.y ||
            other.y + other.height <= y
          )
        ) {
          overlapping = true;
          break;
        }
      }

      if (
        !overlapping &&
        (!bestFit ||
          block.width * block.height < bestFit.width * bestFit.height)
      ) {
        bestFit = { x, y };
      }
    }
  }

  return bestFit;
}

function calculateBlockCoordinates(container) {
  const blockCoordinates = container.blocks.map((block, index) => {
    return {
      top: container.height - (block.y + block.height),
      left: block.x,
      right: block.x + block.width,
      bottom: container.height - block.y,
      initialOrder: block.index,
    };
  });

  return blockCoordinates;
}

function displayFullness(container) {
  const fullnessElement = document.getElementById("fullness");
  const fullnessValue = container.calculateFullness();
  fullnessElement.textContent = `Container Fullness: ${Math.round(
    fullnessValue * 100
  )}%`;

  return fullnessValue;
}

function displayBlocks(container) {
  const containerElement = document.getElementById("container");
  for (const block of container.blocks) {
    const blockElement = createBlockElement(block);
    blockElement.style.left = block.x + "px";
    blockElement.style.bottom =
      container.height - (block.y + block.height) + "px";
    containerElement.appendChild(blockElement);
  }

  const fullness = displayFullness(container);
  const blockCoordinates = calculateBlockCoordinates(container);

  return {
    fullness,
    blockCoordinates,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const containerElement = document.getElementById("container");

  const wantedWidth = 500;
  const wantedHeight = 500;

  const containerWidth = Math.floor(containerElement.scrollWidth);
  const containerHeight = Math.floor(containerElement.scrollHeight);

  const width = containerWidth > wantedWidth ? wantedWidth : containerWidth;
  const height =
    containerHeight > wantedHeight ? wantedHeight : containerHeight;

  const container = new Container(width, height);
  const inputs = [
    { width: 30, height: 40 },
    { width: 20, height: 50 },
    { width: 60, height: 30 },
    { width: 30, height: 40 },
    { width: 20, height: 50 },
    { width: 60, height: 30 },
  ];

  const colors = {};

  const rectangles = inputs.map((el, index) => {
    if (colors[`${el.width}-${el.height}`]) {
      const color = colors[`${el.width}-${el.height}`];
      return new Rectangle(el.width, el.height, color, index);
    } else {
      const color = generateRandomColor();
      colors[`${el.width}-${el.height}`] = color;
      return new Rectangle(el.width, el.height, color, index);
    }
  });

  packRectangles(container, rectangles);
  console.log(displayBlocks(container));

  window.addEventListener("resize", function () {
    const containerElement = document.getElementById("container");
    containerElement.innerHTML = "";

    const newCont = new Container(
      Math.floor(containerElement.scrollWidth),
      Math.floor(containerElement.scrollHeight)
    );

    packRectangles(newCont, rectangles);
    console.log(displayBlocks(newCont));
  });
});
