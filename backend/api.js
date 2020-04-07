const http = require('http')
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, "data")
console.log(DATA_DIR)
function api_get(req, res) {

  fs.readdir(DATA_DIR, (err, files) => {
    
    if (err) throw err;

    // const fileName = 

    res.write(JSON.stringify(files.map(f => f.replace(".json", ""))));
    res.end();
    


    console.log(files);
  })
}



function api_get_id(req, res) {
  
  const fileName = req.url.split('/')[2];
  // console.log('file name: ',fileName);
  const file = path.join(DATA_DIR, fileName) + ".json";
  // console.log({file})

  fs.readFile(file, (err, json) => {
    if (err) {throw err;}
    else if(json) {res.write(json.toString())}
    res.end()
  })

}




function api_post_id(req, res) {
  
  const fileName = req.url.split('?name=')[1]
  const file = path.join(DATA_DIR, fileName) + '.json'

  let data = []
  req.on("data", cb => data.push(cb))
  req.on("end", () => {
    //transformando o buffer em string
    const body = Buffer.concat(data).toString()

    fs.writeFile(file, body, err => {
      if (err) {throw err}
      
      res.write(body)
      res.end()
    })

    // console.log(data)
  })

}



function handleServer(req, res) {
console.log("teste: ",req.url)
  res.writeHeader(200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  })
  // console.log(req.url)
  
  if(req.url === "/api/") {
    api_get(req, res)
  } else if(req.url.indexOf("/api/") > -1 && req.method === "GET") {
    api_get_id(req, res)
  } else if(req.url.indexOf("/api/") > -1 && req.method === "POST") {
    api_post_id(req, res)
  } else {
    res.end("Rota Não Existe")
  }
  
  
}

http.createServer(handleServer).listen(3001)

// console.log(fs)