serper api key: 417f4863719377b151cba0ceaab6053d96bf791c


##Search

const myHeaders = new Headers();
myHeaders.append("X-API-KEY", "");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "q": "apple inc"
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

try {
  const response = await fetch("https://google.serper.dev/search", requestOptions);
  const result = await response.text();
  console.log(result)
} catch (error) {
  console.error(error);
};

##Webpage scrape

const myHeaders = new Headers();
myHeaders.append("X-API-KEY", "");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "url": "apple inc"
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

try {
  const response = await fetch("https://scrape.serper.dev", requestOptions);
  const result = await response.text();
  console.log(result)
} catch (error) {
  console.error(error);
};

