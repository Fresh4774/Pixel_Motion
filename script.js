const clone = array => {
  return JSON.parse(JSON.stringify(array));
};

const width = 16;
const height = 16;
const cellLength = width * height;
const ColorList = [
"transparent",
"#FFFFFF",
"#E7C09D",
"#c5a487",
"#8B5C33",
"#5E2C00",
"#FD7FFF",
"#EF0033",
"#FF6633",
"#FFB500",
"#EEFF00",
"#99EE00",
"#33CC00",
"#00CFFC",
"#006FCF",
"#004b8c",
"#4F00DF",
"#A900DA",
"#000000",
"#222222",
"#666666",
"#AAAAAA",];

const blankArray = [];
for (let i = 0; i < cellLength; i++) {
  blankArray.push({
    color: ColorList[0] });

}
const matrixExpand = (x, y) => {
  return x + height * y;
};
const f = frames.length > 0 ? clone(frames) : [clone(blankArray)];
const initialState = {
  frames: f,
  width,
  height,
  currentFrame: 0,
  palette: ColorList,
  currentColor: ColorList[1],
  canvasArray: f[0],
  copyArray: clone(blankArray),
  blankArray };

const Store = React.createContext(initialState);

const exportFrames = state => {
  const { height, width, frames } = state;
  const expportFrames = clone(frames);
  let dataSet = expportFrames.map(frame => {
    return frame.map((still, index) => {
      const x = index % width;
      const y = (index - x) / height;
      const objectPixel = {
        x,
        y,
        color: still.color };

      return objectPixel;
    });
  });
  window.open().document.write(JSON.stringify(dataSet));
  return { ...state };
};

const updateCurrent = (state, index) => {
  const { frames } = state;
  const config = {
    currentFrame: index,
    canvasArray: clone(frames[index]) };

  return { ...state, ...config };
};

const updateColor = (state, color) => {
  return { ...state, currentColor: color };
};

const updatePixel = (state, index) => {
  const { frames, currentFrame, canvasArray, currentColor } = state;
  const saveFrames = clone(frames);
  let tempArray = clone(canvasArray);

  if (tempArray[index].color !== currentColor) {
    tempArray[index].color = currentColor;
  } else {
    tempArray[index].color = "transparent";
  }

  saveFrames[currentFrame] = tempArray;
  return { ...state, canvasArray: tempArray, frames: saveFrames };
};

const newFrame = state => {
  const config = {
    frames: [clone(blankArray)],
    canvasArray: clone(blankArray),
    currentFrame: 0 };

  return { ...state, ...config };
};

const addFrame = state => {
  const { frames, blankArray, currentFrame } = state;
  const newFrames = clone(frames);
  newFrames.splice(currentFrame + 1, 0, clone(blankArray));
  const config = {
    frames: newFrames,
    canvasArray: clone(blankArray),
    currentFrame: currentFrame + 1 };

  return { ...state, ...config };
};

const deleteFrame = state => {
  const { frames, currentFrame } = state;
  if (currentFrame === 0 && frames.length < 2) return state;
  const saveFrames = clone(frames);
  saveFrames.splice(currentFrame, 1);
  const newFrame = currentFrame > 0 ? currentFrame - 1 : 0;
  const newArray = frames[newFrame];
  return {
    ...state,
    frames: saveFrames,
    currentFrame: newFrame,
    canvasArray: newArray };

};

const copyFrame = state => {
  const { canvasArray } = state;
  const tempArray = clone(canvasArray);
  return { ...state, copyArray: tempArray };
};

const pasteFrame = state => {
  const { frames, currentFrame, copyArray } = state;
  const tempCopy = clone(copyArray);
  const tempFrames = clone(frames);
  tempFrames[currentFrame] = tempCopy;
  return { ...state, frames: tempFrames, canvasArray: tempCopy };
};

