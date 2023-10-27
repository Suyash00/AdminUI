import React, { useState, useMemo, useEffect } from "react";
import Pagination from "./Pagination";
import { TextField } from "@mui/material";
import "./style.css";
import axios from "axios";

let itemsPerPage = 10;

function AdminUI() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [user, setUser] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingRows, setEditingRows] = useState({});

  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    const getAdminData = async () => {
      try {
        const response = await axios.get(
          `https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const responseData = response.data;
        // console.log(response.data);

        setData(responseData);
        setTotalItems(responseData.length);
        setLoading(false);
        return response.data;
      } catch (e) {
        console.log(e);
      }
    };

    getAdminData();
  }, []);

  const performSearch = (text) => {
    try {
      const searchResults = data.filter(
        (item) =>
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          item.email.toLowerCase().includes(text.toLowerCase()) ||
          item.role.toLowerCase().includes(text.toLowerCase())
      );
      setUser(searchResults);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setUser([]);
      }
    }
  };

  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    let timerId = setTimeout(() => {
      const searchText = event.target.value;
      if (searchText) {
        performSearch(searchText);
      } else {
        setUser([]); // Reset user data when the search input is empty
      }
    }, 800);
    setDebounceTimeout(timerId);
  };

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return data.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, data]);

  const handleRowSelect = (rowId) => {
    if (selectedRows.includes(rowId)) {
      // Deselect the row if it's already selected
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      // Select the row if it's not selected
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.id));
    setData(updatedData);
    setSelectedRows([]); // Clear the selection after deletion
  };

  const handleEdit = (rowId) => {
    setEditingRows({ ...editingRows, [rowId]: true });
  };

  const handleSave = (rowId) => {
    // Save the edited content and exit edit mode
    setEditingRows({ ...editingRows, [rowId]: false });
    // You'll need to update the data with the edited content here
  };

  const handleDelete = (rowId) => {
    // Delete the row with the given ID
    const updatedData = data.filter((item) => item.id !== rowId);
    setData(updatedData);
  };

  const handleInputChange = (rowId, newValue) => {
    const updatedData = data.map((item) => {
      if (item.id === rowId) {
        return { ...item, role: newValue }; //Updating the role field
      }
      return item;
    });
    setData(updatedData);
  };

  return (
    <>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <h2>Admin Dashboard</h2>
          <div className="search-container">
            <TextField
              className="search-desktop search-bar"
              size="small"
              placeholder="Search by name, email or role"
              name="search"
              border="solid"
              onChange={(e) => {
                debounceSearch(e, debounceTimeout);
              }}
            ></TextField>
          </div>
          <br />

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {user.length > 0
                  ? user.slice(0, itemsPerPage).map((item) => (
                      <tr
                        key={item.id}
                        className={
                          selectedRows.includes(item.id) ? "selected" : ""
                        }
                      >
                        {/* <td>{item.id}</td> */}

                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item.id)}
                            onChange={() => handleRowSelect(item.id)}
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        {editingRows[item.id] ? ( // If in edit mode
                          <td>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) =>
                                handleInputChange(item.id, e.target.value)
                              }
                            />
                          </td>
                        ) : (
                          <td>{item.role}</td>
                        )}

                        <td>
                          {editingRows[item.id] ? (
                            <button onClick={() => handleSave(item.id)}>
                              Save
                            </button>
                          ) : (
                            <button onClick={() => handleEdit(item.id)}>
                              Edit
                            </button>
                          )}
                          <button onClick={() => handleDelete(item.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  : currentTableData.map((item) => {
                      return (
                        <tr
                          key={item.id}
                          className={
                            selectedRows.includes(item.id) ? "selected" : ""
                          }
                        >
                          {/* <td>{item.id}</td> */}

                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(item.id)}
                              onChange={() => handleRowSelect(item.id)}
                            />
                          </td>
                          <td>{item.name}</td>
                          <td>{item.email}</td>

                          {editingRows[item.id] ? ( // If in edit mode
                            <td>
                              <input
                                type="text"
                                className="edit-input"
                                value={item.role}
                                onChange={(e) =>
                                  handleInputChange(item.id, e.target.value)
                                }
                              />
                            </td>
                          ) : (
                            <td>{item.role}</td>
                          )}
                          <td>
                            <div className="action-buttons">
                              {editingRows[item.id] ? (
                                <button
                                  className="button-save"
                                  onClick={() => handleSave(item.id)}
                                >
                                  Save
                                </button>
                              ) : (
                                <button onClick={() => handleEdit(item.id)}>
                                  Edit
                                </button>
                              )}
                              <button
                                className="button-delete"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <br />
      <div className="button-container">
        <button
          className="button-delete-selected"
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </button>
        <div className="pagination-container">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </>
  );
}

export default AdminUI;
