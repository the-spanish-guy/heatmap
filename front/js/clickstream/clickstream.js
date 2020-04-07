const normalizeFPS = callback => {
  let ticking = true;
  const update = () => {
    if (ticking) requestAnimationFrame(update);
    ticking = true;
  };
  return event => {
    if (ticking) {
      callback(event);
      update();
    }
    ticking = false;
  };
};


const trackClickStream = () => {
  const data = []

  const pushEventData = ({pageX, pageY, type}) => {
    const timeStamp = Date.now()
    data.push({
      timeStamp,
      x: pageX,
      y: pageY,
      type
    })
    console.log(data)
  }

  document.addEventListener('mousemove', normalizeFPS(pushEventData))
  document.addEventListener('click', pushEventData)
  
  return data
}

const paintLive = (data, max = 5) => {
  const heatmap = h337.create({
    container: document.documentElement,
  })

  const update = () => {
    heatmap.setData({
      max,
      data
    })
  }

  setInterval(() => {
    update(data)
  }, 10)
}

const paintHeatMap = (data, max) => {
  const heatmap = h337.create({
    container: document.documentElement,
  })

  heatmap.setData({
    max,
    data
  })

}

const paintMouse = (data) => {
  const createElementMouse = () => {
    const mouse = document.createElement("div")
    mouse.style.cssText = `
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 2050%;
      top: 0px;
      left: 0px;
      transition: .1s;
      border: 2px solid rgba(0, 0, 0, .5);
      background: hsl(${360 * Math.random()}, 100%, 50%);
    `;
    document.body.appendChild(mouse)
    return mouse
  }

  const onMove = (x, y, mouse) => {
    mouse.style.transform = `translate(${x}px, ${y}px)`
  }

  const mouse = createElementMouse();
  if(data.length) {
    const start = data[0].timeStamp
    data.forEach( item => {
      setTimeout(() => {
        if(item.type === "mousemove") onMove(item.x, item.y, mouse)
      }, item.timeStamp - start)
    })
  }

}

const postData = (url, data) => {
  console.log({data})
  const name = Date.now()

  fetch(`${url}/?name=${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  })
}

const getData = async (url, total) => {
  console.log({url})
  const dataResponse = await fetch(`${url}/`)
  const dataJson = await dataResponse.json()

  const eachResponse = await Promise.all(
    dataJson.slice(Math.max(dataJson.length - total, 0)).map(name => fetch(`${url}/${name}`)))

  const eachJson = await Promise.all(eachResponse.map(r => r.json()))

  console.log(dataJson)

  eachJson.forEach(data => paintMouse(data))
  paintHeatMap(eachJson.flat(), 300)

}

getData("http://localhost:3001/api")

const data = trackClickStream()

window.onbeforeunload = () => postData("http://localhost:3001/api", data)

// paintLive(data)