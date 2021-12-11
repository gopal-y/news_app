import React, { useState, useEffect } from "react";
import "./App.css";
import { Link, Outlet, Route, Routes, useParams } from "react-router-dom";
import { formatTimeStamp } from "./utils/transform";

function Home({ publishers }) {
  const [index, setIndex] = useState(0);
  const [subSetPublishers, setSubSet] = useState([]);
  let subsetSize = Math.min(30, publishers.length);

  let n = parseInt(publishers.length / subsetSize);
  if (n % subsetSize !== 0 && n > 1) {
    n++;
  }

  useEffect(() => {
    setSubSet(publishers.slice(index * subsetSize, (index + 1) * subsetSize));
  }, [index, publishers, subsetSize]);

  function next() {
    setIndex(Math.min(index + 1, n - 1));
  }

  function prev() {
    setIndex(Math.max(index - 1, 0));
  }

  return (
    <>
      <center>
        <h1>Welcome to News App. Please select a channel</h1>
      </center>

      <Nav publishers={subSetPublishers} />
      <button className="scroll prev" onClick={prev}>
        {" "}
        {`<`}{" "}
      </button>
      <button className="scroll next" onClick={next}>
        {" "}
        {`>`}
      </button>
      <Outlet />
    </>
  );
}

function News({ news }) {
  const { publisher } = useParams();
  const data = news
    .filter((i) => i.PUBLISHER === decodeURI(publisher))
    .sort((a, b) => {
      return b.TIMESTAMP.getTime() - a.TIMESTAMP.getTime();
    });

  return (
    <>
      <Link to="/" className="back">{`🢘 Back`}</Link>
      {data.length === 0 && (
        <p>
          There is no such Publisher or no news published by the specified
          publisher. Please check the publisher or try again later.
        </p>
      )}
      {data.length > 0 && (
        <div className="table-container">
          <center><h1>News Published by: {publisher}</h1></center>
          <table>
            <thead>
              <tr>
                <th>Headline</th>
                <th>Host</th>
                <th>Source</th>
                <th>Published On</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => {
                return (
                  <tr key={i}>
                    <td>{item.TITLE}</td>
                    <td>{item.HOSTNAME}</td>
                    <td>
                      <a href={item.URL}>{item.URL}</a>
                    </td>
                    <td>{`${item.TIMESTAMP.getDate()}/${item.TIMESTAMP.getMonth()}/${item.TIMESTAMP.getFullYear()}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Nav({ publishers }) {
  return (
    <div className="button-container">
      {publishers.map((publisher, i) => (
        <Link key={i} className="news-button" to={encodeURI(publisher)}>
          {publisher}
        </Link>
      ))}
    </div>
  );
}

function App() {
  const [news, setNews] = useState([]);
  const [publishers, setPublishers] = useState([]);

  const init = async () => {
    try {
      const newsDataResponse = await fetch(
        "https://s3-ap-southeast-1.amazonaws.com/he-public-data/newsf6e2440.json"
      );

      const tempNewsData = await newsDataResponse.json();
      const newsData = tempNewsData.map((item) => {
        return { ...item, TIMESTAMP: formatTimeStamp(item.TIMESTAMP) };
      });

      const publishersDataSet = new Set(newsData.map((item) => item.PUBLISHER));
      const publisherArray = Array.from(publishersDataSet);

      setPublishers(publisherArray.sort());
      setNews(newsData);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Home publishers={publishers} />} />
        <Route path=":publisher" element={<News news={news} />} />
      </Routes>
    </>
  );
}

export default App;
