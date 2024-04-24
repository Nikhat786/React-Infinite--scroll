import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const InfiniteScrollPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [fetchSize, setFetchSize] = useState(calculateInitialFetchSize());
  const [hasMore, setHasMore] = useState(true);
  function calculateInitialFetchSize() {
    // Example: Set initial fetch size based on the visible height of the window
    const windowHeight = window.innerHeight;
    // Adjust fetch size based on your specific requirements and UI
    return Math.ceil(windowHeight / 80); // Adjust '50' based on item height in pixels
  }
  const fetchItems = async () => {
    try {
      const response = await axios.post(
        `APIURL`,
        {
          pageNumber: page, // Use current page number
          pageSize: fetchSize,
          orderBy: "Sequence",
          direction: "asc",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer <YOUR TOKEN>",
          },
        }
      );

      const newItems = response.data.mainCategories;
      // Update the items state based on whether it's the initial load or subsequent loads
      if (page === 1) {
        setItems(newItems);
      } else {
        // Filter out items that are already in the items array
        const filteredNewItems = newItems.filter((newItem) => {
          return !items.some((item) => item.id === newItem.id);
        });

        // Update the items state by concatenating filteredNewItems with prevItems
        setItems((prevItems) => [...prevItems, ...filteredNewItems]);
      }

      // Check if there are no more items to load
      if (newItems.length < fetchSize) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      }
    }
  };

  const handleScroll = useCallback(() => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20 && hasMore) {
      // Load more items when scrolled to the bottom
      setPage((prevPage) => prevPage + 1); // Increment page number
    }
  }, [hasMore]);

  useEffect(() => {
    // Fetch initial data on component mount
    fetchItems();

    // Add scroll event listener for infinite scrolling
    window.addEventListener("scroll", handleScroll);

    return () => {
      // Clean up scroll event listener on component unmount
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]); // Only re-run effect if handleScroll changes

  useEffect(() => {
    // Fetch more items when page changes
    if (page > 1) {
      fetchItems();
    }
  }, [page]); // Re-run effect when page changes

  return (
    <div>
      <h1>Infinite Scroll Page</h1>
      <table className="table w-100">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Sequence</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <h6 className="mb-0 fw-bold">{item.mainCatName}</h6>
              </td>
              <td>{item?.sequence}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && <p>Loading more...</p>}
      {!hasMore && <p>No more items to load</p>}
    </div>
  );
};

export default InfiniteScrollPage;