const shiftFrame = (state, direction) => {
  const { height, width, canvasArray, frames, currentFrame } = state;
  const h = height - 1;
  const w = width - 1;
  const matrix = clone(canvasArray);
  const source = clone(canvasArray);

  for (let i = 0; i < matrix.length; i++) {
    const x = i % width;
    const y = (i - x) / height;
    let move = 0;
    let head = 0;
    switch (direction) {
      case "up":
        move = y + 1;
        head = move > h ? height - move : move;
        matrix[matrixExpand(x, y)] = source[matrixExpand(x, head)];
        break;
      case "down":
        move = y - 1;
        head = move < 0 ? move + height : move;
        matrix[matrixExpand(x, y)] = source[matrixExpand(x, head)];
        break;
      case "left":
        move = x + 1;
        head = move > w ? width - move : move;
        matrix[matrixExpand(x, y)] = source[matrixExpand(head, y)];
        break;
      case "right":
        move = x - 1;
        head = move < 0 ? move + width : move;
        matrix[matrixExpand(x, y)] = source[matrixExpand(head, y)];
        break;
      default:}

  }

  let tempFrames = frames;
  tempFrames[currentFrame] = matrix;
  return {
    ...state,
    frames: tempFrames,
    canvasArray: matrix };

};
const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_CURRENT":
      return updateCurrent(state, action.index);
    case "UPDATE_COLOR":
      return updateColor(state, action.color);
    case "UPDATE_PIXEL":
      return updatePixel(state, action.index);
    case "SHIFT_FRAME":
      return shiftFrame(state, action.direction);
    case "SAVE_FRAME":
      return saveFrame(state);
    case "NEW_FRAME":
      return newFrame(state);
    case "ADD_FRAME":
      return addFrame(state);
    case "DELETE_FRAME":
      return deleteFrame(state);
    case "COPY_FRAME":
      return copyFrame(state);
    case "PASTE_FRAME":
      return pasteFrame(state);
    case "EXPORT_FRAMES":
      return exportFrames(state);
    default:
      return state;}

};
const StoreProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return(
    React.createElement(Store.Provider, { value: { state, dispatch } }, children));

};
const Controlls = () => {
  const { dispatch } = React.useContext(Store);
  React.useEffect(() => {
    document.addEventListener("keyup", event => {
      checkKey(event);
    });
  }, []);

  const checkKey = event => {
    const code = event.keyCode;
    switch (code) {
      case 67:
        dispatch({
          type: "COPY_FRAME" });

        break;
      case 86:
        dispatch({
          type: "PASTE_FRAME" });

        break;
      case 78:
        dispatch({
          type: "NEW_FRAME" });

        break;
      case 8:
        dispatch({
          type: "DELETE_FRAME" });

        break;
      case 38:
        dispatch({
          type: "SHIFT_FRAME",
          direction: "up" });

        break;
      case 40:
        dispatch({
          type: "SHIFT_FRAME",
          direction: "down" });

        break;
      case 39:
        dispatch({
          type: "SHIFT_FRAME",
          direction: "right" });

        break;
      case 37:
        dispatch({
          type: "SHIFT_FRAME",
          direction: "left" });

        break;
      default:}

  };

  return(
    React.createElement("ul", { className: "controls" },
    React.createElement("li", null,
    React.createElement("a", {
      className: "links",
      href: "#",
      role: "button",
      onClick: () => {
        dispatch({
          type: "NEW_FRAME" });

      } }, "New")),




    React.createElement("li", null,
    React.createElement("a", {
      className: "links",
      href: "#",
      role: "button",
      onClick: () => {
        dispatch({
          type: "ADD_FRAME" });

      } }, "Add")),




    React.createElement("li", null,
    React.createElement("a", {
      className: "links",
      href: "#",
      role: "button",
      onClick: () => {
        dispatch({
          type: "DELETE_FRAME" });

      } }, "Delete")),




    React.createElement("li", null,
    React.createElement("a", {
      className: "links",
      href: "#",
      role: "button",
      onClick: () => {
        dispatch({
          type: "COPY_FRAME" });

      } }, "Copy")),




    React.createElement("li", null,
    React.createElement("a", {
      className: "links",
      href: "#",
      role: "button",
      onClick: () => {
        dispatch({
          type: "PASTE_FRAME" });

      } }, "Paste")),




    React.createElement("li", null,
    React.createElement("a", {
      className: "links",
      href: "#",
      role: "button",
      onClick: e => {
        e.preventDefault();
        dispatch({
          type: "EXPORT_FRAMES" });

      } }, "Export"))));






};
const ColorPalette = props => {
  const { state, dispatch } = React.useContext(Store);
  const { currentColor, palette } = state;

  const colorpalette = palette.map(color => {
    const isActive = color == currentColor ? 'active' : '';
    const transparent = color == "transparent" ? color : '';
    const classString = `box plt ${isActive} ${transparent}`;
    return (
      React.createElement("a", {
        role: "button",
        tabIndex: "0",
        href: "#",
        key: `colorCode_${color}`,
        className: classString,
        style: { background: color },
        onClick: () => {
          dispatch({
            type: "UPDATE_COLOR",
            color });

        } },
      `${color}`));

  });

  return React.createElement("div", { className: "palette" }, colorpalette);
};
const CanvasWindow = props => {
  const { size } = props;
  const { state, dispatch } = React.useContext(Store);
  const { canvasArray, width, height } = state;

  const generateFrame = () => {
    if (canvasArray === undefined) return;

    let pixelRow = [];
    const pixelSet = canvasArray.map((cell, index) => {
      const x = index % width;
      const y = (index - x) / height;
      let object;
      object =
      React.createElement("a", {
        key: `pixelButton-${x}-${y}`,
        className: "box",
        style: { background: cell.color },
        onClick: () => {
          dispatch({
            type: "UPDATE_PIXEL",
            index });

        } }, "\xA0");





      pixelRow.push(object);
      if (x === width - 1) {
        const rowStyle = size > 0 ? `${size}px` : 'auto';
        const row =
        React.createElement("div", { className: size > 0 ?
          'pixelrow ' : 'row', style: { height: size }, key: `row${y}` },
        pixelRow);
          

        pixelRow = [];
        return row;
      }
    });
    return pixelSet;
  };

  return (
    React.createElement("div", { className: "canvas",
      style: { width: `${size * width}px`, height: `${size * height}px` } },
    generateFrame()));


};
const CssFrame = props => {
  const { frame, size } = props;
  const { state } = React.useContext(Store);
  const { width, height, blankArray } = state;

  const generateCSSFrame = (data, size) => {
    if (data === undefined) data = blankArray;
    let cssString = "";
    data.map((cell, index) => {
      if (cell.color !== "transparent") {
        const x = index % width;
        const y = (index - x) / height;
        if (index > 0 && cssString !== "") cssString += ",";
        cssString += `${~~(size * (x + 1))}px ${~~(size * (y + 1))}px` +
        ` 0 ${cell.color}`;
      }
    });
    const inlineStyle = {
      boxSizing: "border-box",
      width: size,
      height: size,
      background: "transparent",
      boxShadow: cssString,
      margin: -size };

    return React.createElement("div", { style: inlineStyle }, " ");
  };
  return generateCSSFrame(frame, size);
};
const AnimationWindow = props => {
  const { size } = props;
  const { state } = React.useContext(Store);
  const { frames } = state;
  const [stepFrame, moveFrame] = React.useState(0);
  let ani;

  React.useEffect(() => {
    clearTimeout(ani);
    const timer = setTimeout(() => {
      let newFrame = stepFrame + 1;
      if (newFrame > frames.length - 1) {
        newFrame = 0;
      }
      moveFrame(newFrame);
    }, 100);
    return () => clearTimeout(timer);
  });

  return React.createElement(CssFrame, { size: size, frame: frames[stepFrame] });
};
const FramesWindow = props => {
  const { state, dispatch } = React.useContext(Store);
  const { frames, width, height, currentFrame } = state;
  const { size = 2 } = props;

  const frameStyle = size => {
    return {
      width: size * width,
      height: size * height };

  };

  return(
    React.createElement("ul", { className: "framescontainer" },
    frames.map((frame, index) => {
      return (
        React.createElement("li", {
          className: currentFrame === index ? 'frame active' : 'frame',
          style: frameStyle(size),
          key: `frame-${index}`,
          onClick: () => {
            dispatch({
              type: "UPDATE_CURRENT",
              index });

          } },

        React.createElement(CssFrame, { frame: frame, width: width, height: height, size: size })));


    })));


};
const SpriteAnimator = props => {
  const size = 20;
  const { state } = React.useContext(Store);
  const { width, height } = state;
  const pixelSize = parseInt(size, 10) + 2;
  const previewContainer = size => {
    return {
      width: size * width,
      height: size * height };

  };
  const pvSize = 4;
  return(
    React.createElement("div", { className: "container" },
    React.createElement("div", { className: "appcontainer" },
    React.createElement(Controlls, null),
    React.createElement(ColorPalette, null),
    React.createElement(CanvasWindow, { size: pixelSize }),
    React.createElement("div", { className: "preview", style: previewContainer(pvSize) },
    React.createElement(AnimationWindow, { size: pvSize })),

    React.createElement(FramesWindow, { size: 2 }))));



};
const Main = () => {
  return(
    React.createElement(StoreProvider, null,
    React.createElement(SpriteAnimator, null)));


};

ReactDOM.render(React.createElement(Main, null), document.getElementById('react-mount'));