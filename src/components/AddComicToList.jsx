import React, { useState, useEffect } from 'react';

const AddComicToList = ({ comicId, userId }) => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/lists/${userId}`);
        const data = await response.json();
        setLists(data);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, [userId]);

  const handleAddToList = async () => {
    if (selectedList) {
      try {
        const response = await fetch('http://localhost:5000/api/list_comics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listId: selectedList,
            comicId,
            position: 1,  // Position can be set based on your logic
          }),
        });

        if (response.ok) {
          alert('Comic added to list!');
        } else {
          alert('Failed to add comic to list');
        }
      } catch (error) {
        console.error('Error adding comic to list:', error);
      }
    }
  };

  return (
    <div>
      <h5>Add Comic to Your List</h5>
      <select onChange={(e) => setSelectedList(e.target.value)} value={selectedList}>
        <option value="">Select a List</option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.title}
          </option>
        ))}
      </select>
      <button onClick={handleAddToList}>Add to List</button>
    </div>
  );
};

export default AddComicToList;
