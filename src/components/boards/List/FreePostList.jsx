import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Header from "../../common/Header/Header";
import { Link } from "react-router-dom";
import "./FreePostList.css";
import banner1 from "../../../assets/banner1.png";
import like from "../../../assets/like.png";
import comment from "../../../assets/comment.png";
import view from "../../../assets/view.png";
import axios from "axios";

const FreePostList = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [posts, setPosts] = useState(allPosts.slice(0, 10)); // first 10 posts
  useEffect(() => {
    axios
      .get("http://localhost:4000/board/posts")
      .then((response) => {
        const sortedData = [...response.data].sort((a, b) => b.id - a.id);
        setAllPosts(sortedData);
        setPosts(sortedData.slice(0, 10)); // first 10 posts
      })
      .catch((error) => console.log(error));
  }, []);

  const updateSearch = (e) => {
    setSearch(e.target.value);
    setPosts(
      allPosts.filter((post) =>
        post.title.toLowerCase().includes(e.target.value.toLowerCase())
      ) // case insensitive search
    );
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    const sortedData = [...allPosts].sort((a, b) => b.id - a.id);
    setPosts(sortedData.slice((page - 1) * postsPerPage, page * postsPerPage));
  };

  const sortByDate = () => {
    setPosts([...posts].sort((a, b) => b.date - a.date));
  };

  const sortByPopularity = () => {
    setPosts([...posts].sort((a, b) => b.likes - a.likes));
  };
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= 10; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers.map((number) => (
      <button
        key={number}
        onClick={() => goToPage(number)}
        className={
          currentPage === number
            ? "pagination-button active"
            : "pagination-button"
        }
      >
        {number}
      </button>
    ));
  };

  return (
    <div className="post-list-container">
      <Header />
      <div
        className="squre-container"
        style={{
          backgroundImage: `url(${banner1})`,
          height: "250px",
          backgroundSize: "100%",
        }}
      ></div>
      <div className="search-container">
        <input
          type="text"
          value={search}
          onChange={updateSearch}
          placeholder="검색어를 입력하세요"
          className="search-input"
        />
      </div>
      <div className="button-container">
        <button onClick={sortByDate} className="sort-recent-button">
          최신 순
        </button>
        <button onClick={sortByPopularity} className="sort-popular-button">
          인기 순
        </button>
        <Link to="/FreePostCreate" className="post-write-button" role="button">
          <button className="post-write-button2">글쓰기</button>
        </Link>
      </div>
      <div className="post-list-container">
        {posts.map((post) => (
          <Link to={`/FreePostDetail/${post.id}`} className="post-box-link">
            <div className="post-box" key={post.id}>
              <div className="post-title-container">
                <h2 className="post-title-title">제목 : {post.title}</h2>
                <p
                  className="post-title-content"
                  dangerouslySetInnerHTML={{
                    __html: post.content.slice(0, 100),
                  }}
                ></p>
              </div>
              <div className="post-text-container">
                <p>작성자: {post.author}</p>
                <p>
                  작성일:{" "}
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}{" "}
                </p>
                <p className="post-views">
                  <img src={view} alt="views icon" /> {post.views}
                </p>

                <p className="post-likes">
                  <img src={like} alt="likes icon" /> {post.likes}
                </p>

                <p className="post-comments">
                  <img src={comment} alt="comments icon" /> {post.comments}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="pagination-container">{renderPageNumbers()}</div>
    </div>
  );
};

export default FreePostList;
